import os
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import settings
from app.database import (
    init_db,
    is_atlas_connected,
    connection_error_message,
    in_memory_db,
    motor_client,
    db,
    SEED_USERS
)
from app.models import (
    UserRegister,
    UserLogin,
    UserProfileUpdate,
    UserResponse,
    TokenResponse,
    SwapRequestCreate,
    SwapRequestResponse,
    SwapStatus,
    ChatMessageCreate,
    ChatMessageResponse,
    SessionCreate,
    SessionResponse,
    ReviewCreate,
    ReviewResponse,
    ClusterConfigUpdate,
    MaterialCreate,
    MaterialResponse
)
from app.matching import calculate_skill_match

app = FastAPI(
    title="🔄 SkillSwap API",
    description="Peer-to-peer student skill exchange platform API with FastAPI & MongoDB Atlas",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

# --- WebSocket Connection Manager for Live Chat ---
class ConnectionManager:
    def __init__(self):
        # swap_id -> list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, swap_id: str, websocket: WebSocket):
        await websocket.accept()
        if swap_id not in self.active_connections:
            self.active_connections[swap_id] = []
        self.active_connections[swap_id].append(websocket)

    def disconnect(self, swap_id: str, websocket: WebSocket):
        if swap_id in self.active_connections:
            if websocket in self.active_connections[swap_id]:
                self.active_connections[swap_id].remove(websocket)
            if not self.active_connections[swap_id]:
                del self.active_connections[swap_id]

    async def broadcast_to_swap(self, swap_id: str, message: dict):
        if swap_id in self.active_connections:
            for connection in self.active_connections[swap_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

ws_manager = ConnectionManager()


# --- Helpers for Document Mapping ---
def format_user(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc.get("_id")),
        "email": doc.get("email", ""),
        "full_name": doc.get("full_name", ""),
        "university": doc.get("university", "University Campus"),
        "avatar_url": doc.get("avatar_url") or f"https://api.dicebear.com/7.x/adventurer/svg?seed={doc.get('full_name', 'Student')}",
        "bio": doc.get("bio", ""),
        "skills_to_teach": doc.get("skills_to_teach", []),
        "skills_to_learn": doc.get("skills_to_learn", []),
        "rating_summary": doc.get("rating_summary", {"average_rating": 5.0, "total_reviews": 0, "hours_taught": 0}),
        "created_at": doc.get("created_at", datetime.utcnow())
    }

def format_swap(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc.get("_id")),
        "sender_id": str(doc.get("sender_id")),
        "sender_name": doc.get("sender_name", "Student A"),
        "sender_avatar": doc.get("sender_avatar", ""),
        "receiver_id": str(doc.get("receiver_id")),
        "receiver_name": doc.get("receiver_name", "Student B"),
        "receiver_avatar": doc.get("receiver_avatar", ""),
        "skill_offered": doc.get("skill_offered", {"name": "General", "hours": 1}),
        "skill_requested": doc.get("skill_requested", {"name": "General", "hours": 1}),
        "note": doc.get("note", ""),
        "status": doc.get("status", "pending"),
        "created_at": doc.get("created_at", datetime.utcnow()),
        "updated_at": doc.get("updated_at", datetime.utcnow())
    }

@app.get("/")
async def root():
    return {
        "name": "SkillSwap API",
        "status": "online",
        "version": "1.0.0",
        "database": "MongoDB Atlas"
    }

# ==========================================
# 1. MongoDB Atlas Cluster Management APIs
# ==========================================

@app.get("/api/cluster/status")
async def get_cluster_status():
    from app.database import is_atlas_connected, connection_error_message, db
    
    total_users = 0
    total_swaps = 0
    
    if is_atlas_connected and db is not None:
        try:
            total_users = await db.users.count_documents({})
            total_swaps = await db.swap_requests.count_documents({})
        except Exception:
            pass
    else:
        total_users = len(in_memory_db["users"])
        total_swaps = len(in_memory_db["swap_requests"])

    return {
        "is_atlas_connected": is_atlas_connected,
        "database_name": settings.DATABASE_NAME,
        "connection_error_message": connection_error_message,
        "total_users": total_users,
        "total_swaps": total_swaps,
        "provider": "MongoDB Atlas Online Cluster" if is_atlas_connected else "Local Sandbox Mode"
    }

