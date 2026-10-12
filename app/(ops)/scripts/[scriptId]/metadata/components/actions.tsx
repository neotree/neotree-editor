'use client';

import { useCallback, useRef } from "react";

import { Button } from "@/components/ui/button";
import { GetScriptsMetadataResponse } from "@/databases/queries/scripts";
import { buildScriptScreenMetadataRows } from "@/lib/scripts/metadata-export";
import { downloadExcel as writeExcelFile, ExcelSheet } from "@/lib/excel-export";

export function ScriptMetaActions({ data }: {
    data: GetScriptsMetadataResponse['data'];
}) {
    const downloadJSONRef = useRef<HTMLAnchorElement>(null);

    const downloadExcel = useCallback(async () => {
        const sheets: ExcelSheet[] = [];

        data.forEach(script => {
            const worksheetData = buildScriptScreenMetadataRows(script);

            sheets.push({ name: `Screens - ${script.title || ''}`.substring(0, 31), rows: worksheetData, });
        });

        data.forEach(script => {
            const worksheetData = [] as {
                Script: string;
                Hospital: string;
                'Diagnosis Name': string;
                'Diagnosis Description': string;
                Key: string;
                'Key ID': string;
                Label: string;
                Position: string;
                Source: string;
                'Severity Order': string;
                Expression: string;
                'Expression Meaning': string;
                Symptoms: string;
                'Text 1': string;
                'Text 2': string;
                'Text 3': string;
                'Image 1': string;
                'Image 2': string;
                'Image 3': string;
                'Data Type': string;
                'Value': string;
                'Value Label': string;
                Condition: string;
                'Disable other options if selected': string;
                'Forbid With': string;
            }[];

            script.diagnoses.forEach(d => {
                worksheetData.push({
                    Script: script.title,
                    Hospital: script.hospitalName || '',
                    'Diagnosis Name': d.name,
                    'Diagnosis Description': `${d.description || ''}`,
                    Key: d.key,
                    'Key ID': `${d.keyId || ''}`,
                    Label: d.name,
                    Position: `${d.position || ''}`,
                    Source: `${d.source || ''}`,
                    'Severity Order': `${d.severityOrder || ''}`,
                    Expression: `${d.expression || ''}`,
                    'Expression Meaning': `${d.expressionMeaning || ''}`,
                    Symptoms: JSON.stringify(d.symptoms || []),
                    'Text 1': `${d.text1 || ''}`,
                    'Text 2': `${d.text2 || ''}`,
                    'Text 3': `${d.text3 || ''}`,
                    'Image 1': d.image1 ? JSON.stringify(d.image1) : '',
                    'Image 2': d.image2 ? JSON.stringify(d.image2) : '',
                    'Image 3': d.image3 ? JSON.stringify(d.image3) : '',
                    'Data Type': 'diagnosis',
                    Value: d.key,
                    'Value Label': d.name,
                    Condition: `${d.expression || ''}`,
                    'Disable other options if selected': '',
                    'Forbid With': '',
                });
            });

            sheets.push({ name: `Diagnoses - ${script.title || ''}`.substring(0, 31), rows: worksheetData, });
        });

        await writeExcelFile(sheets, "metadata.xlsx");
    }, [data]);

    const downloadJSON = useCallback(async () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 4));
        downloadJSONRef.current?.setAttribute?.("href", dataStr);
        downloadJSONRef.current?.setAttribute?.("download", "metadata.json");
        downloadJSONRef.current?.click?.();
    }, [data]);

    return (
        <>
            <a
                href="#"
                target="_blank"
                className="h-0 w-0 absolute overflow-hidden"
                ref={downloadJSONRef}
            />

            <div className="h-[100px]" />

            <div
                className="
                    fixed
                    bottom-0
                    left-0
                    w-full
                    h-[80px]
                    border-t
                    border-t-border
                    bg-white
                    flex
                    items-center
                    justify-end
                    px-4
                    gap-x-4
                "
            >
                <Button onClick={downloadJSON}>
                    Download JSON
                </Button>

                <Button onClick={downloadExcel}>
                    Download excel
                </Button>
            </div>
        </>
    );
}
