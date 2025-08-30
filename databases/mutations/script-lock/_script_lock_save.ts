import db from '@/databases/pg/drizzle';
import { desc,ne,eq, and, Query, } from 'drizzle-orm';
import { ntScriptLock,scriptsDrafts,drugsLibraryDrafts,dataKeysDrafts} from "@/databases/pg/schema";
import logger from '@/lib/logger';

import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import OpsLayout from '@/app/(ops)/layout';

export type SaveLockResponse = {
  success: boolean;
  errors?: string[];
  info?: { query?: Query; };
};

type LockType = 'script' | 'data_key' | 'drug_library';

export async function lockExists(opts:{
  script: string,
  lockType?: LockType
}){

  const duplicate = opts.script?await db.query.ntScriptLock.findFirst({
          where: (and(eq(ntScriptLock.scriptId, opts.script),eq(ntScriptLock.lockType, opts.lockType||'script')))
        }):(opts.lockType &&opts.lockType!='script')?await db.query.ntScriptLock.findFirst({
          where: (eq(ntScriptLock.lockType, opts.lockType))
        }):null
return !!duplicate
   
}
export async function isLocked(opts:{
  script: string,
  lockType?: LockType
}){
   const authenticated = await getAuthenticatedUser();
   if(authenticated){
  const duplicate = opts.script?await db.query.ntScriptLock.findFirst({
          where: (and(eq(ntScriptLock.scriptId, opts.script),
           eq(ntScriptLock.userId, authenticated.userId),
           eq(ntScriptLock.lockType, opts.lockType||'script')
          ))
        }): (opts.lockType &&opts.lockType!='script')?await db.query.ntScriptLock.findFirst({
          where: (eq(ntScriptLock.userId, authenticated.userId),
           eq(ntScriptLock.lockType, opts.lockType))
        }):null
        
  const lockedBySomeone = await lockExists({script:opts.script,lockType:opts.lockType})
   if(duplicate){
    return false
   } else{
     if(!!lockedBySomeone){
      return true
     }else{
      return false
     }
   }  
   
   }else{
    return true
   }

}

export async function isAvailableForUpdate(opts:{
  script: string,
  lockType: LockType,
}){
  await _createNewLock({script:opts.script,lockType: opts.lockType})

  return await isLocked({script:opts.script});
}

export async function dropLocks(opts:{
  script: string,
  lockType?: LockType,
}){
  const authenticated = await getAuthenticatedUser();
  if(opts.script!=''){
  const script_draft = await db.query.scriptsDrafts.findFirst({
          where: (eq(scriptsDrafts.scriptId,opts.script))
        })
  const screens_draft = await db.query.screensDrafts.findFirst({
          where: (eq(scriptsDrafts.scriptId,opts.script))
        })
   const diagnoses_draft = await db.query.diagnosesDrafts.findFirst({
          where: (eq(scriptsDrafts.scriptId,opts.script))
        })
  if(!script_draft && !screens_draft && !diagnoses_draft){
    await db.delete(ntScriptLock).where(and(eq(ntScriptLock.scriptId,opts.script),eq(ntScriptLock.userId,authenticated?.userId||'')))
  }
}else{
  const drugs_draft = await db.query.drugsLibraryDrafts.findFirst()
  
  if(!drugs_draft){
     await db.delete(ntScriptLock).where(and(eq(ntScriptLock.lockType,'drug_library'),eq(ntScriptLock.userId,authenticated?.userId||'')))
  }
   const data_key_draft = await db.query.dataKeys.findFirst()

  if(!data_key_draft){
     await db.delete(ntScriptLock).where(and(eq(ntScriptLock.lockType,'data_key'),eq(ntScriptLock.userId,authenticated?.userId||'')))
  }
}
}

export async function dropAllStaleLocks(){
  const lockedScripts = await db.query.ntScriptLock.findMany({
     columns: {
                scriptId: true
            }
          }
  )
  const authenticated = await getAuthenticatedUser();
  for (const sid of lockedScripts){
  const script_draft = await db.query.scriptsDrafts.findFirst({
          where: (eq(scriptsDrafts.scriptId,String(sid)))
        })
  const screens_draft = await db.query.screensDrafts.findFirst({
          where: (eq(scriptsDrafts.scriptId,String(sid)))
        })
   const diagnoses_draft = await db.query.diagnosesDrafts.findFirst({
          where: (eq(scriptsDrafts.scriptId,String(sid)))
        })
  if(!script_draft && !screens_draft && !diagnoses_draft){
    await db.delete(ntScriptLock).where(and(eq(ntScriptLock.scriptId,String(sid)),eq(ntScriptLock.userId,authenticated?.userId||'')))
  }
  }

  const drugs_draft = await db.query.drugsLibraryDrafts.findFirst()
  if(!drugs_draft){
      await db.delete(ntScriptLock).where(and(eq(ntScriptLock.lockType,'drug_library'),eq(ntScriptLock.userId,authenticated?.userId||'')))
  }
  const data_key_draft = await db.query.dataKeys.findFirst()
  if(!data_key_draft){
      await db.delete(ntScriptLock).where(and(eq(ntScriptLock.lockType,'data_key'),eq(ntScriptLock.userId,authenticated?.userId||'')))
  }

}




export async function _createNewLock(
params: {
  script:string,
  lockType: LockType
}) {
  const response: SaveLockResponse = { success: false, };
  const errors = [];
  const info: SaveLockResponse['info'] = {};
  try {
    console.log("---I MA NOT NNNNNNN",params.lockType)
      try {
        const duplicate = await lockExists({script:params.script,lockType:params.lockType})
        console.log("---KWETE---",duplicate)
        if (!duplicate) {
           const authenticated = await getAuthenticatedUser();
          const q = db.insert(ntScriptLock).values({
            userId: authenticated?.userId!,
            scriptId:params.script||null,
            lockType: params.lockType
          })
          info.query = q.toSQL();
          await q.execute();
        }
      } catch (ex: any) {
         logger.error(ex.message)
        errors.push(ex.message);
      }

    if (errors.length) {
      response.errors = errors;
      response.info = info;
    } else {
      response.success = true;
    }
  } catch (ex: any) {
     response.success = false;
        response.errors = [ex.message];
        response.info = info;
        
  }

}



