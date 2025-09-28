import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import * as actions from '@/app/actions/data-keys';
import { getAuthenticatedUserWithRoles } from "@/app/actions/get-authenticated-user";
import { DataKeyForm } from '../../components/form';

export const dynamic = 'force-dynamic';

export default async function NewDataKeyPage() { 
    const [{ isSuperUser }] = await Promise.all([
        getAuthenticatedUserWithRoles(),
    ]);

    return (
        <>
            <Title>Data keys</Title>

            <Content>
                <Card className="mb-20">                    
                    <CardContent className="p-0">
                        <DataKeyForm 
                            {...actions}
                            disabled={!isSuperUser}
                        />
                    </CardContent>
                </Card>
            </Content>
        </>
    );
}
