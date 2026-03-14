from decouple import config

from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME", default="learn_urhobo"),
        "USER": config("DB_USER", default="urhobo"),
        "PASSWORD": config("DB_PASSWORD", default="urhobo"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://localhost:19006",
]
