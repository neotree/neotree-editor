'use client';

import { useCallback, useState } from "react";
import { toast } from "sonner";
import axios from 'axios';
import { Plus } from 'lucide-react';

import { 
    getHospitals, 
    deleteHospitals, 
    getHospital, 
    saveHospitals
} from "@/app/actions/hospitals";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/app";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader } from "@/components/loader";
import { useSearchParams } from "@/hooks/use-search-params";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { HospitalAction } from "./action";
import { HospitalForm } from "./hospital-form";

type Props = {
    hospitals: Awaited<ReturnType<typeof getHospitals>>;
    getHospitals: typeof getHospitals;
    deleteHospitals: typeof deleteHospitals;
    getHospital: typeof getHospital;
    saveHospitals: typeof saveHospitals;
};

export function HospitalsTable({ 
    hospitals: initialData, 
    getHospitals: _getHospitals, 
    deleteHospitals, 
    getHospital,
    saveHospitals,
}: Props) {
    const searchParams = useSearchParams();
    
    const [hospitals, setHospitals] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const [showHospitalForm, setShowHospitalForm] = useState(false);

    const { confirm } = useConfirmModal();

    const { viewOnly } = useAppContext();
    const disabled = viewOnly;

    const getHospitals = useCallback(async (
        opts?: {
            page?: number
            roles?: string[];
            status?: string;
        },
        cb?: (error?: string, results?: typeof initialData) => void,
    ) => {
        setLoading(true);

        // const hospitals = await _getHospitals({
        //     ...searchParams.parsed,
        //     roles: searchParams.parsed.role ? [searchParams.parsed.role] : undefined,
        //     page: 1,
        //     limit: initialData.limit,
        //     ...opts,
        // });

        // TODO: Replace with server actions
        const response = await axios.get('/api/hospitals?data=' + JSON.stringify({
            ...searchParams.parsed,
        }));
        const hospitals = response.data as Awaited<ReturnType<typeof _getHospitals>>;

        const error = hospitals.errors?.join?.(', ');

        if (error) {
            toast.error(error);
        } else {
            setHospitals(hospitals);
            setSelectedIndexes([]);
        }

        cb?.(error, hospitals);

        setLoading(false);
    }, [_getHospitals, searchParams, initialData]);

    const onDelete = useCallback((hospitalIds: string[], cb?: () => void) => {
        if (disabled) return;

        const names = hospitals.data.filter(u => hospitalIds.includes(u.hospitalId)).map(u => u.name);
        confirm(() => {
            (async () => {
                try {
                    setLoading(true);

                    const payload: Parameters<typeof deleteHospitals>[0] = {
                        hospitalsIds: hospitalIds,
                    };

                    // await deleteHospitals(hospitalIds);

                    // TODO: Replace with server actions
                    await axios.delete('/api/hospitals?data=' + JSON.stringify(payload));

                    await getHospitals();
                    cb?.();
                } catch(e: any) {
                    toast.error(e.message);
                } finally {
                    setLoading(false);
                }
            })();
        }, {
            title: 'Delete ' + (names.length > 1 ? 'hospitals' : 'hospital'),
            message: `<p>Are you sure you want to delete:</p> ${names.map(n => `<div class="font-bold text-danger">${n}</div>`).join('')}`,
            negativeLabel: 'Cancel',
            positiveLabel: 'Delete',
            danger: true,
        });
    }, [confirm, deleteHospitals, getHospitals, hospitals, disabled]);

    const hospitalForm = (searchParams.parsed.hospitalId || showHospitalForm) ? (
        <HospitalForm 
            open={showHospitalForm}
            getHospital={getHospital}
            saveHospitals={saveHospitals}
            onSaveSuccess={getHospitals}
            onClose={() => setShowHospitalForm(false)}
        />
    ) : null;

    return (
        <div className="flex flex-col">
            <DataTable
                selectable={!disabled}
                // sortable
                // onSort={sorted => setHospitals(prev => {
                //     return {
                //         ...prev,
                //         data: sorted.map(({ oldIndex, }) => prev.data[oldIndex]),
                //     };
                // })}
                title="Hospitals"
                search={{
                    inputPlaceholder: 'Search hospitals',
                }}
                headerActions={disabled ? null : (
                    <Button
                        variant="outline"
                        className="w-auto h-auto border-primary text-primary"
                        onClick={() => setShowHospitalForm(prev => !prev)}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        <span>New Hospital</span>
                    </Button>
                )}
                selectedIndexes={selectedIndexes}
                onSelect={setSelectedIndexes}
                getRowOptions={({ rowIndex }) => {
                    const s = hospitals.data[rowIndex];
                    return !s ? {} : {
                        className: cn(!viewOnly && s.isDraft && 'bg-danger/20 hover:bg-danger/30')
                    };
                }}
                columns={[
                    {
                        name: 'Name',
                    },
                    {
                        name: 'Action',
                        align: 'right',
                        // thClassName: 'opacity-0',
                        cellRenderer(cell) {
                            const h = hospitals.data[cell.rowIndex];
                            return (
                                <HospitalAction 
                                    hospital={h}
                                    onDelete={() => onDelete([h.hospitalId])}
                                />
                            );
                        },
                    },
                ]}
                data={hospitals.data.map(u => {
                    return [
                        u.name,
                        '',
                    ];
                })}
            />

            {hospitalForm}

            {loading && <Loader overlay />}
        </div>
    )
}
