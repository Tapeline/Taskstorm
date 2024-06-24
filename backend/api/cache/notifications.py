"""
Provides caching functions for notifications
"""

from typing import Literal

from django.core.cache import cache
from rest_framework.response import Response


class NotificationCache:
    """Namespace for notification-cache-related methods"""
    @staticmethod
    def cache_response(username: str, response: Response,
                       key: Literal["workspace"] | Literal["profile"],
                       timeout_sec: int = 60 * 60) -> None:
        """Cache DRF response for user and differentiating by key"""
        cache.set(
            f"notification-{key}-cache-{username}",
            {
                "status": response.status_code,
                "data": response.data
            },
            timeout_sec
        )

    @staticmethod
    def get_response_from_cache(username: str,
                                key: Literal["workspace"] | Literal["profile"]) -> Response:
        """Get and create response for user and differentiating by key"""
        cached = cache.get(f"notification-{key}-cache-{username}")
        return Response(**cached)

    @staticmethod
    def has_in_cache(username: str,
                     key: Literal["workspace"] | Literal["profile"]) -> bool:
        """Check if cache has response for user and differentiating by key"""
        return cache.has_key(f"notification-{key}-cache-{username}")

    @staticmethod
    def invalidate_for_user(username: str):
        """Invalidate all notification caches for user"""
        print(f"Invalidated cache for {username}")
        cache.delete_many([
            f"notification-profile-cache-{username}",
            f"notification-workspace-cache-{username}"
        ])
