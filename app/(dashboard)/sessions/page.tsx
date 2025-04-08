import { getSessions } from "@/app/actions/sessions";
import { SessionsTable } from './components/table';
import { Title } from "@/components/title";

type Props = {
    searchParams: { [key: string]: string; };
};

export const dynamic = 'force-dynamic';

export default async function SessionsPage({ searchParams }: Props) {
    const [sessions] = await Promise.all([
        getSessions(searchParams),
    ]);

    return (
        <>
            <Title>Sessions</Title>
            
            <SessionsTable 
                sessions={sessions}
                getSessions={getSessions}
            />
        </>
    );
}
