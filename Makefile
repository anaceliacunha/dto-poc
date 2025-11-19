ROOT_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
JAVA_MODEL_DIR = gen/java-models
JAVA_API_DIR   = gen/java-api
PY_MODEL_DIR   = gen/python-models
TS_MODEL_GEN_DIR = gen/ts-models
TS_MODEL_DST_DIR = webapp/react-app/src/api
PY_API_DIR     = gen/python-api
REACT_API_GEN_DIR = gen/react-api
REACT_API_DST_DIR  = webapp/react-app/src/api
JAVA_SERVICE_DIR = services/java-app
PYTHON_SERVICE_DIR = services/python-app
WEBAPP_DIR = webapp/react-app


codegen-java-models:
	openapi-generator generate \
	  -i openapi/openapi-models.yaml \
	  -g java \
	  -o $(JAVA_MODEL_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage,DemoMessage1Items=Item \
	  --global-property models  \
	  --additional-properties=library=resttemplate,modelPackage=demo.dto,hideGenerationTimestamp=true,dateLibrary=java8,sourceCompatibility=1.8,targetCompatibility=1.8,useJakartaEe=false

codegen-java-api:
	openapi-generator generate \
	  -i openapi/openapi-api.yaml \
	  -g spring \
	  -o $(JAVA_API_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage \
	  --global-property apis,supportingFiles=ApiUtil.java \
	  --additional-properties=useSpringBoot3=false,interfaceOnly=false,hideGenerationTimestamp=true,dateLibrary=java8,serializationLibrary=jackson,packageName=demo.api,modelPackage=demo.dto,useJakartaEe=false

codegen-python-models:
	openapi-generator generate \
	  -i openapi/openapi-models.yaml \
	  -g python \
	  -o $(PY_MODEL_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage,DemoMessage1Items=Item \
	  --global-property models \
	  --additional-properties=packageName=py_models


codegen-python-api:
	openapi-generator generate \
	  -i openapi/openapi-api.yaml \
	  -g python-fastapi \
	  -o $(PY_API_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage \
	  --global-property apis,supportingFiles \
	  --additional-properties=packageName=kafka_api,modelPackage=py_models.models

codegen-ts-models:
	openapi-generator generate \
	  -i openapi/openapi-models.yaml \
	  -g typescript \
	  -o $(TS_MODEL_GEN_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage,DemoMessage1Items=Item \
	  --type-mappings HttpFile=string,binary=string,Date=string,DateTime=string \
	  --import-mappings HttpFile=string \
	  --global-property models,supportingFiles \
	  --additional-properties=modelPropertyNaming=original,supportsES6=true


codegen-react-client:
	openapi-generator generate \
	  -i openapi/openapi-api.yaml \
	  -g typescript-fetch \
	  -o $(REACT_API_GEN_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage \
	  --global-property apis,models,supportingFiles

codegen: codegen-java-models codegen-java-api codegen-python-models codegen-python-api codegen-ts-models codegen-react-client

kafka-up:
	cd infra && podman-compose up -d

kafka-down:
	cd infra && podman-compose down

.PHONY: topics
topics:
	cd infra && ./scripts/create-topics.sh

run-java:
	cd $(JAVA_SERVICE_DIR) && mvn spring-boot:run

run-python:
	cd $(PYTHON_SERVICE_DIR) && PYTHONPATH=../../gen/python-models:../../gen/python-api/src .venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

run-web:
	mkdir -p $(REACT_API_DST_DIR)
	rsync -a --delete $(REACT_API_GEN_DIR)/ $(REACT_API_DST_DIR)/
	cd $(WEBAPP_DIR) && npm install && npm run dev

.PHONY: demo
# Convenience target that prints the recommended order of operations.
demo:
	@echo "1. make kafka-up"
	@echo "2. make topics"
	@echo "3. make run-java | make run-python | make run-web"
