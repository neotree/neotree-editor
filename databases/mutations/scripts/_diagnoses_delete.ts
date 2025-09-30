import { and, eq, inArray, isNull, or } from 'drizzle-orm';

import logger from '@/lib/logger';
import db from '@/databases/pg/drizzle';
import { diagnoses, diagnosesDrafts, pendingDeletion, scriptsDrafts, } from '@/databases/pg/schema';
import socket from '@/lib/socket';
import {getChangedScripts} from "../script-lock/_script_lock_save"

export type DeleteDiagnosesData = {
    diagnosesIds?: string[];
    scriptsIds?: string[];
    broadcastAction?: boolean;
    confirmDeleteAll?: boolean;
};

export type DeleteDiagnosesResponse = { 
    success: boolean; 
    errors?: string[]; 
};

export async function _deleteAllDiagnosesDrafts(): Promise<boolean> {
    try {
        await db.delete(diagnosesDrafts);
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function _deleteDiagnoses(
    { 
        diagnosesIds = [], 
        scriptsIds = [], 
        confirmDeleteAll,
        broadcastAction, 
    }: DeleteDiagnosesData,
) {
    const response: DeleteDiagnosesResponse = { success: false, };

    try {
        const shouldConfirmDeleteAll = !scriptsIds.length && !diagnosesIds.length && !confirmDeleteAll;
        if (shouldConfirmDeleteAll) throw new Error('You&apos;re about to delete all the diagnoses, please confirm this action!');

       const changedDiagnoses = await getChangedScripts()
        // delete drafts
         if(changedDiagnoses && changedDiagnoses.length>0){
        await db.delete(diagnosesDrafts).where(or(
            inArray(diagnosesDrafts.scriptId,changedDiagnoses),
            inArray(diagnosesDrafts.scriptDraftId,changedDiagnoses)

        )
        
            // !diagnosesIds.length ? undefined : inArray(diagnosesDrafts.diagnosisDraftId, diagnosesIds),
            // !scriptsIds.length ? undefined : or(
            //     inArray(diagnosesDrafts.scriptId, scriptsIds),
            //     inArray(diagnosesDrafts.scriptDraftId, scriptsIds)
            // ),
        );
    

        // insert config keys into pendingDeletion, we'll delete them when data is published
        const diagnosesArr = await db
            .select({
                diagnosisId: diagnoses.diagnosisId,
                diagnosisScriptId: diagnoses.scriptId,
                scriptDraftId: scriptsDrafts.scriptDraftId,
                pendingDeletion: pendingDeletion,
            })
            .from(diagnoses)
            .leftJoin(pendingDeletion, eq(pendingDeletion.diagnosisId, diagnoses.diagnosisId))
            .leftJoin(scriptsDrafts, eq(scriptsDrafts.scriptId, diagnoses.scriptId))
            .where(and(
                isNull(diagnoses.deletedAt),
                isNull(pendingDeletion),
                // !diagnosesIds.length ? undefined : inArray(diagnoses.diagnosisId, diagnosesIds),
                // Only Change What Current User Changed
                inArray(diagnoses.scriptId,changedDiagnoses)
    
            ));

        const pendingDeletionInsertData = diagnosesArr;
        if (pendingDeletionInsertData.length) await db.insert(pendingDeletion).values(pendingDeletionInsertData);
         }
        response.success = true;
    } catch(e: any) {
        response.success = false;
        response.errors = [e.message];
        logger.error('_deleteDiagnoses ERROR', e.message);
    } finally {
        if (!response?.errors?.length && broadcastAction) socket.emit('data_changed', 'delete_diagnoses');
        return response;
    }
}
