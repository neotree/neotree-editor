(()=>{var e={};e.id=4171,e.ids=[4171],e.modules={67096:e=>{"use strict";e.exports=require("bcrypt")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{"use strict";e.exports=require("assert")},14300:e=>{"use strict";e.exports=require("buffer")},32081:e=>{"use strict";e.exports=require("child_process")},6113:e=>{"use strict";e.exports=require("crypto")},82361:e=>{"use strict";e.exports=require("events")},57147:e=>{"use strict";e.exports=require("fs")},13685:e=>{"use strict";e.exports=require("http")},95687:e=>{"use strict";e.exports=require("https")},41808:e=>{"use strict";e.exports=require("net")},6005:e=>{"use strict";e.exports=require("node:crypto")},87561:e=>{"use strict";e.exports=require("node:fs")},49411:e=>{"use strict";e.exports=require("node:path")},22037:e=>{"use strict";e.exports=require("os")},71017:e=>{"use strict";e.exports=require("path")},4074:e=>{"use strict";e.exports=require("perf_hooks")},63477:e=>{"use strict";e.exports=require("querystring")},12781:e=>{"use strict";e.exports=require("stream")},24404:e=>{"use strict";e.exports=require("tls")},76224:e=>{"use strict";e.exports=require("tty")},57310:e=>{"use strict";e.exports=require("url")},73837:e=>{"use strict";e.exports=require("util")},59796:e=>{"use strict";e.exports=require("zlib")},58359:()=>{},93739:()=>{},81547:(e,t,r)=>{"use strict";r.r(t),r.d(t,{originalPathname:()=>q,patchFetch:()=>y,requestAsyncStorage:()=>d,routeModule:()=>x,serverHooks:()=>h,staticGenerationAsyncStorage:()=>g});var s={};r.r(s),r.d(s,{POST:()=>l});var i=r(49303),o=r(88716),n=r(60670),a=r(87070),u=r(72761),c=r(3283),p=r(57435);async function l(e){try{if(!(await (0,u.$)()).yes)return a.NextResponse.json({errors:["Unauthorised"]},{status:200});let t=await e.json(),r=await (0,c.saveScreens)(t);return a.NextResponse.json(r)}catch(e){return p.Z.log("/api/screens/save",e),a.NextResponse.json({errors:[e.message]})}}let x=new i.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/diagnoses/save/route",pathname:"/api/diagnoses/save",filename:"route",bundlePath:"app/api/diagnoses/save/route"},resolvedPagePath:"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/api/diagnoses/save/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:d,staticGenerationAsyncStorage:g,serverHooks:h}=x,q="/api/diagnoses/save/route";function y(){return(0,n.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:g})}},92237:(e,t,r)=>{"use strict";r.d(t,{_:()=>p,Q:()=>c});var s=r(57745),i=r(10413),o=r(57418),n=r(57435),a=r(71615);let u=()=>{let e=function(){let e=(0,a.headers)(),t=e.get("x-url"),r=e.get("x-next-url-host"),s=e.get("x-next-url-href"),i=e.get("x-next-url-port"),o=e.get("x-next-url-hostname"),n=e.get("x-next-url-pathname"),u=e.get("x-next-url-search"),c=e.get("x-next-url-protocol"),p=e.get("x-next-url-username"),l=e.get("x-next-url-locale"),x=e.get("x-next-url-origin"),d=e.get("x-geo-city"),g=e.get("x-geo-country");return{url:t||"",host:r||"",href:s||"",port:i||"",hostname:o||"",pathname:n||"",search:u||"",protocol:c||"",username:p||"",locale:l||"",origin:x||"",city:d||"",country:g||"",region:e.get("x-geo-region")||"",latitude:e.get("x-geo-latitude")||"",longitude:e.get("x-geo-longitude")||""}}();return{webeditor:{name:"Local editor",siteId:"fb76af5a-bf86-4050-821e-44f1bf316bf4",link:e.origin,type:"webeditor",apiKey:"localhost"},nodeapi:{name:"Local editor",siteId:"5cb4aa54-2cfe-49e2-9cdd-392a9b8c124e",link:e.origin,type:"webeditor",apiKey:"localhost"}}};async function c(e){try{let{types:t=[]}={...e},r=[...t.length?[(0,s.d3)(o.sites.type,t)]:[]],n=await i.Z.query.sites.findMany({where:r.length?(0,s.xD)(...r):void 0,columns:{siteId:!0,type:!0,name:!0,link:!0}});return u(),{data:[...n]}}catch(e){return n.Z.error("_getSites ERROR",e.message),{data:[],errors:[e.message]}}}async function p(e){try{let t=await i.Z.query.sites.findFirst({where:(0,s.eq)(o.sites.siteId,e),columns:{apiKey:!0,link:!0}}),r=t||null;if(!t){let t=u();Object.values(t).forEach(t=>{t.siteId===e&&(r={link:t.link,apiKey:t.apiKey})})}return{data:r}}catch(e){return n.Z.error("_getSiteApiKey ERROR",e.message),{data:null,errors:[e.message]}}}},88317:(e,t,r)=>{"use strict";r.d(t,{Z:()=>s});let s=(0,r(55802).io)(process.env.NEXT_PUBLIC_APP_URL)}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[5822,1744,3788,1490,5802,4084,5972,413,6267,3269,3283],()=>r(81547));module.exports=s})();