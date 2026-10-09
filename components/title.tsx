'use client';

import { useEffect, useRef } from "react";

// Titles requested by the mounted <Title> components, in mount order. The last one wins, so a page's title
// takes precedence over its layout's, as it did when each Title simply set document.title in an effect.
const titles: { value: string; }[] = [];
let headObserver: MutationObserver | null = null;

function applyTitle() {
    const title = titles[titles.length - 1]?.value ?? (process.env.NEXT_PUBLIC_APP_NAME || '');
    if (document.title !== title) document.title = title;
}

export function Title({ children }: { children: string; }) {
    const entry = useRef({ value: '' });

    useEffect(() => {
        entry.current.value = [process.env.NEXT_PUBLIC_APP_NAME || '', children || ''].filter(s => s).join(' - ');
        applyTitle();
    }, [children]);

    useEffect(() => {
        const current = entry.current;
        titles.push(current);
        applyTitle();

        // With Next 15 (React 19) the route's metadata <title> can be committed after our effects run, both on
        // first load and on client-side navigation, which overwrites document.title. Re-apply ours whenever
        // <head> changes while any Title is mounted.
        if (!headObserver) {
            headObserver = new MutationObserver(applyTitle);
            headObserver.observe(document.head, { subtree: true, childList: true, characterData: true });
        }

        return () => {
            titles.splice(titles.indexOf(current), 1);
            if (!titles.length) {
                headObserver?.disconnect();
                headObserver = null;
            }
            applyTitle();
        };
    }, []);

    return null;
}
