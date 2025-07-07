import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { DrugsLibrary } from '../components/drugs-library';

export const dynamic = 'force-dynamic';

export default async function DrugsFluidsAndFeedsPage() { 
    return (
        <>
            <Title>Drugs & Fluids Library</Title>

            <Content>
                <Card className="mb-20">
                    <CardContent className="p-0">
                        <DrugsLibrary />
                    </CardContent>
                </Card>
            </Content>
        </>
    );
}
