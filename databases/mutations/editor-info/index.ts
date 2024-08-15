import { eq } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { editorInfo } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import socket from "@/lib/socket";

export type SaveEditorInfoParams = {
    data: Partial<typeof editorInfo.$inferSelect>;
    increaseVersion?: boolean;
    broadcastAction?: boolean;
};

export type SaveEditorInfoResults = {
    data: null | typeof editorInfo.$inferSelect;
    success: boolean;
    errors?: string[];
};

export async function _saveEditorInfo({ data, increaseVersion, broadcastAction }: SaveEditorInfoParams): Promise<SaveEditorInfoResults> {
    try {
        let info = await db.query.editorInfo.findFirst();

        if (info) {
            const dataVersion = increaseVersion ? (info.dataVersion + 1) : info.dataVersion;
            await db.update(editorInfo).set({ ...data, dataVersion, }).where(eq(editorInfo.id, info.id));
        }

        info = await db.query.editorInfo.findFirst();

        if (!!info && broadcastAction) socket.emit('data_changed', 'save_editor_info');

        return  { data: info || null, success: !!info, };
    } catch(e: any) {
        logger.error('_saveEditorInfo ERROR', e.message);
        return { data: null, success: false, errors: [e.message], };
    }
}
