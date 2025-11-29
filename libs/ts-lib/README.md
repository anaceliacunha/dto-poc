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

## Installation

### From local build

```bash
npm install /path/to/libs/ts-lib
```

### From npm registry (if published)

```bash
npm install @activate/api-models
```

## Usage

```typescript
import { ModelName } from '@activate/api-models/<domain>/models';
import { DefaultApi } from '@activate/api-models/<domain>/apis';
import { Configuration } from '@activate/api-models/<domain>';

// Use the models and API
const config = new Configuration({ basePath: 'http://localhost:8080' });
const api = new DefaultApi(config);
const model: ModelName = { /* ... */ };
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
make codegen-<domain>-ts-models  # Generates models in src/<domain>/models/
make codegen-<domain>-react-api  # Generates API client in src/<domain>/apis/ (typescript-fetch generator)
```

No manual copying or post-processing is required. The build process compiles TypeScript directly from `src/`.
