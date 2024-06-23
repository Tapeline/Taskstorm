"""
Utils for pagination
"""
from django.db.models import QuerySet

from api.exceptions import APIBadRequestException


class LimitOffsetPaginationMixin:
    """Mixin for limit-offset pagination"""
    default_pagination_limit: int = 10
    default_pagination_offset: int = 0

    def _get_pagination_params(self) -> tuple[int, int]:
        """Get limit and offset from query params"""
        try:
            p_limit = int(self.request.GET.get("limit", self.default_pagination_limit))
            p_offset = int(self.request.GET.get("offset", self.default_pagination_offset))
            return p_limit, p_offset
        except ValueError as err:
            raise APIBadRequestException("Bad pagination params") from err

    def cut_by_pagination(self, queryset: QuerySet) -> QuerySet:
        """Apply pagination"""
        p_limit, p_offset = self._get_pagination_params()
        all_objects = queryset.all()
        if p_limit == -1:
            return queryset
        if p_offset >= len(all_objects):
            return queryset
        id_list = [
            all_objects[i].id
            for i in range(p_offset, min(len(all_objects), p_offset + p_limit))
        ]
        return queryset.filter(id__in=id_list)
