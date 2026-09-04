"use client";

import { useMemo } from "react";
import { AlertCircleIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  mergeConditionKeys,
  validateCondition,
  validateReferenceExpression,
  type ConditionKey,
} from "@/lib/conditional-expression";

export interface ConditionExpressionInput {
  value?: string | number | null;
  /** Label shown before the messages (e.g. "Condition", "Skip to"). */
  label?: string;
  mode?: "boolean" | "reference";
  allowSelf?: boolean;
}

export interface ConditionErrorBadgeProps {
  /** One or more expressions belonging to the same item. */
  expressions: ConditionExpressionInput[];
  keys: ConditionKey[];
  /** Keys from the current unsaved form (e.g. sibling fields), merged into `keys`. */
  extraKeys?: ConditionKey[];
  /** Whether the key catalogue is authoritative (else key-dependent checks are skipped). */
  keysReady?: boolean;
  className?: string;
}

/**
 * Blocking messages for a set of expressions. Shared so every surface that
 * reports conditional-expression errors — this badge and the combined issue
 * badge — derives them the same way.
 */
export function collectConditionErrorMessages({
  expressions,
  keys,
  extraKeys,
  keysReady,
}: {
  expressions: ConditionExpressionInput[];
  keys: ConditionKey[];
  extraKeys?: ConditionKey[];
  keysReady?: boolean;
}): string[] {
  const mergedKeys = extraKeys?.length ? mergeConditionKeys(keys, extraKeys) : keys;
  const out: string[] = [];
  for (const expression of expressions || []) {
    const value = `${expression?.value ?? ""}`.trim();
    if (!value) continue;
    const ctx = { keys: mergedKeys, allowSelf: expression.allowSelf, skipKeyResolution: !keysReady };
    const result =
      expression.mode === "reference"
        ? validateReferenceExpression(value, ctx)
        : validateCondition(value, ctx);
    for (const diagnostic of result.diagnostics) {
      if (diagnostic.severity !== "error") continue;
      out.push(expression.label ? `${expression.label}: ${diagnostic.message}` : diagnostic.message);
    }
  }
  return out;
}

/**
 * A small red indicator shown when any of an item's conditional expressions
 * has a blocking error — so invalid legacy CE is visible in list/overview views
 * without opening each item. Renders nothing when everything is valid.
 */
export function ConditionErrorBadge({ expressions, keys, extraKeys, keysReady, className }: ConditionErrorBadgeProps) {
  const messages = useMemo(
    () => collectConditionErrorMessages({ expressions, keys, extraKeys, keysReady }),
    [expressions, keys, extraKeys, keysReady],
  );

  if (!messages.length) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn("inline-flex shrink-0 items-center text-destructive", className)}
            aria-label="Invalid conditional expression"
          >
            <AlertCircleIcon className="h-4 w-4" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Invalid conditional expression</span>
            {messages.map((message, index) => (
              <span key={index}>• {message}</span>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
