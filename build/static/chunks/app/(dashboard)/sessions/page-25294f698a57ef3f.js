(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6898],{63758:function(e,t,n){Promise.resolve().then(n.bind(n,47066)),Promise.resolve().then(n.bind(n,25704))},44099:function(e,t,n){"use strict";n.d(t,{W:function(){return s}});var r=n(57437),i=n(37440);function s(e){let{children:t,header:n,footer:s,classes:l}=e;return(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)("div",{className:(0,i.cn)("flex flex-col fixed h-full w-full top-0 left-0 z-[999999] bg-background",null==l?void 0:l.bg),children:[(0,r.jsx)("div",{className:(0,i.cn)("flex-1 overflow-y-auto",n&&"pt-14",s&&"pb-14"),children:t}),!!n&&(0,r.jsx)("div",{className:(0,i.cn)("fixed top-0 h-14 w-full border-b border-b-border bg-background p-4 flex items-center gap-x-2",null==l?void 0:l.bg),children:n}),!!s&&(0,r.jsx)("div",{className:(0,i.cn)("fixed bottom-0 h-14 w-full border-t border-t-border bg-background p-4 flex items-center gap-x-2",null==l?void 0:l.bg),children:s})]})})}},47066:function(e,t,n){"use strict";n.d(t,{SessionsTable:function(){return v}});var r=n(57437),i=n(2265),s=n(19212),l=n.n(s),a=n(16463),c=n(12491),o=n(87138),u=n(23787),d=n(75944),f=n(99221),h=n(23733),p=n(39661),m=n(50495),x=n(37440),g=n(44099);function v(e){let{sessions:t}=e,n=(0,a.useRouter)(),{parsed:s}=(0,h.l)(),[v,y]=(0,i.useTransition)(),b=e=>(0,r.jsx)(f.t,{currentPage:t.info.page,totalPages:t.info.totalPages,disabled:v,limit:t.info.limit,totalRows:t.info.totalRows,collectionName:"",hideControls:null==e?void 0:e.hideControls,hideSummary:null==e?void 0:e.hideSummary,classes:{pageNumber:""},onPaginate:e=>{y(()=>{n.push("?"+c.Z.stringify({...s,page:e}))})}});return(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)(g.W,{header:(0,r.jsx)(r.Fragment,{}),footer:(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{children:b({hideControls:!0})}),(0,r.jsx)("div",{children:b({hideSummary:!0})})]}),children:[v&&(0,r.jsx)(p.a,{overlay:!0}),(0,r.jsx)(d.DataTable,{selectable:!0,columns:[{name:"UID",cellClassName:(0,x.cn)("w-[300px]",s.uids&&"bg-primary/20"),cellRenderer(e){let{rowIndex:n}=e,i=t.data[n];return i&&i.uid?(0,r.jsx)(r.Fragment,{children:(0,r.jsx)(o.default,{className:"transition-colors hover:text-primary",href:"/sessions?"+c.Z.stringify({uids:i.uid}),onClick:()=>y(()=>{}),children:(0,r.jsx)("span",{children:i.uid})})}):null}},{name:"Script ID",cellClassName:(0,x.cn)("w-[300px]",s.scriptsIds&&"bg-primary/20"),cellRenderer(e){let{rowIndex:n}=e,i=t.data[n];return i&&i.scriptid?(0,r.jsx)(r.Fragment,{children:(0,r.jsx)(o.default,{className:"transition-colors hover:text-primary",href:"/sessions?"+c.Z.stringify({scriptsIds:i.scriptid}),onClick:()=>y(()=>{}),children:(0,r.jsx)("span",{children:i.scriptid})})}):null}},{name:"Ingestion Date"},{name:"",align:"right",cellRenderer(e){let{rowIndex:n}=e,i=t.data[n];return i?(0,r.jsx)("div",{children:(0,r.jsx)(m.z,{asChild:!0,variant:"link",className:"h-auto p-0",children:(0,r.jsxs)(o.default,{href:"/sessions/".concat(i.id),target:"_blank",children:["View",(0,r.jsx)(u.Z,{className:"h-4 w-4 ml-2"})]})})}):null}}],data:t.data.map(e=>[e.uid||"",e.scriptid||"",e.ingested_at?l()(e.ingested_at).format("LLL"):"",""])}),(0,r.jsx)("div",{className:"py-4 border-t border-t-border",children:b({hideControls:!0})})]})})}},39661:function(e,t,n){"use strict";n.d(t,{a:function(){return s}});var r=n(57437),i=n(89627);function s(e){let{overlay:t,transparent:n}=e;return(0,r.jsx)(r.Fragment,{children:(0,r.jsx)("div",{style:{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",...t?{height:"100%",position:"fixed",top:0,left:0,bottom:0,zIndex:999,backgroundColor:n?"transparent":"rgba(255,255,255,.6)"}:{padding:"50px 0"}},children:(0,r.jsx)(i.Z,{style:{height:24,width:24},className:"animate-spin"})})})}},99221:function(e,t,n){"use strict";n.d(t,{t:function(){return j}});var r=n(57437),i=n(2265),s=n(70518),l=n(87592),a=n(63550),c=n(37440),o=n(50495);let u=e=>{let{className:t,...n}=e;return(0,r.jsx)("nav",{role:"navigation","aria-label":"pagination",className:(0,c.cn)("mx-auto flex w-full justify-center",t),...n})};u.displayName="Pagination";let d=i.forwardRef((e,t)=>{let{className:n,...i}=e;return(0,r.jsx)("ul",{ref:t,className:(0,c.cn)("flex flex-row items-center gap-1",n),...i})});d.displayName="PaginationContent";let f=i.forwardRef((e,t)=>{let{className:n,...i}=e;return(0,r.jsx)("li",{ref:t,className:(0,c.cn)("",n),...i})});f.displayName="PaginationItem";let h=e=>{let{className:t,isActive:n,size:i="icon",...s}=e;return(0,r.jsx)("a",{"aria-current":n?"page":void 0,className:(0,c.cn)((0,o.d)({variant:n?"outline":"ghost",size:i}),t),...s})};h.displayName="PaginationLink";let p=e=>{let{className:t,...n}=e;return(0,r.jsxs)(h,{"aria-label":"Go to previous page",size:"default",className:(0,c.cn)("gap-1 pl-2.5",t),...n,children:[(0,r.jsx)(s.Z,{className:"h-4 w-4"}),(0,r.jsx)("span",{children:"Previous"})]})};p.displayName="PaginationPrevious";let m=e=>{let{className:t,...n}=e;return(0,r.jsxs)(h,{"aria-label":"Go to next page",size:"default",className:(0,c.cn)("gap-1 pr-2.5",t),...n,children:[(0,r.jsx)("span",{children:"Next"}),(0,r.jsx)(l.Z,{className:"h-4 w-4"})]})};m.displayName="PaginationNext";let x=e=>{let{className:t,...n}=e;return(0,r.jsxs)("span",{"aria-hidden":!0,className:(0,c.cn)("flex h-9 w-9 items-center justify-center",t),...n,children:[(0,r.jsx)(a.Z,{className:"h-4 w-4"}),(0,r.jsx)("span",{className:"sr-only",children:"More pages"})]})};x.displayName="PaginationEllipsis";var g=n(78448);let v="LEFT",y="RIGHT";function b(e,t){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1,r=e,i=[];for(;r<=t;)i.push(r),r+=n;return i}function j(e){let{currentPage:t,totalPages:n,disabled:i,limit:s=1,totalRows:l,collectionName:a="results",hideControls:o,hideSummary:j,classes:N}=e,k=function(e){let{currentPage:t=1,totalPages:n=0,onPaginate:r}=e,i=[{id:"first",label:"Previous",disabled:t<2,isPrev:!0,isNext:!1,isEllipsis:!1,onClick:()=>r(t-1)}];return(function(e){let{totalPages:t=0,currentPage:n=1}=e;if(t>9){let e=[],r=n-2,i=n+2,s=t-1,l=r>2?r:2,a=i<s?i:s,c=7-(e=b(l,a)).length-1,o=l>2,u=a<s;return o&&!u?e=[v,...b(l-c,l-1),...e]:!o&&u?e=[...e,...b(a+1,a+c),y]:o&&u&&(e=[v,...e,y]),[1,...e,t]}return b(1,t)})(e).forEach(e=>{[v,y].includes(e)?i.push({label:"...",id:"".concat(e),disabled:!1,isPrev:!1,isNext:!1,isEllipsis:!0,onClick:()=>{}}):i.push({id:"".concat(e),label:"".concat(e),disabled:t===e,isPrev:!1,isNext:!1,isEllipsis:!1,onClick:()=>r(Number(e))})}),i.push({id:"last",label:"Next",disabled:n===t,isPrev:!1,isNext:!0,isEllipsis:!1,onClick:()=>r(t+1)}),i}(e);return o&&j?null:(0,r.jsxs)("div",{className:"flex flex-col justify-center items-center gap-y-2",children:[!j&&(0,r.jsxs)("div",{className:"text-xs opacity-50 min-w-10",children:["Showing ",l?(0,g.c)((t-1)*s+1):0,"\xa0-\xa0",(0,g.c)(Math.min(l,t*s)),"\xa0of\xa0",(0,g.c)(l,{separator:" "})," ",a]}),!o&&(0,r.jsx)(u,{children:(0,r.jsx)(d,{children:k.map(e=>(0,r.jsx)(f,{children:(()=>{let s="".concat(t)==="".concat(e.label),l=e.disabled||i,a="opacity-50",o=()=>!l&&e.onClick();return e.isPrev?(l=l||1===t,(0,r.jsx)(p,{href:"#",className:(0,c.cn)(1===t?a:""),onClick:e=>{e.stopPropagation(),e.preventDefault(),o()}})):e.isEllipsis?(0,r.jsx)(x,{className:(0,c.cn)(l?a:"","hidden md:flex",null==N?void 0:N.pageNumber)}):e.isNext?(l=l||t===n,(0,r.jsx)(m,{href:"#",className:(0,c.cn)(l?a:""),onClick:e=>{e.stopPropagation(),e.preventDefault(),o()}})):(0,r.jsx)(h,{href:"#",className:(0,c.cn)(l?a:"","hidden md:flex",null==N?void 0:N.pageNumber),isActive:s,onClick:e=>{e.stopPropagation(),e.preventDefault(),o()},children:e.label})})()},e.id))})})]})}},25704:function(e,t,n){"use strict";n.r(t),n.d(t,{Title:function(){return s}});var r=n(2265),i=n(20357);function s(e){let{children:t}=e;return(0,r.useEffect)(()=>{document.title=[i.env.NEXT_PUBLIC_APP_NAME,t].filter(e=>e).join(" - ")},[t]),(0,r.useEffect)(()=>()=>{document.title="".concat(i.env.NEXT_PUBLIC_APP_NAME)},[]),null}},78448:function(e,t,n){"use strict";function r(e,t){let{decimals:n=0,separator:r=" "}={...t};isNaN(e=Number("".concat(e).replace(/[^a-z0-9.]+/gi,"")))&&(e="0");let i=(e="".concat(Number(e).toFixed(n>=0?n:2))).toString().split(".");return i[0]=i[0].replace(/\B(?=(\d{3})+(?!\d))/g,r),i.join(".")}n.d(t,{c:function(){return r}})},70518:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(78030).Z)("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]])},63550:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(78030).Z)("Ellipsis",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]])},23787:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(78030).Z)("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]])},89627:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(78030).Z)("Loader",[["path",{d:"M12 2v4",key:"3427ic"}],["path",{d:"m16.2 7.8 2.9-2.9",key:"r700ao"}],["path",{d:"M18 12h4",key:"wj9ykh"}],["path",{d:"m16.2 16.2 2.9 2.9",key:"1bxg5t"}],["path",{d:"M12 18v4",key:"jadmvz"}],["path",{d:"m4.9 19.1 2.9-2.9",key:"bwix9q"}],["path",{d:"M2 12h4",key:"j09sii"}],["path",{d:"m4.9 4.9 2.9 2.9",key:"giyufr"}]])},87138:function(e,t,n){"use strict";n.d(t,{default:function(){return i.a}});var r=n(231),i=n.n(r)},20357:function(e,t,n){"use strict";var r,i;e.exports=(null==(r=n.g.process)?void 0:r.env)&&"object"==typeof(null==(i=n.g.process)?void 0:i.env)?n.g.process:n(88081)},88081:function(e){!function(){var t={229:function(e){var t,n,r,i=e.exports={};function s(){throw Error("setTimeout has not been defined")}function l(){throw Error("clearTimeout has not been defined")}function a(e){if(t===setTimeout)return setTimeout(e,0);if((t===s||!t)&&setTimeout)return t=setTimeout,setTimeout(e,0);try{return t(e,0)}catch(n){try{return t.call(null,e,0)}catch(n){return t.call(this,e,0)}}}!function(){try{t="function"==typeof setTimeout?setTimeout:s}catch(e){t=s}try{n="function"==typeof clearTimeout?clearTimeout:l}catch(e){n=l}}();var c=[],o=!1,u=-1;function d(){o&&r&&(o=!1,r.length?c=r.concat(c):u=-1,c.length&&f())}function f(){if(!o){var e=a(d);o=!0;for(var t=c.length;t;){for(r=c,c=[];++u<t;)r&&r[u].run();u=-1,t=c.length}r=null,o=!1,function(e){if(n===clearTimeout)return clearTimeout(e);if((n===l||!n)&&clearTimeout)return n=clearTimeout,clearTimeout(e);try{n(e)}catch(t){try{return n.call(null,e)}catch(t){return n.call(this,e)}}}(e)}}function h(e,t){this.fun=e,this.array=t}function p(){}i.nextTick=function(e){var t=Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];c.push(new h(e,t)),1!==c.length||o||a(f)},h.prototype.run=function(){this.fun.apply(null,this.array)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=p,i.addListener=p,i.once=p,i.off=p,i.removeListener=p,i.removeAllListeners=p,i.emit=p,i.prependListener=p,i.prependOnceListener=p,i.listeners=function(e){return[]},i.binding=function(e){throw Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(e){throw Error("process.chdir is not supported")},i.umask=function(){return 0}}},n={};function r(e){var i=n[e];if(void 0!==i)return i.exports;var s=n[e]={exports:{}},l=!0;try{t[e](s,s.exports,r),l=!1}finally{l&&delete n[e]}return s.exports}r.ab="//";var i=r(229);e.exports=i}()}},function(e){e.O(0,[6990,4868,5360,8429,2592,9343,7946,1072,231,5944,7478,7023,1744],function(){return e(e.s=63758)}),_N_E=e.O()}]);