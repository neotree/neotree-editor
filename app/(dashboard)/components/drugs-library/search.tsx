'use client';

import { type Dispatch, type SetStateAction } from "react";

import { Loader } from "@/components/loader";
import { SearchInput } from "@/components/search-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    filterDrugsLibrarySearchResults,
    drugsLibrarySearchResultsFilters,
    type DrugsLibrarySearchResultsFilter,
} from "@/lib/drugs-library-search";
import type { DrugsLibrarySearchState } from "@/hooks/use-drugs-library";

type Props = {
    search: DrugsLibrarySearchState;
    setSearch: Dispatch<SetStateAction<DrugsLibrarySearchState>>;
    onSearch: (value: string) => void | Promise<void>;
};

export function DrugsLibrarySearch({
    search,
    setSearch,
    onSearch,
}: Props) {
    const handleFilterChange = (nextFilter: DrugsLibrarySearchResultsFilter) => {
        setSearch(prev => {
            if (!prev.value) return { ...prev, filter: nextFilter };

            return {
                ...prev,
                filter: nextFilter,
                results: filterDrugsLibrarySearchResults({
                    searchValue: prev.value,
                    filter: nextFilter,
                    results: prev.unfilteredResults,
                }),
            };
        });
    };

    return (
        <>
            {search.searching && <Loader overlay />}

            <div className="flex flex-col gap-y-2 sm:flex-row sm:items-center sm:gap-x-2">
                <div className="flex-1">
                    <SearchInput
                        placeholder="Search by key, title, label..."
                        onSearch={onSearch}
                    />
                </div>

                {!!search.value && (
                    <div className="w-full sm:w-[200px]">
                        <Select
                            value={search.filter}
                            onValueChange={val => handleFilterChange(val as DrugsLibrarySearchResultsFilter)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All matches" />
                            </SelectTrigger>
                            <SelectContent>
                                {drugsLibrarySearchResultsFilters.map(filter => (
                                    <SelectItem key={filter.value} value={filter.value}>
                                        {filter.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
        </>
    );
}
