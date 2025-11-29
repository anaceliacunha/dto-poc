from __future__ import annotations

import logging
import sys
import types
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from kafka.errors import KafkaError
from pydantic import BaseModel
import activate_api_models.demo.models as shared_models
import activate_api_models.demo.models.demo_message as shared_demo_module

# Wire generated API package to reuse shared DTOs
extra_models_module = types.ModuleType("activate_api_models.demo.models.extra_models")


class _TokenModel(BaseModel):
    pass


extra_models_module.TokenModel = _TokenModel
sys.modules["activate_api_models.demo.models.extra_models"] = extra_models_module

# Make sure the API can find the models
sys.modules["activate_api_models.demo.models"] = shared_models
sys.modules["activate_api_models.demo.models.demo_message"] = shared_demo_module

from activate_api_models.demo.apis import default_api  # noqa: E402
from activate_api_models.demo.apis.default_api import router as default_api_router  # noqa: E402
from activate_api_models.demo.apis.default_api_base import BaseDefaultApi  # noqa: E402

from .api_impl import configure_default_api  # noqa: E402
from .config import get_settings
from .kafka_bridge import KafkaBridge
from .storage import MessageStore

settings = get_settings()
store = MessageStore()
kafka_bridge = KafkaBridge(settings, store)
logger = logging.getLogger("python-app")

configure_default_api(store, kafka_bridge)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup
    try:
        kafka_bridge.start()
    except KafkaError as exc:  # type: ignore[no-untyped-call]
        logger.warning("Kafka unavailable during startup: %s", exc)
    
    yield
    
    # Shutdown
    kafka_bridge.close()


default_api_router.routes = [
    route
    for route in default_api_router.routes
    if not (
        isinstance(route, APIRoute)
        and route.path == "/messages/python"
        and "POST" in route.methods
    )
]

app = FastAPI(title="Python FastAPI Demo", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(default_api_router)


@app.post("/messages/python", status_code=202, response_model=shared_demo_module.DemoMessage)
async def publish_python_override(message: shared_demo_module.DemoMessage) -> shared_demo_module.DemoMessage:
    handler = BaseDefaultApi.subclasses[0]()
    await handler.publish_python_message(message)
    return message
