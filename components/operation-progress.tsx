'use client';

import { useEffect, useRef, useState } from "react";
import { CheckIcon, Loader2 } from "lucide-react";

import { useAppContext } from "@/contexts/app";
import { parseProgressAction } from "@/lib/in-progress";
import socket from "@/lib/socket";
import { cn } from "@/lib/utils";

export type OperationProgressStep = {
    /** The action key the server reports (e.g. DATA_KEY_SAVE_PROGRESS.updating). */
    key: string;
    label: string;
    /** What is being counted, for "12 of 40 <unit>". */
    unit?: string;
};

type StepState = { active: boolean; done?: number; total?: number; };

// Stages arrive live over the socket; the server also records them, and asking for
// that record now and then covers an event missed on a reconnect.
const POLL_MS = 5000;

/**
 * Live progress of a long server operation, the way the script import shows it:
 * the stages reached so far (done or running), a count for the running stage,
 * and the time elapsed. The server reports stages on the socket under the
 * operation's requestKey and records them; the record is also polled, in case an event is missed.
 */
export function OperationProgress({
    requestKey,
    title,
    description,
    steps,
}: {
    requestKey: string;
    title: string;
    description?: string;
    steps: OperationProgressStep[];
}) {
    const { getSocketEvent } = useAppContext();

    const startedAt = useRef(Date.now());
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    useEffect(() => {
        startedAt.current = Date.now();
        setElapsedSeconds(0);
        const interval = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
        return () => clearInterval(interval);
    }, [requestKey]);
    const elapsed = elapsedSeconds >= 60 ? `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s` : `${elapsedSeconds}s`;

    const [states, setStates] = useState<Record<string, StepState>>({});

    useEffect(() => {
        setStates({});
        const apply = (prev: Record<string, StepState>, action: string, active: boolean) => {
            const { key, done, total } = parseProgressAction(action);
            const current = prev[key] || { active: false };
            return {
                ...prev,
                [key]: total !== undefined
                    ? { ...current, active: true, done, total }
                    : { ...current, active },
            };
        };
        const onEvent = (action: string, active: boolean) => setStates((prev) => apply(prev, action, active));
        socket.on(requestKey, onEvent);

        let timer: ReturnType<typeof setTimeout> | null = null;
        let stopped = false;
        const poll = async () => {
            try {
                const events: string[] = (await getSocketEvent(requestKey)) || [];
                if (stopped) return;
                setStates((prev) => events.reduce((acc, event) => {
                    const [action, value] = event.split('__');
                    return apply(acc, action, value === 'true');
                }, prev));
            } catch {
                // the next poll or socket event catches up
            }
            if (!stopped) timer = setTimeout(poll, POLL_MS);
        };
        poll();

        return () => {
            stopped = true;
            socket.off(requestKey, onEvent);
            if (timer) clearTimeout(timer);
            // The server forgets the record itself once the operation is over: removing it from here
            // could race the operation's first stages (e.g. when the dialog remounts).
        };
    }, [requestKey, getSocketEvent]);

    // Only stages that happened are listed: a save skips the ones it doesn't need.
    const reached = steps.filter((step) => states[step.key]);

    return (
        <div className="flex flex-col gap-y-4" role="status" aria-live="polite">
            <div>
                <div className="flex items-center gap-x-2 text-sm font-medium">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    {title}
                    <span className="text-xs font-normal text-muted-foreground">{elapsed}</span>
                </div>
                {!!description && <div className="mt-1 text-xs text-muted-foreground">{description}</div>}
            </div>

            <div className="flex flex-col gap-y-1.5">
                {!reached.length && (
                    <div className="flex items-center gap-x-2 text-xs text-muted-foreground">
                        <Loader2 className="size-3 animate-spin" />
                        <span>Starting…</span>
                    </div>
                )}
                {reached.map((step) => {
                    const state = states[step.key];
                    const finished = !state.active;
                    const hasCount = state.total !== undefined && state.total > 0;
                    const percent = hasCount ? Math.min(100, Math.round(((state.done || 0) / state.total!) * 100)) : 0;
                    return (
                        <div key={step.key} className="space-y-1">
                            <div className={cn('flex items-center gap-x-2 text-xs', finished ? 'text-muted-foreground' : 'font-medium')}>
                                {finished
                                    ? <CheckIcon className="size-3 text-primary" />
                                    : <Loader2 className="size-3 animate-spin text-primary" />}
                                <span>{step.label}</span>
                                {hasCount && (
                                    <span className="ml-auto tabular-nums text-muted-foreground">
                                        {state.done} of {state.total}{step.unit ? ` ${step.unit}` : ''}
                                    </span>
                                )}
                            </div>
                            {hasCount && !finished && (
                                <div className="ml-5 h-1 overflow-hidden rounded-full bg-muted">
                                    <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
