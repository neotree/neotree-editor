import { relations, sql } from "drizzle-orm";
import { 
    boolean,
    customType,
    doublePrecision,
    index,
    integer, 
    jsonb, 
    pgEnum,
    pgTable, 
    serial, 
    text, 
    timestamp, 
    uuid,
} from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

import { ScriptField } from "@/types";
import { defaultPreferences } from "@/constants";

export const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
    dataType() {
        return "bytea";
    },
});

// MAILER SETTINGS ENUM
export const mailerServiceEnum = pgEnum('mailer_service', ['gmail', 'smtp']);

// ROLES
export const roleNameEnum = pgEnum('role_name', ['user', 'admin', 'super_user']);

// SITES
export const siteTypeEnum = pgEnum('site_type', ['nodeapi', 'webeditor']);
export const siteEnvEnum = pgEnum('site_env', ['production', 'stage', 'development', 'demo']);

// SCRIPT TYPES ENUM
export const scriptTypeEnum = pgEnum('script_type', ['admission', 'discharge', 'neolab','drecord']);

// SCREEN TYPES ENUM
export const screenTypeEnum = pgEnum('screen_type', [
    'diagnosis',
    'checklist',
    'form',
    'management',
    'multi_select',
    'single_select',
    'progress',
    'timer',
    'yesno',
    'drugs',
    'fluids',
    'feeds',
    'zw_edliz_summary_table',
    'mwi_edliz_summary_table',
    'edliz_summary_table',
    'dynamic_form'
]);

// DRUG TYPE ENUM
export const drugTypeEnum = pgEnum('drug_type', ['drug', 'fluid', 'feed']);

// MAILER SETTINGS
export const mailerSettings = pgTable('nt_mailer_settings', {
    id: serial('id').primaryKey(),
    settingId: uuid('setting_id').notNull().unique().defaultRandom(),
    name: text('name').notNull().unique(),
    service: mailerServiceEnum('service').notNull(),
    authUsername: text('auth_username').notNull(),
    authPassword: text('auth_password').notNull(),
    authType: text('auth_type'),
    authMethod: text('auth_method'),
    host: text('host').notNull().default(''),
    port: integer('port'),
    encryption: text('encryption').notNull().default(''),
    fromAddress: text('from_address').notNull().default(''),
    fromName: text('from_name').notNull().default(''),
    isActive: boolean('is_active').default(false).notNull(),
    secure: boolean('secure').default(false).notNull(),
});

// EMAIL TEMPLATES
export const emailTemplates = pgTable('nt_email_templates', {
    id: serial('id').primaryKey(),
    templateId: uuid('template_id').notNull().unique().defaultRandom(),
    name: text('name').notNull().unique(),
    data: jsonb('data').notNull(),
});

// SYS
export const sys = pgTable('nt_sys', {
    _id: serial('_id').primaryKey(),
    id: uuid('id').notNull().unique().defaultRandom(),
    key: text('key').notNull().unique(),
    value: text('value').notNull(),
});

// TOKENS
export const tokens = pgTable('nt_tokens', {
    id: serial('id').primaryKey(),
    token: integer('token').notNull().unique(),
    userId: uuid('user_id').references(() => users.userId, { onDelete: 'cascade', }),
    validUntil: timestamp('valid_until').notNull(),
});

export const tokensRelations = relations(tokens, ({ one }) => ({
    user: one(users, {
        fields: [tokens.userId],
        references: [users.userId],
    }),
}));

export const userRoles = pgTable('nt_user_roles', {
    id: serial('id').primaryKey(),
    name: roleNameEnum('name').notNull().unique(),
    description: text('description'),
});

export const rolesRelations = relations(userRoles, ({ many }) => ({
    users: many(users),
}));

// LANGUAGES
export const languages = pgTable('nt_languages', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    iso: text('iso').notNull().unique(),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
});

