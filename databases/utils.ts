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
