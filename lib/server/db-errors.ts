/**
 * Turns the errors a save or an import can hit into one sentence a person can act on. Drizzle wraps
 * database errors as "Failed query: <sql> params: <values>" and keeps the database's reason on `cause`;
 * axios errors carry a code (ECONNREFUSED...) or the other editor's HTTP status.
 */

type PgLikeError = {
    code?: string;
    message?: string;
    detail?: string;
    constraint?: string;
    constraint_name?: string;
    table?: string;
    table_name?: string;
};

const TABLE_NAMES: Record<string, string> = {
    nt_data_keys_drafts: "data key",
    nt_data_keys: "data key",
    nt_scripts_drafts: "script",
    nt_scripts: "script",
    nt_screens_drafts: "screen",
    nt_screens: "screen",
    nt_diagnoses_drafts: "diagnosis",
    nt_diagnoses: "diagnosis",
    nt_problems_drafts: "problem",
    nt_problems: "problem",
    nt_drugs_library_drafts: "drugs library item",
    nt_drugs_library: "drugs library item",
    nt_config_keys_drafts: "config key",
    nt_config_keys: "config key",
    nt_hospitals_drafts: "hospital",
    nt_hospitals: "hospital",
    nt_pending_deletion: "deletion",
    nt_script_import_sources: "import record",
};

function findPgError(e: any): PgLikeError | null {
    for (let current = e, depth = 0; current && depth < 5; current = current.cause, depth++) {
        if (typeof current?.code === "string" && /^[0-9A-Z]{5}$/.test(current.code)) return current;
    }
    return null;
}

function tableFrom(pg: PgLikeError, message: string) {
    const table = pg.table_name || pg.table || message.match(/(?:into|update|from)\s+"?(nt_[a-z_]+)"?/i)?.[1] || "";
    return TABLE_NAMES[table] || "";
}

/** The database's reason for a failed statement, in words; null when `e` is not a database error. */
export function describeDatabaseError(e: any): string | null {
    const pg = findPgError(e);
    const message = `${e?.message || ""}`;
    if (!pg) {
        if (/CONNECTION_(CLOSED|ENDED|DESTROYED)|ECONNRESET|terminating connection/i.test(message)) {
            return "the connection to the database was lost";
        }
        return null;
    }
    const what = tableFrom(pg, message);
    switch (pg.code) {
        case "23505":
            return `another change saved the same ${what || "row"} at the same time (${pg.constraint_name || pg.constraint || "unique constraint"})`;
        case "23503":
            return `it refers to a ${what || "row"} that no longer exists or was deleted meanwhile${pg.detail ? ` (${pg.detail})` : ""}`;
        case "55P03":
            return `another change kept the ${what || "data"} it needed locked for too long`;
        case "40P01":
            return `it collided with another change saving the same ${what || "data"} at the same time`;
        case "40001":
            return "another change saved the same data at the same time";
        case "57014":
            return "the database stopped it because it took too long";
        case "57P01":
        case "57P02":
        case "57P03":
            return "the database was restarted or shut down while saving";
        case "53300":
            return "the database has no free connections right now";
        default:
            return `${pg.message || message}${pg.detail ? ` (${pg.detail})` : ""}`;
    }
}

/** Why a call to another editor failed, in words; null when `e` is not an HTTP/network error. */
export function describeRemoteError(e: any, siteName = "the other editor"): string | null {
    const code = `${e?.code || e?.cause?.code || ""}`;
    const status = Number(e?.response?.status) || 0;
    if (status) {
        const remoteErrors = e?.response?.data?.errors;
        const remoteMessage = Array.isArray(remoteErrors) ? remoteErrors.join(", ") : `${e?.response?.data?.message || ""}`;
        if (status === 401 || status === 403) return `${siteName} refused this editor's API key (HTTP ${status}). Check the site's API key under Settings > Sites.`;
        if (status === 404) return `${siteName} does not have what was asked for (HTTP 404)${remoteMessage ? `: ${remoteMessage}` : ""}. It may be running an older version.`;
        if (status === 413) return `the data was too large for ${siteName} to accept (HTTP 413).`;
        if (status === 502 || status === 503 || status === 504) return `${siteName} is not available right now (HTTP ${status}).`;
        return `${siteName} answered with an error (HTTP ${status})${remoteMessage ? `: ${remoteMessage}` : ""}.`;
    }
    if (code === "ECONNABORTED" || code === "ETIMEDOUT" || /timeout of \d+ms exceeded/i.test(`${e?.message || ""}`)) {
        return `${siteName} did not answer in time.`;
    }
    if (code === "ECONNREFUSED") return `${siteName} could not be reached (connection refused). It may be down or restarting.`;
    if (code === "ENOTFOUND" || code === "EAI_AGAIN") return `${siteName}'s address could not be found. Check its link under Settings > Sites.`;
    if (code === "ECONNRESET" || code === "EPIPE") return `the connection to ${siteName} was cut off.`;
    if (code === "CERT_HAS_EXPIRED" || /certificate/i.test(code)) return `${siteName}'s HTTPS certificate was not accepted (${code}).`;
    return null;
}

/** Best description for any error: database, then remote, then the error's own message. */
export function describeError(e: any, siteName?: string): string {
    if (e?.name === "ContentWriteBusyError") return `${e.message}`;
    return describeDatabaseError(e) || describeRemoteError(e, siteName) || `${e?.message || e || "unknown error"}`;
}
