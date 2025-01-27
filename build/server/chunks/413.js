"use strict";exports.id=413,exports.ids=[413],exports.modules={10413:(e,t,i)=>{i.d(t,{Z:()=>n});var d=i(7310),a=i(48937),l=i(88182);let n=globalThis.drizzle||function(){let e=(0,a.Z)(process.env.POSTGRES_DB_URL);return(0,d.t)(e,{schema:l,logger:!0})}()},88182:(e,t,i)=>{i.r(t),i.d(t,{apiKeys:()=>E,authClients:()=>z,authClientsRelations:()=>$,bytea:()=>I,configKeys:()=>M,configKeysDrafts:()=>W,configKeysDraftsRelations:()=>Z,configKeysHistory:()=>Q,configKeysHistoryRelations:()=>X,configKeysRelations:()=>G,devices:()=>O,diagnoses:()=>ef,diagnosesDrafts:()=>e_,diagnosesDraftsRelations:()=>ep,diagnosesHistory:()=>eN,diagnosesHistoryRelations:()=>ey,diagnosesRelations:()=>ec,drugTypeEnum:()=>w,drugsLibrary:()=>eg,drugsLibraryDrafts:()=>eI,drugsLibraryDraftsRelations:()=>eL,drugsLibraryHistory:()=>eA,drugsLibraryHistoryRelations:()=>eD,drugsLibraryRelations:()=>em,editorInfo:()=>U,emailTemplates:()=>V,files:()=>H,filesChunks:()=>F,filesRelations:()=>C,hospitals:()=>S,languages:()=>R,mailerServiceEnum:()=>L,mailerSettings:()=>K,pendingDeletion:()=>eh,pendingDeletionRelations:()=>eB,roleNameEnum:()=>A,rolesRelations:()=>q,screenTypeEnum:()=>v,screens:()=>el,screensDrafts:()=>es,screensDraftsRelations:()=>er,screensHistory:()=>eo,screensHistoryRelations:()=>eu,screensRelations:()=>en,scriptTypeEnum:()=>B,scripts:()=>Y,scriptsDrafts:()=>et,scriptsDraftsRelations:()=>ei,scriptsHistory:()=>ed,scriptsHistoryRelations:()=>ea,scriptsRelations:()=>ee,siteEnvEnum:()=>h,siteTypeEnum:()=>D,sites:()=>T,sys:()=>k,tokens:()=>j,tokensRelations:()=>b,userRoles:()=>x,users:()=>J,usersRelations:()=>P});var d=i(11009),a=i(34149),l=i(31540),n=i(55396),s=i(8324),r=i(95961),o=i(80967),u=i(72140),f=i(12941),c=i(98748),_=i(28680),p=i(1575),N=i(8483),y=i(69909),g=i(9576);let m={fontSize:{},fontWeight:{},fontStyle:{},textColor:{},backgroundColor:{},highlight:{}},I=(0,l.Tr)({dataType:()=>"bytea"}),L=(0,n.ys)("mailer_service",["gmail","smtp"]),A=(0,n.ys)("role_name",["user","admin","super_user"]),D=(0,n.ys)("site_type",["nodeapi","webeditor"]),h=(0,n.ys)("site_env",["production","stage","development","demo"]),B=(0,n.ys)("script_type",["admission","discharge","neolab"]),v=(0,n.ys)("screen_type",["diagnosis","checklist","form","management","multi_select","single_select","progress","timer","yesno","drugs","fluids","feeds","zw_edliz_summary_table","mwi_edliz_summary_table","edliz_summary_table"]),w=(0,n.ys)("drug_type",["drug","fluid","feed"]),K=(0,s.af)("nt_mailer_settings",{id:(0,r.eP)("id").primaryKey(),settingId:(0,o.Vj)("setting_id").notNull().unique().defaultRandom(),name:(0,u.fL)("name").notNull().unique(),service:L("service").notNull(),authUsername:(0,u.fL)("auth_username").notNull(),authPassword:(0,u.fL)("auth_password").notNull(),authType:(0,u.fL)("auth_type"),authMethod:(0,u.fL)("auth_method"),host:(0,u.fL)("host").notNull().default(""),port:(0,f._L)("port"),encryption:(0,u.fL)("encryption").notNull().default(""),fromAddress:(0,u.fL)("from_address").notNull().default(""),fromName:(0,u.fL)("from_name").notNull().default(""),isActive:(0,c.O7)("is_active").default(!1).notNull(),secure:(0,c.O7)("secure").default(!1).notNull()}),V=(0,s.af)("nt_email_templates",{id:(0,r.eP)("id").primaryKey(),templateId:(0,o.Vj)("template_id").notNull().unique().defaultRandom(),name:(0,u.fL)("name").notNull().unique(),data:(0,_.JB)("data").notNull()}),k=(0,s.af)("nt_sys",{_id:(0,r.eP)("_id").primaryKey(),id:(0,o.Vj)("id").notNull().unique().defaultRandom(),key:(0,u.fL)("key").notNull().unique(),value:(0,u.fL)("value").notNull()}),j=(0,s.af)("nt_tokens",{id:(0,r.eP)("id").primaryKey(),token:(0,f._L)("token").notNull().unique(),userId:(0,o.Vj)("user_id").references(()=>J.userId,{onDelete:"cascade"}),validUntil:(0,p.AB)("valid_until").notNull()}),b=(0,d.lE)(j,({one:e})=>({user:e(J,{fields:[j.userId],references:[J.userId]})})),x=(0,s.af)("nt_user_roles",{id:(0,r.eP)("id").primaryKey(),name:A("name").notNull().unique(),description:(0,u.fL)("description")}),q=(0,d.lE)(x,({many:e})=>({users:e(J)})),R=(0,s.af)("nt_languages",{id:(0,r.eP)("id").primaryKey(),name:(0,u.fL)("name").notNull().unique(),iso:(0,u.fL)("iso").notNull().unique(),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,p.AB)("deleted_at")}),J=(0,s.af)("nt_users",{id:(0,r.eP)("id").primaryKey(),userId:(0,o.Vj)("user_id").notNull().unique().defaultRandom(),role:A("role").references(()=>x.name,{onDelete:"cascade"}).default("user").notNull(),email:(0,u.fL)("email").notNull().unique(),password:(0,u.fL)("password").notNull(),displayName:(0,u.fL)("display_name").notNull(),firstName:(0,u.fL)("first_name"),lastName:(0,u.fL)("last_name"),avatar:(0,u.fL)("avatar"),avatar_sm:(0,u.fL)("avatar_sm"),avatar_md:(0,u.fL)("avatar_md"),activationDate:(0,p.AB)("activation_date"),lastLoginDate:(0,p.AB)("last_login_date"),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,p.AB)("deleted_at")},e=>({searchIndex:(0,N.Kz)("users_search_index").using("gin",(0,a.i6)`(
                    to_tsvector('english', ${e.email}) ||
                    to_tsvector('english', ${e.displayName}) ||
                    to_tsvector('english', ${e.firstName}) ||
                    to_tsvector('english', ${e.lastName})
                )`)})),P=(0,d.lE)(J,({many:e,one:t})=>({authTokens:e(z),tokens:e(j),files:e(H),role:t(x,{fields:[J.role],references:[x.name]})})),z=(0,s.af)("nt_auth_clients",{id:(0,r.eP)("id").primaryKey(),clientId:(0,o.Vj)("client_id").notNull().unique().defaultRandom(),clientToken:(0,u.fL)("client_token").notNull().unique(),userId:(0,o.Vj)("user_id").references(()=>J.userId,{onDelete:"cascade"}),validUntil:(0,p.AB)("valid_until"),createdAt:(0,p.AB)("created_at").defaultNow().notNull()}),$=(0,d.lE)(z,({one:e})=>({user:e(J,{fields:[z.userId],references:[J.userId]})})),E=(0,s.af)("nt_api_keys",{id:(0,r.eP)("id").primaryKey(),apiKeyId:(0,o.Vj)("api_key_id").notNull().unique().defaultRandom(),apiKey:(0,u.fL)("api_key").notNull().unique().$defaultFn(()=>(0,g.Z)()),validUntil:(0,p.AB)("valid_until"),createdAt:(0,p.AB)("created_at").defaultNow().notNull()}),T=(0,s.af)("nt_sites",{id:(0,r.eP)("id").primaryKey(),siteId:(0,o.Vj)("site_id").notNull().unique().defaultRandom(),name:(0,u.fL)("name").notNull().unique(),link:(0,u.fL)("link").notNull().unique(),apiKey:(0,u.fL)("api_key").notNull(),type:D("type").notNull(),env:h("env").notNull().default("production"),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,p.AB)("deleted_at")}),S=(0,s.af)("nt_hospitals",{id:(0,r.eP)("id").primaryKey(),hospitalId:(0,o.Vj)("hospital_id").notNull().unique().defaultRandom(),oldHospitalId:(0,u.fL)("old_hospital_id").unique(),name:(0,u.fL)("name").notNull().unique(),country:(0,u.fL)("country").default(""),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,p.AB)("deleted_at")},e=>({searchIndex:(0,N.Kz)("hospitals_search_index").using("gin",(0,a.i6)`(
                    to_tsvector('english', ${e.name})
                )`)})),U=(0,s.af)("nt_editor_info",{id:(0,r.eP)("id").primaryKey(),dataVersion:(0,f._L)("data_version").notNull().default(1),lastPublishDate:(0,p.AB)("last_publish_date")}),O=(0,s.af)("nt_devices",{id:(0,r.eP)("id").primaryKey(),deviceId:(0,u.fL)("device_id").notNull().unique(),deviceHash:(0,u.fL)("device_hash").notNull().unique(),details:(0,_.JB)("details").default({}),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,p.AB)("deleted_at")}),H=(0,s.af)("nt_files",{id:(0,r.eP)("id").primaryKey(),fileId:(0,o.Vj)("file_id").notNull().unique().defaultRandom(),ownerId:(0,o.Vj)("owner_id").references(()=>J.userId,{onDelete:"cascade"}),filename:(0,u.fL)("filename").notNull(),contentType:(0,u.fL)("content_type").notNull(),size:(0,f._L)("size").notNull(),metadata:(0,_.JB)("metadata").default("{}").notNull(),data:I("data").notNull(),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,p.AB)("deleted_at")}),C=(0,d.lE)(H,({many:e,one:t})=>({owner:t(J,{fields:[H.ownerId],references:[J.userId]})})),F=(0,s.af)("nt_files_chunks",{id:(0,r.eP)("id").primaryKey(),chunkId:(0,o.Vj)("chunk_id").notNull().unique().defaultRandom(),fileId:(0,o.Vj)("file_id").references(()=>H.fileId,{onDelete:"cascade"}).notNull(),data:I("data").notNull()}),M=(0,s.af)("nt_config_keys",{id:(0,r.eP)("id").primaryKey(),configKeyId:(0,o.Vj)("config_key_id").notNull().unique().defaultRandom(),oldConfigKeyId:(0,u.fL)("old_config_key_id").unique(),position:(0,f._L)("position").notNull(),version:(0,f._L)("version").notNull(),key:(0,u.fL)("key").notNull().unique(),label:(0,u.fL)("label").notNull().unique(),summary:(0,u.fL)("summary").notNull(),source:(0,u.fL)("source").default("editor"),preferences:(0,_.JB)("preferences").default(JSON.stringify(m)).notNull(),publishDate:(0,p.AB)("publish_date").defaultNow().notNull(),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,p.AB)("deleted_at")},e=>({searchIndex:(0,N.Kz)("config_keys_search_index").using("gin",(0,a.i6)`(
                    to_tsvector('english', ${e.key}) ||
                    to_tsvector('english', ${e.label}) ||
                    to_tsvector('english', ${e.summary})
                )`)})),G=(0,d.lE)(M,({many:e,one:t})=>({history:e(Q),draft:t(W,{fields:[M.configKeyId],references:[W.configKeyId]})})),W=(0,s.af)("nt_config_keys_drafts",{id:(0,r.eP)("id").primaryKey(),configKeyDraftId:(0,o.Vj)("config_key_draft_id").notNull().unique().defaultRandom(),configKeyId:(0,o.Vj)("config_key_id").references(()=>M.configKeyId,{onDelete:"cascade"}),position:(0,f._L)("position").notNull(),data:(0,_.JB)("data").$type().notNull(),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date)}),Z=(0,d.lE)(W,({one:e})=>({configKey:e(M,{fields:[W.configKeyId],references:[M.configKeyId]})})),Q=(0,s.af)("nt_config_keys_history",{id:(0,r.eP)("id").primaryKey(),version:(0,f._L)("version").notNull(),configKeyId:(0,o.Vj)("config_key_id").references(()=>M.configKeyId,{onDelete:"cascade"}).notNull(),restoreKey:(0,o.Vj)("restore_key"),changes:(0,_.JB)("data").default([]),createdAt:(0,p.AB)("created_at").defaultNow().notNull()}),X=(0,d.lE)(Q,({one:e})=>({configKey:e(M,{fields:[Q.configKeyId],references:[M.configKeyId]})})),Y=(0,s.af)("nt_scripts",{id:(0,r.eP)("id").primaryKey(),scriptId:(0,o.Vj)("script_id").notNull().unique().defaultRandom(),oldScriptId:(0,u.fL)("old_script_id").unique(),version:(0,f._L)("version").notNull(),type:B("type").notNull().default("admission"),position:(0,f._L)("position").notNull(),source:(0,u.fL)("source").default("editor"),title:(0,u.fL)("title").notNull(),printTitle:(0,u.fL)("print_title").notNull(),description:(0,u.fL)("description").notNull().default(""),hospitalId:(0,o.Vj)("hospital_id").references(()=>S.hospitalId,{onDelete:"cascade"}),exportable:(0,c.O7)("exportable").notNull().default(!0),nuidSearchEnabled:(0,c.O7)("nuid_search_enabled").notNull().default(!1),nuidSearchFields:(0,_.JB)("nuid_search_fields").default("[]").notNull(),preferences:(0,_.JB)("preferences").default(JSON.stringify(m)).notNull(),printSections:(0,_.JB)("print_sections").default("[]").notNull(),publishDate:(0,p.AB)("publish_date").defaultNow().notNull(),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,p.AB)("deleted_at")},e=>({searchIndex:(0,N.Kz)("scripts_search_index").using("gin",(0,a.i6)`(
                    to_tsvector('english', ${e.title}) ||
                    to_tsvector('english', ${e.description})
                )`)})),ee=(0,d.lE)(Y,({many:e,one:t})=>({screens:e(el),screensDrafts:e(es),screensHistory:e(eo),diagnoses:e(ef),diagnosesDrafts:e(e_),diagnosesHistory:e(eN),history:e(ed),drugsLibrary:e(eg),draft:t(et,{fields:[Y.scriptId],references:[et.scriptId]})})),et=(0,s.af)("nt_scripts_drafts",{id:(0,r.eP)("id").primaryKey(),scriptDraftId:(0,o.Vj)("script_draft_id").notNull().unique().defaultRandom(),scriptId:(0,o.Vj)("script_id").references(()=>Y.scriptId,{onDelete:"cascade"}),position:(0,f._L)("position").notNull(),hospitalId:(0,o.Vj)("hospital_id").references(()=>S.hospitalId,{onDelete:"cascade"}),data:(0,_.JB)("data").$type().notNull(),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date)}),ei=(0,d.lE)(et,({one:e,many:t})=>({screensDrafts:t(es),diagnosesDrafts:t(e_),script:e(Y,{fields:[et.scriptId],references:[Y.scriptId]})})),ed=(0,s.af)("nt_scripts_history",{id:(0,r.eP)("id").primaryKey(),version:(0,f._L)("version").notNull(),scriptId:(0,o.Vj)("script_id").references(()=>Y.scriptId,{onDelete:"cascade"}).notNull(),restoreKey:(0,o.Vj)("restore_key"),changes:(0,_.JB)("data").default([]),createdAt:(0,p.AB)("created_at").defaultNow().notNull()}),ea=(0,d.lE)(ed,({one:e})=>({script:e(Y,{fields:[ed.scriptId],references:[Y.scriptId]})})),el=(0,s.af)("nt_screens",{id:(0,r.eP)("id").primaryKey(),screenId:(0,o.Vj)("screen_id").notNull().unique().defaultRandom(),oldScreenId:(0,u.fL)("old_screen_id").unique(),oldScriptId:(0,u.fL)("old_script_id"),version:(0,f._L)("version").notNull(),scriptId:(0,o.Vj)("script_id").references(()=>Y.scriptId,{onDelete:"cascade"}).notNull(),type:v("type").notNull(),position:(0,f._L)("position").notNull(),source:(0,u.fL)("source").default("editor"),sectionTitle:(0,u.fL)("section_title").notNull(),previewTitle:(0,u.fL)("preview_title").notNull().default(""),previewPrintTitle:(0,u.fL)("preview_print_title").notNull().default(""),condition:(0,u.fL)("condition").notNull().default(""),skipToCondition:(0,u.fL)("skip_to_condition").notNull().default(""),skipToScreenId:(0,u.fL)("skip_to_screen_id"),epicId:(0,u.fL)("epic_id").notNull().default(""),storyId:(0,u.fL)("story_id").notNull().default(""),refId:(0,u.fL)("ref_id").notNull().default(""),refKey:(0,u.fL)("ref_key").notNull().default(""),step:(0,u.fL)("step").notNull().default(""),actionText:(0,u.fL)("action_text").notNull().default(""),contentText:(0,u.fL)("content_text").notNull().default(""),infoText:(0,u.fL)("info_text").notNull().default(""),title:(0,u.fL)("title").notNull(),title1:(0,u.fL)("title1").notNull().default(""),title2:(0,u.fL)("title2").notNull().default(""),title3:(0,u.fL)("title3").notNull().default(""),title4:(0,u.fL)("title4").notNull().default(""),text1:(0,u.fL)("text1").notNull().default(""),text2:(0,u.fL)("text2").notNull().default(""),text3:(0,u.fL)("text3").notNull().default(""),image1:(0,_.JB)("image1"),image2:(0,_.JB)("image2"),image3:(0,_.JB)("image3"),instructions:(0,u.fL)("instructions").notNull().default(""),instructions2:(0,u.fL)("instructions2").notNull().default(""),instructions3:(0,u.fL)("instructions3").notNull().default(""),instructions4:(0,u.fL)("instructions4").notNull().default(""),hcwDiagnosesInstructions:(0,u.fL)("hcw_diagnoses_instructions").notNull().default(""),suggestedDiagnosesInstructions:(0,u.fL)("suggested_diagnoses_instructions").notNull().default(""),notes:(0,u.fL)("notes").notNull().default(""),dataType:(0,u.fL)("data_type").notNull().default(""),key:(0,u.fL)("key").notNull().default(""),label:(0,u.fL)("label").notNull().default(""),negativeLabel:(0,u.fL)("negative_label").notNull().default(""),positiveLabel:(0,u.fL)("positive_label").notNull().default(""),timerValue:(0,f._L)("timer_value"),multiplier:(0,f._L)("multiplier"),minValue:(0,f._L)("min_value"),maxValue:(0,f._L)("max_value"),exportable:(0,c.O7)("exportable").notNull().default(!0),printable:(0,c.O7)("printable"),skippable:(0,c.O7)("skippable").notNull().default(!1),confidential:(0,c.O7)("confidential").notNull().default(!1),prePopulate:(0,_.JB)("pre_populate").default("[]").notNull(),fields:(0,_.JB)("fields").default("[]").notNull(),items:(0,_.JB)("items").default("[]").notNull(),preferences:(0,_.JB)("preferences").default(JSON.stringify(m)).notNull(),drugs:(0,_.JB)("drugs").default("[]").notNull(),fluids:(0,_.JB)("fluids").default("[]").notNull(),feeds:(0,_.JB)("feeds").default("[]").notNull(),publishDate:(0,p.AB)("publish_date").defaultNow().notNull(),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,p.AB)("deleted_at")},e=>({searchIndex:(0,N.Kz)("screens_search_index").using("gin",(0,a.i6)`(
                    to_tsvector('english', ${e.title})
                )`)})),en=(0,d.lE)(el,({many:e,one:t})=>({history:e(eo),script:t(Y,{fields:[el.scriptId],references:[Y.scriptId]}),draft:t(es,{fields:[el.screenId],references:[es.screenId]})})),es=(0,s.af)("nt_screens_drafts",{id:(0,r.eP)("id").primaryKey(),screenDraftId:(0,o.Vj)("screen_draft_id").notNull().unique().defaultRandom(),screenId:(0,o.Vj)("screen_id").references(()=>el.screenId,{onDelete:"cascade"}),scriptId:(0,o.Vj)("script_id").references(()=>Y.scriptId,{onDelete:"cascade"}),scriptDraftId:(0,o.Vj)("script_draft_id").references(()=>et.scriptDraftId,{onDelete:"cascade"}),type:v("type").notNull(),position:(0,f._L)("position").notNull(),data:(0,_.JB)("data").$type().notNull(),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date)}),er=(0,d.lE)(es,({one:e})=>({screen:e(el,{fields:[es.screenId],references:[el.screenId]}),scriptDraft:e(et,{fields:[es.scriptDraftId],references:[et.scriptDraftId]}),script:e(Y,{fields:[es.scriptId],references:[Y.scriptId]})})),eo=(0,s.af)("nt_screens_history",{id:(0,r.eP)("id").primaryKey(),version:(0,f._L)("version").notNull(),screenId:(0,o.Vj)("screen_id").references(()=>el.screenId,{onDelete:"cascade"}).notNull(),scriptId:(0,o.Vj)("script_id").references(()=>Y.scriptId,{onDelete:"cascade"}).notNull(),restoreKey:(0,u.fL)("restore_key"),changes:(0,_.JB)("data").default([]),createdAt:(0,p.AB)("created_at").defaultNow().notNull()}),eu=(0,d.lE)(eo,({one:e})=>({screen:e(el,{fields:[eo.screenId],references:[el.screenId]}),script:e(Y,{fields:[eo.scriptId],references:[Y.scriptId]})})),ef=(0,s.af)("nt_diagnoses",{id:(0,r.eP)("id").primaryKey(),diagnosisId:(0,o.Vj)("diagnosis_id").notNull().unique().defaultRandom(),oldDiagnosisId:(0,u.fL)("old_diagnosis_id").unique(),oldScriptId:(0,u.fL)("old_script_id"),version:(0,f._L)("version").notNull(),scriptId:(0,o.Vj)("script_id").references(()=>Y.scriptId,{onDelete:"cascade"}).notNull(),position:(0,f._L)("position").notNull(),source:(0,u.fL)("source").default("editor"),expression:(0,u.fL)("expression").notNull(),name:(0,u.fL)("name").notNull().default(""),description:(0,u.fL)("description").notNull().default(""),key:(0,u.fL)("key").default(""),severityOrder:(0,f._L)("severity_order"),expressionMeaning:(0,u.fL)("expression_meaning").notNull().default(""),symptoms:(0,_.JB)("symptoms").default("[]").notNull(),text1:(0,u.fL)("text1").notNull().default(""),text2:(0,u.fL)("text2").notNull().default(""),text3:(0,u.fL)("text3").notNull().default(""),image1:(0,_.JB)("image1"),image2:(0,_.JB)("image2"),image3:(0,_.JB)("image3"),preferences:(0,_.JB)("preferences").default(JSON.stringify(m)).notNull(),publishDate:(0,p.AB)("publish_date").defaultNow().notNull(),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,p.AB)("deleted_at")},e=>({searchIndex:(0,N.Kz)("diagnoses_search_index").using("gin",(0,a.i6)`(
                    to_tsvector('english', ${e.name})
                )`)})),ec=(0,d.lE)(ef,({many:e,one:t})=>({history:e(eN),script:t(Y,{fields:[ef.scriptId],references:[Y.scriptId]}),draft:t(e_,{fields:[ef.diagnosisId],references:[e_.diagnosisId]})})),e_=(0,s.af)("nt_diagnoses_drafts",{id:(0,r.eP)("id").primaryKey(),diagnosisDraftId:(0,o.Vj)("diagnosis_draft_id").notNull().unique().defaultRandom(),diagnosisId:(0,o.Vj)("diagnosis_id").references(()=>ef.diagnosisId,{onDelete:"cascade"}),scriptId:(0,o.Vj)("script_id").references(()=>Y.scriptId,{onDelete:"cascade"}),scriptDraftId:(0,o.Vj)("script_draft_id").references(()=>et.scriptDraftId,{onDelete:"cascade"}),position:(0,f._L)("position").notNull(),data:(0,_.JB)("data").$type().notNull(),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date)}),ep=(0,d.lE)(e_,({one:e})=>({diagnosis:e(ef,{fields:[e_.diagnosisId],references:[ef.diagnosisId]}),scriptDraft:e(et,{fields:[e_.scriptDraftId],references:[et.scriptDraftId]}),script:e(Y,{fields:[e_.scriptId],references:[Y.scriptId]})})),eN=(0,s.af)("nt_diagnoses_history",{id:(0,r.eP)("id").primaryKey(),version:(0,f._L)("version").notNull(),diagnosisId:(0,o.Vj)("diagnosis_id").references(()=>ef.diagnosisId,{onDelete:"cascade"}).notNull(),scriptId:(0,o.Vj)("script_id").references(()=>Y.scriptId,{onDelete:"cascade"}).notNull(),restoreKey:(0,u.fL)("restore_key"),changes:(0,_.JB)("data").default([]),createdAt:(0,p.AB)("created_at").defaultNow().notNull()}),ey=(0,d.lE)(eN,({one:e})=>({diagnosis:e(ef,{fields:[eN.diagnosisId],references:[ef.diagnosisId]}),script:e(Y,{fields:[eN.scriptId],references:[Y.scriptId]})})),eg=(0,s.af)("nt_drugs_library",{id:(0,r.eP)("id").primaryKey(),itemId:(0,o.Vj)("item_id").notNull().unique().defaultRandom(),key:(0,u.fL)("key").notNull().unique(),type:w("type").notNull().default("drug"),drug:(0,u.fL)("drug").notNull().default(""),minGestation:(0,y.zz)("min_gestation"),maxGestation:(0,y.zz)("max_gestation"),minWeight:(0,y.zz)("min_weight"),maxWeight:(0,y.zz)("max_weight"),minAge:(0,y.zz)("min_age"),maxAge:(0,y.zz)("max_age"),hourlyFeed:(0,y.zz)("hourly_feed"),hourlyFeedMultiplier:(0,y.zz)("hourly_feed_multiplier"),dosage:(0,y.zz)("dosage"),dosageMultiplier:(0,y.zz)("dosage_multiplier"),dayOfLife:(0,u.fL)("day_of_life").notNull().default(""),dosageText:(0,u.fL)("dosage_text").notNull().default(""),managementText:(0,u.fL)("management_text").notNull().default(""),gestationKey:(0,u.fL)("gestation_key").notNull().default(""),weightKey:(0,u.fL)("weight_key").notNull().default(""),diagnosisKey:(0,u.fL)("diagnosis_key").notNull().default(""),ageKey:(0,u.fL)("age_key").notNull().default(""),administrationFrequency:(0,u.fL)("administration_frequency").notNull().default(""),drugUnit:(0,u.fL)("drug_unit").notNull().default(""),routeOfAdministration:(0,u.fL)("route_of_administration").notNull().default(""),position:(0,f._L)("position").notNull(),condition:(0,u.fL)("condition").notNull().default(""),version:(0,f._L)("version").notNull(),publishDate:(0,p.AB)("publish_date").defaultNow().notNull(),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,p.AB)("deleted_at")}),em=(0,d.lE)(eg,({many:e,one:t})=>({history:e(eA),draft:t(eI,{fields:[eg.itemId],references:[eI.itemId]})})),eI=(0,s.af)("nt_drugs_library_drafts",{id:(0,r.eP)("id").primaryKey(),itemDraftId:(0,o.Vj)("item_draft_id").notNull().unique().defaultRandom(),itemId:(0,o.Vj)("item_id").references(()=>eg.itemId,{onDelete:"cascade"}),key:(0,u.fL)("key").notNull(),type:w("type").notNull().default("drug"),position:(0,f._L)("position").notNull(),data:(0,_.JB)("data").$type().notNull(),createdAt:(0,p.AB)("created_at").defaultNow().notNull(),updatedAt:(0,p.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date)}),eL=(0,d.lE)(eI,({one:e})=>({item:e(eg,{fields:[eI.itemId],references:[eg.itemId]})})),eA=(0,s.af)("nt_drugs_library_history",{id:(0,r.eP)("id").primaryKey(),version:(0,f._L)("version").notNull(),itemId:(0,o.Vj)("item_id").references(()=>eg.itemId,{onDelete:"cascade"}).notNull(),restoreKey:(0,o.Vj)("restore_key"),changes:(0,_.JB)("data").default([]),createdAt:(0,p.AB)("created_at").defaultNow().notNull()}),eD=(0,d.lE)(eA,({one:e})=>({item:e(eg,{fields:[eA.itemId],references:[eg.itemId]})})),eh=(0,s.af)("nt_pending_deletion",{id:(0,r.eP)("id").primaryKey(),scriptId:(0,o.Vj)("script_id").references(()=>Y.scriptId,{onDelete:"cascade"}),screenId:(0,o.Vj)("screen_id").references(()=>el.screenId,{onDelete:"cascade"}),screenScriptId:(0,o.Vj)("screen_script_id").references(()=>Y.scriptId,{onDelete:"cascade"}),diagnosisId:(0,o.Vj)("diagnosis_id").references(()=>ef.diagnosisId,{onDelete:"cascade"}),diagnosisScriptId:(0,o.Vj)("diagnosis_script_id").references(()=>Y.scriptId,{onDelete:"cascade"}),configKeyId:(0,o.Vj)("config_key_id").references(()=>M.configKeyId,{onDelete:"cascade"}),drugsLibraryItemId:(0,o.Vj)("drugs_library_item_id").references(()=>eg.itemId,{onDelete:"cascade"}),scriptDraftId:(0,o.Vj)("script_draft_id").references(()=>et.scriptDraftId,{onDelete:"cascade"}),screenDraftId:(0,o.Vj)("screen_draft_id").references(()=>es.screenDraftId,{onDelete:"cascade"}),diagnosisDraftId:(0,o.Vj)("diagnosis_draft_id").references(()=>e_.diagnosisDraftId,{onDelete:"cascade"}),configKeyDraftId:(0,o.Vj)("config_key_draft_id").references(()=>W.configKeyDraftId,{onDelete:"cascade"}),drugsLibraryItemDraftId:(0,o.Vj)("drugs_library_item_draft_id").references(()=>eI.itemDraftId,{onDelete:"cascade"}),createdAt:(0,p.AB)("created_at").defaultNow().notNull()}),eB=(0,d.lE)(eh,({one:e})=>({script:e(Y,{fields:[eh.scriptId],references:[Y.scriptId]}),screen:e(el,{fields:[eh.screenId],references:[el.screenId]}),screenScript:e(Y,{fields:[eh.screenScriptId],references:[Y.scriptId]}),diagnosis:e(ef,{fields:[eh.diagnosisId],references:[ef.diagnosisId]}),diagnosisScript:e(Y,{fields:[eh.diagnosisScriptId],references:[Y.scriptId]}),configKey:e(M,{fields:[eh.configKeyId],references:[M.configKeyId]}),drugsLibraryItem:e(eg,{fields:[eh.drugsLibraryItemId],references:[eg.itemId]}),scriptDraft:e(et,{fields:[eh.scriptId],references:[et.scriptDraftId]}),screenDraft:e(es,{fields:[eh.screenId],references:[es.screenDraftId]}),diagnosisDraft:e(e_,{fields:[eh.diagnosisId],references:[e_.diagnosisDraftId]}),configKeyDraft:e(W,{fields:[eh.configKeyId],references:[W.configKeyDraftId]}),drugsLibraryItemDraft:e(eI,{fields:[eh.drugsLibraryItemDraftId],references:[eI.itemDraftId]})}))}};