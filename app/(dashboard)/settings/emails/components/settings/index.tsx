import * as serverActions from '@/app/actions/mailer';
import { MailerContextProvider } from "@/contexts/mailer";
import { Title } from "@/components/title";
import { MailerSettingsTable } from "./table";

export default async function MailerSettings() {
    const [mailerSettings] = await Promise.all([
        serverActions.getMailerSettings(),
    ]);

    return (
        <>
            <Title>Mailer Settings</Title>

            <MailerContextProvider
                {...serverActions}
                mailerSettings={mailerSettings}
            >
                <MailerSettingsTable />
            </MailerContextProvider>
        </>
    );
}
