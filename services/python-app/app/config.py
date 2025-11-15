import os
from dataclasses import dataclass


@dataclass
class Settings:
    kafka_bootstrap: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    topic_from_python: str = os.getenv("TOPIC_FROM_PYTHON", "demo.from.python")
    topic_from_java: str = os.getenv("TOPIC_FROM_JAVA", "demo.from.java")


def get_settings() -> Settings:
    return Settings()
