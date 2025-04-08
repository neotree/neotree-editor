import { _fetch } from '@/lib/fetch';
import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { ScriptsIndexTabs } from '../components/index-tabs';
import { DataKeysTable } from './components/table';

export default async function DataKeysPage() { 
    const res = await _fetch('/api/data-keys');

    return (
        <>
            <Title>Data keys</Title>

            <Content>
                <Card className="mb-20">
                    <ScriptsIndexTabs tab="data-keys" />
                    
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
