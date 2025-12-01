# Activate API Models for Python

This library contains auto-generated DTO models and API base classes for Python applications, generated directly from OpenAPI specifications.

## Package Structure

```
src/activate_api_models/
└── <domain>/              # Domain-specific package (e.g., demo, assortment, promo)
    ├── models/            # Generated Pydantic model classes
    ├── apis/              # Generated FastAPI base classes
    │   ├── __init__.py
    │   ├── default_api_base.py  # Base API class to implement
    │   └── default_api.py       # API implementation placeholder
    └── impl/              # Custom implementations (not regenerated)
```

All domains follow the same structure under `activate_api_models.<domain>/`.

## Requirements

Python >= 3.11

## Installation

This library is packaged as a wheel using Python's build module:
```bash
python -m build
```

## Usage in Consumer Projects

Install the wheel in your Python environment:

```bash
pip install activate_api_models-1.0.0-py3-none-any.whl
```

Or add to `requirements.txt`:
```
activate-api-models==1.0.0
```

Then import and use the models and APIs for your domain:

```python
from activate_api_models.<domain>.models import (
    DemoMessage,
    DemoMessageCategoryEnum,
    Item
)
from activate_api_models.<domain>.apis.default_api_base import BaseDefaultApi

# Use Pydantic models
message = DemoMessage(
    id=1,
    text="Hello",
    category=DemoMessageCategoryEnum.A
)

# Implement the API
class MyApiImplementation(BaseDefaultApi):
    async def publish_message(self, message: DemoMessage) -> None:
        # Your implementation here
        pass
```

## Build

The OpenAPI generator writes code directly into `src/activate_api_models/{domain}/`. To build the wheel:

```bash
python -m build
```

The wheel will be created in the `dist/` directory.

**Note:** During the build process, the Makefile patches `setup.cfg` to ensure the wheel name is `activate_api_models` (without domain suffixes), allowing a single wheel to contain models and APIs from all domains.

## Development

Code is generated directly from OpenAPI specs using:
```bash
make codegen-<domain>-python-models  # Generates models in activate_api_models.<domain>.models
make codegen-<domain>-python-api     # Generates APIs in activate_api_models.<domain>.apis
```

No manual copying or post-processing is required (except the `setup.cfg` patch).

## Generated vs Custom Code

- **Generated (will be overwritten):**
  - `src/activate_api_models/<domain>/models/` - Pydantic model classes
  - `src/activate_api_models/<domain>/apis/default_api_base.py` - Base API class
  - `src/activate_api_models/<domain>/apis/default_api.py` - API placeholder

- **Custom (preserved):**
  - `src/activate_api_models/<domain>/impl/` - Your custom implementations
  - This `README.md` file (excluded from clean-codegen)

## Dependencies

This library includes all necessary dependencies for the generated code:
- Pydantic (for model validation)
- FastAPI (for API framework)
- Python type hints

See `pyproject.toml` for the complete dependency list.
