'use client';

import { useMemo, useState } from "react";

import { saveCalculationTemplate } from "@/app/actions/calculation-templates";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    TEMPLATE_INPUT_ID,
    fillTemplate,
    getPlaceholders,
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
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const placeholders = useMemo(() => getPlaceholders(formula), [formula]);
    const inputs: CalculationTemplateInput[] = useMemo(
        () => placeholders.map(id => ({
            id,
            label: meta[id]?.label ?? titleCase(id),
            type: meta[id]?.type ?? resultType,
        })),
        [placeholders, meta, resultType],
    );

    const data = { name, description, resultType, formula, inputs };
    const issues = useMemo(() => validateTemplate(data), [name, description, resultType, formula, inputs]); // eslint-disable-line react-hooks/exhaustive-deps

    // What the formula becomes once keys are chosen, shown with stand-in key names.
    const preview = useMemo(() => {
        if (issues.length || !inputs.length) return null;
        const mapping = Object.fromEntries(inputs.map(i => [i.id, titleCase(i.id).replace(/ /g, '')]));
        const keys = inputs.map(i => ({ name: mapping[i.id], dataType: i.type }));
        const res = compileCalculation(fillTemplate(formula, mapping), { keys });
        return res.hasErrors ? null : res.formula;
    }, [issues, inputs, formula]);

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
    const showIssues = !!(name || formula) ? issues : [];

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
                            rows={3}
                            className="font-mono text-sm"
                            value={formula}
                            onChange={e => setFormula(e.target.value)}
                            placeholder={resultType === 'date' ? '{lmp} + 280 days' : '{weight} divided by ({height} divided by 100) squared'}
                        />
                        <p className="text-xs text-muted-foreground">
                            Plain language: plus, minus, times, divided by, squared, cubed, square root of, round down(...).
                            Put each value to choose in {'{braces}'}, e.g. {'{weight}'}.
                        </p>
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
