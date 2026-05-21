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

        for (const site of [sites.data[0]]) {
            const { link, apiKey, } = site;

            const axios = await getSiteAxiosClient({
                apiKey,
                baseURL: link,
            });

            const referencedFiles = (await axios.get(`/api/files/references`))?.data?.data as ReferencedFile[];
            const files = (await axios.get(`/api/files`))?.data?.data as GetFilesResults['data'];

            const filesWithData = await Promise.all(files.map(async f => {
                const res = (await axios.get(`/api/files/${f.fileId}/download`))?.data?.data;
                const base64 = Buffer.from(res.data).toString('base64');
                return {
                    ...f,
                    base64,
                };
            }));

            data.push({
                site,
                referencedFiles,
                files: filesWithData,
            });
        }

        return data;
    } catch(e: any) {
        return [];
    }
}
