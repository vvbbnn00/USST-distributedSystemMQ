import uuid

import jwt
from sanic import Blueprint, json
from config import APP_SECRET

bp = Blueprint("auth", url_prefix="/auth")


def check_user(request) -> str:
    token = request.headers.get("Authorization")
    if not token:
        raise Exception("token required")
    if not token.startswith("Bearer "):
        raise Exception("invalid token")
    token = token[7:]

    try:
        jwt_data = jwt.decode(token, APP_SECRET, algorithms=["HS256"])
    except jwt.exceptions.InvalidTokenError:
        raise Exception("invalid token")
    return jwt_data["user_id"]


@bp.post("/reg")
async def reg(request):
    user_id = f"u_{uuid.uuid4()}"
    jwt_data = jwt.encode(
        {"user_id": user_id, "jti": str(uuid.uuid4())},
        APP_SECRET,
        algorithm="HS256",
    )
    return json({"message": "ok", "user_id": user_id, "token": jwt_data})


@bp.get("/check")
async def check(request):
    try:
        user_id = check_user(request)
    except Exception as e:
        return json({"message": str(e)}, status=401)

    return json({"message": "ok", "user_id": user_id})
