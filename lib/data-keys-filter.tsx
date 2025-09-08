import { useCallback, useState } from "react";
import { FilterIcon } from "lucide-react";

import * as select from '@/components/ui/select';
import { DataKey } from "@/databases/queries/data-keys";

export function getDataKeysTypes(dataKeys: DataKey[]) {
    // return Object
    //     .values(dataKeys
    //         .filter(k => k.dataType)
    //         .reduce((acc, k) => ({
    //             ...acc,
    //             [k.dataType!]: {
    //                 value: k.dataType!,
    //                 label: k.dataType!,
    //             },
    //         }), {} as Record<string, { value: string; label: string; }>)
    //     )
    //     .sort((key1, key2) => {
    //         let returnVal = 0;
    //         if(key1.label < key2.label) returnVal = -1;
    //         if(key1.label > key2.label) returnVal = 1;
    //         return returnVal;
    //     });
    return [
        { label: 'checklist_option', value: 'checklist_option', },
        { label: 'date', value: 'date', },
        { label: 'datetime', value: 'datetime', },
        { label: 'diagnosis', value: 'diagnosis', },
        { label: 'dropdown', value: 'dropdown', },
        { label: 'dropdown_option', value: 'dropdown_option', },
        { label: 'drug', value: 'drug', },
        { label: 'fluid', value: 'fluid', },
        { label: 'multi_select', value: 'multi_select', },
        { label: 'multi_select_option', value: 'multi_select_option', },
        // { label: 'mwi_edliz_summary_table', value: 'mwi_edliz_summary_table', },
        { label: 'mwi_edliz_summary_table_option', value: 'mwi_edliz_summary_table_option', },
        { label: 'number', value: 'number', },
        { label: 'period', value: 'period', },
        { label: 'single_select', value: 'single_select', },
        { label: 'single_select_option', value: 'single_select_option', },
        { label: 'text', value: 'text', },
        { label: 'timer', value: 'timer', },
        { label: 'yesno', value: 'yesno', },
        // { label: 'zw_edliz_summary_table', value: 'zw_edliz_summary_table', },
        { label: 'zw_edliz_summary_table_option', value: 'zw_edliz_summary_table_option', },
    ];
}

export const DEFAULT_DATA_KEYS_FILTER = 'all';

const statuses = [
    { label: 'Published', value: 'published', },
    { label: 'Drafts', value: 'drafts', },
];

export const filterDataKeysFn = (
    dataKeys: DataKey[], 
    filterValue = DEFAULT_DATA_KEYS_FILTER,
) => {
    return [...dataKeys]
        .filter(k => {
            if (filterValue === 'all') {
                return true;
            } else if (filterValue === statuses[0].value) {
                return !k.isDraft;
            } else if (filterValue === statuses[1].value) {
                return !!k.isDraft;
            }
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
                        All keys
                    </select.SelectItem>

                    <select.SelectSeparator />
                
                    <select.SelectGroup>
                        <select.SelectLabel>Status</select.SelectLabel>

                        {statuses.map(o => {
                            return (
                                <select.SelectItem
                                    key={o.value}
                                    value={o.value}
                                >
                                    <div className="flex items-center gap-x-2">
                                        <span>{o.label}</span>
                                    </div>
                                </select.SelectItem>
                            );
                        })}
                    </select.SelectGroup>

                    <select.SelectSeparator />

                    <select.SelectGroup>
                        <select.SelectLabel>Types</select.SelectLabel>

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
                            );
                        })}
                    </select.SelectGroup>
                </select.SelectContent>
            </select.Select>
        </>
    );
}
