# DTO Libraries

This directory contains packaging configurations for distributing the generated DTOs and APIs as reusable libraries.

## Overview

The `gen/` folder contains auto-generated code from OpenAPI specifications. Since this code is frequently regenerated and deleted, we use the `libs/` folder to maintain stable packaging configurations that copy from `gen/` during the build process.

## Directory Structure

```
libs/
├── java-lib/       # Maven project for Java JAR distribution
├── python-lib/     # Python package for wheel distribution
└── ts-lib/         # NPM package for TypeScript/React distribution
```

## Building Libraries

### Build All Libraries

```bash
make build-libs
```

This will build all three library packages:
- `libs/java-lib/target/activate-api-models-1.0.0-SNAPSHOT.jar`
- `libs/python-lib/dist/activate_api_models-1.0.0-py3-none-any.whl`
- `libs/ts-lib/dist/` (compiled TypeScript)

### Build Individual Libraries

```bash
make build-java-lib      # Build Java JAR
make build-python-lib    # Build Python wheel
make build-ts-lib        # Build NPM package
```

## Installing Libraries

### Install All Libraries to Consumer Applications

```bash
make install-libs
```

### Install Individual Libraries

```bash
make install-java-lib    # Install to ~/.m2/repository
make install-python-lib  # Install wheel to Python service
make install-ts-lib      # Install NPM package to React app
```

## Library Details

### Java Library (`java-lib`)

**What it does:**
- Copies sources from `gen/java-models` and `gen/java-api` during build
- Packages into a single JAR with Maven
- Installs to local Maven repository

**Used by:** `services/java-app`

**Build command:**
```bash
cd libs/java-lib
mvn clean install
```

**Artifact:**
- GroupId: `com.activate`
- ArtifactId: `activate-api-models`
- Version: `1.0.0-SNAPSHOT`

### Python Library (`python-lib`)

**What it does:**
- Copies sources from `gen/python-models` and `gen/python-api` during build
- Packages into a Python wheel
- Combines models and API into a single `activate_api_models` package

**Used by:** `services/python-app`

**Build command:**
```bash
cd libs/python-lib
python -m build
```

**Package name:** `activate-api-models` (imports as `activate_api_models`)

### TypeScript/React Library (`ts-lib`)

**What it does:**
- Copies sources from `gen/ts-models` and `gen/react-api` during build
- Compiles TypeScript to JavaScript
- Generates type definitions
- Creates an NPM package

**Used by:** `webapp/react-app`

**Build command:**
```bash
cd libs/ts-lib
npm install
npm run build
```

**Package name:** `@activate/api-models`

## Workflow

### 1. Generate Code

```bash
make codegen
```

This regenerates all code in the `gen/` folder from OpenAPI specs.

### 2. Build Libraries

```bash
make build-libs
```

This packages the generated code into distributable libraries.

### 3. Install Libraries

```bash
make install-libs
```

This installs the libraries to the consumer applications.

### 4. Run Applications

```bash
make run-java     # Java service (uses JAR from Maven repo)
make run-python   # Python service (uses installed wheel)
make run-web      # React app (uses NPM package)
```

## Version Management

All three libraries use version `1.0.0` (or `1.0.0-SNAPSHOT` for Java). When you need to update versions:

1. **Java**: Update `<version>` in `libs/java-lib/pom.xml` and `services/java-app/pom.xml`
2. **Python**: Update `version` in `libs/python-lib/pyproject.toml` and `services/python-app/requirements.txt`
3. **TypeScript**: Update `version` in `libs/ts-lib/package.json`

## Dependencies

Each library manages its own dependencies:

- **Java**: Dependencies defined in `libs/java-lib/pom.xml`
- **Python**: Dependencies in `libs/python-lib/pyproject.toml`
- **TypeScript**: Dependencies in `libs/ts-lib/package.json`

## Troubleshooting

### Java: Library not found

Ensure the JAR is installed to your local Maven repository:
```bash
make install-java-lib
```

### Python: Module not found

Ensure the wheel is installed in your virtual environment:
```bash
cd services/python-app
source .venv/bin/activate
pip install ../../libs/python-lib/dist/activate_api_models-1.0.0-py3-none-any.whl
```

### TypeScript: Cannot find module

Ensure the package is installed:
```bash
cd webapp/react-app
npm install
```

## Publishing (Future)

For production deployment, you may want to publish these libraries to:
- **Java**: Private Maven repository or Artifactory
- **Python**: Private PyPI server or Artifactory
- **TypeScript**: Private NPM registry or Artifactory

Update the Makefile targets accordingly for your deployment strategy.
