import logger from '@/lib/logger';
import socket from '@/lib/socket';
import { _getScreens, _getDiagnoses } from '@/databases/queries/scripts';
import { _saveScreens, _saveDiagnoses } from '@/databases/mutations/scripts';
import { DataKey } from "@/databases/queries/data-keys";

export type UpdateDataKeysRefsParams = {
    broadcastAction?: boolean;
    dataKeys: DataKey[];
    userId?: string;
};

export type UpdateDataKeysRefsResponse = {
    errors?: string[];
    success: boolean;
};

export async function _updateDataKeysRefs({
    dataKeys,
    broadcastAction,
    userId,
}: UpdateDataKeysRefsParams): Promise<UpdateDataKeysRefsResponse> {
    try {
        const getUpdatedDataKey = (uniqueKey?: string) => {
            const key = dataKeys.find(k => k.uniqueKey === uniqueKey);
            return key;
        };

        const { data: screensArr, } = await _getScreens();
        const { data: diagnosesArr, } = await _getDiagnoses();

        let screens: (typeof screensArr[0] & { updated?: boolean; })[] = screensArr;
        let diagnoses: (typeof diagnosesArr[0] & { updated?: boolean; })[] = diagnosesArr;

        diagnoses = diagnoses.map(d => {
            const name = d.key || d.name || '';
            const dataKey = getUpdatedDataKey(d.keyId);

            let updated = !!dataKey;

            const symptoms = (d.symptoms || []).map(item => {
                const dataKey = getUpdatedDataKey(item.keyId);
                if (dataKey) updated = true;
                return {
                    ...item,
                    ...(!dataKey ? {} : {
                        key: dataKey.name,
                        name: dataKey.label,
                    }),
                };
            });

            return {
                ...d,
                key: name,
                symptoms,
                updated,
                ...(!dataKey ? {} : {
                    key: dataKey.name,
                    name: dataKey.label,
                }),
            };
        });

        screens = screens.map(s => {
            const refIdDataKey = !s.refId ? undefined : getUpdatedDataKey(s.refId);
            const dataKey = getUpdatedDataKey(s.keyId);

            let updated = !!dataKey || !!refIdDataKey;

            const items = s.items.map(f => {
                const dataKey = getUpdatedDataKey(f.keyId);
                if (dataKey) updated = true;
                const keyName = f.key ? 'key' : 'id'; 
                return {
                    ...f,
                    ...(!dataKey ? {} : {
                        label: dataKey.label,
                        [keyName]: dataKey.name,
                    }),
                };
            });

            const fields = s.fields.map(f => {
                const dataKey = getUpdatedDataKey(f.keyId);
                if (dataKey) updated = true;
                return {
                    ...f,
                    ...(!dataKey ? {} : {
                        key: dataKey.name,
                        label: dataKey.label,
                    }),
                    items: (f.items || []).map(f => {
                        const dataKey = getUpdatedDataKey(f.keyId);
                        if (dataKey) updated = true;
                        return {
                            ...f,
                            ...(!dataKey ? {} : {
                                value: dataKey.name,
                                label: dataKey.label,
                            }),
                        };
                    }),
                };
            });

            return {
                ...s,
                updated,
                items,
                fields,
                ...(!dataKey ? {} : {
                    key: dataKey.name,
                    label: dataKey.label,
                }),
                ...(!refIdDataKey ? {} : {
                    refId: refIdDataKey.name,
                }),
            };
        });

        diagnoses = diagnoses.filter(s => s.updated).map(({ updated, ...s }) => s);
        screens = screens.filter(s => s.updated).map(({ updated, ...s }) => s);

        if (diagnoses.length) await _saveDiagnoses({ data: diagnoses, userId, });
        if (screens.length) await _saveScreens({ data: screens, userId, });

        const saved = diagnoses.length || screens.length;

        if (broadcastAction && saved) socket.emit('data_changed', 'save_scripts');

        return { success: true, };
    } catch(e: any) {
        logger.error('_updateDataKeysRefs ERROR', e.message);
        return {
            success: false,
            errors: [e.message,]
        };
    }
}
