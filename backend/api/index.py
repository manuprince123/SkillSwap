import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import Request
from app.main import app

# Vercel Serverless Path Normalizer & Lazy DB Initializer
@app.middleware("http")
async def vercel_middleware(request: Request, call_next):
    # 1. Ensure MongoDB Atlas connection in serverless environment
    from app.database import motor_client, init_db
    if motor_client is None:
        try:
            await init_db()
        except Exception as e:
            print(f"[Vercel Middleware DB Init Error]: {e}")

    # 2. Extract real path from Vercel headers (x-matched-path / x-invoke-path)
    matched_path = request.headers.get("x-matched-path") or request.headers.get("x-invoke-path")
    if matched_path:
        # Strip query string if present
        clean_path = matched_path.split("?")[0]
        request.scope["path"] = clean_path
    else:
        original_path = request.scope.get("path", "")
        for prefix in ["/api/index.py", "/api/index"]:
            if original_path.startswith(prefix):
                new_path = original_path[len(prefix):]
                request.scope["path"] = new_path if new_path else "/"
                break

    response = await call_next(request)
    return response

app = app
