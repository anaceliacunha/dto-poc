# Activate API Models for Java

This library contains auto-generated DTO models and API classes for Java applications, generated directly from OpenAPI specifications.

## Package Structure

```
src/main/java/com/activate/
└── <domain>/           # Domain-specific package (e.g., demo, assortment, promo)
    ├── models/         # Generated model classes
    └── apis/           # Generated API interfaces
```

All domains follow the same structure under `com.activate.<domain>/`.

## Installation

This library is installed to your local Maven repository using:
```bash
mvn clean install
```

## Usage in Consumer Projects

Add the dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>com.activate</groupId>
    <artifactId>activate-api-models</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

Then import and use the models and APIs for your domain:

```java
import com.activate.<domain>.models.*;
import com.activate.<domain>.apis.*;

// Use the models and API
```

## Build

The OpenAPI generator writes code directly into `src/main/java/com/activate/{domain}/`. To build the JAR:

```bash
mvn clean install
```

The JAR will be installed to your local Maven repository (`~/.m2/repository/com/activate/activate-api-models/`).

## Development

Code is generated directly from OpenAPI specs using:
```bash
make codegen-<domain>-java-models  # Generates models in com.activate.<domain>.models
make codegen-<domain>-java-api     # Generates APIs in com.activate.<domain>.apis
```

No manual copying or build helper plugins are required. Maven compiles the generated code directly from `src/main/java/`.

## Generated vs Custom Code

- **Generated (will be overwritten):**
  - `src/main/java/com/activate/<domain>/models/` - Model DTOs
  - `src/main/java/com/activate/<domain>/apis/` - API interfaces and controllers
  - `src/main/java/org/openapitools/` - OpenAPI utilities
  - `docs/` - API documentation

- **Custom (preserved):**
  - This `README.md` file
  - `pom.xml` - Maven configuration

## Dependencies

This library includes all necessary dependencies for the generated code:
- Jackson for JSON serialization
- Spring Framework (for API interfaces)
- Swagger/OpenAPI annotations
- Validation API

See `pom.xml` for the complete dependency list.
