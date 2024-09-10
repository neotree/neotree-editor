'use client';

import { useCallback, useState } from "react";
import { toast } from "sonner";
import axios from 'axios';

import { 
    getHospitals, 
    deleteHospitals, 
    getHospital, 
    updateHospitals, 
    createHospitals,
    searchHospitals,
} from "@/app/actions/_hospitals";
import { DataTable } from "@/components/data-table";
import { Pagination } from "@/components/pagination";
import { Separator } from "@/components/ui/separator";
import { Loader } from "@/components/loader";
import { useSearchParams } from "@/hooks/use-search-params";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { HospitalAction } from "./action";
import { HospitalForm } from "./hospital-form";
import { Header } from "./header";

type Props = {
    hospitals: Awaited<ReturnType<typeof getHospitals>>;
    getHospitals: typeof getHospitals;
    deleteHospitals: typeof deleteHospitals;
    getHospital: typeof getHospital;
    updateHospitals: typeof updateHospitals;
    createHospitals: typeof createHospitals;
    searchHospitals: typeof searchHospitals;
};

export function HospitalsTable({ 
    hospitals: initialData, 
    getHospitals: _getHospitals, 
    deleteHospitals, 
    getHospital,
    updateHospitals,
    createHospitals,
    searchHospitals,
}: Props) {
    const searchParams = useSearchParams();
    
    const [hospitals, setHospitals] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const [showHospitalForm, setShowHospitalForm] = useState(false);

    const { confirm } = useConfirmModal();

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
            roles: searchParams.parsed.role ? [searchParams.parsed.role] : undefined,
            page: 1,
            limit: initialData.limit,
            ...opts,
        }));
        const hospitals = response.data as Awaited<ReturnType<typeof _getHospitals>>;

        if (hospitals.error) {
            toast.error(hospitals.error);
        } else {
            setHospitals(hospitals);
            setSelectedIndexes([]);
        }

        cb?.(hospitals.error, hospitals);

        setLoading(false);
    }, [_getHospitals, searchParams, initialData]);

    const onDelete = useCallback((hospitalIds: string[], cb?: () => void) => {
        const names = hospitals.data.filter(u => hospitalIds.includes(u.hospitalId)).map(u => u.name);
        confirm(() => {
            (async () => {
                try {
                    setLoading(true);

                    // await deleteHospitals(hospitalIds);

                    // TODO: Replace with server actions
                    await axios.delete('/api/hospitals?data=' + JSON.stringify(hospitalIds));

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
    }, [confirm, deleteHospitals, getHospitals, hospitals]);

    const hospitalForm = (searchParams.parsed.hospitalId || showHospitalForm) ? (
        <HospitalForm 
            open={showHospitalForm}
            getHospital={getHospital}
            updateHospitals={updateHospitals}
            createHospitals={createHospitals}
            onSaveSuccess={getHospitals}
            onClose={() => setShowHospitalForm(false)}
        />
    ) : null;

    return (
        <div className="flex flex-col">
            <Header 
                hospitals={hospitals}
                selected={selectedIndexes.map(i => hospitals.data[i].hospitalId)}
                onDelete={onDelete}
                getHospitals={getHospitals}
                searchHospitals={searchHospitals}
                toggleHospitalForm={() => setShowHospitalForm(prev => !prev)}
            />

            <Separator />

            <DataTable
                selectable
                // sortable
                // onSort={sorted => setHospitals(prev => {
                //     return {
                //         ...prev,
                //         data: sorted.map(({ oldIndex, }) => prev.data[oldIndex]),
                //     };
                // })}
                selectedIndexes={selectedIndexes}
                onSelect={setSelectedIndexes}
                columns={[
                    {
                        name: 'Name',
                    },
                    {
                        name: 'Action',
                        align: 'right',
                        // thClassName: 'opacity-0',
                        cellRenderer(cell) {
                            const u = hospitals.data[cell.rowIndex];
                            return (
                                <HospitalAction 
                                    hospitalId={u.hospitalId}
                                    hospitalName={u.name}
                                    onDelete={() => onDelete([u.hospitalId])}
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

            <Separator />

            <div className="p-2">
                <Pagination
                    currentPage={hospitals.page}
                    totalPages={hospitals.totalPages}
                    disabled={loading}
                    limit={hospitals.limit || hospitals.totalRows}
                    totalRows={hospitals.totalRows}
                    collectionName="hospitals"
                    onPaginate={page => getHospitals({ page }, (e, rslts) => !e && searchParams.push({ page: rslts?.page || hospitals.page, }))}
                    hideControls={false}
                    hideSummary={false}
                />
            </div>

            {hospitalForm}

            {loading && <Loader overlay />}
        </div>
    )
}
