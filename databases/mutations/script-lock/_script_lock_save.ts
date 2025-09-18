import db from '@/databases/pg/drizzle';
import { desc,ne,eq, and, Query,or,isNotNull } from 'drizzle-orm';
import { ntScriptLock,scriptsDrafts,screensDrafts,diagnosesDrafts,scripts, pendingDeletion} from "@/databases/pg/schema";
import logger from '@/lib/logger';

import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import OpsLayout from '@/app/(ops)/layout';

export type SaveLockResponse = {
  success: boolean;
  errors?: string[];
  info?: { query?: Query; };
};

type LockType = 'script' | 'data_key' | 'drug_library';



export async function lockExists(opts: {
  script: string,
  lockType?: LockType
}) {
  const { script, lockType = 'script' } = opts;
  
  if (!script && lockType === 'script') {
    return false;
  }
  const whereClause = script
    ? and(
        or(
          eq(ntScriptLock.scriptId, script),
          eq(ntScriptLock.newScriptId, script)
        ),
        eq(ntScriptLock.lockType, lockType)
      )
    : eq(ntScriptLock.lockType, lockType)

  const duplicate = await db.query.ntScriptLock.findFirst({
    where: whereClause
  });

  return !!duplicate;
}

export async function existsByScriptAndUser(
script: string
){
  const authenticated = await getAuthenticatedUser();
  if(script && authenticated){
const exists = await db.query.ntScriptLock.findFirst({
   where: (and(or(eq(ntScriptLock.scriptId, script),eq(ntScriptLock.newScriptId, script)),
           eq(ntScriptLock.userId, authenticated.userId)))
       })
   return !!exists
      }
 return false
}

export async function existsByLockTypeAndUser(
lockType:LockType
){
  const authenticated = await getAuthenticatedUser();
  if(lockType && authenticated){
  const exists = await db.query.ntScriptLock.findFirst({
   where: (and(eq(ntScriptLock.lockType, lockType),
           eq(ntScriptLock.userId, authenticated?.userId)))
       })
 return !!exists
      }
return false
 
}

export async function userLockExists(){
   const authenticated = await getAuthenticatedUser();
   if(authenticated){
  const exists =await db.query.ntScriptLock.findFirst({
    where: (eq(ntScriptLock.userId, authenticated?.userId))
    })
    return !!exists
   }
   return false;
}

export async function isLocked(opts: {
  script: string,
  lockType?: LockType
}) {
  const authenticated = await getAuthenticatedUser();
  if (!authenticated) {
    return true;
  }
  const { script, lockType = 'script' } = opts;  
  // First check if current user has a lock
  if (script) {
    const userLock = await db.query.ntScriptLock.findFirst({
      where: and(
        or(
          eq(ntScriptLock.scriptId, script),
          eq(ntScriptLock.newScriptId, script)
        ),
        eq(ntScriptLock.userId, authenticated.userId),
        eq(ntScriptLock.lockType, lockType)
      )
    });
    if (userLock) {
      return false; // User has the lock, so it's not locked for them
    }
  } else if (lockType !== 'script') {
    const userLock = await db.query.ntScriptLock.findFirst({
      where: and(
        eq(ntScriptLock.userId, authenticated.userId),
        eq(ntScriptLock.lockType, lockType)
      )
    });
    
    if (userLock) {
      return false; // User has a lock of this type
    }
  }

  // If user doesn't have a lock, check if anyone else does
  return lockExists(opts);
}

export async function isAvailableForUpdate(opts:{
  script: string,
  lockType: LockType,
}){
  await _createNewLock({script:opts.script,lockType: opts.lockType})

  return await isLocked({script:opts.script,lockType:opts.lockType});
}

