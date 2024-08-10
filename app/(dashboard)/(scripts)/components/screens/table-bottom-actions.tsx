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
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { useScriptsContext, IScriptsContext } from "@/contexts/scripts";
import { ActionsBar } from "@/components/actions-bar";
import { useAlertModal } from "@/hooks/use-alert-modal";

type Props = {
    disabled?: boolean;
    screens: Awaited<ReturnType<IScriptsContext['getScreens']>>;
    selected: number[];
    onDelete: () => void;
    onCopy: () => void;
};

export function ScreensTableBottomActions({ disabled, selected, onDelete, onCopy, }: Props) {
    const { getScripts } = useScriptsContext();
    const { alert } = useAlertModal();

    const [loading, setLoading] = useState(false);
    const [scripts, setScripts] = useState<Awaited<ReturnType<typeof getScripts>>>({ data: [], });

    const loadScripts = useCallback(async () => {
        try {
            setLoading(true);
            const scripts = await getScripts();
            setScripts(scripts);
            if (scripts.errors?.length) {
                alert({
                    variant: 'error',
                    title: 'Error',
                    message: scripts.errors.join('\n'),
                });
            }
        } finally {
            setLoading(false);
        }
    }, [getScripts, alert]);

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
                                                key={s.scriptId}
                                                onClick={() => onCopy()}
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
