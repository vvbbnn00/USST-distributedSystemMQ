# _*_ coding: utf-8 _*_
"""
Time:     2024/5/13 11:16
Author:   不做评论(vvbbnn00)
Version:  
File:     mq_config.py
Describe: 
"""
import os

MQ_HOST = "10.100.164.7"
MQ_PORT = 5672
MQ_QUEUE = "ai_task"
MQ_USER = os.getenv("MQ_PRODUCER_USER", "producer")
MQ_PASS = os.getenv("MQ_PRODUCER_PASS", "producer")
