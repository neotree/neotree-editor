"use strict";(()=>{var e={};e.id=2971,e.ids=[2971],e.modules={67096:e=>{e.exports=require("bcrypt")},47849:e=>{e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},71017:e=>{e.exports=require("path")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},76224:e=>{e.exports=require("tty")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},85476:(e,r,s)=>{s.r(r),s.d(r,{GlobalError:()=>a.a,__next_app__:()=>u,originalPathname:()=>c,pages:()=>l,routeModule:()=>x,tree:()=>d}),s(84394),s(44721),s(49246),s(57890),s(95602),s(17162),s(56367),s(12699),s(69684),s(96560);var t=s(23191),i=s(88716),o=s(37922),a=s.n(o),n=s(95231),p={};for(let e in n)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(p[e]=()=>n[e]);s.d(r,p);let d=["",{children:["(dashboard)",{children:["(scripts)",{children:["script",{children:["[scriptId]",{children:["new-screen",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,84394)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/script/[scriptId]/new-screen/page.tsx"]}]},{loading:[()=>Promise.resolve().then(s.bind(s,44721)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/script/[scriptId]/new-screen/loading.tsx"]}]},{loading:[()=>Promise.resolve().then(s.bind(s,49246)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/script/[scriptId]/loading.tsx"]}]},{loading:[()=>Promise.resolve().then(s.bind(s,57890)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/script/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,95602)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/layout.tsx"],loading:[()=>Promise.resolve().then(s.bind(s,17162)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,56367)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/layout.tsx"],loading:[()=>Promise.resolve().then(s.bind(s,12699)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,69684)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(s.bind(s,96560)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/not-found.tsx"]}],l=["/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/script/[scriptId]/new-screen/page.tsx"],c="/(dashboard)/(scripts)/script/[scriptId]/new-screen/page",u={require:s,loadChunk:()=>Promise.resolve()},x=new t.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/(dashboard)/(scripts)/script/[scriptId]/new-screen/page",pathname:"/script/[scriptId]/new-screen",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},44721:(e,r,s)=>{s.r(r),s.d(r,{default:()=>o});var t=s(19510),i=s(62553);function o(){return t.jsx(i.a,{overlay:!0})}},84394:(e,r,s)=>{s.r(r),s.d(r,{default:()=>d});var t=s(19510),i=s(85431),o=s(3283),a=s(86098),n=s(70305),p=s(41236);async function d({params:{scriptId:e}}){let[r,s]=await Promise.all([(0,o.getScript)({scriptId:e,returnDraftIfExists:!0}),(0,o.countScreens)({types:["diagnosis"],scriptsIds:[e]})]);return s?.errors?.length?t.jsx(a.b,{title:"Error",message:"Failed to count how many diagnoses screens this script has. This is important as we can only add one diagnosis screen per script.",redirectTo:`/script/${e}`}):r.data?(0,t.jsxs)(t.Fragment,{children:[t.jsx(i.D,{children:"New Screen"}),t.jsx(p._,{title:"New screen",backLink:`/script/${e}?section=screens`,children:t.jsx(n.J,{scriptId:e,countDiagnosesScreens:s.data.allPublished||s.data.allDrafts})})]}):t.jsx(a.b,{title:"Error",message:"Script was not found or it might have been deleted!",redirectTo:`/script/${e}`})}}};var r=require("../../../../../../webpack-runtime.js");r.C(e);var s=e=>r(r.s=e),t=r.X(0,[5822,1744,3788,1490,5802,4084,2619,231,4723,1813,6943,6318,8214,3024,5325,413,6267,7053,565,3269,3283,7228,1548,2475,7241,9400,1584],()=>s(85476));module.exports=t})();