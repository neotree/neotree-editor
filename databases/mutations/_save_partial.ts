import * as schema from '@/databases/pg/schema';
import { _getScripts } from '@/databases/queries/scripts/_scripts_get';
import { _getScreens } from '@/databases/queries/scripts/_screens_get';
import { _getDiagnoses } from '@/databases/queries/scripts/_diagnoses_get';
import { _saveScripts } from '@/databases/mutations/scripts/_scripts_save';
import { _saveScreens } from '@/databases/mutations/scripts/_screens_save';
import { _saveDiagnoses } from '@/databases/mutations/scripts/_diagnoses_save';

export type SavePartialParams = {
    broadcastAction?: boolean;
    userId?: string;
    scripts?: {
        scriptId: string;
        data: Partial<typeof schema.scripts.$inferSelect>;
    }[];
    screens?: {
        screenId: string;
        data: Partial<(typeof schema.screens.$inferSelect & {
            _fields?: {
                index: number;
                data: any;
            }[];
            _items?: {
                index: number;
                data: any;
            }[];
        })>;
    }[];
    diagnoses?: {
        diagnosisId: string;
        data: Partial<(typeof schema.diagnoses.$inferSelect & {
            _fields?: {
                index: number;
                data: any;
            }[];
        })>;
    }[];
};

export type SavePartialResponse = {
    success: boolean;
    errors?: string[];
};

export async function savePartial({
    broadcastAction,
    userId,
    scripts: scriptsParam = [],
    screens: screensParam = [],
    diagnoses: diagnosesParam = [],
}: SavePartialParams): Promise<SavePartialResponse> {
    try {
        let errors: string[] = [];
        let success = true;

        const scripts = !scriptsParam.length ? { data: [], } : await _getScripts({
            scriptsIds: scriptsParam.map(s => s.scriptId),
        });

        const screens = !screensParam.length ? { data: [], } : await _getScreens({
            screensIds: screensParam.map(s => s.screenId),
        });

        const diagnoses = !diagnosesParam.length ? { data: [], } : await _getDiagnoses({
            diagnosesIds: diagnosesParam.map(s => s.diagnosisId),
        });

        if (scripts.data.length) {
            const res = await _saveScripts({
                userId,
                broadcastAction,
                data: scripts.data.map(s => ({
                    ...s,
                    ...(scriptsParam.find(script => script.scriptId === s.scriptId)?.data as typeof s),
                })),
            });

            if (res.errors) errors = [...errors, ...res.errors];

            success = !res.errors?.length || res.success;
        }

        if (screens.data.length) {
            const res = await _saveScreens({
                userId,
                broadcastAction,
                data: screens.data.map(s => {
                    const {
                        _fields = [],
                        _items = [],
                        ...partialData
                    } = screensParam.find(screen => screen.screenId === s.screenId)?.data as (typeof s & {
                        _fields: NonNullable<SavePartialParams['screens']>[0]['data']['_fields'];
                        _items: NonNullable<SavePartialParams['screens']>[0]['data']['_items'];
                    });

                    let fields = s.fields;
                    let items = s.items;

                    _fields.forEach(f => {
                        if (fields[f.index]) fields[f.index] = { ...fields[f.index], ...f.data, };
                    });

                    _items.forEach(f => {
                        if (items[f.index]) items[f.index] = { ...items[f.index], ...f.data, };
                    });

                    return {
                        ...s,
                        ...partialData,
                        fields,
                        items,
                    };
                }),
            });

            if (res.errors) errors = [...errors, ...res.errors];

            success = !res.errors?.length || res.success;
        }

        if (diagnoses.data.length) {
            const res = await _saveDiagnoses({
                userId,
                broadcastAction,
                data: diagnoses.data.map(d => {
                    const {
                        _fields = [],
                        ...partialData
                    } = diagnosesParam.find(diagnosis => diagnosis.diagnosisId === d.diagnosisId)?.data as (typeof d & {
                        _fields: NonNullable<SavePartialParams['diagnoses']>[0]['data']['_fields']; // TODO: diagnoses symptoms???
                    });

                    return {
                        ...d,
                        ...partialData,
                    };
                }),
            });

            if (res.errors) errors = [...errors, ...res.errors];

            success = !res.errors?.length || res.success;
        }

        return { 
            success, 
            errors: !errors.length ? undefined : errors, 
        };
    } catch(e: any) {
        return {
            success: false,
            errors: [e.message],
        };
    }
}
