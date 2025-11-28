ROOT_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
JAVA_LIB_DIR = libs/java-lib
PYTHON_LIB_DIR = libs/python-lib
TS_LIB_DIR = libs/ts-lib
JAVA_SERVICE_DIR = services/java-app
PYTHON_SERVICE_DIR = services/python-app
WEBAPP_DIR = webapp/react-app


codegen-java-models:
	openapi-generator generate \
	  -i openapi/openapi-models.yaml \
	  -g java \
	  -o $(JAVA_LIB_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage,DemoMessage1Items=Item \
	  --global-property models,modelTests=false  \
	  --additional-properties=library=resttemplate,modelPackage=com.activate.models,hideGenerationTimestamp=true,dateLibrary=java8,sourceCompatibility=1.8,targetCompatibility=1.8,useJakartaEe=false

codegen-java-api:
	openapi-generator generate \
	  -i openapi/openapi-api.yaml \
	  -g spring \
	  -o $(JAVA_LIB_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage \
	  --global-property apis,apiTests=false,supportingFiles=ApiUtil.java \
	  --additional-properties=useSpringBoot3=false,interfaceOnly=false,hideGenerationTimestamp=true,dateLibrary=java8,serializationLibrary=jackson,apiPackage=com.activate.apis,modelPackage=com.activate.models,useJakartaEe=false

codegen-python-models:
	openapi-generator generate \
	  -i openapi/openapi-models.yaml \
	  -g python \
	  -o $(PYTHON_LIB_DIR)/src \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage,DemoMessage1Items=Item \
	  --global-property models,modelTests=false \
	  --additional-properties=packageName=activate_api_models

codegen-python-api:
	openapi-generator generate \
	  -i openapi/openapi-api.yaml \
	  -g python-fastapi \
	  -o $(PYTHON_LIB_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage \
	  --global-property apis,supportingFiles,apiTests=false  \
	  --additional-properties=packageName=activate_api_models

codegen-ts-models:
	openapi-generator generate \
	  -i openapi/openapi-models.yaml \
	  -g typescript \
	  -o $(TS_LIB_DIR)/src \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage,DemoMessage1Items=Item \
	  --type-mappings HttpFile=string,binary=string,Date=string,DateTime=string \
	  --global-property models \
	  --additional-properties=modelPropertyNaming=original,supportsES6=true,withSeparateModelsAndApi=true,apiPackage=apis,modelPackage=models


codegen-react-api:
	openapi-generator generate \
	  -i openapi/openapi-api.yaml \
	  -g typescript-fetch \
	  -o $(TS_LIB_DIR)/src \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage \
	  --global-property apis,models,supportingFiles \
	  --additional-properties=modelPropertyNaming=original,supportsES6=true,withSeparateModelsAndApi=true,apiPackage=apis,modelPackage=models

codegen: codegen-java-models codegen-java-api codegen-python-models codegen-python-api codegen-ts-models codegen-react-api

# Clean generated code
clean-codegen:
	@echo "Cleaning generated code..."
	@# Java library - remove generated sources, docs, and OpenAPI artifacts
	rm -rf $(JAVA_LIB_DIR)/src/
	rm -rf $(JAVA_LIB_DIR)/docs/
	rm -rf $(JAVA_LIB_DIR)/.openapi-generator/
	rm -f $(JAVA_LIB_DIR)/.openapi-generator-ignore
	@# Python library - remove entire directory (will be recreated by codegen)
	rm -rf $(PYTHON_LIB_DIR)
	@# TypeScript library - remove generated sources and OpenAPI artifacts
	rm -rf $(TS_LIB_DIR)/src/
	rm -rf $(TS_LIB_DIR)/docs/
	@echo "Generated code cleaned."

# Clean build artifacts
clean-build:
	@echo "Cleaning build artifacts..."
	rm -rf $(JAVA_LIB_DIR)/target/
	rm -rf $(PYTHON_LIB_DIR)/build/ $(PYTHON_LIB_DIR)/dist/ $(PYTHON_LIB_DIR)/src/*.egg-info
	rm -rf $(TS_LIB_DIR)/dist/
	rm -rf $(JAVA_SERVICE_DIR)/target/
	rm -rf $(WEBAPP_DIR)/dist/
	@echo "Build artifacts cleaned."

# Clean everything (generated code + build artifacts)
clean-all: clean-codegen clean-build
	@echo "All cleaned."

# Build library packages
build-java-lib:
	cd libs/java-lib && mvn clean install

build-python-lib:
	@if [ ! -d "$(PYTHON_SERVICE_DIR)/.venv" ]; then \
		echo "Creating Python venv for build..."; \
		cd $(PYTHON_SERVICE_DIR) && python3 -m venv .venv && .venv/bin/pip install --upgrade pip setuptools wheel; \
	fi
	@echo "Building Python library..."
	cd libs/python-lib && rm -rf build dist *.egg-info && ../../$(PYTHON_SERVICE_DIR)/.venv/bin/python -m build

build-ts-lib:
	cd libs/ts-lib && npm install && npm run build

build-libs: build-java-lib build-python-lib build-ts-lib

# Install libraries to consuming applications
install-java-lib: build-java-lib
	@echo "Java library installed to local Maven repository (~/.m2/repository)"

install-python-lib: build-python-lib
	cd $(PYTHON_SERVICE_DIR) && .venv/bin/pip install --force-reinstall ../../libs/python-lib/dist/activate_api_models-1.0.0-py3-none-any.whl

install-ts-lib: build-ts-lib
	cd $(WEBAPP_DIR) && npm install ../../libs/ts-lib

install-libs: install-java-lib install-python-lib install-ts-lib

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
	cd $(PYTHON_SERVICE_DIR) && .venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

run-web:
	cd $(WEBAPP_DIR) && npm install && npm run dev

.PHONY: demo
# Convenience target that prints the recommended order of operations.
demo:
	@echo "1. make kafka-up"
	@echo "2. make topics"
	@echo "3. make run-java | make run-python | make run-web"

.PHONY: codegen codegen-java-models codegen-java-api codegen-python-models codegen-python-api codegen-ts-models codegen-react-api
.PHONY: clean-codegen clean-build clean-all
.PHONY: build-libs build-java-lib build-python-lib build-ts-lib
.PHONY: install-libs install-java-lib install-python-lib install-ts-lib

