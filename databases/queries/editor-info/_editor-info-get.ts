import db from "@/databases/pg/drizzle";
import { editorInfo } from "@/databases/pg/schema";
import logger from "@/lib/logger";

export type GetEditorInfoResults = {
    data: null | typeof editorInfo.$inferSelect;
    errors?: string[];
};

export async function _getEditorInfo(): Promise<GetEditorInfoResults> {
    try {
        const data = await db.query.editorInfo.findFirst();

        return  { data: data || null, };
    } catch(e: any) {
        logger.error('_getEditorInfo ERROR', e.message);
        return { data: null, errors: [e.message], };
    }
}
