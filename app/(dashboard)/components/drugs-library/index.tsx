'use client';

import { useMemo } from "react";
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
import { useDrugsLibrary } from "@/hooks/use-drugs-library";
import { useAppContext } from "@/contexts/app";
import { DrugsLibraryForm } from "./form";
import { Add } from "./add";

type Props = {};

export function DrugsLibrary({}: Props) {
    const { confirm } = useConfirmModal();
    const { viewOnly } = useAppContext();

    // const searchParams = useSearchParams();
    // const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);

    const { 
        drugs, 
        loading, 
        addLink,
        selectedItemId: itemId, 
        editLink,
        saveDrugs, 
        deleteDrugs,
        copyDrugs,
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

            <DataTable 
                title="Drugs & Fluids Library"
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
                                                    onClick={() => confirm(() => copyDrugs([item.itemId!]), {
                                                        title: 'Copy drug',
                                                        message: `Are you sure you want to copy drug?<br /> <b>${item.drug}</b>`,
                                                        positiveLabel: 'Yes, copy',
                                                        negativeLabel: 'Cancel',
                                                    })}
                                                >
                                                    <>
                                                        <CopyIcon className="mr-2 h-4 w-4" /> Copy
                                                    </>
                                                </DropdownMenuItem>
                                            )}

                                            {!disabled && (
                                                <DropdownMenuItem
                                                    onClick={() => confirm(() => deleteDrugs([item.itemId!]), {
                                                        title: 'Delete drug',
                                                        message: 'Are you sure you want to delete drug?',
                                                        positiveLabel: 'Yes, delete',
                                                        negativeLabel: 'Cancel',
                                                        danger: true,
                                                    })}
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
                data={drugs.map(item => [
                    item.drug || '',
                    item.type || '',
                    item.key || '',
                    item.dosageText || '',
                    item.itemId!,
                ])}
            />
        </>
    );
}
