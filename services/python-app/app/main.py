from __future__ import annotations

import logging
import sys
import types
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from kafka.errors import KafkaError
from pydantic import BaseModel
import py_models
import py_models.models as shared_models
import py_models.models.demo_message as shared_demo_module

GENERATED_API_PATH = Path(__file__).resolve().parents[2] / "gen/python-api/src"
if str(GENERATED_API_PATH) not in sys.path:
    sys.path.append(str(GENERATED_API_PATH))

import kafka_api  # type: ignore  # noqa: E402

# Wire generated API package to reuse shared DTOs
extra_models_module = types.ModuleType("py_models.extra_models")
nested_extra_models_module = types.ModuleType("py_models.models.extra_models")


class _TokenModel(BaseModel):
    pass


extra_models_module.TokenModel = _TokenModel
nested_extra_models_module.TokenModel = _TokenModel
sys.modules["py_models.extra_models"] = extra_models_module
py_models.extra_models = extra_models_module  # type: ignore[attr-defined]
sys.modules["py_models.models.extra_models"] = nested_extra_models_module
py_models.models.extra_models = nested_extra_models_module  # type: ignore[attr-defined]

kafka_api.models = shared_models  # type: ignore[attr-defined]
sys.modules["kafka_api.models"] = shared_models
sys.modules["kafka_api.models.demo_message"] = shared_demo_module

from kafka_api.apis import default_api  # noqa: E402
from kafka_api.apis.default_api import router as default_api_router  # noqa: E402
from kafka_api.apis.default_api_base import BaseDefaultApi  # noqa: E402

from .api_impl import configure_default_api  # noqa: E402
from .config import get_settings
from .kafka_bridge import KafkaBridge
from .storage import MessageStore

settings = get_settings()
store = MessageStore()
kafka_bridge = KafkaBridge(settings, store)
logger = logging.getLogger("python-app")

configure_default_api(store, kafka_bridge)

default_api_router.routes = [
    route
    for route in default_api_router.routes
    if not (
        isinstance(route, APIRoute)
        and route.path == "/messages/python"
        and "POST" in route.methods
    )
]

app = FastAPI(title="Python FastAPI Demo", version="1.0.0")
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


@app.on_event("startup")
async def start_bridge() -> None:
    try:
        kafka_bridge.start()
    except KafkaError as exc:  # type: ignore[no-untyped-call]
        logger.warning("Kafka unavailable during startup: %s", exc)


@app.on_event("shutdown")
async def stop_bridge() -> None:
    kafka_bridge.close()
