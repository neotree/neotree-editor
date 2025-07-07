'use client';

import { useCallback, useState, useMemo } from "react";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import moment from "moment";
import axios from "axios";

import { 
    getUsers, 
    deleteUsers, 
    getUser, 
    updateUsers, 
    createUsers,
    searchUsers,
    resetUsersPasswords,
} from "@/app/actions/users";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { getRoles } from "@/app/actions/roles";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { Pagination } from "@/components/pagination";
import { Separator } from "@/components/ui/separator";
import { Loader } from "@/components/loader";
import { useSearchParams } from "@/hooks/use-search-params";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAppContext } from "@/contexts/app";
import { UserAction } from "./action";
import { Header } from "./header";
import { BulkEdit } from "./bulk-edit";

type Props = {
    user?: Awaited<ReturnType<typeof getUser>>;
    users: Awaited<ReturnType<typeof getUsers>>;
    roles: Awaited<ReturnType<typeof getRoles>>;
    getUsers: typeof getUsers;
    deleteUsers: typeof deleteUsers;
    getUser: typeof getUser;
    updateUsers: typeof updateUsers;
    createUsers: typeof createUsers;
    searchUsers: typeof searchUsers;
    resetUsersPasswords: typeof resetUsersPasswords;
};

export function UsersTable({ 
    users: initialData, 
    roles, 
    user,
    getUsers: _getUsers, 
    deleteUsers, 
    getUser,
    updateUsers,
    createUsers,
    searchUsers,
    resetUsersPasswords,
}: Props) {
    const searchParams = useSearchParams();
    const { mode } = useAppContext();
    
    const [users, setUsers] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

    const { confirm } = useConfirmModal();

    const getUsers = useCallback(async (
        opts?: {
            page?: number
            roles?: string[];
            status?: string;
        },
        cb?: (error?: string, results?: typeof initialData) => void,
    ) => {
        setLoading(true);

        // const users = await _getUsers({
        //     ...searchParams.parsed,
        //     roles: searchParams.parsed.role ? [searchParams.parsed.role] : undefined,
        //     page: 1,
        //     limit: initialData.limit,
        //     ...opts,
        // });

        // TODO: replace with server action
        const res = await axios.get('/api/users?data=' + JSON.stringify({
            ...searchParams.parsed,
            roles: searchParams.parsed.role ? [searchParams.parsed.role] : undefined,
            page: 1,
            limit: initialData.limit,
            ...opts,
        }));

        const users = res.data as Awaited<ReturnType<typeof _getUsers>>;

        if (users.error) {
            toast.error(users.error);
        } else {
            setUsers(users);
            setSelectedIndexes([]);
        }

        cb?.(users.error, users);

        setLoading(false);
    }, [_getUsers, searchParams, initialData]);

    const onDelete = useCallback((userIds: string[], cb?: () => void) => {
        const names = users.data.filter(u => userIds.includes(u.userId)).map(u => u.displayName);
        confirm(() => {
            (async () => {
                try {
                    setLoading(true);

                    // await deleteUsers(userIds);

                    // TODO: replace with server action
                    await axios.delete('/api/users?data=' + JSON.stringify(userIds));

                    await getUsers();

                    cb?.();
                } catch(e: any) {
                    toast.error(e.message);
                } finally {
                    setLoading(false);
                }
            })();
        }, {
            title: 'Delete ' + (names.length > 1 ? 'users' : 'user'),
            message: `<p>Are you sure you want to delete:</p> ${names.map(n => `<div class="font-bold text-danger">${n}</div>`).join('')}`,
            negativeLabel: 'Cancel',
            positiveLabel: 'Delete',
            danger: true,
        });
    }, [confirm, deleteUsers, getUsers, users]);

    const onResetPasswords = useCallback((usersIds: string[], cb?: () => void) => {
        const names = users.data.filter(u => usersIds.includes(u.userId)).map(u => u.displayName);
        confirm(() => {
            (async () => {
                try {
                    setLoading(true);

                    // await resetUsersPasswords(userIds);

                    // TODO: replace with server action
                    await axios.post('/api/users/reset-passwords', {
                        usersIds,
                    });

                    toast.success('Passwords reset successful!')

                    cb?.();
                } catch(e: any) {
                    toast.error(e.message);
                } finally {
                    setLoading(false);
                }
            })();
        }, {
            title: 'Reset ' + (names.length > 1 ? 'users passwords' : 'user password'),
            message: `<p>Are you sure you want to reset users passwords:</p> ${names.map(n => `<div class="font-bold text-danger">${n}</div>`).join('')}`,
            negativeLabel: 'Cancel',
            positiveLabel: 'Reset',
            danger: true,
        });
    }, [confirm, resetUsersPasswords, users]);

    const disabled = useMemo(() => (mode === 'view'), [mode]);

    const bulkEditForm = (
        <BulkEdit 
            roles={roles}
            open={!!selectedIndexes.length}
            userIds={selectedIndexes.map(i => users.data[i].userId)}
            updateUsers={updateUsers}
            onSaveSuccess={() => getUsers({ page: users.page, })}
            onOpenChange={open => !open && setSelectedIndexes([])}
        />
    );

    return (
        <>
            {loading && <Loader overlay />}

            {bulkEditForm}
            
            <div className="flex flex-col">
                <DataTable
                    title="Users"
                    selectable={!disabled}
                    selectedIndexes={selectedIndexes}
                    onSelect={setSelectedIndexes}
                    search={{
                        inputPlaceholder: 'Search users',
                    }}
                    headerActions={(
                        <Header 
                            users={users}
                            roles={roles}
                            selected={selectedIndexes.map(i => users.data[i].userId)}
                            onDelete={onDelete}
                            getUsers={getUsers}
                            searchUsers={searchUsers}
                        />
                    )}
                    columns={[
                        {
                            name: 'Display name',
                        },
                        {
                            name: 'Email',
                        },
                        {
                            name: 'Role',
                        },
                        {
                            name: 'Last login date',
                        },
                        {
                            name: 'Active',
                            align: 'right',
                            cellRenderer(cell) {
                                const u = users.data[cell.rowIndex];
                                return (
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <CheckCircle className={cn(u.activationDate ? 'text-green-400' : 'text-gray-400', 'w-4 h-4')} />
                                            </TooltipTrigger>
                                            {!!u.activationDate && (
                                                <TooltipContent>
                                                    <p className="text-xs text-muted-foreground">Activation date: {moment(u.activationDate).format('LLL')}</p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            },
                        },
                        {
                            name: 'Action',
                            align: 'right',
                            // thClassName: 'opacity-0',
                            cellRenderer(cell) {
                                const u = users.data[cell.rowIndex];
                                return (
                                    <UserAction 
                                        email={u.email}
                                        userId={u.userId}
                                        userName={u.displayName}
                                        isActivated={!!u.activationDate}
                                        onDelete={() => onDelete([u.userId])}
                                        onResetPasswords={() => onResetPasswords([u.userId])}
                                    />
                                );
                            },
                        },
                    ]}
                    data={users.data.map(u => {
                        return [
                            u.displayName,
                            u.email,
                            roles.filter(r => r.name === u.role)[0]?.description || u.role,
                            u.lastLoginDate ? moment(u.lastLoginDate).format('LLL') : '',
                            '',
                        ];
                    })}
                />

                <Separator />

                <div className="p-2">
                    <Pagination
                        currentPage={users.page}
                        totalPages={users.totalPages}
                        disabled={loading}
                        limit={users.limit || users.totalRows}
                        totalRows={users.totalRows}
                        collectionName="users"
                        onPaginate={page => getUsers({ page }, (e, rslts) => !e && searchParams.push({ page: rslts?.page || users.page, }))}
                        hideControls={false}
                        hideSummary={false}
                    />
                </div>
            </div>
        </>
    )
}
