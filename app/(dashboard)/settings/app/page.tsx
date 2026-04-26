import { Title } from "@/components/title";
import { Content } from "./components/content";
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import { getChangeLogs } from "@/app/actions/change-logs";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import { getIntegrityPolicyState, INTEGRITY_POLICY_AUDIT_ENTITY_ID } from "@/lib/integrity-policy";
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

    const [integrityAuditRes] = await Promise.all([
        getChangeLogs({
            entityIds: [INTEGRITY_POLICY_AUDIT_ENTITY_ID],
            entityTypes: ["release"],
            limit: 10,
            sortBy: "dateOfChange",
            sortOrder: "desc",
        }),
    ]);
    const integrityPolicyState = getIntegrityPolicyState(editorInfoRes.data);

    return (
        <>
            <Title>App</Title>

            <Content
                canManage
                initialPolicy={integrityPolicyState.policy}
                initialBaseline={integrityPolicyState.baseline}
                recentAuditEntries={integrityAuditRes.data || []}
            />
        </>
    );
}
