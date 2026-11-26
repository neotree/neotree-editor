import { redirect } from "next/navigation";

import { getCalculationTemplates } from "@/app/actions/calculation-templates";
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { CalculationTemplatesManager } from "./components/manager";

export const dynamic = 'force-dynamic';

export default async function CalculationTemplatesPage() {
    const user = await getAuthenticatedUser();

    if (!user) redirect('/login');

    if (user.role !== 'admin' && user.role !== 'super_user') redirect('/');

    const res = await getCalculationTemplates();

    return (
        <>
            <Title>Calculation Templates</Title>

            <Content>
                <CalculationTemplatesManager
                    initialTemplates={res.templates}
                    loadError={res.success ? null : res.errors?.join(', ') || 'Failed to load templates'}
                />
            </Content>
        </>
    );
}
