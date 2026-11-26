'use client';

import { useMemo, useRef, useState } from "react";

import { saveCalculationTemplate } from "@/app/actions/calculation-templates";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    TEMPLATE_INPUT_ID,
    TEMPLATE_VOCABULARY,
    checkTemplateExample,
    fillTemplate,
    getPlaceholders,
    lintTemplate,
    validateTemplate,
    type CalculationTemplate,
    type CalculationTemplateInput,
    type TemplateResultType,
} from "@/lib/calculation-templates";
import { compileCalculation } from "@/lib/conditional-expression";

type Props = {
    /** null = create a new template. */
    template: CalculationTemplate | null;
    onClose: () => void;
    onSaved: () => void;
};

const titleCase = (id: string) => id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' ');

const selectClass = "h-9 rounded-md border bg-background px-2 text-sm";

export function TemplateForm({ template, onClose, onSaved }: Props) {
    const [name, setName] = useState(template?.name || '');
    const [description, setDescription] = useState(template?.description || '');
    const [resultType, setResultType] = useState<TemplateResultType>(template?.resultType || 'number');
    const [formula, setFormula] = useState(template?.formula || '');
    // Labels and types the admin has set, by input id. Inputs themselves come from the {placeholders}.
    const [meta, setMeta] = useState<Record<string, { label: string; type: TemplateResultType; }>>(
        Object.fromEntries((template?.inputs || []).map(i => [i.id, { label: i.label, type: i.type }])),
    );
    const [exampleValues, setExampleValues] = useState<Record<string, string>>(template?.example?.values || {});
    const [expected, setExpected] = useState(template?.example?.expected || '');
    const [showWords, setShowWords] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const formulaRef = useRef<HTMLTextAreaElement>(null);

    const placeholders = useMemo(() => getPlaceholders(formula), [formula]);
    const inputs: CalculationTemplateInput[] = useMemo(
        () => placeholders.map(id => ({
            id,
            label: meta[id]?.label ?? titleCase(id),
            type: meta[id]?.type ?? resultType,
        })),
        [placeholders, meta, resultType],
    );

    const data = { name, description, resultType, formula, inputs, example: { values: exampleValues, expected } };
    const issues = useMemo(() => validateTemplate(data), [name, description, resultType, formula, inputs, exampleValues, expected]); // eslint-disable-line react-hooks/exhaustive-deps

    // The example is shown under its own heading; everything else in the list at the bottom.
    const formulaIssues = issues.filter(i => i.field !== 'example');
    const exampleCheck = useMemo(
        () => (formulaIssues.length || !inputs.length ? null : checkTemplateExample(data)),
        [formulaIssues.length, inputs.length, exampleValues, expected, formula, resultType, inputs], // eslint-disable-line react-hooks/exhaustive-deps
    );
    const warnings = useMemo(() => lintTemplate(formula), [formula]);
    const words = TEMPLATE_VOCABULARY.filter(w => w.for === 'both' || w.for === resultType);

    // Puts a word where the cursor is in the formula, with the cursor inside any brackets it adds.
    const insertWord = (snippet: string) => {
        const el = formulaRef.current;
        const start = el?.selectionStart ?? formula.length;
        const end = el?.selectionEnd ?? formula.length;
        setFormula(formula.slice(0, start) + snippet + formula.slice(end));
        const inside = snippet.indexOf('()') >= 0 ? snippet.indexOf('()') + 1 : snippet.indexOf('(, )') >= 0 ? snippet.indexOf('(, )') + 1 : snippet.length;
        requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(start + inside, start + inside); });
    };

    // What the formula becomes once keys are chosen, shown with stand-in key names.
    const preview = useMemo(() => {
        if (formulaIssues.length || !inputs.length) return null;
        const mapping = Object.fromEntries(inputs.map(i => [i.id, titleCase(i.id).replace(/ /g, '')]));
        const keys = inputs.map(i => ({ name: mapping[i.id], dataType: i.type }));
        const res = compileCalculation(fillTemplate(formula, mapping), { keys });
        return res.hasErrors ? null : res.formula;
    }, [formulaIssues.length, inputs, formula]);

    const setInput = (id: string, patch: Partial<{ label: string; type: TemplateResultType; }>) =>
        setMeta(m => ({ ...m, [id]: { label: m[id]?.label ?? titleCase(id), type: m[id]?.type ?? resultType, ...patch } }));

    const save = async () => {
        setSaving(true);
        setErrors([]);
        try {
            const res = await saveCalculationTemplate({ templateId: template?.templateId, data });
            if (!res.success) { setErrors(res.errors || ['Failed to save template']); return; }
            onSaved();
        } catch (e: any) {
            setErrors([e.message || 'Failed to save template']);
        } finally {
            setSaving(false);
        }
    };

    // Only show problems once there is something to judge, so an empty form isn't a wall of red.
    const showIssues = !!(name || formula) ? formulaIssues : [];

    return (
        <Dialog open onOpenChange={open => { if (!open && !saving) onClose(); }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{template ? 'Edit template' : 'Add template'}</DialogTitle>
                    <DialogDescription>People will see the name and description, then choose a key for each input.</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_9rem] gap-3">
                        <div className="flex flex-col gap-y-1.5">
                            <Label htmlFor="tpl-name">Name</Label>
                            <Input id="tpl-name" value={name} maxLength={80} onChange={e => setName(e.target.value)} placeholder="e.g. BMI" />
                        </div>
                        <div className="flex flex-col gap-y-1.5">
                            <Label htmlFor="tpl-type">Result is a</Label>
                            <select id="tpl-type" className={selectClass} value={resultType} onChange={e => setResultType(e.target.value as TemplateResultType)}>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1.5">
                        <Label htmlFor="tpl-desc">Description (optional)</Label>
                        <Input id="tpl-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="What it calculates, and the units expected" />
                    </div>

                    <div className="flex flex-col gap-y-1.5">
                        <Label htmlFor="tpl-formula">Formula</Label>
                        <Textarea
                            id="tpl-formula"
                            ref={formulaRef}
                            rows={3}
                            className="font-mono text-sm"
                            value={formula}
                            onChange={e => setFormula(e.target.value)}
                            placeholder={resultType === 'date' ? '{lmp} + 280 days' : '{weight} divided by ({height} divided by 100) squared'}
                        />
                        <p className="text-xs text-muted-foreground">
                            Write it with the words under <button type="button" className="underline text-primary" onClick={() => setShowWords(v => !v)}>Words you can use</button>.
                            Put each value to choose in {'{braces}'}, e.g. {'{weight}'}.
                        </p>

                        {showWords && (
                            <div className="rounded-md border bg-muted/30 p-2">
                                <p className="mb-1.5 text-xs text-muted-foreground">Click a word to put it in the formula where the cursor is.</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {words.map(w => (
                                        <button
                                            key={w.label}
                                            type="button"
                                            title={`e.g. ${w.example}`}
                                            onClick={() => insertWord(w.insert)}
                                            className="rounded border bg-background px-2 py-1 text-left text-xs hover:border-primary"
                                        >
                                            <span className="font-medium">{w.label}</span>{' '}
                                            <code className="text-muted-foreground">{w.words}</code>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {warnings.length > 0 && (
                            <ul className="list-disc pl-5 text-xs text-amber-700 dark:text-amber-400">
                                {warnings.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        )}
                    </div>

                    {inputs.length > 0 && (
                        <div className="flex flex-col gap-y-2">
                            <Label>Inputs found in the formula</Label>
                            {inputs.map(i => (
                                <div key={i.id} className="grid grid-cols-[7rem_1fr_7rem] items-center gap-x-2">
                                    <code className="truncate text-xs" title={i.id}>{`{${i.id}}`}</code>
                                    <Input
                                        aria-label={`Label for ${i.id}`}
                                        value={i.label}
                                        onChange={e => setInput(i.id, { label: e.target.value })}
                                        placeholder="What the user sees, e.g. Weight (kg)"
                                    />
                                    <select aria-label={`Type of ${i.id}`} className={selectClass} value={i.type} onChange={e => setInput(i.id, { type: e.target.value as TemplateResultType })}>
                                        <option value="number">Number key</option>
                                        <option value="date">Date key</option>
                                    </select>
                                </div>
                            ))}
                            {placeholders.some(id => !TEMPLATE_INPUT_ID.test(id)) && (
                                <p className="text-xs text-destructive">Names in braces use lowercase letters, digits and underscores, e.g. {'{birth_weight}'}.</p>
                            )}
                        </div>
                    )}

                    {preview && (
                        <div className="rounded-md border border-dashed px-2 py-1.5 text-xs">
                            <span className="text-muted-foreground">Becomes (with example keys): </span>
                            <code className="break-all">{preview}</code>
                        </div>
                    )}

                    {inputs.length > 0 && formulaIssues.length === 0 && (
                        <div className="flex flex-col gap-y-2 rounded-md border p-3">
                            <Label>Worked example (required)</Label>
                            <p className="text-xs text-muted-foreground">
                                Enter sample values and the answer you expect. The template is saved only when its formula gives that answer,
                                so a wrong word or a wrong unit is caught here, not on a ward.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
                                {inputs.map(i => (
                                    <label key={i.id} className="flex items-center gap-x-2 text-xs">
                                        <span className="w-28 shrink-0 truncate font-medium" title={i.label}>{i.label}</span>
                                        <Input
                                            className="h-8"
                                            type={i.type === 'date' ? 'date' : 'text'}
                                            inputMode={i.type === 'date' ? undefined : 'decimal'}
                                            value={exampleValues[i.id] ?? ''}
                                            onChange={e => setExampleValues(v => ({ ...v, [i.id]: e.target.value }))}
                                            placeholder={i.type === 'date' ? '' : 'e.g. 70'}
                                        />
                                    </label>
                                ))}
                                <label className="flex items-center gap-x-2 text-xs sm:col-span-2">
                                    <span className="w-28 shrink-0 font-medium">Expected answer</span>
                                    <Input
                                        className="h-8"
                                        type={resultType === 'date' ? 'date' : 'text'}
                                        inputMode={resultType === 'date' ? undefined : 'decimal'}
                                        value={expected}
                                        onChange={e => setExpected(e.target.value)}
                                        placeholder={resultType === 'date' ? '' : 'e.g. 22.9 (compared to the decimals you type)'}
                                    />
                                </label>
                            </div>
                            {exampleCheck && (
                                <p className={exampleCheck.ok ? 'text-xs text-green-700 dark:text-green-400' : 'text-xs text-destructive'}>
                                    {exampleCheck.ok ? `\u2713 The formula gives ${exampleCheck.actual}, as expected.` : exampleCheck.message}
                                </p>
                            )}
                        </div>
                    )}

                    {[...showIssues.map(i => i.message), ...errors].length > 0 && (
                        <ul className="list-disc pl-5 text-xs text-destructive">
                            {[...new Set([...showIssues.map(i => i.message), ...errors])].map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancel</Button>
                    <Button type="button" disabled={saving || issues.length > 0} onClick={save}>
                        {saving ? 'Saving…' : template ? 'Save changes' : 'Add template'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
