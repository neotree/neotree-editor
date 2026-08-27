"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AlertCircleIcon, AlertTriangleIcon, Wand2Icon } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { mergeConditionKeys, type ConditionKey, type Diagnostic } from "@/lib/conditional-expression";
import {
  getConditionValueMatches,
  getTokenAtCursor,
  getValueContextAtCursor,
  insertKeyAtCursor,
  insertValueAtContext,
  sortKeyMatches,
} from "./autocomplete";
import { useConditionValidation } from "./use-condition-validation";

// Render cap: every match is reachable by typing to narrow, but we bound the
// number of DOM nodes per keystroke so very large key sets stay responsive.
const MAX_SUGGESTIONS = 50;

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
  unavailableKeys?: Record<string, string>;
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
  unavailableKeys,
  disabled,
  rows = 4,
  placeholder,
  id,
  initialValue,
  onValidityChange,
}: ConditionEditorProps) {
  const [cursor, setCursor] = useState(value.length);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingCursorRef = useRef<number | null>(null);
  const listboxId = useId();

  const mergedKeys = useMemo(
    () => (extraKeys?.length ? mergeConditionKeys(keys, extraKeys) : keys),
    [keys, extraKeys],
  );
  // Availability controls validation, not discovery. Keeping unavailable keys
  // in autocomplete lets authors inspect configured CDS values while the
  // targeted diagnostic still prevents an invalid before-producer reference.
  const autocompleteKeys = mergedKeys;

  // Readiness is based on *having* keys, not the transient loading flag —
  // otherwise a background refetch (keysLoading -> true) would momentarily
  // blank out key-dependent diagnostics. Keys persist once loaded.
  const keysReady = keys.length > 0;

  const { diagnostics, hasErrors } = useConditionValidation({
    value,
    keys: mergedKeys,
    mode,
    allowSelf,
    selfDataType,
    selfOptions,
    unavailableKeys,
    keysReady,
  });

  const blocking = useMemo(() => {
    if (initialValue === undefined) return hasErrors;
    return hasErrors && value.trim() !== initialValue.trim();
  }, [hasErrors, value, initialValue]);

  useEffect(() => {
    onValidityChange?.(blocking);
  }, [blocking, onValidityChange]);


  const onValidityChangeRef = useRef(onValidityChange);
  onValidityChangeRef.current = onValidityChange;
  useEffect(() => {
    return () => onValidityChangeRef.current?.(false);
  }, []);

  // Autocomplete works in both modes — reference expressions reference $keys too.
  const activeToken = useMemo(() => getTokenAtCursor(value, cursor), [value, cursor]);

  const matches = useMemo(() => {
    if (!activeToken || !autocompleteKeys.length) return [];
    const token = activeToken.token;
    if (token.toLowerCase() === "self") return [];
    // Hide once the token already exactly matches a known key.
    if (token.length > 2 && autocompleteKeys.some((k) => k.name.toLowerCase() === token.toLowerCase())) return [];
    return sortKeyMatches(autocompleteKeys, token);
  }, [activeToken, autocompleteKeys]);

  // Value autocomplete: when typing a value, suggest the governing key's
  // options (its child keys). Only when not already completing a $key.
  const valueContext = useMemo(
    () => (mode === "reference" || activeToken ? null : getValueContextAtCursor(value, cursor)),
    [mode, activeToken, value, cursor],
  );

  const valueMatches = useMemo(() => {
    if (!valueContext) return [];
    const key = autocompleteKeys.find((k) => k.name.toLowerCase() === valueContext.keyName.toLowerCase());
    return getConditionValueMatches(key, valueContext.partial);
  }, [valueContext, autocompleteKeys]);

  const keySuggestions = matches.slice(0, MAX_SUGGESTIONS);
  const valueSuggestions = !matches.length ? valueMatches.slice(0, MAX_SUGGESTIONS) : [];
  const suggestionsSignature = activeToken && keySuggestions.length
    ? `key:${activeToken.start}:${activeToken.end}:${activeToken.token}`
    : valueContext && valueSuggestions.length
      ? `value:${valueContext.insertStart}:${valueContext.insertEnd}:${valueContext.partial}`
      : null;
  const suggestionsOpen = !!suggestionsSignature && dismissedSuggestions !== suggestionsSignature;
  const visibleKeySuggestions = suggestionsOpen ? keySuggestions : [];
  const visibleValueSuggestions = suggestionsOpen ? valueSuggestions : [];
  const suggestionCount = visibleKeySuggestions.length || visibleValueSuggestions.length;
  const valueKey = valueContext
    ? mergedKeys.find((key) => key.name.toLowerCase() === valueContext.keyName.toLowerCase())
    : undefined;
  const emptyOutcomeCollections = useMemo(() => {
    const referenced = mergedKeys.filter((key) => (
      (key.name === "Diagnoses" || key.name === "Problems")
      && Array.isArray(key.options)
      && key.options.length === 0
      && new RegExp(`\\$${key.name}\\b`, "i").test(value)
    ));
    if (
      valueKey
      && (valueKey.name === "Diagnoses" || valueKey.name === "Problems")
      && Array.isArray(valueKey.options)
      && valueKey.options.length === 0
      && !referenced.some((key) => key.name === valueKey.name)
    ) {
      referenced.push(valueKey);
    }
    return referenced;
  }, [mergedKeys, value, valueKey]);

  useEffect(() => {
    setSelectedSuggestion(0);
  }, [suggestionsSignature]);

  useEffect(() => {
    const pending = pendingCursorRef.current;
    if (pending === null) return;
    pendingCursorRef.current = null;
    textareaRef.current?.focus();
    textareaRef.current?.setSelectionRange(pending, pending);
  }, [value]);

  const moveCursorAfterChange = (nextCursor: number) => {
    pendingCursorRef.current = nextCursor;
    setCursor(nextCursor);
    setDismissedSuggestions(null);
  };

  const applyKeySuggestion = (name: string) => {
    const next = insertKeyAtCursor(value, name, activeToken);
    onChange(next.condition);
    moveCursorAfterChange(next.cursor);
  };

  const applyValueSuggestion = (optionValue: string) => {
    if (!valueContext) return;
    const next = insertValueAtContext(value, optionValue, valueContext);
    onChange(next.condition);
    moveCursorAfterChange(next.cursor);
  };

  const applySuggestion = (diagnostic: Diagnostic) => {
    if (!diagnostic.suggestion) return;
    const next = `${value.slice(0, diagnostic.start)}${diagnostic.suggestion}${value.slice(diagnostic.end)}`;
    onChange(next);
    moveCursorAfterChange(diagnostic.start + diagnostic.suggestion.length);
  };

  const canApplySuggestion = (diagnostic: Diagnostic) => (
    !!diagnostic.suggestion
    && ["LEGACY_NEGATION", "SPACED_NOT_EQUAL", "KEY_CASE", "UNKNOWN_KEY"].includes(diagnostic.code)
  );

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
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
        onKeyDown={(event) => {
          if (!suggestionCount) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const direction = event.key === "ArrowDown" ? 1 : -1;
            setSelectedSuggestion((current) => (current + direction + suggestionCount) % suggestionCount);
            return;
          }
          if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault();
            const keyOption = visibleKeySuggestions[selectedSuggestion];
            const valueOption = visibleValueSuggestions[selectedSuggestion];
            if (keyOption) applyKeySuggestion(keyOption.name);
            else if (valueOption) applyValueSuggestion(valueOption.value);
            return;
          }
          if (event.key === "Escape" && suggestionsSignature) {
            event.preventDefault();
            setDismissedSuggestions(suggestionsSignature);
          }
        }}
        onKeyUp={(event) => {
          if (["ArrowDown", "ArrowUp", "Enter", "Tab", "Escape"].includes(event.key) && suggestionCount) return;
          setCursor(event.currentTarget.selectionStart ?? 0);
        }}
        aria-autocomplete="list"
        aria-expanded={suggestionsOpen}
        aria-controls={suggestionsOpen ? listboxId : undefined}
        aria-activedescendant={suggestionsOpen ? `${listboxId}-option-${selectedSuggestion}` : undefined}
      />

      {!!visibleKeySuggestions.length && (
        <div id={listboxId} role="listbox" className="max-h-56 overflow-y-auto rounded-md border border-border">
          {visibleKeySuggestions.map((option, index) => (
            <button
              type="button"
              key={option.name}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === selectedSuggestion}
              className={cn("flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent", index === selectedSuggestion && "bg-accent")}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setSelectedSuggestion(index)}
              onClick={() => applyKeySuggestion(option.name)}
            >
              <Wand2Icon className="mr-2 h-3.5 w-3.5 shrink-0 opacity-60" />
              {option.label || option.name}
            </button>
          ))}
          {matches.length > MAX_SUGGESTIONS && (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              +{matches.length - MAX_SUGGESTIONS} more — keep typing to narrow…
            </p>
          )}
          <p className="border-t px-3 py-1.5 text-[11px] text-muted-foreground">↑↓ navigate · Enter/Tab apply · Esc close</p>
        </div>
      )}

      {!!visibleValueSuggestions.length && !!valueContext && (
        <div id={listboxId} role="listbox" className="max-h-56 overflow-y-auto rounded-md border border-border">
          {visibleValueSuggestions.map((option, index) => (
            <button
              type="button"
              key={option.value}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === selectedSuggestion}
              className={cn("flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent", index === selectedSuggestion && "bg-accent")}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setSelectedSuggestion(index)}
              onClick={() => applyValueSuggestion(option.value)}
            >
              <Wand2Icon className="mr-2 h-3.5 w-3.5 shrink-0 opacity-60" />
              {option.label ? `${option.value} - ${option.label}` : option.value}
            </button>
          ))}
          {valueMatches.length > MAX_SUGGESTIONS && (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              +{valueMatches.length - MAX_SUGGESTIONS} more — keep typing to narrow…
            </p>
          )}
          <p className="border-t px-3 py-1.5 text-[11px] text-muted-foreground">↑↓ navigate · Enter/Tab apply · Esc close</p>
        </div>
      )}

      {emptyOutcomeCollections.map((collection) => (
        <div key={collection.name} className="flex items-start gap-1.5 rounded-md border border-yellow-500/40 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-700 dark:text-yellow-400">
          <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            No {collection.name.toLowerCase()} are configured in this script yet. Add them in the script&apos;s {collection.name} section before using this collection.
          </span>
        </div>
      ))}

      {diagnostics.map((diagnostic, index) => {
        const canApply = canApplySuggestion(diagnostic);
        return (
          <div
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

            <div className="min-w-0 space-y-1">
              <p>{diagnostic.message}</p>
              {!!diagnostic.suggestion && (
                <div className="flex flex-wrap items-center gap-2 text-foreground">
                  <span className="text-muted-foreground">Suggested:</span>
                  <code className="max-w-full overflow-x-auto rounded bg-muted px-1.5 py-0.5">
                    {diagnostic.suggestion}
                  </code>
                  {canApply && (
                    <button
                      type="button"
                      className="font-medium text-primary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={disabled}
                      onClick={() => applySuggestion(diagnostic)}
                    >
                      Apply suggestion
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
