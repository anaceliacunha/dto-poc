JAVA_MODEL_DIR = gen/java-models
JAVA_API_DIR   = gen/java-api
PY_MODEL_DIR   = gen/python-models
PY_API_DIR     = gen/python-api
TS_MODEL_DIR   = gen/ts-models
JAVA_SERVICE_DIR = services/java-app
PYTHON_SERVICE_DIR = services/python-app
WEBAPP_DIR = webapp/react-app

codegen-java-models:
	openapi-generator-cli generate \
	  -i openapi/openapi-models.yaml \
	  -g java \
	  -o $(JAVA_MODEL_DIR) \
	  --global-property models \
	  --additional-properties=modelPackage=demo.dto,hideGenerationTimestamp=true,dateLibrary=java8,serializationLibrary=jackson,sourceCompatibility=1.8,targetCompatibility=1.8,useJakartaEe=false

codegen-java-api:
	openapi-generator-cli generate \
	  -i openapi/openapi-api.yaml \
	  -g spring \
	  -o $(JAVA_API_DIR) \
	  --global-property apis,supportingFiles \
	  --additional-properties=useSpringBoot3=false,interfaceOnly=false,hideGenerationTimestamp=true,dateLibrary=java8,serializationLibrary=jackson,packageName=demo.api,modelPackage=demo.dto,useJakartaEe=false

codegen-python-models:
	openapi-generator-cli generate \
	  -i openapi/openapi-models.yaml \
	  -g python-pydantic \
	  -o $(PY_MODEL_DIR) \
	  --global-property models \
	  --additional-properties=packageName=py_models

codegen-python-api:
	openapi-generator-cli generate \
	  -i openapi/openapi-api.yaml \
	  -g python-fastapi \
	  -o $(PY_API_DIR) \
	  --global-property apis,supportingFiles \
	  --additional-properties=packageName=kafka_api,modelPackage=py_models

codegen-ts-models:
	openapi-generator-cli generate \
	  -i openapi/openapi-models.yaml \
	  -g typescript-fetch \
	  -o $(TS_MODEL_DIR) \
	  --global-property models \
	  --additional-properties=supportsES6=true,npmName=ts-models-with-api,modelPropertyNaming=original,typescriptThreePlus=true

codegen: codegen-java-models codegen-java-api codegen-python-models codegen-python-api codegen-ts-models

kafka-up:
	podman-compose -f infra/podman-compose.yml up -d

kafka-down:
	podman-compose -f infra/podman-compose.yml down

.PHONY: topics
topics:
	cd infra && ./scripts/create-topics.sh

run-java:
	cd $(JAVA_SERVICE_DIR) && mvn spring-boot:run

run-python:
	cd $(PYTHON_SERVICE_DIR) && PYTHONPATH=../../gen/python-models .venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

run-web:
	cd $(WEBAPP_DIR) && npm install && npm run dev

