import '@/server/env';
import * as schema from '@/databases/pg/schema';
import db from "@/databases/pg/drizzle";
import { v4 as uuidV4, } from 'uuid';
import { eq } from 'drizzle-orm';

main();

async function main() {
    try {
        console.log('loading screens...');

        const screens = await db.query.screens.findMany();

        const payload: typeof screens = [];

        screens.filter(s => (s.fields || []).find(f => !f.values && f.items)).forEach(s => {
            const fields = s.fields || [];

            if (fields.filter(f => !f.values && f.items).length) {
                payload.push({
                    ...s,
                    fields: fields.map(f => {
                        if (!f.values && f.items) {
                            const values = f.items.map(item => `${item.value,item.label}`).join('\n');
                            return {
                                ...f,
                                values,
                            };
                        } {
                            return f;
                        }

                        // if (!f.values) return f;

                        // const items: NonNullable<typeof f.items> = [];

                        // const valueOpts = f.valuesOptions || [];

                        // f.values.split('\n').forEach(row => {
                        //     let [value, label] = row.split(',');

                        //     value = `${value || ''}`.trim();
                        //     label = `${label || ''}`.trim();

                        //     const valOpts = valueOpts.find(o => o.key === value);

                        //     items.push({
                        //         itemId: uuidV4(),
                        //         value,
                        //         label,
                        //         label2: valOpts?.optionLabel,
                        //         exclusive: false,
                        //         enterValueManually: !!valOpts,
                        //     });
                        // });

                        // return {
                        //     ...f,
                        //     items,
                        // };
                    }),
                });
            }
        });

        for (const s of payload) {
            console.log('updating screen: ' + s.title + ' ...');
            await db
                .update(schema.screens)
                .set(s)
                .where(eq(schema.screens.screenId, s.screenId));
        }
    } catch(e: any) {
        console.error(e);
    } finally {
        process.exit(1);
    }
}
