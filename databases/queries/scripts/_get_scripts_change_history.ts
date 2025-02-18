import db from "@/databases/pg/drizzle";

export type GetScriptsChangeHistoryParams = {

};

export type GetScriptsChangeHistoryResponse = {
    errors?: string[];
    history: { 
        [scriptId: string]: {
            [version: string]: any[];
        };
    };
};

export async function _getScriptsChangeHistory(params?: GetScriptsChangeHistoryParams): Promise<GetScriptsChangeHistoryResponse> {
    try {
        const history: GetScriptsChangeHistoryResponse['history'] = {};

        const data = await db.query.scriptsHistory.findMany({});

        data.forEach((s: any) => {
            const hasChanges = true; // s.changes.oldValues.length || s.changes.newValues.length
            if (hasChanges) {
                history[s.scriptId] = history[s.scriptId] || {};
                history[s.scriptId][s.version] = history[s.scriptId][s.version] || [];
                history[s.scriptId][s.version].push(s.changes);
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
