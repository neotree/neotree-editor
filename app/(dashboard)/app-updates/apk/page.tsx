import { AppUpdatesScreen } from "../components/app-updates-screen";

export const dynamic = "force-dynamic";

export default async function ApkUpdatesPage() {
  return <AppUpdatesScreen title="APK Updates" screen="apk" />;
}
