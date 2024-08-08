import { Title } from "@/components/title";
import { Tabs } from '@/components/tabs';
import MailerSettings from "./components/settings";
import EmailTemplatesSettings from './components/templates';

type Props = {
    params: { [key: string]: string; };
    searchParams: { [key: string]: string; };
};


export default async function EmailsSettingsPage({ searchParams: { tab } }: Props) {
    return (
        <>
            <Title>Emails Settings</Title>

            <Tabs 
                searchParamsKey="tab"
                options={[
                    {
                        value: 'mailer-settings',
                        label: 'Mailer settings',
                    },
                    {
                        value: 'templates',
                        label: 'Email templates',
                    },
                ]}
            />

            {tab === 'templates' ? <EmailTemplatesSettings /> : <MailerSettings />}
        </>
    );
}
