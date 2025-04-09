"use strict";(()=>{var e={};e.id=8221,e.ids=[8221],e.modules={67096:e=>{e.exports=require("bcrypt")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},75811:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>x,patchFetch:()=>g,requestAsyncStorage:()=>h,routeModule:()=>p,serverHooks:()=>m,staticGenerationAsyncStorage:()=>y});var s={};r.r(s),r.d(s,{GET:()=>d});var a=r(49303),i=r(88716),n=r(60670),o=r(87070),u=r(57435),l=r(72761),c=r(57368);async function d(e){try{if(!(await (0,l.$)()).yes)return o.NextResponse.json({errors:["Unauthorised"]});let t=JSON.parse(e.nextUrl.searchParams.get("data")||"{}"),r=await (0,c.$F)(t);return o.NextResponse.json(r)}catch(e){return u.Z.error("[GET] /api/scripts/history",e.message),o.NextResponse.json({errors:["Internal Error"]})}}let p=new a.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/scripts/history/route",pathname:"/api/scripts/history",filename:"route",bundlePath:"app/api/scripts/history/route"},resolvedPagePath:"/home/morris/Documents/NEOTREE/REPOS/neotree-editor/app/api/scripts/history/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:h,staticGenerationAsyncStorage:y,serverHooks:m}=p,x="/api/scripts/history/route";function g(){return(0,n.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:y})}},40801:(e,t,r)=>{r.r(t),r.d(t,{getAuthenticatedUser:()=>u,getAuthenticatedUserWithRoles:()=>l,getSession:()=>o});var s=r(24330);r(60166);var a=r(75571),i=r(56543),n=r(47625);async function o(){return await (0,a.getServerSession)(i.L)}async function u(){try{let e=await o();if(!e?.user?.email)return null;return await n.IQ(e.user.email)||null}catch(e){return null}}async function l(){try{let e=await u(),t=e?.role==="admin",r=e?.role==="super_user";return{isAdmin:t,isSuperUser:r,isDefaultUser:!t&&!r,authenticatedUser:e}}catch(e){return{isAdmin:!1,isSuperUser:!1,isDefaultUser:!1,user:null}}}(0,r(40618).h)([o,u,l]),(0,s.j)("a1978c83b209e9f738502cb7918ca21a901a7c96",o),(0,s.j)("c8fbf2226d3d8b8bb8824b3e879ec8cb4c4f1e65",u),(0,s.j)("cd73b8090a6539c9726785159f965122a9679666",l)},72761:(e,t,r)=>{r.d(t,{$:()=>y});var s=r(71615),a=r(57435),i=r(57745),n=r(10413),o=r(88182);async function u(e){try{let t=[(0,i.or)((0,i.Ft)(o.apiKeys.validUntil),(0,i.eg)(o.apiKeys.validUntil,new Date)),...e?.apiKeys?.length?[(0,i.d3)(o.apiKeys.apiKey,e.apiKeys)]:[],...e?.apiKeysIds?.length?[(0,i.d3)(o.apiKeys.apiKeyId,e.apiKeysIds)]:[]];return{data:await n.Z.query.apiKeys.findMany({where:t.length?(0,i.xD)(...t):void 0,columns:{apiKeyId:!0,apiKey:!0}})}}catch(e){return a.Z.error("_getApiKeys ERROR",e.message),{data:[],errors:[e.message]}}}async function l(e){try{let t=[(0,i.or)((0,i.Ft)(o.authClients.validUntil),(0,i.eg)(o.authClients.validUntil,new Date)),...e?.usersIds?.length?[(0,i.d3)(o.authClients.userId,e.usersIds)]:[],...e?.clientIds?.length?[(0,i.d3)(o.authClients.clientId,e.clientIds)]:[],...e?.clientTokens?.length?[(0,i.d3)(o.authClients.clientToken,e.clientTokens)]:[]];return{data:await n.Z.query.authClients.findMany({where:t.length?(0,i.xD)(...t):void 0,columns:{clientId:!0,clientToken:!0,userId:!0}})}}catch(e){return a.Z.error("_getAuthClients ERROR",e.message),{data:[],errors:[e.message]}}}async function c(e,t){let r=(0,s.headers)().get(e);return!!r&&t(r)}async function d(e,t){try{if(!t)return!1;let{data:r}=await l("token"===e?{clientTokens:[t]}:{clientIds:[t]});return!!r.length}catch(e){return a.Z.error("validateAuthClient ERROR:",e.message),!1}}async function p(e){try{if(!e)return!1;let{data:t}=await u({apiKeys:[e]});return!!t.length}catch(e){return a.Z.error("validateApiKey ERROR:",e.message),!1}}var h=r(40801);async function y(){try{let e=await c("x-api-key",p);e||(e=await c("x-auth-token",e=>d("token",e)));let t=null;return e||(e=!!(t=await (0,h.getAuthenticatedUser)())),{yes:e,user:t}}catch(e){return a.Z.error("isAuthenticated ERROR",e),{yes:!1,user:null}}}},47625:(e,t,r)=>{r.d(t,{C:()=>h,IQ:()=>p,Ko:()=>m,yT:()=>x});var s=r(57745),a=r(34149),i=r(60938),n=r(81445),o=r(30900),u=r(10413),l=r(88182),c=r(41502),d=r(57435);async function p(e){let t=o.Z(e)?(0,s.eq)(l.users.userId,e):(0,s.eq)(l.users.email,e),r=await u.Z.query.users.findFirst({where:(0,s.xD)(t,(0,s.Ft)(l.users.deletedAt)),columns:{id:!0,userId:!0,displayName:!0,firstName:!0,lastName:!0,avatar:!0,avatar_md:!0,avatar_sm:!0,activationDate:!0,email:!0,role:!0,createdAt:!0,lastLoginDate:!0,password:!0}});return r?{...r,isActive:!!r?.password}:null}async function h(e){let t=o.Z(e)?(0,s.eq)(l.users.userId,e):(0,s.eq)(l.users.email,e);return u.Z.query.users.findFirst({where:(0,s.xD)(t,(0,s.Ft)(l.users.deletedAt))})}async function y({limit:e,roles:t,page:r=1,userIds:o,status:d,searchValue:p}){r=Math.max(0,r);let h=[(0,s.Ft)(l.users.deletedAt)];if(o?.length&&h.push((0,s.d3)(l.users.userId,o)),t?.length&&h.push((0,s.d3)(l.users.role,t)),"active"===d&&h.push((0,s.K0)(l.users.activationDate)),"inactive"===d&&h.push((0,s.Ft)(l.users.activationDate)),p=`${p||""}`.trim()){let e=["%",p,"%"].join("");h.push((0,a.i6)`(LOWER(users.email) like LOWER(${e}) OR LOWER(users.display_name) like LOWER(${e}) OR LOWER(users.first_name) like LOWER(${e}) OR LOWER(users.last_name) like LOWER(${e}))`)}let y=u.Z.select({count:(0,i.QX)()}).from(l.users);h.length&&y.where((0,s.xD)(...h));let[{count:m}]=await y.execute(),x=1;m&&(r=Math.min(r,x=(0,c.x)(e)?1:Math.ceil(m/e)));let g=(0,c.x)(e)?void 0:Math.max(0,(r-1)*e),v=await u.Z.query.users.findMany({where:h.length?(0,s.xD)(...h):void 0,limit:(0,c.x)(e)?void 0:e,orderBy:(0,n.C)(l.users.id),offset:g,columns:{id:!0,userId:!0,displayName:!0,firstName:!0,lastName:!0,avatar:!0,avatar_md:!0,avatar_sm:!0,activationDate:!0,email:!0,role:!0,createdAt:!0,lastLoginDate:!0}});return{page:r,limit:e,data:v,totalRows:m,totalPages:x,searchValue:p,error:void 0}}let m={page:1,limit:void 0,totalRows:0,totalPages:1,data:[],searchValue:void 0,error:void 0};async function x(e){let t=m;try{t=await y(e)}catch(e){d.Z.error("_getUsers ERROR",e),t.error=e.message}finally{return t}}},56543:(e,t,r)=>{r.d(t,{L:()=>d});var s=r(67096),a=r.n(s),i=r(53797),n=r(77234),o=r(57745),u=r(24118),l=r(10413),c=r(88182);let d={adapter:(0,u.J)(l.Z),providers:[(0,n.Z)({clientId:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET}),(0,i.Z)({name:"credentials",credentials:{email:{label:"email",type:"text"},password:{label:"email",type:"text"},code:{label:"code",type:"text"}},async authorize(e){if(!e?.email||!(e?.password||e?.code))throw Error("Missing credentials");let t=await l.Z.query.users.findFirst({where:(0,o.xD)((0,o.eq)(c.users.email,e.email))});if(!t)throw Error("Invalid credentials");if(e.code){let r=await l.Z.query.tokens.findFirst({where:(0,o.xD)((0,o.eq)(c.tokens.token,Number(e.code)),(0,o.eq)(c.tokens.userId,t.userId))});if(!r)throw Error("That code wasn&apos;t valid. Have another go!");await l.Z.delete(c.tokens).where((0,o.eq)(c.tokens.id,r.id))}else if(e.password){if(!await a().compare(e.password,`${t.password}`))throw Error("Invalid credentials")}else if(!t)throw Error("Invalid credentials");let r={lastLoginDate:new Date};return t.activationDate||(r.activationDate=new Date),await l.Z.update(c.users).set(r).where((0,o.eq)(c.users.userId,t.userId)),{id:t.userId,email:t.email,emailVerified:t.activationDate||r.activationDate,name:t.displayName,image:null}}})],debug:!1,session:{strategy:"jwt"},secret:process.env.NEXTAUTH_SECRET,callbacks:{redirect:async({baseUrl:e,url:t})=>t.startsWith("/")?`${e}${t}`:new URL(t).origin===e?t:e}}},41502:(e,t,r)=>{r.d(t,{x:()=>s});function s(e){return null==e||""===e}},57435:(e,t,r)=>{r.d(t,{Z:()=>c});var s=r(87561),a=r.n(s),i=r(49411),n=r.n(i),o=r(51744),u=r.n(o);function l(e,...t){let r=u()(new Date).format("YYYYMMDD"),s=n().resolve(`logs/${r}`);a().existsSync(s)||a().mkdirSync(s);let i=`${new Date().toUTCString()} ${JSON.stringify([...t])}
`,o=`${s}/${e}`;a().appendFileSync(o,i)}let c={log:(...e)=>{l("logs.txt",...e)},error:(...e)=>{l("errors.txt",...e)},appError:(...e)=>{l("app_errors.txt",...e)}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[1633,1744,9937,3788,1490,5059,413,7368],()=>r(75811));module.exports=s})();