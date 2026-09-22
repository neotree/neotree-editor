import socket from "./socket";

export const BROADCAST_ACTIONS_IN_PROGRESS = {
    loading_local_data: '1',
    loading_remote_datakeys: '2',
    loading_remote_scripts: '3',
    loading_remote_screens: '4',
    loading_remote_diagnoses: '5',
    loading_remote_problems: '6',
    loading_remote_dff: '7',
    uploading_remote_files: '8',
    saving_scripts: '9',
    saving_dff: '10',
    saving_data_keys: '11',
} as const;

export async function broadcastActionInProgress(
    requestKey: string,
    action: string, 
    loading: boolean
) {
    await new Promise(resolve => setTimeout(resolve, 0));
    socket.emit('in_progress', requestKey, action, loading);
}
