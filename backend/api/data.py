"""
Provides classes for convenient data structuration
"""


class ObjDict(dict):
    """Dict, but items can be accessed as `dict.key = value`"""
    def __getattr__(self, item):
        return self[item] if item in self else None

    def __setattr__(self, key, value):
        self[key] = value


def crop_list(target: list, count: int) -> list:
    """
    Try to shrink list down to given length
    If list is shorter than given length, leave it as is
    """
    return target[:min(count, len(target))]
