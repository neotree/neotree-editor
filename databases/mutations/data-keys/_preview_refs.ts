import { _getDataKeys } from "@/databases/queries/data-keys";
import { _updateDataKeysRefs, type UpdateDataKeysRefsResponse } from "./_update_data_keys_refs";
import type { SaveDataKeysData } from "./_save";

export async function _previewDataKeysRefsImpact({
    data,
}: {
    data: SaveDataKeysData[];
}): Promise<UpdateDataKeysRefsResponse> {
    try {
        const uuids = data.map(d => d.uuid || '').filter(Boolean);
        const uniqueKeys = data.map(d => d.uniqueKey || '').filter(Boolean);

        const byUuid = await _getDataKeys({ dataKeysIds: uuids, returnDraftsIfExist: true });
        const byUnique = await _getDataKeys({ uniqueKeys, returnDraftsIfExist: true });

        const existingMap: { [key: string]: typeof byUuid.data[0]; } = {};
        [...byUuid.data, ...byUnique.data].forEach(item => {
            if (item.uuid) existingMap[item.uuid] = item;
            if (item.uniqueKey) existingMap[item.uniqueKey] = item;
        });

        const previousDataKeys: NonNullable<Parameters<typeof _updateDataKeysRefs>[0]['previousDataKeys']> = [];
        const dataKeysToEvaluate: typeof byUuid.data = [];

        data.forEach(item => {
            const existing = (
                (item.uuid ? existingMap[item.uuid] : undefined) ||
                (item.uniqueKey ? existingMap[item.uniqueKey] : undefined)
            );
            if (!existing?.uniqueKey) return;

            previousDataKeys.push({
                uniqueKey: existing.uniqueKey,
                name: existing.name,
                label: existing.label,
                dataType: existing.dataType,
            });

            dataKeysToEvaluate.push({
                ...existing,
                ...item,
                uniqueKey: existing.uniqueKey,
            });
        });

        if (!dataKeysToEvaluate.length) {
            return {
                success: true,
                info: {
                    candidateScripts: 0,
                    fetchedScreens: 0,
                    fetchedDiagnoses: 0,
                    updatedScreens: 0,
                    updatedDiagnoses: 0,
                    savedScreens: 0,
                    savedDiagnoses: 0,
                    chunkRetries: 0,
                    matchedByUniqueKey: 0,
                    matchedByLegacyName: 0,
                    matchedByLegacyLabel: 0,
                    ambiguousLegacySkips: 0,
                },
                affected: {
                    scripts: [],
                    screens: [],
                    diagnoses: [],
                },
            };
        }

        return await _updateDataKeysRefs({
            dataKeys: dataKeysToEvaluate,
            previousDataKeys,
            dryRun: true,
        });
    } catch (e: any) {
        return {
            success: false,
            errors: [e.message],
        };
    }
}
