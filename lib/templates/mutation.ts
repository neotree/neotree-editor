import socket  from '@/lib/socket';
import logger from '@/lib/logger';

export async function _mutationTemplate(
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const response: { 
        success: boolean; 
        errors?: string[]; 
    } = { success: false, };

    try {
        //

        if (!response.errors?.length) {
            response.success = true;
            // if (opts?.broadcastAction) socket.emit('event_name', 'action');
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_mutationTemplate ERROR', e.message);
    } finally {
        return response;
    }
}
