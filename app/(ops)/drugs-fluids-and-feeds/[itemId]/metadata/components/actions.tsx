'use client';

import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { GetDrugsLibraryMetadataResponse } from "@/databases/queries/drugs-library/_get-drugs-library-metadata";
import { downloadDrugsLibraryMetadataExcel, downloadDrugsLibraryMetadataJSON } from "@/lib/drugs-library/metadata-export";

type Props = {
    data: GetDrugsLibraryMetadataResponse['data'];
};

export function DrugsLibraryMetaActions({ data }: Props) {
    const downloadExcel = useCallback(() => {
        downloadDrugsLibraryMetadataExcel(data);
    }, [data]);

    const downloadJSON = useCallback(() => {
        downloadDrugsLibraryMetadataJSON(data);
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
