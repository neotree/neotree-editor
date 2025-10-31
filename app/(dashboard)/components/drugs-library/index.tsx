'use client';

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Loader } from "@/components/loader";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDrugsLibrary } from "@/hooks/use-drugs-library";
import { useAppContext } from "@/contexts/app";
import { ActionsBar } from "@/components/actions-bar";
import { DrugsLibraryForm } from "./form";
import { Add } from "./add";
import { ExportModal } from "./export-modal";
import { DrugsLibraryHeader } from "../../drugs-fluids-and-feeds/components/table-header";
import { DrugsLibraryTableActions } from "./table-actions";
import { TableCell, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { DrugsLibrarySearch } from "./search";

type Props = {};

export function DrugsLibrary({}: Props) {
    const { confirm } = useConfirmModal();
    const { viewOnly } = useAppContext();

    const [selected, setSelected] = useState<number[]>([]);

    const { 
        filteredDrugs: drugs, 
        tableData,
        loading, 
        addLink,
        selectedItemId: itemId, 
        editLink,
        saveDrugs, 
        deleteDrugs,
        copyDrugs,
        search,
        setSearch,
        onSearch,
        typeFilter,
        statusFilter,
        sortBy,
        setTypeFilter,
        setStatusFilter,
        setSortBy,
    } = useDrugsLibrary();

    const disabled = useMemo(() => viewOnly, [viewOnly]);

    const handleFilterChange = (type: string, status: string) => {
        setTypeFilter(type);
        setStatusFilter(status);
    };

    const searchResults = search.results;

    const searchResultsById = useMemo(() => {
        const map = new Map<string, typeof searchResults[number]>();
        searchResults.forEach(result => {
            if (result?.itemId) map.set(result.itemId, result);
        });
        return map;
    }, [searchResults]);

    const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const highlightMatch = useCallback((value: string): ReactNode => {
        const text = `${value ?? ''}`;
        if (!search.value) return text;

        const lowerQuery = search.value.toLowerCase();
        if (!text.toLowerCase().includes(lowerQuery)) return text;

        const regex = new RegExp(`(${escapeRegExp(search.value)})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) => {
            if (!part) return null;

            const isMatch = part.toLowerCase() === lowerQuery;
            return isMatch ? (
                <mark key={index} className="rounded bg-yellow-200 px-1">
                    {part}
                </mark>
            ) : (
                <span key={index}>{part}</span>
            );
        });
    }, [search.value]);

    return (
        <>
            {loading && <Loader overlay />}

            <DrugsLibraryForm
                disabled={disabled}
                item={drugs.filter(s => s.itemId === itemId)[0]}
                onChange={saveDrugs}
            />

            {!!selected.length && (
                <ActionsBar>
                    <ExportModal 
                        uuids={drugs.filter((_, i) => selected.includes(i)).map(k => k.itemId!)}
                    />

                    <Button
                        variant="destructive"
                        onClick={() => setTimeout(() => {
                            confirm(() => deleteDrugs(drugs.filter((_, i) => selected.includes(i)).map(k => k.itemId!)), {
                                title: 'Delete drugs',
                                message: 'Are you sure you want to delete drugs?',
                                positiveLabel: 'Yes, delete',
                                negativeLabel: 'Cancel',
                                danger: true,
                            });
                        }, 0)}
                    >
                        Delete {selected.length < 2 ? '' : selected.length + ' items'}
                    </Button>
                </ActionsBar>
            )}

            <DrugsLibraryHeader
                sortBy={sortBy}
                typeFilter={typeFilter}
                statusFilter={statusFilter}
                onSortChange={setSortBy}
                onFilterChange={handleFilterChange}
            />

            <div className="px-4 pb-4">
                <DrugsLibrarySearch 
                    search={search}
                    setSearch={setSearch}
                    onSearch={onSearch}
                />
            </div>

            <Separator />

            <DataTable 
                onSelect={setSelected}
                selectable={!disabled}
                headerActions={(
                    <>
                        <Add 
                            addDrugLink={addLink('drug')}
                            addFluidLink={addLink('fluid')}
                        />
                    </>
                )}
                rowRenderer={!search.value ? undefined : ({ props, cells, rowIndex }) => {
                    const item = drugs[rowIndex];
                    const result = item ? searchResultsById.get(item.itemId!) : undefined;

                    return (
                        <>
                            <TableRow {...props}>
                                {cells}
                            </TableRow>

                            {!result || !result.matches.length ? null : (
                                <TableRow
                                    {...props}
                                    className={cn(props.className, 'bg-yellow-50 hover:bg-yellow-50')}
                                >
                                    <TableCell colSpan={cells.length} className="border-t p-0">
                                        <Card className="m-4 border-none bg-white shadow-none">
                                            <div className="flex flex-col divide-y text-xs">
                                                {result.matches.map((match, idx) => (
                                                    <div
                                                        key={`${match.field}-${idx}-${match.fieldValue}`}
                                                        className="flex flex-col gap-y-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-x-4"
                                                    >
                                                        <span className="font-medium text-muted-foreground">
                                                            {match.fieldLabel}
                                                            {match.context ? ` (${match.context})` : ''}
                                                        </span>
                                                        <span className="text-foreground sm:ml-auto sm:text-right">
                                                            {highlightMatch(match.fieldValue)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    </TableCell>
                                </TableRow>
                            )}
                        </>
                    );
                }}
                getRowOptions={({ rowIndex }) => {
                    const s = drugs[rowIndex];
                    return !s ? {} : {
                        className: cn(s.isDraft && 'bg-danger/20 hover:bg-danger/30')
                    };
                }}
                columns={[
                    {
                        name: 'Drug / Fluid',
                    },
                    {
                        name: 'Type',
                        tdClassName: 'w-[80px]',
                    },
                    {
                        name: 'Key',
                    },
                    {
                        name: 'Dosage text',
                    },
                    {
                        name: '',
                        align: 'right',
                        cellRenderer({ value: itemId }) {
                            const item = drugs.filter(s => s.itemId === itemId)[0];

                            if (!item) return null;

                            return (
                                <>
                                    <DrugsLibraryTableActions
                                        item={item}
                                        disabled={disabled}
                                        copyDrugs={copyDrugs}
                                        deleteDrugs={deleteDrugs}
                                        editLink={editLink}
                                    />
                                </>
                            );
                        },
                    }
                ]}
                data={tableData}
            />
        </>
    );
}