export async function dropLocks(opts: {
  lockType?: LockType,
}) {
 
  const authenticated = await getAuthenticatedUser();
  const userId = authenticated?.userId || '';
 const allScripts = (await db.query.ntScriptLock.findMany({})).map(s => s.scriptId || s.newScriptId).filter(s=>s!=null)||[];

  for (const script of allScripts) {
    // Execute all draft checks in parallel
    const [script_draft, screens_draft, diagnoses_draft, pd_drafts] = await Promise.all([
      db.query.scriptsDrafts.findFirst({
        where: (or(eq(scriptsDrafts.scriptId, script),eq(scriptsDrafts.scriptDraftId, script)))
      }),
      db.query.screensDrafts.findFirst({
        where: eq(screensDrafts.scriptId, script)
      }),
      db.query.diagnosesDrafts.findFirst({
        where: eq(diagnosesDrafts.scriptId, script)
      }),
      db.query.pendingDeletion.findFirst({
        where: or(
          eq(pendingDeletion.scriptId, script),
          eq(pendingDeletion.screenScriptId, script)
        )
      })
    ]);

    // Delete script lock if no drafts exist
    if (!script_draft && !screens_draft && !diagnoses_draft && !pd_drafts) {
      await db.delete(ntScriptLock).where(
        and(
          or((eq(ntScriptLock.scriptId, script),eq(ntScriptLock.newScriptId, script)),
          eq(ntScriptLock.userId, userId))
        )
      );
    }

    // Check drug library drafts and pending deletions in parallel
    const [drugs_draft, pd_drugs] = await Promise.all([
      db.query.drugsLibraryDrafts.findFirst({}),
      db.query.pendingDeletion.findFirst({
        where: isNotNull(pendingDeletion.drugsLibraryItemId)
      })
    ]);

    // Delete drug library lock if no drafts exist
    if (!drugs_draft && !pd_drugs) {
      await db.delete(ntScriptLock).where(
        and(
          eq(ntScriptLock.lockType, 'drug_library'),
          eq(ntScriptLock.userId, userId)
        )
      );
    }

    // Check data key drafts and pending deletions in parallel
    const [data_key_draft, pd_data_keys] = await Promise.all([
      db.query.dataKeys.findFirst({}),
      db.query.pendingDeletion.findFirst({
        where: isNotNull(pendingDeletion.dataKeyId)
      })
    ]);

    // Delete data key lock if no drafts exist
    if (!data_key_draft && !pd_data_keys) {
      await db.delete(ntScriptLock).where(
        and(
          eq(ntScriptLock.lockType, 'data_key'),
          eq(ntScriptLock.userId, userId)
        )
      );
    }

  } 
    // DROP LOCKS IF A USER NAVIGATES TO ANOTHER PAGE
    // Check drug library drafts and pending deletions in parallel
    if(opts.lockType !== 'drug_library'){
     const [drugs_draft, pd_drugs] = await Promise.all([
      db.query.drugsLibraryDrafts.findFirst({}),
      db.query.pendingDeletion.findFirst({
        where: isNotNull(pendingDeletion.drugsLibraryItemId)
      })
    ])
       if (!drugs_draft &&  !pd_drugs) {
      await db.delete(ntScriptLock).where(
        and(
          eq(ntScriptLock.lockType, 'drug_library'),
          eq(ntScriptLock.userId, userId)
        )
      );
    }
    }
   
   if(opts.lockType !== 'data_key'){
  const [data_key_draft, pd_data_keys] = await Promise.all([
      db.query.dataKeys.findFirst({}),
      db.query.pendingDeletion.findFirst({
        where: isNotNull(pendingDeletion.dataKeyId)
      })
    ]);
    if (!data_key_draft  && !pd_data_keys) {
      await db.delete(ntScriptLock).where(
        and(
          eq(ntScriptLock.lockType, 'data_key'),
          eq(ntScriptLock.userId, userId)
        )
      );
    }
   }   
   
}

export async function dropAllStaleLocks(){
  const lockedScripts = await db.query.ntScriptLock.findMany({
     columns: {
                scriptId: true,
                lockType:true,
                newScriptId:true
            }
          }
  )
  
  const authenticated = await getAuthenticatedUser();
  for (const sid of lockedScripts){
    if(sid.scriptId){
  const script_draft = await db.query.scriptsDrafts.findFirst({
          where: (eq(scriptsDrafts.scriptId,String(sid.scriptId)))
        })
  const screens_draft = await db.query.screensDrafts.findFirst({
          where: (eq(scriptsDrafts.scriptId,String(sid.scriptId)))
        })
   const diagnoses_draft = await db.query.diagnosesDrafts.findFirst({
          where: (eq(scriptsDrafts.scriptId,String(sid.scriptId)))
        })
  if(!script_draft && !screens_draft && !diagnoses_draft){
    await db.delete(ntScriptLock)
    .where(and(eq(ntScriptLock.scriptId,String(sid.scriptId))
    ,eq(ntScriptLock.userId,authenticated?.userId||'')))
  }
 } else if(sid.newScriptId){
const new_script_draft = await db.query.scriptsDrafts.findFirst({
  where: (eq(scriptsDrafts.scriptDraftId,sid.newScriptId))
})
if(!new_script_draft){
   await db.delete(ntScriptLock)
   .where(and(eq(ntScriptLock.newScriptId,String(sid.scriptId))
   ,eq(ntScriptLock.userId,authenticated?.userId||'')))
}
} else {
  if(sid.lockType=='drug_library'){
      const drugs_draft = await db.query.drugsLibraryDrafts.findFirst({})
    const pd_drugs = await db.query.pendingDeletion.findFirst({
      where: (isNotNull(pendingDeletion?.drugsLibraryItemId))
    }) 

  if(!drugs_draft && !pd_drugs){
      await db.delete(ntScriptLock).where(and(eq(ntScriptLock.lockType,'drug_library'),eq(ntScriptLock.userId,authenticated?.userId||'')))
  }
  }

  if(sid.lockType=='data_key'){
  const data_key_draft = await db.query.dataKeys.findFirst({})
    const pd_data_keys = await db.query.pendingDeletion.findFirst({
      where: (isNotNull(pendingDeletion?.dataKeyId))
    }) 

  if(!data_key_draft && !pd_data_keys){
      await db.delete(ntScriptLock).where(and(eq(ntScriptLock.lockType,'data_key'),eq(ntScriptLock.userId,authenticated?.userId||'')))
  }
  }
}
  
}
}



