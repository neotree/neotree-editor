import { Title } from "@/components/title";
import { Tabs } from '@/components/tabs';
import MailerSettings from "./components/settings";
import EmailTemplatesAdmin from './components/templates';

type Props = {
    params: { [key: string]: string; };
    searchParams: { [key: string]: string; };
};


export default async function AdminEmailsPage({ searchParams: { tab } }: Props) {
    return (
        <>
            <Title>Emails</Title>

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

            {tab === 'templates' ? <EmailTemplatesAdmin /> : <MailerSettings />}
        </>
    );
}
