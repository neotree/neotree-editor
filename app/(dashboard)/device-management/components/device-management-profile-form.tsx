"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveMdmProviderProfileDraft, testMdmProviderConnectionDraft } from "@/app/actions/device-management";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { mdmProviderProfiles } from "@/databases/pg/schema";
import type { MdmConfiguration } from "@/lib/mdm";

type Profile = typeof mdmProviderProfiles.$inferSelect;

const countryOptions = [
  { value: "ZW", label: "Zimbabwe" },
  { value: "MW", label: "Malawi" },
  { value: "ZM", label: "Zambia" },
];

const environmentOptions = [
  { value: "demo", label: "demo" },
  { value: "production", label: "production" },
  { value: "stage", label: "stage" },
];

const capabilityOptions = [
  { key: "deviceSync", label: "Device inventory sync" },
  { key: "kiosk", label: "Kiosk mode" },
  { key: "apkPush", label: "APK push" },
  { key: "remoteLock", label: "Remote lock" },
  { key: "remoteWipe", label: "Remote wipe" },
] as const;

function connectionBadgeVariant(status?: string | null) {
  if (status === "connected") return "default" as const;
  if (status === "failed") return "destructive" as const;
  return "secondary" as const;
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

type ConnectionTestResult = Awaited<ReturnType<typeof testMdmProviderConnectionDraft>>;

export function DeviceManagementProfileForm({
  profile,
  kioskPolicyOptions = [],
  error,
  returnTo,
}: {
  profile?: Profile | null;
  kioskPolicyOptions?: MdmConfiguration[];
  error?: string | null;
  returnTo?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isTesting, setIsTesting] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveAnywayReason, setSaveAnywayReason] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const kioskOptions = [
    ...(!profile?.defaultKioskPolicy || kioskPolicyOptions.some((option) => option.id === profile.defaultKioskPolicy || option.name === profile.defaultKioskPolicy)
      ? []
      : [{ id: profile.defaultKioskPolicy, name: profile.defaultKioskPolicy, description: "Saved value" }]),
    ...kioskPolicyOptions,
  ];
  const selectedKioskPolicy = kioskOptions.find((option) => option.id === profile?.defaultKioskPolicy || option.name === profile?.defaultKioskPolicy)?.id || profile?.defaultKioskPolicy || kioskOptions[0]?.id || "";
  const capabilities = (profile?.providerCapabilities || {}) as Record<string, any>;
  const settings = (profile?.settings || {}) as Record<string, any>;
  const serviceAuth = (settings.serviceAuth || {}) as Record<string, any>;
  const isBusy = isTesting || isPending;

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsTesting(true);
    const result = await testMdmProviderConnectionDraft(formData);
    formData.set("__connectionTestStatus", result.success ? "connected" : "failed");
    formData.set("__connectionTestMessage", result.success ? "" : result.message);
    setIsTesting(false);
    setPendingFormData(formData);
    setTestResult(result);
    setSaveError(null);
    setSaveAnywayReason("");
    setReviewOpen(true);
  }

  function savePendingProfile() {
    if (!pendingFormData) return;
    if (!testResult?.success && !saveAnywayReason.trim()) {
      setSaveError("Please add a reason before saving an unverified Headwind profile.");
      return;
    }
    pendingFormData.set("saveAnywayReason", saveAnywayReason.trim());
    startTransition(async () => {
      const result = await saveMdmProviderProfileDraft(pendingFormData);
      if (!result.success) {
        setSaveError(result.errors?.[0] || "Could not save MDM profile");
        return;
      }
      router.push("/device-management");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleReviewSubmit} className="p-4 space-y-4">
      <input type="hidden" name="profileId" value={profile?.profileId || ""} />
      <input type="hidden" name="returnTo" value={returnTo || ""} />

      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="rounded-md border px-3 py-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium">Headwind connection</div>
            <div className="text-xs text-muted-foreground">
              {profile?.lastConnectionCheckedAt
                ? `Last checked ${formatDateTime(profile.lastConnectionCheckedAt)}`
                : "Connection has not been checked yet."}
            </div>
            {profile?.lastConnectionError ? (
              <div className="mt-1 text-xs text-danger">{profile.lastConnectionError}</div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={connectionBadgeVariant(profile?.lastConnectionStatus)}>
              {profile?.lastConnectionStatus || "not checked"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="mdm-name">Name</Label>
          <Input id="mdm-name" name="name" defaultValue={profile?.name || ""} placeholder="Zimbabwe Headwind" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="mdm-country">Country ISO</Label>
          <Select name="countryISO" defaultValue={profile?.countryISO || "ZW"} required>
            <SelectTrigger id="mdm-country">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countryOptions.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label} ({country.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="mdm-base-url">Headwind server URL</Label>
        <Input id="mdm-base-url" name="baseUrl" defaultValue={profile?.baseUrl || ""} placeholder="https://mdm.zw.neotree.org" required />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="mdm-environment">Environment</Label>
          <Select name="environment" defaultValue={profile?.environment || "production"}>
            <SelectTrigger id="mdm-environment">
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              {environmentOptions.map((environment) => (
                <SelectItem key={environment.value} value={environment.value}>
                  {environment.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            id="mdm-shared-instance"
            name="isSharedInstance"
            type="checkbox"
            defaultChecked={!!profile?.isSharedInstance}
            className="h-4 w-4 rounded border-input"
          />
          <Label htmlFor="mdm-shared-instance">Shared MDM instance</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="mdm-service-username">Headwind service username</Label>
          <Input
            id="mdm-service-username"
            name="serviceUsername"
            defaultValue={`${serviceAuth.username || ""}`}
            placeholder="neotree-api"
          />
          <p className="text-xs text-muted-foreground">Use a dedicated Headwind user for NeoTree, not a personal admin login.</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="mdm-service-password">Headwind service password</Label>
          <Input
            id="mdm-service-password"
            name="servicePassword"
            type="password"
            defaultValue=""
            placeholder={serviceAuth.passwordEncrypted ? "Password saved securely" : "Enter service user password"}
          />
          <p className="text-xs text-muted-foreground">
            {serviceAuth.passwordEncrypted ? "Leave blank to keep the saved password." : "NeoTree encrypts this before saving it."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="mdm-kiosk-policy">Default Headwind configuration</Label>
          {kioskOptions.length ? (
            <Select name="defaultKioskPolicy" defaultValue={selectedKioskPolicy}>
              <SelectTrigger id="mdm-kiosk-policy">
                <SelectValue placeholder="Select Headwind configuration" />
              </SelectTrigger>
              <SelectContent>
                {kioskOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <>
              <input type="hidden" name="defaultKioskPolicy" value={profile?.defaultKioskPolicy || ""} />
              <Input id="mdm-kiosk-policy" value={profile?.defaultKioskPolicy || ""} placeholder="Save and test the profile to load configurations" disabled />
            </>
          )}
          {kioskOptions.length ? (
            <p className="text-xs text-muted-foreground">Loaded from Headwind configurations.</p>
          ) : (
            <p className="text-xs text-muted-foreground">Save the Headwind URL and service credentials, then test the connection to load configurations.</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Provider capabilities</Label>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {capabilityOptions.map((capability) => (
            <label key={capability.key} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <input
                name={`capability_${capability.key}`}
                type="checkbox"
                defaultChecked={capabilities[capability.key] !== false}
                className="h-4 w-4 rounded border-input"
              />
              <span>{capability.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Automatic device matching</Label>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <input type="hidden" name="autoSyncEnabled" value="off" />
            <input
              name="autoSyncEnabled"
              type="checkbox"
              value="on"
              defaultChecked={profile?.autoSyncEnabled !== false}
              className="h-4 w-4 rounded border-input"
            />
            <span>Auto-sync MDM inventory</span>
          </label>
          <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <input type="hidden" name="autoLinkEnabled" value="off" />
            <input
              name="autoLinkEnabled"
              type="checkbox"
              value="on"
              defaultChecked={profile?.autoLinkEnabled !== false}
              className="h-4 w-4 rounded border-input"
            />
            <span>Auto-link confident matches</span>
          </label>
          <div className="space-y-1">
            <Select name="autoLinkMinConfidence" defaultValue={`${profile?.autoLinkMinConfidence || 95}`}>
              <SelectTrigger id="mdm-auto-link-confidence">
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">Exact NeoTree ID only</SelectItem>
                <SelectItem value="98">Device hash or better</SelectItem>
                <SelectItem value="95">Serial/IMEI or better</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Uncertain matches go to the review queue.</p>
          </div>
        </div>
      </div>

      <details className="rounded-md border p-3">
        <summary className="cursor-pointer text-sm font-medium">Advanced provider settings</summary>
        <p className="mt-2 text-xs text-muted-foreground">
          These are only needed if your Headwind cloud instance uses custom API paths.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <Label htmlFor="mdm-access-token-override">Access token override</Label>
            <Input
              id="mdm-access-token-override"
              name="accessTokenOverride"
              type="password"
              defaultValue=""
              placeholder={profile?.apiKey ? "Override saved securely" : "Only use when service login is unavailable"}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for normal Headwind service-account login. This is only for temporary support scenarios.
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="mdm-login-path">Login API path</Label>
            <Input
              id="mdm-login-path"
              name="loginPath"
              defaultValue={`${settings.loginPath || ""}`}
              placeholder="/rest/public/jwt/login"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="mdm-configurations-path">Configurations API path</Label>
            <Input
              id="mdm-configurations-path"
              name="configurationsPath"
              defaultValue={`${settings.configurationsPath || ""}`}
              placeholder="/rest/private/configurations/search"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="mdm-devices-path">Devices API path</Label>
            <Input
              id="mdm-devices-path"
              name="devicesPath"
              defaultValue={`${settings.devicesPath || ""}`}
              placeholder="/rest/private/devices/search"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="mdm-device-status-path">Device status API path</Label>
            <Input
              id="mdm-device-status-path"
              name="deviceStatusPath"
              defaultValue={`${settings.deviceStatusPath || ""}`}
              placeholder="/rest/private/devices/:mdmDeviceId"
            />
          </div>
        </div>
      </details>

      <div className="flex justify-end">
        <Button type="submit" disabled={isBusy}>
          {isTesting ? "Testing connection..." : "Test and Review"}
        </Button>
      </div>

      <AlertDialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <AlertDialogContent className="sm:max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {testResult?.success ? "Connection test passed" : "Connection test failed"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>{testResult?.message || "Connection test did not return a result."}</p>
                {testResult?.success ? (
                  <div className="rounded-md border bg-primary/5 p-3 text-sm text-foreground">
                    <div className="font-medium">Ready to save</div>
                    <div className="mt-1 text-muted-foreground">
                      {testResult.configurations.length} Headwind configuration{testResult.configurations.length === 1 ? "" : "s"} found.
                    </div>
                    {testResult.configurations.length ? (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {testResult.configurations.slice(0, 5).map((configuration) => configuration.name).join(", ")}
                        {testResult.configurations.length > 5 ? "..." : ""}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                      NeoTree could not confirm this Headwind profile yet. You can edit the profile and test again, or save it anyway if the credentials will be completed later.
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="profile-save-anyway-reason">Reason for saving anyway</Label>
                      <Input
                        id="profile-save-anyway-reason"
                        value={saveAnywayReason}
                        onChange={(event) => setSaveAnywayReason(event.target.value)}
                        placeholder="Example: Credentials will be completed by country admin"
                      />
                    </div>
                  </>
                )}
                {saveError ? (
                  <div className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                    {saveError}
                  </div>
                ) : null}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {testResult?.success ? "Cancel" : "Edit Profile"}
            </AlertDialogCancel>
            <Button
              type="button"
              variant={testResult?.success ? "default" : "primary-outline"}
              disabled={isPending || !pendingFormData}
              onClick={savePendingProfile}
            >
              {isPending ? "Saving..." : testResult?.success ? "Save Profile" : "Save Anyway"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