// USERS
export const users = pgTable(
    'nt_users', 
    {
        id: serial('id').primaryKey(),
        userId: uuid('user_id').notNull().unique().defaultRandom(),
        role: roleNameEnum('role').references(() => userRoles.name, { onDelete: 'cascade', }).default('user').notNull(),
        email: text('email').notNull().unique(),
        password: text('password').notNull(),
        displayName: text('display_name').notNull(),
        firstName: text('first_name'),
        lastName: text('last_name'),     

        avatar: text('avatar'),
        avatar_sm: text('avatar_sm'),
        avatar_md: text('avatar_md'),

        activationDate: timestamp('activation_date'),
        lastLoginDate: timestamp('last_login_date'),
        
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
        deletedAt: timestamp('deleted_at'),
    },
    table => ({
        searchIndex: index('users_search_index')
            .using(
                'gin', 
                sql`(
                    to_tsvector('english', ${table.email}) ||
                    to_tsvector('english', ${table.displayName}) ||
                    to_tsvector('english', ${table.firstName}) ||
                    to_tsvector('english', ${table.lastName})
                )`
            ),
    }),
);

export const usersRelations = relations(users, ({ many, one }) => ({
    authTokens: many(authClients),
    tokens: many(tokens),
    files: many(files),
    role: one(userRoles, {
        fields: [users.role],
        references: [userRoles.name],
    }),
}));

