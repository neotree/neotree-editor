export type ArrayElement<ArrayType extends readonly unknown[]> = 
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

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
    keyId?: string;
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
    exclusiveGroup?: string;
    forbidWith?: string[];
    confidential: boolean;
    checked: boolean;
    enterValueManually?: boolean;
    enterValueManuallyLabel?: string;
    severity_order: string;
    summary: string;
    key: string;
    keyId?: string;
    dataType: null | string;
    score: null | number;
    printDisplayColumns?: 1 | 2;
};

export type ScriptField = {
    fieldId: string;
    type: string;
    key: string;
    keyId?: string;
    label: string;
    refKey: string;
    refKeyId?: string;
    calculation: string;
    condition: string;
    dataType: string;
    defaultValue: string;
    format: string;
    minLength?: string;
    maxLength?: string;
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
    minDateKeyId?: string;
    maxDateKeyId?: string;
    minTimeKeyId?: string;
    maxTimeKeyId?: string;
    values: string;
    unit?: string;
    valuesOptions: {
        key: string;
        optionKey: string;
        optionLabel: string;
    }[];
    confidential: boolean;
    optional: boolean;
    printable: boolean;
    printDisplayColumns?: 1 | 2;
    ips?: boolean;
    prePopulate: string[];
    editable: boolean;
    items?: {
        itemId: string;
        value: string | number;
        label: string | number;
        label2?: string;
        exclusive?: boolean;
        exclusiveGroup?: string;
        forbidWith?: string[];
        enterValueManually?: boolean;
        enterValueManuallyLabel?: string;
        keyId?: string;
    }[];
};

export type EligibilityCriteria = {
    criteria_type: 'date' | 'datetime' | 'dropdown' | 'yesno';
    criteria_label: string;
    auto_fills?: string;
    criteria_condition: string;
    items?: NonNullable<ScriptField['items']>;
    min_date?: string;
    max_date?: string;
    min_date_current?: boolean;
    max_date_current?: boolean;
    feasibilityprompt?: {
        criteria_type: 'yesno';
        criteria_label: string;
        items: NonNullable<ScriptField['items']>;
    };
    alternative_activation_prompt?: string;
    alternative_activation_condition?: string;
    alternative_criteria_type?: 'date' | 'datetime' | 'dropdown' | 'yesno';
    alternative_criteria_label?: string;
    alternative_auto_fills?: string;
    alternative_criteria_condition?: string;
    alternative_items?: NonNullable<ScriptField['items']>;
    alternative_min_date?: string;
    alternative_max_date?: string;
    alternative_min_date_current?: boolean;
    alternative_max_date_current?: boolean;
};

export type DiagnosisSymptom = {
    expression: string;
    key?: string;
    keyId?: string;
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

export type ScriptType = 'admission' | 'discharge' | 'neolab'| 'drecord' | 'dff_calculator';

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
    eligibilityCriteria: EligibilityCriteria | null;
    nuidSearchEnabled: boolean;
    publishDate: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: null | string;
};

export type ScreenReviewField = {
    label: string;
    screen:string;
 }

 export type Alias = {
    value: string;
    key: string;
 }

export type Pagination = {
    limit: number;
    page: number;
    total: number; 
    totalPages: number;
}
