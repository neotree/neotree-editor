'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAlertModal } from '@/hooks/use-alert-modal';
import { Loader } from '@/components/loader';
import * as scriptsActions from '@/app/actions/scripts';
import { createLock } from "@/app/actions/locks";
import { ScreensTable } from './table';
import logger from "@/lib/logger"

type Props = {
    scriptId: string;
    locked?:boolean;
};

export default function Screens({ scriptId,locked }: Props) {
    const [loading, setLoading] = useState(false);
    const [screens, setScreens] = useState<Awaited<ReturnType<typeof scriptsActions.getScreens>>>({ data: [], });
    const { alert } = useAlertModal();

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await axios.get<Awaited<ReturnType<typeof scriptsActions.getScreens>>>('/api/screens?data='+JSON.stringify({ scriptsIds: [scriptId], returnDraftsIfExist: true, }))
                setScreens(res.data);
               //CREATE NEW LOCK
                await axios.post<Awaited<ReturnType<typeof createLock>>>('/api/locks?data='+JSON.stringify({script: scriptId,lockType:'script'}))
             
            } catch(e: any) {
                alert({
                    title: "",
                    message: e.message,
                });
            } finally {
                setLoading(false);
            }
        })();
    }, [alert, scriptId]);

    return (
        <>
            {loading && <Loader overlay />}

            <ScreensTable 
                screens={screens}
                locked={locked}
            />
        </>
    );
}
