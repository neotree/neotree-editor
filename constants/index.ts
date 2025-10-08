import { ScreenType, ScriptType } from "@/databases/queries/scripts";
import { Preferences } from "@/types";
import { FieldTypes } from "./fields";
import { SortAsc, SortDesc } from "lucide-react";

export const scriptPrintConfig = {
    headerFormat: '',
    headerFields: [] as string[],
    footerFields: [] as string[],
    sections: [] as any[],
};

export const CONDITIONAL_EXP_EXAMPLE = "Example: ($key = true and $key2 = false) or $key3 = 'HD'";

export const defaultPreferences = { 
    fontSize: {}, 
    fontWeight: {}, 
    fontStyle: {}, 
    textColor: {}, 
    backgroundColor: {}, 
    highlight: {},
} as Preferences;

export const scriptsPageTabs = [
    { value: 'screens', label: 'Screens', },
    { value: 'diagnoses', label: 'Diagnoses', },
    { value: 'print', label: 'Print', },
];

export const scriptTypes = [
    { label: 'Admission', value: 'admission', },
    { label: 'Discharge', value: 'discharge', },
    { label: 'Neolab', value: 'neolab', },
    {label: 'Daily Record',value:'drecord'}
] as { label: string; value: ScriptType['type'] }[];

export const screenTypes: { label: string; value: ScreenType['type'] }[] = [
    { value: 'checklist', label: 'Checklist' },
    { value: 'form', label: 'Form' },
    { value: 'management', label: 'Management' },
    { value: 'multi_select', label: 'Multiple choice list' },
    // { value: 'list', label: 'Simple list' },
    { value: 'single_select', label: 'Single choice list' },
    { value: 'progress', label: 'Progress' },
    { value: 'timer', label: 'Timer' },
    { value: 'yesno', label: 'Yes/No' },
    { value: 'drugs', label: 'Drugs' },
    { value: 'fluids', label: 'Fluids' },
    // { value: 'feeds', label: 'Feeds' },
    { value: 'zw_edliz_summary_table', label: 'EDLIZ summary table (ZW)' },
    { value: 'mwi_edliz_summary_table', label: 'EDLIZ summary table (MWI)' },
    { value: 'diagnosis', label: 'Diagnosis' }
];

export const SymptomTypes = [
    { value: 'risk', label: 'Risk factor', },
    { value: 'sign', label: 'Sign/Symptom', },
];

export const DATA_KEYS_MAP: Record<string, string[]> = {    
    ...screenTypes.reduce((acc, t) => {
        const screenType = t.value;
        const key = t.value;
        let value = [key, `${key}_option`];

        if (screenType === 'single_select') {
            value = [...value, 'dropdown', 'dropdown_option'];
        }

        return {
            ...acc,
            [key]: value,
        };
    }, {} as Record<string, string[]>),

    ...FieldTypes.reduce((acc, t) => {
        const fieldType = t.name;
        const key = t.name;
        let value = [key, `${key}_option`];

        if (fieldType === 'dropdown') {
            value = [...value, 'single_select', 'single_select_option'];
        }

        return {
            ...acc,
            [key]: value,
        };
    }, {} as Record<string, string[]>),
};

export const dataKeyTypes: {
    value: string;
    label: string;
    hasChildren: boolean;
}[] = [
    {
        value: 'checklist',
        label: 'checklist',
        hasChildren: true,
    },
    {
        value: 'checklist_option',
        label: 'checklist_option',
        hasChildren: false,
    },
    {
        value: 'multi_select',
        label: 'multi_select',
        hasChildren: true,
    },
    {
        value: 'multi_select_option',
        label: 'multi_select_option',
        hasChildren: false,
    },
    {
        value: 'single_select',
        label: 'single_select',
        hasChildren: true,
    },
    {
        value: 'single_select_option',
        label: 'single_select_option',
        hasChildren: false,
    },
    {
        value: 'yesno',
        label: 'yesno',
        hasChildren: false,
    },
    // {
    //     value: 'progress',
    //     label: 'progress',
    //     hasChildren: true,
    // },
    // {
    //     value: 'drug',
    //     label: 'drug',
    //     hasChildren: false,
    // },
    // {
    //     value: 'fluid',
    //     label: 'fluid',
    //     hasChildren: false,
    // },
    {
        value: 'zw_edliz_summary_table',
        label: 'zw_edliz_summary_table',
        hasChildren: true,
    },
    {
        value: 'zw_edliz_summary_table_option',
        label: 'zw_edliz_summary_table_option',
        hasChildren: false,
    },
    {
        value: 'mwi_edliz_summary_table',
        label: 'mwi_edliz_summary_table',
        hasChildren: true,
    },
    {
        value: 'mwi_edliz_summary_table_option',
        label: 'mwi_edliz_summary_table_option',
        hasChildren: false,
    },
    {
        value: 'diagnosis',
        label: 'diagnosis',
        hasChildren: true,
    },
    {
        value: 'diagnosis_symptom_sign',
        label: 'diagnosis_symptom_sign',
        hasChildren: false,
    },
    {
        value: 'diagnosis_symptom_risk',
        label: 'diagnosis_symptom_risk',
        hasChildren: false,
    },
    {
        value: 'date',
        label: 'date',
        hasChildren: false,
    },
    {
        value: 'datetime',
        label: 'datetime',
        hasChildren: false,
    },
    {
        value: 'dropdown',
        label: 'dropdown',
        hasChildren: true,
    },
    {
        value: 'dropdown_option',
        label: 'dropdown_option',
        hasChildren: false,
    },
    {
        value: 'number',
        label: 'number',
        hasChildren: false,
    },
    {
        value: 'text',
        label: 'text',
        hasChildren: false,
    },
    {
        value: 'timer',
        label: 'timer',
        hasChildren: false,
    },
    {
        value: 'period',
        label: 'period',
        hasChildren: false,
    },
]

export const dataKeysSortOpts = [
    {
        value: 'label.asc',
        label: 'Label (asc)',
        Icon: SortAsc,
    },
    {
        value: 'label.desc',
        label: 'Label (desc)',
        Icon: SortDesc,
    },
    {
        value: 'key.asc',
        label: 'Key (asc)',
        Icon: SortAsc,
    },
    {
        value: 'key.desc',
        label: 'Key (desc)',
        Icon: SortDesc,
    },
    {
        value: 'type.asc',
        label: 'Type (asc)',
        Icon: SortAsc,
    },
    {
        value: 'type.desc',
        label: 'Type (desc)',
        Icon: SortDesc,
    },
    {
        value: 'refId.asc',
        label: 'Ref ID (asc)',
        Icon: SortAsc,
    },
    {
        value: 'refId.desc',
        label: 'Ref ID (desc)',
        Icon: SortDesc,
    },
    {
        value: 'createdAt.asc',
        label: 'Date (asc)',
        Icon: SortAsc,
    },
    {
        value: 'createdAt.desc',
        label: 'Date (desc)',
        Icon: SortDesc,
    },
];

export const dataKeysStatuses = [
    { label: 'Published', value: 'published', },
    { label: 'Drafts', value: 'drafts', },
];
