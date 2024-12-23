"use strict";exports.id=1271,exports.ids=[1271],exports.modules={71271:(e,t,s)=>{s.r(t),s.d(t,{$$ACTION_0:()=>v,$$ACTION_1:()=>_,countAllDrafts:()=>R,discardDrafts:()=>b,getEditorDetails:()=>m,publishData:()=>A,revalidatePath:()=>Z});var i=s(24330);s(60166);var n=s(57708),a=s(88317),r=s(57435),o=s(66267),c=s(57745),d=s(10413),f=s(43509);async function l(e){try{let{items:t,broadcastAction:s}={...e},i=["configKeys"===t?(0,c.K0)(f.pendingDeletion.configKeyId):void 0,"scripts"===t?(0,c.xD)((0,c.K0)(f.pendingDeletion.scriptId),(0,c.Ft)(f.pendingDeletion.screenId),(0,c.Ft)(f.pendingDeletion.diagnosisId)):void 0,"screens"===t?(0,c.K0)(f.pendingDeletion.screenId):void 0,"diagnoses"===t?(0,c.K0)(f.pendingDeletion.diagnosisId):void 0];return await d.Z.delete(f.pendingDeletion).where(i.length?(0,c.xD)(...i):void 0),s&&a.Z.emit("data_changed","clear_pending_deletion"),{success:!0}}catch(e){return r.Z.error("_clearPendingDeletion ERROR",e.message),{success:!1,errors:[e.message]}}}async function g(e){try{let{items:t}={...e},s=await d.Z.query.pendingDeletion.findMany({where:"configKeys"===t?(0,c.K0)(f.pendingDeletion.configKeyId):void 0});s.length&&await d.Z.update(f.configKeys).set({deletedAt:new Date}).where((0,c.d3)(f.configKeys.configKeyId,s.map(e=>e.configKeyId)));let i=await d.Z.query.pendingDeletion.findMany({where:"scripts"===t?(0,c.xD)((0,c.K0)(f.pendingDeletion.scriptId),(0,c.Ft)(f.pendingDeletion.screenId),(0,c.Ft)(f.pendingDeletion.diagnosisId)):void 0});i.length&&(await d.Z.update(f.scripts).set({deletedAt:new Date}).where((0,c.d3)(f.scripts.scriptId,i.map(e=>e.scriptId))),await d.Z.update(f.screens).set({deletedAt:new Date}).where((0,c.d3)(f.screens.scriptId,i.map(e=>e.scriptId))),await d.Z.update(f.diagnoses).set({deletedAt:new Date}).where((0,c.d3)(f.diagnoses.scriptId,i.map(e=>e.scriptId))));let n=await d.Z.query.pendingDeletion.findMany({where:"screens"===t?(0,c.K0)(f.pendingDeletion.screenId):void 0});n.length&&await d.Z.update(f.screens).set({deletedAt:new Date}).where((0,c.d3)(f.screens.screenId,n.map(e=>e.screenId)));let a=await d.Z.query.pendingDeletion.findMany({where:"diagnoses"===t?(0,c.K0)(f.pendingDeletion.diagnosisId):void 0});return a.length&&await d.Z.update(f.diagnoses).set({deletedAt:new Date}).where((0,c.d3)(f.diagnoses.diagnosisId,a.map(e=>e.diagnosisId))),await l(e),{success:!0}}catch(e){return r.Z.error("_processPendingDeletion ERROR",e.message),{success:!1,errors:[e.message]}}}var y=s(25060),u=s(9501),p=s(91966),K=s(92963),D=s(17137);async function w({data:e,increaseVersion:t,broadcastAction:s}){try{let i=await d.Z.query.editorInfo.findFirst();if(i){let s=t?i.dataVersion+1:i.dataVersion;await d.Z.update(f.editorInfo).set({...e,dataVersion:s}).where((0,c.eq)(f.editorInfo.id,i.id))}return(i=await d.Z.query.editorInfo.findFirst())&&s&&a.Z.emit("data_changed","save_editor_info"),{data:i||null,success:!!i}}catch(e){return r.Z.error("_saveEditorInfo ERROR",e.message),{data:null,success:!1,errors:[e.message]}}}var h=s(18496),I=s(40618);async function m(){let e=[],t=!1;try{let s=await (0,h.y)();s.errors?.forEach(t=>e.push(t));let i=await y.Ur();i.errors?.forEach(t=>e.push(t));let{errors:n,...a}=await y.Yi();return n?.forEach(t=>e.push(t)),t=!!a.total||!!i.total,{pendingDeletion:i.total,drafts:a,errors:e.length?e:void 0,shouldPublishData:t,info:s.data}}catch(s){return r.Z.error("getEditorDetails ERROR",s.message),{errors:[s.message,...e],pendingDeletion:0,drafts:y.Ic,shouldPublishData:t,info:null}}}let Z=(0,i.j)("ac5d4de4d5312ee7fa1967d05ccea3edfbd18033",v);async function v(e,t){return(0,n.revalidatePath)(e,t)}let R=(0,i.j)("294bf0d6332f28a618099d7c02669de60070f8a2",_);async function _(){try{let e=await D.G$(),t=await u.co(),s=await u.ix(),i=await u.tW();return{configKeys:e.data.allDrafts,screens:t.data.allDrafts,scripts:s.data.allDrafts,diagnoses:i.data.allDrafts}}catch(e){return r.Z.error("countAllDrafts ERROR",e.message),{screens:0,scripts:0,configKeys:0,diagnoses:0}}}async function A(){let e={success:!0};try{await (0,o.isAllowed)(["create_config_keys","update_config_keys","create_scripts","update_scripts","create_diagnoses","update_diagnoses","create_screens","update_screens"]);let t=await K.h(),s=await p.Ls(),i=await p.Ry(),n=await p.gv(),r=await g();t.errors&&(e.success=!1,e.errors=[...e.errors||[],...t.errors]),s.errors&&(e.success=!1,e.errors=[...e.errors||[],...s.errors]),i.errors&&(e.success=!1,e.errors=[...e.errors||[],...i.errors]),n.errors&&(e.success=!1,e.errors=[...e.errors||[],...n.errors]),r.errors&&(e.success=!1,e.errors=[...e.errors||[],...r.errors]),await w({increaseVersion:e.success,broadcastAction:!0,data:{lastPublishDate:new Date}}),a.Z.emit("data_changed","publish_data")}catch(t){e.success=!1,e.errors=[t.message],r.Z.error("publishData ERROR",t.message)}finally{return e}}async function b(){let e={success:!0};try{await (0,o.isAllowed)(["delete_config_keys","delete_scripts","delete_diagnoses","delete_screens"]),await K.sj(),await p.VQ(),await p.In(),await p.cF(),await l(),a.Z.emit("data_changed","discard_drafts")}catch(t){e.success=!1,e.errors=[t.message],r.Z.error("publishData ERROR",t.message)}finally{return e}}(0,I.h)([m,Z,R,A,b]),(0,i.j)("354f249d3682e1a7ac814300889c8b929172be69",m),(0,i.j)("afc9c4d3ed7201152607116aa5f72d4579144ffc",Z),(0,i.j)("3af78304ef3b80b391189cdb5be758ed14bb9be7",R),(0,i.j)("112a744ae93bf04aba1a4250d687a325a73a55c1",A),(0,i.j)("2995d4697010486034183adc4a3028bfd106123b",b)},92963:(e,t,s)=>{s.d(t,{sj:()=>l,LR:()=>g,h:()=>p,UZ:()=>f});var i=s(57745),n=s(81445),a=s(9576),r=s(57435),o=s(10413),c=s(43509),d=s(88317);async function f({data:e,broadcastAction:t}){let s={success:!1};try{let t=[];for(let{configKeyId:s,...r}of e)try{let e=s||a.Z();if(!t.length){let t=s?await o.Z.query.configKeysDrafts.findFirst({where:(0,i.eq)(c.configKeysDrafts.configKeyDraftId,e)}):null,a=t||!s?null:await o.Z.query.configKeys.findFirst({where:(0,i.eq)(c.configKeys.configKeyId,e)});if(t){let s={...t.data,...r};await o.Z.update(c.configKeysDrafts).set({data:s,position:s.position}).where((0,i.eq)(c.configKeysDrafts.configKeyDraftId,e))}else{let t=r.position||a?.position;if(!t){let e=await o.Z.query.configKeys.findFirst({columns:{position:!0},orderBy:(0,n.C)(c.configKeys.position)}),s=await o.Z.query.configKeysDrafts.findFirst({columns:{position:!0},orderBy:(0,n.C)(c.configKeysDrafts.position)});t=Math.max(0,e?.position||0,s?.position||0)+1}let s={...a,...r,configKeyId:e,version:a?.version?a.version+1:1,position:t};await o.Z.insert(c.configKeysDrafts).values({data:s,configKeyDraftId:e,position:s.position,configKeyId:a?.configKeyId})}}}catch(e){t.push(e.message)}t.length?s.errors=t:s.success=!0}catch(e){s.success=!1,s.errors=[e.message],r.Z.error("_saveConfigKeys ERROR",e.message)}finally{return!s?.errors?.length&&t&&d.Z.emit("data_changed","save_config_keys"),s}}async function l(){try{return await o.Z.delete(c.configKeysDrafts),!0}catch(e){throw e}}async function g({configKeysIds:e,broadcastAction:t}){let s={success:!1};try{if(e.length){await o.Z.delete(c.configKeysDrafts).where((0,i.d3)(c.configKeysDrafts.configKeyDraftId,e));let t=(await o.Z.select({configKeyId:c.configKeys.configKeyId,pendingDeletion:c.pendingDeletion.configKeyId}).from(c.configKeys).leftJoin(c.pendingDeletion,(0,i.eq)(c.pendingDeletion.configKeyId,c.configKeys.configKeyId)).where((0,i.d3)(c.configKeys.configKeyId,e))).filter(e=>!e.pendingDeletion);t.length&&await o.Z.insert(c.pendingDeletion).values(t)}s.success=!0}catch(e){s.success=!1,s.errors=[e.message],r.Z.error("_deleteConfigKeys ERROR",e.message)}finally{return!s?.errors?.length&&t&&d.Z.emit("data_changed","delete_config_keys"),s}}async function y({previous:e,drafts:t}){try{let s=[];for(let i of t){let t={version:i?.data?.version||1,configKeyId:i?.data?.configKeyId,changes:{}};if(i?.data?.version===1)t.changes={action:"create_config_key",deconfigKeyion:"Create config key",oldValues:[],newValues:[]};else{let s=e.filter(e=>e.configKeyId===i?.data?.configKeyId)[0],n=[],a=[];Object.keys({...i?.data}).filter(e=>!["version","draft"].includes(e)).forEach(e=>{let t=i.data[e],r={...s}[e];JSON.stringify(t)!==JSON.stringify(r)&&(n.push({[e]:r}),a.push({[e]:t}))}),t.changes={action:"update_config_key",description:"Update config key",oldValues:n,newValues:a}}s.push(t)}await o.Z.insert(c.configKeysHistory).values(s)}catch(e){r.Z.error(e.message)}}var u=s(34149);async function p(e){let t={success:!1};try{let e=[],s=[],n=await o.Z.query.configKeysDrafts.findMany();if(e=n.filter(e=>e.configKeyId),s=n.filter(e=>!e.configKeyId),e.length){let t=[];for(let{configKeyId:s,data:n}of(e.filter(e=>e.configKeyId).length&&(t=await o.Z.query.configKeys.findMany({where:(0,i.d3)(c.configKeys.configKeyId,e.filter(e=>e.configKeyId).map(e=>e.configKeyId))})),e)){let{configKeyId:e,id:t,oldConfigKeyId:a,createdAt:r,updatedAt:d,deletedAt:f,...l}=n,g={...l,publishDate:new Date};await o.Z.update(c.configKeys).set(g).where((0,i.eq)(c.configKeys.configKeyId,s)).returning()}await y({drafts:e,previous:t})}if(s.length){let e=[];for(let{id:t,data:n}of(s.filter(e=>e.configKeyId).length&&(e=await o.Z.query.configKeys.findMany({where:(0,i.d3)(c.configKeys.configKeyId,s.filter(e=>e.configKeyId).map(e=>e.configKeyId))})),s)){let e=n.configKeyId||(0,a.Z)(),i={...n,configKeyId:e};s=s.map(s=>(s.id===t&&(s.data.configKeyId=e),s)),await o.Z.insert(c.configKeys).values(i)}await y({drafts:s,previous:e})}await o.Z.delete(c.configKeysDrafts);let r=await o.Z.query.pendingDeletion.findMany({where:(0,i.K0)(c.pendingDeletion.configKeyId),columns:{configKeyId:!0},with:{configKey:{columns:{version:!0}}}});if((r=r.filter(e=>e.configKey)).length){let e=new Date;await o.Z.update(c.configKeys).set({deletedAt:e}).where((0,i.d3)(c.configKeys.configKeyId,r.map(e=>e.configKeyId))),await o.Z.insert(c.configKeysHistory).values(r.map(t=>({version:t.configKey.version,configKeyId:t.configKeyId,changes:{action:"delete_config_key",description:"Delete config key",oldValues:[{deletedAt:null}],newValues:[{deletedAt:e}]}})))}await o.Z.delete(c.pendingDeletion).where((0,i.or)((0,i.K0)(c.pendingDeletion.configKeyId),(0,i.K0)(c.pendingDeletion.configKeyDraftId)));let d=[...e.map(e=>e.configKeyId),...r.map(e=>e.configKeyId)];d.length&&await o.Z.update(c.configKeys).set({version:(0,u.i6)`${c.configKeys.version} + 1`}).where((0,i.d3)(c.configKeys.configKeyId,d)),t.success=!0}catch(e){t.success=!1,t.errors=[e.message],r.Z.error("_publishConfigKeys ERROR",e)}finally{return t}}},17137:(e,t,s)=>{s.d(t,{G$:()=>y,ZV:()=>g,SL:()=>f,aP:()=>d});var i=s(57745),n=s(30900),a=s(9576),r=s(10413),o=s(43509),c=s(57435);async function d(e){try{let{configKeysIds:t,returnDraftsIfExist:s}={...e},c=t||[],d=c?.length?(0,i.d3)(o.configKeysDrafts.configKeyDraftId,c.map(e=>n.Z(e)?e:a.Z())):void 0,f=[...d?[d]:[]],l=s?await r.Z.query.configKeysDrafts.findMany({where:(0,i.xD)(...f)}):[];c=c.filter(e=>!l.map(e=>e.configKeyDraftId).includes(e));let g=l.length?(0,i.Nl)(o.configKeys.configKeyId,l.map(e=>e.configKeyDraftId)):void 0,y=c?.length?(0,i.d3)(o.configKeys.configKeyId,c.filter(e=>n.Z(e))):void 0,u=c?.length?(0,i.d3)(o.configKeys.oldConfigKeyId,c.filter(e=>!n.Z(e))):void 0,p=[(0,i.Ft)(o.configKeys.deletedAt),(0,i.Ft)(o.pendingDeletion),...y&&u?[(0,i.or)(y,u)]:[],g],K=(await r.Z.select({configKey:o.configKeys,pendingDeletion:o.pendingDeletion}).from(o.configKeys).leftJoin(o.pendingDeletion,(0,i.eq)(o.pendingDeletion.configKeyId,o.configKeys.configKeyId)).where(p.length?(0,i.xD)(...p):void 0)).map(e=>e.configKey),D=K.length?await r.Z.query.pendingDeletion.findMany({where:(0,i.d3)(o.pendingDeletion.configKeyId,K.map(e=>e.configKeyId)),columns:{configKeyId:!0}}):[];return{data:[...K.map(e=>({...e,isDraft:!1,isDeleted:!1})),...l.map(e=>({...e.data,isDraft:!0,isDeleted:!1}))].sort((e,t)=>e.position-t.position).filter(e=>!D.map(e=>e.configKeyId).includes(e.configKeyId))}}catch(e){return c.Z.error("_getConfigKeys ERROR",e.message),{data:[],errors:[e.message]}}}async function f(e){let{configKeyId:t,returnDraftIfExists:s}={...e};try{if(!t)throw Error("Missing configKeyId");let e=n.Z(t)?(0,i.eq)(o.configKeys.configKeyId,t):void 0,a=n.Z(t)?void 0:(0,i.eq)(o.configKeys.oldConfigKeyId,t),c=e?(0,i.eq)(o.configKeysDrafts.configKeyDraftId,t):void 0,d=s&&c?await r.Z.query.configKeysDrafts.findFirst({where:e}):void 0,f=d?{...d.data,isDraft:!1,isDeleted:!1}:null;if(f)return{data:f};let l=await r.Z.query.configKeys.findFirst({where:(0,i.xD)((0,i.Ft)(o.configKeys.deletedAt),e||a),with:{draft:!0}});d=s?l?.draft:void 0;let g=d?.data||l;if(!(f=g?{...g,isDraft:!1,isDeleted:!1}:null))return{data:null};return{data:f}}catch(e){return c.Z.error("_getConfigKey ERROR",e.message),{errors:[e.message]}}}var l=s(60938);let g={allPublished:0,publishedWithDrafts:0,allDrafts:0,newDrafts:0,pendingDeletion:0};async function y(){try{let[{count:e}]=await r.Z.select({count:(0,l.QX)()}).from(o.configKeysDrafts),[{count:t}]=await r.Z.select({count:(0,l.QX)()}).from(o.configKeysDrafts).where((0,i.Ft)(o.configKeysDrafts.configKeyId)),[{count:s}]=await r.Z.select({count:(0,l.QX)()}).from(o.configKeysDrafts).where((0,i.K0)(o.configKeysDrafts.configKeyId)),[{count:n}]=await r.Z.select({count:(0,l.QX)()}).from(o.pendingDeletion).where((0,i.K0)(o.pendingDeletion.configKeyId)),[{count:a}]=await r.Z.select({count:(0,l.QX)()}).from(o.configKeys);return{data:{allPublished:a,publishedWithDrafts:s,allDrafts:e,newDrafts:t,pendingDeletion:n}}}catch(e){return c.Z.error("_getConfigKeys ERROR",e.message),{data:g,errors:[e.message]}}}},18496:(e,t,s)=>{s.d(t,{y:()=>a});var i=s(10413),n=s(57435);async function a(){try{return{data:await i.Z.query.editorInfo.findFirst()||null}}catch(e){return n.Z.error("_getEditorInfo ERROR",e.message),{data:null,errors:[e.message]}}}},25060:(e,t,s)=>{s.d(t,{Yi:()=>g,Ur:()=>f,Nb:()=>d,Ic:()=>l});var i=s(60938),n=s(57435),a=s(43509),r=s(10413),o=s(81445);let c={configKeys:null,diagnoses:null,screens:null,scripts:null,configKeysDrafts:null,diagnosesDrafts:null,screensDrafts:null,scriptsDrafts:null,pendingDeletion:null,lastPublished:null,latestChangesDate:null};async function d(){try{let{lastPublishDate:e}={...await r.Z.query.editorInfo.findFirst()},t=await r.Z.select({configKeysDrafts:a.configKeysDrafts.updatedAt}).from(a.configKeysDrafts).orderBy((0,o.C)(a.configKeysDrafts.updatedAt)).limit(1),s=await r.Z.select({diagnosesDrafts:a.diagnosesDrafts.updatedAt}).from(a.diagnosesDrafts).orderBy((0,o.C)(a.diagnosesDrafts.updatedAt)).limit(1),i=await r.Z.select({screensDrafts:a.screensDrafts.updatedAt}).from(a.screensDrafts).orderBy((0,o.C)(a.screensDrafts.updatedAt)).limit(1),n=await r.Z.select({scriptsDrafts:a.scriptsDrafts.updatedAt}).from(a.scriptsDrafts).orderBy((0,o.C)(a.scriptsDrafts.updatedAt)).limit(1),d=await r.Z.select({configKeys:a.configKeys.updatedAt}).from(a.configKeys).orderBy((0,o.C)(a.configKeys.updatedAt)).limit(1),f=await r.Z.select({diagnoses:a.diagnoses.updatedAt}).from(a.diagnoses).orderBy((0,o.C)(a.diagnoses.updatedAt)).limit(1),l=await r.Z.select({screens:a.screens.updatedAt}).from(a.screens).orderBy((0,o.C)(a.screens.updatedAt)).limit(1),g=await r.Z.select({scripts:a.scripts.updatedAt}).from(a.scripts).orderBy((0,o.C)(a.scripts.updatedAt)).limit(1),y=await r.Z.select({pendingDeletion:a.pendingDeletion.createdAt}).from(a.pendingDeletion).orderBy((0,o.C)(a.pendingDeletion.createdAt)).limit(1),u={...c,...t[0],...s[0],...i[0],...n[0],...d[0],...f[0],...l[0],...g[0],...y[0],lastPublished:e||null},p=[e?new Date(e).getTime():null,...Object.values(u).filter(e=>e).map(e=>new Date(e).getTime())].filter(e=>e),K=e;return p.length&&(K=new Date(Math.max(...p))),{data:{...u,latestChangesDate:K}}}catch(e){return n.Z.error("_getDatesWhenUpdatesWereMade ERROR",e.message),{data:c,errors:[e.message]}}}async function f(){try{let e=await r.Z.select({count:(0,i.QX)()}).from(a.pendingDeletion);return{total:e[0]?.count||0}}catch(e){return n.Z.error("_countPendingDeletion ERROR",e.message),{total:0,errors:[e.message]}}}let l={scripts:0,screens:0,diagnoses:0,configKeys:0,total:0};async function g(){let e={...l};try{let t=await r.Z.select({count:(0,i.QX)()}).from(a.scriptsDrafts);e.scripts=t[0]?.count||0;let s=await r.Z.select({count:(0,i.QX)()}).from(a.screensDrafts);e.screens=s[0]?.count||0;let n=await r.Z.select({count:(0,i.QX)()}).from(a.diagnosesDrafts);e.diagnoses=n[0]?.count||0;let o=await r.Z.select({count:(0,i.QX)()}).from(a.configKeysDrafts);return e.configKeys=o[0]?.count||0,e.total=e.configKeys+e.diagnoses+e.screens+e.scripts,{...e}}catch(t){return n.Z.error("_countDrafts ERROR",t.message),{...e,errors:[t.message]}}}}};