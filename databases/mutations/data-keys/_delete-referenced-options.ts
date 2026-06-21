import logger from '@/lib/logger';
import { _getDataKeysRefs, _getDataKeys, } from '@/databases/queries/data-keys';
import { _saveScreens, _saveDiagnoses, _saveProblems, } from '../scripts';

export async function _deleteReferencedDataKeyOptions({
    uniqueKeys,
    userId,
}: {
    uniqueKeys: string[];
    userId?: string;
}): Promise<{
    errors?: string[];
    success: boolean;
}> {
    try {
        if (uniqueKeys.length) {
            const refs = await _getDataKeysRefs({ uniqueKeys, });

            const saveScreensData = refs.data
                .filter(d => {
                    const fields = d.data.fields || [];
                    const items = d.data.items || [];
                    return d.refType === 'screen' && (
                        !!uniqueKeys.find(k => JSON.stringify(fields).includes(k)) ||
                        !!uniqueKeys.find(k => JSON.stringify(items).includes(k))
                    );
                })
                .map(d => {
                    const screen: Parameters<typeof _saveScreens>[0]['data'][0] = d.data;

                    const fields = screen?.fields || [];
                    const items = screen?.items || [];

                    return {
                        ...screen,
                        items: items.filter(f => !uniqueKeys.includes(f.keyId!)),
                        fields: fields.filter(f => !uniqueKeys.includes(f.keyId!)).map(f => ({
                            ...f,
                            items: (f.items || []).filter(f => !uniqueKeys.includes(f.keyId!)),
                        })),
                    };
                });

            if (saveScreensData.length) {
                await _saveScreens({
                    userId: userId || undefined,
                    data: saveScreensData,
                });
            }

            const saveDiagnosesData = refs.data
                .filter(d => {
                    const symptoms = d.data.symptoms || [];
                    return d.refType === 'diagnosis' && (
                        !!uniqueKeys.find(k => JSON.stringify(symptoms).includes(k))
                    );
                })
                .map(d => {
                    const diagnosis: Parameters<typeof _saveDiagnoses>[0]['data'][0] = d.data;

                    const symptoms = diagnosis?.symptoms || [];

                    return {
                        ...diagnosis,
                        symptoms: symptoms.filter(f => !uniqueKeys.includes(f.keyId!)),
                    };
                });

            if (saveDiagnosesData.length) {
                await _saveDiagnoses({
                    userId: userId || undefined,
                    data: saveDiagnosesData,
                });
            }

            const saveProblemsData = refs.data
                .filter(d => {
                    const symptoms = d.data.symptoms || [];
                    return d.refType === 'problem' && (
                        !!uniqueKeys.find(k => JSON.stringify(symptoms).includes(k))
                    );
                })
                .map(d => {
                    const problem: Parameters<typeof _saveProblems>[0]['data'][0] = d.data;

                    const symptoms = problem?.symptoms || [];

                    return {
                        ...problem,
                        symptoms: symptoms.filter(f => !uniqueKeys.includes(f.keyId!)),
                    };
                });

            if (saveProblemsData.length) {
                await _saveProblems({
                    userId: userId || undefined,
                    data: saveProblemsData,
                });
            }
        }

        return {
            success: true,
        };
    } catch(e: any) {
        logger.error('_deleteReferencedDataKeyOptions ERROR', e.message);
        return {
            success: false,
            errors: [e.message],
        };
    }
}
