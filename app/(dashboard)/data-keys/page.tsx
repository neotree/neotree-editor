import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { fetchDataKeys } from '@/app/actions/data-keys';
import { DataKeysTable } from './components/table';

export const dynamic = 'force-dynamic';

export default async function DataKeysPage() { 
    const res = await fetchDataKeys();

    return (
        <>
            <Title>Data keys</Title>

            <Content>
                <Card className="mb-20">                    
                    <CardContent className="p-0">
                        <DataKeysTable 
                            dataKeys={res.data}
                        />
                    </CardContent>
                </Card>
            </Content>
        </>
    );
}
