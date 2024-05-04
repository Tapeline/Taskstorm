from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if isinstance(exc, AuthenticationFailed):
        return Response({"error": response.data, "error_message": exc.detail}, response.status_code)

    return response
