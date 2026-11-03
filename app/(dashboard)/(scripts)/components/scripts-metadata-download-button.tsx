'use client';

import { useCallback, useState } from "react";
import { ChevronDown, Download, Loader2 } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useAlertModal } from "@/hooks/use-alert-modal";
import type { GetScriptsMetadataParams, GetScriptsMetadataResponse } from "@/databases/queries/scripts";
import { downloadScriptsMetadataExcel, downloadScriptsMetadataJSON } from "@/lib/scripts/metadata-download";
import { cn } from "@/lib/utils";

type Format = 'json' | 'excel';

/**
 * Downloads the metadata of several scripts in one go, as a single JSON file
 * or a single Excel workbook. Leave scriptsIds empty to download every script.
 */
export function ScriptsMetadataDownloadButton({
    scriptsIds = [],
    label,
    variant = 'outline',
    className,
}: {
    scriptsIds?: string[];
    label: string;
    variant?: ButtonProps['variant'];
    className?: string;
}) {
    const { alert } = useAlertModal();
    const [downloading, setDownloading] = useState<Format | null>(null);

    const download = useCallback(async (format: Format) => {
        try {
            setDownloading(format);

            const params: GetScriptsMetadataParams = {
                scriptsIds,
                returnDraftsIfExist: true,
            };

            const response = await fetch('/api/scripts/metadata?data=' + encodeURIComponent(JSON.stringify(params)));
            const res = await response.json() as Partial<GetScriptsMetadataResponse>;

            if (res.errors?.length) throw new Error(res.errors.join(', '));

            const data = res.data || [];
            if (!data.length) throw new Error('No script metadata found');

            const date = new Date().toISOString().substring(0, 10);
            const filename = `scripts-metadata-${date}`;

            if (format === 'excel') {
                await downloadScriptsMetadataExcel(data, `${filename}.xlsx`);
            } else {
                downloadScriptsMetadataJSON(data, `${filename}.json`);
            }
        } catch (e: any) {
            alert({
                title: 'Error',
                message: 'Failed to download metadata: ' + e.message,
                variant: 'error',
            });
        } finally {
            setDownloading(null);
        }
    }, [scriptsIds, alert]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    className={cn(className)}
                    disabled={!!downloading}
                >
                    {downloading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4 mr-1" />
                    )}
                    <span>{downloading ? 'Preparing metadata...' : label}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTimeout(() => download('json'), 0)}>
                    Download JSON
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setTimeout(() => download('excel'), 0)}>
                    Download excel
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
