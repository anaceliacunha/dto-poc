# Full Multi Language Demo

This project mirrors the prompt end-to-end: OpenAPI 3.1 specs feed DTOs into Java, Python (Pydantic v1), and React TypeScript clients. REST + Kafka flows illustrate cross-language messaging, while Podman Compose supplies Kafka infra.

## Layout
```
full-multi-lang-demo/
├─ openapi/ (OpenAPI 3.1 specs + Draft 2020-12 schemas)
├─ gen/
│  ├─ java-models/      # shared Java DTOs (OpenAPI generator output)
│  ├─ java-api/         # optional Spring stubs
│  ├─ python-models/    # shared Pydantic v1 models
│  ├─ python-api/       # FastAPI stubs
│  └─ ts-models/        # TypeScript DTOs + fetch client
├─ services/
│  ├─ java-app/         # Spring Boot 2.7.x (Java 8) REST + Kafka
│  └─ python-app/       # FastAPI + kafka-python bridge
├─ webapp/react-app/    # React + Vite UI importing generated types
├─ infra/podman-compose.yml  # Kafka + Zookeeper
└─ Makefile             # codegen + run targets
```

## OpenAPI + Schemas
* `openapi/schemas/*.schema.json` contain the rich Draft 2020-12 structures.
* `openapi/openapi-models.yaml` exposes components only; `openapi/openapi-api.yaml` references those schemas for the `/messages/*` REST contract used by both services.

## Code generation
Run generators anytime the schemas change:
```bash
cd full-multi-lang-demo
make codegen
```
This executes the prescribed targets from the prompt (Java DTOs/APIs, Pydantic v1 models, FastAPI stubs, TypeScript DTOs). All services point to the shared folders, so compilation requires running `make codegen` once.

## Runtime prerequisites
* Java 8+
* Python 3.11 (for FastAPI service) + virtualenv
* Node 18+
* Podman + podman-compose

Install service dependencies:
```bash
cd services/java-app && mvn dependency:go-offline
cd services/python-app && python3.11 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
cd webapp/react-app && npm install
```

## Kafka via Podman
```bash
make kafka-up       # podman-compose up -d
make topics         # create demo.from.python + demo.from.java
make kafka-down     # tear down services
```

## Run services
```bash
make run-java       # Spring Boot on :8080
make run-python     # FastAPI on :8000 (uses .venv interpreter)
make run-web        # React on :5173
```
> Tip: when starting FastAPI manually, activate `.venv`, export `PYTHONPATH=../../gen/python-models`, and run `.venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`.

## React UI
`webapp/react-app/src/App.tsx` imports `DemoMessage` from `../../../gen/ts-models/...` and builds payloads using that type. Buttons POST to Java or Python; the UI immediately refreshes GET panels (REST storage + Kafka cross-feed). Null/empty/reserved-name handling is obvious via badges.

## Sample workflow
1. `make kafka-up && make topics`
2. `make run-java` and `make run-python`
3. `make run-web`
4. Use the React form (or curl) to POST to `/messages/java` or `/messages/python`. Each POST writes locally and to Kafka topics `demo.from.java` / `demo.from.python`, enabling the opposite service’s `/from-*` endpoint to show cross-language traffic.