// AUTH CLIENTS
export const authClients = pgTable('nt_auth_clients', {
    id: serial('id').primaryKey(),
    clientId: uuid('client_id').notNull().unique().defaultRandom(),
    clientToken: text('client_token').notNull().unique(),
    userId: uuid('user_id').references(() => users.userId, { onDelete: 'cascade', }),
    validUntil: timestamp('valid_until'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const authClientsRelations = relations(authClients, ({ one }) => ({
    user: one(users, {
        fields: [authClients.userId],
        references: [users.userId],
    }),
}));

// API KEYS
export const apiKeys = pgTable('nt_api_keys', {
    id: serial('id').primaryKey(),
    apiKeyId: uuid('api_key_id').notNull().unique().defaultRandom(),
    apiKey: text('api_key').notNull().unique().$defaultFn(() => uuidv4()),
    validUntil: timestamp('valid_until'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sites = pgTable('nt_sites', {
    id: serial('id').primaryKey(),
    siteId: uuid('site_id').notNull().unique().defaultRandom(),
    name: text('name').notNull().unique(),
    link: text('link').notNull().unique(),
    apiKey: text('api_key').notNull(),
    type: siteTypeEnum('type').notNull(),
    env: siteEnvEnum('env').notNull().default('production'),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
});

// HOSPITALS
export const hospitals = pgTable(
    'nt_hospitals', 
    {
        id: serial('id').primaryKey(),
        hospitalId: uuid('hospital_id').notNull().unique().defaultRandom(),
        oldHospitalId: text('old_hospital_id').unique(),
        name: text('name').notNull().unique(),
        country: text('country').default(''),
        
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
        deletedAt: timestamp('deleted_at'),
    },
    table => ({
        searchIndex: index('hospitals_search_index')
            .using(
                'gin', 
                sql`(
                    to_tsvector('english', ${table.name})
                )`
            ),
    }),
);

// DEVICES
export const editorInfo = pgTable(
    'nt_editor_info', 
    {
        id: serial('id').primaryKey(),
        dataVersion: integer('data_version').notNull().default(1),
        lastPublishDate: timestamp('last_publish_date'),
    },
);

// DEVICES
export const devices = pgTable(
    'nt_devices', 
    {
        id: serial('id').primaryKey(),
        deviceId: text('device_id').notNull().unique(),
        deviceHash: text('device_hash').notNull().unique(),
        details: jsonb('details').default({}),
        
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
        deletedAt: timestamp('deleted_at'),
    },
);

// FILES
export const files = pgTable(
    'nt_files', 
    {
        id: serial('id').primaryKey(),
        fileId: uuid('file_id').notNull().unique().defaultRandom(),
        ownerId: uuid('owner_id').references(() => users.userId, { onDelete: 'cascade', }),
        filename: text('filename').notNull(),
        contentType: text('content_type').notNull(),
        size: integer('size').notNull(),
        metadata: jsonb('metadata').default('{}').notNull(),
        data: bytea('data').notNull(),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
        deletedAt: timestamp('deleted_at'),
    },
);

export const filesRelations = relations(files, ({ many, one }) => ({
    owner: one(users, {
        fields: [files.ownerId],
        references: [users.userId],
    }),
}));

export const filesChunks = pgTable(
    'nt_files_chunks', 
    {
        id: serial('id').primaryKey(),
        chunkId: uuid('chunk_id').notNull().unique().defaultRandom(),
        fileId: uuid('file_id').references(() => files.fileId, { onDelete: 'cascade', }).notNull(),
        data: bytea('data').notNull(),
    },
);

// CONFIG KEYS
export const configKeys = pgTable(
    'nt_config_keys', 
    {
        id: serial('id').primaryKey(),
        configKeyId: uuid('config_key_id').notNull().unique().defaultRandom(),
        oldConfigKeyId: text('old_config_key_id').unique(),
        position: integer('position').notNull(),
        version: integer('version').notNull(),

        key: text('key').notNull().unique(),
        label: text('label').notNull().unique(),
        summary: text('summary').notNull(),
        source: text('source').default('editor'),
        preferences: jsonb('preferences').default(JSON.stringify(defaultPreferences)).notNull(),
        
        publishDate: timestamp('publish_date').defaultNow().notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
        deletedAt: timestamp('deleted_at'),
    },
    table => ({
        searchIndex: index('config_keys_search_index')
            .using(
                'gin', 
                sql`(
                    to_tsvector('english', ${table.key}) ||
                    to_tsvector('english', ${table.label}) ||
                    to_tsvector('english', ${table.summary})
                )`
            ),
    }),
);

export const configKeysRelations = relations(configKeys, ({ many, one }) => ({
    history: many(configKeysHistory),
    draft: one(configKeysDrafts, {
        fields: [configKeys.configKeyId],
        references: [configKeysDrafts.configKeyId],
    }),
}));

// CONFIG KEYS DRAFTS
export const configKeysDrafts = pgTable(
    'nt_config_keys_drafts', 
    {
        id: serial('id').primaryKey(),
        configKeyDraftId: uuid('config_key_draft_id').notNull().unique().defaultRandom(),
        configKeyId: uuid('config_key_id').references(() => configKeys.configKeyId, { onDelete: 'cascade', }),
        position: integer('position').notNull(),
        data: jsonb('data').$type<typeof configKeys.$inferInsert>().notNull(),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    },
);

export const configKeysDraftsRelations = relations(configKeysDrafts, ({ one }) => ({
    configKey: one(configKeys, {
        fields: [configKeysDrafts.configKeyId],
        references: [configKeys.configKeyId],
    }),
}));

// CONFIG KEYS HISTORY
export const configKeysHistory = pgTable(
    'nt_config_keys_history', 
    {
        id: serial('id').primaryKey(),
        version: integer('version').notNull(),
        configKeyId: uuid('config_key_id').references(() => configKeys.configKeyId, { onDelete: 'cascade', }).notNull(),
        restoreKey: uuid('restore_key'),
        changes: jsonb('data').default([]),

        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
);

export const configKeysHistoryRelations = relations(configKeysHistory, ({ one }) => ({
    configKey: one(configKeys, {
        fields: [configKeysHistory.configKeyId],
        references: [configKeys.configKeyId],
    }),
}));

// SCRIPTS
export const scripts = pgTable(
    'nt_scripts', 
    {
        id: serial('id').primaryKey(),
        scriptId: uuid('script_id').notNull().unique().defaultRandom(),
        oldScriptId: text('old_script_id').unique(),
        version: integer('version').notNull(),

        type: scriptTypeEnum('type').notNull().default('admission'),
        position: integer('position').notNull(),
        source: text('source').default('editor'),
        title: text('title').notNull(),
        printTitle: text('print_title').notNull(),
        description: text('description').notNull().default(''),
        hospitalId: uuid('hospital_id').references(() => hospitals.hospitalId, { onDelete: 'set null', }),
        exportable: boolean('exportable').notNull().default(true),
        nuidSearchEnabled: boolean('nuid_search_enabled').notNull().default(false),
        nuidSearchFields: jsonb('nuid_search_fields').default('[]').notNull(),
        preferences: jsonb('preferences').default(JSON.stringify(defaultPreferences)).notNull(),
        printSections: jsonb('print_sections').default('[]').notNull(),
        
        publishDate: timestamp('publish_date').defaultNow().notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
        deletedAt: timestamp('deleted_at'),
    },
    table => ({
        searchIndex: index('scripts_search_index')
            .using(
                'gin', 
                sql`(
                    to_tsvector('english', ${table.title}) ||
                    to_tsvector('english', ${table.description})
                )`
            ),
    }),
);

export const scriptsRelations = relations(scripts, ({ many, one }) => ({
    screens: many(screens),
    screensDrafts: many(screensDrafts),
    screensHistory: many(screensHistory),
    diagnoses: many(diagnoses),
    diagnosesDrafts: many(diagnosesDrafts),
    diagnosesHistory: many(diagnosesHistory),
    history: many(scriptsHistory),
    drugsLibrary: many(drugsLibrary),
    draft: one(scriptsDrafts, {
        fields: [scripts.scriptId],
        references: [scriptsDrafts.scriptId],
    }),
}));

// SCRIPTS DRAFTS
export const scriptsDrafts = pgTable(
    'nt_scripts_drafts', 
    {
        id: serial('id').primaryKey(),
        scriptDraftId: uuid('script_draft_id').notNull().unique().defaultRandom(),
        scriptId: uuid('script_id').references(() => scripts.scriptId, { onDelete: 'cascade', }),
        position: integer('position').notNull(),
        hospitalId: uuid('hospital_id').references(() => hospitals.hospitalId, { onDelete: 'set null', }),
        data: jsonb('data').$type<typeof scripts.$inferInsert & { nuidSearchFields: ScriptField[]; }>().notNull(),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    },
);

export const scriptsDraftsRelations = relations(scriptsDrafts, ({ one, many, }) => ({
    screensDrafts: many(screensDrafts),
    diagnosesDrafts: many(diagnosesDrafts),
    script: one(scripts, {
        fields: [scriptsDrafts.scriptId],
        references: [scripts.scriptId],
    }),
}));

// SCRIPTS HISTORY
export const scriptsHistory = pgTable(
    'nt_scripts_history', 
    {
        id: serial('id').primaryKey(),
        version: integer('version').notNull(),
        scriptId: uuid('script_id').references(() => scripts.scriptId, { onDelete: 'cascade', }).notNull(),
        restoreKey: uuid('restore_key'),
        changes: jsonb('data').default([]),

        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
);

export const scriptsHistoryRelations = relations(scriptsHistory, ({ one }) => ({
    script: one(scripts, {
        fields: [scriptsHistory.scriptId],
        references: [scripts.scriptId],
    }),
}));

// SCREENS
export const screens = pgTable(
    'nt_screens', 
    {
        id: serial('id').primaryKey(),
        screenId: uuid('screen_id').notNull().unique().defaultRandom(),
        oldScreenId: text('old_screen_id').unique(),
        oldScriptId: text('old_script_id'),
        version: integer('version').notNull(),
        scriptId: uuid('script_id').references(() => scripts.scriptId, { onDelete: 'cascade', }).notNull(),

        type: screenTypeEnum('type').notNull(),
        position: integer('position').notNull(),
        source: text('source').default('editor'),
        sectionTitle: text('section_title').notNull(),
        previewTitle: text('preview_title').notNull().default(''),
        previewPrintTitle: text('preview_print_title').notNull().default(''),
        condition: text('condition').notNull().default(''),
        skipToCondition: text('skip_to_condition').notNull().default(''),
        skipToScreenId: text('skip_to_screen_id'),
        epicId: text('epic_id').notNull().default(''),
        storyId: text('story_id').notNull().default(''),
        refId: text('ref_id').notNull().default(''),
        refKey: text('ref_key').notNull().default(''),
        step: text('step').notNull().default(''),
        actionText: text('action_text').notNull().default(''),
        contentText: text('content_text').notNull().default(''),
        infoText: text('info_text').notNull().default(''),
        title: text('title').notNull(),
        title1: text('title1').notNull().default(''),
        title2: text('title2').notNull().default(''),
        title3: text('title3').notNull().default(''),
        title4: text('title4').notNull().default(''),
        text1: text('text1').notNull().default(''),
        text2: text('text2').notNull().default(''),
        text3: text('text3').notNull().default(''),
        image1: jsonb('image1'),
        image2: jsonb('image2'),
        image3: jsonb('image3'),
        instructions: text('instructions').notNull().default(''),
        instructions2: text('instructions2').notNull().default(''),
        instructions3: text('instructions3').notNull().default(''),
        instructions4: text('instructions4').notNull().default(''),
        hcwDiagnosesInstructions: text('hcw_diagnoses_instructions').notNull().default(''),
        suggestedDiagnosesInstructions: text('suggested_diagnoses_instructions').notNull().default(''),
        notes: text('notes').notNull().default(''),
        dataType: text('data_type').notNull().default(''),
        key: text('key').notNull().default(''),
        label: text('label').notNull().default(''),
        negativeLabel: text('negative_label').notNull().default(''),
        positiveLabel: text('positive_label').notNull().default(''),
        timerValue: integer('timer_value'),
        multiplier: integer('multiplier'),
        minValue: integer('min_value'),
        maxValue: integer('max_value'),
        exportable: boolean('exportable').notNull().default(true),
        printable: boolean('printable'),
        skippable: boolean('skippable').notNull().default(false),
        confidential: boolean('confidential').notNull().default(false),
        prePopulate: jsonb('pre_populate').default('[]').notNull(),
        fields: jsonb('fields').default('[]').notNull(),
        items: jsonb('items').default('[]').notNull(),
        preferences: jsonb('preferences').default(JSON.stringify(defaultPreferences)).notNull(),
        drugs: jsonb('drugs').default('[]').notNull(),
        fluids: jsonb('fluids').default('[]').notNull(),
        feeds: jsonb('feeds').default('[]').notNull(),
        
        publishDate: timestamp('publish_date').defaultNow().notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
        deletedAt: timestamp('deleted_at'),
    },
    table => ({
        searchIndex: index('screens_search_index')
            .using(
                'gin', 
                sql`(
                    to_tsvector('english', ${table.title})
                )`
            ),
    }),
);

export const screensRelations = relations(screens, ({ many, one }) => ({
    history: many(screensHistory),
    script: one(scripts, {
        fields: [screens.scriptId],
        references: [scripts.scriptId],
    }),
    draft: one(screensDrafts, {
        fields: [screens.screenId],
        references: [screensDrafts.screenId],
    }),
}));

// SCREENS DRAFTS
export const screensDrafts = pgTable(
    'nt_screens_drafts', 
    {
        id: serial('id').primaryKey(),
        screenDraftId: uuid('screen_draft_id').notNull().unique().defaultRandom(),
        screenId: uuid('screen_id').references(() => screens.screenId, { onDelete: 'cascade', }),
        scriptId: uuid('script_id').references(() => scripts.scriptId, { onDelete: 'cascade', }),
        scriptDraftId: uuid('script_draft_id').references(() => scriptsDrafts.scriptDraftId, { onDelete: 'cascade', }),
        type: screenTypeEnum('type').notNull(),
        position: integer('position').notNull(),
        data: jsonb('data').$type<typeof screens.$inferInsert>().notNull(),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    },
);

export const screensDraftsRelations = relations(screensDrafts, ({ one }) => ({
    screen: one(screens, {
        fields: [screensDrafts.screenId],
        references: [screens.screenId],
    }),
    scriptDraft: one(scriptsDrafts, {
        fields: [screensDrafts.scriptDraftId],
        references: [scriptsDrafts.scriptDraftId],
    }),
    script: one(scripts, {
        fields: [screensDrafts.scriptId],
        references: [scripts.scriptId],
    }),
}));

// SCREENS HISTORY
export const screensHistory = pgTable(
    'nt_screens_history', 
    {
        id: serial('id').primaryKey(),
        version: integer('version').notNull(),
        screenId: uuid('screen_id').references(() => screens.screenId, { onDelete: 'cascade', }).notNull(),
        scriptId: uuid('script_id').references(() => scripts.scriptId, { onDelete: 'cascade', }).notNull(),
        restoreKey: text('restore_key'),
        changes: jsonb('data').default([]),

        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
);

export const screensHistoryRelations = relations(screensHistory, ({ one }) => ({
    screen: one(screens, {
        fields: [screensHistory.screenId],
        references: [screens.screenId],
    }),
    script: one(scripts, {
        fields: [screensHistory.scriptId],
        references: [scripts.scriptId],
    }),
}));

// DIAGNOSES
export const diagnoses = pgTable(
    'nt_diagnoses', 
    {
        id: serial('id').primaryKey(),
        diagnosisId: uuid('diagnosis_id').notNull().unique().defaultRandom(),
        oldDiagnosisId: text('old_diagnosis_id').unique(),
        oldScriptId: text('old_script_id'),
        version: integer('version').notNull(),
        scriptId: uuid('script_id').references(() => scripts.scriptId, { onDelete: 'cascade', }).notNull(),

        position: integer('position').notNull(),
        source: text('source').default('editor'),
        expression: text('expression').notNull(),
        name: text('name').notNull().default(''),
        description: text('description').notNull().default(''),
        key: text('key').default(''),
        severityOrder: integer('severity_order'),
        expressionMeaning: text('expression_meaning').notNull().default(''),
        symptoms: jsonb('symptoms').default('[]').notNull(),
        text1: text('text1').notNull().default(''),
        text2: text('text2').notNull().default(''),
        text3: text('text3').notNull().default(''),
        image1: jsonb('image1'),
        image2: jsonb('image2'),
        image3: jsonb('image3'),
        preferences: jsonb('preferences').default(JSON.stringify(defaultPreferences)).notNull(),
        
        publishDate: timestamp('publish_date').defaultNow().notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
        deletedAt: timestamp('deleted_at'),
    },
    table => ({
        searchIndex: index('diagnoses_search_index')
            .using(
                'gin', 
                sql`(
                    to_tsvector('english', ${table.name})
                )`
            ),
    }),
);

export const diagnosesRelations = relations(diagnoses, ({ many, one }) => ({
    history: many(diagnosesHistory),
    script: one(scripts, {
        fields: [diagnoses.scriptId],
        references: [scripts.scriptId],
    }),
    draft: one(diagnosesDrafts, {
        fields: [diagnoses.diagnosisId],
        references: [diagnosesDrafts.diagnosisId],
    }),
}));

// DIAGNOSES DRAFTS
export const diagnosesDrafts = pgTable(
    'nt_diagnoses_drafts', 
    {
        id: serial('id').primaryKey(),
        diagnosisDraftId: uuid('diagnosis_draft_id').notNull().unique().defaultRandom(),
        diagnosisId: uuid('diagnosis_id').references(() => diagnoses.diagnosisId, { onDelete: 'cascade', }),
        scriptId: uuid('script_id').references(() => scripts.scriptId, { onDelete: 'cascade', }),
        scriptDraftId: uuid('script_draft_id').references(() => scriptsDrafts.scriptDraftId, { onDelete: 'cascade', }),
        position: integer('position').notNull(),
        data: jsonb('data').$type<typeof diagnoses.$inferInsert>().notNull(),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    },
);

export const diagnosesDraftsRelations = relations(diagnosesDrafts, ({ one }) => ({
    diagnosis: one(diagnoses, {
        fields: [diagnosesDrafts.diagnosisId],
        references: [diagnoses.diagnosisId],
    }),
    scriptDraft: one(scriptsDrafts, {
        fields: [diagnosesDrafts.scriptDraftId],
        references: [scriptsDrafts.scriptDraftId],
    }),
    script: one(scripts, {
        fields: [diagnosesDrafts.scriptId],
        references: [scripts.scriptId],
    }),
}));

// DIAGNOSES HISTORY
export const diagnosesHistory = pgTable(
    'nt_diagnoses_history', 
    {
        id: serial('id').primaryKey(),
        version: integer('version').notNull(),
        diagnosisId: uuid('diagnosis_id').references(() => diagnoses.diagnosisId, { onDelete: 'cascade', }).notNull(),
        scriptId: uuid('script_id').references(() => scripts.scriptId, { onDelete: 'cascade', }).notNull(),
        restoreKey: text('restore_key'),
        changes: jsonb('data').default([]),

        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
);

export const diagnosesHistoryRelations = relations(diagnosesHistory, ({ one }) => ({
    diagnosis: one(diagnoses, {
        fields: [diagnosesHistory.diagnosisId],
        references: [diagnoses.diagnosisId],
    }),
    script: one(scripts, {
        fields: [diagnosesHistory.scriptId],
        references: [scripts.scriptId],
    }),
}));

// DRUGS LIBRARY
export const drugsLibrary = pgTable('nt_drugs_library', {
    id: serial('id').primaryKey(),
    itemId: uuid('item_id').notNull().unique().defaultRandom(),
    key: text('key').notNull().unique(),
    type: drugTypeEnum('type').notNull().default('drug'),
    drug: text('drug').notNull().default(''),
    minGestation: doublePrecision('min_gestation'),
    maxGestation: doublePrecision('max_gestation'),
    minWeight: doublePrecision('min_weight'),
    maxWeight: doublePrecision('max_weight'),
    minAge: doublePrecision('min_age'),
    maxAge: doublePrecision('max_age'),
    hourlyFeed: doublePrecision('hourly_feed'),
    hourlyFeedDivider: doublePrecision('hourly_feed_divider'),
    dosage: doublePrecision('dosage'),
    dosageMultiplier: doublePrecision('dosage_multiplier'),
    dayOfLife: text('day_of_life').notNull().default(''),
    dosageText: text('dosage_text').notNull().default(''),
    managementText: text('management_text').notNull().default(''),
    gestationKey: text('gestation_key').notNull().default(''),
    weightKey: text('weight_key').notNull().default(''),
    diagnosisKey: text('diagnosis_key').notNull().default(''),
    ageKey: text('age_key').notNull().default(''),
    administrationFrequency: text('administration_frequency').notNull().default(''),
    drugUnit: text('drug_unit').notNull().default(''),
    routeOfAdministration: text('route_of_administration').notNull().default(''),
    position: integer('position').notNull(),
    condition: text('condition').notNull().default(''),
    version: integer('version').notNull(),

    publishDate: timestamp('publish_date').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
});

export const drugsLibraryRelations = relations(drugsLibrary, ({ many, one }) => ({
    history: many(drugsLibraryHistory),
    draft: one(drugsLibraryDrafts, {
        fields: [drugsLibrary.itemId],
        references: [drugsLibraryDrafts.itemId],
    }),
}));

// DRUGS LIBRARY DRAFTS
export const drugsLibraryDrafts = pgTable(
    'nt_drugs_library_drafts', 
    {
        id: serial('id').primaryKey(),
        itemDraftId: uuid('item_draft_id').notNull().unique().defaultRandom(),
        itemId: uuid('item_id').references(() => drugsLibrary.itemId, { onDelete: 'cascade', }),
        key: text('key').notNull(),
        type: drugTypeEnum('type').notNull().default('drug'),
        position: integer('position').notNull(),
        data: jsonb('data').$type<typeof drugsLibrary.$inferInsert>().notNull(),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    },
);

export const drugsLibraryDraftsRelations = relations(drugsLibraryDrafts, ({ one }) => ({
    item: one(drugsLibrary, {
        fields: [drugsLibraryDrafts.itemId],
        references: [drugsLibrary.itemId],
    }),
}));

// DRUGS LIBRARY HISTORY
export const drugsLibraryHistory = pgTable(
    'nt_drugs_library_history', 
    {
        id: serial('id').primaryKey(),
        version: integer('version').notNull(),
        itemId: uuid('item_id').references(() => drugsLibrary.itemId, { onDelete: 'cascade', }).notNull(),
        restoreKey: uuid('restore_key'),
        changes: jsonb('data').default([]),

        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
);

export const drugsLibraryHistoryRelations = relations(drugsLibraryHistory, ({ one }) => ({
    item: one(drugsLibrary, {
        fields: [drugsLibraryHistory.itemId],
        references: [drugsLibrary.itemId],
    }),
}));


// PENDING DELETION
export const pendingDeletion = pgTable(
    'nt_pending_deletion', 
    {
        id: serial('id').primaryKey(),
        scriptId: uuid('script_id').references(() => scripts.scriptId, { onDelete: 'cascade', }),
        screenId: uuid('screen_id').references(() => screens.screenId, { onDelete: 'cascade', }),
        screenScriptId: uuid('screen_script_id').references(() => scripts.scriptId, { onDelete: 'cascade', }),
        diagnosisId: uuid('diagnosis_id').references(() => diagnoses.diagnosisId, { onDelete: 'cascade', }),
        diagnosisScriptId: uuid('diagnosis_script_id').references(() => scripts.scriptId, { onDelete: 'cascade', }),
        configKeyId: uuid('config_key_id').references(() => configKeys.configKeyId, { onDelete: 'cascade', }),
        drugsLibraryItemId: uuid('drugs_library_item_id').references(() => drugsLibrary.itemId, { onDelete: 'cascade', }),
        scriptDraftId: uuid('script_draft_id').references(() => scriptsDrafts.scriptDraftId, { onDelete: 'cascade', }),
        screenDraftId: uuid('screen_draft_id').references(() => screensDrafts.screenDraftId, { onDelete: 'cascade', }),
        diagnosisDraftId: uuid('diagnosis_draft_id').references(() => diagnosesDrafts.diagnosisDraftId, { onDelete: 'cascade', }),
        configKeyDraftId: uuid('config_key_draft_id').references(() => configKeysDrafts.configKeyDraftId, { onDelete: 'cascade', }),
        drugsLibraryItemDraftId: uuid('drugs_library_item_draft_id').references(() => drugsLibraryDrafts.itemDraftId, { onDelete: 'cascade', }),

        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
);

export const pendingDeletionRelations = relations(pendingDeletion, ({ one }) => ({
    script: one(scripts, {
        fields: [pendingDeletion.scriptId],
        references: [scripts.scriptId],
    }),
    screen: one(screens, {
        fields: [pendingDeletion.screenId],
        references: [screens.screenId],
    }),
    screenScript: one(scripts, {
        fields: [pendingDeletion.screenScriptId],
        references: [scripts.scriptId],
    }),
    diagnosis: one(diagnoses, {
        fields: [pendingDeletion.diagnosisId],
        references: [diagnoses.diagnosisId],
    }),
    diagnosisScript: one(scripts, {
        fields: [pendingDeletion.diagnosisScriptId],
        references: [scripts.scriptId],
    }),
    configKey: one(configKeys, {
        fields: [pendingDeletion.configKeyId],
        references: [configKeys.configKeyId],
    }),
    drugsLibraryItem: one(drugsLibrary, {
        fields: [pendingDeletion.drugsLibraryItemId],
        references: [drugsLibrary.itemId],
    }),
    scriptDraft: one(scriptsDrafts, {
        fields: [pendingDeletion.scriptId],
        references: [scriptsDrafts.scriptDraftId],
    }),
    screenDraft: one(screensDrafts, {
        fields: [pendingDeletion.screenId],
        references: [screensDrafts.screenDraftId],
    }),
    diagnosisDraft: one(diagnosesDrafts, {
        fields: [pendingDeletion.diagnosisId],
        references: [diagnosesDrafts.diagnosisDraftId],
    }),
    configKeyDraft: one(configKeysDrafts, {
        fields: [pendingDeletion.configKeyId],
        references: [configKeysDrafts.configKeyDraftId],
    }),
    drugsLibraryItemDraft: one(drugsLibraryDrafts, {
        fields: [pendingDeletion.drugsLibraryItemDraftId],
        references: [drugsLibraryDrafts.itemDraftId],
    }),
}));
