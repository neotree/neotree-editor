exports.id=5209,exports.ids=[5209],exports.modules={58359:()=>{},93739:()=>{},13269:(e,s,t)=>{"use strict";t.d(s,{tW:()=>Z,co:()=>I,ix:()=>g,GM:()=>w,W0:()=>D,Zu:()=>f,XA:()=>y,Ew:()=>v,NB:()=>u,uK:()=>h,bK:()=>c,Tw:()=>l,f:()=>m});var i=t(57745),r=t(30900),n=t(9576),d=t(10413),a=t(43509),o=t(57435);async function l(e){try{let{scriptsIds:s=[],hospitalIds:t=[],returnDraftsIfExist:o}={...e},l=s.filter(e=>!r.Z(e));s=s.filter(e=>r.Z(e));let c=t.filter(e=>!r.Z(e));if(t=t.filter(e=>r.Z(e)),l.length){let e=await d.Z.query.scripts.findMany({where:(0,i.d3)(a.scripts.oldScriptId,l),columns:{scriptId:!0,oldScriptId:!0}});l.forEach(t=>{let i=e.filter(e=>e.oldScriptId===t)[0];s.push(i?.scriptId||n.Z())})}if(c.length){let e=await d.Z.query.hospitals.findMany({where:(0,i.d3)(a.hospitals.oldHospitalId,c),columns:{hospitalId:!0,oldHospitalId:!0}});c.forEach(s=>{let i=e.filter(e=>e.oldHospitalId===s)[0];t.push(i?.hospitalId||n.Z())})}let p=(o?await d.Z.select({scriptDraft:a.scriptsDrafts,hospitalName:a.hospitals.name}).from(a.scriptsDrafts).leftJoin(a.hospitals,(0,i.eq)(a.hospitals.hospitalId,a.scriptsDrafts.hospitalId)).where((0,i.xD)(s?.length?(0,i.d3)(a.scriptsDrafts.scriptDraftId,s):void 0,t.length?(0,i.d3)(a.scriptsDrafts.hospitalId,t):void 0)):[]).map(e=>({...e.scriptDraft,hospitalName:e.hospitalName})),f=(await d.Z.select({script:a.scripts,pendingDeletion:a.pendingDeletion,hospitalName:a.hospitals.name}).from(a.scripts).leftJoin(a.pendingDeletion,(0,i.eq)(a.pendingDeletion.scriptId,a.scripts.scriptId)).leftJoin(a.scriptsDrafts,(0,i.eq)(a.scriptsDrafts.scriptId,a.scripts.scriptId)).leftJoin(a.hospitals,(0,i.xD)((0,i.eq)(a.hospitals.hospitalId,a.scripts.hospitalId),(0,i.Ft)(a.hospitals.deletedAt))).where((0,i.xD)((0,i.Ft)(a.scripts.deletedAt),(0,i.Ft)(a.pendingDeletion),o?(0,i.Ft)(a.scriptsDrafts.scriptId):void 0,s.length?(0,i.d3)(a.scripts.scriptId,s):void 0,t.length?(0,i.d3)(a.scripts.hospitalId,t):void 0))).map(e=>({...e.script,hospitalName:e.hospitalName})),g=f.length?await d.Z.query.pendingDeletion.findMany({where:(0,i.d3)(a.pendingDeletion.scriptId,f.map(e=>e.scriptId)),columns:{scriptId:!0}}):[];return{data:[...f.map(e=>({...e,isDraft:!1,isDeleted:!1})),...p.map(e=>({...e.data,hospitalName:e.hospitalName,isDraft:!0,isDeleted:!1}))].sort((e,s)=>e.position-s.position).filter(e=>!g.map(e=>e.scriptId).includes(e.scriptId)).map(e=>({...e,hospitalId:e.hospitalName?e.hospitalId:null}))}}catch(e){return o.Z.error("_getScripts ERROR",e.message),{data:[],errors:[e.message]}}}async function c(e){let{scriptId:s,returnDraftIfExists:t}={...e};try{if(!s)throw Error("Missing scriptId");let e=r.Z(s)?(0,i.eq)(a.scripts.scriptId,s):void 0,n=r.Z(s)?void 0:(0,i.eq)(a.scripts.oldScriptId,s),o=e?(0,i.eq)(a.scriptsDrafts.scriptDraftId,s):void 0,l=t&&o?await d.Z.query.scriptsDrafts.findFirst({where:o}):void 0,c=l?{...l.data,isDraft:!1,isDeleted:!1}:null;if(c)return{data:c};let p=await d.Z.select({script:a.scripts,pendingDeletion:a.pendingDeletion,draft:a.scriptsDrafts,hospitalName:a.hospitals.name}).from(a.scripts).leftJoin(a.hospitals,(0,i.xD)((0,i.eq)(a.hospitals.hospitalId,a.scripts.hospitalId),(0,i.Ft)(a.hospitals.deletedAt))).leftJoin(a.pendingDeletion,(0,i.eq)(a.pendingDeletion.scriptId,a.scripts.scriptId)).leftJoin(a.scriptsDrafts,(0,i.eq)(a.scripts.scriptId,a.scriptsDrafts.scriptDraftId)).where((0,i.xD)((0,i.Ft)(a.scripts.deletedAt),(0,i.Ft)(a.pendingDeletion),(0,i.or)(e,n))),f=p[0]?{...p[0].script,draft:p[0].draft||void 0,hospitalName:p[0].hospitalName||""}:null;l=t?f?.draft:void 0;let g=l?.data||f;if(!(c=g?{...g,isDraft:!1,isDeleted:!1,hospitalId:g.hospitalName?g.hospitalId:null}:null))return{data:null};return{data:c}}catch(e){return o.Z.error("_getScript ERROR",e.message),{errors:[e.message]}}}var p=t(60938);let f={allPublished:0,publishedWithDrafts:0,allDrafts:0,newDrafts:0,pendingDeletion:0};async function g(){try{let[{count:e}]=await d.Z.select({count:(0,p.QX)()}).from(a.scriptsDrafts),[{count:s}]=await d.Z.select({count:(0,p.QX)()}).from(a.scriptsDrafts).where((0,i.Ft)(a.scriptsDrafts.scriptId)),[{count:t}]=await d.Z.select({count:(0,p.QX)()}).from(a.scriptsDrafts).where((0,i.K0)(a.scriptsDrafts.scriptId)),[{count:r}]=await d.Z.select({count:(0,p.QX)()}).from(a.pendingDeletion).where((0,i.K0)(a.pendingDeletion.scriptId)),[{count:n}]=await d.Z.select({count:(0,p.QX)()}).from(a.scripts);return{data:{allPublished:n,publishedWithDrafts:t,allDrafts:e,newDrafts:s,pendingDeletion:r}}}catch(e){return o.Z.error("_getScripts ERROR",e.message),{data:f,errors:[e.message]}}}let D={allPublished:0,publishedWithDrafts:0,allDrafts:0,newDrafts:0,pendingDeletion:0};async function I(e){let{scriptsIds:s=[],types:t=[]}={...e};try{let e=s.length?(0,i.d3)(a.screens.scriptId,s):void 0,r=s.length?(0,i.d3)(a.screensDrafts.scriptId,s):void 0,n=t.length?(0,i.d3)(a.screens.type,t):void 0,o=t.length?(0,i.d3)(a.screensDrafts.type,t):void 0,[{count:l}]=await d.Z.select({count:(0,p.QX)()}).from(a.screensDrafts).where((0,i.xD)(r,o)),[{count:c}]=await d.Z.select({count:(0,p.QX)()}).from(a.screensDrafts).where((0,i.xD)(r,o,(0,i.Ft)(a.screensDrafts.screenId))),[{count:f}]=await d.Z.select({count:(0,p.QX)()}).from(a.screensDrafts).where((0,i.xD)(r,o,(0,i.K0)(a.screensDrafts.screenId))),[{count:g}]=await d.Z.select({count:(0,p.QX)()}).from(a.pendingDeletion).where((0,i.xD)(s.length?(0,i.or)((0,i.d3)(a.pendingDeletion.screenScriptId,s)):void 0,(0,i.K0)(a.pendingDeletion.screenId))),[{count:D}]=await d.Z.select({count:(0,p.QX)()}).from(a.screens).where((0,i.xD)(e,n));return{data:{allPublished:D,publishedWithDrafts:f,allDrafts:l,newDrafts:c,pendingDeletion:g}}}catch(e){return o.Z.error("_getScreens ERROR",e.message),{data:D,errors:[e.message]}}}async function h(e){try{let{scriptsIds:s=[],screensIds:t=[],returnDraftsIfExist:o,withImagesOnly:l}={...e},c=t.filter(e=>!r.Z(e));if(t=t.filter(e=>r.Z(e)),c.length){let e=await d.Z.query.screens.findMany({where:(0,i.d3)(a.screens.oldScreenId,c),columns:{screenId:!0,oldScreenId:!0}});c.forEach(s=>{let i=e.filter(e=>e.oldScreenId===s)[0];t.push(i?.screenId||n.Z())})}let p=(s=s.filter(e=>r.Z(e))).filter(e=>!r.Z(e));if(p.length){let e=await d.Z.query.scripts.findMany({where:(0,i.d3)(a.scripts.oldScriptId,p),columns:{scriptId:!0,oldScriptId:!0}});p.forEach(t=>{let i=e.filter(e=>e.oldScriptId===t)[0];s.push(i?.scriptId||n.Z())})}let f=o?await d.Z.query.screensDrafts.findMany({where:(0,i.xD)(s?.length?(0,i.or)((0,i.d3)(a.screensDrafts.scriptId,s),(0,i.d3)(a.screensDrafts.scriptDraftId,s)):void 0,t?.length?(0,i.d3)(a.screensDrafts.screenDraftId,t):void 0)}):[],g=(await d.Z.select({screen:a.screens,pendingDeletion:a.pendingDeletion}).from(a.screens).leftJoin(a.pendingDeletion,(0,i.eq)(a.pendingDeletion.screenId,a.screens.screenId)).leftJoin(a.screensDrafts,(0,i.eq)(a.screensDrafts.screenId,a.screens.screenId)).where((0,i.xD)((0,i.Ft)(a.screens.deletedAt),(0,i.Ft)(a.pendingDeletion),o?(0,i.Ft)(a.screensDrafts.screenId):void 0,s?.length?(0,i.d3)(a.screens.scriptId,s):void 0,t?.length?(0,i.d3)(a.screens.screenId,t):void 0,l?(0,i.or)((0,i.K0)(a.screens.image1),(0,i.K0)(a.screens.image2),(0,i.K0)(a.screens.image3)):void 0))).map(e=>e.screen),D=g.length?await d.Z.query.pendingDeletion.findMany({where:(0,i.d3)(a.pendingDeletion.screenId,g.map(e=>e.screenId)),columns:{screenId:!0}}):[];return{data:[...g.map(e=>({...e,isDraft:!1,isDeleted:!1})),...f.map(e=>({...e.data,isDraft:!0,isDeleted:!1}))].sort((e,s)=>e.position-s.position).filter(e=>!D.map(e=>e.screenId).includes(e.screenId))}}catch(e){return o.Z.error("_getScreens ERROR",e.message),{data:[],errors:[e.message]}}}async function u(e){let{screenId:s,returnDraftIfExists:t}={...e};try{if(!s)throw Error("Missing screenId");let e=r.Z(s)?(0,i.eq)(a.screens.screenId,s):void 0,n=r.Z(s)?void 0:(0,i.eq)(a.screens.oldScreenId,s),o=e?(0,i.eq)(a.screensDrafts.screenDraftId,s):void 0,l=t&&o?await d.Z.query.screensDrafts.findFirst({where:o}):void 0,c=l?{...l.data,isDraft:!1,isDeleted:!1}:null;if(c)return{data:c};let p=await d.Z.select({screen:a.screens,pendingDeletion:a.pendingDeletion,draft:a.screensDrafts}).from(a.screens).leftJoin(a.pendingDeletion,(0,i.eq)(a.pendingDeletion.screenId,a.screens.screenId)).leftJoin(a.screensDrafts,(0,i.eq)(a.screens.screenId,a.screensDrafts.screenDraftId)).where((0,i.xD)((0,i.Ft)(a.screens.deletedAt),(0,i.Ft)(a.pendingDeletion),(0,i.or)(e,n))),f=p[0]?{...p[0].screen,draft:p[0].draft||void 0}:null;l=t?f?.draft:void 0;let g=l?.data||f;if(!(c=g?{...g,isDraft:!1,isDeleted:!1}:null))return{data:null};return{data:c}}catch(e){return o.Z.error("_getScreen ERROR",e.message),{errors:[e.message]}}}async function m(e){try{let{scriptsIds:s=[],screensIds:t=[],returnDraftsIfExist:o}={...e},l=t.filter(e=>!r.Z(e));if(t=t.filter(e=>r.Z(e)),l.length){let e=await d.Z.query.screens.findMany({where:(0,i.d3)(a.screens.oldScreenId,l),columns:{screenId:!0,oldScreenId:!0}});l.forEach(s=>{let i=e.filter(e=>e.oldScreenId===s)[0];t.push(i?.screenId||n.Z())})}let c=(s=s.filter(e=>r.Z(e))).filter(e=>!r.Z(e));if(c.length){let e=await d.Z.query.scripts.findMany({where:(0,i.d3)(a.scripts.oldScriptId,c),columns:{scriptId:!0,oldScriptId:!0}});c.forEach(t=>{let i=e.filter(e=>e.oldScriptId===t)[0];s.push(i?.scriptId||n.Z())})}let p=o?await d.Z.query.screensDrafts.findMany({where:(0,i.xD)(s?.length?(0,i.or)((0,i.d3)(a.screensDrafts.scriptId,s),(0,i.d3)(a.screensDrafts.scriptDraftId,s)):void 0,t?.length?(0,i.d3)(a.screensDrafts.screenDraftId,t):void 0)}):[],f=(await d.Z.select({screen:{title:a.screens.title,screenId:a.screens.screenId,oldScreenId:a.screens.oldScreenId,position:a.screens.position,type:a.screens.type,refId:a.screens.refId},pendingDeletion:a.pendingDeletion}).from(a.screens).leftJoin(a.pendingDeletion,(0,i.eq)(a.pendingDeletion.screenId,a.screens.screenId)).leftJoin(a.screensDrafts,(0,i.eq)(a.screensDrafts.screenId,a.screens.screenId)).where((0,i.xD)((0,i.Ft)(a.screens.deletedAt),(0,i.Ft)(a.pendingDeletion),o?(0,i.Ft)(a.screensDrafts.screenId):void 0,s?.length?(0,i.d3)(a.screens.scriptId,s):void 0,t?.length?(0,i.d3)(a.screens.screenId,t):void 0))).map(e=>e.screen),g=f.length?await d.Z.query.pendingDeletion.findMany({where:(0,i.d3)(a.pendingDeletion.screenId,f.map(e=>e.screenId)),columns:{screenId:!0}}):[];return{data:[...f.map(e=>({...e,isDraft:!1,isDeleted:!1})),...p.map(e=>({...e.data,isDraft:!0,isDeleted:!1}))].sort((e,s)=>e.position-s.position).filter(e=>!g.map(e=>e.screenId).includes(e.screenId)).map((e,s)=>({...e,position:s+1}))}}catch(e){return o.Z.error("_listScreens ERROR",e.message),{data:[],errors:[e.message]}}}let w={allPublished:0,publishedWithDrafts:0,allDrafts:0,newDrafts:0,pendingDeletion:0};async function Z(e){let{scriptsIds:s=[]}={...e};try{let e=s.length?(0,i.d3)(a.diagnoses.scriptId,s):void 0,t=s.length?(0,i.d3)(a.diagnosesDrafts.scriptId,s):void 0,[{count:r}]=await d.Z.select({count:(0,p.QX)()}).from(a.diagnosesDrafts).where(t),[{count:n}]=await d.Z.select({count:(0,p.QX)()}).from(a.diagnosesDrafts).where((0,i.xD)(t,(0,i.Ft)(a.diagnosesDrafts.diagnosisId))),[{count:o}]=await d.Z.select({count:(0,p.QX)()}).from(a.diagnosesDrafts).where((0,i.xD)(t,(0,i.K0)(a.diagnosesDrafts.diagnosisId))),[{count:l}]=await d.Z.select({count:(0,p.QX)()}).from(a.pendingDeletion).where((0,i.xD)(s.length?(0,i.or)((0,i.d3)(a.pendingDeletion.diagnosisScriptId,s)):void 0,(0,i.K0)(a.pendingDeletion.diagnosisId))),[{count:c}]=await d.Z.select({count:(0,p.QX)()}).from(a.diagnoses).where(e);return{data:{allPublished:c,publishedWithDrafts:o,allDrafts:r,newDrafts:n,pendingDeletion:l}}}catch(e){return o.Z.error("_getDiagnoses ERROR",e.message),{data:w,errors:[e.message]}}}async function y(e){try{let{scriptsIds:s=[],diagnosesIds:t=[],returnDraftsIfExist:o,withImagesOnly:l}={...e},c=t.filter(e=>!r.Z(e));if(t=t.filter(e=>r.Z(e)),c.length){let e=await d.Z.query.diagnoses.findMany({where:(0,i.d3)(a.diagnoses.oldDiagnosisId,c),columns:{diagnosisId:!0,oldDiagnosisId:!0}});c.forEach(s=>{let i=e.filter(e=>e.oldDiagnosisId===s)[0];t.push(i?.diagnosisId||n.Z())})}let p=(s=s.filter(e=>r.Z(e))).filter(e=>!r.Z(e));if(p.length){let e=await d.Z.query.scripts.findMany({where:(0,i.d3)(a.scripts.oldScriptId,p),columns:{scriptId:!0,oldScriptId:!0}});p.forEach(t=>{let i=e.filter(e=>e.oldScriptId===t)[0];s.push(i?.scriptId||n.Z())})}let f=o?await d.Z.query.diagnosesDrafts.findMany({where:(0,i.xD)(s?.length?(0,i.or)((0,i.d3)(a.diagnosesDrafts.scriptId,s),(0,i.d3)(a.diagnosesDrafts.scriptDraftId,s)):void 0,t?.length?(0,i.d3)(a.diagnosesDrafts.diagnosisDraftId,t):void 0)}):[],g=(await d.Z.select({diagnosis:a.diagnoses,pendingDeletion:a.pendingDeletion}).from(a.diagnoses).leftJoin(a.pendingDeletion,(0,i.eq)(a.pendingDeletion.diagnosisId,a.diagnoses.diagnosisId)).leftJoin(a.diagnosesDrafts,(0,i.eq)(a.diagnosesDrafts.diagnosisId,a.diagnoses.diagnosisId)).where((0,i.xD)((0,i.Ft)(a.diagnoses.deletedAt),(0,i.Ft)(a.pendingDeletion),o?(0,i.Ft)(a.diagnosesDrafts.diagnosisId):void 0,s?.length?(0,i.d3)(a.diagnoses.scriptId,s):void 0,t?.length?(0,i.d3)(a.diagnoses.diagnosisId,t):void 0,l?(0,i.or)((0,i.K0)(a.diagnoses.image1),(0,i.K0)(a.diagnoses.image2),(0,i.K0)(a.diagnoses.image3)):void 0,a.diagnoses))).map(e=>e.diagnosis),D=g.length?await d.Z.query.pendingDeletion.findMany({where:(0,i.d3)(a.pendingDeletion.diagnosisId,g.map(e=>e.diagnosisId)),columns:{diagnosisId:!0}}):[];return{data:[...g.map(e=>({...e,isDraft:!1,isDeleted:!1})),...f.map(e=>({...e.data,isDraft:!0,isDeleted:!1}))].sort((e,s)=>e.position-s.position).filter(e=>!D.map(e=>e.diagnosisId).includes(e.diagnosisId))}}catch(e){return o.Z.error("_getDiagnoses ERROR",e.message),{data:[],errors:[e.message]}}}async function v(e){let{diagnosisId:s,returnDraftIfExists:t}={...e};try{if(!s)throw Error("Missing diagnosisId");let e=r.Z(s)?(0,i.eq)(a.diagnoses.diagnosisId,s):void 0,n=r.Z(s)?void 0:(0,i.eq)(a.diagnoses.oldDiagnosisId,s),o=e?(0,i.eq)(a.diagnosesDrafts.diagnosisDraftId,s):void 0,l=t&&o?await d.Z.query.diagnosesDrafts.findFirst({where:o}):void 0,c=l?{...l.data,isDraft:!1,isDeleted:!1}:null;if(c)return{data:c};let p=await d.Z.select({diagnosis:a.diagnoses,pendingDeletion:a.pendingDeletion,draft:a.diagnosesDrafts}).from(a.diagnoses).leftJoin(a.pendingDeletion,(0,i.eq)(a.pendingDeletion.diagnosisId,a.diagnoses.diagnosisId)).leftJoin(a.diagnosesDrafts,(0,i.eq)(a.diagnoses.diagnosisId,a.diagnosesDrafts.diagnosisDraftId)).where((0,i.xD)((0,i.Ft)(a.diagnoses.deletedAt),(0,i.Ft)(a.pendingDeletion),(0,i.or)(e,n))),f=p[0]?{...p[0].diagnosis,draft:p[0].draft||void 0}:null;l=t?f?.draft:void 0;let g=l?.data||f;if(!(c=g?{...g,isDraft:!1,isDeleted:!1}:null))return{data:null};return{data:c}}catch(e){return o.Z.error("_getDiagnosis ERROR",e.message),{errors:[e.message]}}}},88317:(e,s,t)=>{"use strict";t.d(s,{Z:()=>i});let i=(0,t(55802).io)(process.env.NEXT_PUBLIC_APP_URL)}};