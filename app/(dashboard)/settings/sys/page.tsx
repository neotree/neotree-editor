import { Title } from "@/components/title";
import { updateSys } from "@/app/actions/sys";
import { Content } from "./components/content";

export const dynamic = 'force-dynamic';

export default async function SystemSettingsPage() {
    return (
        <>
            <Title>System Settings</Title>

            <Content
                _updateSys={updateSys}
            />
        </>
    );
}
