import { 
    getHospitals, 
    deleteHospitals, 
    getHospital, 
    updateHospitals, 
    createHospitals,
    searchHospitals,
} from "@/app/actions/hospitals";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { Card, CardContent } from "@/components/ui/card";
import { HospitalsTable } from "./components/table";

type Props = {
    params: { [key: string]: string; };
    searchParams: { [key: string]: string; };
};

export default async function Hospitals({ searchParams: { page } }: Props) {
    const [hospitals] = await Promise.all([
        getHospitals({ 
            limit: 25,
            page: page ? Number(page) : undefined,
        }),
    ]);

    return (
        <>
            <Title>Hospitals</Title>

            <Content>
                {hospitals.error ? (
                    <Card
                        className="border-danger bg-danger/20 text-center"
                    >
                        <CardContent>
                            <div className="text-danger">{hospitals.error}</div>
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
                                updateHospitals={updateHospitals}
                                createHospitals={createHospitals}
                                searchHospitals={searchHospitals}
                            />
                        </CardContent>
                    </Card>
                )}
            </Content>
        </>
    )
}
