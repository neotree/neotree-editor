'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, RefreshCw } from "lucide-react";

import { closeContentSyncHotfix, saveContentSyncSettings } from "@/app/actions/content-sync";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContentSyncStatusBadge } from "@/components/content-sync-status-badge";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useContentSyncStatus } from "@/hooks/use-content-sync-status";
import { isOutOfSync, type ContentSyncPair, type ContentSyncSettings } from "@/lib/content-sync";

type Props = {
    initialSettings: ContentSyncSettings;
    sites: { siteId: string; name: string; link: string; env: string | null }[];
    canManage: boolean;
    appUrl: string;
};

const roleOptions: { value: ContentSyncSettings["role"]; label: string; description: string }[] = [
    { value: "off", label: "Off", description: "No syncing rules. Scripts can be edited and imported as before." },
    { value: "source", label: "Source (e.g. DEV)", description: "Content is edited on this editor. The linked editor imports it from here." },
    { value: "target", label: "Target (e.g. LIVE)", description: "Content comes from the linked editor by importing it. Editing it here is locked; admins can open a hotfix on one script in an emergency." },
];

const trimLink = (link?: string | null) => `${link || ""}`.replace(/\/+$/, "");

export function Content({ initialSettings, sites, canManage, appUrl }: Props) {
    const router = useRouter();
    const { alert } = useAlertModal();
    const { confirm } = useConfirmModal();
    const [settings, setSettings] = useState(initialSettings);
    const [saved, setSaved] = useState(initialSettings);
    const [saving, setSaving] = useState(false);
    const sync = useContentSyncStatus();

    const dirty = JSON.stringify(settings) !== JSON.stringify(saved);
    const linkedSite = useMemo(() => sites.find(s => s.siteId === settings.linkedSiteId) || null, [sites, settings.linkedSiteId]);
    const otherSites = sites.filter(s => trimLink(s.link) !== trimLink(appUrl));
    const isTarget = settings.role === "target";
    const off = settings.role === "off";

    const save = async () => {
        setSaving(true);
        try {
            const res = await saveContentSyncSettings(settings);
            if (!res.success || !res.settings) throw new Error(res.errors?.join(", ") || "Failed to save");
            setSettings(res.settings);
            setSaved(res.settings);
            alert({ variant: "success", title: "Saved", message: "Content sync settings were saved.", onClose: () => router.refresh() });
            sync.refresh();
        } catch (e: any) {
            alert({ variant: "error", title: "Error", message: e.message });
        } finally {
            setSaving(false);
        }
    };

    const setSwitch = (update: (s: ContentSyncSettings) => ContentSyncSettings) => setSettings(current => update(current));

    const statusPairs = sync.status?.pairs || [];
    const outOfSync = statusPairs.filter(p => isOutOfSync(p.status)).length;
    const remoteLink = trimLink(sync.linkedSite?.link);
    const sourceName = sync.sourceName;
    const targetName = sync.targetName;

    const actionsFor = (pair: ContentSyncPair) => {
        const actions: { label: string; href: string; external?: boolean }[] = [];
        if (saved.role === "target") {
            if (pair.sourceScriptId && pair.targetScriptId && ["source_ahead", "never_synced", "diverged"].includes(pair.status)) {
                actions.push({ label: `Import from ${sourceName}`, href: `/script/${pair.targetScriptId}?import=1&source=${pair.sourceScriptId}` });
            }
            if (pair.status === "only_on_source" && pair.sourceScriptId) {
                actions.push({ label: "Import as a new script", href: `/?import=1&source=${pair.sourceScriptId}` });
            }
            if (pair.sourceScriptId && pair.targetScriptId && ["target_ahead", "diverged"].includes(pair.status) && remoteLink) {
                actions.push({ label: `Bring back on ${sourceName}`, href: `${remoteLink}/script/${pair.sourceScriptId}?import=1&source=${pair.targetScriptId}`, external: true });
            }
        } else if (saved.role === "source") {
            if (pair.sourceScriptId && pair.targetScriptId && ["target_ahead", "diverged"].includes(pair.status)) {
                actions.push({ label: `Bring back from ${targetName}`, href: `/script/${pair.sourceScriptId}?import=1&source=${pair.targetScriptId}` });
            }
            if (pair.sourceScriptId && pair.targetScriptId && ["source_ahead", "never_synced"].includes(pair.status) && remoteLink) {
                actions.push({ label: `Import on ${targetName}`, href: `${remoteLink}/script/${pair.targetScriptId}?import=1&source=${pair.sourceScriptId}`, external: true });
            }
            if (pair.status === "only_on_source" && pair.sourceScriptId && remoteLink) {
                actions.push({ label: `Import on ${targetName} as a new script`, href: `${remoteLink}/?import=1&source=${pair.sourceScriptId}`, external: true });
            }
        }
        return actions;
    };

    const closeHotfix = (scriptId: string) => confirm(async () => {
        const res = await closeContentSyncHotfix({ scriptId });
        if (!res.success) alert({ variant: "error", title: "Error", message: res.errors?.join(", ") || "Failed" });
        else { router.refresh(); sync.refresh(); }
    }, {
        title: "Close the hotfix?",
        message: "The script is locked again. Make sure the change has been brought back to the source editor.",
    });

    return (
        <>
            {(saving || sync.loading) && <Loader overlay />}

            <div className="space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Content sync</CardTitle>
                        <CardDescription>
                            Keep scripts on two editors (for example DEV and LIVE) the same: scripts are edited on the source and imported
                            into the target, where editing them is locked. Each script is compared on its own with the same script on the
                            other editor; data versions and how often each editor publishes do not matter. Only super users can change
                            these settings.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {!canManage && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                You can view these settings, but only super users can change them.
                            </div>
                        )}

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-2">
                                <Label>This editor is</Label>
                                <Select
                                    value={settings.role}
                                    disabled={!canManage || saving}
                                    onValueChange={(value) => setSwitch(s => ({ ...s, role: value as ContentSyncSettings["role"] }))}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {roleOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <div className="text-sm text-muted-foreground">{roleOptions.find(o => o.value === settings.role)?.description}</div>
                            </div>

                            <div className="space-y-2">
                                <Label>{isTarget ? "Source editor" : "Linked editor"}</Label>
                                <Select
                                    value={settings.linkedSiteId || ""}
                                    disabled={!canManage || saving || off}
                                    onValueChange={(value) => setSwitch(s => ({ ...s, linkedSiteId: value || null }))}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select an editor from Sites" /></SelectTrigger>
                                    <SelectContent>
                                        {otherSites.map(site => (
                                            <SelectItem key={site.siteId} value={site.siteId}>{site.name} ({site.link})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="text-sm text-muted-foreground">
                                    {isTarget
                                        ? "Content is imported from this editor. It must also list this editor in its Sites, as its target."
                                        : "The editor that imports content from here. Add it under Settings > General > Sites if it is missing."}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm font-medium">Editing lock {isTarget ? "" : "(target editors only)"}</div>
                            {([
                                ["scripts", "Scripts", "Scripts, screens, diagnoses and problems."],
                                ["dataKeys", "Data keys", "The data key library."],
                                ["drugsLibrary", "Drugs, fluids & feeds", "The drugs library."],
                            ] as const).map(([key, label, description]) => (
                                <div key={key} className="flex items-start gap-3 rounded-md border p-3">
                                    <Switch
                                        id={`content-sync-lock-${key}`}
                                        checked={settings.lock[key]}
                                        disabled={!canManage || saving || !isTarget}
                                        onCheckedChange={(checked) => setSwitch(s => ({ ...s, lock: { ...s.lock, [key]: checked } }))}
                                    />
                                    <div>
                                        <Label htmlFor={`content-sync-lock-${key}`}>{label}</Label>
                                        <div className="text-sm text-muted-foreground">{description} Can only be changed by importing from the source editor.</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm font-medium">Hotfixes {isTarget ? "" : "(target editors only)"}</div>
                            <div className="flex items-start gap-3 rounded-md border p-3">
                                <Switch
                                    id="content-sync-hotfixes"
                                    checked={settings.hotfixes.enabled}
                                    disabled={!canManage || saving || !isTarget}
                                    onCheckedChange={(checked) => setSwitch(s => ({ ...s, hotfixes: { ...s.hotfixes, enabled: checked } }))}
                                />
                                <div>
                                    <Label htmlFor="content-sync-hotfixes">Allow hotfixes</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Admins can unlock one script for an emergency change here. The script shows as ahead of the source until
                                        the change is brought back there.
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-md border p-3">
                                <Switch
                                    id="content-sync-hotfix-library"
                                    checked={settings.hotfixes.allowLibraryEdits}
                                    disabled={!canManage || saving || !isTarget || !settings.hotfixes.enabled}
                                    onCheckedChange={(checked) => setSwitch(s => ({ ...s, hotfixes: { ...s.hotfixes, allowLibraryEdits: checked } }))}
                                />
                                <div>
                                    <Label htmlFor="content-sync-hotfix-library">Library changes during a hotfix</Label>
                                    <div className="text-sm text-muted-foreground">
                                        While a hotfix is open, admins may also change data keys and the drugs library (for example to add an option the fix needs).
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm font-medium">Other</div>
                            <div className="flex items-start gap-3 rounded-md border p-3">
                                <Switch
                                    id="content-sync-same-ids"
                                    checked={settings.keepSameIds}
                                    disabled={!canManage || saving || off}
                                    onCheckedChange={(checked) => setSwitch(s => ({ ...s, keepSameIds: checked }))}
                                />
                                <div>
                                    <Label htmlFor="content-sync-same-ids">Same ids on both editors</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Imported scripts, screens, diagnoses and problems keep the source&apos;s ids when they are free here, which keeps
                                        the two editors easy to compare.
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-md border p-3">
                                <Switch
                                    id="content-sync-show-status"
                                    checked={settings.showStatus}
                                    disabled={!canManage || saving || off}
                                    onCheckedChange={(checked) => setSwitch(s => ({ ...s, showStatus: checked }))}
                                />
                                <div>
                                    <Label htmlFor="content-sync-show-status">Show sync status</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Status badges on the scripts list and an out-of-sync count in the top bar for admins.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {canManage && (
                            <div className="flex justify-end gap-x-2">
                                <Button variant="ghost" disabled={!dirty || saving} onClick={() => setSettings(saved)}>Reset</Button>
                                <Button disabled={!dirty || saving} onClick={save}>Save settings</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {saved.role !== "off" && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-start gap-x-2">
                                <div className="flex-1">
                                    <CardTitle>Sync status</CardTitle>
                                    <CardDescription>
                                        {sync.status?.checkedAt
                                            ? `${outOfSync} of ${statusPairs.length} script${statusPairs.length === 1 ? "" : "s"} need attention. Each script is compared with its counterpart only. Checked ${new Date(sync.status.checkedAt).toLocaleString()}.`
                                            : "Compares each published script with its counterpart on the other editor."}
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm" disabled={sync.loading} onClick={() => sync.refresh()}>
                                    <RefreshCw className="mr-2 h-4 w-4" /> Check now
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!!sync.status?.errors?.length && (
                                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                                    {sync.status.errors.join(" ")}
                                </div>
                            )}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{saved.role === "target" ? sourceName : "This editor (source)"}</TableHead>
                                        <TableHead>{saved.role === "target" ? "This editor (target)" : targetName}</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last synced</TableHead>
                                        <TableHead className="text-right">Next step</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {statusPairs.map((pair, i) => (
                                        <TableRow key={`${pair.sourceScriptId}-${pair.targetScriptId}-${i}`}>
                                            <TableCell>{pair.sourceTitle || <span className="text-muted-foreground">—</span>}</TableCell>
                                            <TableCell>
                                                {pair.targetTitle || <span className="text-muted-foreground">—</span>}
                                                {!!pair.hotfix && (
                                                    <div className="mt-1 text-xs text-amber-700">
                                                        Hotfix open{pair.hotfix.openedByName ? ` by ${pair.hotfix.openedByName}` : ""}: {pair.hotfix.reason}
                                                        {saved.role === "target" && pair.targetScriptId && (
                                                            <Button variant="link" size="sm" className="h-auto p-0 pl-2 text-xs" onClick={() => closeHotfix(pair.targetScriptId!)}>
                                                                Close
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <ContentSyncStatusBadge status={pair.status} sourceName={sourceName} targetName={targetName} />
                                                {pair.status === "pending" && (
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        Imported on {pair.pendingOn === "target" ? targetName : sourceName}, waiting to be published there.
                                                    </div>
                                                )}
                                                {pair.status === "never_synced" && pair.linkedBy !== "import" && (
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        Matched by {pair.linkedBy === "same_id" ? "id" : "title"}; import once to start syncing.
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {pair.syncedAt ? new Date(pair.syncedAt).toLocaleString() : "—"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end gap-y-1">
                                                    {actionsFor(pair).map(a => a.external ? (
                                                        <a key={a.label} href={a.href} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-primary hover:underline">
                                                            {a.label} <ExternalLink className="ml-1 h-3 w-3" />
                                                        </a>
                                                    ) : (
                                                        <Link key={a.label} href={a.href} className="text-sm text-primary hover:underline">{a.label}</Link>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!statusPairs.length && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                                                {sync.loading ? "Checking…" : "Nothing to show yet."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            {!!linkedSite && (
                                <div className="mt-3 text-xs text-muted-foreground">
                                    Linked editor: {linkedSite.name} ({linkedSite.link}).
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
