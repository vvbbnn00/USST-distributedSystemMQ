import re
import time
import uuid
import json as json_lib

from sanic import Blueprint, Sanic, json

bp = Blueprint("student", url_prefix="/student")

STUDENT_PREFIX = "distributed:student"
STUDENT_IDS = "distributed:student_ids"


@bp.route("/<student_id>", methods=["GET"])
async def get_student(request, student_id: int):
    redis = request.app.ctx.redis

    has_student = await redis.sismember(STUDENT_IDS, student_id)
    if not has_student:
        return json({"message": "Student not found"}, status=404)

    key = f"{STUDENT_PREFIX}:{student_id}"
    try:
        student = await redis.hgetall(key)
        student_dict = {}
        for k, v in student.items():
            student_dict[k.decode()] = v.decode()
        return json(student_dict)
    except Exception as e:
        return json({"message": str(e)}, status=500)


@bp.route("/create/", methods=["POST"])
async def create_student(request):
    redis = request.app.ctx.redis

    student_id = uuid.uuid4().int
    key = f"{STUDENT_PREFIX}:{student_id}"

    data = json_lib.loads(request.body)
    data["id"] = student_id
    await redis.hset(key, "id", student_id)
    for k, v in data.items():
        await redis.hset(key, k, v)
    await redis.sadd(STUDENT_IDS, student_id)
    return json({"message": "ok", "student_id": student_id})


@bp.route("/<student_id>", methods=["PUT"])
async def update_student(request, student_id: int):
    redis = request.app.ctx.redis

    has_student = await redis.sismember(STUDENT_IDS, student_id)
    if not has_student:
        return json({"message": "Student not found"}, status=404)

    key = f"{STUDENT_PREFIX}:{student_id}"
    data = json_lib.loads(request.body)
    for k, v in data.items():
        await redis.hset(key, k, v)
    return json({"message": "ok"})


@bp.route("/<student_id>", methods=["DELETE"])
async def delete_student(request, student_id: int):
    redis = request.app.ctx.redis

    has_student = await redis.sismember(STUDENT_IDS, student_id)
    if not has_student:
        return json({"message": "Student not found"}, status=404)

    key = f"{STUDENT_PREFIX}:{student_id}"
    await redis.delete(key)
    await redis.srem(STUDENT_IDS, student_id)
    return json({"message": "ok"})


@bp.route("/", methods=["GET"])
async def list_students(request):
    redis = request.app.ctx.redis

    student_ids = await redis.smembers(STUDENT_IDS)
    students = []
    for student_id in student_ids:
        student_id = str(student_id.decode())
        key = f"{STUDENT_PREFIX}:{student_id}"
        student = await redis.hgetall(key)
        student_dict = {}
        for k, v in student.items():
            student_dict[k.decode()] = v.decode()

        students.append(student_dict)
    return json(
        {
            "success": True,
            "data": students,
            "total": len(students),
        }
    )
