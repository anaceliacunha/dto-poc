#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
cd "$PROJECT_ROOT"

podman-compose exec kafka bash -c "\
  kafka-topics --create --if-not-exists --topic demo.from.python --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 && \
  kafka-topics --create --if-not-exists --topic demo.from.java --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1"
