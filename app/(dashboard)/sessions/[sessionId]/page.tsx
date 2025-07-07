import { getSession } from "@/app/actions/sessions";
import { getScript, getScreens, getDiagnoses } from "@/app/actions/scripts";
import { Title } from "@/components/title";
import { Alert } from "@/components/alert";

import { SessionForm } from "../components/session-form";

type Props = {
    params: { sessionId: string; },
    searchParams: { [key: string]: string; };
};

export const dynamic = 'force-dynamic';

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

    let script: Awaited<ReturnType<typeof getScript>> = { data: null, };
    let screens: Awaited<ReturnType<typeof getScreens>> = { data: [], };
    let diagnoses: Awaited<ReturnType<typeof getDiagnoses>> = { data: [], };

    if (session?.data?.scriptid) {
        const res = await Promise.all([
            getScript({ scriptId: session.data.scriptid, }),
            getScreens({ scriptsIds: [session.data.scriptid], }),
            getDiagnoses({ scriptsIds: [session.data.scriptid], }),
        ]);
        script = res[0];
        screens = res[1];
        diagnoses = res[2];
    }

    return (
        <>
            <Title>Session</Title>

            <SessionForm 
                session={session}
                script={script}
                screens={screens}
                diagnoses={diagnoses}
                getSession={getSession}
            />
        </>
    );
}
