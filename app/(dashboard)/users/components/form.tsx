'use client';

import { useState } from "react";
import { v4 } from "uuid";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import * as actions from "@/app/actions/users";
import * as rolesActions from "@/app/actions/roles";
import { Button } from "@/components/ui/button";
import { getRoles } from "@/app/actions/roles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { validEmailRegex } from "@/constants/email";
import { useAppContext } from "@/contexts/app";

type Role = Awaited<ReturnType<typeof getRoles>>[0]['name'];

type Props = typeof actions & typeof rolesActions & {
    user?: null | Awaited<ReturnType<typeof actions.getUser>>;
    roles: Awaited<ReturnType<typeof getRoles>>;
};

export function UserForm({ 
    user,
    roles
}: Props) {
    const { alert } = useAlertModal();
    const router = useRouter();
    const { viewOnly } = useAppContext();

    const [loading, setLoading] = useState(false);
    const [showEmailInput, setShowEmailInput] = useState(!user);

    const {
        formState: { errors, },
        watch,
        setValue,
        register,
        handleSubmit,
    } = useForm({
        defaultValues: {
            userId: user?.userId || v4(),
            email: user?.email || '',
            displayName: user?.displayName || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            role: user?.role || 'user' as Role,
            avatar: user?.avatar || '',
            avatar_sm: user?.avatar_sm || '',
            avatar_md: user?.avatar_md || '',
        },
    });

    const onSave = handleSubmit(data => {
        if (viewOnly) return;

        (async () => {
            try {
                setLoading(true);
    
                if (user) {
                    // await updateUsers([{ userId: updateUserId, data }]);

                    // TODO: replace with server action
                    await axios.post('/api/users/update', { data: [{ userId: user.userId, data }], });
                } else {
                    // await createUsers([data]);

                    // TODO: replace with server action
                    await axios.post('/api/users/add', { data: [data], });
                }

                router.refresh();
    
                alert({
                    variant: 'success',
                    message: 'User was saved successfully!',
                    onClose: () => {
                        router.push('/users');
                    },
                });
            } catch(e: any) {
                alert({
                    title: '',
                    message: 'Failed to save user: ' + e.message,
                    variant: 'error',
                });
            } finally {
                setLoading(false);
            }
        })();
    });

    const role = watch('role');
    const email = watch('email');

    return (
        <>
            {loading && <Loader overlay />}

            <div className="flex flex-col py-2 px-4 gap-y-4">
                <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                        value={role}
                        required
                        name="role"
                        disabled={loading || viewOnly}
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
                                        disabled: loading || viewOnly, 
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
                        {...register('displayName', { required: true, disabled: loading || viewOnly, })}
                        placeholder="Display name"
                    />
                </div>

                <div>
                    <Label htmlFor="firstName">First name</Label>
                    <Input 
                        {...register('firstName', { required: false, disabled: loading || viewOnly, })}
                        placeholder="First name"
                    />
                </div>

                <div>
                    <Label htmlFor="lastName">Last name</Label>
                    <Input 
                        {...register('lastName', { required: false, disabled: loading || viewOnly, })}
                        placeholder="Last name"
                    />
                </div>
            </div>

            <div className="border-t border-t-border px-4 py-2 flex justify-end gap-x-2">
                <Button
                    variant="outline"
                    asChild
                >
                    <Link href="/users">
                        Cancel
                    </Link>
                </Button>

                {!viewOnly && (
                    <Button
                        onClick={onSave}
                        disabled={loading || viewOnly}
                    >
                        Save
                    </Button>
                )}
            </div>
        </>
    )
}
