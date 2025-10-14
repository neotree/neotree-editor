'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import queryString from "query-string";
import { MoreVertical, Trash, Edit, Eye, Plus, CopyIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Loader } from "@/components/loader";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { useDrugsLibrary } from "@/hooks/use-drugs-library";
import { useAppContext } from "@/contexts/app";
import { ActionsBar } from "@/components/actions-bar";
import { DrugsLibraryForm } from "./form";
import { Add } from "./add";
import { ExportModal } from "./export-modal";

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
        searchQuery,
        typeFilter,
        statusFilter,
        sortBy,
        setSearchQuery,
        setTypeFilter,
        setStatusFilter,
        setSortBy,
    } = useDrugsLibrary();

    const disabled = useMemo(() => viewOnly, [viewOnly]);

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

            {/* Drugs & Fluids Library Header with Filters */}
            <div className="p-4 flex flex-col gap-y-4">
                <div className="flex flex-wrap items-center">
                    <div className="text-2xl">Drugs & Fluids Library</div>
                    <div className="flex-1 flex flex-wrap items-center justify-end gap-x-4">
                        {/* Sort dropdown */}
                        <div>
                            <Select
                                value={sortBy}
                                onValueChange={setSortBy}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Sort" />
                                </SelectTrigger>
        
                                <SelectContent>
                                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                    <SelectItem value="type-asc">Type (A-Z)</SelectItem>
                                    <SelectItem value="type-desc">Type (Z-A)</SelectItem>
                                    <SelectItem value="key-asc">Key (A-Z)</SelectItem>
                                    <SelectItem value="key-desc">Key (Z-A)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filter dropdown */}
                        <div>
                            <Select
                                value={typeFilter || statusFilter || 'all'}
                                onValueChange={v => {
                                    if (v === 'all') {
                                        setTypeFilter('');
                                        setStatusFilter('');
                                    } else if (v === 'drug' || v === 'fluid') {
                                        setTypeFilter(v);
                                        setStatusFilter('');
                                    } else if (v === 'draft' || v === 'published') {
                                        setStatusFilter(v);
                                        setTypeFilter('');
                                    }
                                }}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="All items" />
                                </SelectTrigger>
        
                                <SelectContent>
                                    <SelectItem value="all">All items</SelectItem>

                                    <SelectSeparator />

                                    <SelectGroup>
                                        <SelectLabel>Status</SelectLabel>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                    </SelectGroup>

                                    <SelectSeparator />

                                    <SelectGroup>
                                        <SelectLabel>Types</SelectLabel>
                                        <SelectItem value="drug">Drugs</SelectItem>
                                        <SelectItem value="fluid">Fluids</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            <DataTable 
                onSelect={setSelected}
                selectable={!disabled}
                search={{
                    inputPlaceholder: 'Search',
                }}
                headerActions={(
                    <>
                        <Add 
                            addDrugLink={addLink('drug')}
                            addFluidLink={addLink('fluid')}
                        />
                    </>
                )}
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
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent>
                                            <DropdownMenuItem 
                                                asChild
                                            >
                                                <Link href={editLink(`${itemId}`)}>
                                                    <>
                                                        {!disabled ? <><Edit className="mr-2 h-4 w-4" /> Edit</> : <><Eye className="mr-2 h-4 w-4" /> View</>}
                                                    </>
                                                </Link>
                                            </DropdownMenuItem>

                                            {!disabled && (
                                                <DropdownMenuItem 
                                                    onClick={() => setTimeout(() => {
                                                        confirm(() => copyDrugs([item.itemId!]), {
                                                            title: 'Copy drug',
                                                            message: `Are you sure you want to copy drug?<br /> <b>${item.drug}</b>`,
                                                            positiveLabel: 'Yes, copy',
                                                            negativeLabel: 'Cancel',
                                                        });
                                                    }, 0)}
                                                >
                                                    <>
                                                        <CopyIcon className="mr-2 h-4 w-4" /> Copy
                                                    </>
                                                </DropdownMenuItem>
                                            )}

                                            {!disabled && (
                                                <DropdownMenuItem
                                                    onClick={() => setTimeout(() => {
                                                        confirm(() => deleteDrugs([item.itemId!]), {
                                                            title: 'Delete drug',
                                                            message: 'Are you sure you want to delete drug?',
                                                            positiveLabel: 'Yes, delete',
                                                            negativeLabel: 'Cancel',
                                                            danger: true,
                                                        });
                                                    }, 0)}
                                                    className="text-danger focus:bg-danger focus:text-danger-foreground"
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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