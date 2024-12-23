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
                    });
                });
            });

            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            XLSX.utils.book_append_sheet(workbook, worksheet, script.title);
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
