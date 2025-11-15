from __future__ import annotations

from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from kafka.errors import KafkaError
from py_models import DemoMessage

from .config import get_settings
from .kafka_bridge import KafkaBridge
from .storage import MessageStore

settings = get_settings()
store = MessageStore()
kafka_bridge = KafkaBridge(settings, store)

app = FastAPI(title="Python FastAPI Demo", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    try:
        kafka_bridge.start()
    except KafkaError as exc:  # type: ignore[arg-type]
        raise HTTPException(status_code=503, detail=f"Kafka unavailable: {exc}") from exc


@app.on_event("shutdown")
async def on_shutdown() -> None:
    kafka_bridge.close()


@app.post("/messages/python", status_code=202, response_model=DemoMessage)
async def publish_message(message: DemoMessage) -> DemoMessage:
    store.add_python(message)
    try:
        kafka_bridge.publish(message)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return message


@app.get("/messages/python", response_model=List[DemoMessage])
async def list_python_messages() -> List[DemoMessage]:
    return store.list_python()


@app.get("/messages/python/from-java", response_model=List[DemoMessage])
async def list_java_messages() -> List[DemoMessage]:
    return store.list_java()
