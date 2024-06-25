"""
Test correct filter parsing and application
"""
# pylint: disable=missing-function-docstring

from django.test import TestCase

from api.filtering import filters

from api import models
from api.filtering.parser import (parse_filter_expression, ComparisonNode,
                                  AndNode, OrNode, SimpleTagNode)


class FilterParsingTestCase(TestCase):
    """Test correct parsing"""
    def test_simple_tags(self):
        expr = parse_filter_expression(
            "@unassigned @assigned @open @closed @unstaged "
            "@bound @unbound @arranged @unarranged @my"
            "@stage @folder @assignee @creator @tag"
        )
        self.assertEqual(len(expr.expressions), 15)
        for e in expr.expressions:
            self.assertIsInstance(e, SimpleTagNode)

    def test_comparisons(self):
        expr1 = parse_filter_expression("@tag == Test")
        expr2 = parse_filter_expression("@tag != \"Test with space\"")
        self.assertIsInstance(expr1.expressions[0], ComparisonNode)
        self.assertIsInstance(expr2.expressions[0], ComparisonNode)
        self.assertEqual(expr1.expressions[0].right.token.text, "Test")
        self.assertEqual(expr2.expressions[0].right.token.text, "Test with space")

    def test_operators(self):
        expr1 = parse_filter_expression("@closed & @my")
        self.assertIsInstance(expr1.expressions[0], AndNode)
        self.assertEqual(expr1.expressions[0].left.token.text, "@closed")
        self.assertEqual(expr1.expressions[0].right.token.text, "@my")

        expr2 = parse_filter_expression("@closed | @my")
        self.assertIsInstance(expr2.expressions[0], OrNode)
        self.assertEqual(expr2.expressions[0].left.token.text, "@closed")
        self.assertEqual(expr2.expressions[0].right.token.text, "@my")

    def test_parentheses(self):
        expr1 = parse_filter_expression("@closed & (@my | @open)")
        self.assertIsInstance(expr1.expressions[0], AndNode)
        self.assertEqual(expr1.expressions[0].left.token.text, "@closed")
        self.assertIsInstance(expr1.expressions[0].right, OrNode)
        self.assertEqual(expr1.expressions[0].right.left.token.text, "@my")
        self.assertEqual(expr1.expressions[0].right.right.token.text, "@open")


class FilteringTestCase(TestCase):
    """Test correct filtering"""
    def setUp(self):
        user = models.User.objects.create(username="user", password="pass")
        workspace = models.Workspace.objects.create(owner=user, name="workspace",
                                                    is_drafted=False)
        stage = models.WorkflowStage.objects.create(workspace=workspace,
                                                    name="S",
                                                    color="FF0000",
                                                    is_end=False,
                                                    is_drafted=False)
        models.Task.objects.create(workspace=workspace, creator=user,
                                   name="A", description="?",
                                   folder="X",
                                   stage=stage,
                                   tags="M",
                                   is_drafted=False)
        models.Task.objects.create(workspace=workspace, creator=user,
                                   name="B", description="?",
                                   assignee=user,
                                   folder="X",
                                   tags="N M",
                                   is_drafted=False)
        models.Task.objects.create(workspace=workspace, creator=user,
                                   name="C", description="?",
                                   assignee=user,
                                   folder="Y",
                                   tags="N M",
                                   is_drafted=False)
        models.Task.objects.create(workspace=workspace, creator=user,
                                   name="D", description="?",
                                   is_open=False,
                                   folder="Y",
                                   stage=stage,
                                   tags="N",
                                   is_drafted=False)
        models.Task.objects.create(workspace=workspace, creator=user,
                                   name="E", description="?",
                                   is_open=False,
                                   folder="Y",
                                   stage=stage,
                                   is_drafted=False)
        self._user = user
        self._workspace = workspace
        self._stage = stage

    def _filter_names(self, filter_rule: str) -> list[str]:
        """Get names of tasks that are applicable to given filter"""
        return [obj.name for obj in models.Task.objects.all()
                if filters.applies_to_filter(obj, self._user, parse_filter_expression(filter_rule))]

    def test_filter_assignee(self):
        self.assertEqual(
            self._filter_names("@assignee == user"),
            ["B", "C"]
        )
        self.assertEqual(
            self._filter_names("@assignee == -"),
            ["A", "D", "E"]
        )
        self.assertEqual(
            self._filter_names("@assigned"),
            ["B", "C"]
        )
        self.assertEqual(
            self._filter_names("@unassigned"),
            ["A", "D", "E"]
        )

    def test_filter_folder(self):
        self.assertEqual(
            self._filter_names("@folder == X"),
            ["A", "B"]
        )
        self.assertEqual(
            self._filter_names("@folder == Y"),
            ["C", "D", "E"]
        )

    def test_filter_creator(self):
        self.assertEqual(
            self._filter_names("@creator == user"),
            ["A", "B", "C", "D", "E"]
        )

    def test_filter_stage(self):
        self.assertEqual(
            self._filter_names("@stage == -"),
            ["B", "C"]
        )
        self.assertEqual(
            self._filter_names("@stage == S"),
            ["A", "D", "E"]
        )
        self.assertEqual(
            self._filter_names("@unstaged"),
            ["B", "C"]
        )

    def test_filter_tag(self):
        self.assertEqual(
            self._filter_names("@tag == N"),
            ["B", "C", "D"]
        )
        self.assertEqual(
            self._filter_names("@tag == M"),
            ["A", "B", "C"]
        )

    def test_filter_open_closed(self):
        self.assertEqual(
            self._filter_names("@open"),
            ["A", "B", "C"]
        )
        self.assertEqual(
            self._filter_names("@closed"),
            ["D", "E"]
        )
