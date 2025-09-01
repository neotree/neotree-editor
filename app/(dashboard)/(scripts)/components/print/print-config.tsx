import { useCallback, useEffect, useState } from 'react';
import { arrayMoveImmutable } from 'array-move';
import { useQueryState } from 'nuqs';
import { MoreVertical, Trash, Edit, Eye, Plus } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useScriptsContext } from "@/contexts/scripts";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/loader";
import { ReactSelect } from "@/components/react-select";
import { useScriptForm } from "../../hooks/use-script-form";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScriptForm>;
};

export function ScriptPrintConfig(props: Props) {
    const {
        disabled,
        form: {
            watch,
            setValue,
            register,
        },
    } = props;

    const printConfig = watch('printConfig');

    const [currentItem, setCurrentItem] = useQueryState('config', {
        defaultValue: '',
        clearOnDefault: true,
    });

    const onDeleteHeaderField = useCallback((field: string) => {
        setValue('printConfig.headerFields', printConfig.headerFields.filter(f => f !== field));
    }, [printConfig.headerFields, setValue]);

    return (
        <>
            <HeaderPrintField 
                open={!!currentItem}
                onClose={() => setCurrentItem('')}
                disabled={disabled}
                field={printConfig.headerFields.filter(f => `${f}` === `${currentItem}`)[0]}
                headerFields={printConfig.headerFields}
                onChange={field => {
                    if (currentItem === 'new-header-field') {
                        setValue('printConfig.headerFields', [...printConfig.headerFields, field])
                    } else {
                        setValue('printConfig.headerFields', printConfig.headerFields.map(f => {
                            if (f !== field) return f;
                            return field;
                        }));
                    }
                }}
            />

            <div className="px-4 mb-5 flex flex-col gap-y-4">
                <div className="flex items-center">
                    <div className="text-2xl mr-auto">Print fields (Header)</div>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentItem('new-header-field')}
                    >
                        Add field
                        <Plus className="w-4 h-4 ml-2" />
                    </Button>
                </div>

                <div className="flex flex-col gap-y-2">
                    <Label htmlFor="print_config_header_format">Format</Label>
                    <Textarea 
                        rows={3}
                        {...register('printConfig.headerFormat', {
                            disabled,
                        })}
                    />
                    <div className="text-xs font-bold">
                        <div>
                            Format:&nbsp;
                            <span className="opacity-50">[BabyFirstName] [BabyLastName], [DOB], [Hosp]</span>
                        </div>
                        <div>
                            Result:&nbsp;
                            <span className="opacity-50">John Doe, 21-01-2025, Central Hospital</span>
                        </div>
                    </div>
                </div>
            </div>

            <DataTable
                sortable={!disabled}
                onSort={(oldIndex: number, newIndex: number) => {
                    const arr = arrayMoveImmutable(printConfig.headerFields, oldIndex, newIndex);
                    setValue('printConfig.headerFields', arr);
                }}
                columns={[
                    {
                        name: 'Field',
                    },
                    {
                        name: '',
                        align: 'right',
                        cellRenderer({ rowIndex }) {
                            const field = printConfig.headerFields[rowIndex];

                            if (!field) return null;

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
                                                onClick={() => {
                                                    setTimeout(() => setCurrentItem(`${field}`), 0);
                                                }}
                                            >
                                                {!disabled ? 
                                                    <><Edit className="mr-2 h-4 w-4" /> Edit</> 
                                                    : 
                                                    <><Eye className="mr-2 h-4 w-4" /> View</>}
                                            </DropdownMenuItem>

                                            {!disabled && (
                                                <DropdownMenuItem
                                                    onClick={() => onDeleteHeaderField(field)}
                                                    className="text-danger focus:bg-danger focus:text-danger-foreground"
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            );
                        },
                    }
                ]}
                data={printConfig.headerFields.map(field => [
                    field,
                ])}
            />
        </>
    );
}

function HeaderPrintField({ 
    open, 
    disabled, 
    field, 
    headerFields = [],
    onClose, 
    onChange,
}: {
    open: boolean;
    disabled?: boolean;
    field?: string;
    headerFields: string[];
    onClose: () => void;
    onChange: (field: string) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(field || null);

    const { keys, } = useScriptsContext();

    useEffect(() => { setSelected(field || null); }, [field]);

    const onSave = useCallback(() => {
        if (selected) onChange(selected);
    }, [selected, onChange]);

    const _onClose = useCallback(() => {
        setSelected(null);
        onClose();
    }, [onClose]);

    const selectOpts = keys
        .filter(k => !headerFields.includes(k.key))
        .map(k => ({
            label: k.label,
            value: k.key,
        }));

    return (
        <>
            {loading && <Loader overlay />}

            <div>
                <Sheet
                    open={open}
                    onOpenChange={open => {
                        if (!open) _onClose();
                    }}
                >
                    <SheetContent
                        hideCloseButton
                        side="right"
                        className="p-0 m-0 flex flex-col w-full max-w-full sm:max-w-[80%] md:max-w-[80%] lg:max-w-[50%]"
                    >
                        <SheetHeader className="flex flex-row items-center py-2 px-4 border-b border-b-border text-left sm:text-left">
                            <SheetTitle>{!field ? 'Add' : 'Edit'} print section</SheetTitle>
                            <SheetDescription className="hidden"></SheetDescription>
                        </SheetHeader>

                        <div className="flex-1 flex flex-col py-2 px-0 gap-y-4 overflow-y-auto">
                            <div className="px-4">
                                <Label secondary>Keys</Label>

                                <div>
                                    <ReactSelect
                                        isDisabled={disabled}
                                        value={selectOpts.find(o => o.value === selected) || null}
                                        placeholder="Select key"
                                        isClearable={false}
                                        options={selectOpts}
                                        onChange={(v: any) =>
                                        {
                                            setSelected(v?.value || null);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-t-border px-4 py-2 flex gap-x-2">
                            <span className="text-danger text-xs my-auto">* Required</span>

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
                                    disabled={disabled || !selected}
                                >
                                    Save
                                </Button>
                            </SheetClose>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
