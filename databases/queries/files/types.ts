import { files, filesAliases } from "@/databases/pg/schema";

export type FileAlias = typeof filesAliases.$inferSelect;

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
    aliases?: FileAlias[];
    data?: FullFile['data'];
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
    uploadDateGTE?: string | Date;
    uploadDateLTE?: string | Date;
    withData?: boolean;
    withAliases?: boolean;
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

export type ReferencedFile = {
    isExternal?: boolean;
    fileId?: string;
    alias?: string;
    url: string;
    type: string;
    refType: string;
    refId: string;
    refField: string;
    host: string;
};

export type GetReferencedFilesResponse = {
    errors?: string[];
    data: ReferencedFile[];
};
