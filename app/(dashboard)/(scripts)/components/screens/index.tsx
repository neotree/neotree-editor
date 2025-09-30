'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAlertModal } from '@/hooks/use-alert-modal';
import { Loader } from '@/components/loader';
import * as scriptsActions from '@/app/actions/scripts';
import { ScreensTable } from './table';
import logger from "@/lib/logger"

type Props = {
    scriptId: string;
};

export default function Screens({ scriptId }: Props) {
    const [loading, setLoading] = useState(false);
    const [screens, setScreens] = useState<Awaited<ReturnType<typeof scriptsActions.getScreens>>>({ data: [], });

    const { alert } = useAlertModal();

    const loadScreens = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get<Awaited<ReturnType<typeof scriptsActions.getScreens>>>('/api/screens?data='+JSON.stringify({ scriptsIds: [scriptId], returnDraftsIfExist: true, }))
            setScreens(res.data);
        } catch(e: any) {
            alert({
                title: "",
                message: e.message,
            });
        } finally {
            setLoading(false);
        }
    }, [scriptId, alert]);

    useEffect(() => { loadScreens(); }, [loadScreens]);

    return (
        <>
            {loading && <Loader overlay />}

            <ScreensTable 
                screens={screens}
                loadScreens={loadScreens}
            />
        </>
    );
}
