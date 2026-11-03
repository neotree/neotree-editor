/**
 * What a file reference (a screen or diagnosis image) points at, in a form that is the same on every
 * editor. The id, URL and even the stored name are not: an import copies the file to the other editor
 * under a new id, the copy's name is prefixed with that id ("<id>__name.jpg?w=..&h=.."), and some
 * editors store generated names. What survives the copy is the file's size and its image dimensions.
 */
export function fileRefIdentity(ref: unknown): string | null {
    if (!ref || typeof ref !== "object") return (ref as string) ?? null;
    const r = ref as {
        filename?: string;
        size?: number | string;
        fileId?: string;
        data?: string;
        url?: string;
        metadata?: { width?: number | string; height?: number | string; } | null;
    };
    const size = Number(r.size) || null;
    if (size) {
        const dims = imageDimensions(r);
        return `size:${size}${dims ? `|${dims}` : ""}`;
    }
    // no size recorded: fall back to the name (without the copy's id prefix), then the id
    const name = `${r.filename || ""}`
        .split("?")[0]
        .replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}__/i, "")
        .trim()
        .toLowerCase();
    if (name) return `name:${name}`;
    return r.fileId || r.data || null;
}

/** "WxH" from the metadata, or from the w/h (width/height) query on the stored name or URL. */
function imageDimensions(r: { filename?: string; data?: string; url?: string; metadata?: { width?: number | string; height?: number | string; } | null; }) {
    const w = Number(r.metadata?.width), h = Number(r.metadata?.height);
    if (w && h) return `${w}x${h}`;
    for (const source of [r.filename, r.data, r.url]) {
        const query = `${source || ""}`.split("?")[1];
        if (!query) continue;
        const params = new URLSearchParams(query);
        const qw = Number(params.get("w") || params.get("width")), qh = Number(params.get("h") || params.get("height"));
        if (qw && qh) return `${qw}x${qh}`;
    }
    return null;
}
