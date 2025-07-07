import { Content } from "@/components/content";
import { Title } from "@/components/title";

export const dynamic = 'force-dynamic';

export default function AcountSettings() {
    return (
        <>
            <Title>Account</Title>
            <Content>
                <h1 className="text-3xl">Account settings</h1>
            </Content>
        </>
    )
}
