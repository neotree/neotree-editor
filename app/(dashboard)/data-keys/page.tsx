import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import * as actions from '@/app/actions/data-keys';
import { getAuthenticatedUserWithRoles } from "@/app/actions/get-authenticated-user";
import { DataKeysTable } from './components/data-keys-table';

export const dynamic = 'force-dynamic';

export default async function DataKeysPage() { 
    const [{ isSuperUser }] = await Promise.all([
        getAuthenticatedUserWithRoles(),
    ]);

    return (
        <>
            <Title>Data keys</Title>

            <Content>
                <Card className="mb-20">                    
                    <CardContent className="p-0">
                        <DataKeysTable 
                            {...actions}
                            disabled={!isSuperUser}
                        />
                    </CardContent>
                </Card>
            </Content>
        </>
    );
}
