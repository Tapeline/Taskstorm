"""
Django apps configurations
"""

from django.apps import AppConfig


class ApiConfig(AppConfig):
    """Main config"""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
