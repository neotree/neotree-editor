'use client';

import { useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { IMailerContext, useMailerContext } from "@/contexts/mailer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type FormDataType = Parameters<IMailerContext['saveMailerSettings']>[0];

type Props = {
    formData?: FormDataType;
    open?: boolean;
};

const services: {
    value: FormDataType['service'];
    label: string;
}[] = [
    {
        value: 'smtp',
        label: 'SMTP',
    },
    {
        value: 'gmail',
        label: 'GMAIL'
    },
];

const defaultFormValues = {
    name: '',
    service: 'smtp',
    authUsername: '',
    authPassword: '',
    authType: '',
    authMethod: '',
    host: '',
    port: null,
    encryption: '',
    fromAddress: '',
    fromName: '',
    isActive: false,
    secure: false,
} satisfies FormDataType;

export function Form({ formData, open }: Props) {
    const {
        mailerSettings,
        isFormOpen,
        activeItemId,
        onSave,
        onFormOpenChange,
    } = useMailerContext();

    const {
        reset,
        watch,
        setValue,
        register,
        handleSubmit,
    } = useForm({
        defaultValues: {
            ...defaultFormValues,
            name: `Mailer details ${mailerSettings.data.length + 1}`,
            isActive: !mailerSettings.data.length,
            ...formData,
        },
    });

    const service = watch('service');
    const name = watch('name');
    const secure = watch('secure');
    const isActive = watch('isActive');

    const disabled = useMemo(() => false, []);

    const resetForm: typeof reset = useCallback((values) => reset({
        ...defaultFormValues,
        ...formData,
        ...values,
        name,
        isActive,
    }), [reset, name, isActive, formData]);

    const onSubmit = handleSubmit(onSave);

    return (
        <>
            <Sheet
                open={open || isFormOpen}
                onOpenChange={open => {
                    // resetForm();
                    onFormOpenChange(open);
                }}
            >
                {!formData && (
                    <SheetTrigger asChild>
                        <Button
                            size="icon"
                            className="rounded-full w-12 h-12"
                        >
                            <Plus className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                )}

                <SheetContent 
                    hideCloseButton
                    side="right"
                    className="p-0 m-0 flex flex-col"
                >
                    <SheetHeader className="py-4 px-4 border-b border-b-border">
                        <SheetTitle>{`${!formData ? 'Add' : 'Update'} mailer settings`}</SheetTitle>
                        <SheetDescription className="hidden"></SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 flex flex-col py-2 px-4 gap-y-4 overflow-y-auto">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input 
                                {...register('name', { disabled, required: true, })}
                            />
                        </div>

                        <div>
                            <Label>Services</Label>
                            <Select
                                value={service}
                                disabled={disabled}
                                onValueChange={value => {
                                    resetForm({
                                        service: value as FormDataType['service'],
                                    });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectGroup>
                                    {services.map(s => (
                                        <SelectItem key={s.value} value={s.value}>
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="authUsername">Username *</Label>
                            <Input 
                                {...register('authUsername', { disabled, required: true, })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="authPassword">Password *</Label>
                            <Input 
                                {...register('authPassword', { disabled, required: true, })}
                            />
                        </div>

                        {service === 'smtp' && (
                            <>
                                <div>
                                    <Label htmlFor="host">Host *</Label>
                                    <Input 
                                        {...register('host', { disabled, required: true, })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="port">Port *</Label>
                                    <Input 
                                        {...register('port', { disabled, required: true, })}
                                        type="number"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="secure" 
                                            disabled={disabled}
                                            checked={secure}
                                            onCheckedChange={checked => setValue('secure', checked as boolean, { shouldDirty: true, })}
                                        />
                                        <Label htmlFor="secure">Secure</Label>
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <Label htmlFor="authPassword">From name</Label>
                            <Input 
                                {...register('fromName', { disabled, })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="fromAddress">From address</Label>
                            <Input 
                                {...register('fromAddress', { disabled, })}
                            />
                        </div>

                        <div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="isActive" 
                                    disabled={disabled}
                                    checked={isActive}
                                    onCheckedChange={checked => setValue('isActive', checked as boolean, { shouldDirty: true, })}
                                />
                                <Label htmlFor="isActive">Use these details</Label>
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="border-t border-t-border px-4 py-2 gap-x-2">
                        <div className="flex-1" />

                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </SheetClose>

                        <Button
                            onClick={() => onSubmit()}
                        >
                            Save
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
