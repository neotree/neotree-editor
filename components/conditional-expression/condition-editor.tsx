"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircleIcon, AlertTriangleIcon, Wand2Icon } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { mergeConditionKeys, type ConditionKey } from "@/lib/conditional-expression";
import { getTokenAtCursor, insertKeyAtCursor, sortKeyMatches } from "./autocomplete";
import { useConditionValidation } from "./use-condition-validation";

export interface ConditionEditorProps {
  value: string;
  onChange: (value: string) => void;
  keys: ConditionKey[];
  /**
   * Keys defined in the current, not-yet-saved form (e.g. sibling fields being
   * added on this screen). Merged into `keys` so a reference to a field you
   * just added isn't wrongly flagged as unknown before the first save.
   */
  extraKeys?: ConditionKey[];
  mode?: "boolean" | "reference";
  allowSelf?: boolean;
  selfDataType?: string;
  selfOptions?: string[];
  keysLoading?: boolean;
  disabled?: boolean;
  rows?: number;
  placeholder?: string;
  id?: string;
  /**
   * The persisted expression. When provided, onValidityChange only reports a
   * blocking state once the value differs from this — so legacy expressions
   * with pre-existing errors stay saveable (diagnostics still show), while any
   * new edit must be valid.
   */
  initialValue?: string;
  /** Called whenever the blocking state flips, so the parent can gate saving. */
  onValidityChange?: (hasErrors: boolean) => void;
}

/**
 * Textarea for authoring conditional expressions with realtime validation,
 * inline diagnostics, and script-key autocomplete. Shared across every
 * expression authoring surface in the editor.
 */
export function ConditionEditor({
  value,
  onChange,
  keys,
  extraKeys,
  mode = "boolean",
  allowSelf,
  selfDataType,
  selfOptions,
  keysLoading,
  disabled,
  rows = 4,
  placeholder,
  id,
  initialValue,
  onValidityChange,
}: ConditionEditorProps) {
  const [cursor, setCursor] = useState(value.length);

  const mergedKeys = useMemo(
    () => (extraKeys?.length ? mergeConditionKeys(keys, extraKeys) : keys),
    [keys, extraKeys],
  );

  // Authoritativeness is decided by the *persisted* catalogue, never by the
  // merged length — so an unsaved local key can't turn an unavailable catalogue
  // into false UNKNOWN_KEY errors on otherwise-valid persisted keys.
  const keysReady = !keysLoading && keys.length > 0;

  const { diagnostics, hasErrors } = useConditionValidation({
    value,
    keys: mergedKeys,
    mode,
    allowSelf,
    selfDataType,
    selfOptions,
    keysReady,
  });

  // Only block saving once the expression actually changes from the persisted
  // value; legacy expressions with errors stay saveable (but still show them).
  const blocking = useMemo(() => {
    if (initialValue === undefined) return hasErrors;
    return hasErrors && value.trim() !== initialValue.trim();
  }, [hasErrors, value, initialValue]);

  useEffect(() => {
    onValidityChange?.(blocking);
  }, [blocking, onValidityChange]);

  // Autocomplete works in both modes — reference expressions reference $keys too.
  const activeToken = useMemo(() => getTokenAtCursor(value, cursor), [value, cursor]);

  const matches = useMemo(() => {
    if (!activeToken || !mergedKeys.length) return [];
    const token = activeToken.token;
    if (token.toLowerCase() === "self") return [];
    // Hide once the token already exactly matches a known key.
    if (token.length > 2 && mergedKeys.some((k) => k.name.toLowerCase() === token.toLowerCase())) return [];
    return sortKeyMatches(mergedKeys, token).slice(0, 8);
  }, [activeToken, mergedKeys]);

  return (
    <div className="space-y-2">
      <Textarea
        id={id}
        rows={rows}
        noRing={false}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setCursor(event.target.selectionStart ?? event.target.value.length);
        }}
        onClick={(event) => setCursor(event.currentTarget.selectionStart ?? 0)}
        onKeyUp={(event) => setCursor(event.currentTarget.selectionStart ?? 0)}
      />

      {!!matches.length && (
        <div className="rounded-md border border-border">
          {matches.map((option) => (
            <button
              type="button"
              key={option.name}
              className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                const next = insertKeyAtCursor(value, option.name, activeToken);
                onChange(next.condition);
                setCursor(next.cursor);
              }}
            >
              <Wand2Icon className="mr-2 h-3.5 w-3.5 opacity-60" />
              {option.label || option.name}
            </button>
          ))}
        </div>
      )}

      {diagnostics.map((diagnostic, index) => (
        <p
          key={`${diagnostic.code}-${diagnostic.start}-${index}`}
          className={cn(
            "flex items-start gap-1.5 text-xs",
            diagnostic.severity === "error" ? "text-destructive" : "text-yellow-600 dark:text-yellow-500",
          )}
        >
          {diagnostic.severity === "error" ? (
            <AlertCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          <span>{diagnostic.message}</span>
        </p>
      ))}
    </div>
  );
}