export async function cleanUpStaleLocks(){
  const lockedScripts = await db.query.ntScriptLock.findMany({
     columns: {
                scriptId: true,
                lockType:true,
                newScriptId:true,
                lockedAt:true
            }
          }
  )
  
  for (const sid of lockedScripts){
    const hasBeenIdle = hasTwoHoursPassed(sid.lockedAt)
    if(hasBeenIdle){
    if(sid.scriptId){
  const script_draft = await db.query.scriptsDrafts.findFirst({
          where: (eq(scriptsDrafts.scriptId,String(sid.scriptId)))
        })
  const screens_draft = await db.query.screensDrafts.findFirst({
          where: (eq(scriptsDrafts.scriptId,String(sid.scriptId)))
        })
   const diagnoses_draft = await db.query.diagnosesDrafts.findFirst({
          where: (eq(scriptsDrafts.scriptId,String(sid.scriptId)))
        })
  if(!script_draft && !screens_draft && !diagnoses_draft){
    await db.delete(ntScriptLock)
    .where(eq(ntScriptLock.scriptId,String(sid.scriptId)))   
  }
 } else if(sid.newScriptId){
const new_script_draft = await db.query.scriptsDrafts.findFirst({
  where: (eq(scriptsDrafts.scriptDraftId,sid.newScriptId))
})
if(!new_script_draft){
   await db.delete(ntScriptLock)
   .where(eq(ntScriptLock.newScriptId,String(sid.scriptId)))
}
} else {
  if(sid.lockType=='drug_library'){
      const drugs_draft = await db.query.drugsLibraryDrafts.findFirst({})
    const pd_drugs = await db.query.pendingDeletion.findFirst({
      where: (isNotNull(pendingDeletion?.drugsLibraryItemId))
    }) 

  if(!drugs_draft && !pd_drugs){
      await db.delete(ntScriptLock).where(and(eq(ntScriptLock.lockType,'drug_library')))
  }
  }

  if(sid.lockType=='data_key'){
  const data_key_draft = await db.query.dataKeys.findFirst({})
    const pd_data_keys = await db.query.pendingDeletion.findFirst({
      where: (isNotNull(pendingDeletion?.dataKeyId))
    }) 

  if(!data_key_draft && !pd_data_keys){
      await db.delete(ntScriptLock).where(and(eq(ntScriptLock.lockType,'data_key')))
  }
  }
}
}
}
}
function hasTwoHoursPassed(timestamp:Date) {
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000; 
  const now = Date.now();           
  return (now - timestamp.getTime()) >= TWO_HOURS_MS;
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
      try {
        const duplicate = await lockExists({script:params.script,lockType:params.lockType})
       const scriptExists = await db.query.scripts.findFirst({
                        where: eq(scripts.scriptId, params.script),});

        if (!duplicate) {
           const authenticated = await getAuthenticatedUser();
           if(!!scriptExists ){
          const q = db.insert(ntScriptLock).values({
            userId: authenticated?.userId!,
            scriptId:params.script||null,
            lockType: params.lockType
          })
          info.query = q.toSQL();
          await q.execute();
        }else{
      const q = db.insert(ntScriptLock).values({
            userId: authenticated?.userId!,
            scriptId:null,
            newScriptId:params.script,
            lockType: params.lockType
          })
          info.query = q.toSQL();
          await q.execute();
        }
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
return response
}

export async function getChangedScripts(){
    const authenticated = await getAuthenticatedUser();
         return await db.query.ntScriptLock.findMany({
              where: and(
                  eq(ntScriptLock.userId, authenticated?.userId || ''),
                  or(
                      isNotNull(ntScriptLock.scriptId),
                      isNotNull(ntScriptLock.newScriptId)
                  )
              ),
          }).then(locks =>
              locks.flatMap(lock => [
                  lock.scriptId,
                  lock.newScriptId
              ]).filter(Boolean) as string[]
          );
  }

  export async function getChangedDrugs(){
    const authenticated = await getAuthenticatedUser();
         return await db.query.ntScriptLock.findMany({
              where: and(
                  eq(ntScriptLock.userId, authenticated?.userId || ''),    
                  eq(ntScriptLock.lockType,'drug_library')        
              ),
          }).then(locks =>
              locks.flatMap(lock => [
                  lock.userId
              ]).filter(Boolean) as string[]
          );
  }


  export async function getChangedDataKeys(){
    const authenticated = await getAuthenticatedUser();
         return await db.query.ntScriptLock.findMany({
              where: and(
                  eq(ntScriptLock.userId, authenticated?.userId || ''),    
                  eq(ntScriptLock.lockType,'data_key')        
              ),
          }).then(locks =>
              locks.flatMap(lock => [
                  lock.userId
              ]).filter(Boolean) as string[]
          );
  }

