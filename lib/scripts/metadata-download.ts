'use client';

import type { GetScriptsMetadataResponse } from "@/databases/queries/scripts";
import { buildScriptsMetadataWorkbookSheets } from "@/lib/scripts/metadata-export";
import { downloadExcel } from "@/lib/excel-export";

type ScriptsMetadata = GetScriptsMetadataResponse['data'];

export function downloadScriptsMetadataExcel(data: ScriptsMetadata, filename = 'metadata.xlsx') {
    return downloadExcel(buildScriptsMetadataWorkbookSheets(data), filename);
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
