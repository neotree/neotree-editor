'use client';

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScriptsImportModal } from "./scripts-import-modal";

export function ScriptsFab({ disabled }: {
    disabled: boolean;
}) {
    const [showImportModal, setShowImportsModal] = useState(false);
    const router = useRouter();

    if (disabled) return null;

    return (
        <>
            <ScriptsImportModal 
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
                        <DropdownMenuItem onClick={() => router.push('/new-script')}>
                            New script
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setShowImportsModal(true)}>
                            Import script
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}
