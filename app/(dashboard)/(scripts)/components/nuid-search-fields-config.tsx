'use client';

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Settings, Trash, MoreVertical, Edit2 } from "lucide-react";

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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DialogClose, } from "@/components/ui/dialog";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { ScriptField } from "@/types";
import { DataTable } from "@/components/data-table";
import { useField } from "../hooks/use-field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useScriptForm } from "../hooks/use-script-form";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScriptForm>;
};

export function NuidSearchFieldsConfig({ 
    disabled,
    form: {
        watch,
        setValue,
    },
}: Props) {
    const fields = watch('nuidSearchFields');
    const nuidSearchEnabled = watch('nuidSearchEnabled');
    
    const [selectedField, setSelectedField] = useState<{ index: number; field: ScriptField; }>();
    const [_nuidSearchEnabled, _setNuidSearchEnabled] = useState(nuidSearchEnabled);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (nuidSearchEnabled && !_nuidSearchEnabled) setOpen(true);
        _setNuidSearchEnabled(nuidSearchEnabled);
    }, [_nuidSearchEnabled, nuidSearchEnabled]);

    const { confirm } = useConfirmModal();

    const onDelete = useCallback((index: number) => {
        confirm(() => setValue('nuidSearchFields', fields.filter((_, i) => i !== index), { shouldDirty: true, }), {
            danger: true,
            title: 'Delete field',
            message: 'Are you sure you want to delete field?',
            positiveLabel: 'Delete',
            negativeLabel: 'Cancel',
        });
    }, [fields, confirm, setValue]);

    const onSave = useCallback(() => {
        
    }, []);

    return (
        <>
            {!!selectedField && (
                <Field 
                    open
                    field={selectedField?.field}
                    onClose={() => setSelectedField(undefined)}
                    onChange={field => {
                        setValue(
                            'nuidSearchFields',
                            fields.map((f, i) => {
                                if (i === selectedField?.index) return { ...f, ...field, };
                                return f;
                            }),
                            { shouldDirty: true, }
                        );
                        setSelectedField(undefined);
                    }}
                />
            )}

            <Sheet
                open={open}
                onOpenChange={open => {
                    if (!open) setOpen(false);
                }}
            >
                {nuidSearchEnabled && (
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
                )}

                <SheetContent
                    hideCloseButton
                    side="right"
                    className="p-0 m-0 flex flex-col w-full max-w-full sm:max-w-[80%] md:max-w-[80%] lg:max-w-[50%]"
                >
                    <SheetHeader className="flex flex-row items-center py-2 px-4 border-b border-b-border text-left sm:text-left">
                        <SheetTitle>Configure NUID Search page</SheetTitle>
                        <SheetDescription className="hidden"></SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 flex flex-col py-2 px-0 gap-y-4 overflow-y-auto">
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
                                                            className="focus:text-primary focus:bg-primary/20"
                                                            onClick={() => setSelectedField({ index: rowIndex, field: f, })}
                                                        >
                                                            <Edit2 className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>

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
                        <div className="ml-auto" />

                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                                onClick={() => {}}
                            >
                                Cancel
                            </Button>
                        </SheetClose>

                        <SheetClose asChild>
                            <Button
                                onClick={() => onSave()}
                                disabled={disabled}
                            >
                                Save
                            </Button>
                        </SheetClose>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

export function Field({ 
    open,
    field,
    onChange,
    onClose,
}: {
    open: boolean;
    field?: ScriptField;
    onClose: () => void;
    onChange: (field: ScriptField) => void;
}) {
    const { getDefaultValues } = useField(field);

    const {
        register,
        handleSubmit,
    } = useForm({
        defaultValues: getDefaultValues(),
    });

    const onSave = handleSubmit(onChange);

    return (
        <>
            <Modal
                title={field ? 'Edit field' : 'Add field'}
                open={open}
                onOpenChange={isOpen => {
                    if (!isOpen) onClose();
                }}
                actions={(
                    <>
                        <span className="text-sm text-danger">* Required</span>

                        <div className="flex-1" />

                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            onClick={() => onSave()}
                        >
                            Save
                        </Button>
                    </>
                )}
            >
                <div className="flex flex-col gap-y-5">
                    <div>
                        <Label htmlFor="label">Label *</Label>
                        <Input 
                            {...register('label', { required: true, })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="key">Key *</Label>
                        <Input 
                            {...register('key', { required: true, })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="condition">Condition</Label>
                        <Input 
                            {...register('condition', { required: false, })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="values">Options *</Label>
                        <Textarea 
                            {...register('values', { required: true, })}
                            rows={5}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}
