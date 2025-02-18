"use strict";(()=>{var e={};e.id=7274,e.ids=[7274],e.modules={67096:e=>{e.exports=require("bcrypt")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},75278:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>h,patchFetch:()=>y,requestAsyncStorage:()=>f,routeModule:()=>p,serverHooks:()=>b,staticGenerationAsyncStorage:()=>w});var s={};t.r(s),t.d(s,{POST:()=>l});var a=t(49303),o=t(88716),n=t(60670),i=t(87070),u=t(72761),c=t(73508),d=t(57435);async function l(e){try{if(!(await (0,u.$)()).yes)return i.NextResponse.json({errors:["Unauthorised"]},{status:200});let r=await e.json(),t=await (0,c.updateUsers)(r.data);return i.NextResponse.json(t)}catch(e){return d.Z.log("/api/users/update",e),i.NextResponse.json({errors:[e.message]})}}let p=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/users/update/route",pathname:"/api/users/update",filename:"route",bundlePath:"app/api/users/update/route"},resolvedPagePath:"/home/morris/Documents/NEOTREE/REPOS/neotree-editor/app/api/users/update/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:f,staticGenerationAsyncStorage:w,serverHooks:b}=p,h="/api/users/update/route";function y(){return(0,n.patchFetch)({serverHooks:b,staticGenerationAsyncStorage:w})}},73508:(e,r,t)=>{t.r(r),t.d(r,{$$ACTION_0:()=>A,$$ACTION_1:()=>U,$$ACTION_2:()=>_,$$ACTION_3:()=>P,$$ACTION_4:()=>T,createUsers:()=>O,deleteUsers:()=>E,getFullUser:()=>j,getUser:()=>R,getUsers:()=>v,isEmailRegistered:()=>q,resetUsersPasswords:()=>g,searchUsers:()=>I,setPassword:()=>N,updateUsers:()=>Z});var s=t(24330);t(60166);var a=t(67096),o=t.n(a),n=t(57745),i=t(9576),u=t(30900),c=t(10413),d=t(88182),l=t(47625);async function p(e){for(let r of e)await c.Z.update(d.users).set({password:""}).where((0,n.eq)(d.users.userId,r));return!0}async function f(e){for(let r of e){let e=new Date;await c.Z.update(d.users).set({deletedAt:e,email:r,displayName:"Former user",firstName:null,lastName:null,avatar:null,avatar_md:null,avatar_sm:null}).where((0,n.eq)(d.users.userId,r))}return!0}async function w(e,r){let t=[];for(let r of e){let e=await o().genSalt(10),s=await o().hash(r.password||(0,i.Z)(),e);t.push({...r,password:s,userId:r.userId||(0,i.Z)()})}let s={inserted:[],success:!1};try{if(await c.Z.insert(d.users).values(t),r?.returnInserted){let e=await (0,l.yT)({userIds:t.map(e=>e.userId)});s.inserted=e.data}s.success=!0}catch(e){s.error=e.message}finally{return s}}async function b(e,r){let t=[];for(let{userId:s,data:a}of e)try{let e=(0,u.Z)(s)?(0,n.eq)(d.users.userId,s):(0,n.eq)(d.users.email,s);delete a.id,delete a.createdAt,delete a.updatedAt,delete a.email,delete a.userId,await c.Z.update(d.users).set(a).where(e);let o=r?.returnUpdated?await (0,l.IQ)(s):void 0;t.push({userId:s,user:o})}catch(e){t.push({userId:s,error:e.message})}return t}var h=t(57435),y=t(70733),m=t(66267),x=t(40618);let g=p;async function q(e){try{let r=await (0,l.IQ)(e);return{yes:!!r,isActive:!!r?.isActive}}catch(e){return h.Z.error("getUser ERROR:",e),{errors:[e.message],yes:!1}}}async function R(e){try{return await (0,m.isAllowed)("get_user"),await (0,l.IQ)(e)||null}catch(e){return h.Z.error("getUser ERROR:",e),null}}async function j(e){try{return await (0,m.isAllowed)("get_user"),await (0,l.C)(e)||null}catch(e){return h.Z.error("getFullUser ERROR:",e),null}}let v=(0,s.j)("8c1706ef39b14194906fc76d293e4dcba85ae92a",A);async function A(...e){try{return await (0,m.isAllowed)("get_users"),await (0,l.yT)(...e)}catch(e){return{...l.Ko,error:e.message}}}let I=(0,s.j)("8c790f37fa8234c4a8ce301807f4b7a9f034648a",U);async function U(...e){try{return await (0,m.isAllowed)("search_users"),await (0,l.yT)(...e)}catch(e){return{...l.Ko,error:e.message}}}async function E(e){if(await (0,m.isAllowed)("delete_users"),e.length){let{data:r}=await (0,l.yT)({userIds:e});await f(e)}return!0}let O=(0,s.j)("8ea40d757733a9a127e9765a7140bc779ddbb8e7",_);async function _(...e){try{await (0,m.isAllowed)("create_users");let r=await w(...e);for(let r of e[0])try{await (0,y.n)({userId:r.userId,hoursValid:1})}catch(e){}return r}catch(e){throw h.Z.error("createUsers ERROR",e),e}}let Z=(0,s.j)("b4602a4425d33d11cfc56f383cd38b2d337b616b",P);async function P(...e){try{return await (0,m.isAllowed)("update_users"),await b(...e)}catch(e){throw h.Z.error("updateUsers ERROR",e),e}}let N=(0,s.j)("c570869931a7120fbb0e8c50ee63e44e06c643c4",T);async function T(e){try{if(!e.password)throw Error("Missing: password");if(!e.email)throw Error("Missing: email");if(e.password.length<6)throw Error("Password is too short: min 6 characters");if(e.password!==e.passwordConfirm)throw Error("Password confirmation does not match!");let r=await o().genSalt(10),t=await o().hash(e.password,r),s=await b([{userId:e.email,data:{password:t}}]);if(s.filter(e=>e.error).length)throw Error(s.filter(e=>e.error).map(e=>e.error).join(", "));return{success:!0}}catch(e){return h.Z.error("setPassword ERROR",e),{success:!1,errors:[e.message]}}}(0,x.h)([g,q,R,j,v,I,E,O,Z,N]),(0,s.j)("f5824657aa9e6e00d525294593532a71c0710980",g),(0,s.j)("027eaab5282a2c317a98e2ad292274851b3bcf57",q),(0,s.j)("fadb7b68fc396819f3b697db7eecbc2c277a98b7",R),(0,s.j)("8e9d57f452565ab305cc2fbbbba1c8a1f54a0aa5",j),(0,s.j)("8fd784abb984eeb28ba830dcb1481931d0e358f3",v),(0,s.j)("bed5e548eff00631b9e73882213f7b3ee5cab46e",I),(0,s.j)("27db4383c25240109bbeafe05b6d3ef382fbec77",E),(0,s.j)("caa73a89410e9b2187b05025023b884b86e92192",O),(0,s.j)("9888b996d0f87bf4c69743b1c05f964cda523faa",Z),(0,s.j)("023c73bed53bbc4b3fe79235d6775c2226f30fc9",N)},70733:(e,r,t)=>{t.d(r,{n:()=>i});var s=t(51744),a=t.n(s),o=t(10413),n=t(88182);async function i({userId:e,hoursValid:r}){return(await o.Z.insert(n.tokens).values({userId:e,validUntil:a()(new Date).add(r,"hour").toDate(),token:Math.floor(1e5+9e5*Math.random())}).returning())[0]}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[1633,1744,9937,3788,1490,5059,413,6267],()=>t(75278));module.exports=s})();