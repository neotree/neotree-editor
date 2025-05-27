
import db from "@/databases/pg/drizzle";
import { aliases } from "@/databases/pg/schema";
import { eq, and } from 'drizzle-orm';


export type GetAliasesResults = {
    data: {
        uuid: typeof aliases.$inferSelect['uuid'];
        name: typeof aliases.$inferSelect['name'];
        script: typeof aliases.$inferSelect['script'];
        alias: typeof aliases.$inferSelect['alias'];
    }[];
    errors?: string[];
};

export async function _getAllAliases(): Promise<GetAliasesResults> {
    try {
       
        const data = await db.query.aliases.findMany();
             return  { data };
    } catch(e: any) {  
        return { data: [], errors: [e.message], };
    }
}


export async function _getLeanAlias(opts:{
  script: string,
  name: string
}){
  try{

  const alias = await db.query.aliases.findFirst({
          where: (and(eq(aliases.script, opts.script),
            eq(aliases.name, opts.name)
          ))
        })
        return alias?alias.alias:''
      }catch(ex:any){   
      }
        

}

