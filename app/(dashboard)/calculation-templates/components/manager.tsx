'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { deleteCalculationTemplate } from "@/app/actions/calculation-templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import type { CalculationTemplate } from "@/lib/calculation-templates";
import { TemplateForm } from "./template-form";

type Props = {
    initialTemplates: CalculationTemplate[];
    loadError: string | null;
};

export function CalculationTemplatesManager({ initialTemplates, loadError }: Props) {
    const router = useRouter();
    const { alert } = useAlertModal();
    const { confirm } = useConfirmModal();
    const [editing, setEditing] = useState<CalculationTemplate | 'new' | null>(null);

    const remove = (t: CalculationTemplate) => {
        confirm(async () => {
            const res = await deleteCalculationTemplate(t.templateId);
            if (!res.success) {
                alert({ title: 'Error', message: res.errors?.join('\n') || 'Failed to delete template', variant: 'error' });
                return;
            }
            router.refresh();
        }, {
            title: 'Delete template',
            message: `Delete "${t.name}"? Formulas already created from it are not affected.`,
            positiveLabel: 'Delete',
            danger: true,
        });
    };

    return (
        <div className="flex flex-col gap-y-4">
            <Card>
                <CardHeader className="flex-row items-start justify-between gap-x-4 space-y-0">
                    <div className="space-y-1.5">
                        <CardTitle>Calculation templates</CardTitle>
                        <CardDescription>
                            Ready-made formulas people can pick in a field&apos;s calculation (&ldquo;Use a template&rdquo;).
                            Write the formula in plain language and put each value the user must choose in {'{braces}'}, for example{' '}
                            <code>{'{weight} divided by ({height} divided by 100) squared'}</code>.
                        </CardDescription>
                    </div>
                    <Button type="button" onClick={() => setEditing('new')}>
                        <Plus className="h-4 w-4 mr-1" /> Add template
                    </Button>
                </CardHeader>

                <CardContent className="flex flex-col gap-y-2">
                    {loadError && <p className="text-sm text-destructive">{loadError}</p>}
                    {!loadError && !initialTemplates.length && (
                        <p className="text-sm text-muted-foreground">No templates yet. Add the first one.</p>
                    )}

                    {initialTemplates.map(t => (
                        <div key={t.templateId} className="flex items-start justify-between gap-x-4 rounded-md border p-3">
                            <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-x-2">
                                    <span className="font-medium">{t.name}</span>
                                    <Badge variant="outline">{t.resultType === 'date' ? 'Date' : 'Number'}</Badge>
                                </div>
                                {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                                <code className="block break-words text-xs text-muted-foreground">{t.formula}</code>
                            </div>
                            <div className="flex shrink-0 items-center gap-x-1">
                                <Button type="button" variant="ghost" size="icon" aria-label={`Edit ${t.name}`} onClick={() => setEditing(t)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" aria-label={`Delete ${t.name}`} onClick={() => remove(t)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {editing && (
                <TemplateForm
                    template={editing === 'new' ? null : editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => { setEditing(null); router.refresh(); }}
                />
            )}
        </div>
    );
}
