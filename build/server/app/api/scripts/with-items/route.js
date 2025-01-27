"use strict";(()=>{var e={};e.id=4851,e.ids=[4851],e.modules={67096:e=>{e.exports=require("bcrypt")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},71017:e=>{e.exports=require("path")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},76224:e=>{e.exports=require("tty")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},14216:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>x,patchFetch:()=>h,requestAsyncStorage:()=>g,routeModule:()=>f,serverHooks:()=>m,staticGenerationAsyncStorage:()=>y});var s={};r.r(s),r.d(s,{GET:()=>d,POST:()=>p});var n=r(49303),o=r(88716),i=r(60670),a=r(87070),l=r(57435),u=r(72761),c=r(87845);async function p(e){try{if(!(await (0,u.$)()).yes)return a.NextResponse.json({errors:["Unauthorised"]},{status:200});let t=(await e.json()).data,r=await (0,c.saveScriptsWithItems)({data:t});return a.NextResponse.json(r,{status:200})}catch(e){return l.Z.error("[POST] /api/scripts/with-items",e.message),a.NextResponse.json({errors:["Internal Error"]},{status:200})}}async function d(e){try{if(!(await (0,u.$)()).yes)return a.NextResponse.json({errors:["Unauthorised"]},{status:200});let t=e.nextUrl.searchParams.get("scriptsIds"),r=t?JSON.parse(t):void 0,s=JSON.parse(e.nextUrl.searchParams.get("data")||"{}"),{errors:n,data:o}=await (0,c.getScriptsWithItems)({...s,scriptsIds:r||s.scriptsIds});if(n?.length)return a.NextResponse.json({errors:n},{status:200});return a.NextResponse.json({data:o},{status:200})}catch(e){return l.Z.error("[GET] /api/scripts/with-items",e.message),a.NextResponse.json({errors:["Internal Error"]},{status:200})}}let f=new n.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/scripts/with-items/route",pathname:"/api/scripts/with-items",filename:"route",bundlePath:"app/api/scripts/with-items/route"},resolvedPagePath:"/home/farai/Workbench/Neotree/neotree-editor-master/app/api/scripts/with-items/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:g,staticGenerationAsyncStorage:y,serverHooks:m}=f,x="/api/scripts/with-items/route";function h(){return(0,i.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:y})}},20123:(e,t,r)=>{r.d(t,{Ng:()=>c,_U:()=>g,QF:()=>u,YF:()=>f});var s=r(57745),n=r(81445),o=r(30900),i=r(10413),a=r(88182),l=r(57435);async function u(e){try{let{sitesIds:t,types:r=[],envs:l=[],links:u=[]}={...e},c=t||[],p=c?.length?(0,s.d3)(a.sites.siteId,c.filter(e=>o.Z(e))):void 0;u.length&&[...u].forEach(e=>{u.push(e.replace("http:","https:")),u.push(e.replace("https","http"))});let d=[(0,s.Ft)(a.sites.deletedAt),p,r.length?(0,s.d3)(a.sites.type,r):void 0,l.length?(0,s.d3)(a.sites.env,l):void 0,u.length?(0,s.d3)(a.sites.link,u):void 0];return{data:(await i.Z.select({site:a.sites}).from(a.sites).where(d.length?(0,s.xD)(...d):void 0).orderBy((0,n.d)(a.sites.id))).map(e=>e.site)}}catch(e){return l.Z.error("_getSites ERROR",e.message),{data:[],errors:[e.message]}}}async function c(e){let{siteId:t}={...e};try{if(!t)throw Error("Missing siteId");let e=o.Z(t)?(0,s.eq)(a.sites.siteId,t):void 0;return{data:await i.Z.query.sites.findFirst({where:(0,s.xD)((0,s.Ft)(a.sites.deletedAt),e)})}}catch(e){return l.Z.error("_getSite ERROR",e.message),{errors:[e.message]}}}var p=r(8328);let d=()=>{let e=(0,p.w)();return{webeditor:{name:"Local editor",siteId:"fb76af5a-bf86-4050-821e-44f1bf316bf4",link:e.origin,type:"webeditor",apiKey:"localhost"},nodeapi:{name:"Local editor",siteId:"5cb4aa54-2cfe-49e2-9cdd-392a9b8c124e",link:e.origin,type:"webeditor",apiKey:"localhost"}}};async function f(e){try{let{types:t=[]}={...e},r=[...t.length?[(0,s.d3)(a.sites.type,t)]:[]],n=await i.Z.query.sites.findMany({where:r.length?(0,s.xD)(...r):void 0,columns:{siteId:!0,type:!0,name:!0,link:!0}});return d(),{data:[...n]}}catch(e){return l.Z.error("_getSites ERROR",e.message),{data:[],errors:[e.message]}}}async function g(e){try{let t=await i.Z.query.sites.findFirst({where:(0,s.eq)(a.sites.siteId,e),columns:{apiKey:!0,link:!0}}),r=t||null;if(!t){let t=d();Object.values(t).forEach(t=>{t.siteId===e&&(r={link:t.link,apiKey:t.apiKey})})}return{data:r}}catch(e){return l.Z.error("_getSiteApiKey ERROR",e.message),{data:null,errors:[e.message]}}}},8328:(e,t,r)=>{r.d(t,{w:()=>n});var s=r(71615);function n(){let e=(0,s.headers)(),t=e.get("x-api-key"),r=e.get("x-bearer-token"),n=e.get("x-url"),o=e.get("x-next-url-host"),i=e.get("x-next-url-href"),a=e.get("x-next-url-port"),l=e.get("x-next-url-hostname"),u=e.get("x-next-url-pathname"),c=e.get("x-next-url-search"),p=e.get("x-next-url-protocol"),d=e.get("x-next-url-username"),f=e.get("x-next-url-locale"),g=e.get("x-next-url-origin"),y=e.get("x-geo-city"),m=e.get("x-geo-country");return{apiKey:t,bearerToken:r,url:n||"",host:o||"",href:i||"",port:a||"",hostname:l||"",pathname:u||"",search:c||"",protocol:p||"",username:d||"",locale:f||"",origin:g||"",city:y||"",country:m||"",region:e.get("x-geo-region")||"",latitude:e.get("x-geo-latitude")||"",longitude:e.get("x-geo-longitude")||""}}},49530:(e,t,r)=>{r.d(t,{Z:()=>k});var s={};r.r(s),r.d(s,{exclude:()=>w,extract:()=>m,parse:()=>x,parseUrl:()=>b,pick:()=>q,stringify:()=>h,stringifyUrl:()=>j});let n="%[a-f0-9]{2}",o=RegExp("("+n+")|([^%]+?)","gi"),i=RegExp("("+n+")+","gi");function a(e,t){if(!("string"==typeof e&&"string"==typeof t))throw TypeError("Expected the arguments to be of type `string`");if(""===e||""===t)return[];let r=e.indexOf(t);return -1===r?[]:[e.slice(0,r),e.slice(r+t.length)]}let l=e=>null==e,u=e=>encodeURIComponent(e).replaceAll(/[!'()*]/g,e=>`%${e.charCodeAt(0).toString(16).toUpperCase()}`),c=Symbol("encodeFragmentIdentifier");function p(e){if("string"!=typeof e||1!==e.length)throw TypeError("arrayFormatSeparator must be single character string")}function d(e,t){return t.encode?t.strict?u(e):encodeURIComponent(e):e}function f(e,t){return t.decode?function(e){if("string"!=typeof e)throw TypeError("Expected `encodedURI` to be of type `string`, got `"+typeof e+"`");try{return decodeURIComponent(e)}catch{return function(e){let t={"%FE%FF":"��","%FF%FE":"��"},r=i.exec(e);for(;r;){try{t[r[0]]=decodeURIComponent(r[0])}catch{let e=function(e){try{return decodeURIComponent(e)}catch{let t=e.match(o)||[];for(let r=1;r<t.length;r++)t=(e=(function e(t,r){try{return[decodeURIComponent(t.join(""))]}catch{}if(1===t.length)return t;r=r||1;let s=t.slice(0,r),n=t.slice(r);return Array.prototype.concat.call([],e(s),e(n))})(t,r).join("")).match(o)||[];return e}}(r[0]);e!==r[0]&&(t[r[0]]=e)}r=i.exec(e)}for(let r of(t["%C2"]="�",Object.keys(t)))e=e.replace(RegExp(r,"g"),t[r]);return e}(e)}}(e):e}function g(e){let t=e.indexOf("#");return -1!==t&&(e=e.slice(0,t)),e}function y(e,t){return t.parseNumbers&&!Number.isNaN(Number(e))&&"string"==typeof e&&""!==e.trim()?e=Number(e):t.parseBooleans&&null!==e&&("true"===e.toLowerCase()||"false"===e.toLowerCase())&&(e="true"===e.toLowerCase()),e}function m(e){let t=(e=g(e)).indexOf("?");return -1===t?"":e.slice(t+1)}function x(e,t){p((t={decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1,...t}).arrayFormatSeparator);let r=function(e){let t;switch(e.arrayFormat){case"index":return(e,r,s)=>{if(t=/\[(\d*)]$/.exec(e),e=e.replace(/\[\d*]$/,""),!t){s[e]=r;return}void 0===s[e]&&(s[e]={}),s[e][t[1]]=r};case"bracket":return(e,r,s)=>{if(t=/(\[])$/.exec(e),e=e.replace(/\[]$/,""),!t){s[e]=r;return}if(void 0===s[e]){s[e]=[r];return}s[e]=[...s[e],r]};case"colon-list-separator":return(e,r,s)=>{if(t=/(:list)$/.exec(e),e=e.replace(/:list$/,""),!t){s[e]=r;return}if(void 0===s[e]){s[e]=[r];return}s[e]=[...s[e],r]};case"comma":case"separator":return(t,r,s)=>{let n="string"==typeof r&&r.includes(e.arrayFormatSeparator),o="string"==typeof r&&!n&&f(r,e).includes(e.arrayFormatSeparator);r=o?f(r,e):r;let i=n||o?r.split(e.arrayFormatSeparator).map(t=>f(t,e)):null===r?r:f(r,e);s[t]=i};case"bracket-separator":return(t,r,s)=>{let n=/(\[])$/.test(t);if(t=t.replace(/\[]$/,""),!n){s[t]=r?f(r,e):r;return}let o=null===r?[]:r.split(e.arrayFormatSeparator).map(t=>f(t,e));if(void 0===s[t]){s[t]=o;return}s[t]=[...s[t],...o]};default:return(e,t,r)=>{if(void 0===r[e]){r[e]=t;return}r[e]=[...[r[e]].flat(),t]}}}(t),s=Object.create(null);if("string"!=typeof e||!(e=e.trim().replace(/^[?#&]/,"")))return s;for(let n of e.split("&")){if(""===n)continue;let e=t.decode?n.replaceAll("+"," "):n,[o,i]=a(e,"=");void 0===o&&(o=e),i=void 0===i?null:["comma","separator","bracket-separator"].includes(t.arrayFormat)?i:f(i,t),r(f(o,t),i,s)}for(let[e,r]of Object.entries(s))if("object"==typeof r&&null!==r)for(let[e,s]of Object.entries(r))r[e]=y(s,t);else s[e]=y(r,t);return!1===t.sort?s:(!0===t.sort?Object.keys(s).sort():Object.keys(s).sort(t.sort)).reduce((e,t)=>{let r=s[t];return e[t]=r&&"object"==typeof r&&!Array.isArray(r)?function e(t){return Array.isArray(t)?t.sort():"object"==typeof t?e(Object.keys(t)).sort((e,t)=>Number(e)-Number(t)).map(e=>t[e]):t}(r):r,e},Object.create(null))}function h(e,t){if(!e)return"";p((t={encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:",",...t}).arrayFormatSeparator);let r=r=>t.skipNull&&l(e[r])||t.skipEmptyString&&""===e[r],s=function(e){switch(e.arrayFormat){case"index":return t=>(r,s)=>{let n=r.length;return void 0===s||e.skipNull&&null===s||e.skipEmptyString&&""===s?r:null===s?[...r,[d(t,e),"[",n,"]"].join("")]:[...r,[d(t,e),"[",d(n,e),"]=",d(s,e)].join("")]};case"bracket":return t=>(r,s)=>void 0===s||e.skipNull&&null===s||e.skipEmptyString&&""===s?r:null===s?[...r,[d(t,e),"[]"].join("")]:[...r,[d(t,e),"[]=",d(s,e)].join("")];case"colon-list-separator":return t=>(r,s)=>void 0===s||e.skipNull&&null===s||e.skipEmptyString&&""===s?r:null===s?[...r,[d(t,e),":list="].join("")]:[...r,[d(t,e),":list=",d(s,e)].join("")];case"comma":case"separator":case"bracket-separator":{let t="bracket-separator"===e.arrayFormat?"[]=":"=";return r=>(s,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?s:(n=null===n?"":n,0===s.length)?[[d(r,e),t,d(n,e)].join("")]:[[s,d(n,e)].join(e.arrayFormatSeparator)]}default:return t=>(r,s)=>void 0===s||e.skipNull&&null===s||e.skipEmptyString&&""===s?r:null===s?[...r,d(t,e)]:[...r,[d(t,e),"=",d(s,e)].join("")]}}(t),n={};for(let[t,s]of Object.entries(e))r(t)||(n[t]=s);let o=Object.keys(n);return!1!==t.sort&&o.sort(t.sort),o.map(r=>{let n=e[r];return void 0===n?"":null===n?d(r,t):Array.isArray(n)?0===n.length&&"bracket-separator"===t.arrayFormat?d(r,t)+"[]":n.reduce(s(r),[]).join("&"):d(r,t)+"="+d(n,t)}).filter(e=>e.length>0).join("&")}function b(e,t){t={decode:!0,...t};let[r,s]=a(e,"#");return void 0===r&&(r=e),{url:r?.split("?")?.[0]??"",query:x(m(e),t),...t&&t.parseFragmentIdentifier&&s?{fragmentIdentifier:f(s,t)}:{}}}function j(e,t){t={encode:!0,strict:!0,[c]:!0,...t};let r=g(e.url).split("?")[0]||"",s=h({...x(m(e.url),{sort:!1}),...e.query},t);s&&=`?${s}`;let n=function(e){let t="",r=e.indexOf("#");return -1!==r&&(t=e.slice(r)),t}(e.url);if("string"==typeof e.fragmentIdentifier){let s=new URL(r);s.hash=e.fragmentIdentifier,n=t[c]?s.hash:`#${e.fragmentIdentifier}`}return`${r}${s}${n}`}function q(e,t,r){let{url:s,query:n,fragmentIdentifier:o}=b(e,r={parseFragmentIdentifier:!0,[c]:!1,...r});return j({url:s,query:function(e,t){let r={};if(Array.isArray(t))for(let s of t){let t=Object.getOwnPropertyDescriptor(e,s);t?.enumerable&&Object.defineProperty(r,s,t)}else for(let s of Reflect.ownKeys(e)){let n=Object.getOwnPropertyDescriptor(e,s);if(n.enumerable){let o=e[s];t(s,o,e)&&Object.defineProperty(r,s,n)}}return r}(n,t),fragmentIdentifier:o},r)}function w(e,t,r){return q(e,Array.isArray(t)?e=>!t.includes(e):(e,r)=>!t(e,r),r)}let k=s}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[1633,1744,9937,3788,1490,9092,5802,5059,9712,413,6267,6038,2418,7845],()=>r(14216));module.exports=s})();