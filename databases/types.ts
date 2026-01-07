import { diagnoses, diagnosesDrafts, scripts, scriptsDrafts } from "@/databases/pg/schema";
import { screens, screensDrafts } from "@/databases/pg/schema";

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
    exclusiveGroup?: string;
    forbidWith?: string[];
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
    items?: {
        itemId: string;
        value: string | number;
        label: string | number;
        label2?: string;
        exclusive?: boolean;
        exclusiveGroup?: string;
        forbidWith?: string[];
        enterValueManually?: boolean;
        keyId?: string;
    }[];
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

// SCREENS
export type Screen<AdditionalFields = {}> = typeof screens.$inferSelect & AdditionalFields;

export type ScreenDraftData<AdditionalFields = {}> = typeof screensDrafts.$inferSelect['data'] & AdditionalFields;

export type ScreenDraft<AdditionalFields = {}> = typeof screensDrafts.$inferSelect & AdditionalFields;

export type ScreenInferInsert<AdditionalFields = {}> = typeof screens.$inferInsert & AdditionalFields;

export type ScreenDraftInferInsertData<AdditionalFields = {}> = typeof screensDrafts.$inferInsert['data'] & AdditionalFields;

export type ScreenDraftInferInsert<AdditionalFields = {}> = typeof screensDrafts.$inferInsert & AdditionalFields;

// DIAGNOSES
export type Diagnosis<AdditionalFields = {}> = typeof diagnoses.$inferSelect & AdditionalFields;

export type DiagnosisDraftData<AdditionalFields = {}> = typeof diagnosesDrafts.$inferSelect['data'] & AdditionalFields;

export type DiagnosisDraft<AdditionalFields = {}> = typeof diagnosesDrafts.$inferSelect & AdditionalFields;

export type DiagnosisInferInsert<AdditionalFields = {}> = typeof diagnoses.$inferInsert & AdditionalFields;

export type DiagnosisDraftInferInsertData<AdditionalFields = {}> = typeof diagnosesDrafts.$inferInsert['data'] & AdditionalFields;

export type DiagnosisDraftInferInsert<AdditionalFields = {}> = typeof diagnosesDrafts.$inferInsert & AdditionalFields;

// SCRIPTS
export type Script<AdditionalFields = {}> = typeof scripts.$inferSelect & AdditionalFields;

export type ScriptDraftData<AdditionalFields = {}> = typeof scriptsDrafts.$inferSelect['data'] & AdditionalFields;

export type ScriptDraft<AdditionalFields = {}> = typeof scriptsDrafts.$inferSelect & AdditionalFields;

export type ScriptInferInsert<AdditionalFields = {}> = typeof scripts.$inferInsert & AdditionalFields;

export type ScriptDraftInferInsertData<AdditionalFields = {}> = typeof scriptsDrafts.$inferInsert['data'] & AdditionalFields;

export type ScriptDraftInferInsert<AdditionalFields = {}> = typeof scriptsDrafts.$inferInsert & AdditionalFields;
