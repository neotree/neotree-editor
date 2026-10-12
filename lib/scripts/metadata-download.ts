'use client';

import * as XLSX from 'xlsx';

import type { GetScriptsMetadataResponse } from "@/databases/queries/scripts";
import { buildScriptsMetadataWorkbookSheets } from "@/lib/scripts/metadata-export";

type ScriptsMetadata = GetScriptsMetadataResponse['data'];

export function downloadScriptsMetadataExcel(data: ScriptsMetadata, filename = 'metadata.xlsx') {
    const workbook = XLSX.utils.book_new();

    buildScriptsMetadataWorkbookSheets(data).forEach(sheet => {
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sheet.rows), sheet.name);
    });

    XLSX.writeFile(workbook, filename);
}

export function downloadScriptsMetadataJSON(data: ScriptsMetadata, filename = 'metadata.json') {
    // A Blob avoids the URL length limits a data: URI hits when many scripts are exported.
    const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 0);
}
