"""
Provides more invalidable JWT
"""

from datetime import datetime
from typing import Optional

from rest_framework_simplejwt.tokens import AccessToken

from api.exceptions.exception_classes import TokenAlreadyInvalidatedException
from api.models import IssuedToken


class TokenWithInvalidation(AccessToken):
    """Invalidable JWT"""
    def check_exp(self, claim: str = "exp",
                  current_time: Optional[datetime] = None) -> None:
        super().check_exp(claim, current_time)
        if IssuedToken.objects.filter(token=str(self)).exists() and \
                IssuedToken.objects.get(token=str(self)).is_invalidated:
            raise TokenAlreadyInvalidatedException
