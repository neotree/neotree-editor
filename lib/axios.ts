import axios from "axios";
import { REMOTE_EDITOR_TIMEOUT_MS } from "@/lib/remote-timeout";

export async function getSiteAxiosClient(params: {
    baseURL: string;
    apiKey: string;
}) {
    let siteLink = params.baseURL;
    let apiKey = params.apiKey;

    if (!siteLink) throw new Error('MISSING: link');
    if (!apiKey) throw new Error('MISSING: apiKey');

    const axiosClient = axios.create({
        baseURL: siteLink,
        timeout: REMOTE_EDITOR_TIMEOUT_MS,
    });
    
    axiosClient.interceptors.request.use(async config => {
        if (config.headers) {
            config.headers['x-api-key'] = apiKey;
        }
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
