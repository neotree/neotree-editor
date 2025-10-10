'use client';

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Loader } from "@/components/loader";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useDrugsLibrary } from "@/hooks/use-drugs-library";
import { useAppContext } from "@/contexts/app";
import { ActionsBar } from "@/components/actions-bar";
import { DrugsLibraryForm } from "./form";
import { Add } from "./add";
import { ExportModal } from "./export-modal";
import { DrugsLibraryTableActions } from "./table-actions";

type Props = {};

export function DrugsLibrary({}: Props) {
    const { confirm } = useConfirmModal();
    const { viewOnly } = useAppContext();

    const [selected, setSelected] = useState<number[]>([]);

    // const searchParams = useSearchParams();
    // const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);

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

            <DataTable 
                onSelect={setSelected}
                selectable={!disabled}
                title="Drugs & Fluids Library"
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
