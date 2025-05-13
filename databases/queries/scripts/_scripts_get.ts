import { and, eq, inArray, isNotNull, isNull, notInArray, or, sql } from "drizzle-orm";
import * as uuid from "uuid";

import db from "@/databases/pg/drizzle";
import { scripts, scriptsDrafts, pendingDeletion, hospitals } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { ScriptField, Preferences, PrintSection,ScreenReviewField,Alias} from "@/types";
import { _getScreens } from "./_screens_get";
import { _publishScripts, _saveScreens, _saveScripts } from "@/databases/mutations/scripts";
import { _saveEditorInfo } from "@/databases/mutations/editor-info";


export type GetScriptsParams = {
    scriptsIds?: string[];
    hospitalIds?: string[];
    returnDraftsIfExist?: boolean;
    withDeleted?: boolean;
};

export type ScriptType = typeof scripts.$inferSelect & {
    isDraft: boolean;
    isDeleted: boolean;
    nuidSearchFields: ScriptField[];
    reviewConfigurations: ScreenReviewField[];
    aliases: Alias[];
    lastAlias:string;
    preferences: Preferences;
    printSections: PrintSection[];
    hospitalName: string;
};

export type GetScriptsResults = {
    data: ScriptType[];
    errors?: string[];
};
export type AliaseType = {
    key: string
    value: string
}

export async function _getLeanAliases():Promise<any> {
   const allScripts = await db.select({
               scriptId:scripts.scriptId,
               lastAlias: scripts.lastAlias,
             })
            .from(scripts)
            .where(
            isNull(scripts.deletedAt))
 return allScripts;
}

export async function _getAliases():Promise<any> {
    const allScripts = await db.select({
                scriptId:scripts.scriptId,
                aliases: scripts.aliases,
                oldScriptId: scripts.oldScriptId                
              })
             .from(scripts)
             .where(
             isNull(scripts.deletedAt))
  return allScripts;
 }
 

export async function _getAllAliases(sid: string): Promise<any> {
    const allScripts = await db.select({
      scriptId: scripts.scriptId,
      lastAlias: scripts.lastAlias,
      aliases: scripts.aliases
    })
    .from(scripts)
    .where(and(
      eq(scripts.scriptId, sid),
      isNull(scripts.deletedAt)
    ));
  
    return allScripts.length > 0 ? allScripts[0] : null;
  }

