'use client';

import { useState, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Settings, Trash, MoreVertical, Edit2, Plus } from "lucide-react";
import { listScreens } from "@/app/actions/scripts";

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
import { ScreenReviewField } from "@/types";
import { DataTable } from "@/components/data-table";
import { useScreenReviewField } from "../hooks/use-field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useScriptForm } from "../hooks/use-script-form";
import * as scriptsActions from '@/app/actions/scripts';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import axios from 'axios';



type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScriptForm>;
    scriptId: string;
};

export function ScreenReviewConfig({
    disabled,
    form: {
        watch,
        setValue
    },
    scriptId
}: Props) {
    const mounted = useRef(false);
    const fields = watch('reviewConfigurations');
    const reviewEnabled = watch('reviewable');

    const [selectedField, setSelectedField] = useState<{ index: number; field: ScreenReviewField; }>();
    const [createNew, setCreateNew] = useState(false)
    const [_reviewEnabled, _setReviewEnabled] = useState(reviewEnabled);
    const [open, setOpen] = useState(false);
   
    const [screens, setScreens] = useState<Awaited<ReturnType<typeof scriptsActions.getScreens>>>({ data: [], });
    
    
    useEffect(() => {
        if (open && !mounted.current) {
            mounted.current = true;
            (async () => {
                try {
                    const res = await axios.get<Awaited<ReturnType<typeof scriptsActions.getScreens>>>('/api/screens?data='+JSON.stringify({ scriptsIds: [scriptId], returnDraftsIfExist: true, }))
                    setScreens(res.data);
                } catch(e: any) {
                    mounted.current = false;
                    alert({
                        title: "",
                        message: e.message,
                    });
                } 
            })();
        }
    }, [alert, open, scriptId]);

    useEffect(() => {

        if (reviewEnabled && !_reviewEnabled) setOpen(true);
        _setReviewEnabled(reviewEnabled);
    }, [_reviewEnabled, reviewEnabled]);

   

    const { confirm } = useConfirmModal();

    const onDelete = useCallback((index: number) => {
        confirm(() => setValue('reviewConfigurations', fields.filter((_, i) => i !== index), { shouldDirty: true, }), {
            danger: true,
            title: 'Delete Entry',
            message: 'Are you sure you want to delete  this entry?',
            positiveLabel: 'Delete',
            negativeLabel: 'Cancel',
        });
    }, [fields, confirm, setValue]);

    const onSave = useCallback(() => {

    }, []);

    const getScreenTitle = (id: string) => {

        const screen = screens.data?.find(f => (f.screenId === id) || (f.oldScreenId === id))
        return screen?.title
    }

    return (
        <>

            {!!selectedField && <Field
                open
                field={selectedField?.field}
                screen={selectedField?.field?.screen}
                screens={screens.data}
                onClose={() => setSelectedField(undefined)}
                onChange={field => {
                    setValue(
                        'reviewConfigurations',
                        fields.map((f, i) => {
                            if (i === selectedField?.index) return { ...f, ...field, };
                            return f;
                        }),
                        { shouldDirty: true, }
                    );
                    setSelectedField(undefined);
                }}
            />}

            {!!createNew && (
                <Field
                    open
                    screens={screens.data}
                    onClose={() => setCreateNew(false)}
                    onChange={field => {
                        setValue(
                            'reviewConfigurations',
                            [...fields, {
                                ...field,

                            }],
                            { shouldDirty: true, }
                        );
                        setCreateNew(false);
                    }}
                />
            )}

            <Sheet
                open={open}
                onOpenChange={open => {
                    if (!open) setOpen(false);
                }}
            >
                {reviewEnabled && (
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
                        <SheetTitle>Configure Screen Review</SheetTitle>
                        <SheetDescription className="hidden"></SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 flex flex-col py-2 px-0 gap-y-4 overflow-y-auto">
                        <DataTable
                            title="Fields"
                            sortable
                            headerActions={(
                                <>

                                    <Button
                                        variant="ghost"
                                        disabled={disabled}
                                        onClick={() => setCreateNew(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Config
                                    </Button>

                                </>
                            )}
                            columns={[

                                {
                                    name: 'Label'
                                },
                                {
                                    name: 'Screen'
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
                                f.label,
                                getScreenTitle(f.screen) || 'Failed to load screen, try to delete this row add another screen',
                            ])}
                        />
                    </div>

                    <div className="border-t border-t-border px-4 py-2 flex gap-x-2">
                        <div className="ml-auto" />

                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                                onClick={() => { }}
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
    screens,
    onClose,
}: {
    open: boolean;
    field?: ScreenReviewField;
    screen?: ScreenReviewField['screen'];
    screens: Awaited<ReturnType<typeof listScreens>>['data'];
    onClose: () => void;
    onChange: (field: ScreenReviewField) => void;
}) {
    const { getDefaultValues } = useScreenReviewField({ ...field } as ScreenReviewField);

    const {
        register,
        setValue,
        handleSubmit,
    } = useForm({
        defaultValues: getDefaultValues(),
    });



    const onSave = handleSubmit(onChange);

    return (
        <>
            <Modal
                title={field ? 'Edit' : 'Add New'}
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


                    <div className="min-w-[300px]">
                        <Label secondary htmlFor="screen">Go To Screen</Label>
                        <Select
                            value={field?.screen}
                            name="screen"
                            onValueChange={val => {
                                setValue('screen', val === 'none' ? '' : val);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select screen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="none">None</SelectItem>
                                    {screens.map((s,i) => (
                                        <SelectItem key={s.screenId} value={s.oldScreenId || s.screenId}>
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: [
                                                        (i+1),
                                                        s.title,
                                                        `<span class="opacity-50">${s.refId || ''}</span>`,
                                                    ].join(' - '),
                                                }}
                                            />
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Modal>
        </>
    );
}
