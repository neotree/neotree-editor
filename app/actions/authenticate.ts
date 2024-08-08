import { headers } from 'next/headers'

import logger from "@/lib/logger";
import { _getApiKeys } from '@/databases/queries/api-keys';
import { _getAuthClients } from '@/databases/queries/auth-clients';

export async function validateHeadersItem(key: string, cb: (value: string) => Promise<boolean>) {
    const headersList = headers();
    const value = headersList.get(key);
    
    if (!value) return false;

    return cb(value);
}

export async function validateAuthClient(type: 'token' | 'id', value: string) {
	try {
        if (!value) return false;

        const { data } = await _getAuthClients(
            type === 'token' ? 
                { clientTokens: [value], }
                :
                { clientIds: [value], }
        );

        return !!data.length;
	} catch(e: any) {
		logger.error('validateAuthClient ERROR:', e.message);
		return false;
	}
}

export async function validateApiKey(apiKey: string) {
	try {
        if (!apiKey) return false;

        const { data } = await _getApiKeys({ apiKeys: [apiKey], });

        return !!data.length;
	} catch(e: any) {
		logger.error('validateApiKey ERROR:', e.message);
		return false;
	}
}
