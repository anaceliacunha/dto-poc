# Multi Language OpenAPI 3.1 Demo

This workspace wires two OpenAPI 3.1 specs into React, Spring Boot 2.7 (Java 8 compatible), FastAPI, and Kafka. DTOs generated from *either* spec are forced into the same shared folders so that REST + Kafka traffic never drifts between languages.

```
dto-poc/
├─ openapi/
│  └─ demo/                      ← Demo domain schemas
│     ├─ demo-api.yaml           ← REST endpoints + $ref schemas
│     ├─ demo-models.yaml        ← Only shared schemas
│     ├─ schemas/*.schema.json   ← Draft 2020-12 JSON Schemas
│     └─ samples/*.json          ← Null / empty / precision payloads
├─ makefiles/
│  └─ demo.mk                    ← Demo domain codegen targets
├─ libs/                         ← Packaged libraries (OpenAPI generates directly here)
│  ├─ java-lib/                  ← Maven project with generated code
│  │  └─ src/main/java/com/activate/
│  │     ├─ apis/                ← Generated API classes
│  │     └─ models/              ← Generated model classes
│  ├─ python-lib/                ← Python package with generated code
│  │  └─ src/activate_api_models/
│  │     ├─ apis/                ← Generated API classes
│  │     └─ models/              ← Generated model classes
│  └─ ts-lib/                    ← NPM package with generated code
│     └─ src/
│        ├─ apis/                ← Generated API classes
│        ├─ models/              ← Generated model classes
│        └─ api/                 ← React API client
├─ services/
│  ├─ java-app/      ← Spring Boot REST + Kafka (uses activate-api-models JAR)
│  └─ python-app/    ← FastAPI REST + Kafka (uses activate-api-models wheel)
├─ webapp/react-app/ ← React + Vite UI (uses @activate/api-models NPM package)
└─ infra/            ← Kafka + Zookeeper via Podman Compose
```

## OpenAPI + JSON Schema

* `openapi/demo/schemas/demo-message.schema.json` and `item.schema.json` use Draft 2020-12 and include all the exotic properties (binary, enums, unions, language restricted names, nullables, nested metrics, etc.).
* `openapi/demo/demo-models.yaml` exposes components only. `openapi/demo/demo-api.yaml` imports the same schemas and adds `/messages/java` + `/messages/python` REST paths.
* Sample payloads under `openapi/demo/samples/` prove the null/empty/missing combinations that everything must handle.

## Code generation

The `Makefile` orchestrates code generation across multiple domains. Each domain has its own makefile in `makefiles/` (e.g., `demo.mk`) that defines language-specific targets. The main `Makefile` includes these modular files and provides top-level aggregation.

Code generation applies explicit `--inline-schema-name-mappings` across every language target. This guarantees that anchors such as `DemoMessage` and `Item` never spawn `DemoMessage1`, `Item_1`, etc., keeping DTO names consistent in Java, Python, and TypeScript.

```bash
make codegen                     # runs all domain generators (currently: demo)
make codegen-demo                # generate all demo code (Java/Python/TS models + APIs)
make codegen-demo-java           # generate demo Java code (models + API)
make codegen-demo-python         # generate demo Python code (models + API)
make codegen-demo-ts             # generate demo TypeScript code (models + API)
make codegen-demo-java-models    # regenerate Java models in libs/java-lib/src/main/java/com/activate/models/
make codegen-demo-java-api       # regenerate Spring APIs in libs/java-lib/src/main/java/com/activate/apis/
make codegen-demo-python-models  # regenerate Python models in libs/python-lib/src/activate_api_models/models/
make codegen-demo-python-api     # regenerate FastAPI in libs/python-lib/src/activate_api_models/apis/
make codegen-demo-ts-models      # regenerate TypeScript models in libs/ts-lib/src/models/
make codegen-demo-react-api      # regenerate React API client in libs/ts-lib/src/apis/
```

**Adding new domains:** Create a new makefile (e.g., `makefiles/assortment.mk`) with domain-specific targets, then add `include makefiles/assortment.mk` to the main `Makefile` and update the `codegen` target to include `codegen-assortment`.

