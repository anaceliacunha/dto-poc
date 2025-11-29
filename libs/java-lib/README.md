# Activate API Models for Java

This library contains auto-generated DTO models and API classes for Java applications, generated directly from OpenAPI specifications.

## Package Structure

```
src/main/java/com/activate/
└── demo/
    ├── models/         # Generated model classes (DemoMessage, Item, etc.)
    └── apis/           # Generated API interfaces (DefaultApi, ApiUtil, etc.)
```

Additional domains (e.g., assortment, promo) will be organized similarly under `com.activate.{domain}/`.

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

Then use the models and APIs:

```java
import com.activate.demo.models.DemoMessage;
import com.activate.demo.models.Item;
import com.activate.demo.apis.DefaultApi;

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
make codegen-java-models  # Generates models in com.activate.models
make codegen-java-api     # Generates APIs in com.activate.apis
```

No manual copying or build helper plugins are required. Maven compiles the generated code directly from `src/main/java/`.

## Dependencies

This library includes all necessary dependencies for the generated code:
- Jackson for JSON serialization
- Spring Framework (for API interfaces)
- Swagger/OpenAPI annotations
- Validation API
