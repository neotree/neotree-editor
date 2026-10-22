'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScriptsImportModal } from "./scripts-import-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useAppContext } from "@/contexts/app";
import { useContentLock } from "@/hooks/use-content-lock";

export function ScriptItemsFab({ disabled, scriptId }: {
    disabled: boolean;
    scriptId?: string;
    resetForm: () => void;
}) {
    const [showImportModal, setShowImportsModal] = useState(false);
    const { alert } = useAlertModal();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const importSourceParam = searchParams.get('import') === '1' ? (searchParams.get('source') || '') : null;
    // Opened from a link such as the content sync status page: /script/<id>?import=1&source=<id>
    useEffect(() => { if (importSourceParam !== null && scriptId) setShowImportsModal(true); }, [importSourceParam, scriptId]);
    const { viewOnly } = useAppContext();
    // Content sync: a script this editor receives can only be changed by importing it.
    const contentLock = useContentLock("scripts", scriptId || null);
    const importOnly = !!scriptId && contentLock.locked && !viewOnly;

    const childItemLinks = scriptId ? [
        { label: "New screen", href: `/script/${scriptId}/new-screen` },
        { label: "New diagnosis", href: `/script/${scriptId}/new-diagnosis` },
        { label: "New problem", href: `/script/${scriptId}/new-problem` },
        { label: "New print section", href: `/script/${scriptId}?addPrintSection=1&section=print` },
    ] : [];

    const showSaveDraftFirst = () => {
        alert({
            title: "Save the script draft first",
            message: "Save this new script as a draft before adding screens, diagnoses, problems, or print sections.",
            buttonLabel: "Got it",
            variant: "info",
        });
    };

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
                onImportSuccess={() => window.location.reload()}
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
                        <DropdownMenuItem onClick={() => setTimeout(() => setShowImportsModal(true), 0)}>
                            Import script
                        </DropdownMenuItem>

                        {!scriptId && !importOnly && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="max-w-56 whitespace-normal text-xs font-normal text-muted-foreground">
                                    Save the script draft before adding items.
                                </DropdownMenuLabel>
                                {["New screen", "New diagnosis", "New problem", "New print section"].map(label => (
                                    <DropdownMenuItem key={label} onClick={() => setTimeout(showSaveDraftFirst, 0)}>
                                        {label}
                                    </DropdownMenuItem>
                                ))}
                            </>
                        )}

                        {!importOnly && childItemLinks.map(item => (
                            <DropdownMenuItem key={item.href} asChild>
                                <Link href={item.href}>{item.label}</Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}
