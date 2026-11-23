import { eq, sql } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { files, filesAliases } from "@/databases/pg/schema";
import logger from "@/lib/logger";

async function resolveFileId(fileId: string) {
  const alias = await db.query.filesAliases.findFirst({
    where: eq(filesAliases.alias, fileId),
  });
  return alias?.fileId || fileId;
}

export type FileByteMeta = {
  fileId: string;
  size: number;
  contentType: string;
  filename: string;
} | null;

/** Reads APK metadata + true byte size without loading the file body into memory. */
export async function _getFileByteMeta(fileId: string): Promise<{ data: FileByteMeta; errors?: string[] }> {
  try {
    const resolvedId = await resolveFileId(fileId);
    const rows = await db
      .select({
        fileId: files.fileId,
        contentType: files.contentType,
        filename: files.filename,
        size: sql<number>`octet_length(${files.data})`,
      })
      .from(files)
      .where(eq(files.fileId, resolvedId))
      .limit(1);

    const row = rows[0];
    if (!row) return { data: null };
    return {
      data: {
        fileId: row.fileId,
        size: Number(row.size) || 0,
        contentType: row.contentType,
        filename: row.filename,
      },
    };
  } catch (e: any) {
    logger.error("_getFileByteMeta ERROR", e.message);
    return { data: null, errors: [e.message] };
  }
}

/**
 * Reads a single byte range straight from Postgres using substring(), so a
 * download (or resumed range request) never pulls the whole APK into Node
 * memory (#4). `start` is 0-based; `length` is the number of bytes.
 */
export async function _getFileBytesRange(fileId: string, start: number, length: number): Promise<Buffer | null> {
  try {
    if (length <= 0) return Buffer.alloc(0);
    const resolvedId = await resolveFileId(fileId);
    // Postgres substring() is 1-based.
    const rows = await db
      .select({
        chunk: sql<Buffer>`substring(${files.data} from ${start + 1} for ${length})`,
      })
      .from(files)
      .where(eq(files.fileId, resolvedId))
      .limit(1);

    const chunk = rows[0]?.chunk;
    if (chunk == null) return null;
    return Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as any);
  } catch (e: any) {
    logger.error("_getFileBytesRange ERROR", e.message);
    return null;
  }
}
