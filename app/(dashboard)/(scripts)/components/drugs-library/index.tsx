'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import queryString from "query-string";
import { MoreVertical, Trash, Edit, Eye, Plus } from "lucide-react"
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Loader } from "@/components/loader";
import { saveScriptsDrugs } from "@/app/actions/scripts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useScriptForm } from "../../hooks/use-script-form";
import { DrugsLibraryForm } from "./form";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScriptForm>;
};

type Drug = Parameters<typeof saveScriptsDrugs>[0]['data'][0]

export function DrugsLibrary({ disabled, form }: Props) {
    const initialised = useRef(false);
    const scriptId = form.watch('scriptId');
    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();

    const [loading, setLoading] = useState(false);
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const searchParams = useSearchParams();
    const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);
    const { itemId } = searchParamsObj;

    const getDrugs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get<Awaited<ReturnType<typeof saveScriptsDrugs>>>(
                '/api/scripts/drugs-library?data=' + JSON.stringify({ scriptsIds: [scriptId], }),
            );
            if (res.data.errors?.length) throw new Error(res.data.errors?.join(', '));
            setDrugs(res.data.data as Drug[]);
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [alert, scriptId]);

    useEffect(() => {
        if (!initialised.current) getDrugs();
        initialised.current = true;
    }, [getDrugs])

    const deleteDrugs = useCallback(async (ids: string[]) => {
        try {
            setLoading(true);
            setDrugs(prev => prev.filter(item => !ids.includes(item.itemId!)));
            const res = await axios.delete<Awaited<ReturnType<typeof saveScriptsDrugs>>>(
                '/api/scripts/drugs-library?data=' + JSON.stringify({ itemsIds: ids, }),
            );
            if (res.data.errors?.length) throw new Error(res.data.errors?.join(', '));
            alert({
                title: '',
                message: 'Drug deleted successfully!',
                variant: 'success',
            });
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [alert]);

    const saveDrugs = useCallback(async (item?: Drug) => {
        try {
            setLoading(true);

            let updated = drugs;
            setDrugs(prev => {
                if (!itemId && item) {
                    updated = [...prev, item];
                } else {
                    updated = prev.map(s => s.itemId !== item?.itemId ? s : {
                        ...s,
                        ...item,
                    });
                }
                return updated;
            });

            const payload: Parameters<typeof saveScriptsDrugs>[0] = {
                data: item ? [item] : updated,
                returnSaved: true,
            };
            
            const res = await axios.post<Awaited<ReturnType<typeof saveScriptsDrugs>>>(
                '/api/scripts/drugs-library',
                payload,
            );

            if (res.data.errors?.length) throw new Error(res.data.errors?.join(', '));

            await getDrugs();

            alert({
                title: '',
                message: `Drug${item ? '' : 's'} saved successfully!`,
                variant: 'success',
            });
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [drugs, itemId]);

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
                            <Link
                                href={`?${queryString.stringify({ 
                                    ...searchParamsObj,
                                    addDrug: 1,
                                })}`}
                            >
                                Add drug
                                <Plus className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </>
                )}
                columns={[
                    {
                        name: 'Drug',
                    },
                    {
                        name: 'Dosage text',
                    },
                    {
                        name: 'Management text',
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
                                                <Link
                                                    href={`?${queryString.stringify({ ...searchParamsObj, itemId: item.itemId, })}`}
                                                >
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
                    item.dosageText || '',
                    item.managementText || '',
                    item.itemId!,
                ])}
            />
        </>
    );
}
