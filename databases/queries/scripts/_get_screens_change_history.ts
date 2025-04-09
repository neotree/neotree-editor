import db from "@/databases/pg/drizzle";

export type GetScreensChangeHistoryParams = {

};

export type GetScreensChangeHistoryResponse = {
    errors?: string[];
    history: { 
        [screenId: string]: {
            [version: string]: any[];
        };
    };
};

export async function _getScreensChangeHistory(params?: GetScreensChangeHistoryParams): Promise<GetScreensChangeHistoryResponse> {
    try {
        const history: GetScreensChangeHistoryResponse['history'] = {};

        const data = await db.query.screensHistory.findMany({});

        data.forEach((s: any) => {
            const hasChanges = true; // s.changes.oldValues.length || s.changes.newValues.length
            if (hasChanges) {
                history[s.screenId] = history[s.screenId] || {};
                history[s.screenId][s.version] = history[s.screenId][s.version] || [];
                history[s.screenId][s.version].push(s.changes);
            }
        });

        return { history, };
    } catch(e: any) {
        return {
            errors: [e.message],
            history: {},
        };
    }
}
