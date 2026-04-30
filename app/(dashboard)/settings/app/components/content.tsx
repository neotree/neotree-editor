'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
    captureIntegrityPolicyBaseline,
    clearIntegrityPolicyBaseline,
    saveIntegrityPolicySettings,
} from "@/app/actions/integrity-policy";
import {
    acceptIntegrityImportSnapshot,
    revokeIntegrityImportSnapshot,
} from "@/app/actions/integrity-imports";
import { Loader } from "@/components/loader";
import { Modal } from "@/components/modal";
import { Pagination } from "@/components/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import {
    isIntegrityBaselineCompatible,
    type IntegrityBaseline,
    type IntegrityPolicy,
} from "@/lib/integrity-policy";

type Props = {
    canManagePolicy: boolean;
    canManageImports: boolean;
    initialPolicy: IntegrityPolicy;
    initialBaseline: IntegrityBaseline;
    baselineCapturedBy?: {
        displayName: string;
        email: string;
    } | null;
    currentUser?: {
        displayName: string;
        email: string;
    } | null;
    auditEntries?: Array<{
        action: string;
        createdAt: string;
        actor: {
            displayName: string;
            email: string;
        } | null;
        metadata?: Record<string, any>;
    }>;
    importSnapshots?: Array<{
        snapshotId: string;
        status: string;
        sourceType: string;
        sourceLabel: string | null;
        totalBlockingIssues: number;
        totalScripts: number;
        importedScriptIds: string[];
        importedDataKeyIds: string[];
        createdAt: string;
        acceptedAt: string | null;
        createdBy: {
            displayName: string;
            email: string;
        } | null;
        acceptedBy: {
            displayName: string;
            email: string;
        } | null;
        metadata: Record<string, any>;
    }>;
};

const enforcementOptions: Array<{ value: IntegrityPolicy["enforcementMode"]; label: string; description: string }> = [
    {
        value: "off",
        label: "Off",
        description: "Do not run publish integrity enforcement.",
    },
    {
        value: "warn_only",
        label: "Warn only",
        description: "Run scans, show warnings, but never block publish.",
    },
    {
        value: "block_new_issues_only",
        label: "Block new issues only",
        description: "Allow known baseline issues, but block newly introduced blocking issues.",
    },
    {
        value: "block_all_issues",
        label: "Block all issues",
        description: "Block publish whenever blocking integrity issues are found in scope.",
    },
];

const scanScopeOptions: Array<{ value: IntegrityPolicy["scanScope"]; label: string; description: string }> = [
    {
        value: "affected_scripts_only",
        label: "Affected scripts only",
        description: "Limit publish validation to scripts affected by the current publish scope.",
    },
    {
        value: "full_scope",
        label: "Full scope",
        description: "Scan the full publish scope instead of only affected scripts.",
    },
];

