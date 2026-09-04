"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertCircleIcon, AlertTriangleIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  collectConditionErrorMessages,
  type ConditionExpressionInput,
} from "@/components/conditional-expression";
import type { ConditionKey } from "@/lib/conditional-expression";
import { getFieldKeyCollisionRule, type FieldKeyCollision } from "@/lib/field-key-collisions";

export type ScriptIssueSeverity = "error" | "warning";

export interface ScriptIssue {
  severity: ScriptIssueSeverity;
  /** Heading the issue is listed under, e.g. "Conditional expression". */
  group: string;
  message: string;
  href?: string;
}

const CONDITION_GROUP = "Conditional expression";

/** Turns expression errors into issues. */
export function conditionIssues(params: {
  expressions: ConditionExpressionInput[];
  keys: ConditionKey[];
  extraKeys?: ConditionKey[];
  keysReady?: boolean;
  href?: string;
}): ScriptIssue[] {
  return collectConditionErrorMessages(params).map((message) => ({
    severity: "error" as const,
    group: CONDITION_GROUP,
    message,
    href: params.href,
  }));
}

/** Turns field-key collisions into issues. */
export function collisionIssues(collisions: FieldKeyCollision[], href?: string): ScriptIssue[] {
  return (collisions || []).map((collision) => ({
    severity: collision.severity === "blocking" ? ("error" as const) : ("warning" as const),
    group: getFieldKeyCollisionRule(collision.kind)?.label || "Duplicate field key",
    message: collision.message,
    href,
  }));
}

export interface ScriptIssueBadgeProps {
  issues: ScriptIssue[];
  className?: string;
  /** Cap on listed messages before collapsing to a count. */
  maxListed?: number;
}

/**
 * One indicator for everything wrong with an item — invalid conditional
 * expressions and duplicate field keys alike.
 *
 * Two badges on a row made the reader work out which was which before they
 * could act; one badge answers "is anything wrong here?" first, and what
 * exactly on hover. Red when something blocks, amber when it is only worth
 * reviewing. Renders nothing when the item is clean.
 */
export function ScriptIssueBadge({ issues, className, maxListed = 8 }: ScriptIssueBadgeProps) {
  const groups = useMemo(() => {
    const byGroup = new Map<string, ScriptIssue[]>();
    for (const issue of issues || []) {
      const existing = byGroup.get(issue.group);
      if (existing) existing.push(issue);
      else byGroup.set(issue.group, [issue]);
    }
    return Array.from(byGroup.entries());
  }, [issues]);

  if (!issues?.length) return null;

  const blocking = issues.some((issue) => issue.severity === "error");
  const Icon = blocking ? AlertCircleIcon : AlertTriangleIcon;
  const label = blocking ? "Has blocking issues" : "Has issues to review";

  let listed = 0;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn("inline-flex shrink-0 items-center", blocking ? "text-destructive" : "text-amber-600", className)}
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="flex flex-col gap-2 text-xs">
            {groups.map(([group, groupIssues]) => {
              const remaining = Math.max(0, maxListed - listed);
              const shown = groupIssues.slice(0, remaining);
              listed += shown.length;
              const hidden = groupIssues.length - shown.length;

              return (
                <div key={group} className="flex flex-col gap-1">
                  <span className="font-medium">
                    {group}
                    {groupIssues.length > 1 ? ` (${groupIssues.length})` : ""}
                  </span>
                  {shown.map((issue, index) =>
                    issue.href ? (
                      <Link
                        key={index}
                        href={issue.href}
                        className="underline hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        • {issue.message}
                      </Link>
                    ) : (
                      <span key={index}>• {issue.message}</span>
                    ),
                  )}
                  {hidden > 0 && <span className="opacity-70">…and {hidden} more</span>}
                </div>
              );
            })}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
