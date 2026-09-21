/**
 * Restricted evaluator for the expression strings produced by `parseCondition()`.
 *
 * `parseCondition()` substitutes entry values into an authored condition and hands the
 * result to `evaluateCondition()`, which used to run it through a raw JavaScript `eval`. The strings are
 * editor-authored rather than end-user supplied, but a raw `eval` grants the expression the
 * whole language and the ambient scope, so a mistake in the authoring layer becomes
 * arbitrary code execution rather than a wrong answer.
 *
 * This parses the small language those strings actually use into an AST and evaluates it.
 * There is no identifier lookup at all: any name other than `true`/`false`/`null`/
 * `undefined` is a parse error, so an expression cannot reach a variable, a global or a
 * function. The only member access permitted is `.includes(...)`.
 *
 * Semantics deliberately mirror JavaScript, because every existing condition has to keep
 * evaluating exactly as it did:
 *   - `==` / `!=` are loose, matching JS coercion.
 *   - `&&` / `||` short-circuit and return the operand itself, not a coerced boolean.
 *   - a branch that is short-circuited away is never evaluated, so it cannot throw.
 * Anything outside the grammar throws, and the caller falls back to its default — the same
 * outcome a raw `eval` produced for a malformed expression.
 */

export class ConditionSyntaxError extends Error {}

type Token =
    | { kind: 'num'; value: number }
    | { kind: 'str'; value: string }
    | { kind: 'word'; value: string }
    | { kind: 'punct'; value: string };

type Node =
    | { type: 'literal'; value: any }
    | { type: 'array'; items: Node[] }
    | { type: 'logical'; op: '&&' | '||'; left: Node; right: Node }
    | { type: 'binary'; op: string; left: Node; right: Node }
    | { type: 'unary'; op: '!' | '-' | '+'; argument: Node }
    | { type: 'includes'; target: Node; argument: Node | null };

// Longest first, so '===' is not mis-split into '==' plus '='.
const PUNCTUATION = [
    '===', '!==', '==', '!=', '>=', '<=', '&&', '||',
    '(', ')', '[', ']', ',', '.', '!', '>', '<', '+', '-', '*', '/', '%',
];

const ESCAPES: Record<string, string> = {
    n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', '0': '\0',
};

function readString(src: string, start: number): { value: string; next: number } {
    const quote = src[start];
    let out = '';
    let i = start + 1;

    while (i < src.length) {
        const ch = src[i];

        if (ch === '\\') {
            const esc = src[i + 1];
            if (esc === undefined) throw new ConditionSyntaxError('unterminated escape');
            if (esc === 'u') {
                const hex = src.slice(i + 2, i + 6);
                if (!/^[0-9a-fA-F]{4}$/.test(hex)) throw new ConditionSyntaxError('bad unicode escape');
                out += String.fromCharCode(parseInt(hex, 16));
                i += 6;
                continue;
            }
            out += Object.prototype.hasOwnProperty.call(ESCAPES, esc) ? ESCAPES[esc] : esc;
            i += 2;
            continue;
        }

        if (ch === quote) return { value: out, next: i + 1 };

        out += ch;
        i += 1;
    }

    throw new ConditionSyntaxError('unterminated string');
}

export function tokenize(src: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < src.length) {
        const ch = src[i];

        if (/\s/.test(ch)) { i += 1; continue; }

        if (ch === '"' || ch === "'" || ch === '`') {
            const { value, next } = readString(src, i);
            tokens.push({ kind: 'str', value });
            i = next;
            continue;
        }

        if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] || ''))) {
            const match = /^[0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?/.exec(src.slice(i));
            if (!match) throw new ConditionSyntaxError('bad number');
            tokens.push({ kind: 'num', value: Number(match[0]) });
            i += match[0].length;
            continue;
        }

        if (/[A-Za-z_$]/.test(ch)) {
            const match = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(src.slice(i))!;
            tokens.push({ kind: 'word', value: match[0] });
            i += match[0].length;
            continue;
        }

        const punct = PUNCTUATION.find(p => src.startsWith(p, i));
        if (!punct) throw new ConditionSyntaxError(`unexpected character ${JSON.stringify(ch)}`);
        tokens.push({ kind: 'punct', value: punct });
        i += punct.length;
    }

    return tokens;
}

class Parser {
    private pos = 0;

    constructor(private readonly tokens: Token[]) {}

    private peek(): Token | undefined {
        return this.tokens[this.pos];
    }

    private atPunct(...values: string[]) {
        const t = this.peek();
        return !!t && t.kind === 'punct' && values.includes(t.value);
    }

    private punctValue() {
        return (this.peek() as { value: string }).value;
    }

    private eatPunct(value: string) {
        if (!this.atPunct(value)) throw new ConditionSyntaxError(`expected ${value}`);
        this.pos += 1;
    }

    parse(): Node {
        const node = this.parseOr();
        if (this.pos !== this.tokens.length) throw new ConditionSyntaxError('trailing input');
        return node;
    }

    private parseOr(): Node {
        let left = this.parseAnd();
        while (this.atPunct('||')) {
            this.pos += 1;
            left = { type: 'logical', op: '||', left, right: this.parseAnd() };
        }
        return left;
    }

    private parseAnd(): Node {
        let left = this.parseComparison();
        while (this.atPunct('&&')) {
            this.pos += 1;
            left = { type: 'logical', op: '&&', left, right: this.parseComparison() };
        }
        return left;
    }

