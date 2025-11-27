from __future__ import annotations

from collections import deque
from threading import Lock
from typing import Deque, List

from activate_api_models.models.demo_message import DemoMessage


class MessageStore:
    def __init__(self, max_messages: int = 100) -> None:
        self._max = max_messages
        self._python_messages: Deque[DemoMessage] = deque()
        self._java_messages: Deque[DemoMessage] = deque()
        self._lock = Lock()

    def add_python(self, message: DemoMessage) -> None:
        self._append(self._python_messages, message)

    def add_java(self, message: DemoMessage) -> None:
        self._append(self._java_messages, message)

    def get_python(self) -> List[DemoMessage]:
        with self._lock:
            return list(self._python_messages)

    def get_java(self) -> List[DemoMessage]:
        with self._lock:
            return list(self._java_messages)

    def _append(self, collection: Deque[DemoMessage], message: DemoMessage) -> None:
        with self._lock:
            collection.appendleft(message)
            while len(collection) > self._max:
                collection.pop()
