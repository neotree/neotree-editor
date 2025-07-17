import { ScreenType, ScriptType } from "@/databases/queries/scripts";
import { Preferences } from "@/types";
import { FieldTypes } from "./fields";

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
