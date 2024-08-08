'use client';

import { useCallback, useState } from "react";
import { Trash, Copy } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getScreensTableData } from "@/app/actions/_screens";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { useScriptsContext } from "@/contexts/scripts";
import { ActionsBar } from "@/components/actions-bar";
import { useAlertModal } from "@/hooks/use-alert-modal";

type Props = {
    scriptId?: string;
    scriptDraftId?: string;
    disabled?: boolean;
    screens: Awaited<ReturnType<typeof getScreensTableData>>;
    selected: string[];
    onDelete: () => void;
    onCopy: (scripts: { scriptReference: string; isDraft: boolean; }[]) => void;
};

export function ScreensBottomActions({ disabled, selected, onDelete, onCopy, }: Props) {
    const { _listScripts } = useScriptsContext();
    const { alert } = useAlertModal();

    const [loading, setLoading] = useState(false);
    const [scripts, setScripts] = useState<Awaited<ReturnType<typeof _listScripts>>>({ data: [], });

    const loadScripts = useCallback(async () => {
        try {
            setLoading(true);
            const scripts = await _listScripts();
            setScripts(scripts);
            if (scripts.error) {
                alert({
                    variant: 'error',
                    title: 'Error',
                    message: scripts.error,
                });
            }
        } finally {
            setLoading(false);
        }
    }, [_listScripts, alert]);

    return (
        <>
            {!!selected.length && (
                <ActionsBar>
                    <Button
                        variant="destructive"
                        className="h-auto w-auto"
                        disabled={disabled}
                        onClick={() => onDelete()}
                    >
                        <Trash className="h-4 w-4 mr-1" />
                        <span>{selected.length > 1 ? `Delete ${selected.length} screens` : 'Delete screen'}</span>
                    </Button>

                    <DropdownMenu
                        onOpenChange={open => {
                            if (open) loadScripts();
                        }}
                    >
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="h-auto w-auto"
                                disabled={disabled}
                            >
                                <Copy className="h-4 w-4 mr-1" />
                                <span>{selected.length > 1 ? `Copy ${selected.length} screens` : 'Copy screen'}</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="min-w-[300px] max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <>
                                    <DropdownMenuLabel className="flex flex-col gap-y-2 items-center justify-center">
                                        <Loader /> 
                                    </DropdownMenuLabel>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuLabel>Scripts</DropdownMenuLabel>
                                    {scripts.data.map(s => {
                                        return (
                                            <DropdownMenuItem
                                                key={s.scriptReference}
                                                onClick={() => onCopy([{ isDraft: s.isDraft, scriptReference: s.scriptReference, }])}
                                            >
                                                {s.title}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </ActionsBar>
            )}
        </>
    );
}
