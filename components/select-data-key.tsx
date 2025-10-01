'use client';

import { useMemo } from "react";

import { SelectModal, SelectModalOption } from "@/components/select-modal";
import { type DataKey, useDataKeysCtx } from "@/contexts/data-keys";

type OnChangeValue = DataKey & {
    children: DataKey[];
};

export function SelectDataKey({
    value,
    disabled,
    modal,
    multiple,
    placeholder,
    error,
    onChange,
    filterDataKeys,
}: {
    value?: string;
    disabled?: boolean;
    modal?: boolean;
    multiple?: boolean;
    placeholder?: string;
    error?: boolean;
    filterDataKeys?: (dataKey: DataKey) => boolean;
    onChange?: (value: OnChangeValue[]) => void
}) {
    const { dataKeys, extractDataKeys } = useDataKeysCtx();

    const options = useMemo(() => {
        const keys = dataKeys.filter(k => !filterDataKeys ? true : filterDataKeys(k));
        return keys.map(k => ({
            label: k.name,
            value: k.uniqueKey,
            caption: k.dataType || '',
            description: k.label,
        } satisfies SelectModalOption));
    }, [dataKeys, filterDataKeys]);

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
