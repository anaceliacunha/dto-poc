ROOT_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
JAVA_LIB_DIR = libs/java-lib
PYTHON_LIB_DIR = libs/python-lib
TS_LIB_DIR = libs/ts-lib
JAVA_SERVICE_DIR = services/java-app
PYTHON_SERVICE_DIR = services/python-app
WEBAPP_DIR = webapp/react-app

# Include modular makefiles for different universes
include makefiles/demo.mk

# Full install: clean, codegen, build, and install all libraries
install: clean-all codegen build-libs install-libs
	@echo "Complete installation finished."

# Generate all code across all universes
codegen: codegen-demo

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

.PHONY: codegen
.PHONY: clean-codegen clean-build clean-all
.PHONY: build-libs build-java-lib build-python-lib build-ts-lib
.PHONY: install-libs install-java-lib install-python-lib install-ts-lib

