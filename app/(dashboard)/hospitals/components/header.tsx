'use client';

import { useState } from "react";
import { Trash, Plus, Edit2 } from 'lucide-react';

import { getHospitals, searchHospitals } from "@/app/actions/_hospitals";
import { useSearchParams } from "@/hooks/use-search-params";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Search } from "./search";

type Props = {
    hospitals: Awaited<ReturnType<typeof getHospitals>>;
    selected: string[];
    onDelete: (ids: string[], cb?: () => void) => void;
    toggleHospitalForm: () => void;
    searchHospitals: typeof searchHospitals;
    getHospitals: (
        filters: Partial<Parameters<typeof getHospitals>[0]>,
        cb?: (error?: string, results?: Awaited<ReturnType<typeof getHospitals>>) => void,
    ) => void;
};

const statuses = [
    { value: 'active', label: 'Active', },
    { value: 'inactive', label: 'Inactive', },
];

export function Header({ 
    selected, 
    onDelete, 
    toggleHospitalForm, 
    searchHospitals, 
}: Props) {
    const searchParams = useSearchParams();

    const [role, setRole] = useState(searchParams.parsed.role || 'all');
    const [status, setStatus] = useState(searchParams.parsed.status || 'all');

    return (
        <>
            <div className="py-4 flex flex-col gap-y-2">
                <div className="px-4 flex flex-col gap-y-2 md:flex-row md:gap-y-0 md:gap-x-2">
                    <div className="flex items-center gap-x-2">
                        <span className="text-2xl md:mr-auto">Hospitals</span>
                        <div className="ml-auto" />
                        <Button
                            variant="outline"
                            className="w-auto h-auto border-primary text-primary"
                            onClick={() => toggleHospitalForm()}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            <span>New Hospital</span>
                        </Button>
                    </div>

                    <div className="flex-1">
                        <Search 
                            searchHospitals={searchHospitals}
                            onDelete={onDelete}
                        />
                    </div>
                </div>

                {!!selected.length && (
                    <>
                        <Separator />
                        
                        <div className="px-4 flex flex-wrap gap-x-2 gap-y-1">
                            <div className="md:ml-auto" />
                            
                            <div>
                                <Button
                                    variant="destructive"
                                    className="h-auto w-auto"
                                    onClick={() => onDelete(selected)}
                                >
                                    <Trash className="h-4 w-4 mr-1" />
                                    <span>{selected.length > 1 ? `Delete ${selected.length} selected hospitals` : 'Delete selected hospital'}</span>
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
