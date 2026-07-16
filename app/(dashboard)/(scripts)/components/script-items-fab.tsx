'use client';

import { useState } from "react";
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

export function ScriptItemsFab({ disabled, scriptId }: {
    disabled: boolean;
    scriptId?: string;
    resetForm: () => void;
}) {
    const [showImportModal, setShowImportsModal] = useState(false);
    const { alert } = useAlertModal();

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

    if (disabled) return null;

    return (
        <>
            <ScriptsImportModal
                open={showImportModal}
                onOpenChange={setShowImportsModal}
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

                        {!scriptId && (
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

                        {childItemLinks.map(item => (
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
