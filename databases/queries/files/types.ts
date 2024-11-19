import { files } from "@/databases/pg/schema";

export type FullFile = typeof files.$inferSelect & {
    url: string;
};

export type FileDetails = {
    url: string;
    fileId: typeof files.$inferSelect['fileId'];
    filename: typeof files.$inferSelect['filename'],
    size: typeof files.$inferSelect['size'],
    metadata: { [key: string]: any; };
    contentType: typeof files.$inferSelect['contentType'];
    createdAt: typeof files.$inferSelect['createdAt'];
};

export type GetFileDetailsResponse = {
    errors?: string[];
    data: null | FileDetails;
};

export type GetFullFileResponse = {
    errors?: string[];
    data: null | FullFile;
};

export type GetFilesParams = {
    filesIds?: string[];
    limit?: number;
    offset?: number;
    page?: number;
    searchValue?: string;
    archived?: boolean;
};

export type GetFilesResults = {
    errors?: string[];
    data: FileDetails[];
    totalRows: number;
    totalPages: number;
    searchValue?: string;
    page: number;
    limit?: number;
};
