'use client';

import * as XLSX from 'xlsx';

import { DataKey } from "@/databases/queries/data-keys/_get";

type DataKeyUsage = {
    info?: {
        candidateScripts: number;
        fetchedScreens: number;
        fetchedDiagnoses: number;
        updatedScreens: number;
        updatedDiagnoses: number;
        savedScreens: number;
        savedDiagnoses: number;
        chunkRetries: number;
        matchedByUniqueKey: number;
        matchedByLegacyName: number;
        matchedByLegacyLabel: number;
        ambiguousLegacySkips: number;
    };
    affected?: {
        scripts: { scriptId: string; scriptTitle?: string }[];
        screens: { id: string; scriptId: string; scriptTitle?: string; title: string; type: 'screen' | 'diagnosis' }[];
        diagnoses: { id: string; scriptId: string; scriptTitle?: string; title: string; type: 'screen' | 'diagnosis' }[];
    };
    errors?: string[];
};

export type DataKeyMetadataExportItem = DataKey & {
    usage?: DataKeyUsage;
};

const formatDate = (value: unknown) => {
    if (!value) return '';
    const date = new Date(value as string);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

const toWorksheetRow = (item: DataKeyMetadataExportItem) => ({
    UUID: item.uuid,
    'Unique Key': item.uniqueKey,
    Name: item.name,
    Label: item.label,
    'Ref ID': item.refId ?? '',
    'Data Type': item.dataType,
    Options: JSON.stringify(item.options ?? []),
    Metadata: JSON.stringify(item.metadata ?? {}),
    Version: item.version,
    'Is Draft': item.isDraft ? 'Yes' : 'No',
    'Is Deleted': item.isDeleted ? 'Yes' : 'No',
    'Draft Created By User ID': item.draftCreatedByUserId ?? '',
    'Usage Scripts Count': item.usage?.affected?.scripts.length ?? 0,
    'Usage Screens Count': item.usage?.affected?.screens.length ?? 0,
    'Usage Diagnoses Count': item.usage?.affected?.diagnoses.length ?? 0,
    Usage: JSON.stringify(item.usage ?? {}),
    'Publish Date': formatDate(item.publishDate),
    'Created At': formatDate(item.createdAt),
    'Updated At': formatDate(item.updatedAt),
});

export function downloadDataKeysMetadataExcel(
    data: DataKeyMetadataExportItem[],
    filename = 'data-keys-metadata.xlsx',
) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data.map(toWorksheetRow));
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Keys Metadata');
    XLSX.writeFile(workbook, filename);
}

export function downloadDataKeysMetadataJSON(
    data: DataKeyMetadataExportItem[],
    filename = 'data-keys-metadata.json',
) {
    const link = document.createElement('a');
    link.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 4));
    link.download = filename;
    link.click();
    link.remove();
}
