import { 
    getUsers, 
    deleteUsers, 
    getUser, 
    updateUsers, 
    createUsers,
    searchUsers,
    resetUsersPasswords,
} from "@/app/actions/users";
import { getRoles } from "@/app/actions/roles";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { Card, CardContent } from "@/components/ui/card";
import { UsersTable } from "./components/table";

type Props = {
    params: Promise<{ [key: string]: string; }>;
    searchParams: Promise<{
        page?: string;
        role?: string;
        status?: string;
        userId?: string;
    }>;
};

export const dynamic = 'force-dynamic';

export default async function Users({ searchParams }: Props) {
    const { page, role, status, userId } = await searchParams;

    const [users, roles, user] = await Promise.all([
        getUsers({ 
            limit: 25,
            page: page ? Number(page) : undefined, 
            roles: role ? [role] : undefined,
            status,
        }),
        getRoles(),
        !userId ? null : await getUser(userId),
    ]);

    return (
        <>
            <Title>Users</Title>

            <Content>
                {users.error ? (
                    <Card
                        className="border-danger bg-danger/20 text-center"
                    >
                        <CardContent>
                            <div className="text-danger">{users.error}</div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <UsersTable 
                                user={user}
                                users={users}
                                roles={roles}
                                getUsers={getUsers}
                                deleteUsers={deleteUsers}
                                getUser={getUser}
                                updateUsers={updateUsers}
                                createUsers={createUsers}
                                searchUsers={searchUsers}
                                resetUsersPasswords={resetUsersPasswords}
                            />
                        </CardContent>
                    </Card>
                )}
            </Content>
        </>
    )
}
