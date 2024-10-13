import axios from "axios";

export async function getSiteAxiosClient(params: {
    baseURL: string;
    apiKey: string;
}) {
    let siteLink = params.baseURL;
    let apiKey = params.apiKey;

    if (!siteLink) throw new Error('MISSING: link');
    if (!apiKey) throw new Error('MISSING: apiKey');

    const axiosClient = axios.create({
        baseURL: `${siteLink}/api`,
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
