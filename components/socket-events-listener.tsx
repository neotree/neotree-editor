'use client';

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io } from 'socket.io-client';

const isProd = process.env.NODE_ENV === 'production';
const socket = io(process.env.NEXT_PUBLIC_APP_URL);

export function SocketEventsListener({ events }: {
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

                    if (onEvent?.refreshRouter) router.refresh();

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

    return null;
}
