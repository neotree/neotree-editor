# Device Management Migration Readiness

Before this feature is promoted, validate the generated Drizzle migration against the real pre-release database state.

Required checks:

- Apply the generated migration to a clean database at the `0011` snapshot.
- Apply it to a copy of the current shared/staging database if any partial `0012` migration has already run.
- Do not replace an already-shared `0012` migration with another `0012`; create a corrective `0013` instead.
- Confirm the following tables contain the current schema columns before testing the UI:
  - `nt_mdm_provider_profiles`
  - `nt_device_mdm_links`
  - `nt_mdm_device_inventory`
  - `nt_device_app_states`
  - `nt_device_update_events`
  - `nt_app_update_policies`
- Confirm the MDM foreign keys exist for:
  - `nt_device_mdm_links.profile_id`
  - `nt_device_mdm_links.hospital_id`
  - `nt_mdm_device_inventory.profile_id`
  - `nt_mdm_device_inventory.suggested_device_id`
  - `nt_mdm_device_inventory.linked_device_id`
  - `nt_device_update_events.apk_release_id`
  - `nt_app_update_policies.target_hospital_id`

The local development database was repaired manually after a partially applied migration. Treat that as a local recovery step, not as release evidence.

## MDM credential encryption

MDM service passwords and optional token overrides are encrypted with `NEXTAUTH_SECRET`.

Production requirements:

- Set a strong, stable `NEXTAUTH_SECRET` before saving any MDM profiles.
- Do not rotate `NEXTAUTH_SECRET` casually. Existing encrypted MDM credentials cannot be decrypted after rotation unless they are re-entered.
- If rotation is unavoidable, plan it as an operational change: capture the current Headwind service credentials, rotate the secret, then re-save each MDM profile.
- Never paste Headwind service passwords or token overrides into logs, tickets, screenshots, or migration files.

## Automatic MDM inventory sync

NeoTree supports automatic Headwind inventory reconciliation through:

```text
POST /api/mdm/sync
Authorization: Bearer <NEXTAUTH_SECRET>
```

Production requirements:

- Set a strong `NEXTAUTH_SECRET` in the web editor environment.
- Run the endpoint from a trusted scheduler every 12 hours.
- `NEXTAUTH_SECRET` remains a backward-compatible fallback only; do not use it in new cron jobs.
- Keep MDM profile `autoSyncEnabled` on for active profiles.
- Keep `autoLinkEnabled` on only when the profile has reliable device identifiers.
- Review `needs_review`, `conflict`, and `unmatched` rows in Device Management before manually linking them.

Ubuntu cron example:

```bash
cd ~/demo-web-editor
yarn mdm:sync

crontab -e
```

Add:

```cron
0 */12 * * * cd /home/ubuntu/demo-web-editor && mkdir -p logs && set -a && . ./.env.production && set +a && yarn -s mdm:sync >> logs/mdm-sync.log 2>&1
```

If your server uses `.env.development` for the demo editor, replace `.env.production` with that file.

## Enrollment label recommendation

For reliable auto-linking, put a NeoTree identifier into Headwind during tablet enrollment:

- Best: full NeoTree device ID.
- Good: Android ID.
- Acceptable for review only: short visible NeoTree device code, such as `9999`.

Suggested Headwind device name or description format:

```text
NeoTree <country> <hospital> <full-device-id>
```

Short device codes are intentionally not enough for silent auto-linking because two tablets can share or reuse short human-facing labels over time. NeoTree will still show them in the review queue as evidence.
