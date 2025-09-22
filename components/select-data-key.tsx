'use client';

import { v4 } from "uuid";

import { SelectModal, SelectModalOption } from "@/components/select-modal";
import { useDataKeysCtx } from "@/contexts/data-keys";
import { Loader } from "@/components/loader";
import { useMemo } from "react";

export function SelectDataKey({
    value,
    disabled,
    modal,
    onChange,
    filterOptions,
}: {
    value?: string;
    disabled?: boolean;
    modal?: boolean;
    filterOptions?: (option: SelectModalOption) => boolean;
    onChange?: (value: {
        value: string;
        label: string;
        dataType?: string;
        children: {
            itemId: string;
            value: string;
            label: string;
            dataType?: string;
        }[];
    }) => void
}) {
    const { loadingSelectOptions, selectOptions, loadDataKeysSelectOptions, } = useDataKeysCtx();

    const options = useMemo(() => {
        return selectOptions
            .filter(o => !filterOptions ? true : filterOptions(o));
    }, [selectOptions, filterOptions]);

    return (
        <>
            {loadingSelectOptions && <Loader overlay />}

            <SelectModal 
                modal={modal}
                error={!disabled && !value}
                placeholder={`${value || ''}` || 'Select key'}
                search={{
                    placeholder: 'Search data keys',
                }}
                options={options}
                onTrigger={() => !selectOptions.length && loadDataKeysSelectOptions()}
                onSelect={([dataKey]) => {
                    const label = dataKey?.data?.label || '';
                    const key = dataKey?.data?.key || '';
                    const children: {
                        value: string;
                        label: string;
                        dataType?: string;
                    }[] = dataKey.data?.children || [];

                    onChange?.({
                        label,
                        value: key,
                        dataType: dataKey?.data?.dataType,
                        children: children.map((k) => ({
                            itemId: v4(),
                            label: k.label || '',
                            value: k.value || '',
                            dataType: k.dataType,
                        })),
                    });
                }}
            />
        </>
    );
}
