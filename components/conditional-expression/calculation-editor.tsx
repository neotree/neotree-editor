"use client";

import { useEffect, useMemo, useState, type FocusEvent } from "react";

import { getCalculationTemplates } from "@/app/actions/calculation-templates";
import { applyTemplate, getCompatibleKeys, type CalculationTemplate } from "@/lib/calculation-templates";

import {
  compileCalculation,
  evaluateCalculation,
  getCalculationKeys,
  mergeConditionKeys,
  validateReferenceExpression,
} from "@/lib/conditional-expression";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConditionEditor, type ConditionEditorProps } from "./condition-editor";

export interface CalculationEditorProps extends Omit<ConditionEditorProps, "mode"> {
  /** "date" shows date examples; "number" shows number examples. */
  resultType: "number" | "date";
}

const NUMBER_HELP = [
  ["$Weight plus $Height", "add"],
  ["$Age divided by 24", "divide (also: times, minus, mod)"],
  ["round down($Age divided by 24)", "round down / round up / round / absolute / smallest / largest"],
  ["$Weight and $Height", "and = times"],
  ["$Weight divided by ($Height divided by 100) squared", "BMI: squared, cubed, ^ or \"to the power of\""],
  ["square root of ($Weight times $Height divided by 3600)", "square root of / cube root of"],
  ["$Weight plus 1 or $Height times 2", "or = use the first one that has a value"],
];
const DATE_HELP = [
  ["$LMPDate + 280 days", "days, weeks, months or years"],
  ["$LNMP + 7 days - 3 months", "chain as many steps as you need"],
  ["$DOBTOB + 280 days or $FALLBACKDATE + 7 days", "or = use the first date that has a value"],
];

/**
 * Authoring surface for field calculations. Users may type plain language; it is checked live, shown as
 * the formula that will be stored, and converted when the field loses focus. Already-valid formulas are
 * never rewritten.
 */
