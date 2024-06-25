"""
Provides convenient ways to access data through ORM
"""
from typing import Type

from django.db.models import Model, QuerySet
from django.http import Http404
from rest_framework.generics import get_object_or_404


def get_object_or_null(model: Type[Model], *args, **kwargs) -> Model | None:
    """
    Try to get object with given filters or return None
    (instead of raising an error)
    """
    try:
        return get_object_or_404(model, *args, **kwargs)
    except Http404:
        return None


def filter_confirmed(model: Type[Model], *args, **kwargs) -> QuerySet:
    """
    Return queryset of objects creation of which was confirmed
    (in order to achieve idempotency on creation)
    """
    if len(args) == 0 and len(kwargs) == 0:
        return model.objects.filter(is_drafted=False)
    return model.objects.filter(is_drafted=False).filter(*args, **kwargs)
