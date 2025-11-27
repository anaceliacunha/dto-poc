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

**Publish command:**
```bash
cd libs/python-lib
python -m twine upload dist/*
```

**Package name:** `activate-api-models` (imports as `activate_api_models`)

**Registry:** PyPI or private PyPI server (optional)

### TypeScript/React Library (`ts-lib`)

**What it does:**
- Copies sources from `gen/ts-models` and `gen/react-api` during build
- Compiles TypeScript to JavaScript
- Generates type definitions
- Creates an NPM package
- Publishes to npm registry

**Used by:** `webapp/react-app`

**Build command:**
```bash
cd libs/ts-lib
npm install
npm run build
```

**Publish command:**
```bash
cd libs/ts-lib
npm publish
```

**Package name:** `@activate/api-models`

**Registry:** npm public registry (requires authentication)

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

### 3. Publish Libraries (Optional)

**Publish TypeScript to npm (Required for webapp):**
```bash
make publish-ts-lib
```

**Publish Python to PyPI (Optional):**
```bash
make publish-python-lib
```

**Publish Java to Maven repository (Optional):**
```bash
make publish-java-lib
```

**Publish all:**
```bash
make publish-libs
```

These publish the libraries to their respective registries. TypeScript publishing is required for the webapp to install it. Python and Java can continue using local installations.

### 4. Install Libraries

```bash
make publish-ts-lib
```

This publishes the TypeScript library to the npm registry. You must be logged in with `npm login` first.

### 4. Install Libraries

```bash
make install-libs
```

This installs the libraries to the consumer applications:
- Java: Installs JAR to local Maven repository (~/.m2/repository)
- Python: Installs wheel to Python service virtual environment
- TypeScript: Installs from npm registry (@activate/api-models)

### 5. Run Applications

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

**Option 1: Local wheel installation (default)**
```bash
make build-python-lib
make install-python-lib
```

**Option 2: Install from PyPI (after publishing)**
```bash
cd services/python-app
.venv/bin/pip install --upgrade activate-api-models
```

Or delete the local wheel to force PyPI installation:
```bash
rm -rf libs/python-lib/dist/activate_api_models-1.0.0-py3-none-any.whl
make install-python-lib  # Will install from PyPI
```

### TypeScript: Cannot find module

The TypeScript library is now published to npm. Ensure you've published it first:
```bash
make publish-ts-lib
```

Then install it:
```bash
cd webapp/react-app
npm install @activate/api-models@latest
```

For local development without publishing, you can temporarily use the local version:
```bash
cd webapp/react-app
npm install ../../libs/ts-lib
```

## Publishing

### TypeScript Library to npm

**Prerequisites:**
1. npm account with publish access
2. Logged in: `npm login`
3. Package built: `make build-ts-lib`

**Publish:**
```bash
make publish-ts-lib
```

This publishes the TypeScript library to the npm public registry.

**Version Updates:**
Update the version in `libs/ts-lib/package.json` before publishing a new version.

### Python Library to PyPI

**Prerequisites:**
1. PyPI account
2. `twine` installed: `pip install twine`
3. Configured credentials in `~/.pypirc` or use `python -m twine upload --username __token__ --password <your-token>`
4. Package built: `make build-python-lib`

**Publish:**
```bash
make publish-python-lib
```

This publishes `activate-api-models` to PyPI.

**Version Updates:**
Update the version in `libs/python-lib/pyproject.toml` before publishing.

**Installation after publishing:**
```bash
cd services/python-app
.venv/bin/pip install --upgrade activate-api-models
```

### Java Library to Maven Repository

**Prerequisites:**
1. Maven repository access (Nexus, Artifactory, or similar)
2. Repository configuration in `~/.m2/settings.xml` with server credentials
3. `distributionManagement` section in `libs/java-lib/pom.xml` (configure your repository URL)
4. Package built: `make build-java-lib`

**Publish:**
```bash
make publish-java-lib
```

This runs `mvn deploy` to publish the library to your configured Maven repository.

**Version Updates:**
Update the version in `libs/java-lib/pom.xml` before publishing.

**Note:** Java library currently uses local Maven repository by default. Publishing to remote repository requires additional pom.xml configuration (not included to avoid conflicts with local development).

### All Libraries

**Publish everything:**
```bash
make publish-libs
```

This publishes Java, Python, and TypeScript libraries in sequence.

## Previous Publishing Section (Deprecated)

For production deployment, you may want to publish these libraries to:
- **Java**: Private Maven repository, Maven Central, or Artifactory
- **Python**: PyPI, private PyPI server, or Artifactory
- **TypeScript**: npm registry (already implemented)

Update the Makefile targets accordingly for your deployment strategy.

**Note:** Publishing capabilities are now implemented. See the "Publishing" section above for current instructions.
