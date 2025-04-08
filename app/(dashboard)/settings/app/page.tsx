import { Title } from "@/components/title";
import { Content } from "./components/content";

export const dynamic = 'force-dynamic';

export default async function AppSettingsPage() {
    return (
        <>
            <Title>App</Title>

            <Content />
        </>
    );
}
