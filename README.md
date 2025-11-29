# Multi Language OpenAPI 3.1 Demo

This workspace wires two OpenAPI 3.1 specs into React, Spring Boot 2.7 (Java 8 compatible), FastAPI, and Kafka. DTOs generated from *either* spec are forced into the same shared folders so that REST + Kafka traffic never drifts between languages.

```
dto-poc/
├─ openapi/
│  └─ <domain>/                  ← Domain-specific schemas (e.g., demo, assortment, promo)
│     ├─ <domain>-api.yaml       ← REST endpoints + $ref schemas
│     ├─ <domain>-models.yaml    ← Only shared schemas
│     ├─ schemas/*.schema.json   ← Draft 2020-12 JSON Schemas
│     └─ samples/*.json          ← Null / empty / precision payloads
├─ makefiles/
│  └─ <domain>.mk                ← Domain-specific codegen targets (e.g., demo.mk, assortment.mk)
├─ libs/                         ← Packaged libraries (OpenAPI generates directly here)
│  ├─ java-lib/                  ← Maven project with generated code
│  │  └─ src/main/java/com/activate/<domain>/
│  │     ├─ apis/                ← Generated API classes
│  │     └─ models/              ← Generated model classes
│  ├─ python-lib/                ← Python package with generated code
│  │  └─ src/activate_api_models/<domain>/
│  │     ├─ apis/                ← Generated API classes
│  │     └─ models/              ← Generated model classes
│  └─ ts-lib/                    ← NPM package with generated code
│     └─ src/<domain>/
│        ├─ apis/                ← Generated API classes
│        ├─ models/              ← Generated model classes
│        ├─ runtime.ts           ← Runtime utilities
│        └─ index.ts             ← Domain exports
├─ services/
│  ├─ java-app/      ← Spring Boot REST + Kafka (uses activate-api-models JAR)
│  └─ python-app/    ← FastAPI REST + Kafka (uses activate-api-models wheel)
├─ webapp/react-app/ ← React + Vite UI (uses @activate/api-models NPM package)
└─ infra/            ← Kafka + Zookeeper via Podman Compose
```

## OpenAPI + JSON Schema

* `openapi/<domain>/schemas/*.schema.json` use Draft 2020-12 and can include all the exotic properties (binary, enums, unions, language-restricted names, nullables, nested metrics, etc.).
* `openapi/<domain>/<domain>-models.yaml` exposes components only. `openapi/<domain>/<domain>-api.yaml` imports the same schemas and adds REST paths.
* Sample payloads under `openapi/<domain>/samples/` prove the null/empty/missing combinations that everything must handle.

## Code generation

The `Makefile` orchestrates code generation across multiple domains. Each domain has its own makefile in `makefiles/` (e.g., `demo.mk`) that defines language-specific targets. The main `Makefile` includes these modular files and provides top-level aggregation.

Code generation applies explicit `--inline-schema-name-mappings` across every language target. This guarantees that anchors such as `DemoMessage` and `Item` never spawn `DemoMessage1`, `Item_1`, etc., keeping DTO names consistent in Java, Python, and TypeScript.

```bash
make codegen                        # runs all domain generators (e.g., demo, assortment, promo)
make codegen-<domain>               # generate all code for a specific domain (Java/Python/TS models + APIs)
make codegen-<domain>-java          # generate domain Java code (models + API)
make codegen-<domain>-python        # generate domain Python code (models + API)
make codegen-<domain>-ts            # generate domain TypeScript code (models + API)
make codegen-<domain>-java-models   # regenerate Java models in libs/java-lib/src/main/java/com/activate/<domain>/models/
make codegen-<domain>-java-api      # regenerate Spring APIs in libs/java-lib/src/main/java/com/activate/<domain>/apis/
make codegen-<domain>-python-models # regenerate Python models in libs/python-lib/src/activate_api_models/<domain>/models/
make codegen-<domain>-python-api    # regenerate FastAPI in libs/python-lib/src/activate_api_models/<domain>/apis/
make codegen-<domain>-ts-models     # regenerate TypeScript models in libs/ts-lib/src/<domain>/models/
make codegen-<domain>-react-api     # regenerate React API client in libs/ts-lib/src/<domain>/apis/
```

