import os
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Global DB state
motor_client: Optional[AsyncIOMotorClient] = None
db = None
is_atlas_connected: bool = False
connection_error_message: Optional[str] = None

# Fallback In-Memory Storage for instant local development without waiting for cluster
in_memory_db: Dict[str, List[Dict[str, Any]]] = {
    "users": [],
    "swap_requests": [],
    "messages": [],
    "sessions": [],
    "reviews": [],
    "materials": []
}

# Initial Student Seed Profiles (Accurately reflecting the theme illustration & skills)
SEED_USERS = [
    {
        "_id": "user-sarah-01",
        "email": "sarah.chen@campus.edu",
        "password_hash": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", # "secret123"
        "full_name": "Sarah Chen",
        "university": "UC Berkeley · CS '26",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        "bio": "3rd-year CS student. I love clean code and building scalable backends with Python & FastAPI. Desperately need UI/UX skills for my side project!",
        "skills_to_teach": [
            {
                "name": "Python",
                "category": "Programming",
                "proficiency": "Advanced",
                "experience_summary": "Built backend APIs, web scrapers, and data pipelines for 3+ years."
            },
            {
                "name": "Data Analysis",
                "category": "Business & Data",
                "proficiency": "Intermediate",
                "experience_summary": "Pandas, NumPy, and clean Matplotlib visual dashboards."
            }
        ],
        "skills_to_learn": [
            {
                "name": "UI/UX",
                "category": "UI/UX & Design",
                "target_goal": "Master Figma auto-layout, wireframing, and interactive design systems."
            },
            {
                "name": "Photography",
                "category": "Creative Arts & Photo",
                "target_goal": "Learn manual camera exposure & Lightroom portrait grading."
            }
        ],
        "rating_summary": {
            "average_rating": 4.9,
            "total_reviews": 14,
            "hours_taught": 28
        },
        "created_at": datetime.utcnow()
    },
    {
        "_id": "user-alex-02",
        "email": "alex.rivera@design.edu",
        "password_hash": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "full_name": "Alex Rivera",
        "university": "Parsons School of Design '25",
        "avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
        "bio": "Product design major & freelance Figma educator. Looking to learn Python to automate design tokens and write scripting plugins!",
        "skills_to_teach": [
            {
                "name": "UI/UX",
                "category": "UI/UX & Design",
                "proficiency": "Advanced",
                "experience_summary": "Lead designer for 4 student apps, top 5% Figma community creator."
            },
            {
                "name": "Photography",
                "category": "Creative Arts & Photo",
                "proficiency": "Advanced",
                "experience_summary": "Portrait and event photographer with Sony A7IV mirrorless."
            }
        ],
        "skills_to_learn": [
            {
                "name": "Python",
                "category": "Programming",
                "target_goal": "Learn basic loops, script automation, and handling JSON APIs."
            },
            {
                "name": "Spanish",
                "category": "Languages",
                "target_goal": "Conversational practice for study abroad in Madrid."
            }
        ],
        "rating_summary": {
            "average_rating": 5.0,
            "total_reviews": 22,
            "hours_taught": 45
        },
        "created_at": datetime.utcnow()
    },
    {
        "_id": "user-maya-03",
        "email": "maya.lin@polytech.edu",
        "password_hash": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "full_name": "Maya Lin",
        "university": "Toronto Polytech · Software '26",
        "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
        "bio": "Frontend enthusiast. React & Tailwind are my daily bread. Want to improve my conversational Spanish and learn video editing for YouTube tutorials.",
        "skills_to_teach": [
            {
                "name": "React",
                "category": "Programming",
                "proficiency": "Advanced",
                "experience_summary": "Custom hooks, state management, animated micro-interactions."
            },
            {
                "name": "UI/UX",
                "category": "UI/UX & Design",
                "proficiency": "Intermediate",
                "experience_summary": "Component kits and responsive design rules."
            }
        ],
        "skills_to_learn": [
            {
                "name": "Spanish",
                "category": "Languages",
                "target_goal": "Intermediate grammar and everyday conversational fluency."
            },
            {
                "name": "Video Editing",
                "category": "Creative Arts & Photo",
                "target_goal": "Premiere Pro / DaVinci Resolve color grading & cuts."
            }
        ],
        "rating_summary": {
            "average_rating": 4.8,
            "total_reviews": 9,
            "hours_taught": 18
        },
        "created_at": datetime.utcnow()
    },
    {
        "_id": "user-liam-04",
        "email": "liam.patel@lang.edu",
        "password_hash": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "full_name": "Liam Patel",
        "university": "McGill Linguistics '25",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        "bio": "Native Spanish & English speaker with a passion for teaching language exchange. Looking for Python help for computational linguistics homework!",
        "skills_to_teach": [
            {
                "name": "Spanish",
                "category": "Languages",
                "proficiency": "Advanced",
                "experience_summary": "Native fluency, certified DELE tutor with fun conversational techniques."
            }
        ],
        "skills_to_learn": [
            {
                "name": "Python",
                "category": "Programming",
                "target_goal": "Natural language processing libraries (NLTK & SpaCy)."
            },
            {
                "name": "Data Analysis",
                "category": "Business & Data",
                "target_goal": "Cleaning datasets and statistical analysis."
            }
        ],
        "rating_summary": {
            "average_rating": 4.95,
            "total_reviews": 31,
            "hours_taught": 60
        },
        "created_at": datetime.utcnow()
    }
]

