"use strict";exports.id=413,exports.ids=[413],exports.modules={10413:(e,t,i)=>{i.d(t,{Z:()=>n});var d=i(7310),a=i(48937),l=i(43509);let n=globalThis.drizzle||function(){let e=(0,a.Z)(process.env.POSTGRES_DB_URL);return(0,d.t)(e,{schema:l,logger:!1})}()},43509:(e,t,i)=>{i.r(t),i.d(t,{apiKeys:()=>$,authClients:()=>P,authClientsRelations:()=>J,bytea:()=>g,configKeys:()=>C,configKeysDrafts:()=>W,configKeysDraftsRelations:()=>Z,configKeysHistory:()=>F,configKeysHistoryRelations:()=>M,configKeysRelations:()=>G,devices:()=>U,diagnoses:()=>eo,diagnosesDrafts:()=>ef,diagnosesDraftsRelations:()=>ec,diagnosesHistory:()=>e_,diagnosesHistoryRelations:()=>ep,diagnosesRelations:()=>eu,drugsLibrary:()=>eN,drugsLibraryDrafts:()=>eg,drugsLibraryDraftsRelations:()=>em,drugsLibraryHistory:()=>eI,drugsLibraryHistoryRelations:()=>eL,drugsLibraryRelations:()=>ey,editorInfo:()=>T,emailTemplates:()=>w,files:()=>z,filesChunks:()=>H,filesRelations:()=>O,hospitals:()=>S,languages:()=>x,mailerServiceEnum:()=>m,mailerSettings:()=>v,pendingDeletion:()=>eD,pendingDeletionRelations:()=>eA,roleNameEnum:()=>I,rolesRelations:()=>b,screenTypeEnum:()=>h,screens:()=>ed,screensDrafts:()=>el,screensDraftsRelations:()=>en,screensHistory:()=>es,screensHistoryRelations:()=>er,screensRelations:()=>ea,scriptTypeEnum:()=>A,scripts:()=>Q,scriptsDrafts:()=>Y,scriptsDraftsRelations:()=>ee,scriptsHistory:()=>et,scriptsHistoryRelations:()=>ei,scriptsRelations:()=>X,siteEnvEnum:()=>D,siteTypeEnum:()=>L,sites:()=>E,sys:()=>K,tokens:()=>V,tokensRelations:()=>j,userRoles:()=>k,users:()=>R,usersRelations:()=>q});var d=i(11009),a=i(34149),l=i(8324),n=i(95961),s=i(80967),r=i(72140),o=i(12941),u=i(98748),f=i(28680),c=i(1575),_=i(8483),p=i(9576),N=i(31540),y=i(55396);let g=(0,N.Tr)({dataType:()=>"bytea"}),m=(0,y.ys)("mailer_service",["gmail","smtp"]),I=(0,y.ys)("role_name",["user","admin","super_user"]),L=(0,y.ys)("site_type",["nodeapi","webeditor"]),D=(0,y.ys)("site_env",["production","stage","development","demo"]),A=(0,y.ys)("script_type",["admission","discharge","neolab"]),h=(0,y.ys)("screen_type",["diagnosis","checklist","form","management","multi_select","single_select","progress","timer","yesno","drugs","zw_edliz_summary_table","mwi_edliz_summary_table","edliz_summary_table"]),B={fontSize:{},fontWeight:{},fontStyle:{},textColor:{},backgroundColor:{},highlight:{}},v=(0,l.af)("nt_mailer_settings",{id:(0,n.eP)("id").primaryKey(),settingId:(0,s.Vj)("setting_id").notNull().unique().defaultRandom(),name:(0,r.fL)("name").notNull().unique(),service:m("service").notNull(),authUsername:(0,r.fL)("auth_username").notNull(),authPassword:(0,r.fL)("auth_password").notNull(),authType:(0,r.fL)("auth_type"),authMethod:(0,r.fL)("auth_method"),host:(0,r.fL)("host").notNull().default(""),port:(0,o._L)("port"),encryption:(0,r.fL)("encryption").notNull().default(""),fromAddress:(0,r.fL)("from_address").notNull().default(""),fromName:(0,r.fL)("from_name").notNull().default(""),isActive:(0,u.O7)("is_active").default(!1).notNull(),secure:(0,u.O7)("secure").default(!1).notNull()}),w=(0,l.af)("nt_email_templates",{id:(0,n.eP)("id").primaryKey(),templateId:(0,s.Vj)("template_id").notNull().unique().defaultRandom(),name:(0,r.fL)("name").notNull().unique(),data:(0,f.JB)("data").notNull()}),K=(0,l.af)("nt_sys",{_id:(0,n.eP)("_id").primaryKey(),id:(0,s.Vj)("id").notNull().unique().defaultRandom(),key:(0,r.fL)("key").notNull().unique(),value:(0,r.fL)("value").notNull()}),V=(0,l.af)("nt_tokens",{id:(0,n.eP)("id").primaryKey(),token:(0,o._L)("token").notNull().unique(),userId:(0,s.Vj)("user_id").references(()=>R.userId,{onDelete:"cascade"}),validUntil:(0,c.AB)("valid_until").notNull()}),j=(0,d.lE)(V,({one:e})=>({user:e(R,{fields:[V.userId],references:[R.userId]})})),k=(0,l.af)("nt_user_roles",{id:(0,n.eP)("id").primaryKey(),name:I("name").notNull().unique(),description:(0,r.fL)("description")}),b=(0,d.lE)(k,({many:e})=>({users:e(R)})),x=(0,l.af)("nt_languages",{id:(0,n.eP)("id").primaryKey(),name:(0,r.fL)("name").notNull().unique(),iso:(0,r.fL)("iso").notNull().unique(),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,c.AB)("deleted_at")}),R=(0,l.af)("nt_users",{id:(0,n.eP)("id").primaryKey(),userId:(0,s.Vj)("user_id").notNull().unique().defaultRandom(),role:I("role").references(()=>k.name,{onDelete:"cascade"}).default("user").notNull(),email:(0,r.fL)("email").notNull().unique(),password:(0,r.fL)("password").notNull(),displayName:(0,r.fL)("display_name").notNull(),firstName:(0,r.fL)("first_name"),lastName:(0,r.fL)("last_name"),avatar:(0,r.fL)("avatar"),avatar_sm:(0,r.fL)("avatar_sm"),avatar_md:(0,r.fL)("avatar_md"),activationDate:(0,c.AB)("activation_date"),lastLoginDate:(0,c.AB)("last_login_date"),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,c.AB)("deleted_at")},e=>({searchIndex:(0,_.Kz)("users_search_index").using("gin",(0,a.i6)`(
                    to_tsvector('english', ${e.email}) ||
                    to_tsvector('english', ${e.displayName}) ||
                    to_tsvector('english', ${e.firstName}) ||
                    to_tsvector('english', ${e.lastName})
                )`)})),q=(0,d.lE)(R,({many:e,one:t})=>({authTokens:e(P),tokens:e(V),files:e(z),role:t(k,{fields:[R.role],references:[k.name]})})),P=(0,l.af)("nt_auth_clients",{id:(0,n.eP)("id").primaryKey(),clientId:(0,s.Vj)("client_id").notNull().unique().defaultRandom(),clientToken:(0,r.fL)("client_token").notNull().unique(),userId:(0,s.Vj)("user_id").references(()=>R.userId,{onDelete:"cascade"}),validUntil:(0,c.AB)("valid_until"),createdAt:(0,c.AB)("created_at").defaultNow().notNull()}),J=(0,d.lE)(P,({one:e})=>({user:e(R,{fields:[P.userId],references:[R.userId]})})),$=(0,l.af)("nt_api_keys",{id:(0,n.eP)("id").primaryKey(),apiKeyId:(0,s.Vj)("api_key_id").notNull().unique().defaultRandom(),apiKey:(0,r.fL)("api_key").notNull().unique().$defaultFn(()=>(0,p.Z)()),validUntil:(0,c.AB)("valid_until"),createdAt:(0,c.AB)("created_at").defaultNow().notNull()}),E=(0,l.af)("nt_sites",{id:(0,n.eP)("id").primaryKey(),siteId:(0,s.Vj)("site_id").notNull().unique().defaultRandom(),name:(0,r.fL)("name").notNull().unique(),link:(0,r.fL)("link").notNull().unique(),apiKey:(0,r.fL)("api_key").notNull(),type:L("type").notNull(),env:D("env").notNull().default("production"),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,c.AB)("deleted_at")}),S=(0,l.af)("nt_hospitals",{id:(0,n.eP)("id").primaryKey(),hospitalId:(0,s.Vj)("hospital_id").notNull().unique().defaultRandom(),oldHospitalId:(0,r.fL)("old_hospital_id").unique(),name:(0,r.fL)("name").notNull().unique(),country:(0,r.fL)("country").default(""),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,c.AB)("deleted_at")},e=>({searchIndex:(0,_.Kz)("hospitals_search_index").using("gin",(0,a.i6)`(
                    to_tsvector('english', ${e.name})
                )`)})),T=(0,l.af)("nt_editor_info",{id:(0,n.eP)("id").primaryKey(),dataVersion:(0,o._L)("data_version").notNull().default(1),lastPublishDate:(0,c.AB)("last_publish_date")}),U=(0,l.af)("nt_devices",{id:(0,n.eP)("id").primaryKey(),deviceId:(0,r.fL)("device_id").notNull().unique(),deviceHash:(0,r.fL)("device_hash").notNull().unique(),details:(0,f.JB)("details").default({}),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,c.AB)("deleted_at")}),z=(0,l.af)("nt_files",{id:(0,n.eP)("id").primaryKey(),fileId:(0,s.Vj)("file_id").notNull().unique().defaultRandom(),ownerId:(0,s.Vj)("owner_id").references(()=>R.userId,{onDelete:"cascade"}),filename:(0,r.fL)("filename").notNull(),contentType:(0,r.fL)("content_type").notNull(),size:(0,o._L)("size").notNull(),metadata:(0,f.JB)("metadata").default("{}").notNull(),data:g("data").notNull(),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,c.AB)("deleted_at")}),O=(0,d.lE)(z,({many:e,one:t})=>({owner:t(R,{fields:[z.ownerId],references:[R.userId]})})),H=(0,l.af)("nt_files_chunks",{id:(0,n.eP)("id").primaryKey(),chunkId:(0,s.Vj)("chunk_id").notNull().unique().defaultRandom(),fileId:(0,s.Vj)("file_id").references(()=>z.fileId,{onDelete:"cascade"}).notNull(),data:g("data").notNull()}),C=(0,l.af)("nt_config_keys",{id:(0,n.eP)("id").primaryKey(),configKeyId:(0,s.Vj)("config_key_id").notNull().unique().defaultRandom(),oldConfigKeyId:(0,r.fL)("old_config_key_id").unique(),position:(0,o._L)("position").notNull(),version:(0,o._L)("version").notNull(),key:(0,r.fL)("key").notNull().unique(),label:(0,r.fL)("label").notNull().unique(),summary:(0,r.fL)("summary").notNull(),source:(0,r.fL)("source").default("editor"),preferences:(0,f.JB)("preferences").default(JSON.stringify(B)).notNull(),publishDate:(0,c.AB)("publish_date").defaultNow().notNull(),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,c.AB)("deleted_at")},e=>({searchIndex:(0,_.Kz)("config_keys_search_index").using("gin",(0,a.i6)`(
                    to_tsvector('english', ${e.key}) ||
                    to_tsvector('english', ${e.label}) ||
                    to_tsvector('english', ${e.summary})
                )`)})),G=(0,d.lE)(C,({many:e,one:t})=>({history:e(F),draft:t(W,{fields:[C.configKeyId],references:[W.configKeyId]})})),W=(0,l.af)("nt_config_keys_drafts",{id:(0,n.eP)("id").primaryKey(),configKeyDraftId:(0,s.Vj)("config_key_draft_id").notNull().unique().defaultRandom(),configKeyId:(0,s.Vj)("config_key_id").references(()=>C.configKeyId,{onDelete:"cascade"}),position:(0,o._L)("position").notNull(),data:(0,f.JB)("data").$type().notNull(),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date)}),Z=(0,d.lE)(W,({one:e})=>({configKey:e(C,{fields:[W.configKeyId],references:[C.configKeyId]})})),F=(0,l.af)("nt_config_keys_history",{id:(0,n.eP)("id").primaryKey(),version:(0,o._L)("version").notNull(),configKeyId:(0,s.Vj)("config_key_id").references(()=>C.configKeyId,{onDelete:"cascade"}).notNull(),restoreKey:(0,s.Vj)("restore_key"),changes:(0,f.JB)("data").default([]),createdAt:(0,c.AB)("created_at").defaultNow().notNull()}),M=(0,d.lE)(F,({one:e})=>({configKey:e(C,{fields:[F.configKeyId],references:[C.configKeyId]})})),Q=(0,l.af)("nt_scripts",{id:(0,n.eP)("id").primaryKey(),scriptId:(0,s.Vj)("script_id").notNull().unique().defaultRandom(),oldScriptId:(0,r.fL)("old_script_id").unique(),version:(0,o._L)("version").notNull(),type:A("type").notNull().default("admission"),position:(0,o._L)("position").notNull(),source:(0,r.fL)("source").default("editor"),title:(0,r.fL)("title").notNull(),printTitle:(0,r.fL)("print_title").notNull(),description:(0,r.fL)("description").notNull().default(""),hospitalId:(0,s.Vj)("hospital_id").references(()=>S.hospitalId,{onDelete:"cascade"}),exportable:(0,u.O7)("exportable").notNull().default(!0),nuidSearchEnabled:(0,u.O7)("nuid_search_enabled").notNull().default(!1),nuidSearchFields:(0,f.JB)("nuid_search_fields").default("[]").notNull(),preferences:(0,f.JB)("preferences").default(JSON.stringify(B)).notNull(),printSections:(0,f.JB)("print_sections").default("[]").notNull(),publishDate:(0,c.AB)("publish_date").defaultNow().notNull(),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,c.AB)("deleted_at")},e=>({searchIndex:(0,_.Kz)("scripts_search_index").using("gin",(0,a.i6)`(
                    to_tsvector('english', ${e.title}) ||
                    to_tsvector('english', ${e.description})
                )`)})),X=(0,d.lE)(Q,({many:e,one:t})=>({screens:e(ed),screensDrafts:e(el),screensHistory:e(es),diagnoses:e(eo),diagnosesDrafts:e(ef),diagnosesHistory:e(e_),history:e(et),drugsLibrary:e(eN),draft:t(Y,{fields:[Q.scriptId],references:[Y.scriptId]})})),Y=(0,l.af)("nt_scripts_drafts",{id:(0,n.eP)("id").primaryKey(),scriptDraftId:(0,s.Vj)("script_draft_id").notNull().unique().defaultRandom(),scriptId:(0,s.Vj)("script_id").references(()=>Q.scriptId,{onDelete:"cascade"}),position:(0,o._L)("position").notNull(),hospitalId:(0,s.Vj)("hospital_id").references(()=>S.hospitalId,{onDelete:"cascade"}),data:(0,f.JB)("data").$type().notNull(),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date)}),ee=(0,d.lE)(Y,({one:e,many:t})=>({screensDrafts:t(el),diagnosesDrafts:t(ef),script:e(Q,{fields:[Y.scriptId],references:[Q.scriptId]})})),et=(0,l.af)("nt_scripts_history",{id:(0,n.eP)("id").primaryKey(),version:(0,o._L)("version").notNull(),scriptId:(0,s.Vj)("script_id").references(()=>Q.scriptId,{onDelete:"cascade"}).notNull(),restoreKey:(0,s.Vj)("restore_key"),changes:(0,f.JB)("data").default([]),createdAt:(0,c.AB)("created_at").defaultNow().notNull()}),ei=(0,d.lE)(et,({one:e})=>({script:e(Q,{fields:[et.scriptId],references:[Q.scriptId]})})),ed=(0,l.af)("nt_screens",{id:(0,n.eP)("id").primaryKey(),screenId:(0,s.Vj)("screen_id").notNull().unique().defaultRandom(),oldScreenId:(0,r.fL)("old_screen_id").unique(),oldScriptId:(0,r.fL)("old_script_id"),version:(0,o._L)("version").notNull(),scriptId:(0,s.Vj)("script_id").references(()=>Q.scriptId,{onDelete:"cascade"}).notNull(),type:h("type").notNull(),position:(0,o._L)("position").notNull(),source:(0,r.fL)("source").default("editor"),sectionTitle:(0,r.fL)("section_title").notNull(),previewTitle:(0,r.fL)("preview_title").notNull().default(""),previewPrintTitle:(0,r.fL)("preview_print_title").notNull().default(""),condition:(0,r.fL)("condition").notNull().default(""),skipToCondition:(0,r.fL)("skip_to_condition").notNull().default(""),skipToScreenId:(0,r.fL)("skip_to_screen_id"),epicId:(0,r.fL)("epic_id").notNull().default(""),storyId:(0,r.fL)("story_id").notNull().default(""),refId:(0,r.fL)("ref_id").notNull().default(""),refKey:(0,r.fL)("ref_key").notNull().default(""),step:(0,r.fL)("step").notNull().default(""),actionText:(0,r.fL)("action_text").notNull().default(""),contentText:(0,r.fL)("content_text").notNull().default(""),infoText:(0,r.fL)("info_text").notNull().default(""),title:(0,r.fL)("title").notNull(),title1:(0,r.fL)("title1").notNull().default(""),title2:(0,r.fL)("title2").notNull().default(""),title3:(0,r.fL)("title3").notNull().default(""),title4:(0,r.fL)("title4").notNull().default(""),text1:(0,r.fL)("text1").notNull().default(""),text2:(0,r.fL)("text2").notNull().default(""),text3:(0,r.fL)("text3").notNull().default(""),image1:(0,f.JB)("image1"),image2:(0,f.JB)("image2"),image3:(0,f.JB)("image3"),instructions:(0,r.fL)("instructions").notNull().default(""),instructions2:(0,r.fL)("instructions2").notNull().default(""),instructions3:(0,r.fL)("instructions3").notNull().default(""),instructions4:(0,r.fL)("instructions4").notNull().default(""),hcwDiagnosesInstructions:(0,r.fL)("hcw_diagnoses_instructions").notNull().default(""),suggestedDiagnosesInstructions:(0,r.fL)("suggested_diagnoses_instructions").notNull().default(""),notes:(0,r.fL)("notes").notNull().default(""),dataType:(0,r.fL)("data_type").notNull().default(""),key:(0,r.fL)("key").notNull().default(""),label:(0,r.fL)("label").notNull().default(""),negativeLabel:(0,r.fL)("negative_label").notNull().default(""),positiveLabel:(0,r.fL)("positive_label").notNull().default(""),timerValue:(0,o._L)("timer_value"),multiplier:(0,o._L)("multiplier"),minValue:(0,o._L)("min_value"),maxValue:(0,o._L)("max_value"),exportable:(0,u.O7)("exportable").notNull().default(!0),printable:(0,u.O7)("printable"),skippable:(0,u.O7)("skippable").notNull().default(!1),confidential:(0,u.O7)("confidential").notNull().default(!1),prePopulate:(0,f.JB)("pre_populate").default("[]").notNull(),fields:(0,f.JB)("fields").default("[]").notNull(),items:(0,f.JB)("items").default("[]").notNull(),preferences:(0,f.JB)("preferences").default(JSON.stringify(B)).notNull(),drugs:(0,f.JB)("drugs").default("[]").notNull(),publishDate:(0,c.AB)("publish_date").defaultNow().notNull(),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,c.AB)("deleted_at")},e=>({searchIndex:(0,_.Kz)("screens_search_index").using("gin",(0,a.i6)`(
                    to_tsvector('english', ${e.title})
                )`)})),ea=(0,d.lE)(ed,({many:e,one:t})=>({history:e(es),script:t(Q,{fields:[ed.scriptId],references:[Q.scriptId]}),draft:t(el,{fields:[ed.screenId],references:[el.screenId]})})),el=(0,l.af)("nt_screens_drafts",{id:(0,n.eP)("id").primaryKey(),screenDraftId:(0,s.Vj)("screen_draft_id").notNull().unique().defaultRandom(),screenId:(0,s.Vj)("screen_id").references(()=>ed.screenId,{onDelete:"cascade"}),scriptId:(0,s.Vj)("script_id").references(()=>Q.scriptId,{onDelete:"cascade"}),scriptDraftId:(0,s.Vj)("script_draft_id").references(()=>Y.scriptDraftId,{onDelete:"cascade"}),type:h("type").notNull(),position:(0,o._L)("position").notNull(),data:(0,f.JB)("data").$type().notNull(),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date)}),en=(0,d.lE)(el,({one:e})=>({screen:e(ed,{fields:[el.screenId],references:[ed.screenId]}),scriptDraft:e(Y,{fields:[el.scriptDraftId],references:[Y.scriptDraftId]}),script:e(Q,{fields:[el.scriptId],references:[Q.scriptId]})})),es=(0,l.af)("nt_screens_history",{id:(0,n.eP)("id").primaryKey(),version:(0,o._L)("version").notNull(),screenId:(0,s.Vj)("screen_id").references(()=>ed.screenId,{onDelete:"cascade"}).notNull(),scriptId:(0,s.Vj)("script_id").references(()=>Q.scriptId,{onDelete:"cascade"}).notNull(),restoreKey:(0,r.fL)("restore_key"),changes:(0,f.JB)("data").default([]),createdAt:(0,c.AB)("created_at").defaultNow().notNull()}),er=(0,d.lE)(es,({one:e})=>({screen:e(ed,{fields:[es.screenId],references:[ed.screenId]}),script:e(Q,{fields:[es.scriptId],references:[Q.scriptId]})})),eo=(0,l.af)("nt_diagnoses",{id:(0,n.eP)("id").primaryKey(),diagnosisId:(0,s.Vj)("diagnosis_id").notNull().unique().defaultRandom(),oldDiagnosisId:(0,r.fL)("old_diagnosis_id").unique(),oldScriptId:(0,r.fL)("old_script_id"),version:(0,o._L)("version").notNull(),scriptId:(0,s.Vj)("script_id").references(()=>Q.scriptId,{onDelete:"cascade"}).notNull(),position:(0,o._L)("position").notNull(),source:(0,r.fL)("source").default("editor"),expression:(0,r.fL)("expression").notNull(),name:(0,r.fL)("name").notNull().default(""),description:(0,r.fL)("description").notNull().default(""),key:(0,r.fL)("key").default(""),severityOrder:(0,o._L)("severity_order"),expressionMeaning:(0,r.fL)("expression_meaning").notNull().default(""),symptoms:(0,f.JB)("symptoms").default("[]").notNull(),text1:(0,r.fL)("text1").notNull().default(""),text2:(0,r.fL)("text2").notNull().default(""),text3:(0,r.fL)("text3").notNull().default(""),image1:(0,f.JB)("image1"),image2:(0,f.JB)("image2"),image3:(0,f.JB)("image3"),preferences:(0,f.JB)("preferences").default(JSON.stringify(B)).notNull(),publishDate:(0,c.AB)("publish_date").defaultNow().notNull(),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,c.AB)("deleted_at")},e=>({searchIndex:(0,_.Kz)("diagnoses_search_index").using("gin",(0,a.i6)`(
                    to_tsvector('english', ${e.name})
                )`)})),eu=(0,d.lE)(eo,({many:e,one:t})=>({history:e(e_),script:t(Q,{fields:[eo.scriptId],references:[Q.scriptId]}),draft:t(ef,{fields:[eo.diagnosisId],references:[ef.diagnosisId]})})),ef=(0,l.af)("nt_diagnoses_drafts",{id:(0,n.eP)("id").primaryKey(),diagnosisDraftId:(0,s.Vj)("diagnosis_draft_id").notNull().unique().defaultRandom(),diagnosisId:(0,s.Vj)("diagnosis_id").references(()=>eo.diagnosisId,{onDelete:"cascade"}),scriptId:(0,s.Vj)("script_id").references(()=>Q.scriptId,{onDelete:"cascade"}),scriptDraftId:(0,s.Vj)("script_draft_id").references(()=>Y.scriptDraftId,{onDelete:"cascade"}),position:(0,o._L)("position").notNull(),data:(0,f.JB)("data").$type().notNull(),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date)}),ec=(0,d.lE)(ef,({one:e})=>({diagnosis:e(eo,{fields:[ef.diagnosisId],references:[eo.diagnosisId]}),scriptDraft:e(Y,{fields:[ef.scriptDraftId],references:[Y.scriptDraftId]}),script:e(Q,{fields:[ef.scriptId],references:[Q.scriptId]})})),e_=(0,l.af)("nt_diagnoses_history",{id:(0,n.eP)("id").primaryKey(),version:(0,o._L)("version").notNull(),diagnosisId:(0,s.Vj)("diagnosis_id").references(()=>eo.diagnosisId,{onDelete:"cascade"}).notNull(),scriptId:(0,s.Vj)("script_id").references(()=>Q.scriptId,{onDelete:"cascade"}).notNull(),restoreKey:(0,r.fL)("restore_key"),changes:(0,f.JB)("data").default([]),createdAt:(0,c.AB)("created_at").defaultNow().notNull()}),ep=(0,d.lE)(e_,({one:e})=>({diagnosis:e(eo,{fields:[e_.diagnosisId],references:[eo.diagnosisId]}),script:e(Q,{fields:[e_.scriptId],references:[Q.scriptId]})})),eN=(0,l.af)("nt_drugs_library",{id:(0,n.eP)("id").primaryKey(),itemId:(0,s.Vj)("item_id").notNull().unique().defaultRandom(),key:(0,r.fL)("key").notNull().unique(),drug:(0,r.fL)("drug").notNull().default(""),minGestation:(0,o._L)("min_gestation"),maxGestation:(0,o._L)("max_gestation"),minWeight:(0,o._L)("min_weight"),maxWeight:(0,o._L)("max_weight"),dayOfLife:(0,r.fL)("day_of_life").notNull().default(""),dosageText:(0,r.fL)("dosage_text").notNull().default(""),managementText:(0,r.fL)("management_text").notNull().default(""),gestationKey:(0,r.fL)("gestation_key").notNull().default(""),weightKey:(0,r.fL)("weight_key").notNull().default(""),position:(0,o._L)("position").notNull(),condition:(0,r.fL)("condition").notNull().default(""),version:(0,o._L)("version").notNull(),publishDate:(0,c.AB)("publish_date").defaultNow().notNull(),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,c.AB)("deleted_at")}),ey=(0,d.lE)(eN,({many:e,one:t})=>({history:e(eI),draft:t(eg,{fields:[eN.itemId],references:[eg.itemId]})})),eg=(0,l.af)("nt_drugs_library_drafts",{id:(0,n.eP)("id").primaryKey(),itemDraftId:(0,s.Vj)("item_draft_id").notNull().unique().defaultRandom(),itemId:(0,s.Vj)("item_id").references(()=>eN.itemId,{onDelete:"cascade"}),key:(0,r.fL)("key").notNull(),position:(0,o._L)("position").notNull(),data:(0,f.JB)("data").$type().notNull(),createdAt:(0,c.AB)("created_at").defaultNow().notNull(),updatedAt:(0,c.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date)}),em=(0,d.lE)(eg,({one:e})=>({item:e(eN,{fields:[eg.itemId],references:[eN.itemId]})})),eI=(0,l.af)("nt_drugs_library_history",{id:(0,n.eP)("id").primaryKey(),version:(0,o._L)("version").notNull(),itemId:(0,s.Vj)("item_id").references(()=>eN.itemId,{onDelete:"cascade"}).notNull(),restoreKey:(0,s.Vj)("restore_key"),changes:(0,f.JB)("data").default([]),createdAt:(0,c.AB)("created_at").defaultNow().notNull()}),eL=(0,d.lE)(eI,({one:e})=>({item:e(eN,{fields:[eI.itemId],references:[eN.itemId]})})),eD=(0,l.af)("nt_pending_deletion",{id:(0,n.eP)("id").primaryKey(),scriptId:(0,s.Vj)("script_id").references(()=>Q.scriptId,{onDelete:"cascade"}),screenId:(0,s.Vj)("screen_id").references(()=>ed.screenId,{onDelete:"cascade"}),screenScriptId:(0,s.Vj)("screen_script_id").references(()=>Q.scriptId,{onDelete:"cascade"}),diagnosisId:(0,s.Vj)("diagnosis_id").references(()=>eo.diagnosisId,{onDelete:"cascade"}),diagnosisScriptId:(0,s.Vj)("diagnosis_script_id").references(()=>Q.scriptId,{onDelete:"cascade"}),configKeyId:(0,s.Vj)("config_key_id").references(()=>C.configKeyId,{onDelete:"cascade"}),drugsLibraryItemId:(0,s.Vj)("drugs_library_item_id").references(()=>eN.itemId,{onDelete:"cascade"}),scriptDraftId:(0,s.Vj)("script_draft_id").references(()=>Y.scriptDraftId,{onDelete:"cascade"}),screenDraftId:(0,s.Vj)("screen_draft_id").references(()=>el.screenDraftId,{onDelete:"cascade"}),diagnosisDraftId:(0,s.Vj)("diagnosis_draft_id").references(()=>ef.diagnosisDraftId,{onDelete:"cascade"}),configKeyDraftId:(0,s.Vj)("config_key_draft_id").references(()=>W.configKeyDraftId,{onDelete:"cascade"}),drugsLibraryItemDraftId:(0,s.Vj)("drugs_library_item_draft_id").references(()=>eg.itemDraftId,{onDelete:"cascade"}),createdAt:(0,c.AB)("created_at").defaultNow().notNull()}),eA=(0,d.lE)(eD,({one:e})=>({script:e(Q,{fields:[eD.scriptId],references:[Q.scriptId]}),screen:e(ed,{fields:[eD.screenId],references:[ed.screenId]}),screenScript:e(Q,{fields:[eD.screenScriptId],references:[Q.scriptId]}),diagnosis:e(eo,{fields:[eD.diagnosisId],references:[eo.diagnosisId]}),diagnosisScript:e(Q,{fields:[eD.diagnosisScriptId],references:[Q.scriptId]}),configKey:e(C,{fields:[eD.configKeyId],references:[C.configKeyId]}),drugsLibraryItem:e(eN,{fields:[eD.drugsLibraryItemId],references:[eN.itemId]}),scriptDraft:e(Y,{fields:[eD.scriptId],references:[Y.scriptDraftId]}),screenDraft:e(el,{fields:[eD.screenId],references:[el.screenDraftId]}),diagnosisDraft:e(ef,{fields:[eD.diagnosisId],references:[ef.diagnosisDraftId]}),configKeyDraft:e(W,{fields:[eD.configKeyId],references:[W.configKeyDraftId]}),drugsLibraryItemDraft:e(eg,{fields:[eD.drugsLibraryItemDraftId],references:[eg.itemDraftId]})}))}};