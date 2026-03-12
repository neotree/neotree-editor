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
                Confidential: string;
                Optional: string;
                'Field Condition': string;
                'Field Options': string;
                'Screen Condition': string;
                'Item Condition': string;
                'Item Options': string;
                'Skip To Screen Conditional Expression': string;
                'Skip To Screen': string;
                'Disable other options if selected': string;
                'Forbid With': string;
                'Management Metadata': string;
            }[];

            script.screens.forEach(screen => {
                if ((screen.type === 'management') && !screen.fields.length) {
                    worksheetData.push({
                        Script: script.title,
                        Hospital: script.hospitalName || '',
                        Screen: screen.title,
                        'Screen Ref': screen.ref || '',
                        'Screen Type': screen.type || '',
                        Key: '',
                        Label: '',
                        'Data Type': '',
                        'Value': '',
                        'Value Label': '',
                        Confidential: '',
                        Optional: '',
                        'Field Condition': '',
                        'Field Options': '',
                        'Screen Condition': screen.condition || '',
                        'Item Condition': '',
                        'Item Options': '',
                        'Skip To Screen Conditional Expression': screen.skipToCondition || '',
                        'Skip To Screen': screen.skipToScreen ? JSON.stringify(screen.skipToScreen) : '',
                        'Disable other options if selected': '',
                        'Forbid With': '',
                        'Management Metadata': screen.managementMetadata ? JSON.stringify(screen.managementMetadata) : '',
                    });
                }

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
                        Confidential: f.confidential ? 'Yes' : 'No',
                        Optional: f.optional ? 'Yes' : 'No',
                        'Field Condition': f.condition || '',
                        'Field Options': f.options?.length ? JSON.stringify(f.options) : '',
                        'Screen Condition': screen.condition || '',
                        'Item Condition': '',
                        'Item Options': '',
                        'Skip To Screen Conditional Expression': screen.skipToCondition || '',
                        'Skip To Screen': screen.skipToScreen ? JSON.stringify(screen.skipToScreen) : '',
                        'Disable other options if selected': typeof f.disableOtherOptionsIfSelected === 'boolean'
                            ? (f.disableOtherOptionsIfSelected ? 'Yes' : 'No')
                            : '',
                        'Forbid With': f.forbidWith?.join(', ') || '',
                        'Management Metadata': screen.type === 'management' && screen.managementMetadata
                            ? JSON.stringify(screen.managementMetadata)
                            : '',
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
