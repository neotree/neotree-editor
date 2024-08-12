import 'dotenv/config';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { ZodTypeAny } from 'zod';
import { zodToTs, printNode } from 'zod-to-ts'
import fs from 'node:fs';

import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';

const schemas: { [key: string]: ZodTypeAny; } = {
    MailerSettingsItemSelect: createSelectSchema(schema.mailerSettings),
    MailerSettingsItemInsert: createInsertSchema(schema.mailerSettings),
    
    EmailTemplateSelect: createSelectSchema(schema.emailTemplates),
    EmailTemplateInsert: createInsertSchema(schema.emailTemplates),
    
    SysItemSelect: createSelectSchema(schema.sys),
    SysItemInsert: createInsertSchema(schema.sys),
    
    TokenSelect: createSelectSchema(schema.tokens),
    TokenInsert: createInsertSchema(schema.tokens),
    
    UserRoleSelect: createSelectSchema(schema.userRoles),
    UserRoleInsert: createInsertSchema(schema.userRoles),
    
    LanguageSelect: createSelectSchema(schema.languages),
    LanguageInsert: createInsertSchema(schema.languages),
    
    UserSelect: createSelectSchema(schema.users),
    UserInsert: createInsertSchema(schema.users),
    
    AuthClientSelect: createSelectSchema(schema.authClients),
    AuthClientInsert: createInsertSchema(schema.authClients),
    
    ApiKeySelect: createSelectSchema(schema.apiKeys),
    ApiKeyInsert: createInsertSchema(schema.apiKeys),
    
    SiteSelect: createSelectSchema(schema.sites),
    SiteInsert: createInsertSchema(schema.sites),
    
    HospitalSelect: createSelectSchema(schema.hospitals),
    HospitalInsert: createInsertSchema(schema.hospitals),
    
    EditorInfoSelect: createSelectSchema(schema.editorInfo),
    EditorInfoInsert: createInsertSchema(schema.editorInfo),
    
    DeviceSelect: createSelectSchema(schema.devices),
    DeviceInsert: createInsertSchema(schema.devices),
    
    FileSelect: createSelectSchema(schema.files),
    FileInsert: createInsertSchema(schema.files),
    FileChunkSelect: createSelectSchema(schema.filesChunks),
    FileChunkInsert: createInsertSchema(schema.filesChunks),
    
    ConfigKeySelect: createSelectSchema(schema.configKeys),
    ConfigKeyInsert: createInsertSchema(schema.configKeys),
    ConfigKeyDraftSelect: createSelectSchema(schema.configKeysDrafts),
    ConfigKeyDraftInsert: createInsertSchema(schema.configKeysDrafts),
    ConfigKeyHistoryItemSelect: createSelectSchema(schema.configKeysHistory),
    ConfigKeyHistoryItemInsert: createInsertSchema(schema.configKeysHistory),
    
    ScriptSelect: createSelectSchema(schema.scripts),
    ScriptInsert: createInsertSchema(schema.scripts),
    ScriptDraftSelect: createSelectSchema(schema.scriptsDrafts),
    ScriptDraftInsert: createInsertSchema(schema.scriptsDrafts),
    ScriptHistoryItemSelect: createSelectSchema(schema.scriptsHistory),
    ScriptHistoryItemInsert: createInsertSchema(schema.scriptsHistory),
    
    ScreenSelect: createSelectSchema(schema.screens),
    ScreenInsert: createInsertSchema(schema.screens),
    ScreenDraftSelect: createSelectSchema(schema.screensDrafts),
    ScreenDraftInsert: createInsertSchema(schema.screensDrafts),
    ScreenHistoryItemSelect: createSelectSchema(schema.screensHistory),
    ScreenHistoryItemInsert: createInsertSchema(schema.screensHistory),
    
    DiagnosisSelect: createSelectSchema(schema.diagnoses),
    DiagnosisInsert: createInsertSchema(schema.diagnoses),
    DiagnosisDraftSelect: createSelectSchema(schema.diagnosesDrafts),
    DiagnosisDraftInsert: createInsertSchema(schema.diagnosesDrafts),
    DiagnosisHistoryItemSelect: createSelectSchema(schema.diagnosesHistory),
    DiagnosisHistoryItemInsert: createInsertSchema(schema.diagnosesHistory),
    
    PendingDeletionItemSelect: createSelectSchema(schema.pendingDeletion),
    PendingDeletionItemInsert: createInsertSchema(schema.pendingDeletion),
};

main();

async function main() {
    const arr: string[] = [];

    Object.keys(schemas).forEach(identifier => {
        const { node } = zodToTs(schemas[identifier], identifier);
        const nodeString = printNode(node);
        arr.push(`export type ${identifier} = ${nodeString};\n`);
    });

    fs.writeFile('types/db.types.ts', arr.join('\n'), e => {
        if (e) {
            console.log('Failed to write db.types.ts', e.message);
        } else {
            console.log('db.types.ts created successfully!');
        }
    });
}
