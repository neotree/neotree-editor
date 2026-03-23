'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { useAlertModal } from '@/hooks/use-alert-modal';
import { Loader } from '@/components/loader';
import * as scriptsActions from '@/app/actions/scripts';
import { ProblemsTable } from './table';

type Props = {
    scriptId: string;
    disabled?: boolean;
    isScriptLocked?: boolean;
    scriptLockedByUserId?: string | null;
};

export default function Problems({ scriptId, disabled, isScriptLocked, scriptLockedByUserId }: Props) {
    const [loading, setLoading] = useState(false);
    const [problems, setProblems] = useState<Awaited<ReturnType<typeof scriptsActions.getProblems>>>({ data: [], });

    const { alert } = useAlertModal();

    const loadProblems = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get<Awaited<ReturnType<typeof scriptsActions.getProblems>>>('/api/problems?data='+JSON.stringify({ scriptsIds: [scriptId], returnDraftsIfExist: true, }))
            setProblems(res.data);
        } catch(e: any) {
            alert({
                title: "",
                message: e.message,
            });
        } finally {
            setLoading(false);
        }
    }, [scriptId, alert]);

    useEffect(() => { loadProblems(); }, [loadProblems]);

    return (
        <>
            {loading && <Loader overlay />}

            <ProblemsTable 
                problems={problems}
                loadProblems={loadProblems}
                isScriptLocked={isScriptLocked}
                scriptLockedByUserId={scriptLockedByUserId}
            />
        </>
    );
}
