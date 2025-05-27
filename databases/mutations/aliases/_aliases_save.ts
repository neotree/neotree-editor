import { _getLeanScriptIds, _getScreens, _getScript } from "@/databases/queries/scripts";
import { _saveScreens } from "../scripts/_screens_save";
import { _saveScripts } from "../scripts/_scripts_save";
import { _saveEditorInfo } from "../editor-info";
import { _publishScripts } from "../scripts/_scripts_publish";
import db from '@/databases/pg/drizzle';
import { desc, eq, and, Query } from 'drizzle-orm';
import { aliases } from "@/databases/pg/schema";
import logger from '@/lib/logger';


export type SaveAliasesResponse = {
  success: boolean;
  errors?: string[];
  info?: { query?: Query; };
};



function getNextAlias(prev: string | null): string {
  if (!prev || prev === '') return 'A';

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

function excludedScreenType(type: string) {
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
async function assignAliases(
  scriptId: string,
  screens: any[],
  lastAlias: string | null
): Promise<any[]> {
  let updated: any[] = [];
  let currentAlias = lastAlias;

  for (const screen of screens) {
    if (excludedScreenType(screen.type)) {
      continue;
    }

    if (screen.type === "form" && Array.isArray(screen.fields)) {
      for (const field of screen.fields) {
        if (
          Array.isArray(field.prePopulate) &&
          field.prePopulate.length > 0 &&
          !(await aliasExists({ name: field.key, script: scriptId }))
        ) {
          currentAlias = getNextAlias(currentAlias);
          if (currentAlias) {
            updated.push({
              name: field.key,
              alias: currentAlias,
              script: scriptId,
            });
          }
        }
      }
    } else if (
      Array.isArray(screen.prePopulate) &&
      screen.prePopulate.length > 0 &&
      !(await aliasExists({ name: screen.key, script: scriptId }))
    ) {
      currentAlias = getNextAlias(currentAlias);
      if (currentAlias) {
        updated.push({
          name: screen.key,
          alias: currentAlias,
          script: scriptId,
        });
      }
    }
  }

  return updated;
}


async function aliasExists(opts:{
  script: string,
  name: string
}){
  const duplicate = await db.query.aliases.findFirst({
          where: (and(eq(aliases.script, opts.script),
            eq(aliases.name, opts.name)
          ))
        })
return !!duplicate
}
async function aliasSeeded(){
  const exists = await db.query.aliases.findFirst()

return !!exists
}

export async function _saveAliases(
alls: any[]) {
  const response: SaveAliasesResponse = { success: false, };
  const errors = [];
  const info: SaveAliasesResponse['info'] = {};
  try {
    logger.log("#########LOGGER",alls.length.toString())
    for (const al of alls) {
      try {
        const duplicate = await db.query.aliases.findFirst({
          where: (and(eq(aliases.script, al.script),
            eq(aliases.name, al.name)
          )),
          orderBy: desc(aliases.createdAt)
        })
        if (!duplicate) {

          const q = db.insert(aliases).values({
            alias: al.alias,
            name: al.name,
            script: al.script,

          })
          info.query = q.toSQL();
          await q.execute();
        }
      } catch (ex: any) {
         logger.error(ex.message)
        errors.push(ex.message);
      }

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
async function _getLastAlias(
  script: string
) {
  try{
  const lastAlias = !script ? '' : await db.query.aliases.findFirst({
    where: eq(aliases.script, script),
    orderBy: desc(aliases.createdAt)
  })

  return lastAlias?lastAlias.alias:''
}catch(e:any){
}
}



export async function _seedAliases() {
  try {
    const leanScripts = await _getLeanScriptIds();
    const alreadySeeded = await aliasSeeded()
    if(!alreadySeeded){
     await _generateScreenAliases(leanScripts)
    }

  } catch (e:any) {
  }
}

export async function _generateScreenAliases(scriptsIds: string[]) {
  try {
    for (const scriptId of scriptsIds) {
      
      if (scriptId) {
        const lastAlias = await _getLastAlias(scriptId);
        const sids = [scriptId];
        const { data, errors } = await _getScreens({ scriptsIds: sids });

        if (!errors || errors.length === 0) {
          const aliases = await assignAliases(scriptId, data, lastAlias || '');

          if (aliases && aliases.length > 0) {
            await _saveAliases(aliases);
          }
        }
      }
    }
  } catch (e) {
    logger.error("Error in _generateScreenAliases:", e);
  }
}
