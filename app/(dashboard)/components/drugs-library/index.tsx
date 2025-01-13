'use client';

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import queryString from "query-string";
import { MoreVertical, Trash, Edit, Eye, Plus } from "lucide-react";

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
import { DrugsLibraryForm } from "./form";

type Props = {
    disabled?: boolean;
};

export function DrugsLibrary({ disabled }: Props) {
    const { confirm } = useConfirmModal();

    // const searchParams = useSearchParams();
    // const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);

    const { 
        drugs, 
        loading, 
        addLink,
        selectedItemId: itemId, 
        editLink,
        saveDrugs, 
        deleteDrugs 
    } = useDrugsLibrary();

    return (
        <>
            {loading && <Loader overlay />}

            <DrugsLibraryForm
                disabled={disabled}
                item={drugs.filter(s => s.itemId === itemId)[0]}
                onChange={saveDrugs}
            />

            <DataTable 
                headerActions={(
                    <>
                        <Button
                            asChild
                            variant="outline"
                        >
                            <Link href={addLink}>
                                Add drug
                                <Plus className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
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
                        name: 'Drug',
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
                    item.key || '',
                    item.dosageText || '',
                    item.itemId!,
                ])}
            />
        </>
    );
}
