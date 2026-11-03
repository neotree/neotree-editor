'use client';

import writeXlsxFile from 'write-excel-file/browser';
import type { Cell, SheetData } from 'write-excel-file/browser';

export type ExcelSheet = {
    name: string;
    rows: Record<string, unknown>[];
};

const toCell = (value: unknown): Cell => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value instanceof Date) return value;
    return `${value}`;
};

// Header row from the union of row keys (in first-seen order), then one row per object.
export function rowsToSheetData(rows: Record<string, unknown>[]): SheetData {
    const headers: string[] = [];
    rows.forEach(row => Object.keys(row).forEach(key => {
        if (!headers.includes(key)) headers.push(key);
    }));

    return [
        headers,
        ...rows.map(row => headers.map(key => toCell(row[key]))),
    ];
}

export async function downloadExcel(sheets: ExcelSheet[], filename: string) {
    await writeXlsxFile(sheets.map(s => ({
        sheet: s.name,
        data: rowsToSheetData(s.rows),
    }))).toFile(filename);
}
