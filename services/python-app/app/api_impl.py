from __future__ import annotations

from typing import List, Optional

from fastapi import HTTPException, status
from kafka.errors import KafkaError
from kafka_api.apis.default_api_base import BaseDefaultApi
from py_models.models.demo_message import DemoMessage

from .kafka_bridge import KafkaBridge
from .storage import MessageStore

_store: Optional[MessageStore] = None
_bridge: Optional[KafkaBridge] = None


def configure_default_api(store: MessageStore, bridge: KafkaBridge) -> None:
    global _store, _bridge
    _store = store
    _bridge = bridge


def _guard_store() -> MessageStore:
    if _store is None:
        raise HTTPException(status_code=500, detail="Message store unavailable")
    return _store


def _guard_bridge() -> KafkaBridge:
    if _bridge is None:
        raise HTTPException(status_code=503, detail="Kafka bridge not ready")
    return _bridge


class LocalDefaultApi(BaseDefaultApi):
    async def list_python_messages(self) -> List[DemoMessage]:
        return _guard_store().get_python()

    async def list_messages_from_java(self) -> List[DemoMessage]:
        return _guard_store().get_java()

    async def publish_python_message(self, demo_message: DemoMessage) -> None:
        store = _guard_store()
        bridge = _guard_bridge()
        store.add_python(demo_message)
        try:
            bridge.publish_from_python(demo_message)
        except KafkaError as exc:  # type: ignore[no-untyped-call]
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Kafka unavailable: {exc}",
            ) from exc
        except RuntimeError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(exc),
            ) from exc

    async def list_messages_from_python(self) -> List[DemoMessage]:
        # Python service does not maintain Spring Boot storage, so return 501
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Use the Java service for /messages/java/from-python",
        )

    async def list_java_messages(self) -> List[DemoMessage]:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Use the Java service for /messages/java",
        )

    async def publish_java_message(self, demo_message: DemoMessage) -> None:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Publishing to /messages/java is handled by the Spring service",
        )
