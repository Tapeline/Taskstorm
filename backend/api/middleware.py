from corsheaders.middleware import CorsMiddleware


class SyncCorsMiddleware(CorsMiddleware):
    async_capable = False
