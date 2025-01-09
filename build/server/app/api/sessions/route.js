"use strict";(()=>{var e={};e.id=1772,e.ids=[1772],e.modules={67096:e=>{e.exports=require("bcrypt")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},42647:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>x,patchFetch:()=>v,requestAsyncStorage:()=>m,routeModule:()=>y,serverHooks:()=>h,staticGenerationAsyncStorage:()=>g});var a={};r.r(a),r.d(a,{GET:()=>f});var s=r(49303),n=r(88716),i=r(60670),o=r(87070),l=r(49530),u=r(18240),c=r(57435),d=r(72761),p=r(44652);async function f(e){try{if(!(await (0,d.$)()).yes)return o.NextResponse.json({errors:["Unauthorised"]},{status:500});let t=l.Z.parse(e.nextUrl.searchParams.toString()),r=await (0,u.gH)({...t,sort:(0,p.R)(t.sort)||void 0});if(r.errors)return o.NextResponse.json({errors:r.errors},{status:500});let a={...r,data:r.data.map(e=>({uid:e.uid,ingested_at:e.ingested_at,scriptid:e.scriptid}))};return o.NextResponse.json(a)}catch(e){return c.Z.error("[GET] /api/sessions",e),o.NextResponse.json({errors:["Internal Error"]},{status:500})}}let y=new s.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/sessions/route",pathname:"/api/sessions",filename:"route",bundlePath:"app/api/sessions/route"},resolvedPagePath:"/home/farai/Workbench/Neotree/neotree-editor-master/app/api/sessions/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:m,staticGenerationAsyncStorage:g,serverHooks:h}=y,x="/api/sessions/route";function v(){return(0,i.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:g})}},40801:(e,t,r)=>{r.r(t),r.d(t,{getAuthenticatedUser:()=>l,getAuthenticatedUserWithRoles:()=>u,getSession:()=>o});var a=r(24330);r(60166);var s=r(75571),n=r(56543),i=r(47625);async function o(){return await (0,s.getServerSession)(n.L)}async function l(){try{let e=await o();if(!e?.user?.email)return null;return await i.IQ(e.user.email)||null}catch(e){return null}}async function u(){try{let e=await l(),t=e?.role==="admin",r=e?.role==="super_user";return{isAdmin:t,isSuperUser:r,isDefaultUser:!t&&!r,authenticatedUser:e}}catch(e){return{isAdmin:!1,isSuperUser:!1,isDefaultUser:!1,user:null}}}(0,r(40618).h)([o,l,u]),(0,a.j)("3054c9aa3ede38673855ee3dff9f25ad492b7d73",o),(0,a.j)("576365f197acb2f10e29644ba43ca25aec52e8b7",l),(0,a.j)("103d82a5a607c9f7f049ac9bfe2bb62dc7128462",u)},72761:(e,t,r)=>{r.d(t,{$:()=>y});var a=r(71615),s=r(57435),n=r(57745),i=r(10413),o=r(43509);async function l(e){try{let t=[(0,n.or)((0,n.Ft)(o.apiKeys.validUntil),(0,n.eg)(o.apiKeys.validUntil,new Date)),...e?.apiKeys?.length?[(0,n.d3)(o.apiKeys.apiKey,e.apiKeys)]:[],...e?.apiKeysIds?.length?[(0,n.d3)(o.apiKeys.apiKeyId,e.apiKeysIds)]:[]];return{data:await i.Z.query.apiKeys.findMany({where:t.length?(0,n.xD)(...t):void 0,columns:{apiKeyId:!0,apiKey:!0}})}}catch(e){return s.Z.error("_getApiKeys ERROR",e.message),{data:[],errors:[e.message]}}}async function u(e){try{let t=[(0,n.or)((0,n.Ft)(o.authClients.validUntil),(0,n.eg)(o.authClients.validUntil,new Date)),...e?.usersIds?.length?[(0,n.d3)(o.authClients.userId,e.usersIds)]:[],...e?.clientIds?.length?[(0,n.d3)(o.authClients.clientId,e.clientIds)]:[],...e?.clientTokens?.length?[(0,n.d3)(o.authClients.clientToken,e.clientTokens)]:[]];return{data:await i.Z.query.authClients.findMany({where:t.length?(0,n.xD)(...t):void 0,columns:{clientId:!0,clientToken:!0,userId:!0}})}}catch(e){return s.Z.error("_getAuthClients ERROR",e.message),{data:[],errors:[e.message]}}}async function c(e,t){let r=(0,a.headers)().get(e);return!!r&&t(r)}async function d(e,t){try{if(!t)return!1;let{data:r}=await u("token"===e?{clientTokens:[t]}:{clientIds:[t]});return!!r.length}catch(e){return s.Z.error("validateAuthClient ERROR:",e.message),!1}}async function p(e){try{if(!e)return!1;let{data:t}=await l({apiKeys:[e]});return!!t.length}catch(e){return s.Z.error("validateApiKey ERROR:",e.message),!1}}var f=r(40801);async function y(){try{let e=await c("x-api-key",p);e||(e=await c("x-auth-token",e=>d("token",e)));let t=null;return e||(e=!!(t=await (0,f.getAuthenticatedUser)())),{yes:e,user:t}}catch(e){return s.Z.error("isAuthenticated ERROR",e),{yes:!1,user:null}}}},18240:(e,t,r)=>{r.d(t,{RG:()=>c,oC:()=>o,gH:()=>u,mH:()=>l});let a=require("@prisma/client"),s=globalThis.prisma||new a.PrismaClient({log:void 0});var n=r(41502),i=r(57435);async function o(e){try{return{data:await s.sessions.findUnique({where:{id:e}})}}catch(e){return i.Z.error("_getSession ERROR",e.message),{data:null,errors:[e.message]}}}let l={limit:50,page:1,searchValue:void 0,totalRows:0,totalPages:1,filters:{}};async function u(e){try{let{limit:t,page:r,...a}={...e},{search:i,uids:o,scriptsIds:l,sort:u}=a,c=`${o||""}`.split(",").map(e=>e.trim()).filter(e=>e),d=`${l||""}`.split(",").map(e=>e.trim()).filter(e=>e),p=(0,n.x)(t)?50:Number(`${t}`);p=(p=isNaN(p)?50:p)||50;let f=(0,n.x)(r)?1:Number(`${r}`);f=Math.max(1,isNaN(f)?1:f);let y={uid:c.length||i?Object.assign({},c.length?{in:c}:{},i?{search:i}:{}):void 0,scriptid:d.length||i?Object.assign({},d.length?{in:d}:{},i?{search:i}:{}):void 0},m=await s.sessions.count({where:y}),g=1;m&&(g=Math.ceil(m/p),f=Math.min(f,g));let h=Math.max(0,(f-1)*p),x=u||{ingested_at:"desc"};return a.sort=x,{data:await s.sessions.findMany({where:y,take:p,skip:h,orderBy:x}),info:{limit:p,page:f,totalRows:m,totalPages:g,filters:a}}}catch(e){return i.Z.error("_getSessions ERROR",e.message),{data:[],info:l,errors:[e.message]}}}async function c(e){try{return{total:await s.sessions.count()}}catch(e){return i.Z.error("_countSessions ERROR",e.message),{total:0,errors:[e.message]}}}},47625:(e,t,r)=>{r.d(t,{C:()=>f,IQ:()=>p,Ko:()=>m,yT:()=>g});var a=r(57745),s=r(34149),n=r(60938),i=r(81445),o=r(30900),l=r(10413),u=r(43509),c=r(41502),d=r(57435);async function p(e){let t=o.Z(e)?(0,a.eq)(u.users.userId,e):(0,a.eq)(u.users.email,e),r=await l.Z.query.users.findFirst({where:(0,a.xD)(t,(0,a.Ft)(u.users.deletedAt)),columns:{id:!0,userId:!0,displayName:!0,firstName:!0,lastName:!0,avatar:!0,avatar_md:!0,avatar_sm:!0,activationDate:!0,email:!0,role:!0,createdAt:!0,lastLoginDate:!0,password:!0}});return r?{...r,isActive:!!r?.password}:null}async function f(e){let t=o.Z(e)?(0,a.eq)(u.users.userId,e):(0,a.eq)(u.users.email,e);return l.Z.query.users.findFirst({where:(0,a.xD)(t,(0,a.Ft)(u.users.deletedAt))})}async function y({limit:e,roles:t,page:r=1,userIds:o,status:d,searchValue:p}){r=Math.max(0,r);let f=[(0,a.Ft)(u.users.deletedAt)];if(o?.length&&f.push((0,a.d3)(u.users.userId,o)),t?.length&&f.push((0,a.d3)(u.users.role,t)),"active"===d&&f.push((0,a.K0)(u.users.activationDate)),"inactive"===d&&f.push((0,a.Ft)(u.users.activationDate)),p=`${p||""}`.trim()){let e=["%",p,"%"].join("");f.push((0,s.i6)`(LOWER(users.email) like LOWER(${e}) OR LOWER(users.display_name) like LOWER(${e}) OR LOWER(users.first_name) like LOWER(${e}) OR LOWER(users.last_name) like LOWER(${e}))`)}let y=l.Z.select({count:(0,n.QX)()}).from(u.users);f.length&&y.where((0,a.xD)(...f));let[{count:m}]=await y.execute(),g=1;m&&(r=Math.min(r,g=(0,c.x)(e)?1:Math.ceil(m/e)));let h=(0,c.x)(e)?void 0:Math.max(0,(r-1)*e),x=await l.Z.query.users.findMany({where:f.length?(0,a.xD)(...f):void 0,limit:(0,c.x)(e)?void 0:e,orderBy:(0,i.C)(u.users.id),offset:h,columns:{id:!0,userId:!0,displayName:!0,firstName:!0,lastName:!0,avatar:!0,avatar_md:!0,avatar_sm:!0,activationDate:!0,email:!0,role:!0,createdAt:!0,lastLoginDate:!0}});return{page:r,limit:e,data:x,totalRows:m,totalPages:g,searchValue:p,error:void 0}}let m={page:1,limit:void 0,totalRows:0,totalPages:1,data:[],searchValue:void 0,error:void 0};async function g(e){let t=m;try{t=await y(e)}catch(e){d.Z.error("_getUsers ERROR",e),t.error=e.message}finally{return t}}},56543:(e,t,r)=>{r.d(t,{L:()=>d});var a=r(67096),s=r.n(a),n=r(53797),i=r(77234),o=r(57745),l=r(24118),u=r(10413),c=r(43509);let d={adapter:(0,l.J)(u.Z),providers:[(0,i.Z)({clientId:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET}),(0,n.Z)({name:"credentials",credentials:{email:{label:"email",type:"text"},password:{label:"email",type:"text"},code:{label:"code",type:"text"}},async authorize(e){if(!e?.email||!(e?.password||e?.code))throw Error("Missing credentials");let t=await u.Z.query.users.findFirst({where:(0,o.xD)((0,o.eq)(c.users.email,e.email))});if(!t)throw Error("Invalid credentials");if(e.code){let r=await u.Z.query.tokens.findFirst({where:(0,o.xD)((0,o.eq)(c.tokens.token,Number(e.code)),(0,o.eq)(c.tokens.userId,t.userId))});if(!r)throw Error("That code wasn&apos;t valid. Have another go!");await u.Z.delete(c.tokens).where((0,o.eq)(c.tokens.id,r.id))}else if(e.password){if(!await s().compare(e.password,`${t.password}`))throw Error("Invalid credentials")}else if(!t)throw Error("Invalid credentials");let r={lastLoginDate:new Date};return t.activationDate||(r.activationDate=new Date),await u.Z.update(c.users).set(r).where((0,o.eq)(c.users.userId,t.userId)),{id:t.userId,email:t.email,emailVerified:t.activationDate||r.activationDate,name:t.displayName,image:null}}})],debug:!1,session:{strategy:"jwt"},secret:process.env.NEXTAUTH_SECRET,callbacks:{redirect:async({baseUrl:e,url:t})=>t.startsWith("/")?`${e}${t}`:new URL(t).origin===e?t:e}}},41502:(e,t,r)=>{r.d(t,{x:()=>a});function a(e){return null==e||""===e}},57435:(e,t,r)=>{r.d(t,{Z:()=>c});var a=r(87561),s=r.n(a),n=r(49411),i=r.n(n),o=r(51744),l=r.n(o);function u(e,...t){let r=l()(new Date).format("YYYYMMDD"),a=i().resolve(`logs/${r}`);s().existsSync(a)||s().mkdirSync(a);let n=`${new Date().toUTCString()} ${JSON.stringify([...t])}
`,o=`${a}/${e}`;s().appendFileSync(o,n)}let c={log:(...e)=>{u("logs.txt",...e)},error:(...e)=>{u("errors.txt",...e)},appError:(...e)=>{u("app_errors.txt",...e)}}},44652:(e,t,r)=>{r.d(t,{R:()=>a});function a(e){try{return JSON.parse(e)}catch(e){return null}}},49530:(e,t,r)=>{r.d(t,{Z:()=>k});var a={};r.r(a),r.d(a,{exclude:()=>b,extract:()=>g,parse:()=>h,parseUrl:()=>v,pick:()=>R,stringify:()=>x,stringifyUrl:()=>w});let s="%[a-f0-9]{2}",n=RegExp("("+s+")|([^%]+?)","gi"),i=RegExp("("+s+")+","gi");function o(e,t){if(!("string"==typeof e&&"string"==typeof t))throw TypeError("Expected the arguments to be of type `string`");if(""===e||""===t)return[];let r=e.indexOf(t);return -1===r?[]:[e.slice(0,r),e.slice(r+t.length)]}let l=e=>null==e,u=e=>encodeURIComponent(e).replaceAll(/[!'()*]/g,e=>`%${e.charCodeAt(0).toString(16).toUpperCase()}`),c=Symbol("encodeFragmentIdentifier");function d(e){if("string"!=typeof e||1!==e.length)throw TypeError("arrayFormatSeparator must be single character string")}function p(e,t){return t.encode?t.strict?u(e):encodeURIComponent(e):e}function f(e,t){return t.decode?function(e){if("string"!=typeof e)throw TypeError("Expected `encodedURI` to be of type `string`, got `"+typeof e+"`");try{return decodeURIComponent(e)}catch{return function(e){let t={"%FE%FF":"��","%FF%FE":"��"},r=i.exec(e);for(;r;){try{t[r[0]]=decodeURIComponent(r[0])}catch{let e=function(e){try{return decodeURIComponent(e)}catch{let t=e.match(n)||[];for(let r=1;r<t.length;r++)t=(e=(function e(t,r){try{return[decodeURIComponent(t.join(""))]}catch{}if(1===t.length)return t;r=r||1;let a=t.slice(0,r),s=t.slice(r);return Array.prototype.concat.call([],e(a),e(s))})(t,r).join("")).match(n)||[];return e}}(r[0]);e!==r[0]&&(t[r[0]]=e)}r=i.exec(e)}for(let r of(t["%C2"]="�",Object.keys(t)))e=e.replace(RegExp(r,"g"),t[r]);return e}(e)}}(e):e}function y(e){let t=e.indexOf("#");return -1!==t&&(e=e.slice(0,t)),e}function m(e,t){return t.parseNumbers&&!Number.isNaN(Number(e))&&"string"==typeof e&&""!==e.trim()?e=Number(e):t.parseBooleans&&null!==e&&("true"===e.toLowerCase()||"false"===e.toLowerCase())&&(e="true"===e.toLowerCase()),e}function g(e){let t=(e=y(e)).indexOf("?");return -1===t?"":e.slice(t+1)}function h(e,t){d((t={decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1,...t}).arrayFormatSeparator);let r=function(e){let t;switch(e.arrayFormat){case"index":return(e,r,a)=>{if(t=/\[(\d*)]$/.exec(e),e=e.replace(/\[\d*]$/,""),!t){a[e]=r;return}void 0===a[e]&&(a[e]={}),a[e][t[1]]=r};case"bracket":return(e,r,a)=>{if(t=/(\[])$/.exec(e),e=e.replace(/\[]$/,""),!t){a[e]=r;return}if(void 0===a[e]){a[e]=[r];return}a[e]=[...a[e],r]};case"colon-list-separator":return(e,r,a)=>{if(t=/(:list)$/.exec(e),e=e.replace(/:list$/,""),!t){a[e]=r;return}if(void 0===a[e]){a[e]=[r];return}a[e]=[...a[e],r]};case"comma":case"separator":return(t,r,a)=>{let s="string"==typeof r&&r.includes(e.arrayFormatSeparator),n="string"==typeof r&&!s&&f(r,e).includes(e.arrayFormatSeparator);r=n?f(r,e):r;let i=s||n?r.split(e.arrayFormatSeparator).map(t=>f(t,e)):null===r?r:f(r,e);a[t]=i};case"bracket-separator":return(t,r,a)=>{let s=/(\[])$/.test(t);if(t=t.replace(/\[]$/,""),!s){a[t]=r?f(r,e):r;return}let n=null===r?[]:r.split(e.arrayFormatSeparator).map(t=>f(t,e));if(void 0===a[t]){a[t]=n;return}a[t]=[...a[t],...n]};default:return(e,t,r)=>{if(void 0===r[e]){r[e]=t;return}r[e]=[...[r[e]].flat(),t]}}}(t),a=Object.create(null);if("string"!=typeof e||!(e=e.trim().replace(/^[?#&]/,"")))return a;for(let s of e.split("&")){if(""===s)continue;let e=t.decode?s.replaceAll("+"," "):s,[n,i]=o(e,"=");void 0===n&&(n=e),i=void 0===i?null:["comma","separator","bracket-separator"].includes(t.arrayFormat)?i:f(i,t),r(f(n,t),i,a)}for(let[e,r]of Object.entries(a))if("object"==typeof r&&null!==r)for(let[e,a]of Object.entries(r))r[e]=m(a,t);else a[e]=m(r,t);return!1===t.sort?a:(!0===t.sort?Object.keys(a).sort():Object.keys(a).sort(t.sort)).reduce((e,t)=>{let r=a[t];return e[t]=r&&"object"==typeof r&&!Array.isArray(r)?function e(t){return Array.isArray(t)?t.sort():"object"==typeof t?e(Object.keys(t)).sort((e,t)=>Number(e)-Number(t)).map(e=>t[e]):t}(r):r,e},Object.create(null))}function x(e,t){if(!e)return"";d((t={encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:",",...t}).arrayFormatSeparator);let r=r=>t.skipNull&&l(e[r])||t.skipEmptyString&&""===e[r],a=function(e){switch(e.arrayFormat){case"index":return t=>(r,a)=>{let s=r.length;return void 0===a||e.skipNull&&null===a||e.skipEmptyString&&""===a?r:null===a?[...r,[p(t,e),"[",s,"]"].join("")]:[...r,[p(t,e),"[",p(s,e),"]=",p(a,e)].join("")]};case"bracket":return t=>(r,a)=>void 0===a||e.skipNull&&null===a||e.skipEmptyString&&""===a?r:null===a?[...r,[p(t,e),"[]"].join("")]:[...r,[p(t,e),"[]=",p(a,e)].join("")];case"colon-list-separator":return t=>(r,a)=>void 0===a||e.skipNull&&null===a||e.skipEmptyString&&""===a?r:null===a?[...r,[p(t,e),":list="].join("")]:[...r,[p(t,e),":list=",p(a,e)].join("")];case"comma":case"separator":case"bracket-separator":{let t="bracket-separator"===e.arrayFormat?"[]=":"=";return r=>(a,s)=>void 0===s||e.skipNull&&null===s||e.skipEmptyString&&""===s?a:(s=null===s?"":s,0===a.length)?[[p(r,e),t,p(s,e)].join("")]:[[a,p(s,e)].join(e.arrayFormatSeparator)]}default:return t=>(r,a)=>void 0===a||e.skipNull&&null===a||e.skipEmptyString&&""===a?r:null===a?[...r,p(t,e)]:[...r,[p(t,e),"=",p(a,e)].join("")]}}(t),s={};for(let[t,a]of Object.entries(e))r(t)||(s[t]=a);let n=Object.keys(s);return!1!==t.sort&&n.sort(t.sort),n.map(r=>{let s=e[r];return void 0===s?"":null===s?p(r,t):Array.isArray(s)?0===s.length&&"bracket-separator"===t.arrayFormat?p(r,t)+"[]":s.reduce(a(r),[]).join("&"):p(r,t)+"="+p(s,t)}).filter(e=>e.length>0).join("&")}function v(e,t){t={decode:!0,...t};let[r,a]=o(e,"#");return void 0===r&&(r=e),{url:r?.split("?")?.[0]??"",query:h(g(e),t),...t&&t.parseFragmentIdentifier&&a?{fragmentIdentifier:f(a,t)}:{}}}function w(e,t){t={encode:!0,strict:!0,[c]:!0,...t};let r=y(e.url).split("?")[0]||"",a=x({...h(g(e.url),{sort:!1}),...e.query},t);a&&=`?${a}`;let s=function(e){let t="",r=e.indexOf("#");return -1!==r&&(t=e.slice(r)),t}(e.url);if("string"==typeof e.fragmentIdentifier){let a=new URL(r);a.hash=e.fragmentIdentifier,s=t[c]?a.hash:`#${e.fragmentIdentifier}`}return`${r}${a}${s}`}function R(e,t,r){let{url:a,query:s,fragmentIdentifier:n}=v(e,r={parseFragmentIdentifier:!0,[c]:!1,...r});return w({url:a,query:function(e,t){let r={};if(Array.isArray(t))for(let a of t){let t=Object.getOwnPropertyDescriptor(e,a);t?.enumerable&&Object.defineProperty(r,a,t)}else for(let a of Reflect.ownKeys(e)){let s=Object.getOwnPropertyDescriptor(e,a);if(s.enumerable){let n=e[a];t(a,n,e)&&Object.defineProperty(r,a,s)}}return r}(s,t),fragmentIdentifier:n},r)}function b(e,t,r){return R(e,Array.isArray(t)?e=>!t.includes(e):(e,r)=>!t(e,r),r)}let k=a}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[1633,1744,1381,3788,1490,5059,413],()=>r(42647));module.exports=a})();