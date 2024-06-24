"""
Provides base exception classes
"""
from rest_framework import status
from rest_framework.exceptions import APIException


class APIBadRequestException(APIException):
    """Raised when HTTP 400 should be returned to user"""
    status_code = status.HTTP_400_BAD_REQUEST


class APIConflictException(APIException):
    """Raised when HTTP 409 should be returned to user"""
    status_code = status.HTTP_409_CONFLICT


class APIPermissionException(APIException):
    """Raised when HTTP 403 should be returned to user"""
    status_code = status.HTTP_403_FORBIDDEN
