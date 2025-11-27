"""
Setup script for dto-lib package.
This copies generated code from gen/python-models and gen/python-api.
"""
import os
import shutil
from pathlib import Path
from setuptools import setup
from setuptools.command.build_py import build_py


class CustomBuildPy(build_py):
    """Custom build command that copies generated sources before building."""
    
    def run(self):
        # Define paths
        project_root = Path(__file__).parent.parent.parent
        gen_models = project_root / "gen" / "python-models"
        gen_api = project_root / "gen" / "python-api"
        src_dir = Path(__file__).parent / "src" / "activate_api_models"
        
        # Create src directory structure
        src_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy python-models
        if gen_models.exists():
            models_src = gen_models / "activate_api_models"
            if models_src.exists():
                # Copy models package contents
                for item in models_src.iterdir():
                    if item.name in ['models', '__init__.py', 'configuration.py']:
                        dest = src_dir / item.name
                        if item.is_dir():
                            if dest.exists():
                                shutil.rmtree(dest)
                            shutil.copytree(item, dest)
                        else:
                            shutil.copy2(item, dest)
        
        # Copy python-api
        if gen_api.exists():
            api_src = gen_api / "src" / "activate_api_models"
            if api_src.exists():
                # Copy only specific API directories (apis, impl, security_api.py, main.py)
                # Skip models directory since models come from python-models generator
                for item in api_src.iterdir():
                    if item.name in ['apis', 'impl', 'security_api.py', 'main.py']:
                        dest = src_dir / item.name
                        if item.is_dir():
                            if dest.exists():
                                shutil.rmtree(dest)
                            shutil.copytree(item, dest)
                        else:
                            shutil.copy2(item, dest)
        
        # Create __init__.py files
        (src_dir / "__init__.py").touch()
        if (src_dir / "models").exists():
            (src_dir / "models" / "__init__.py").touch()
        if (src_dir / "apis").exists():
            (src_dir / "apis" / "__init__.py").touch()
        if (src_dir / "impl").exists():
            (src_dir / "impl" / "__init__.py").touch()
        
        # Run the standard build - this will now pick up the copied files
        super().run()
        
        # Also manually ensure subdirectories are included
        for dirpath, dirnames, filenames in os.walk(src_dir):
            # Skip __pycache__ directories
            dirnames[:] = [d for d in dirnames if d != '__pycache__']
            for filename in filenames:
                if filename.endswith('.py'):
                    src_file = Path(dirpath) / filename
                    # Get relative path from src directory
                    rel_path = src_file.relative_to(src_dir.parent.parent)
                    # Build destination in build directory
                    dest = Path(self.build_lib) / rel_path.relative_to(Path("src"))
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(src_file, dest)


if __name__ == "__main__":
    setup(
        cmdclass={
            'build_py': CustomBuildPy,
        }
    )
