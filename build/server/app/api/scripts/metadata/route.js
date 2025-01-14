"use strict";(()=>{var e={};e.id=9622,e.ids=[9622],e.modules={67096:e=>{e.exports=require("bcrypt")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},71017:e=>{e.exports=require("path")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},76224:e=>{e.exports=require("tty")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},84381:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>g,patchFetch:()=>x,requestAsyncStorage:()=>d,routeModule:()=>f,serverHooks:()=>y,staticGenerationAsyncStorage:()=>m});var o={};t.r(o),t.d(o,{GET:()=>c});var n=t(49303),a=t(88716),i=t(60670),s=t(87070),u=t(57435),l=t(72761),p=t(87845);async function c(e){try{if(!(await (0,l.$)()).yes)return s.NextResponse.json({errors:["Unauthorised"]});let r=JSON.parse(e.nextUrl.searchParams.get("data")||"{}"),t=await (0,p.getScriptsMetadata)(r);return s.NextResponse.json(t)}catch(e){return u.Z.error("[GET] /api/scripts/metadata",e.message),s.NextResponse.json({errors:["Internal Error"]})}}let f=new n.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/scripts/metadata/route",pathname:"/api/scripts/metadata",filename:"route",bundlePath:"app/api/scripts/metadata/route"},resolvedPagePath:"/home/farai/Workbench/Neotree/neotree-editor-master/app/api/scripts/metadata/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:d,staticGenerationAsyncStorage:m,serverHooks:y}=f,g="/api/scripts/metadata/route";function x(){return(0,i.patchFetch)({serverHooks:y,staticGenerationAsyncStorage:m})}},49530:(e,r,t)=>{t.d(r,{Z:()=>F});var o={};t.r(o),t.d(o,{exclude:()=>k,extract:()=>g,parse:()=>x,parseUrl:()=>b,pick:()=>q,stringify:()=>h,stringifyUrl:()=>j});let n="%[a-f0-9]{2}",a=RegExp("("+n+")|([^%]+?)","gi"),i=RegExp("("+n+")+","gi");function s(e,r){if(!("string"==typeof e&&"string"==typeof r))throw TypeError("Expected the arguments to be of type `string`");if(""===e||""===r)return[];let t=e.indexOf(r);return -1===t?[]:[e.slice(0,t),e.slice(t+r.length)]}let u=e=>null==e,l=e=>encodeURIComponent(e).replaceAll(/[!'()*]/g,e=>`%${e.charCodeAt(0).toString(16).toUpperCase()}`),p=Symbol("encodeFragmentIdentifier");function c(e){if("string"!=typeof e||1!==e.length)throw TypeError("arrayFormatSeparator must be single character string")}function f(e,r){return r.encode?r.strict?l(e):encodeURIComponent(e):e}function d(e,r){return r.decode?function(e){if("string"!=typeof e)throw TypeError("Expected `encodedURI` to be of type `string`, got `"+typeof e+"`");try{return decodeURIComponent(e)}catch{return function(e){let r={"%FE%FF":"��","%FF%FE":"��"},t=i.exec(e);for(;t;){try{r[t[0]]=decodeURIComponent(t[0])}catch{let e=function(e){try{return decodeURIComponent(e)}catch{let r=e.match(a)||[];for(let t=1;t<r.length;t++)r=(e=(function e(r,t){try{return[decodeURIComponent(r.join(""))]}catch{}if(1===r.length)return r;t=t||1;let o=r.slice(0,t),n=r.slice(t);return Array.prototype.concat.call([],e(o),e(n))})(r,t).join("")).match(a)||[];return e}}(t[0]);e!==t[0]&&(r[t[0]]=e)}t=i.exec(e)}for(let t of(r["%C2"]="�",Object.keys(r)))e=e.replace(RegExp(t,"g"),r[t]);return e}(e)}}(e):e}function m(e){let r=e.indexOf("#");return -1!==r&&(e=e.slice(0,r)),e}function y(e,r){return r.parseNumbers&&!Number.isNaN(Number(e))&&"string"==typeof e&&""!==e.trim()?e=Number(e):r.parseBooleans&&null!==e&&("true"===e.toLowerCase()||"false"===e.toLowerCase())&&(e="true"===e.toLowerCase()),e}function g(e){let r=(e=m(e)).indexOf("?");return -1===r?"":e.slice(r+1)}function x(e,r){c((r={decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1,...r}).arrayFormatSeparator);let t=function(e){let r;switch(e.arrayFormat){case"index":return(e,t,o)=>{if(r=/\[(\d*)]$/.exec(e),e=e.replace(/\[\d*]$/,""),!r){o[e]=t;return}void 0===o[e]&&(o[e]={}),o[e][r[1]]=t};case"bracket":return(e,t,o)=>{if(r=/(\[])$/.exec(e),e=e.replace(/\[]$/,""),!r){o[e]=t;return}if(void 0===o[e]){o[e]=[t];return}o[e]=[...o[e],t]};case"colon-list-separator":return(e,t,o)=>{if(r=/(:list)$/.exec(e),e=e.replace(/:list$/,""),!r){o[e]=t;return}if(void 0===o[e]){o[e]=[t];return}o[e]=[...o[e],t]};case"comma":case"separator":return(r,t,o)=>{let n="string"==typeof t&&t.includes(e.arrayFormatSeparator),a="string"==typeof t&&!n&&d(t,e).includes(e.arrayFormatSeparator);t=a?d(t,e):t;let i=n||a?t.split(e.arrayFormatSeparator).map(r=>d(r,e)):null===t?t:d(t,e);o[r]=i};case"bracket-separator":return(r,t,o)=>{let n=/(\[])$/.test(r);if(r=r.replace(/\[]$/,""),!n){o[r]=t?d(t,e):t;return}let a=null===t?[]:t.split(e.arrayFormatSeparator).map(r=>d(r,e));if(void 0===o[r]){o[r]=a;return}o[r]=[...o[r],...a]};default:return(e,r,t)=>{if(void 0===t[e]){t[e]=r;return}t[e]=[...[t[e]].flat(),r]}}}(r),o=Object.create(null);if("string"!=typeof e||!(e=e.trim().replace(/^[?#&]/,"")))return o;for(let n of e.split("&")){if(""===n)continue;let e=r.decode?n.replaceAll("+"," "):n,[a,i]=s(e,"=");void 0===a&&(a=e),i=void 0===i?null:["comma","separator","bracket-separator"].includes(r.arrayFormat)?i:d(i,r),t(d(a,r),i,o)}for(let[e,t]of Object.entries(o))if("object"==typeof t&&null!==t)for(let[e,o]of Object.entries(t))t[e]=y(o,r);else o[e]=y(t,r);return!1===r.sort?o:(!0===r.sort?Object.keys(o).sort():Object.keys(o).sort(r.sort)).reduce((e,r)=>{let t=o[r];return e[r]=t&&"object"==typeof t&&!Array.isArray(t)?function e(r){return Array.isArray(r)?r.sort():"object"==typeof r?e(Object.keys(r)).sort((e,r)=>Number(e)-Number(r)).map(e=>r[e]):r}(t):t,e},Object.create(null))}function h(e,r){if(!e)return"";c((r={encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:",",...r}).arrayFormatSeparator);let t=t=>r.skipNull&&u(e[t])||r.skipEmptyString&&""===e[t],o=function(e){switch(e.arrayFormat){case"index":return r=>(t,o)=>{let n=t.length;return void 0===o||e.skipNull&&null===o||e.skipEmptyString&&""===o?t:null===o?[...t,[f(r,e),"[",n,"]"].join("")]:[...t,[f(r,e),"[",f(n,e),"]=",f(o,e)].join("")]};case"bracket":return r=>(t,o)=>void 0===o||e.skipNull&&null===o||e.skipEmptyString&&""===o?t:null===o?[...t,[f(r,e),"[]"].join("")]:[...t,[f(r,e),"[]=",f(o,e)].join("")];case"colon-list-separator":return r=>(t,o)=>void 0===o||e.skipNull&&null===o||e.skipEmptyString&&""===o?t:null===o?[...t,[f(r,e),":list="].join("")]:[...t,[f(r,e),":list=",f(o,e)].join("")];case"comma":case"separator":case"bracket-separator":{let r="bracket-separator"===e.arrayFormat?"[]=":"=";return t=>(o,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?o:(n=null===n?"":n,0===o.length)?[[f(t,e),r,f(n,e)].join("")]:[[o,f(n,e)].join(e.arrayFormatSeparator)]}default:return r=>(t,o)=>void 0===o||e.skipNull&&null===o||e.skipEmptyString&&""===o?t:null===o?[...t,f(r,e)]:[...t,[f(r,e),"=",f(o,e)].join("")]}}(r),n={};for(let[r,o]of Object.entries(e))t(r)||(n[r]=o);let a=Object.keys(n);return!1!==r.sort&&a.sort(r.sort),a.map(t=>{let n=e[t];return void 0===n?"":null===n?f(t,r):Array.isArray(n)?0===n.length&&"bracket-separator"===r.arrayFormat?f(t,r)+"[]":n.reduce(o(t),[]).join("&"):f(t,r)+"="+f(n,r)}).filter(e=>e.length>0).join("&")}function b(e,r){r={decode:!0,...r};let[t,o]=s(e,"#");return void 0===t&&(t=e),{url:t?.split("?")?.[0]??"",query:x(g(e),r),...r&&r.parseFragmentIdentifier&&o?{fragmentIdentifier:d(o,r)}:{}}}function j(e,r){r={encode:!0,strict:!0,[p]:!0,...r};let t=m(e.url).split("?")[0]||"",o=h({...x(g(e.url),{sort:!1}),...e.query},r);o&&=`?${o}`;let n=function(e){let r="",t=e.indexOf("#");return -1!==t&&(r=e.slice(t)),r}(e.url);if("string"==typeof e.fragmentIdentifier){let o=new URL(t);o.hash=e.fragmentIdentifier,n=r[p]?o.hash:`#${e.fragmentIdentifier}`}return`${t}${o}${n}`}function q(e,r,t){let{url:o,query:n,fragmentIdentifier:a}=b(e,t={parseFragmentIdentifier:!0,[p]:!1,...t});return j({url:o,query:function(e,r){let t={};if(Array.isArray(r))for(let o of r){let r=Object.getOwnPropertyDescriptor(e,o);r?.enumerable&&Object.defineProperty(t,o,r)}else for(let o of Reflect.ownKeys(e)){let n=Object.getOwnPropertyDescriptor(e,o);if(n.enumerable){let a=e[o];r(o,a,e)&&Object.defineProperty(t,o,n)}}return t}(n,r),fragmentIdentifier:a},t)}function k(e,r,t){return q(e,Array.isArray(r)?e=>!r.includes(e):(e,t)=>!r(e,t),t)}let F=o}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[1633,1744,9937,3788,1490,9092,5802,5059,9712,413,6267,3795,7065,1966,7845],()=>t(84381));module.exports=o})();