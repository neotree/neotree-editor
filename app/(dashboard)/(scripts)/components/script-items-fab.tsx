'use client';

import { useState } from "react";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { ScriptsImportModal } from "./scripts-import-modal";

export function ScriptItemsFab({ disabled }: {
    disabled: boolean;
}) {
    const [showImportModal, setShowImportsModal] = useState(false);

    const { scriptId } = useParams();

    if (disabled) return null;

    return (
        <>
            <ScriptsImportModal 
                overWriteExistingScriptWithId={scriptId as string}
                open={showImportModal}
                onOpenChange={setShowImportsModal}
            />

            <div
                className="
                    fixed
                    bottom-5
                    right-10
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
                        <DropdownMenuItem onClick={() => setShowImportsModal(true)}>
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
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}
