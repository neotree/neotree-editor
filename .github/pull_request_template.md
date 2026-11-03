## What does this change?

<!-- A short description, and the issue it closes if there is one. -->

## Why?

<!-- The problem being solved. -->

## How was it verified?

<!-- Tests added/updated, manual verification, screenshots for UI changes. -->

---

### Checklist

- [ ] `yarn lint`, `yarn typecheck` and `yarn test` pass locally
- [ ] No secrets, credentials or real patient data in the diff or in the commit history
- [ ] New dependencies are necessary, come from the public npm registry, and are pinned by the lockfile
- [ ] Debug output uses the project logger rather than `console.log`

### Security-sensitive changes

Tick only if this PR touches `security/**`, `.github/workflows/**`, `.github/actions/**`, `CODEOWNERS`, `dependabot.yml`, package-manager configuration (`.npmrc`, `.yarnrc*`, `.pnpmfile*`), or `packageManager`/lifecycle/`ci:prepare` scripts in a `package.json`:

- [ ] This PR changes a security control, and I have explained why below

The **PR Malware Gate** blocks these changes until a security maintainer reviews the exact commit and applies a `security-reviewed:<head-sha7>` label. See [`BRANCH_PROTECTION.md`](https://github.com/neotree/security-ci/blob/main/docs/BRANCH_PROTECTION.md).

> A red security gate is a finding, not an obstacle. Never disable a scanner in the same PR that trips it — follow [`INCIDENT_RESPONSE.md`](https://github.com/neotree/security-ci/blob/main/docs/INCIDENT_RESPONSE.md).
