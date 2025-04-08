"use strict";(()=>{var e={};e.id=8333,e.ids=[8333],e.modules={67096:e=>{e.exports=require("bcrypt")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},4049:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>h,patchFetch:()=>x,requestAsyncStorage:()=>y,routeModule:()=>f,serverHooks:()=>g,staticGenerationAsyncStorage:()=>m});var a={};t.r(a),t.d(a,{GET:()=>p});var n=t(49303),s=t(88716),i=t(60670),o=t(87070),l=t(49530),u=t(57435),c=t(72761),d=t(14560);async function p(e){try{if(!(await (0,c.$)()).yes)return o.NextResponse.json({errors:["Unauthorised"]},{status:500});let r=l.Z.parse(e.nextUrl.searchParams.toString()),t=await (0,d.getLogs)(r);return o.NextResponse.json(t)}catch(e){return u.Z.error("[GET] /api/logs",e),o.NextResponse.json({errors:[e.message||"Internal Error"]})}}let f=new n.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/logs/route",pathname:"/api/logs",filename:"route",bundlePath:"app/api/logs/route"},resolvedPagePath:"/home/farai/Workbench/Neotree/neotree-editor-master/app/api/logs/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:y,staticGenerationAsyncStorage:m,serverHooks:g}=f,h="/api/logs/route";function x(){return(0,i.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:m})}},40801:(e,r,t)=>{t.r(r),t.d(r,{getAuthenticatedUser:()=>l,getAuthenticatedUserWithRoles:()=>u,getSession:()=>o});var a=t(24330);t(60166);var n=t(75571),s=t(56543),i=t(47625);async function o(){return await (0,n.getServerSession)(s.L)}async function l(){try{let e=await o();if(!e?.user?.email)return null;return await i.IQ(e.user.email)||null}catch(e){return null}}async function u(){try{let e=await l(),r=e?.role==="admin",t=e?.role==="super_user";return{isAdmin:r,isSuperUser:t,isDefaultUser:!r&&!t,authenticatedUser:e}}catch(e){return{isAdmin:!1,isSuperUser:!1,isDefaultUser:!1,user:null}}}(0,t(40618).h)([o,l,u]),(0,a.j)("3054c9aa3ede38673855ee3dff9f25ad492b7d73",o),(0,a.j)("576365f197acb2f10e29644ba43ca25aec52e8b7",l),(0,a.j)("103d82a5a607c9f7f049ac9bfe2bb62dc7128462",u)},72761:(e,r,t)=>{t.d(r,{$:()=>y});var a=t(71615),n=t(57435),s=t(57745),i=t(10413),o=t(96336);async function l(e){try{let r=[(0,s.or)((0,s.Ft)(o.apiKeys.validUntil),(0,s.eg)(o.apiKeys.validUntil,new Date)),...e?.apiKeys?.length?[(0,s.d3)(o.apiKeys.apiKey,e.apiKeys)]:[],...e?.apiKeysIds?.length?[(0,s.d3)(o.apiKeys.apiKeyId,e.apiKeysIds)]:[]];return{data:await i.Z.query.apiKeys.findMany({where:r.length?(0,s.xD)(...r):void 0,columns:{apiKeyId:!0,apiKey:!0}})}}catch(e){return n.Z.error("_getApiKeys ERROR",e.message),{data:[],errors:[e.message]}}}async function u(e){try{let r=[(0,s.or)((0,s.Ft)(o.authClients.validUntil),(0,s.eg)(o.authClients.validUntil,new Date)),...e?.usersIds?.length?[(0,s.d3)(o.authClients.userId,e.usersIds)]:[],...e?.clientIds?.length?[(0,s.d3)(o.authClients.clientId,e.clientIds)]:[],...e?.clientTokens?.length?[(0,s.d3)(o.authClients.clientToken,e.clientTokens)]:[]];return{data:await i.Z.query.authClients.findMany({where:r.length?(0,s.xD)(...r):void 0,columns:{clientId:!0,clientToken:!0,userId:!0}})}}catch(e){return n.Z.error("_getAuthClients ERROR",e.message),{data:[],errors:[e.message]}}}async function c(e,r){let t=(0,a.headers)().get(e);return!!t&&r(t)}async function d(e,r){try{if(!r)return!1;let{data:t}=await u("token"===e?{clientTokens:[r]}:{clientIds:[r]});return!!t.length}catch(e){return n.Z.error("validateAuthClient ERROR:",e.message),!1}}async function p(e){try{if(!e)return!1;let{data:r}=await l({apiKeys:[e]});return!!r.length}catch(e){return n.Z.error("validateApiKey ERROR:",e.message),!1}}var f=t(40801);async function y(){try{let e=await c("x-api-key",p);e||(e=await c("x-auth-token",e=>d("token",e)));let r=null;return e||(e=!!(r=await (0,f.getAuthenticatedUser)())),{yes:e,user:r}}catch(e){return n.Z.error("isAuthenticated ERROR",e),{yes:!1,user:null}}}},14560:(e,r,t)=>{t.r(r),t.d(r,{getLogs:()=>c});var a=t(24330);t(60166);let n=require("node:readline");var s=t.n(n),i=t(51744),o=t.n(i),l=t(87561),u=t(57435);async function c({date:e,type:r="logs",endDate:t}){let a={data:[]};try{if(!e)throw Error("Date not provided");t=t||e;let n=new Date(o()(e).format("YYYY-MM-DD")),i=new Date(o()(t).format("YYYY-MM-DD")),u=[],c=o()(n).subtract(1,"day").toDate();for(;c<i;)c=o()(c).add(1,"day").toDate(),u.push(["logs",o()(c).format("YYYYMMDD"),`${r}.txt`].join("/"));for(let e of u)await new Promise(r=>{(async()=>{let t=(0,l.createReadStream)(e),n=s().createInterface({input:t,crlfDelay:1/0});try{for await(let e of n)a.data.push(e)}catch(e){}r(!0)})()});a.data=a.data.reverse()}catch(e){u.Z.error("getLogs ERROR",e.message),a.errors=[e.message]}finally{return a}}(0,t(40618).h)([c]),(0,a.j)("b4f8a69629dcb25cd678162d8323def4552922e1",c)},47625:(e,r,t)=>{t.d(r,{C:()=>f,IQ:()=>p,Ko:()=>m,yT:()=>g});var a=t(57745),n=t(34149),s=t(60938),i=t(81445),o=t(30900),l=t(10413),u=t(96336),c=t(41502),d=t(57435);async function p(e){let r=o.Z(e)?(0,a.eq)(u.users.userId,e):(0,a.eq)(u.users.email,e),t=await l.Z.query.users.findFirst({where:(0,a.xD)(r,(0,a.Ft)(u.users.deletedAt)),columns:{id:!0,userId:!0,displayName:!0,firstName:!0,lastName:!0,avatar:!0,avatar_md:!0,avatar_sm:!0,activationDate:!0,email:!0,role:!0,createdAt:!0,lastLoginDate:!0,password:!0}});return t?{...t,isActive:!!t?.password}:null}async function f(e){let r=o.Z(e)?(0,a.eq)(u.users.userId,e):(0,a.eq)(u.users.email,e);return l.Z.query.users.findFirst({where:(0,a.xD)(r,(0,a.Ft)(u.users.deletedAt))})}async function y({limit:e,roles:r,page:t=1,userIds:o,status:d,searchValue:p}){t=Math.max(0,t);let f=[(0,a.Ft)(u.users.deletedAt)];if(o?.length&&f.push((0,a.d3)(u.users.userId,o)),r?.length&&f.push((0,a.d3)(u.users.role,r)),"active"===d&&f.push((0,a.K0)(u.users.activationDate)),"inactive"===d&&f.push((0,a.Ft)(u.users.activationDate)),p=`${p||""}`.trim()){let e=["%",p,"%"].join("");f.push((0,n.i6)`(LOWER(users.email) like LOWER(${e}) OR LOWER(users.display_name) like LOWER(${e}) OR LOWER(users.first_name) like LOWER(${e}) OR LOWER(users.last_name) like LOWER(${e}))`)}let y=l.Z.select({count:(0,s.QX)()}).from(u.users);f.length&&y.where((0,a.xD)(...f));let[{count:m}]=await y.execute(),g=1;m&&(t=Math.min(t,g=(0,c.x)(e)?1:Math.ceil(m/e)));let h=(0,c.x)(e)?void 0:Math.max(0,(t-1)*e),x=await l.Z.query.users.findMany({where:f.length?(0,a.xD)(...f):void 0,limit:(0,c.x)(e)?void 0:e,orderBy:(0,i.C)(u.users.id),offset:h,columns:{id:!0,userId:!0,displayName:!0,firstName:!0,lastName:!0,avatar:!0,avatar_md:!0,avatar_sm:!0,activationDate:!0,email:!0,role:!0,createdAt:!0,lastLoginDate:!0}});return{page:t,limit:e,data:x,totalRows:m,totalPages:g,searchValue:p,error:void 0}}let m={page:1,limit:void 0,totalRows:0,totalPages:1,data:[],searchValue:void 0,error:void 0};async function g(e){let r=m;try{r=await y(e)}catch(e){d.Z.error("_getUsers ERROR",e),r.error=e.message}finally{return r}}},56543:(e,r,t)=>{t.d(r,{L:()=>d});var a=t(67096),n=t.n(a),s=t(53797),i=t(77234),o=t(57745),l=t(24118),u=t(10413),c=t(96336);let d={adapter:(0,l.J)(u.Z),providers:[(0,i.Z)({clientId:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET}),(0,s.Z)({name:"credentials",credentials:{email:{label:"email",type:"text"},password:{label:"email",type:"text"},code:{label:"code",type:"text"}},async authorize(e){if(!e?.email||!(e?.password||e?.code))throw Error("Missing credentials");let r=await u.Z.query.users.findFirst({where:(0,o.xD)((0,o.eq)(c.users.email,e.email))});if(!r)throw Error("Invalid credentials");if(e.code){let t=await u.Z.query.tokens.findFirst({where:(0,o.xD)((0,o.eq)(c.tokens.token,Number(e.code)),(0,o.eq)(c.tokens.userId,r.userId))});if(!t)throw Error("That code wasn&apos;t valid. Have another go!");await u.Z.delete(c.tokens).where((0,o.eq)(c.tokens.id,t.id))}else if(e.password){if(!await n().compare(e.password,`${r.password}`))throw Error("Invalid credentials")}else if(!r)throw Error("Invalid credentials");let t={lastLoginDate:new Date};return r.activationDate||(t.activationDate=new Date),await u.Z.update(c.users).set(t).where((0,o.eq)(c.users.userId,r.userId)),{id:r.userId,email:r.email,emailVerified:r.activationDate||t.activationDate,name:r.displayName,image:null}}})],debug:!1,session:{strategy:"jwt"},secret:process.env.NEXTAUTH_SECRET,callbacks:{redirect:async({baseUrl:e,url:r})=>r.startsWith("/")?`${e}${r}`:new URL(r).origin===e?r:e}}},41502:(e,r,t)=>{t.d(r,{x:()=>a});function a(e){return null==e||""===e}},57435:(e,r,t)=>{t.d(r,{Z:()=>c});var a=t(87561),n=t.n(a),s=t(49411),i=t.n(s),o=t(51744),l=t.n(o);function u(e,...r){let t=l()(new Date).format("YYYYMMDD"),a=i().resolve(`logs/${t}`);n().existsSync(a)||n().mkdirSync(a);let s=`${new Date().toUTCString()} ${JSON.stringify([...r])}
`,o=`${a}/${e}`;n().appendFileSync(o,s)}let c={log:(...e)=>{u("logs.txt",...e)},error:(...e)=>{u("errors.txt",...e)},appError:(...e)=>{u("app_errors.txt",...e)}}},49530:(e,r,t)=>{t.d(r,{Z:()=>k});var a={};t.r(a),t.d(a,{exclude:()=>R,extract:()=>g,parse:()=>h,parseUrl:()=>v,pick:()=>b,stringify:()=>x,stringifyUrl:()=>w});let n="%[a-f0-9]{2}",s=RegExp("("+n+")|([^%]+?)","gi"),i=RegExp("("+n+")+","gi");function o(e,r){if(!("string"==typeof e&&"string"==typeof r))throw TypeError("Expected the arguments to be of type `string`");if(""===e||""===r)return[];let t=e.indexOf(r);return -1===t?[]:[e.slice(0,t),e.slice(t+r.length)]}let l=e=>null==e,u=e=>encodeURIComponent(e).replaceAll(/[!'()*]/g,e=>`%${e.charCodeAt(0).toString(16).toUpperCase()}`),c=Symbol("encodeFragmentIdentifier");function d(e){if("string"!=typeof e||1!==e.length)throw TypeError("arrayFormatSeparator must be single character string")}function p(e,r){return r.encode?r.strict?u(e):encodeURIComponent(e):e}function f(e,r){return r.decode?function(e){if("string"!=typeof e)throw TypeError("Expected `encodedURI` to be of type `string`, got `"+typeof e+"`");try{return decodeURIComponent(e)}catch{return function(e){let r={"%FE%FF":"��","%FF%FE":"��"},t=i.exec(e);for(;t;){try{r[t[0]]=decodeURIComponent(t[0])}catch{let e=function(e){try{return decodeURIComponent(e)}catch{let r=e.match(s)||[];for(let t=1;t<r.length;t++)r=(e=(function e(r,t){try{return[decodeURIComponent(r.join(""))]}catch{}if(1===r.length)return r;t=t||1;let a=r.slice(0,t),n=r.slice(t);return Array.prototype.concat.call([],e(a),e(n))})(r,t).join("")).match(s)||[];return e}}(t[0]);e!==t[0]&&(r[t[0]]=e)}t=i.exec(e)}for(let t of(r["%C2"]="�",Object.keys(r)))e=e.replace(RegExp(t,"g"),r[t]);return e}(e)}}(e):e}function y(e){let r=e.indexOf("#");return -1!==r&&(e=e.slice(0,r)),e}function m(e,r){return r.parseNumbers&&!Number.isNaN(Number(e))&&"string"==typeof e&&""!==e.trim()?e=Number(e):r.parseBooleans&&null!==e&&("true"===e.toLowerCase()||"false"===e.toLowerCase())&&(e="true"===e.toLowerCase()),e}function g(e){let r=(e=y(e)).indexOf("?");return -1===r?"":e.slice(r+1)}function h(e,r){d((r={decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1,...r}).arrayFormatSeparator);let t=function(e){let r;switch(e.arrayFormat){case"index":return(e,t,a)=>{if(r=/\[(\d*)]$/.exec(e),e=e.replace(/\[\d*]$/,""),!r){a[e]=t;return}void 0===a[e]&&(a[e]={}),a[e][r[1]]=t};case"bracket":return(e,t,a)=>{if(r=/(\[])$/.exec(e),e=e.replace(/\[]$/,""),!r){a[e]=t;return}if(void 0===a[e]){a[e]=[t];return}a[e]=[...a[e],t]};case"colon-list-separator":return(e,t,a)=>{if(r=/(:list)$/.exec(e),e=e.replace(/:list$/,""),!r){a[e]=t;return}if(void 0===a[e]){a[e]=[t];return}a[e]=[...a[e],t]};case"comma":case"separator":return(r,t,a)=>{let n="string"==typeof t&&t.includes(e.arrayFormatSeparator),s="string"==typeof t&&!n&&f(t,e).includes(e.arrayFormatSeparator);t=s?f(t,e):t;let i=n||s?t.split(e.arrayFormatSeparator).map(r=>f(r,e)):null===t?t:f(t,e);a[r]=i};case"bracket-separator":return(r,t,a)=>{let n=/(\[])$/.test(r);if(r=r.replace(/\[]$/,""),!n){a[r]=t?f(t,e):t;return}let s=null===t?[]:t.split(e.arrayFormatSeparator).map(r=>f(r,e));if(void 0===a[r]){a[r]=s;return}a[r]=[...a[r],...s]};default:return(e,r,t)=>{if(void 0===t[e]){t[e]=r;return}t[e]=[...[t[e]].flat(),r]}}}(r),a=Object.create(null);if("string"!=typeof e||!(e=e.trim().replace(/^[?#&]/,"")))return a;for(let n of e.split("&")){if(""===n)continue;let e=r.decode?n.replaceAll("+"," "):n,[s,i]=o(e,"=");void 0===s&&(s=e),i=void 0===i?null:["comma","separator","bracket-separator"].includes(r.arrayFormat)?i:f(i,r),t(f(s,r),i,a)}for(let[e,t]of Object.entries(a))if("object"==typeof t&&null!==t)for(let[e,a]of Object.entries(t))t[e]=m(a,r);else a[e]=m(t,r);return!1===r.sort?a:(!0===r.sort?Object.keys(a).sort():Object.keys(a).sort(r.sort)).reduce((e,r)=>{let t=a[r];return e[r]=t&&"object"==typeof t&&!Array.isArray(t)?function e(r){return Array.isArray(r)?r.sort():"object"==typeof r?e(Object.keys(r)).sort((e,r)=>Number(e)-Number(r)).map(e=>r[e]):r}(t):t,e},Object.create(null))}function x(e,r){if(!e)return"";d((r={encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:",",...r}).arrayFormatSeparator);let t=t=>r.skipNull&&l(e[t])||r.skipEmptyString&&""===e[t],a=function(e){switch(e.arrayFormat){case"index":return r=>(t,a)=>{let n=t.length;return void 0===a||e.skipNull&&null===a||e.skipEmptyString&&""===a?t:null===a?[...t,[p(r,e),"[",n,"]"].join("")]:[...t,[p(r,e),"[",p(n,e),"]=",p(a,e)].join("")]};case"bracket":return r=>(t,a)=>void 0===a||e.skipNull&&null===a||e.skipEmptyString&&""===a?t:null===a?[...t,[p(r,e),"[]"].join("")]:[...t,[p(r,e),"[]=",p(a,e)].join("")];case"colon-list-separator":return r=>(t,a)=>void 0===a||e.skipNull&&null===a||e.skipEmptyString&&""===a?t:null===a?[...t,[p(r,e),":list="].join("")]:[...t,[p(r,e),":list=",p(a,e)].join("")];case"comma":case"separator":case"bracket-separator":{let r="bracket-separator"===e.arrayFormat?"[]=":"=";return t=>(a,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?a:(n=null===n?"":n,0===a.length)?[[p(t,e),r,p(n,e)].join("")]:[[a,p(n,e)].join(e.arrayFormatSeparator)]}default:return r=>(t,a)=>void 0===a||e.skipNull&&null===a||e.skipEmptyString&&""===a?t:null===a?[...t,p(r,e)]:[...t,[p(r,e),"=",p(a,e)].join("")]}}(r),n={};for(let[r,a]of Object.entries(e))t(r)||(n[r]=a);let s=Object.keys(n);return!1!==r.sort&&s.sort(r.sort),s.map(t=>{let n=e[t];return void 0===n?"":null===n?p(t,r):Array.isArray(n)?0===n.length&&"bracket-separator"===r.arrayFormat?p(t,r)+"[]":n.reduce(a(t),[]).join("&"):p(t,r)+"="+p(n,r)}).filter(e=>e.length>0).join("&")}function v(e,r){r={decode:!0,...r};let[t,a]=o(e,"#");return void 0===t&&(t=e),{url:t?.split("?")?.[0]??"",query:h(g(e),r),...r&&r.parseFragmentIdentifier&&a?{fragmentIdentifier:f(a,r)}:{}}}function w(e,r){r={encode:!0,strict:!0,[c]:!0,...r};let t=y(e.url).split("?")[0]||"",a=x({...h(g(e.url),{sort:!1}),...e.query},r);a&&=`?${a}`;let n=function(e){let r="",t=e.indexOf("#");return -1!==t&&(r=e.slice(t)),r}(e.url);if("string"==typeof e.fragmentIdentifier){let a=new URL(t);a.hash=e.fragmentIdentifier,n=r[c]?a.hash:`#${e.fragmentIdentifier}`}return`${t}${a}${n}`}function b(e,r,t){let{url:a,query:n,fragmentIdentifier:s}=v(e,t={parseFragmentIdentifier:!0,[c]:!1,...t});return w({url:a,query:function(e,r){let t={};if(Array.isArray(r))for(let a of r){let r=Object.getOwnPropertyDescriptor(e,a);r?.enumerable&&Object.defineProperty(t,a,r)}else for(let a of Reflect.ownKeys(e)){let n=Object.getOwnPropertyDescriptor(e,a);if(n.enumerable){let s=e[a];r(a,s,e)&&Object.defineProperty(t,a,n)}}return t}(n,r),fragmentIdentifier:s},t)}function R(e,r,t){return b(e,Array.isArray(r)?e=>!r.includes(e):(e,t)=>!r(e,t),t)}let k=a}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[1633,1744,9937,3788,1490,5059,413],()=>t(4049));module.exports=a})();