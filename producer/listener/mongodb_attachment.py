from motor.motor_asyncio import AsyncIOMotorClient
from sanic import Sanic
from sanic.log import logger
from config import MONGO_URI, MONGO_DB

TIMINGS = ["before_server_start"]


async def before_server_start(app: Sanic) -> None:
    """
    Attach database into Sanic App
    :param app: Sanic App
    :return: None
    """
    # MongoDB 配置
    db_client = AsyncIOMotorClient(MONGO_URI)
    db = db_client[MONGO_DB]
    app.ctx.db = db
    logger.info("Mysql attached.")
