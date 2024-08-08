'use client';

import { DependencyList, EffectCallback, useEffect, useRef } from "react";

export const useIntervalEffect = (interval: number, effect: EffectCallback, deps?: DependencyList) => {
    const ref = useRef({
        timeout: null as unknown as ReturnType<typeof setTimeout>,
    });

    useEffect(() => {
        return effect();
    }, [effect, deps, interval]);
};
