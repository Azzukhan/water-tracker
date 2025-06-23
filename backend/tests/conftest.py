import os
import sys
import pytest
from rest_framework.test import APIClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

@pytest.fixture
def api_client():
    return APIClient()
