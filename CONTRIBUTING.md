# Contributing

Thanks for contributing to Neotree Editor. This document covers what CI expects of a pull request, so you can get a green build first time.

## Getting set up

```bash
yarn install --frozen-lockfile   # CI additionally passes --ignore-scripts
yarn ci:prepare                  # generates the Prisma client
cp .env-example .env             # then fill in the values you need
yarn dev
```

Node 22 is what CI uses; `.nvmrc` and the `engines` field pin it, so `nvm use` picks the right one. Yarn Classic (1.22.x) is pinned via `packageManager`.

## Before you open a pull request

Run what the gate runs:

```bash
yarn lint
yarn typecheck
yarn test
```

The security scanners live in [neotree/security-ci](https://github.com/neotree/security-ci)
and run in CI; this repository only carries its own policy and secret-fingerprint files. To
reproduce a finding locally, clone that repository beside this one and run:

```bash
python3 ../security-ci/security/scan_repo.py --root . \
  --policy ../security-ci/security/policy.defaults.json \
  --iocs ../security-ci/security/polinrider_iocs.json \
  --policy-overlay security/policy.json
```

It is standard-library Python 3 only — no install step.

## What CI checks

Every pull request must pass **PR Malware Gate** and **Merge Gate**. Behind the merge gate sit the repository policy scan, dependency install/audit, lint, typecheck, tests, build, secret scanning across full Git history, Semgrep, OSV, Dependency Review and CodeQL. [neotree/security-ci](https://github.com/neotree/security-ci/blob/main/README.md) describes each layer.

A few expectations worth knowing up front:

- **Dependencies** must resolve from the public npm registry and be recorded in `yarn.lock`. Git and remote-URL dependency specs are rejected.
- **Lifecycle scripts are disabled** during CI installs. If something genuinely needs to run at install time, it belongs in `ci:prepare` — and that is a security-sensitive change.
- **Project scripts must not modify tracked files.** CI fails if `git diff` is dirty after install, `ci:prepare`, or the build. If a generator rewrites committed files, commit its output. Committed build output (`build/`, `dist/`, `out/`) is exempt, because a rebuild always changes its content hashes.
- **Committed build output is scanned.** The deployment branches commit `build/` and servers pull it directly, so that bundle is scanned for campaign signatures under a reduced profile that tolerates minification.
- **GitHub Actions must be pinned** to a full 40-character commit SHA, never a tag or branch.
- **Use the project logger**, not `console.log`. This is advisory (it will not block your merge) outside `tests/` and `scripts/`.
- **No secrets in the diff or in history.** Gitleaks scans the full history, so a secret that was committed and later removed still fails.

## If the security gate goes red

Read [`INCIDENT_RESPONSE.md`](https://github.com/neotree/security-ci/blob/main/docs/INCIDENT_RESPONSE.md) before doing anything else.

Do not disable a scanner, and do not add a policy exception, in the same pull request that trips it. If you believe a finding is a false positive, the preferred fix is to correct the rule in `security/scan_repo.py` and add a regression test in `security/tests/` — that way the next person does not hit it.

Blocking findings are CRITICAL and HIGH. MEDIUM and below are advisory: they appear as annotations and in the run's report artifact, and will not stop your merge.

## Changing a security control

Changes to `security/**`, `.github/workflows/**`, `.github/actions/**`, CODEOWNERS, dependabot config, package-manager configuration, or `packageManager`/lifecycle/`ci:prepare` scripts are blocked by default. They need Code Owner review — `@neotree/core-devs` or `@neotree/maintainers` — plus a `security-reviewed:<head-sha7>` label naming your exact head commit. Pushing again invalidates the grant on purpose. See [`BRANCH_PROTECTION.md`](https://github.com/neotree/security-ci/blob/main/docs/BRANCH_PROTECTION.md).

## Reporting a vulnerability

Please do not open a public issue. This repository uses the organisation-wide policy in
[neotree/.github](https://github.com/neotree/.github/blob/main/SECURITY.md); the reporting channel is linked from the
repository's [Security tab](https://github.com/neotree/neotree-editor/security/policy).

See also the organisation [Code of Conduct](https://github.com/neotree/.github/blob/main/CODE_OF_CONDUCT.md) and
[general contributing guide](https://github.com/neotree/.github/blob/main/CONTRIBUTING.md). This file covers only what is
specific to this repository: its build, its tests, and what the security gate expects.
