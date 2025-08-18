import { _getLeanScriptIds, _getScreens, _getScript,_getOldScript} from "@/databases/queries/scripts";
import { _saveScreens } from "../scripts/_screens_save";
import { _saveScripts } from "../scripts/_scripts_save";
import { _saveEditorInfo } from "../editor-info";
import { _publishScripts } from "../scripts/_scripts_publish";
import db from '@/databases/pg/drizzle';
import { desc, eq, and, Query } from 'drizzle-orm';
import { ntScriptLock } from "@/databases/pg/schema";
import logger from '@/lib/logger';

import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";

export type SaveLockResponse = {
  success: boolean;
  errors?: string[];
  info?: { query?: Query; };
};



export async function lockExists(opts:{
  script: string,
}){
   const authenticated = await getAuthenticatedUser();
   if(authenticated){
  const duplicate = await db.query.ntScriptLock.findFirst({
          where: (and(eq(ntScriptLock.scriptId, opts.script),
           eq(ntScriptLock.userId, authenticated.userId)
          ))
        })
return !!duplicate
   }else{
    return false
   }

}

async function getExistingLock(opts:{
  user: string
}){
  const lock = await db.query.ntScriptLock.findFirst({
          where: ((eq(ntScriptLock.userId, opts.user)
          ))
        })
return lock
}


export async function _createNewLock(
params: {
  script:string,
  user:string
}) {
  const response: SaveLockResponse = { success: false, };
  const errors = [];
  const info: SaveLockResponse['info'] = {};
  try {
  
      try {
        const duplicate = await lockExists({script:params.script})
        if (!duplicate) {

          const q = db.insert(ntScriptLock).values({
            userId: params.user,
            scriptId:params.script,
            status:'opened'

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



