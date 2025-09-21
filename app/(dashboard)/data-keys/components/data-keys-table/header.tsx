'use client';

import { PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDataKeysCtx } from '@/contexts/data-keys';
import { dataKeysSortOpts, dataKeysStatuses, dataKeyTypes, } from "@/constants";
import { 
    Select, 
    SelectGroup,
    SelectLabel,
    SelectTrigger, 
    SelectValue, 
    SelectContent, 
    SelectItem,
    SelectSeparator,
} from '@/components/ui/select';

export function DataKeysTableHeader() {
    const { 
        sort,
        filter,
        onSort,
        setFilter,
        setCurrentDataKeyUuid, 
    } = useDataKeysCtx();

    return (
        <>
            <div className="p-4 flex flex-col gap-y-4">
                <div className="flex flex-wrap items-center">
                    <div className="text-2xl">Data keys</div>
                    <div className="flex-1 flex flex-wrap items-center justify-end gap-x-4">
                        <div>
                            <Select
                                value={sort}
                                onValueChange={v => onSort(v)}
                            >
                                <SelectTrigger>
                                    <SelectValue 
                                        placeholder="Sort"
                                    />
                                </SelectTrigger>
                
                                <SelectContent>
                                    {dataKeysSortOpts.map(o => {
                                        return (
                                            <SelectItem
                                                key={o.value}
                                                value={o.value}
                                            >
                                                <div className="flex items-center gap-x-2 w-[120px]">
                                                    <o.Icon className="size-4" />
                                                    <span>{o.label}</span>
                                                </div>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Select
                                value={filter}
                                onValueChange={v => setFilter(v === 'all' ? '' : v)}
                            >
                                <SelectTrigger>
                                    <SelectValue 
                                        placeholder="All keys"
                                    />
                                </SelectTrigger>
                
                                <SelectContent>
                                    <SelectItem value="all">All keys</SelectItem>

                                    <SelectSeparator />

                                    <SelectGroup>
                                        <SelectLabel>Status</SelectLabel>
                                        {dataKeysStatuses.map(o => {
                                            return (
                                                <SelectItem
                                                    key={o.value}
                                                    value={o.value}
                                                >
                                                    {o.label}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectGroup>

                                    <SelectSeparator />

                                    <SelectGroup>
                                        <SelectLabel>Types</SelectLabel>
                                        {dataKeyTypes.map(o => {
                                            return (
                                                <SelectItem
                                                    key={o.value}
                                                    value={o.value}
                                                >
                                                    {o.label}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            variant="ghost"
                            className="w-auto h-auto"
                            onClick={() => setCurrentDataKeyUuid('new')}
                        >
                            <PlusIcon className="size-4 mr-2" />
                            Add
                        </Button>
                    </div>
                </div>
            </div>

            <Separator />
        </>
    );
}
