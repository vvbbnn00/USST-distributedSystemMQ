import base64
import ipaddress
import socket
import time
from urllib.parse import urlparse

import requests
from bson import ObjectId

from util.baiduapi import Baidu

baidu = Baidu()


def is_internal_ip(url):
    try:
        hostname = urlparse(url).hostname
        ip = socket.gethostbyname(hostname)
        return ipaddress.ip_address(ip).is_private
    except Exception as e:
        return False


def ocr(ch, method, json_data, db):
    _id = ObjectId(json_data.get("_id"))
    lang = json_data.get("lang")
    image_url = json_data.get("compressed_url")

    collection = db.ocr_record

    record = collection.find_one({"_id": _id})
    if not record:
        print(f" [x] Task {_id} not found.")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        return

    if record.get("status") != "pending" and not method.redelivered:
        print(f" [x] Task {_id} has been processed.")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        return

    # 更新任务状态
    collection.update_one(
        {"_id": _id},
        {
            "$set": {
                "status": "processing",
                "updated_at": int(time.time() * 1000),
            }
        },
    )

    # 判断是否为内网地址
    if is_internal_ip(image_url):
        picture = requests.get(image_url).content
        image_b64 = base64.b64encode(picture).decode("utf-8")
        image_url = None
    else:
        image_b64 = None

    result = baidu.ocr(lang, image_b64, image_url)
    if result.get("error_code"):
        print(f" [x] OCR failed: {result}")

        # 最多重试 3 次
        if method.redelivered or method.delivery_tag >= 3:
            print(" [x] Retry 3 times, put message to dead letter queue.")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            # 更新任务状态
            collection.update_one(
                {"_id": _id},
                {
                    "$set": {
                        "status": "failed",
                        "result": result,
                        "updated_at": int(time.time() * 1000),
                    }
                },
            )
        else:
            print(f" [x] Will retry, {method.delivery_tag + 1} / 3 times.")
            ch.basic_reject(delivery_tag=method.delivery_tag, requeue=True)
        return

    # 更新任务状态
    collection.update_one(
        {"_id": _id},
        {
            "$set": {
                "status": "completed",
                "result": result,
                "updated_at": int(time.time() * 1000),
            }
        },
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)
    print(" [x] OCR completed.")
