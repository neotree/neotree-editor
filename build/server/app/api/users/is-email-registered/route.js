"use strict";(()=>{var e={};e.id=6184,e.ids=[6184],e.modules={67096:e=>{e.exports=require("bcrypt")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},39491:e=>{e.exports=require("assert")},14300:e=>{e.exports=require("buffer")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},6005:e=>{e.exports=require("node:crypto")},87561:e=>{e.exports=require("node:fs")},49411:e=>{e.exports=require("node:path")},22037:e=>{e.exports=require("os")},4074:e=>{e.exports=require("perf_hooks")},63477:e=>{e.exports=require("querystring")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},14403:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>m,patchFetch:()=>g,requestAsyncStorage:()=>f,routeModule:()=>d,serverHooks:()=>y,staticGenerationAsyncStorage:()=>p});var a={};t.r(a),t.d(a,{GET:()=>c});var s=t(49303),n=t(88716),o=t(60670),i=t(87070),u=t(49530),l=t(73508);async function c(e){let{email:r}=u.Z.parse(e.nextUrl.searchParams.toString());if(!r)return i.NextResponse.json({errors:["Missing: email"]});let t=await (0,l.isEmailRegistered)(r);return i.NextResponse.json(t)}let d=new s.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/users/is-email-registered/route",pathname:"/api/users/is-email-registered",filename:"route",bundlePath:"app/api/users/is-email-registered/route"},resolvedPagePath:"/home/farai/Workbench/Neotree/neotree-editor-master/app/api/users/is-email-registered/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:f,staticGenerationAsyncStorage:p,serverHooks:y}=d,m="/api/users/is-email-registered/route";function g(){return(0,o.patchFetch)({serverHooks:y,staticGenerationAsyncStorage:p})}},73508:(e,r,t)=>{t.r(r),t.d(r,{$$ACTION_0:()=>A,$$ACTION_1:()=>O,$$ACTION_2:()=>F,$$ACTION_3:()=>N,$$ACTION_4:()=>S,createUsers:()=>E,deleteUsers:()=>k,getFullUser:()=>R,getUser:()=>v,getUsers:()=>q,isEmailRegistered:()=>j,resetUsersPasswords:()=>x,searchUsers:()=>I,setPassword:()=>$,updateUsers:()=>U});var a=t(24330);t(60166);var s=t(67096),n=t.n(s),o=t(57745),i=t(9576),u=t(30900),l=t(10413),c=t(96336),d=t(47625);async function f(e){for(let r of e)await l.Z.update(c.users).set({password:""}).where((0,o.eq)(c.users.userId,r));return!0}async function p(e){for(let r of e){let e=new Date;await l.Z.update(c.users).set({deletedAt:e,email:r,displayName:"Former user",firstName:null,lastName:null,avatar:null,avatar_md:null,avatar_sm:null}).where((0,o.eq)(c.users.userId,r))}return!0}async function y(e,r){let t=[];for(let r of e){let e=await n().genSalt(10),a=await n().hash(r.password||(0,i.Z)(),e);t.push({...r,password:a,userId:r.userId||(0,i.Z)()})}let a={inserted:[],success:!1};try{if(await l.Z.insert(c.users).values(t),r?.returnInserted){let e=await (0,d.yT)({userIds:t.map(e=>e.userId)});a.inserted=e.data}a.success=!0}catch(e){a.error=e.message}finally{return a}}async function m(e,r){let t=[];for(let{userId:a,data:s}of e)try{let e=(0,u.Z)(a)?(0,o.eq)(c.users.userId,a):(0,o.eq)(c.users.email,a);delete s.id,delete s.createdAt,delete s.updatedAt,delete s.email,delete s.userId,await l.Z.update(c.users).set(s).where(e);let n=r?.returnUpdated?await (0,d.IQ)(a):void 0;t.push({userId:a,user:n})}catch(e){t.push({userId:a,error:e.message})}return t}var g=t(57435),h=t(70733),b=t(66267),w=t(40618);let x=f;async function j(e){try{let r=await (0,d.IQ)(e);return{yes:!!r,isActive:!!r?.isActive}}catch(e){return g.Z.error("getUser ERROR:",e),{errors:[e.message],yes:!1}}}async function v(e){try{return await (0,b.isAllowed)("get_user"),await (0,d.IQ)(e)||null}catch(e){return g.Z.error("getUser ERROR:",e),null}}async function R(e){try{return await (0,b.isAllowed)("get_user"),await (0,d.C)(e)||null}catch(e){return g.Z.error("getFullUser ERROR:",e),null}}let q=(0,a.j)("7ed58da9bdd1fcaabea1b4a8c01155185ea42d50",A);async function A(...e){try{return await (0,b.isAllowed)("get_users"),await (0,d.yT)(...e)}catch(e){return{...d.Ko,error:e.message}}}let I=(0,a.j)("30776f4c4a368e78980f8117cefaf77df1f67743",O);async function O(...e){try{return await (0,b.isAllowed)("search_users"),await (0,d.yT)(...e)}catch(e){return{...d.Ko,error:e.message}}}async function k(e){if(await (0,b.isAllowed)("delete_users"),e.length){let{data:r}=await (0,d.yT)({userIds:e});await p(e)}return!0}let E=(0,a.j)("46092427241ea6fbfbd33cf01bdd70a14cf92f90",F);async function F(...e){try{await (0,b.isAllowed)("create_users");let r=await y(...e);for(let r of e[0])try{await (0,h.n)({userId:r.userId,hoursValid:1})}catch(e){}return r}catch(e){throw g.Z.error("createUsers ERROR",e),e}}let U=(0,a.j)("e643f22d4242e305446816ef0c71ada1ec53143f",N);async function N(...e){try{return await (0,b.isAllowed)("update_users"),await m(...e)}catch(e){throw g.Z.error("updateUsers ERROR",e),e}}let $=(0,a.j)("2c56cdafc83bcdd180a689448b216edb18936af9",S);async function S(e){try{if(!e.password)throw Error("Missing: password");if(!e.email)throw Error("Missing: email");if(e.password.length<6)throw Error("Password is too short: min 6 characters");if(e.password!==e.passwordConfirm)throw Error("Password confirmation does not match!");let r=await n().genSalt(10),t=await n().hash(e.password,r),a=await m([{userId:e.email,data:{password:t}}]);if(a.filter(e=>e.error).length)throw Error(a.filter(e=>e.error).map(e=>e.error).join(", "));return{success:!0}}catch(e){return g.Z.error("setPassword ERROR",e),{success:!1,errors:[e.message]}}}(0,w.h)([x,j,v,R,q,I,k,E,U,$]),(0,a.j)("3c8eb70807e489f76cd8c5cf36811aa1d695ca88",x),(0,a.j)("8002a85e229f7939cdcf277a95e859c8310681f6",j),(0,a.j)("15e9024c7a317568a0bfe153647ab40d4a782996",v),(0,a.j)("67f588a162fcecb1a75791f69b6cff347ad9923a",R),(0,a.j)("38db96d8998f5107454ecf82118abd7af347d295",q),(0,a.j)("1977ec2d9d02f9d05c365f2b0c361b6bda56d4b9",I),(0,a.j)("cdb03413b17de7f459a06c1da6dcecd39449a521",k),(0,a.j)("1a887bafa5bdbb80006e55a4af6cb4a8b6c64b5d",E),(0,a.j)("86bb37e35f63659c1e7cf3ba878f97f6925e4521",U),(0,a.j)("1d50295030f25981c6202bf941a3b2576a09a317",$)},70733:(e,r,t)=>{t.d(r,{n:()=>i});var a=t(51744),s=t.n(a),n=t(10413),o=t(96336);async function i({userId:e,hoursValid:r}){return(await n.Z.insert(o.tokens).values({userId:e,validUntil:s()(new Date).add(r,"hour").toDate(),token:Math.floor(1e5+9e5*Math.random())}).returning())[0]}},49530:(e,r,t)=>{t.d(r,{Z:()=>R});var a={};t.r(a),t.d(a,{exclude:()=>v,extract:()=>g,parse:()=>h,parseUrl:()=>w,pick:()=>j,stringify:()=>b,stringifyUrl:()=>x});let s="%[a-f0-9]{2}",n=RegExp("("+s+")|([^%]+?)","gi"),o=RegExp("("+s+")+","gi");function i(e,r){if(!("string"==typeof e&&"string"==typeof r))throw TypeError("Expected the arguments to be of type `string`");if(""===e||""===r)return[];let t=e.indexOf(r);return -1===t?[]:[e.slice(0,t),e.slice(t+r.length)]}let u=e=>null==e,l=e=>encodeURIComponent(e).replaceAll(/[!'()*]/g,e=>`%${e.charCodeAt(0).toString(16).toUpperCase()}`),c=Symbol("encodeFragmentIdentifier");function d(e){if("string"!=typeof e||1!==e.length)throw TypeError("arrayFormatSeparator must be single character string")}function f(e,r){return r.encode?r.strict?l(e):encodeURIComponent(e):e}function p(e,r){return r.decode?function(e){if("string"!=typeof e)throw TypeError("Expected `encodedURI` to be of type `string`, got `"+typeof e+"`");try{return decodeURIComponent(e)}catch{return function(e){let r={"%FE%FF":"��","%FF%FE":"��"},t=o.exec(e);for(;t;){try{r[t[0]]=decodeURIComponent(t[0])}catch{let e=function(e){try{return decodeURIComponent(e)}catch{let r=e.match(n)||[];for(let t=1;t<r.length;t++)r=(e=(function e(r,t){try{return[decodeURIComponent(r.join(""))]}catch{}if(1===r.length)return r;t=t||1;let a=r.slice(0,t),s=r.slice(t);return Array.prototype.concat.call([],e(a),e(s))})(r,t).join("")).match(n)||[];return e}}(t[0]);e!==t[0]&&(r[t[0]]=e)}t=o.exec(e)}for(let t of(r["%C2"]="�",Object.keys(r)))e=e.replace(RegExp(t,"g"),r[t]);return e}(e)}}(e):e}function y(e){let r=e.indexOf("#");return -1!==r&&(e=e.slice(0,r)),e}function m(e,r){return r.parseNumbers&&!Number.isNaN(Number(e))&&"string"==typeof e&&""!==e.trim()?e=Number(e):r.parseBooleans&&null!==e&&("true"===e.toLowerCase()||"false"===e.toLowerCase())&&(e="true"===e.toLowerCase()),e}function g(e){let r=(e=y(e)).indexOf("?");return -1===r?"":e.slice(r+1)}function h(e,r){d((r={decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1,...r}).arrayFormatSeparator);let t=function(e){let r;switch(e.arrayFormat){case"index":return(e,t,a)=>{if(r=/\[(\d*)]$/.exec(e),e=e.replace(/\[\d*]$/,""),!r){a[e]=t;return}void 0===a[e]&&(a[e]={}),a[e][r[1]]=t};case"bracket":return(e,t,a)=>{if(r=/(\[])$/.exec(e),e=e.replace(/\[]$/,""),!r){a[e]=t;return}if(void 0===a[e]){a[e]=[t];return}a[e]=[...a[e],t]};case"colon-list-separator":return(e,t,a)=>{if(r=/(:list)$/.exec(e),e=e.replace(/:list$/,""),!r){a[e]=t;return}if(void 0===a[e]){a[e]=[t];return}a[e]=[...a[e],t]};case"comma":case"separator":return(r,t,a)=>{let s="string"==typeof t&&t.includes(e.arrayFormatSeparator),n="string"==typeof t&&!s&&p(t,e).includes(e.arrayFormatSeparator);t=n?p(t,e):t;let o=s||n?t.split(e.arrayFormatSeparator).map(r=>p(r,e)):null===t?t:p(t,e);a[r]=o};case"bracket-separator":return(r,t,a)=>{let s=/(\[])$/.test(r);if(r=r.replace(/\[]$/,""),!s){a[r]=t?p(t,e):t;return}let n=null===t?[]:t.split(e.arrayFormatSeparator).map(r=>p(r,e));if(void 0===a[r]){a[r]=n;return}a[r]=[...a[r],...n]};default:return(e,r,t)=>{if(void 0===t[e]){t[e]=r;return}t[e]=[...[t[e]].flat(),r]}}}(r),a=Object.create(null);if("string"!=typeof e||!(e=e.trim().replace(/^[?#&]/,"")))return a;for(let s of e.split("&")){if(""===s)continue;let e=r.decode?s.replaceAll("+"," "):s,[n,o]=i(e,"=");void 0===n&&(n=e),o=void 0===o?null:["comma","separator","bracket-separator"].includes(r.arrayFormat)?o:p(o,r),t(p(n,r),o,a)}for(let[e,t]of Object.entries(a))if("object"==typeof t&&null!==t)for(let[e,a]of Object.entries(t))t[e]=m(a,r);else a[e]=m(t,r);return!1===r.sort?a:(!0===r.sort?Object.keys(a).sort():Object.keys(a).sort(r.sort)).reduce((e,r)=>{let t=a[r];return e[r]=t&&"object"==typeof t&&!Array.isArray(t)?function e(r){return Array.isArray(r)?r.sort():"object"==typeof r?e(Object.keys(r)).sort((e,r)=>Number(e)-Number(r)).map(e=>r[e]):r}(t):t,e},Object.create(null))}function b(e,r){if(!e)return"";d((r={encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:",",...r}).arrayFormatSeparator);let t=t=>r.skipNull&&u(e[t])||r.skipEmptyString&&""===e[t],a=function(e){switch(e.arrayFormat){case"index":return r=>(t,a)=>{let s=t.length;return void 0===a||e.skipNull&&null===a||e.skipEmptyString&&""===a?t:null===a?[...t,[f(r,e),"[",s,"]"].join("")]:[...t,[f(r,e),"[",f(s,e),"]=",f(a,e)].join("")]};case"bracket":return r=>(t,a)=>void 0===a||e.skipNull&&null===a||e.skipEmptyString&&""===a?t:null===a?[...t,[f(r,e),"[]"].join("")]:[...t,[f(r,e),"[]=",f(a,e)].join("")];case"colon-list-separator":return r=>(t,a)=>void 0===a||e.skipNull&&null===a||e.skipEmptyString&&""===a?t:null===a?[...t,[f(r,e),":list="].join("")]:[...t,[f(r,e),":list=",f(a,e)].join("")];case"comma":case"separator":case"bracket-separator":{let r="bracket-separator"===e.arrayFormat?"[]=":"=";return t=>(a,s)=>void 0===s||e.skipNull&&null===s||e.skipEmptyString&&""===s?a:(s=null===s?"":s,0===a.length)?[[f(t,e),r,f(s,e)].join("")]:[[a,f(s,e)].join(e.arrayFormatSeparator)]}default:return r=>(t,a)=>void 0===a||e.skipNull&&null===a||e.skipEmptyString&&""===a?t:null===a?[...t,f(r,e)]:[...t,[f(r,e),"=",f(a,e)].join("")]}}(r),s={};for(let[r,a]of Object.entries(e))t(r)||(s[r]=a);let n=Object.keys(s);return!1!==r.sort&&n.sort(r.sort),n.map(t=>{let s=e[t];return void 0===s?"":null===s?f(t,r):Array.isArray(s)?0===s.length&&"bracket-separator"===r.arrayFormat?f(t,r)+"[]":s.reduce(a(t),[]).join("&"):f(t,r)+"="+f(s,r)}).filter(e=>e.length>0).join("&")}function w(e,r){r={decode:!0,...r};let[t,a]=i(e,"#");return void 0===t&&(t=e),{url:t?.split("?")?.[0]??"",query:h(g(e),r),...r&&r.parseFragmentIdentifier&&a?{fragmentIdentifier:p(a,r)}:{}}}function x(e,r){r={encode:!0,strict:!0,[c]:!0,...r};let t=y(e.url).split("?")[0]||"",a=b({...h(g(e.url),{sort:!1}),...e.query},r);a&&=`?${a}`;let s=function(e){let r="",t=e.indexOf("#");return -1!==t&&(r=e.slice(t)),r}(e.url);if("string"==typeof e.fragmentIdentifier){let a=new URL(t);a.hash=e.fragmentIdentifier,s=r[c]?a.hash:`#${e.fragmentIdentifier}`}return`${t}${a}${s}`}function j(e,r,t){let{url:a,query:s,fragmentIdentifier:n}=w(e,t={parseFragmentIdentifier:!0,[c]:!1,...t});return x({url:a,query:function(e,r){let t={};if(Array.isArray(r))for(let a of r){let r=Object.getOwnPropertyDescriptor(e,a);r?.enumerable&&Object.defineProperty(t,a,r)}else for(let a of Reflect.ownKeys(e)){let s=Object.getOwnPropertyDescriptor(e,a);if(s.enumerable){let n=e[a];r(a,n,e)&&Object.defineProperty(t,a,s)}}return t}(s,r),fragmentIdentifier:n},t)}function v(e,r,t){return j(e,Array.isArray(r)?e=>!r.includes(e):(e,t)=>!r(e,t),t)}let R=a}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[1633,1744,9937,3788,1490,5059,413,6267],()=>t(14403));module.exports=a})();