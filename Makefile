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
	  --additional-properties=packageName=activate_api_models


codegen-python-api:
	openapi-generator generate \
	  -i openapi/openapi-api.yaml \
	  -g python-fastapi \
	  -o $(PY_API_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage \
	  --global-property apis,supportingFiles \
	  --additional-properties=packageName=activate_api_models,modelPackage=activate_api_models.models

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


codegen-react-api:
	openapi-generator generate \
	  -i openapi/openapi-api.yaml \
	  -g typescript-fetch \
	  -o $(REACT_API_GEN_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage \
	  --global-property apis,models,supportingFiles

codegen: codegen-java-models codegen-java-api codegen-python-models codegen-python-api codegen-ts-models codegen-react-api

# Build library packages
build-java-lib:
	cd libs/java-lib && mvn clean install

build-python-lib:
	@if [ ! -d "$(PYTHON_SERVICE_DIR)/.venv" ]; then \
		echo "Creating Python venv for build..."; \
		cd $(PYTHON_SERVICE_DIR) && python3 -m venv .venv && .venv/bin/pip install --upgrade pip setuptools wheel; \
	fi
	@echo "Cleaning old Python library artifacts..."
	rm -rf libs/python-lib/src/activate_api_models libs/python-lib/build libs/python-lib/dist libs/python-lib/src/*.egg-info
	mkdir -p libs/python-lib/src/activate_api_models
	cd libs/python-lib && ../../$(PYTHON_SERVICE_DIR)/.venv/bin/python setup.py sdist bdist_wheel

build-ts-lib:
	cd libs/ts-lib && npm install && npm run build

build-libs: build-java-lib build-python-lib build-ts-lib

# Install libraries to consuming applications
install-java-lib: build-java-lib
	@echo "Java library installed to local Maven repository (~/.m2/repository)"
	@echo "Note: For remote repository deployment, use 'make publish-java-lib'"

install-python-lib:
	@echo "Installing Python library..."
	@if [ -f "libs/python-lib/dist/activate_api_models-1.0.0-py3-none-any.whl" ]; then \
		echo "Installing from local wheel..."; \
		cd $(PYTHON_SERVICE_DIR) && .venv/bin/pip install --force-reinstall ../../libs/python-lib/dist/activate_api_models-1.0.0-py3-none-any.whl; \
	else \
		echo "Installing from PyPI..."; \
		cd $(PYTHON_SERVICE_DIR) && .venv/bin/pip install --upgrade activate-api-models; \
	fi

install-ts-lib: build-ts-lib
	cd $(WEBAPP_DIR) && npm install @activate/api-models@latest

install-libs: install-java-lib install-python-lib install-ts-lib

# Publish libraries to registries
publish-java-lib: build-java-lib
	@echo "Publishing Java library to Maven repository..."
	cd libs/java-lib && mvn deploy

publish-python-lib: build-python-lib
	@echo "Publishing Python library to PyPI..."
	@echo "Make sure you have twine installed: pip install twine"
	cd libs/python-lib && python -m twine upload dist/*

publish-ts-lib: build-ts-lib
	@echo "Publishing TypeScript library to npm..."
	cd libs/ts-lib && npm publish

publish-libs: publish-java-lib publish-python-lib publish-ts-lib

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
