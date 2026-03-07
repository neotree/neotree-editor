'use client';

import * as XLSX from 'xlsx';
import type { DataKeysUsageExportRow } from "@/types/data-keys-usage-export";

export function downloadDataKeysUsageExcel(
    data: DataKeysUsageExportRow[],
    filename = 'data-keys-usage.xlsx',
) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Keys Usage');
    XLSX.writeFile(workbook, filename);
}
