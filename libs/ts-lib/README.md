# Activate API Models for TypeScript/React

This package contains auto-generated DTO models and API clients for TypeScript and React applications, generated directly from OpenAPI specifications.

## Package Structure

```
src/
├── demo/           # Demo domain
│   ├── models/     # Generated model classes (DemoMessage, Item, etc.)
│   ├── apis/       # Generated API classes (DefaultApi, etc.)
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
import { DemoMessage, Item } from '@activate/api-models/demo/models';
import { DefaultApi } from '@activate/api-models/demo/apis';
import { Configuration } from '@activate/api-models/demo';

// Use the models and API
const config = new Configuration({ basePath: 'http://localhost:8080' });
const api = new DefaultApi(config);
const message: DemoMessage = { /* ... */ };
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
make codegen-demo-ts-models    # Generates models in src/demo/models/
make codegen-demo-react-api    # Generates API client in src/demo/apis/ (typescript-fetch generator)
```

No manual copying or post-processing is required. The build process compiles TypeScript directly from `src/`.
