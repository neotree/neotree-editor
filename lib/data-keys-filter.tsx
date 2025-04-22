import { useCallback, useState } from "react";
import { FilterIcon } from "lucide-react";

import * as select from '@/components/ui/select';
import { DataKey } from "@/databases/queries/data-keys";

export function getDataKeysTypes(dataKeys: DataKey[]) {
    return Object
        .values(dataKeys
            .filter(k => k.dataType)
            .reduce((acc, k) => ({
                ...acc,
                [k.dataType!]: {
                    value: k.dataType!,
                    label: k.dataType!,
                },
            }), {} as Record<string, { value: string; label: string; }>)
        )
        .sort((key1, key2) => {
            let returnVal = 0;
            if(key1.label < key2.label) returnVal = -1;
            if(key1.label > key2.label) returnVal = 1;
            return returnVal;
        });
}

export const DEFAULT_DATA_KEYS_FILTER = 'all';

export const filterDataKeysFn = (
    dataKeys: DataKey[], 
    filterValue = DEFAULT_DATA_KEYS_FILTER,
) => {
    return [...dataKeys]
        .filter(k => {
            if (filterValue === 'all') return true;
            return k.dataType === filterValue;
        });
};

type FilterDataKeysComponentProps = {
    dataKeys: DataKey[];
    onFilter: (data: DataKey[], filterValue: typeof DEFAULT_DATA_KEYS_FILTER) => void;
};

export function FilterDataKeysComponent({ dataKeys, onFilter: onFilterProp, }: FilterDataKeysComponentProps) {
    const [filter, setFilter] = useState<typeof DEFAULT_DATA_KEYS_FILTER>(DEFAULT_DATA_KEYS_FILTER);

    const onFilter = useCallback((value: typeof filter) => {
        setFilter(value);
        const filtered = filterDataKeysFn(dataKeys, value);
        onFilterProp(filtered, value);
    }, [dataKeys, onFilterProp]);
    
    return (
        <>
            <select.Select
                value={filter}
                onValueChange={v => onFilter(v as typeof filter)}
            >
                <select.SelectTrigger>
                    <select.SelectValue 
                        placeholder="All types"
                    />
                </select.SelectTrigger>

                <select.SelectContent>
                    <select.SelectItem value="all">
                        All types
                    </select.SelectItem>
                    {getDataKeysTypes(dataKeys).map(o => {
                        return (
                            <select.SelectItem
                                key={o.value}
                                value={o.value}
                            >
                                <div className="flex items-center gap-x-2">
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
