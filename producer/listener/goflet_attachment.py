from sanic import Sanic
from sanic.log import logger
from config import (
    GOFLET_JWT_SECRET,
    GOFLET_JWT_ALGORITHM,
    GOFLET_JWT_ISSUER,
    GOFLET_BASE_URL,
    GOFLET_JWT_EXPIRATION,
    GOFLET_JWT_PRIVATE_KEY
)
from util.goflet import Goflet

TIMINGS = ["before_server_start"]


async def before_server_start(app: Sanic) -> None:
    """
    Attach goflet into Sanic App
    :param app: Sanic App
    :return: None
    """
    app.ctx.goflet = Goflet(
        GOFLET_BASE_URL,
        GOFLET_JWT_ALGORITHM,
        GOFLET_JWT_SECRET,
        GOFLET_JWT_PRIVATE_KEY,
        GOFLET_JWT_ISSUER,
        GOFLET_JWT_EXPIRATION
    )

    logger.info("Goflet attached.")
