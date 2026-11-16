'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ArrowRightIcon, Loader2Icon, MergeIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { dataKeyTypeFamily } from '@/lib/data-key-types';
import type { DataKeyDuplicateCheck, DataKeyDuplicateReport, ExistingDataKey } from '@/lib/data-key-duplicate-check';

/**
 * Checks the key being created (or renamed) against the existing data keys —
 * this library and the linked editor's — while it is typed. Only the parts that
 * changed are checked: an existing key's own name and label never conflict.
 */
export function useDataKeyDuplicateCheck({
    name,
    label,
    uuid,
    checkName,
    checkLabel,
    enabled,
}: {
    name?: string | null;
    label?: string | null;
    uuid?: string | null;
    checkName: boolean;
    checkLabel: boolean;
    enabled: boolean;
}) {
    const [state, setState] = useState<{ loading: boolean; report: DataKeyDuplicateReport | null; error: string; }>({ loading: false, report: null, error: '' });
    const wantedName = checkName ? `${name || ''}`.trim() : '';
    const wantedLabel = checkLabel ? `${label || ''}`.trim() : '';

    useEffect(() => {
        if (!enabled || (!wantedName && !wantedLabel)) {
            setState({ loading: false, report: null, error: '' });
            return;
        }
        const controller = new AbortController();
        setState((current) => ({ ...current, loading: true, error: '' }));
        const timer = setTimeout(async () => {
            try {
                const res = await axios.post<{ data?: DataKeyDuplicateReport; errors?: string[]; }>(
                    '/api/data-keys/duplicate-check',
                    { name: wantedName, label: wantedLabel, uuid },
                    { signal: controller.signal },
                );
                setState({ loading: false, report: res.data.data || null, error: res.data.errors?.[0] || '' });
            } catch (e: any) {
                if (axios.isCancel(e)) return;
                setState({ loading: false, report: null, error: e.message || 'Could not check for duplicates.' });
            }
        }, 400);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [enabled, wantedName, wantedLabel, uuid]);

    const report = state.report;
    // This library first, then the linked editor's.
    const both = (part: keyof DataKeyDuplicateCheck): Match[] => [
        ...(report?.local[part] || []).map((key) => ({ key, where: '' })),
        ...(report?.linked?.check?.[part] || []).map((key) => ({ key, where: report!.linked!.siteName })),
    ];
    const sameName = both('sameName');

    // Keys here that already share this name (any casing) and are the same kind of key:
    // a duplicate group to harmonise rather than add to.
    const sameNameHere = [...(report?.local.sameName || []), ...(report?.local.sameNameOtherCase || [])];
    const byFamily = new Map<string, ExistingDataKey[]>();
    sameNameHere.forEach((key) => {
        const family = dataKeyTypeFamily(key.dataType);
        byFamily.set(family, [...(byFamily.get(family) || []), key]);
    });
    const harmoniseGroup = Array.from(byFamily.values()).sort((a, b) => b.length - a.length)[0] || [];

    return {
        loading: state.loading,
        error: state.error,
        report,
        /** The very same key exists (here or in the linked editor): creating another is not allowed. */
        blocked: sameName.length > 0,
        sameName,
        sameNameOtherCase: both('sameNameOtherCase'),
        sameLabel: both('sameLabel'),
        similarName: both('similarName'),
        similarLabel: both('similarLabel'),
        /** Two or more keys here already share the name: worth merging into one. */
        harmoniseGroup: harmoniseGroup.length > 1 ? harmoniseGroup : [],
    };
}

type Match = { key: ExistingDataKey; where: string; };
type CheckState = ReturnType<typeof useDataKeyDuplicateCheck>;
/** Coming from a script reference: use an existing key for it instead of creating one. */
type UseKey = (key: ExistingDataKey) => void;

const ERROR_CLASS = 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400';
const WARNING_CLASS = 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400';

function KeyRef({ match, onUseKey }: { match: Match; onUseKey?: UseKey; }) {
    const { key, where } = match;
    const text = `${key.name}${key.label && key.label !== key.name ? ` — ${key.label}` : ''}${key.dataType ? ` (${key.dataType.replace(/_/g, ' ')})` : ''}${key.isDraft ? ', unpublished' : ''}`;
    if (where) return <span>{text} <span className="opacity-80">in the {where} library</span></span>;
    return (
        <span>
            <Link href={`/data-keys/edit/${key.uuid}`} target="_blank" rel="noopener noreferrer" className="underline">
                {text}
            </Link>
            {/* Only a key in this library can be used here. */}
            {!!onUseKey && (
                <button
                    type="button"
                    onClick={() => onUseKey(key)}
                    className="ml-1.5 inline-flex items-center gap-0.5 rounded border border-current px-1.5 py-px font-medium hover:opacity-80"
                >
                    Use this key <ArrowRightIcon className="size-3" />
                </button>
            )}
        </span>
    );
}

const list = (matches: Match[], onUseKey?: UseKey, limit = 4) => (
    <>
        {matches.slice(0, limit).map((match, index) => (
            <span key={`${match.where}-${match.key.uuid}-${index}`}>
                {index > 0 && ', '}
                <KeyRef match={match} onUseKey={onUseKey} />
            </span>
        ))}
        {matches.length > limit && ` and ${matches.length - limit} more`}
    </>
);

/** Two or more keys here already share this name: merge them rather than add another. */
function HarmoniseLink({ group }: { group: ExistingDataKey[]; }) {
    if (group.length < 2) return null;
    return (
        <div className="mt-1">
            <Link
                href={`/data-keys/merge?ids=${group.map((key) => key.uuid).join(',')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium underline"
            >
                <MergeIcon className="size-3" />
                {group.length} keys are already named “{group[0].name}” — harmonise them into one
            </Link>
        </div>
    );
}

/** Under the key: the very same key (blocks), the same key in another casing or a similar name (warn). */
export function DataKeyNameNotice({ check, onUseKey }: { check: CheckState; onUseKey?: UseKey; }) {
    if (check.loading && !check.report) {
        return (
            <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground" role="status">
                <Loader2Icon className="size-3 animate-spin" /> Checking the data keys library…
            </span>
        );
    }
    return (
        <>
            {!!check.sameName.length && (
                <div className={cn('mt-1 rounded-md border px-2 py-1.5 text-xs', ERROR_CLASS)} role="alert">
                    This data key already exists: {list(check.sameName, onUseKey)}. Use that key instead of creating another.
                    <HarmoniseLink group={check.harmoniseGroup} />
                </div>
            )}
            {!check.sameName.length && !!check.sameNameOtherCase.length && (
                <div className={cn('mt-1 rounded-md border px-2 py-1.5 text-xs', WARNING_CLASS)}>
                    A key with the same name in different casing exists: {list(check.sameNameOtherCase, onUseKey)}. It would be a separate
                    key, but conditions ignore casing, so a condition could not tell the two apart.
                    <HarmoniseLink group={check.harmoniseGroup} />
                </div>
            )}
            {!!check.similarName.length && (
                <div className={cn('mt-1 rounded-md border px-2 py-1.5 text-xs', WARNING_CLASS)}>
                    {check.similarName.length === 1 ? 'A key with a very similar name exists' : 'Keys with very similar names exist'}
                    {' '}(the same apart from spaces, underscores or dots): {list(check.similarName, onUseKey)}. Check it isn&apos;t the
                    key you need — you can still save.
                </div>
            )}
        </>
    );
}

/** Under the label: keys with the same or a similar label (warn, allowed), and a linked library that could not be checked. */
export function DataKeyLabelNotice({ check, onUseKey }: { check: CheckState; onUseKey?: UseKey; }) {
    const linkedError = check.report?.linked?.error;
    return (
        <>
            {!!check.sameLabel.length && (
                <div className={cn('mt-1 rounded-md border px-2 py-1.5 text-xs', WARNING_CLASS)}>
                    {check.sameLabel.length === 1 ? 'A data key already uses' : `${check.sameLabel.length} data keys already use`} this
                    label: {list(check.sameLabel, onUseKey)}. Check this isn&apos;t the same question before creating a new key — you can still save.
                </div>
            )}
            {!!check.similarLabel.length && (
                <div className={cn('mt-1 rounded-md border px-2 py-1.5 text-xs', WARNING_CLASS)}>
                    {check.similarLabel.length === 1 ? 'A data key has a similar label' : `${check.similarLabel.length} data keys have similar labels`}:
                    {' '}{list(check.similarLabel, onUseKey)}. Check it isn&apos;t the same question — you can still save.
                </div>
            )}
            {(!!linkedError || !!check.error) && (
                <span className="mt-1 block text-xs text-muted-foreground">{linkedError || check.error}</span>
            )}
        </>
    );
}
