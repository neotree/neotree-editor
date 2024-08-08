import { diagnoses, diagnosesDrafts, scripts, scriptsDrafts } from "@/databases/pg/schema";
import { screens, screensDrafts } from "@/databases/pg/schema";

// SCREENS
export type Screen<AdditionalFields = {}> = typeof screens.$inferSelect & AdditionalFields;

export type ScreenDraftData<AdditionalFields = {}> = typeof screensDrafts.$inferSelect['data'] & AdditionalFields;

export type ScreenDraft<AdditionalFields = {}> = typeof screensDrafts.$inferSelect & AdditionalFields;

export type ScreenInferInsert<AdditionalFields = {}> = typeof screens.$inferInsert & AdditionalFields;

export type ScreenDraftInferInsertData<AdditionalFields = {}> = typeof screensDrafts.$inferInsert['data'] & AdditionalFields;

export type ScreenDraftInferInsert<AdditionalFields = {}> = typeof screensDrafts.$inferInsert & AdditionalFields;

// DIAGNOSES
export type Diagnosis<AdditionalFields = {}> = typeof diagnoses.$inferSelect & AdditionalFields;

export type DiagnosisDraftData<AdditionalFields = {}> = typeof diagnosesDrafts.$inferSelect['data'] & AdditionalFields;

export type DiagnosisDraft<AdditionalFields = {}> = typeof diagnosesDrafts.$inferSelect & AdditionalFields;

export type DiagnosisInferInsert<AdditionalFields = {}> = typeof diagnoses.$inferInsert & AdditionalFields;

export type DiagnosisDraftInferInsertData<AdditionalFields = {}> = typeof diagnosesDrafts.$inferInsert['data'] & AdditionalFields;

export type DiagnosisDraftInferInsert<AdditionalFields = {}> = typeof diagnosesDrafts.$inferInsert & AdditionalFields;

// SCRIPTS
export type Script<AdditionalFields = {}> = typeof scripts.$inferSelect & AdditionalFields;

export type ScriptDraftData<AdditionalFields = {}> = typeof scriptsDrafts.$inferSelect['data'] & AdditionalFields;

export type ScriptDraft<AdditionalFields = {}> = typeof scriptsDrafts.$inferSelect & AdditionalFields;

export type ScriptInferInsert<AdditionalFields = {}> = typeof scripts.$inferInsert & AdditionalFields;

export type ScriptDraftInferInsertData<AdditionalFields = {}> = typeof scriptsDrafts.$inferInsert['data'] & AdditionalFields;

export type ScriptDraftInferInsert<AdditionalFields = {}> = typeof scriptsDrafts.$inferInsert & AdditionalFields;