# Initial Seed Demo Reviews
SEED_REVIEWS = [
    {
        "_id": "rev-01",
        "session_id": "sess-prev-01",
        "reviewer_id": "user-alex-02",
        "reviewer_name": "Alex Rivera",
        "reviewer_avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
        "reviewee_id": "user-sarah-01",
        "skill_taught": "Python",
        "rating": 5,
        "tags": ["Super Clear", "Practical Demos", "Patient"],
        "comment": "Sarah broke down FastAPI routers and Pydantic schemas step by step. We built a working endpoint in 45 minutes!",
        "created_at": datetime.utcnow()
    },
    {
        "_id": "rev-02",
        "session_id": "sess-prev-02",
        "reviewer_id": "user-sarah-01",
        "reviewer_name": "Sarah Chen",
        "reviewer_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        "reviewee_id": "user-alex-02",
        "skill_taught": "UI/UX",
        "rating": 5,
        "tags": ["Figma Wizard", "Design System Guru", "Actionable Tips"],
        "comment": "Alex redesigned my rough mockups into gorgeous glassmorphic cards. Worth 10x any paid course!",
        "created_at": datetime.utcnow()
    }
]

# Initial Seed Learning Materials for Student Resource Exchange
SEED_MATERIALS = [
    {
        "_id": "mat-01",
        "title": "FastAPI & Python Async Clean Architecture Cheatsheet",
        "category": "Code & Templates",
        "description": "Complete PDF cheatsheet covering Pydantic v2 schemas, async Motor queries, dependency injection, and JWT auth flow.",
        "file_format": "PDF",
        "file_size": "2.4 MB",
        "download_url": "https://fastapi.tiangolo.com",
        "swap_requirement": "Free for Campus Peers",
        "author_id": "user-sarah-01",
        "author_name": "Sarah Chen",
        "author_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        "downloads_count": 84,
        "likes_count": 32,
        "created_at": datetime.utcnow()
    },
    {
        "_id": "mat-02",
        "title": "SkillSwap Mobile & Web Design System (Figma Community File)",
        "category": "Design & UI Kits",
        "description": "High-fidelity Figma UI kit with 50+ auto-layout components, color tokens, typography styles, and responsive cards.",
        "file_format": "Figma",
        "file_size": "14.8 MB",
        "download_url": "https://www.figma.com/community",
        "swap_requirement": "Swap for Python/Backend Notes",
        "author_id": "user-alex-02",
        "author_name": "Alex Rivera",
        "author_avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
        "downloads_count": 126,
        "likes_count": 59,
        "created_at": datetime.utcnow()
    },
    {
        "_id": "mat-03",
        "title": "Conversational Spanish B1 Essential Dialogue Deck",
        "category": "Languages",
        "description": "250+ curated Anki flashcard deck with native pronunciations, common idioms, and study abroad survival scenarios.",
        "file_format": "Anki / APKG",
        "file_size": "8.1 MB",
        "download_url": "https://apps.ankiweb.net",
        "swap_requirement": "Free for Campus Peers",
        "author_id": "user-liam-04",
        "author_name": "Liam Patel",
        "author_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        "downloads_count": 92,
        "likes_count": 41,
        "created_at": datetime.utcnow()
    },
    {
        "_id": "mat-04",
        "title": "React 18 + Vite Production Starter Template",
        "category": "Code & Templates",
        "description": "Pre-configured repository with custom hooks, routing, Tailwind/CSS variables, and Lucide icon setup ready to deploy.",
        "file_format": "ZIP / GitHub",
        "file_size": "1.2 MB",
        "download_url": "https://github.com",
        "swap_requirement": "Swap for Design Feedback",
        "author_id": "user-maya-03",
        "author_name": "Maya Lin",
        "author_avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
        "downloads_count": 67,
        "likes_count": 28,
        "created_at": datetime.utcnow()
    },
    {
        "_id": "mat-05",
        "title": "Portrait Photography Natural Lighting & Lightroom Presets Pack",
        "category": "Creative Arts",
        "description": "5 custom .XMP Lightroom presets tailored for warm campus daylight portraits and sunset golden hour tones.",
        "file_format": "XMP / ZIP",
        "file_size": "4.5 MB",
        "download_url": "https://adobe.com/lightroom",
        "swap_requirement": "Swap for Programming/Tech Notes",
        "author_id": "user-alex-02",
        "author_name": "Alex Rivera",
        "author_avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
        "downloads_count": 110,
        "likes_count": 47,
        "created_at": datetime.utcnow()
    }
]

