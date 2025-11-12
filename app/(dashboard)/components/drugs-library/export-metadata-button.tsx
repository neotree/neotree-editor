'use client';

import Link from "next/link";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ExportMetadataButton() {
    return (
        <Button asChild variant="outline">
            <Link href="/drugs-fluids-and-feeds/metadata" target="_blank">
                <Download className="mr-2 h-4 w-4" />
                Export metadata
            </Link>
        </Button>
    );
}
