from api.filtering import parser


def get_representation(task, tag):
    if tag == "@assignee":
        return task.assignee.username if task.assignee is not None else "-"
    if tag == "@folder":
        return task.folderZ
    if tag == "@creator":
        return task.creator.username
    if tag == "@stage":
        return task.stage.name if task.stage is not None else "-"
    if tag == "@tag":
        return task.tags.split()


def simple_tag_applies_to_task(task, user, tag):
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
    if tag == "@deadline":
        return False  # TODO
    if tag == "@my":
        return task.creator == user or task.assignee == user


def applies_to_filter(task, user, filter_node) -> bool:
    if isinstance(filter_node, parser.OrNode):
        return applies_to_filter(task, user, filter_node.left) \
            or applies_to_filter(task, user, filter_node.right)
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
        else:
            return (str(representation) == str(value)) == filter_node.mode
    if isinstance(filter_node, parser.SimpleTagNode):
        if filter_node.token.text in parser.Token.COMPLEX_TAGS:
            return False
        return simple_tag_applies_to_task(task, user, filter_node.token.text)
