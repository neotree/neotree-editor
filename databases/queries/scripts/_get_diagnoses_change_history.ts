import db from "@/databases/pg/drizzle";

export type GetDiagnosesChangeHistoryParams = {

};

export type GetDiagnosesChangeHistoryResponse = {
    errors?: string[];
    history: { 
        [diagnosisId: string]: {
            [version: string]: any[];
        };
    };
};

export async function _getDiagnosesChangeHistory(params?: GetDiagnosesChangeHistoryParams): Promise<GetDiagnosesChangeHistoryResponse> {
    try {
        const history: GetDiagnosesChangeHistoryResponse['history'] = {};

        const data = await db.query.diagnosesHistory.findMany({});

        data.forEach((s: any) => {
            const hasChanges = true; // s.changes.oldValues.length || s.changes.newValues.length
            if (hasChanges) {
                history[s.diagnosisId] = history[s.diagnosisId] || {};
                history[s.diagnosisId][s.version] = history[s.diagnosisId][s.version] || [];
                history[s.diagnosisId][s.version].push(s.changes);
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
