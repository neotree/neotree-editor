# Security Policy

## Reporting a vulnerability

**Do not open a public issue for a security vulnerability.**

Report it privately through GitHub's [private vulnerability reporting](https://github.com/neotree/neotree-editor/security/advisories/new) on this repository. If that is unavailable to you, email **security@neotree.org** instead.

Please include:

- what the issue is and the impact you believe it has;
- the affected version, branch or commit;
- reproduction steps or a proof of concept;
- any suggested remediation.

### What to expect

| Stage | Target |
| --- | --- |
| Acknowledgement of your report | 3 working days |
| Initial assessment and severity triage | 10 working days |
| Fix or documented mitigation for High/Critical | 30 days from triage |
| Public advisory | After a fix ships, coordinated with you |

We will keep you updated as the assessment progresses, and we credit reporters in the advisory unless you prefer to remain anonymous.

## Scope

In scope: this repository's application code, its CI/CD configuration under `.github/` and `security/`, and its dependency manifests.

Out of scope: findings that require a compromised maintainer workstation, denial of service through unrealistic traffic volumes, and vulnerabilities in third-party services we merely consume. Reports produced solely by an automated scanner, with no demonstrated impact, will usually be closed.

## Supported versions

Security fixes land on `master`. Older tags are not patched.

## How this repository defends itself

Every pull request passes a fail-closed CI security gate before it can merge — a malware/policy scanner, secret scanning across full Git history, SAST, and several independent dependency-vulnerability sources. See [neotree/security-ci](https://github.com/neotree/security-ci/blob/main/README.md) for what blocks a merge and [`THREAT_MODEL.md`](https://github.com/neotree/security-ci/blob/main/docs/THREAT_MODEL.md) for the reasoning behind it.

If you believe you can get malicious code past that gate, that itself is a vulnerability worth reporting.

## Past incidents

[`ADVISORY.md`](ADVISORY.md) documents the April–August 2026 repository compromise and its remediation.

A full-history secret scan on 2026-09-02 also surfaced credentials committed between 2019
and 2024. All had already been rotated. Because this repository is public, the historical
values remain readable in Git history; the findings are recorded, with that provenance, in
[`security/gitleaks-ignore.txt`](security/gitleaks-ignore.txt). If you believe any of them
is still live, please report it privately using the process above rather than opening an
issue.
