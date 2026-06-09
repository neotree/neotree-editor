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
Authorization: Bearer <MDM_SYNC_SECRET>
```

Production requirements:

- Set a strong `MDM_SYNC_SECRET` in the web editor environment.
- Run the endpoint from a trusted scheduler every 15-60 minutes.
- The same `MDM_SYNC_SECRET` protects MDM APK downloads at `/api/mdm/apk-releases/:apkReleaseId/download`.
- Keep MDM profile `autoSyncEnabled` on for active profiles.
- Keep `autoLinkEnabled` on only when the profile has reliable device identifiers.
- Review `needs_review`, `conflict`, and `unmatched` rows in Device Management before manually linking them.
