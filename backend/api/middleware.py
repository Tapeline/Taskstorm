from asgiref.sync import sync_to_async
from channels.auth import AuthMiddlewareStack
from corsheaders.middleware import CorsMiddleware
from rest_framework_simplejwt.authentication import JWTAuthentication


class SyncCorsMiddleware(CorsMiddleware):
    async_capable = False


class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    @staticmethod
    def get_user(token):
        auth = JWTAuthentication()
        return auth.get_user(auth.get_validated_token(token))

    async def __call__(self, scope, receive, send):
        if b"sec-websocket-protocol" in dict(scope["headers"]):
            jwt_token = dict(scope["headers"])[b"sec-websocket-protocol"].decode().split()[-1]
            scope["user"] = await sync_to_async(self.get_user)(jwt_token)
        return self.inner(scope, receive, send)


TokenAuthMiddlewareStack = lambda inner: TokenAuthMiddleware(AuthMiddlewareStack(inner))

