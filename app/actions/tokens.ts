import { _getFullToken } from '@/databases/queries/tokens';
import logger from '@/lib/logger';

export const getToken = async (token: number) => {
    try {
        return await _getFullToken(token);
    } catch(e) {
        logger.error('getToken ERROR', e);
        return null;
    }
};
