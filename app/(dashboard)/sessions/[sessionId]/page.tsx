import { getSession } from "@/app/actions/sessions";
import { Title } from "@/components/title";
import { Alert } from "@/components/alert";

import { Container } from "../components/container";
import { Session } from "../components/session";

type Props = {
    params: { sessionId: string; },
    searchParams: { [key: string]: string; };
};

export default async function SessionsPage({ params: { sessionId, } }: Props) {
    const [session] = await Promise.all([
        getSession(Number(sessionId)),
    ]);

    if (!session.data) {
        return (
            <Alert 
                title="Error"
                variant="error"
                message="Failed to load script"
                buttonLabel="Go back to sessions"
                redirectTo="/sessions"
            />
        );
    }

    return (
        <>
            <Title>Session</Title>

            <Session 
                session={session}
                getSession={getSession}
            />
        </>
    );
}
