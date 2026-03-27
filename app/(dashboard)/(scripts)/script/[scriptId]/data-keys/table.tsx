'use client';

import { useState, useTransition } from "react";
import { CopyIcon, ExternalLinkIcon, MoreVertical, WrenchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { previewDataKeyIntegrityEntryRepair, resolveDataKeyIntegrityEntriesBulk, resolveDataKeyIntegrityEntry } from "@/app/actions/data-keys";
import { dataKeyTypes } from "@/constants";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { Modal } from "@/components/modal";
import { SelectDataKey } from "@/components/select-data-key";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getScriptsWithItems } from "@/app/actions/scripts";
import { Title } from "@/components/title";
import { PageContainer } from "../../../components/page-container";
import type { DataKeyIntegrityReport } from "@/lib/data-key-integrity";

const statusStyles = {
    resolved: "bg-emerald-100 text-emerald-800",
    out_of_sync: "bg-amber-100 text-amber-800",
    missing: "bg-red-100 text-red-800",
    legacy_match: "bg-blue-100 text-blue-800",
    conflict: "bg-rose-100 text-rose-800",
    unmanaged: "bg-slate-100 text-slate-800",
} satisfies Record<NonNullable<DataKeyIntegrityReport>["entries"][number]["status"], string>;

const kindLabels: Record<DataKeyIntegrityReport["entries"][number]["kind"], string> = {
    screen: "Screen key",
    screen_ref: "Screen ref",
    screen_item: "Screen option",
    screen_option_collection: "Screen options",
    field: "Field key",
    field_ref: "Field ref",
    field_min_date: "Field min date",
    field_max_date: "Field max date",
    field_min_time: "Field min time",
    field_max_time: "Field max time",
    field_item: "Field option",
    field_option_collection: "Field options",
    diagnosis: "Diagnosis key",
    diagnosis_symptom: "Diagnosis symptom",
};

function formatIssueLabel(status: DataKeyIntegrityReport["entries"][number]["status"]) {
    switch (status) {
        case "out_of_sync":
            return "Out of sync";
        case "legacy_match":
            return "Not linked properly";
        case "missing":
            return "Missing from library";
        case "conflict":
            return "Needs manual review";
        case "unmanaged":
            return "Not managed by library";
        default:
            return "Resolved";
    }
}

function formatReferenceLabel(entry: DataKeyIntegrityReport["entries"][number]) {
    return entry.currentKey || entry.currentLabel || entry.location || "Unnamed reference";
}

function buildUsageHref(entry: DataKeyIntegrityReport["entries"][number]) {
    if (entry.diagnosisId) {
        const params = new URLSearchParams();
        if (entry.kind === "diagnosis_symptom") {
            if (entry.symptomId) params.set("symptom", entry.symptomId);
            else if (Number.isInteger(entry.symptomIndex)) params.set("symptom", `${entry.symptomIndex}`);
        }
        const query = params.toString();
        return `/script/${entry.scriptId}/diagnosis/${entry.diagnosisId}${query ? `?${query}` : ""}`;
    }

    if (entry.screenId) {
        const params = new URLSearchParams();

        if (
            ["field", "field_ref", "field_min_date", "field_max_date", "field_min_time", "field_max_time", "field_option_collection", "field_item"].includes(entry.kind)
        ) {
            if (entry.fieldId) params.set("field", entry.fieldId);
            else if (Number.isInteger(entry.fieldIndex)) params.set("field", `${entry.fieldIndex}`);
        }

        if (entry.kind === "screen_item") {
            if (entry.screenItemId) params.set("item", entry.screenItemId);
            else if (Number.isInteger(entry.screenItemIndex)) params.set("item", `${entry.screenItemIndex}`);
        }

        if (entry.kind === "field_item") {
            if (entry.fieldItemId) params.set("fieldItem", entry.fieldItemId);
            else if (Number.isInteger(entry.fieldItemIndex)) params.set("fieldItem", `${entry.fieldItemIndex}`);
        }

        const query = params.toString();
        return `/script/${entry.scriptId}/screen/${entry.screenId}${query ? `?${query}` : ""}`;
    }

    return `/script/${entry.scriptId}`;
}

