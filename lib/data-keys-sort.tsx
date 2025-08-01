import { useCallback, useEffect, useState } from "react";
import { SortAsc, SortDesc } from "lucide-react";

import * as select from '@/components/ui/select';
import { DataKey } from "@/databases/queries/data-keys";

export const sortOpts = [
    {
        value: 'label.asc',
        label: 'Label (asc)',
        Icon: SortAsc,
    } as const,
    {
        value: 'label.desc',
        label: 'Label (desc)',
        Icon: SortDesc,
    } as const,
    {
        value: 'key.asc',
        label: 'Key (asc)',
        Icon: SortAsc,
    } as const,
    {
        value: 'key.desc',
        label: 'Key (desc)',
        Icon: SortDesc,
    } as const,
    {
        value: 'type.asc',
        label: 'Type (asc)',
        Icon: SortAsc,
    } as const,
    {
        value: 'type.desc',
        label: 'Type (desc)',
        Icon: SortDesc,
    } as const,
    {
        value: 'createdAt.asc',
        label: 'Date (asc)',
        Icon: SortAsc,
    } as const,
    {
        value: 'createdAt.desc',
        label: 'Date (desc)',
        Icon: SortDesc,
    } as const,
];

export const DEFAULT_DATA_KEYS_SORT = sortOpts[0].value;

const sortFn = ({ key1, key2, sortDirection, }: {
    sortDirection: 'asc' | 'desc',
    key1: string;
    key2: string;
}) => {
    key1 = (key1 || '').trim().toLowerCase();
    key2 = (key2 || '').trim().toLowerCase();

    let returnVal = 0;

    if (sortDirection === 'asc') {
        if(key1 < key2) returnVal = -1;
        if(key1 > key2) returnVal = 1;
    } else {
        if(key1 > key2) returnVal = -1;
        if(key1 < key2) returnVal = 1;
    }

    return returnVal;
};

export const sortDataKeysFn = (
    dataKeys: DataKey[], 
    sortValue = DEFAULT_DATA_KEYS_SORT,
) => {
    let sorted = [...dataKeys];

    switch(sortValue) {
        case 'key.desc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'desc',
                key1: key1.name,
                key2: key2.name,
            }));
            break;

        case 'label.asc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'asc',
                key1: (key1.label || key1.name || '').trim(),
                key2: (key2.label || key2.name || '').trim(),
            }));
            break;

        case 'label.desc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'desc',
                key1: (key1.label || key1.name || '').trim(),
                key2: (key2.label || key2.name || '').trim(),
            }));
            break;

        case 'type.asc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'asc',
                key1: (key1.dataType || '').trim(),
                key2: (key2.dataType || '').trim(),
            }));
            break;

        case 'type.desc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'desc',
                key1: (key1.dataType || '').trim(),
                key2: (key2.dataType || '').trim(),
            }));
            break;

        case 'createdAt.asc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'asc',
                key1: new Date(key1.createdAt || '').getTime().toString(),
                key2: new Date(key2.createdAt || '').getTime().toString(),
            }));
            break;

        case 'createdAt.desc':
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'desc',
                key1: new Date(key1.createdAt || '').getTime().toString(),
                key2: new Date(key2.createdAt || '').getTime().toString(),
            }));
            break;
            
        default:
            sorted = dataKeys.sort((key1, key2) => sortFn({
                sortDirection: 'asc',
                key1: key1.name,
                key2: key2.name,
            }));
    }

    return sorted;
};

type SortDataKeysComponentProps = {
    dataKeys: DataKey[];
    value?: typeof DEFAULT_DATA_KEYS_SORT;
    onSort: (data: DataKey[], sortValue: typeof DEFAULT_DATA_KEYS_SORT) => void;
};

const parseValue = (value?: typeof DEFAULT_DATA_KEYS_SORT) => {
    return sortOpts.find(o => o.value === value)?.value || DEFAULT_DATA_KEYS_SORT;
};

export function SortDataKeysComponent({ dataKeys, value, onSort: onSortProp, }: SortDataKeysComponentProps) {
    const [sort, setSort] = useState<typeof DEFAULT_DATA_KEYS_SORT>(parseValue(value));

    const onSort = useCallback((sortValue: typeof sort) => {
        const value = sortValue as typeof sort;
        setSort(value);
        const sorted = sortDataKeysFn(dataKeys, value);
        onSortProp(sorted, value);
    }, [dataKeys, onSortProp]);

    useEffect(() => { setSort(parseValue(value)); }, [value]);
    
    return (
        <>
            <select.Select
                value={sort}
                onValueChange={v => onSort(v as typeof sort)}
            >
                <select.SelectTrigger>
                    <select.SelectValue 
                        placeholder="Sort"
                    />
                </select.SelectTrigger>

                <select.SelectContent>
                    {sortOpts.map(o => {
                        return (
                            <select.SelectItem
                                key={o.value}
                                value={o.value}
                            >
                                <div className="flex items-center gap-x-2 w-[120px]">
                                    <o.Icon className="size-4" />
                                    <span>{o.label}</span>
                                </div>
                            </select.SelectItem>
                        )
                    })}
                </select.SelectContent>
            </select.Select>
        </>
    );
}
