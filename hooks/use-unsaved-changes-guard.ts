'use client';

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useConfirmModal } from "@/hooks/use-confirm-modal";

const DEFAULT_MESSAGE = 'You have unsaved changes on this page. Leave without saving?';

/**
 * Warn before leaving a page with unsaved edits: closing or reloading the tab, and following an in-app
 * link. Leaving the screen editor used to drop unsaved field and option edits silently.
 *
 * In-app links ask with the app's confirm dialog. Closing or reloading the tab can only use the browser's
 * own prompt (browsers do not allow anything else there).
 *
 * Returns `confirmLeave(leave)` for buttons that leave the page in code (e.g. Cancel): it asks the same
 * question first when there are unsaved changes, and just leaves when there are none.
 */
export function useUnsavedChangesGuard(dirty: boolean, message = DEFAULT_MESSAGE) {
    const router = useRouter();
    const { confirm } = useConfirmModal();
    const leaving = useRef(false);

    const dialogOptions = {
        title: 'Unsaved changes',
        message,
        positiveLabel: 'Leave',
        negativeLabel: 'Stay',
        danger: true,
    };

    useEffect(() => {
        if (!dirty) return;
        leaving.current = false;

        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (leaving.current) return;
            e.preventDefault();
            e.returnValue = message;
            return message;
        };

        const onClick = (e: MouseEvent) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const anchor = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
            if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
            const href = anchor.getAttribute('href') || '';
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
            const url = new URL(anchor.href, window.location.href);
            if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search) return;

            // next/link skips a prevented click
            e.preventDefault();
            // a menu item ignores a prevented click and would stay open over the page: close it first
            if (anchor.closest('[role="menu"]')) {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            }

            confirm(() => {
                leaving.current = true;
                if (url.origin === window.location.origin) {
                    router.push(`${url.pathname}${url.search}${url.hash}`);
                } else {
                    window.location.assign(url.href);
                }
            }, dialogOptions);
        };

        window.addEventListener('beforeunload', onBeforeUnload);
        document.addEventListener('click', onClick, true);
        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
            document.removeEventListener('click', onClick, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dirty, message, confirm, router]);

    return {
        confirmLeave: useCallback((leave: () => void) => {
            if (!dirty) return leave();
            confirm(() => {
                leaving.current = true;
                leave();
            }, dialogOptions);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [dirty, message, confirm]),
    };
}
