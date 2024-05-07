from django.http import Http404
from rest_framework.generics import get_object_or_404


def get_object_or_null(model, **kwargs):
    try:
        return get_object_or_404(model, **kwargs)
    except Http404:
        return None
