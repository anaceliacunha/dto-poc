# Activate API Models for TypeScript/React

This package contains auto-generated DTO models and API clients for TypeScript and React applications.

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
import { DemoMessage, Item } from '@activate/api-models';
import { DefaultApi } from '@activate/api-models/api';

// Use the models and API
```

## Build

To build the package:

```bash
npm install
npm run build
```

The compiled JavaScript and TypeScript definitions will be in the `dist/` directory.

## Development

The `npm run copy` script copies generated code from:
- `gen/ts-models/` - TypeScript model definitions
- `gen/react-api/` - React API clients

This happens automatically during the build process.
