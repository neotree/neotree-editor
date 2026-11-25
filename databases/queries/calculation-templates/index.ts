import { asc, eq } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import { calculationTemplates } from '@/databases/pg/schema';

export async function _getCalculationTemplates() {
    return db.select().from(calculationTemplates).orderBy(asc(calculationTemplates.sortOrder), asc(calculationTemplates.name));
}

export async function _getCalculationTemplate(templateId: string) {
    const [row] = await db.select().from(calculationTemplates).where(eq(calculationTemplates.templateId, templateId)).limit(1);
    return row || null;
}
