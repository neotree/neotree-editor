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
    params: { [key: string]: string; };
    searchParams: { [key: string]: string; };
};

export const dynamic = 'force-dynamic';

export default async function Users({ searchParams: { page, role, status } }: Props) {
    const [users, roles] = await Promise.all([
        getUsers({ 
            limit: 25,
            page: page ? Number(page) : undefined, 
            roles: role ? [role] : undefined,
            status,
        }),
        getRoles(),
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
