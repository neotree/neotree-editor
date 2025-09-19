import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import * as actions from '@/app/actions/data-keys';
import { getAuthenticatedUserWithRoles } from "@/app/actions/get-authenticated-user";
import { DataKeyForm } from '../components/form';

export const dynamic = 'force-dynamic';

export default async function NewDataKeyPage() { 
    const [res, { isSuperUser }] = await Promise.all([
        actions.getDataKeys(),
        getAuthenticatedUserWithRoles(),
    ]);

    return (
        <>
            <Title>New data key</Title>

            <Content>
                <Card className="mb-20">                    
                    <CardContent className="p-0">
                        <div className="flex py-6 px-4">
                            <h1 className="text-2xl">New data key</h1>
                        </div>

                        <DataKeyForm 
                            {...actions}
                            disabled={!isSuperUser}
                            dataKeys={res.data}
                        />
                    </CardContent>
                </Card>
            </Content>
        </>
    );
}
