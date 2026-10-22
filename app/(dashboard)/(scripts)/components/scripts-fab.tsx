'use client';

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScriptsImportModal } from "./scripts-import-modal";
import { useAppContext } from "@/contexts/app";
import { useContentLock } from "@/hooks/use-content-lock";

export function ScriptsFab({ disabled }: {
    disabled: boolean;
}) {
    const [showImportModal, setShowImportsModal] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const importSourceParam = searchParams.get('import') === '1' ? (searchParams.get('source') || '') : null;
    // Opened from a link such as the content sync status page: /?import=1&source=<id>
    useEffect(() => { if (importSourceParam !== null) setShowImportsModal(true); }, [importSourceParam]);
    const { viewOnly } = useAppContext();
    // Content sync: on an editor that receives its scripts, importing is the only way to add one.
    const contentLock = useContentLock("scripts", null);
    const importOnly = contentLock.locked && !viewOnly;

    if (disabled && !importOnly) return null;

    return (
        <>
            <ScriptsImportModal 
                open={showImportModal}
                defaultSourceScriptId={importSourceParam || undefined}
                onOpenChange={(open) => {
                    setShowImportsModal(open);
                    if (!open && importSourceParam !== null) router.replace(pathname);
                }}
            />

            <div
                className="
                    fixed
                    bottom-5
                    right-10
                    z-[1]
                "
            >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            className="rounded-full w-12 h-12"
                        >
                            <Plus className="h-6 w-6" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                        {!importOnly && (
                            <DropdownMenuItem onClick={() => router.push('/new-script')}>
                                New script
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => setTimeout(() => setShowImportsModal(true), 0)}>
                            Import script
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}
