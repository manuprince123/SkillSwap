import sys
import os
from urllib.parse import parse_qsl, urlencode
from fastapi import Request

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from app.main import app

# Vercel Serverless Middleware: Route Dispatcher & DB Connection
@app.middleware("http")
async def vercel_middleware(request: Request, call_next):
    # 1. Ensure live MongoDB Atlas connection
    from app.database import motor_client, init_db
    if motor_client is None:
        try:
            await init_db()
        except Exception as e:
            print(f"[Vercel DB Init Error]: {e}")

    # 2. Extract real path from __vercel_path query param
    qs_raw = request.scope.get("query_string", b"").decode("utf-8", "ignore")
    if "__vercel_path" in qs_raw:
        params = dict(parse_qsl(qs_raw))
        v_path = params.pop("__vercel_path", None)
        if v_path:
            request.scope["path"] = "/" + v_path.lstrip("/")
            request.scope["query_string"] = urlencode(params).encode("utf-8")
    elif request.headers.get("x-matched-path"):
        raw_m = request.headers.get("x-matched-path").split("?")[0]
        if raw_m and not raw_m.startswith("/api/index"):
            request.scope["path"] = raw_m

    response = await call_next(request)
    return response

app = app
