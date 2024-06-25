"""
Functions for filtering by parsed expression
"""

from api.filtering import parser
from api.filtering.parser import Node


class UnknownFilter(ValueError):
    """Raised when unknown filter encountered"""
    def __init__(self, filter_node):
        super().__init__(f"Unknown filter: {filter_node}")


class UnknownTag(ValueError):
    """Raised when unknown tag encountered"""
    def __init__(self, tag):
        super().__init__(f"Unknown tag: {tag}")


def get_representation(task, tag: str) -> str:
    """Get textual representation of variable-tag for future comparing"""
    if tag == "@assignee":
        return task.assignee.username if task.assignee is not None else "-"
    if tag == "@folder":
        return task.folder
    if tag == "@creator":
        return task.creator.username
    if tag == "@stage":
        return task.stage.name if task.stage is not None else "-"
    if tag == "@tag":
        return task.tags.split()
    raise UnknownTag(tag)


def simple_tag_applies_to_task(task, user, tag: str):
    """Check if non-variable-tag is applicable to given task"""
    # pylint: disable=too-many-return-statements
    if tag == "@unassigned":
        return task.assignee is None
    if tag == "@assigned":
        return task.assignee is not None
    if tag == "@open":
        return task.is_open
    if tag == "@closed":
        return not task.is_open
    if tag == "@unstaged":
        return task.stage is None
    if tag == "@unbound":
        return task.time_bounds_start is None and task.time_bounds_end is None
    if tag == "@bound":
        return not (task.time_bounds_start is None and task.time_bounds_end is None)
    if tag == "@arranged":
        return task.arrangement_start is None and task.arrangement_end is None
    if tag == "@unarranged":
        return not (task.arrangement_start is None and task.arrangement_end is None)
    if tag == "@my":
        # pylint: disable=consider-using-in
        return task.creator == user or task.assignee == user
    raise UnknownTag(tag)


def applies_to_filter(task, user, filter_node: Node) -> bool:
    """Check if filter is true for given task and user"""
    # pylint: disable=too-many-return-statements
    if task.is_drafted:
        return False
    if isinstance(filter_node, parser.OrNode):
        return applies_to_filter(task, user, filter_node.left) \
            or applies_to_filter(task, user, filter_node.right)
    if isinstance(filter_node, parser.SequenceNode):
        return all(applies_to_filter(task, user, x) for x in filter_node.expressions)
    if isinstance(filter_node, parser.AndNode):
        return applies_to_filter(task, user, filter_node.left) \
            and applies_to_filter(task, user, filter_node.right)
    if isinstance(filter_node, parser.ComparisonNode):
        if not isinstance(filter_node.left, parser.SimpleTagNode) or \
           not isinstance(filter_node.right, parser.ValueNode):
            return False
        tag = filter_node.left.token.text
        value = filter_node.right.token.text
        representation = get_representation(task, tag)
        if tag == "@tag":
            return (value in representation) == filter_node.mode
        return (str(representation) == str(value)) == filter_node.mode
    if isinstance(filter_node, parser.SimpleTagNode):
        if filter_node.token.text in parser.Token.COMPLEX_TAGS:
            return False
        return simple_tag_applies_to_task(task, user, filter_node.token.text)
    raise UnknownFilter(filter_node)
