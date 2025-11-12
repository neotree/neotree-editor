'use client';

import * as XLSX from 'xlsx';

import { DrugsLibraryMetadataItem } from "@/databases/queries/drugs-library/_get-drugs-library-metadata";

const formatDate = (value: unknown) => {
    if (!value) return '';
    const date = new Date(value as string);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

const toWorksheetRow = (item: DrugsLibraryMetadataItem) => ({
    'Item ID': item.itemId,
    Type: item.type,
    Drug: item.drug,
    Key: item.key,
    'Key ID': item.keyId,
    'Gestation Key': item.gestationKey,
    'Gestation Key ID': item.gestationKeyId,
    'Weight Key': item.weightKey,
    'Weight Key ID': item.weightKeyId,
    'Diagnosis Key': item.diagnosisKey,
    'Diagnosis Key ID': item.diagnosisKeyId,
    'Age Key': item.ageKey,
    'Age Key ID': item.ageKeyId,
    'Dosage Text': item.dosageText,
    'Management Text': item.managementText,
    'Administration Frequency': item.administrationFrequency,
    'Route Of Administration': item.routeOfAdministration,
    Condition: item.condition,
    'Drug Unit': item.drugUnit ?? '',
    'Dosage': item.dosage ?? '',
    'Dosage Multiplier': item.dosageMultiplier ?? '',
    'Hourly Feed': item.hourlyFeed ?? '',
    'Hourly Feed Divider': item.hourlyFeedDivider ?? '',
    'Day Of Life': item.dayOfLife ?? '',
    'Validation Type': item.validationType ?? '',
    'Min Gestation': item.minGestation ?? '',
    'Max Gestation': item.maxGestation ?? '',
    'Min Weight': item.minWeight ?? '',
    'Max Weight': item.maxWeight ?? '',
    'Min Age': item.minAge ?? '',
    'Max Age': item.maxAge ?? '',
    Preferences: JSON.stringify(item.preferences ?? {}),
    'Is Draft': item.isDraft ? 'Yes' : 'No',
    'Is Deleted': item.isDeleted ? 'Yes' : 'No',
    Version: item.version,
    'Publish Date': formatDate(item.publishDate),
    'Created At': formatDate(item.createdAt),
    'Updated At': formatDate(item.updatedAt),
});

export function downloadDrugsLibraryMetadataExcel(
    data: DrugsLibraryMetadataItem[],
    filename = 'drugs-library-metadata.xlsx',
) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data.map(toWorksheetRow));
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DFF Metadata');
    XLSX.writeFile(workbook, filename);
}

export function downloadDrugsLibraryMetadataJSON(
    data: DrugsLibraryMetadataItem[],
    filename = 'drugs-library-metadata.json',
) {
    const link = document.createElement('a');
    link.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 4));
    link.download = filename;
    link.click();
    link.remove();
}
