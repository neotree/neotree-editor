'use client';

import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { GetScriptsMetadataResponse } from "@/databases/queries/scripts";
import { downloadScriptsMetadataExcel, downloadScriptsMetadataJSON } from "@/lib/scripts/metadata-download";

export function ScriptMetaActions({ data }: {
    data: GetScriptsMetadataResponse['data'];
}) {
    const downloadExcel = useCallback(() => {
        downloadScriptsMetadataExcel(data);
    }, [data]);

    const downloadJSON = useCallback(() => {
        downloadScriptsMetadataJSON(data);
    }, [data]);

    return (
        <>
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
