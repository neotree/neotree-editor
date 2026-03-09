'use client';

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import type { DataKeyMetadataExportItem } from "@/lib/data-keys/metadata-export";
import { downloadDataKeysMetadataExcel, downloadDataKeysMetadataJSON } from "@/lib/data-keys/metadata-export";
import type { DataKeysUsageExportRow } from "@/types/data-keys-usage-export";
import { downloadDataKeysUsageExcel } from "@/lib/data-keys/usage-export";

type Props = {
    data: DataKeyMetadataExportItem[];
};

export function DataKeysMetaActions({ data }: Props) {
    const [downloadingUsage, setDownloadingUsage] = useState(false);

    const downloadExcel = useCallback(() => {
        downloadDataKeysMetadataExcel(data);
    }, [data]);

    const downloadJSON = useCallback(() => {
        downloadDataKeysMetadataJSON(data);
    }, [data]);

    const downloadUsageExcel = useCallback(async () => {
        try {
            setDownloadingUsage(true);
            const response = await fetch('/api/data-keys/usage-export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            const res = await response.json() as {
                success: boolean;
                data: DataKeysUsageExportRow[];
                errors?: string[];
            };

            if (!res.success) {
                throw new Error(res.errors?.join(', ') || 'Failed to generate usage export');
            }

            downloadDataKeysUsageExcel(res.data);
        } catch (e: any) {
            console.error('downloadUsageExcel ERROR', e.message);
            alert(`Failed to download usage export: ${e.message}`);
        } finally {
            setDownloadingUsage(false);
        }
    }, []);

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

                <Button onClick={downloadUsageExcel} disabled={downloadingUsage}>
                    {downloadingUsage ? 'Preparing usage export...' : 'Download usage excel'}
                </Button>
            </div>
        </>
    );
}

