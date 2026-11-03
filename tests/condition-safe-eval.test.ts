import assert from "assert"

import { ConditionSyntaxError, evaluateExpression } from "../lib/conditional-expression/safe-eval"
import { evaluateCondition } from "../app/(ops)/conditional-exp/_eval"

// Shapes parseCondition() actually emits, with the results the old eval-based
// evaluator produced for them.
const sameAsBefore: [string, any][] = [
  ['(["rds"].includes("rds"))', true],
  ['(["airway"].includes("airway"))', true],
  ['(["a","b"].includes("c"))', false],
  ['([].includes("x"))', false],
  ['(["a"].includes("a")) && (["b"].includes("b"))', true],
  ['(["a"].includes("a")) && (["b"].includes("z"))', false],
  ['(["a"].includes("a")) || (["b"].includes("z"))', true],
  ['("male" == "male")', true],
  ['("male" == "female")', false],
  ['(32 > 28)', true],
  ['(32 < 28)', false],
  ['(32 >= 32)', true],
  ['(32 <= 31)', false],
  ['(true)', true],
  ['(false)', false],
  ['(null == null)', true],
  ['(!false)', true],
  ['(!(1 == 2))', true],
  ['(1 != 2)', true],
  ['([1,2,3].includes(2))', true],
  ['([true,false].includes(true))', true],
  ['("abc".includes("b"))', true],
  ['(["a",].includes("a"))', true],
  ['((["a"].includes("a")) && ((["b"].includes("b")) || (["c"].includes("z"))))', true],
]

for (const [expression, expected] of sameAsBefore) {
  assert.strictEqual(evaluateExpression(expression), expected, `evaluating ${expression}`)
}

// JavaScript coercion is preserved deliberately: conditions were written against eval's
// loose equality, so tightening it here would silently change existing screen logic.
assert.strictEqual(evaluateExpression('("5" == 5)'), true, "loose equality must stay loose")
assert.strictEqual(evaluateExpression('("5" === 5)'), false, "strict equality stays strict")

// && / || return the operand rather than a coerced boolean, as in JavaScript.
assert.strictEqual(evaluateExpression('0 || "fallback"'), "fallback", "|| returns the operand")
assert.strictEqual(evaluateExpression('"a" && "b"'), "b", "&& returns the operand")

// A short-circuited branch must never be evaluated, so a broken right-hand side cannot
// turn a condition that used to answer true into a thrown error.
assert.strictEqual(evaluateExpression('true || (5).includes("x")'), true, "|| short-circuits")
assert.strictEqual(evaluateExpression('false && (5).includes("x")'), false, "&& short-circuits")

// Operator precedence matches JavaScript.
assert.strictEqual(evaluateExpression('(1 == 1 && 2 == 3 || 4 == 4)'), true, "&& binds tighter than ||")
assert.strictEqual(evaluateExpression('(1 + 2 * 3 == 7)'), true, "* binds tighter than +")
assert.strictEqual(evaluateExpression('((1 + 2) * 3 == 9)'), true, "parentheses group arithmetic")

// The point of the exercise: an expression cannot reach the runtime. Each of these was
// executable under the old eval-based evaluator.
const mustReject = [
  'process.exit(1)',
  'globalThis',
  'require("fs")',
  '[].constructor',
  '"a".toUpperCase()',
  '(function(){return 1})()',
  '[].map(x => x)',
  '({}).hasOwnProperty("x")',
  'a == 1',
  '1 = 2',
  'this',
  'new Date()',
  'x.y.z',
]

for (const expression of mustReject) {
  assert.throws(
    () => evaluateExpression(expression),
    ConditionSyntaxError,
    `must refuse to evaluate ${expression}`,
  )
}

// evaluateCondition swallows the refusal and falls back, exactly as it did when eval threw.
assert.strictEqual(evaluateCondition('process.exit(1)'), false, "rejected expression falls back to default")
assert.strictEqual(evaluateCondition('process.exit(1)', true), true, "fallback honours the supplied default")
assert.strictEqual(evaluateCondition('(not valid ==', false), false, "malformed expression falls back")
assert.strictEqual(evaluateCondition('(["rds"].includes("rds"))'), true, "valid condition still evaluates")

console.log("condition safe-eval: all assertions passed")
