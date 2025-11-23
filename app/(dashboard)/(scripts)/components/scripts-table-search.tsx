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
import { filterScriptsSearchResults, scriptsSearchResultsFilters, } from "@/lib/scripts-search";
import { SearchAndReplaceModal } from "@/components/search-and-replace-modal";

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
                            onValueChange={val => setSearch(prev => {
                                const filter = val as typeof search.filter;
                                return {
                                    ...prev,
                                    filter,
                                    results: filterScriptsSearchResults({
                                        results: prev.unfilteredResults,
                                        filter,
                                        searchValue: prev.value,
                                    }),
                                };
                            })}
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

                {!!search.results?.length && (
                    <>
                        <SearchAndReplaceModal 
                            searchValue={search.value}
                            scriptsSearchResults={search.results}
                        />
                    </>
                )}
            </div>
        </>
    )
}
