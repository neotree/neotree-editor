(()=>{var e={};e.id=398,e.ids=[398],e.modules={67096:e=>{"use strict";e.exports=require("bcrypt")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{"use strict";e.exports=require("assert")},14300:e=>{"use strict";e.exports=require("buffer")},32081:e=>{"use strict";e.exports=require("child_process")},6113:e=>{"use strict";e.exports=require("crypto")},82361:e=>{"use strict";e.exports=require("events")},57147:e=>{"use strict";e.exports=require("fs")},13685:e=>{"use strict";e.exports=require("http")},95687:e=>{"use strict";e.exports=require("https")},41808:e=>{"use strict";e.exports=require("net")},6005:e=>{"use strict";e.exports=require("node:crypto")},87561:e=>{"use strict";e.exports=require("node:fs")},49411:e=>{"use strict";e.exports=require("node:path")},22037:e=>{"use strict";e.exports=require("os")},4074:e=>{"use strict";e.exports=require("perf_hooks")},63477:e=>{"use strict";e.exports=require("querystring")},12781:e=>{"use strict";e.exports=require("stream")},24404:e=>{"use strict";e.exports=require("tls")},76224:e=>{"use strict";e.exports=require("tty")},57310:e=>{"use strict";e.exports=require("url")},73837:e=>{"use strict";e.exports=require("util")},59796:e=>{"use strict";e.exports=require("zlib")},58359:()=>{},93739:()=>{},77357:(e,t,i)=>{"use strict";i.r(t),i.d(t,{originalPathname:()=>p,patchFetch:()=>h,requestAsyncStorage:()=>l,routeModule:()=>y,serverHooks:()=>K,staticGenerationAsyncStorage:()=>u});var s={};i.r(s),i.d(s,{POST:()=>d});var n=i(49303),r=i(88716),o=i(60670),a=i(87070),c=i(72761),f=i(82984),g=i(57435);async function d(e){try{if(!(await (0,c.$)()).yes)return a.NextResponse.json({errors:["Unauthorised"]},{status:200});let t=await e.json(),i=await (0,f.saveConfigKeys)(t);return a.NextResponse.json(i)}catch(e){return g.Z.log("/api/config-keys/save",e),a.NextResponse.json({errors:[e.message]})}}let y=new n.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/config-keys/save/route",pathname:"/api/config-keys/save",filename:"route",bundlePath:"app/api/config-keys/save/route"},resolvedPagePath:"/home/farai/Workbench/Neotree/neotree-editor-master/app/api/config-keys/save/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:l,staticGenerationAsyncStorage:u,serverHooks:K}=y,p="/api/config-keys/save/route";function h(){return(0,o.patchFetch)({serverHooks:K,staticGenerationAsyncStorage:u})}},82984:(e,t,i)=>{"use strict";i.r(t),i.d(t,{$$ACTION_0:()=>g,$$ACTION_1:()=>y,$$ACTION_2:()=>u,$$ACTION_3:()=>p,$$ACTION_4:()=>w,countConfigKeys:()=>d,deleteConfigKeys:()=>f,getConfigKey:()=>K,getConfigKeys:()=>l,saveConfigKeys:()=>h});var s=i(24330);i(60166);var n=i(92963),r=i(17137),o=i(57435),a=i(66267),c=i(40618);let f=(0,s.j)("3e57a2adfc2cec65456c01a6565befe9e8547c8e",g);async function g(...e){try{return await (0,a.isAllowed)(),await (0,n.LR)(...e)}catch(e){return o.Z.error("deleteConfigKeys ERROR",e.message),{errors:[e.message],success:!1}}}let d=(0,s.j)("6c95086071eff422ebd1d4b6e6ee155a3c46f6c8",y);async function y(...e){try{return await (0,a.isAllowed)(),await (0,r.G$)(...e)}catch(e){return o.Z.error("countConfigKeys ERROR",e.message),{errors:[e.message],data:r.ZV}}}let l=(0,s.j)("62ea292ea7bd062ae9a55ba7a3503f9e7e599915",u);async function u(...e){try{return await (0,a.isAllowed)(),await (0,r.aP)(...e)}catch(e){return o.Z.error("getConfigKeys ERROR",e.message),{errors:[e.message],data:[]}}}let K=(0,s.j)("0629ec683958ae4ac80748c94405db82a154b329",p);async function p(...e){return await (0,a.isAllowed)(),await (0,r.SL)(...e)}let h=(0,s.j)("e21a375b945716611ba084403261b4c7e40dc61a",w);async function w(...e){try{return await (0,a.isAllowed)(),await (0,n.UZ)(...e)}catch(e){return o.Z.error("getSys ERROR",e.message),{errors:[e.message],data:void 0,success:!1}}}(0,c.h)([f,d,l,K,h]),(0,s.j)("a45f560dc70d04c51017497cf228b59b14e3a61d",f),(0,s.j)("1e8712a78e06b07381786906141b4f76aa034282",d),(0,s.j)("9ccd5e094cc921f03b8ebcce1344ce01a782dc1f",l),(0,s.j)("906e186afa6b5cb43aeb047dacac6e3a441a2909",K),(0,s.j)("3dbb234f8b6b79574e997d6aa6ac1c27bbfca65a",h)},92963:(e,t,i)=>{"use strict";i.d(t,{sj:()=>d,LR:()=>y,h:()=>K,UZ:()=>g});var s=i(57745),n=i(81445),r=i(9576),o=i(57435),a=i(10413),c=i(43509),f=i(88317);async function g({data:e,broadcastAction:t}){let i={success:!1};try{let t=[];for(let{configKeyId:i,...o}of e)try{let e=i||r.Z();if(!t.length){let t=i?await a.Z.query.configKeysDrafts.findFirst({where:(0,s.eq)(c.configKeysDrafts.configKeyDraftId,e)}):null,r=t||!i?null:await a.Z.query.configKeys.findFirst({where:(0,s.eq)(c.configKeys.configKeyId,e)});if(t){let i={...t.data,...o};await a.Z.update(c.configKeysDrafts).set({data:i,position:i.position}).where((0,s.eq)(c.configKeysDrafts.configKeyDraftId,e))}else{let t=o.position||r?.position;if(!t){let e=await a.Z.query.configKeys.findFirst({columns:{position:!0},orderBy:(0,n.C)(c.configKeys.position)}),i=await a.Z.query.configKeysDrafts.findFirst({columns:{position:!0},orderBy:(0,n.C)(c.configKeysDrafts.position)});t=Math.max(0,e?.position||0,i?.position||0)+1}let i={...r,...o,configKeyId:e,version:r?.version?r.version+1:1,position:t};await a.Z.insert(c.configKeysDrafts).values({data:i,configKeyDraftId:e,position:i.position,configKeyId:r?.configKeyId})}}}catch(e){t.push(e.message)}t.length?i.errors=t:i.success=!0}catch(e){i.success=!1,i.errors=[e.message],o.Z.error("_saveConfigKeys ERROR",e.message)}finally{return!i?.errors?.length&&t&&f.Z.emit("data_changed","save_config_keys"),i}}async function d(){try{return await a.Z.delete(c.configKeysDrafts),!0}catch(e){throw e}}async function y({configKeysIds:e,broadcastAction:t}){let i={success:!1};try{if(e.length){await a.Z.delete(c.configKeysDrafts).where((0,s.d3)(c.configKeysDrafts.configKeyDraftId,e));let t=(await a.Z.select({configKeyId:c.configKeys.configKeyId,pendingDeletion:c.pendingDeletion.configKeyId}).from(c.configKeys).leftJoin(c.pendingDeletion,(0,s.eq)(c.pendingDeletion.configKeyId,c.configKeys.configKeyId)).where((0,s.d3)(c.configKeys.configKeyId,e))).filter(e=>!e.pendingDeletion);t.length&&await a.Z.insert(c.pendingDeletion).values(t)}i.success=!0}catch(e){i.success=!1,i.errors=[e.message],o.Z.error("_deleteConfigKeys ERROR",e.message)}finally{return!i?.errors?.length&&t&&f.Z.emit("data_changed","delete_config_keys"),i}}async function l({previous:e,drafts:t}){try{let i=[];for(let s of t){let t={version:s?.data?.version||1,configKeyId:s?.data?.configKeyId,changes:{}};if(s?.data?.version===1)t.changes={action:"create_config_key",deconfigKeyion:"Create config key",oldValues:[],newValues:[]};else{let i=e.filter(e=>e.configKeyId===s?.data?.configKeyId)[0],n=[],r=[];Object.keys({...s?.data}).filter(e=>!["version","draft"].includes(e)).forEach(e=>{let t=s.data[e],o={...i}[e];JSON.stringify(t)!==JSON.stringify(o)&&(n.push({[e]:o}),r.push({[e]:t}))}),t.changes={action:"update_config_key",description:"Update config key",oldValues:n,newValues:r}}i.push(t)}await a.Z.insert(c.configKeysHistory).values(i)}catch(e){o.Z.error(e.message)}}var u=i(34149);async function K(e){let t={success:!1};try{let e=[],i=[],n=await a.Z.query.configKeysDrafts.findMany();if(e=n.filter(e=>e.configKeyId),i=n.filter(e=>!e.configKeyId),e.length){let t=[];for(let{configKeyId:i,data:n}of(e.filter(e=>e.configKeyId).length&&(t=await a.Z.query.configKeys.findMany({where:(0,s.d3)(c.configKeys.configKeyId,e.filter(e=>e.configKeyId).map(e=>e.configKeyId))})),e)){let{configKeyId:e,id:t,oldConfigKeyId:r,createdAt:o,updatedAt:f,deletedAt:g,...d}=n,y={...d,publishDate:new Date};await a.Z.update(c.configKeys).set(y).where((0,s.eq)(c.configKeys.configKeyId,i)).returning()}await l({drafts:e,previous:t})}if(i.length){let e=[];for(let{id:t,data:n}of(i.filter(e=>e.configKeyId).length&&(e=await a.Z.query.configKeys.findMany({where:(0,s.d3)(c.configKeys.configKeyId,i.filter(e=>e.configKeyId).map(e=>e.configKeyId))})),i)){let e=n.configKeyId||(0,r.Z)(),s={...n,configKeyId:e};i=i.map(i=>(i.id===t&&(i.data.configKeyId=e),i)),await a.Z.insert(c.configKeys).values(s)}await l({drafts:i,previous:e})}await a.Z.delete(c.configKeysDrafts);let o=await a.Z.query.pendingDeletion.findMany({where:(0,s.K0)(c.pendingDeletion.configKeyId),columns:{configKeyId:!0},with:{configKey:{columns:{version:!0}}}});if((o=o.filter(e=>e.configKey)).length){let e=new Date;await a.Z.update(c.configKeys).set({deletedAt:e}).where((0,s.d3)(c.configKeys.configKeyId,o.map(e=>e.configKeyId))),await a.Z.insert(c.configKeysHistory).values(o.map(t=>({version:t.configKey.version,configKeyId:t.configKeyId,changes:{action:"delete_config_key",description:"Delete config key",oldValues:[{deletedAt:null}],newValues:[{deletedAt:e}]}})))}await a.Z.delete(c.pendingDeletion).where((0,s.or)((0,s.K0)(c.pendingDeletion.configKeyId),(0,s.K0)(c.pendingDeletion.configKeyDraftId)));let f=[...e.map(e=>e.configKeyId),...o.map(e=>e.configKeyId)];f.length&&await a.Z.update(c.configKeys).set({version:(0,u.i6)`${c.configKeys.version} + 1`}).where((0,s.d3)(c.configKeys.configKeyId,f)),t.success=!0}catch(e){t.success=!1,t.errors=[e.message],o.Z.error("_publishConfigKeys ERROR",e)}finally{return t}}},17137:(e,t,i)=>{"use strict";i.d(t,{G$:()=>l,ZV:()=>y,SL:()=>g,aP:()=>f});var s=i(57745),n=i(30900),r=i(9576),o=i(10413),a=i(43509),c=i(57435);async function f(e){try{let{configKeysIds:t,returnDraftsIfExist:i}={...e},c=t||[],f=c?.length?(0,s.d3)(a.configKeysDrafts.configKeyDraftId,c.map(e=>n.Z(e)?e:r.Z())):void 0,g=[...f?[f]:[]],d=i?await o.Z.query.configKeysDrafts.findMany({where:(0,s.xD)(...g)}):[];c=c.filter(e=>!d.map(e=>e.configKeyDraftId).includes(e));let y=d.length?(0,s.Nl)(a.configKeys.configKeyId,d.map(e=>e.configKeyDraftId)):void 0,l=c?.length?(0,s.d3)(a.configKeys.configKeyId,c.filter(e=>n.Z(e))):void 0,u=c?.length?(0,s.d3)(a.configKeys.oldConfigKeyId,c.filter(e=>!n.Z(e))):void 0,K=[(0,s.Ft)(a.configKeys.deletedAt),(0,s.Ft)(a.pendingDeletion),...l&&u?[(0,s.or)(l,u)]:[],y],p=(await o.Z.select({configKey:a.configKeys,pendingDeletion:a.pendingDeletion}).from(a.configKeys).leftJoin(a.pendingDeletion,(0,s.eq)(a.pendingDeletion.configKeyId,a.configKeys.configKeyId)).where(K.length?(0,s.xD)(...K):void 0)).map(e=>e.configKey),h=p.length?await o.Z.query.pendingDeletion.findMany({where:(0,s.d3)(a.pendingDeletion.configKeyId,p.map(e=>e.configKeyId)),columns:{configKeyId:!0}}):[];return{data:[...p.map(e=>({...e,isDraft:!1,isDeleted:!1})),...d.map(e=>({...e.data,isDraft:!0,isDeleted:!1}))].sort((e,t)=>e.position-t.position).filter(e=>!h.map(e=>e.configKeyId).includes(e.configKeyId))}}catch(e){return c.Z.error("_getConfigKeys ERROR",e.message),{data:[],errors:[e.message]}}}async function g(e){let{configKeyId:t,returnDraftIfExists:i}={...e};try{if(!t)throw Error("Missing configKeyId");let e=n.Z(t)?(0,s.eq)(a.configKeys.configKeyId,t):void 0,r=n.Z(t)?void 0:(0,s.eq)(a.configKeys.oldConfigKeyId,t),c=e?(0,s.eq)(a.configKeysDrafts.configKeyDraftId,t):void 0,f=i&&c?await o.Z.query.configKeysDrafts.findFirst({where:e}):void 0,g=f?{...f.data,isDraft:!1,isDeleted:!1}:null;if(g)return{data:g};let d=await o.Z.query.configKeys.findFirst({where:(0,s.xD)((0,s.Ft)(a.configKeys.deletedAt),e||r),with:{draft:!0}});f=i?d?.draft:void 0;let y=f?.data||d;if(!(g=y?{...y,isDraft:!1,isDeleted:!1}:null))return{data:null};return{data:g}}catch(e){return c.Z.error("_getConfigKey ERROR",e.message),{errors:[e.message]}}}var d=i(60938);let y={allPublished:0,publishedWithDrafts:0,allDrafts:0,newDrafts:0,pendingDeletion:0};async function l(){try{let[{count:e}]=await o.Z.select({count:(0,d.QX)()}).from(a.configKeysDrafts),[{count:t}]=await o.Z.select({count:(0,d.QX)()}).from(a.configKeysDrafts).where((0,s.Ft)(a.configKeysDrafts.configKeyId)),[{count:i}]=await o.Z.select({count:(0,d.QX)()}).from(a.configKeysDrafts).where((0,s.K0)(a.configKeysDrafts.configKeyId)),[{count:n}]=await o.Z.select({count:(0,d.QX)()}).from(a.pendingDeletion).where((0,s.K0)(a.pendingDeletion.configKeyId)),[{count:r}]=await o.Z.select({count:(0,d.QX)()}).from(a.configKeys);return{data:{allPublished:r,publishedWithDrafts:i,allDrafts:e,newDrafts:t,pendingDeletion:n}}}catch(e){return c.Z.error("_getConfigKeys ERROR",e.message),{data:y,errors:[e.message]}}}},88317:(e,t,i)=>{"use strict";i.d(t,{Z:()=>s});let s=(0,i(55802).io)(process.env.NEXT_PUBLIC_APP_URL)}};var t=require("../../../../webpack-runtime.js");t.C(e);var i=e=>t(t.s=e),s=t.X(0,[1633,1744,9937,3788,1490,9092,5802,5059,413,6267],()=>i(77357));module.exports=s})();