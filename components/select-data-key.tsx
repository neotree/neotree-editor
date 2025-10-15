'use client';

import { useMemo } from "react";

import { SelectModal, SelectModalOption } from "@/components/select-modal";
import { type DataKey, useDataKeysCtx } from "@/contexts/data-keys";

type OnChangeValue = DataKey & {
    children: DataKey[];
};

export function SelectDataKey({
    value,
    type,
    disabled,
    modal,
    multiple,
    placeholder,
    error,
    onChange,
    filterDataKeys,
}: {
    value?: string;
    type?: string;
    disabled?: boolean;
    modal?: boolean;
    multiple?: boolean;
    placeholder?: string;
    error?: boolean;
    filterDataKeys?: (dataKey: DataKey) => boolean;
    onChange?: (value: OnChangeValue[]) => void
}) {
   
    const { allDataKeys, extractDataKeys } = useDataKeysCtx();

    const options = useMemo(() => {
        let keys = allDataKeys;
        
        // Filter by type if provided
        if (type && type.trim() !== '') {
            keys = keys.filter(k => k.dataType === type);
        }
        
        // Apply custom filter if provided
        if (filterDataKeys) {
            keys = keys.filter(filterDataKeys);
        }
        
        return keys.map(k => ({
            label: k.name,
            value: k.uniqueKey,
            caption: k.dataType || '',
            description: k.label,
        } satisfies SelectModalOption));
    }, [allDataKeys, type, filterDataKeys]);

    return (
        <>
            <SelectModal 
                multiple={multiple}
                modal={modal}
                error={error}
                placeholder={`${value || ''}` || placeholder || 'Select key'}
                search={{
                    placeholder: 'Search data keys',
                }}
                options={options}
                onSelect={(selected) => {
                    const keys = extractDataKeys(selected.map(o => o.value as string))
                        .map(k => ({
                            ...k,
                            children: extractDataKeys(k.options),
                        }));
                    onChange?.(keys);
                }}
            />
        </>
    );
}