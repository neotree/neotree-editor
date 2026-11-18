import { desc, eq } from 'drizzle-orm';
import * as uuid from 'uuid';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { hospitals, hospitalsDrafts } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import { assertDraftOwner } from "@/lib/server/draft-owner";
import { queueContentWrite } from "@/lib/server/content-write-lock";
import { describeError } from '@/lib/server/db-errors';

export type SaveHospitalsData = Partial<typeof hospitals.$inferSelect>;

export type SaveHospitalsResponse = { 
    success: boolean; 
    errors?: string[]; 
};

async function _saveHospitalsNow({ data, broadcastAction = true, userId, }: {
    data: SaveHospitalsData[],
    broadcastAction?: boolean,
    userId?: string;
}) {
    const response: SaveHospitalsResponse = { success: false, };

    try {
        // nobody could see, publish or discard a draft without an owner
        await assertDraftOwner(userId);
        const errors = [];

        let index = 0;
        for (const { hospitalId: itemHospitalId, ...item } of data) {
            try {
                index++;

                const hospitalId = itemHospitalId || uuid.v4();

                if (!errors.length) {
                    const draft = !itemHospitalId ? null : await db.query.hospitalsDrafts.findFirst({
                        where: eq(hospitalsDrafts.hospitalDraftId, hospitalId),
                    });

                    const published = (draft || !itemHospitalId) ? null : await db.query.hospitals.findFirst({
                        where: eq(hospitals.hospitalId, hospitalId),
                    });

                    if (draft) {
                        const data = {
                            ...draft.data,
                            ...item,
                        };
                        
                        await db
                            .update(hospitalsDrafts)
                            .set({
                                data,
                            }).where(eq(hospitalsDrafts.hospitalDraftId, hospitalId));
                    } else {
                        const data = {
                            ...published,
                            ...item,
                            hospitalId,
                            version: published?.version ? (published.version + 1) : 1,
                        } as typeof hospitals.$inferInsert;

                        await db.insert(hospitalsDrafts).values({
                            data,
                            hospitalDraftId: hospitalId,
                            hospitalId: published?.hospitalId,
                            createdByUserId: userId,
                        });
                    }
                }
            } catch(e: any) {
                errors.push(describeError(e));
            }
        }

        if (errors.length) {
            response.errors = errors;
        } else {
            response.success = true;
        }
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_saveHospitals ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'save_hospitals');
        return response;
    }
}

/** Queued behind this editor's other content writers (lib/server/content-write-lock.ts), unless inside a caller's transaction. */
export async function _saveHospitals(...args: Parameters<typeof _saveHospitalsNow>): ReturnType<typeof _saveHospitalsNow> {
    return queueContentWrite('a hospital save', args[0] as any, () => _saveHospitalsNow(...args));
}
