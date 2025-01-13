(()=>{var e={};e.id=7908,e.ids=[7908],e.modules={67096:e=>{"use strict";e.exports=require("bcrypt")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{"use strict";e.exports=require("assert")},14300:e=>{"use strict";e.exports=require("buffer")},32081:e=>{"use strict";e.exports=require("child_process")},6113:e=>{"use strict";e.exports=require("crypto")},82361:e=>{"use strict";e.exports=require("events")},57147:e=>{"use strict";e.exports=require("fs")},13685:e=>{"use strict";e.exports=require("http")},95687:e=>{"use strict";e.exports=require("https")},41808:e=>{"use strict";e.exports=require("net")},6005:e=>{"use strict";e.exports=require("node:crypto")},87561:e=>{"use strict";e.exports=require("node:fs")},49411:e=>{"use strict";e.exports=require("node:path")},22037:e=>{"use strict";e.exports=require("os")},4074:e=>{"use strict";e.exports=require("perf_hooks")},63477:e=>{"use strict";e.exports=require("querystring")},12781:e=>{"use strict";e.exports=require("stream")},24404:e=>{"use strict";e.exports=require("tls")},76224:e=>{"use strict";e.exports=require("tty")},57310:e=>{"use strict";e.exports=require("url")},73837:e=>{"use strict";e.exports=require("util")},59796:e=>{"use strict";e.exports=require("zlib")},58359:()=>{},93739:()=>{},65591:(e,t,s)=>{"use strict";s.r(t),s.d(t,{originalPathname:()=>x,patchFetch:()=>m,requestAsyncStorage:()=>h,routeModule:()=>d,serverHooks:()=>g,staticGenerationAsyncStorage:()=>f});var r={};s.r(r),s.d(r,{POST:()=>p});var a=s(49303),i=s(88716),o=s(60670),c=s(87070),n=s(72761),u=s(2111),l=s(57435);async function p(e){try{if(!(await (0,n.$)()).yes)return c.NextResponse.json({errors:["Unauthorised"]},{status:200});let t=await e.json(),s=await (0,u.saveHospitals)(t.data);return c.NextResponse.json(s)}catch(e){return l.Z.log("/api/hospitals/save",e),c.NextResponse.json({errors:[e.message]})}}let d=new a.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/hospitals/save/route",pathname:"/api/hospitals/save",filename:"route",bundlePath:"app/api/hospitals/save/route"},resolvedPagePath:"/home/farai/Workbench/Neotree/neotree-editor-master/app/api/hospitals/save/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:h,staticGenerationAsyncStorage:f,serverHooks:g}=d,x="/api/hospitals/save/route";function m(){return(0,o.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:f})}},2111:(e,t,s)=>{"use strict";s.r(t),s.d(t,{$$ACTION_0:()=>g,$$ACTION_1:()=>m,$$ACTION_2:()=>q,$$ACTION_3:()=>b,$$ACTION_4:()=>w,countHospitals:()=>x,deleteHospitals:()=>f,getHospital:()=>v,getHospitals:()=>y,saveHospitals:()=>R});var r=s(24330);s(60166);var a=s(57745),i=s(57435),o=s(10413),c=s(43509),n=s(88317);async function u(e){let t={success:!1};try{let s=e.filter(e=>e.id),r=e.filter(e=>!e.id),i=[];for(let e of s)try{await o.Z.update(c.hospitals).set(e).where((0,a.eq)(c.hospitals.id,e.id))}catch(e){i.push(e.message)}r.length&&await o.Z.insert(c.hospitals).values(r),i.length?t.errors=i:t.success=!0}catch(e){t.success=!1,t.errors=[e.message],i.Z.error("_saveHospitals ERROR",e.message)}finally{return t?.errors?.length||n.Z.emit("data_changed","save_hospitals"),t}}async function l(e){let t={success:!1},{ids:s,hospitalsIds:r,confirmDeleteAll:u}={...e};try{let e=[s?.length?(0,a.d3)(c.hospitals.id,s):void 0,r?.length?(0,a.d3)(c.hospitals.hospitalId,r):void 0].filter(e=>e);if(!e.length&&!u)throw Error("Please confirm that you want to delete all the hospitals!");await o.Z.delete(c.hospitals).where((0,a.xD)(...e)),t.success=!0}catch(e){t.success=!1,t.errors=[e.message],i.Z.error("_deleteHospitals ERROR",e.message)}finally{return t?.errors?.length||n.Z.emit("data_changed","delete_hospitals"),t}}var p=s(88453),d=s(66267),h=s(40618);let f=(0,r.j)("d5c6b9491daa56650d239a681f4b7ef41eecdbba",g);async function g(...e){try{return await (0,d.isAllowed)(),await l(...e)}catch(e){return i.Z.error("deleteHospitals ERROR",e.message),{errors:[e.message],success:!1}}}let x=(0,r.j)("512d9beb792a3d4bcdd04c9eae6b9afe27f489d7",m);async function m(...e){try{return await (0,d.isAllowed)(),await (0,p.Py)(...e)}catch(e){return i.Z.error("countHospitals ERROR",e.message),{errors:[e.message],data:0}}}let y=(0,r.j)("c6587359cfe940e0386c1df8bc41d1447f620a00",q);async function q(...e){try{return await (0,d.isAllowed)(),await (0,p.O8)(...e)}catch(e){return i.Z.error("getHospitals ERROR",e.message),{errors:[e.message],data:[]}}}let v=(0,r.j)("f6a3e20114d0088487156ad1ed83fa447308a2c2",b);async function b(...e){return await (0,d.isAllowed)(),await (0,p.C9)(...e)}let R=(0,r.j)("022bf5b1fe01e26cfa7b1f6a0047ec026c4dcf1c",w);async function w(...e){try{return await (0,d.isAllowed)(),await u(...e)}catch(e){return i.Z.error("getSys ERROR",e.message),{errors:[e.message],data:void 0,success:!1}}}(0,h.h)([f,x,y,v,R]),(0,r.j)("73bf4fdecbc868eedca8795ad97dab204bd8e733",f),(0,r.j)("b4efaa4b05ecb7cadbe89680c6b2171ace31e9ce",x),(0,r.j)("8448ebc9389f802b020e8db31ea50a0da52f6bb6",y),(0,r.j)("1de8eac2e741b7fda1f80c8c2b40e9dfc9113033",v),(0,r.j)("4df001c0931c69623054287626dfa19f4f2755e4",R)},88453:(e,t,s)=>{"use strict";s.d(t,{Py:()=>p,C9:()=>u,O8:()=>n});var r=s(57745),a=s(30900),i=s(10413),o=s(43509),c=s(57435);async function n(e){try{let{hospitalsIds:t}={...e},s=t||[],c=s?.length?(0,r.d3)(o.hospitals.hospitalId,s.filter(e=>a.Z(e))):void 0,n=s?.length?(0,r.d3)(o.hospitals.oldHospitalId,s.filter(e=>!a.Z(e))):void 0,u=[(0,r.Ft)(o.hospitals.deletedAt),...c&&n?[(0,r.or)(c,n)]:[]];return{data:(await i.Z.select({hospital:o.hospitals}).from(o.hospitals).where(u.length?(0,r.xD)(...u):void 0)).map(e=>e.hospital)}}catch(e){return c.Z.error("_getHospitals ERROR",e.message),{data:[],errors:[e.message]}}}async function u(e){let{hospitalId:t}={...e};try{if(!t)throw Error("Missing hospitalId");let e=a.Z(t)?(0,r.eq)(o.hospitals.hospitalId,t):void 0,s=a.Z(t)?void 0:(0,r.eq)(o.hospitals.oldHospitalId,t);return{data:await i.Z.query.hospitals.findFirst({where:(0,r.xD)((0,r.Ft)(o.hospitals.deletedAt),e||s)})}}catch(e){return c.Z.error("_getHospital ERROR",e.message),{errors:[e.message]}}}var l=s(60938);async function p(){try{let[{count:e}]=await i.Z.select({count:(0,l.QX)()}).from(o.hospitals);return{data:e}}catch(e){return c.Z.error("_getHospitals ERROR",e.message),{data:0,errors:[e.message]}}}},88317:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});let r=(0,s(55802).io)(process.env.NEXT_PUBLIC_APP_URL)}};var t=require("../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[1633,1744,9937,3788,1490,9092,5802,5059,413,6267],()=>s(65591));module.exports=r})();