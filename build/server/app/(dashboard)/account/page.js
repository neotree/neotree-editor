(()=>{var e={};e.id=1470,e.ids=[1470],e.modules={67096:e=>{"use strict";e.exports=require("bcrypt")},47849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},39491:e=>{"use strict";e.exports=require("assert")},14300:e=>{"use strict";e.exports=require("buffer")},32081:e=>{"use strict";e.exports=require("child_process")},6113:e=>{"use strict";e.exports=require("crypto")},82361:e=>{"use strict";e.exports=require("events")},57147:e=>{"use strict";e.exports=require("fs")},13685:e=>{"use strict";e.exports=require("http")},95687:e=>{"use strict";e.exports=require("https")},41808:e=>{"use strict";e.exports=require("net")},6005:e=>{"use strict";e.exports=require("node:crypto")},87561:e=>{"use strict";e.exports=require("node:fs")},49411:e=>{"use strict";e.exports=require("node:path")},22037:e=>{"use strict";e.exports=require("os")},71017:e=>{"use strict";e.exports=require("path")},4074:e=>{"use strict";e.exports=require("perf_hooks")},63477:e=>{"use strict";e.exports=require("querystring")},12781:e=>{"use strict";e.exports=require("stream")},24404:e=>{"use strict";e.exports=require("tls")},76224:e=>{"use strict";e.exports=require("tty")},57310:e=>{"use strict";e.exports=require("url")},73837:e=>{"use strict";e.exports=require("util")},59796:e=>{"use strict";e.exports=require("zlib")},62320:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>n.a,__next_app__:()=>u,originalPathname:()=>l,pages:()=>b,routeModule:()=>f,tree:()=>o}),r(20199),r(85151),r(56367),r(12699),r(69684),r(96560);var a=r(23191),d=r(88716),s=r(37922),n=r.n(s),i=r(95231),c={};for(let e in i)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(c[e]=()=>i[e]);r.d(t,c);let o=["",{children:["(dashboard)",{children:["account",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,20199)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/account/page.tsx"]}]},{loading:[()=>Promise.resolve().then(r.bind(r,85151)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/account/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,56367)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/layout.tsx"],loading:[()=>Promise.resolve().then(r.bind(r,12699)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,69684)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(r.bind(r,96560)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/not-found.tsx"]}],b=["/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/account/page.tsx"],l="/(dashboard)/account/page",u={require:r,loadChunk:()=>Promise.resolve()},f=new a.AppPageRouteModule({definition:{kind:d.x.APP_PAGE,page:"/(dashboard)/account/page",pathname:"/account",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:o}})},38362:(e,t,r)=>{let a={"103d82a5a607c9f7f049ac9bfe2bb62dc7128462":()=>Promise.resolve().then(r.bind(r,40801)).then(e=>e.getAuthenticatedUserWithRoles),"3054c9aa3ede38673855ee3dff9f25ad492b7d73":()=>Promise.resolve().then(r.bind(r,40801)).then(e=>e.getSession),"576365f197acb2f10e29644ba43ca25aec52e8b7":()=>Promise.resolve().then(r.bind(r,40801)).then(e=>e.getAuthenticatedUser),"055174a9ccd19bad29237b1c3a8c05cd527be07b":()=>Promise.resolve().then(r.bind(r,60563)).then(e=>e.getSys),"088c57d60b5ed83f7dd0192c87404045099f271b":()=>Promise.resolve().then(r.bind(r,60563)).then(e=>e.$$ACTION_0),"099e6b671d625a88f30c9806fa7bdac48e2a3710":()=>Promise.resolve().then(r.bind(r,60563)).then(e=>e.$$ACTION_1),"0c0d564b6e8549cd52e9489443ca8f11eb739d52":()=>Promise.resolve().then(r.bind(r,60563)).then(e=>e.updateSys),"4b9c4cf0240fcf15d4869a3f982ee2d97caf5ea6":()=>Promise.resolve().then(r.bind(r,82065)).then(e=>e.$$ACTION_0),"580940ab09cedb0e060484c8b6a6463e9a81461a":()=>Promise.resolve().then(r.bind(r,82065)).then(e=>e.getSitesWithoutConfidentialData),"6c76d6cc57800dd271e4df8386a0ae6e7ecbc435":()=>Promise.resolve().then(r.bind(r,82065)).then(e=>e.getSites),"783eb2f9264b34f18cf3044d2185e64f2f39333e":()=>Promise.resolve().then(r.bind(r,82065)).then(e=>e.getSite),"8e6d2d1bfc206d2044ed01620bfa151c6fd87125":()=>Promise.resolve().then(r.bind(r,82065)).then(e=>e.saveSites),"8d3a0534ac3ddb0c44a91b766b2183165c62dbed":()=>Promise.resolve().then(r.bind(r,66267)).then(e=>e.canAccessPage),"98c147f0ddb064f66a4d243e26ad14e1fbd69d9c":()=>Promise.resolve().then(r.bind(r,66267)).then(e=>e.isAllowed),"112a744ae93bf04aba1a4250d687a325a73a55c1":()=>Promise.resolve().then(r.bind(r,71271)).then(e=>e.publishData),"294bf0d6332f28a618099d7c02669de60070f8a2":()=>Promise.resolve().then(r.bind(r,71271)).then(e=>e.$$ACTION_1),"2995d4697010486034183adc4a3028bfd106123b":()=>Promise.resolve().then(r.bind(r,71271)).then(e=>e.discardDrafts),"354f249d3682e1a7ac814300889c8b929172be69":()=>Promise.resolve().then(r.bind(r,71271)).then(e=>e.getEditorDetails),"3af78304ef3b80b391189cdb5be758ed14bb9be7":()=>Promise.resolve().then(r.bind(r,71271)).then(e=>e.countAllDrafts),ac5d4de4d5312ee7fa1967d05ccea3edfbd18033:()=>Promise.resolve().then(r.bind(r,71271)).then(e=>e.$$ACTION_0),afc9c4d3ed7201152607116aa5f72d4579144ffc:()=>Promise.resolve().then(r.bind(r,71271)).then(e=>e.revalidatePath)};async function d(e,...t){return(await a[e]()).apply(null,t)}e.exports={"103d82a5a607c9f7f049ac9bfe2bb62dc7128462":d.bind(null,"103d82a5a607c9f7f049ac9bfe2bb62dc7128462"),"3054c9aa3ede38673855ee3dff9f25ad492b7d73":d.bind(null,"3054c9aa3ede38673855ee3dff9f25ad492b7d73"),"576365f197acb2f10e29644ba43ca25aec52e8b7":d.bind(null,"576365f197acb2f10e29644ba43ca25aec52e8b7"),"055174a9ccd19bad29237b1c3a8c05cd527be07b":d.bind(null,"055174a9ccd19bad29237b1c3a8c05cd527be07b"),"088c57d60b5ed83f7dd0192c87404045099f271b":d.bind(null,"088c57d60b5ed83f7dd0192c87404045099f271b"),"099e6b671d625a88f30c9806fa7bdac48e2a3710":d.bind(null,"099e6b671d625a88f30c9806fa7bdac48e2a3710"),"0c0d564b6e8549cd52e9489443ca8f11eb739d52":d.bind(null,"0c0d564b6e8549cd52e9489443ca8f11eb739d52"),"4b9c4cf0240fcf15d4869a3f982ee2d97caf5ea6":d.bind(null,"4b9c4cf0240fcf15d4869a3f982ee2d97caf5ea6"),"580940ab09cedb0e060484c8b6a6463e9a81461a":d.bind(null,"580940ab09cedb0e060484c8b6a6463e9a81461a"),"6c76d6cc57800dd271e4df8386a0ae6e7ecbc435":d.bind(null,"6c76d6cc57800dd271e4df8386a0ae6e7ecbc435"),"783eb2f9264b34f18cf3044d2185e64f2f39333e":d.bind(null,"783eb2f9264b34f18cf3044d2185e64f2f39333e"),"8e6d2d1bfc206d2044ed01620bfa151c6fd87125":d.bind(null,"8e6d2d1bfc206d2044ed01620bfa151c6fd87125"),"8d3a0534ac3ddb0c44a91b766b2183165c62dbed":d.bind(null,"8d3a0534ac3ddb0c44a91b766b2183165c62dbed"),"98c147f0ddb064f66a4d243e26ad14e1fbd69d9c":d.bind(null,"98c147f0ddb064f66a4d243e26ad14e1fbd69d9c"),"112a744ae93bf04aba1a4250d687a325a73a55c1":d.bind(null,"112a744ae93bf04aba1a4250d687a325a73a55c1"),"294bf0d6332f28a618099d7c02669de60070f8a2":d.bind(null,"294bf0d6332f28a618099d7c02669de60070f8a2"),"2995d4697010486034183adc4a3028bfd106123b":d.bind(null,"2995d4697010486034183adc4a3028bfd106123b"),"354f249d3682e1a7ac814300889c8b929172be69":d.bind(null,"354f249d3682e1a7ac814300889c8b929172be69"),"3af78304ef3b80b391189cdb5be758ed14bb9be7":d.bind(null,"3af78304ef3b80b391189cdb5be758ed14bb9be7"),ac5d4de4d5312ee7fa1967d05ccea3edfbd18033:d.bind(null,"ac5d4de4d5312ee7fa1967d05ccea3edfbd18033"),afc9c4d3ed7201152607116aa5f72d4579144ffc:d.bind(null,"afc9c4d3ed7201152607116aa5f72d4579144ffc")}},64044:(e,t,r)=>{Promise.resolve().then(r.bind(r,10827))},85151:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});var a=r(19510),d=r(62553);function s(){return a.jsx(d.a,{})}},20199:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>n});var a=r(19510),d=r(24569),s=r(85431);function n(){return(0,a.jsxs)(a.Fragment,{children:[a.jsx(s.D,{children:"Account"}),a.jsx(d.V,{children:a.jsx("h1",{className:"text-3xl",children:"Account settings"})})]})}},24569:(e,t,r)=>{"use strict";r.d(t,{V:()=>s});var a=r(19510),d=r(50650);function s({className:e,...t}){return a.jsx("div",{...t,className:(0,d.cn)("w-full max-w-screen-xl mx-auto p-5",e)})}},20123:(e,t,r)=>{"use strict";r.d(t,{Ng:()=>b,_U:()=>h,QF:()=>o,YF:()=>f});var a=r(57745),d=r(81445),s=r(30900),n=r(10413),i=r(43509),c=r(57435);async function o(e){try{let{sitesIds:t,types:r=[],envs:c=[]}={...e},o=t||[],b=o?.length?(0,a.d3)(i.sites.siteId,o.filter(e=>s.Z(e))):void 0,l=[(0,a.Ft)(i.sites.deletedAt),b,r.length?(0,a.d3)(i.sites.type,r):void 0,c.length?(0,a.d3)(i.sites.env,c):void 0];return{data:(await n.Z.select({site:i.sites}).from(i.sites).where(l.length?(0,a.xD)(...l):void 0).orderBy((0,d.d)(i.sites.id))).map(e=>e.site)}}catch(e){return c.Z.error("_getSites ERROR",e.message),{data:[],errors:[e.message]}}}async function b(e){let{siteId:t}={...e};try{if(!t)throw Error("Missing siteId");let e=s.Z(t)?(0,a.eq)(i.sites.siteId,t):void 0;return{data:await n.Z.query.sites.findFirst({where:(0,a.xD)((0,a.Ft)(i.sites.deletedAt),e)})}}catch(e){return c.Z.error("_getSite ERROR",e.message),{errors:[e.message]}}}var l=r(8328);let u=()=>{let e=(0,l.w)();return{webeditor:{name:"Local editor",siteId:"fb76af5a-bf86-4050-821e-44f1bf316bf4",link:e.origin,type:"webeditor",apiKey:"localhost"},nodeapi:{name:"Local editor",siteId:"5cb4aa54-2cfe-49e2-9cdd-392a9b8c124e",link:e.origin,type:"webeditor",apiKey:"localhost"}}};async function f(e){try{let{types:t=[]}={...e},r=[...t.length?[(0,a.d3)(i.sites.type,t)]:[]],d=await n.Z.query.sites.findMany({where:r.length?(0,a.xD)(...r):void 0,columns:{siteId:!0,type:!0,name:!0,link:!0}});return u(),{data:[...d]}}catch(e){return c.Z.error("_getSites ERROR",e.message),{data:[],errors:[e.message]}}}async function h(e){try{let t=await n.Z.query.sites.findFirst({where:(0,a.eq)(i.sites.siteId,e),columns:{apiKey:!0,link:!0}}),r=t||null;if(!t){let t=u();Object.values(t).forEach(t=>{t.siteId===e&&(r={link:t.link,apiKey:t.apiKey})})}return{data:r}}catch(e){return c.Z.error("_getSiteApiKey ERROR",e.message),{data:null,errors:[e.message]}}}},8328:(e,t,r)=>{"use strict";r.d(t,{w:()=>d});var a=r(71615);function d(){let e=(0,a.headers)(),t=e.get("x-api-key"),r=e.get("x-bearer-token"),d=e.get("x-url"),s=e.get("x-next-url-host"),n=e.get("x-next-url-href"),i=e.get("x-next-url-port"),c=e.get("x-next-url-hostname"),o=e.get("x-next-url-pathname"),b=e.get("x-next-url-search"),l=e.get("x-next-url-protocol"),u=e.get("x-next-url-username"),f=e.get("x-next-url-locale"),h=e.get("x-next-url-origin"),p=e.get("x-geo-city"),x=e.get("x-geo-country");return{apiKey:t,bearerToken:r,url:d||"",host:s||"",href:n||"",port:i||"",hostname:c||"",pathname:o||"",search:b||"",protocol:l||"",username:u||"",locale:f||"",origin:h||"",city:p||"",country:x||"",region:e.get("x-geo-region")||"",latitude:e.get("x-geo-latitude")||"",longitude:e.get("x-geo-longitude")||""}}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[1633,1744,1381,3788,1490,9092,5802,7708,6620,9387,7938,413,6267,5209,1966,1271,4442,1717],()=>r(62320));module.exports=a})();