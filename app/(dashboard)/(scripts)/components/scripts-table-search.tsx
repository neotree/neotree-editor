'use client';

import { Loader } from "@/components/loader";
import { useScriptsTable } from "../hooks/use-scripts-table";
import { SearchInput } from "@/components/search-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { scriptsSearchResultsFilters, } from "@/lib/scripts-search";

type Props = {
    search: ReturnType<typeof useScriptsTable>['search'];
    setSearch: ReturnType<typeof useScriptsTable>['setSearch'];
    onSearch: ReturnType<typeof useScriptsTable>['onSearch'];
};

export function ScriptsTableSearch({
    search,
    setSearch,
    onSearch,
}: Props) {
    return (
        <>
            {search.searching && <Loader overlay />}

            <div className="flex items-center gap-x-2">
                <div className="flex-1">
                    <SearchInput 
                        placeholder="Search"
                        onSearch={onSearch}
                    />
                </div>

                {!!search.value && (
                    <div className="w-[120px]">
                        <Select
                            value={search.filter}
                            onValueChange={val => setSearch(prev => ({
                                ...prev,
                                filter: val as typeof search.filter,
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All matches" />
                            </SelectTrigger>
                            <SelectContent>
                                {scriptsSearchResultsFilters.map(f => {
                                    return (
                                        <SelectItem key={f.value} value={f.value}>
                                            {f.label}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
        </>
    )
}
