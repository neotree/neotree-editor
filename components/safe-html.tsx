'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

// useLayoutEffect fills the element before the browser paints, so there is no
// empty frame; on the server it would only warn, and there is nothing to fill.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Renders an HTML string (modal messages, option captions, upload errors), which
 * often carries data key names and labels typed by users.
 *
 * DOMPurify parses and sanitises the string into a DOM fragment, and that fragment
 * is inserted as-is: the HTML string never reaches innerHTML or
 * dangerouslySetInnerHTML, so nothing can bypass the sanitiser. DOMPurify needs a
 * DOM, so the element is empty in server-rendered HTML and filled on the client.
 */
export function SafeHtml({
    html,
    className,
}: {
    html?: string | null;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useIsomorphicLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.replaceChildren(DOMPurify.sanitize(`${html ?? ''}`, { RETURN_DOM_FRAGMENT: true }));
    }, [html]);

    return <div ref={ref} className={className} />;
}
