# @unassigned
# @assigned
#
# @open
# @closed
#
# @stage stage
# @unstaged
#
# @bound
# @unbound
#
# @arranged
# @unarranged
#
# @deadline
#
# @folder folder
#
# @assignee user
# @creator user
#
# @tag tag
#
# @my
#
# & | ()

class Token:
    VALUE = 0
    TAG = 1
    OP_IS = 2
    OP_IS_NOT = 3
    OP_AND = 4
    OP_OR = 5
    L_PAR = 6
    R_PAR = 7

    COMPLEX_TAGS = ("@stage", "@folder", "@assignee", "@creator", "@tag")

    def __init__(self, typ, text):
        self.type = typ
        self.text = text

    def __repr__(self):
        return self.text if self.type == self.VALUE else self.type if self.type != self.TAG else self.text


class Tokenizer:
    def __init__(self, code: str):
        self.tokens: list[Token] = []
        self.start = 0
        self.current = 0
        self.code = code

    def tokenize(self):
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
                self.tokens.append(Token("value", self.code[self.start:self.current]))
                self.start = self.current
        return self.tokens

    def parse_val(self):
        while True:
            self.current += 1
            if self.is_at_end() or not self.code[self.current].isalnum():
                break

    def parse_str(self):
        while True:
            self.current += 1
            if self.is_at_end() or self.code[self.current] == "\"":
                break

    def parse_at(self):
        while True:
            self.current += 1
            if self.is_at_end() or not self.code[self.current].isalpha():
                break

    def is_at_end(self):
        return not self.current < len(self.code)


class Node:
    def __init__(self, token):
        self.token = token


class OrNode(Node):
    def __init__(self, token, left, right):
        super().__init__(token)
        self.left = left
        self.right = right


class AndNode(Node):
    def __init__(self, token, left, right):
        super().__init__(token)
        self.left = left
        self.right = right


class SimpleTagNode(Node):
    pass


class ValueTagNode(Node):
    def __init__(self, token, argument):
        super().__init__(token)
        self.argument = argument


class ValueNode(Node):
    pass


class ComparisonNode(Node):
    def __init__(self, token, left, right):
        super().__init__(token)
        self.mode = token != "!="
        self.left = left
        self.right = right


class Parser:
    def __init__(self, tokens: list[Token]):
        self.tokens = tokens
        self.pos = 0

    def match(self, *token_types):
        if self.pos >= len(self.tokens):
            return None
        if self.tokens[self.pos].type in token_types:
            self.pos += 1
            return self.tokens[self.pos - 1]
        return None

    def parse_expr(self):
        return self.parse_or()

    def parse_or(self):
        left = self.parse_and()
        while (token := self.match(Token.OP_OR)) is not None:
            left = OrNode(token, left, self.parse_and())
        return left

    def parse_and(self):
        left = self.parse_tag()
        while (token := self.match(Token.OP_AND)) is not None:
            left = AndNode(token, left, self.parse_tag())
        return left

    def parse_comparison(self):
        left = self.parse_tag()
        while (token := self.match(Token.OP_IS, Token.OP_IS_NOT)) is not None:
            left = ComparisonNode(token, left, self.parse_tag())
        return left

    def parse_tag(self):
        if (token := self.match(Token.TAG)) is not None:
            return SimpleTagNode(token)
        return self.parse_primary()

    def parse_primary(self):
        if (token := self.match(Token.VALUE)) is not None:
            return ValueNode(token)
        if self.match(Token.L_PAR) is not None:
            expr = self.parse_expr()
            self.match(Token.R_PAR)
            return expr
        raise ValueError("Syntax error")


def parse_filter_expression(code):
    tokenizer = Tokenizer(code)
    tokens = tokenizer.tokenize()
    parser = Parser(tokens)
    return parser.parse_expr()