@app.post("/api/cluster/connect")
async def connect_cluster(config: ClusterConfigUpdate):
    """Dynamically test and bind an online MongoDB Atlas cluster."""
    settings.MONGODB_URL = config.mongodb_url
    if config.database_name:
        settings.DATABASE_NAME = config.database_name
    await init_db(config.mongodb_url)
    return await get_cluster_status()


# ==========================================
# 2. Authentication & Student Profile APIs
# ==========================================

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(payload: UserRegister):
    from app.database import is_atlas_connected, db
    
    # Check if exists
    if is_atlas_connected and db is not None:
        existing = await db.users.find_one({"email": payload.email.lower()})
        if existing:
            raise HTTPException(status_code=400, detail="Student email already registered")
        
        user_doc = {
            "_id": str(uuid.uuid4()),
            "email": payload.email.lower(),
            "password_hash": payload.password, # For demo clarity
            "full_name": payload.full_name,
            "university": payload.university or "University Campus",
            "avatar_url": payload.avatar_url or f"https://api.dicebear.com/7.x/adventurer/svg?seed={payload.full_name}",
            "bio": payload.bio or "Ready to teach and learn new skills!",
            "skills_to_teach": [s.dict() for s in payload.skills_to_teach],
            "skills_to_learn": [s.dict() for s in payload.skills_to_learn],
            "rating_summary": {"average_rating": 5.0, "total_reviews": 0, "hours_taught": 0},
            "created_at": datetime.utcnow()
        }
        await db.users.insert_one(user_doc)
    else:
        for u in in_memory_db["users"]:
            if u["email"].lower() == payload.email.lower():
                raise HTTPException(status_code=400, detail="Student email already registered")
        user_doc = {
            "_id": f"user-{uuid.uuid4().hex[:8]}",
            "email": payload.email.lower(),
            "password_hash": payload.password,
            "full_name": payload.full_name,
            "university": payload.university or "University Campus",
            "avatar_url": payload.avatar_url or f"https://api.dicebear.com/7.x/adventurer/svg?seed={payload.full_name}",
            "bio": payload.bio or "Ready to teach and learn new skills!",
            "skills_to_teach": [s.dict() for s in payload.skills_to_teach],
            "skills_to_learn": [s.dict() for s in payload.skills_to_learn],
            "rating_summary": {"average_rating": 5.0, "total_reviews": 0, "hours_taught": 0},
            "created_at": datetime.utcnow()
        }
        in_memory_db["users"].append(user_doc)

    formatted = format_user(user_doc)
    return {
        "access_token": f"jwt_{user_doc['_id']}",
        "token_type": "bearer",
        "user": formatted
    }

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    from app.database import is_atlas_connected, db
    
    query = payload.email.lower().strip()
    user_doc = None
    
    if is_atlas_connected and db is not None:
        user_doc = await db.users.find_one({"email": query})
    else:
        for u in in_memory_db["users"]:
            if u["email"].lower() == query or query in u["full_name"].lower():
                user_doc = u
                break
                
    # If not found by email, allow login with any demo account if password matches or fallback
    if not user_doc:
        # Fallback to the first demo student (Sarah Chen) if testing
        if in_memory_db["users"]:
            user_doc = in_memory_db["users"][0]
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "access_token": f"jwt_{user_doc['_id']}",
        "token_type": "bearer",
        "user": format_user(user_doc)
    }

@app.get("/api/auth/demo-switch/{user_id}", response_model=TokenResponse)
async def switch_demo_user(user_id: str):
    """Switch active profile instantly to test peer-to-peer interactions."""
    from app.database import is_atlas_connected, db
    user_doc = None
    if is_atlas_connected and db is not None:
        user_doc = await db.users.find_one({"_id": user_id})
    if not user_doc:
        for u in in_memory_db["users"]:
            if str(u["_id"]) == user_id:
                user_doc = u
                break
    if not user_doc:
        raise HTTPException(status_code=404, detail="Student peer not found")
        
    return {
        "access_token": f"jwt_{user_doc['_id']}",
        "token_type": "bearer",
        "user": format_user(user_doc)
    }

