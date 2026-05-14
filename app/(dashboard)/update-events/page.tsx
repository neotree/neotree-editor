import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { getDeviceUpdateEvents } from "@/app/actions/update-events";

export const dynamic = "force-dynamic";

export default async function UpdateEventsPage() {
  const res = await getDeviceUpdateEvents({ limit: 200, offset: 0 });
  const events = res.data || [];

  return (
    <>
      <Title>Update Events</Title>
      <Content>
        <Card className="mb-20">
          <CardContent className="p-0">
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2 pr-4">Device</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">App</th>
                    <th className="py-2 pr-4">Runtime</th>
                    <th className="py-2 pr-4">OTA ID</th>
                    <th className="py-2 pr-4">Channel</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id} className="border-b">
                      <td className="py-2 pr-4">{e.createdAt?.toString?.() || ""}</td>
                      <td className="py-2 pr-4">{e.deviceId}</td>
                      <td className="py-2 pr-4">{e.eventType}</td>
                      <td className="py-2 pr-4">{e.appVersion || ""}</td>
                      <td className="py-2 pr-4">{e.runtimeVersion || ""}</td>
                      <td className="py-2 pr-4">{e.otaUpdateId || ""}</td>
                      <td className="py-2 pr-4">{e.otaChannel || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!events.length ? (
                <div className="text-muted-foreground text-sm">No events yet.</div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </Content>
    </>
  );
}
