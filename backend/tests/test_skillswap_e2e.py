import asyncio
import sys
import uuid
import httpx
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

BASE_URL = "http://127.0.0.1:8000"
ATLAS_URI = "mongodb+srv://manuprince8088_db_user:12qcxbMrDKWgdsM0@cluster0.witllbk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

class TestReport:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []

    def log(self, name: str, success: bool, details: str = ""):
        if success:
            self.passed += 1
            status_str = "✅ PASS"
        else:
            self.failed += 1
            status_str = "❌ FAIL"
        msg = f"{status_str} | {name}"
        if details:
            msg += f" -> {details}"
        print(msg)
        self.results.append((name, success, details))

report = TestReport()

async def run_all_tests():
    print("=" * 65)
    print("🚀 STARTING SKILLSWAP AUTOMATED FINAL END-TO-END TEST SUITE")
    print(f"Target API: {BASE_URL}")
    print(f"Target DB:  MongoDB Atlas Cluster0 (skillswap)")
    print("=" * 65)

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        # Test 1: API Server & Health
        try:
            r = await client.get("/")
            report.log("1. API Root Health Check", r.status_code == 200, f"Status {r.status_code}: {r.json().get('status')}")
        except Exception as e:
            report.log("1. API Root Health Check", False, str(e))

        # Test 2: MongoDB Atlas Connection Status Endpoint
        try:
            r = await client.get("/api/cluster/status")
            data = r.json()
            is_connected = data.get("is_atlas_connected") is True
            report.log("2. MongoDB Atlas Live Connectivity", is_connected, f"Database: {data.get('database_name')}, Provider: {data.get('provider')}")
        except Exception as e:
            report.log("2. MongoDB Atlas Live Connectivity", False, str(e))

        # Test 3: User Registration via API
        test_email = f"student_{uuid.uuid4().hex[:6]}@campus.edu"
        user_a_id = None
        try:
            payload = {
                "email": test_email,
                "password": "pass123Test!",
                "full_name": "Test Student A",
                "university": "MIT Software Engineering 2026",
                "skills_to_teach": [{"name": "Python", "category": "Programming", "proficiency": "Advanced", "experience_summary": "Async FastAPI"}],
                "skills_to_learn": [{"name": "UI/UX", "category": "Design", "target_goal": "Figma prototyping"}]
            }
            r = await client.post("/api/auth/register", json=payload)
            res_data = r.json()
            user_a_id = res_data["user"]["id"]
            report.log("3. User Registration (Student A)", r.status_code == 200 and user_a_id is not None, f"Created User ID: {user_a_id}")
        except Exception as e:
            report.log("3. User Registration (Student A)", False, str(e))

        # Test 4: User Login
        try:
            r = await client.post("/api/auth/login", json={"email": test_email, "password": "pass123Test!"})
            data = r.json()
            report.log("4. User Authentication / Login", r.status_code == 200 and "access_token" in data, f"Token: {data.get('token_type')}")
        except Exception as e:
            report.log("4. User Authentication / Login", False, str(e))

        # Test 5: Register Peer (Student B - Complementary Skills)
        test_email_b = f"student_b_{uuid.uuid4().hex[:6]}@campus.edu"
        user_b_id = None
        try:
            payload_b = {
                "email": test_email_b,
                "password": "pass123Test!",
                "full_name": "Test Student B (Design Pro)",
                "university": "Rhode Island School of Design 2025",
                "skills_to_teach": [{"name": "UI/UX", "category": "Design", "proficiency": "Advanced", "experience_summary": "Figma master"}],
                "skills_to_learn": [{"name": "Python", "category": "Programming", "target_goal": "Backend APIs"}]
            }
            r = await client.post("/api/auth/register", json=payload_b)
            user_b_id = r.json()["user"]["id"]
            report.log("5. Register Complementary Peer (Student B)", r.status_code == 200, f"Peer ID: {user_b_id}")
        except Exception as e:
            report.log("5. Register Complementary Peer (Student B)", False, str(e))

        # Test 6: Smart Skill Matching Engine
        try:
            r = await client.get(f"/api/matches?current_user_id={user_a_id}")
            matches = r.json()
            matched_b = any(m["candidate"]["id"] == user_b_id for m in matches)
            top_score = matches[0]["match_score"] if matches else 0
            report.log("6. Peer Match Algorithm (Python <-> UI/UX)", r.status_code == 200 and matched_b, f"Found Peer B with Match Score: {top_score}%")
        except Exception as e:
            report.log("6. Peer Match Algorithm (Python <-> UI/UX)", False, str(e))

        # Test 7: Propose a Skill Exchange Request
        swap_id = None
        try:
            swap_payload = {
                "receiver_id": user_b_id,
                "skill_offered": {"name": "Python", "hours": 2},
                "skill_requested": {"name": "UI/UX", "hours": 2},
                "note": "Hi! Let us swap 2 hours of Python for 2 hours of Figma UI/UX."
            }
            r = await client.post(f"/api/swaps?sender_id={user_a_id}", json=swap_payload)
            swap_res = r.json()
            swap_id = swap_res["id"]
            report.log("7. Create Skill Swap Request", r.status_code == 200 and swap_res["status"] == "pending", f"Swap ID: {swap_id}")
        except Exception as e:
            report.log("7. Create Skill Swap Request", False, str(e))

        # Test 8: Accept Skill Swap Request
        try:
            r = await client.patch(f"/api/swaps/{swap_id}/status?new_status=accepted")
            updated_swap = r.json()
            report.log("8. Accept Swap Request", r.status_code == 200 and updated_swap["status"] == "accepted", f"Status: {updated_swap['status']}")
        except Exception as e:
            report.log("8. Accept Swap Request", False, str(e))

        # Test 9: Peer-to-Peer Chat Messaging
        try:
            msg_payload = {
                "swap_id": swap_id,
                "receiver_id": user_b_id,
                "content": "Hi Student B, let's schedule our first session this Friday!",
                "message_type": "text"
            }
            r = await client.post(f"/api/chat?sender_id={user_a_id}", json=msg_payload)
            msg_res = r.json()
            report.log("9. Send Direct Chat Message", r.status_code == 200 and "id" in msg_res, f"Message: '{msg_res['content']}'")
        except Exception as e:
            report.log("9. Send Direct Chat Message", False, str(e))

        # Test 10: Schedule Learning Session
        try:
            sess_payload = {
                "swap_id": swap_id,
                "teacher_id": user_a_id,
                "learner_id": user_b_id,
                "skill_name": "Python",
                "scheduled_start": datetime.utcnow().isoformat(),
                "duration_minutes": 60,
                "meeting_url": "https://meet.google.com/skillswap-test",
                "notes": "First Python session: Setup environment & FastAPI basics."
            }
            r = await client.post("/api/sessions", json=sess_payload)
            sess_res = r.json()
            report.log("10. Schedule Swap Session", r.status_code == 200 and "id" in sess_res, f"Session ID: {sess_res['id']}")
        except Exception as e:
            report.log("10. Schedule Swap Session", False, str(e))

        # Test 11: Leave a Review & Rating
        try:
            rev_payload = {
                "session_id": "sess-test-01",
                "reviewee_id": user_a_id,
                "skill_taught": "Python",
                "rating": 5,
                "tags": ["Helpful", "Hands-on", "Clear Explanations"],
                "comment": "Outstanding Python peer session! Explained async FastAPI effortlessly."
            }
            r = await client.post(f"/api/reviews?reviewer_id={user_b_id}", json=rev_payload)
            rev_res = r.json()
            report.log("11. Post Peer Review & 5-Star Rating", r.status_code == 200 and rev_res.get("rating") == 5, f"Rating: 5/5 stars")
        except Exception as e:
            report.log("11. Post Peer Review & 5-Star Rating", False, str(e))

        # Test 12: Learning Material Exchange - List & Filter
        try:
            r = await client.get("/api/materials")
            all_mats = r.json()
            r_filt = await client.get("/api/materials?category=Code+%26+Templates")
            code_mats = r_filt.json()
            report.log("12. Material Exchange (List & Filter)", len(all_mats) > 0 and len(code_mats) > 0, f"Total: {len(all_mats)} items, Filtered: {len(code_mats)} items")
        except Exception as e:
            report.log("12. Material Exchange (List & Filter)", False, str(e))

        # Test 13: Learning Material Exchange - Publish Resource
        mat_id = None
        try:
            mat_payload = {
                "title": f"Automated Test Guide {uuid.uuid4().hex[:4]}",
                "category": "Code & Templates",
                "description": "Complete reference for modern async full-stack testing.",
                "file_format": "PDF",
                "file_size": "3.1 MB",
                "download_url": "https://fastapi.tiangolo.com",
                "swap_requirement": "Free for Campus Peers"
            }
            r = await client.post(f"/api/materials?author_id={user_a_id}", json=mat_payload)
            mat_res = r.json()
            mat_id = mat_res["id"]
            report.log("13. Publish Material Resource", r.status_code == 200 and "id" in mat_res, f"Material ID: {mat_id}")
        except Exception as e:
            report.log("13. Publish Material Resource", False, str(e))

        # Test 14: Learning Material - Download & Like Counter
        try:
            r_dl = await client.post(f"/api/materials/{mat_id}/download")
            r_lk = await client.post(f"/api/materials/{mat_id}/like")
            report.log("14. Material Interactions (Download & Like)", r_dl.status_code == 200 and r_lk.status_code == 200, f"Downloads: {r_dl.json().get('downloads_count')}, Likes: {r_lk.json().get('likes_count')}")
        except Exception as e:
            report.log("14. Material Interactions (Download & Like)", False, str(e))

    # Test 15-17: Direct Verification inside live MongoDB Atlas Cluster
    print("\n" + "-" * 65)
    print("🔍 VERIFYING REAL-TIME DATA PERSISTENCE IN MONGODB ATLAS CLUSTER")
    print("-" * 65)
    try:
        motor_client = AsyncIOMotorClient(ATLAS_URI, serverSelectionTimeoutMS=5000)
        db = motor_client["skillswap"]
        
        # Verify User A in Atlas
        user_doc = await db.users.find_one({"_id": user_a_id})
        user_persisted = user_doc is not None and user_doc["email"] == test_email
        report.log("15. Atlas Persistence: User Account", user_persisted, f"Verified email: {user_doc.get('email') if user_doc else 'None'}")

        # Verify Swap Request in Atlas
        swap_doc = await db.swap_requests.find_one({"_id": swap_id})
        swap_persisted = swap_doc is not None and swap_doc["status"] == "accepted"
        report.log("16. Atlas Persistence: Accepted Swap Request", swap_persisted, f"Status in Atlas: {swap_doc.get('status') if swap_doc else 'None'}")

        # Verify Material in Atlas
        mat_doc = await db.materials.find_one({"_id": mat_id})
        mat_persisted = mat_doc is not None and mat_doc["likes_count"] >= 1
        report.log("17. Atlas Persistence: Published Material & Counters", mat_persisted, f"Title: '{mat_doc.get('title') if mat_doc else 'None'}'")

    except Exception as e:
        report.log("15-17. Direct MongoDB Atlas Queries", False, str(e))

    print("\n" + "=" * 65)
    print(f"📊 FINAL AUTOMATION TEST RESULTS: {report.passed} PASSED / {report.failed} FAILED")
    print("=" * 65)
    if report.failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_all_tests())
