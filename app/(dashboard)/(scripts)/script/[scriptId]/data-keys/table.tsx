'use client';

import { useState, useTransition } from "react";
import { CopyIcon, ExternalLinkIcon, MoreVertical, WrenchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { resolveDataKeyIntegrityEntry } from "@/app/actions/data-keys";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
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

export function ScriptDataKeysTable({ data: { title, scriptId }, integrity }: {
    data: Awaited<ReturnType<typeof getScriptsWithItems>>['data'][0];
    integrity?: DataKeyIntegrityReport | null;
}) {
    const router = useRouter();
    const [isRepairing, startRepairTransition] = useTransition();
    const [resolvingKey, setResolvingKey] = useState<string | null>(null);
    const [viewFilter, setViewFilter] = useState<"all" | "blocking" | "issues" | "resolved">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | DataKeyIntegrityReport["entries"][number]["status"]>("all");

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
    const filteredEntries = entries.filter((entry) => {
        if (viewFilter === "blocking" && !["missing", "legacy_match", "conflict"].includes(entry.status)) return false;
        if (viewFilter === "issues" && entry.status === "resolved") return false;
        if (viewFilter === "resolved" && entry.status !== "resolved") return false;
        if (statusFilter !== "all" && entry.status !== statusFilter) return false;
        return true;
    });

    const getEntryKey = (entry: DataKeyIntegrityReport["entries"][number]) => `${entry.kind}::${entry.location}::${entry.currentUniqueKey || entry.currentKey || ""}`;

    const handleResolveEntry = (entry: DataKeyIntegrityReport["entries"][number]) => {
        if (!scriptId || isRepairing) return;
        startRepairTransition(async () => {
            setResolvingKey(getEntryKey(entry));
            const res = await resolveDataKeyIntegrityEntry({ entry });

            if (!res.success) {
                toast.error(res.errors?.join(", ") || "Failed to repair data key references");
                setResolvingKey(null);
                return;
            }

            if (!res.changed) {
                toast.message("No safe change was applied for this reference");
            } else {
                toast.success(`Resolved ${entry.status.replace(/_/g, " ")} issue for ${entry.currentKey || entry.currentLabel || entry.location}`);
            }

            setResolvingKey(null);
            router.refresh();
        });
    };

    const renderActions = (entry: DataKeyIntegrityReport["entries"][number]) => {
        const createHref = `/data-keys/new?name=${encodeURIComponent(entry.currentKey || "")}&label=${encodeURIComponent(entry.currentLabel || entry.currentKey || "")}&dataType=${encodeURIComponent(entry.expectedDataType || "")}`;
        const editHref = entry.matchedUniqueKey ? `/data-keys/edit/${entry.matchedUniqueKey}` : undefined;
        const usageHref = entry.diagnosisId
            ? `/script/${entry.scriptId}/diagnosis/${entry.diagnosisId}`
            : entry.screenId
                ? `/script/${entry.scriptId}/screen/${entry.screenId}`
                : `/script/${entry.scriptId}`;
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
                        <DropdownMenuItem onClick={() => handleResolveEntry(entry)} disabled={isRepairing}>
                            <WrenchIcon className="mr-2 h-4 w-4" />
                            {isResolvingThisEntry ? "Resolving..." : "Resolve"}
                        </DropdownMenuItem>
                    )}

                    {editHref && (
                        <DropdownMenuItem asChild>
                            <Link href={editHref}>
                                <ExternalLinkIcon className="mr-2 h-4 w-4" />
                                Open matched data key
                            </Link>
                        </DropdownMenuItem>
                    )}

                    {(entry.status === "missing" || entry.status === "unmanaged") && (
                        <DropdownMenuItem asChild>
                            <Link href={createHref}>
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
                                toast.error("Failed to copy reference");
                            }
                        }}
                    >
                        <CopyIcon className="mr-2 h-4 w-4" />
                        Copy reference
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                        <Link href={libraryHref}>
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
                        This view shows all scanned script references. Blocking issues stop publish. Unmanaged references are legacy or local script keys that are not explicitly linked to the data key library.
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
