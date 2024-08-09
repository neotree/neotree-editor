'use client';

import { Settings, Trash, MoreVertical } from "lucide-react";
import { useCallback, useState } from "react";

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { ScriptFormDataType } from '@/contexts/scripts';
import { useConfirmModal } from "@/hooks/use-confirm-modal";

type Props = {
    disabled?: boolean;
    fields: ScriptFormDataType['nuidSearchFields'];
    onChange: (fields: ScriptFormDataType['nuidSearchFields']) => void;
    onClose?: () => void;
};

export function NuidSearchFieldsConfig({ 
    fields = [],
    disabled,
    onChange,
    onClose, 
}: Props) {
    const [open, setOpen] = useState(false);

    const close = useCallback(() => {
        onClose?.();
        setOpen(false);
    }, [onClose]);

    const { confirm } = useConfirmModal();

    const onDelete = useCallback((index: number) => {
        confirm(() => onChange(fields.filter((_, i) => i !== index)), {
            danger: true,
            title: 'Delete field',
            message: 'Are you sure you want to delete field?',
            positiveLabel: 'Delete',
            negativeLabel: 'Cancel',
        });
    }, [fields, confirm, onChange]);

    return (
        <>
            <Sheet
                open={open}
                onOpenChange={open => {
                    if (!open) close();
                }}
            >
                <SheetTrigger asChild>
                    <a
                        href="#"
                        className="text-muted-foreground hover:text-primary"
                        onClick={e => {
                            e.preventDefault();
                            setOpen(true);
                        }}
                    >
                        <Settings className="w-4 h-4 mr-1" />
                    </a>
                </SheetTrigger>

                <SheetContent 
                    hideCloseButton
                    side="right"
                    className="p-0 m-0 flex flex-col w-full max-w-full sm:max-w-[80%] md:max-w-[80%] lg:max-w-[50%]"
                >
                    <SheetHeader className="flex flex-row items-center py-2 px-4 border-b border-b-border text-left sm:text-left">
                        <SheetTitle className="flex-1">Configure NUID Search Page</SheetTitle>
                        <SheetDescription className="hidden"></SheetDescription>
                        <div>
                            
                        </div>
                    </SheetHeader>

                    <div className="flex-1 flex flex-col py-2 px-4 gap-y-4 overflow-y-auto">
                        <DataTable 
                            title="Fields"
                            columns={[
                                {
                                    name: 'Type'
                                },
                                {
                                    name: 'Key'
                                },
                                {
                                    name: 'Label'
                                },
                                {
                                    name: 'Condition'
                                },
                                {
                                    name: 'Action',
                                    align: 'right',
                                    cellRenderer({ rowIndex }) {
                                        const f = fields[rowIndex];
                                        return (
                                            <>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem 
                                                            asChild
                                                            className="focus:text-primary focus:bg-primary/20"
                                                        >
                                                            
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem
                                                            disabled={disabled}
                                                            onClick={() => onDelete(rowIndex)}
                                                            className="text-danger focus:bg-danger focus:text-danger-foreground"
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            <span>Delete</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </>
                                        );
                                    },
                                },
                            ]}
                            data={fields.map(f => [
                                f.type,
                                f.key,
                                f.label,
                                f.condition,
                                '',
                            ])}
                        />
                    </div>

                    <div className="border-t border-t-border px-4 py-2 flex gap-x-2">
                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                                onClick={() => {}}
                            >
                                Cancel
                            </Button>
                        </SheetClose>

                        <div className="ml-auto" />

                        <Button
                            onClick={() => {}}
                            disabled={disabled}
                        >
                            Save
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
