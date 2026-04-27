import { Title } from "@/components/title";
import { Content } from "./components/content";
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import { getIntegrityPolicyState } from "@/lib/integrity-policy";
import { redirect } from "next/navigation";
import db from "@/databases/pg/drizzle";
import { adminAuditLogs, users } from "@/databases/pg/schema";
import { desc, eq, inArray } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function DataKeyIntegrityPolicySettingsPage() {
    const [user, editorInfoRes] = await Promise.all([
        getAuthenticatedUser(),
        _getEditorInfo(),
    ]);

    if (user?.role !== "super_user") {
        redirect("/");
    }

    const integrityPolicyState = getIntegrityPolicyState(editorInfoRes.data);
    const baselineCapturedByUserId = integrityPolicyState.baseline.capturedByUserId;

    const [baselineCapturedByUser, auditRows] = await Promise.all([
        baselineCapturedByUserId
            ? db.query.users.findFirst({
                where: eq(users.userId, baselineCapturedByUserId),
                columns: {
                    userId: true,
                    displayName: true,
                    email: true,
                },
            })
            : Promise.resolve(null),
        db.query.adminAuditLogs.findMany({
            where: eq(adminAuditLogs.area, "integrity_policy"),
            orderBy: desc(adminAuditLogs.createdAt),
            limit: 100,
        }),
    ]);

    const actorIds = Array.from(new Set(auditRows.map((row) => row.actorUserId).filter(Boolean))) as string[];
    const auditActors = actorIds.length
        ? await db.query.users.findMany({
            where: inArray(users.userId, actorIds),
            columns: {
                userId: true,
                displayName: true,
                email: true,
            },
        })
        : [];
    const auditActorsById = new Map(auditActors.map((actor) => [actor.userId, actor]));
    const auditEntries = auditRows.map((row) => ({
        action: row.action,
        createdAt: row.createdAt?.toISOString?.() || `${row.createdAt}`,
        actor: row.actorUserId ? auditActorsById.get(row.actorUserId) || null : null,
        metadata: row.metadata || {},
    }));

    return (
        <>
            <Title>Data Key Integrity Policy</Title>

            <Content
                canManage
                initialPolicy={integrityPolicyState.policy}
                initialBaseline={integrityPolicyState.baseline}
                baselineCapturedBy={baselineCapturedByUser ? {
                    displayName: baselineCapturedByUser.displayName,
                    email: baselineCapturedByUser.email,
                } : null}
                currentUser={user ? {
                    displayName: user.displayName,
                    email: user.email,
                } : null}
                auditEntries={auditEntries}
            />
        </>
    );
}
