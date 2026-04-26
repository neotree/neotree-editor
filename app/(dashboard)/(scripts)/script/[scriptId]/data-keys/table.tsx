'use client';

import { useEffect, useRef, useState, useTransition } from "react";
import { CopyIcon, ExternalLinkIcon, MoreVertical, WrenchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { toast } from "sonner";

import { previewDataKeyIntegrityEntriesBulk, previewDataKeyIntegrityEntryRepair, resolveDataKeyIntegrityEntriesBulk, resolveDataKeyIntegrityEntry } from "@/app/actions/data-keys";
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
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getScriptsWithItems } from "@/app/actions/scripts";
import { Title } from "@/components/title";
import { PageContainer } from "../../../components/page-container";
import { isBlockingEntry, type DataKeyIntegrityReport } from "@/lib/data-key-integrity";
import type { IntegrityPolicy } from "@/lib/integrity-policy";
import { useAppContext } from "@/contexts/app";

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
    problem: "Problem key",
    duplicate_parent_data_key: "Duplicate parent key",
};

const statusFilterOptions = [
    { value: "all", label: "All statuses" },
    { value: "resolved", label: "Resolved" },
    { value: "out_of_sync", label: "Out of sync" },
    { value: "missing", label: "Missing" },
    { value: "legacy_match", label: "Legacy match" },
    { value: "conflict", label: "Conflict" },
    { value: "unmanaged", label: "Unmanaged" },
] as const;

