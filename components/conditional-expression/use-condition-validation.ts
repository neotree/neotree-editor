"use client";

import { useEffect, useMemo, useState } from "react";

import {
  validateCondition,
  validateReferenceExpression,
  type ConditionKey,
  type ValidationResult,
} from "@/lib/conditional-expression";

export interface UseConditionValidationOptions {
  value: string;
  keys: ConditionKey[];
  mode?: "boolean" | "reference";
  allowSelf?: boolean;
  selfDataType?: string;
  selfOptions?: string[];
  /** Suppresses key-dependent checks (e.g. while script keys are loading). */
  keysLoading?: boolean;
  debounceMs?: number;
}

/** Debounced, memoized realtime validation of a conditional expression. */
export function useConditionValidation({
  value,
  keys,
  mode = "boolean",
  allowSelf,
  selfDataType,
  selfOptions,
  keysLoading,
  debounceMs = 200,
}: UseConditionValidationOptions): ValidationResult {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), debounceMs);
    return () => clearTimeout(timer);
  }, [value, debounceMs]);

  return useMemo(() => {
    const ctx = {
      keys,
      allowSelf,
      selfDataType,
      selfOptions,
      skipKeyResolution: !!keysLoading || !keys.length,
    };
    return mode === "reference"
      ? validateReferenceExpression(debounced, ctx)
      : validateCondition(debounced, ctx);
  }, [debounced, keys, mode, allowSelf, selfDataType, selfOptions, keysLoading]);
}
