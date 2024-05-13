import re
import time

import aio_pika
from bson import ObjectId
from pymongo import DESCENDING
from sanic import Blueprint, json

from config import MQ_QUEUE
from .auth import check_user
import json as json_lib

bp = Blueprint("ai", url_prefix="/ai")
OCR_LANGS = ["CHN_ENG", "ENG", "JAP", "KOR", "FRE", "SPA", "POR", "GER", "ITA", "RUS"]


@bp.get("/ocr/tasks")
async def get_ocr_tasks(request):
    db = request.app.ctx.db
    try:
        user = check_user(request)
    except Exception as e:
        return json({"message": str(e)}, status=401)

    try:
        page = request.args.get("page", 1)
        page_size = request.args.get("page_size", 10)
        assert page.isdigit() and page_size.isdigit(), "Invalid page or page_size."
        page = int(page)
        page_size = int(page_size)
        assert 1 <= page, "Invalid page."
        assert 1 <= page_size <= 100, "Invalid page_size."
        status = request.args.get("status")
        assert status in [
            "pending",
            "processing",
            "completed",
            "failed",
            None,
        ], "Invalid status."
    except Exception as e:
        return json({"message": str(e)}, status=400)

    # 限制返回列
    condition = {"uid": user}
    if status:
        condition["status"] = status
    cursor = (
        db.ocr_record.find(condition, {"result": 0})
        .sort("updated_at", DESCENDING)
        .skip((page - 1) * page_size)
        .limit(page_size)
    )
    records = []
    async for record in cursor:
        record["_id"] = str(record.get("_id"))
        records.append(record)
    return json({"data": records})


@bp.get("/ocr/task/<task_id>")
async def get_ocr_task_detail(request, task_id):
    db = request.app.ctx.db
    try:
        user = check_user(request)
    except Exception as e:
        return json({"message": str(e)}, status=401)

    try:
        record = await db.ocr_record.find_one({"uid": user, "_id": ObjectId(task_id)})
        record["_id"] = str(record.get("_id"))
    except Exception as e:
        return json({"message": str(e)}, status=400)
    return json({"data": record, "total": len(record)})


@bp.post("/ocr/task")
async def post_ocr_task(request):
    db = request.app.ctx.db
    goflet = request.app.ctx.goflet
    channel = request.app.ctx.channel

    try:
        user = check_user(request)
    except Exception as e:
        return json({"message": str(e)}, status=401)

    try:
        data = json_lib.loads(request.body)
        lang = data.get("lang", "CHN_ENG")
        file_uuid = data.get("file_uuid")
        assert file_uuid is not None, "File id is required."
        assert re.match(r"ai_task/\d+_[a-f0-9-]+", file_uuid), "Invalid file id."
        assert lang in OCR_LANGS, "Unsupported language."
    except Exception as e:
        return json({"message": str(e)}, status=400)

    try:
        meta = await goflet.get_file_meta(file_uuid)
        if not meta["fileMeta"]["mimeType"].startswith("image/"):
            raise Exception("Unsupported file type.")
    except Exception as e:
        try:
            await goflet.delete_file(file_uuid)
        except Exception:
            pass
        return json({"message": str(e)}, status=400)

    compressed_url = goflet.generate_url(
        f"/api/image/{file_uuid}",
        "GET",
        {"w": "4096", "h": "4096", "f": "jpeg"},
        no_exp=True,
    )
    task = {
        "task_type": "baidu_ocr",
        "uid": user,
        "file": file_uuid,
        "lang": lang,
        "status": "pending",
        "compressed_url": compressed_url,
        "created_at": int(time.time() * 1000),
        "updated_at": int(time.time() * 1000),
    }

    inserted = await db.ocr_record.insert_one(task)
    task["_id"] = str(inserted.inserted_id)

    await channel.default_exchange.publish(
        aio_pika.Message(body=json_lib.dumps(task).encode()), routing_key=MQ_QUEUE
    )

    return json({"message": "ok", "data": task})
