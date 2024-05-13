from sanic.log import logger
import aio_pika
from sanic import Sanic

from config import MQ_HOST, MQ_PORT, MQ_USER, MQ_PASS, MQ_QUEUE

TIMINGS = ["before_server_start"]


async def before_server_start(app: Sanic) -> None:
    """
    Attach database into Sanic App
    :param app: Sanic App
    :return: None
    """
    connection = await aio_pika.connect(
        host=MQ_HOST,
        port=MQ_PORT,
        login=MQ_USER,
        password=MQ_PASS,
    )

    channel = await connection.channel()
    await channel.set_qos(prefetch_count=1)
    await channel.declare_queue(MQ_QUEUE, durable=True)

    # 测试发送消息
    # await channel.default_exchange.publish(
    #     aio_pika.Message(body="Hello World".encode()),
    #     routing_key=MQ_QUEUE
    # )

    app.ctx.channel = channel
    logger.info("RabbitMQ attached.")