**Adding new domains:** Create a new makefile (e.g., `makefiles/<domain>.mk`) with domain-specific targets, then add `include makefiles/<domain>.mk` to the main `Makefile` and update the `codegen` target to include `codegen-<domain>`.

Generated code locations:

| Language | Package | Directory |
| --- | --- | --- |
| Java | com.activate.<domain>.models | `libs/java-lib/src/main/java/com/activate/<domain>/models/` |
| Java | com.activate.<domain>.apis | `libs/java-lib/src/main/java/com/activate/<domain>/apis/` |
| Python | activate_api_models.<domain>.models | `libs/python-lib/src/activate_api_models/<domain>/models/` |
| Python | activate_api_models.<domain>.apis | `libs/python-lib/src/activate_api_models/<domain>/apis/` |
| TypeScript | @activate/api-models/<domain>/models | `libs/ts-lib/src/<domain>/models/` |
| TypeScript | @activate/api-models/<domain>/apis | `libs/ts-lib/src/<domain>/apis/` |

**How services consume the DTOs:**
- **Java**: Uses the packaged JAR as a Maven dependency (`com.activate:activate-api-models`)
- **Python**: Uses the packaged wheel as a pip package (`activate-api-models`), imports as `activate_api_models`
- **React**: Uses the packaged NPM library (`@activate/api-models`)

See `libs/README.md` for details on the library packaging system.

## Runtime prerequisites

* Java 8+ (the project compiles with `maven-compiler-plugin` set to `1.8`)
* Python 3.11 (adjust commands if your interpreter uses a different alias)
* Node 18+
* Podman + Podman Compose (`brew install podman podman-compose`; swap back to Docker Compose if you prefer Docker)
* openapi-generator CLI (7.17.0 or newer) available on your PATH (`brew install openapi-generator` or `npm i -g @openapitools/openapi-generator-cli`) for the codegen targets

After generating code, build and install the libraries:

```bash
make codegen        # Generate code from OpenAPI specs
make build-libs     # Package into JAR, wheel, and NPM package
make install-libs   # Install to consuming applications
```

Or use the all-in-one command:

```bash
make install        # Clean all, codegen, build, and install libraries
```

## Clean commands

```bash
make clean-codegen  # Remove all generated OpenAPI code (Java, Python, TypeScript)
make clean-build    # Remove build artifacts (target/, dist/, build/)
make clean-all      # Run both clean-codegen and clean-build
```

**Note:** The Python library directory (`libs/python-lib/`) is entirely generated and will be recreated by `make codegen`. The `clean-codegen` target removes it completely.

## Demo

### Kafka infrastructure

```bash
make kafka-up    # podman-compose up -d (infra/docker-compose.yml, service names: zookeeper, kafka)
make topics      # infra/scripts/create-topics.sh → podman-compose exec kafka ...
make kafka-down  # podman-compose down
```

### Run the services

```bash
make run-java      # Spring Boot on :8080 (uses activate-api-models JAR from Maven repo)
make run-python    # FastAPI on :8000 (uses activate-api-models wheel package)
make run-web       # React + Vite on :5173 (uses @activate/api-models NPM package)
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

### Manual REST smoke tests

```bash
curl -X POST http://localhost:8080/demo/messages/java \
  -H 'Content-Type: application/json' \
  -d @openapi/demo/samples/precision-roundtrip-sample.json

curl -X POST http://localhost:8000/demo/messages/python \
  -H 'Content-Type: application/json' \
  -d @openapi/demo/samples/precision-roundtrip-sample.json

curl http://localhost:8080/demo/messages/java/from-python | jq
curl http://localhost:8000/demo/messages/python/from-java | jq
```

### Workflow

1. `make kafka-up && make topics`
2. `make install` (runs clean-all, codegen, build-libs, install-libs - use this for first time setup or after spec changes)
3. `make run-java` (port 8080)
4. `make run-python` (port 8000)
5. `make run-web` (port 5173) → use the UI to post payloads to either service and observe the cross-language Kafka flow.

### Swagger / OpenAPI UI

The Spring Boot service bundles SpringDoc. Once `make run-java` is up you can explore and exercise every REST endpoint via Swagger UI at:

- http://localhost:8080/swagger-ui/index.html

The raw JSON document is also available at http://localhost:8080/v3/api-docs if you want to feed other tooling.
