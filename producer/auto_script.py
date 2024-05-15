import json
import time

import pika
import pymongo

from config import MQ_HOST, MQ_PORT, MQ_USER, MQ_PASS, MQ_QUEUE
from config import MONGO_URI, MONGO_DB

connection = pika.BlockingConnection(
    pika.ConnectionParameters(
        host=MQ_HOST, port=MQ_PORT, credentials=pika.PlainCredentials(MQ_USER, MQ_PASS)
    )
)

channel = connection.channel()
channel.queue_declare(queue=MQ_QUEUE, durable=True)

db_client = pymongo.MongoClient(MONGO_URI)
db = db_client[MONGO_DB]

if __name__ == "__main__":
    # 从数据库中获取状态为 pending 的任务，但是创建时长已经超过 10 秒
    while True:
        time.sleep(10)
        print("Checking for pending tasks...")
        cursor = db.ocr_record.find(
            {
                "status": "pending",
                "created_at": {"$lt": int(time.time() * 1000 - 10000)},
            }
        )
        for record in cursor:
            print(f" [x] Received {record.get('_id')}")

            record["_id"] = str(record.get("_id"))
            channel.basic_publish(
                exchange="",
                routing_key=MQ_QUEUE,
                body=json.dumps(record).encode(),
                properties=pika.BasicProperties(delivery_mode=2),
            )
            print(f" [x] Sent {record.get('_id')}")
