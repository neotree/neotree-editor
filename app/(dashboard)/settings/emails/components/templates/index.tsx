import * as serverActions from '@/app/actions/email-templates';
import { EmailTemplatesContextProvider } from "@/contexts/email-templates";
import { Title } from "@/components/title";
import { EmailTemplatesTable } from "./table";

export default async function EmailTemplatesSettings() {
    const [emailTemplates] = await Promise.all([
        serverActions.getEmailTemplates(),
    ]);

    return (
        <>
            <Title>Email Templates Settings</Title>

            <EmailTemplatesContextProvider
                {...serverActions}
                emailTemplates={emailTemplates}
            >
                <EmailTemplatesTable />
            </EmailTemplatesContextProvider>
        </>
    );
}
