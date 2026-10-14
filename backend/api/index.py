import sys
import os
from urllib.parse import parse_qsl, urlencode

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from app.main import app as fastapi_app
from app.database import motor_client, init_db

class VercelASGIAdapter:
    """Pure ASGI middleware that normalizes Vercel serverless request paths before FastAPI router dispatch."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "http":
            # 1. Ensure MongoDB Atlas connection on cold starts
            from app.database import motor_client
            if motor_client is None:
                try:
                    await init_db()
                except Exception as e:
                    print(f"[Vercel DB Connection Error]: {e}")

            # 2. Extract and normalize path
            path = scope.get("path", "")
            
            # Check query string for __vercel_path from vercel.json rewrite
            qs = scope.get("query_string", b"").decode("utf-8", "ignore")
            if "__vercel_path" in qs:
                params = dict(parse_qsl(qs))
                v_path = params.pop("__vercel_path", None)
                if v_path:
                    path = "/" + v_path.lstrip("/")
                    scope["query_string"] = urlencode(params).encode("utf-8")
            
            # Check headers for x-matched-path or x-invoke-path
            headers = dict(scope.get("headers", []))
            x_matched = headers.get(b"x-matched-path", b"").decode("utf-8")
            if x_matched and not x_matched.startswith("/api/index"):
                path = x_matched.split("?")[0]

            # Strip any /api/index.py prefix
            for prefix in ["/api/index.py", "/api/index"]:
                if path.startswith(prefix):
                    path = path[len(prefix):]
                    break

            scope["path"] = path if path else "/"

        await self.app(scope, receive, send)

# Expose wrapped ASGI app for Vercel Serverless Function
app = VercelASGIAdapter(fastapi_app)
