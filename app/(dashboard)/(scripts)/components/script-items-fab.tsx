'use client';

import { useState } from "react";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScriptsImportModal } from "./scripts-import-modal";

export function ScriptItemsFab({ disabled }: {
    disabled: boolean;
    resetForm: () => void;
}) {
    const [showImportModal, setShowImportsModal] = useState(false);

    const { scriptId } = useParams();

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

                        <DropdownMenuItem asChild>
                            <Link href={`/script/${scriptId}/new-screen`}>
                                New screen
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link href={`/script/${scriptId}/new-diagnosis`}>
                                New diagnosis
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link href={`/script/${scriptId}?addPrintSection=1&section=print`}>
                                New print section
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}
