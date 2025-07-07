import * as actions from "@/app/actions/users";
import * as rolesActions from "@/app/actions/roles";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/alert";
import { UserForm } from "../../components/form";

type Props = {
    params: Promise<{ uuid: string; }>;
};

export const dynamic = 'force-dynamic';

export default async function EditUserPage({ params }: Props) {
    const { uuid } = await params;

    const [user, roles] = await Promise.all([
        actions.getUser(uuid),
        rolesActions.getRoles(),
    ]);

    if (!user) {
        return (
            <Alert
                title="Not found"
                message="User does not exist!"
                redirectTo="/users"
            />
        );
    }

    return (
        <>
            <Title>Edit user</Title>

            <Content>            
                <Card>
                    <CardContent className="p-0">
                        <div className="flex py-6 px-4">
                            <h1 className="text-2xl">Edit user</h1>
                        </div>

                        <UserForm 
                            {...actions}
                            {...rolesActions}
                            user={user}
                            roles={roles}
                        />
                    </CardContent>
                </Card>
            </Content>
        </>
    )
}
