import 'dotenv/config';
import axios from 'axios';

import * as schema from '@/databases/pg/schema';

export function axiosClient(site: typeof schema.sites.$inferSelect) {
    const axiosClient = axios.create({
        baseURL: `${site.link}/api`,
    });
    
    axiosClient.interceptors.request.use(async config => {
        if (config.headers) {
            config.headers['x-api-key'] = site.apiKey;
        }
        console.log(config.method, [`${site.link}/api`, config.url].join(''));
        return config;
    });
    
    axiosClient.interceptors.response.use(
        res => res, 
        e => new Promise((_, reject) => {
            return reject(e);
        }),
    );

    return axiosClient;
}
