"""
Parsing filtering expressions
"""


class Token:
    """Token dataclass"""
    VALUE = 0
    TAG = 1
    OP_IS = 2
    OP_IS_NOT = 3
    OP_AND = 4
    OP_OR = 5
    L_PAR = 6
    R_PAR = 7

    # Also called variable-tags
    COMPLEX_TAGS = ("@stage", "@folder", "@assignee", "@creator", "@tag")

    def __init__(self, typ, text):
        self.type = typ
        self.text = text

    def __repr__(self):
        return self.text if self.type == self.VALUE \
            else (self.type if self.type != self.TAG
                  else self.text)


class Tokenizer:
    """
    Tokenizer.
    Available symbols: & | ()
    Available tags:
            @unassigned
            @assigned
            @open
            @closed
            @stage
            @unstaged
            @bound
            @unbound
            @arranged
            @unarranged
            @folder
            @assignee
            @creator
            @tag
            @my
    """

    def __init__(self, code: str):
        self.tokens: list[Token] = []
        self.start = 0
        self.current = 0
        self.code = code

    def tokenize(self):
        """Create list of tokens out of code"""
        while self.current < len(self.code):
            c = self.code[self.current]
            c2 = self.code[self.current + 1] if self.current + 1 < len(self.code) else None
            self.current += 1
            if c in [" ", "\t", "\r", "\n"]:
                self.start = self.current
                continue
            if c == "@":
                self.parse_at()
                self.tokens.append(Token(Token.TAG, self.code[self.start:self.current]))
                self.start = self.current
            elif c == "\"":
                self.parse_str()
                self.current += 1
                self.tokens.append(Token(Token.VALUE, self.code[self.start + 1:self.current - 1]))
                self.start = self.current
            elif c == "&":
                self.tokens.append(Token(Token.OP_AND, self.code[self.start:self.current]))
                self.start = self.current
            elif c == "|":
                self.tokens.append(Token(Token.OP_OR, self.code[self.start:self.current]))
                self.start = self.current
            elif c == "!" and c2 == "=":
                self.current += 1
                self.tokens.append(Token(Token.OP_IS_NOT, self.code[self.start:self.current]))
                self.start = self.current
            elif c == "=" and c2 == "=":
                self.current += 1
                self.tokens.append(Token(Token.OP_IS, self.code[self.start:self.current]))
                self.start = self.current
            elif c == "(":
                self.tokens.append(Token(Token.L_PAR, self.code[self.start:self.current]))
                self.start = self.current
            elif c == ")":
                self.tokens.append(Token(Token.R_PAR, self.code[self.start:self.current]))
                self.start = self.current
            else:
                self.parse_val()
                self.tokens.append(Token(Token.VALUE, self.code[self.start:self.current]))
                self.start = self.current
        return self.tokens

    @staticmethod
    def _isalnum(s):
        """Check if character is text (standard isalnum plus +, - and _)"""
        return s.isalnum() or s in "-+_"

    def parse_val(self):
        """Get value token (text)"""
        while True:
            self.current += 1
            if self.is_at_end() or not self._isalnum(self.code[self.current]):
                break

    def parse_str(self):
        """Get string token"""
        while True:
            self.current += 1
            if self.is_at_end() or self.code[self.current] == "\"":
                break

    def parse_at(self):
        """Get tag token"""
        while True:
            self.current += 1
            if self.is_at_end() or not self.code[self.current].isalpha():
                break

    def is_at_end(self):
        # pylint: disable=missing-function-docstring
        return not self.current < len(self.code)


class Node:
    """ABC for all AST nodes"""

    def __init__(self, token):
        self.token = token


class OrNode(Node):
    """a | b"""

    def __init__(self, token, left, right):
        super().__init__(token)
        self.left = left
        self.right = right


class AndNode(Node):
    """a & b"""

    def __init__(self, token, left, right):
        super().__init__(token)
        self.left = left
        self.right = right


class SequenceNode(Node):
    """a b c - is a sequence. Treated as a & b & c"""

    def __init__(self, expressions):
        super().__init__(None)
        self.expressions = expressions


class SimpleTagNode(Node):
    """Represents @tag"""

    def __repr__(self):
        return f"Tag<{self.token.text}>"


class ValueNode(Node):
    """Represents textual value"""

    def __repr__(self):
        return f"Value<{self.token.text}>"


class ComparisonNode(Node):
    """
    a == b
    a != b
    """

    def __init__(self, token, left, right):
        super().__init__(token)
        self.mode = token != "!="
        self.left = left
        self.right = right


class Parser:
    """Creates AST from tokens"""

    def __init__(self, tokens: list[Token]):
        self.tokens = tokens
        self.pos = 0

    def match(self, *token_types):
        """
        Try to consume token of certain type.
        If possible - return token, increment position
        If not - return None
        """
        if self.pos >= len(self.tokens):
            return None
        if self.tokens[self.pos].type in token_types:
            self.pos += 1
            return self.tokens[self.pos - 1]
        return None

    def parse(self):
        """Main parse method"""
        expr = []
        while self.pos < len(self.tokens):
            expr.append(self._parse_expr())
        return SequenceNode(expr)

    def _parse_expr(self):
        """Expression parsing method"""
        return self._parse_or()

    def _parse_or(self):
        """Parse or operator node or dive deeper"""
        left = self._parse_and()
        while (token := self.match(Token.OP_OR)) is not None:
            left = OrNode(token, left, self._parse_and())
        return left

    def _parse_and(self):
        """Parse and operator node or dive deeper"""
        left = self._parse_comparison()
        while (token := self.match(Token.OP_AND)) is not None:
            left = AndNode(token, left, self._parse_comparison())
        return left

    def _parse_comparison(self):
        """Parse == != operator nodes or dive deeper"""
        left = self._parse_tag()
        while (token := self.match(Token.OP_IS, Token.OP_IS_NOT)) is not None:
            left = ComparisonNode(token, left, self._parse_tag())
        return left

    def _parse_tag(self):
        """Parse @tag or dive deeper"""
        if (token := self.match(Token.TAG)) is not None:
            return SimpleTagNode(token)
        return self._parse_primary()

    def _parse_primary(self):
        """Parse value node or expr in parentheses or give up"""
        if self.match(Token.VALUE) is not None:
            token = self.tokens[self.pos - 1]
            return ValueNode(token)
        if self.match(Token.L_PAR) is not None:
            expr = self._parse_expr()
            self.match(Token.R_PAR)
            return expr
        raise ValueError("Syntax error")


def parse_filter_expression(code):
    """Main parsing function"""
    tokenizer = Tokenizer(code)
    tokens = tokenizer.tokenize()
    parser = Parser(tokens)
    return parser.parse()
