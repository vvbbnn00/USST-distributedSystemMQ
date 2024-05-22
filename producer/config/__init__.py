from .mq_config import MQ_USER, MQ_PASS, MQ_HOST, MQ_PORT, MQ_QUEUE
from .mongo_config import MONGO_URI, MONGO_DB
from .goflet_config import (
    GOFLET_BASE_URL,
    GOFLET_JWT_ISSUER,
    GOFLET_JWT_SECRET,
    GOFLET_JWT_ALGORITHM,
    GOFLET_JWT_PRIVATE_KEY,
    GOFLET_JWT_EXPIRATION,
)
from .redis_config import REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB

APP_SECRET = "ai:app_secret"
