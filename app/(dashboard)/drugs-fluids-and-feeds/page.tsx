import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { DrugsLibrary } from '../components/drugs-library';
import { getLockStatus } from "@/app/actions/locks";

export const dynamic = 'force-dynamic';

export default async function DrugsFluidsAndFeedsPage() { 
     const [locked] = await Promise.all([ 
        getLockStatus({script:'',lockType:'drug_library'})
    ]);
    
    return (
        <>
            <Title>Drugs & Fluids Library</Title>

            <Content>
                <Card className="mb-20">
                    <CardContent className="p-0">
                        <DrugsLibrary
                        locked={locked}
                        />
                    </CardContent>
                </Card>
            </Content>
        </>
    );
}
