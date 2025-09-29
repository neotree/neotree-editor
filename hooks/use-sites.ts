import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import { useAppContext } from "@/contexts/app";
import { useAlertModal } from "@/hooks/use-alert-modal";

type UseSitesOpts = {
    loadOnMount?: boolean;
    onLoadSitesError?: () => void;
};

export function useSites(opts?: UseSitesOpts) {
    const { 
        loadOnMount = true,
        onLoadSitesError,
    } = { ...opts };

    const [loading, setLoading] = useState(false);
    const { alert } = useAlertModal();
    const { getSites } = useAppContext();
    const [sites, setSites] = useState<Awaited<ReturnType<typeof getSites>>['data']>([]);

    const loadSites = useCallback(async () => {
        try {
            setLoading(true);

            const response = await axios.get('/api/sites?data='+JSON.stringify({ types: ['webeditor'], }));
            const res = response.data as Awaited<ReturnType<typeof getSites>>;

            if (res.errors?.length) throw new Error(res.errors.join(', '));

            setSites(res.data || []);
        } catch(e: any) {
            alert({
                title: 'Error',
                message: 'Failed to load sites: ' + e.message,
                variant: 'error',
                onClose: () => onLoadSitesError?.(),
            });
        } finally {
            setLoading(false);
        }
    }, [getSites, alert, onLoadSitesError]);

    useEffect(() => {
        if (loadOnMount && !sites.length) {
            loadSites();
        }
    }, [sites, loadOnMount, loadSites]);

    return {
        loading,
        sites,
        loadSites,
    };
}
