import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import * as actions from '@/app/actions/data-keys';
import { getAuthenticatedUserWithRoles } from "@/app/actions/get-authenticated-user";
import { DataKeysTable } from '../components/table';

export const dynamic = 'force-dynamic';

export default async function DataKeysPage() { 
    const [{ isSuperUser, isAdmin }] = await Promise.all([
        getAuthenticatedUserWithRoles(),
    ]);
    const canManageDataKeys = isSuperUser || isAdmin;

    return (
        <>
            <Title>Data keys</Title>

            <Content>
                <Card className="mb-20">                    
                    <CardContent className="p-0">
                        <DataKeysTable 
                            {...actions}
                            disabled={!canManageDataKeys}
                        />
                    </CardContent>
                </Card>
            </Content>
        </>
    );
}
