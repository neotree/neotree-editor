import { Title } from "@/components/title";
import { Content } from "./components/content";
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import { getIntegrityPolicyState } from "@/lib/integrity-policy";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AppSettingsPage() {
    const [user, editorInfoRes] = await Promise.all([
        getAuthenticatedUser(),
        _getEditorInfo(),
    ]);

    if (user?.role !== "super_user") {
        redirect("/");
    }

    const integrityPolicyState = getIntegrityPolicyState(editorInfoRes.data);

    return (
        <>
            <Title>App</Title>

            <Content
                canManage
                initialPolicy={integrityPolicyState.policy}
                initialBaseline={integrityPolicyState.baseline}
            />
        </>
    );
}
