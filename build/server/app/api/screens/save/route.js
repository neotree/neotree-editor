"use strict";(()=>{var e={};e.id=6953,e.ids=[6953],e.modules={67096:e=>{e.exports=require("bcrypt")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},71017:e=>{e.exports=require("path")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},76224:e=>{e.exports=require("tty")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},17347:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>g,patchFetch:()=>x,requestAsyncStorage:()=>d,routeModule:()=>f,serverHooks:()=>m,staticGenerationAsyncStorage:()=>y});var n={};t.r(n),t.d(n,{POST:()=>p});var o=t(49303),a=t(88716),i=t(60670),s=t(87070),u=t(72761),l=t(87845),c=t(57435);async function p(e){try{if(!(await (0,u.$)()).yes)return s.NextResponse.json({errors:["Unauthorised"]},{status:200});let r=await e.json(),t=await (0,l.saveScreens)(r);return s.NextResponse.json(t)}catch(e){return c.Z.log("/api/screens/save",e),s.NextResponse.json({errors:[e.message]})}}let f=new o.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/screens/save/route",pathname:"/api/screens/save",filename:"route",bundlePath:"app/api/screens/save/route"},resolvedPagePath:"/home/farai/Workbench/Neotree/neotree-editor-master/app/api/screens/save/route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:d,staticGenerationAsyncStorage:y,serverHooks:m}=f,g="/api/screens/save/route";function x(){return(0,i.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:y})}},49530:(e,r,t)=>{t.d(r,{Z:()=>k});var n={};t.r(n),t.d(n,{exclude:()=>v,extract:()=>g,parse:()=>x,parseUrl:()=>b,pick:()=>q,stringify:()=>h,stringifyUrl:()=>j});let o="%[a-f0-9]{2}",a=RegExp("("+o+")|([^%]+?)","gi"),i=RegExp("("+o+")+","gi");function s(e,r){if(!("string"==typeof e&&"string"==typeof r))throw TypeError("Expected the arguments to be of type `string`");if(""===e||""===r)return[];let t=e.indexOf(r);return -1===t?[]:[e.slice(0,t),e.slice(t+r.length)]}let u=e=>null==e,l=e=>encodeURIComponent(e).replaceAll(/[!'()*]/g,e=>`%${e.charCodeAt(0).toString(16).toUpperCase()}`),c=Symbol("encodeFragmentIdentifier");function p(e){if("string"!=typeof e||1!==e.length)throw TypeError("arrayFormatSeparator must be single character string")}function f(e,r){return r.encode?r.strict?l(e):encodeURIComponent(e):e}function d(e,r){return r.decode?function(e){if("string"!=typeof e)throw TypeError("Expected `encodedURI` to be of type `string`, got `"+typeof e+"`");try{return decodeURIComponent(e)}catch{return function(e){let r={"%FE%FF":"��","%FF%FE":"��"},t=i.exec(e);for(;t;){try{r[t[0]]=decodeURIComponent(t[0])}catch{let e=function(e){try{return decodeURIComponent(e)}catch{let r=e.match(a)||[];for(let t=1;t<r.length;t++)r=(e=(function e(r,t){try{return[decodeURIComponent(r.join(""))]}catch{}if(1===r.length)return r;t=t||1;let n=r.slice(0,t),o=r.slice(t);return Array.prototype.concat.call([],e(n),e(o))})(r,t).join("")).match(a)||[];return e}}(t[0]);e!==t[0]&&(r[t[0]]=e)}t=i.exec(e)}for(let t of(r["%C2"]="�",Object.keys(r)))e=e.replace(RegExp(t,"g"),r[t]);return e}(e)}}(e):e}function y(e){let r=e.indexOf("#");return -1!==r&&(e=e.slice(0,r)),e}function m(e,r){return r.parseNumbers&&!Number.isNaN(Number(e))&&"string"==typeof e&&""!==e.trim()?e=Number(e):r.parseBooleans&&null!==e&&("true"===e.toLowerCase()||"false"===e.toLowerCase())&&(e="true"===e.toLowerCase()),e}function g(e){let r=(e=y(e)).indexOf("?");return -1===r?"":e.slice(r+1)}function x(e,r){p((r={decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1,...r}).arrayFormatSeparator);let t=function(e){let r;switch(e.arrayFormat){case"index":return(e,t,n)=>{if(r=/\[(\d*)]$/.exec(e),e=e.replace(/\[\d*]$/,""),!r){n[e]=t;return}void 0===n[e]&&(n[e]={}),n[e][r[1]]=t};case"bracket":return(e,t,n)=>{if(r=/(\[])$/.exec(e),e=e.replace(/\[]$/,""),!r){n[e]=t;return}if(void 0===n[e]){n[e]=[t];return}n[e]=[...n[e],t]};case"colon-list-separator":return(e,t,n)=>{if(r=/(:list)$/.exec(e),e=e.replace(/:list$/,""),!r){n[e]=t;return}if(void 0===n[e]){n[e]=[t];return}n[e]=[...n[e],t]};case"comma":case"separator":return(r,t,n)=>{let o="string"==typeof t&&t.includes(e.arrayFormatSeparator),a="string"==typeof t&&!o&&d(t,e).includes(e.arrayFormatSeparator);t=a?d(t,e):t;let i=o||a?t.split(e.arrayFormatSeparator).map(r=>d(r,e)):null===t?t:d(t,e);n[r]=i};case"bracket-separator":return(r,t,n)=>{let o=/(\[])$/.test(r);if(r=r.replace(/\[]$/,""),!o){n[r]=t?d(t,e):t;return}let a=null===t?[]:t.split(e.arrayFormatSeparator).map(r=>d(r,e));if(void 0===n[r]){n[r]=a;return}n[r]=[...n[r],...a]};default:return(e,r,t)=>{if(void 0===t[e]){t[e]=r;return}t[e]=[...[t[e]].flat(),r]}}}(r),n=Object.create(null);if("string"!=typeof e||!(e=e.trim().replace(/^[?#&]/,"")))return n;for(let o of e.split("&")){if(""===o)continue;let e=r.decode?o.replaceAll("+"," "):o,[a,i]=s(e,"=");void 0===a&&(a=e),i=void 0===i?null:["comma","separator","bracket-separator"].includes(r.arrayFormat)?i:d(i,r),t(d(a,r),i,n)}for(let[e,t]of Object.entries(n))if("object"==typeof t&&null!==t)for(let[e,n]of Object.entries(t))t[e]=m(n,r);else n[e]=m(t,r);return!1===r.sort?n:(!0===r.sort?Object.keys(n).sort():Object.keys(n).sort(r.sort)).reduce((e,r)=>{let t=n[r];return e[r]=t&&"object"==typeof t&&!Array.isArray(t)?function e(r){return Array.isArray(r)?r.sort():"object"==typeof r?e(Object.keys(r)).sort((e,r)=>Number(e)-Number(r)).map(e=>r[e]):r}(t):t,e},Object.create(null))}function h(e,r){if(!e)return"";p((r={encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:",",...r}).arrayFormatSeparator);let t=t=>r.skipNull&&u(e[t])||r.skipEmptyString&&""===e[t],n=function(e){switch(e.arrayFormat){case"index":return r=>(t,n)=>{let o=t.length;return void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?t:null===n?[...t,[f(r,e),"[",o,"]"].join("")]:[...t,[f(r,e),"[",f(o,e),"]=",f(n,e)].join("")]};case"bracket":return r=>(t,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?t:null===n?[...t,[f(r,e),"[]"].join("")]:[...t,[f(r,e),"[]=",f(n,e)].join("")];case"colon-list-separator":return r=>(t,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?t:null===n?[...t,[f(r,e),":list="].join("")]:[...t,[f(r,e),":list=",f(n,e)].join("")];case"comma":case"separator":case"bracket-separator":{let r="bracket-separator"===e.arrayFormat?"[]=":"=";return t=>(n,o)=>void 0===o||e.skipNull&&null===o||e.skipEmptyString&&""===o?n:(o=null===o?"":o,0===n.length)?[[f(t,e),r,f(o,e)].join("")]:[[n,f(o,e)].join(e.arrayFormatSeparator)]}default:return r=>(t,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?t:null===n?[...t,f(r,e)]:[...t,[f(r,e),"=",f(n,e)].join("")]}}(r),o={};for(let[r,n]of Object.entries(e))t(r)||(o[r]=n);let a=Object.keys(o);return!1!==r.sort&&a.sort(r.sort),a.map(t=>{let o=e[t];return void 0===o?"":null===o?f(t,r):Array.isArray(o)?0===o.length&&"bracket-separator"===r.arrayFormat?f(t,r)+"[]":o.reduce(n(t),[]).join("&"):f(t,r)+"="+f(o,r)}).filter(e=>e.length>0).join("&")}function b(e,r){r={decode:!0,...r};let[t,n]=s(e,"#");return void 0===t&&(t=e),{url:t?.split("?")?.[0]??"",query:x(g(e),r),...r&&r.parseFragmentIdentifier&&n?{fragmentIdentifier:d(n,r)}:{}}}function j(e,r){r={encode:!0,strict:!0,[c]:!0,...r};let t=y(e.url).split("?")[0]||"",n=h({...x(g(e.url),{sort:!1}),...e.query},r);n&&=`?${n}`;let o=function(e){let r="",t=e.indexOf("#");return -1!==t&&(r=e.slice(t)),r}(e.url);if("string"==typeof e.fragmentIdentifier){let n=new URL(t);n.hash=e.fragmentIdentifier,o=r[c]?n.hash:`#${e.fragmentIdentifier}`}return`${t}${n}${o}`}function q(e,r,t){let{url:n,query:o,fragmentIdentifier:a}=b(e,t={parseFragmentIdentifier:!0,[c]:!1,...t});return j({url:n,query:function(e,r){let t={};if(Array.isArray(r))for(let n of r){let r=Object.getOwnPropertyDescriptor(e,n);r?.enumerable&&Object.defineProperty(t,n,r)}else for(let n of Reflect.ownKeys(e)){let o=Object.getOwnPropertyDescriptor(e,n);if(o.enumerable){let a=e[n];r(n,a,e)&&Object.defineProperty(t,n,o)}}return t}(o,r),fragmentIdentifier:a},t)}function v(e,r,t){return q(e,Array.isArray(r)?e=>!r.includes(e):(e,t)=>!r(e,t),t)}let k=n}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),n=r.X(0,[1633,1744,1381,3788,1490,9092,5802,5059,9712,413,6267,4515,1966,7845],()=>t(17347));module.exports=n})();