import { getLogs } from "@/app/actions/logs";
import { Title } from "@/components/title";
import { Content } from "./components/content";

export default async function LogsSettingsPage() {
    return (
        <>
            <Title>Logs</Title>

            <Content 
                _getLogs={getLogs}
            />
        </>
    );
}
