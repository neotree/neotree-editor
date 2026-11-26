import type { ValidationContext, ValidationResult } from "./ast";
import { validateCalculation } from "./calculation";

/**
 * Validates a field calculation ("reference expression"): $key, SUM/SUBTRACT/MULTIPLY/DIVIDE,
 * MATH(...) arithmetic and DATE_ADD(...) date formulas. Plain-language input is accepted with a
 * warning that shows the formula it will be converted to (see compileCalculation).
 */
export function validateReferenceExpression(input: string, ctx: ValidationContext): ValidationResult {
  return validateCalculation(input, ctx);
}
