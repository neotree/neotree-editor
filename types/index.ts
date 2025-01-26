export type DataResponse<DataType = any> = {
    errors?: string[];
    data: DataType;
};

export * from './permissions';

export type Mode = 'view' | 'development';

export type DeviceDetails = {
    scripts_count: number;
};

export type Preferences = {
    fontSize: { [key: string]: undefined | 'default' | 'xs' | 'sm' | 'lg' | 'xl'; };
    fontWeight: { [key: string]: undefined | 'bold'; };
    fontStyle: { [key: string]: undefined | string[]; };
    textColor: { [key: string]: undefined | string; };
    backgroundColor: { [key: string]: undefined | string; };
    highlight: { [key: string]: undefined | boolean; };
};

export type PrintSection = {
    sectionId: string;
    title: string;
    screensIds: string[];
};

export type DrugField = {
    key: string;
    position: number;
};

export type FluidField = DrugField;

export type FeedField = DrugField;

export type ScriptItem = {
    id: string;
    label: string;
    position: number;
    itemId: string;
    subType: string;
    type: string;
    exclusive: boolean;
    confidential: boolean;
    checked: boolean;
    enterValueManually?: boolean;
    severity_order: string;
    summary: string;
    key: string;
    dataType: null | string;
    score: null | number;
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
