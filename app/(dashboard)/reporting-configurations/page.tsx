import { redirect } from "next/navigation";

import { getMobileAnalyticsSettings } from "@/app/actions/mobile-analytics";
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { ReportingConfigurationsForm } from "./components/form";

export const dynamic = 'force-dynamic';

export default async function ReportingConfigurationsPage() {
    const user = await getAuthenticatedUser();

    if (!user) redirect('/login');

    if (user.role !== 'admin' && user.role !== 'super_user') redirect('/');

    const settings = await getMobileAnalyticsSettings();

    return (
        <>
            <Title>Reporting Configurations</Title>

            <Content>
                <ReportingConfigurationsForm
                    initialConfig={settings.success ? settings.config : null}
                    initialKey={settings.success ? settings.key : null}
                    loadError={settings.success ? null : settings.errors?.join(', ') || 'Failed to load settings'}
                />
            </Content>
        </>
    );
}
