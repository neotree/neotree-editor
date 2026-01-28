'use client';

import { useCallback, useRef } from "react";
import * as XLSX from 'xlsx';

import { Button } from "@/components/ui/button";
import { GetScriptsMetadataResponse } from "@/databases/queries/scripts";

export function ScriptMetaActions({ data }: {
    data: GetScriptsMetadataResponse['data'];
}) {
    const downloadJSONRef = useRef<HTMLAnchorElement>(null);

    const downloadExcel = useCallback(async () => {
        const workbook = XLSX.utils.book_new();

        data.forEach(script => {
            const worksheetData = [] as {
                Script: string;
                Hospital: string;
                Screen: string;
                'Screen Ref': string;
                'Screen Type': string;
                Key: string;
                Label: string;
                'Data Type': string;
                'Value': string;
                'Value Label': string;
            }[];

            script.screens.forEach(screen => {
                screen.fields.forEach(f => {
                    worksheetData.push({
                        Script: script.title,
                        Hospital: script.hospitalName || '',
                        Screen: screen.title,
                        'Screen Ref': screen.ref || '',
                        'Screen Type': screen.type || '',
                        Key: f.key,
                        Label: f.label,
                        'Data Type': f.dataType || '',
                        'Value': `${f.value || ''}`,
                        'Value Label': `${f.valueLabel || ''}`,
                    });
                });
            });

            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            XLSX.utils.book_append_sheet(workbook, worksheet, `Screens - ${script.title || ''}`.substring(0, 31));
        });

        data.forEach(script => {
            const worksheetData = [] as {
                Script: string;
                Hospital: string;
                'Diagnosis Name': string;
                Key: string;
                Label: string;
                'Severity Order': string;
                Expression: string;
                'Expression Meaning': string;
                'Data Type': string;
                'Value': string;
                'Value Label': string;
            }[];

            script.diagnoses.forEach(d => {
                worksheetData.push({
                    Script: script.title,
                    Hospital: script.hospitalName || '',
                    'Diagnosis Name': d.name,
                    Key: d.key,
                    Label: d.name,
                    'Severity Order': `${d.severityOrder || ''}`,
                    Expression: `${d.expression || ''}`,
                    'Expression Meaning': `${d.expressionMeaning || ''}`,
                    'Data Type': 'diagnosis',
                    Value: d.key,
                    'Value Label': d.name,
                });
            });

            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            XLSX.utils.book_append_sheet(workbook, worksheet, `Diagnoses - ${script.title || ''}`.substring(0, 31));
        });

        XLSX.writeFile(workbook, "metadata.xlsx");
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
