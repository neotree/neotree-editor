import { Content } from "../components/content";

export const dynamic = 'force-dynamic';

export default async function OpsScreensPage() {
    return (
        <>
            <Content 
                dataType="screens"
            />
        </>
    );
}
