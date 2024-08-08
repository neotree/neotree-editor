import { useRef, useEffect, useMemo } from "react";

export const useEffectIfMounted: typeof useEffect = (cb, deps) => {
    const mounted = useRef(false);

    const _deps = useMemo(() => [cb, ...(deps || [])], [cb, deps]);

    useEffect(() => {
        if (mounted.current) return cb();
        mounted.current = true;
    }, _deps);
};
