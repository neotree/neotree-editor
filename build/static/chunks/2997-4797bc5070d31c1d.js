(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2997],{42997:function(e,t,a){Promise.resolve().then(a.bind(a,91543))},91543:function(e,t,a){"use strict";a.d(t,{Content:function(){return ej}});var s=a(57437),l=a(36013),n=a(39661),i=a(50495),r=a(2265),d=a(38472),o=a(42421),c=a(5192),u=a(48646),f=a(4429),p=a(37181),m=a(27755),_=a(41007),N=a(94651),h=a(1333),y=a(80894),g=a(76016),x=a(82052),I=a(61212),j=a(73161),w=a(20920),v=a(10096),L=a(43800);let b=(0,v.Tr)({dataType:()=>"bytea"}),D=(0,L.ys)("mailer_service",["gmail","smtp"]),A=(0,L.ys)("role_name",["user","admin","super_user"]),k=(0,L.ys)("site_type",["nodeapi","webeditor"]),B=(0,L.ys)("site_env",["production","stage","development","demo"]),V=(0,L.ys)("script_type",["admission","discharge","neolab"]),K=(0,L.ys)("screen_type",["diagnosis","checklist","form","management","multi_select","single_select","progress","timer","yesno","zw_edliz_summary_table","mwi_edliz_summary_table","edliz_summary_table"]);var T=a(83146);function S(){let e=(0,u._)(["(\n                    to_tsvector('english', ",") ||\n                    to_tsvector('english', ",") ||\n                    to_tsvector('english', ",") ||\n                    to_tsvector('english', ",")\n                )"]);return S=function(){return e},e}function C(){let e=(0,u._)(["(\n                    to_tsvector('english', ",")\n                )"]);return C=function(){return e},e}function q(){let e=(0,u._)(["(\n                    to_tsvector('english', ",") ||\n                    to_tsvector('english', ",") ||\n                    to_tsvector('english', ",")\n                )"]);return q=function(){return e},e}function J(){let e=(0,u._)(["(\n                    to_tsvector('english', ",") ||\n                    to_tsvector('english', ",")\n                )"]);return J=function(){return e},e}function O(){let e=(0,u._)(["(\n                    to_tsvector('english', ",")\n                )"]);return O=function(){return e},e}function P(){let e=(0,u._)(["(\n                    to_tsvector('english', ",")\n                )"]);return P=function(){return e},e}(0,m.af)("nt_mailer_settings",{id:(0,_.eP)("id").primaryKey(),settingId:(0,N.Vj)("setting_id").notNull().unique().defaultRandom(),name:(0,h.fL)("name").notNull().unique(),service:D("service").notNull(),authUsername:(0,h.fL)("auth_username").notNull(),authPassword:(0,h.fL)("auth_password").notNull(),authType:(0,h.fL)("auth_type"),authMethod:(0,h.fL)("auth_method"),host:(0,h.fL)("host").notNull().default(""),port:(0,y._L)("port"),encryption:(0,h.fL)("encryption").notNull().default(""),fromAddress:(0,h.fL)("from_address").notNull().default(""),fromName:(0,h.fL)("from_name").notNull().default(""),isActive:(0,g.O7)("is_active").default(!1).notNull(),secure:(0,g.O7)("secure").default(!1).notNull()}),(0,m.af)("nt_email_templates",{id:(0,_.eP)("id").primaryKey(),templateId:(0,N.Vj)("template_id").notNull().unique().defaultRandom(),name:(0,h.fL)("name").notNull().unique(),data:(0,x.JB)("data").notNull()}),(0,m.af)("nt_sys",{_id:(0,_.eP)("_id").primaryKey(),id:(0,N.Vj)("id").notNull().unique().defaultRandom(),key:(0,h.fL)("key").notNull().unique(),value:(0,h.fL)("value").notNull()});let E=(0,m.af)("nt_tokens",{id:(0,_.eP)("id").primaryKey(),token:(0,y._L)("token").notNull().unique(),userId:(0,N.Vj)("user_id").references(()=>z.userId,{onDelete:"cascade"}),validUntil:(0,I.AB)("valid_until").notNull()});(0,f.lE)(E,e=>{let{one:t}=e;return{user:t(z,{fields:[E.userId],references:[z.userId]})}});let R=(0,m.af)("nt_user_roles",{id:(0,_.eP)("id").primaryKey(),name:A("name").notNull().unique(),description:(0,h.fL)("description")});(0,f.lE)(R,e=>{let{many:t}=e;return{users:t(z)}}),(0,m.af)("nt_languages",{id:(0,_.eP)("id").primaryKey(),name:(0,h.fL)("name").notNull().unique(),iso:(0,h.fL)("iso").notNull().unique(),createdAt:(0,I.AB)("created_at").defaultNow().notNull(),updatedAt:(0,I.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,I.AB)("deleted_at")});let z=(0,m.af)("nt_users",{id:(0,_.eP)("id").primaryKey(),userId:(0,N.Vj)("user_id").notNull().unique().defaultRandom(),role:A("role").references(()=>R.name,{onDelete:"cascade"}).default("user").notNull(),email:(0,h.fL)("email").notNull().unique(),password:(0,h.fL)("password").notNull(),displayName:(0,h.fL)("display_name").notNull(),firstName:(0,h.fL)("first_name"),lastName:(0,h.fL)("last_name"),avatar:(0,h.fL)("avatar"),avatar_sm:(0,h.fL)("avatar_sm"),avatar_md:(0,h.fL)("avatar_md"),activationDate:(0,I.AB)("activation_date"),lastLoginDate:(0,I.AB)("last_login_date"),createdAt:(0,I.AB)("created_at").defaultNow().notNull(),updatedAt:(0,I.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,I.AB)("deleted_at")},e=>({searchIndex:(0,j.Kz)("users_search_index").using("gin",(0,p.i6)(S(),e.email,e.displayName,e.firstName,e.lastName))}));(0,f.lE)(z,e=>{let{many:t,one:a}=e;return{authTokens:t($),tokens:t(E),files:t(Z),role:a(R,{fields:[z.role],references:[R.name]})}});let $=(0,m.af)("nt_auth_clients",{id:(0,_.eP)("id").primaryKey(),clientId:(0,N.Vj)("client_id").notNull().unique().defaultRandom(),clientToken:(0,h.fL)("client_token").notNull().unique(),userId:(0,N.Vj)("user_id").references(()=>z.userId,{onDelete:"cascade"}),validUntil:(0,I.AB)("valid_until"),createdAt:(0,I.AB)("created_at").defaultNow().notNull()});(0,f.lE)($,e=>{let{one:t}=e;return{user:t(z,{fields:[$.userId],references:[z.userId]})}}),(0,m.af)("nt_api_keys",{id:(0,_.eP)("id").primaryKey(),apiKeyId:(0,N.Vj)("api_key_id").notNull().unique().defaultRandom(),apiKey:(0,h.fL)("api_key").notNull().unique().$defaultFn(()=>(0,w.Z)()),validUntil:(0,I.AB)("valid_until"),createdAt:(0,I.AB)("created_at").defaultNow().notNull()}),(0,m.af)("nt_sites",{id:(0,_.eP)("id").primaryKey(),siteId:(0,N.Vj)("site_id").notNull().unique().defaultRandom(),name:(0,h.fL)("name").notNull().unique(),link:(0,h.fL)("link").notNull().unique(),apiKey:(0,h.fL)("api_key").notNull(),type:k("type").notNull(),env:B("env").notNull().default("production"),createdAt:(0,I.AB)("created_at").defaultNow().notNull(),updatedAt:(0,I.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,I.AB)("deleted_at")});let F=(0,m.af)("nt_hospitals",{id:(0,_.eP)("id").primaryKey(),hospitalId:(0,N.Vj)("hospital_id").notNull().unique().defaultRandom(),oldHospitalId:(0,h.fL)("old_hospital_id").unique(),name:(0,h.fL)("name").notNull().unique(),country:(0,h.fL)("country").default(""),createdAt:(0,I.AB)("created_at").defaultNow().notNull(),updatedAt:(0,I.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,I.AB)("deleted_at")},e=>({searchIndex:(0,j.Kz)("hospitals_search_index").using("gin",(0,p.i6)(C(),e.name))}));(0,m.af)("nt_editor_info",{id:(0,_.eP)("id").primaryKey(),dataVersion:(0,y._L)("data_version").notNull().default(1),lastPublishDate:(0,I.AB)("last_publish_date")}),(0,m.af)("nt_devices",{id:(0,_.eP)("id").primaryKey(),deviceId:(0,h.fL)("device_id").notNull().unique(),deviceHash:(0,h.fL)("device_hash").notNull().unique(),details:(0,x.JB)("details").default({}),createdAt:(0,I.AB)("created_at").defaultNow().notNull(),updatedAt:(0,I.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,I.AB)("deleted_at")});let Z=(0,m.af)("nt_files",{id:(0,_.eP)("id").primaryKey(),fileId:(0,N.Vj)("file_id").notNull().unique().defaultRandom(),ownerId:(0,N.Vj)("owner_id").references(()=>z.userId,{onDelete:"cascade"}),filename:(0,h.fL)("filename").notNull(),contentType:(0,h.fL)("content_type").notNull(),size:(0,y._L)("size").notNull(),metadata:(0,x.JB)("metadata").default("{}").notNull(),data:b("data").notNull(),createdAt:(0,I.AB)("created_at").defaultNow().notNull(),updatedAt:(0,I.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,I.AB)("deleted_at")});(0,f.lE)(Z,e=>{let{many:t,one:a}=e;return{owner:a(z,{fields:[Z.ownerId],references:[z.userId]})}}),(0,m.af)("nt_files_chunks",{id:(0,_.eP)("id").primaryKey(),chunkId:(0,N.Vj)("chunk_id").notNull().unique().defaultRandom(),fileId:(0,N.Vj)("file_id").references(()=>Z.fileId,{onDelete:"cascade"}).notNull(),data:b("data").notNull()});let U=(0,m.af)("nt_config_keys",{id:(0,_.eP)("id").primaryKey(),configKeyId:(0,N.Vj)("config_key_id").notNull().unique().defaultRandom(),oldConfigKeyId:(0,h.fL)("old_config_key_id").unique(),position:(0,y._L)("position").notNull(),version:(0,y._L)("version").notNull(),key:(0,h.fL)("key").notNull().unique(),label:(0,h.fL)("label").notNull().unique(),summary:(0,h.fL)("summary").notNull(),source:(0,h.fL)("source").default("editor"),preferences:(0,x.JB)("preferences").default(JSON.stringify(T.$7)).notNull(),publishDate:(0,I.AB)("publish_date").defaultNow().notNull(),createdAt:(0,I.AB)("created_at").defaultNow().notNull(),updatedAt:(0,I.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,I.AB)("deleted_at")},e=>({searchIndex:(0,j.Kz)("config_keys_search_index").using("gin",(0,p.i6)(q(),e.key,e.label,e.summary))}));(0,f.lE)(U,e=>{let{many:t,one:a}=e;return{history:t(H),draft:a(M,{fields:[U.configKeyId],references:[M.configKeyId]})}});let M=(0,m.af)("nt_config_keys_drafts",{id:(0,_.eP)("id").primaryKey(),configKeyDraftId:(0,N.Vj)("config_key_draft_id").notNull().unique().defaultRandom(),configKeyId:(0,N.Vj)("config_key_id").references(()=>U.configKeyId,{onDelete:"cascade"}),position:(0,y._L)("position").notNull(),data:(0,x.JB)("data").$type().notNull(),createdAt:(0,I.AB)("created_at").defaultNow().notNull(),updatedAt:(0,I.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date)});(0,f.lE)(M,e=>{let{one:t}=e;return{configKey:t(U,{fields:[M.configKeyId],references:[U.configKeyId]})}});let H=(0,m.af)("nt_config_keys_history",{id:(0,_.eP)("id").primaryKey(),version:(0,y._L)("version").notNull(),configKeyId:(0,N.Vj)("config_key_id").references(()=>U.configKeyId,{onDelete:"cascade"}).notNull(),restoreKey:(0,N.Vj)("restore_key"),changes:(0,x.JB)("data").default([]),createdAt:(0,I.AB)("created_at").defaultNow().notNull()});(0,f.lE)(H,e=>{let{one:t}=e;return{configKey:t(U,{fields:[H.configKeyId],references:[U.configKeyId]})}});let W=(0,m.af)("nt_scripts",{id:(0,_.eP)("id").primaryKey(),scriptId:(0,N.Vj)("script_id").notNull().unique().defaultRandom(),oldScriptId:(0,h.fL)("old_script_id").unique(),version:(0,y._L)("version").notNull(),type:V("type").notNull().default("admission"),position:(0,y._L)("position").notNull(),source:(0,h.fL)("source").default("editor"),title:(0,h.fL)("title").notNull(),printTitle:(0,h.fL)("print_title").notNull(),description:(0,h.fL)("description").notNull().default(""),hospitalId:(0,N.Vj)("hospital_id").references(()=>F.hospitalId,{onDelete:"cascade"}),exportable:(0,g.O7)("exportable").notNull().default(!0),nuidSearchEnabled:(0,g.O7)("nuid_search_enabled").notNull().default(!1),nuidSearchFields:(0,x.JB)("nuid_search_fields").default("[]").notNull(),preferences:(0,x.JB)("preferences").default(JSON.stringify(T.$7)).notNull(),printSections:(0,x.JB)("print_sections").default("[]").notNull(),publishDate:(0,I.AB)("publish_date").defaultNow().notNull(),createdAt:(0,I.AB)("created_at").defaultNow().notNull(),updatedAt:(0,I.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,I.AB)("deleted_at")},e=>({searchIndex:(0,j.Kz)("scripts_search_index").using("gin",(0,p.i6)(J(),e.title,e.description))}));(0,f.lE)(W,e=>{let{many:t,one:a}=e;return{screens:t(G),screensDrafts:t(Q),screensHistory:t(ee),diagnoses:t(et),diagnosesDrafts:t(ea),diagnosesHistory:t(es),history:t(X),draft:a(Y,{fields:[W.scriptId],references:[Y.scriptId]})}});let Y=(0,m.af)("nt_scripts_drafts",{id:(0,_.eP)("id").primaryKey(),scriptDraftId:(0,N.Vj)("script_draft_id").notNull().unique().defaultRandom(),scriptId:(0,N.Vj)("script_id").references(()=>W.scriptId,{onDelete:"cascade"}),position:(0,y._L)("position").notNull(),hospitalId:(0,N.Vj)("hospital_id").references(()=>F.hospitalId,{onDelete:"cascade"}),data:(0,x.JB)("data").$type().notNull(),createdAt:(0,I.AB)("created_at").defaultNow().notNull(),updatedAt:(0,I.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date)});(0,f.lE)(Y,e=>{let{one:t,many:a}=e;return{screensDrafts:a(Q),diagnosesDrafts:a(ea),script:t(W,{fields:[Y.scriptId],references:[W.scriptId]})}});let X=(0,m.af)("nt_scripts_history",{id:(0,_.eP)("id").primaryKey(),version:(0,y._L)("version").notNull(),scriptId:(0,N.Vj)("script_id").references(()=>W.scriptId,{onDelete:"cascade"}).notNull(),restoreKey:(0,N.Vj)("restore_key"),changes:(0,x.JB)("data").default([]),createdAt:(0,I.AB)("created_at").defaultNow().notNull()});(0,f.lE)(X,e=>{let{one:t}=e;return{script:t(W,{fields:[X.scriptId],references:[W.scriptId]})}});let G=(0,m.af)("nt_screens",{id:(0,_.eP)("id").primaryKey(),screenId:(0,N.Vj)("screen_id").notNull().unique().defaultRandom(),oldScreenId:(0,h.fL)("old_screen_id").unique(),oldScriptId:(0,h.fL)("old_script_id"),version:(0,y._L)("version").notNull(),scriptId:(0,N.Vj)("script_id").references(()=>W.scriptId,{onDelete:"cascade"}).notNull(),type:K("type").notNull(),position:(0,y._L)("position").notNull(),source:(0,h.fL)("source").default("editor"),sectionTitle:(0,h.fL)("section_title").notNull(),previewTitle:(0,h.fL)("preview_title").notNull().default(""),previewPrintTitle:(0,h.fL)("preview_print_title").notNull().default(""),condition:(0,h.fL)("condition").notNull().default(""),skipToCondition:(0,h.fL)("skip_to_condition").notNull().default(""),skipToScreenId:(0,h.fL)("skip_to_screen_id"),epicId:(0,h.fL)("epic_id").notNull().default(""),storyId:(0,h.fL)("story_id").notNull().default(""),refId:(0,h.fL)("ref_id").notNull().default(""),refKey:(0,h.fL)("ref_key").notNull().default(""),step:(0,h.fL)("step").notNull().default(""),actionText:(0,h.fL)("action_text").notNull().default(""),contentText:(0,h.fL)("content_text").notNull().default(""),infoText:(0,h.fL)("info_text").notNull().default(""),title:(0,h.fL)("title").notNull(),title1:(0,h.fL)("title1").notNull().default(""),title2:(0,h.fL)("title2").notNull().default(""),title3:(0,h.fL)("title3").notNull().default(""),title4:(0,h.fL)("title4").notNull().default(""),text1:(0,h.fL)("text1").notNull().default(""),text2:(0,h.fL)("text2").notNull().default(""),text3:(0,h.fL)("text3").notNull().default(""),image1:(0,x.JB)("image1"),image2:(0,x.JB)("image2"),image3:(0,x.JB)("image3"),instructions:(0,h.fL)("instructions").notNull().default(""),instructions2:(0,h.fL)("instructions2").notNull().default(""),instructions3:(0,h.fL)("instructions3").notNull().default(""),instructions4:(0,h.fL)("instructions4").notNull().default(""),hcwDiagnosesInstructions:(0,h.fL)("hcw_diagnoses_instructions").notNull().default(""),suggestedDiagnosesInstructions:(0,h.fL)("suggested_diagnoses_instructions").notNull().default(""),notes:(0,h.fL)("notes").notNull().default(""),dataType:(0,h.fL)("data_type").notNull().default(""),key:(0,h.fL)("key").notNull().default(""),label:(0,h.fL)("label").notNull().default(""),negativeLabel:(0,h.fL)("negative_label").notNull().default(""),positiveLabel:(0,h.fL)("positive_label").notNull().default(""),timerValue:(0,y._L)("timer_value"),multiplier:(0,y._L)("multiplier"),minValue:(0,y._L)("min_value"),maxValue:(0,y._L)("max_value"),exportable:(0,g.O7)("exportable").notNull().default(!0),printable:(0,g.O7)("printable"),skippable:(0,g.O7)("skippable").notNull().default(!1),confidential:(0,g.O7)("confidential").notNull().default(!1),prePopulate:(0,x.JB)("pre_populate").default("[]").notNull(),fields:(0,x.JB)("fields").default("[]").notNull(),items:(0,x.JB)("items").default("[]").notNull(),preferences:(0,x.JB)("preferences").default(JSON.stringify(T.$7)).notNull(),publishDate:(0,I.AB)("publish_date").defaultNow().notNull(),createdAt:(0,I.AB)("created_at").defaultNow().notNull(),updatedAt:(0,I.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,I.AB)("deleted_at")},e=>({searchIndex:(0,j.Kz)("screens_search_index").using("gin",(0,p.i6)(O(),e.title))}));(0,f.lE)(G,e=>{let{many:t,one:a}=e;return{history:t(ee),script:a(W,{fields:[G.scriptId],references:[W.scriptId]}),draft:a(Q,{fields:[G.screenId],references:[Q.screenId]})}});let Q=(0,m.af)("nt_screens_drafts",{id:(0,_.eP)("id").primaryKey(),screenDraftId:(0,N.Vj)("screen_draft_id").notNull().unique().defaultRandom(),screenId:(0,N.Vj)("screen_id").references(()=>G.screenId,{onDelete:"cascade"}),scriptId:(0,N.Vj)("script_id").references(()=>W.scriptId,{onDelete:"cascade"}),scriptDraftId:(0,N.Vj)("script_draft_id").references(()=>Y.scriptDraftId,{onDelete:"cascade"}),type:K("type").notNull(),position:(0,y._L)("position").notNull(),data:(0,x.JB)("data").$type().notNull(),createdAt:(0,I.AB)("created_at").defaultNow().notNull(),updatedAt:(0,I.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date)});(0,f.lE)(Q,e=>{let{one:t}=e;return{screen:t(G,{fields:[Q.screenId],references:[G.screenId]}),scriptDraft:t(Y,{fields:[Q.scriptDraftId],references:[Y.scriptDraftId]}),script:t(W,{fields:[Q.scriptId],references:[W.scriptId]})}});let ee=(0,m.af)("nt_screens_history",{id:(0,_.eP)("id").primaryKey(),version:(0,y._L)("version").notNull(),screenId:(0,N.Vj)("screen_id").references(()=>G.screenId,{onDelete:"cascade"}).notNull(),scriptId:(0,N.Vj)("script_id").references(()=>W.scriptId,{onDelete:"cascade"}).notNull(),restoreKey:(0,h.fL)("restore_key"),changes:(0,x.JB)("data").default([]),createdAt:(0,I.AB)("created_at").defaultNow().notNull()});(0,f.lE)(ee,e=>{let{one:t}=e;return{screen:t(G,{fields:[ee.screenId],references:[G.screenId]}),script:t(W,{fields:[ee.scriptId],references:[W.scriptId]})}});let et=(0,m.af)("nt_diagnoses",{id:(0,_.eP)("id").primaryKey(),diagnosisId:(0,N.Vj)("diagnosis_id").notNull().unique().defaultRandom(),oldDiagnosisId:(0,h.fL)("old_diagnosis_id").unique(),oldScriptId:(0,h.fL)("old_script_id"),version:(0,y._L)("version").notNull(),scriptId:(0,N.Vj)("script_id").references(()=>W.scriptId,{onDelete:"cascade"}).notNull(),position:(0,y._L)("position").notNull(),source:(0,h.fL)("source").default("editor"),expression:(0,h.fL)("expression").notNull(),name:(0,h.fL)("name").notNull().default(""),description:(0,h.fL)("description").notNull().default(""),key:(0,h.fL)("key").default(""),severityOrder:(0,y._L)("severity_order"),expressionMeaning:(0,h.fL)("expression_meaning").notNull().default(""),symptoms:(0,x.JB)("symptoms").default("[]").notNull(),text1:(0,h.fL)("text1").notNull().default(""),text2:(0,h.fL)("text2").notNull().default(""),text3:(0,h.fL)("text3").notNull().default(""),image1:(0,x.JB)("image1"),image2:(0,x.JB)("image2"),image3:(0,x.JB)("image3"),preferences:(0,x.JB)("preferences").default(JSON.stringify(T.$7)).notNull(),publishDate:(0,I.AB)("publish_date").defaultNow().notNull(),createdAt:(0,I.AB)("created_at").defaultNow().notNull(),updatedAt:(0,I.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date),deletedAt:(0,I.AB)("deleted_at")},e=>({searchIndex:(0,j.Kz)("diagnoses_search_index").using("gin",(0,p.i6)(P(),e.name))}));(0,f.lE)(et,e=>{let{many:t,one:a}=e;return{history:t(es),script:a(W,{fields:[et.scriptId],references:[W.scriptId]}),draft:a(ea,{fields:[et.diagnosisId],references:[ea.diagnosisId]})}});let ea=(0,m.af)("nt_diagnoses_drafts",{id:(0,_.eP)("id").primaryKey(),diagnosisDraftId:(0,N.Vj)("diagnosis_draft_id").notNull().unique().defaultRandom(),diagnosisId:(0,N.Vj)("diagnosis_id").references(()=>et.diagnosisId,{onDelete:"cascade"}),scriptId:(0,N.Vj)("script_id").references(()=>W.scriptId,{onDelete:"cascade"}),scriptDraftId:(0,N.Vj)("script_draft_id").references(()=>Y.scriptDraftId,{onDelete:"cascade"}),position:(0,y._L)("position").notNull(),data:(0,x.JB)("data").$type().notNull(),createdAt:(0,I.AB)("created_at").defaultNow().notNull(),updatedAt:(0,I.AB)("updated_at").defaultNow().notNull().$onUpdate(()=>new Date)});(0,f.lE)(ea,e=>{let{one:t}=e;return{diagnosis:t(et,{fields:[ea.diagnosisId],references:[et.diagnosisId]}),scriptDraft:t(Y,{fields:[ea.scriptDraftId],references:[Y.scriptDraftId]}),script:t(W,{fields:[ea.scriptId],references:[W.scriptId]})}});let es=(0,m.af)("nt_diagnoses_history",{id:(0,_.eP)("id").primaryKey(),version:(0,y._L)("version").notNull(),diagnosisId:(0,N.Vj)("diagnosis_id").references(()=>et.diagnosisId,{onDelete:"cascade"}).notNull(),scriptId:(0,N.Vj)("script_id").references(()=>W.scriptId,{onDelete:"cascade"}).notNull(),restoreKey:(0,h.fL)("restore_key"),changes:(0,x.JB)("data").default([]),createdAt:(0,I.AB)("created_at").defaultNow().notNull()});(0,f.lE)(es,e=>{let{one:t}=e;return{diagnosis:t(et,{fields:[es.diagnosisId],references:[et.diagnosisId]}),script:t(W,{fields:[es.scriptId],references:[W.scriptId]})}});let el=(0,m.af)("nt_pending_deletion",{id:(0,_.eP)("id").primaryKey(),scriptId:(0,N.Vj)("script_id").references(()=>W.scriptId,{onDelete:"cascade"}),screenId:(0,N.Vj)("screen_id").references(()=>G.screenId,{onDelete:"cascade"}),screenScriptId:(0,N.Vj)("screen_script_id").references(()=>W.scriptId,{onDelete:"cascade"}),diagnosisId:(0,N.Vj)("diagnosis_id").references(()=>et.diagnosisId,{onDelete:"cascade"}),diagnosisScriptId:(0,N.Vj)("diagnosis_script_id").references(()=>W.scriptId,{onDelete:"cascade"}),configKeyId:(0,N.Vj)("config_key_id").references(()=>U.configKeyId,{onDelete:"cascade"}),scriptDraftId:(0,N.Vj)("script_draft_id").references(()=>Y.scriptDraftId,{onDelete:"cascade"}),screenDraftId:(0,N.Vj)("screen_draft_id").references(()=>Q.screenDraftId,{onDelete:"cascade"}),diagnosisDraftId:(0,N.Vj)("diagnosis_draft_id").references(()=>ea.diagnosisDraftId,{onDelete:"cascade"}),configKeyDraftId:(0,N.Vj)("config_key_draft_id").references(()=>M.configKeyDraftId,{onDelete:"cascade"}),createdAt:(0,I.AB)("created_at").defaultNow().notNull()});(0,f.lE)(el,e=>{let{one:t}=e;return{script:t(W,{fields:[el.scriptId],references:[W.scriptId]}),screen:t(G,{fields:[el.screenId],references:[G.screenId]}),screenScript:t(W,{fields:[el.screenScriptId],references:[W.scriptId]}),diagnosis:t(et,{fields:[el.diagnosisId],references:[et.diagnosisId]}),diagnosisScript:t(W,{fields:[el.diagnosisScriptId],references:[W.scriptId]}),configKey:t(U,{fields:[el.configKeyId],references:[U.configKeyId]}),scriptDraft:t(Y,{fields:[el.scriptId],references:[Y.scriptDraftId]}),screenDraft:t(Q,{fields:[el.screenId],references:[Q.screenDraftId]}),diagnosisDraft:t(ea,{fields:[el.diagnosisId],references:[ea.diagnosisDraftId]}),configKeyDraft:t(M,{fields:[el.configKeyId],references:[M.configKeyDraftId]})}}),A.enumValues;let en=V.enumValues,ei=K.enumValues;var er=a(46910),ed=a(67135),eo=a(86466);function ec(e){let{filters:t,setFilters:a}=e,[l,n]=(0,c.Z)();return(0,s.jsx)("div",{ref:l,children:(0,s.jsxs)("div",{className:"flex flex-col gap-y-6",children:[(0,s.jsx)("div",{children:(0,s.jsxs)(er.h_,{children:[(0,s.jsx)(er.$F,{asChild:!0,children:(0,s.jsxs)(i.z,{disabled:!0,variant:"outline",className:"w-full",children:[t.scriptsTypes.length?t.scriptsTypes.length>1?"".concat(t.scriptsTypes.length," script types"):t.scriptsTypes[0]:"Select script types",(0,s.jsx)(o.Z,{className:"ml-auto h-4 w-4"})]})}),(0,s.jsxs)(er.AW,{className:"max-h-[400px] overflow-y-auto",style:{width:n.width},children:[(0,s.jsx)(er.Ju,{children:"Script types"}),(0,s.jsx)(er.VD,{}),(0,s.jsx)("div",{className:" max-h-[400px] overflow-y-auto",children:en.map(e=>{let l=t.scriptsTypes.includes(e);return(0,s.jsx)(er.bO,{checked:l,onCheckedChange:()=>{a(t=>({scriptsTypes:l?t.scriptsTypes.filter(t=>t!==e):[...t.scriptsTypes,e]}))},children:(0,s.jsx)("div",{dangerouslySetInnerHTML:{__html:e}})},e)})})]})]})}),(0,s.jsx)("div",{children:(0,s.jsxs)(er.h_,{children:[(0,s.jsx)(er.$F,{asChild:!0,children:(0,s.jsxs)(i.z,{disabled:!0,variant:"outline",className:"w-full",children:[t.screensTypes.length?t.screensTypes.length>1?"".concat(t.screensTypes.length," screen types"):t.screensTypes[0]:"Select screen types",(0,s.jsx)(o.Z,{className:"ml-auto h-4 w-4"})]})}),(0,s.jsxs)(er.AW,{className:"max-h-[400px] overflow-y-auto",style:{width:n.width},children:[(0,s.jsx)(er.Ju,{children:"Screen types"}),(0,s.jsx)(er.VD,{}),(0,s.jsx)("div",{className:" max-h-[400px] overflow-y-auto",children:ei.map(e=>{let l=t.screensTypes.includes(e);return(0,s.jsx)(er.bO,{checked:l,onCheckedChange:()=>{a(t=>({screensTypes:l?t.screensTypes.filter(t=>t!==e):[...t.screensTypes,e]}))},children:(0,s.jsx)("div",{dangerouslySetInnerHTML:{__html:e}})},e)})})]})]})}),(0,s.jsx)("div",{children:(0,s.jsxs)(ed._,{htmlFor:"withImagesOnly",className:"flex items-center",children:[(0,s.jsx)(eo.X,{id:"withImagesOnly",checked:t.withImagesOnly,onCheckedChange:()=>a({withImagesOnly:!t.withImagesOnly})}),"\xa0 With images only"]})})]})})}var eu=a(23787),ef=a(87138),ep=a(76942),em=a(37440),e_=a(77605),eN=a(404),eh=a(95317),ey=e=>"".concat(e||"").charAt(0).toUpperCase()+"".concat(e||"").slice(1);function eg(e){let{children:t,...a}=e,{dataType:l,loadData:n}=a;return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("div",{className:"h-[60px]"}),(0,s.jsxs)("div",{className:" h-[60px] border-b fixed top-0 left-0 w-full px-4 flex items-center bg-white z-10 gap-x-4 ",children:[(0,s.jsx)("div",{className:"text-xl",children:ey(l)}),(0,s.jsx)("div",{className:"ml-auto"}),t,(0,s.jsxs)(eh.yo,{children:[(0,s.jsx)(eh.aM,{asChild:!0,children:(0,s.jsxs)(i.z,{variant:"outline",children:[(0,s.jsx)(eN.Z,{className:"h-4 w-4 mr-2"}),"Filters"]})}),(0,s.jsxs)(eh.ue,{className:"p-0 flex flex-col",children:[(0,s.jsxs)(eh.Tu,{className:"p-4",children:[(0,s.jsxs)(eh.bC,{children:["Filter ",l]}),(0,s.jsx)(eh.Ei,{children:""})]}),(0,s.jsx)("div",{className:"flex-1 px-4 overflow-y-auto",children:(0,s.jsx)(ec,{...a})}),(0,s.jsx)(eh.FF,{className:"p-4 border-t",children:(0,s.jsx)(eh.sw,{asChild:!0,children:(0,s.jsxs)(i.z,{className:"w-full mt-6",onClick:()=>n(),children:["Load ",a.dataType]})})})]})]})]})]})}function ex(e){let{screens:t,screensColumns:a,setScreensColumns:l}=e,n=(0,r.useMemo)(()=>Object.keys({...t.data[0]}).map(e=>e),[t.data[0]]);return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(eg,{...e,children:(0,s.jsxs)(er.h_,{children:[(0,s.jsx)(er.$F,{asChild:!0,children:(0,s.jsxs)(i.z,{variant:"outline",children:["Columns",(0,s.jsx)(o.Z,{className:"ml-auto h-4 w-4"})]})}),(0,s.jsxs)(er.AW,{className:"max-h-[400px]",children:[(0,s.jsx)(er.Ju,{children:"Screens"}),(0,s.jsx)(er.VD,{}),(0,s.jsx)("div",{className:" max-h-[400px] overflow-y-auto",children:n.map(e=>{let t=a.includes(e);return(0,s.jsx)(er.bO,{checked:t,onCheckedChange:()=>{l(a=>t?a.filter(t=>t!==e):[...a,e])},children:e},e)})})]})]})}),(0,s.jsx)(ep.DataTable,{columns:[{name:"Screen",cellClassName:"w-10",cellRenderer(e){let{value:t}=e;return(0,s.jsx)(ef.default,{target:"_blank",href:"".concat(t),children:(0,s.jsx)(eu.Z,{className:"text-primary w-4 h-4"})})}},...n.map(e=>({name:e,cellClassName:(0,em.cn)("truncate max-w-[200px]",!a.includes(e)&&"hidden"),cellRenderer(a){let{value:l,rowIndex:n}=a,i=t.data[n],r=null;return("image1"===e&&(r=i.image1),"image2"===e&&(r=i.image2),"image3"===e&&(r=i.image3),r)?(0,s.jsx)("div",{className:"w-10 h-10",children:(0,s.jsx)(e_.E,{alt:i.screenId,src:r.data})}):"scriptTitle"===e?(0,s.jsxs)(ef.default,{target:"_blank",href:"/script/".concat(i.scriptId),className:"flex items-center text-primary",children:[(0,s.jsx)(eu.Z,{className:"text-gray-400 w-4 h-4"}),"\xa0",l]}):l}}))],data:t.data.map(e=>["/script/".concat(e.scriptId,"/screen/").concat(e.screenId),...n.map(t=>{let a=e[t];return null!==a&&"object"==typeof a?typeof a:"".concat(a)})])})]})}function eI(e){let{diagnoses:t,diagnosesColumns:a,setDiagnosesColumns:l}=e,n=(0,r.useMemo)(()=>Object.keys({...t.data[0]}).map(e=>e),[t.data[0]]);return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(eg,{...e,children:(0,s.jsxs)(er.h_,{children:[(0,s.jsx)(er.$F,{asChild:!0,children:(0,s.jsxs)(i.z,{variant:"outline",children:["Columns",(0,s.jsx)(o.Z,{className:"ml-auto h-4 w-4"})]})}),(0,s.jsxs)(er.AW,{className:"max-h-[400px]",children:[(0,s.jsx)(er.Ju,{children:"Diagnoses"}),(0,s.jsx)(er.VD,{}),(0,s.jsx)("div",{className:" max-h-[400px] overflow-y-auto",children:n.map(e=>{let t=a.includes(e);return(0,s.jsx)(er.bO,{checked:t,onCheckedChange:()=>{l(a=>t?a.filter(t=>t!==e):[...a,e])},children:e},e)})})]})]})}),(0,s.jsx)(ep.DataTable,{columns:[{name:"Screen",cellClassName:"w-10",cellRenderer(e){let{value:t}=e;return(0,s.jsx)(ef.default,{target:"_blank",href:"".concat(t),children:(0,s.jsx)(eu.Z,{className:"text-primary w-4 h-4"})})}},...n.map(e=>({name:e,cellClassName:(0,em.cn)("truncate max-w-[200px]",!a.includes(e)&&"hidden"),cellRenderer(a){let{value:l,rowIndex:n}=a,i=t.data[n],r=null;return("image1"===e&&(r=i.image1),"image2"===e&&(r=i.image2),"image3"===e&&(r=i.image3),"scriptTitle"===e)?(0,s.jsxs)(ef.default,{target:"_blank",href:"/script/".concat(i.scriptId),className:"flex items-center text-primary",children:[(0,s.jsx)(eu.Z,{className:"text-gray-400 w-4 h-4"}),"\xa0",l]}):r?(0,s.jsx)("div",{className:"w-10 h-10",children:(0,s.jsx)(e_.E,{alt:i.diagnosisId,src:r.data})}):l}}))],data:t.data.map(e=>["/script/".concat(e.scriptId,"/diagnosis/").concat(e.diagnosisId),...n.map(t=>{let a=e[t];return null!==a&&"object"==typeof a?typeof a:"".concat(a)})])})]})}function ej(e){let t=function(e){let[t,a]=(0,r.useState)(!1),[s,l]=(0,r.useState)(!1),[n,i]=(0,r.useState)({data:[]}),[o,c]=(0,r.useState)(["title"]),[u,f]=(0,r.useState)({data:[]}),[p,m]=(0,r.useState)(["title","image1","image2","image3","scriptTitle","hospitalName"]),[_,N]=(0,r.useState)({data:[]}),[h,y]=(0,r.useState)(["name","image1","image2","image3","scriptTitle","hospitalName"]),[g,x]=(0,r.useState)({screensIds:[],diagnosesIds:[],hospitalsIds:[],scriptsIds:[],screensTypes:[],scriptsTypes:[],withImagesOnly:!0,draftsOnly:!1}),[I,j]=(0,r.useState)(g),w=(0,r.useCallback)(e=>x(t=>({...t,..."function"==typeof e?e(t):e})),[]),v=(0,r.useMemo)(()=>!t||JSON.stringify(g)!==JSON.stringify(I),[g,I,t]),L=(0,r.useCallback)(async()=>{try{l(!0);let e={hospitalIds:g.hospitalsIds,returnDraftsIfExist:!0,scriptsIds:g.scriptsIds,withDeleted:!1},{errors:t,data:s}=(await d.Z.get("/api/scripts?data=".concat(JSON.stringify(e)))).data;if(null==t?void 0:t.length)throw Error(t.join(", "));i({data:s}),j(g),a(!0)}catch(e){alert(e.message)}finally{l(!1)}},[g]),b=(0,r.useCallback)(async()=>{try{l(!0);let e={scriptsIds:g.scriptsIds,screensIds:g.screensIds,returnDraftsIfExist:!0,withDeleted:!1,withImagesOnly:g.withImagesOnly},{errors:t,data:s}=(await d.Z.get("/api/screens?data=".concat(JSON.stringify(e)))).data;if(null==t?void 0:t.length)throw Error(t.join(", "));f({data:s}),j(g),a(!0)}catch(e){alert(e.message)}finally{l(!1)}},[g]),D=(0,r.useCallback)(async()=>{try{l(!0);let e={scriptsIds:g.scriptsIds,diagnosesIds:g.diagnosesIds,returnDraftsIfExist:!0,withDeleted:!1,withImagesOnly:g.withImagesOnly},{errors:t,data:s}=(await d.Z.get("/api/diagnoses?data=".concat(JSON.stringify(e)))).data;if(null==t?void 0:t.length)throw Error(t.join(", "));N({data:s}),j(g),a(!0)}catch(e){alert(e.message)}finally{l(!1)}},[g]),A=(0,r.useCallback)(()=>{"diagnoses"===e.dataType?D():"screens"===e.dataType?b():L()},[e.dataType,D,b,L]);return{...e,loading:s,scripts:n,screens:u,diagnoses:_,filters:g,canLoadData:v,dataInitialised:t,scriptsColumns:o,screensColumns:p,diagnosesColumns:h,setScriptsColumns:c,setScreensColumns:m,setDiagnosesColumns:y,loadData:A,setLoading:l,setScripts:i,setScreens:f,setDiagnoses:N,_setFilters:x,setFilters:w,loadScripts:L,loadScreens:b,loadDiagnoses:D}}(e),{loading:a,dataInitialised:o,canLoadData:c,loadData:u}=t;return(0,s.jsxs)(s.Fragment,{children:[a&&(0,s.jsx)(n.a,{overlay:!0}),o?(0,s.jsxs)(s.Fragment,{children:["screens"===e.dataType&&(0,s.jsx)(ex,{...t}),"diagnoses"===e.dataType&&(0,s.jsx)(eI,{...t})]}):(0,s.jsx)("div",{className:"fixed top-0 left-0 w-full h-full flex flex-col p-5 overflow-y-auto",children:(0,s.jsx)("div",{className:"m-auto w-full max-w-lg",children:(0,s.jsx)(l.Zb,{children:(0,s.jsxs)(l.aY,{children:[(0,s.jsxs)(l.Ol,{children:[(0,s.jsx)(l.ll,{children:"Filters"}),(0,s.jsxs)(l.SZ,{children:["Filter ",e.dataType]})]}),(0,s.jsx)(ec,{...e,...t}),(0,s.jsxs)(i.z,{className:"w-full mt-6",disabled:!c,onClick:()=>u(),children:["Load ",e.dataType]})]})})})})]})}},77605:function(e,t,a){"use strict";a.d(t,{E:function(){return n}});var s=a(57437),l=a(48625);function n(e){let{width:t=0,height:a=0,containerWidth:n,...i}=e;i.sizes;let r={width:"100%",height:"auto"};if(a&&t&&n){let e=(0,l.a)({imageWidth:t,imageHeight:a,containerWidth:n});r.width=e.imageWidth,r.height=e.imageHeight}return(0,s.jsx)("img",{...i,src:i.src,style:{...r,...i.style}})}},39661:function(e,t,a){"use strict";a.d(t,{a:function(){return n}});var s=a(57437),l=a(89627);function n(e){let{overlay:t,transparent:a}=e;return(0,s.jsx)(s.Fragment,{children:(0,s.jsx)("div",{style:{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",...t?{height:"100%",position:"fixed",top:0,left:0,bottom:0,zIndex:999,backgroundColor:a?"transparent":"rgba(255,255,255,.6)"}:{padding:"50px 0"}},children:(0,s.jsx)(l.Z,{style:{height:24,width:24},className:"animate-spin"})})})}},36013:function(e,t,a){"use strict";a.d(t,{Ol:function(){return r},SZ:function(){return o},Zb:function(){return i},aY:function(){return c},ll:function(){return d}});var s=a(57437),l=a(2265),n=a(37440);let i=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)("div",{ref:t,className:(0,n.cn)("rounded-lg border bg-card text-card-foreground shadow-sm",a),...l})});i.displayName="Card";let r=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)("div",{ref:t,className:(0,n.cn)("flex flex-col space-y-1.5 p-6",a),...l})});r.displayName="CardHeader";let d=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)("h3",{ref:t,className:(0,n.cn)("text-2xl font-semibold leading-none tracking-tight",a),...l})});d.displayName="CardTitle";let o=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)("p",{ref:t,className:(0,n.cn)("text-sm text-muted-foreground",a),...l})});o.displayName="CardDescription";let c=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)("div",{ref:t,className:(0,n.cn)("p-6 pt-0",a),...l})});c.displayName="CardContent",l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)("div",{ref:t,className:(0,n.cn)("flex items-center p-6 pt-0",a),...l})}).displayName="CardFooter"},67135:function(e,t,a){"use strict";a.d(t,{_:function(){return o}});var s=a(57437),l=a(2265),n=a(38364),i=a(12218),r=a(37440);let d=(0,i.j)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),o=l.forwardRef((e,t)=>{let{className:a,secondary:l,error:i,...o}=e;return(0,s.jsx)(n.f,{ref:t,className:(0,r.cn)(d(),l&&"text-xs",i?"text-danger":"",a),...o})});o.displayName=n.f.displayName},95317:function(e,t,a){"use strict";a.d(t,{Ei:function(){return g},FF:function(){return h},Tu:function(){return N},aM:function(){return c},bC:function(){return y},sw:function(){return u},ue:function(){return _},yo:function(){return o}});var s=a(57437),l=a(2265),n=a(13304),i=a(12218),r=a(74697),d=a(37440);let o=n.fC,c=n.xz,u=n.x8,f=n.h_,p=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)(n.aV,{className:(0,d.cn)("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",a),...l,ref:t})});p.displayName=n.aV.displayName;let m=(0,i.j)("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",{variants:{side:{top:"inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",bottom:"inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",left:"inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",right:"inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"}},defaultVariants:{side:"right"}}),_=l.forwardRef((e,t)=>{let{side:a="right",className:l,children:i,hideCloseButton:o,...c}=e;return(0,s.jsxs)(f,{children:[(0,s.jsx)(p,{}),(0,s.jsxs)(n.VY,{ref:t,className:(0,d.cn)(m({side:a}),l),...c,children:[i,!0!==o&&(0,s.jsxs)(n.x8,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",children:[(0,s.jsx)(r.Z,{className:"h-4 w-4"}),(0,s.jsx)("span",{className:"sr-only",children:"Close"})]})]})]})});_.displayName=n.VY.displayName;let N=e=>{let{className:t,...a}=e;return(0,s.jsx)("div",{className:(0,d.cn)("flex flex-col space-y-2 text-center sm:text-left",t),...a})};N.displayName="SheetHeader";let h=e=>{let{className:t,...a}=e;return(0,s.jsx)("div",{className:(0,d.cn)("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",t),...a})};h.displayName="SheetFooter";let y=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)(n.Dx,{ref:t,className:(0,d.cn)("text-lg font-semibold text-foreground",a),...l})});y.displayName=n.Dx.displayName;let g=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)(n.dk,{ref:t,className:(0,d.cn)("text-sm text-muted-foreground",a),...l})});g.displayName=n.dk.displayName},83146:function(e,t,a){"use strict";a.d(t,{$7:function(){return s},Tf:function(){return i},m1:function(){return n},ph:function(){return r},uh:function(){return l}});let s={fontSize:{},fontWeight:{},fontStyle:{},textColor:{},backgroundColor:{},highlight:{}},l=[{value:"screens",label:"Screens"},{value:"diagnoses",label:"Diagnoses"},{value:"print",label:"Print"}],n=[{label:"Admission",value:"admission"},{label:"Discharge",value:"discharge"},{label:"Neolab",value:"neolab"}],i=[{value:"checklist",label:"Checklist"},{value:"form",label:"Form"},{value:"management",label:"Management"},{value:"multi_select",label:"Multiple choice list"},{value:"single_select",label:"Single choice list"},{value:"progress",label:"Progress"},{value:"timer",label:"Timer"},{value:"yesno",label:"Yes/No"},{value:"zw_edliz_summary_table",label:"EDLIZ summary table (ZW)"},{value:"mwi_edliz_summary_table",label:"EDLIZ summary table (MWI)"},{value:"diagnosis",label:"Diagnosis"}],r=[{value:"risk",label:"Risk factor"},{value:"sign",label:"Sign/Symptom"}]},48625:function(e,t,a){"use strict";async function s(e){return new Promise((t,a)=>{let s=new Image;s.onload=function(){t({width:s.width,height:s.height})},s.onerror=function(e,t,s,l,n){a(n||Error("Failed to load image"))},s.src=e})}function l(e){let{imageWidth:t,imageHeight:a,containerWidth:s}=e;return t>s&&(a=s/t*a,t=s),{imageWidth:t,imageHeight:a}}a.d(t,{a:function(){return l},p:function(){return s}})}}]);