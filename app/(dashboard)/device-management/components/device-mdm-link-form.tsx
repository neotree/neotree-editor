import { linkDeviceToMdmFromForm } from "@/app/actions/device-management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { deviceMdmLinks, mdmProviderProfiles } from "@/databases/pg/schema";

type Link = typeof deviceMdmLinks.$inferSelect;
type Profile = typeof mdmProviderProfiles.$inferSelect;

export function DeviceMdmLinkForm({
  link,
  profiles,
  initialDeviceId,
}: {
  link?: Link | null;
  profiles: Profile[];
  initialDeviceId?: string;
}) {
  return (
    <form action={linkDeviceToMdmFromForm} className="p-4 space-y-4">
      <div className="space-y-1">
        <Label htmlFor="link-device-id">NeoTree device ID</Label>
        <Input id="link-device-id" name="deviceId" defaultValue={link?.deviceId || initialDeviceId || ""} placeholder="Device UUID" required />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="link-profile-id">MDM profile</Label>
          <select
            id="link-profile-id"
            name="profileId"
            defaultValue={link?.profileId || ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">No profile</option>
            {profiles.map((profile) => (
              <option key={profile.profileId} value={profile.profileId}>
                {profile.name} ({profile.countryISO})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="link-mdm-device-id">Headwind device ID</Label>
          <Input id="link-mdm-device-id" name="mdmDeviceId" defaultValue={link?.mdmDeviceId || ""} required />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="link-serial">Serial</Label>
          <Input id="link-serial" name="serialNumber" defaultValue={link?.serialNumber || ""} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="link-android">Android</Label>
          <Input id="link-android" name="androidVersion" defaultValue={link?.androidVersion || ""} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="link-mdm-config-id">MDM config ID</Label>
        <Input id="link-mdm-config-id" name="mdmConfigId" defaultValue={link?.mdmConfigId || ""} />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save Device Link</Button>
      </div>
    </form>
  );
}
