import { getDataKeysUsageExportRows, previewDataKeysRefsImpact } from "@/app/actions/data-keys";
import { DataKey } from "@/databases/queries/data-keys/_get";
import { DataKeysUsageExportRow } from "@/types/data-keys-usage-export";

type DataKeyUsage = {
    info?: {
        candidateScripts: number;
        fetchedScreens: number;
        fetchedDiagnoses: number;
        updatedScreens: number;
        updatedDiagnoses: number;
        savedScreens: number;
        savedDiagnoses: number;
        chunkRetries: number;
        matchedByUniqueKey: number;
        matchedByLegacyName: number;
        matchedByLegacyLabel: number;
        ambiguousLegacySkips: number;
    };
    affected?: {
        scripts: { scriptId: string; scriptTitle?: string }[];
        screens: { id: string; scriptId: string; scriptTitle?: string; title: string; type: 'screen' | 'diagnosis' }[];
        diagnoses: { id: string; scriptId: string; scriptTitle?: string; title: string; type: 'screen' | 'diagnosis' }[];
    };
    rows: DataKeysUsageExportRow[];
    summary: {
        totalRows: number;
        confidentialTrue: number;
        confidentialFalse: number;
        scriptsCount: number;
    };
    errors?: string[];
};

export type DataKeyWithUsage = DataKey & {
    usage: DataKeyUsage;
};

export async function getDataKeysWithUsage(dataKeys: DataKey[]): Promise<DataKeyWithUsage[]> {
    const usageRowsRes = await getDataKeysUsageExportRows({
        dataKeys: Array.from(new Set(dataKeys.map(k => k.name).filter(Boolean))),
    });
    const rowsByDataKey = new Map<string, DataKeysUsageExportRow[]>();
    (usageRowsRes.data || []).forEach(row => {
        if (!rowsByDataKey.has(row.DataKey)) rowsByDataKey.set(row.DataKey, []);
        rowsByDataKey.get(row.DataKey)!.push(row);
    });

    const usageEntries = await Promise.all(
        dataKeys.map(async (dataKey) => {
            const res = await previewDataKeysRefsImpact({
                data: [{
                    uuid: dataKey.uuid,
                    uniqueKey: dataKey.uniqueKey,
                    name: dataKey.name,
                    label: dataKey.label,
                    dataType: dataKey.dataType,
                    refId: dataKey.refId || '',
                    options: dataKey.options || [],
                    version: dataKey.version,
                }],
            });

            const rows = rowsByDataKey.get(dataKey.name || '') || [];
            const scripts = new Set(rows.map(r => r.ScriptTitle).filter(Boolean));
            const confidentialTrue = rows.filter(r => r.Confidential === 'true').length;
            const confidentialFalse = rows.filter(r => r.Confidential === 'false').length;

            return {
                ...dataKey,
                usage: {
                    info: res.info,
                    affected: res.affected,
                    rows,
                    summary: {
                        totalRows: rows.length,
                        confidentialTrue,
                        confidentialFalse,
                        scriptsCount: scripts.size,
                    },
                    errors: [
                        ...(res.errors || []),
                        ...(usageRowsRes.errors || []),
                    ],
                },
            } satisfies DataKeyWithUsage;
        }),
    );

    return usageEntries;
}

