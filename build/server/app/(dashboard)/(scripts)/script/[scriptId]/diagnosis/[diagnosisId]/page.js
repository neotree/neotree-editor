"use strict";(()=>{var e={};e.id=2203,e.ids=[2203],e.modules={67096:e=>{e.exports=require("bcrypt")},47849:e=>{e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},71017:e=>{e.exports=require("path")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},76224:e=>{e.exports=require("tty")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},80700:(e,r,s)=>{s.r(r),s.d(r,{GlobalError:()=>a.a,__next_app__:()=>u,originalPathname:()=>c,pages:()=>l,routeModule:()=>x,tree:()=>p}),s(93245),s(59131),s(48697),s(49246),s(57890),s(95602),s(17162),s(56367),s(12699),s(35866),s(69684);var t=s(23191),i=s(88716),o=s(37922),a=s.n(o),n=s(95231),d={};for(let e in n)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>n[e]);s.d(r,d);let p=["",{children:["(dashboard)",{children:["(scripts)",{children:["script",{children:["[scriptId]",{children:["diagnosis",{children:["[diagnosisId]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,93245)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/script/[scriptId]/diagnosis/[diagnosisId]/page.tsx"]}]},{loading:[()=>Promise.resolve().then(s.bind(s,59131)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/script/[scriptId]/diagnosis/[diagnosisId]/loading.tsx"]}]},{loading:[()=>Promise.resolve().then(s.bind(s,48697)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/script/[scriptId]/diagnosis/loading.tsx"]}]},{loading:[()=>Promise.resolve().then(s.bind(s,49246)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/script/[scriptId]/loading.tsx"]}]},{loading:[()=>Promise.resolve().then(s.bind(s,57890)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/script/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,95602)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/layout.tsx"],loading:[()=>Promise.resolve().then(s.bind(s,17162)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,56367)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/layout.tsx"],loading:[()=>Promise.resolve().then(s.bind(s,12699)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/loading.tsx"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,35866,23)),"next/dist/client/components/not-found-error"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,69684)),"/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,35866,23)),"next/dist/client/components/not-found-error"]}],l=["/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/app/(dashboard)/(scripts)/script/[scriptId]/diagnosis/[diagnosisId]/page.tsx"],c="/(dashboard)/(scripts)/script/[scriptId]/diagnosis/[diagnosisId]/page",u={require:s,loadChunk:()=>Promise.resolve()},x=new t.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/(dashboard)/(scripts)/script/[scriptId]/diagnosis/[diagnosisId]/page",pathname:"/script/[scriptId]/diagnosis/[diagnosisId]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:p}})},59131:(e,r,s)=>{s.r(r),s.d(r,{default:()=>o});var t=s(19510),i=s(62553);function o(){return t.jsx(i.a,{overlay:!0})}},93245:(e,r,s)=>{s.r(r),s.d(r,{default:()=>p});var t=s(19510),i=s(3283),o=s(85431),a=s(86098),n=s(89503),d=s(41236);async function p({params:{diagnosisId:e,scriptId:r}}){let[s,p]=await Promise.all([(0,i.getDiagnosis)({diagnosisId:e,returnDraftIfExists:!0}),(0,i.getScript)({scriptId:r,returnDraftIfExists:!0})]);return p.data?s.data?(0,t.jsxs)(t.Fragment,{children:[t.jsx(o.D,{children:"Edit diagnosis - "+s.data.name}),t.jsx(d._,{title:"Edit diagnosis",backLink:`/script/${r}`,children:t.jsx(n.A,{scriptId:r,formData:s.data})})]}):t.jsx(a.b,{title:"Not found",message:"Diagnosis was not found or it might have been deleted!",redirectTo:`/script/${r}?section=diagnoses`}):t.jsx(a.b,{title:"Error",message:"Failed to load script!",redirectTo:`/script/${r}?section=diagnoses`})}},48697:(e,r,s)=>{s.r(r),s.d(r,{default:()=>o});var t=s(19510),i=s(62553);function o(){return t.jsx(i.a,{overlay:!0})}}};var r=require("../../../../../../../webpack-runtime.js");r.C(e);var s=e=>r(r.s=e),t=r.X(0,[5822,3788,1744,1490,5802,4084,5606,186,7938,86,4723,4666,7916,413,2814,1145,565,7228,3269,3283,1548,3735,7241,9853],()=>s(80700));module.exports=t})();