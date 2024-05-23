from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import exception_handler


class APIException(Exception):
    def __init__(self, message, code, **data):
        super().__init__(message)
        self.data_dict = {
            "error_message": message,
            "error": data
        }
        self.status = code


class APIBadRequestException(APIException):
    def __init__(self, message, **data):
        super().__init__(message, 400, **data)


class APIConflictException(APIException):
    def __init__(self, message, **data):
        super().__init__(message, 409, **data)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if isinstance(exc, AuthenticationFailed):
        return Response({"error": response.data, "error_message": exc.detail}, response.status_code)
    if isinstance(exc, APIException):
        return Response(exc.data_dict, exc.status)

    return response
