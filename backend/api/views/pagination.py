from api.exceptions import APIBadRequestException


class LimitOffsetPaginationMixin:
    default_pagination_limit = 10
    default_pagination_offset = 0

    def get_pagination_params(self):
        try:
            p_limit = int(self.request.GET.get("limit", self.default_pagination_limit))
            p_offset = int(self.request.GET.get("offset", self.default_pagination_offset))
            return p_limit, p_offset
        except ValueError:
            raise APIBadRequestException("Bad pagination params")

    def cut_by_pagination(self, queryset):
        p_limit, p_offset = self.get_pagination_params()
        all_objects = queryset.all()
        if p_limit == -1:
            return queryset
        if p_offset >= len(all_objects):
            return queryset
        id_list = [all_objects[i].id for i in range(p_offset, min(len(all_objects), p_offset + p_limit))]
        return queryset.filter(id__in=id_list)