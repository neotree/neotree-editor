import { Title } from "@/components/title";
import { Content } from "./components/content";
import { updateSys } from "@/app/actions/sys";

export default async function AdminSystemPage() {
    return (
        <>
            <Title>System</Title>

            <Content
                _updateSys={updateSys}
            />
        </>
    );
}
