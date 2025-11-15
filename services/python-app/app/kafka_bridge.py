from __future__ import annotations

import json
from threading import Event, Thread
from typing import Optional

from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import KafkaError
from py_models import DemoMessage

from .config import Settings
from .storage import MessageStore


class KafkaBridge:
    def __init__(self, settings: Settings, store: MessageStore) -> None:
        self._settings = settings
        self._store = store
        self._producer: Optional[KafkaProducer] = None
        self._consumer: Optional[KafkaConsumer] = None
        self._thread: Optional[Thread] = None
        self._stopped = Event()

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

    def publish(self, message: DemoMessage) -> None:
        if not self._producer:
            raise RuntimeError("Kafka producer not initialized")
        payload = message.dict(by_alias=True, exclude_none=False)
        self._producer.send(self._settings.topic_from_python, value=payload)
        self._producer.flush()

    def _consume_loop(self) -> None:
        assert self._consumer is not None
        while not self._stopped.is_set():
            try:
                for record in self._consumer:
                    if self._stopped.is_set():
                        break
                    dto = DemoMessage.parse_obj(record.value)
                    self._store.add_java(dto)
            except KafkaError:
                continue

    def close(self) -> None:
        self._stopped.set()
        if self._consumer:
            self._consumer.close()
        if self._producer:
            self._producer.flush()
            self._producer.close()
        if self._thread:
            self._thread.join(timeout=2)