function formatDate(value?: string | null) {
    if (!value) return "Not captured";
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

function arePoliciesEqual(a: IntegrityPolicy, b: IntegrityPolicy) {
    return (
        a.enforcementMode === b.enforcementMode &&
        a.scanScope === b.scanScope &&
        a.useBaseline === b.useBaseline &&
        a.triggerSources.scriptEdits === b.triggerSources.scriptEdits &&
        a.triggerSources.dataKeyLibraryEdits === b.triggerSources.dataKeyLibraryEdits &&
        a.triggerSources.deletions === b.triggerSources.deletions &&
        a.triggerSources.imports === b.triggerSources.imports
    );
}

function formatAuditAction(action: string) {
    switch (action) {
        case "policy_updated":
            return "Policy updated";
        case "baseline_captured":
            return "Baseline captured";
        case "baseline_cleared":
            return "Baseline cleared";
        default:
            return action.replaceAll("_", " ");
    }
}

export function Content({ canManagePolicy, canManageImports, initialPolicy, initialBaseline, baselineCapturedBy, currentUser, auditEntries = [], importSnapshots = [] }: Props) {
    const router = useRouter();
    const { alert } = useAlertModal();
    const { confirm } = useConfirmModal();

    const [loading, setLoading] = useState(false);
    const [policy, setPolicy] = useState<IntegrityPolicy>(initialPolicy);
    const [savedPolicy, setSavedPolicy] = useState<IntegrityPolicy>(initialPolicy);
    const [baseline, setBaseline] = useState<IntegrityBaseline>(initialBaseline);
    const [baselineCapturedByState, setBaselineCapturedByState] = useState(baselineCapturedBy);
    const [auditEntriesState, setAuditEntriesState] = useState(auditEntries);
    const [importSnapshotsState, setImportSnapshotsState] = useState(importSnapshots);
    const [selectedImportSnapshotId, setSelectedImportSnapshotId] = useState<string | null>(null);
    const [auditPage, setAuditPage] = useState(1);
    const [importReviewPage, setImportReviewPage] = useState(1);
    const auditPageSize = 10;
    const importReviewPageSize = 10;
    const maxAuditEntries = 100;
    const hasCapturedBaseline = baseline.fingerprints.length > 0;
    const hasCompatibleBaseline = isIntegrityBaselineCompatible(baseline);
    const enabledTriggerCount = [
        policy.triggerSources.scriptEdits,
        policy.triggerSources.dataKeyLibraryEdits,
        policy.triggerSources.deletions,
        policy.triggerSources.imports,
    ].filter(Boolean).length;
    const enforcementDisabled = policy.enforcementMode === "off";
    const hasActiveTriggers = enabledTriggerCount > 0;
    const scanConfigurationInactive = enforcementDisabled || !hasActiveTriggers;
    const baselineModeActive = policy.enforcementMode === "block_new_issues_only";
    const enablingEnforcementFromOff = savedPolicy.enforcementMode === "off" && policy.enforcementMode !== "off";

    const isDirty = useMemo(() => !arePoliciesEqual(policy, savedPolicy), [policy, savedPolicy]);
    const selectedEnforcementOption = enforcementOptions.find((option) => option.value === policy.enforcementMode);
    const selectedScanScopeOption = scanScopeOptions.find((option) => option.value === policy.scanScope);
    const totalAuditPages = Math.max(1, Math.ceil(auditEntriesState.length / auditPageSize));
    const visibleAuditEntries = useMemo(
        () => auditEntriesState.slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize),
        [auditEntriesState, auditPage]
    );
    const totalImportReviewPages = Math.max(1, Math.ceil(importSnapshotsState.length / importReviewPageSize));
    const visibleImportSnapshots = useMemo(
        () => importSnapshotsState.slice((importReviewPage - 1) * importReviewPageSize, importReviewPage * importReviewPageSize),
        [importSnapshotsState, importReviewPage]
    );
    const selectedImportSnapshot = useMemo(
        () => importSnapshotsState.find((snapshot) => snapshot.snapshotId === selectedImportSnapshotId) || null,
        [importSnapshotsState, selectedImportSnapshotId]
    );

    useEffect(() => {
        if (auditPage > totalAuditPages) setAuditPage(totalAuditPages);
    }, [auditPage, totalAuditPages]);

    useEffect(() => {
        if (importReviewPage > totalImportReviewPages) setImportReviewPage(totalImportReviewPages);
    }, [importReviewPage, totalImportReviewPages]);

    const savePolicy = async () => {
        try {
            setLoading(true);
            const res = await saveIntegrityPolicySettings(policy);
            if (!res.success || !res.data) {
                throw new Error(res.errors?.join(", ") || "Failed to save integrity policy");
            }

            setPolicy(res.data.policy);
            setSavedPolicy(res.data.policy);
            setBaseline(res.data.baseline);
            if (res.data.autoCapturedBaseline) {
                setBaselineCapturedByState(currentUser || baselineCapturedBy || null);
            }
            setAuditPage(1);
            setAuditEntriesState((current) => [
                ...(res.data.autoCapturedBaseline ? [{
                    action: "baseline_captured",
                    createdAt: new Date().toISOString(),
                    actor: currentUser || null,
                    metadata: {
                        totalBlockingIssues: res.data.baseline.totalBlockingIssues,
                        totalScripts: res.data.baseline.totalScripts,
                        automatic: true,
                        reason: "auto_enablement_capture",
                    },
                }] : []),
                {
                    action: "policy_updated",
                    createdAt: new Date().toISOString(),
                    actor: currentUser || null,
                    metadata: {},
                },
                ...current,
            ].slice(0, maxAuditEntries));
            alert({
                title: "Integrity policy updated",
                message: res.data.autoCapturedBaseline
                    ? "Publish integrity settings were saved successfully, and a fresh baseline was captured automatically."
                    : "Publish integrity settings were saved successfully.",
                variant: "success",
            });
        } catch (e: any) {
            alert({
                title: "Failed to save integrity policy",
                message: e.message,
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const captureBaseline = async () => {
        try {
            setLoading(true);
            const res = await captureIntegrityPolicyBaseline();
            if (!res.success || !res.data) {
                throw new Error(res.errors?.join(", ") || "Failed to capture integrity baseline");
            }

            setPolicy(res.data.policy);
            setBaseline(res.data.baseline);
            setBaselineCapturedByState(currentUser || baselineCapturedBy || null);
            setAuditPage(1);
            setAuditEntriesState((current) => [{
                action: "baseline_captured",
                createdAt: new Date().toISOString(),
                actor: currentUser || null,
                metadata: {
                    totalBlockingIssues: res.data.baseline.totalBlockingIssues,
                    totalScripts: res.data.baseline.totalScripts,
                },
            }, ...current].slice(0, maxAuditEntries));
            alert({
                title: "Baseline captured",
                message: `Captured ${res.data.baseline.totalBlockingIssues} blocking issue${res.data.baseline.totalBlockingIssues === 1 ? "" : "s"} across ${res.data.baseline.totalScripts} script${res.data.baseline.totalScripts === 1 ? "" : "s"}.`,
                variant: "success",
            });
        } catch (e: any) {
            alert({
                title: "Failed to capture baseline",
                message: e.message,
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const clearBaseline = async () => {
        try {
            setLoading(true);
            const res = await clearIntegrityPolicyBaseline();
            if (!res.success || !res.data) {
                throw new Error(res.errors?.join(", ") || "Failed to clear integrity baseline");
            }

            setPolicy(res.data.policy);
            setBaseline(res.data.baseline);
            setBaselineCapturedByState(null);
            setAuditPage(1);
            setAuditEntriesState((current) => [{
                action: "baseline_cleared",
                createdAt: new Date().toISOString(),
                actor: currentUser || null,
                metadata: {},
            }, ...current].slice(0, maxAuditEntries));
            alert({
                title: "Baseline cleared",
                message: "The integrity baseline has been cleared.",
                variant: "success",
            });
        } catch (e: any) {
            alert({
                title: "Failed to clear baseline",
                message: e.message,
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const acceptImportSnapshot = async (snapshotId: string, scriptIds?: string[]) => {
        try {
            setLoading(true);
            const res = await acceptIntegrityImportSnapshot(scriptIds?.length ? { snapshotId, scriptIds } : snapshotId);
            if (!res.success) {
                throw new Error(res.errors?.join(", ") || "Failed to accept import issues");
            }

            alert({
                title: scriptIds?.length ? "Imported script issues accepted" : "Imported issues accepted",
                message: scriptIds?.length
                    ? "Selected imported script issues were accepted separately from the global baseline."
                    : "Imported issues were accepted separately from the global baseline.",
                variant: "success",
                onClose: () => router.refresh(),
            });
        } catch (e: any) {
            alert({
                title: "Failed to accept imported issues",
                message: e.message,
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const revokeImportSnapshot = async (snapshotId: string) => {
        try {
            setLoading(true);
            const res = await revokeIntegrityImportSnapshot(snapshotId);
            if (!res.success) {
                throw new Error(res.errors?.join(", ") || "Failed to revoke accepted import issues");
            }

            alert({
                title: "Accepted import issues revoked",
                message: "The accepted import snapshot has been revoked. These issues will be evaluated normally again.",
                variant: "success",
                onClose: () => router.refresh(),
            });
        } catch (e: any) {
            alert({
                title: "Failed to revoke accepted import issues",
                message: e.message,
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <Loader overlay />}

            <div className="space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Data key integrity policy</CardTitle>
                        <CardDescription>
                            Control when publish integrity scans run and how strictly they are enforced. Only super admins can change these settings.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {!canManagePolicy && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                You can view the current integrity policy, but only super admins can change policy settings and baseline snapshots.
                            </div>
                        )}

                        <div className="rounded-md border p-4">
                            <div className="font-medium">Effective behavior</div>
                            <div className="mt-2 text-sm text-muted-foreground">
                                {enforcementDisabled
                                    ? "Integrity enforcement is currently off. Trigger sources and scan scope are saved, but they do not apply until enforcement is enabled again."
                                    : !hasActiveTriggers
                                        ? "No trigger sources are enabled. In this state, integrity enforcement is configured but will never run."
                                        : baselineModeActive
                                            ? `Integrity enforcement is active in block new issues only mode. ${enabledTriggerCount} trigger source${enabledTriggerCount === 1 ? "" : "s"} ${enabledTriggerCount === 1 ? "is" : "are"} enabled and the captured baseline will be used when compatible.`
                                            : `Integrity enforcement is active in ${policy.enforcementMode.replaceAll("_", " ")} mode with ${enabledTriggerCount} trigger source${enabledTriggerCount === 1 ? "" : "s"} enabled.`}
                            </div>
                        </div>

                        {!enforcementDisabled && !hasActiveTriggers && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                All trigger sources are off. This policy will not run any integrity scans until at least one trigger source is enabled.
                            </div>
                        )}

                        {enablingEnforcementFromOff && (
                            <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                                <div className="font-medium">Fresh baseline will be captured automatically</div>
                                <div className="mt-1">
                                    Saving this policy will automatically capture a new published baseline first, then re-enable integrity scanning with that baseline in place.
                                </div>
                            </div>
                        )}

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Enforcement mode</Label>
                                <Select
                                    value={policy.enforcementMode}
                                    disabled={!canManagePolicy || loading}
                                    onValueChange={(value) => setPolicy((current) => ({
                                        ...current,
                                        enforcementMode: value as IntegrityPolicy["enforcementMode"],
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select enforcement mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {enforcementOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="text-sm text-muted-foreground">
                                    {selectedEnforcementOption?.description}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Scan scope</Label>
                                <Select
                                    value={policy.scanScope}
                                    disabled={!canManagePolicy || loading || scanConfigurationInactive}
                                    onValueChange={(value) => setPolicy((current) => ({
                                        ...current,
                                        scanScope: value as IntegrityPolicy["scanScope"],
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select scan scope" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {scanScopeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="text-sm text-muted-foreground">
                                    {selectedScanScopeOption?.description}
                                </div>
                                {scanConfigurationInactive && (
                                    <div className="text-xs text-muted-foreground">
                                        {enforcementDisabled
                                            ? "Scan scope is inactive while enforcement mode is Off."
                                            : "Scan scope is inactive until at least one trigger source is enabled."}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm font-medium">Trigger sources</div>

                            <div className="flex items-start gap-3 rounded-md border p-3">
                                <Switch
                                    id="integrity-trigger-script-edits"
                                    checked={policy.triggerSources.scriptEdits}
                                    disabled={!canManagePolicy || loading || enforcementDisabled}
                                    onCheckedChange={(checked) => setPolicy((current) => ({
                                        ...current,
                                        triggerSources: {
                                            ...current.triggerSources,
                                            scriptEdits: checked,
                                        },
                                    }))}
                                />
                                <div>
                                    <Label htmlFor="integrity-trigger-script-edits">Script edits</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Run integrity checks when scripts, screens, diagnoses, or problems are changed.
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-md border p-3">
                                <Switch
                                    id="integrity-trigger-datakey-edits"
                                    checked={policy.triggerSources.dataKeyLibraryEdits}
                                    disabled={!canManagePolicy || loading || enforcementDisabled}
                                    onCheckedChange={(checked) => setPolicy((current) => ({
                                        ...current,
                                        triggerSources: {
                                            ...current.triggerSources,
                                            dataKeyLibraryEdits: checked,
                                        },
                                    }))}
                                />
                                <div>
                                    <Label htmlFor="integrity-trigger-datakey-edits">Data key library edits</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Run integrity checks when existing data keys are edited in the library.
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Turning this off disables integrity enforcement from data key library edits, but data key changes still propagate to linked usages.
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        If someone later edits an affected script directly, that script counts as a normal script edit and will still be scanned when Script edits is enabled.
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-md border p-3">
                                <Switch
                                    id="integrity-trigger-deletions"
                                    checked={policy.triggerSources.deletions}
                                    disabled={!canManagePolicy || loading || enforcementDisabled}
                                    onCheckedChange={(checked) => setPolicy((current) => ({
                                        ...current,
                                        triggerSources: {
                                            ...current.triggerSources,
                                            deletions: checked,
                                        },
                                    }))}
                                />
                                <div>
                                    <Label htmlFor="integrity-trigger-deletions">Deletions</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Run integrity checks when linked entities are queued for deletion.
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-md border p-3">
                                <Switch
                                    id="integrity-trigger-imports"
                                    checked={policy.triggerSources.imports}
                                    disabled={!canManagePolicy || loading || enforcementDisabled}
                                    onCheckedChange={(checked) => setPolicy((current) => ({
                                        ...current,
                                        triggerSources: {
                                            ...current.triggerSources,
                                            imports: checked,
                                        },
                                    }))}
                                />
                                <div>
                                    <Label htmlFor="integrity-trigger-imports">Imports</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Run integrity checks for imported scripts and imported downstream changes before they can be published.
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Imported legacy debt is tracked separately from the global baseline. Accepted import snapshots allow known imported issues without silently merging them into the platform baseline.
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Import reviews are always enforced against the affected imported script set, so unrelated scripts do not block an accepted import publish.
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-md border p-3">
                                <div className="font-medium">Baseline behaviour</div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    {baselineModeActive
                                        ? 'This mode always uses the captured baseline. Existing baseline issues are allowed, and only newly introduced blocking issues will stop publish.'
                                        : 'The captured baseline is only applied in "block new issues only" mode.'}
                                </div>
                                {!baselineModeActive && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        You can still capture or clear the baseline now for future use, but it will not affect publish behavior until &quot;Block new issues only&quot; is selected.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                disabled={!canManagePolicy || loading || !isDirty}
                                onClick={() => confirm(savePolicy, {
                                    title: "Save integrity policy",
                                    message: enablingEnforcementFromOff
                                        ? "These settings will affect publish validation for all users. A fresh published baseline will be captured automatically before integrity scanning is turned back on."
                                        : "These settings will affect publish validation for all users.",
                                    danger: true,
                                    positiveLabel: "Save policy",
                                })}
                            >
                                Save policy
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Legacy baseline</CardTitle>
                        <CardDescription>
                            Capture the current set of blocking integrity issues so &quot;block new issues only&quot; can allow existing legacy debt without allowing new regressions.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-md border p-4">
                                <div className="text-sm text-muted-foreground">Captured at</div>
                                <div className="mt-1 font-medium">{formatDate(baseline.capturedAt)}</div>
                            </div>
                            <div className="rounded-md border p-4">
                                <div className="text-sm text-muted-foreground">Blocking issues</div>
                                <div className="mt-1 font-medium">{baseline.totalBlockingIssues}</div>
                            </div>
                            <div className="rounded-md border p-4">
                                <div className="text-sm text-muted-foreground">Scripts in baseline</div>
                                <div className="mt-1 font-medium">{baseline.totalScripts}</div>
                            </div>
                            <div className="rounded-md border p-4">
                                <div className="text-sm text-muted-foreground">Captured by user</div>
                                <div className="mt-1 font-medium">
                                    {baselineCapturedByState?.displayName || baselineCapturedByState?.email || baseline.capturedByUserId || "Unknown"}
                                </div>
                                {!!baselineCapturedByState?.email && (
                                    <div className="text-xs text-muted-foreground">{baselineCapturedByState.email}</div>
                                )}
                            </div>
                        </div>

                        {policy.enforcementMode === "block_new_issues_only" && !hasCapturedBaseline && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                No baseline has been captured yet. In this state, &quot;block new issues only&quot; will behave as warn-only until a baseline is captured.
                            </div>
                        )}

                        {policy.enforcementMode === "block_new_issues_only" && hasCapturedBaseline && !hasCompatibleBaseline && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                The captured baseline is outdated for the current integrity rule set. &quot;Block new issues only&quot; will behave as warn-only until a new baseline is captured.
                            </div>
                        )}

                        <div className="flex flex-wrap justify-end gap-3">
                            <Button
                                variant="outline"
                                disabled={!canManagePolicy || loading || !hasCapturedBaseline}
                                onClick={() => confirm(clearBaseline, {
                                    title: "Clear integrity baseline",
                                    message: "This will remove the captured legacy baseline. Future publishes in \"block new issues only\" mode will fall back to warn-only until a new baseline is captured.",
                                    danger: true,
                                    positiveLabel: "Clear baseline",
                                })}
                            >
                                Clear baseline
                            </Button>

                            <Button
                                disabled={!canManagePolicy || loading}
                                onClick={() => confirm(captureBaseline, {
                                    title: "Capture integrity baseline",
                                    message: "This will capture the current global set of blocking integrity issues and treat them as known legacy debt for \"block new issues only\" mode.",
                                    danger: true,
                                    positiveLabel: "Capture baseline",
                                })}
                            >
                                Capture current baseline
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Import integrity reviews</CardTitle>
                        <CardDescription>
                            Review, accept, and revoke imported integrity debt separately from the global legacy baseline.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {!importSnapshotsState.length ? (
                            <div className="text-sm text-muted-foreground">No import integrity snapshots yet.</div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {importSnapshotsState.length ? ((importReviewPage - 1) * importReviewPageSize) + 1 : 0}-{Math.min(importReviewPage * importReviewPageSize, importSnapshotsState.length)} of {importSnapshotsState.length} import snapshot entries
                                </div>

                                <div className="space-y-3">
                                    {visibleImportSnapshots.map((snapshot) => {
                                        const reviewDetails = snapshot.metadata?.reviewDetails as {
                                            scripts?: Array<{
                                                scriptId: string;
                                                scriptTitle: string;
                                                totalIssues: number;
                                                registryHref: string;
                                                scriptHref: string;
                                            }>;
                                        } | undefined;
                                        const acceptedScriptIds = Array.isArray(snapshot.metadata?.acceptedScriptIds)
                                            ? snapshot.metadata.acceptedScriptIds.filter((value: unknown): value is string => typeof value === "string" && !!value)
                                            : [];

                                        return (
                                            <div key={snapshot.snapshotId} className="rounded-md border p-4">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <div className="font-medium">{snapshot.sourceLabel || "Imported content"}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {snapshot.status.replaceAll("_", " ")} | {snapshot.totalBlockingIssues} blocking issue{snapshot.totalBlockingIssues === 1 ? "" : "s"} across {snapshot.totalScripts} script{snapshot.totalScripts === 1 ? "" : "s"}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Created {formatDate(snapshot.createdAt)} by {snapshot.createdBy?.displayName || snapshot.createdBy?.email || "Unknown user"}
                                                        </div>
                                                        {!!snapshot.acceptedAt && (
                                                            <div className="text-xs text-muted-foreground">
                                                                Accepted {formatDate(snapshot.acceptedAt)} by {snapshot.acceptedBy?.displayName || snapshot.acceptedBy?.email || "Unknown user"}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            variant="outline"
                                                            disabled={loading}
                                                            onClick={() => setSelectedImportSnapshotId(snapshot.snapshotId)}
                                                        >
                                                            View details
                                                        </Button>
                                                        {snapshot.status === "pending_review" && (
                                                            <Button
                                                                disabled={!canManageImports || loading}
                                                                onClick={() => confirm(() => acceptImportSnapshot(snapshot.snapshotId), {
                                                                    title: "Accept imported issues",
                                                                    message: "This will allow the imported issues in this snapshot without merging them into the global baseline.",
                                                                    danger: true,
                                                                    positiveLabel: "Accept imported issues",
                                                                })}
                                                            >
                                                                Accept all
                                                            </Button>
                                                        )}
                                                        {snapshot.status === "accepted" && (
                                                            <Button
                                                                variant="outline"
                                                                disabled={!canManageImports || loading}
                                                                onClick={() => confirm(() => revokeImportSnapshot(snapshot.snapshotId), {
                                                                    title: "Revoke accepted import issues",
                                                                    message: "This will remove the accepted import snapshot from publish allowances.",
                                                                    danger: true,
                                                                    positiveLabel: "Revoke acceptance",
                                                                })}
                                                            >
                                                                Revoke
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {!!acceptedScriptIds.length && snapshot.status === "pending_review" && (
                                                    <div className="mt-3 text-xs text-muted-foreground">
                                                        Already accepted scripts: {acceptedScriptIds.length}
                                                    </div>
                                                )}

                                                {!!reviewDetails?.scripts?.length && (
                                                    <div className="mt-4 space-y-3">
                                                        {reviewDetails.scripts.map((script) => {
                                                            const scriptAccepted = acceptedScriptIds.includes(script.scriptId);
                                                            return (
                                                                <div key={`${snapshot.snapshotId}-${script.scriptId}`} className="rounded-md border p-3">
                                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                                        <div>
                                                                            <div className="font-medium">{script.scriptTitle}</div>
                                                                            <div className="text-sm text-muted-foreground">
                                                                                {script.totalIssues} blocking issue{script.totalIssues === 1 ? "" : "s"}
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex flex-wrap gap-2">
                                                                            <Button variant="outline" asChild>
                                                                                <a href={script.scriptHref}>Open script</a>
                                                                            </Button>
                                                                            <Button variant="outline" asChild>
                                                                                <a href={script.registryHref}>Open registry</a>
                                                                            </Button>
                                                                            {snapshot.status === "pending_review" && !scriptAccepted && (
                                                                                <Button
                                                                                    disabled={!canManageImports || loading}
                                                                                    onClick={() => confirm(() => acceptImportSnapshot(snapshot.snapshotId, [script.scriptId]), {
                                                                                        title: "Accept imported script issues",
                                                                                        message: "This will allow the imported issues for this script only, without accepting the entire import snapshot.",
                                                                                        danger: true,
                                                                                        positiveLabel: "Accept this script",
                                                                                    })}
                                                                                >
                                                                                    Accept this script
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {totalImportReviewPages > 1 && (
                                    <Pagination
                                        limit={importReviewPageSize}
                                        currentPage={importReviewPage}
                                        totalPages={totalImportReviewPages}
                                        totalRows={importSnapshotsState.length}
                                        collectionName="import snapshots"
                                        onPaginate={setImportReviewPage}
                                    />
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Integrity policy audit</CardTitle>
                        <CardDescription>
                            Recent super-admin changes to integrity policy and legacy baseline settings.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {!auditEntriesState.length ? (
                            <div className="text-sm text-muted-foreground">No integrity policy audit entries yet.</div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {auditEntriesState.length ? ((auditPage - 1) * auditPageSize) + 1 : 0}-{Math.min(auditPage * auditPageSize, auditEntriesState.length)} of {auditEntriesState.length} audit entries
                                </div>

                                <div className="space-y-3">
                                {visibleAuditEntries.map((entry, index) => (
                                    <div key={`${entry.action}-${entry.createdAt}-${index}`} className="rounded-md border p-3">
                                        <div className="font-medium">
                                            {entry.action === "baseline_captured" && entry.metadata?.automatic
                                                ? "Baseline captured automatically"
                                                : formatAuditAction(entry.action)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatDate(entry.createdAt)} - {entry.actor?.displayName || entry.actor?.email || "Unknown user"}
                                        </div>
                                        {!!entry.actor?.email && (
                                            <div className="text-xs text-muted-foreground">{entry.actor.email}</div>
                                        )}
                                        {entry.action === "policy_updated" && entry.metadata?.automaticBaselineCapture && (
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                A fresh published baseline was captured automatically before enforcement was turned back on.
                                            </div>
                                        )}
                                        {!!entry.metadata?.totalBlockingIssues && (
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                {entry.metadata.totalBlockingIssues} blocking issue{entry.metadata.totalBlockingIssues === 1 ? "" : "s"} across {entry.metadata.totalScripts || 0} script{entry.metadata.totalScripts === 1 ? "" : "s"}.
                                            </div>
                                        )}
                                    </div>
                                ))}
                                </div>

                                {totalAuditPages > 1 && (
                                    <Pagination
                                        limit={auditPageSize}
                                        currentPage={auditPage}
                                        totalPages={totalAuditPages}
                                        totalRows={auditEntriesState.length}
                                        collectionName="audit entries"
                                        onPaginate={setAuditPage}
                                    />
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {!selectedImportSnapshot ? null : (
                <Modal
                    open
                    onOpenChange={(open) => {
                        if (!open) setSelectedImportSnapshotId(null);
                    }}
                    title={selectedImportSnapshot.sourceLabel || "Import snapshot details"}
                    description={`${selectedImportSnapshot.status.replaceAll("_", " ")} import integrity snapshot`}
                    actions={(
                        <>
                            <div className="text-xs text-muted-foreground">
                                Import debt is tracked separately from the global legacy baseline.
                            </div>
                            <div className="flex-1" />
                            <Button
                                variant="ghost"
                                disabled={loading}
                                onClick={() => setSelectedImportSnapshotId(null)}
                            >
                                Close
                            </Button>
                        </>
                    )}
                    contentProps={{ className: "sm:max-w-4xl" }}
                >
                    {(() => {
                    const reviewDetails = selectedImportSnapshot.metadata?.reviewDetails as {
                        totalIssues?: number;
                        totalScripts?: number;
                        summary?: string[];
                        scripts?: Array<{
                            scriptId: string;
                            scriptTitle: string;
                            totalIssues: number;
                            registryHref: string;
                            scriptHref: string;
                            issues: Array<{
                                ruleLabel: string;
                                displayName: string;
                                reason: string;
                                location: string;
                                usageHref: string;
                                registryHref: string;
                                scriptHref: string;
                            }>;
                        }>;
                    } | undefined;
                    const acceptedScriptIds = Array.isArray(selectedImportSnapshot.metadata?.acceptedScriptIds)
                        ? selectedImportSnapshot.metadata.acceptedScriptIds.filter((value: unknown): value is string => typeof value === "string" && !!value)
                        : [];

                        return (
                            <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-md border p-4">
                                    <div className="text-sm text-muted-foreground">Created</div>
                                    <div className="mt-1 font-medium">{formatDate(selectedImportSnapshot.createdAt)}</div>
                                </div>
                                <div className="rounded-md border p-4">
                                    <div className="text-sm text-muted-foreground">Status</div>
                                    <div className="mt-1 font-medium capitalize">{selectedImportSnapshot.status.replaceAll("_", " ")}</div>
                                </div>
                                <div className="rounded-md border p-4">
                                    <div className="text-sm text-muted-foreground">Blocking issues</div>
                                    <div className="mt-1 font-medium">{selectedImportSnapshot.totalBlockingIssues}</div>
                                </div>
                                <div className="rounded-md border p-4">
                                    <div className="text-sm text-muted-foreground">Scripts in snapshot</div>
                                    <div className="mt-1 font-medium">{selectedImportSnapshot.totalScripts}</div>
                                </div>
                            </div>

                            <div className="rounded-md border p-4 text-sm text-muted-foreground">
                                <div>Imported scripts: {selectedImportSnapshot.importedScriptIds.length}</div>
                                <div>Imported data keys: {selectedImportSnapshot.importedDataKeyIds.length}</div>
                                <div>Accepted scripts: {acceptedScriptIds.length}</div>
                                {!!selectedImportSnapshot.acceptedAt && (
                                    <div>Accepted at: {formatDate(selectedImportSnapshot.acceptedAt)}</div>
                                )}
                            </div>

                            {!!reviewDetails?.summary?.length && (
                                <div className="space-y-2">
                                    {reviewDetails.summary.map((summary, index) => (
                                        <div key={`${summary}-${index}`} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                            {summary}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <ScrollArea className="h-[420px] rounded-md border p-3">
                                <div className="space-y-4 pr-2">
                                    {(reviewDetails?.scripts || []).map((script) => {
                                        const scriptAccepted = acceptedScriptIds.includes(script.scriptId);
                                        return (
                                            <div key={`${selectedImportSnapshot.snapshotId}-${script.scriptId}`} className="rounded-md border p-3">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <div className="font-medium">{script.scriptTitle}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {script.totalIssues} blocking issue{script.totalIssues === 1 ? "" : "s"} {scriptAccepted ? "(accepted)" : ""}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <Button variant="outline" asChild>
                                                            <a href={script.scriptHref}>Open script</a>
                                                        </Button>
                                                        <Button variant="outline" asChild>
                                                            <a href={script.registryHref}>Open registry</a>
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="mt-3 space-y-3">
                                                    {script.issues.map((issue, index) => (
                                                        <div key={`${script.scriptId}-${issue.location}-${index}`} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                                                            <div className="text-xs font-medium uppercase tracking-wide text-amber-800">
                                                                {issue.ruleLabel}
                                                            </div>
                                                            <div className="mt-1 font-medium text-amber-950">{issue.displayName}</div>
                                                            <div className="mt-1 text-sm text-amber-900">{issue.reason}</div>
                                                            <div className="mt-1 text-xs text-amber-800">Location: {issue.location}</div>
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                <Button size="sm" variant="outline" asChild>
                                                                    <a href={issue.usageHref}>Open usage</a>
                                                                </Button>
                                                                <Button size="sm" variant="outline" asChild>
                                                                    <a href={issue.registryHref}>Open registry</a>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                            </div>
                        );
                    })()}
                </Modal>
            )}
        </>
    );
}
