import socket from "./socket";

export const BROADCAST_ACTIONS_IN_PROGRESS = {
    loading_local_data: '1', // 'loading_local_data',
    loading_remote_data: '2', // 'loading_remote_data',
    saving_scripts: '3', // 'saving_scripts',
    saving_dff: '4', // 'saving_dff',
    saving_data_keys: '5', // 'saving_data_keys',
} as const;

export async function broadcastActionInProgress(
    requestKey: string,
    action: string, 
    loading: boolean
) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    socket.emit('in_progress', requestKey, action, loading);
}
