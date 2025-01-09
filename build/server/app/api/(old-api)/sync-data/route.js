"use strict";(()=>{var e={};e.id=3699,e.ids=[3699],e.modules={67096:e=>{e.exports=require("bcrypt")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},76224:e=>{e.exports=require("tty")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},8760:(e,t,i)=>{i.r(t),i.d(t,{originalPathname:()=>w,patchFetch:()=>q,requestAsyncStorage:()=>K,routeModule:()=>D,serverHooks:()=>v,staticGenerationAsyncStorage:()=>A});var a={};i.r(a),i.d(a,{GET:()=>x});var r=i(49303),s=i(88716),d=i(60670),n=i(87070),o=i(57435),l=i(72761),p=i(38369),c=i(17137),g=i(88453);function u(e){return{id:e.id,config_key_id:e.oldConfigKeyId||e.configKeyId,position:e.position,deletedAt:e.deletedAt,createdAt:e.createdAt,updatedAt:e.updatedAt,data:{configKey:e.key,configKeyId:e.oldConfigKeyId||e.configKeyId,createdAt:e.createdAt,label:e.label,source:e.source,summary:e.summary,updatedAt:e.updatedAt,position:e.position,id:e.id,preferences:e.preferences}}}function f(e){return{id:e.id,diagnosis_id:e.oldDiagnosisId||e.diagnosisId,position:e.position,script_id:e.oldScriptId||e.scriptId,deletedAt:e.deletedAt,createdAt:e.createdAt,updatedAt:e.updatedAt,data:{createdAt:e.createdAt,description:e.description,diagnosisId:e.oldDiagnosisId||e.diagnosisId,expression:e.expression,name:e.name,source:e.source,updatedAt:e.updatedAt,diagnosis_id:e.oldDiagnosisId||e.diagnosisId,scriptId:e.oldScriptId||e.scriptId,script_id:e.oldScriptId||e.scriptId,position:e.position,image1:e.image1?{...e.image1,data:e.image1?.data?.replaceAll?.("api/files","file")?.split?.("?")[0]||e.image1}:null,image2:e.image2?{...e.image2,data:e.image2?.data?.replaceAll?.("api/files","file")?.split?.("?")[0]||e.image2}:null,image3:e.image3?{...e.image3,data:e.image3?.data?.replaceAll?.("api/files","file")?.split?.("?")[0]||e.image3}:null,text1:e.text1,text2:e.text2,text3:e.text3,deletedAt:e.deletedAt,expressionMeaning:e.expressionMeaning,key:e.key,severity_order:e.severityOrder,symptoms:e.symptoms,preferences:e.preferences}}}function m(e){return{id:e.id,screen_id:e.oldScreenId||e.screenId,type:e.type,position:e.position,script_id:e.oldScriptId||e.scriptId,deletedAt:e.deletedAt,createdAt:e.createdAt,updatedAt:e.updatedAt,data:{skippable:e.skippable,condition:e.condition,skipToCondition:e.skipToCondition,skipToScreenId:e.skipToScreenId,epicId:e.epicId,storyId:e.storyId,refId:e.refId,step:e.step,title:e.title,title2:e.title2,title3:e.title3,title4:e.title4,sectionTitle:e.sectionTitle,actionText:e.actionText,contentText:e.contentText,instructions:e.instructions,instructions2:e.instructions2,instructions3:e.instructions3,instructions4:e.instructions4,hcwDiagnosesInstructions:e.hcwDiagnosesInstructions,suggestedDiagnosesInstructions:e.suggestedDiagnosesInstructions,notes:e.notes,type:e.type,screenId:e.oldScreenId||e.screenId,scriptId:e.oldScriptId||e.scriptId,script_id:e.oldScriptId||e.scriptId,screen_id:e.oldScreenId||e.screenId,position:e.position,createdAt:e.createdAt,updatedAt:e.updatedAt,deletedAt:e.deletedAt,source:e.source,infoText:e.infoText,printable:e.printable,refKey:e.refKey,prePopulate:e.prePopulate,id:e.id,previewTitle:e.previewTitle,previewPrintTitle:e.previewPrintTitle,metadata:{confidential:e.confidential,dataType:e.dataType,key:e.key,label:e.label,text3:e.text3,title1:e.title1,title2:e.title2,title3:e.title3,text1:e.text1,text2:e.text2,image1:e.image1?{...e.image1,data:e.image1?.data?.replaceAll?.("api/files","file")?.split?.("?")[0]||e.image1}:null,image2:e.image2?{...e.image2,data:e.image2?.data?.replaceAll?.("api/files","file")?.split?.("?")[0]||e.image2}:null,image3:e.image3?{...e.image3,data:e.image3?.data?.replaceAll?.("api/files","file")?.split?.("?")[0]||e.image3}:null,items:e.items,fields:e.fields,multiplier:e.multiplier,minValue:e.minValue,maxValue:e.maxValue,negativeLabel:e.negativeLabel,positiveLabel:e.positiveLabel,timerValue:e.timerValue},preferences:e.preferences}}}function y(e){return{id:e.id,script_id:e.oldScriptId||e.scriptId,position:e.position,deletedAt:e.deletedAt,createdAt:e.createdAt,updatedAt:e.updatedAt,data:{createdAt:e.createdAt,description:e.description,position:e.position,scriptId:e.oldScriptId||e.scriptId,script_id:e.oldScriptId||e.scriptId,title:e.title,updatedAt:e.updatedAt,deletedAt:e.deletedAt,type:e.type,exportable:e.exportable,hospital:e.hospitalId,printTitle:e.printTitle,id:e.id,nuid_search_enabled:e.nuidSearchEnabled,nuidSearchFields:e.nuidSearchFields.map(e=>({calculation:e.calculation,condition:e.condition,confidential:e.confidential,dataType:e.dataType,defaultValue:e.defaultValue,format:e.format,type:e.type,key:e.key,refKey:e.refKey,label:e.label,minValue:e.minValue,maxValue:e.maxValue,optional:e.optional,minDate:e.minDate,maxDate:e.maxDate,minTime:e.minTime,maxTime:e.maxTime,minDateKey:e.minDateKey,maxDateKey:e.maxDateKey,minTimeKey:e.minTimeKey,maxTimeKey:e.maxTimeKey,values:e.values})),preferences:e.preferences,printSections:e.printSections}}}var I=i(92570),h=i(44380);async function x(e){try{if(o.Z.log(`[GET - start]: ${e.url}`),!(await (0,l.$)()).yes)return n.NextResponse.json({errors:["Unauthorised"]});let t=e.nextUrl.searchParams.get("deviceId"),i=e.nextUrl.searchParams.get("hospitalId"),{device:a,info:r,errors:s}=await (0,I._)(t);if(s)return n.NextResponse.json({errors:s});let[d,x,D]=await Promise.all([(0,g.O8)(),(0,p.Tw)({withDeleted:!1,returnDraftsIfExist:!0,hospitalIds:i?[i]:void 0}),(0,c.aP)({withDeleted:!1,returnDraftsIfExist:!0})]),[K,A]=await Promise.all([x.data.length?(0,p.uK)({withDeleted:!1,returnDraftsIfExist:!0,scriptsIds:x.data.map(e=>e.scriptId)}):{data:[]},x.data.length?(0,p.XA)({withDeleted:!1,returnDraftsIfExist:!0,scriptsIds:x.data.map(e=>e.scriptId)}):{data:[]}]),v=e=>{let t=process.env.NEXT_PUBLIC_APP_URL||"";return"/"===t.substring(t.length-1,t.length)&&(t=t.substring(0,t.length-1)),"/"===e[0]&&(e=e.substring(1,e.length)),[t,e].filter(e=>e).join("/")};K.data.forEach((e,t)=>{e.image1?.data&&e.image1?.fileId&&!(0,h.jv)(e.image1.data)&&(K.data[t].image1.data=v(e.image1.data)),e.image2?.data&&e.image2?.fileId&&!(0,h.jv)(e.image2.data)&&(K.data[t].image2.data=v(e.image2.data)),e.image3?.data&&e.image3?.fileId&&!(0,h.jv)(e.image3.data)&&(K.data[t].image3.data=v(e.image3.data))}),A.data.forEach((e,t)=>{e.image1?.data&&e.image1?.fileId&&!(0,h.jv)(e.image1.data)&&(A.data[t].image1.data=v(e.image1.data)),e.image2?.data&&e.image2?.fileId&&!(0,h.jv)(e.image2.data)&&(A.data[t].image2.data=v(e.image2.data)),e.image3?.data&&e.image3?.fileId&&!(0,h.jv)(e.image3.data)&&(A.data[t].image3.data=v(e.image3.data))});let w=D.data.filter(e=>!e.isDeleted).map(e=>u(e)),q=D.data.filter(e=>e.isDeleted).map(e=>u(e)),T=x.data.filter(e=>!e.isDeleted).map(e=>{let t=d.data.filter(t=>t.hospitalId===e.hospitalId)[0]?.oldHospitalId;return y({...e,hospitalId:t||e.hospitalId})}),Z=x.data.filter(e=>e.isDeleted).map(e=>{let t=d.data.filter(t=>t.hospitalId===e.hospitalId)[0]?.oldHospitalId;return y({...e,hospitalId:t||e.hospitalId})}),b=K.data.filter(e=>!e.isDeleted).map(e=>m(e)),_=K.data.filter(e=>e.isDeleted).map(e=>m(e)),R=A.data.filter(e=>!e.isDeleted).map(e=>f(e)),P=A.data.filter(e=>e.isDeleted).map(e=>f(e));return o.Z.log(`[GET - finish]: ${e.url}`),n.NextResponse.json({device:a,webeditorInfo:r,configKeys:w,deletedConfigKeys:q,deletedDiagnoses:P,deletedScreens:_,deletedScripts:Z,diagnoses:R,screens:b,scripts:T})}catch(e){return o.Z.error("[GET] /api/sync",e.message),n.NextResponse.json({errors:["Internal Error"]})}}let D=new r.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/(old-api)/sync-data/route",pathname:"/api/sync-data",filename:"route",bundlePath:"app/api/(old-api)/sync-data/route"},resolvedPagePath:"/home/farai/Workbench/Neotree/neotree-editor-master/app/api/(old-api)/sync-data/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:K,staticGenerationAsyncStorage:A,serverHooks:v}=D,w="/api/(old-api)/sync-data/route";function q(){return(0,d.patchFetch)({serverHooks:v,staticGenerationAsyncStorage:A})}},17137:(e,t,i)=>{i.d(t,{G$:()=>u,ZV:()=>g,SL:()=>p,aP:()=>l});var a=i(57745),r=i(30900),s=i(9576),d=i(10413),n=i(43509),o=i(57435);async function l(e){try{let{configKeysIds:t,returnDraftsIfExist:i}={...e},o=t||[],l=o?.length?(0,a.d3)(n.configKeysDrafts.configKeyDraftId,o.map(e=>r.Z(e)?e:s.Z())):void 0,p=[...l?[l]:[]],c=i?await d.Z.query.configKeysDrafts.findMany({where:(0,a.xD)(...p)}):[];o=o.filter(e=>!c.map(e=>e.configKeyDraftId).includes(e));let g=c.length?(0,a.Nl)(n.configKeys.configKeyId,c.map(e=>e.configKeyDraftId)):void 0,u=o?.length?(0,a.d3)(n.configKeys.configKeyId,o.filter(e=>r.Z(e))):void 0,f=o?.length?(0,a.d3)(n.configKeys.oldConfigKeyId,o.filter(e=>!r.Z(e))):void 0,m=[(0,a.Ft)(n.configKeys.deletedAt),(0,a.Ft)(n.pendingDeletion),...u&&f?[(0,a.or)(u,f)]:[],g],y=(await d.Z.select({configKey:n.configKeys,pendingDeletion:n.pendingDeletion}).from(n.configKeys).leftJoin(n.pendingDeletion,(0,a.eq)(n.pendingDeletion.configKeyId,n.configKeys.configKeyId)).where(m.length?(0,a.xD)(...m):void 0)).map(e=>e.configKey),I=y.length?await d.Z.query.pendingDeletion.findMany({where:(0,a.d3)(n.pendingDeletion.configKeyId,y.map(e=>e.configKeyId)),columns:{configKeyId:!0}}):[];return{data:[...y.map(e=>({...e,isDraft:!1,isDeleted:!1})),...c.map(e=>({...e.data,isDraft:!0,isDeleted:!1}))].sort((e,t)=>e.position-t.position).filter(e=>!I.map(e=>e.configKeyId).includes(e.configKeyId))}}catch(e){return o.Z.error("_getConfigKeys ERROR",e.message),{data:[],errors:[e.message]}}}async function p(e){let{configKeyId:t,returnDraftIfExists:i}={...e};try{if(!t)throw Error("Missing configKeyId");let e=r.Z(t)?(0,a.eq)(n.configKeys.configKeyId,t):void 0,s=r.Z(t)?void 0:(0,a.eq)(n.configKeys.oldConfigKeyId,t),o=e?(0,a.eq)(n.configKeysDrafts.configKeyDraftId,t):void 0,l=i&&o?await d.Z.query.configKeysDrafts.findFirst({where:e}):void 0,p=l?{...l.data,isDraft:!1,isDeleted:!1}:null;if(p)return{data:p};let c=await d.Z.query.configKeys.findFirst({where:(0,a.xD)((0,a.Ft)(n.configKeys.deletedAt),e||s),with:{draft:!0}});l=i?c?.draft:void 0;let g=l?.data||c;if(!(p=g?{...g,isDraft:!1,isDeleted:!1}:null))return{data:null};return{data:p}}catch(e){return o.Z.error("_getConfigKey ERROR",e.message),{errors:[e.message]}}}var c=i(60938);let g={allPublished:0,publishedWithDrafts:0,allDrafts:0,newDrafts:0,pendingDeletion:0};async function u(){try{let[{count:e}]=await d.Z.select({count:(0,c.QX)()}).from(n.configKeysDrafts),[{count:t}]=await d.Z.select({count:(0,c.QX)()}).from(n.configKeysDrafts).where((0,a.Ft)(n.configKeysDrafts.configKeyId)),[{count:i}]=await d.Z.select({count:(0,c.QX)()}).from(n.configKeysDrafts).where((0,a.K0)(n.configKeysDrafts.configKeyId)),[{count:r}]=await d.Z.select({count:(0,c.QX)()}).from(n.pendingDeletion).where((0,a.K0)(n.pendingDeletion.configKeyId)),[{count:s}]=await d.Z.select({count:(0,c.QX)()}).from(n.configKeys);return{data:{allPublished:s,publishedWithDrafts:i,allDrafts:e,newDrafts:t,pendingDeletion:r}}}catch(e){return o.Z.error("_getConfigKeys ERROR",e.message),{data:g,errors:[e.message]}}}},88453:(e,t,i)=>{i.d(t,{Py:()=>c,C9:()=>l,O8:()=>o});var a=i(57745),r=i(30900),s=i(10413),d=i(43509),n=i(57435);async function o(e){try{let{hospitalsIds:t}={...e},i=t||[],n=i?.length?(0,a.d3)(d.hospitals.hospitalId,i.filter(e=>r.Z(e))):void 0,o=i?.length?(0,a.d3)(d.hospitals.oldHospitalId,i.filter(e=>!r.Z(e))):void 0,l=[(0,a.Ft)(d.hospitals.deletedAt),...n&&o?[(0,a.or)(n,o)]:[]];return{data:(await s.Z.select({hospital:d.hospitals}).from(d.hospitals).where(l.length?(0,a.xD)(...l):void 0)).map(e=>e.hospital)}}catch(e){return n.Z.error("_getHospitals ERROR",e.message),{data:[],errors:[e.message]}}}async function l(e){let{hospitalId:t}={...e};try{if(!t)throw Error("Missing hospitalId");let e=r.Z(t)?(0,a.eq)(d.hospitals.hospitalId,t):void 0,i=r.Z(t)?void 0:(0,a.eq)(d.hospitals.oldHospitalId,t);return{data:await s.Z.query.hospitals.findFirst({where:(0,a.xD)((0,a.Ft)(d.hospitals.deletedAt),e||i)})}}catch(e){return n.Z.error("_getHospital ERROR",e.message),{errors:[e.message]}}}var p=i(60938);async function c(){try{let[{count:e}]=await s.Z.select({count:(0,p.QX)()}).from(d.hospitals);return{data:e}}catch(e){return n.Z.error("_getHospitals ERROR",e.message),{data:0,errors:[e.message]}}}},44380:(e,t,i)=>{function a(e=""){let t=process.env.NEXT_PUBLIC_APP_URL||"";return"/"===t.substring(t.length-1,t.length)&&(t=t.substring(0,t.length-1)),"/"===e[0]&&(e=e.substring(1,e.length)),[t,e].filter(e=>e).join("/")}function r(e=""){try{return new URL(e),!0}catch(e){return!1}}i.d(t,{TI:()=>a,jv:()=>r})}};var t=require("../../../../webpack-runtime.js");t.C(e);var i=e=>t(t.s=e),a=t.X(0,[1633,1744,1381,3788,1490,9092,5802,5059,413,3750,7345],()=>i(8760));module.exports=a})();