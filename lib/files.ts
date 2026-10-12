import axios, { AxiosInstance } from "axios";

import { getSiteAxiosClient } from '@/lib/axios';
import { UploadFileFromSiteResponse } from "@/app/actions/files";
import { FileReference } from "@/types";
import { isValidUrl, getUploadUrl } from "@/lib/urls";
import { _getSites } from "@/databases/queries/sites";
import type { DiagnosisType, ProblemType, ScreenType, ScriptType, } from "@/databases/queries/scripts";

export function parseFileReferences({
    siteUrl,
    screens = [],
    diagnoses = [],
    problems = [],
    scripts = [],
}: {
    siteUrl?: string;
    screens?: ScreenType[];
    diagnoses?: DiagnosisType[];
    problems?: ProblemType[];
    scripts?: (ScriptType & {
        screens?: ScreenType[];
        diagnoses?: DiagnosisType[];
        problems?: ProblemType[];
    })[];
}) {
    let scriptItems = [
        ...screens,
        ...diagnoses,
        ...problems,
    ];

    scriptItems = [
        ...scriptItems,
        ...scripts.reduce((acc, s) => [
            ...acc,
            ...(s.screens || []),
            ...(s.diagnoses || []),
            ...(s.problems || []),
        ], [] as typeof scriptItems),
    ];

    const fileRefs: Record<string, FileReference> = {};  
    
    const parseFileReference = (f: null | FileReference) => {
        if (f?.fileId && !isValidUrl(f.data)) {
            let data = f.data;
            if (siteUrl) {
                let host = siteUrl || '';
                if (host.substring(host.length - 1, host.length) === '/') host = host.substring(0, host.length - 1);
                if (data[0] === '/') data = data.substring(1, data.length);
                data = [host, data].filter(s => s).join('/');
            }
            data = getUploadUrl(f.data);
            return { ...f, data, };
        }
        return f;
    };

    scriptItems.forEach(s => {
        const file1 = parseFileReference(s.image1);
        const file2 = parseFileReference(s.image2);
        const file3 = parseFileReference(s.image3);
        const file4 = parseFileReference((s as ScreenType).contentTextImage || null)

        if (file1) fileRefs[file1.fileId || file1.data] = file1;
        if (file2) fileRefs[file2.fileId || file2.data] = file2;
        if (file3) fileRefs[file3.fileId || file3.data] = file3;
        if (file4) fileRefs[file4.fileId || file4.data] = file4;
    });

    const files = Object.values(fileRefs);

    return {
        files,

        screens: screens.map(s => ({
            ...s,
            image1: parseFileReference(s.image1),
            image2: parseFileReference(s.image2),
            image3: parseFileReference(s.image3),
            contentTextImage: parseFileReference(s.contentTextImage),
        })),

        diagnoses: diagnoses.map(s => ({
            ...s,
            image1: parseFileReference(s.image1),
            image2: parseFileReference(s.image2),
            image3: parseFileReference(s.image3),
        })),

        problems: problems.map(s => ({
            ...s,
            image1: parseFileReference(s.image1),
            image2: parseFileReference(s.image2),
            image3: parseFileReference(s.image3),
        })),

        scripts: scripts.map(s => {
            const { 
                screens: _screens, 
                diagnoses: _diagnoses, 
                problems: _problems, 
            } = s as typeof s & {
                screens: typeof screens;
                diagnoses: typeof diagnoses;
                problems: typeof diagnoses;
            };

            return {
                ...s,

                screens: _screens.map(s => ({
                    ...s,
                    image1: parseFileReference(s.image1),
                    image2: parseFileReference(s.image2),
                    image3: parseFileReference(s.image3),
                    contentTextImage: parseFileReference(s.contentTextImage),
                })),

                diagnoses: _diagnoses.map(s => ({
                    ...s,
                    image1: parseFileReference(s.image1),
                    image2: parseFileReference(s.image2),
                    image3: parseFileReference(s.image3),
                })),

                problems: _problems.map(s => ({
                    ...s,
                    image1: parseFileReference(s.image1),
                    image2: parseFileReference(s.image2),
                    image3: parseFileReference(s.image3),
                })),
            };
        }),
    };
}

export async function uploadReferencedFileIfMissing(file: FileReference, siteUrl?: string) {
    let axiosClient = axios.create({
        baseURL: process.env.NEXT_PUBLIC_APP_URL,
    });

    if (siteUrl) {
        const { data, errors, } = await _getSites({ links: [siteUrl], });
        if (errors?.length) throw new Error(errors.join(', '));
        if (!data[0]) throw new Error(`Failed to download images. Site (${siteUrl}) not found.`);
        axiosClient = await getSiteAxiosClient({
            baseURL: siteUrl,
            apiKey: data[0].apiKey,
        });
    }

    siteUrl = process.env.NEXT_PUBLIC_APP_URL;

    let fileSiteURL = file.data.split('/').filter((_, i) => i < 3).join('/');

    let _errors: string[] = [];
    let uploaded = false;

    if ((fileSiteURL !== siteUrl) && isValidUrl(fileSiteURL) && file.fileId) {
        const res = await axiosClient.post<UploadFileFromSiteResponse>('/api/files/upload/from-site', {
            siteURL: fileSiteURL,
            fileId: file.fileId,
        });

        const { errors, data } = res.data;

        if (errors?.length) {
            _errors = errors;
        }

        if (data) {
            file.data = data.fileURL;
            uploaded = true;
        }
    }
    return { file, uploaded, errors: _errors };
};
