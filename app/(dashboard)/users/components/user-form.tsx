'use client';

import { MenuIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { v4 } from "uuid";
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
import { getUser , updateUsers, createUsers } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "@/hooks/use-search-params";
import { getRoles } from "@/app/actions/roles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Loader } from "@/components/loader";
import { useEffectOnce } from '@/hooks/use-effect-once';
import { cn } from "@/lib/utils";
import { validEmailRegex } from "@/constants/email";

type Role = Awaited<ReturnType<typeof getRoles>>[0]['name'];

type Props = {
    open?: boolean;
    userId?: string;
    roles: Awaited<ReturnType<typeof getRoles>>;
    getUser: typeof getUser;
    updateUsers: typeof updateUsers;
    createUsers: typeof createUsers;
    onClose?: () => void;
    onSaveSuccess?: () => Promise<any>;
};

export function UserForm({ 
    open, 
    userId, 
    roles, 
    getUser, 
    onClose, 
    updateUsers,
    createUsers,
    onSaveSuccess,
}: Props) {
    const { alert } = useAlertModal();
    const { parsed, replace: searchParamsReplace } = useSearchParams();

    const updateUserId = userId || parsed.userId;

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [, setUser] = useState<Awaited<ReturnType<typeof getUser>>>();
    const [showEmailInput, setShowEmailInput] = useState(!updateUserId);

    const {
        formState: { errors, },
        watch,
        setValue,
        register,
        handleSubmit,
    } = useForm({
        defaultValues: {
            userId: updateUserId || v4(),
            email: '',
            displayName: '',
            firstName: '',
            lastName: '',
            role: 'user' as Role,
            avatar: '',
            avatar_sm: '',
            avatar_md: '',
        },
    });

    const load = useCallback(() => {
        if (updateUserId) {
            setLoading(true);
            getUser(updateUserId)
                .then(u => {
                    setUser(u);
                    if (u) {
                        setValue('userId', u.userId || '');
                        setValue('email', u.email || '');
                        setValue('displayName', u.displayName || '');
                        setValue('firstName', u.firstName || '');
                        setValue('lastName', u.lastName || '');
                        setValue('role', u.role || 'user');
                        setValue('avatar', u.avatar || '');
                        setValue('avatar_sm', u.avatar_sm || '');
                        setValue('avatar_md', u.avatar_md || '');
                    }
                })
                .catch(e => alert({
                    title: '',
                    message: 'Failed to load user: ' + e.message,
                    variant: 'error',
                    onClose: () => searchParamsReplace({ userId: undefined, }),
                }))
                .finally(() => setLoading(false));
        }
    }, [updateUserId, searchParamsReplace, alert, setValue, getUser]);

    useEffectOnce(load);

    const onSave = handleSubmit(data => {
        (async () => {
            try {
                setSubmitting(true);
    
                if (updateUserId) {
                    // await updateUsers([{ userId: updateUserId, data }]);

                    // TODO: replace with server action
                    await axios.post('/api/users/update', { data: [{ userId: updateUserId, data }], });

                    if (onSaveSuccess) await onSaveSuccess();
                } else {
                    // await createUsers([data]);

                    // TODO: replace with server action
                    await axios.post('/api/users/add', { data: [data], });

                    if (onSaveSuccess) await onSaveSuccess();
                }
    
                alert({
                    variant: 'success',
                    message: 'User was saved successfully!',
                    onClose: () => {
                        onClose?.();
                        searchParamsReplace({ userId: undefined, });
                    },
                });
            } catch(e: any) {
                alert({
                    title: '',
                    message: 'Failed to save user: ' + e.message,
                    variant: 'error',
                });
            } finally {
                setSubmitting(false);
            }
        })();
    });

    const role = watch('role');
    const email = watch('email');

    if (loading) return <Loader overlay />;

    return (
        <>
            {submitting && <Loader overlay />}
            
            <Sheet
                open={open || !!parsed.userId}
                onOpenChange={() => {
                    onClose?.();
                    searchParamsReplace({ userId: undefined, });
                }}
            >
                <SheetTrigger asChild>
                    <Button
                        className="md:hidden"
                        variant="ghost"
                    >
                        <MenuIcon className="h-6 w-6" />
                    </Button>
                </SheetTrigger>

                <SheetContent 
                    side="right"
                    className="p-0 m-0 flex flex-col"
                >
                    <SheetHeader className="py-2 px-4 border-b border-b-border">
                        <SheetTitle>{updateUserId ? 'Edit' : 'New'} User</SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 flex flex-col py-2 px-4 gap-y-4 overflow-y-auto">
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={role}
                                required
                                name="role"
                                disabled={submitting}
                                onValueChange={value => {
                                    setValue('role', value as typeof role);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
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

                        {(
                            <div className="flex flex-col gap-y-2">
                                <Label htmlFor="email" className={cn(showEmailInput ? '' : 'opacity-50')}>Email</Label>
                                {showEmailInput ? (
                                    <>
                                        <Input
                                            placeholder="Email"
                                            type="email"
                                            className={cn(errors.email ? 'border-danger ring-danger focus-visible:ring-danger' : '')}
                                            {...register('email', { 
                                                required: true, 
                                                disabled: submitting, 
                                                pattern: {
                                                    value: validEmailRegex,
                                                    message: "Incorrect email format",
                                                },
                                            })}
                                        />
                                        {errors.email && <span role="alert" className="text-xs text-danger">{errors.email.message}</span>}
                                    </>
                                ) : (
                                    <Input 
                                        disabled
                                        value={email}
                                        onChange={() => {}}
                                        className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                                    />
                                )}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="displayName">Display name</Label>
                            <Input 
                                {...register('displayName', { required: true, disabled: submitting, })}
                                placeholder="Display name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="firstName">First name</Label>
                            <Input 
                                {...register('firstName', { required: false, disabled: submitting, })}
                                placeholder="First name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="lastName">Last name</Label>
                            <Input 
                                {...register('lastName', { required: false, disabled: submitting, })}
                                placeholder="Last name"
                            />
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
                        >
                            Save
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
