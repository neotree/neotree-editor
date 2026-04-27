'use client';

import { useMemo, useState } from "react";

import {
    captureIntegrityPolicyBaseline,
    clearIntegrityPolicyBaseline,
    saveIntegrityPolicySettings,
} from "@/app/actions/integrity-policy";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { isIntegrityBaselineCompatible, type IntegrityBaseline, type IntegrityPolicy } from "@/lib/integrity-policy";

type Props = {
    canManage: boolean;
    initialPolicy: IntegrityPolicy;
    initialBaseline: IntegrityBaseline;
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
        a.triggerSources.deletions === b.triggerSources.deletions
    );
}

export function Content({ canManage, initialPolicy, initialBaseline }: Props) {
    const { alert } = useAlertModal();
    const { confirm } = useConfirmModal();

    const [loading, setLoading] = useState(false);
    const [policy, setPolicy] = useState<IntegrityPolicy>(initialPolicy);
    const [baseline, setBaseline] = useState<IntegrityBaseline>(initialBaseline);
    const hasCapturedBaseline = baseline.fingerprints.length > 0;
    const hasCompatibleBaseline = isIntegrityBaselineCompatible(baseline);

    const isDirty = useMemo(() => !arePoliciesEqual(policy, initialPolicy), [initialPolicy, policy]);
    const selectedEnforcementOption = enforcementOptions.find((option) => option.value === policy.enforcementMode);
    const selectedScanScopeOption = scanScopeOptions.find((option) => option.value === policy.scanScope);

    const savePolicy = async () => {
        try {
            setLoading(true);
            const res = await saveIntegrityPolicySettings(policy);
            if (!res.success || !res.data) {
                throw new Error(res.errors?.join(", ") || "Failed to save integrity policy");
            }

            setPolicy(res.data.policy);
            setBaseline(res.data.baseline);
            alert({
                title: "Integrity policy updated",
                message: "Publish integrity settings were saved successfully.",
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
                        {!canManage && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                You can view the current integrity policy, but only super admins can change it.
                            </div>
                        )}

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Enforcement mode</Label>
                                <Select
                                    value={policy.enforcementMode}
                                    disabled={!canManage || loading}
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
                                    disabled={!canManage || loading}
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
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm font-medium">Trigger sources</div>

                            <div className="flex items-start gap-3 rounded-md border p-3">
                                <Switch
                                    id="integrity-trigger-script-edits"
                                    checked={policy.triggerSources.scriptEdits}
                                    disabled={!canManage || loading}
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
                                    disabled={!canManage || loading}
                                    onCheckedChange={(checked) => setPolicy((current) => ({
                                        ...current,
                                        triggerSources: {
                                            ...current.triggerSources,
                                            dataKeyLibraryEdits: checked,
                                        },
                                    }))}
                                />
                                <div>
                                    <Label htmlFor="integrity-trigger-datakey-edits">Datakey library edits</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Run integrity checks when existing datakeys are edited in the library.
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-md border p-3">
                                <Switch
                                    id="integrity-trigger-deletions"
                                    checked={policy.triggerSources.deletions}
                                    disabled={!canManage || loading}
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

                            <div className="rounded-md border p-3">
                                <div className="font-medium">Baseline behaviour</div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    {policy.enforcementMode === "block_new_issues_only"
                                        ? 'This mode always uses the captured baseline. Existing baseline issues are allowed, and only newly introduced blocking issues will stop publish.'
                                        : 'The captured baseline is only applied in "block new issues only" mode.'}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                disabled={!canManage || loading || !isDirty}
                                onClick={() => confirm(savePolicy, {
                                    title: "Save integrity policy",
                                    message: "These settings will affect publish validation for all users.",
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
                            Capture the current set of blocking integrity issues so "block new issues only" can allow existing legacy debt without allowing new regressions.
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
                                <div className="mt-1 font-medium">{baseline.capturedByUserId || "Unknown"}</div>
                            </div>
                        </div>

                        {policy.enforcementMode === "block_new_issues_only" && !hasCapturedBaseline && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                No baseline has been captured yet. In this state, "block new issues only" will behave as warn-only until a baseline is captured.
                            </div>
                        )}

                        {policy.enforcementMode === "block_new_issues_only" && hasCapturedBaseline && !hasCompatibleBaseline && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                The captured baseline is outdated for the current integrity rule set. "Block new issues only" will behave as warn-only until a new baseline is captured.
                            </div>
                        )}

                        <div className="flex flex-wrap justify-end gap-3">
                            <Button
                                variant="outline"
                                disabled={!canManage || loading || !hasCapturedBaseline}
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
                                disabled={!canManage || loading}
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
            </div>
        </>
    );
}
