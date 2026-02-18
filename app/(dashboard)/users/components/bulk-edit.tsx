'use client';

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateUsers as updateUsersAction, } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "@/hooks/use-search-params";
import { getRoles } from "@/app/actions/roles";
import { Label } from "@/components/ui/label";
import { useAlertModal } from "@/hooks/use-alert-modal";

type Role = Awaited<ReturnType<typeof getRoles>>[0]['name'];

export function BulkEdit({ 
    open, 
    disabled,
    userIds, 
    roles, 
    onOpenChange, 
    updateUsers,
    onSaveSuccess,
}: {
    open?: boolean;
    disabled?: boolean;
    userIds: string[];
    roles: Awaited<ReturnType<typeof getRoles>>;
    updateUsers: typeof updateUsersAction;
    onOpenChange?: (open: boolean) => void;
    onSaveSuccess?: () => Promise<any>;
}) {
    const { alert } = useAlertModal();
    const { replace: searchParamsReplace } = useSearchParams();

    const [submitting, setSubmitting] = useState(false);

    const {
        watch,
        setValue,
        handleSubmit,
    } = useForm({
        defaultValues: {
            role: '' as Role,
        },
    });

    const close = useCallback(() => {
        searchParamsReplace({ bulkEdit: undefined, });
        setValue('role', '' as Role);
    }, [onOpenChange, searchParamsReplace, setValue]);

    const onSave = handleSubmit(data => {
        if (disabled) return;

        (async () => {
            try {
                setSubmitting(true);
    
                if (userIds.length) {
                    // await updateUsers(userIds.map(userId => ({ userId, data, })));

                    // TODO: replace with server action
                    await axios.post('/api/users/update', { data: userIds.map(userId => ({ userId, data, })), });
                    
                    if (onSaveSuccess) await onSaveSuccess();
                }
    
                alert({
                    variant: 'success',
                    message: 'Users updated',
                    onClose: close,
                });
            } catch(e: any) {
                alert({
                    title: '',
                    message: 'Failed to update users: ' + e.message,
                    variant: 'error',
                });
            } finally {
                setSubmitting(false);
            }
        })();
    });

    useEffect(() => { 
        if (!userIds.length) close(); 
    }, [userIds, close]);

    const role = watch('role');

    return (
        <>
            <Sheet
                open={open}
                onOpenChange={open => {
                    if (!open) close();
                    onOpenChange?.(open);
                }}
            >
                <SheetContent 
                    side="right"
                    className="p-0 m-0 flex flex-col"
                >
                    <SheetHeader className="py-2 px-4 border-b border-b-border">
                        <SheetTitle>Bulk edit users</SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 flex flex-col py-2 px-4 gap-y-4 overflow-y-auto">
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={role}
                                required
                                name="role"
                                disabled={submitting || !!disabled}
                                onValueChange={value => {
                                    setValue('role', value as typeof role);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="-- select role --" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>User role</SelectLabel>
                                    {roles.map(role => (
                                        <SelectItem key={role.name} value={role.name}>
                                            {role.description}
                                        </SelectItem>
                                    ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="border-t border-t-border px-4 py-2 flex justify-end gap-x-2">
                        <SheetClose asChild>
                            <Button
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </SheetClose>

                        <Button
                            onClick={onSave}
                            disabled={!!disabled || !role}
                        >
                            Save
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
