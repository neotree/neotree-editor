import { eq, max } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import { adminAuditLogs, calculationTemplates } from '@/databases/pg/schema';
import { slugify, type CalculationTemplateData } from '@/lib/calculation-templates';

export const CALCULATION_TEMPLATES_AUDIT_AREA = 'calculation_templates';

const snapshot = (t: typeof calculationTemplates.$inferSelect) => ({
    templateId: t.templateId, slug: t.slug, name: t.name, description: t.description,
    resultType: t.resultType, formula: t.formula, inputs: t.inputs, example: t.example,
});

/** An unused slug derived from the name ("bmi", then "bmi-2", ...). */
async function uniqueSlug(tx: Pick<typeof db, 'select'>, name: string) {
    const base = slugify(name);
    for (let n = 1; n < 1000; n++) {
        const slug = n === 1 ? base : `${base}-${n}`;
        const [hit] = await tx.select({ id: calculationTemplates.id }).from(calculationTemplates).where(eq(calculationTemplates.slug, slug)).limit(1);
        if (!hit) return slug;
    }
    throw new Error('Could not generate a unique slug for this template');
}

/** Creates a template (no templateId) or updates one. New templates go to the end of the list. */
export async function _saveCalculationTemplate(params: { templateId?: string; data: CalculationTemplateData; userId?: string | null; }) {
    const { templateId, data, userId } = params;
    const values = {
        name: data.name.trim(),
        description: (data.description || '').trim(),
        resultType: data.resultType,
        formula: data.formula.trim(),
        inputs: data.inputs.map(i => ({ id: i.id, label: i.label.trim(), type: i.type })),
        example: data.example ? {
            values: Object.fromEntries(data.inputs.map(i => [i.id, `${data.example!.values?.[i.id] ?? ''}`.trim()])),
            expected: `${data.example.expected ?? ''}`.trim(),
        } : null,
    };

    return db.transaction(async tx => {
        if (!templateId) {
            const [{ top }] = await tx.select({ top: max(calculationTemplates.sortOrder) }).from(calculationTemplates);
            const [created] = await tx.insert(calculationTemplates)
                .values({ ...values, slug: await uniqueSlug(tx, values.name), sortOrder: (top ?? 0) + 10, updatedByUserId: userId || null })
                .returning();
            await tx.insert(adminAuditLogs).values({
                area: CALCULATION_TEMPLATES_AUDIT_AREA, action: 'template_created', actorUserId: userId || null, afterState: snapshot(created),
            });
            return created;
        }

        const [current] = await tx.select().from(calculationTemplates).where(eq(calculationTemplates.templateId, templateId)).for('update').limit(1);
        if (!current) throw new Error('Template not found');

        const [updated] = await tx.update(calculationTemplates)
            .set({ ...values, updatedByUserId: userId || null, updatedAt: new Date() })
            .where(eq(calculationTemplates.id, current.id))
            .returning();
        await tx.insert(adminAuditLogs).values({
            area: CALCULATION_TEMPLATES_AUDIT_AREA, action: 'template_updated', actorUserId: userId || null,
            beforeState: snapshot(current), afterState: snapshot(updated),
        });
        return updated;
    });
}

export async function _deleteCalculationTemplate(params: { templateId: string; userId?: string | null; }) {
    return db.transaction(async tx => {
        const [deleted] = await tx.delete(calculationTemplates).where(eq(calculationTemplates.templateId, params.templateId)).returning();
        if (!deleted) throw new Error('Template not found');
        await tx.insert(adminAuditLogs).values({
            area: CALCULATION_TEMPLATES_AUDIT_AREA, action: 'template_deleted', actorUserId: params.userId || null, beforeState: snapshot(deleted),
        });
        return deleted;
    });
}
