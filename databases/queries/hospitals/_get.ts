import { and, eq, inArray, isNull, notInArray, or } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { hospitals, hospitalsDrafts, pendingDeletion, } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { Preferences } from "@/types";

export type GetHospitalsParams = {
    hospitalsIds?: string[];
    returnDraftsIfExist?: boolean;
    withDeleted?: boolean;
};

export type GetHospitalsResults = {
    data: (typeof hospitals.$inferSelect & {
        isDraft: boolean;
        isDeleted: boolean;
        isUnpublishedDraft: boolean;
        preferences: Preferences;
        draftCreatedByUserId?: string | null;
    })[];
    errors?: string[];
};

export async function _getHospitals(
    params?: GetHospitalsParams
): Promise<GetHospitalsResults> {
    try {
        const { hospitalsIds: _hospitalsIds, returnDraftsIfExist = true, } = { ...params };

        let hospitalsIds = _hospitalsIds || [];
        
        // unpublished hospitals conditions
        const whereHospitalsDraftsIds = !hospitalsIds?.length ? 
            undefined 
            : 
            inArray(hospitalsDrafts.hospitalDraftId, hospitalsIds.map(id => uuid.validate(id) ? id : uuid.v4()));
        const whereHospitalsDrafts = [
            ...(!whereHospitalsDraftsIds ? [] : [whereHospitalsDraftsIds]),
        ];
        const drafts = !returnDraftsIfExist ? [] : await db.query.hospitalsDrafts.findMany({
            where: and(...whereHospitalsDrafts),
        });
        hospitalsIds = hospitalsIds.filter(id => !drafts.map(d => d.hospitalDraftId).includes(id));

        // published hospitals conditions
        const whereHospitalsIdsNotIn = !drafts.length ? undefined : notInArray(hospitals.hospitalId, drafts.map(d => d.hospitalDraftId));
        const whereHospitalsIds = !hospitalsIds?.length ? 
            undefined 
            : 
            inArray(hospitals.hospitalId, hospitalsIds.filter(id => uuid.validate(id)));
        const whereOldHospitalsIds = !hospitalsIds?.length ? 
            undefined 
            : 
            inArray(hospitals.oldHospitalId, hospitalsIds.filter(id => !uuid.validate(id)));
        const whereHospitals = [
            isNull(hospitals.deletedAt),
            isNull(pendingDeletion),
            ...((!whereHospitalsIds || !whereOldHospitalsIds) ? [] : [or(whereHospitalsIds, whereOldHospitalsIds)]),
            whereHospitalsIdsNotIn,
        ];

        const publishedRes = await db
            .select({
                hospital: hospitals,
                pendingDeletion: pendingDeletion,
            })
            .from(hospitals)
            .leftJoin(pendingDeletion, eq(pendingDeletion.hospitalId, hospitals.hospitalId))
            .where(!whereHospitals.length ? undefined : and(...whereHospitals));

        const published = publishedRes.map(s => s.hospital);

        const inPendingDeletion = !published.length ? [] : await db.query.pendingDeletion.findMany({
            where: inArray(pendingDeletion.hospitalId, published.map(s => s.hospitalId)),
            columns: { hospitalId: true, },
        });

        const responseData = [
            ...published.map(s => ({
                ...s,
                isDraft: false,
                isDeleted: false,
                isUnpublishedDraft: false,
            } as GetHospitalsResults['data'][0])),

            ...drafts.map((s => ({
                ...s.data,
                isDraft: true,
                isDeleted: false,
                isUnpublishedDraft: !s.hospitalId,
                draftCreatedByUserId: s.createdByUserId,
            } as GetHospitalsResults['data'][0])))
        ]
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .filter(s => !inPendingDeletion.map(s => s.hospitalId).includes(s.hospitalId));

        return  { 
            data: responseData,
        };
    } catch(e: any) {
        logger.error('_getHospitals ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

export type GetHospitalResults = {
    data?: null | typeof hospitals.$inferSelect & {
        isDraft: boolean;
        isDeleted: boolean;
        draftCreatedByUserId?: string | null;
        isUnpublishedDraft: boolean;
    };
    errors?: string[];
};

export async function _getHospital(
    params: {
        hospitalId: string,
        returnDraftIfExists?: boolean;
    },
): Promise<GetHospitalResults> {
    const { hospitalId, returnDraftIfExists = true, } = { ...params };

    try {
        if (!hospitalId) throw new Error('Missing hospitalId');

        const whereHospitalId = uuid.validate(hospitalId) ? eq(hospitals.hospitalId, hospitalId) : undefined;
        const whereOldHospitalId = !uuid.validate(hospitalId) ? eq(hospitals.oldHospitalId, hospitalId) : undefined;
        const whereHospitalDraftId = !whereHospitalId ? undefined : eq(hospitalsDrafts.hospitalDraftId, hospitalId);

        let draft = (returnDraftIfExists && whereHospitalDraftId) ? await db.query.hospitalsDrafts.findFirst({
            where: whereHospitalDraftId,
        }) : undefined;

        let responseData = !draft ? null : {
            ...draft.data,
            draftCreatedByUserId: draft.createdByUserId,
            isDraft: true,
            isDeleted: false,
            isUnpublishedDraft: !draft.hospitalId,
        } as GetHospitalResults['data'];

        if (responseData) return { data: responseData, };

        const published = await db.query.hospitals.findFirst({
            where: and(
                isNull(hospitals.deletedAt),
                whereHospitalId || whereOldHospitalId,
            ),
            with: {
                draft: true,
            },
        });

        draft = returnDraftIfExists ? published?.draft : undefined;

        const data = (draft?.data || published) as GetHospitalResults['data'];

        responseData = !data ? null : {
            ...data,
            draftCreatedByUserId: draft?.createdByUserId,
            isDraft: !!draft?.data,
            isDeleted: false,
            isUnpublishedDraft: false,
        };

        if (!responseData) return { data: null, };

        return  { 
            data: responseData, 
        };
    } catch(e: any) {
        logger.error('_getHospital ERROR', e.message);
        return { errors: [e.message], };
    }
} 
