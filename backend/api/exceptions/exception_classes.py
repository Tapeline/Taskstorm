# pylint: disable=missing-module-docstring
# pylint: disable=missing-class-docstring
from rest_framework_simplejwt.exceptions import InvalidToken

from api.exceptions.base_classes import (APIBadRequestException,
                                         APIConflictException,
                                         APIPermissionException)


class BadPaginationParamsException(APIBadRequestException):
    default_code = "BAD_PAGINATION"
    default_detail = "Limit and offset query params must be integers"


class TokenAlreadyInvalidatedException(InvalidToken):
    default_code = "TOKEN_INVALIDATED"
    default_detail = "This token has been invalidated"


class TaskClosedButNotAtEndException(APIConflictException):
    default_code = "TASK_CLOSED_NOT_AT_END"
    default_detail = "Task cannot be closed until its stage is not at end"


class TaskAndStageAreInDifferentWorkspacesException(APIConflictException):
    default_code = "TASK_STAGE_WORKSPACE_MISMATCH"
    default_detail = "Task cannot be set to a stage that does not belong to it's workspace"


class SimultaneouslySetOwnerAndMemberListException(APIConflictException):
    default_code = "OWNER_MEMBER_SIMULTANEOUSLY_SET"
    default_detail = "Cannot simultaneously set owner and members"


class OwnershipTransferToNonMemberException(APIConflictException):
    default_code = "OWNER_IS_NOT_A_MEMBER"
    default_detail = "Ownership transfer is only available to members of workspace"


class NotAnOwnerException(APIPermissionException):
    default_code = "NOT_AN_OWNER"
    default_detail = "You don't own this workspace"
