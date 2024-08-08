import axios from 'axios';
import { eq } from 'drizzle-orm';
import { io } from 'socket.io-client';

import db from "@/databases/pg/drizzle";
import { sites } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import queryString from 'query-string';
import { _getScriptsWithItems } from '@/databases/queries/_scripts';
import { __importScripts } from '../_scripts';

const socket = io(process.env.NEXT_PUBLIC_APP_URL);

export async function _importRemoteScripts(
    { siteId, scriptsIds, }: {
        siteId: string;
        scriptsIds: {
            scriptId: string;
            overWriteExistingScriptWithId?: string;
        }[];
    },
    opts?: {
        broadcastAction?: boolean;
    }
) {
    const response: { success: boolean; errors?: string[]; } = { success: false, };
    try {
        if (!siteId) throw new Error('Missing siteId');

        const site = await db.query.sites.findFirst({
            where: eq(sites.siteId, siteId),
        });

        if (!site) throw new Error('Site not found');

        // TODO: remove this static link
        const siteLink = process.env.NEXT_PUBLIC_APP_URL; // site.link;

        const axiosClient = axios.create({
            baseURL: `${siteLink}/api`,
        });
        
        axiosClient.interceptors.request.use(async config => {
            if (config.headers) {
                config.headers['x-api-key'] = site.apiKey;
            }
            logger.error(config.method, [`${siteLink}/api`, config.url].join(''));
            return config;
        });
        
        axiosClient.interceptors.response.use(
            res => res, 
            e => new Promise((_, reject) => {
                return reject(e);
            }),
        );

        for(const { scriptId, overWriteExistingScriptWithId } of scriptsIds) {
            const res = await axiosClient.get('/scripts/with-items?' + queryString.stringify({ 
                scriptsIds: JSON.stringify([scriptId]), 
            }));
            const resData = res.data as Awaited<ReturnType<typeof _getScriptsWithItems>>;
            const { data: scripts = [], errors } = resData;
            
            if (errors?.length) {
                response.success = false;
                response.errors = errors;
            } else {
                const res = await __importScripts(scripts.map(s => ({
                    ...s,
                    scriptId: overWriteExistingScriptWithId || s.scriptId,
                })), { overWriteScriptId: !overWriteExistingScriptWithId, });
                if (res.errors) {
                    response.success = false;
                    response.errors = [...(response.errors || []), ...res.errors];
                }
            }
        }

        if (!response.errors?.length) {
            response.success = true;
            if (opts?.broadcastAction) socket.emit('data_changed', 'create_scripts_drafts');
        }
    } catch(e: any) {
        const message = e.response?.data?.message || e.response?.data || e.message;
        response.success = false;
        response.errors = [message];
        logger.error('importRemoteScripts ERROR', message);
    } finally {
        return response;
    }
}
