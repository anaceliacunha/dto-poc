# Activate API Models for Python

This library contains auto-generated DTO models and API classes for Python applications, generated directly from OpenAPI specifications.

## Package Structure

```
src/activate_api_models/
├── models/         # Generated model classes (DemoMessage, Item, etc.)
├── apis/           # Generated API base classes (DefaultApiBase, etc.)
└── impl/           # API implementation stubs
```

## Installation

This library is packaged as a Python wheel. To install:

```bash
pip install path/to/activate_api_models-1.0.0-py3-none-any.whl
```

## Usage in Consumer Projects

Import and use the models and API classes:

```python
from activate_api_models.models import DemoMessage, Item
from activate_api_models.apis import default_api_base

# Use the models and API
message = DemoMessage(...)
```

## Build

The OpenAPI generator writes code directly into `src/activate_api_models/`. To build the wheel:

```bash
python -m build
```

The wheel will be created in the `dist/` directory.

## Development

Code is generated directly from OpenAPI specs using:
```bash
make codegen-python-models  # Generates models in activate_api_models.models
make codegen-python-api     # Generates APIs in activate_api_models.apis
```

No manual copying is required. The build process packages the generated code directly from `src/activate_api_models/`.

## Dependencies

This library requires:
- python-dateutil
- pydantic >= 2.0
- typing-extensions
- urllib3 >= 1.25.3
