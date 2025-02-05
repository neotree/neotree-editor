import { v4 } from "uuid";

import { ScreenDraftInferInsertData, Script, ScriptDraftInferInsertData, DiagnosisDraftInferInsertData, Diagnosis } from "@/databases/types";
import { Screen } from "@/databases/types";

export function screenToDraftInsertData<AdditionalScreenFields = {}>(s: Screen<AdditionalScreenFields>) {
    const screenId = v4();
    const data: ScreenDraftInferInsertData = {
        ...s,
        screenId,
        version: 1,
    };

    [
        'id',
        'scriptId',
        'oldScreenId',
        'oldScriptId',
        'publishDate',
        'createdAt',
        'deletedAt',
        'updatedAt',
        'isDraft',
        'publishedVersion',
        'draft',
        // @ts-ignore
    ].forEach(key => { delete data[key]; });

    return data;
}

export function scriptToDraftInsertData<AdditionalScriptFields = {}>(s: Script<AdditionalScriptFields>) {
    const scriptId = v4();
    const data: ScriptDraftInferInsertData = {
        ...s,
        scriptId,
        version: 1,
        oldScriptId: undefined,
        publishDate: undefined,
        createdAt: undefined,
        deletedAt: undefined,
        updatedAt: undefined,
        isDraft: undefined,
        publishedVersion: undefined,
    };

    [
        'id',
        'oldScriptId',
        'publishDate',
        'createdAt',
        'deletedAt',
        'updatedAt',
        'isDraft',
        'publishedVersion',
        'draft',
        // @ts-ignore
    ].forEach(key => { delete data[key]; });

    return data;
}

export function diagnosisToDraftInsertData<AdditionalDiagnosisFields = {}>(s: Diagnosis<AdditionalDiagnosisFields>) {
    const diagnosisId = v4();
    const data: DiagnosisDraftInferInsertData = {
        ...s,
        diagnosisId,
        version: 1,
    };

    [
        'id',
        'scriptId',
        'oldDiagnosisId',
        'oldScriptId',
        'publishDate',
        'createdAt',
        'deletedAt',
        'updatedAt',
        'isDraft',
        'publishedVersion',
        'draft',
        // @ts-ignore
    ].forEach(key => { delete data[key]; });

    return data;
}

export function removeHexCharacters(value: any): any {
    if (typeof value === 'string') {
        // Remove hexadecimal characters (e.g., 0x1A, 0xFF) from the string
        return value.replace(/0x[0-9A-Fa-f]+/g, '');
    } else if (Array.isArray(value)) {
        // Recursively process each element in the array
        return value.map(removeHexCharacters);
    } else if (typeof value === 'object' && value !== null) {
        // Recursively process each property in the object
        const result: { [key: string]: any } = {};
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                result[key] = removeHexCharacters(value[key]);
            }
        }
        return result;
    }
    // Return the value as is if it's not a string, array, or object
    return value;
}