"""
Provides convenient ways to access data through ORM
"""

from django.http import Http404
from rest_framework.generics import get_object_or_404


def get_object_or_null(model, **kwargs):
    """
    Try to get object with given filters or return None
    (instead of raising an error)
    """
    try:
        return get_object_or_404(model, **kwargs)
    except Http404:
        return None
