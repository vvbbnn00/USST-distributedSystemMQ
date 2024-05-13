import re
import time
import uuid
import json as json_lib

from sanic import Blueprint, Sanic, json

bp = Blueprint("file", url_prefix="/file")


@bp.route("/upload", methods=["POST"])
async def start_file_upload_session(request):
    goflet = request.app.ctx.goflet
    file_uuid = f"ai_task/{int(time.time())}_{uuid.uuid4()}"

    upload_url = goflet.create_upload_session(file_uuid)
    return json({"message": "ok", "url": upload_url, "file_uuid": file_uuid})


@bp.route("/upload/session", methods=["DELETE"])
async def cancel_file_upload_session(request):
    try:
        data = json_lib.loads(request.body)
        file_uuid = data.get("file_uuid")
        assert file_uuid is not None, "file_uuid is required"
        assert re.match(r"ai_task/\d+_[a-f0-9-]+", file_uuid), "invalid file_uuid"
    except Exception as e:
        return json({"message": str(e)}, status=400)

    goflet = request.app.ctx.goflet
    try:
        await goflet.cancel_upload_session(file_uuid)
        return json({"message": "ok"})
    except Exception as e:
        return json({"message": str(e)}, status=500)


@bp.route("/upload/session", methods=["POST"])
async def complete_file_upload_session(request):
    try:
        data = json_lib.loads(request.body)
        file_uuid = data.get("file_uuid")
        assert file_uuid is not None, "file_uuid is required"
        assert re.match(r"ai_task/\d+_[a-f0-9-]+", file_uuid), "invalid file_uuid"
    except Exception as e:
        return json({"message": str(e)}, status=400)

    goflet = request.app.ctx.goflet
    try:
        await goflet.complete_upload_session(file_uuid)
        return json({"message": "ok"})
    except Exception as e:
        return json({"message": str(e)}, status=500)
