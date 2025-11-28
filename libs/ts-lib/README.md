# Activate API Models for TypeScript/React

This package contains auto-generated DTO models and API clients for TypeScript and React applications, generated directly from OpenAPI specifications.

## Package Structure

```
src/
├── models/         # Generated model classes (DemoMessage, Item, etc.)
├── apis/           # Generated API classes (DefaultApi, etc.)
├── runtime.ts      # Runtime utilities
└── index.ts        # Main export
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
import { DemoMessage, Item, DefaultApi } from '@activate/api-models';

// Use the models and API
const api = new DefaultApi();
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
make codegen-ts-models    # Generates models in src/models/
make codegen-react-api    # Generates API client in src/apis/ (typescript-fetch generator)
```

No manual copying or post-processing is required. The build process compiles TypeScript directly from `src/`.
