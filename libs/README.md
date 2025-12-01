# API & DTO Generated Libraries

This directory contains the generated OpenAPI code and packaging configurations for distributing DTOs and APIs as reusable libraries.

## Overview

OpenAPI generators write code directly into these library directories from domain-specific specs in `openapi/*/`:
- `libs/java-lib/src/main/java/com/activate/` - Java models and APIs
- `libs/python-lib/src/activate_api_models/` - Python models and APIs  
- `libs/ts-lib/src/` - TypeScript models and APIs

The build process compiles/packages this generated code without any intermediate copying steps. All domains (e.g., demo, assortment, promo) contribute to the same shared library packages.

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
