'use client';

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";

import { IConfigKeysContext, useConfigKeysContext, FormDataType, } from "@/contexts/config-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type Props = {
    formData?: FormDataType;
    open?: boolean;
};

function FormComponent({ formData }: Props) {
    const { disabled, onSave, } = useConfigKeysContext();

    const {
        register,
        handleSubmit,
    } = useForm({
        defaultValues: {
            key: formData?.key || '',
            label: formData?.label || '',
            configKeyId: formData?.configKeyId || v4(),
            summary: formData?.summary || '',
        } satisfies FormDataType,
    });

    const onSubmit = handleSubmit(data => onSave([data]));

    return (
        <>
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
                        <Label htmlFor="key">Key *</Label>
                        <Input 
                            {...register('key', { disabled, required: true, })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="label">Label *</Label>
                        <Input 
                            {...register('label', { disabled, required: true, })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="summary">Summary</Label>
                        <Input 
                            {...register('summary', { disabled, })}
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
        </>
    );
}

export function Form(props: Props) {
    const { formData, open } = props;

    const { disabled, isFormOpen, onFormOpenChange } = useConfigKeysContext();
    
    const isOpen = useMemo(() => open || isFormOpen, [open, isFormOpen]);

    return (
        <>
            <Sheet
                open={isOpen}
                onOpenChange={open => {
                    // resetForm();
                    onFormOpenChange(open);
                }}
            >
                {!formData && !disabled && (
                    <SheetTrigger asChild>
                        <Button
                            size="icon"
                            className="rounded-full w-12 h-12"
                        >
                            <Plus className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                )}

                {isOpen && <FormComponent {...props} />}
            </Sheet>
        </>
    );
}
