'use client';

import { useMemo, useEffect, useRef } from "react";
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
import { useIsLocked } from "@/hooks/use-is-locked";
import { createChangeTracker } from "@/lib/change-tracker";
import { pendingChangesAPI } from "@/lib/indexed-db";
import { useAppContext } from "@/contexts/app";

type Props = {
    formData?: FormDataType;
    open?: boolean;
};

function FormComponent({ formData }: Props) {
    const isLocked = useIsLocked({
        isDraft: !!formData?.isDraft,
        userId: formData?.draftCreatedByUserId,
    });

    const { disabled: _disabled, onSave, } = useConfigKeysContext();
    const { authenticatedUser } = useAppContext();

    const disabled = _disabled || isLocked;

    const {
        register,
        handleSubmit,
        reset,
    } = useForm({
        defaultValues: {
            key: formData?.key || '',
            label: formData?.label || '',
            configKeyId: formData?.configKeyId || v4(),
            summary: formData?.summary || '',
        } satisfies FormDataType,
    });

    const changeTrackerRef = useRef<ReturnType<typeof createChangeTracker> | null>(null);
    const originalSnapshotRef = useRef<FormDataType | null>(null);

    const sanitizeConfigKey = (data?: FormDataType | null) => {
        if (!data) return null;
        return {
            configKeyId: data.configKeyId,
            key: data.key,
            label: data.label,
            summary: data.summary,
        } as FormDataType;
    };

    useEffect(() => {
        reset({
            key: formData?.key || '',
            label: formData?.label || '',
            configKeyId: formData?.configKeyId || v4(),
            summary: formData?.summary || '',
        });

        if (!formData?.configKeyId) {
            changeTrackerRef.current = null;
            originalSnapshotRef.current = null;
            return;
        }

        if (changeTrackerRef.current && originalSnapshotRef.current?.configKeyId === formData.configKeyId) {
            return;
        }

        const snapshot = sanitizeConfigKey(formData);
        if (!snapshot) return;

        const tracker = createChangeTracker({
            entityId: formData.configKeyId,
            entityType: "configKey",
            userId: authenticatedUser?.userId,
            userName: authenticatedUser?.displayName,
            entityTitle: formData.label || formData.key || "Config key",
            resolveEntityTitle: (data) => data?.label || data?.key,
        });

        tracker.setSnapshot(snapshot);
        changeTrackerRef.current = tracker;
        originalSnapshotRef.current = snapshot;
    }, [formData, reset, authenticatedUser?.userId, authenticatedUser?.displayName]);

    const onSubmit = handleSubmit(async data => {
        if (disabled) return;

        const payload: FormDataType = {
            ...data,
            configKeyId: data.configKeyId || formData?.configKeyId || v4(),
        };

        const success = await onSave([payload]);
        if (!success) return;

        const snapshot = sanitizeConfigKey(payload);

        if (!formData?.configKeyId && snapshot) {
            await pendingChangesAPI.addChange({
                entityType: "configKey",
                entityId: snapshot.configKeyId!,
                entityTitle: snapshot.label || snapshot.key || "Config key",
                action: "create",
                fieldPath: "configKey",
                fieldName: "New Config Key",
                oldValue: null,
                newValue: snapshot,
                userId: authenticatedUser?.userId,
                userName: authenticatedUser?.displayName,
                fullSnapshot: snapshot,
            });
        } else if (changeTrackerRef.current && originalSnapshotRef.current && snapshot) {
            await changeTrackerRef.current.trackChanges(snapshot, "Config key saved");
        }
    });

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

                    {!disabled && (
                        <Button
                            onClick={() => onSubmit()}
                            disabled={disabled}
                        >
                            Save
                        </Button>
                    )}
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
