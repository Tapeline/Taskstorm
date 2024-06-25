"""
Utils for achieving idempotency
"""


class IdempotentCreationModelQuerySetProviderMixin:
    """
    Provides get_queryset method that filters out all
    'drafted' objects in order to fully support idempotency
    on creation
    """

    def get_queryset(self):
        """Gets only 'confirmed' objects"""
        if (self.request.method in {"PUT", "PATCH"} and
                self.request.data.get("is_drafted") is False):
            return super().get_queryset()
        return super().get_queryset().filter(is_drafted=False)
