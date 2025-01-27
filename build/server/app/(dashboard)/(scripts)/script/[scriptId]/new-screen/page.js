"use strict";(()=>{var e={};e.id=2971,e.ids=[2971],e.modules={67096:e=>{e.exports=require("bcrypt")},47849:e=>{e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},71017:e=>{e.exports=require("path")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},76224:e=>{e.exports=require("tty")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},28576:(e,r,t)=>{t.r(r),t.d(r,{GlobalError:()=>a.a,__next_app__:()=>u,originalPathname:()=>l,pages:()=>c,routeModule:()=>h,tree:()=>d}),t(84394),t(44721),t(49246),t(57890),t(95602),t(17162),t(56367),t(12699),t(77482),t(96560);var s=t(23191),o=t(88716),i=t(37922),a=t.n(i),n=t(95231),p={};for(let e in n)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(p[e]=()=>n[e]);t.d(r,p);let d=["",{children:["(dashboard)",{children:["(scripts)",{children:["script",{children:["[scriptId]",{children:["new-screen",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(t.bind(t,84394)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/script/[scriptId]/new-screen/page.tsx"]}]},{loading:[()=>Promise.resolve().then(t.bind(t,44721)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/script/[scriptId]/new-screen/loading.tsx"]}]},{loading:[()=>Promise.resolve().then(t.bind(t,49246)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/script/[scriptId]/loading.tsx"]}]},{loading:[()=>Promise.resolve().then(t.bind(t,57890)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/script/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(t.bind(t,95602)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/layout.tsx"],loading:[()=>Promise.resolve().then(t.bind(t,17162)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(t.bind(t,56367)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/layout.tsx"],loading:[()=>Promise.resolve().then(t.bind(t,12699)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(t.bind(t,77482)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(t.bind(t,96560)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/not-found.tsx"]}],c=["/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/script/[scriptId]/new-screen/page.tsx"],l="/(dashboard)/(scripts)/script/[scriptId]/new-screen/page",u={require:t,loadChunk:()=>Promise.resolve()},h=new s.AppPageRouteModule({definition:{kind:o.x.APP_PAGE,page:"/(dashboard)/(scripts)/script/[scriptId]/new-screen/page",pathname:"/script/[scriptId]/new-screen",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},44721:(e,r,t)=>{t.r(r),t.d(r,{default:()=>i});var s=t(19510),o=t(62553);function i(){return s.jsx(o.a,{overlay:!0})}},84394:(e,r,t)=>{t.r(r),t.d(r,{default:()=>d});var s=t(19510),o=t(85431),i=t(87845),a=t(86098),n=t(70305),p=t(41236);async function d({params:{scriptId:e}}){let[r,t,d]=await Promise.all([(0,i.getScript)({scriptId:e,returnDraftIfExists:!0}),(0,i.countScreens)({types:["diagnosis"],scriptsIds:[e]}),(0,i.listScreens)({scriptsIds:[e],returnDraftsIfExist:!0})]);return t?.errors?.length?s.jsx(a.b,{title:"Error",message:"Failed to count how many diagnoses screens this script has. This is important as we can only add one diagnosis screen per script.",redirectTo:`/script/${e}`}):r.data?(0,s.jsxs)(s.Fragment,{children:[s.jsx(o.D,{children:"New Screen"}),s.jsx(p._,{title:"New screen",backLink:`/script/${e}?section=screens`,children:s.jsx(n.J,{screens:d.data,scriptId:e,countDiagnosesScreens:t.data.allPublished||t.data.allDrafts})})]}):s.jsx(a.b,{title:"Error",message:"Script was not found or it might have been deleted!",redirectTo:`/script/${e}`})}}};var r=require("../../../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[1633,1744,9937,3788,1490,9092,5802,9712,7708,2685,6462,4723,4228,8065,7389,7967,413,6267,6038,2418,1271,437,7845,1717,9162,8,3899,8345,6064],()=>t(28576));module.exports=s})();