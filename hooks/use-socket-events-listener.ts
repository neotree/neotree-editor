'use client';

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import socket  from '@/lib/socket';

export function useSocketEventsListener({ events: eventsProp, }: {
    events: {
        name: string;
        action?: string;
        delay?: number;
        onEvent: {
            replaceRoute?: boolean;
            refreshRouter?: boolean;
            redirect?: { to: string; replace?: boolean; };
            callback?: (...args: any[]) => void;
        };
    }[];
}) {
    const events = useMemo(() => eventsProp, [eventsProp]);

    const ref = useRef({
        eventsTimeouts: {} as { [key: string]: ReturnType<typeof setTimeout> },
        eventsTimestamps: {} as { [key: string]: number; },
    });

    const lastEventTimestamp = useRef(new Date().getTime());

    const router = useRouter();

    useEffect(() => {
        events.forEach(({ name: eventName, action, delay = 100, onEvent }) => {
            socket.on(eventName, (...args) => {
                const handleEvent = () => {
                    if (action && (args[0] !== action)) return;

                    onEvent.callback?.(...args);

                    if (onEvent?.refreshRouter) {
                        console.log(eventName, 'refreshing...')
                        router.refresh();
                    }

                    if (onEvent.redirect?.to) {
                        if (onEvent.redirect.replace) {
                            router.replace(onEvent.redirect.to);
                        } else {
                            router.push(onEvent.redirect.to);
                        }
                    }
                }

                const timestamp = new Date().getTime();

                if (delay) {
                    clearTimeout(ref.current.eventsTimeouts[eventName]);
                    ref.current.eventsTimeouts[eventName] = setTimeout(() => {
                        ref.current.eventsTimestamps[eventName] = timestamp;
                        handleEvent();
                    }, delay);
                } else {
                    ref.current.eventsTimestamps[eventName] = new Date().getTime();
                    handleEvent();
                }
            });
        });
    }, [events, router]);
}