export function CalculationEditor({ resultType, ...props }: CalculationEditorProps) {
  const { value, onChange, keys, extraKeys, keysReady: keysReadyProp } = props;
  const [plain, setPlain] = useState("");
  const [panel, setPanel] = useState<"plain" | "try" | "template" | null>(null);
  const [templates, setTemplates] = useState<CalculationTemplate[] | null>(null);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState("");
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [sample, setSample] = useState<Record<string, string>>({});

  const mergedKeys = useMemo(
    () => (extraKeys?.length ? mergeConditionKeys(keys, extraKeys) : keys),
    [keys, extraKeys],
  );
  const keysReady = keysReadyProp ?? keys.length > 0;
  const ctx = useMemo(
    () => ({
      keys: mergedKeys,
      allowSelf: props.allowSelf,
      selfDataType: props.selfDataType,
      unavailableKeys: props.unavailableKeys,
      skipKeyResolution: !keysReady,
    }),
    [mergedKeys, props.allowSelf, props.selfDataType, props.unavailableKeys, keysReady],
  );

  const compiled = useMemo(() => compileCalculation(value || "", ctx), [value, ctx]);
  const refKeys = useMemo(() => getCalculationKeys(compiled.formula), [compiled.formula]);
  const tried = useMemo(() => {
    if (!value?.trim() || compiled.hasErrors) return null;
    return evaluateCalculation(compiled.formula, sample, ctx);
  }, [value, compiled, sample, ctx]);

  // Typing plain language converts it into the Reference expression box as you type.
  const plainResult = useMemo(() => (plain.trim() ? compileCalculation(plain, ctx) : null), [plain, ctx]);
  const handlePlain = (text: string) => {
    setPlain(text);
    if (!text.trim()) return;
    const r = compileCalculation(text, ctx);
    if (!r.hasErrors) onChange(r.formula);
  };
  const plainErrors = plainResult?.diagnostics.filter((d) => d.severity === "error") ?? [];

  // Convert when focus leaves the whole editor (not when moving between its own controls).
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    if (compiled.changed && !compiled.hasErrors) onChange(compiled.formula);
  };

  // Templates are loaded the first time the panel opens, then kept.
  useEffect(() => {
    if (panel !== "template" || templates) return;
    let cancelled = false;
    getCalculationTemplates().then((res) => {
      if (cancelled) return;
      if (res.success) setTemplates(res.templates);
      else setTemplatesError(res.errors?.join(", ") || "Couldn't load templates.");
    });
    return () => { cancelled = true; };
  }, [panel, templates]);

  const available = useMemo(() => (templates || []).filter((t) => t.resultType === resultType), [templates, resultType]);
  const template = available.find((t) => t.templateId === templateId) || null;
  const chooseTemplate = (id: string) => {
    setTemplateId(id);
    const t = available.find((x) => x.templateId === id);
    // Pre-select a key whose name is the input's name (a key called "Weight" for {weight}); the user can change it.
    setPicked(Object.fromEntries((t?.inputs || []).flatMap((i) => {
      const hit = getCompatibleKeys(mergedKeys, i.type).find((k) => k.name.toLowerCase() === i.id.toLowerCase());
      return hit ? [[i.id, hit.name]] : [];
    })));
  };
  const built = useMemo(() => (template ? applyTemplate(template, picked, mergedKeys) : null), [template, picked, mergedKeys]);

  const help = resultType === "date" ? DATE_HELP : NUMBER_HELP;
  const hasErrors = validateReferenceExpression(value || "", ctx).hasErrors;

  const isDateKey = (name: string) => (mergedKeys.find((k) => k.name === name)?.dataType || "").startsWith("date");
  const tab = (id: "plain" | "try" | "template", label: string) => (
    <button
      type="button"
      onClick={() => setPanel((p) => (p === id ? null : id))}
      aria-expanded={panel === id}
      className={cn(
        "rounded-full border-2 border-primary px-4 py-1.5 text-xs font-semibold shadow-sm transition-colors",
        panel === id ? "bg-primary text-primary-foreground" : "bg-background text-primary hover:bg-primary/10",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-y-3" onBlur={handleBlur}>
      <ConditionEditor {...props} mode="reference" />

      {compiled.changed && !compiled.hasErrors && (
        <div className="rounded-md border border-dashed px-2 py-1.5 text-xs">
          <span className="text-muted-foreground">Will be saved as </span>
          <code className="break-all">{compiled.formula}</code>{" "}
          <button type="button" className="underline text-primary" onClick={() => onChange(compiled.formula)}>
            Use it now
          </button>
        </div>
      )}

      <div className="flex items-center gap-x-2 mt-1 mb-2">
        {tab("template", "Use a template")}
        {tab("plain", "Write in plain language")}
        {tab("try", "Try it")}
      </div>

      {panel === "template" && (
        <div className="rounded-md border bg-muted/30 p-3 flex flex-col gap-y-2">
          {templatesError ? (
            <p className="text-xs text-destructive">{templatesError}</p>
          ) : !templates ? (
            <p className="text-xs text-muted-foreground">Loading templates…</p>
          ) : available.length === 0 ? (
            <p className="text-xs text-muted-foreground">No {resultType} templates yet. An administrator can add them under Calculation Templates.</p>
          ) : (
            <>
              <select
                aria-label="Template"
                className="h-9 rounded-md border bg-background px-2 text-sm"
                disabled={props.disabled}
                value={templateId}
                onChange={(e) => chooseTemplate(e.target.value)}
              >
                <option value="">Choose a template…</option>
                {available.map((t) => <option key={t.templateId} value={t.templateId}>{t.name}</option>)}
              </select>
              {template && (
                <>
                  {template.description && <p className="text-xs text-muted-foreground">{template.description}</p>}
                  {template.example && (
                    <p className="text-xs text-muted-foreground">
                      Example: {template.inputs.map((i) => `${i.label} = ${template.example!.values?.[i.id] ?? ""}`).join(", ")} gives {template.example.expected}.
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
                    {template.inputs.map((i) => {
                      const options = getCompatibleKeys(mergedKeys, i.type);
                      return (
                        <label key={i.id} className="flex items-center gap-x-2 text-xs">
                          <span className="w-28 shrink-0 font-medium">{i.label}</span>
                          <select
                            aria-label={i.label}
                            className="h-8 min-w-0 flex-1 rounded-md border bg-background px-2 text-sm"
                            disabled={props.disabled}
                            value={picked[i.id] || ""}
                            onChange={(e) => setPicked((p) => ({ ...p, [i.id]: e.target.value }))}
                          >
                            <option value="">Choose a key…</option>
                            {options.map((k) => <option key={k.name} value={k.name}>${k.name}</option>)}
                          </select>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between gap-x-3 text-xs">
                    <span className="min-w-0 break-all">
                      {built?.ok ? <><span className="text-muted-foreground">Formula: </span><code>{built.formula}</code></>
                        : <span className="text-muted-foreground">{built?.error}</span>}
                    </span>
                    <button
                      type="button"
                      disabled={props.disabled || !built?.ok}
                      onClick={() => { if (built?.ok) { onChange(built.formula); setPanel(null); } }}
                      className="shrink-0 rounded-md bg-primary px-3 py-1.5 font-semibold text-primary-foreground disabled:opacity-50"
                    >
                      Use this formula
                    </button>
                  </div>
                  {value?.trim() && <p className="text-xs text-muted-foreground">This replaces the calculation above.</p>}
                </>
              )}
            </>
          )}
        </div>
      )}

      {panel === "plain" && (
        <div className="rounded-md border bg-muted/30 p-3 flex flex-col gap-y-2">
          <Textarea
            id="calculation-plain"
            rows={2}
            className="bg-background text-sm"
            disabled={props.disabled}
            value={plain}
            onChange={(e) => handlePlain(e.target.value)}
            placeholder={resultType === "date" ? "e.g. $LMPDate + 280 days" : "e.g. round down($Age divided by 24) plus $Weight"}
          />
          {plainErrors.length > 0 ? (
            <ul className="text-xs text-destructive list-disc pl-5">
              {plainErrors.slice(0, 2).map((d, i) => <li key={i}>{d.message}</li>)}
            </ul>
          ) : plainResult ? (
            <div className="text-xs text-green-700 dark:text-green-400">✓ Converted into the formula above</div>
          ) : (
            <div className="text-xs text-muted-foreground">Type in everyday words; the formula above fills in as you type. Keys start with $.</div>
          )}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Examples:</span>
            {help.map(([example]) => (
              <button
                key={example}
                type="button"
                disabled={props.disabled}
                onClick={() => handlePlain(example)}
                className="rounded border bg-background px-1.5 py-0.5 font-mono hover:border-primary"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {panel === "try" && (
        <div className="rounded-md border bg-muted/30 p-3 flex flex-col gap-y-2">
          {!value?.trim() || hasErrors || refKeys.length === 0 ? (
            <p className="text-xs text-muted-foreground">Enter a valid calculation above to try it with sample values.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
                {refKeys.map((name) => (
                  <label key={name} className="flex items-center gap-x-2 text-xs">
                    <span className="w-24 shrink-0 truncate font-medium">${name}</span>
                    <Input
                      className="h-8 bg-background"
                      type={isDateKey(name) ? "date" : "text"}
                      value={sample[name] ?? ""}
                      onChange={(e) => setSample((s) => ({ ...s, [name]: e.target.value }))}
                      placeholder={isDateKey(name) ? "" : "e.g. 32.3"}
                    />
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between gap-x-3 text-xs">
                <span className={tried?.ok ? "text-sm font-semibold" : "text-muted-foreground"}>
                  {tried ? (tried.ok ? `Result: ${tried.value}` : tried.error) : ""}
                </span>
                <span className="text-muted-foreground">Preview only — the device calculates the real value.</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
