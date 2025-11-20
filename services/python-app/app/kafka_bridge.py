from __future__ import annotations

import json
from threading import Event, Thread
from typing import Optional

from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import KafkaError
import logging
from py_models.models.demo_message import DemoMessage

from .config import Settings
from .storage import MessageStore

logger = logging.getLogger(__name__)


class KafkaBridge:
    def __init__(self, settings: Settings, store: MessageStore) -> None:
        self._settings = settings
        self._store = store
        self._stop_event = Event()
        self._producer: Optional[KafkaProducer] = None
        self._consumer: Optional[KafkaConsumer] = None
        self._thread: Optional[Thread] = None

    def start(self) -> None:
        self._producer = KafkaProducer(
            bootstrap_servers=self._settings.kafka_bootstrap,
            value_serializer=lambda value: json.dumps(value).encode("utf-8"),
            key_serializer=lambda key: key.encode("utf-8") if key else None,
        )
        self._consumer = KafkaConsumer(
            self._settings.topic_from_java,
            bootstrap_servers=self._settings.kafka_bootstrap,
            auto_offset_reset="earliest",
            enable_auto_commit=True,
            group_id="python-demo-consumer",
            value_deserializer=lambda payload: json.loads(payload.decode("utf-8")),
        )
        self._thread = Thread(target=self._consume_loop, daemon=True)
        self._thread.start()

    def publish_from_python(self, message: DemoMessage) -> None:
        if not self._producer:
            raise RuntimeError("KafkaBridge has not been started")
        payload = message.model_dump(by_alias=True, exclude_none=False, mode="json")
        self._producer.send(self._settings.topic_from_python, value=payload)
        self._producer.flush()

    def _consume_loop(self) -> None:
        assert self._consumer is not None
        while not self._stop_event.is_set():
            try:
                for record in self._consumer:
                    if self._stop_event.is_set():
                        break
                    try:
                        dto = DemoMessage.model_validate(record.value)
                    except Exception as exc:  # ValidationError or others
                        logger.warning("Skipping invalid record on %s: %s", record.topic, exc)
                        continue
                    self._store.add_java(dto)
            except KafkaError as exc:  # type: ignore[no-untyped-call]
                logger.warning("Kafka consumer issue: %s", exc)

    def close(self) -> None:
        self._stop_event.set()
        if self._consumer is not None:
            self._consumer.close()
        if self._producer is not None:
            self._producer.flush()
            self._producer.close()
        if self._thread is not None:
            self._thread.join(timeout=2)
