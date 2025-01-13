"use strict";exports.id=1966,exports.ids=[1966],exports.modules={91966:(e,s,t)=>{t.d(s,{cF:()=>g,In:()=>p,VQ:()=>u,Bx:()=>I,GH:()=>f,Es:()=>h,gv:()=>m,Ry:()=>Z,Ls:()=>q,Pk:()=>R,uD:()=>_,Or:()=>l});var i=t(57745),r=t(81445),a=t(9576),n=t(57435),d=t(10413),c=t(43509),o=t(88317);async function l({data:e,broadcastAction:s}){let t={success:!1},l=[],p={};try{for(let{scriptId:s,...t}of e)try{let e=s||a.Z();if(!l.length){let a=s?await d.Z.query.scriptsDrafts.findFirst({where:(0,i.eq)(c.scriptsDrafts.scriptDraftId,e)}):null,n=a||!s?null:await d.Z.query.scripts.findFirst({where:(0,i.eq)(c.scripts.scriptId,e)});if(a){let s={...a.data,...t},r=d.Z.update(c.scriptsDrafts).set({data:s,position:s.position,hospitalId:s.hospitalId}).where((0,i.eq)(c.scriptsDrafts.scriptDraftId,e));p.query=r.toSQL(),await r.execute()}else{let s=t.position||n?.position;if(!s){let e=await d.Z.query.scripts.findFirst({columns:{position:!0},orderBy:(0,r.C)(c.scripts.position)}),t=await d.Z.query.scriptsDrafts.findFirst({columns:{position:!0},orderBy:(0,r.C)(c.scriptsDrafts.position)});s=Math.max(0,e?.position||0,t?.position||0)+1}let i={...n,...t,scriptId:e,version:n?.version?n.version+1:1,position:s},a=d.Z.insert(c.scriptsDrafts).values({data:i,scriptDraftId:e,position:i.position,hospitalId:i.hospitalId,scriptId:n?.scriptId});p.query=a.toSQL(),await a.execute()}}}catch(e){l.push(e.message)}l.length?(t.errors=l,t.info=p):t.success=!0}catch(e){t.success=!1,t.errors=[e.message],t.info=p,n.Z.error("_saveScripts ERROR",e.message)}finally{return!t?.errors?.length&&s&&o.Z.emit("data_changed","save_scripts"),t}}async function p(){try{return await d.Z.delete(c.screensDrafts),!0}catch(e){throw e}}async function f({screensIds:e=[],scriptsIds:s=[],confirmDeleteAll:t,broadcastAction:r}){let a={success:!1};try{if(!s.length&&!e.length&&!t)throw Error("You&apos;re about to delete all the screens, please confirm this action!");await d.Z.delete(c.screensDrafts).where((0,i.xD)(e.length?(0,i.d3)(c.screensDrafts.screenDraftId,e):void 0,s.length?(0,i.or)((0,i.d3)(c.screensDrafts.scriptId,s),(0,i.d3)(c.screensDrafts.scriptDraftId,s)):void 0));let r=await d.Z.select({screenId:c.screens.screenId,screenScriptId:c.screens.scriptId,scriptDraftId:c.scriptsDrafts.scriptDraftId,pendingDeletion:c.pendingDeletion}).from(c.screens).leftJoin(c.pendingDeletion,(0,i.eq)(c.pendingDeletion.screenId,c.screens.screenId)).leftJoin(c.scriptsDrafts,(0,i.eq)(c.scriptsDrafts.scriptId,c.screens.scriptId)).where((0,i.xD)((0,i.Ft)(c.screens.deletedAt),(0,i.Ft)(c.pendingDeletion),e.length?(0,i.d3)(c.screens.screenId,e):void 0,s.length?(0,i.d3)(c.screens.scriptId,s):void 0));r.length&&await d.Z.insert(c.pendingDeletion).values(r),a.success=!0}catch(e){a.success=!1,a.errors=[e.message],n.Z.error("_deleteScreens ERROR",e.message)}finally{return!a?.errors?.length&&r&&o.Z.emit("data_changed","delete_screens"),a}}async function g(){try{return await d.Z.delete(c.diagnosesDrafts),!0}catch(e){throw e}}async function I({diagnosesIds:e=[],scriptsIds:s=[],confirmDeleteAll:t,broadcastAction:r}){let a={success:!1};try{if(!s.length&&!e.length&&!t)throw Error("You&apos;re about to delete all the diagnoses, please confirm this action!");await d.Z.delete(c.diagnosesDrafts).where((0,i.xD)(e.length?(0,i.d3)(c.diagnosesDrafts.diagnosisDraftId,e):void 0,s.length?(0,i.or)((0,i.d3)(c.diagnosesDrafts.scriptId,s),(0,i.d3)(c.diagnosesDrafts.scriptDraftId,s)):void 0));let r=await d.Z.select({diagnosisId:c.diagnoses.diagnosisId,diagnosisScriptId:c.diagnoses.scriptId,scriptDraftId:c.scriptsDrafts.scriptDraftId,pendingDeletion:c.pendingDeletion}).from(c.diagnoses).leftJoin(c.pendingDeletion,(0,i.eq)(c.pendingDeletion.diagnosisId,c.diagnoses.diagnosisId)).leftJoin(c.scriptsDrafts,(0,i.eq)(c.scriptsDrafts.scriptId,c.diagnoses.scriptId)).where((0,i.xD)((0,i.Ft)(c.diagnoses.deletedAt),(0,i.Ft)(c.pendingDeletion),e.length?(0,i.d3)(c.diagnoses.diagnosisId,e):void 0,s.length?(0,i.d3)(c.diagnoses.scriptId,s):void 0));r.length&&await d.Z.insert(c.pendingDeletion).values(r),a.success=!0}catch(e){a.success=!1,a.errors=[e.message],n.Z.error("_deleteDiagnoses ERROR",e.message)}finally{return!a?.errors?.length&&r&&o.Z.emit("data_changed","delete_diagnoses"),a}}async function u(){try{return await d.Z.delete(c.scriptsDrafts),!0}catch(e){throw e}}async function h({scriptsIds:e=[],broadcastAction:s,confirmDeleteAll:t}){let r={success:!1};try{if(!e.length&&!t)throw Error("You&apos;re about to delete all the scripts, please confirm this action!");await d.Z.delete(c.scriptsDrafts).where((0,i.or)((0,i.d3)(c.scriptsDrafts.scriptId,e),(0,i.d3)(c.scriptsDrafts.scriptDraftId,e)));let s=await d.Z.select({scriptId:c.scripts.scriptId,pendingDeletion:c.pendingDeletion}).from(c.scripts).leftJoin(c.pendingDeletion,(0,i.eq)(c.pendingDeletion.scriptId,c.scripts.scriptId)).where((0,i.xD)((0,i.Ft)(c.scripts.deletedAt),(0,i.Ft)(c.pendingDeletion),e.length?(0,i.d3)(c.scripts.scriptId,e):void 0));s.length&&(await d.Z.insert(c.pendingDeletion).values(s.map(e=>({scriptId:e.scriptId}))),await f({scriptsIds:s.map(e=>e.scriptId)}),await I({scriptsIds:s.map(e=>e.scriptId)})),r.success=!0}catch(e){r.success=!1,r.errors=[e.message],n.Z.error("_deleteScripts ERROR",e.message)}finally{return!r?.errors?.length&&s&&o.Z.emit("data_changed","delete_scripts"),r}}var D=t(34149);async function w({previous:e,drafts:s}){try{let t=[];for(let i of s){let s={version:i?.data?.version||1,scriptId:i?.data?.scriptId,changes:{}};if(i?.data?.version===1)s.changes={action:"create_script",description:"Create script",oldValues:[],newValues:[]};else{let t=e.filter(e=>e.scriptId===i?.data?.scriptId)[0],r=[],a=[];Object.keys({...i?.data}).filter(e=>!["version","draft"].includes(e)).forEach(e=>{let s=i.data[e],n={...t}[e];JSON.stringify(s)!==JSON.stringify(n)&&(r.push({[e]:n}),a.push({[e]:s}))}),s.changes={action:"update_script",description:"Update script",oldValues:r,newValues:a}}t.push(s)}await d.Z.insert(c.scriptsHistory).values(t)}catch(e){n.Z.error(e.message)}}async function y({previous:e,drafts:s}){try{let t=[];for(let i of s){let s={version:i?.data?.version||1,screenId:i?.data?.screenId,scriptId:i?.data?.scriptId,changes:{}};if(i?.data?.version===1)s.changes={action:"create_screen",description:"Create screen",oldValues:[],newValues:[]};else{let t=e.filter(e=>e.screenId===i?.data?.screenId)[0],r=[],a=[];Object.keys({...i?.data}).filter(e=>!["version","draft"].includes(e)).forEach(e=>{let s=i.data[e],n={...t}[e];JSON.stringify(s)!==JSON.stringify(n)&&(r.push({[e]:n}),a.push({[e]:s}))}),s.changes={action:"update_screen",description:"Update screen",oldValues:r,newValues:a}}t.push(s)}await d.Z.insert(c.screensHistory).values(t)}catch(e){n.Z.error(e.message)}}async function Z(e){let{scriptsIds:s,screensIds:t}={...e},r={success:!1};try{let e=[],n=[];if(s?.length||t?.length){let r=await d.Z.query.screensDrafts.findMany({where:(0,i.or)(s?.length?(0,i.d3)(c.screensDrafts.scriptId,s):void 0,s?.length?(0,i.d3)(c.screensDrafts.scriptDraftId,s):void 0,t?.length?(0,i.d3)(c.screensDrafts.screenId,t):void 0,t?.length?(0,i.d3)(c.screensDrafts.screenDraftId,t):void 0)});e=r.filter(e=>e.screenId),n=r.filter(e=>!e.screenId)}else{let s=await d.Z.query.screensDrafts.findMany({where:(0,i.K0)(c.screensDrafts.scriptId)});e=s.filter(e=>e.screenId),n=s.filter(e=>!e.screenId)}if(e.length){let s=[];for(let{screenId:t,data:r}of(e.filter(e=>e.screenId).length&&(s=await d.Z.query.screens.findMany({where:(0,i.d3)(c.screens.screenId,e.filter(e=>e.screenId).map(e=>e.screenId))})),e)){let{screenId:e,id:s,oldScreenId:a,createdAt:n,updatedAt:o,deletedAt:l,...p}=r,f={...p,publishDate:new Date};await d.Z.update(c.screens).set(f).where((0,i.eq)(c.screens.screenId,t)).returning()}await y({drafts:e,previous:s})}if(n.length){let e=[];for(let{id:s,scriptId:t,scriptDraftId:r,data:o}of(n.filter(e=>e.screenId).length&&(e=await d.Z.query.screens.findMany({where:(0,i.d3)(c.screens.screenId,n.filter(e=>e.screenId).map(e=>e.screenId))})),n)){let e=o.screenId||(0,a.Z)(),i=o.scriptId||t||r,l={...o,screenId:e,scriptId:i};n=n.map(t=>(t.id===s&&(t.data.screenId=e),t)),await d.Z.insert(c.screens).values(l)}await y({drafts:n,previous:e})}await d.Z.delete(c.screensDrafts);let o=await d.Z.query.pendingDeletion.findMany({where:(0,i.K0)(c.pendingDeletion.screenId),columns:{screenId:!0},with:{screen:{columns:{version:!0,scriptId:!0}}}});if((o=o.filter(e=>e.screen)).length){let e=new Date;await d.Z.update(c.screens).set({deletedAt:e}).where((0,i.d3)(c.screens.screenId,o.map(e=>e.screenId))),await d.Z.insert(c.screensHistory).values(o.map(s=>({version:s.screen.version,screenId:s.screenId,scriptId:s.screen.scriptId,changes:{action:"delete_screen",description:"Delete screen",oldValues:[{deletedAt:null}],newValues:[{deletedAt:e}]}})))}await d.Z.delete(c.pendingDeletion).where((0,i.or)((0,i.K0)(c.pendingDeletion.screenId),(0,i.K0)(c.pendingDeletion.screenDraftId)));let l=[...e.map(e=>e.screenId),...o.map(e=>e.screenId)];l.length&&await d.Z.update(c.screens).set({version:(0,D.i6)`${c.screens.version} + 1`}).where((0,i.d3)(c.screens.screenId,l)),r.success=!0}catch(e){r.success=!1,r.errors=[e.message],n.Z.error("_publishScreens ERROR",e)}finally{return r}}async function v({previous:e,drafts:s}){try{let t=[];for(let i of s){let s={version:i?.data?.version||1,diagnosisId:i?.data?.diagnosisId,scriptId:i?.data?.scriptId,changes:{}};if(i?.data?.version===1)s.changes={action:"create_diagnosis",description:"Create diagnosis",oldValues:[],newValues:[]};else{let t=e.filter(e=>e.diagnosisId===i?.data?.diagnosisId)[0],r=[],a=[];Object.keys({...i?.data}).filter(e=>!["version","draft"].includes(e)).forEach(e=>{let s=i.data[e],n={...t}[e];JSON.stringify(s)!==JSON.stringify(n)&&(r.push({[e]:n}),a.push({[e]:s}))}),s.changes={action:"update_diagnosis",description:"Update diagnosis",oldValues:r,newValues:a}}t.push(s)}await d.Z.insert(c.diagnosesHistory).values(t)}catch(e){n.Z.error(e.message)}}async function m(e){let{scriptsIds:s,diagnosesIds:t}={...e},r={success:!1};try{let e=[],n=[];if(s?.length||t?.length){let r=await d.Z.query.diagnosesDrafts.findMany({where:(0,i.or)(s?.length?(0,i.d3)(c.diagnosesDrafts.scriptId,s):void 0,s?.length?(0,i.d3)(c.diagnosesDrafts.scriptDraftId,s):void 0,t?.length?(0,i.d3)(c.diagnosesDrafts.diagnosisId,t):void 0,t?.length?(0,i.d3)(c.diagnosesDrafts.diagnosisDraftId,t):void 0)});e=r.filter(e=>e.diagnosisId),n=r.filter(e=>!e.diagnosisId)}else{let s=await d.Z.query.diagnosesDrafts.findMany({where:(0,i.K0)(c.diagnosesDrafts.scriptId)});e=s.filter(e=>e.diagnosisId),n=s.filter(e=>!e.diagnosisId)}if(e.length){let s=[];for(let{diagnosisId:t,data:r}of(e.filter(e=>e.diagnosisId).length&&(s=await d.Z.query.diagnoses.findMany({where:(0,i.d3)(c.diagnoses.diagnosisId,e.filter(e=>e.diagnosisId).map(e=>e.diagnosisId))})),e)){let{diagnosisId:e,id:s,oldDiagnosisId:a,createdAt:n,updatedAt:o,deletedAt:l,...p}=r,f={...p,publishDate:new Date};await d.Z.update(c.diagnoses).set(f).where((0,i.eq)(c.diagnoses.diagnosisId,t)).returning()}await v({drafts:e,previous:s})}if(n.length){let e=[];for(let{id:s,scriptId:t,scriptDraftId:r,data:o}of(n.filter(e=>e.diagnosisId).length&&(e=await d.Z.query.diagnoses.findMany({where:(0,i.d3)(c.diagnoses.diagnosisId,n.filter(e=>e.diagnosisId).map(e=>e.diagnosisId))})),n)){let e=o.diagnosisId||(0,a.Z)(),i=o.scriptId||t||r,l={...o,diagnosisId:e,scriptId:i};n=n.map(t=>(t.id===s&&(t.data.diagnosisId=e),t)),await d.Z.insert(c.diagnoses).values(l)}await v({drafts:n,previous:e})}await d.Z.delete(c.diagnosesDrafts);let o=await d.Z.query.pendingDeletion.findMany({where:(0,i.K0)(c.pendingDeletion.diagnosisId),columns:{diagnosisId:!0},with:{diagnosis:{columns:{version:!0,scriptId:!0}}}});if((o=o.filter(e=>e.diagnosis)).length){let e=new Date;await d.Z.update(c.diagnoses).set({deletedAt:e}).where((0,i.d3)(c.diagnoses.diagnosisId,o.map(e=>e.diagnosisId))),await d.Z.insert(c.diagnosesHistory).values(o.map(s=>({version:s.diagnosis.version,diagnosisId:s.diagnosisId,scriptId:s.diagnosis.scriptId,changes:{action:"delete_diagnosis",description:"Delete diagnosis",oldValues:[{deletedAt:null}],newValues:[{deletedAt:e}]}})))}await d.Z.delete(c.pendingDeletion).where((0,i.or)((0,i.K0)(c.pendingDeletion.diagnosisId),(0,i.K0)(c.pendingDeletion.diagnosisDraftId)));let l=[...e.map(e=>e.diagnosisId),...o.map(e=>e.diagnosisId)];l.length&&await d.Z.update(c.diagnoses).set({version:(0,D.i6)`${c.diagnoses.version} + 1`}).where((0,i.d3)(c.diagnoses.diagnosisId,l)),r.success=!0}catch(e){r.success=!1,r.errors=[e.message],n.Z.error("_publishDiagnoses ERROR",e)}finally{return r}}async function q(){let e={success:!1};try{let s=await d.Z.query.scriptsDrafts.findMany(),t=s.filter(e=>!e.scriptId).map(e=>({...e,scriptId:e.data.scriptId||(0,a.Z)(),data:{...e.data,scriptId:e.data.scriptId||(0,a.Z)()}})),r=s.filter(e=>e.scriptId);[...t.map(e=>e.scriptId),...r.map(e=>e.scriptId)];let n=[];if(r.length){let e=[];for(let{scriptId:s,data:t}of(r.filter(e=>e.scriptId).length&&(e=await d.Z.query.scripts.findMany({where:(0,i.d3)(c.scripts.scriptId,r.filter(e=>e.scriptId).map(e=>e.scriptId))})),r)){let{scriptId:e,id:r,oldScriptId:a,createdAt:o,updatedAt:l,deletedAt:p,...f}=t,g={...f,publishDate:new Date};await d.Z.update(c.scripts).set(g).where((0,i.eq)(c.scripts.scriptId,s)),n.push({scriptId:s})}await w({drafts:r,previous:e})}if(t.length){t.filter(e=>e.scriptId).length&&await d.Z.query.scripts.findMany({where:(0,i.d3)(c.scripts.scriptId,t.filter(e=>e.scriptId).map(e=>e.scriptId))});let e=t.map(e=>({...e.data,scriptId:e.scriptDraftId}));for(let{scriptId:s}of(await d.Z.insert(c.scripts).values(e),e))n.push({scriptId:s}),await d.Z.update(c.screensDrafts).set({scriptId:s}).where((0,i.or)((0,i.eq)(c.screensDrafts.scriptId,s),(0,i.eq)(c.screensDrafts.scriptDraftId,s))),await d.Z.update(c.diagnosesDrafts).set({scriptId:s}).where((0,i.or)((0,i.eq)(c.diagnosesDrafts.scriptId,s),(0,i.eq)(c.diagnosesDrafts.scriptDraftId,s)))}if(n.length){let e=await Z({scriptsIds:n.map(e=>e.scriptId)});if(e.errors)throw Error(e.errors.join(", "));let s=await m({scriptsIds:n.map(e=>e.scriptId)});if(s.errors)throw Error(s.errors.join(", "))}let o=await d.Z.query.pendingDeletion.findMany({where:(0,i.K0)(c.pendingDeletion.scriptId),columns:{scriptId:!0},with:{script:{columns:{version:!0}}}});if(await d.Z.delete(c.scriptsDrafts),(o=o.filter(e=>e.script)).length){let e=new Date;await d.Z.update(c.scripts).set({deletedAt:e}).where((0,i.d3)(c.scripts.scriptId,o.map(e=>e.scriptId))),await d.Z.insert(c.scriptsHistory).values(o.map(s=>({version:s.script.version,scriptId:s.scriptId,changes:{action:"delete_config_key",description:"Delete config key",oldValues:[{deletedAt:null}],newValues:[{deletedAt:e}]}})))}await d.Z.delete(c.pendingDeletion).where((0,i.or)((0,i.K0)(c.pendingDeletion.scriptId),(0,i.K0)(c.pendingDeletion.scriptDraftId)));let l=[...r.map(e=>e.scriptId),...o.map(e=>e.scriptId)];l.length&&await d.Z.update(c.scripts).set({version:(0,D.i6)`${c.scripts.version} + 1`}).where((0,i.d3)(c.scripts.scriptId,l)),e.success=!0}catch(s){e.success=!1,e.errors=[s.message],n.Z.error("_publishScripts ERROR",s.message)}finally{return e}}async function _({data:e,broadcastAction:s}){let t={success:!1},l=[],p={};try{let s=0;for(let{screenId:t,...n}of e)try{s++;let e=t||a.Z();if(!l.length){let a=t?await d.Z.query.screensDrafts.findFirst({where:(0,i.eq)(c.screensDrafts.screenDraftId,e)}):null,o=a||!t?null:await d.Z.query.screens.findFirst({where:(0,i.eq)(c.screens.screenId,e)});if(a){let s={...a.data,...n},t=d.Z.update(c.screensDrafts).set({data:s,position:s.position}).where((0,i.eq)(c.screensDrafts.screenDraftId,e));p.query=t.toSQL(),await t.execute()}else{let t=n.position||o?.position;if(!t){let e=await d.Z.query.screens.findFirst({columns:{position:!0},orderBy:(0,r.C)(c.screens.position)}),s=await d.Z.query.screensDrafts.findFirst({columns:{position:!0},orderBy:(0,r.C)(c.screensDrafts.position)});t=Math.max(0,e?.position||0,s?.position||0)+1}let a={...o,...n,screenId:e,version:o?.version?o.version+1:1,position:t};if(a.scriptId){let t=await d.Z.query.scriptsDrafts.findFirst({where:(0,i.eq)(c.scriptsDrafts.scriptDraftId,a.scriptId),columns:{scriptDraftId:!0}}),r=await d.Z.query.scripts.findFirst({where:(0,i.eq)(c.scripts.scriptId,a.scriptId),columns:{scriptId:!0}});if(t||r){let s=d.Z.insert(c.screensDrafts).values({data:a,type:a.type,scriptId:r?.scriptId,scriptDraftId:t?.scriptDraftId,screenDraftId:e,position:a.position,screenId:o?.screenId});p.query=s.toSQL(),await s.execute()}else l.push(`Could not save screen ${s}: ${a.title}, because script was not found`)}else l.push(`Could not save screen ${s}: ${a.title}, because scriptId was not specified`)}}}catch(e){l.push(e.message)}l.length?(t.errors=l,t.info=p):t.success=!0}catch(e){t.success=!1,t.errors=[e.message],t.info=p,n.Z.error("_saveScreens ERROR",e.message)}finally{return!t?.errors?.length&&s&&o.Z.emit("data_changed","save_screens"),t}}async function R({data:e,broadcastAction:s}){let t={success:!1},l=[],p={};try{let s=0;for(let{diagnosisId:t,...o}of e)try{s++;let e=t||a.Z();if(!l.length){let a=d.Z.query.diagnosesDrafts.findFirst({where:(0,i.eq)(c.diagnosesDrafts.diagnosisDraftId,e)});p[`${e} - getDiagnosisDraftQuery`]=a.toSQL();let n=t?await a.execute():null,f=d.Z.query.diagnoses.findFirst({where:(0,i.eq)(c.diagnoses.diagnosisId,e)});p[`${e} - getPublishedDiagnosisQuery`]=f.toSQL();let g=n||!t?null:await f.execute();if(n){let s={...n.data,...o},t=d.Z.update(c.diagnosesDrafts).set({data:s,position:s.position}).where((0,i.eq)(c.diagnosesDrafts.diagnosisDraftId,e));p[`${e} - updateDiagnosisDraft`]=t.toSQL(),await t.execute()}else{let t=o.position||g?.position;if(!t){let e=await d.Z.query.diagnoses.findFirst({columns:{position:!0},orderBy:(0,r.C)(c.diagnoses.position)}),s=await d.Z.query.diagnosesDrafts.findFirst({columns:{position:!0},orderBy:(0,r.C)(c.diagnosesDrafts.position)});t=Math.max(0,e?.position||0,s?.position||0)+1}let a={...g,...o,diagnosisId:e,version:g?.version?g.version+1:1,position:t};if(a.scriptId){let t=await d.Z.query.scriptsDrafts.findFirst({where:(0,i.eq)(c.scriptsDrafts.scriptDraftId,a.scriptId),columns:{scriptDraftId:!0}}),r=await d.Z.query.scripts.findFirst({where:(0,i.eq)(c.scripts.scriptId,a.scriptId),columns:{scriptId:!0}});if(t||r){let s=d.Z.insert(c.diagnosesDrafts).values({data:a,scriptId:r?.scriptId,scriptDraftId:t?.scriptDraftId,diagnosisDraftId:e,position:a.position,diagnosisId:g?.diagnosisId});p[`${e} - createDiagnosisDraft`]=s.toSQL(),await s.execute()}else l.push(`Could not save diagnosis ${s}: ${a.name}, because script was not found`)}else l.push(`Could not save diagnosis ${s}: ${a.name}, because scriptId was not specified`)}}}catch(e){l.push(e.message),n.Z.error("saveDiagnosis SQL (FAILED)",JSON.stringify(p))}l.length?t.errors=l:t.success=!0}catch(e){t.success=!1,t.errors=[e.message],n.Z.error("_saveDiagnoses ERROR",e.message)}finally{return!t?.errors?.length&&s&&o.Z.emit("data_changed","save_diagnoses"),t}}}};