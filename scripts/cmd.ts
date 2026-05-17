import readline from "node:readline";
import { and, eq, isNull } from "drizzle-orm";

import '@/server/env';
import db from "@/databases/pg/drizzle";
import * as schema from "@/databases/pg/schema";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export function cmdPrompt<T = string>(question: string) {
    return new Promise<T>((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer as T);
        });
    });
}

export async function cmdSitePrompt(opts?: {
    type?: typeof schema.sites.$inferSelect['type'];
}) {
    const sites = await db.query.sites.findMany({
        where: and(
            isNull(schema.sites.deletedAt),
            !opts?.type ? undefined : eq(schema.sites.type, opts.type),
        ),
    });

    let selected = await cmdPrompt(
        'Select country: \n' +
        sites.map((s, i) => `[${i + 1}]: ${s.name}`).join('\n') + '\n> '
    );

    let index = Number(selected);

    if (
        isNaN(index) ||
        !sites[index]
    ) {
        console.error('Invalid selection');
        return await cmdSitePrompt();
    }

    return sites[index];
}