Generated code locations:

| Language | Package | Directory |
| --- | --- | --- |
| Java | com.activate.models | `libs/java-lib/src/main/java/com/activate/models/` |
| Java | com.activate.apis | `libs/java-lib/src/main/java/com/activate/apis/` |
| Python | activate_api_models.models | `libs/python-lib/src/activate_api_models/models/` |
| Python | activate_api_models.apis | `libs/python-lib/src/activate_api_models/apis/` |
| TypeScript | @activate/api-models | `libs/ts-lib/src/models/` |
| TypeScript | @activate/api-models/api | `libs/ts-lib/src/api/` |

**How services consume the DTOs:**
- **Java**: Uses the packaged JAR as a Maven dependency (`com.activate:activate-api-models`) from local Maven repository (or remote Maven repository after publishing)
- **Python**: Uses the packaged wheel as a pip package (`activate-api-models`), imports as `activate_api_models` (can install from local wheel or PyPI)
- **React**: Uses the NPM library from npm registry (`@activate/api-models`)

See `libs/README.md` for details on the library packaging system.

## Runtime prerequisites

* Java 8+ (the project compiles with `maven-compiler-plugin` set to `1.8`)
* Python 3.11 (adjust commands if your interpreter uses a different alias)
* Node 18+
* Podman + Podman Compose (`brew install podman podman-compose`; swap back to Docker Compose if you prefer Docker)
* openapi-generator CLI (7.17.0 or newer) available on your PATH (`brew install openapi-generator` or `npm i -g @openapitools/openapi-generator-cli`) for the codegen targets
* npm account with publish access (for publishing `@activate/api-models` to npm registry)
* PyPI account with publish access (optional, for publishing Python library)
* Maven repository access (optional, for publishing Java library to remote repository)

After generating code, build and publish the libraries:

```bash
make codegen        # Generate code from OpenAPI specs
make build-libs     # Package into JAR, wheel, and NPM package
make publish-ts-lib # Publish TypeScript library to npm (requires npm login)
make publish-python-lib # (Optional) Publish Python library to PyPI (requires twine and PyPI credentials)
make publish-java-lib   # (Optional) Publish Java library to Maven repository
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

## Installing service dependencies

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

## Manual REST smoke tests

```bash
curl -X POST http://localhost:8080/messages/java \
  -H 'Content-Type: application/json' \
  -d @openapi/demo/samples/precision-roundtrip-sample.json

curl -X POST http://localhost:8000/messages/python \
  -H 'Content-Type: application/json' \
  -d @openapi/demo/samples/precision-roundtrip-sample.json

curl http://localhost:8080/messages/java/from-python | jq
curl http://localhost:8000/messages/python/from-java | jq
```

## Demo workflow

1. `make kafka-up && make topics`
2. `make codegen` (if not already done)
3. `make build-libs` (build all libraries)
4. **Optional publishing:**
   - `make publish-ts-lib` (publish TypeScript library to npm - requires npm login)
   - `make publish-python-lib` (publish Python library to PyPI - requires twine and credentials)
   - `make publish-java-lib` (publish Java library to Maven repository - requires repository configuration)
5. `make install-libs` (install libraries: Java from local Maven, Python from local wheel or PyPI, TypeScript from npm)
6. `make run-java` (port 8080)
7. `make run-python` (port 8000)
8. `make run-web` (port 5173) → use the UI to post payloads to either service and observe the cross-language Kafka flow.

**Notes:** 
- TypeScript library requires publishing to npm before webapp can install it
- Python library can install from local wheel (default) or PyPI (after publishing)
- Java library uses local Maven repository by default
- For local development without publishing TypeScript: `cd webapp/react-app && npm install ../../libs/ts-lib`

## Swagger / OpenAPI UI

The Spring Boot service bundles SpringDoc. Once `make run-java` is up you can explore and exercise every REST endpoint via Swagger UI at:

- http://localhost:8080/swagger-ui/index.html

The raw JSON document is also available at http://localhost:8080/v3/api-docs if you want to feed other tooling.
