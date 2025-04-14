import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAppContext, IAppContext } from "@/contexts/app";
import { useAlertModal } from "@/hooks/use-alert-modal";

type DataKey = Awaited<ReturnType<IAppContext['fetchDataKeys']>>['data'][0];

type Params = NonNullable<Parameters<IAppContext['fetchDataKeys']>[0]> & {
    pause?: boolean;
};

export function useDataKeys(params?: Params) {
    const ref = useRef({ ...params });

    const _params = useMemo(() => ({ ...params, }), [params]);

    const { fetchDataKeys } = useAppContext();

    const { alert } = useAlertModal();

    const [dataKeys, setDataKeys] = useState<DataKey[]>([]);
    const [loading, setLoading] = useState(false);

    const getDataKeys = useCallback(async () => {
        const { ...fetchParams } = _params;
        try {
            setLoading(true);
            const { data, errors } = await fetchDataKeys(fetchParams);
            if (errors?.length) {
                alert({
                    variant: 'error',
                    title: 'Error',
                    message: errors.map(e => `<p>${e}</p>`).join(''),
                });
                return;
            }
            setDataKeys(data);
        } catch(e: any) {
            alert({
                variant: 'error',
                title: 'Error',
                message: e.message,
            });
        } finally {
            ref.current = _params;
            setLoading(false);
        }
    }, [_params, fetchDataKeys, alert]);

    useEffect(() => {
        if (
            !loading &&
            !_params.pause && 
            (JSON.stringify(ref.current) !== JSON.stringify(_params))
        ) {
            getDataKeys();
        }
    }, [_params, loading, getDataKeys]);

    return {
        dataKeys,
        loading,
    };
}
