from sanic import Sanic

INJECTION_MODULES = [
    "mongodb_attachment",
    "mq_attachment",
    "goflet_attachment",
]


def inject_listener(app: Sanic):
    """
    Inject listener modules into a Sanic application
    :param app: Sanic application
    :return: None
    """
    for module in INJECTION_MODULES:
        module = __import__(f"listener.{module}", fromlist=[module])
        # Get var TIMINGS
        timings = getattr(module, "TIMINGS", None)
        if not timings:
            # If TIMINGS are not defined, skip the module
            continue

        for timing in timings:
            # Get the function
            func = getattr(module, timing)
            # Add the listener
            app.register_listener(func, "before_server_start")
