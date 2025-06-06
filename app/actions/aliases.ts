import { isAllowed } from "./is-allowed";
import * as queries from "@/databases/queries/aliases";
import * as mutations from "@/databases/mutations/aliases";
import logger from "@/lib/logger";


export const getAllAliases: typeof queries._getAllAliases = async (...args) => {
    try {
        await isAllowed();
        return await queries._getAllAliases(...args);
    } catch (e: any) {
        logger.error('getAllAliases ERROR', e.message);
        return { errors: [e.message], data:[] , };
    }
};

export const getLeanAlias: typeof queries._getLeanAlias = async (...args) => {
    try{
        await isAllowed();
        const alias =  await queries._getLeanAlias(...args)
        if(alias){
          return alias
        }

        return {alias:''};
       
    }catch(e:any){

    }
    
};

export const seedAliases: typeof mutations._seedAliases = async (...args) => {
    try {
        await isAllowed();
        return await mutations._seedAliases(...args);
    } catch (e: any) {
        logger.error('getAliases ERROR', e.message);
    
    }
};
