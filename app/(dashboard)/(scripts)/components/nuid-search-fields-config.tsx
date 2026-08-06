'use client';

import { useState, useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { arrayMoveImmutable } from "array-move";
import Link from "next/link";
import { Settings, Trash, MoreVertical, Edit2, Plus, ArrowUp, ArrowDown } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useScriptForm } from "../hooks/use-script-form";
import { validateDropdownValues } from "@/lib/validate-dropdown-values";
import { ConditionalExpressionModal } from "@/components/conditional-expression-modal";
import { SelectDataKey } from "@/components/select-data-key";
import { useDataKeysCtx } from "@/contexts/data-keys";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScriptForm>;
};

export function NuidSearchFieldsConfig({ 
    disabled,
    form: {
        watch,
        setValue,
        getDefaultNuidSearchFields,
    },
}: Props) {
    const fields = watch('nuidSearchFields');
    const nuidSearchEnabled = watch('nuidSearchEnabled');
    
    const [selectedField, setSelectedField] = useState<{ index: number; field: ScriptField; }>();
    const [_nuidSearchEnabled, _setNuidSearchEnabled] = useState(nuidSearchEnabled);
    const [selectedNewFieldType, setSelectedNewFieldType] = useState<typeof fields[0]['type']>();
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

    const onReorder = useCallback((oldIndex: number, newIndex: number) => {
        if (disabled) return;
        if (oldIndex === newIndex) return;
        if ((newIndex < 0) || (newIndex > (fields.length - 1))) return;
        setValue('nuidSearchFields', arrayMoveImmutable(fields, oldIndex, newIndex), { shouldDirty: true, });
    }, [fields, disabled, setValue]);

    const onSave = useCallback(() => {

    }, []);

    return (
        <>
            {!!selectedField && (
                <Field
                    open
                    disabled={disabled}
                    field={selectedField?.field}
                    fieldType={selectedField?.field?.type!}
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

            {!!selectedNewFieldType && (
                <Field
                    open
                    disabled={disabled}
                    fieldType={selectedNewFieldType}
                    onClose={() => setSelectedNewFieldType(undefined)}
                    onChange={field => {
                        setValue(
                            'nuidSearchFields',
                            [...fields, {
                                ...field,
                                type: selectedNewFieldType,
                            }],
                            { shouldDirty: true, }
                        );
                        setSelectedNewFieldType(undefined);
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
                            sortable={!disabled}
                            onSort={(oldIndex, newIndex) => onReorder(oldIndex, newIndex)}
                            headerActions={(
                                <>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                disabled={disabled}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add field
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent>
                                            <DropdownMenuItem 
                                                className="focus:text-primary focus:bg-primary/20"
                                                onClick={() => setSelectedNewFieldType('dropdown')}
                                            >
                                                Yes/No
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => setSelectedNewFieldType('text')}
                                            >
                                                NUID Search
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            )}
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
                                    name: 'Required'
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
                                                            className="focus:text-primary focus:bg-primary/20"
                                                            disabled={disabled || (rowIndex === 0)}
                                                            onClick={() => onReorder(rowIndex, rowIndex - 1)}
                                                        >
                                                            <ArrowUp className="mr-2 h-4 w-4" />
                                                            Move up
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            className="focus:text-primary focus:bg-primary/20"
                                                            disabled={disabled || (rowIndex === (fields.length - 1))}
                                                            onClick={() => onReorder(rowIndex, rowIndex + 1)}
                                                        >
                                                            <ArrowDown className="mr-2 h-4 w-4" />
                                                            Move down
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
                                f.optional ? 'No' : 'Yes',
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
    fieldType,
    disabled,
    onChange,
    onClose,
}: {
    open: boolean;
    field?: ScriptField;
    fieldType: ScriptField['type'];
    disabled?: boolean;
    onClose: () => void;
    onChange: (field: ScriptField) => void;
}) {
    const { extractDataKeys } = useDataKeysCtx();

    const { getDefaultValues } = useField({
        ...field,
        type: fieldType,
    } as ScriptField);

    const {
        control,
        watch,
        register,
        setValue,
        handleSubmit,
        formState: { errors, },
    } = useForm({
        defaultValues: getDefaultValues(),
    });

    const type = watch('type');
    const key = watch('key');
    const keyId = watch('keyId');
    const label = watch('label');
    const values = watch('values');
    const optional = watch('optional');
    const confidential = watch('confidential');

    const hasOptions = useMemo(() => ['dropdown', 'multi_select'].includes(type), [type]);

    const dataKey = useMemo(() => {
        const [k] = !keyId ? [null] : extractDataKeys([keyId]);
        return k;
    }, [keyId, extractDataKeys]);

    // Confidentiality lives on the data key - fields inherit it, same as screen fields
    const inheritedConfidential = useMemo(() => !!dataKey?.confidential, [dataKey?.confidential]);

    useEffect(() => {
        if (confidential !== inheritedConfidential) {
            setValue('confidential', inheritedConfidential, { shouldDirty: true, });
        }
    }, [confidential, inheritedConfidential, setValue]);

    // Legacy fields were keyed by hand and have no keyId, so leave the picker open for
    // them. Once a field is linked to a data key the key is locked, as on screen fields.
    const isKeyDisabled = !!disabled || (!!field && !!field.keyId);

    const onSave = handleSubmit(onChange);

    const valuesErrors = useMemo(() => hasOptions ? validateDropdownValues(values) : [], [values, hasOptions]);

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
                            disabled={disabled || !!valuesErrors.length}
                        >
                            Save
                        </Button>
                    </>
                )}
            >
                <div className="flex flex-col gap-y-5">
                    <div>
                        <Label error={!disabled && !key} htmlFor="key">Key *</Label>
                        <Controller
                            control={control}
                            name="key"
                            rules={{ required: 'Select a data key.', }}
                            render={({ field: { value, onChange, }, }) => (
                                <SelectDataKey
                                    modal
                                    value={`${value || ''}`}
                                    disabled={isKeyDisabled}
                                    error={!!errors.key}
                                    onChange={([item]) => {
                                        if (!item) return;
                                        onChange(item.name);
                                        setValue('keyId', item.uniqueKey, { shouldDirty: true, });
                                        setValue('label', item.label || item.name, { shouldDirty: true, });
                                        setValue('confidential', !!item.confidential, { shouldDirty: true, });

                                        // Dropdown data keys carry their options as child keys - pull them
                                        // in so the app's Yes/No prompt matches the library.
                                        const options = (item.children || [])
                                            .map(c => `${c.name},${c.label || c.name}`)
                                            .join('\n');
                                        if (hasOptions && options) setValue('values', options, { shouldDirty: true, });
                                    }}
                                />
                            )}
                        />
                        {!!errors.key && <span className="text-xs text-danger">{`${errors.key.message || ''}`}</span>}
                        <span className="text-xs text-muted-foreground">
                            Keys come from the <b>Data Key library</b>.
                            {!!keyId && (
                                <>
                                    {' '}
                                    <Link
                                        href={`/data-keys/edit/${keyId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline"
                                    >
                                        Open data key
                                    </Link>
                                </>
                            )}
                            {!keyId && !!key && ' This field is not linked to a data key yet - pick one above to link it.'}
                        </span>
                    </div>

                    <div>
                        <Label error={!disabled && !label} htmlFor="label">Label *</Label>
                        <Input
                            {...register('label', { required: true, disabled, })}
                            error={!disabled && !label}
                        />
                        <span className="text-xs text-muted-foreground">
                            Prefilled from the data key. Edit it to change the wording shown on the app.
                        </span>
                    </div>

                    <div>
                        <Label htmlFor="condition">Condition <ConditionalExpressionModal /></Label>
                        <Textarea
                            {...register('condition', { required: false, disabled, })}
                            name="condition"
                            noRing={false}
                            rows={5}
                        />
                    </div>

                    <div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="optional"
                                disabled={disabled}
                                checked={optional}
                                onCheckedChange={checked => setValue('optional', checked, { shouldDirty: true, })}
                            />
                            <Label htmlFor="optional">Optional</Label>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            When off, the session cannot be started until this question is answered.
                        </span>
                    </div>

                    <div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="confidential"
                                disabled
                                checked={inheritedConfidential}
                            />
                            <Label htmlFor="confidential">Confidential</Label>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Inherited from the data key. Change it in the Data Key library.
                        </span>
                    </div>

                    {(
                        (type === 'dropdown') ||
                        (type === 'multi_select')
                    ) && (
                        <div>
                            <Label htmlFor="values">Options *</Label>
                            <Textarea
                                {...register('values', { required: true, disabled, })}
                                rows={5}
                            />
                            {!!valuesErrors.length && <span className="text-xs text-danger">{valuesErrors.join(', ')}</span>}
                            <span className="text-xs text-muted-foreground">
                                Filled from the data key&apos;s options when you pick a key that has them.
                                One <b>value,label</b> pair per line.
                            </span>
                        </div>
                        // <Controller 
                        //     control={control}
                        //     name="items"
                        //     render={({ field: { value, onChange, }, }) => {
                        //         return (
                        //             <FieldItems 
                        //                 disabled={false}
                        //                 items={value}
                        //                 fieldType={type}
                        //                 onChange={onChange}
                        //             />
                        //         );
                        //     }}
                        // />
                    )}
                </div>
            </Modal>
        </>
    );
}
