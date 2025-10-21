'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { useAlertModal } from '@/hooks/use-alert-modal';
import { Loader } from '@/components/loader';
import * as scriptsActions from '@/app/actions/scripts';
import { DiagnosesTable } from './table';

type Props = {
    scriptId: string;
    disabled?: boolean;
    isScriptLocked?: boolean;
    scriptLockedByUserId?: string | null;
};

export default function Diagnoses({ scriptId, disabled, isScriptLocked, scriptLockedByUserId }: Props) {
    const [loading, setLoading] = useState(false);
    const [diagnoses, setDiagnoses] = useState<Awaited<ReturnType<typeof scriptsActions.getDiagnoses>>>({ data: [], });

    const { alert } = useAlertModal();

    const loadDiagnoses = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get<Awaited<ReturnType<typeof scriptsActions.getDiagnoses>>>('/api/diagnoses?data='+JSON.stringify({ scriptsIds: [scriptId], returnDraftsIfExist: true, }))
            setDiagnoses(res.data);
        } catch(e: any) {
            alert({
                title: "",
                message: e.message,
            });
        } finally {
            setLoading(false);
        }
    }, [scriptId, alert]);

    useEffect(() => { loadDiagnoses(); }, [loadDiagnoses]);

    return (
        <>
            {loading && <Loader overlay />}

            <DiagnosesTable 
                diagnoses={diagnoses}
                loadDiagnoses={loadDiagnoses}
                isScriptLocked={isScriptLocked}
                scriptLockedByUserId={scriptLockedByUserId}
            />
        </>
    );
}
