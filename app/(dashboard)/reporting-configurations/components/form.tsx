'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, KeyRound, Plug } from "lucide-react";

import {
    regenerateMobileAnalyticsKey,
    saveMobileAnalyticsConfig,
    testSupersetReachability,
} from "@/app/actions/mobile-analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { MAX_INACTIVITY_TIMEOUT_MINUTES, MIN_INACTIVITY_TIMEOUT_MINUTES } from "@/lib/mobile-analytics-constants";

type Props = {
    initialConfig: {
        supersetUrl: string;
        inactivityTimeoutMinutes: number;
        versionNumber: number;
        updatedAt: string;
    } | null;
    initialKey: {
        keyHint: string;
        generatedAt: string;
        lastUsedAt: string | null;
    } | null;
    loadError: string | null;
};

function formatDate(value?: string | null) {
    if (!value) return 'Never';
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

export function ReportingConfigurationsForm({ initialConfig, initialKey, loadError }: Props) {
    const router = useRouter();
    const { alert } = useAlertModal();
    const { confirm } = useConfirmModal();

    const [supersetUrl, setSupersetUrl] = useState(initialConfig?.supersetUrl || '');
    const [timeout, setTimeoutValue] = useState(`${initialConfig?.inactivityTimeoutMinutes ?? 15}`);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ ok: boolean; message: string; } | null>(null);
    const [regenerating, setRegenerating] = useState(false);
    const [newKey, setNewKey] = useState<string | null>(null);

    const hasKey = !!initialKey;

    const save = async () => {
        setSaving(true);
        try {
            const res = await saveMobileAnalyticsConfig({ supersetUrl, inactivityTimeoutMinutes: timeout });

            if (!res.success) {
                alert({ title: 'Error', message: res.errors?.join('\n') || 'Failed to save', variant: 'error' });
                return;
            }

            setSupersetUrl(res.config.supersetUrl);
            alert({
                title: 'Success',
                message: res.changed
                    ? `Configuration saved. Version is now ${res.config.versionNumber}.`
                    : 'No changes detected, so the version was not incremented.',
                variant: 'success',
            });
            router.refresh();
        } finally {
            setSaving(false);
        }
    };

    const test = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const res = await testSupersetReachability(supersetUrl);

            if (!res.success || !res.result) {
                setTestResult({ ok: false, message: res.errors?.join(', ') || 'Test failed' });
            } else if (res.result.reachable) {
                setTestResult({
                    ok: true,
                    message: `Reachable (HTTP ${res.result.status}, ${res.result.durationMs} ms). Login was not attempted.`,
                });
            } else {
                setTestResult({ ok: false, message: `Not reachable: ${res.result.error}` });
            }
        } finally {
            setTesting(false);
        }
    };

    const regenerate = () => {
        confirm(async () => {
            setRegenerating(true);
            try {
                const res = await regenerateMobileAnalyticsKey();

                if (!res.success) {
                    alert({ title: 'Error', message: res.errors?.join('\n') || 'Failed to generate key', variant: 'error' });
                    return;
                }

                setNewKey(res.key);
                router.refresh();
            } finally {
                setRegenerating(false);
            }
        }, {
            title: hasKey ? 'Regenerate API key' : 'Generate API key',
            message: hasKey
                ? 'The current key will stop working immediately. Any app using it must be updated with the new key.'
                : 'Generate the analytics API key?',
            positiveLabel: hasKey ? 'Regenerate' : 'Generate',
            danger: hasKey,
        });
    };

    const copyKey = async () => {
        if (!newKey) return;
        try {
            await navigator.clipboard.writeText(newKey);
            alert({ title: 'Copied', message: 'API key copied to clipboard.', variant: 'success' });
        } catch {
            alert({ title: 'Error', message: 'Could not copy. Please copy the key manually.', variant: 'error' });
        }
    };

    return (
        <div className="flex flex-col gap-y-4">
            {!!loadError && (
                <Card>
                    <CardContent className="p-4 text-danger bg-danger/10">{loadError}</CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Superset configuration</CardTitle>
                    <CardDescription>
                        Served to the mobile analytics app. The version number increases only when the URL or timeout actually changes.
                        {!!initialConfig && ` Current version: ${initialConfig.versionNumber} (updated ${formatDate(initialConfig.updatedAt)}).`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-y-4">
                    <div className="flex flex-col gap-y-2">
                        <Label htmlFor="superset-url">Superset URL</Label>
                        <div className="flex gap-x-2">
                            <Input
                                id="superset-url"
                                placeholder="https://superset.example.org"
                                value={supersetUrl}
                                onChange={e => { setSupersetUrl(e.target.value); setTestResult(null); }}
                                disabled={saving}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={test}
                                disabled={testing || saving || !supersetUrl.trim()}
                            >
                                <Plug className="h-4 w-4 mr-2" />
                                {testing ? 'Testing...' : 'Test reachability'}
                            </Button>
                        </div>
                        {!!testResult && (
                            <p className={testResult.ok ? 'text-sm text-green-600' : 'text-sm text-danger'}>
                                {testResult.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-y-2 max-w-xs">
                        <Label htmlFor="inactivity-timeout">Inactivity timeout (minutes)</Label>
                        <Input
                            id="inactivity-timeout"
                            type="number"
                            min={MIN_INACTIVITY_TIMEOUT_MINUTES}
                            max={MAX_INACTIVITY_TIMEOUT_MINUTES}
                            step={1}
                            value={timeout}
                            onChange={e => setTimeoutValue(e.target.value)}
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <Button type="button" onClick={save} disabled={saving}>
                            {saving ? 'Saving...' : 'Save configuration'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Analytics API key</CardTitle>
                    <CardDescription>
                        Read-only key limited to <code>GET /api/v1/mobile-analytics/config</code> and <code>GET /api/v1/mobile-analytics/version</code>.
                        It cannot access any other endpoint, and other API keys cannot access these. Send it as the <code>x-api-key</code> header.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-y-4">
                    {!!newKey && (
                        <div className="flex flex-col gap-y-2 rounded-md border border-primary/30 bg-primary/5 p-4">
                            <p className="text-sm font-medium">Copy this key now. It will not be shown again.</p>
                            <div className="flex gap-x-2">
                                <Input readOnly value={newKey} className="font-mono" onFocus={e => e.currentTarget.select()} />
                                <Button type="button" variant="outline" onClick={copyKey}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                        {hasKey ? (
                            <>
                                Active key: <code>{initialKey!.keyHint}</code> · generated {formatDate(initialKey!.generatedAt)} · last used {formatDate(initialKey!.lastUsedAt)}
                            </>
                        ) : 'No key has been generated yet. The endpoints reject all requests until one is.'}
                    </div>

                    <div>
                        <Button type="button" variant={hasKey ? 'destructive' : 'default'} onClick={regenerate} disabled={regenerating}>
                            <KeyRound className="h-4 w-4 mr-2" />
                            {regenerating ? 'Working...' : hasKey ? 'Regenerate key' : 'Generate key'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
