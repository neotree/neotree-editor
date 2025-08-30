'use client';

import { Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";

import axios from "axios";

export function LockStatus({ 
    scriptId,
    lockType,
    onStatusChange 
}: { 
    scriptId: string;
    lockType: string;
    onStatusChange?: (locked: boolean) => void;
}) {
    const [lockStatus, setLockStatus] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        let mounted = true;

        async function fetchLockStatus() {
            try {
                //DROP STALE LOCKS:
                const script = scriptId?scriptId:null
                const deleted = await axios.delete('/api/locks?data='+JSON.stringify({script: script,lockType:lockType}))
                const res = await axios.get<boolean>('/api/locks?data='+JSON.stringify({script:script,lockType:lockType }));
                    const status = res.data;
                if (mounted) {
                    setLockStatus(status);
                    // Move callback to after state update
                    setTimeout(() => onStatusChange?.(status), 0);
                }
            } catch (error) {
                console.error('Error fetching lock status:', error);
            }
        }

        fetchLockStatus();

        return () => {
            mounted = false;
        };
    }, [scriptId]); 

    if (lockStatus === undefined) return null;

    return (
        <div className={`p-1 rounded ${lockStatus ? 'bg-red-100' : 'bg-green-100'}`}>
            {lockStatus ? (
                <Lock className="h-4 w-4 text-red-900" />
            ) : (
                <Unlock className="h-4 w-4 text-green-900" />
            )}
        </div>
    );
}