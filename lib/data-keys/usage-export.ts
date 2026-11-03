'use client';

import { downloadExcel } from "@/lib/excel-export";
import type { DataKeysUsageExportRow } from "@/types/data-keys-usage-export";

export function downloadDataKeysUsageExcel(
    data: DataKeysUsageExportRow[],
    filename = 'data-keys-usage.xlsx',
) {
    return downloadExcel([{ name: 'Data Keys Usage', rows: data, }], filename);
}
