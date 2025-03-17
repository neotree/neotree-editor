'use client';

import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";

type KeyValue = { key: string; value: string; };

type Props = Omit<TextareaProps, 'value' | 'onChange'> & {
    value: KeyValue[];
    onChange: (value: KeyValue[], valueText: string) => void;
};

const valuePropToState = (valueProp: Props['value']) => valueProp.reduce((acc, item, i) => {
    acc += `${item.key},${item.value}`;
    if (i < (valueProp .length - 1)) acc += '\n';
    return acc;
}, '');

const stateToValueProp = (state = '', valueProp: Props['value'] = []) => {
    const items: KeyValue[] = [];
    state.split('\n').forEach(item => {
        const [key, value] = item.trim().split(',');
        items.push({ key, value, });
    });
    return items.map(item => {
        const valuePropItem = valueProp.filter(v => v.key === item.key)[0];
        return { ...valuePropItem, ...item, };
    });
};

function validateState(_values: string) {
    const errors = [];

    const dropdownValues = !_values.length ? [] : (_values || '').split('\n')
        .map((v = '') => v.trim())
        // .filter(s => s)
        .map((value) => {
            const valueSplit = value.split(',');
            return { value: valueSplit[0], label: valueSplit[1], };
        });

    const values = dropdownValues.map(v => v.value);
    const labels = dropdownValues.map(v => v.label);
    const missing = dropdownValues.filter(v => !v.value || !v.label);
    const duplicateValues = values.filter((item, index) => values.indexOf(item) !== index);
    const duplicateLabels = labels.filter((item, index) => labels.indexOf(item) !== index);

    if (duplicateLabels.length || duplicateValues.length) {
        errors.push('Dropdown values contain duplicate data');
    }
    
    if (missing.length) {
        errors.push('Incorrect dropdown values format');
    }

    return errors;
}

export function KeyValueTextarea({ 
    value: valueProp, 
    onChange: onChangeProp, 
    ...props 
}: Props) {
    const [value, setValue] = useState(valuePropToState(valueProp));

    const valueErrors = useMemo(() => validateState(value), [value]);

    const onChange = useCallback((value: string) => {
        setValue(value);
        const errs = validateState(value);
        if (!errs.length) {
            onChangeProp(stateToValueProp(value, valueProp), value);
        }
    }, [valueProp, onChangeProp]);

    useEffect(() => {
        const state = valuePropToState(valueProp);
        setValue(prev => JSON.stringify(prev) !== JSON.stringify(state) ? state : prev);
    }, [valueProp]);

    return (
        <>
            <Textarea
                value={value}
                rows={5}
                noRing={false}
                className={cn(props.className, valueErrors.length ? 'border-danger ring-danger focus-visible:ring-danger' : '')}
                onChange={e => onChange(e.target.value)}
                {...props}
            />
        </>
    );
}

