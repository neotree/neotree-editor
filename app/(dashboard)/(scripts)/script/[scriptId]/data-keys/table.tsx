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
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
    const [viewFilter, setViewFilter] = useState<"all" | "blocking" | "issues" | "resolved">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | DataKeyIntegrityReport["entries"][number]["status"]>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [repairModalEntry, setRepairModalEntry] = useState<DataKeyIntegrityReport["entries"][number] | null>(null);
    const [repairPreview, setRepairPreview] = useState<Awaited<ReturnType<typeof previewDataKeyIntegrityEntryRepair>>["preview"] | null>(null);
    const [loadingRepairPreview, setLoadingRepairPreview] = useState(false);
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
        if (viewFilter === "blocking" && !["missing", "legacy_match"].includes(entry.status)) return false;
        if (viewFilter === "issues" && entry.status === "resolved") return false;
        if (viewFilter === "resolved" && entry.status !== "resolved") return false;
        if (statusFilter !== "all" && entry.status !== statusFilter) return false;
        if (typeFilter !== "all" && entry.expectedDataType !== typeFilter) return false;
        return true;
    });

    const getEntryKey = (entry: DataKeyIntegrityReport["entries"][number]) => `${entry.kind}::${entry.location}::${entry.currentUniqueKey || entry.currentKey || ""}`;
    const bulkResolvableEntries = {
        out_of_sync: entries.filter((entry) => entry.status === "out_of_sync"),
        legacy_match: entries.filter((entry) => entry.status === "legacy_match"),
    };

    const closeRepairModal = () => {
        if (isRepairing || loadingRepairPreview) return;
        setRepairModalEntry(null);
        setRepairPreview(null);
    };

    const openRepairModal = async (entry: DataKeyIntegrityReport["entries"][number]) => {
        if (!scriptId || isRepairing || loadingRepairPreview) return;
        setRepairModalEntry(entry);
        setRepairPreview(null);
        setLoadingRepairPreview(true);

        const res = await previewDataKeyIntegrityEntryRepair({ entry });
        if (!res.success) {
            setRepairModalEntry(null);
            setRepairPreview(null);
            setLoadingRepairPreview(false);
            alert({
                title: "Preview failed",
                message: (res.errors?.length ? res.errors.join("<br />") : "Failed to preview repair"),
                variant: "error",
                buttonLabel: "Close",
            });
            return;
        }

        setRepairPreview(res.preview);
        setLoadingRepairPreview(false);
    };

    const handleResolveEntry = (entry: DataKeyIntegrityReport["entries"][number]) => {
        if (!scriptId || isRepairing) return;
        startRepairTransition(async () => {
            setResolvingKey(getEntryKey(entry));
            const res = await resolveDataKeyIntegrityEntry({ entry });

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
                            disabled={!repairModalEntry || isRepairing || loadingRepairPreview || !repairPreview?.screens.length && !repairPreview?.diagnoses.length}
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
                        <div className="rounded-md border p-3 space-y-2">
                            <div><span className="font-medium">Reference:</span> {repairModalEntry.currentKey || repairModalEntry.currentLabel || repairModalEntry.location}</div>
                            <div><span className="font-medium">Reference kind:</span> {kindLabels[repairModalEntry.kind]}</div>
                            <div><span className="font-medium">Location:</span> {repairModalEntry.location}</div>
                            <div><span className="font-medium">Issue:</span> {repairModalEntry.status.replace(/_/g, " ")}</div>
                            <div><span className="font-medium">Reason:</span> {repairModalEntry.reason}</div>
                            {!!repairModalEntry.matchedName && (
                                <div><span className="font-medium">Target data key:</span> {repairModalEntry.matchedName}{repairModalEntry.matchedLabel ? ` (${repairModalEntry.matchedLabel})` : ""}</div>
                            )}
                        </div>

                        <div className="rounded-md border p-3 space-y-3">
                            <div className="font-medium">Draft updates that will be created</div>

                            {!!repairPreview.screens.length && (
                                <div>
                                    <div className="text-muted-foreground">Screens</div>
                                    <div className="space-y-1">
                                        {repairPreview.screens.map((screen) => (
                                            <div key={screen.screenId}>{screen.title}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!!repairPreview.diagnoses.length && (
                                <div>
                                    <div className="text-muted-foreground">Diagnoses</div>
                                    <div className="space-y-1">
                                        {repairPreview.diagnoses.map((diagnosis) => (
                                            <div key={diagnosis.diagnosisId}>{diagnosis.title}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="text-muted-foreground">
                                Saving this repair follows the normal draft flow. You will still need to publish the script changes separately.
                            </div>
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
                        This view shows all scanned script references. Only missing and legacy-match issues stop publish. Conflicts stay visible for manual cleanup but do not block publishing. Unmanaged references are legacy or local script keys that are not explicitly linked to the data key library.
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: "All", value: "all" },
                                    { label: "Blocking", value: "blocking" },
                                    { label: "Issues Only", value: "issues" },
                                    { label: "Resolved Only", value: "resolved" },
                                ].map((filter) => (
                                    <Button
                                        key={filter.value}
                                        type="button"
                                        size="sm"
                                        variant={viewFilter === filter.value ? "default" : "outline"}
                                        onClick={() => setViewFilter(filter.value as typeof viewFilter)}
                                    >
                                        {filter.label}
                                    </Button>
                                ))}
                            </div>

                            <div className="text-sm text-muted-foreground">
                                Use the row action menu to review or resolve one issue at a time. Resolve is available only when the system can make a safe deterministic fix.
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={!bulkResolvableEntries.out_of_sync.length || isRepairing}
                                    onClick={() => setBulkResolveStatus("out_of_sync")}
                                >
                                    Resolve All Out Of Sync ({bulkResolvableEntries.out_of_sync.length})
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={!bulkResolvableEntries.legacy_match.length || isRepairing}
                                    onClick={() => setBulkResolveStatus("legacy_match")}
                                >
                                    Resolve All Legacy Matches ({bulkResolvableEntries.legacy_match.length})
                                </Button>
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
