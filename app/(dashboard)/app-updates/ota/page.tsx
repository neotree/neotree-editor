import { AppUpdatesScreen } from "../components/app-updates-screen";

export const dynamic = "force-dynamic";

export default async function OtaUpdatesPage() {
  return <AppUpdatesScreen title="OTA Updates" screen="ota" />;
}
