# _*_ coding: utf-8 _*_
"""
Time:     2024/5/13 11:17
Author:   不做评论(vvbbnn00)
Version:  
File:     test_mq.py
Describe: 
"""
import json

import pika
import pymongo

from config import MQ_HOST, MQ_PORT, MQ_USER, MQ_PASS, MQ_QUEUE, MONGO_URI, MONGO_DB
import service.baidu_ocr

# 连接到 RabbitMQ 服务器
connection = pika.BlockingConnection(
    pika.ConnectionParameters(
        host=MQ_HOST, port=MQ_PORT, credentials=pika.PlainCredentials(MQ_USER, MQ_PASS)
    )
)

channel = connection.channel()
db_client = pymongo.MongoClient(MONGO_URI)
db = db_client[MONGO_DB]


def callback(ch, method, properties, body):
    try:
        json_data = json.loads(body)
    except Exception as e:
        print(" [x] Received invalid message.")
        # 将消息放入死信队列
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        return

    task_type = json_data.get("task_type")
    if task_type == "baidu_ocr":
        print(" [x] Received baidu_ocr task.")
        service.baidu_ocr.ocr(ch, method, json_data, db)
    else:
        print(" [x] Received unknown task.")
        # 将消息放入死信队列
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        return


if __name__ == "__main__":
    channel.basic_consume(queue=MQ_QUEUE, on_message_callback=callback, auto_ack=False)
    print(" [*] Waiting for messages. To exit press CTRL+C")
    channel.start_consuming()
