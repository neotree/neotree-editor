import 'dotenv/config';

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function timestamp() {
  return new Date().toISOString();
}

async function main() {
  const appUrl = requiredEnv('NEXT_PUBLIC_APP_URL').replace(/\/+$/, '');
  const syncSecret = process.env.MDM_SYNC_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();

  if (!syncSecret) {
    throw new Error('MDM_SYNC_SECRET or NEXTAUTH_SECRET is required');
  }

  const url = `${appUrl}/api/mdm/sync`;
  console.log(`[${timestamp()}] Starting MDM inventory sync`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${syncSecret}`,
    },
  });

  const bodyText = await res.text();
  let body: unknown = bodyText;
  try {
    body = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    body = bodyText;
  }

  console.log(JSON.stringify(body, null, 2));

  if (!res.ok) {
    throw new Error(`MDM sync failed with HTTP ${res.status}`);
  }

  console.log(`[${timestamp()}] Finished MDM inventory sync`);
}

main().catch((error: any) => {
  console.error(`[${timestamp()}] MDM inventory sync failed`);
  console.error(error?.message || error);
  process.exit(1);
});
