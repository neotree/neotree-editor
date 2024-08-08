import { Title } from "@/components/title";
import { Content } from "./components/content";
import { updateSys } from "@/app/actions/sys";

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