async def init_db(mongodb_url: Optional[str] = None):
    global motor_client, db, is_atlas_connected, connection_error_message
    
    url = mongodb_url or settings.MONGODB_URL
    if not url or "mongodb" not in url:
        is_atlas_connected = False
        connection_error_message = "No MongoDB Atlas connection string provided. Running in sandbox mode with preloaded student peers."
        print(f"[SkillSwap Database] {connection_error_message}")
        init_in_memory()
        return

    try:
        motor_client = AsyncIOMotorClient(url, serverSelectionTimeoutMS=4000)
        # Test ping to check credentials & cluster accessibility
        await motor_client.admin.command('ping')
        db = motor_client[settings.DATABASE_NAME]
        is_atlas_connected = True
        connection_error_message = None
        print(f"[SkillSwap Database] Successfully connected to live MongoDB Atlas Cluster ({settings.DATABASE_NAME})!")
        
        # Seed if empty in Atlas
        count = await db.users.count_documents({})
        if count == 0:
            print("[SkillSwap Database] Seeding initial student exchange profiles into MongoDB Atlas...")
            for user in SEED_USERS:
                await db.users.insert_one(dict(user))
            for rev in SEED_REVIEWS:
                await db.reviews.insert_one(dict(rev))
            for mat in SEED_MATERIALS:
                await db.materials.insert_one(dict(mat))
            print("[SkillSwap Database] Seed completed.")
            
    except Exception as e:
        is_atlas_connected = False
        connection_error_message = f"Failed to connect to MongoDB Atlas: {str(e)}"
        print(f"[SkillSwap Database Warning] {connection_error_message}")
        print("[SkillSwap Database] Falling back to seamless sandbox data store.")
        init_in_memory()

def init_in_memory():
    global in_memory_db
    if not in_memory_db["users"]:
        import copy
        in_memory_db["users"] = copy.deepcopy(SEED_USERS)
        in_memory_db["reviews"] = copy.deepcopy(SEED_REVIEWS)
        in_memory_db["materials"] = copy.deepcopy(SEED_MATERIALS)
        # Seed a sample swap request between Sarah and Alex
        in_memory_db["swap_requests"] = [
            {
                "_id": "swap-demo-01",
                "sender_id": "user-sarah-01",
                "sender_name": "Sarah Chen",
                "sender_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
                "receiver_id": "user-alex-02",
                "receiver_name": "Alex Rivera",
                "receiver_avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
                "skill_offered": {"name": "Python", "hours": 2},
                "skill_requested": {"name": "UI/UX", "hours": 2},
                "note": "Hey Alex! I can teach you Python async & FastAPI if you can teach me Figma auto-layout and component design!",
                "status": "accepted",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        in_memory_db["messages"] = [
            {
                "_id": "msg-01",
                "swap_id": "swap-demo-01",
                "sender_id": "user-sarah-01",
                "sender_name": "Sarah Chen",
                "receiver_id": "user-alex-02",
                "content": "Hi Alex! Super excited about the swap. Are you free this Thursday at 5 PM?",
                "message_type": "text",
                "is_read": True,
                "created_at": datetime.utcnow()
            },
            {
                "_id": "msg-02",
                "swap_id": "swap-demo-01",
                "sender_id": "user-alex-02",
                "sender_name": "Alex Rivera",
                "receiver_id": "user-sarah-01",
                "content": "Hey Sarah! Thursday 5 PM works perfectly. Let's start with your Figma project structure!",
                "message_type": "text",
                "is_read": True,
                "created_at": datetime.utcnow()
            }
        ]
        in_memory_db["sessions"] = [
            {
                "_id": "sess-demo-01",
                "swap_id": "swap-demo-01",
                "teacher_id": "user-alex-02",
                "teacher_name": "Alex Rivera",
                "learner_id": "user-sarah-01",
                "learner_name": "Sarah Chen",
                "skill_name": "UI/UX",
                "scheduled_start": datetime.utcnow(),
                "duration_minutes": 60,
                "meeting_url": "https://meet.google.com/swap-figma-live",
                "status": "scheduled",
                "notes": "Session 1: Figma Layout Grids & Token hierarchy",
                "created_at": datetime.utcnow()
            }
        ]
