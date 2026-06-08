"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { getMdmProviderDevices, linkDeviceToMdmDraft, testDeviceMdmLinkDraft } from "@/app/actions/device-management";
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
import type { deviceMdmLinks, mdmProviderProfiles } from "@/databases/pg/schema";

type Link = typeof deviceMdmLinks.$inferSelect;
type Profile = typeof mdmProviderProfiles.$inferSelect;
type DeviceLinkTestResult = Awaited<ReturnType<typeof testDeviceMdmLinkDraft>>;
type HeadwindDevicesResult = Awaited<ReturnType<typeof getMdmProviderDevices>>;
type HeadwindDeviceOption = HeadwindDevicesResult["data"][number];

const countryOptions = [
  { value: "ZW", label: "Zimbabwe" },
  { value: "MW", label: "Malawi" },
  { value: "ZM", label: "Zambia" },
  { value: "ZA", label: "South Africa" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
];

const capabilityOptions = [
  { key: "kiosk", label: "Kiosk mode" },
  { key: "apkInstall", label: "APK install" },
  { key: "remoteLock", label: "Remote lock" },
  { key: "remoteWipe", label: "Remote wipe" },
  { key: "inventorySync", label: "Inventory sync" },
] as const;

function statusVariant(status?: string | null) {
  if (status === "managed" || status === "enrolled" || status === "verified") return "default" as const;
  if (status === "failed") return "destructive" as const;
  return "secondary" as const;
}

export function DeviceMdmLinkForm({
  link,
  profiles,
  initialDeviceId,
  initialProfileId,
  initialMdmDeviceId,
  initialCountryISO,
  initialSerialNumber,
  initialAndroidVersion,
  initialMdmConfigId,
  initialMdmConfigName,
  initialMdmGroupId,
  initialMdmGroupName,
  error,
  returnTo,
}: {
  link?: Link | null;
  profiles: Profile[];
  initialDeviceId?: string;
  initialProfileId?: string;
  initialMdmDeviceId?: string;
  initialCountryISO?: string | null;
  initialSerialNumber?: string | null;
  initialAndroidVersion?: string | null;
  initialMdmConfigId?: string | null;
  initialMdmConfigName?: string | null;
  initialMdmGroupId?: string | null;
  initialMdmGroupName?: string | null;
  error?: string | null;
  returnTo?: string;
}) {
  const router = useRouter();
  const [isTesting, setIsTesting] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [testResult, setTestResult] = useState<DeviceLinkTestResult | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveAnywayReason, setSaveAnywayReason] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState(link?.profileId || initialProfileId || "none");
  const [mdmDeviceId, setMdmDeviceId] = useState(link?.mdmDeviceId || initialMdmDeviceId || "");
  const [headwindDevices, setHeadwindDevices] = useState<HeadwindDeviceOption[]>([]);
  const [deviceLoadError, setDeviceLoadError] = useState<string | null>(null);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [isPending, startTransition] = useTransition();
  const capabilities = (link?.deviceCapabilities || {}) as Record<string, any>;
  const selectedProfile = profiles.find((profile) => profile.profileId === (link?.profileId || initialProfileId));
  const defaultCountry = link?.countryISO || initialCountryISO || selectedProfile?.countryISO || "ZW";
  const isBusy = isTesting || isPending || isLoadingDevices;
  const selectableHeadwindDevices = headwindDevices.filter((device) => device.mdmDeviceId);

  async function loadHeadwindDevices() {
    if (!selectedProfileId || selectedProfileId === "none") {
      setDeviceLoadError("Select an MDM profile before loading devices.");
      return;
    }

    setIsLoadingDevices(true);
    setDeviceLoadError(null);
    const result = await getMdmProviderDevices(selectedProfileId);
    setIsLoadingDevices(false);

    if (result.errors?.length) {
      setHeadwindDevices([]);
      setDeviceLoadError(result.errors[0]);
      return;
    }

    setHeadwindDevices(result.data);
    const firstSelectableDevice = result.data.find((device) => device.mdmDeviceId);
    if (!mdmDeviceId && firstSelectableDevice?.mdmDeviceId) {
      setMdmDeviceId(firstSelectableDevice.mdmDeviceId);
    }
    if (!result.data.length) {
      setDeviceLoadError("Headwind returned no devices for this profile.");
    }
  }

  function getDeviceOptionLabel(device: HeadwindDeviceOption) {
    const primary = device.serialNumber || device.deviceId || device.mdmDeviceId || "Unknown device";
    const config = device.mdmConfigName ? ` - ${device.mdmConfigName}` : "";
    const status = device.managementState && device.managementState !== "unknown" ? ` (${device.managementState})` : "";
    return `${primary}${config}${status}`;
  }

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsTesting(true);
    const result = await testDeviceMdmLinkDraft(formData);
    setIsTesting(false);

    if (result.device) {
      const device = result.device;
      if (device.mdmConfigId) formData.set("mdmConfigId", device.mdmConfigId);
      if (device.mdmConfigName) formData.set("mdmConfigName", device.mdmConfigName);
      if (device.mdmGroupId) formData.set("mdmGroupId", device.mdmGroupId);
      if (device.mdmGroupName) formData.set("mdmGroupName", device.mdmGroupName);
      if (device.serialNumber) formData.set("serialNumber", device.serialNumber);
      if (device.androidVersion) formData.set("androidVersion", device.androidVersion);
      formData.set("enrollmentStatus", device.enrollmentStatus || "unknown");
      formData.set("managementState", device.managementState || "unknown");
    }

    formData.set("__linkTestStatus", result.success ? "verified" : "failed");
    formData.set("__linkTestError", result.success ? "" : result.message);
    setPendingFormData(formData);
    setTestResult(result);
    setSaveError(null);
    setSaveAnywayReason("");
    setReviewOpen(true);
  }

  function savePendingLink() {
    if (!pendingFormData) return;
    if (!testResult?.success && !saveAnywayReason.trim()) {
      setSaveError("Please add a reason before saving an unverified device link.");
      return;
    }
    pendingFormData.set("saveAnywayReason", saveAnywayReason.trim());
    startTransition(async () => {
      const result = await linkDeviceToMdmDraft(pendingFormData);
      if (!result.success) {
        setSaveError(result.errors?.[0] || "Could not save device link");
        return;
      }
      router.push("/device-management?section=devices");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleReviewSubmit} className="p-4 space-y-4">
      <input type="hidden" name="linkId" value={link?.linkId || ""} />
      <input type="hidden" name="returnTo" value={returnTo || ""} />
      <input type="hidden" name="enrollmentStatus" value={link?.enrollmentStatus || "enrolled"} />
      <input type="hidden" name="managementState" value={link?.managementState || "managed"} />

      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="rounded-md border px-3 py-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium">Device link status</div>
            <div className="text-xs text-muted-foreground">
              {link?.lastSyncedAt ? `Last checked ${new Date(link.lastSyncedAt).toLocaleString()}` : "This device link has not been checked yet."}
            </div>
            {link?.lastSyncError ? <div className="mt-1 text-xs text-danger">{link.lastSyncError}</div> : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant(link?.lastSyncStatus)}>{link?.lastSyncStatus || "not checked"}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="link-device-id">NeoTree device ID</Label>
          <Input id="link-device-id" name="deviceId" defaultValue={link?.deviceId || initialDeviceId || ""} placeholder="Device UUID" required />
          <p className="text-xs text-muted-foreground">This is the device registered by the NeoTree mobile app.</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="link-country">Country</Label>
          <Select name="countryISO" defaultValue={defaultCountry}>
            <SelectTrigger id="link-country">
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="link-profile-id">MDM profile</Label>
          <Select
            name="profileId"
            value={selectedProfileId}
            onValueChange={(value) => {
              setSelectedProfileId(value);
              setHeadwindDevices([]);
              setDeviceLoadError(null);
            }}
          >
            <SelectTrigger id="link-profile-id">
              <SelectValue placeholder="Select MDM profile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Manual link only</SelectItem>
              {profiles.map((profile) => (
                <SelectItem key={profile.profileId} value={profile.profileId}>
                  {profile.name} ({profile.countryISO})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {profiles.length ? (
            <p className="text-xs text-muted-foreground">Select the Headwind profile that manages this tablet.</p>
          ) : (
            <p className="text-xs text-muted-foreground">Create an MDM profile before linking production devices.</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="link-mdm-device-id">Headwind device ID</Label>
          {selectableHeadwindDevices.length ? (
            <Select name="mdmDeviceId" value={mdmDeviceId} onValueChange={setMdmDeviceId}>
              <SelectTrigger id="link-mdm-device-id">
                <SelectValue placeholder="Select a Headwind device" />
              </SelectTrigger>
              <SelectContent>
                {selectableHeadwindDevices.map((device) => (
                  <SelectItem key={device.mdmDeviceId!} value={device.mdmDeviceId!}>
                    {getDeviceOptionLabel(device)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="link-mdm-device-id"
              name="mdmDeviceId"
              value={mdmDeviceId}
              onChange={(event) => setMdmDeviceId(event.target.value)}
              placeholder="Headwind device number, ID, serial, or IMEI"
              required
            />
          )}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Load devices from Headwind where possible. Manual entry is available as a fallback.
            </p>
            <Button
              type="button"
              variant="primary-outline"
              size="sm"
              onClick={loadHeadwindDevices}
              disabled={isBusy || selectedProfileId === "none"}
            >
              {isLoadingDevices ? "Loading..." : "Load devices"}
            </Button>
          </div>
          {deviceLoadError ? <p className="text-xs text-danger">{deviceLoadError}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Device capabilities</Label>
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

      <details className="rounded-md border p-3">
        <summary className="cursor-pointer text-sm font-medium">Advanced device details</summary>
        <p className="mt-2 text-xs text-muted-foreground">
          These are normally filled from Headwind after a successful test.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="link-serial">Serial</Label>
            <Input id="link-serial" name="serialNumber" defaultValue={link?.serialNumber || initialSerialNumber || ""} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="link-android">Android version</Label>
            <Input id="link-android" name="androidVersion" defaultValue={link?.androidVersion || initialAndroidVersion || ""} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="link-mdm-config-id">Headwind configuration ID</Label>
            <Input id="link-mdm-config-id" name="mdmConfigId" defaultValue={link?.mdmConfigId || initialMdmConfigId || ""} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="link-mdm-config-name">Headwind configuration name</Label>
            <Input id="link-mdm-config-name" name="mdmConfigName" defaultValue={link?.mdmConfigName || initialMdmConfigName || ""} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="link-mdm-group-id">Headwind group ID</Label>
            <Input id="link-mdm-group-id" name="mdmGroupId" defaultValue={link?.mdmGroupId || initialMdmGroupId || ""} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="link-mdm-group-name">Headwind group name</Label>
            <Input id="link-mdm-group-name" name="mdmGroupName" defaultValue={link?.mdmGroupName || initialMdmGroupName || ""} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="link-hospital">Hospital ID</Label>
            <Input id="link-hospital" name="hospitalId" defaultValue={link?.hospitalId || ""} placeholder="Optional" />
          </div>
        </div>
      </details>

      <div className="flex justify-end">
        <Button type="submit" disabled={isBusy}>
          {isTesting ? "Checking device..." : "Test and Review"}
        </Button>
      </div>

      <AlertDialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <AlertDialogContent className="sm:max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{testResult?.success ? "Device link verified" : "Device link needs review"}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>{testResult?.message || "Device link test did not return a result."}</p>
                {testResult?.device ? (
                  <div className="rounded-md border bg-primary/5 p-3 text-sm text-foreground">
                    <div className="font-medium">Headwind device</div>
                    <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-muted-foreground md:grid-cols-2">
                      <div>ID: {testResult.device.mdmDeviceId || "Unknown"}</div>
                      <div>Serial: {testResult.device.serialNumber || "Unknown"}</div>
                      <div>Configuration: {testResult.device.mdmConfigName || testResult.device.mdmConfigId || "Unknown"}</div>
                      <div>Android: {testResult.device.androidVersion || "Unknown"}</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                      NeoTree could not verify this tablet in Headwind. You can edit the values and test again, or save it anyway if the tablet will be enrolled later.
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="device-save-anyway-reason">Reason for saving anyway</Label>
                      <Input
                        id="device-save-anyway-reason"
                        value={saveAnywayReason}
                        onChange={(event) => setSaveAnywayReason(event.target.value)}
                        placeholder="Example: Tablet is enrolled but not online yet"
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
              {testResult?.success ? "Cancel" : "Edit Link"}
            </AlertDialogCancel>
            <Button
              type="button"
              variant={testResult?.success ? "default" : "primary-outline"}
              disabled={isPending || !pendingFormData}
              onClick={savePendingLink}
            >
              {isPending ? "Saving..." : testResult?.success ? "Save Device Link" : "Save Anyway"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
