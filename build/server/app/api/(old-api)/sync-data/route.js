"use strict";(()=>{var e={};e.id=3699,e.ids=[3699],e.modules={67096:e=>{e.exports=require("bcrypt")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},76224:e=>{e.exports=require("tty")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},71527:(e,t,i)=>{i.r(t),i.d(t,{originalPathname:()=>w,patchFetch:()=>v,requestAsyncStorage:()=>D,routeModule:()=>x,serverHooks:()=>A,staticGenerationAsyncStorage:()=>K});var r={};i.r(r),i.d(r,{GET:()=>h});var a=i(49303),s=i(88716),o=i(60670),d=i(87070),n=i(57435),l=i(72761),c=i(13269),p=i(17137),u=i(88453);function f(e){return{id:e.id,config_key_id:e.oldConfigKeyId||e.configKeyId,position:e.position,deletedAt:e.deletedAt,createdAt:e.createdAt,updatedAt:e.updatedAt,data:{configKey:e.key,configKeyId:e.oldConfigKeyId||e.configKeyId,createdAt:e.createdAt,label:e.label,source:e.source,summary:e.summary,updatedAt:e.updatedAt,position:e.position,id:e.id}}}function g(e){return{id:e.id,diagnosis_id:e.oldDiagnosisId||e.diagnosisId,position:e.position,script_id:e.oldScriptId||e.scriptId,deletedAt:e.deletedAt,createdAt:e.createdAt,updatedAt:e.updatedAt,data:{createdAt:e.createdAt,description:e.description,diagnosisId:e.oldDiagnosisId||e.diagnosisId,expression:e.expression,name:e.name,source:e.source,updatedAt:e.updatedAt,diagnosis_id:e.oldDiagnosisId||e.diagnosisId,scriptId:e.oldScriptId||e.scriptId,script_id:e.oldScriptId||e.scriptId,position:e.position,image1:e.image1,image2:e.image2,image3:e.image3,text1:e.text1,text2:e.text2,text3:e.text3,deletedAt:e.deletedAt,expressionMeaning:e.expressionMeaning,key:e.key,severity_order:e.severityOrder,symptoms:e.symptoms}}}function y(e){return{id:e.id,screen_id:e.oldScreenId||e.screenId,type:e.type,position:e.position,script_id:e.oldScriptId||e.scriptId,deletedAt:e.deletedAt,createdAt:e.createdAt,updatedAt:e.updatedAt,data:{skippable:e.skippable,condition:e.condition,epicId:e.epicId,storyId:e.storyId,refId:e.refId,step:e.step,title:e.title,title2:e.title2,title3:e.title3,title4:e.title4,sectionTitle:e.sectionTitle,actionText:e.actionText,contentText:e.contentText,instructions:e.instructions,instructions2:e.instructions2,instructions3:e.instructions3,instructions4:e.instructions4,hcwDiagnosesInstructions:e.hcwDiagnosesInstructions,suggestedDiagnosesInstructions:e.suggestedDiagnosesInstructions,notes:e.notes,type:e.type,screenId:e.oldScreenId||e.screenId,scriptId:e.oldScriptId||e.scriptId,script_id:e.oldScriptId||e.scriptId,screen_id:e.oldScreenId||e.screenId,position:e.position,createdAt:e.createdAt,updatedAt:e.updatedAt,deletedAt:e.deletedAt,source:e.source,infoText:e.infoText,printable:e.printable,refKey:e.refKey,prePopulate:e.prePopulate,id:e.id,previewTitle:e.previewTitle,previewPrintTitle:e.previewPrintTitle,metadata:{confidential:e.confidential,dataType:e.dataType,key:e.key,label:e.label,text3:e.text3,title1:e.title1,title2:e.title2,title3:e.title3,text1:e.text1,text2:e.text2,item:e.items,fields:e.fields}}}}function m(e){return{id:e.id,script_id:e.oldScriptId||e.scriptId,position:e.position,deletedAt:e.deletedAt,createdAt:e.createdAt,updatedAt:e.updatedAt,data:{createdAt:e.createdAt,description:e.description,position:e.position,scriptId:e.oldScriptId||e.scriptId,script_id:e.oldScriptId||e.scriptId,title:e.title,updatedAt:e.updatedAt,deletedAt:e.deletedAt,type:e.type,exportable:e.exportable,hospital:e.hospitalId,printTitle:e.printTitle,id:e.id,nuid_search_enabled:e.nuidSearchEnabled,nuidSearchFields:e.nuidSearchFields.map(e=>({calculation:e.calculation,condition:e.condition,confidential:e.confidential,dataType:e.dataType,defaultValue:e.defaultValue,format:e.format,type:e.type,key:e.key,refKey:e.refKey,label:e.label,minValue:e.minValue,maxValue:e.maxValue,optional:e.optional,minDate:e.minDate,maxDate:e.maxDate,minTime:e.minTime,maxTime:e.maxTime,minDateKey:e.minDateKey,maxDateKey:e.maxDateKey,minTimeKey:e.minTimeKey,maxTimeKey:e.maxTimeKey,values:e.values}))}}}var I=i(84056);async function h(e){try{if(!(await (0,l.$)()).yes)return d.NextResponse.json({errors:["Unauthorised"]});let t=e.nextUrl.searchParams.get("deviceId"),{device:i,info:r,errors:a}=await (0,I._)(t);if(a)return d.NextResponse.json({errors:a});let[s,o,n,h,x]=await Promise.all([(0,u.O8)(),(0,c.Tw)({withDeleted:!0,returnDraftsIfExist:!1}),(0,c.uK)({withDeleted:!0,returnDraftsIfExist:!1}),(0,c.XA)({withDeleted:!0,returnDraftsIfExist:!1}),(0,p.aP)({withDeleted:!0,returnDraftsIfExist:!1})]),D=x.data.filter(e=>!e.isDeleted).map(e=>f(e)),K=x.data.filter(e=>e.isDeleted).map(e=>f(e)),A=o.data.filter(e=>!e.isDeleted).map(e=>{let t=s.data.filter(t=>t.hospitalId===e.hospitalId)[0]?.oldHospitalId;return m({...e,hospitalId:t||e.hospitalId})}),w=o.data.filter(e=>e.isDeleted).map(e=>{let t=s.data.filter(t=>t.hospitalId===e.hospitalId)[0]?.oldHospitalId;return m({...e,hospitalId:t||e.hospitalId})}),v=n.data.filter(e=>!e.isDeleted).map(e=>y(e)),q=n.data.filter(e=>e.isDeleted).map(e=>y(e)),Z=h.data.filter(e=>!e.isDeleted).map(e=>g(e)),_=h.data.filter(e=>e.isDeleted).map(e=>g(e));return d.NextResponse.json({device:i,webeditorInfo:r,configKeys:D,deletedConfigKeys:K,deletedDiagnoses:_,deletedScreens:q,deletedScripts:w,diagnoses:Z,screens:v,scripts:A})}catch(e){return n.Z.error("[GET] /api/sync",e.message),d.NextResponse.json({errors:["Internal Error"]})}}let x=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/(old-api)/sync-data/route",pathname:"/api/sync-data",filename:"route",bundlePath:"app/api/(old-api)/sync-data/route"},resolvedPagePath:"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/api/(old-api)/sync-data/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:D,staticGenerationAsyncStorage:K,serverHooks:A}=x,w="/api/(old-api)/sync-data/route";function v(){return(0,o.patchFetch)({serverHooks:A,staticGenerationAsyncStorage:K})}},84056:(e,t,i)=>{i.d(t,{_:()=>n});var r=i(57435),a=i(81339),s=i(10413);async function o(){try{return{data:await s.Z.query.editorInfo.findFirst()||null}}catch(e){return r.Z.error("_getEditorInfo ERROR",e.message),{data:null,errors:[e.message]}}}var d=i(55249);async function n(e){try{if(!e)throw Error("Device ID not provided!");let t=await o();if(t?.errors)throw Error(t.errors.join(", "));let i=e?await (0,a.$s)({deviceId:e}):{data:null};if(i?.errors)throw Error(i.errors.join(", "));let r=i.data;if(!r){let t=await (0,d.w)({data:[{deviceId:e,details:{scripts_count:0}}],returnSaved:!0});if(t?.errors)throw Error(t.errors.join(", "));r=t.inserted[0]}return{device:{id:r?.id,details:r?.details,device_id:r?.deviceId,device_hash:r?.deviceHash,deletedAt:r?.deletedAt,createdAt:r?.createdAt,updatedAt:r?.updatedAt},info:{id:t.data?.id,version:t.data?.dataVersion,should_track_usage:!1,last_backup_date:t.data?.lastPublishDate}}}catch(e){return r.Z.error("getDevice ERROR",e.message),{errors:[e.message]}}}},17137:(e,t,i)=>{i.d(t,{G$:()=>f,ZV:()=>u,SL:()=>c,aP:()=>l});var r=i(57745),a=i(30900),s=i(9576),o=i(10413),d=i(57418),n=i(57435);async function l(e){try{let{configKeysIds:t,returnDraftsIfExist:i}={...e},n=t||[],l=n?.length?(0,r.d3)(d.configKeysDrafts.configKeyDraftId,n.map(e=>a.Z(e)?e:s.Z())):void 0,c=[...l?[l]:[]],p=i?await o.Z.query.configKeysDrafts.findMany({where:(0,r.xD)(...c)}):[];n=n.filter(e=>!p.map(e=>e.configKeyDraftId).includes(e));let u=p.length?(0,r.Nl)(d.configKeys.configKeyId,p.map(e=>e.configKeyDraftId)):void 0,f=n?.length?(0,r.d3)(d.configKeys.configKeyId,n.filter(e=>a.Z(e))):void 0,g=n?.length?(0,r.d3)(d.configKeys.oldConfigKeyId,n.filter(e=>!a.Z(e))):void 0,y=[(0,r.Ft)(d.configKeys.deletedAt),(0,r.Ft)(d.pendingDeletion),...f&&g?[(0,r.or)(f,g)]:[],u],m=(await o.Z.select({configKey:d.configKeys,pendingDeletion:d.pendingDeletion}).from(d.configKeys).leftJoin(d.pendingDeletion,(0,r.eq)(d.pendingDeletion.configKeyId,d.configKeys.configKeyId)).where(y.length?(0,r.xD)(...y):void 0)).map(e=>e.configKey),I=m.length?await o.Z.query.pendingDeletion.findMany({where:(0,r.d3)(d.pendingDeletion.configKeyId,m.map(e=>e.configKeyId)),columns:{configKeyId:!0}}):[];return{data:[...m.map(e=>({...e,isDraft:!1,isDeleted:!1})),...p.map(e=>({...e.data,isDraft:!0,isDeleted:!1}))].sort((e,t)=>e.position-t.position).filter(e=>!I.map(e=>e.configKeyId).includes(e.configKeyId))}}catch(e){return n.Z.error("_getConfigKeys ERROR",e.message),{data:[],errors:[e.message]}}}async function c(e){let{configKeyId:t,returnDraftIfExists:i}={...e};try{if(!t)throw Error("Missing configKeyId");let e=a.Z(t)?(0,r.eq)(d.configKeys.configKeyId,t):void 0,s=a.Z(t)?void 0:(0,r.eq)(d.configKeys.oldConfigKeyId,t),n=e?(0,r.eq)(d.configKeysDrafts.configKeyDraftId,t):void 0,l=i&&n?await o.Z.query.configKeysDrafts.findFirst({where:e}):void 0,c=l?{...l.data,isDraft:!1,isDeleted:!1}:null;if(c)return{data:c};let p=await o.Z.query.configKeys.findFirst({where:(0,r.xD)((0,r.Ft)(d.configKeys.deletedAt),e||s),with:{draft:!0}});l=i?p?.draft:void 0;let u=l?.data||p;if(!(c=u?{...u,isDraft:!1,isDeleted:!1}:null))return{data:null};return{data:c}}catch(e){return n.Z.error("_getConfigKey ERROR",e.message),{errors:[e.message]}}}var p=i(60938);let u={allPublished:0,publishedWithDrafts:0,allDrafts:0,newDrafts:0,pendingDeletion:0};async function f(){try{let[{count:e}]=await o.Z.select({count:(0,p.QX)()}).from(d.configKeysDrafts),[{count:t}]=await o.Z.select({count:(0,p.QX)()}).from(d.configKeysDrafts).where((0,r.Ft)(d.configKeysDrafts.configKeyId)),[{count:i}]=await o.Z.select({count:(0,p.QX)()}).from(d.configKeysDrafts).where((0,r.K0)(d.configKeysDrafts.configKeyId)),[{count:a}]=await o.Z.select({count:(0,p.QX)()}).from(d.pendingDeletion).where((0,r.K0)(d.pendingDeletion.configKeyId)),[{count:s}]=await o.Z.select({count:(0,p.QX)()}).from(d.configKeys);return{data:{allPublished:s,publishedWithDrafts:i,allDrafts:e,newDrafts:t,pendingDeletion:a}}}catch(e){return n.Z.error("_getConfigKeys ERROR",e.message),{data:u,errors:[e.message]}}}},88453:(e,t,i)=>{i.d(t,{Py:()=>p,C9:()=>l,O8:()=>n});var r=i(57745),a=i(30900),s=i(10413),o=i(57418),d=i(57435);async function n(e){try{let{hospitalsIds:t}={...e},i=t||[],d=i?.length?(0,r.d3)(o.hospitals.hospitalId,i.filter(e=>a.Z(e))):void 0,n=i?.length?(0,r.d3)(o.hospitals.oldHospitalId,i.filter(e=>!a.Z(e))):void 0,l=[(0,r.Ft)(o.hospitals.deletedAt),...d&&n?[(0,r.or)(d,n)]:[]];return{data:(await s.Z.select({hospital:o.hospitals}).from(o.hospitals).where(l.length?(0,r.xD)(...l):void 0)).map(e=>e.hospital)}}catch(e){return d.Z.error("_getHospitals ERROR",e.message),{data:[],errors:[e.message]}}}async function l(e){let{hospitalId:t}={...e};try{if(!t)throw Error("Missing hospitalId");let e=a.Z(t)?(0,r.eq)(o.hospitals.hospitalId,t):void 0,i=a.Z(t)?void 0:(0,r.eq)(o.hospitals.oldHospitalId,t);return{data:await s.Z.query.hospitals.findFirst({where:(0,r.xD)((0,r.Ft)(o.hospitals.deletedAt),e||i)})}}catch(e){return d.Z.error("_getHospital ERROR",e.message),{errors:[e.message]}}}var c=i(60938);async function p(){try{let[{count:e}]=await s.Z.select({count:(0,c.QX)()}).from(o.hospitals);return{data:e}}catch(e){return d.Z.error("_getHospitals ERROR",e.message),{data:0,errors:[e.message]}}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var i=e=>t(t.s=e),r=t.X(0,[5822,3788,1744,1490,5802,5972,413,3269,6427],()=>i(71527));module.exports=r})();