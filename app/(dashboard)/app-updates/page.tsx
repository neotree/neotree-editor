import { AppUpdatesScreen } from "./components/app-updates-screen";

export const dynamic = "force-dynamic";

export default async function AppUpdatesPage() {
  return <AppUpdatesScreen title="App Updates" screen="overview" />;
}
