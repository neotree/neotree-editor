"use strict";(()=>{var e={};e.id=2203,e.ids=[2203],e.modules={67096:e=>{e.exports=require("bcrypt")},47849:e=>{e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},71017:e=>{e.exports=require("path")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},76224:e=>{e.exports=require("tty")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},12423:(e,r,t)=>{t.r(r),t.d(r,{GlobalError:()=>a.a,__next_app__:()=>u,originalPathname:()=>l,pages:()=>c,routeModule:()=>h,tree:()=>p}),t(93245),t(59131),t(48697),t(49246),t(57890),t(95602),t(17162),t(56367),t(12699),t(77482),t(96560);var s=t(23191),o=t(88716),i=t(37922),a=t.n(i),n=t(95231),d={};for(let e in n)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>n[e]);t.d(r,d);let p=["",{children:["(dashboard)",{children:["(scripts)",{children:["script",{children:["[scriptId]",{children:["diagnosis",{children:["[diagnosisId]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(t.bind(t,93245)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/script/[scriptId]/diagnosis/[diagnosisId]/page.tsx"]}]},{loading:[()=>Promise.resolve().then(t.bind(t,59131)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/script/[scriptId]/diagnosis/[diagnosisId]/loading.tsx"]}]},{loading:[()=>Promise.resolve().then(t.bind(t,48697)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/script/[scriptId]/diagnosis/loading.tsx"]}]},{loading:[()=>Promise.resolve().then(t.bind(t,49246)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/script/[scriptId]/loading.tsx"]}]},{loading:[()=>Promise.resolve().then(t.bind(t,57890)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/script/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(t.bind(t,95602)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/layout.tsx"],loading:[()=>Promise.resolve().then(t.bind(t,17162)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(t.bind(t,56367)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/layout.tsx"],loading:[()=>Promise.resolve().then(t.bind(t,12699)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(t.bind(t,77482)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(t.bind(t,96560)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/not-found.tsx"]}],c=["/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/script/[scriptId]/diagnosis/[diagnosisId]/page.tsx"],l="/(dashboard)/(scripts)/script/[scriptId]/diagnosis/[diagnosisId]/page",u={require:t,loadChunk:()=>Promise.resolve()},h=new s.AppPageRouteModule({definition:{kind:o.x.APP_PAGE,page:"/(dashboard)/(scripts)/script/[scriptId]/diagnosis/[diagnosisId]/page",pathname:"/script/[scriptId]/diagnosis/[diagnosisId]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:p}})},59131:(e,r,t)=>{t.r(r),t.d(r,{default:()=>i});var s=t(19510),o=t(62553);function i(){return s.jsx(o.a,{overlay:!0})}},93245:(e,r,t)=>{t.r(r),t.d(r,{default:()=>p});var s=t(19510),o=t(87845),i=t(85431),a=t(86098),n=t(89503),d=t(41236);async function p({params:{diagnosisId:e,scriptId:r}}){let[t,p]=await Promise.all([(0,o.getDiagnosis)({diagnosisId:e,returnDraftIfExists:!0}),(0,o.getScript)({scriptId:r,returnDraftIfExists:!0})]);return p.data?t.data?(0,s.jsxs)(s.Fragment,{children:[s.jsx(i.D,{children:"Edit diagnosis - "+t.data.name}),s.jsx(d._,{title:"Edit diagnosis",backLink:`/script/${r}`,children:s.jsx(n.A,{scriptId:r,formData:t.data})})]}):s.jsx(a.b,{title:"Not found",message:"Diagnosis was not found or it might have been deleted!",redirectTo:`/script/${r}?section=diagnoses`}):s.jsx(a.b,{title:"Error",message:"Failed to load script!",redirectTo:`/script/${r}?section=diagnoses`})}},48697:(e,r,t)=>{t.r(r),t.d(r,{default:()=>i});var s=t(19510),o=t(62553);function i(){return s.jsx(o.a,{overlay:!0})}}};var r=require("../../../../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[1633,1744,9937,3788,1490,9092,5802,9712,7708,2685,6462,4723,4228,8065,7389,413,6267,7368,6555,1271,437,7845,1717,9162,8,3899,8345,502],()=>t(12423));module.exports=s})();