'use client';

import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";

import { 
    Select,
    SelectTrigger, 
    SelectValue, 
    SelectContent, 
    SelectItem,
} from '@/components/ui/select';
import { Loader } from "@/components/loader";

const statusFilters = [
    {
        value: 'all',
        label: 'All scripts',
    },
    {
        value: 'archived',
        label: 'Archived scripts',
    },
];

export function ScriptsTableFilters() {
    const mounted = useRef(false);
    const router = useRouter();

    const [loading, startTransition] = useTransition();
    
    const [status, setStatus] = useQueryState('status', {
        defaultValue: statusFilters[0].value,
        clearOnDefault: true,
    });

    useEffect(() => {
        if (mounted.current) {
            setTimeout(() => startTransition(router.refresh), 0);
        }
    }, [status, router.refresh, startTransition]);

    useEffect(() => { mounted.current = true; }, []);

    return (
        <>
            {loading && <Loader overlay />}

            <Select
                value={status}
                onValueChange={v => setStatus(v)}
            >
                <SelectTrigger>
                    <SelectValue 
                        placeholder="All keys"
                    />
                </SelectTrigger>

                <SelectContent>
                    {statusFilters.map(o => {
                        return (
                            <SelectItem
                                key={o.value}
                                value={o.value}
                            >
                                {o.label}
                            </SelectItem>
                        )
                    })}
                </SelectContent>
            </Select>
        </>
    );
}
