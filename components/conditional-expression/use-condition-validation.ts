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
  /**
   * Whether the authoritative key catalogue is loaded and available. Key
   * existence/type checks only run when this is true — so a failed/absent/still
   * loading catalogue never produces false UNKNOWN_KEY errors, regardless of how
   * many keys (e.g. unsaved local ones) happen to be in the list.
   */
  keysReady?: boolean;
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
  keysReady,
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
      skipKeyResolution: !keysReady,
    };
    return mode === "reference"
      ? validateReferenceExpression(debounced, ctx)
      : validateCondition(debounced, ctx);
  }, [debounced, keys, mode, allowSelf, selfDataType, selfOptions, keysReady]);
}
