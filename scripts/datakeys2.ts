import '@/server/env';
import { _getScreens } from '@/databases/queries/scripts';
import { getScriptsWithItems } from "@/app/actions/scripts";
import { _getDataKeys } from "@/databases/queries/data-keys";
import { _saveDiagnoses, _saveScreens, } from "@/databases/mutations/scripts";

main();

async function main() {
    try {
        const { data: dataKeys } = await _getDataKeys();

        const getDataKeyUniqueKey = (data: {
            name: string;
            label: string;
            dataType: string;
        }) => {
            const uniqueKey = dataKeys.find(k => JSON.stringify({
                name: `${k.name || ''}`.trim(),
                label: `${k.label || ''}`.trim(),
                dataType: `${k.dataType || ''}`,
            }).toLowerCase() === JSON.stringify({
                name: `${data.name || ''}`.trim(),
                label: `${data.label || ''}`.trim(),
                dataType: `${data.dataType || ''}`,
            }).toLowerCase())?.uniqueKey;

            // console.log(uniqueKey, data);

            return uniqueKey;
        };

        const res = await getScriptsWithItems({});

        let scripts = res.data;

        console.log('scripts.length', scripts.length);

        // scripts = scripts.map(({ screens, diagnoses, ...script }) => {
        //     return {
        //         ...script,

        //         diagnoses: diagnoses.map(d => {
        //             const name = d.key || d.name || '';
        //             const keyId = getDataKeyUniqueKey({
        //                 name,
        //                 label: d.name || '',
        //                 dataType: 'diagnosis',
        //             });

        //             return {
        //                 ...d,
        //                 key: name,
        //                 keyId: keyId || '',
        //                 symptoms: (d.symptoms || []).map(item => {
        //                     const keyId = getDataKeyUniqueKey({
        //                         name: item.name || '',
        //                         label: item.name || '',
        //                         dataType: `diagnosis_symptom_${item.type}`,
        //                     });
        //                     return {
        //                         ...item,
        //                         keyId: keyId,
        //                     };
        //                 }),
        //             };
        //         }),

        //         screens: screens.map(s => {
        //             const refIdDataKey = !s.refId ? undefined : getDataKeyUniqueKey({
        //                 name: s.refId || '',
        //                 label: s.refId || '',
        //                 dataType: 'ref_id',
        //             });

        //             const keyId = getDataKeyUniqueKey({
        //                 name: s.key || '',
        //                 label: s.label || '',
        //                 dataType: 'diagnosis',
        //             });

        //             return {
        //                 ...s,
        //                 refIdDataKey: refIdDataKey || '',
        //                 keyId: keyId || '',
        //                 items: s.items.map(f => {
        //                     let dataType = `${s.type}_option`;
        //                     if (['diagnosis'].includes(s.type)) dataType = s.type;

        //                     const keyId = getDataKeyUniqueKey({
        //                         name: f.key || f.id,
        //                         label: f.label || '',
        //                         dataType: dataType,
        //                     });

        //                     return {
        //                         ...f,
        //                         keyId: keyId || '',
        //                     };
        //                 }),

        //                 fields: s.fields.map(f => {
        //                     let dataType = `${f.type}`;

        //                     const keyId = getDataKeyUniqueKey({
        //                         name: f.key,
        //                         label: f.label || '',
        //                         dataType: dataType,
        //                     });
                            
        //                     return {
        //                         ...f,
        //                         keyId: keyId || '',
        //                         items: (f.items || []).map(f => {
        //                             const keyId = getDataKeyUniqueKey({
        //                                 name: f.value as string,
        //                                 label: `${f.label || ''}`,
        //                                 dataType: `${dataType}_option`,
        //                             });

        //                             return {
        //                                 ...f,
        //                                 keyId: keyId || '',
        //                             };
        //                         }),
        //                     };
        //                 }),
        //             };
        //         }),
        //     };
        // });

        for (const s of scripts) {
            console.log('Saving script: ' + s.title + '...');

            const diagnoses = s.diagnoses.map(d => {
                const name = d.key || d.name || '';
                const keyId = getDataKeyUniqueKey({
                    name,
                    label: d.name || '',
                    dataType: 'diagnosis',
                });

                return {
                    ...d,
                    key: name,
                    keyId: keyId || '',
                    symptoms: (d.symptoms || []).map(item => {
                        const keyId = getDataKeyUniqueKey({
                            name: item.name || '',
                            label: item.name || '',
                            dataType: `diagnosis_symptom_${item.type}`,
                        });
                        return {
                            ...item,
                            keyId: keyId,
                        };
                    }),
                };
            });

            const screens = s.screens.map(s => {
                const refIdDataKey = !s.refId ? undefined : getDataKeyUniqueKey({
                    name: s.refId || '',
                    label: s.refId || '',
                    dataType: 'ref_id',
                });

                const keyId = getDataKeyUniqueKey({
                    name: s.key || '',
                    label: s.label || '',
                    dataType: s.type,
                });

                return {
                    ...s,
                    refIdDataKey: refIdDataKey || '',
                    keyId: keyId || '',
                    items: s.items.map(f => {
                        let dataType = `${s.type}_option`;
                        if (['diagnosis'].includes(s.type)) dataType = s.type;

                        const keyId = getDataKeyUniqueKey({
                            name: f.key || f.id,
                            label: f.label || '',
                            dataType: dataType,
                        });

                        return {
                            ...f,
                            keyId: keyId || '',
                        };
                    }),

                    fields: s.fields.map(f => {
                        let dataType = `${f.type}`;

                        const keyId = getDataKeyUniqueKey({
                            name: f.key,
                            label: f.label || '',
                            dataType: dataType,
                        });
                        
                        return {
                            ...f,
                            keyId: keyId || '',
                            items: (f.items || []).map(f => {
                                const keyId = getDataKeyUniqueKey({
                                    name: f.value as string,
                                    label: `${f.label || ''}`,
                                    dataType: `${dataType}_option`,
                                });

                                return {
                                    ...f,
                                    keyId: keyId || '',
                                };
                            }),
                        };
                    }),
                };
            });
            
            await _saveDiagnoses({ data: diagnoses, });
            await _saveScreens({ data: screens, });
        }
    } catch(e: any) {
        console.error('ERROR:');
        console.error(e);
    } finally {
        process.exit();
    }
}
