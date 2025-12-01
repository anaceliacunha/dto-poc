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

## Artifact Coordinates

- **GroupId**: `com.activate`
- **ArtifactId**: `activate-api-models`
- **Version**: `1.0.0-SNAPSHOT`
- **Packages**: `com.activate.<domain>.models`, `com.activate.<domain>.apis` (e.g., demo, assortment, promo)

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
```

### Using Models

```java
import com.activate.<domain>.models.ModelName;
import com.activate.<domain>.models.EnumName;
import com.fasterxml.jackson.databind.ObjectMapper;

// Create and populate a model
ModelName model = new ModelName();
model.setId(1L);
model.setName("Example");
model.setStatus(EnumName.VALUE);

// Models work with Jackson for JSON serialization
ObjectMapper mapper = new ObjectMapper();
String json = mapper.writeValueAsString(model);
ModelName deserialized = mapper.readValue(json, ModelName.class);
```

### Implementing API Controllers (Spring Boot)

The generated API classes provide controller stubs that you extend:

```java
import com.activate.<domain>.apis.YourApiController;
import com.activate.<domain>.models.ModelName;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.NativeWebRequest;
import javax.validation.Valid;
import java.util.List;

@RestController
public class MyController extends YourApiController {

    public MyController(NativeWebRequest nativeWebRequest) {
        super(nativeWebRequest);
    }

    @Override
    public ResponseEntity<Void> createModel(@Valid ModelName model) {
        // Your business logic here
        return ResponseEntity.accepted().build();
    }

    @Override
    public ResponseEntity<List<ModelName>> listModels() {
        // Your business logic here
        return ResponseEntity.ok(yourDataSource.getAll());
    }
}
```

The generated controller base class includes:
- Spring MVC annotations (`@RequestMapping`, `@PostMapping`, etc.)
- Request/response type declarations
- Validation annotations (`@Valid`)
- Default `501 Not Implemented` responses for methods you haven't overridden

### Validation

Models include Bean Validation annotations based on OpenAPI constraints:

```java
import javax.validation.Valid;
import javax.validation.constraints.*;

// Generated models will have annotations like:
// @NotNull, @Size(min=1, max=100), @Pattern(regexp="..."), etc.

// Enable validation in Spring Boot
@PostMapping
public ResponseEntity<Void> create(@Valid @RequestBody ModelName model) {
    // Spring automatically validates and returns 400 Bad Request if invalid
    return ResponseEntity.ok().build();
}
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
