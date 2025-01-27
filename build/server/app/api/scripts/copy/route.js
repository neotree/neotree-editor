"use strict";(()=>{var e={};e.id=202,e.ids=[202],e.modules={67096:e=>{e.exports=require("bcrypt")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},71017:e=>{e.exports=require("path")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},76224:e=>{e.exports=require("tty")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},4398:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>m,patchFetch:()=>x,requestAsyncStorage:()=>f,routeModule:()=>d,serverHooks:()=>g,staticGenerationAsyncStorage:()=>y});var o={};t.r(o),t.d(o,{POST:()=>p});var n=t(49303),i=t(88716),s=t(60670),a=t(87070),l=t(72761),u=t(87845),c=t(57435);async function p(e){try{if(!(await (0,l.$)()).yes)return a.NextResponse.json({errors:["Unauthorised"]});let r=await e.json(),t=await (0,u.copyScripts)(r);return a.NextResponse.json(t)}catch(e){return c.Z.log("/api/scripts/copy",e),a.NextResponse.json({errors:[e.message]})}}let d=new n.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/scripts/copy/route",pathname:"/api/scripts/copy",filename:"route",bundlePath:"app/api/scripts/copy/route"},resolvedPagePath:"/home/farai/Workbench/Neotree/neotree-editor-master/app/api/scripts/copy/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:f,staticGenerationAsyncStorage:y,serverHooks:g}=d,m="/api/scripts/copy/route";function x(){return(0,s.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:y})}},20123:(e,r,t)=>{t.d(r,{Ng:()=>c,_U:()=>y,QF:()=>u,YF:()=>f});var o=t(57745),n=t(81445),i=t(30900),s=t(10413),a=t(88182),l=t(57435);async function u(e){try{let{sitesIds:r,types:t=[],envs:l=[],links:u=[]}={...e},c=r||[],p=c?.length?(0,o.d3)(a.sites.siteId,c.filter(e=>i.Z(e))):void 0;u.length&&[...u].forEach(e=>{u.push(e.replace("http:","https:")),u.push(e.replace("https","http"))});let d=[(0,o.Ft)(a.sites.deletedAt),p,t.length?(0,o.d3)(a.sites.type,t):void 0,l.length?(0,o.d3)(a.sites.env,l):void 0,u.length?(0,o.d3)(a.sites.link,u):void 0];return{data:(await s.Z.select({site:a.sites}).from(a.sites).where(d.length?(0,o.xD)(...d):void 0).orderBy((0,n.d)(a.sites.id))).map(e=>e.site)}}catch(e){return l.Z.error("_getSites ERROR",e.message),{data:[],errors:[e.message]}}}async function c(e){let{siteId:r}={...e};try{if(!r)throw Error("Missing siteId");let e=i.Z(r)?(0,o.eq)(a.sites.siteId,r):void 0;return{data:await s.Z.query.sites.findFirst({where:(0,o.xD)((0,o.Ft)(a.sites.deletedAt),e)})}}catch(e){return l.Z.error("_getSite ERROR",e.message),{errors:[e.message]}}}var p=t(8328);let d=()=>{let e=(0,p.w)();return{webeditor:{name:"Local editor",siteId:"fb76af5a-bf86-4050-821e-44f1bf316bf4",link:e.origin,type:"webeditor",apiKey:"localhost"},nodeapi:{name:"Local editor",siteId:"5cb4aa54-2cfe-49e2-9cdd-392a9b8c124e",link:e.origin,type:"webeditor",apiKey:"localhost"}}};async function f(e){try{let{types:r=[]}={...e},t=[...r.length?[(0,o.d3)(a.sites.type,r)]:[]],n=await s.Z.query.sites.findMany({where:t.length?(0,o.xD)(...t):void 0,columns:{siteId:!0,type:!0,name:!0,link:!0}});return d(),{data:[...n]}}catch(e){return l.Z.error("_getSites ERROR",e.message),{data:[],errors:[e.message]}}}async function y(e){try{let r=await s.Z.query.sites.findFirst({where:(0,o.eq)(a.sites.siteId,e),columns:{apiKey:!0,link:!0}}),t=r||null;if(!r){let r=d();Object.values(r).forEach(r=>{r.siteId===e&&(t={link:r.link,apiKey:r.apiKey})})}return{data:t}}catch(e){return l.Z.error("_getSiteApiKey ERROR",e.message),{data:null,errors:[e.message]}}}},8328:(e,r,t)=>{t.d(r,{w:()=>n});var o=t(71615);function n(){let e=(0,o.headers)(),r=e.get("x-api-key"),t=e.get("x-bearer-token"),n=e.get("x-url"),i=e.get("x-next-url-host"),s=e.get("x-next-url-href"),a=e.get("x-next-url-port"),l=e.get("x-next-url-hostname"),u=e.get("x-next-url-pathname"),c=e.get("x-next-url-search"),p=e.get("x-next-url-protocol"),d=e.get("x-next-url-username"),f=e.get("x-next-url-locale"),y=e.get("x-next-url-origin"),g=e.get("x-geo-city"),m=e.get("x-geo-country");return{apiKey:r,bearerToken:t,url:n||"",host:i||"",href:s||"",port:a||"",hostname:l||"",pathname:u||"",search:c||"",protocol:p||"",username:d||"",locale:f||"",origin:y||"",city:g||"",country:m||"",region:e.get("x-geo-region")||"",latitude:e.get("x-geo-latitude")||"",longitude:e.get("x-geo-longitude")||""}}},49530:(e,r,t)=>{t.d(r,{Z:()=>v});var o={};t.r(o),t.d(o,{exclude:()=>k,extract:()=>m,parse:()=>x,parseUrl:()=>b,pick:()=>q,stringify:()=>h,stringifyUrl:()=>j});let n="%[a-f0-9]{2}",i=RegExp("("+n+")|([^%]+?)","gi"),s=RegExp("("+n+")+","gi");function a(e,r){if(!("string"==typeof e&&"string"==typeof r))throw TypeError("Expected the arguments to be of type `string`");if(""===e||""===r)return[];let t=e.indexOf(r);return -1===t?[]:[e.slice(0,t),e.slice(t+r.length)]}let l=e=>null==e,u=e=>encodeURIComponent(e).replaceAll(/[!'()*]/g,e=>`%${e.charCodeAt(0).toString(16).toUpperCase()}`),c=Symbol("encodeFragmentIdentifier");function p(e){if("string"!=typeof e||1!==e.length)throw TypeError("arrayFormatSeparator must be single character string")}function d(e,r){return r.encode?r.strict?u(e):encodeURIComponent(e):e}function f(e,r){return r.decode?function(e){if("string"!=typeof e)throw TypeError("Expected `encodedURI` to be of type `string`, got `"+typeof e+"`");try{return decodeURIComponent(e)}catch{return function(e){let r={"%FE%FF":"��","%FF%FE":"��"},t=s.exec(e);for(;t;){try{r[t[0]]=decodeURIComponent(t[0])}catch{let e=function(e){try{return decodeURIComponent(e)}catch{let r=e.match(i)||[];for(let t=1;t<r.length;t++)r=(e=(function e(r,t){try{return[decodeURIComponent(r.join(""))]}catch{}if(1===r.length)return r;t=t||1;let o=r.slice(0,t),n=r.slice(t);return Array.prototype.concat.call([],e(o),e(n))})(r,t).join("")).match(i)||[];return e}}(t[0]);e!==t[0]&&(r[t[0]]=e)}t=s.exec(e)}for(let t of(r["%C2"]="�",Object.keys(r)))e=e.replace(RegExp(t,"g"),r[t]);return e}(e)}}(e):e}function y(e){let r=e.indexOf("#");return -1!==r&&(e=e.slice(0,r)),e}function g(e,r){return r.parseNumbers&&!Number.isNaN(Number(e))&&"string"==typeof e&&""!==e.trim()?e=Number(e):r.parseBooleans&&null!==e&&("true"===e.toLowerCase()||"false"===e.toLowerCase())&&(e="true"===e.toLowerCase()),e}function m(e){let r=(e=y(e)).indexOf("?");return -1===r?"":e.slice(r+1)}function x(e,r){p((r={decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1,...r}).arrayFormatSeparator);let t=function(e){let r;switch(e.arrayFormat){case"index":return(e,t,o)=>{if(r=/\[(\d*)]$/.exec(e),e=e.replace(/\[\d*]$/,""),!r){o[e]=t;return}void 0===o[e]&&(o[e]={}),o[e][r[1]]=t};case"bracket":return(e,t,o)=>{if(r=/(\[])$/.exec(e),e=e.replace(/\[]$/,""),!r){o[e]=t;return}if(void 0===o[e]){o[e]=[t];return}o[e]=[...o[e],t]};case"colon-list-separator":return(e,t,o)=>{if(r=/(:list)$/.exec(e),e=e.replace(/:list$/,""),!r){o[e]=t;return}if(void 0===o[e]){o[e]=[t];return}o[e]=[...o[e],t]};case"comma":case"separator":return(r,t,o)=>{let n="string"==typeof t&&t.includes(e.arrayFormatSeparator),i="string"==typeof t&&!n&&f(t,e).includes(e.arrayFormatSeparator);t=i?f(t,e):t;let s=n||i?t.split(e.arrayFormatSeparator).map(r=>f(r,e)):null===t?t:f(t,e);o[r]=s};case"bracket-separator":return(r,t,o)=>{let n=/(\[])$/.test(r);if(r=r.replace(/\[]$/,""),!n){o[r]=t?f(t,e):t;return}let i=null===t?[]:t.split(e.arrayFormatSeparator).map(r=>f(r,e));if(void 0===o[r]){o[r]=i;return}o[r]=[...o[r],...i]};default:return(e,r,t)=>{if(void 0===t[e]){t[e]=r;return}t[e]=[...[t[e]].flat(),r]}}}(r),o=Object.create(null);if("string"!=typeof e||!(e=e.trim().replace(/^[?#&]/,"")))return o;for(let n of e.split("&")){if(""===n)continue;let e=r.decode?n.replaceAll("+"," "):n,[i,s]=a(e,"=");void 0===i&&(i=e),s=void 0===s?null:["comma","separator","bracket-separator"].includes(r.arrayFormat)?s:f(s,r),t(f(i,r),s,o)}for(let[e,t]of Object.entries(o))if("object"==typeof t&&null!==t)for(let[e,o]of Object.entries(t))t[e]=g(o,r);else o[e]=g(t,r);return!1===r.sort?o:(!0===r.sort?Object.keys(o).sort():Object.keys(o).sort(r.sort)).reduce((e,r)=>{let t=o[r];return e[r]=t&&"object"==typeof t&&!Array.isArray(t)?function e(r){return Array.isArray(r)?r.sort():"object"==typeof r?e(Object.keys(r)).sort((e,r)=>Number(e)-Number(r)).map(e=>r[e]):r}(t):t,e},Object.create(null))}function h(e,r){if(!e)return"";p((r={encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:",",...r}).arrayFormatSeparator);let t=t=>r.skipNull&&l(e[t])||r.skipEmptyString&&""===e[t],o=function(e){switch(e.arrayFormat){case"index":return r=>(t,o)=>{let n=t.length;return void 0===o||e.skipNull&&null===o||e.skipEmptyString&&""===o?t:null===o?[...t,[d(r,e),"[",n,"]"].join("")]:[...t,[d(r,e),"[",d(n,e),"]=",d(o,e)].join("")]};case"bracket":return r=>(t,o)=>void 0===o||e.skipNull&&null===o||e.skipEmptyString&&""===o?t:null===o?[...t,[d(r,e),"[]"].join("")]:[...t,[d(r,e),"[]=",d(o,e)].join("")];case"colon-list-separator":return r=>(t,o)=>void 0===o||e.skipNull&&null===o||e.skipEmptyString&&""===o?t:null===o?[...t,[d(r,e),":list="].join("")]:[...t,[d(r,e),":list=",d(o,e)].join("")];case"comma":case"separator":case"bracket-separator":{let r="bracket-separator"===e.arrayFormat?"[]=":"=";return t=>(o,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?o:(n=null===n?"":n,0===o.length)?[[d(t,e),r,d(n,e)].join("")]:[[o,d(n,e)].join(e.arrayFormatSeparator)]}default:return r=>(t,o)=>void 0===o||e.skipNull&&null===o||e.skipEmptyString&&""===o?t:null===o?[...t,d(r,e)]:[...t,[d(r,e),"=",d(o,e)].join("")]}}(r),n={};for(let[r,o]of Object.entries(e))t(r)||(n[r]=o);let i=Object.keys(n);return!1!==r.sort&&i.sort(r.sort),i.map(t=>{let n=e[t];return void 0===n?"":null===n?d(t,r):Array.isArray(n)?0===n.length&&"bracket-separator"===r.arrayFormat?d(t,r)+"[]":n.reduce(o(t),[]).join("&"):d(t,r)+"="+d(n,r)}).filter(e=>e.length>0).join("&")}function b(e,r){r={decode:!0,...r};let[t,o]=a(e,"#");return void 0===t&&(t=e),{url:t?.split("?")?.[0]??"",query:x(m(e),r),...r&&r.parseFragmentIdentifier&&o?{fragmentIdentifier:f(o,r)}:{}}}function j(e,r){r={encode:!0,strict:!0,[c]:!0,...r};let t=y(e.url).split("?")[0]||"",o=h({...x(m(e.url),{sort:!1}),...e.query},r);o&&=`?${o}`;let n=function(e){let r="",t=e.indexOf("#");return -1!==t&&(r=e.slice(t)),r}(e.url);if("string"==typeof e.fragmentIdentifier){let o=new URL(t);o.hash=e.fragmentIdentifier,n=r[c]?o.hash:`#${e.fragmentIdentifier}`}return`${t}${o}${n}`}function q(e,r,t){let{url:o,query:n,fragmentIdentifier:i}=b(e,t={parseFragmentIdentifier:!0,[c]:!1,...t});return j({url:o,query:function(e,r){let t={};if(Array.isArray(r))for(let o of r){let r=Object.getOwnPropertyDescriptor(e,o);r?.enumerable&&Object.defineProperty(t,o,r)}else for(let o of Reflect.ownKeys(e)){let n=Object.getOwnPropertyDescriptor(e,o);if(n.enumerable){let i=e[o];r(o,i,e)&&Object.defineProperty(t,o,n)}}return t}(n,r),fragmentIdentifier:i},t)}function k(e,r,t){return q(e,Array.isArray(r)?e=>!r.includes(e):(e,t)=>!r(e,t),t)}let v=o}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[1633,1744,9937,3788,1490,9092,5802,5059,9712,413,6267,6038,2418,7845],()=>t(4398));module.exports=o})();