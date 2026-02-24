'use client';

import { useState } from "react";
import { Plus } from 'lucide-react';
import Link from "next/link";

import { getUsers, searchUsers } from "@/app/actions/users";
import { getRoles } from "@/app/actions/roles";
import { useSearchParams } from "@/hooks/use-search-params";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Props = {
    users: Awaited<ReturnType<typeof getUsers>>;
    roles: Awaited<ReturnType<typeof getRoles>>;
    disabled?: boolean;
    selected: string[];
    onDelete: (ids: string[], cb?: () => void) => void;
    searchUsers: typeof searchUsers;
    getUsers: (
        filters: Partial<Parameters<typeof getUsers>[0]>,
        cb?: (error?: string, results?: Awaited<ReturnType<typeof getUsers>>) => void,
    ) => void;
};

const statuses = [
    { value: 'active', label: 'Active', },
    { value: 'inactive', label: 'Inactive', },
];

export function Header({ 
    selected, 
    roles, 
    disabled,
    getUsers, 
    onDelete, 
    searchUsers, 
}: Props) {
    const searchParams = useSearchParams();

    const [role, setRole] = useState(searchParams.parsed.role || 'all');
    const [status, setStatus] = useState(searchParams.parsed.status || 'all');

    return (
        <>
            <div>
                <Select
                    value={status}
                    onValueChange={value => {
                        const status = value === 'all' ? undefined : value;
                        setStatus(value);
                        getUsers(
                            { status },
                            e => !e && searchParams.push({ status })
                        );
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectLabel>User status</SelectLabel>
                        <SelectItem value="all">All statuses</SelectItem>
                        {statuses.map(s => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Select
                    value={role}
                    onValueChange={value => {
                        const roles = value === 'all' ? [] : [value];
                        setRole(value);
                        getUsers(
                            { roles },
                            e => !e && searchParams.push({ role: roles[0], }),
                        );
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectLabel>User roles</SelectLabel>
                        <SelectItem value="all">All roles</SelectItem>
                        {roles.map(role => (
                            <SelectItem key={role.name} value={role.name}>
                                {role.description}
                            </SelectItem>
                        ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {!disabled && (
                <div>
                    <Button
                        variant="outline"
                        className="w-auto h-auto border-primary text-primary"
                        asChild
                    >
                        <Link href="/users/add">
                            <Plus className="w-4 h-4 mr-1" />
                            New User
                        </Link>
                    </Button>
                </div>
            )}
        </>
    );
}
