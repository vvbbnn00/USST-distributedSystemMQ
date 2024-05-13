from sanic import Sanic
from sanic_ext import Extend

from listener import inject_listener
from api import inject_api


def create_app(app_name: str) -> Sanic:
    """
    Create a Sanic application
    :param app_name: application name
    :return: Sanic application
    """
    app = Sanic(app_name)
    inject_listener(app)
    inject_api(app)

    app.config.CORS_ORIGINS = "*"
    Extend(app)

    # Set the default response content type to application/json
    app.ext.openapi.describe(
        app_name,
        version="1.0.0",
    )

    return app
