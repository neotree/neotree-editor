"use strict";(()=>{var e={};e.id=981,e.ids=[981],e.modules={67096:e=>{e.exports=require("bcrypt")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},76224:e=>{e.exports=require("tty")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},54808:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>m,patchFetch:()=>g,requestAsyncStorage:()=>l,routeModule:()=>c,serverHooks:()=>h,staticGenerationAsyncStorage:()=>q});var s={};t.r(s),t.d(s,{POST:()=>d});var o=t(49303),i=t(88716),p=t(60670),a=t(87070),u=t(72761),n=t(71271),x=t(57435);async function d(e){try{if(!(await (0,u.$)()).yes)return a.NextResponse.json({errors:["Unauthorised"]},{status:200});let e=await (0,n.publishData)();return a.NextResponse.json(e)}catch(e){return x.Z.log("/api/ops/publish-data",e),a.NextResponse.json({errors:[e.message]})}}let c=new o.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/ops/publish-data/route",pathname:"/api/ops/publish-data",filename:"route",bundlePath:"app/api/ops/publish-data/route"},resolvedPagePath:"/home/farai/Workbench/Neotree/neotree-editor-master/app/api/ops/publish-data/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:l,staticGenerationAsyncStorage:q,serverHooks:h}=c,m="/api/ops/publish-data/route";function g(){return(0,p.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:q})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[1633,1744,9937,3788,1490,9092,5802,5059,7708,413,6267,6038,1771,1271],()=>t(54808));module.exports=s})();