#!/usr/bin/env python3
"""
Create __init__.py files for generated py_models package.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


def snake_to_pascal(name: str) -> str:
    return "".join(part.capitalize() for part in name.split("_"))


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: update_py_models_init.py <py_models_dir>", file=sys.stderr)
        sys.exit(1)
    package_dir = Path(sys.argv[1]).expanduser().resolve()
    models_dir = package_dir / "py_models" / "models"

    if not models_dir.is_dir():
        print(f"Models directory not found: {models_dir}", file=sys.stderr)
        sys.exit(1)

    entries = []
    for path in sorted(models_dir.glob("*.py")):
        text = path.read_text()
        match = re.search(r"class\s+(\w+)\(", text)
        if not match:
            continue
        entries.append((path.stem, match.group(1)))

    models_init = models_dir / "__init__.py"
    with models_init.open("w") as fh:
        fh.write('"""Auto-generated exports for generated models."""\n\n')
        for module, cls in entries:
            fh.write(f"from .{module} import {cls}\n")
        fh.write("\n__all__ = [\n")
        for _, cls in entries:
            fh.write(f'    "{cls}",\n')
        fh.write("]\n")

    root_init = package_dir / "py_models" / "__init__.py"
    with root_init.open("w") as fh:
        fh.write('"""Convenience re-exports for py_models."""\n\n')
        for _, cls in entries:
            fh.write(f"from .models import {cls}\n")
        fh.write("\n__all__ = [\n")
        for _, cls in entries:
            fh.write(f'    "{cls}",\n')
        fh.write("]\n")


if __name__ == "__main__":
    main()
