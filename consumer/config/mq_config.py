import os

MQ_HOST = "10.100.164.7"
MQ_PORT = 5672
MQ_QUEUE = "ai_task"
MQ_USER = os.getenv("MQ_CONSUMER_USER", "consumer")
MQ_PASS = os.getenv("MQ_CONSUMER_PASS", "consumer")
