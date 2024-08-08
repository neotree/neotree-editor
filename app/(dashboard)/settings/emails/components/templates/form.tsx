'use client';

import { useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { IEmailTemplatesContext, useEmailTemplatesContext } from "@/contexts/email-templates";
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

type FormDataType = Parameters<IEmailTemplatesContext['saveEmailTemplates']>[0][0];

type Props = {
    formData?: FormDataType;
    open?: boolean;
};

const defaultFormValues = {
    name: '',
    data: [],
} satisfies FormDataType;

export function Form({ formData, open }: Props) {
    const {
        emailTemplates,
        isFormOpen,
        activeItemId,
        onSave,
        onFormOpenChange,
    } = useEmailTemplatesContext();

    const {
        reset,
        watch,
        setValue,
        register,
        handleSubmit,
    } = useForm({
        defaultValues: {
            ...defaultFormValues,
            ...formData,
        },
    });

    const disabled = useMemo(() => false, []);

    const resetForm: typeof reset = useCallback((values) => reset({
        ...defaultFormValues,
        ...formData,
        ...values,
    }), [reset, formData]);

    const onSubmit = handleSubmit(data => onSave([data]));

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
                        <SheetTitle>{`${!formData ? 'Add' : 'Update'} template`}</SheetTitle>
                        <SheetDescription className="hidden"></SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 flex flex-col py-2 px-4 gap-y-4 overflow-y-auto">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input 
                                {...register('name', { disabled, required: true, })}
                            />
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
