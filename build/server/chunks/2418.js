"use strict";exports.id=2418,exports.ids=[2418],exports.modules={22418:(e,s,t)=>{t.d(s,{U5:()=>h,Ms:()=>D,Nq:()=>m,hA:()=>b,E8:()=>g,$s:()=>w,cj:()=>y});var r=t(60938),i=t(57745),a=t(81445),n=t(9576),d=t(57435),o=t(10413),c=t(88182),l=t(88317),p=t(30834),f=t(10970),u=t(17065);async function g({keys:e}){try{let s=await (0,u.uK)({types:["drugs","fluids","feeds"],returnDraftsIfExist:!0}),t=[];return s.data.forEach(s=>{let r=s.drugs.filter(s=>!e.includes(s.key)),i=s.fluids.filter(s=>!e.includes(s.key)),a=s.feeds.filter(s=>!e.includes(s.key));r.length!==s.drugs.length&&t.push({...s,drugs:r}),i.length!==s.fluids.length&&t.push({...s,fluids:i}),a.length!==s.feeds.length&&t.push({...s,feeds:a})}),t.length&&await (0,f.uD)({data:t}),{data:{success:!0}}}catch(e){return{errors:[e.message],data:{success:!1}}}}let I=async(e,s=1,t="")=>{let[{count:a}]=await o.Z.select({count:(0,r.QX)()}).from(c.drugsLibraryDrafts).where((0,i.eq)(c.drugsLibraryDrafts.key,e)),[{count:n}]=await o.Z.select({count:(0,r.QX)()}).from(c.drugsLibrary).where((0,i.eq)(c.drugsLibrary.key,e));return n||a?await I(`${t||e}-${s+1}`,s+1,t||e):e};async function h({data:e,...s}){try{let{data:t}=await (0,p.fP)({itemsIds:e.map(e=>e.itemId)}),r=[];for(let e of t){let s=await I(e.key);r.push({...e,key:s,itemId:n.Z(),position:void 0,createdAt:void 0,updatedAt:void 0,deletedAt:void 0,publishDate:void 0,id:void 0})}return await w({data:r,...s})}catch(e){return d.Z.error("_copyDrugsLibraryItems ERROR",e.message),{success:!1,errors:[e.message]}}}async function y({data:e,broadcastAction:s}){try{let t=e.map(e=>e.key).filter(e=>e);if(t.length){let r=await (0,p.fP)({keys:t});if((e=e.filter(e=>!r.data.map(e=>e.key).includes(e.key))).length)return await w({data:e,broadcastAction:s})}return{success:!0}}catch(e){return d.Z.error("_saveDrugsLibraryItemsIfKeysNotExist ERROR",e.message),{errors:[e.message],success:!1}}}async function w({data:e,broadcastAction:s}){let t={success:!1};try{let s=[],r=[],d=[];for(let{itemId:t,...l}of e)try{let e=t||n.Z(),p="",f=l.key||"",u=null,g=l.type||null;if(!s.length){let s=t?await o.Z.query.drugsLibraryDrafts.findFirst({where:(0,i.eq)(c.drugsLibraryDrafts.itemDraftId,e)}):null,n=s||!t?null:await o.Z.query.drugsLibrary.findFirst({where:(0,i.eq)(c.drugsLibrary.itemId,e)});if(s){p=s.data.key,u=s.data.type||null;let t={...s.data,...l};await o.Z.update(c.drugsLibraryDrafts).set({data:t,position:t.position}).where((0,i.eq)(c.drugsLibraryDrafts.itemDraftId,e))}else{p=n?.key||"",u=n?.type||null;let s=l.position||n?.position;if(!s){let e=await o.Z.query.drugsLibrary.findFirst({columns:{position:!0},orderBy:(0,a.C)(c.drugsLibrary.position)}),t=await o.Z.query.drugsLibraryDrafts.findFirst({columns:{position:!0},orderBy:(0,a.C)(c.drugsLibraryDrafts.position)});s=Math.max(0,e?.position||0,t?.position||0)+1}let t={...n,...l,itemId:e,version:n?.version?n.version+1:1,position:s};await o.Z.insert(c.drugsLibraryDrafts).values({data:t,itemDraftId:e,position:t.position,itemId:n?.itemId,key:t.key,type:t.type})}p&&f&&p!==f&&r.push({old:p,new:f}),u&&g&&u!==g&&p&&d.push(p)}}catch(e){s.push(e.message)}if(d.length&&await g({keys:d}),r.length){let e=await (0,u.uK)({types:["drugs","fluids","feeds"],returnDraftsIfExist:!0}),s=[];e.data.forEach(e=>{let t=!1,i=e.drugs.map(e=>{if(r.map(e=>e.old).includes(e.key)){let s=r.filter(s=>s.old===e.key).map(e=>e.new)[0];e={...e,key:s},t=!0}return e}),a=e.fluids.map(e=>{if(r.map(e=>e.old).includes(e.key)){let s=r.filter(s=>s.old===e.key).map(e=>e.new)[0];e={...e,key:s},t=!0}return e}),n=e.feeds.map(e=>{if(r.map(e=>e.old).includes(e.key)){let s=r.filter(s=>s.old===e.key).map(e=>e.new)[0];e={...e,key:s},t=!0}return e});t&&s.push({...e,drugs:i,fluids:a,feeds:n})}),s.length&&await (0,f.uD)({data:s})}s.length?t.errors=s:t.success=!0}catch(e){t.success=!1,t.errors=[e.message],d.Z.error("_saveDrugsLibraryItems ERROR",e.message)}finally{return!t?.errors?.length&&s&&l.Z.emit("data_changed","save_drugs_library_items"),t}}async function D(){try{return await o.Z.delete(c.drugsLibraryDrafts),!0}catch(e){throw e}}async function m({itemsIds:e,broadcastAction:s}){let t={success:!1};try{let s=e||[];if(s.length){let e=await (0,p.fP)({itemsIds:s,returnDraftsIfExist:!0});await o.Z.delete(c.drugsLibraryDrafts).where((0,i.d3)(c.drugsLibraryDrafts.itemDraftId,s));let t=e.data.filter(e=>!e.isDraft).map(e=>({drugsLibraryItemId:e.itemId}));t.length&&await o.Z.insert(c.pendingDeletion).values(t),await g({keys:e.data.map(e=>e.key)})}t.success=!0}catch(e){t.success=!1,t.errors=[e.message],d.Z.error("_deleteDrugsLibraryItems ERROR",e.message)}finally{return!t?.errors?.length&&s&&l.Z.emit("data_changed","delete_drugs_library_items"),t}}async function Z({previous:e,drafts:s}){try{let t=[];for(let r of s){let s={version:r?.data?.version||1,itemId:r?.data?.itemId,changes:{}};if(r?.data?.version===1)s.changes={action:"create_drugs_library_item",dedrugsLibraryItemion:"Create drugs library item",oldValues:[],newValues:[]};else{let t=e.filter(e=>e.itemId===r?.data?.itemId)[0],i=[],a=[];Object.keys({...r?.data}).filter(e=>!["version","draft"].includes(e)).forEach(e=>{let s=r.data[e],n={...t}[e];JSON.stringify(s)!==JSON.stringify(n)&&(i.push({[e]:n}),a.push({[e]:s}))}),s.changes={action:"update_drugs_library_item",description:"Update drugs library item",oldValues:i,newValues:a}}t.push(s)}await o.Z.insert(c.drugsLibraryHistory).values(t)}catch(e){d.Z.error(e.message)}}var v=t(34149);async function b(e){let s={success:!1};try{let e=[],t=[],r=await o.Z.query.drugsLibraryDrafts.findMany();if(e=r.filter(e=>e.itemId),t=r.filter(e=>!e.itemId),e.length){let s=[];for(let{itemId:t,data:r}of(e.filter(e=>e.itemId).length&&(s=await o.Z.query.drugsLibrary.findMany({where:(0,i.d3)(c.drugsLibrary.itemId,e.filter(e=>e.itemId).map(e=>e.itemId))})),e)){let{itemId:e,id:s,createdAt:a,updatedAt:n,deletedAt:d,...l}=r,p={...l,publishDate:new Date};await o.Z.update(c.drugsLibrary).set(p).where((0,i.eq)(c.drugsLibrary.itemId,t)).returning()}await Z({drafts:e,previous:s})}if(t.length){let e=[];for(let{id:s,data:r}of(t.filter(e=>e.itemId).length&&(e=await o.Z.query.drugsLibrary.findMany({where:(0,i.d3)(c.drugsLibrary.itemId,t.filter(e=>e.itemId).map(e=>e.itemId))})),t)){let e=r.itemId||(0,n.Z)(),i={...r,itemId:e};t=t.map(t=>(t.id===s&&(t.data.itemId=e),t)),await o.Z.insert(c.drugsLibrary).values(i)}await Z({drafts:t,previous:e})}await o.Z.delete(c.drugsLibraryDrafts);let a=await o.Z.query.pendingDeletion.findMany({where:(0,i.K0)(c.pendingDeletion.drugsLibraryItemId),columns:{drugsLibraryItemId:!0},with:{drugsLibraryItem:{columns:{version:!0}}}});if((a=a.filter(e=>e.drugsLibraryItem)).length){let e=new Date,s=await o.Z.update(c.drugsLibrary).set({deletedAt:e,key:(0,v.i6)`CONCAT(${c.drugsLibrary.key}, '-', date_part('epoch', now()))`}).where((0,i.d3)(c.drugsLibrary.itemId,a.map(e=>e.drugsLibraryItemId))).returning();await o.Z.insert(c.drugsLibraryHistory).values(s.map(s=>{let t=s.key.split("-");t.length>2&&t.pop();let r=t.join("-");return{version:s.version,itemId:s.itemId,changes:{action:"delete_drugs_library_item",description:"Delete drugs library item",oldValues:[{deletedAt:null,key:r}],newValues:[{deletedAt:e,key:s.key}]}}}))}await o.Z.delete(c.pendingDeletion).where((0,i.or)((0,i.K0)(c.pendingDeletion.drugsLibraryItemId),(0,i.K0)(c.pendingDeletion.drugsLibraryItemDraftId)));let d=[...e.map(e=>e.itemId),...a.map(e=>e.drugsLibraryItemId)];d.length&&await o.Z.update(c.drugsLibrary).set({version:(0,v.i6)`${c.drugsLibrary.version} + 1`}).where((0,i.d3)(c.drugsLibrary.itemId,d)),s.success=!0}catch(e){s.success=!1,s.errors=[e.message],d.Z.error("_publishDrugsLibraryItems ERROR",e.message)}finally{return s}}},10970:(e,s,t)=>{t.d(s,{cF:()=>u,In:()=>p,VQ:()=>I,Bx:()=>g,GH:()=>f,Es:()=>h,gv:()=>v,Ry:()=>m,Ls:()=>b,Pk:()=>_,uD:()=>L,Or:()=>l});var r=t(57745),i=t(81445),a=t(9576),n=t(57435),d=t(10413),o=t(88182),c=t(88317);async function l({data:e,broadcastAction:s}){let t={success:!1},l=[],p={};try{for(let{scriptId:s,...t}of e)try{let e=s||a.Z();if(!l.length){let a=s?await d.Z.query.scriptsDrafts.findFirst({where:(0,r.eq)(o.scriptsDrafts.scriptDraftId,e)}):null,n=a||!s?null:await d.Z.query.scripts.findFirst({where:(0,r.eq)(o.scripts.scriptId,e)});if(a){let s={...a.data,...t},i=d.Z.update(o.scriptsDrafts).set({data:s,position:s.position,hospitalId:s.hospitalId}).where((0,r.eq)(o.scriptsDrafts.scriptDraftId,e));p.query=i.toSQL(),await i.execute()}else{let s=t.position||n?.position;if(!s){let e=await d.Z.query.scripts.findFirst({columns:{position:!0},orderBy:(0,i.C)(o.scripts.position)}),t=await d.Z.query.scriptsDrafts.findFirst({columns:{position:!0},orderBy:(0,i.C)(o.scriptsDrafts.position)});s=Math.max(0,e?.position||0,t?.position||0)+1}let r={...n,...t,scriptId:e,version:n?.version?n.version+1:1,position:s},a=d.Z.insert(o.scriptsDrafts).values({data:r,scriptDraftId:e,position:r.position,hospitalId:r.hospitalId,scriptId:n?.scriptId});p.query=a.toSQL(),await a.execute()}}}catch(e){l.push(e.message)}l.length?(t.errors=l,t.info=p):t.success=!0}catch(e){t.success=!1,t.errors=[e.message],t.info=p,n.Z.error("_saveScripts ERROR",e.message)}finally{return!t?.errors?.length&&s&&c.Z.emit("data_changed","save_scripts"),t}}async function p(){try{return await d.Z.delete(o.screensDrafts),!0}catch(e){throw e}}async function f({screensIds:e=[],scriptsIds:s=[],confirmDeleteAll:t,broadcastAction:i}){let a={success:!1};try{if(!s.length&&!e.length&&!t)throw Error("You&apos;re about to delete all the screens, please confirm this action!");await d.Z.delete(o.screensDrafts).where((0,r.xD)(e.length?(0,r.d3)(o.screensDrafts.screenDraftId,e):void 0,s.length?(0,r.or)((0,r.d3)(o.screensDrafts.scriptId,s),(0,r.d3)(o.screensDrafts.scriptDraftId,s)):void 0));let i=await d.Z.select({screenId:o.screens.screenId,screenScriptId:o.screens.scriptId,scriptDraftId:o.scriptsDrafts.scriptDraftId,pendingDeletion:o.pendingDeletion}).from(o.screens).leftJoin(o.pendingDeletion,(0,r.eq)(o.pendingDeletion.screenId,o.screens.screenId)).leftJoin(o.scriptsDrafts,(0,r.eq)(o.scriptsDrafts.scriptId,o.screens.scriptId)).where((0,r.xD)((0,r.Ft)(o.screens.deletedAt),(0,r.Ft)(o.pendingDeletion),e.length?(0,r.d3)(o.screens.screenId,e):void 0,s.length?(0,r.d3)(o.screens.scriptId,s):void 0));i.length&&await d.Z.insert(o.pendingDeletion).values(i),a.success=!0}catch(e){a.success=!1,a.errors=[e.message],n.Z.error("_deleteScreens ERROR",e.message)}finally{return!a?.errors?.length&&i&&c.Z.emit("data_changed","delete_screens"),a}}async function u(){try{return await d.Z.delete(o.diagnosesDrafts),!0}catch(e){throw e}}async function g({diagnosesIds:e=[],scriptsIds:s=[],confirmDeleteAll:t,broadcastAction:i}){let a={success:!1};try{if(!s.length&&!e.length&&!t)throw Error("You&apos;re about to delete all the diagnoses, please confirm this action!");await d.Z.delete(o.diagnosesDrafts).where((0,r.xD)(e.length?(0,r.d3)(o.diagnosesDrafts.diagnosisDraftId,e):void 0,s.length?(0,r.or)((0,r.d3)(o.diagnosesDrafts.scriptId,s),(0,r.d3)(o.diagnosesDrafts.scriptDraftId,s)):void 0));let i=await d.Z.select({diagnosisId:o.diagnoses.diagnosisId,diagnosisScriptId:o.diagnoses.scriptId,scriptDraftId:o.scriptsDrafts.scriptDraftId,pendingDeletion:o.pendingDeletion}).from(o.diagnoses).leftJoin(o.pendingDeletion,(0,r.eq)(o.pendingDeletion.diagnosisId,o.diagnoses.diagnosisId)).leftJoin(o.scriptsDrafts,(0,r.eq)(o.scriptsDrafts.scriptId,o.diagnoses.scriptId)).where((0,r.xD)((0,r.Ft)(o.diagnoses.deletedAt),(0,r.Ft)(o.pendingDeletion),e.length?(0,r.d3)(o.diagnoses.diagnosisId,e):void 0,s.length?(0,r.d3)(o.diagnoses.scriptId,s):void 0));i.length&&await d.Z.insert(o.pendingDeletion).values(i),a.success=!0}catch(e){a.success=!1,a.errors=[e.message],n.Z.error("_deleteDiagnoses ERROR",e.message)}finally{return!a?.errors?.length&&i&&c.Z.emit("data_changed","delete_diagnoses"),a}}async function I(){try{return await d.Z.delete(o.scriptsDrafts),!0}catch(e){throw e}}async function h({scriptsIds:e=[],broadcastAction:s,confirmDeleteAll:t}){let i={success:!1};try{if(!e.length&&!t)throw Error("You&apos;re about to delete all the scripts, please confirm this action!");await d.Z.delete(o.scriptsDrafts).where((0,r.or)((0,r.d3)(o.scriptsDrafts.scriptId,e),(0,r.d3)(o.scriptsDrafts.scriptDraftId,e)));let s=await d.Z.select({scriptId:o.scripts.scriptId,pendingDeletion:o.pendingDeletion}).from(o.scripts).leftJoin(o.pendingDeletion,(0,r.eq)(o.pendingDeletion.scriptId,o.scripts.scriptId)).where((0,r.xD)((0,r.Ft)(o.scripts.deletedAt),(0,r.Ft)(o.pendingDeletion),e.length?(0,r.d3)(o.scripts.scriptId,e):void 0));s.length&&(await d.Z.insert(o.pendingDeletion).values(s.map(e=>({scriptId:e.scriptId}))),await f({scriptsIds:s.map(e=>e.scriptId)}),await g({scriptsIds:s.map(e=>e.scriptId)})),i.success=!0}catch(e){i.success=!1,i.errors=[e.message],n.Z.error("_deleteScripts ERROR",e.message)}finally{return!i?.errors?.length&&s&&c.Z.emit("data_changed","delete_scripts"),i}}var y=t(34149);async function w({previous:e,drafts:s}){try{let t=[];for(let r of s){let s={version:r?.data?.version||1,scriptId:r?.data?.scriptId,changes:{}};if(r?.data?.version===1)s.changes={action:"create_script",description:"Create script",oldValues:[],newValues:[]};else{let t=e.filter(e=>e.scriptId===r?.data?.scriptId)[0],i=[],a=[];Object.keys({...r?.data}).filter(e=>!["version","draft"].includes(e)).forEach(e=>{let s=r.data[e],n={...t}[e];JSON.stringify(s)!==JSON.stringify(n)&&(i.push({[e]:n}),a.push({[e]:s}))}),s.changes={action:"update_script",description:"Update script",oldValues:i,newValues:a}}t.push(s)}await d.Z.insert(o.scriptsHistory).values(t)}catch(e){n.Z.error(e.message)}}async function D({previous:e,drafts:s}){try{let t=[];for(let r of s){let s={version:r?.data?.version||1,screenId:r?.data?.screenId,scriptId:r?.data?.scriptId,changes:{}};if(r?.data?.version===1)s.changes={action:"create_screen",description:"Create screen",oldValues:[],newValues:[]};else{let t=e.filter(e=>e.screenId===r?.data?.screenId)[0],i=[],a=[];Object.keys({...r?.data}).filter(e=>!["version","draft"].includes(e)).forEach(e=>{let s=r.data[e],n={...t}[e];JSON.stringify(s)!==JSON.stringify(n)&&(i.push({[e]:n}),a.push({[e]:s}))}),s.changes={action:"update_screen",description:"Update screen",oldValues:i,newValues:a}}t.push(s)}await d.Z.insert(o.screensHistory).values(t)}catch(e){n.Z.error(e.message)}}async function m(e){let{scriptsIds:s,screensIds:t}={...e},i={success:!1};try{let e=[],n=[];if(s?.length||t?.length){let i=await d.Z.query.screensDrafts.findMany({where:(0,r.or)(s?.length?(0,r.d3)(o.screensDrafts.scriptId,s):void 0,s?.length?(0,r.d3)(o.screensDrafts.scriptDraftId,s):void 0,t?.length?(0,r.d3)(o.screensDrafts.screenId,t):void 0,t?.length?(0,r.d3)(o.screensDrafts.screenDraftId,t):void 0)});e=i.filter(e=>e.screenId),n=i.filter(e=>!e.screenId)}else{let s=await d.Z.query.screensDrafts.findMany({where:(0,r.K0)(o.screensDrafts.scriptId)});e=s.filter(e=>e.screenId),n=s.filter(e=>!e.screenId)}if(e.length){let s=[];for(let{screenId:t,data:i}of(e.filter(e=>e.screenId).length&&(s=await d.Z.query.screens.findMany({where:(0,r.d3)(o.screens.screenId,e.filter(e=>e.screenId).map(e=>e.screenId))})),e)){let{screenId:e,id:s,oldScreenId:a,createdAt:n,updatedAt:c,deletedAt:l,...p}=i,f={...p,publishDate:new Date};await d.Z.update(o.screens).set(f).where((0,r.eq)(o.screens.screenId,t)).returning()}await D({drafts:e,previous:s})}if(n.length){let e=[];for(let{id:s,scriptId:t,scriptDraftId:i,data:c}of(n.filter(e=>e.screenId).length&&(e=await d.Z.query.screens.findMany({where:(0,r.d3)(o.screens.screenId,n.filter(e=>e.screenId).map(e=>e.screenId))})),n)){let e=c.screenId||(0,a.Z)(),r=c.scriptId||t||i,l={...c,screenId:e,scriptId:r};n=n.map(t=>(t.id===s&&(t.data.screenId=e),t)),await d.Z.insert(o.screens).values(l)}await D({drafts:n,previous:e})}await d.Z.delete(o.screensDrafts);let c=await d.Z.query.pendingDeletion.findMany({where:(0,r.K0)(o.pendingDeletion.screenId),columns:{screenId:!0},with:{screen:{columns:{version:!0,scriptId:!0}}}});if((c=c.filter(e=>e.screen)).length){let e=new Date;await d.Z.update(o.screens).set({deletedAt:e}).where((0,r.d3)(o.screens.screenId,c.map(e=>e.screenId))),await d.Z.insert(o.screensHistory).values(c.map(s=>({version:s.screen.version,screenId:s.screenId,scriptId:s.screen.scriptId,changes:{action:"delete_screen",description:"Delete screen",oldValues:[{deletedAt:null}],newValues:[{deletedAt:e}]}})))}await d.Z.delete(o.pendingDeletion).where((0,r.or)((0,r.K0)(o.pendingDeletion.screenId),(0,r.K0)(o.pendingDeletion.screenDraftId)));let l=[...e.map(e=>e.screenId),...c.map(e=>e.screenId)];l.length&&await d.Z.update(o.screens).set({version:(0,y.i6)`${o.screens.version} + 1`}).where((0,r.d3)(o.screens.screenId,l)),i.success=!0}catch(e){i.success=!1,i.errors=[e.message],n.Z.error("_publishScreens ERROR",e)}finally{return i}}async function Z({previous:e,drafts:s}){try{let t=[];for(let r of s){let s={version:r?.data?.version||1,diagnosisId:r?.data?.diagnosisId,scriptId:r?.data?.scriptId,changes:{}};if(r?.data?.version===1)s.changes={action:"create_diagnosis",description:"Create diagnosis",oldValues:[],newValues:[]};else{let t=e.filter(e=>e.diagnosisId===r?.data?.diagnosisId)[0],i=[],a=[];Object.keys({...r?.data}).filter(e=>!["version","draft"].includes(e)).forEach(e=>{let s=r.data[e],n={...t}[e];JSON.stringify(s)!==JSON.stringify(n)&&(i.push({[e]:n}),a.push({[e]:s}))}),s.changes={action:"update_diagnosis",description:"Update diagnosis",oldValues:i,newValues:a}}t.push(s)}await d.Z.insert(o.diagnosesHistory).values(t)}catch(e){n.Z.error(e.message)}}async function v(e){let{scriptsIds:s,diagnosesIds:t}={...e},i={success:!1};try{let e=[],n=[];if(s?.length||t?.length){let i=await d.Z.query.diagnosesDrafts.findMany({where:(0,r.or)(s?.length?(0,r.d3)(o.diagnosesDrafts.scriptId,s):void 0,s?.length?(0,r.d3)(o.diagnosesDrafts.scriptDraftId,s):void 0,t?.length?(0,r.d3)(o.diagnosesDrafts.diagnosisId,t):void 0,t?.length?(0,r.d3)(o.diagnosesDrafts.diagnosisDraftId,t):void 0)});e=i.filter(e=>e.diagnosisId),n=i.filter(e=>!e.diagnosisId)}else{let s=await d.Z.query.diagnosesDrafts.findMany({where:(0,r.K0)(o.diagnosesDrafts.scriptId)});e=s.filter(e=>e.diagnosisId),n=s.filter(e=>!e.diagnosisId)}if(e.length){let s=[];for(let{diagnosisId:t,data:i}of(e.filter(e=>e.diagnosisId).length&&(s=await d.Z.query.diagnoses.findMany({where:(0,r.d3)(o.diagnoses.diagnosisId,e.filter(e=>e.diagnosisId).map(e=>e.diagnosisId))})),e)){let{diagnosisId:e,id:s,oldDiagnosisId:a,createdAt:n,updatedAt:c,deletedAt:l,...p}=i,f={...p,publishDate:new Date};await d.Z.update(o.diagnoses).set(f).where((0,r.eq)(o.diagnoses.diagnosisId,t)).returning()}await Z({drafts:e,previous:s})}if(n.length){let e=[];for(let{id:s,scriptId:t,scriptDraftId:i,data:c}of(n.filter(e=>e.diagnosisId).length&&(e=await d.Z.query.diagnoses.findMany({where:(0,r.d3)(o.diagnoses.diagnosisId,n.filter(e=>e.diagnosisId).map(e=>e.diagnosisId))})),n)){let e=c.diagnosisId||(0,a.Z)(),r=c.scriptId||t||i,l={...c,diagnosisId:e,scriptId:r};n=n.map(t=>(t.id===s&&(t.data.diagnosisId=e),t)),await d.Z.insert(o.diagnoses).values(l)}await Z({drafts:n,previous:e})}await d.Z.delete(o.diagnosesDrafts);let c=await d.Z.query.pendingDeletion.findMany({where:(0,r.K0)(o.pendingDeletion.diagnosisId),columns:{diagnosisId:!0},with:{diagnosis:{columns:{version:!0,scriptId:!0}}}});if((c=c.filter(e=>e.diagnosis)).length){let e=new Date;await d.Z.update(o.diagnoses).set({deletedAt:e}).where((0,r.d3)(o.diagnoses.diagnosisId,c.map(e=>e.diagnosisId))),await d.Z.insert(o.diagnosesHistory).values(c.map(s=>({version:s.diagnosis.version,diagnosisId:s.diagnosisId,scriptId:s.diagnosis.scriptId,changes:{action:"delete_diagnosis",description:"Delete diagnosis",oldValues:[{deletedAt:null}],newValues:[{deletedAt:e}]}})))}await d.Z.delete(o.pendingDeletion).where((0,r.or)((0,r.K0)(o.pendingDeletion.diagnosisId),(0,r.K0)(o.pendingDeletion.diagnosisDraftId)));let l=[...e.map(e=>e.diagnosisId),...c.map(e=>e.diagnosisId)];l.length&&await d.Z.update(o.diagnoses).set({version:(0,y.i6)`${o.diagnoses.version} + 1`}).where((0,r.d3)(o.diagnoses.diagnosisId,l)),i.success=!0}catch(e){i.success=!1,i.errors=[e.message],n.Z.error("_publishDiagnoses ERROR",e)}finally{return i}}async function b(){let e={success:!1};try{let s=await d.Z.query.scriptsDrafts.findMany(),t=s.filter(e=>!e.scriptId).map(e=>({...e,scriptId:e.data.scriptId||(0,a.Z)(),data:{...e.data,scriptId:e.data.scriptId||(0,a.Z)()}})),i=s.filter(e=>e.scriptId);[...t.map(e=>e.scriptId),...i.map(e=>e.scriptId)];let n=[];if(i.length){let e=[];for(let{scriptId:s,data:t}of(i.filter(e=>e.scriptId).length&&(e=await d.Z.query.scripts.findMany({where:(0,r.d3)(o.scripts.scriptId,i.filter(e=>e.scriptId).map(e=>e.scriptId))})),i)){let{scriptId:e,id:i,oldScriptId:a,createdAt:c,updatedAt:l,deletedAt:p,...f}=t,u={...f,publishDate:new Date};await d.Z.update(o.scripts).set(u).where((0,r.eq)(o.scripts.scriptId,s)),n.push({scriptId:s})}await w({drafts:i,previous:e})}if(t.length){t.filter(e=>e.scriptId).length&&await d.Z.query.scripts.findMany({where:(0,r.d3)(o.scripts.scriptId,t.filter(e=>e.scriptId).map(e=>e.scriptId))});let e=t.map(e=>({...e.data,scriptId:e.scriptDraftId}));for(let{scriptId:s}of(await d.Z.insert(o.scripts).values(e),e))n.push({scriptId:s}),await d.Z.update(o.screensDrafts).set({scriptId:s}).where((0,r.or)((0,r.eq)(o.screensDrafts.scriptId,s),(0,r.eq)(o.screensDrafts.scriptDraftId,s))),await d.Z.update(o.diagnosesDrafts).set({scriptId:s}).where((0,r.or)((0,r.eq)(o.diagnosesDrafts.scriptId,s),(0,r.eq)(o.diagnosesDrafts.scriptDraftId,s)))}if(n.length){let e=await m({scriptsIds:n.map(e=>e.scriptId)});if(e.errors)throw Error(e.errors.join(", "));let s=await v({scriptsIds:n.map(e=>e.scriptId)});if(s.errors)throw Error(s.errors.join(", "))}let c=await d.Z.query.pendingDeletion.findMany({where:(0,r.K0)(o.pendingDeletion.scriptId),columns:{scriptId:!0},with:{script:{columns:{version:!0}}}});if(await d.Z.delete(o.scriptsDrafts),(c=c.filter(e=>e.script)).length){let e=new Date;await d.Z.update(o.scripts).set({deletedAt:e}).where((0,r.d3)(o.scripts.scriptId,c.map(e=>e.scriptId))),await d.Z.insert(o.scriptsHistory).values(c.map(s=>({version:s.script.version,scriptId:s.scriptId,changes:{action:"delete_config_key",description:"Delete config key",oldValues:[{deletedAt:null}],newValues:[{deletedAt:e}]}})))}await d.Z.delete(o.pendingDeletion).where((0,r.or)((0,r.K0)(o.pendingDeletion.scriptId),(0,r.K0)(o.pendingDeletion.scriptDraftId)));let l=[...i.map(e=>e.scriptId),...c.map(e=>e.scriptId)];l.length&&await d.Z.update(o.scripts).set({version:(0,y.i6)`${o.scripts.version} + 1`}).where((0,r.d3)(o.scripts.scriptId,l)),e.success=!0}catch(s){e.success=!1,e.errors=[s.message],n.Z.error("_publishScripts ERROR",s.message)}finally{return e}}function q(e){if("string"==typeof e)return e.replace(/0x[0-9A-Fa-f]+/g,"");if(Array.isArray(e))return e.map(q);if("object"==typeof e&&null!==e){let s={};for(let t in e)e.hasOwnProperty(t)&&(s[t]=q(e[t]));return s}return e}async function L({data:e,broadcastAction:s}){let t={success:!1};e=q(e);let l=[],p={};try{let s=0;for(let{screenId:t,...n}of e)try{s++;let e=t||a.Z();if(!l.length){let a=t?await d.Z.query.screensDrafts.findFirst({where:(0,r.eq)(o.screensDrafts.screenDraftId,e)}):null,c=a||!t?null:await d.Z.query.screens.findFirst({where:(0,r.eq)(o.screens.screenId,e)});if(a){let s={...a.data,...n},t=d.Z.update(o.screensDrafts).set({data:s,position:s.position}).where((0,r.eq)(o.screensDrafts.screenDraftId,e));p.query=t.toSQL(),await t.execute()}else{let t=n.position||c?.position;if(!t){let e=await d.Z.query.screens.findFirst({columns:{position:!0},orderBy:(0,i.C)(o.screens.position)}),s=await d.Z.query.screensDrafts.findFirst({columns:{position:!0},orderBy:(0,i.C)(o.screensDrafts.position)});t=Math.max(0,e?.position||0,s?.position||0)+1}let a={...c,...n,screenId:e,version:c?.version?c.version+1:1,position:t};if(a.scriptId){let t=await d.Z.query.scriptsDrafts.findFirst({where:(0,r.eq)(o.scriptsDrafts.scriptDraftId,a.scriptId),columns:{scriptDraftId:!0}}),i=await d.Z.query.scripts.findFirst({where:(0,r.eq)(o.scripts.scriptId,a.scriptId),columns:{scriptId:!0}});if(t||i){let s=d.Z.insert(o.screensDrafts).values({data:a,type:a.type,scriptId:i?.scriptId,scriptDraftId:t?.scriptDraftId,screenDraftId:e,position:a.position,screenId:c?.screenId});p.query=s.toSQL(),await s.execute()}else l.push(`Could not save screen ${s}: ${a.title}, because script was not found`)}else l.push(`Could not save screen ${s}: ${a.title}, because scriptId was not specified`)}}}catch(e){l.push(e.message)}l.length?(t.errors=l,t.info=p):t.success=!0}catch(e){t.success=!1,t.errors=[e.message],t.info=p,n.Z.error("_saveScreens ERROR",e.message)}finally{return!t?.errors?.length&&s&&c.Z.emit("data_changed","save_screens"),t}}async function _({data:e,broadcastAction:s}){let t={success:!1};e=q(e);let l=[],p={};try{let s=0;for(let{diagnosisId:t,...c}of e)try{s++;let e=t||a.Z();if(!l.length){let a=d.Z.query.diagnosesDrafts.findFirst({where:(0,r.eq)(o.diagnosesDrafts.diagnosisDraftId,e)});p[`${e} - getDiagnosisDraftQuery`]=a.toSQL();let n=t?await a.execute():null,f=d.Z.query.diagnoses.findFirst({where:(0,r.eq)(o.diagnoses.diagnosisId,e)});p[`${e} - getPublishedDiagnosisQuery`]=f.toSQL();let u=n||!t?null:await f.execute();if(n){let s={...n.data,...c},t=d.Z.update(o.diagnosesDrafts).set({data:s,position:s.position}).where((0,r.eq)(o.diagnosesDrafts.diagnosisDraftId,e));p[`${e} - updateDiagnosisDraft`]=t.toSQL(),await t.execute()}else{let t=c.position||u?.position;if(!t){let e=await d.Z.query.diagnoses.findFirst({columns:{position:!0},orderBy:(0,i.C)(o.diagnoses.position)}),s=await d.Z.query.diagnosesDrafts.findFirst({columns:{position:!0},orderBy:(0,i.C)(o.diagnosesDrafts.position)});t=Math.max(0,e?.position||0,s?.position||0)+1}let a={...u,...c,diagnosisId:e,version:u?.version?u.version+1:1,position:t};if(a.scriptId){let t=await d.Z.query.scriptsDrafts.findFirst({where:(0,r.eq)(o.scriptsDrafts.scriptDraftId,a.scriptId),columns:{scriptDraftId:!0}}),i=await d.Z.query.scripts.findFirst({where:(0,r.eq)(o.scripts.scriptId,a.scriptId),columns:{scriptId:!0}});if(t||i){let s=d.Z.insert(o.diagnosesDrafts).values({data:a,scriptId:i?.scriptId,scriptDraftId:t?.scriptDraftId,diagnosisDraftId:e,position:a.position,diagnosisId:u?.diagnosisId});p[`${e} - createDiagnosisDraft`]=s.toSQL(),await s.execute()}else l.push(`Could not save diagnosis ${s}: ${a.name}, because script was not found`)}else l.push(`Could not save diagnosis ${s}: ${a.name}, because scriptId was not specified`)}}}catch(e){l.push(e.message),n.Z.error("saveDiagnosis SQL (FAILED)",JSON.stringify(p))}l.length?t.errors=l:t.success=!0}catch(e){t.success=!1,t.errors=[e.message],n.Z.error("_saveDiagnoses ERROR",e.message)}finally{return!t?.errors?.length&&s&&c.Z.emit("data_changed","save_diagnoses"),t}}}};