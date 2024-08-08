'use client';

import { useEffect } from "react";

export function Title({ children }: { children: string; }) {
    useEffect(() => {
        document.title = [process.env.NEXT_PUBLIC_APP_NAME, children].filter(s => s).join(' - ');
    }, [children]);

    useEffect(() => () => {
        document.title = `${process.env.NEXT_PUBLIC_APP_NAME}`;
    }, []);

    return null;
}
