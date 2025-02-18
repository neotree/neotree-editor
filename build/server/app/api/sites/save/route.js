(()=>{var e={};e.id=431,e.ids=[431],e.modules={67096:e=>{"use strict";e.exports=require("bcrypt")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{"use strict";e.exports=require("assert")},14300:e=>{"use strict";e.exports=require("buffer")},32081:e=>{"use strict";e.exports=require("child_process")},6113:e=>{"use strict";e.exports=require("crypto")},82361:e=>{"use strict";e.exports=require("events")},57147:e=>{"use strict";e.exports=require("fs")},13685:e=>{"use strict";e.exports=require("http")},95687:e=>{"use strict";e.exports=require("https")},41808:e=>{"use strict";e.exports=require("net")},6005:e=>{"use strict";e.exports=require("node:crypto")},87561:e=>{"use strict";e.exports=require("node:fs")},49411:e=>{"use strict";e.exports=require("node:path")},22037:e=>{"use strict";e.exports=require("os")},4074:e=>{"use strict";e.exports=require("perf_hooks")},63477:e=>{"use strict";e.exports=require("querystring")},12781:e=>{"use strict";e.exports=require("stream")},24404:e=>{"use strict";e.exports=require("tls")},76224:e=>{"use strict";e.exports=require("tty")},57310:e=>{"use strict";e.exports=require("url")},73837:e=>{"use strict";e.exports=require("util")},59796:e=>{"use strict";e.exports=require("zlib")},58359:()=>{},93739:()=>{},68211:(e,t,r)=>{"use strict";r.r(t),r.d(t,{originalPathname:()=>f,patchFetch:()=>y,requestAsyncStorage:()=>g,routeModule:()=>p,serverHooks:()=>h,staticGenerationAsyncStorage:()=>x});var s={};r.r(s),r.d(s,{POST:()=>l});var i=r(49303),a=r(88716),o=r(60670),n=r(87070),u=r(72761),c=r(82065),d=r(57435);async function l(e){try{if(!(await (0,u.$)()).yes)return n.NextResponse.json({errors:["Unauthorised"]},{status:200});let t=await e.json(),r=await (0,c.saveSites)(t);return n.NextResponse.json(r)}catch(e){return d.Z.log("[POST] /api/sites/save",e),n.NextResponse.json({errors:[e.message]})}}let p=new i.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/sites/save/route",pathname:"/api/sites/save",filename:"route",bundlePath:"app/api/sites/save/route"},resolvedPagePath:"/home/morris/Documents/NEOTREE/REPOS/neotree-editor/app/api/sites/save/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:g,staticGenerationAsyncStorage:x,serverHooks:h}=p,f="/api/sites/save/route";function y(){return(0,o.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:x})}},82065:(e,t,r)=>{"use strict";r.r(t),r.d(t,{$$ACTION_0:()=>y,getSite:()=>g,getSites:()=>x,getSitesWithoutConfidentialData:()=>h,saveSites:()=>f});var s=r(24330);r(60166);var i=r(57435),a=r(10413),o=r(88182),n=r(88317),u=r(57745);async function c(e){let t={success:!1};try{let r=e.filter(e=>e.id),s=e.filter(e=>!e.id),i=[];for(let e of r)try{await a.Z.update(o.sites).set(e).where((0,u.eq)(o.sites.id,e.id))}catch(e){i.push(e.message)}s.length&&await a.Z.insert(o.sites).values(s),i.length?t.errors=i:t.success=!0}catch(e){t.success=!1,t.errors=[e.message],i.Z.error("_saveSites ERROR",e.message)}finally{return t?.errors?.length||n.Z.emit("data_changed","save_sites"),t}}var d=r(20123),l=r(66267),p=r(40618);let g=d.Ng,x=d.QF,h=d.YF,f=(0,s.j)("ebe3a2ba294d038570cb707b428619f03166a9b0",y);async function y(...e){try{return await (0,l.isAllowed)(),await c(...e)}catch(e){return i.Z.error("getSys ERROR",e.message),{errors:[e.message],data:void 0,success:!1}}}(0,p.h)([g,x,h,f]),(0,s.j)("e8bb0492bc53ca0b5b588864e13ea93167a12f10",g),(0,s.j)("dd5420619b99956dd11ccbca7279d7a42c665702",x),(0,s.j)("ffdb8ae8b2dfd69ac00ecfbf467274c24d838b26",h),(0,s.j)("bde73ff79f4781514fc96717f7ceaa9df9dd545c",f)},20123:(e,t,r)=>{"use strict";r.d(t,{Ng:()=>d,_U:()=>x,QF:()=>c,YF:()=>g});var s=r(57745),i=r(81445),a=r(30900),o=r(10413),n=r(88182),u=r(57435);async function c(e){try{let{sitesIds:t,types:r=[],envs:u=[],links:c=[]}={...e},d=t||[],l=d?.length?(0,s.d3)(n.sites.siteId,d.filter(e=>a.Z(e))):void 0;c.length&&[...c].forEach(e=>{c.push(e.replace("http:","https:")),c.push(e.replace("https","http"))});let p=[(0,s.Ft)(n.sites.deletedAt),l,r.length?(0,s.d3)(n.sites.type,r):void 0,u.length?(0,s.d3)(n.sites.env,u):void 0,c.length?(0,s.d3)(n.sites.link,c):void 0];return{data:(await o.Z.select({site:n.sites}).from(n.sites).where(p.length?(0,s.xD)(...p):void 0).orderBy((0,i.d)(n.sites.id))).map(e=>e.site)}}catch(e){return u.Z.error("_getSites ERROR",e.message),{data:[],errors:[e.message]}}}async function d(e){let{siteId:t}={...e};try{if(!t)throw Error("Missing siteId");let e=a.Z(t)?(0,s.eq)(n.sites.siteId,t):void 0;return{data:await o.Z.query.sites.findFirst({where:(0,s.xD)((0,s.Ft)(n.sites.deletedAt),e)})}}catch(e){return u.Z.error("_getSite ERROR",e.message),{errors:[e.message]}}}var l=r(8328);let p=()=>{let e=(0,l.w)();return{webeditor:{name:"Local editor",siteId:"fb76af5a-bf86-4050-821e-44f1bf316bf4",link:e.origin,type:"webeditor",apiKey:"localhost"},nodeapi:{name:"Local editor",siteId:"5cb4aa54-2cfe-49e2-9cdd-392a9b8c124e",link:e.origin,type:"webeditor",apiKey:"localhost"}}};async function g(e){try{let{types:t=[]}={...e},r=[...t.length?[(0,s.d3)(n.sites.type,t)]:[]],i=await o.Z.query.sites.findMany({where:r.length?(0,s.xD)(...r):void 0,columns:{siteId:!0,type:!0,name:!0,link:!0}});return p(),{data:[...i]}}catch(e){return u.Z.error("_getSites ERROR",e.message),{data:[],errors:[e.message]}}}async function x(e){try{let t=await o.Z.query.sites.findFirst({where:(0,s.eq)(n.sites.siteId,e),columns:{apiKey:!0,link:!0}}),r=t||null;if(!t){let t=p();Object.values(t).forEach(t=>{t.siteId===e&&(r={link:t.link,apiKey:t.apiKey})})}return{data:r}}catch(e){return u.Z.error("_getSiteApiKey ERROR",e.message),{data:null,errors:[e.message]}}}},8328:(e,t,r)=>{"use strict";r.d(t,{w:()=>i});var s=r(71615);function i(){let e=(0,s.headers)(),t=e.get("x-api-key"),r=e.get("x-bearer-token"),i=e.get("x-url"),a=e.get("x-next-url-host"),o=e.get("x-next-url-href"),n=e.get("x-next-url-port"),u=e.get("x-next-url-hostname"),c=e.get("x-next-url-pathname"),d=e.get("x-next-url-search"),l=e.get("x-next-url-protocol"),p=e.get("x-next-url-username"),g=e.get("x-next-url-locale"),x=e.get("x-next-url-origin"),h=e.get("x-geo-city"),f=e.get("x-geo-country");return{apiKey:t,bearerToken:r,url:i||"",host:a||"",href:o||"",port:n||"",hostname:u||"",pathname:c||"",search:d||"",protocol:l||"",username:p||"",locale:g||"",origin:x||"",city:h||"",country:f||"",region:e.get("x-geo-region")||"",latitude:e.get("x-geo-latitude")||"",longitude:e.get("x-geo-longitude")||""}}},88317:(e,t,r)=>{"use strict";r.d(t,{Z:()=>s});let s=(0,r(55802).io)(process.env.NEXT_PUBLIC_APP_URL)}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[1633,1744,9937,3788,1490,9092,5802,5059,413,6267],()=>r(68211));module.exports=s})();