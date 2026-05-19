import { getSites } from '@/app/actions/sites';
import { getSiteAxiosClient } from "@/lib/axios";
import { GetFilesResults, ReferencedFile } from '@/databases/queries/files/types';

export async function loadData() {
    try {
        const sites = await getSites({ types: ['webeditor'], });
        
        const data: {
            site: typeof sites.data[0];
            referencedFiles: ReferencedFile[];
            files: GetFilesResults['data'];
        }[] = [];

        for (const site of sites.data) {
            const { link, apiKey, } = site;

            const axios = await getSiteAxiosClient({
                apiKey,
                baseURL: link,
            });

            const referencedFiles = (await axios.get(`/api/files/references`))?.data?.data as ReferencedFile[];
            const files = (await axios.get(`/api/files`))?.data?.data as GetFilesResults['data'];

            data.push({
                site,
                referencedFiles,
                files,
            });
        }

        return data;
    } catch(e: any) {
        return [];
    }
}
