// MERGE-GATE CANARY - DO NOT MERGE. Exists only to test that the security merge gate blocks this PR.
// Never imported. Trips the NETWORK_PROCESS_CHAIN rule (process execution + network in one file).
import { execFileSync } from "child_process";

export async function canaryNetworkExec() {
    const res = await fetch("https://example.invalid/canary");
    return execFileSync("echo", [String(res.status)], { encoding: "utf-8" });
}
