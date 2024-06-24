"""
Provides custom exception handler
"""
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """Formatting exceptions for end user"""

    response = exception_handler(exc, context)

    if isinstance(exc, APIException):
        return Response({"code": exc.default_code, "detail": exc.detail}, response.status_code)

    return response
