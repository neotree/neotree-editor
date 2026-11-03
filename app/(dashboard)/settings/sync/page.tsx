import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import { getContentSyncSettingsForEditor } from "@/app/actions/content-sync";
import { Title } from "@/components/title";
import { Content } from "./components/content";

export const dynamic = 'force-dynamic';

export default async function ContentSyncSettingsPage() {
    const user = await getAuthenticatedUser();
    if (user?.role !== "super_user" && user?.role !== "admin") redirect("/");

    const res = await getContentSyncSettingsForEditor();

    return (
        <>
            <Title>Content sync</Title>
            <Content
                initialSettings={res.settings}
                sites={res.sites}
                canManage={res.canManage}
                appUrl={process.env.NEXT_PUBLIC_APP_URL || ''}
            />
        </>
    );
}