@app.get("/api/users", response_model=List[UserResponse])
async def list_students(search: Optional[str] = None, skill: Optional[str] = None):
    from app.database import is_atlas_connected, db
    users_list = []
    
    if is_atlas_connected and db is not None:
        cursor = db.users.find({})
        async for doc in cursor:
            users_list.append(format_user(doc))
    else:
        users_list = [format_user(u) for u in in_memory_db["users"]]

    if search:
        s = search.lower()
        users_list = [u for u in users_list if s in u["full_name"].lower() or s in u["university"].lower() or s in u["bio"].lower()]
        
    if skill:
        sk = skill.lower()
        users_list = [
            u for u in users_list 
            if any(sk in t["name"].lower() for t in u["skills_to_teach"]) or
               any(sk in l["name"].lower() for l in u["skills_to_learn"])
        ]
        
    return users_list

@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user_profile(user_id: str):
    from app.database import is_atlas_connected, db
    user_doc = None
    if is_atlas_connected and db is not None:
        user_doc = await db.users.find_one({"_id": user_id})
    if not user_doc:
        for u in in_memory_db["users"]:
            if str(u["_id"]) == user_id:
                user_doc = u
                break
    if not user_doc:
        raise HTTPException(status_code=404, detail="Student not found")
    return format_user(user_doc)

@app.put("/api/users/{user_id}", response_model=UserResponse)
async def update_user_profile(user_id: str, updates: UserProfileUpdate):
    from app.database import is_atlas_connected, db
    
    update_dict = {k: v for k, v in updates.dict().items() if v is not None}
    if "skills_to_teach" in update_dict:
        update_dict["skills_to_teach"] = [s.dict() if hasattr(s, "dict") else s for s in update_dict["skills_to_teach"]]
    if "skills_to_learn" in update_dict:
        update_dict["skills_to_learn"] = [s.dict() if hasattr(s, "dict") else s for s in update_dict["skills_to_learn"]]
        
    if is_atlas_connected and db is not None:
        await db.users.update_one({"_id": user_id}, {"$set": update_dict})
        doc = await db.users.find_one({"_id": user_id})
        return format_user(doc)
    else:
        for u in in_memory_db["users"]:
            if str(u["_id"]) == user_id:
                u.update(update_dict)
                return format_user(u)
        raise HTTPException(status_code=404, detail="Student not found")


# ==========================================
# 3. Smart Matching Engine API
# ==========================================

@app.get("/api/matches")
async def get_matches_for_user(current_user_id: str = Query(...)):
    """Computes reciprocal barter matches ranked by compatibility score."""
    from app.database import is_atlas_connected, db
    
    all_users = []
    if is_atlas_connected and db is not None:
        async for doc in db.users.find({}):
            all_users.append(doc)
    else:
        all_users = in_memory_db["users"]

    # Find current user
    current_user = next((u for u in all_users if str(u["_id"]) == current_user_id), None)
    if not current_user:
        raise HTTPException(status_code=404, detail="Current student profile not found")

    matches = []
    for candidate in all_users:
        if str(candidate["_id"]) != current_user_id:
            res = calculate_skill_match(current_user, candidate)
            matches.append({
                "match_score": res["match_score"],
                "is_perfect_match": res["is_perfect_match"],
                "highlight_skill_learn": res["highlight_skill_learn"],
                "highlight_skill_teach": res["highlight_skill_teach"],
                "explanation": res["explanation"],
                "candidate": format_user(candidate)
            })

    # Sort by match_score descending
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches


# ==========================================
# 4. Swap Request Barter APIs
# ==========================================