export async function _getScripts(
    params?: GetScriptsParams
): Promise<GetScriptsResults> {
    // UPDATE ALIASES
   try{
     
     const leanScripts = await _getLeanAliases();
   
    let updated= false

    leanScripts?.filter((l:any)=>!l.lastAlias || l.lastAlias==='').map(async (ls:any)=>{
       
        const {scriptId,lastAlias} = ls
        const scriptsIds =Array.of(scriptId)

        const {data,errors} = await _getScreens({scriptsIds})
        if(!errors?.length || errors?.length<=0){

        const {newScreens,last} = assignAliases(data,lastAlias||'')
        if((last !==lastAlias)){
            const {aliases} = mergeAliases(newScreens)
            // UPDATE SCRIPT WITH NEW CHANGES
            // SHOW ALIAS ON EDITOR
            if(aliases.length>0){
           const s = await _getScript({
                scriptId: scriptId,
                returnDraftIfExists: true,
            }) 
            await _saveScreens({data:newScreens,broadcastAction:false,syncSilently:true})
            await _saveScripts({
                data: [{
                    ...s,
                    scriptId,
                  aliases,
                  lastAlias:last,
                }, 
            ],
            broadcastAction:false,
            syncSilently:true
            });  
            updated=true 
           }
        
           }
        }      
        
    })
 
    if(updated){
        const publishScripts = await _publishScripts()
       if(!publishScripts.errors){
           await _saveEditorInfo({ 
                    increaseVersion: true, 
                    broadcastAction: false, 
                    syncSilently:true,
                    data: { lastPublishDate: new Date(), },
                });
             }

    }
    }catch(e:any){

    }

    try {
       
        let { 
            scriptsIds = [], 
            hospitalIds = [],
            returnDraftsIfExist, 
        } = { ...params };

        const oldScriptsIds = scriptsIds.filter(s => !uuid.validate(s));
        scriptsIds = scriptsIds.filter(s => uuid.validate(s));

        const oldHospitalIds = hospitalIds.filter(s => !uuid.validate(s));
        hospitalIds = hospitalIds.filter(s => uuid.validate(s));

        if (oldScriptsIds.length) {
            const res = await db.query.scripts.findMany({
                where: inArray(scripts.oldScriptId, oldScriptsIds),
                columns: { scriptId: true, oldScriptId: true, },
            });
            oldScriptsIds.forEach(oldScriptId => {
                const s = res.filter(s => s.oldScriptId === oldScriptId)[0];
                scriptsIds.push(s?.scriptId || uuid.v4());
            });
        }

        if (oldHospitalIds.length) {
            const res = await db.query.hospitals.findMany({
                where: inArray(hospitals.oldHospitalId, oldHospitalIds),
                columns: { hospitalId: true, oldHospitalId: true, },
            });
            oldHospitalIds.forEach(oldHospitalId => {
                const s = res.filter(s => s.oldHospitalId === oldHospitalId)[0];
                hospitalIds.push(s?.hospitalId || uuid.v4());
            });
        }
        
        // unpublished scripts conditions
        const draftsRes = !returnDraftsIfExist ? [] : await db
            .select({
                scriptDraft: scriptsDrafts,
                hospitalName: hospitals.name,
            })
            .from(scriptsDrafts)
            .leftJoin(hospitals, eq(hospitals.hospitalId, scriptsDrafts.hospitalId))
            .where(and(
                !scriptsIds?.length ? undefined : inArray(scriptsDrafts.scriptDraftId, scriptsIds),
                !hospitalIds.length ? undefined : inArray(scriptsDrafts.hospitalId, hospitalIds),
            ));

        const drafts = draftsRes
            .map(s => ({ ...s.scriptDraft, hospitalName: s.hospitalName, }));

        // published scripts conditions
        const publishedRes = await db
            .select({
                script: scripts,
                pendingDeletion: pendingDeletion,
                hospitalName: hospitals.name,
            })
            .from(scripts)
            .leftJoin(pendingDeletion, eq(pendingDeletion.scriptId, scripts.scriptId))
            .leftJoin(scriptsDrafts, eq(scriptsDrafts.scriptId, scripts.scriptId))
            .leftJoin(hospitals, and(
                eq(hospitals.hospitalId, scripts.hospitalId),
                isNull(hospitals.deletedAt)
            ))
            .where(and(
                isNull(scripts.deletedAt),
                isNull(pendingDeletion),
                !returnDraftsIfExist ? undefined : isNull(scriptsDrafts.scriptId),
                !scriptsIds.length ? undefined : inArray(scripts.scriptId, scriptsIds),
                !hospitalIds.length ? undefined : inArray(scripts.hospitalId, hospitalIds),
            ));

        const published = publishedRes.map(s => ({
            ...s.script,
            hospitalName: s.hospitalName,
        }));

        const inPendingDeletion = !published.length ? [] : await db.query.pendingDeletion.findMany({
            where: inArray(pendingDeletion.scriptId, published.map(s => s.scriptId)),
            columns: { scriptId: true, },
        });

        const responseData = [
            ...published.map(s => ({
                ...s,
                isDraft: false,
                isDeleted: false,
            } as GetScriptsResults['data'][0])),

            ...drafts.map((s => ({
                ...s.data,
                hospitalName: s.hospitalName,
                isDraft: true,
                isDeleted: false,
            } as GetScriptsResults['data'][0])))
        ]
            .sort((a, b) => a.position - b.position)
            .filter(s => !inPendingDeletion.map(s => s.scriptId).includes(s.scriptId))
            .map(s => ({
                ...s,
                hospitalId: s.hospitalName ? s.hospitalId : null,
            }));
        
        return  { 
            data: responseData,
        };
    } catch(e: any) {
        logger.error('_getScripts ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}


export type GetScriptResults = {
    data?: null | ScriptType;
    errors?: string[];
};

export type GetAliasResults = {
    data?: null | Alias[];
    lastAlias?: string;
    errors?: string[];
};

export async function _getScript(
    params: {
        scriptId: string,
        returnDraftIfExists?: boolean;
    },
): Promise<GetScriptResults> {
    const { scriptId, returnDraftIfExists, } = { ...params };

    try {
        if (!scriptId) throw new Error('Missing scriptId');

        const whereScriptId = uuid.validate(scriptId) ? eq(scripts.scriptId, scriptId) : undefined;
        const whereOldScriptId = !uuid.validate(scriptId) ? eq(scripts.oldScriptId, scriptId) : undefined;
        const whereScriptDraftId = !whereScriptId ? undefined : eq(scriptsDrafts.scriptDraftId, scriptId);

        let draft = (returnDraftIfExists && whereScriptDraftId) ? await db.query.scriptsDrafts.findFirst({
            where: whereScriptDraftId,
        }) : undefined;

        let responseData = !draft ? null : {
            ...draft.data,
            isDraft: false,
            isDeleted: false,
        } as GetScriptResults['data'];

        if (responseData) return { data: responseData, };

        const publishedRes = await db
            .select({
                script: scripts,
                pendingDeletion,
                draft: scriptsDrafts,
                hospitalName: hospitals.name,
            })
            .from(scripts)
            .leftJoin(hospitals, and(
                eq(hospitals.hospitalId, scripts.hospitalId),
                isNull(hospitals.deletedAt)
            ))
            .leftJoin(pendingDeletion, eq(pendingDeletion.scriptId, scripts.scriptId))
            .leftJoin(scriptsDrafts, eq(scripts.scriptId, scriptsDrafts.scriptDraftId))
            .where(and(
                isNull(scripts.deletedAt),
                isNull(pendingDeletion),
                or(whereScriptId, whereOldScriptId),
            ));

        const published = !publishedRes[0] ? null : {
            ...publishedRes[0].script,
            draft: publishedRes[0].draft || undefined,
            hospitalName: publishedRes[0].hospitalName || '',
        };

        draft = returnDraftIfExists ? published?.draft : undefined;

        const data = (draft?.data || published) as GetScriptResults['data'];

        responseData = !data ? null : {
            ...data,
            isDraft: false,
            isDeleted: false,
            hospitalId: data.hospitalName ? data.hospitalId : null,
        };

        if (!responseData) return { data: null, };

        return  { 
            data: responseData, 
        };
    } catch(e: any) {
        logger.error('_getScript ERROR', e.message);
        return { errors: [e.message], };
    }
} 

export function assignAliases(
    screens: any[],
    lastAlias: string | null
  ): { newScreens: any[]; last: string } {
    let currentAlias = lastAlias;

    const updatedScreens = screens.map(screen => {
        if (excludedScreenType(screen.type)) {
            return screen;
          }
          else{
      if (screen.type === "form" && Array.isArray(screen.fields)) {
        const updatedFields = screen.fields.map((field: any) => {
          if (
            Array.isArray(field.prePopulate) &&
            field.prePopulate.length > 0 &&
            !field.alias
          ) {
            currentAlias = getNextAlias(currentAlias);
            return { ...field, alias: currentAlias };
          }
          return field;
        });
        return { ...screen, fields: updatedFields };
      } else if (
        Array.isArray(screen.prePopulate) &&
        screen.prePopulate.length > 0 &&
        !screen.alias
      ) {
        currentAlias = getNextAlias(currentAlias);
        return { ...screen, alias: currentAlias };
      }
  
      return screen;
    }
    });
  
    return { newScreens:updatedScreens, last: currentAlias! };
  }

  function excludedScreenType(type: string){
    const excluded = ['management'
        , 'mwi_edliz_summary_table'
        , 'progress'
        , 'zw_edliz_summary_table'
        , 'diagnosis'
        , 'drugs',
        'fluids',
        'feeds',
    ];
    return excluded.includes(type)

  }
  export function assignAliasOnScreen(
    screen: any,
    lastAlias: string | null
  ): { newScreen: any; last: string } {
    let currentAlias = lastAlias;
 
    if (excludedScreenType(screen.type)) {
        return {newScreen:screen,last:currentAlias!};
      }else{

    if (screen.type === "form" && Array.isArray(screen.fields)) {
      const updatedFields = screen.fields.map((field: any) => {
        if (
          Array.isArray(field.prePopulate) &&
          field.prePopulate.length > 0 &&
          !field.alias
        ) {
          currentAlias = getNextAlias(currentAlias);
          return { ...field, alias: currentAlias };
        }
        return field;
      });
      return { newScreen: { ...screen, fields: updatedFields }, last: currentAlias! };
    } else if (
      Array.isArray(screen.prePopulate) &&
      screen.prePopulate.length > 0 &&
      !screen.alias
    ) {
      currentAlias = getNextAlias(currentAlias);
      return { newScreen: { ...screen, alias: currentAlias }, last: currentAlias! };
    }
    }
  
    return { newScreen: screen, last: currentAlias! };
  }
  
   

  export function mergeAliases(
    screens: any[],
  ): { aliases: { key: string; value: string }[] } {

    const aliases: { key: string; value: string }[] = [];
  
    screens.map(screen => {
  
      // Collect aliases
      if (screen.type === 'form' && Array.isArray(screen.fields)) {
          screen.fields.forEach((field: any) => {
          if (field.alias && field.key) {
            aliases.push({ key: field.key, value: field.alias });
          }
        });
      } else if (screen.alias && screen.key) {
        aliases.push({ key: screen.key, value: screen.alias });
      }
  
    });
  
    return {aliases };
  }

  export function mergeAliasesSingleScreen(
    screen: any,
    oldAliases: { key: string; value: string }[]
  ): { aliases: { key: string; value: string }[] } {
    const aliases = [...oldAliases];
  
    function upsertAlias(key: string, value: string) {
      const existing = aliases.find(a => a.key === key);
      if (existing) {
        if (existing.value !== value) {
          existing.value = value; // update value
        }
        // else skip since alias is same
      } else {
        aliases.push({ key, value }); // add new alias
      }
    }
    if (excludedScreenType(screen.type)){
        return {aliases}
    }
  
    if (screen.type === 'form' && Array.isArray(screen.fields)) {
      screen.fields.forEach((field: any) => {
        if (field.alias && field.key) {
          upsertAlias(field.key, field.alias);
        }
      });
    } else if (screen.alias && screen.key) {
      upsertAlias(screen.key, screen.alias);
    }
  
    return { aliases };
  }
  

 export function getNextAlias(prev: string | null): string {
    if (!prev || prev==='') return 'A';
  
    const match = prev.match(/^([A-Z]+)(\d*)$/);
    if (!match) throw new Error('Invalid alias format');
  
    const [_, letters, numStr] = match;
    const num = numStr ? parseInt(numStr, 10) : 0;
  
    // Convert letters to a number (base 26)
    const toNumber = (s: string) => {
      return s.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 65), 0);
    };
  
    // Convert a number to base 26 letters
    const toLetters = (n: number): string => {
      let str = '';
      do {
        str = String.fromCharCode((n % 26) + 65) + str;
        n = Math.floor(n / 26) - 1;
      } while (n >= 0);
      return str;
    };
  
    let nextLettersNum = toNumber(letters) + 1;
    let nextLetters = toLetters(nextLettersNum);
  
    // Wrap from Z to A1, Z1 to A2, etc.
    if (nextLetters.length > letters.length) {
      nextLetters = 'A';
      return nextLetters + (num + 1);
    }
  
    return nextLetters + (numStr || '');
  }

  