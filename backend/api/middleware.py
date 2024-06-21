"""
Provides various middleware
"""

from corsheaders.middleware import CorsMiddleware


class SyncCorsMiddleware(CorsMiddleware):
    """
    Non-async-capable CORS middleware, because I don't know
    why default CORS middleware wasn't working
    """
    async_capable = False
