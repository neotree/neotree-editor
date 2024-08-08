'use client';

import { useEffect, useRef } from "react";

export function useEffectOnce(effect: Parameters<typeof useEffect>[0]) {
    const count = useRef(0);

    return useEffect(() => {
        count.current += 1;
        if (count.current === 1) return;
        return effect();
    }, [effect]);
}
