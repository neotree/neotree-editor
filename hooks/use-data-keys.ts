import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAppContext, IAppContext } from "@/contexts/app";
import { useAlertModal } from "@/hooks/use-alert-modal";

type DataKey = Awaited<ReturnType<IAppContext['getDataKeys']>>['data'][0];

type Params = NonNullable<Parameters<IAppContext['getDataKeys']>[0]> & {
    pause?: boolean;
};

export function useDataKeys(params?: Params) {
    const ref = useRef({ ...params });

    const _params = useMemo(() => ({ ...params, }), [params]);

    const { getDataKeys: _getDataKeys } = useAppContext();

    const { alert } = useAlertModal();

    const [dataKeys, setDataKeys] = useState<DataKey[]>([]);
    const [loading, setLoading] = useState(false);

    const getDataKeys = useCallback(async () => {
        const { ...fetchParams } = _params;
        try {
            setLoading(true);
            const { data, errors } = await _getDataKeys(fetchParams);
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
    }, [_params, _getDataKeys, alert]);

    useEffect(() => {
        if (
            !loading &&
            !_params.pause && 
            (JSON.stringify(ref.current) !== JSON.stringify(_params))
        ) {
            _getDataKeys();
        }
    }, [_params, loading, _getDataKeys]);

    return {
        dataKeys,
        loading,
    };
}
