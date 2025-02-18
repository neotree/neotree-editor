"use strict";(()=>{var e={};e.id=8984,e.ids=[8984],e.modules={67096:e=>{e.exports=require("bcrypt")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},76224:e=>{e.exports=require("tty")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},990:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>y,patchFetch:()=>g,requestAsyncStorage:()=>l,routeModule:()=>f,serverHooks:()=>x,staticGenerationAsyncStorage:()=>b});var s={};t.r(s),t.d(s,{POST:()=>p});var a=t(49303),o=t(88716),i=t(60670),c=t(87070),n=t(72761),u=t(47423),d=t(57435);async function p(e){try{if(!(await (0,n.$)()).yes)return c.NextResponse.json({errors:["Unauthorised"]},{status:200});let r=await e.json(),t=await (0,u.yE)(r);return c.NextResponse.json(t)}catch(e){return d.Z.log("/api/drugs-library/save",e),c.NextResponse.json({errors:[e.message]})}}let f=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/drugs-library/save/route",pathname:"/api/drugs-library/save",filename:"route",bundlePath:"app/api/drugs-library/save/route"},resolvedPagePath:"/home/farai/Workbench/Neotree/neotree-editor-master/app/api/drugs-library/save/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:l,staticGenerationAsyncStorage:b,serverHooks:x}=f,y="/api/drugs-library/save/route";function g(){return(0,i.patchFetch)({serverHooks:x,staticGenerationAsyncStorage:b})}},47423:(e,r,t)=>{t.d(r,{Ci:()=>R,Qt:()=>x,l5:()=>p,yE:()=>q,yk:()=>u});var s=t(24330);t(60166);var a=t(22418),o=t(30834),i=t(57435),c=t(66267),n=t(40618);let u=(0,s.j)("35750e76ddff8149c8c873fad4fac12f0be0d6e3",d);async function d(...e){try{return await (0,c.isAllowed)(),await (0,a.U5)(...e)}catch(e){return i.Z.error("copyDrugsLibraryItems ERROR",e.message),{errors:[e.message],success:!1}}}let p=(0,s.j)("265168937394ecbe40ed4ebb06e9fa06d76a1a1f",f);async function f(...e){try{return await (0,c.isAllowed)(),await (0,a.Nq)(...e)}catch(e){return i.Z.error("deleteDrugsLibraryItems ERROR",e.message),{errors:[e.message],success:!1}}}let l=(0,s.j)("e5f489be6768923e3bd1baa1f775dcce2a7be387",b);async function b(...e){try{return await (0,c.isAllowed)(),await (0,o.G$)(...e)}catch(e){return i.Z.error("countDrugsLibraryItems ERROR",e.message),{errors:[e.message],data:o.s}}}let x=(0,s.j)("cf467c9be0296767c437a1a6702f42c2f4f29c48",y);async function y(...e){try{return await (0,c.isAllowed)(),await (0,o.fP)(...e)}catch(e){return i.Z.error("getDrugsLibraryItems ERROR",e.message),{errors:[e.message],data:[]}}}let g=(0,s.j)("ce33ab979d6b9353ecef2022366070b05f494c2f",m);async function m(...e){return await (0,c.isAllowed)(),await (0,o.t3)(...e)}let q=(0,s.j)("2762322c2d689ddf839fa4fe5452700aa10526eb",w);async function w(...e){try{return await (0,c.isAllowed)(),await (0,a.$s)(...e)}catch(e){return i.Z.error("saveDrugsLibraryItems ERROR",e.message),{errors:[e.message],data:void 0,success:!1}}}let R=(0,s.j)("b7fff0114a63a4d944350fa3dca0b9e1b9d2ae5f",h);async function h(...e){try{return await (0,c.isAllowed)(),await (0,a.E8)(...e)}catch(e){return i.Z.error("removeDrugLibraryItemsReferences ERROR",e.message),{errors:[e.message],data:{success:!1}}}}(0,n.h)([u,p,l,x,g,q,R]),(0,s.j)("51d163ce5462676e923609e4c36eb2b628767ce4",u),(0,s.j)("47cca1361ddc15896e08a96474b34e8cb92ad43a",p),(0,s.j)("a528325866fe4fdfe3cc018395b2fa53e5cea400",l),(0,s.j)("548040c2395e12c7371c99c934381a7006886443",x),(0,s.j)("6390bdcc6e8e79a4515a451b842de584d9c40385",g),(0,s.j)("fd97fdbd0488c5dbf58e1ce5812a7f095954ba89",q),(0,s.j)("d0c359b62964103d3ff4d5ee234aaaf3408bf69b",R)}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[1633,1744,9937,3788,1490,5059,9092,5802,413,6267,7368,6555],()=>t(990));module.exports=s})();