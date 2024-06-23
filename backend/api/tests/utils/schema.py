"""
Provides utilities for schema validation
"""
from typing import Any


class Schema:
    """Schema validator"""
    class Optional:
        """
        Optional field class.
        If actual field is None, it won't be counted as error
        """
        def __init__(self, value):
            self.value = value

    @staticmethod
    def _check_field(actual: Any, expected: Any, ignore_len=False) -> bool:
        """Checks field conformity"""
        # pylint: disable=unidiomatic-typecheck
        if type(expected) is type:
            return isinstance(actual, expected)
        if isinstance(actual, Schema.Optional):
            actual = actual.value
        if isinstance(expected, dict):
            return Schema.conforms_to_schema(actual, expected, ignore_len)
        if isinstance(expected, list):
            if not isinstance(actual, list):
                return False
            if len(actual) != len(expected):
                return False
            return all(Schema._check_field(a, b, ignore_len) for a, b in zip(actual, expected))
        return actual == expected

    @staticmethod
    def conforms_to_schema(data: dict, schema: dict, ignore_len=True) -> False:
        """Validate schema"""
        if len(data) != len(schema) and not ignore_len:
            return False
        if not isinstance(data, dict):
            return False
        for k, v in schema.items():
            if k not in data:
                if isinstance(v, Schema.Optional):
                    continue
                return False
            if not Schema._check_field(data[k], v, ignore_len):
                return False
        return True
