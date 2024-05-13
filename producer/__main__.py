import argparse
import os
from functools import partial

from sanic import Sanic
from sanic.worker.loader import AppLoader

from server import create_app

APP_NAME = "AI_Server"


def main():
    """
    Main function
    :return:
    """
    parser = argparse.ArgumentParser(description="SCS Server Backend")
    parser.add_argument("--host", default="0.0.0.0", help="Host to run the server on")
    parser.add_argument("--port", default=9999, help="Port to run the server on")
    parser.add_argument(
        "--dev",
        action="store_true",
        help="Run the server in development mode",
        default=os.getenv("DEVELOPMENT", "false").lower() == "true",
    )

    args = parser.parse_args()

    # Start the web server
    loader = AppLoader(factory=partial(create_app, APP_NAME))
    run_app = loader.load()

    if args.dev:
        run_app.prepare(
            host="0.0.0.0", port=9999, dev=True, auto_reload=True, reload_dir="."
        )
    else:
        run_app.prepare(host=args.host, port=args.port, fast=True)

    Sanic.serve(primary=run_app, app_loader=loader)


if __name__ == "__main__":
    # To run in development mode, run the following command:
    # python src/__main__.py --dev
    # or set the DEVELOPMENT environment variable to "true"
    main()