export function ScriptDataKeysTable({ data: { title, scriptId }, integrity }: {
    data: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0];
    integrity?: DataKeyIntegrityReport | null;
}) {
    const router = useRouter();
    const { alert } = useAlertModal();
    const [isRepairing, startRepairTransition] = useTransition();
    const [resolvingKey, setResolvingKey] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<"all" | DataKeyIntegrityReport["entries"][number]["status"]>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [repairModalEntry, setRepairModalEntry] = useState<DataKeyIntegrityReport["entries"][number] | null>(null);
    const [repairPreview, setRepairPreview] = useState<Awaited<ReturnType<typeof previewDataKeyIntegrityEntryRepair>>["preview"] | null>(null);
    const [loadingRepairPreview, setLoadingRepairPreview] = useState(false);
    const [selectedTargetUniqueKey, setSelectedTargetUniqueKey] = useState<string>("");
    const [reviewAcknowledged, setReviewAcknowledged] = useState(false);
    const [bulkResolveStatus, setBulkResolveStatus] = useState<null | "out_of_sync" | "legacy_match">(null);

    const entries = [...(integrity?.entries || [])].sort((a, b) => {
        const keyA = `${a.currentKey || a.matchedName || ""}`.trim().toLowerCase();
        const keyB = `${b.currentKey || b.matchedName || ""}`.trim().toLowerCase();
        if (keyA !== keyB) return keyA.localeCompare(keyB);

        const labelA = `${a.currentLabel || a.matchedLabel || ""}`.trim().toLowerCase();
        const labelB = `${b.currentLabel || b.matchedLabel || ""}`.trim().toLowerCase();
        if (labelA !== labelB) return labelA.localeCompare(labelB);

        return `${a.location || ""}`.trim().toLowerCase().localeCompare(`${b.location || ""}`.trim().toLowerCase());
    });
    const summary = integrity?.summary;
    const availableTypes = dataKeyTypes.filter((type) =>
        entries.some((entry) => `${entry.expectedDataType || ""}`.trim() === type.value)
    );
    const filteredEntries = entries.filter((entry) => {
        if (statusFilter !== "all" && entry.status !== statusFilter) return false;
        if (typeFilter !== "all" && entry.expectedDataType !== typeFilter) return false;
        return true;
    });

    const getEntryKey = (entry: DataKeyIntegrityReport["entries"][number]) => `${entry.kind}::${entry.location}::${entry.currentUniqueKey || entry.currentKey || ""}`;
    const bulkResolvableEntries = {
        out_of_sync: entries.filter((entry) => entry.status === "out_of_sync"),
        legacy_match: entries.filter((entry) => entry.status === "legacy_match"),
    };
    const hasBulkResolveActions = !!bulkResolvableEntries.out_of_sync.length || !!bulkResolvableEntries.legacy_match.length;

    const closeRepairModal = () => {
        if (isRepairing || loadingRepairPreview) return;
        setRepairModalEntry(null);
        setRepairPreview(null);
        setSelectedTargetUniqueKey("");
        setReviewAcknowledged(false);
    };

    const loadRepairPreview = async ({
        entry,
        nextSelectedTargetUniqueKey,
    }: {
        entry: DataKeyIntegrityReport["entries"][number];
        nextSelectedTargetUniqueKey?: string;
    }) => {
        setLoadingRepairPreview(true);
        const res = await previewDataKeyIntegrityEntryRepair({
            entry,
            selectedTargetUniqueKey: nextSelectedTargetUniqueKey || undefined,
        });
        if (!res.success) {
            setLoadingRepairPreview(false);
            return res;
        }

        setRepairPreview(res.preview);
        setSelectedTargetUniqueKey(
            nextSelectedTargetUniqueKey
                || res.preview?.targetDataKey?.uniqueKey
                || entry.matchedUniqueKey
                || entry.currentUniqueKey
                || ""
        );
        setLoadingRepairPreview(false);
        return res;
    };

    const openRepairModal = async (entry: DataKeyIntegrityReport["entries"][number]) => {
        if (!scriptId || isRepairing || loadingRepairPreview) return;
        setRepairModalEntry(entry);
        setRepairPreview(null);
        setSelectedTargetUniqueKey("");
        setReviewAcknowledged(false);
        const res = await loadRepairPreview({ entry });
        if (!res.success) {
            setRepairModalEntry(null);
            setRepairPreview(null);
            setSelectedTargetUniqueKey("");
            alert({
                title: "Preview failed",
                message: (res.errors?.length ? res.errors.join("<br />") : "Failed to preview repair"),
                variant: "error",
                buttonLabel: "Close",
            });
            return;
        }
    };

    const handleResolveEntry = (entry: DataKeyIntegrityReport["entries"][number]) => {
        if (!scriptId || isRepairing) return;
        startRepairTransition(async () => {
            setResolvingKey(getEntryKey(entry));
            const res = await resolveDataKeyIntegrityEntry({
                entry,
                selectedTargetUniqueKey: selectedTargetUniqueKey || undefined,
            });

            if (!res.success) {
                alert({
                    title: "Resolve failed",
                    message: (res.errors?.length ? res.errors.join("<br />") : "Failed to repair data key references"),
                    variant: "error",
                    buttonLabel: "Close",
                });
                setResolvingKey(null);
                return;
            }

            if (!res.changed) {
                toast.message("No safe change was applied for this reference");
            } else {
                toast.success(`Repair draft saved for ${entry.currentKey || entry.currentLabel || entry.location}`);
                if (res.warnings?.length) {
                    alert({
                        title: "Repair saved with warnings",
                        message: res.warnings.map((warning) => `<div class="mb-1 text-sm">${warning}</div>`).join(""),
                        variant: "info",
                        buttonLabel: "Close",
                    });
                }
            }

            setResolvingKey(null);
            setRepairModalEntry(null);
            setRepairPreview(null);
            setReviewAcknowledged(false);
            router.refresh();
        });
    };

    const handleBulkResolve = (status: "out_of_sync" | "legacy_match") => {
        if (!scriptId || isRepairing) return;
        const entriesToResolve = bulkResolvableEntries[status];
        if (!entriesToResolve.length) return;

        startRepairTransition(async () => {
            setResolvingKey(`bulk:${status}`);
            const res = await resolveDataKeyIntegrityEntriesBulk({ entries: entriesToResolve });

            if (!res.success) {
                alert({
                    title: "Bulk resolve failed",
                    message: (res.errors?.length ? res.errors.join("<br />") : "Failed to repair data key references"),
                    variant: "error",
                    buttonLabel: "Close",
                });
                setResolvingKey(null);
                return;
            }

            if (!res.changed) {
                toast.message(`No ${status.replace(/_/g, " ")} references needed changes`);
            } else {
                toast.success(`Saved ${res.resolvedCount} ${status.replace(/_/g, " ")} repair draft${res.resolvedCount === 1 ? "" : "s"}`);
                if (res.warnings?.length) {
                    alert({
                        title: "Bulk repair saved with warnings",
                        message: res.warnings.map((warning) => `<div class="mb-1 text-sm">${warning}</div>`).join(""),
                        variant: "info",
                        buttonLabel: "Close",
                    });
                }
            }

            setResolvingKey(null);
            setBulkResolveStatus(null);
            router.refresh();
        });
    };

    const renderActions = (entry: DataKeyIntegrityReport["entries"][number]) => {
        const createHref = `/data-keys/new?name=${encodeURIComponent(entry.currentKey || "")}&label=${encodeURIComponent(entry.currentLabel || entry.currentKey || "")}&dataType=${encodeURIComponent(entry.expectedDataType || "")}`;
        const editHref = entry.matchedUniqueKey ? `/data-keys/edit/${entry.matchedUniqueKey}` : undefined;
        const usageHref = buildUsageHref(entry);
        const canSafeResolve = entry.status === "out_of_sync" || entry.status === "legacy_match";
        const isResolvingThisEntry = resolvingKey === getEntryKey(entry) && isRepairing;
        const libraryHref = "/data-keys";
        const displayReference = entry.currentKey || entry.currentLabel || entry.location;

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={usageHref} target="_blank" rel="noreferrer">
                            <ExternalLinkIcon className="mr-2 h-4 w-4" />
                            View usage
                        </Link>
                    </DropdownMenuItem>

                    {canSafeResolve && (
                        <DropdownMenuItem onClick={() => openRepairModal(entry)} disabled={isRepairing || loadingRepairPreview}>
                            <WrenchIcon className="mr-2 h-4 w-4" />
                            {isResolvingThisEntry ? "Resolving..." : "Resolve"}
                        </DropdownMenuItem>
                    )}

                    {editHref && (
                        <DropdownMenuItem asChild>
                            <Link href={editHref} target="_blank" rel="noreferrer">
                                <ExternalLinkIcon className="mr-2 h-4 w-4" />
                                Open matched data key
                            </Link>
                        </DropdownMenuItem>
                    )}

                    {(entry.status === "missing" || entry.status === "unmanaged") && (
                        <DropdownMenuItem asChild>
                            <Link href={createHref} target="_blank" rel="noreferrer">
                                <ExternalLinkIcon className="mr-2 h-4 w-4" />
                                Create data key
                            </Link>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(displayReference);
                                toast.success(`Copied ${displayReference}`);
                            } catch {
                                alert({
                                    title: "Copy failed",
                                    message: "Failed to copy reference",
                                    variant: "error",
                                    buttonLabel: "Close",
                                });
                            }
                        }}
                    >
                        <CopyIcon className="mr-2 h-4 w-4" />
                        Copy reference
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                        <Link href={libraryHref} target="_blank" rel="noreferrer">
                            <ExternalLinkIcon className="mr-2 h-4 w-4" />
                            Open data key library
                        </Link>
                    </DropdownMenuItem>

                    {(canSafeResolve || editHref || entry.status === "missing" || entry.status === "unmanaged") && (
                        <DropdownMenuSeparator />
                    )}

                    {!editHref && entry.status === "conflict" && (
                        <DropdownMenuItem disabled>
                            Review matching data keys manually
                        </DropdownMenuItem>
                    )}

                    {entry.status === "resolved" && (
                        <DropdownMenuItem disabled>
                            No action needed
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <>
            <Modal
                open={!!repairModalEntry}
                onOpenChange={(open) => {
                    if (!open) closeRepairModal();
                }}
                title="Repair Data Key Reference"
                description="Repairs are saved as drafts only. Nothing is published automatically."
                actions={(
                    <>
                        <Button variant="ghost" onClick={closeRepairModal} disabled={isRepairing || loadingRepairPreview}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => repairModalEntry && handleResolveEntry(repairModalEntry)}
                            disabled={!repairModalEntry || isRepairing || loadingRepairPreview || !reviewAcknowledged || !repairPreview?.screens.length && !repairPreview?.diagnoses.length}
                        >
                            {isRepairing ? "Saving Draft..." : "Save Repair Draft"}
                        </Button>
                    </>
                )}
            >
                {!repairModalEntry || loadingRepairPreview ? (
                    <div className="text-sm text-muted-foreground">Preparing repair preview...</div>
                ) : !repairPreview?.screens.length && !repairPreview?.diagnoses.length ? (
                    <div className="space-y-2 text-sm">
                        <div>No deterministic draft repair is available for this reference.</div>
                        <div className="text-muted-foreground">Review and update it manually if needed.</div>
                    </div>
                ) : (
                    <div className="space-y-4 text-sm">
                        <div className="rounded-md border p-3 space-y-3">
                            <div className="font-medium">What will change</div>
                            <div className="text-muted-foreground">
                                This repair will update the current script draft so this reference points to the data key shown below.
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-2">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-red-700">From</div>
                                    <div className="font-medium text-red-950">{formatReferenceLabel(repairModalEntry)}</div>
                                    <div className="text-red-900">
                                        {formatIssueLabel(repairModalEntry.status)}
                                    </div>
                                    <div className="text-sm text-red-900">
                                        {repairModalEntry.reason}
                                    </div>
                                    <div className="text-xs text-red-800">
                                        Used in {repairModalEntry.location}
                                    </div>
                                </div>

                                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">To</div>
                                    <div className="font-medium text-emerald-950">Suggested data key</div>
                                    <SelectDataKey
                                        modal
                                        value={repairPreview?.targetDataKey?.name || repairPreview?.targetDataKey?.label || ""}
                                        placeholder="Select data key"
                                        type={repairModalEntry.expectedDataType || undefined}
                                        disabled={isRepairing || loadingRepairPreview}
                                        onChange={async ([dataKey]) => {
                                            const nextUniqueKey = dataKey?.uniqueKey || "";
                                            setReviewAcknowledged(false);
                                            const previewRes = await loadRepairPreview({
                                                entry: repairModalEntry,
                                                nextSelectedTargetUniqueKey: nextUniqueKey,
                                            });

                                            if (!previewRes.success) {
                                                alert({
                                                    title: "Preview failed",
                                                    message: (previewRes.errors?.length ? previewRes.errors.join("<br />") : "Failed to preview repair"),
                                                    variant: "error",
                                                    buttonLabel: "Close",
                                                });
                                            }
                                        }}
                                    />
                                    <div className="text-sm text-emerald-900">
                                        Use the suggested data key, or pick a different one.
                                    </div>
                                    {!!repairPreview?.targetDataKey?.dataType && (
                                        <div className="text-xs text-emerald-800">
                                            Type: {repairPreview.targetDataKey.dataType}
                                        </div>
                                    )}
                                    {!!repairPreview?.targetDataKey?.optionsCount && (
                                        <div className="text-xs text-emerald-800">
                                            Linked options: {repairPreview.targetDataKey.optionsCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-md border p-3 space-y-2">
                            <div className="font-medium">Review details</div>
                            <div><span className="font-medium">Reference type:</span> {kindLabels[repairModalEntry.kind]}</div>
                            <div><span className="font-medium">Expected type:</span> {repairModalEntry.expectedDataType || "Not specified"}</div>
                            {!!repairModalEntry.currentUniqueKey && (
                                <div><span className="font-medium">Current linked unique key:</span> {repairModalEntry.currentUniqueKey}</div>
                            )}
                            {!!repairPreview?.targetDataKey && (
                                <>
                                    <div><span className="font-medium">New linked unique key:</span> {repairPreview.targetDataKey.uniqueKey}</div>
                                    <div><span className="font-medium">Confidential:</span> {repairPreview.targetDataKey.confidential ? "Yes" : "No"}</div>
                                    <div><span className="font-medium">Library state:</span> {repairPreview.targetDataKey.isDraft ? "Draft exists" : "Published only"}</div>
                                    {!!Object.keys(repairPreview.targetDataKey.metadata || {}).length && (
                                        <div className="space-y-1">
                                            <div><span className="font-medium">Metadata:</span></div>
                                            <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                                                {JSON.stringify(repairPreview.targetDataKey.metadata, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="rounded-md border p-3 space-y-3">
                            <div className="font-medium">Review affected usage</div>
                            <div className="text-muted-foreground">
                                Open the affected script location before saving if you want to verify the exact reference being repaired.
                            </div>

                            {!!repairPreview.screens.length && (
                                <div>
                                    <div className="text-muted-foreground">Affected screens</div>
                                    <div className="space-y-1">
                                        {repairPreview.screens.map((screen) => (
                                            <Link
                                                key={screen.screenId}
                                                href={`/script/${screen.scriptId}/screen/${screen.screenId}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                                            >
                                                <span>{screen.title}</span>
                                                <ExternalLinkIcon className="h-3 w-3" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!!repairPreview.diagnoses.length && (
                                <div>
                                    <div className="text-muted-foreground">Affected diagnoses</div>
                                    <div className="space-y-1">
                                        {repairPreview.diagnoses.map((diagnosis) => (
                                            <Link
                                                key={diagnosis.diagnosisId}
                                                href={`/script/${diagnosis.scriptId}/diagnosis/${diagnosis.diagnosisId}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                                            >
                                                <span>{diagnosis.title}</span>
                                                <ExternalLinkIcon className="h-3 w-3" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-start gap-3 rounded-md border p-3">
                            <Checkbox
                                id="confirm-integrity-repair-review"
                                checked={reviewAcknowledged}
                                onCheckedChange={(checked) => setReviewAcknowledged(checked === true)}
                            />
                            <Label htmlFor="confirm-integrity-repair-review" className="leading-5">
                                I have reviewed the target data key details and I want to save this singular repair draft against this specific data key.
                            </Label>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                open={!!bulkResolveStatus}
                onOpenChange={(open) => {
                    if (!open && !isRepairing) setBulkResolveStatus(null);
                }}
                title={bulkResolveStatus ? `Resolve ${bulkResolveStatus.replace(/_/g, " ")}` : "Resolve by status"}
                description="This saves draft repairs only for the selected status in the current script."
                actions={(
                    <>
                        <Button variant="ghost" onClick={() => setBulkResolveStatus(null)} disabled={isRepairing}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => bulkResolveStatus && handleBulkResolve(bulkResolveStatus)}
                            disabled={!bulkResolveStatus || isRepairing || !bulkResolvableEntries[bulkResolveStatus]?.length}
                        >
                            {isRepairing ? "Saving Drafts..." : "Save Repair Drafts"}
                        </Button>
                    </>
                )}
            >
                {!bulkResolveStatus ? null : (
                    <div className="space-y-4 text-sm">
                        <div className="rounded-md border p-3 space-y-2">
                            <div><span className="font-medium">Status:</span> {bulkResolveStatus.replace(/_/g, " ")}</div>
                            <div><span className="font-medium">Entries:</span> {bulkResolvableEntries[bulkResolveStatus].length}</div>
                            <div className="text-muted-foreground">
                                Only references with this status in the current script will be repaired. Nothing is published automatically.
                            </div>
                        </div>

                        <div className="rounded-md border p-3 space-y-2">
                            <div className="font-medium">Affected references</div>
                            <div className="space-y-1">
                                {bulkResolvableEntries[bulkResolveStatus].slice(0, 8).map((entry) => (
                                    <div key={getEntryKey(entry)}>
                                        {entry.currentKey || entry.currentLabel || entry.location}
                                        <span className="text-muted-foreground"> · {kindLabels[entry.kind]} · {entry.location}</span>
                                    </div>
                                ))}
                                {bulkResolvableEntries[bulkResolveStatus].length > 8 && (
                                    <div className="text-muted-foreground">
                                        And {bulkResolvableEntries[bulkResolveStatus].length - 8} more…
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Title>{title + ' - data key integrity'}</Title>
            <PageContainer>
                <div className="p-4 space-y-4">
                    <div className="text-2xl">{title}</div>

                    {!!summary && (
                        <div className="grid grid-cols-2 md:grid-cols-8 gap-3">
                            {[
                                { label: "Total", value: summary.total },
                                { label: "Resolved", value: summary.resolved },
                                { label: "Blocking", value: summary.blocking },
                                { label: "Missing", value: summary.missing },
                                { label: "Legacy Match", value: summary.legacy_match },
                                { label: "Conflict", value: summary.conflict },
                                { label: "Out Of Sync", value: summary.out_of_sync },
                                { label: "Unmanaged", value: summary.unmanaged },
                            ].map((item) => (
                                <div key={item.label} className="rounded-md border p-3">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</div>
                                    <div className="text-2xl font-semibold">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                        This view shows all scanned script references. Only missing and legacy-match issues stop publish. Conflicts stay visible for manual cleanup but do not block publishing.
                    </div>

                    <div className="rounded-md border p-3 space-y-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="flex flex-col gap-3">
                                <div className="text-sm text-muted-foreground">
                                    Review issues from the row menu, or use bulk resolve for safe deterministic fixes in this script.
                                </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                            <div className="w-full md:w-[220px]">
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="out_of_sync">Out of sync</SelectItem>
                                            <SelectItem value="missing">Missing</SelectItem>
                                            <SelectItem value="legacy_match">Legacy match</SelectItem>
                                            <SelectItem value="conflict">Conflict</SelectItem>
                                            <SelectItem value="unmanaged">Unmanaged</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                            <div className="w-full md:w-[220px]">
                                <Select
                                    value={typeFilter}
                                    onValueChange={setTypeFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All types</SelectItem>
                                        {availableTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        </div>

                        {hasBulkResolveActions && (
                            <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bulk resolve</span>
                                {!!bulkResolvableEntries.out_of_sync.length && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={isRepairing}
                                        onClick={() => setBulkResolveStatus("out_of_sync")}
                                    >
                                        Out of sync ({bulkResolvableEntries.out_of_sync.length})
                                    </Button>
                                )}
                                {!!bulkResolvableEntries.legacy_match.length && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={isRepairing}
                                        onClick={() => setBulkResolveStatus("legacy_match")}
                                    >
                                        Legacy match ({bulkResolvableEntries.legacy_match.length})
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Showing {filteredEntries.length} of {entries.length} references.
                    </div>

                    <DataTable
                        search={{ inputPlaceholder: 'Search data key references' }}
                        getRowOptions={({ rowIndex }) => {
                            const issue = filteredEntries[rowIndex];
                            return {
                                className: cn(
                                    issue?.status === "resolved" && "bg-emerald-50 hover:bg-emerald-100",
                                    issue?.status === "missing" && "bg-red-50 hover:bg-red-100",
                                    issue?.status === "conflict" && "bg-rose-50 hover:bg-rose-100",
                                    issue?.status === "legacy_match" && "bg-blue-50 hover:bg-blue-100",
                                    issue?.status === "out_of_sync" && "bg-amber-50 hover:bg-amber-100",
                                    issue?.status === "unmanaged" && "bg-slate-50 hover:bg-slate-100",
                                ),
                            };
                        }}
                        noDataMessage="No data key references found for this script"
                        columns={[
                            {
                                name: "Status",
                                cellRenderer({ rowIndex }) {
                                    const issue = filteredEntries[rowIndex];
                                    if (!issue) return null;
                                    return (
                                        <span className={cn("inline-flex rounded px-2 py-1 text-xs font-medium", statusStyles[issue.status])}>
                                            {issue.status.replace(/_/g, " ")}
                                        </span>
                                    );
                                },
                            },
                            { name: "Key" },
                            { name: "Label" },
                            { name: "Type" },
                            { name: "Reference" },
                            { name: "Location" },
                            { name: "Reason" },
                            { name: "Suggested" },
                            {
                                name: "",
                                cellRenderer({ rowIndex }) {
                                    const issue = filteredEntries[rowIndex];
                                    if (!issue) return null;
                                    return <div className="flex items-center justify-end">{renderActions(issue)}</div>;
                                },
                            },
                        ]}
                        data={filteredEntries.map((issue) => [
                            issue.status.replace(/_/g, " "),
                            issue.currentKey || issue.matchedName || "",
                            issue.currentLabel || issue.matchedLabel || "",
                            issue.expectedDataType,
                            kindLabels[issue.kind],
                            issue.location,
                            issue.reason,
                            issue.status === "out_of_sync"
                                ? "Resolve available"
                                : issue.status === "legacy_match"
                                    ? "Resolve available"
                                    : issue.status === "unmanaged"
                                        ? "Legacy/local reference"
                                        : issue.matchedName || (issue.status === "missing" ? "Create new data key" : ""),
                            "",
                        ])}
                    />
                </div>
            </PageContainer>
        </>
    );
}
