import { desc, sql } from "drizzle-orm";
import Link from "next/link";
import { ChevronDownIcon, ExternalLinkIcon } from "lucide-react";

import db from "@/databases/pg/drizzle";
import { screensHistory } from "@/databases/pg/schema";
import { ScriptField } from "@/types";
import { _getScreens, _getScripts } from "@/databases/queries/scripts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "./card";

export default async function Changes() {
    const history = await db.query.screensHistory.findMany({
        where: sql`${screensHistory.changes}::text like '%fields%' and ${screensHistory.createdAt} >= '2026-09-01'::date`,
        orderBy: desc(screensHistory.createdAt),
    });

    const screens = !history.length ? { data: [], } : await _getScreens({ screensIds: history.map(s => s.screenId, )});
    const scripts = !history.length ? { data: [], } : await _getScripts({ scriptsIds: history.map(s => s.scriptId, )});

    const data = scripts.data.map(script => {
        return {
            ...script,
            screens: screens.data.filter(s => s.scriptId === script.scriptId).map(s => {
                const fields = s.fields.filter(f => (f.type === 'dropdown') || (f.type === 'multi_select'));
                return {
                    ...s,
                    hide: !fields.length,
                    history: history.filter(h => h.screenId === s.screenId)
                        .map(item => {
                            const changes = item.changes as any;

                            let allOldFields: ScriptField[] = changes.oldValues.find((c: any) => c.fields)?.fields || [];
                            let allNewFields: ScriptField[] = changes.newValues.find((c: any) => c.fields)?.fields || [];

                            const oldFields = allOldFields.filter((f, i) => {
                                const oldItems = (f.items || []).map(item => item.keyId);
                                const newItems = (allNewFields[i]?.items || []).map(item => item.keyId);
                                return JSON.stringify(oldItems) !== JSON.stringify(newItems);
                            });

                            const newFields = allNewFields.filter((f, i) => {
                                const newItems = (f.items || []).map(item => item.keyId);
                                const oldItems = (allOldFields[i]?.items || []).map(item => item.keyId);
                                return JSON.stringify(oldItems) !== JSON.stringify(newItems);
                            });

                            return { oldFields, newFields, };
                        }).filter(h => h.oldFields.length | h.newFields.length),
                };
            }).filter(s => !s.hide),
        };
    }).filter(s => s.screens.length);

    return (
        <>
            <div className="font-bold text-xl mx-4">{data.length} scripts</div>

            {data.map(script => {
                return (
                    <Card key={script.scriptId}>
                        <Collapsible>
                            <CollapsibleTrigger>
                                <div className="font-bold m-4 flex items-center gap-x-2">
                                    {script.title} - {script.screens.length} screen(s)
                                    <ChevronDownIcon className="size-4" />
                                </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                {script.screens.map(s => {
                                    const fields = s.fields.filter(f => (f.type === 'dropdown') || (f.type === 'multi_select'));
                                    const screenLink = `/script/${s.scriptId}/screen/${s.screenId}`;

                                    return (
                                        <div key={s.screenId}>
                                            <div className="px-4">
                                                <div className="flex gap-x-4 items-center">
                                                    <Link 
                                                        className="flex gap-x-2 items-center text-primary"
                                                        target="_blank" 
                                                        href={screenLink}
                                                    >
                                                        {s.title} <ExternalLinkIcon className="size-4" />
                                                    </Link>
                                                </div>

                                                <div className="mx-4">
                                                    {fields.map(f => {
                                                        return (
                                                            <div key={f.fieldId}>
                                                                <Link 
                                                                    className="flex gap-x-2 items-center text-blue-400"
                                                                    target="_blank" 
                                                                    href={`${screenLink}?field=${f.fieldId}`}
                                                                >
                                                                    {s.label} ({f.key}) <ExternalLinkIcon className="size-4" />
                                                                </Link>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <br />
                                        </div>
                                    );
                                })}
                            </CollapsibleContent>
                        </Collapsible>

                        <hr />
                    </Card>
                );
            })}
        </>
    );
}
