import axios, { AxiosInstance } from "axios";

import { getSiteAxiosClient } from '@/lib/axios';
import { UploadFileFromSiteResponse } from "@/app/actions/files";
import { ScriptImage } from "@/types";
import { isValidUrl } from "@/lib/urls";
import { _getSites } from "@/databases/queries/sites";

export const processImage = async (img: ScriptImage, siteURL?: string) => {
    let axiosClient = axios.create({
        baseURL: process.env.NEXT_PUBLIC_APP_URL,
    });

    if (siteURL) {
        const { data, errors, } = await _getSites({ links: [siteURL], });
        if (errors?.length) throw new Error(errors.join(', '));
        if (!data[0]) throw new Error(`Failed to download images. Site (${siteURL}) not found.`);
        axiosClient = await getSiteAxiosClient({
            baseURL: siteURL,
            apiKey: data[0].apiKey,
        });
    }

    siteURL = process.env.NEXT_PUBLIC_APP_URL;

    let imgSiteURL = img.data.split('/').filter((_, i) => i < 3).join('/');

    let _errors: string[] = [];
    let updated = false;

    if ((imgSiteURL !== siteURL) && isValidUrl(imgSiteURL) && img.fileId) {
        const res = await axiosClient.post<UploadFileFromSiteResponse>('/api/files/upload/from-site', {
            siteURL: imgSiteURL,
            fileId: img.fileId,
        });

        const { errors, data } = res.data;

        if (errors?.length) {
            _errors = errors;
        }

        if (data) {
            img.data = data.fileURL;
            updated = true;
        }
    }
    return { image: img, updated, errors: _errors };
};
