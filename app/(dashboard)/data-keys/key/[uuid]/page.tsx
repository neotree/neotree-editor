import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import * as actions from '@/app/actions/data-keys';
import { Alert } from "@/components/alert";
import { getAuthenticatedUserWithRoles } from "@/app/actions/get-authenticated-user";
import { DataKeyForm } from '../../components/form';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{
        uuid: string;
    }>;
};

export default async function EditDataKeyPage({ params }: Props) { 
    const { uuid } = await params;

    const [res, { isSuperUser }] = await Promise.all([
        actions.fetchDataKeys(),
        getAuthenticatedUserWithRoles(),
    ]);

    const dataKey = res.data.find(k => k.uuid === uuid);

    if (!dataKey) {
        return (
            <Alert 
                title="Not found"
                message="Data key does not exist!"
                redirectTo="/data-keys"
            />
        );
    }

    return (
        <>
            <Title>Edit data key</Title>

            <Content>
                <Card className="mb-20">                    
                    <CardContent className="p-0">
                        <div className="flex py-6 px-4">
                            <h1 className="text-2xl">Edit data key</h1>
                        </div>

                        <DataKeyForm 
                            {...actions}
                            disabled={!isSuperUser}
                            dataKeys={res.data}
                            dataKey={!dataKey ? undefined : {
                                ...dataKey,
                                children: res.data
                                    .filter(k => {
                                        return (k.parentKeys || [])
                                            .map(k => (k || '').toLowerCase())
                                            .includes(dataKey.name.toLowerCase());
                                    }),
                            }}
                        />
                    </CardContent>
                </Card>
            </Content>
        </>
    );
}
