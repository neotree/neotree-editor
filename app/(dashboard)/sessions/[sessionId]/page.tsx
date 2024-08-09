import { getSession } from "@/app/actions/sessions";
import { getScript } from "@/app/actions/scripts";
import { Title } from "@/components/title";
import { Alert } from "@/components/alert";

import { SessionForm } from "../components/session-form";

type Props = {
    params: { sessionId: string; },
    searchParams: { [key: string]: string; };
};

export default async function SessionsPage({ params: { sessionId, } }: Props) {
    const [session] = await Promise.all([
        getSession(Number(sessionId)),
    ]);

    const { data: script } = !session?.data?.scriptid ? { data: null } : await getScript({
        scriptId: session?.data?.scriptid,
    })

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

            <SessionForm 
                session={session}
                script={script}
                getSession={getSession}
            />
        </>
    );
}
