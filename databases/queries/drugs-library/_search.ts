import { and, eq, isNull, notInArray, or, sql } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import * as schema from '@/databases/pg/schema';
import logger from "@/lib/logger";
import { 
    parseDrugsLibrarySearchResults, 
    type DrugsLibrarySearchResultsItem, 
    type DrugsLibrarySearchSourceItem, 
} from "@/lib/drugs-library-search";
import { normalizeSearchTerm } from "@/lib/search";

export type SearchDrugsLibraryParams = {
    searchValue: string;
    returnDraftsIfExist?: boolean;
};

export type SearchDrugsLibraryResponse = {
    data: DrugsLibrarySearchResultsItem[];
    errors?: string[];
};

export async function _searchDrugsLibrary({
    searchValue,
    returnDraftsIfExist = true,
}: SearchDrugsLibraryParams): Promise<SearchDrugsLibraryResponse> {
    try {
        const rawSearchValue = `${searchValue || ''}`;
        const { normalizedValue } = normalizeSearchTerm(rawSearchValue);
        if (!normalizedValue) return { data: [] };

        const pattern = `%${normalizedValue}%`;

        const drafts = !returnDraftsIfExist ? [] : await db.query.drugsLibraryDrafts.findMany({
            where: sql`lower(${schema.drugsLibraryDrafts.data}::text) like ${pattern}`,
        });

        const draftItemIds = drafts
            .map(d => d.itemId || d.data.itemId || null)
            .filter((id): id is string => !!id);

        const published = await db.select({
            item: schema.drugsLibrary,
            pendingDeletion: schema.pendingDeletion,
        })
        .from(schema.drugsLibrary)
        .leftJoin(schema.pendingDeletion, eq(schema.pendingDeletion.drugsLibraryItemId, schema.drugsLibrary.itemId))
        .where(and(
            isNull(schema.pendingDeletion),
            isNull(schema.drugsLibrary.deletedAt),
            !draftItemIds.length ? undefined : notInArray(schema.drugsLibrary.itemId, draftItemIds),
            or(
                sql`lower(${schema.drugsLibrary.key}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.keyId}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.gestationKey}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.gestationKeyId}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.weightKey}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.weightKeyId}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.diagnosisKey}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.diagnosisKeyId}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.ageKey}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.ageKeyId}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.drug}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.type}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.dosageText}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.managementText}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.administrationFrequency}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.routeOfAdministration}::text) like ${pattern}`,
                sql`lower(${schema.drugsLibrary.condition}::text) like ${pattern}`,
            ),
        ));

        type DrugsLibraryDraftRow = typeof schema.drugsLibraryDrafts.$inferSelect;
        type DrizzleDrugsLibrary = typeof schema.drugsLibrary.$inferSelect;

        const coerceDate = (value: unknown, fallback: Date): Date => {
            if (value instanceof Date) return value;
            if (typeof value === 'string' || typeof value === 'number') {
                const parsed = new Date(value);
                if (!Number.isNaN(parsed.getTime())) return parsed;
            }

            return fallback;
        };

        const toDraftSearchItem = (draft: DrugsLibraryDraftRow): DrugsLibrarySearchSourceItem | null => {
            const data = draft.data as Partial<DrizzleDrugsLibrary> & Pick<DrugsLibrarySearchSourceItem, 'preferences'>;

            const itemId = data.itemId ?? draft.itemId ?? draft.itemDraftId;
            if (!itemId) return null;

            const normalized: DrizzleDrugsLibrary = {
                id: data.id ?? 0,
                itemId,
                key: data.key ?? draft.key,
                keyId: data.keyId ?? '',
                type: data.type ?? draft.type,
                drug: data.drug ?? '',
                minGestation: data.minGestation ?? null,
                maxGestation: data.maxGestation ?? null,
                minWeight: data.minWeight ?? null,
                maxWeight: data.maxWeight ?? null,
                minAge: data.minAge ?? null,
                maxAge: data.maxAge ?? null,
                hourlyFeed: data.hourlyFeed ?? null,
                hourlyFeedDivider: data.hourlyFeedDivider ?? null,
                dosage: data.dosage ?? null,
                dosageMultiplier: data.dosageMultiplier ?? null,
                dayOfLife: data.dayOfLife ?? '',
                dosageText: data.dosageText ?? '',
                managementText: data.managementText ?? '',
                gestationKey: data.gestationKey ?? '',
                weightKey: data.weightKey ?? '',
                diagnosisKey: data.diagnosisKey ?? '',
                ageKey: data.ageKey ?? '',
                ageKeyId: data.ageKeyId ?? '',
                gestationKeyId: data.gestationKeyId ?? '',
                weightKeyId: data.weightKeyId ?? '',
                diagnosisKeyId: data.diagnosisKeyId ?? '',
                administrationFrequency: data.administrationFrequency ?? '',
                drugUnit: data.drugUnit ?? '',
                routeOfAdministration: data.routeOfAdministration ?? '',
                position: data.position ?? draft.position,
                condition: data.condition ?? '',
                calculator_condition: data.calculator_condition ?? '',
                validationType: data.validationType ?? 'default',
                version: data.version ?? 0,
                publishDate: coerceDate(data.publishDate, new Date()),
                createdAt: coerceDate(data.createdAt, draft.createdAt),
                updatedAt: coerceDate(data.updatedAt, draft.updatedAt),
                deletedAt: data.deletedAt ? coerceDate(data.deletedAt, draft.updatedAt) : null,
            };

            return {
                ...normalized,
                itemId,
                isDraft: true,
                draftCreatedByUserId: draft.createdByUserId,
                preferences: data.preferences ?? null,
            } satisfies DrugsLibrarySearchSourceItem;
        };

        const draftItems: DrugsLibrarySearchSourceItem[] = drafts
            .map(toDraftSearchItem)
            .filter((item): item is DrugsLibrarySearchSourceItem => !!item);

        const publishedItems: DrugsLibrarySearchSourceItem[] = published
            .map(({ item }) => item)
            .filter((item): item is typeof schema.drugsLibrary.$inferSelect => !!item)
            .map(item => ({
                ...item,
                itemId: item.itemId,
                isDraft: false,
            }));

        const items = [
            ...draftItems,
            ...publishedItems,
        ].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

        const data = parseDrugsLibrarySearchResults({
            searchValue: rawSearchValue,
            items,
        });

        return { data };
    } catch (error: any) {
        logger.error('_searchDrugsLibrary ERROR', error.message);
        return {
            errors: [error.message],
            data: [],
        };
    }
}
