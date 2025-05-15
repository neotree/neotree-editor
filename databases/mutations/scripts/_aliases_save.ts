import { _getLeanAliases, _getScreens, _getScript } from "@/databases/queries/scripts";
import { _saveScreens } from "./_screens_save";
import { _saveScripts } from "./_scripts_save";
import { _saveEditorInfo } from "../editor-info";
import { _publishScripts } from "./_scripts_publish";

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

  export async function _updateAliases(){
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
    
            if(aliases.length>0){
                updated= true
           const s = await _getScript({
                scriptId: scriptId,
                returnDraftIfExists: true,
            }) 
            await _saveScreens({data:newScreens,broadcastAction:false})
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
           }      
        }
    }        
        
    })
    if(updated){
        const publishScripts = await _publishScripts()
       if(!publishScripts.errors){
           await _saveEditorInfo({ 
                    increaseVersion: true, 
                    broadcastAction: true, 
                    data: { lastPublishDate: new Date(), },
                });
             }

    }

}catch(e){
 
}
}

  export async function _generateScreenAliases(){
try{
     const leanScripts = await _getLeanAliases();
     let updated= false
   
    leanScripts?.map(async (ls: any) => {
       
        const {scriptId,lastAlias} = ls
        const scriptsIds =Array.of(scriptId)

        const {data,errors} = await _getScreens({scriptsIds})
        if(!errors?.length || errors?.length<=0){

        const {newScreens,last} = assignAliases(data,lastAlias||'')
        console.log("...MILAS",last,lastAlias,"-SID-",scriptId)
        if((last !==lastAlias)){
            const {aliases} = mergeAliases(newScreens)
            console.log("...ELIA",aliases)
            if(aliases.length>0){
                updated= true
           const s = await _getScript({
                scriptId: scriptId,
                returnDraftIfExists: true,
            }) 
            await _saveScreens({data:newScreens,broadcastAction:false})
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
           }      
        }
    }        
        
    })
    
}catch(e){
    console.log("---MAHIIII....",e)
}
}