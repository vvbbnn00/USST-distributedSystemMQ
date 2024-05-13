from sanic import Blueprint, Sanic
from .ai import bp as ai_bp
from .auth import bp as auth_bp
from .file import bp as file_bp

bp = Blueprint.group(ai_bp, auth_bp, file_bp, url_prefix="/api")


def inject_api(app: Sanic):
    """
    Inject controller modules into a Sanic application
    :param app: Sanic application
    :return: None
    """
    app.blueprint(bp)