    private parseComparison(): Node {
        let left = this.parseAdditive();
        while (this.atPunct('==', '!=', '===', '!==', '>', '<', '>=', '<=')) {
            const op = this.punctValue();
            this.pos += 1;
            left = { type: 'binary', op, left, right: this.parseAdditive() };
        }
        return left;
    }

    private parseAdditive(): Node {
        let left = this.parseMultiplicative();
        while (this.atPunct('+', '-')) {
            const op = this.punctValue();
            this.pos += 1;
            left = { type: 'binary', op, left, right: this.parseMultiplicative() };
        }
        return left;
    }

    private parseMultiplicative(): Node {
        let left = this.parseUnary();
        while (this.atPunct('*', '/', '%')) {
            const op = this.punctValue();
            this.pos += 1;
            left = { type: 'binary', op, left, right: this.parseUnary() };
        }
        return left;
    }

    private parseUnary(): Node {
        if (this.atPunct('!', '-', '+')) {
            const op = this.punctValue() as '!' | '-' | '+';
            this.pos += 1;
            return { type: 'unary', op, argument: this.parseUnary() };
        }
        return this.parsePostfix();
    }

    // The only member access allowed is `.includes(...)`; any other property would be a
    // route back into the runtime, so it is rejected rather than looked up.
    private parsePostfix(): Node {
        let node = this.parsePrimary();

        while (this.atPunct('.')) {
            this.pos += 1;
            const name = this.peek();
            if (!name || name.kind !== 'word') throw new ConditionSyntaxError('expected property name');
            if (name.value !== 'includes') throw new ConditionSyntaxError(`property ${name.value} is not allowed`);
            this.pos += 1;

            this.eatPunct('(');
            const argument = this.atPunct(')') ? null : this.parseOr();
            this.eatPunct(')');

            node = { type: 'includes', target: node, argument };
        }

        return node;
    }

    private parsePrimary(): Node {
        const token = this.peek();
        if (!token) throw new ConditionSyntaxError('unexpected end of expression');

        if (token.kind === 'num' || token.kind === 'str') {
            this.pos += 1;
            return { type: 'literal', value: token.value };
        }

        if (token.kind === 'word') {
            this.pos += 1;
            switch (token.value) {
                case 'true': return { type: 'literal', value: true };
                case 'false': return { type: 'literal', value: false };
                case 'null': return { type: 'literal', value: null };
                case 'undefined': return { type: 'literal', value: undefined };
                // Anything else would be an identifier lookup, which this evaluator
                // deliberately cannot do.
                default: throw new ConditionSyntaxError(`unknown identifier ${token.value}`);
            }
        }

        if (this.atPunct('(')) {
            this.pos += 1;
            const node = this.parseOr();
            this.eatPunct(')');
            return node;
        }

        if (this.atPunct('[')) {
            this.pos += 1;
            const items: Node[] = [];
            if (!this.atPunct(']')) {
                items.push(this.parseOr());
                while (this.atPunct(',')) {
                    this.pos += 1;
                    if (this.atPunct(']')) break; // tolerate a trailing comma
                    items.push(this.parseOr());
                }
            }
            this.eatPunct(']');
            return { type: 'array', items };
        }

        throw new ConditionSyntaxError(`unexpected token ${JSON.stringify((token as any).value)}`);
    }
}

function evaluateNode(node: Node): any {
    switch (node.type) {
        case 'literal':
            return node.value;

        case 'array':
            return node.items.map(evaluateNode);

        case 'logical': {
            const left = evaluateNode(node.left);
            // Short-circuit, so the discarded branch is never evaluated and cannot throw.
            if (node.op === '&&') return left ? evaluateNode(node.right) : left;
            return left ? left : evaluateNode(node.right);
        }

        case 'unary': {
            const value = evaluateNode(node.argument);
            if (node.op === '!') return !value;
            if (node.op === '-') return -value;
            return +value;
        }

        case 'binary': {
            const left = evaluateNode(node.left);
            const right = evaluateNode(node.right);
            switch (node.op) {
                /* eslint-disable eqeqeq */
                case '==': return left == right;
                case '!=': return left != right;
                /* eslint-enable eqeqeq */
                case '===': return left === right;
                case '!==': return left !== right;
                case '>': return left > right;
                case '<': return left < right;
                case '>=': return left >= right;
                case '<=': return left <= right;
                case '+': return left + right;
                case '-': return left - right;
                case '*': return left * right;
                case '/': return left / right;
                case '%': return left % right;
                default: throw new ConditionSyntaxError(`unsupported operator ${node.op}`);
            }
        }

        case 'includes': {
            const target = evaluateNode(node.target);
            const argument = node.argument === null ? undefined : evaluateNode(node.argument);
            if (Array.isArray(target)) return target.includes(argument);
            if (typeof target === 'string') return target.includes(String(argument));
            throw new ConditionSyntaxError('includes() is only supported on arrays and strings');
        }
    }
}

export function parseExpression(expression: string): Node {
    return new Parser(tokenize(expression)).parse();
}

/**
 * Evaluates a parsed condition string. Throws ConditionSyntaxError when the expression
 * falls outside the supported grammar; callers treat that the way they treated an
 * exception from a raw `eval`.
 */
export function evaluateExpression(expression: string): any {
    return evaluateNode(parseExpression(expression));
}
