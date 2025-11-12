import logger from "@/lib/logger";
import { Preferences } from "@/types";

import { _getDrugsLibraryItems, GetDrugsLibraryItemsParams } from "./_get-drugs-library";

export type GetDrugsLibraryMetadataParams = Pick<GetDrugsLibraryItemsParams, 'itemsIds' | 'keys' | 'returnDraftsIfExist'>;

export type DrugsLibraryMetadataItem = {
    itemId: string;
    key: string;
    keyId: string;
    type: string;
    drug: string;
    gestationKey: string;
    gestationKeyId: string;
    weightKey: string;
    weightKeyId: string;
    diagnosisKey: string;
    diagnosisKeyId: string;
    ageKey: string;
    ageKeyId: string;
    dosageText: string;
    managementText: string;
    administrationFrequency: string;
    routeOfAdministration: string;
    condition: string;
    preferences: Preferences | null;
    validationType: string | null;
    minGestation: number | null;
    maxGestation: number | null;
    minWeight: number | null;
    maxWeight: number | null;
    minAge: number | null;
    maxAge: number | null;
    drugUnit: string | null;
    dosage: number | null;
    dosageMultiplier: number | null;
    hourlyFeed: number | null;
    hourlyFeedDivider: number | null;
    dayOfLife: string | null;
    publishDate: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    isDraft: boolean;
    isDeleted: boolean;
    version: number;
};

export type GetDrugsLibraryMetadataResponse = {
    data: DrugsLibraryMetadataItem[];
    errors?: string[];
};

export async function _getDrugsLibraryMetadata(
    params?: GetDrugsLibraryMetadataParams,
): Promise<GetDrugsLibraryMetadataResponse> {
    try {
        const { itemsIds, keys, returnDraftsIfExist = true } = { ...params };

        const res = await _getDrugsLibraryItems({
            itemsIds,
            keys,
            returnDraftsIfExist,
        });

        if (res.errors?.length) {
            return {
                data: [],
                errors: res.errors,
            };
        }

        const data: DrugsLibraryMetadataItem[] = res.data.map(item => ({
            itemId: item.itemId,
            key: item.key || '',
            keyId: item.keyId || '',
            type: item.type || '',
            drug: item.drug || '',
            gestationKey: item.gestationKey || '',
            gestationKeyId: item.gestationKeyId || '',
            weightKey: item.weightKey || '',
            weightKeyId: item.weightKeyId || '',
            diagnosisKey: item.diagnosisKey || '',
            diagnosisKeyId: item.diagnosisKeyId || '',
            ageKey: item.ageKey || '',
            ageKeyId: item.ageKeyId || '',
            dosageText: item.dosageText || '',
            managementText: item.managementText || '',
            administrationFrequency: item.administrationFrequency || '',
            routeOfAdministration: item.routeOfAdministration || '',
            condition: item.condition || '',
            preferences: item.preferences ?? null,
            validationType: item.validationType || null,
            minGestation: item.minGestation ?? null,
            maxGestation: item.maxGestation ?? null,
            minWeight: item.minWeight ?? null,
            maxWeight: item.maxWeight ?? null,
            minAge: item.minAge ?? null,
            maxAge: item.maxAge ?? null,
            drugUnit: item.drugUnit ?? null,
            dosage: item.dosage ?? null,
            dosageMultiplier: item.dosageMultiplier ?? null,
            hourlyFeed: item.hourlyFeed ?? null,
            hourlyFeedDivider: item.hourlyFeedDivider ?? null,
            dayOfLife: item.dayOfLife ?? null,
            publishDate: item.publishDate ?? null,
            createdAt: item.createdAt ?? null,
            updatedAt: item.updatedAt ?? null,
            isDraft: !!item.isDraft,
            isDeleted: !!item.isDeleted,
            version: Number(item.version ?? 0),
        }));

        return { data };
    } catch (e: any) {
        logger.error('_getDrugsLibraryMetadata ERROR', e.message);
        return {
            data: [],
            errors: [e.message],
        };
    }
}
