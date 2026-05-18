import { saveMdmProviderProfileFromForm } from "@/app/actions/device-management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { mdmProviderProfiles } from "@/databases/pg/schema";

type Profile = typeof mdmProviderProfiles.$inferSelect;

export function DeviceManagementProfileForm({ profile }: { profile?: Profile | null }) {
  return (
    <form action={saveMdmProviderProfileFromForm} className="p-4 space-y-4">
      <input type="hidden" name="profileId" value={profile?.profileId || ""} />

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
          <Input id="mdm-api-key" name="apiKey" type="password" defaultValue={profile?.apiKey || ""} placeholder="Headwind API token" />
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
