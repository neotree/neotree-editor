import * as queries from "@/databases/queries/scripts";
import * as drugsLibraryMutations from "@/databases/mutations/drugs-library";
import { dataKeyTypes } from "@/constants";

const dataTypes = dataKeyTypes.map(t => t.value);

type tKey = {
    uniqueKey: string;
    name: string;
    label: string;
    refId?: string;
    dataType?: string;
    children: tKey[];
};

export function scrapDataKeys({
    screens,
    diagnoses,
    drugsLibrary,
}: {
    screens: Awaited<ReturnType<typeof queries._getScreens>>['data'];
    diagnoses: Awaited<ReturnType<typeof queries._getDiagnoses>>['data'];
    drugsLibrary: Awaited<ReturnType<typeof queries._getScriptsDrugsLibrary>>['data'];
}) {
    let scrappedKeys: tKey[] = [];

    const screensKeys = screens.map(s => {
        const key: tKey = {
            uniqueKey: '',
            name: s.key || '',
            label: s.label || '',
            refId: s.refId || '',
            dataType: s.type,
            children: [],
        };

        if (dataTypes.filter(t => !t.includes('edliz')).includes(key.dataType!)) {
            key.label = key.label || s.title;
            key.name = key.name || key.label;
        }

        if (['diagnosis', 'checklist'].includes(s.type)) key.dataType = `${s.type}_screen`;

        s.items.forEach(item => {
            let dataType = `${s.type}_option`;
            if (s.type === 'diagnosis') dataType = s.type;
            const k: tKey = {
                uniqueKey: '',
                name: item.key || item.id || '',
                label: item.label || '',
                dataType,
                children: [],
            };
            key.children.push(k);
        });

        s.fields.forEach(f => {
            key.children.push({
                uniqueKey: '',
                name: f.key || '',
                label: f.label || '',
                dataType: f.type,
                children: (f.items || []).map(item => ({
                    uniqueKey: '',
                    name: (item.value || '') as string,
                    label: (item.label || '') as string,
                    children: [],
                    dataType: `${f.type}_option`,
                })),
            });
        });

        scrappedKeys.push(key);

        return {
            screenId: s.screenId,
            key,
        };
    });

    const diagnosesKeys = diagnoses.map(d => {
        const key: tKey = {
            uniqueKey: '',
            name: d.key || d.name || '',
            label: d.name || '',
            dataType: 'diagnosis',
            children: [],
        };

        (d.symptoms || []).forEach(item => {
            key.children.push({
                uniqueKey: '',
                name: item.name || '',
                label: '',
                dataType: `diagnosis_symptom_${item.type}`,
                children: [],
            });
        });

        scrappedKeys.push(key);

        return {
            screenId: d.diagnosisId,
            key,
        };
    });

    const dffKeys = drugsLibrary.map(d => {
        const key: tKey = {
            uniqueKey: '',
            name: d.key || '',
            label: d.drug || '',
            dataType: d.type,
            children: [],
        };

        scrappedKeys.push(key);

        return {
            screenId: d.itemId,
            key,
        };
    });

    return {
        keys: scrappedKeys,
        screensKeys,
        diagnosesKeys,
        drugsLibraryKeys: dffKeys,
    };
}
