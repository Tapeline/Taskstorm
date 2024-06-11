class ObjDict(dict):
    def __getattr__(self, item):
        return self[item] if item in self else None

    def __setattr__(self, key, value):
        self[key] = value


def crop_list(target: list, count: int):
    return target[:min(count, len(target))]
