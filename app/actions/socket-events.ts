'use server';

declare global {
    var socketEvents: Record<string, any>;
}

export const getSocketEvent = async (eventName: string) => {
    const events = { ...globalThis.socketEvents, };
    return events[eventName];
};

export const removeSocketEvent = async (eventName: string) => {
    if (eventName && globalThis.socketEvents) {
        delete globalThis.socketEvents[eventName];
    }
};
