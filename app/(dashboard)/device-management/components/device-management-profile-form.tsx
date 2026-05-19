import { saveMdmProviderProfileFromForm } from "@/app/actions/device-management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { mdmProviderProfiles } from "@/databases/pg/schema";
import { maskSecret } from "@/lib/mdm";

type Profile = typeof mdmProviderProfiles.$inferSelect;

export function DeviceManagementProfileForm({
  profile,
  error,
  returnTo,
}: {
  profile?: Profile | null;
  error?: string | null;
  returnTo?: string;
}) {
  return (
    <form action={saveMdmProviderProfileFromForm} className="p-4 space-y-4">
      <input type="hidden" name="profileId" value={profile?.profileId || ""} />
      <input type="hidden" name="returnTo" value={returnTo || ""} />

      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="mdm-name">Name</Label>
          <Input id="mdm-name" name="name" defaultValue={profile?.name || ""} placeholder="Zimbabwe Headwind" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="mdm-country">Country ISO</Label>
          <Input id="mdm-country" name="countryISO" defaultValue={profile?.countryISO || ""} placeholder="ZW" required />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="mdm-base-url">MDM server URL</Label>
        <Input id="mdm-base-url" name="baseUrl" defaultValue={profile?.baseUrl || ""} placeholder="https://mdm.zw.neotree.org" required />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="mdm-api-key">API token</Label>
          <Input
            id="mdm-api-key"
            name="apiKey"
            type="password"
            defaultValue=""
            placeholder={profile?.apiKey ? `Current token: ${maskSecret(profile.apiKey)}` : "Headwind API token"}
          />
          {profile?.apiKey ? (
            <p className="text-xs text-muted-foreground">Leave blank to keep the current token.</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <Label htmlFor="mdm-kiosk-policy">Kiosk policy</Label>
          <Input id="mdm-kiosk-policy" name="defaultKioskPolicy" defaultValue={profile?.defaultKioskPolicy || ""} placeholder="Default" />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="mdm-settings">Provider settings JSON</Label>
        <Textarea
          id="mdm-settings"
          name="settings"
          rows={6}
          defaultValue={JSON.stringify(profile?.settings || {}, null, 2)}
          placeholder='{"devicesPath":"/rest/private/devices"}'
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save Profile</Button>
      </div>
    </form>
  );
}
