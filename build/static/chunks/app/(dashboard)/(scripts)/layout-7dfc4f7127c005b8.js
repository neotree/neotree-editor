(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[495],{21038:function(e,r,t){Promise.resolve().then(t.bind(t,25704)),Promise.resolve().then(t.bind(t,15701))},25704:function(e,r,t){"use strict";t.r(r),t.d(r,{Title:function(){return i}});var n=t(2265),o=t(20357);function i(e){let{children:r}=e;return(0,n.useEffect)(()=>{document.title=[o.env.NEXT_PUBLIC_APP_NAME,r].filter(e=>e).join(" - ")},[r]),(0,n.useEffect)(()=>()=>{document.title="".concat(o.env.NEXT_PUBLIC_APP_NAME)},[]),null}},15701:function(e,r,t){"use strict";t.d(r,{ScriptsContextProvider:function(){return l},h:function(){return s}});var n=t(57437),o=t(2265),i=t(16463),u=t(12491),a=t(23733);let c=(0,o.createContext)(null),s=()=>(0,o.useContext)(c);function l(e){let{children:r,...t}=e,s=function(e){let{}=e,r=(0,i.useRouter)(),{scriptId:t}=(0,i.useParams)(),{parsed:n}=(0,a.l)(),c=(0,o.useCallback)(()=>{r.push("/")},[r]),s=(0,o.useCallback)(()=>{r.push("/script/".concat(t,"?").concat(u.Z.stringify({...n,section:"screens"})))},[r,n,t]);return{onCancelDiagnosisForm:(0,o.useCallback)(()=>{r.push("/script/".concat(t,"?").concat(u.Z.stringify({...n,section:"diagnoses"})))},[r,n,t]),onCancelScreenForm:s,onCancelScriptForm:c}}(t);return(0,n.jsx)(c.Provider,{value:{...t,...s},children:r})}},23733:function(e,r,t){"use strict";t.d(r,{l:function(){return u}});var n=t(16463),o=t(12491),i=t(2265);function u(){let e=(0,n.useRouter)(),r=(0,n.useSearchParams)(),t=(0,i.useMemo)(()=>r.toString(),[r]),u=(0,i.useMemo)(()=>o.Z.parse(r.toString()),[r]),a=(0,i.useCallback)(e=>o.Z.stringify({...u,...e}),[u]),c=(0,i.useCallback)(r=>{e.push("?".concat(a(r)))},[a,e]);return{parsed:u,stringified:t,replace:(0,i.useCallback)(r=>{e.replace("?".concat(a(r)))},[a,e]),push:c,toSearchParams:a}}},16463:function(e,r,t){"use strict";var n=t(71169);t.o(n,"useParams")&&t.d(r,{useParams:function(){return n.useParams}}),t.o(n,"usePathname")&&t.d(r,{usePathname:function(){return n.usePathname}}),t.o(n,"useRouter")&&t.d(r,{useRouter:function(){return n.useRouter}}),t.o(n,"useSearchParams")&&t.d(r,{useSearchParams:function(){return n.useSearchParams}})},20357:function(e,r,t){"use strict";var n,o;e.exports=(null==(n=t.g.process)?void 0:n.env)&&"object"==typeof(null==(o=t.g.process)?void 0:o.env)?t.g.process:t(88081)},88081:function(e){!function(){var r={229:function(e){var r,t,n,o=e.exports={};function i(){throw Error("setTimeout has not been defined")}function u(){throw Error("clearTimeout has not been defined")}function a(e){if(r===setTimeout)return setTimeout(e,0);if((r===i||!r)&&setTimeout)return r=setTimeout,setTimeout(e,0);try{return r(e,0)}catch(t){try{return r.call(null,e,0)}catch(t){return r.call(this,e,0)}}}!function(){try{r="function"==typeof setTimeout?setTimeout:i}catch(e){r=i}try{t="function"==typeof clearTimeout?clearTimeout:u}catch(e){t=u}}();var c=[],s=!1,l=-1;function f(){s&&n&&(s=!1,n.length?c=n.concat(c):l=-1,c.length&&p())}function p(){if(!s){var e=a(f);s=!0;for(var r=c.length;r;){for(n=c,c=[];++l<r;)n&&n[l].run();l=-1,r=c.length}n=null,s=!1,function(e){if(t===clearTimeout)return clearTimeout(e);if((t===u||!t)&&clearTimeout)return t=clearTimeout,clearTimeout(e);try{t(e)}catch(r){try{return t.call(null,e)}catch(r){return t.call(this,e)}}}(e)}}function d(e,r){this.fun=e,this.array=r}function m(){}o.nextTick=function(e){var r=Array(arguments.length-1);if(arguments.length>1)for(var t=1;t<arguments.length;t++)r[t-1]=arguments[t];c.push(new d(e,r)),1!==c.length||s||a(p)},d.prototype.run=function(){this.fun.apply(null,this.array)},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=m,o.addListener=m,o.once=m,o.off=m,o.removeListener=m,o.removeAllListeners=m,o.emit=m,o.prependListener=m,o.prependOnceListener=m,o.listeners=function(e){return[]},o.binding=function(e){throw Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(e){throw Error("process.chdir is not supported")},o.umask=function(){return 0}}},t={};function n(e){var o=t[e];if(void 0!==o)return o.exports;var i=t[e]={exports:{}},u=!0;try{r[e](i,i.exports,n),u=!1}finally{u&&delete t[e]}return i.exports}n.ab="//";var o=n(229);e.exports=o}()},12491:function(e,r,t){"use strict";t.d(r,{Z:function(){return E}});var n={};t.r(n),t.d(n,{exclude:function(){return x},extract:function(){return h},parse:function(){return g},parseUrl:function(){return v},pick:function(){return j},stringify:function(){return b},stringifyUrl:function(){return k}});let o="%[a-f0-9]{2}",i=RegExp("("+o+")|([^%]+?)","gi"),u=RegExp("("+o+")+","gi");function a(e,r){if(!("string"==typeof e&&"string"==typeof r))throw TypeError("Expected the arguments to be of type `string`");if(""===e||""===r)return[];let t=e.indexOf(r);return -1===t?[]:[e.slice(0,t),e.slice(t+r.length)]}let c=e=>null==e,s=e=>encodeURIComponent(e).replaceAll(/[!'()*]/g,e=>`%${e.charCodeAt(0).toString(16).toUpperCase()}`),l=Symbol("encodeFragmentIdentifier");function f(e){if("string"!=typeof e||1!==e.length)throw TypeError("arrayFormatSeparator must be single character string")}function p(e,r){return r.encode?r.strict?s(e):encodeURIComponent(e):e}function d(e,r){return r.decode?function(e){if("string"!=typeof e)throw TypeError("Expected `encodedURI` to be of type `string`, got `"+typeof e+"`");try{return decodeURIComponent(e)}catch{return function(e){let r={"%FE%FF":"��","%FF%FE":"��"},t=u.exec(e);for(;t;){try{r[t[0]]=decodeURIComponent(t[0])}catch{let e=function(e){try{return decodeURIComponent(e)}catch{let r=e.match(i)||[];for(let t=1;t<r.length;t++)r=(e=(function e(r,t){try{return[decodeURIComponent(r.join(""))]}catch{}if(1===r.length)return r;t=t||1;let n=r.slice(0,t),o=r.slice(t);return Array.prototype.concat.call([],e(n),e(o))})(r,t).join("")).match(i)||[];return e}}(t[0]);e!==t[0]&&(r[t[0]]=e)}t=u.exec(e)}for(let t of(r["%C2"]="�",Object.keys(r)))e=e.replace(RegExp(t,"g"),r[t]);return e}(e)}}(e):e}function m(e){let r=e.indexOf("#");return -1!==r&&(e=e.slice(0,r)),e}function y(e,r){return r.parseNumbers&&!Number.isNaN(Number(e))&&"string"==typeof e&&""!==e.trim()?e=Number(e):r.parseBooleans&&null!==e&&("true"===e.toLowerCase()||"false"===e.toLowerCase())&&(e="true"===e.toLowerCase()),e}function h(e){let r=(e=m(e)).indexOf("?");return -1===r?"":e.slice(r+1)}function g(e,r){f((r={decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1,...r}).arrayFormatSeparator);let t=function(e){let r;switch(e.arrayFormat){case"index":return(e,t,n)=>{if(r=/\[(\d*)]$/.exec(e),e=e.replace(/\[\d*]$/,""),!r){n[e]=t;return}void 0===n[e]&&(n[e]={}),n[e][r[1]]=t};case"bracket":return(e,t,n)=>{if(r=/(\[])$/.exec(e),e=e.replace(/\[]$/,""),!r){n[e]=t;return}if(void 0===n[e]){n[e]=[t];return}n[e]=[...n[e],t]};case"colon-list-separator":return(e,t,n)=>{if(r=/(:list)$/.exec(e),e=e.replace(/:list$/,""),!r){n[e]=t;return}if(void 0===n[e]){n[e]=[t];return}n[e]=[...n[e],t]};case"comma":case"separator":return(r,t,n)=>{let o="string"==typeof t&&t.includes(e.arrayFormatSeparator),i="string"==typeof t&&!o&&d(t,e).includes(e.arrayFormatSeparator);t=i?d(t,e):t;let u=o||i?t.split(e.arrayFormatSeparator).map(r=>d(r,e)):null===t?t:d(t,e);n[r]=u};case"bracket-separator":return(r,t,n)=>{let o=/(\[])$/.test(r);if(r=r.replace(/\[]$/,""),!o){n[r]=t?d(t,e):t;return}let i=null===t?[]:t.split(e.arrayFormatSeparator).map(r=>d(r,e));if(void 0===n[r]){n[r]=i;return}n[r]=[...n[r],...i]};default:return(e,r,t)=>{if(void 0===t[e]){t[e]=r;return}t[e]=[...[t[e]].flat(),r]}}}(r),n=Object.create(null);if("string"!=typeof e||!(e=e.trim().replace(/^[?#&]/,"")))return n;for(let o of e.split("&")){if(""===o)continue;let e=r.decode?o.replaceAll("+"," "):o,[i,u]=a(e,"=");void 0===i&&(i=e),u=void 0===u?null:["comma","separator","bracket-separator"].includes(r.arrayFormat)?u:d(u,r),t(d(i,r),u,n)}for(let[e,t]of Object.entries(n))if("object"==typeof t&&null!==t)for(let[e,n]of Object.entries(t))t[e]=y(n,r);else n[e]=y(t,r);return!1===r.sort?n:(!0===r.sort?Object.keys(n).sort():Object.keys(n).sort(r.sort)).reduce((e,r)=>{let t=n[r];return e[r]=t&&"object"==typeof t&&!Array.isArray(t)?function e(r){return Array.isArray(r)?r.sort():"object"==typeof r?e(Object.keys(r)).sort((e,r)=>Number(e)-Number(r)).map(e=>r[e]):r}(t):t,e},Object.create(null))}function b(e,r){if(!e)return"";f((r={encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:",",...r}).arrayFormatSeparator);let t=t=>r.skipNull&&c(e[t])||r.skipEmptyString&&""===e[t],n=function(e){switch(e.arrayFormat){case"index":return r=>(t,n)=>{let o=t.length;return void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?t:null===n?[...t,[p(r,e),"[",o,"]"].join("")]:[...t,[p(r,e),"[",p(o,e),"]=",p(n,e)].join("")]};case"bracket":return r=>(t,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?t:null===n?[...t,[p(r,e),"[]"].join("")]:[...t,[p(r,e),"[]=",p(n,e)].join("")];case"colon-list-separator":return r=>(t,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?t:null===n?[...t,[p(r,e),":list="].join("")]:[...t,[p(r,e),":list=",p(n,e)].join("")];case"comma":case"separator":case"bracket-separator":{let r="bracket-separator"===e.arrayFormat?"[]=":"=";return t=>(n,o)=>void 0===o||e.skipNull&&null===o||e.skipEmptyString&&""===o?n:(o=null===o?"":o,0===n.length)?[[p(t,e),r,p(o,e)].join("")]:[[n,p(o,e)].join(e.arrayFormatSeparator)]}default:return r=>(t,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?t:null===n?[...t,p(r,e)]:[...t,[p(r,e),"=",p(n,e)].join("")]}}(r),o={};for(let[r,n]of Object.entries(e))t(r)||(o[r]=n);let i=Object.keys(o);return!1!==r.sort&&i.sort(r.sort),i.map(t=>{let o=e[t];return void 0===o?"":null===o?p(t,r):Array.isArray(o)?0===o.length&&"bracket-separator"===r.arrayFormat?p(t,r)+"[]":o.reduce(n(t),[]).join("&"):p(t,r)+"="+p(o,r)}).filter(e=>e.length>0).join("&")}function v(e,r){r={decode:!0,...r};let[t,n]=a(e,"#");return void 0===t&&(t=e),{url:t?.split("?")?.[0]??"",query:g(h(e),r),...r&&r.parseFragmentIdentifier&&n?{fragmentIdentifier:d(n,r)}:{}}}function k(e,r){r={encode:!0,strict:!0,[l]:!0,...r};let t=m(e.url).split("?")[0]||"",n=b({...g(h(e.url),{sort:!1}),...e.query},r);n&&=`?${n}`;let o=function(e){let r="",t=e.indexOf("#");return -1!==t&&(r=e.slice(t)),r}(e.url);if("string"==typeof e.fragmentIdentifier){let n=new URL(t);n.hash=e.fragmentIdentifier,o=r[l]?n.hash:`#${e.fragmentIdentifier}`}return`${t}${n}${o}`}function j(e,r,t){let{url:n,query:o,fragmentIdentifier:i}=v(e,t={parseFragmentIdentifier:!0,[l]:!1,...t});return k({url:n,query:function(e,r){let t={};if(Array.isArray(r))for(let n of r){let r=Object.getOwnPropertyDescriptor(e,n);r?.enumerable&&Object.defineProperty(t,n,r)}else for(let n of Reflect.ownKeys(e)){let o=Object.getOwnPropertyDescriptor(e,n);if(o.enumerable){let i=e[n];r(n,i,e)&&Object.defineProperty(t,n,o)}}return t}(o,r),fragmentIdentifier:i},t)}function x(e,r,t){return j(e,Array.isArray(r)?e=>!r.includes(e):(e,t)=>!r(e,t),t)}var E=n}},function(e){e.O(0,[7478,7023,1744],function(){return e(e.s=21038)}),_N_E=e.O()}]);