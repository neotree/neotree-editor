"use strict";(()=>{var e={};e.id=7008,e.ids=[7008],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},6327:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>x,patchFetch:()=>m,requestAsyncStorage:()=>c,routeModule:()=>d,serverHooks:()=>g,staticGenerationAsyncStorage:()=>l});var n={};t.r(n),t.d(n,{GET:()=>u});var o=t(49303),i=t(88716),s=t(60670),a=t(87070),p=t(57435);async function u(e){try{return a.NextResponse.json({data:"pong"})}catch(e){return p.Z.error("[GET] /api/sites/ping",e.message),a.NextResponse.json({errors:["Internal Error"]})}}let d=new o.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/ping/route",pathname:"/api/ping",filename:"route",bundlePath:"app/api/ping/route"},resolvedPagePath:"/home/morris/Documents/NEOTREE/REPOS/neotree-editor/app/api/ping/route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:c,staticGenerationAsyncStorage:l,serverHooks:g}=d,x="/api/ping/route";function m(){return(0,s.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:l})}},57435:(e,r,t)=>{t.d(r,{Z:()=>d});var n=t(87561),o=t.n(n),i=t(49411),s=t.n(i),a=t(51744),p=t.n(a);function u(e,...r){let t=p()(new Date).format("YYYYMMDD"),n=s().resolve(`logs/${t}`);o().existsSync(n)||o().mkdirSync(n);let i=`${new Date().toUTCString()} ${JSON.stringify([...r])}
`,a=`${n}/${e}`;o().appendFileSync(a,i)}let d={log:(...e)=>{u("logs.txt",...e)},error:(...e)=>{u("errors.txt",...e)},appError:(...e)=>{u("app_errors.txt",...e)}}}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),n=r.X(0,[1633,1744,5059],()=>t(6327));module.exports=n})();