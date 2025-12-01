# Activate API Models for TypeScript/React

This package contains auto-generated DTO models and API clients for TypeScript and React applications, generated directly from OpenAPI specifications.

## Package Structure

```
src/
├── <domain>/       # Domain-specific directory (e.g., demo, assortment, promo)
│   ├── models/     # Generated model classes
│   ├── apis/       # Generated API classes
│   ├── runtime.ts  # Runtime utilities
│   └── index.ts    # Domain exports
└── index.ts        # Re-exports from all domains
```

## Package Information

- **Package name**: `@activate/api-models`
- **Version**: `1.0.0`
- **Exports**: Domain-specific paths for organized imports:
  - Models: `@activate/api-models/<domain>/models` (e.g., `@activate/api-models/demo/models`)
  - APIs: `@activate/api-models/<domain>/apis` (e.g., `@activate/api-models/demo/apis`)
  - Runtime utilities: `@activate/api-models/<domain>/runtime`

## Installation

### From local build

```bash
npm install /path/to/libs/ts-lib
```

### From npm registry (if published)

```bash
npm install @activate/api-models
```

## Usage in Consumer Projects

Add the package to your `package.json`:

```json
{
  "dependencies": {
    "@activate/api-models": "^1.0.0"
  }
}
```

Or install via npm:

```bash
npm install @activate/api-models
```

Then import models and APIs for your domain:

```typescript
import type { ModelName } from '@activate/api-models/<domain>/models';
import { EnumName } from '@activate/api-models/<domain>/models';
import { DefaultApi, Configuration } from '@activate/api-models/<domain>/apis';
```

## Usage

### Using Models

```typescript
// Create type-safe model objects
const model: ModelName = {
    id: 1,
    name: 'Example',
    status: EnumName.VALUE,
    createdAt: new Date().toISOString()
};

// Models use camelCase properties for idiomatic JavaScript/TypeScript
```

### Using the API Client

```typescript
import { DefaultApi, Configuration } from '@activate/api-models/<domain>/apis';
import type { ModelName } from '@activate/api-models/<domain>/models';

// Configure the client
const api = new DefaultApi(
    new Configuration({ basePath: 'http://localhost:8080' })
);

// Make API calls
async function example() {
    // POST request
    await api.createModel({ modelName: model });
    
    // GET request
    const results = await api.listModels();
    return results;
}
```

### React Integration

```typescript
import { useState, useEffect } from 'react';
import { DefaultApi, Configuration } from '@activate/api-models/<domain>/apis';
import type { ModelName } from '@activate/api-models/<domain>/models';

function YourComponent() {
    const [data, setData] = useState<ModelName[]>([]);
    const api = new DefaultApi(new Configuration({ basePath: 'http://localhost:8080' }));
    
    useEffect(() => {
        api.listModels().then(setData);
    }, []);
    
    return <div>{/* Render your data */}</div>;
}
```

## Build

The OpenAPI generator writes code directly into `src/`. To build the package:

```bash
npm install
npm run build
```

The compiled JavaScript and TypeScript definitions will be in the `dist/` directory.

## Development

Code is generated directly from OpenAPI specs using:
```bash
make codegen-<domain>-ts-models     # Generates models in src/<domain>/models/
make codegen-<domain>-ts-fetch-api  # Generates API client in src/<domain>/apis/ (typescript-fetch generator)
```

No manual copying or post-processing is required. The build process compiles TypeScript directly from `src/`.

## Generated vs Custom Code

- **Generated (will be overwritten):**
  - `src/<domain>/models/` - TypeScript model interfaces
  - `src/<domain>/apis/` - API client classes
  - `src/<domain>/runtime.ts` - Runtime utilities
  - `src/<domain>/index.ts` - Domain exports

- **Custom (preserved):**
  - This `README.md` file
  - `package.json` - Package configuration
  - `tsconfig.json` - TypeScript compiler configuration
