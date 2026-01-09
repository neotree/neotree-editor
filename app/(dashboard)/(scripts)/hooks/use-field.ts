'use client';

import { useCallback } from "react";
import { v4 } from "uuid";

import { ScriptField, ScreenReviewField } from "@/types";

export function useField(field?: ScriptField) {
    const getDefaultValues = useCallback(() => {
        return {
            ...field,
            fieldId: field?.fieldId || v4(),
            type: field?.type || '',
            key: field?.key || '',
            keyId: field?.keyId || '',
            label: field?.label || '',
            refKey: field?.refKey || '',
            refKeyId: field?.refKeyId || '',
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
            minDateKeyId: field?.minDateKeyId || '',
            maxDateKeyId: field?.maxDateKeyId || '',
            minTimeKeyId: field?.minTimeKeyId || '',
            maxTimeKeyId: field?.maxTimeKeyId || '',
            values: field?.values || '',
            unit: field?.unit || '',
            valuesOptions: field?.valuesOptions || [],
            confidential: field?.confidential || false,
            optional: field?.optional || false,
            printable: field?.printable || false,
            prePopulate: field?.prePopulate || [],
            editable: field?.editable || false,
            items: field?.items || [],
        } satisfies ScriptField;
    }, [field]);

    return {
        getDefaultValues,
    };
}

export function useScreenReviewField(field?: ScreenReviewField) {
    const getDefaultValues = useCallback(() => {
        return {
            label: field?.label || '',
            screen: field?.screen||'',
            ...field
        } satisfies ScreenReviewField;
    }, [field]);

    return {
        getDefaultValues,
    };
}
