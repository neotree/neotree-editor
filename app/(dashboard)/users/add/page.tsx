import * as actions from "@/app/actions/users";
import * as rolesActions from "@/app/actions/roles";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/alert";
import { UserForm } from "../components/form";

export const dynamic = 'force-dynamic';

export default async function AddUserPage() {
    const [roles] = await Promise.all([
        rolesActions.getRoles(),
    ]);

    return (
        <>
            <Title>Add user</Title>

            <Content>            
                <Card>
                    <CardContent className="p-0">
                        <div className="flex py-6 px-4">
                            <h1 className="text-2xl">Add user</h1>
                        </div>

                        <UserForm 
                            {...actions}
                            {...rolesActions}
                            roles={roles}
                        />
                    </CardContent>
                </Card>
            </Content>
        </>
    )
}
