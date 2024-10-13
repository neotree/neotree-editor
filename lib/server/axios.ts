import axios from "axios";

import logger from "@/lib/logger";
import { _getSiteApiKey } from "@/databases/queries/sites";

export async function getSiteAxiosClient(siteId: string, site?: {
    link: string;
    baseURL: string;
}) {
    let siteLink = site?.link;
    let apiKey = site?.baseURL;

    if (!siteId) throw new Error('AXIOS init error: missing siteId');

    if (!site) {
        const res = await _getSiteApiKey(siteId);

        if (res.errors?.length) throw new Error('AXIOS init error: ' + res.errors.join(', '));

        if (!res.data) throw new Error('AXIOS init error: site not found');

        siteLink = res.data.link;
        apiKey = res.data.apiKey;
    }

    const axiosClient = axios.create({
        baseURL: siteLink,
    });
    
    axiosClient.interceptors.request.use(async config => {
        if (config.headers) {
            config.headers['x-api-key'] = apiKey;
        }
        logger.log(`AXIOS [${config.method}]`, [`${siteLink}/api`, config.url].join(''));
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
