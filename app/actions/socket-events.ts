'use server';

declare global {
    var socketEvents: Record<string, any>;
}

export const getSocketEvent = async (eventName: string) => {
    const events = { ...socketEvents, };
    return events[eventName];
};
