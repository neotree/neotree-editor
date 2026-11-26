'use server';

import { revalidatePath } from 'next/cache';

import logger from '@/lib/logger';
import { _deleteCalculationTemplate, _saveCalculationTemplate } from '@/databases/mutations/calculation-templates';
import { _getCalculationTemplates } from '@/databases/queries/calculation-templates';
import { validateTemplate, type CalculationTemplate, type CalculationTemplateData } from '@/lib/calculation-templates';
import { isAllowed } from './is-allowed';

// Any signed-in user may list templates (the calculation editor offers them); only administrators
// may change them. Session-based on purpose: an API key must not manage templates.
async function requireAdmin() {
    const { user } = await isAllowed();

    if (!user || (user.role !== 'admin' && user.role !== 'super_user')) {
        throw new Error('Forbidden: only administrators can manage calculation templates');
    }

    return user;
}

const toTemplate = (r: Awaited<ReturnType<typeof _getCalculationTemplates>>[number]): CalculationTemplate => ({
    templateId: r.templateId,
    slug: r.slug,
    name: r.name,
    description: r.description,
    resultType: r.resultType,
    formula: r.formula,
    inputs: r.inputs,
    example: r.example,
    sortOrder: r.sortOrder,
});

export async function getCalculationTemplates() {
    try {
        await isAllowed();
        const rows = await _getCalculationTemplates();
        return { success: true as const, templates: rows.map(toTemplate) };
    } catch(e: any) {
        logger.error('getCalculationTemplates ERROR', e.message);
        return { success: false as const, errors: [e.message], templates: [] as CalculationTemplate[] };
    }
}

export async function saveCalculationTemplate(input: { templateId?: string; data: CalculationTemplateData; }) {
    try {
        const user = await requireAdmin();

        const issues = validateTemplate(input?.data || {});
        if (issues.length) return { success: false as const, errors: issues.map(i => i.message) };

        const saved = await _saveCalculationTemplate({ templateId: input.templateId, data: input.data, userId: user.userId });

        revalidatePath('/calculation-templates');

        return { success: true as const, template: toTemplate(saved) };
    } catch(e: any) {
        logger.error('saveCalculationTemplate ERROR', e.message);
        return { success: false as const, errors: [e.message] };
    }
}

export async function deleteCalculationTemplate(templateId: string) {
    try {
        const user = await requireAdmin();

        await _deleteCalculationTemplate({ templateId, userId: user.userId });

        revalidatePath('/calculation-templates');

        return { success: true as const };
    } catch(e: any) {
        logger.error('deleteCalculationTemplate ERROR', e.message);
        return { success: false as const, errors: [e.message] };
    }
}
