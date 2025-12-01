# DTO Libraries

This directory contains the generated OpenAPI code and packaging configurations for distributing DTOs and APIs as reusable libraries.

## Overview

OpenAPI generators write code directly into these library directories from domain-specific specs in `openapi/*/`:
- `libs/java-lib/src/main/java/com/activate/` - Java models and APIs
- `libs/python-lib/src/activate_api_models/` - Python models and APIs  
- `libs/ts-lib/src/` - TypeScript models and APIs

The build process compiles/packages this generated code without any intermediate copying steps. All domains (e.g., demo, assortment, promo) contribute to the same shared library packages.

> 📖 **For detailed usage examples** of how to consume these libraries in Java, Python, and React applications (including Artifactory configuration), see the "Using the Libraries in Your Applications" section in the main [README.md](../README.md).

## Directory Structure

```
libs/
├── java-lib/       # Maven project for Java JAR distribution
├── python-lib/     # Python package for wheel distribution
└── ts-lib/         # NPM package for TypeScript/React distribution
```

**Library-specific documentation:**
- [java-lib/README.md](java-lib/README.md) - Java library details, Maven configuration, and usage
- [python-lib/README.md](python-lib/README.md) - Python library details, wheel packaging, and usage
- [ts-lib/README.md](ts-lib/README.md) - TypeScript library details, NPM packaging, and usage

## Building Libraries

### Build All Libraries

```bash
make build-libs
```

This will build all three library packages:
- **Java JAR**: `libs/java-lib/target/activate-api-models-1.0.0-SNAPSHOT.jar`
- **Python wheel**: `libs/python-lib/dist/activate_api_models-1.0.0-py3-none-any.whl`
- **TypeScript/NPM**: `libs/ts-lib/dist/` (compiled JavaScript + type definitions)
  - Compiled `.js` files
  - TypeScript declaration files (`.d.ts`)
  - Source maps (`.js.map`)

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
- Receives generated sources directly from OpenAPI generator
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
- Packages: `com.activate.<domain>.models`, `com.activate.<domain>.apis` (e.g., demo, assortment, promo)

### Python Library (`python-lib`)

**What it does:**
- Receives generated sources directly from OpenAPI generator
- Packages into a Python wheel using standard setuptools
- Combines models and API into a single `activate_api_models` package

**Used by:** `services/python-app`

**Build command:**
```bash
cd libs/python-lib
python -m build
```

**Package name:** `activate-api-models` (imports as `activate_api_models`)
**Modules:** `activate_api_models.<domain>.models`, `activate_api_models.<domain>.apis` (e.g., demo, assortment, promo)

**Note:** The code generator creates domain-specific packages (e.g., `activate_api_models.demo`), but the build process patches `setup.cfg` to ensure the wheel name remains `activate_api_models` without domain suffixes. This allows a single wheel to contain models and APIs from all domains.

### TypeScript/React Library (`ts-lib`)

**What it does:**
- Receives generated sources directly from OpenAPI generator
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
**Exports:** Domain-specific paths for organized imports:
- Models: `@activate/api-models/<domain>/models` (e.g., `@activate/api-models/demo/models`)
- APIs: `@activate/api-models/<domain>/apis` (e.g., `@activate/api-models/demo/apis`)
- Runtime utilities: `@activate/api-models/<domain>/runtime`

**Property naming:** TypeScript models use `camelCase` for properties (e.g., `displayName`, `createdAt`) for idiomatic JavaScript/TypeScript usage, even if the OpenAPI schema uses different naming conventions.

## Workflow

### 1. Generate Code

```bash
make codegen           # Generate all domains (e.g., demo, assortment, promo)
make codegen-<domain>  # Generate only a specific domain
```

This generates all code directly into the library directories from OpenAPI specs in `openapi/<domain>/`.

### 2. Build Libraries

```bash
make build-libs
```

This compiles and packages the generated code into distributable libraries.

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

Verify installation:
```bash
ls ~/.m2/repository/com/activate/activate-api-models/1.0.0-SNAPSHOT/
```

### Python: Module not found

Ensure the wheel is built and installed:
```bash
make build-python-lib
make install-python-lib
```

Verify in Python:
```bash
cd services/python-app
source .venv/bin/activate
python -c "import activate_api_models.demo.models; print('OK')"
```

### TypeScript: Cannot find module

Ensure the package is built and installed:
```bash
make build-ts-lib
make install-ts-lib
```

Verify the symlink:
```bash
ls -la webapp/react-app/node_modules/@activate/api-models
```

### Build fails after code regeneration

If you regenerate code and encounter build errors:
```bash
make clean-build    # Clean build artifacts
make build-libs     # Rebuild libraries
make install-libs   # Reinstall to consumer apps
```

## Publishing (Future)

For production deployment, you may want to publish these libraries to:
- **Java**: Private Maven repository or Artifactory
- **Python**: Private PyPI server or Artifactory
- **TypeScript**: Private NPM registry or Artifactory

Update the Makefile targets accordingly for your deployment strategy.
