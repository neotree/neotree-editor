(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6898],{63758:function(e,t,n){Promise.resolve().then(n.bind(n,47066)),Promise.resolve().then(n.bind(n,25704))},44099:function(e,t,n){"use strict";n.d(t,{W:function(){return r}});var i=n(57437),s=n(37440);function r(e){let{children:t,header:n,footer:r,classes:a}=e;return(0,i.jsx)(i.Fragment,{children:(0,i.jsxs)("div",{className:(0,s.cn)("flex flex-col fixed h-full w-full top-0 left-0 z-[999999] bg-background",null==a?void 0:a.bg),children:[(0,i.jsx)("div",{className:(0,s.cn)("flex-1 overflow-y-auto",n&&"pt-14",r&&"pb-14"),children:t}),!!n&&(0,i.jsx)("div",{className:(0,s.cn)("fixed top-0 h-14 w-full border-b border-b-border bg-background p-4 flex items-center gap-x-2",null==a?void 0:a.bg),children:n}),!!r&&(0,i.jsx)("div",{className:(0,s.cn)("fixed bottom-0 h-14 w-full border-t border-t-border bg-background p-4 flex items-center gap-x-2",null==a?void 0:a.bg),children:r})]})})}},47066:function(e,t,n){"use strict";n.d(t,{SessionsTable:function(){return j}});var i=n(57437),s=n(2265),r=n(19212),a=n.n(r),l=n(16463),c=n(12491),o=n(87138),d=n(23787),u=n(75944),f=n(99221),p=n(23733),h=n(39661),m=n(50495),x=n(37440),g=n(44099);function j(e){let{sessions:t}=e,n=(0,l.useRouter)(),{parsed:r}=(0,p.l)(),[j,b]=(0,s.useTransition)(),N=e=>(0,i.jsx)(f.t,{currentPage:t.info.page,totalPages:t.info.totalPages,disabled:j,limit:t.info.limit,totalRows:t.info.totalRows,collectionName:"",hideControls:null==e?void 0:e.hideControls,hideSummary:null==e?void 0:e.hideSummary,classes:{pageNumber:""},onPaginate:e=>{b(()=>{n.push("?"+c.Z.stringify({...r,page:e}))})}});return(0,i.jsx)(i.Fragment,{children:(0,i.jsxs)(g.W,{header:(0,i.jsx)(i.Fragment,{}),footer:(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("div",{children:N({hideControls:!0})}),(0,i.jsx)("div",{children:N({hideSummary:!0})})]}),children:[j&&(0,i.jsx)(h.a,{overlay:!0}),(0,i.jsx)(u.DataTable,{selectable:!0,columns:[{name:"UID",cellClassName:(0,x.cn)("w-[300px]",r.uids&&"bg-primary/20"),cellRenderer(e){let{rowIndex:n}=e,s=t.data[n];return s&&s.uid?(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(o.default,{className:"transition-colors hover:text-primary",href:"/sessions?"+c.Z.stringify({uids:s.uid}),onClick:()=>b(()=>{}),children:(0,i.jsx)("span",{children:s.uid})})}):null}},{name:"Script ID",cellClassName:(0,x.cn)("w-[300px]",r.scriptsIds&&"bg-primary/20"),cellRenderer(e){let{rowIndex:n}=e,s=t.data[n];return s&&s.scriptid?(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(o.default,{className:"transition-colors hover:text-primary",href:"/sessions?"+c.Z.stringify({scriptsIds:s.scriptid}),onClick:()=>b(()=>{}),children:(0,i.jsx)("span",{children:s.scriptid})})}):null}},{name:"Ingestion Date"},{name:"",align:"right",cellRenderer(e){let{rowIndex:n}=e,s=t.data[n];return s?(0,i.jsx)("div",{children:(0,i.jsx)(m.z,{asChild:!0,variant:"link",className:"h-auto p-0",children:(0,i.jsxs)(o.default,{href:"/sessions/".concat(s.id),target:"_blank",children:["View",(0,i.jsx)(d.Z,{className:"h-4 w-4 ml-2"})]})})}):null}}],data:t.data.map(e=>[e.uid||"",e.scriptid||"",e.ingested_at?a()(e.ingested_at).format("LLL"):"",""])}),(0,i.jsx)("div",{className:"py-4 border-t border-t-border",children:N({hideControls:!0})})]})})}},39661:function(e,t,n){"use strict";n.d(t,{a:function(){return r}});var i=n(57437),s=n(89627);function r(e){let{overlay:t,transparent:n}=e;return(0,i.jsx)(i.Fragment,{children:(0,i.jsx)("div",{style:{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",...t?{height:"100%",position:"fixed",top:0,left:0,bottom:0,zIndex:999,backgroundColor:n?"transparent":"rgba(255,255,255,.6)"}:{padding:"50px 0"}},children:(0,i.jsx)(s.Z,{style:{height:24,width:24},className:"animate-spin"})})})}},99221:function(e,t,n){"use strict";n.d(t,{t:function(){return v}});var i=n(57437),s=n(2265),r=n(70518),a=n(87592),l=n(63550),c=n(37440),o=n(50495);let d=e=>{let{className:t,...n}=e;return(0,i.jsx)("nav",{role:"navigation","aria-label":"pagination",className:(0,c.cn)("mx-auto flex w-full justify-center",t),...n})};d.displayName="Pagination";let u=s.forwardRef((e,t)=>{let{className:n,...s}=e;return(0,i.jsx)("ul",{ref:t,className:(0,c.cn)("flex flex-row items-center gap-1",n),...s})});u.displayName="PaginationContent";let f=s.forwardRef((e,t)=>{let{className:n,...s}=e;return(0,i.jsx)("li",{ref:t,className:(0,c.cn)("",n),...s})});f.displayName="PaginationItem";let p=e=>{let{className:t,isActive:n,size:s="icon",...r}=e;return(0,i.jsx)("a",{"aria-current":n?"page":void 0,className:(0,c.cn)((0,o.d)({variant:n?"outline":"ghost",size:s}),t),...r})};p.displayName="PaginationLink";let h=e=>{let{className:t,...n}=e;return(0,i.jsxs)(p,{"aria-label":"Go to previous page",size:"default",className:(0,c.cn)("gap-1 pl-2.5",t),...n,children:[(0,i.jsx)(r.Z,{className:"h-4 w-4"}),(0,i.jsx)("span",{children:"Previous"})]})};h.displayName="PaginationPrevious";let m=e=>{let{className:t,...n}=e;return(0,i.jsxs)(p,{"aria-label":"Go to next page",size:"default",className:(0,c.cn)("gap-1 pr-2.5",t),...n,children:[(0,i.jsx)("span",{children:"Next"}),(0,i.jsx)(a.Z,{className:"h-4 w-4"})]})};m.displayName="PaginationNext";let x=e=>{let{className:t,...n}=e;return(0,i.jsxs)("span",{"aria-hidden":!0,className:(0,c.cn)("flex h-9 w-9 items-center justify-center",t),...n,children:[(0,i.jsx)(l.Z,{className:"h-4 w-4"}),(0,i.jsx)("span",{className:"sr-only",children:"More pages"})]})};x.displayName="PaginationEllipsis";var g=n(78448);let j="LEFT",b="RIGHT";function N(e,t){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1,i=e,s=[];for(;i<=t;)s.push(i),i+=n;return s}function v(e){let{currentPage:t,totalPages:n,disabled:s,limit:r=1,totalRows:a,collectionName:l="results",hideControls:o,hideSummary:v,classes:y}=e,k=function(e){let{currentPage:t=1,totalPages:n=0,onPaginate:i}=e,s=[{id:"first",label:"Previous",disabled:t<2,isPrev:!0,isNext:!1,isEllipsis:!1,onClick:()=>i(t-1)}];return(function(e){let{totalPages:t=0,currentPage:n=1}=e;if(t>9){let e=[],i=n-2,s=n+2,r=t-1,a=i>2?i:2,l=s<r?s:r,c=7-(e=N(a,l)).length-1,o=a>2,d=l<r;return o&&!d?e=[j,...N(a-c,a-1),...e]:!o&&d?e=[...e,...N(l+1,l+c),b]:o&&d&&(e=[j,...e,b]),[1,...e,t]}return N(1,t)})(e).forEach(e=>{[j,b].includes(e)?s.push({label:"...",id:"".concat(e),disabled:!1,isPrev:!1,isNext:!1,isEllipsis:!0,onClick:()=>{}}):s.push({id:"".concat(e),label:"".concat(e),disabled:t===e,isPrev:!1,isNext:!1,isEllipsis:!1,onClick:()=>i(Number(e))})}),s.push({id:"last",label:"Next",disabled:n===t,isPrev:!1,isNext:!0,isEllipsis:!1,onClick:()=>i(t+1)}),s}(e);return o&&v?null:(0,i.jsxs)("div",{className:"flex flex-col justify-center items-center gap-y-2",children:[!v&&(0,i.jsxs)("div",{className:"text-xs opacity-50 min-w-10",children:["Showing ",a?(0,g.c)((t-1)*r+1):0,"\xa0-\xa0",(0,g.c)(Math.min(a,t*r)),"\xa0of\xa0",(0,g.c)(a,{separator:" "})," ",l]}),!o&&(0,i.jsx)(d,{children:(0,i.jsx)(u,{children:k.map(e=>(0,i.jsx)(f,{children:(()=>{let r="".concat(t)==="".concat(e.label),a=e.disabled||s,l="opacity-50",o=()=>!a&&e.onClick();return e.isPrev?(a=a||1===t,(0,i.jsx)(h,{href:"#",className:(0,c.cn)(1===t?l:""),onClick:e=>{e.stopPropagation(),e.preventDefault(),o()}})):e.isEllipsis?(0,i.jsx)(x,{className:(0,c.cn)(a?l:"","hidden md:flex",null==y?void 0:y.pageNumber)}):e.isNext?(a=a||t===n,(0,i.jsx)(m,{href:"#",className:(0,c.cn)(a?l:""),onClick:e=>{e.stopPropagation(),e.preventDefault(),o()}})):(0,i.jsx)(p,{href:"#",className:(0,c.cn)(a?l:"","hidden md:flex",null==y?void 0:y.pageNumber),isActive:r,onClick:e=>{e.stopPropagation(),e.preventDefault(),o()},children:e.label})})()},e.id))})})]})}},25704:function(e,t,n){"use strict";n.r(t),n.d(t,{Title:function(){return s}});var i=n(2265);function s(e){let{children:t}=e;return(0,i.useEffect)(()=>{document.title=["Neotree",t].filter(e=>e).join(" - ")},[t]),(0,i.useEffect)(()=>()=>{document.title="".concat("Neotree")},[]),null}},78448:function(e,t,n){"use strict";function i(e,t){let{decimals:n=0,separator:i=" "}={...t};isNaN(e=Number("".concat(e).replace(/[^a-z0-9.]+/gi,"")))&&(e="0");let s=(e="".concat(Number(e).toFixed(n>=0?n:2))).toString().split(".");return s[0]=s[0].replace(/\B(?=(\d{3})+(?!\d))/g,i),s.join(".")}n.d(t,{c:function(){return i}})},70518:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(78030).Z)("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]])},63550:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(78030).Z)("Ellipsis",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]])},23787:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(78030).Z)("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]])},89627:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(78030).Z)("Loader",[["path",{d:"M12 2v4",key:"3427ic"}],["path",{d:"m16.2 7.8 2.9-2.9",key:"r700ao"}],["path",{d:"M18 12h4",key:"wj9ykh"}],["path",{d:"m16.2 16.2 2.9 2.9",key:"1bxg5t"}],["path",{d:"M12 18v4",key:"jadmvz"}],["path",{d:"m4.9 19.1 2.9-2.9",key:"bwix9q"}],["path",{d:"M2 12h4",key:"j09sii"}],["path",{d:"m4.9 4.9 2.9 2.9",key:"giyufr"}]])},87138:function(e,t,n){"use strict";n.d(t,{default:function(){return s.a}});var i=n(231),s=n.n(i)}},function(e){e.O(0,[6990,4868,5360,8429,2592,7946,9343,1072,231,5944,7478,7023,1744],function(){return e(e.s=63758)}),_N_E=e.O()}]);