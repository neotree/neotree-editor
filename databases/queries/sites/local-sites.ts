import { getHeaders } from "@/lib/header";

const getLocalSites = () => {
    const headers = getHeaders();
    return {
        webeditor: {
            name: 'Local editor',
            siteId: 'fb76af5a-bf86-4050-821e-44f1bf316bf4',
            link: headers.origin,
            type: 'webeditor',
            apiKey: 'localhost',
        },
        nodeapi: {
            name: 'Local editor',
            siteId: '5cb4aa54-2cfe-49e2-9cdd-392a9b8c124e',
            link: headers.origin,
            type: 'webeditor',
            apiKey: 'localhost',
        },
    };
};

export default getLocalSites;
