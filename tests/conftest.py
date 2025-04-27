import sys
import os

# Ensure project root is on sys.path for imports
tests_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(tests_dir, os.pardir))
if project_root not in sys.path:
    sys.path.insert(0, project_root)