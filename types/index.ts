export * from './permissions';

export type Mode = 'view' | 'development';

export type ScriptItem = {
    id: string;
    label: string;
    position: number;
    itemId: string;
};

export type ScriptField = {
    fieldId: string;
    type: string;
    key: string;
    label: string;
    refKey: string;
    calculation: string;
    condition: string;
    dataType: string;
    defaultValue: string;
    format: string;
    minValue: string;
    maxValue: string;
    minDate: string;
    maxDate: string;
    minTime: string;
    maxTime: string;
    minDateKey: string;
    maxDateKey: string;
    minTimeKey: string;
    maxTimeKey: string;
    values: string;
    confidential: boolean;
    optional: boolean;
    printable: boolean;
    prePopulate: string[];
};

export type DiagnosisSymptom = {
    expression: string;
    name: string;
    weight: number | null;
    type: string;
    position: number;
    symptomId: string;
    printable: boolean;
};

export type ScriptImage = {
    data: string;
    fileId?: string;
    filename?: string;
    size?: number;
    contentType?: string;
};

export type ImageTextField = {
    title: string;
    text: string;
    image: string | {
        data: string;
        fileId?: string;
        filename?: string;
        size?: number;
        type?: string;
    };
};

export type ScriptType = 'admission' | 'discharge' | 'neolab';

export type Script = {
    id: number;
    scriptId: string;
    scriptDraftId: null | string;
    oldScriptId: null | string;
    version: number;
    type: ScriptType;
    position: number;
    title: string;
    printTitle: string;
    description: string;
    hospitalId: string;
    exportable: boolean;
    nuidSearchEnabled: boolean;
    publishDate: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: null | string;
};
