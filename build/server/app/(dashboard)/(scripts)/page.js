(()=>{var e={};e.id=2433,e.ids=[2433],e.modules={67096:e=>{"use strict";e.exports=require("bcrypt")},47849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},39491:e=>{"use strict";e.exports=require("assert")},14300:e=>{"use strict";e.exports=require("buffer")},32081:e=>{"use strict";e.exports=require("child_process")},6113:e=>{"use strict";e.exports=require("crypto")},82361:e=>{"use strict";e.exports=require("events")},57147:e=>{"use strict";e.exports=require("fs")},13685:e=>{"use strict";e.exports=require("http")},95687:e=>{"use strict";e.exports=require("https")},41808:e=>{"use strict";e.exports=require("net")},6005:e=>{"use strict";e.exports=require("node:crypto")},87561:e=>{"use strict";e.exports=require("node:fs")},49411:e=>{"use strict";e.exports=require("node:path")},22037:e=>{"use strict";e.exports=require("os")},71017:e=>{"use strict";e.exports=require("path")},4074:e=>{"use strict";e.exports=require("perf_hooks")},63477:e=>{"use strict";e.exports=require("querystring")},12781:e=>{"use strict";e.exports=require("stream")},24404:e=>{"use strict";e.exports=require("tls")},76224:e=>{"use strict";e.exports=require("tty")},57310:e=>{"use strict";e.exports=require("url")},73837:e=>{"use strict";e.exports=require("util")},59796:e=>{"use strict";e.exports=require("zlib")},81347:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>n.a,__next_app__:()=>p,originalPathname:()=>u,pages:()=>d,routeModule:()=>h,tree:()=>c}),r(81438),r(95602),r(17162),r(56367),r(12699),r(77482),r(96560);var s=r(23191),a=r(88716),i=r(37922),n=r.n(i),o=r(95231),l={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);r.d(t,l);let c=["",{children:["(dashboard)",{children:["(scripts)",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,81438)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/page.tsx"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,95602)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/layout.tsx"],loading:[()=>Promise.resolve().then(r.bind(r,17162)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,56367)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/layout.tsx"],loading:[()=>Promise.resolve().then(r.bind(r,12699)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/loading.tsx"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,77482)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(r.bind(r,96560)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/not-found.tsx"]}],d=["/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/page.tsx"],u="/(dashboard)/(scripts)/page",p={require:r,loadChunk:()=>Promise.resolve()},h=new s.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/(dashboard)/(scripts)/page",pathname:"/",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},27530:(e,t,r)=>{Promise.resolve().then(r.bind(r,41998)),Promise.resolve().then(r.bind(r,10827))},69088:(e,t,r)=>{"use strict";r.d(t,{d:()=>b});var s=r(10326),a=r(17577),i=r(35047),n=r(74723),o=r(44099),l=r(34474),c=r(62288),d=r(53313),u=r(96221),p=r(3529),h=r(82617),m=r(90772),x=r(11870),f=r(31048),y=r(2025),g=r(54432),j=r(77863);function b({open:e,overWriteScriptWithId:t,onOpenChange:r,onImportSuccess:b}){let v=(0,i.useRouter)(),w=(0,i.useParams)();t=t||w.scriptId;let{getSites:k}=(0,p.b)(),{copyScripts:I}=(0,h.h)(),{alert:C}=(0,u.s)(),[S,N]=(0,a.useState)(!1),[E,F]=(0,a.useState)({data:[]}),{formState:{errors:q},reset:D,watch:P,setValue:R,register:Z,handleSubmit:A}=(0,n.cI)({defaultValues:{siteId:"",scriptId:"",confirmed:!t}}),O=P("confirmed"),_=(0,a.useMemo)(()=>S,[S]);(0,a.useCallback)(async()=>{try{let e=(await o.Z.get("/api/sites?data="+JSON.stringify({types:["webeditor"]}))).data;if(e.errors?.length)throw Error(e.errors.join(", "));F(e)}catch(e){C({title:"Error",message:"Failed to load sites: "+e.message,variant:"error",onClose:()=>r(!1)})}finally{N(!1)}},[k,C,r]);let M=A(async e=>{try{if(!e.siteId)throw Error("Please select a site!");if(!e.scriptId)throw Error("Please provide a script ID!");if(!e.confirmed)throw Error("Please confirm that you want to overwrite this script!");N(!0);let s=(await o.Z.post("/api/scripts/copy",{fromRemoteSiteId:e.siteId,scriptsIds:[e.scriptId],overWriteScriptWithId:t,broadcastAction:!0})).data;if(s.errors?.length)throw Error(s.errors.join(", "));v.refresh(),C({variant:"success",title:"Success",message:"Script imported successfully!",onClose:()=>{b?.(),D({siteId:"",scriptId:"",confirmed:!1}),r(!1)}})}catch(e){C({variant:"error",title:"Error",message:"Failed to import script: "+e.message})}finally{N(!1)}});return(0,s.jsxs)(s.Fragment,{children:[S&&s.jsx(x.a,{overlay:!0}),s.jsx(y.u,{open:e,onOpenChange:()=>{r(!1)},title:"Import script",actions:(0,s.jsxs)(s.Fragment,{children:[s.jsx("span",{className:"text-xs text-danger",children:"* Required"}),s.jsx("div",{className:"flex-1"}),s.jsx(c.GG,{asChild:!0,children:s.jsx(m.z,{variant:"ghost",disabled:_,onClick:()=>r(!1),children:"Cancel"})}),s.jsx(m.z,{onClick:()=>M(),disabled:_,children:"Import"})]}),children:(0,s.jsxs)("div",{className:"flex flex-col gap-y-5",children:[(0,s.jsxs)("div",{children:[s.jsx(f._,{htmlFor:"siteId",children:"Site *"}),(0,s.jsxs)(l.Ph,{name:"siteId",disabled:_,onValueChange:e=>R("siteId",e,{shouldDirty:!0}),children:[s.jsx(l.i4,{children:s.jsx(l.ki,{placeholder:"Select site"})}),s.jsx(l.Bw,{children:(0,s.jsxs)(l.DI,{children:[s.jsx(l.n5,{children:"Sites"}),E.data.map(({siteId:e,name:t})=>s.jsx(l.Ql,{value:e,children:t},e))]})})]}),!!q.siteId?.message&&s.jsx("div",{className:"text-xs text-danger mt-1",children:q.siteId.message})]}),(0,s.jsxs)("div",{children:[s.jsx(f._,{htmlFor:"scriptId",children:"Script ID *"}),s.jsx(g.I,{...Z("scriptId",{disabled:_,required:!0}),name:"scriptId"}),!!q.scriptId?.message&&s.jsx("div",{className:"text-xs text-danger mt-1",children:q.scriptId.message})]}),(0,s.jsxs)("div",{className:(0,j.cn)("flex gap-x-2",!t&&"hidden"),children:[s.jsx(d.X,{name:"confirmed",id:"confirmed",disabled:_,checked:O,onCheckedChange:()=>R("confirmed",!O,{shouldDirty:!0})}),s.jsx(f._,{secondary:!0,htmlFor:"confirmed",children:"Confirm that you want to overwrite this script"})]})]})})]})}},41998:(e,t,r)=>{"use strict";r.d(t,{ScriptsTable:()=>W});var s=r(10326),a=r(69508),i=r(9162),n=r(82617),o=r(11870),l=r(77863),c=r(3529),d=r(47035),u=r(63685),p=r(90772),h=r(29354);function m({selected:e,setScriptsIdsToExport:t,onDelete:r}){return e.length?s.jsx(s.Fragment,{children:!!e.length&&(0,s.jsxs)(h.h,{children:[(0,s.jsxs)(p.z,{variant:"destructive",className:"h-auto w-auto",onClick:()=>r(),children:[s.jsx(d.Z,{className:"h-4 w-4 mr-1"}),s.jsx("span",{children:e.length>1?`Delete ${e.length}`:"Delete"})]}),(0,s.jsxs)(p.z,{className:"h-auto w-auto",onClick:()=>t(),children:[s.jsx(u.Z,{className:"h-4 w-4 mr-1"}),s.jsx("span",{children:e.length>1?`Export ${e.length}`:"Export"})]})]})}):null}var x=r(90434),f=r(39447),y=r(12714);/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let g=(0,r(62881).Z)("CopyPlus",[["line",{x1:"15",x2:"15",y1:"12",y2:"18",key:"1p7wdc"}],["line",{x1:"12",x2:"18",y1:"15",y2:"15",key:"1nscbv"}],["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);var j=r(43810),b=r(7027),v=r(60097),w=r(17577),k=r(38599),I=r.n(k);let C=function(e){void 0===e&&(e={});var t=(0,w.useState)(e),r=t[0],s=t[1];return[r,(0,w.useCallback)(function(e){s(function(t){return Object.assign({},t,e instanceof Function?e(t):e)})},[])]},S=function(){var e,t=(e=(0,w.useRef)(!1),(0,w.useCallback)(function(){return e.current},[])),r=C({value:void 0,error:void 0,noUserInteraction:!0}),s=r[0],a=r[1];return[s,(0,w.useCallback)(function(e){if(t())try{if("string"!=typeof e&&"number"!=typeof e){var r,s,i=Error("Cannot copy typeof "+typeof e+" to clipboard, must be a string");a({value:e,error:i,noUserInteraction:!0});return}if(""===e){var i=Error("Cannot copy empty string to clipboard.");a({value:e,error:i,noUserInteraction:!0});return}s=e.toString(),r=I()(s),a({value:s,error:void 0,noUserInteraction:r})}catch(e){a({value:s,error:e,noUserInteraction:r})}},[])]};r(85999);var N=r(47463);function E(e){let[t,r]=S(),[s,a]=(0,w.useState)();return[t,(0,w.useCallback)(e=>(a((0,N.Z)()),r(e)),[r])]}function F({value:e,showValueOnToast:t=!1,...r}){let[a,i]=E({showValueOnToast:t});return s.jsx("div",{...r,onClick:(...t)=>{i(`${e}`),r.onClick?.(...t)}})}function q({item:e,disabled:t,setScriptsIdsToExport:r,onDelete:i,onDuplicate:n}){let[o,l]=E({showValueOnToast:!0});return e?s.jsx(s.Fragment,{children:(0,s.jsxs)(v.h_,{children:[s.jsx(v.$F,{asChild:!0,children:s.jsx(p.z,{variant:"ghost",size:"icon",className:"p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent",children:s.jsx(f.Z,{className:"h-4 w-4"})})}),(0,s.jsxs)(v.AW,{children:[s.jsx(v.Xi,{asChild:!0,children:s.jsx(x.default,{href:`/script/${e.scriptId}`,children:s.jsx(s.Fragment,{children:t?(0,s.jsxs)(s.Fragment,{children:[s.jsx(y.Z,{className:"mr-2 h-4 w-4"})," View"]}):(0,s.jsxs)(s.Fragment,{children:[s.jsx(a.Z,{className:"mr-2 h-4 w-4"})," Edit"]})})})}),(0,s.jsxs)(v.Xi,{onClick:()=>n(),children:[s.jsx(g,{className:"mr-2 h-4 w-4"}),"Duplicate"]}),(0,s.jsxs)(v.Xi,{onClick:()=>r(),children:[s.jsx(u.Z,{className:"mr-2 h-4 w-4"}),"Export"]}),s.jsx(v.Xi,{asChild:!0,children:(0,s.jsxs)(F,{showValueOnToast:!0,value:e.scriptId,children:[s.jsx(j.Z,{className:"mr-2 h-4 w-4"}),"Copy ID"]})}),s.jsx(v.Xi,{asChild:!0,children:(0,s.jsxs)(x.default,{target:"_blank",href:`/scripts/${e.scriptId}/metadata`,children:[s.jsx(b.Z,{className:"mr-2 h-4 w-4"}),"View metadata"]})}),!t&&(0,s.jsxs)(v.Xi,{onClick:()=>i(),className:"text-danger focus:bg-danger focus:text-danger-foreground",children:[s.jsx(d.Z,{className:"mr-2 h-4 w-4"}),s.jsx("span",{children:"Delete"})]})]})]})}):null}var D=r(35047),P=r(74723),R=r(44099),Z=r(62288),A=r(34474),O=r(96221),_=r(31048),M=r(2025);function $({open:e,scriptsIdsToExport:t,setScriptsIdsToExport:r,onOpenChange:a}){let{getSites:i}=(0,c.b)(),{copyScripts:l}=(0,n.h)(),{alert:d}=(0,O.s)(),u=(0,D.useRouter)(),[h,m]=(0,w.useState)(!1),[x,f]=(0,w.useState)({data:[]}),{formState:{errors:y},setValue:g,reset:j,handleSubmit:b}=(0,P.cI)({defaultValues:{siteId:""}}),v=(0,w.useMemo)(()=>h,[h]);(0,w.useCallback)(async()=>{try{let e=(await R.Z.get("/api/sites?data="+JSON.stringify({types:["webeditor"]}))).data;if(e.errors?.length)throw Error(e.errors.join(", "));f(e)}catch(e){d({title:"Error",message:"Failed to load sites: "+e.message,variant:"error",onClose:()=>a(!1)})}finally{m(!1)}},[i,d,a]);let k=b(async e=>{try{if(!e.siteId)throw Error("Please select a site!");m(!0);let r=(await R.Z.post("/api/scripts/copy",{toRemoteSiteId:e.siteId,scriptsIds:t,broadcastAction:!0})).data;if(r.errors?.length)throw Error(r.errors.join(", "));u.refresh(),d({variant:"success",title:"Success",message:"Script exported successfully!",onClose:()=>{j({siteId:""}),a(!1)}})}catch(e){d({variant:"error",title:"Error",message:"Failed to export script: "+e.message})}finally{m(!1)}});return(0,s.jsxs)(s.Fragment,{children:[h&&s.jsx(o.a,{overlay:!0}),s.jsx(M.u,{open:e,onOpenChange:()=>{a(!1),e||r([])},title:"Export script",actions:(0,s.jsxs)(s.Fragment,{children:[s.jsx("span",{className:"text-xs text-danger",children:"* Required"}),s.jsx("div",{className:"flex-1"}),s.jsx(Z.GG,{asChild:!0,children:s.jsx(p.z,{variant:"ghost",disabled:v,onClick:()=>a(!1),children:"Cancel"})}),s.jsx(p.z,{onClick:()=>k(),disabled:v,children:"Export"})]}),children:s.jsx("div",{className:"flex flex-col gap-y-5",children:(0,s.jsxs)("div",{children:[s.jsx(_._,{htmlFor:"siteId",children:"Site *"}),(0,s.jsxs)(A.Ph,{name:"siteId",disabled:v,onValueChange:e=>g("siteId",e,{shouldDirty:!0}),children:[s.jsx(A.i4,{children:s.jsx(A.ki,{placeholder:"Select site"})}),s.jsx(A.Bw,{children:(0,s.jsxs)(A.DI,{children:[s.jsx(A.n5,{children:"Sites"}),x.data.map(({siteId:e,name:t})=>s.jsx(A.Ql,{value:e,children:t},e))]})})]}),!!y.siteId?.message&&s.jsx("div",{className:"text-xs text-danger mt-1",children:y.siteId.message})]})})})]})}var U=r(83855),T=r(69088);function z({disabled:e}){let[t,r]=(0,w.useState)(!1),a=(0,D.useRouter)();return e?null:(0,s.jsxs)(s.Fragment,{children:[s.jsx(T.d,{open:t,onOpenChange:r}),s.jsx("div",{className:" fixed bottom-5 right-10 z-[1] ",children:(0,s.jsxs)(v.h_,{children:[s.jsx(v.$F,{asChild:!0,children:s.jsx(p.z,{size:"icon",className:"rounded-full w-12 h-12",children:s.jsx(U.Z,{className:"h-6 w-6"})})}),(0,s.jsxs)(v.AW,{children:[s.jsx(v.Xi,{onClick:()=>a.push("/new-script"),children:"New script"}),s.jsx(v.Xi,{onClick:()=>r(!0),children:"Import script"})]})]})})]})}var V=r(46670);function W(e){let{scripts:t,selected:r,loading:d,scriptsIdsToExport:u,disabled:p,setSelected:h,setScriptsIdsToExport:x,onDelete:f,onSort:y,onDuplicate:g}=function({scripts:e}){let[t,r]=(0,w.useState)(e),[s,a]=(0,w.useState)([]),[i,o]=(0,w.useState)(!1),[l,d]=(0,w.useState)([]),u=(0,D.useRouter)(),{viewOnly:p}=(0,c.b)(),{confirm:h}=(0,V.t)(),{alert:m}=(0,O.s)(),{deleteScripts:x,saveScripts:f,copyScripts:y}=(0,n.h)(),g=(0,w.useCallback)(async e=>{h(async()=>{let s={...t};r(t=>({...t,data:t.data.filter(t=>!e.includes(t.scriptId))})),a([]),o(!0);let i=(await R.Z.delete("/api/scripts?data="+JSON.stringify({scriptsIds:e,broadcastAction:!0}))).data;i.errors?.length?m({title:"Error",message:i.errors.join(", "),variant:"error",onClose:()=>r(s)}):(a([]),u.refresh(),m({title:"Success",message:"Scripts deleted successfully!",variant:"success"})),o(!1)},{danger:!0,title:"Delete scripts",message:"Are you sure you want to delete scripts?",positiveLabel:"Yes, delete"})},[x,h,m,u,t]),j=(0,w.useCallback)(async(e,s,a)=>{let i=[],n=a.map(({oldIndex:e,newIndex:r})=>{let s=t.data[e],a=s.position;return e!==r&&(a=t.data[r].position,i.push({scriptId:s.scriptId,position:a})),{...s,position:a}}).sort((e,t)=>e.position-t.position);r(e=>({...e,data:n})),await R.Z.post("/api/scripts/save",{data:i,broadcastAction:!0}),u.refresh()},[f,t,u]),b=(0,w.useCallback)(async e=>{let r=(e=e.filter(e=>e)).map(e=>t.data.filter(t=>t.scriptId===e)[0]?.title||"");h(async()=>{try{if(!e.length)throw Error("No scripts selected");o(!0);let t=(await R.Z.post("/api/scripts/copy",{scriptsIds:e,broadcastAction:!0})).data;if(t.errors?.length)throw Error(t.errors.join(", "));u.refresh(),m({variant:"success",title:"Success",message:"Scripts duplicated successfully!"})}catch(e){m({variant:"error",title:"Error",message:"Failed to duplicate scripts: "+e.message})}finally{o(!1)}},{title:"Duplicate script",message:`<p>Are you sure you want to duplicate: ${r.map(e=>`<div><b>${e}</b></div>`).join("")}`,positiveLabel:"Yes, duplicate"})},[h,y,m,u,t]),v=(0,w.useMemo)(()=>p,[p]),k=(0,w.useMemo)(()=>t.data.filter(e=>l.includes(e.scriptId)),[l,t]);return{scripts:t,selected:s,loading:i,scriptsIdsToExport:l,disabled:v,scriptsToExport:k,setScripts:r,setSelected:a,setLoading:o,setScriptsIdsToExport:d,onDelete:g,onSort:j,onDuplicate:b}}(e),{sys:j,viewOnly:b}=(0,c.b)(),{hospitals:v}=(0,n.h)();return(0,s.jsxs)(s.Fragment,{children:[d&&s.jsx(o.a,{overlay:!0}),!!u.length&&s.jsx($,{open:!0,scriptsIdsToExport:u,onOpenChange:()=>x([]),setScriptsIdsToExport:x}),s.jsx(z,{disabled:p}),s.jsx("div",{className:"",children:s.jsx(i.DataTable,{selectedIndexes:r,onSelect:h,title:"Scripts",selectable:!p,sortable:!p,loading:d,maxRows:25,onSort:y,getRowOptions:({rowIndex:e})=>{let r=t.data[e];return r?{className:(0,l.cn)(!b&&r.isDraft&&"bg-danger/20 hover:bg-danger/30")}:{}},search:{inputPlaceholder:"Search scripts"},noDataMessage:s.jsx("div",{className:"mt-4 flex flex-col items-center justify-center gap-y-2",children:s.jsx("div",{children:"No scripts saved."})}),columns:[{name:"Position",cellRenderer:({rowIndex:e})=>e+1},{name:"Title"},{name:"Description"},{name:"Hospital",cellRenderer({rowIndex:e}){let r=t.data[e];return r?v.data.filter(e=>e.hospitalId===r.hospitalId)[0]?.name||"":null}},{name:"Version",align:"right",cellClassName:(0,l.cn)("w-[100px]","yes"===j.data.hide_data_table_version&&"hidden"),cellRenderer(e){let r=t.data[e.rowIndex];if(!r)return null;let i=r.isDraft?Math.max(0,r.version-1):r.version;return(0,s.jsxs)("div",{className:"inline-flex w-full justify-end items-center gap-x-[2px]",children:[s.jsx("div",{className:(0,l.cn)("w-2 h-2 rounded-full",i?"bg-green-400":"bg-gray-300")}),s.jsx("span",{children:i||r.version}),r.isDraft&&s.jsx(a.Z,{className:"h-4 w-4 text-muted-foreground"})]})}},{name:"Action",align:"right",cellClassName:"w-10",cellRenderer({rowIndex:e}){let r=t.data[e];return r?s.jsx(q,{item:r,disabled:p,setScriptsIdsToExport:()=>x([r.scriptId]),onDelete:()=>f([r.scriptId]),onDuplicate:()=>g([r.scriptId])}):null}}],data:t.data.map(e=>[e.position,e.title||"",e.description||"",e.hospitalName||"",e.version,""])})}),s.jsx(m,{selected:r,onDelete:()=>f(r.map(e=>t.data[e].scriptId).filter(e=>e)),setScriptsIdsToExport:()=>x(r.map(e=>t.data[e].scriptId).filter(e=>e))})]})}},38599:(e,t,r)=>{"use strict";var s=r(71467),a={"text/plain":"Text","text/html":"Url",default:"Text"};e.exports=function(e,t){var r,i,n,o,l,c,d,u,p=!1;t||(t={}),n=t.debug||!1;try{if(l=s(),c=document.createRange(),d=document.getSelection(),(u=document.createElement("span")).textContent=e,u.ariaHidden="true",u.style.all="unset",u.style.position="fixed",u.style.top=0,u.style.clip="rect(0, 0, 0, 0)",u.style.whiteSpace="pre",u.style.webkitUserSelect="text",u.style.MozUserSelect="text",u.style.msUserSelect="text",u.style.userSelect="text",u.addEventListener("copy",function(r){if(r.stopPropagation(),t.format){if(r.preventDefault(),void 0===r.clipboardData){n&&console.warn("unable to use e.clipboardData"),n&&console.warn("trying IE specific stuff"),window.clipboardData.clearData();var s=a[t.format]||a.default;window.clipboardData.setData(s,e)}else r.clipboardData.clearData(),r.clipboardData.setData(t.format,e)}t.onCopy&&(r.preventDefault(),t.onCopy(r.clipboardData))}),document.body.appendChild(u),c.selectNodeContents(u),d.addRange(c),!document.execCommand("copy"))throw Error("copy command was unsuccessful");p=!0}catch(s){n&&console.error("unable to copy using execCommand: ",s),n&&console.warn("trying IE specific stuff");try{window.clipboardData.setData(t.format||"text",e),t.onCopy&&t.onCopy(window.clipboardData),p=!0}catch(s){n&&console.error("unable to copy using clipboardData: ",s),n&&console.error("falling back to prompt"),r="message"in t?t.message:"Copy to clipboard: #{key}, Enter",i=(/mac os x/i.test(navigator.userAgent)?"⌘":"Ctrl")+"+C",o=r.replace(/#{\s*key\s*}/g,i),window.prompt(o,e)}}finally{d&&("function"==typeof d.removeRange?d.removeRange(c):d.removeAllRanges()),u&&document.body.removeChild(u),l()}return p}},43810:(e,t,r)=>{"use strict";r.d(t,{Z:()=>s});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(62881).Z)("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},39447:(e,t,r)=>{"use strict";r.d(t,{Z:()=>s});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(62881).Z)("EllipsisVertical",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"12",cy:"5",r:"1",key:"gxeob9"}],["circle",{cx:"12",cy:"19",r:"1",key:"lyex9k"}]])},7027:(e,t,r)=>{"use strict";r.d(t,{Z:()=>s});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(62881).Z)("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]])},12714:(e,t,r)=>{"use strict";r.d(t,{Z:()=>s});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(62881).Z)("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},83855:(e,t,r)=>{"use strict";r.d(t,{Z:()=>s});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(62881).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},69508:(e,t,r)=>{"use strict";r.d(t,{Z:()=>s});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(62881).Z)("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]])},47035:(e,t,r)=>{"use strict";r.d(t,{Z:()=>s});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(62881).Z)("Trash",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}]])},71467:e=>{e.exports=function(){var e=document.getSelection();if(!e.rangeCount)return function(){};for(var t=document.activeElement,r=[],s=0;s<e.rangeCount;s++)r.push(e.getRangeAt(s));switch(t.tagName.toUpperCase()){case"INPUT":case"TEXTAREA":t.blur();break;default:t=null}return e.removeAllRanges(),function(){"Caret"===e.type&&e.removeAllRanges(),e.rangeCount||r.forEach(function(t){e.addRange(t)}),t&&t.focus()}}},81438:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>h});var s=r(19510),a=r(87845),i=r(85431),n=r(24569),o=r(46697),l=r(68570);let c=(0,l.createProxy)(String.raw`/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/components/scripts-table.tsx`),{__esModule:d,$$typeof:u}=c;c.default;let p=(0,l.createProxy)(String.raw`/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/components/scripts-table.tsx#ScriptsTable`);async function h(){let e=await a.getScripts({returnDraftsIfExist:!0});return(0,s.jsxs)(s.Fragment,{children:[s.jsx(i.D,{children:"Scripts"}),s.jsx(n.V,{children:s.jsx(o.Zb,{className:"mb-20",children:s.jsx(o.aY,{className:"p-0",children:s.jsx(p,{scripts:e})})})})]})}},49530:(e,t,r)=>{"use strict";r.d(t,{Z:()=>k});var s={};r.r(s),r.d(s,{exclude:()=>w,extract:()=>f,parse:()=>y,parseUrl:()=>j,pick:()=>v,stringify:()=>g,stringifyUrl:()=>b});let a="%[a-f0-9]{2}",i=RegExp("("+a+")|([^%]+?)","gi"),n=RegExp("("+a+")+","gi");function o(e,t){if(!("string"==typeof e&&"string"==typeof t))throw TypeError("Expected the arguments to be of type `string`");if(""===e||""===t)return[];let r=e.indexOf(t);return -1===r?[]:[e.slice(0,r),e.slice(r+t.length)]}let l=e=>null==e,c=e=>encodeURIComponent(e).replaceAll(/[!'()*]/g,e=>`%${e.charCodeAt(0).toString(16).toUpperCase()}`),d=Symbol("encodeFragmentIdentifier");function u(e){if("string"!=typeof e||1!==e.length)throw TypeError("arrayFormatSeparator must be single character string")}function p(e,t){return t.encode?t.strict?c(e):encodeURIComponent(e):e}function h(e,t){return t.decode?function(e){if("string"!=typeof e)throw TypeError("Expected `encodedURI` to be of type `string`, got `"+typeof e+"`");try{return decodeURIComponent(e)}catch{return function(e){let t={"%FE%FF":"��","%FF%FE":"��"},r=n.exec(e);for(;r;){try{t[r[0]]=decodeURIComponent(r[0])}catch{let e=function(e){try{return decodeURIComponent(e)}catch{let t=e.match(i)||[];for(let r=1;r<t.length;r++)t=(e=(function e(t,r){try{return[decodeURIComponent(t.join(""))]}catch{}if(1===t.length)return t;r=r||1;let s=t.slice(0,r),a=t.slice(r);return Array.prototype.concat.call([],e(s),e(a))})(t,r).join("")).match(i)||[];return e}}(r[0]);e!==r[0]&&(t[r[0]]=e)}r=n.exec(e)}for(let r of(t["%C2"]="�",Object.keys(t)))e=e.replace(RegExp(r,"g"),t[r]);return e}(e)}}(e):e}function m(e){let t=e.indexOf("#");return -1!==t&&(e=e.slice(0,t)),e}function x(e,t){return t.parseNumbers&&!Number.isNaN(Number(e))&&"string"==typeof e&&""!==e.trim()?e=Number(e):t.parseBooleans&&null!==e&&("true"===e.toLowerCase()||"false"===e.toLowerCase())&&(e="true"===e.toLowerCase()),e}function f(e){let t=(e=m(e)).indexOf("?");return -1===t?"":e.slice(t+1)}function y(e,t){u((t={decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1,...t}).arrayFormatSeparator);let r=function(e){let t;switch(e.arrayFormat){case"index":return(e,r,s)=>{if(t=/\[(\d*)]$/.exec(e),e=e.replace(/\[\d*]$/,""),!t){s[e]=r;return}void 0===s[e]&&(s[e]={}),s[e][t[1]]=r};case"bracket":return(e,r,s)=>{if(t=/(\[])$/.exec(e),e=e.replace(/\[]$/,""),!t){s[e]=r;return}if(void 0===s[e]){s[e]=[r];return}s[e]=[...s[e],r]};case"colon-list-separator":return(e,r,s)=>{if(t=/(:list)$/.exec(e),e=e.replace(/:list$/,""),!t){s[e]=r;return}if(void 0===s[e]){s[e]=[r];return}s[e]=[...s[e],r]};case"comma":case"separator":return(t,r,s)=>{let a="string"==typeof r&&r.includes(e.arrayFormatSeparator),i="string"==typeof r&&!a&&h(r,e).includes(e.arrayFormatSeparator);r=i?h(r,e):r;let n=a||i?r.split(e.arrayFormatSeparator).map(t=>h(t,e)):null===r?r:h(r,e);s[t]=n};case"bracket-separator":return(t,r,s)=>{let a=/(\[])$/.test(t);if(t=t.replace(/\[]$/,""),!a){s[t]=r?h(r,e):r;return}let i=null===r?[]:r.split(e.arrayFormatSeparator).map(t=>h(t,e));if(void 0===s[t]){s[t]=i;return}s[t]=[...s[t],...i]};default:return(e,t,r)=>{if(void 0===r[e]){r[e]=t;return}r[e]=[...[r[e]].flat(),t]}}}(t),s=Object.create(null);if("string"!=typeof e||!(e=e.trim().replace(/^[?#&]/,"")))return s;for(let a of e.split("&")){if(""===a)continue;let e=t.decode?a.replaceAll("+"," "):a,[i,n]=o(e,"=");void 0===i&&(i=e),n=void 0===n?null:["comma","separator","bracket-separator"].includes(t.arrayFormat)?n:h(n,t),r(h(i,t),n,s)}for(let[e,r]of Object.entries(s))if("object"==typeof r&&null!==r)for(let[e,s]of Object.entries(r))r[e]=x(s,t);else s[e]=x(r,t);return!1===t.sort?s:(!0===t.sort?Object.keys(s).sort():Object.keys(s).sort(t.sort)).reduce((e,t)=>{let r=s[t];return e[t]=r&&"object"==typeof r&&!Array.isArray(r)?function e(t){return Array.isArray(t)?t.sort():"object"==typeof t?e(Object.keys(t)).sort((e,t)=>Number(e)-Number(t)).map(e=>t[e]):t}(r):r,e},Object.create(null))}function g(e,t){if(!e)return"";u((t={encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:",",...t}).arrayFormatSeparator);let r=r=>t.skipNull&&l(e[r])||t.skipEmptyString&&""===e[r],s=function(e){switch(e.arrayFormat){case"index":return t=>(r,s)=>{let a=r.length;return void 0===s||e.skipNull&&null===s||e.skipEmptyString&&""===s?r:null===s?[...r,[p(t,e),"[",a,"]"].join("")]:[...r,[p(t,e),"[",p(a,e),"]=",p(s,e)].join("")]};case"bracket":return t=>(r,s)=>void 0===s||e.skipNull&&null===s||e.skipEmptyString&&""===s?r:null===s?[...r,[p(t,e),"[]"].join("")]:[...r,[p(t,e),"[]=",p(s,e)].join("")];case"colon-list-separator":return t=>(r,s)=>void 0===s||e.skipNull&&null===s||e.skipEmptyString&&""===s?r:null===s?[...r,[p(t,e),":list="].join("")]:[...r,[p(t,e),":list=",p(s,e)].join("")];case"comma":case"separator":case"bracket-separator":{let t="bracket-separator"===e.arrayFormat?"[]=":"=";return r=>(s,a)=>void 0===a||e.skipNull&&null===a||e.skipEmptyString&&""===a?s:(a=null===a?"":a,0===s.length)?[[p(r,e),t,p(a,e)].join("")]:[[s,p(a,e)].join(e.arrayFormatSeparator)]}default:return t=>(r,s)=>void 0===s||e.skipNull&&null===s||e.skipEmptyString&&""===s?r:null===s?[...r,p(t,e)]:[...r,[p(t,e),"=",p(s,e)].join("")]}}(t),a={};for(let[t,s]of Object.entries(e))r(t)||(a[t]=s);let i=Object.keys(a);return!1!==t.sort&&i.sort(t.sort),i.map(r=>{let a=e[r];return void 0===a?"":null===a?p(r,t):Array.isArray(a)?0===a.length&&"bracket-separator"===t.arrayFormat?p(r,t)+"[]":a.reduce(s(r),[]).join("&"):p(r,t)+"="+p(a,t)}).filter(e=>e.length>0).join("&")}function j(e,t){t={decode:!0,...t};let[r,s]=o(e,"#");return void 0===r&&(r=e),{url:r?.split("?")?.[0]??"",query:y(f(e),t),...t&&t.parseFragmentIdentifier&&s?{fragmentIdentifier:h(s,t)}:{}}}function b(e,t){t={encode:!0,strict:!0,[d]:!0,...t};let r=m(e.url).split("?")[0]||"",s=g({...y(f(e.url),{sort:!1}),...e.query},t);s&&=`?${s}`;let a=function(e){let t="",r=e.indexOf("#");return -1!==r&&(t=e.slice(r)),t}(e.url);if("string"==typeof e.fragmentIdentifier){let s=new URL(r);s.hash=e.fragmentIdentifier,a=t[d]?s.hash:`#${e.fragmentIdentifier}`}return`${r}${s}${a}`}function v(e,t,r){let{url:s,query:a,fragmentIdentifier:i}=j(e,r={parseFragmentIdentifier:!0,[d]:!1,...r});return b({url:s,query:function(e,t){let r={};if(Array.isArray(t))for(let s of t){let t=Object.getOwnPropertyDescriptor(e,s);t?.enumerable&&Object.defineProperty(r,s,t)}else for(let s of Reflect.ownKeys(e)){let a=Object.getOwnPropertyDescriptor(e,s);if(a.enumerable){let i=e[s];t(s,i,e)&&Object.defineProperty(r,s,a)}}return r}(a,t),fragmentIdentifier:i},r)}function w(e,t,r){return v(e,Array.isArray(t)?e=>!t.includes(e):(e,r)=>!t(e,r),r)}let k=s}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[1633,1744,1381,3788,1490,9092,5802,9712,7708,2685,6462,4723,4228,8065,413,6267,3750,9558,7845,1271,437,1717,9162,8,6249],()=>r(81347));module.exports=s})();