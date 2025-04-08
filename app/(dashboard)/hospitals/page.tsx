import { 
    getHospitals, 
    deleteHospitals, 
    getHospital, 
    saveHospitals, 
} from "@/app/actions/hospitals";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { Card, CardContent } from "@/components/ui/card";
import { HospitalsTable } from "./components/table";

type Props = {
    params: { [key: string]: string; };
    searchParams: { [key: string]: string; };
};

export const dynamic = 'force-dynamic';

export default async function Hospitals({ searchParams: { page } }: Props) {
    const [hospitals] = await Promise.all([
        getHospitals(),
    ]);

    return (
        <>
            <Title>Hospitals</Title>

            <Content>
                {hospitals.errors?.length ? (
                    <Card
                        className="border-danger bg-danger/20 text-center"
                    >
                        <CardContent>
                            <div className="text-danger">{hospitals.errors.join(', ')}</div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <HospitalsTable 
                                hospitals={hospitals}
                                getHospitals={getHospitals}
                                deleteHospitals={deleteHospitals}
                                getHospital={getHospital}
                                saveHospitals={saveHospitals}
                            />
                        </CardContent>
                    </Card>
                )}
            </Content>
        </>
    )
}