@app.get("/api/swaps", response_model=List[SwapRequestResponse])
async def get_swaps(user_id: str = Query(...)):
    from app.database import is_atlas_connected, db
    results = []
    
    if is_atlas_connected and db is not None:
        cursor = db.swap_requests.find({
            "$or": [{"sender_id": user_id}, {"receiver_id": user_id}]
        }).sort("created_at", -1)
        async for doc in cursor:
            results.append(format_swap(doc))
    else:
        for s in in_memory_db["swap_requests"]:
            if s["sender_id"] == user_id or s["receiver_id"] == user_id:
                results.append(format_swap(s))
                
    return results

@app.post("/api/swaps", response_model=SwapRequestResponse)
async def create_swap_request(payload: SwapRequestCreate, sender_id: str = Query(...)):
    from app.database import is_atlas_connected, db
    
    # Get sender and receiver
    all_users = in_memory_db["users"]
    if is_atlas_connected and db is not None:
        sender_doc = await db.users.find_one({"_id": sender_id})
        receiver_doc = await db.users.find_one({"_id": payload.receiver_id})
    else:
        sender_doc = next((u for u in all_users if str(u["_id"]) == sender_id), None)
        receiver_doc = next((u for u in all_users if str(u["_id"]) == payload.receiver_id), None)

    if not sender_doc or not receiver_doc:
        raise HTTPException(status_code=404, detail="Student peer not found")

    swap_doc = {
        "_id": f"swap-{uuid.uuid4().hex[:8]}",
        "sender_id": sender_id,
        "sender_name": sender_doc.get("full_name"),
        "sender_avatar": sender_doc.get("avatar_url"),
        "receiver_id": payload.receiver_id,
        "receiver_name": receiver_doc.get("full_name"),
        "receiver_avatar": receiver_doc.get("avatar_url"),
        "skill_offered": payload.skill_offered.dict(),
        "skill_requested": payload.skill_requested.dict(),
        "note": payload.note or f"Hey {receiver_doc.get('full_name')}! Let's swap {payload.skill_offered.name} for {payload.skill_requested.name}!",
        "status": SwapStatus.PENDING,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    if is_atlas_connected and db is not None:
        await db.swap_requests.insert_one(swap_doc)
    else:
        in_memory_db["swap_requests"].insert(0, swap_doc)

    return format_swap(swap_doc)

@app.patch("/api/swaps/{swap_id}/status", response_model=SwapRequestResponse)
async def update_swap_status(swap_id: str, new_status: SwapStatus):
    from app.database import is_atlas_connected, db
    
    if is_atlas_connected and db is not None:
        await db.swap_requests.update_one(
            {"_id": swap_id},
            {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
        )
        doc = await db.swap_requests.find_one({"_id": swap_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Swap request not found")
        return format_swap(doc)
    else:
        for s in in_memory_db["swap_requests"]:
            if str(s["_id"]) == swap_id:
                s["status"] = new_status
                s["updated_at"] = datetime.utcnow()
                return format_swap(s)
        raise HTTPException(status_code=404, detail="Swap request not found")


# ==========================================
# 5. Realtime Chat & WebSockets
# ==========================================

@app.get("/api/chat/{swap_id}", response_model=List[ChatMessageResponse])
async def get_chat_history(swap_id: str):
    from app.database import is_atlas_connected, db
    messages = []
    
    if is_atlas_connected and db is not None:
        cursor = db.messages.find({"swap_id": swap_id}).sort("created_at", 1)
        async for doc in cursor:
            messages.append({
                "id": str(doc.get("_id")),
                "swap_id": str(doc.get("swap_id")),
                "sender_id": str(doc.get("sender_id")),
                "sender_name": doc.get("sender_name", "Student"),
                "receiver_id": str(doc.get("receiver_id")),
                "content": doc.get("content", ""),
                "message_type": doc.get("message_type", "text"),
                "is_read": doc.get("is_read", False),
                "created_at": doc.get("created_at", datetime.utcnow())
            })
    else:
        for m in in_memory_db["messages"]:
            if m["swap_id"] == swap_id:
                messages.append({
                    "id": str(m.get("_id")),
                    "swap_id": str(m.get("swap_id")),
                    "sender_id": str(m.get("sender_id")),
                    "sender_name": m.get("sender_name", "Student"),
                    "receiver_id": str(m.get("receiver_id")),
                    "content": m.get("content", ""),
                    "message_type": m.get("message_type", "text"),
                    "is_read": m.get("is_read", False),
                    "created_at": m.get("created_at", datetime.utcnow())
                })
    return messages

@app.post("/api/chat", response_model=ChatMessageResponse)
async def send_chat_message(payload: ChatMessageCreate, sender_id: str = Query(...)):
    from app.database import is_atlas_connected, db
    
    # lookup sender name
    sender_name = "Student"
    all_users = in_memory_db["users"]
    if is_atlas_connected and db is not None:
        u = await db.users.find_one({"_id": sender_id})
        if u:
            sender_name = u.get("full_name")
    else:
        u = next((user for user in all_users if str(user["_id"]) == sender_id), None)
        if u:
            sender_name = u.get("full_name")

    msg_doc = {
        "_id": f"msg-{uuid.uuid4().hex[:8]}",
        "swap_id": payload.swap_id,
        "sender_id": sender_id,
        "sender_name": sender_name,
        "receiver_id": payload.receiver_id,
        "content": payload.content,
        "message_type": payload.message_type,
        "is_read": False,
        "created_at": datetime.utcnow()
    }

    if is_atlas_connected and db is not None:
        await db.messages.insert_one(msg_doc)
    else:
        in_memory_db["messages"].append(msg_doc)

    formatted = {
        "id": str(msg_doc["_id"]),
        "swap_id": str(msg_doc["swap_id"]),
        "sender_id": str(msg_doc["sender_id"]),
        "sender_name": msg_doc["sender_name"],
        "receiver_id": str(msg_doc["receiver_id"]),
        "content": msg_doc["content"],
        "message_type": msg_doc["message_type"],
        "is_read": msg_doc["is_read"],
        "created_at": msg_doc["created_at"]
    }

    # Broadcast to active WebSockets in this swap room
    await ws_manager.broadcast_to_swap(payload.swap_id, formatted)
    return formatted

@app.websocket("/ws/chat/{swap_id}/{user_id}")
async def websocket_chat_endpoint(websocket: WebSocket, swap_id: str, user_id: str):
    await ws_manager.connect(swap_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Handle incoming live message
            content = data.get("content", "")
            receiver_id = data.get("receiver_id", "")
            if content:
                msg_payload = ChatMessageCreate(
                    swap_id=swap_id,
                    receiver_id=receiver_id,
                    content=content,
                    message_type=data.get("message_type", "text")
                )
                await send_chat_message(msg_payload, sender_id=user_id)
    except WebSocketDisconnect:
        ws_manager.disconnect(swap_id, websocket)


# ==========================================
# 6. Session Scheduling APIs
# ==========================================

@app.get("/api/sessions", response_model=List[SessionResponse])
async def get_sessions(user_id: str = Query(...)):
    from app.database import is_atlas_connected, db
    sessions = []
    
    if is_atlas_connected and db is not None:
        cursor = db.sessions.find({
            "$or": [{"teacher_id": user_id}, {"learner_id": user_id}]
        }).sort("scheduled_start", 1)
        async for doc in cursor:
            sessions.append({
                "id": str(doc.get("_id")),
                "swap_id": str(doc.get("swap_id")),
                "teacher_id": str(doc.get("teacher_id")),
                "teacher_name": doc.get("teacher_name", "Teacher"),
                "learner_id": str(doc.get("learner_id")),
                "learner_name": doc.get("learner_name", "Learner"),
                "skill_name": doc.get("skill_name", "General"),
                "scheduled_start": doc.get("scheduled_start", datetime.utcnow()),
                "duration_minutes": doc.get("duration_minutes", 60),
                "meeting_url": doc.get("meeting_url", "https://meet.google.com/new"),
                "status": doc.get("status", "scheduled"),
                "notes": doc.get("notes", ""),
                "created_at": doc.get("created_at", datetime.utcnow())
            })
    else:
        for s in in_memory_db["sessions"]:
            if s["teacher_id"] == user_id or s["learner_id"] == user_id:
                sessions.append({
                    "id": str(s.get("_id")),
                    "swap_id": str(s.get("swap_id")),
                    "teacher_id": str(s.get("teacher_id")),
                    "teacher_name": s.get("teacher_name", "Teacher"),
                    "learner_id": str(s.get("learner_id")),
                    "learner_name": s.get("learner_name", "Learner"),
                    "skill_name": s.get("skill_name", "General"),
                    "scheduled_start": s.get("scheduled_start", datetime.utcnow()),
                    "duration_minutes": s.get("duration_minutes", 60),
                    "meeting_url": s.get("meeting_url", "https://meet.google.com/new"),
                    "status": s.get("status", "scheduled"),
                    "notes": s.get("notes", ""),
                    "created_at": s.get("created_at", datetime.utcnow())
                })
    return sessions

@app.post("/api/sessions", response_model=SessionResponse)
async def create_session(payload: SessionCreate):
    from app.database import is_atlas_connected, db
    
    # lookup teacher and learner names
    teacher_name = "Teacher"
    learner_name = "Learner"
    all_users = in_memory_db["users"]
    
    if is_atlas_connected and db is not None:
        t = await db.users.find_one({"_id": payload.teacher_id})
        l = await db.users.find_one({"_id": payload.learner_id})
        if t: teacher_name = t.get("full_name")
        if l: learner_name = l.get("full_name")
    else:
        t = next((u for u in all_users if str(u["_id"]) == payload.teacher_id), None)
        l = next((u for u in all_users if str(u["_id"]) == payload.learner_id), None)
        if t: teacher_name = t.get("full_name")
        if l: learner_name = l.get("full_name")

    session_doc = {
        "_id": f"sess-{uuid.uuid4().hex[:8]}",
        "swap_id": payload.swap_id,
        "teacher_id": payload.teacher_id,
        "teacher_name": teacher_name,
        "learner_id": payload.learner_id,
        "learner_name": learner_name,
        "skill_name": payload.skill_name,
        "scheduled_start": payload.scheduled_start,
        "duration_minutes": payload.duration_minutes,
        "meeting_url": f"https://meet.google.com/swap-{uuid.uuid4().hex[:4]}-{uuid.uuid4().hex[:3]}",
        "status": "scheduled",
        "notes": payload.notes or f"Skill exchange session for {payload.skill_name}",
        "created_at": datetime.utcnow()
    }

    if is_atlas_connected and db is not None:
        await db.sessions.insert_one(session_doc)
    else:
        in_memory_db["sessions"].append(session_doc)

    return {
        "id": str(session_doc["_id"]),
        "swap_id": str(session_doc["swap_id"]),
        "teacher_id": str(session_doc["teacher_id"]),
        "teacher_name": session_doc["teacher_name"],
        "learner_id": str(session_doc["learner_id"]),
        "learner_name": session_doc["learner_name"],
        "skill_name": session_doc["skill_name"],
        "scheduled_start": session_doc["scheduled_start"],
        "duration_minutes": session_doc["duration_minutes"],
        "meeting_url": session_doc["meeting_url"],
        "status": session_doc["status"],
        "notes": session_doc["notes"],
        "created_at": session_doc["created_at"]
    }


# ==========================================
# 7. Reviews & Skill Endorsements
# ==========================================

@app.get("/api/reviews/{user_id}", response_model=List[ReviewResponse])
async def get_user_reviews(user_id: str):
    from app.database import is_atlas_connected, db
    reviews = []
    
    if is_atlas_connected and db is not None:
        cursor = db.reviews.find({"reviewee_id": user_id}).sort("created_at", -1)
        async for doc in cursor:
            reviews.append({
                "id": str(doc.get("_id")),
                "session_id": str(doc.get("session_id")),
                "reviewer_id": str(doc.get("reviewer_id")),
                "reviewer_name": doc.get("reviewer_name", "Student Peer"),
                "reviewer_avatar": doc.get("reviewer_avatar", ""),
                "reviewee_id": str(doc.get("reviewee_id")),
                "skill_taught": doc.get("skill_taught", "General"),
                "rating": doc.get("rating", 5),
                "tags": doc.get("tags", []),
                "comment": doc.get("comment", ""),
                "created_at": doc.get("created_at", datetime.utcnow())
            })
    else:
        for r in in_memory_db["reviews"]:
            if r["reviewee_id"] == user_id:
                reviews.append({
                    "id": str(r.get("_id")),
                    "session_id": str(r.get("session_id")),
                    "reviewer_id": str(r.get("reviewer_id")),
                    "reviewer_name": r.get("reviewer_name", "Student Peer"),
                    "reviewer_avatar": r.get("reviewer_avatar", ""),
                    "reviewee_id": str(r.get("reviewee_id")),
                    "skill_taught": r.get("skill_taught", "General"),
                    "rating": r.get("rating", 5),
                    "tags": r.get("tags", []),
                    "comment": r.get("comment", ""),
                    "created_at": r.get("created_at", datetime.utcnow())
                })
    return reviews

@app.post("/api/reviews", response_model=ReviewResponse)
async def create_review(payload: ReviewCreate, reviewer_id: str = Query(...)):
    from app.database import is_atlas_connected, db
    
    # lookup reviewer details
    reviewer_name = "Student Peer"
    reviewer_avatar = ""
    all_users = in_memory_db["users"]
    
    if is_atlas_connected and db is not None:
        u = await db.users.find_one({"_id": reviewer_id})
        if u:
            reviewer_name = u.get("full_name")
            reviewer_avatar = u.get("avatar_url")
    else:
        u = next((user for user in all_users if str(user["_id"]) == reviewer_id), None)
        if u:
            reviewer_name = u.get("full_name")
            reviewer_avatar = u.get("avatar_url")

    rev_doc = {
        "_id": f"rev-{uuid.uuid4().hex[:8]}",
        "session_id": payload.session_id,
        "reviewer_id": reviewer_id,
        "reviewer_name": reviewer_name,
        "reviewer_avatar": reviewer_avatar,
        "reviewee_id": payload.reviewee_id,
        "skill_taught": payload.skill_taught,
        "rating": payload.rating,
        "tags": payload.tags,
        "comment": payload.comment,
        "created_at": datetime.utcnow()
    }

    if is_atlas_connected and db is not None:
        await db.reviews.insert_one(rev_doc)
        # Update reviewee's average rating & total reviews
        revs = []
        async for r in db.reviews.find({"reviewee_id": payload.reviewee_id}):
            revs.append(r.get("rating", 5))
        avg = round(sum(revs) / len(revs), 2) if revs else 5.0
        await db.users.update_one(
            {"_id": payload.reviewee_id},
            {"$set": {
                "rating_summary.average_rating": avg,
                "rating_summary.total_reviews": len(revs)
            }}
        )
    else:
        in_memory_db["reviews"].append(rev_doc)
        # Update user in memory
        for u in in_memory_db["users"]:
            if str(u["_id"]) == payload.reviewee_id:
                revs = [r["rating"] for r in in_memory_db["reviews"] if r["reviewee_id"] == payload.reviewee_id]
                u["rating_summary"]["average_rating"] = round(sum(revs) / len(revs), 2)
                u["rating_summary"]["total_reviews"] = len(revs)

    return {
        "id": str(rev_doc["_id"]),
        "session_id": str(rev_doc["session_id"]),
        "reviewer_id": str(rev_doc["reviewer_id"]),
        "reviewer_name": rev_doc["reviewer_name"],
        "reviewer_avatar": rev_doc["reviewer_avatar"],
        "reviewee_id": str(rev_doc["reviewee_id"]),
        "skill_taught": rev_doc["skill_taught"],
        "rating": rev_doc["rating"],
        "tags": rev_doc["tags"],
        "comment": rev_doc["comment"],
        "created_at": rev_doc["created_at"]
    }


# ==========================================
# 8. Learning Material Exchange APIs
# ==========================================

def format_material(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc.get("_id")),
        "title": doc.get("title", "Untitled Resource"),
        "category": doc.get("category", "General"),
        "description": doc.get("description", ""),
        "file_format": doc.get("file_format", "PDF"),
        "file_size": doc.get("file_size", "1.0 MB"),
        "download_url": doc.get("download_url", ""),
        "swap_requirement": doc.get("swap_requirement", "Free for Campus Peers"),
        "author_id": str(doc.get("author_id", "")),
        "author_name": doc.get("author_name", "Student Peer"),
        "author_avatar": doc.get("author_avatar", ""),
        "downloads_count": doc.get("downloads_count", 0),
        "likes_count": doc.get("likes_count", 0),
        "created_at": doc.get("created_at", datetime.utcnow())
    }

@app.get("/api/materials", response_model=List[MaterialResponse])
async def list_materials(category: Optional[str] = None, search: Optional[str] = None):
    from app.database import is_atlas_connected, db
    items = []
    
    if is_atlas_connected and db is not None:
        q = {}
        if category and category != "All":
            q["category"] = category
        cursor = db.materials.find(q).sort("created_at", -1)
        async for doc in cursor:
            items.append(format_material(doc))
    else:
        for m in in_memory_db.get("materials", []):
            if not category or category == "All" or m.get("category") == category:
                items.append(format_material(m))

    if search:
        s = search.lower()
        items = [i for i in items if s in i["title"].lower() or s in i["description"].lower() or s in i["category"].lower()]

    return items

@app.post("/api/materials", response_model=MaterialResponse)
async def create_material(payload: MaterialCreate, author_id: str = Query(...)):
    from app.database import is_atlas_connected, db
    
    author_name = "Student Peer"
    author_avatar = ""
    all_users = in_memory_db["users"]
    
    if is_atlas_connected and db is not None:
        u = await db.users.find_one({"_id": author_id})
        if u:
            author_name = u.get("full_name")
            author_avatar = u.get("avatar_url")
    else:
        u = next((user for user in all_users if str(user["_id"]) == author_id), None)
        if u:
            author_name = u.get("full_name")
            author_avatar = u.get("avatar_url")

    mat_doc = {
        "_id": f"mat-{uuid.uuid4().hex[:8]}",
        "title": payload.title,
        "category": payload.category,
        "description": payload.description,
        "file_format": payload.file_format,
        "file_size": payload.file_size or "1.5 MB",
        "download_url": payload.download_url or "https://example.com/materials/download",
        "swap_requirement": payload.swap_requirement or "Free for Campus Peers",
        "author_id": author_id,
        "author_name": author_name,
        "author_avatar": author_avatar,
        "downloads_count": 0,
        "likes_count": 0,
        "created_at": datetime.utcnow()
    }

    if is_atlas_connected and db is not None:
        await db.materials.insert_one(mat_doc)
    else:
        if "materials" not in in_memory_db:
            in_memory_db["materials"] = []
        in_memory_db["materials"].insert(0, mat_doc)

    return format_material(mat_doc)

@app.post("/api/materials/{material_id}/download")
async def record_material_download(material_id: str):
    from app.database import is_atlas_connected, db
    if is_atlas_connected and db is not None:
        await db.materials.update_one({"_id": material_id}, {"$inc": {"downloads_count": 1}})
        doc = await db.materials.find_one({"_id": material_id})
        if doc: return format_material(doc)
    else:
        for m in in_memory_db.get("materials", []):
            if str(m.get("_id")) == material_id:
                m["downloads_count"] = m.get("downloads_count", 0) + 1
                return format_material(m)
    return {"status": "ok"}

@app.post("/api/materials/{material_id}/like")
async def toggle_material_like(material_id: str):
    from app.database import is_atlas_connected, db
    if is_atlas_connected and db is not None:
        await db.materials.update_one({"_id": material_id}, {"$inc": {"likes_count": 1}})
        doc = await db.materials.find_one({"_id": material_id})
        if doc: return format_material(doc)
    else:
        for m in in_memory_db.get("materials", []):
            if str(m.get("_id")) == material_id:
                m["likes_count"] = m.get("likes_count", 0) + 1
                return format_material(m)
    return {"status": "ok"}