function formatIssueLabel(status: DataKeyIntegrityReport["entries"][number]["status"]) {
    switch (status) {
        case "out_of_sync":
            return "Out of sync";
        case "legacy_match":
            return "Not linked properly";
        case "missing":
            return "Missing from library";
        case "conflict":
            return "Conflict";
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
    if (entry.problemId) {
        return `/script/${entry.scriptId}/problem/${entry.problemId}`;
    }

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
    integrity?: (DataKeyIntegrityReport & { policy?: IntegrityPolicy | null }) | null;
}) {
    const router = useRouter();
    const { viewOnly } = useAppContext();
    const { alert } = useAlertModal();
    const [isRepairing, startRepairTransition] = useTransition();
    const [resolvingKey, setResolvingKey] = useState<string | null>(null);
    const [issueScopeFilter, setIssueScopeFilter] = useState<"all" | "blocking" | "non_blocking">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | DataKeyIntegrityReport["entries"][number]["status"]>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [repairModalEntry, setRepairModalEntry] = useState<DataKeyIntegrityReport["entries"][number] | null>(null);
    const [repairPreview, setRepairPreview] = useState<Awaited<ReturnType<typeof previewDataKeyIntegrityEntryRepair>>["preview"] | null>(null);
    const [loadingRepairPreview, setLoadingRepairPreview] = useState(false);
    const [selectedTargetUniqueKey, setSelectedTargetUniqueKey] = useState<string>("");
    const [reviewAcknowledged, setReviewAcknowledged] = useState(false);
    const [bulkResolveStatus, setBulkResolveStatus] = useState<null | "out_of_sync" | "legacy_match">(null);
    const [bulkReviewItems, setBulkReviewItems] = useState<Array<Awaited<ReturnType<typeof previewDataKeyIntegrityEntriesBulk>>["previews"][number]>>([]);
    const [loadingBulkPreview, setLoadingBulkPreview] = useState(false);
    const [showReviewedBulkItemsOnly, setShowReviewedBulkItemsOnly] = useState(false);
    const bulkReviewScrollRef = useRef<HTMLDivElement | null>(null);
    const pendingBulkScrollTopRef = useRef<number | null>(null);
    const [repairEntryParam, setRepairEntryParam] = useQueryState("dataKeyRepair", {
        defaultValue: "",
        clearOnDefault: true,
    });
    const [bulkStatusParam, setBulkStatusParam] = useQueryState("dataKeyBulkResolve", {
        defaultValue: "",
        clearOnDefault: true,
    });

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
    const availableStatusOptions = statusFilterOptions.filter((option) => {
        if (option.value === "all") return true;
        if (issueScopeFilter === "blocking") {
            return option.value !== "resolved";
        }
        if (issueScopeFilter === "non_blocking") {
            return !["missing", "legacy_match", "unmanaged"].includes(option.value);
        }
        return true;
    });
    const filteredEntries = entries.filter((entry) => {
        if (issueScopeFilter === "blocking" && !isBlockingEntry(entry, integrity?.policy || undefined)) return false;
        if (issueScopeFilter === "non_blocking" && isBlockingEntry(entry, integrity?.policy || undefined)) return false;
        if (statusFilter !== "all" && entry.status !== statusFilter) return false;
        if (typeFilter !== "all" && entry.expectedDataType !== typeFilter) return false;
        return true;
    });

    const getEntryKey = (entry: DataKeyIntegrityReport["entries"][number]) => `${entry.kind}::${entry.location}::${entry.currentUniqueKey || entry.currentKey || ""}`;
    const bulkResolvableEntries = {
        out_of_sync: entries.filter((entry) => (
            entry.status === "out_of_sync" &&
            entry.kind !== "screen_option_collection" &&
            entry.kind !== "field_option_collection"
        )),
        legacy_match: entries.filter((entry) => entry.status === "legacy_match"),
    };
    const hasBulkResolveActions = !!bulkResolvableEntries.out_of_sync.length || !!bulkResolvableEntries.legacy_match.length;
    const hasActiveFilters = issueScopeFilter !== "all" || statusFilter !== "all" || typeFilter !== "all";

    useEffect(() => {
        const selectedOptionStillAvailable = availableStatusOptions.some((option) => option.value === statusFilter);
        if (!selectedOptionStillAvailable) setStatusFilter("all");
    }, [availableStatusOptions, statusFilter]);

    const closeRepairModal = () => {
        if (isRepairing || loadingRepairPreview) return;
        setRepairModalEntry(null);
        setRepairPreview(null);
        setSelectedTargetUniqueKey("");
        setReviewAcknowledged(false);
        void setRepairEntryParam("");
    };

    const closeBulkReviewDrawer = () => {
        if (isRepairing || loadingBulkPreview) return;
        setBulkResolveStatus(null);
        setBulkReviewItems([]);
        setShowReviewedBulkItemsOnly(false);
        void setBulkStatusParam("");
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
                || entry.suggestedUniqueKeys?.[0]
                || entry.currentUniqueKey
                || ""
        );
        setLoadingRepairPreview(false);
        return res;
    };

    const loadBulkRepairPreview = async ({
        items,
        status,
    }: {
        items: Array<{
            entry: DataKeyIntegrityReport["entries"][number];
            selectedTargetUniqueKey?: string;
            reviewed?: boolean;
        }>;
        status: "out_of_sync" | "legacy_match";
    }) => {
        setLoadingBulkPreview(true);
        const res = await previewDataKeyIntegrityEntriesBulk({ items });
        if (!res.success) {
            setLoadingBulkPreview(false);
            return res;
        }

        setBulkResolveStatus(status);
        setBulkReviewItems(res.previews);
        setLoadingBulkPreview(false);
        return res;
    };

    const openRepairModal = async (entry: DataKeyIntegrityReport["entries"][number]) => {
        if (!scriptId || viewOnly || isRepairing || loadingRepairPreview) return;
        await setBulkStatusParam("");
        await setRepairEntryParam(getEntryKey(entry));
        setRepairModalEntry(entry);
        setRepairPreview(null);
        setSelectedTargetUniqueKey("");
        setReviewAcknowledged(false);
        const res = await loadRepairPreview({ entry });
        if (!res.success) {
            setRepairModalEntry(null);
            setRepairPreview(null);
            setSelectedTargetUniqueKey("");
            await setRepairEntryParam("");
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
        if (!scriptId || viewOnly || isRepairing) return;
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
                    toast.message(res.warnings.join(" "));
                }
            }

            setResolvingKey(null);
            setRepairModalEntry(null);
            setRepairPreview(null);
            setSelectedTargetUniqueKey("");
            setReviewAcknowledged(false);
            await setRepairEntryParam("");
            router.refresh();
        });
    };

    const openBulkResolveDrawer = async (status: "out_of_sync" | "legacy_match") => {
        if (!scriptId || viewOnly || isRepairing || loadingBulkPreview) return;
        const entriesToResolve = bulkResolvableEntries[status];
        if (!entriesToResolve.length) return;
        await setRepairEntryParam("");
        await setBulkStatusParam(status);

        const res = await loadBulkRepairPreview({
            status,
            items: entriesToResolve.map((entry) => ({
                entry,
                selectedTargetUniqueKey: entry.matchedUniqueKey || entry.currentUniqueKey || "",
                reviewed: false,
            })),
        });

        if (!res.success) {
            await setBulkStatusParam("");
            alert({
                title: "Bulk preview failed",
                message: (res.errors?.length ? res.errors.join("<br />") : "Failed to prepare bulk review"),
                variant: "error",
                buttonLabel: "Close",
            });
        }
    };

    const handleBulkResolve = () => {
        if (!scriptId || viewOnly || isRepairing || !bulkResolveStatus) return;
        const reviewedItems = bulkReviewItems.filter((item) => item.reviewed);
        if (!reviewedItems.length) return;

        startRepairTransition(async () => {
            setResolvingKey(`bulk:${bulkResolveStatus}`);
            const res = await resolveDataKeyIntegrityEntriesBulk({
                items: reviewedItems.map((item) => ({
                    entry: item.entry,
                    selectedTargetUniqueKey: item.selectedTargetUniqueKey || undefined,
                    reviewed: item.reviewed,
                })),
            });

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
                toast.message(`No ${bulkResolveStatus.replace(/_/g, " ")} references needed changes`);
            } else {
                toast.success(`Saved ${res.resolvedCount} ${bulkResolveStatus.replace(/_/g, " ")} repair draft${res.resolvedCount === 1 ? "" : "s"}`);
                if (res.warnings?.length) {
                    toast.message(res.warnings.join(" "));
                }
            }

            setResolvingKey(null);
            closeBulkReviewDrawer();
            router.refresh();
        });
    };

    const renderActions = (entry: DataKeyIntegrityReport["entries"][number]) => {
        const createHref = `/data-keys/new?name=${encodeURIComponent(entry.currentKey || "")}&label=${encodeURIComponent(entry.currentLabel || entry.currentKey || "")}&dataType=${encodeURIComponent(entry.expectedDataType || "")}`;
        const editHref = entry.matchedUniqueKey ? `/data-keys/edit/${entry.matchedUniqueKey}` : undefined;
        const usageHref = buildUsageHref(entry);
        const canSafeResolve = !viewOnly && (
            entry.status === "legacy_match" ||
            (
                (entry.status === "missing" || entry.status === "unmanaged") &&
                !!entry.suggestedUniqueKeys?.length
            ) ||
            (
                entry.status === "out_of_sync" &&
                entry.kind !== "screen_option_collection" &&
                entry.kind !== "field_option_collection"
            )
        );
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

    const bulkReviewableItems = bulkReviewItems.filter((item) => item.changed);
    const reviewedBulkItemsCount = bulkReviewableItems.filter((item) => item.reviewed).length;
    const allBulkReviewableItemsReviewed = !!bulkReviewableItems.length && reviewedBulkItemsCount === bulkReviewableItems.length;
    const someBulkReviewableItemsReviewed = reviewedBulkItemsCount > 0 && reviewedBulkItemsCount < bulkReviewableItems.length;
    const visibleBulkReviewItems = showReviewedBulkItemsOnly
        ? bulkReviewableItems.filter((item) => item.reviewed)
        : bulkReviewableItems;

    useEffect(() => {
        if (viewOnly) return;
        if (!repairEntryParam || repairModalEntry || isRepairing || loadingRepairPreview) return;
        const matchedEntry = entries.find((entry) => getEntryKey(entry) === repairEntryParam);
        if (!matchedEntry) {
            void setRepairEntryParam("");
            return;
        }
        void openRepairModal(matchedEntry);
    }, [entries, isRepairing, loadingRepairPreview, openRepairModal, repairEntryParam, repairModalEntry, setRepairEntryParam, viewOnly]);

    useEffect(() => {
        if (viewOnly) return;
        if (!bulkStatusParam || bulkResolveStatus || isRepairing || loadingBulkPreview) return;
        if (bulkStatusParam !== "out_of_sync" && bulkStatusParam !== "legacy_match") {
            void setBulkStatusParam("");
            return;
        }
        if (!bulkResolvableEntries[bulkStatusParam].length) {
            void setBulkStatusParam("");
            return;
        }
        void openBulkResolveDrawer(bulkStatusParam);
    }, [bulkResolvableEntries, bulkResolveStatus, bulkStatusParam, isRepairing, loadingBulkPreview, openBulkResolveDrawer, setBulkStatusParam, viewOnly]);

    useEffect(() => {
        if (!viewOnly) return;
        setRepairModalEntry(null);
        setRepairPreview(null);
        setSelectedTargetUniqueKey("");
        setReviewAcknowledged(false);
        setBulkResolveStatus(null);
        setBulkReviewItems([]);
        setShowReviewedBulkItemsOnly(false);
        void setRepairEntryParam("");
        void setBulkStatusParam("");
    }, [setBulkStatusParam, setRepairEntryParam, viewOnly]);

    useEffect(() => {
        if (loadingBulkPreview) return;
        if (pendingBulkScrollTopRef.current === null) return;

        const scrollTop = pendingBulkScrollTopRef.current;
        pendingBulkScrollTopRef.current = null;

        requestAnimationFrame(() => {
            if (bulkReviewScrollRef.current) {
                bulkReviewScrollRef.current.scrollTop = scrollTop;
            }
        });
    }, [bulkReviewItems, loadingBulkPreview]);

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
                            disabled={!repairModalEntry || isRepairing || loadingRepairPreview || !reviewAcknowledged || (!repairPreview?.screens.length && !repairPreview?.diagnoses.length && !repairPreview?.problems.length)}
                        >
                            {isRepairing ? "Saving Draft..." : "Save Repair Draft"}
                        </Button>
                    </>
                )}
            >
                {!repairModalEntry || loadingRepairPreview ? (
                    <div className="text-sm text-muted-foreground">Preparing repair preview...</div>
                ) : !repairPreview?.screens.length && !repairPreview?.diagnoses.length && !repairPreview?.problems.length ? (
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

                            {!!repairPreview.problems.length && (
                                <div>
                                    <div className="text-muted-foreground">Affected problems</div>
                                    <div className="space-y-1">
                                        {repairPreview.problems.map((problem) => (
                                            <Link
                                                key={problem.problemId}
                                                href={`/script/${problem.scriptId}/problem/${problem.problemId}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                                            >
                                                <span>{problem.title}</span>
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
                open={false}
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
                            onClick={() => handleBulkResolve()}
                            disabled={!bulkResolveStatus || isRepairing || !reviewedBulkItemsCount}
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

            <Sheet open={!!bulkResolveStatus} onOpenChange={(open) => { if (!open) closeBulkReviewDrawer(); }}>
                <SheetContent hideCloseButton side="right" className="p-0 m-0 flex flex-col sm:max-w-3xl w-full">
                    <SheetHeader className="py-4 px-4 border-b border-b-border text-left">
                        <SheetTitle>
                            {bulkResolveStatus ? `Review ${bulkResolveStatus.replace(/_/g, " ")} repairs` : "Review bulk repairs"}
                        </SheetTitle>
                        <SheetDescription>
                            Review each suggested repair, change the data key if needed, and tick each item when you are satisfied.
                        </SheetDescription>
                    </SheetHeader>

                    <div ref={bulkReviewScrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                        {loadingBulkPreview ? (
                            <div className="text-sm text-muted-foreground">Preparing bulk repair review...</div>
                        ) : !bulkReviewableItems.length ? (
                            <div className="rounded-md border p-3 text-sm text-muted-foreground">
                                No deterministic repair drafts are available for the selected entries.
                            </div>
                        ) : (
                            <>
                                <div className="sticky top-0 z-10 -mx-4 border-b bg-background px-4 pb-4">
                                    <div className="rounded-md border p-3 space-y-3 text-sm">
                                        <div className="text-muted-foreground">
                                            {bulkReviewableItems.length} reviewable, {reviewedBulkItemsCount} selected for save. Unreviewed entries will be left unchanged.
                                        </div>

                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    id="bulk-review-select-all"
                                                    checked={
                                                        allBulkReviewableItemsReviewed
                                                            ? true
                                                            : someBulkReviewableItemsReviewed
                                                                ? "indeterminate"
                                                                : false
                                                    }
                                                    onCheckedChange={(checked) => {
                                                        const nextReviewed = checked === true;
                                                        setBulkReviewItems((current) => current.map((candidate) => (
                                                            candidate.changed
                                                                ? {
                                                                    ...candidate,
                                                                    reviewed: nextReviewed,
                                                                }
                                                                : candidate
                                                        )));
                                                    }}
                                                />

                                                <Label htmlFor="bulk-review-select-all" className="leading-5">
                                                    Mark all {bulkReviewableItems.length} suggested repair{bulkReviewableItems.length === 1 ? "" : "s"} for save
                                                </Label>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="flex items-start gap-2">
                                                    <Checkbox
                                                        id="bulk-review-show-reviewed-only"
                                                        checked={showReviewedBulkItemsOnly}
                                                        onCheckedChange={(checked) => setShowReviewedBulkItemsOnly(checked === true)}
                                                    />
                                                    <Label htmlFor="bulk-review-show-reviewed-only" className="leading-5">
                                                        Reviewed items only
                                                    </Label>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={!reviewedBulkItemsCount}
                                                    onClick={() => {
                                                        setBulkReviewItems((current) => current.map((candidate) => (
                                                            candidate.changed
                                                                ? {
                                                                    ...candidate,
                                                                    reviewed: false,
                                                                }
                                                                : candidate
                                                        )));
                                                    }}
                                                >
                                                    Clear all
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {!visibleBulkReviewItems.length ? (
                                    <div className="rounded-md border p-3 text-sm text-muted-foreground">
                                        No reviewed items are currently selected.
                                    </div>
                                ) : visibleBulkReviewItems.map((item, index) => {
                                    const originalIndex = bulkReviewItems.findIndex((candidate) => candidate === item);
                                    const usageHref = buildUsageHref(item.entry);

                                    return (
                                        <div key={`${getEntryKey(item.entry)}::${index}`} className="rounded-md border p-4 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    id={`bulk-review-${originalIndex}`}
                                                    checked={item.reviewed === true}
                                                    onCheckedChange={(checked) => {
                                                        setBulkReviewItems((current) => current.map((candidate, candidateIndex) => (
                                                            candidateIndex !== originalIndex
                                                                ? candidate
                                                                : {
                                                                    ...candidate,
                                                                    reviewed: checked === true,
                                                                }
                                                        )));
                                                    }}
                                                />

                                                <div className="flex-1 space-y-3">
                                                    <Label htmlFor={`bulk-review-${originalIndex}`} className="leading-5">
                                                        I have reviewed this suggested repair
                                                    </Label>

                                                    <div className="grid gap-3 md:grid-cols-2">
                                                        <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-2">
                                                            <div className="text-xs font-semibold uppercase tracking-wide text-red-700">From</div>
                                                            <div className="font-medium text-red-950">{formatReferenceLabel(item.entry)}</div>
                                                            <div className="text-sm text-red-900">{item.entry.reason}</div>
                                                            <Link href={usageHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-red-900 underline-offset-4 hover:underline">
                                                                <span>Open usage</span>
                                                                <ExternalLinkIcon className="h-3 w-3" />
                                                            </Link>
                                                        </div>

                                                        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                                                            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">To</div>
                                                            <div className="font-medium text-emerald-950">Suggested data key</div>
                                                            <SelectDataKey
                                                                modal
                                                                value={item.targetDataKey?.name || item.targetDataKey?.label || ""}
                                                                placeholder="Select data key"
                                                                 type={item.entry.expectedDataType || undefined}
                                                                 disabled={isRepairing || loadingBulkPreview}
                                                                 onChange={async ([dataKey]) => {
                                                                     pendingBulkScrollTopRef.current = bulkReviewScrollRef.current?.scrollTop ?? null;
                                                                     const nextItems = bulkReviewItems.map((candidate, candidateIndex) => (
                                                                         candidateIndex !== originalIndex
                                                                             ? candidate
                                                                             : {
                                                                                 ...candidate,
                                                                                 reviewed: false,
                                                                                 selectedTargetUniqueKey: dataKey?.uniqueKey || "",
                                                                            }
                                                                    ));
                                                                    setBulkReviewItems(nextItems);
                                                                    const previewRes = await loadBulkRepairPreview({
                                                                        status: bulkResolveStatus!,
                                                                        items: nextItems.map((candidate) => ({
                                                                            entry: candidate.entry,
                                                                            reviewed: candidate.reviewed,
                                                                            selectedTargetUniqueKey: candidate.selectedTargetUniqueKey || undefined,
                                                                        })),
                                                                    });
                                                                    if (!previewRes.success) {
                                                                        alert({
                                                                            title: "Bulk preview failed",
                                                                            message: (previewRes.errors?.length ? previewRes.errors.join("<br />") : "Failed to preview bulk repair"),
                                                                            variant: "error",
                                                                            buttonLabel: "Close",
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <div className="text-sm text-emerald-900">
                                                                Use the suggested data key, or pick a different one.
                                                            </div>
                                                            {!!item.targetDataKey?.label && (
                                                                <div className="text-xs text-emerald-800">Label: {item.targetDataKey.label}</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-md border p-3 space-y-2">
                                                        <div className="font-medium">Affected usage</div>
                                                        {!!item.screens.length && (
                                                            <div className="space-y-1">
                                                                {item.screens.map((screen) => (
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
                                                        )}
                                                        {!!item.diagnoses.length && (
                                                            <div className="space-y-1">
                                                                {item.diagnoses.map((diagnosis) => (
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
                                                        )}
                                                        {!!item.problems.length && (
                                                            <div className="space-y-1">
                                                                {item.problems.map((problem) => (
                                                                    <Link
                                                                        key={problem.problemId}
                                                                        href={`/script/${problem.scriptId}/problem/${problem.problemId}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                                                                    >
                                                                        <span>{problem.title}</span>
                                                                        <ExternalLinkIcon className="h-3 w-3" />
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>

                    <SheetFooter className="px-4 py-4 border-t border-t-border">
                        <Button variant="ghost" onClick={closeBulkReviewDrawer} disabled={isRepairing || loadingBulkPreview}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleBulkResolve()}
                            disabled={!bulkResolveStatus || isRepairing || loadingBulkPreview || reviewedBulkItemsCount === 0}
                        >
                            {isRepairing ? "Saving Drafts..." : `Save ${reviewedBulkItemsCount || ""} Reviewed Repair Draft${reviewedBulkItemsCount === 1 ? "" : "s"}`}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

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
                        {integrity?.policy?.enforcementMode === "off"
                            ? "This view shows all scanned script references. Integrity issues are still visible here for review, but publish enforcement is currently turned off in settings."
                            : integrity?.policy?.enforcementMode === "warn_only"
                                ? "This view shows all scanned script references. Integrity issues follow the configured rule set, but publish is currently running in warn-only mode."
                                : integrity?.policy?.enforcementMode === "block_new_issues_only"
                                    ? "This view shows all scanned script references. Publish only blocks newly introduced blocking issues that are not part of the captured baseline."
                                    : "This view shows all scanned script references. Publish is blocked by missing, unlinked, or unmanaged datakeys, duplicate parent datakeys in the same script, and script options that no longer exist in the parent datakey pool."}
                    </div>

                    {viewOnly && (
                        <div className="text-sm text-muted-foreground">
                            You are in view mode. Repairs and bulk resolve are disabled on this screen until you switch back to development mode.
                        </div>
                    )}

                    <div className="rounded-md border p-3 space-y-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="flex flex-col gap-3">
                                <div className="text-sm text-muted-foreground">
                                    {viewOnly
                                        ? "Review issues from the row menu. Repair actions are disabled in view mode."
                                        : "Review issues from the row menu, or use bulk resolve for safe deterministic fixes in this script."}
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                            <div className="w-full md:w-[220px]">
                                <Select
                                    value={issueScopeFilter}
                                    onValueChange={(value) => setIssueScopeFilter(value as typeof issueScopeFilter)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by issue scope" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All issues</SelectItem>
                                        <SelectItem value="blocking">Blocking issues</SelectItem>
                                        <SelectItem value="non_blocking">Non-blocking issues</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full md:w-[220px]">
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableStatusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
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

                            <div className="flex items-center">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={!hasActiveFilters}
                                    onClick={() => {
                                        setIssueScopeFilter("all");
                                        setStatusFilter("all");
                                        setTypeFilter("all");
                                    }}
                                >
                                    Clear filters
                                </Button>
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                            {integrity?.policy?.enforcementMode === "warn_only"
                                ? "Blocking issues match the configured rule set, but publish is currently running in warn-only mode."
                                : integrity?.policy?.enforcementMode === "off"
                                    ? "Integrity enforcement is currently turned off in settings. The issue counts below still reflect the configured rule set."
                                    : integrity?.policy?.enforcementMode === "block_new_issues_only"
                                        ? "Blocking issues match the configured rule set. In block new issues only mode, existing baseline issues may still be allowed at publish."
                                    : "Blocking issues are the entries that currently prevent publish. Status options update based on the selected issue scope."}
                        </div>

                        {!viewOnly && hasBulkResolveActions && (
                            <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bulk resolve</span>
                                {!!bulkResolvableEntries.out_of_sync.length && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={isRepairing}
                                        onClick={() => openBulkResolveDrawer("out_of_sync")}
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
                                        onClick={() => openBulkResolveDrawer("legacy_match")}
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
                            issue.status === "out_of_sync" && issue.kind !== "screen_option_collection" && issue.kind !== "field_option_collection"
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
