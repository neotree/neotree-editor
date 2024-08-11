'use client';

import { useCallback } from "react";
import { v4 } from "uuid";

import { ScriptField } from "@/types";

export function useField(field?: ScriptField) {
    const getDefaultValues = useCallback(() => {
        return {
            fieldId: field?.fieldId || v4(),
            type: field?.type || '',
            key: field?.key || '',
            label: field?.label || '',
            refKey: field?.refKey || '',
            calculation: field?.calculation || '',
            condition: field?.condition || '',
            dataType: field?.dataType || '',
            defaultValue: field?.defaultValue || '',
            format: field?.format || '',
            minValue: field?.minValue || '',
            maxValue: field?.maxValue || '',
            minDate: field?.minDate || '',
            maxDate: field?.maxDate || '',
            minTime: field?.minTime || '',
            maxTime: field?.maxTime || '',
            minDateKey: field?.minDateKey || '',
            maxDateKey: field?.maxDateKey || '',
            minTimeKey: field?.minTimeKey || '',
            maxTimeKey: field?.maxTimeKey || '',
            values: field?.values || '',
            confidential: field?.confidential || false,
            optional: field?.optional || false,
            printable: field?.printable || false,
            prePopulate: field?.prePopulate || [],
            ...field
        } satisfies ScriptField;
    }, [field]);

    return {
        getDefaultValues,
    };
}