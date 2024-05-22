from sanic import Sanic
from sanic.log import logger
from redis.asyncio import Redis
from config import REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB

TIMINGS = ["before_server_start"]


async def before_server_start(app: Sanic) -> None:
    """
    Attach redis into Sanic App
    :param app: Sanic App
    :return: None
    """

    app.ctx.redis = Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        password=REDIS_PASSWORD,
        db=REDIS_DB,
    )

    logger.info("Redis attached.")
