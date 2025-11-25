# Multi Language OpenAPI 3.1 Demo

This workspace wires two OpenAPI 3.1 specs into React, Spring Boot 2.7 (Java 8 compatible), FastAPI, and Kafka. DTOs generated from *either* spec are forced into the same shared folders so that REST + Kafka traffic never drifts between languages.

```
dto-poc/
├─ openapi/
│  ├─ openapi-api.yaml          ← REST endpoints + $ref schemas
│  ├─ openapi-models.yaml       ← Only shared schemas
│  ├─ schemas/*.schema.json     ← Draft 2020-12 JSON Schemas
│  └─ samples/*.json            ← Null / empty / precision payloads
├─ gen/
│  ├─ java-models/src/main/java/demo/dto     ← shared Java DTOs
│  ├─ python-models/py_models                ← shared Python DTOs
│  ├─ ts-models                              ← shared TypeScript DTOs (synced into webapp/react-app/src/models)
│  ├─ java-api / python-api / react-client   ← generator output stubs
├─ services/
│  ├─ java-app/      ← Spring Boot REST + Kafka producer/consumer
│  └─ python-app/    ← FastAPI REST + kafka-python bridge
├─ webapp/react-app/ ← React + Vite UI + TypeScript client demo (+ generated TS models/client)
└─ infra/            ← Kafka + Zookeeper via Podman Compose
```

## OpenAPI + JSON Schema

* `openapi/schemas/demo-message.schema.json` and `item.schema.json` use Draft 2020-12 and include all the exotic properties (binary, enums, unions, language restricted names, nullables, nested metrics, etc.).
* `openapi/openapi-models.yaml` exposes components only. `openapi/openapi-api.yaml` imports the same schemas and adds `/messages/java` + `/messages/python` REST paths.
* Sample payloads under `openapi/samples/` prove the null/empty/missing combinations that everything must handle.

## Code generation

The `Makefile` locks down generator output destinations and now applies explicit `--inline-schema-name-mappings` across every language target. This guarantees that anchors such as `DemoMessage` and `Item` never spawn `DemoMessage1`, `Item_1`, etc., keeping DTO names consistent in Java, Python, and TypeScript.

```bash
make codegen                 # runs every generator (Java/Python/TS models + APIs)
make codegen-java-models     # regenerate just the shared Java DTOs
make codegen-java-api        # regenerate Spring API stubs
make codegen-python-models   # regenerate pydantic models
make codegen-python-api      # regenerate FastAPI stubs (BaseDefaultApi, routers, etc.)
make codegen-react-client    # regenerate the TypeScript fetch client (models + apis)
make codegen-ts-models       # regenerate TypeScript DTOs used by both React and other TS consumers
```

DTOs live under:

| Language | Folder |
| --- | --- |
| Java | `gen/java-models/src/main/java/demo/dto` |
| Python | `gen/python-models/py_models` |
| TypeScript | `gen/ts-models` (synced into `webapp/react-app/src/models` before the Vite dev server starts) |

Spring’s `build-helper-maven-plugin` automatically adds the Java shared folder to the compile classpath, while the FastAPI server runs with `PYTHONPATH=../../gen/python-models` (see the `Makefile`). The React app now consumes the generated fetch client under `webapp/react-app/src/api/` and the shared models under `gen/ts-models/`.

## Runtime prerequisites

* Java 8+ (the project compiles with `maven-compiler-plugin` set to `1.8`)
* Python 3.11 (adjust commands if your interpreter uses a different alias)
* Node 18+
* Podman + Podman Compose (`brew install podman podman-compose`; swap back to Docker Compose if you prefer Docker)
* openapi-generator CLI (7.17.0 or newer) available on your PATH (`brew install openapi-generator` or `npm i -g @openapitools/openapi-generator-cli`) for the codegen targets

Install service deps once:

```bash
cd services/java-app && mvn dependency:go-offline
cd services/python-app && python3.11 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
cd webapp/react-app && npm install
```

## Kafka infrastructure

```bash
make kafka-up    # podman-compose up -d (infra/docker-compose.yml, service names: zookeeper, kafka)
make topics      # infra/scripts/create-topics.sh → podman-compose exec kafka ...
make kafka-down  # podman-compose down
```

## Run the services

```bash
make run-java      # Spring Boot on :8080 (REST + Kafka)
make run-python    # FastAPI on :8000 (REST + Kafka)
make run-web       # React + Vite on :5173 (rsyncs gen/react-api + gen/ts-models into src/ before starting)
```

> Tip: when running the Python service manually, export `PYTHONPATH=../../gen/python-models` and invoke `.venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` so the generated `py_models` package stays on the import path.

## Nx wrappers for Make targets

An Nx workspace mirrors the Makefile so you can run the same tasks via `nx`:

```bash
npm install   # installs Nx locally (required once)

npx nx run repo:codegen
npx nx run repo:codegen-java-models
npx nx run repo:codegen-java-api
npx nx run repo:codegen-python-models
npx nx run repo:codegen-python-api
npx nx run repo:codegen-react-client
npx nx run repo:codegen-ts-models

npx nx run repo:kafka-up
npx nx run repo:topics
npx nx run repo:kafka-down
npx nx run repo:run-java
npx nx run repo:run-python
npx nx run repo:run-web
```

The React form builds `DemoMessage` payloads that exercise every schema feature, including:

* binary upload (base64), enum, UUID, floats/doubles
* null vs empty vs missing for `meta.tags`, `items`, and optional strings (`ValueBadge` UI shows the difference)
* reserved names (`class`, `display-name`, `with space`)

Each POST call pushes to Kafka (`demo.from.java` or `demo.from.python`) and stores a local copy. GET endpoints display:

* Messages submitted to the Java REST controller
* Messages consumed from Python via Kafka
* Messages submitted to the Python REST controller
* Messages consumed from Java via Kafka

## Manual REST smoke tests

```bash
curl -X POST http://localhost:8080/messages/java \
  -H 'Content-Type: application/json' \
  -d @openapi/samples/precision-roundtrip-sample.json

curl -X POST http://localhost:8000/messages/python \
  -H 'Content-Type: application/json' \
  -d @openapi/samples/precision-roundtrip-sample.json

curl http://localhost:8080/messages/java/from-python | jq
curl http://localhost:8000/messages/python/from-java | jq
```

## Demo workflow

1. `make kafka-up && make topics`
2. `make run-java` (port 8080)
3. `make run-python` (port 8000)
4. `make run-web` (port 5173) → use the UI to post payloads to either service and observe the cross-language Kafka flow.

## Swagger / OpenAPI UI

The Spring Boot service bundles SpringDoc. Once `make run-java` is up you can explore and exercise every REST endpoint via Swagger UI at:

- http://localhost:8080/swagger-ui/index.html

The raw JSON document is also available at http://localhost:8080/v3/api-docs if you want to feed other tooling.
