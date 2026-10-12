'use client';

import { useMemo } from 'react';
import { useQueryState } from 'nuqs';

import type { ChildMergeAction } from '@/lib/data-key-merge-plan';
import type { LegacyItemLink } from '@/lib/data-key-merge-analysis';

import { decodeAction, encodeAction } from './shared';

const options = { defaultValue: '', clearOnDefault: true, shallow: true, history: 'replace' } as const;

const splitList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

function encodeLink(link: LegacyItemLink) {
    return [link.screenId, link.fieldIndex === null ? 's' : link.fieldIndex, link.itemIndex, link.itemId || '', link.uniqueKey].join('~');
}

function decodeLink(value: string): LegacyItemLink | null {
    const [screenId, fieldIndex, itemIndex, itemId, uniqueKey] = value.split('~');
    if (!screenId || !uniqueKey || Number.isNaN(Number(itemIndex))) return null;
    return {
        screenId,
        fieldIndex: fieldIndex === 's' ? null : Number(fieldIndex),
        fieldId: null,
        itemIndex: Number(itemIndex),
        itemId: itemId || null,
        uniqueKey,
    };
}

/**
 * Every decision on the merge page lives in the URL, so a plan can be shared
 * for review ("open this link and check") and survives a reload.
 */
export function useMergeUrlState() {
    const [keep, setKeep] = useQueryState('keep', options);
    const [exclude, setExclude] = useQueryState('exclude', options);
    const [scope, setScope] = useQueryState('scope', options);
    const [scripts, setScripts] = useQueryState('scripts', options);
    const [actions, setActions] = useQueryState('actions', options);
    const [order, setOrder] = useQueryState('order', options);
    const [label, setLabel] = useQueryState('label', { ...options, defaultValue: '\u0000' });
    const [links, setLinks] = useQueryState('links', options);
    const [cleanup, setCleanup] = useQueryState('cleanup', options);

    const childActions = useMemo(() => Object.fromEntries(splitList(actions)
        .map((entry) => {
            const index = entry.indexOf('=');
            return index > 0 ? [entry.slice(0, index), decodeAction(entry.slice(index + 1))] as const : null;
        })
        .filter((entry): entry is readonly [string, ChildMergeAction] => !!entry)), [actions]);

    const legacyLinks = useMemo(
        () => splitList(links).map(decodeLink).filter((link): link is LegacyItemLink => !!link),
        [links],
    );

    return {
        survivorId: keep,
        setSurvivorId: (id: string) => {
            setKeep(id || null);
            // Suggestions, order and label depend on the kept key.
            setActions(null);
            setOrder(null);
            setLabel(null);
        },
        excludedIds: useMemo(() => splitList(exclude), [exclude]),
        setExcludedIds: (ids: string[]) => setExclude(ids.length ? ids.join(',') : null),
        scope: (scope === 'scripts' ? 'scripts' : 'library') as 'library' | 'scripts',
        setScope: (value: 'library' | 'scripts') => setScope(value === 'scripts' ? 'scripts' : null),
        selectedScriptIds: useMemo(() => splitList(scripts), [scripts]),
        setSelectedScriptIds: (ids: string[]) => setScripts(ids.length ? Array.from(new Set(ids)).join(',') : null),
        childActions,
        setChildActions: (next: Record<string, ChildMergeAction>) => {
            const entries = Object.entries(next).map(([childKey, action]) => `${childKey}=${encodeAction(action)}`);
            setActions(entries.length ? entries.join(',') : null);
        },
        survivorOptionOrder: useMemo(() => splitList(order), [order]),
        setSurvivorOptionOrder: (keys: string[]) => setOrder(keys.length ? keys.join(',') : null),
        /** null = leave the label unchanged */
        survivorLabel: label === '\u0000' ? null : label,
        setSurvivorLabel: (value: string | null) => setLabel(value === null ? null : value),
        legacyLinks,
        setLegacyLinks: (next: LegacyItemLink[]) => setLinks(next.length ? next.map(encodeLink).join(',') : null),
        deleteUnusedChildren: cleanup === '1',
        setDeleteUnusedChildren: (value: boolean) => setCleanup(value ? '1' : null),
    };
}
