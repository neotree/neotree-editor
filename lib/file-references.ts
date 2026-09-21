import type { DiagnosisType, ProblemType, ScreenType, ScriptType, } from "@/databases/queries/scripts"
import { FileReference } from "@/types";
import { getUploadUrl, isValidUrl } from "@/lib/urls";

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
        const img1 = parseFileReference(s.image1);
        const img2 = parseFileReference(s.image2);
        const img3 = parseFileReference(s.image3);

        if (img1) fileRefs[img1.fileId || img1.data] = img1;
        if (img2) fileRefs[img2.fileId || img2.data] = img2;
        if (img3) fileRefs[img3.fileId || img3.data] = img3;
    });

    const files = Object.values(fileRefs);

    return {
        files,

        screens: screens.map(s => ({
            ...s,
            image1: parseFileReference(s.image1),
            image2: parseFileReference(s.image2),
            image3: parseFileReference(s.image3),
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
