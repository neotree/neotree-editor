import db from "@/databases/pg/drizzle";

export type GetProblemsChangeHistoryParams = {

};

export type GetProblemsChangeHistoryResponse = {
    errors?: string[];
    history: { 
        [problemId: string]: {
            [version: string]: any[];
        };
    };
};

export async function _getProblemsChangeHistory(params?: GetProblemsChangeHistoryParams): Promise<GetProblemsChangeHistoryResponse> {
    try {
        const history: GetProblemsChangeHistoryResponse['history'] = {};

        const data = await db.query.problemsHistory.findMany({});

        data.forEach((s: any) => {
            const hasChanges = true; // s.changes.oldValues.length || s.changes.newValues.length
            if (hasChanges) {
                history[s.problemId] = history[s.problemId] || {};
                history[s.problemId][s.version] = history[s.problemId][s.version] || [];
                history[s.problemId][s.version].push(s.changes);
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
