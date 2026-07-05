import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import * as actions from '@/app/actions/data-keys';
import { getAuthenticatedUserWithRoles } from "@/app/actions/get-authenticated-user";
import { EntityHistoryButton } from "@/app/(dashboard)/components/entity-history";
import { DataKeyForm } from '../../../components/form';

export const dynamic = 'force-dynamic';

export default async function EditDataKeyPage({ params }: { params: { dataKeyId: string; }; }) {
    const [{ isSuperUser }] = await Promise.all([
        getAuthenticatedUserWithRoles(),
    ]);
    const canManageDataKeys = isSuperUser;

    return (
        <>
            <Title>Data keys</Title>

            <Content>
                <div className="mb-4 flex justify-end">
                    <EntityHistoryButton entityType="data_key" entityId={params.dataKeyId} />
                </div>
                <Card className="mb-20">
                    <CardContent className="p-0">
                        <DataKeyForm
                            {...actions}
                            disabled={!canManageDataKeys}
                        />
                    </CardContent>
                </Card>
            </Content>
        </>
    );
}
