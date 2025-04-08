(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2433],{38261:function(e,t,r){Promise.resolve().then(r.bind(r,34593)),Promise.resolve().then(r.bind(r,89274)),Promise.resolve().then(r.bind(r,25704))},88519:function(e,t,r){"use strict";r.d(t,{d:function(){return j}});var a=r(57437),s=r(2265),n=r(16463),i=r(39343),l=r(38472),o=r(46294),c=r(90837),d=r(86466),u=r(53699),f=r(17647),p=r(15701),m=r(50495),h=r(39661),x=r(67135),v=r(9704),g=r(83102),y=r(37440);function j(e){var t,r;let{open:j,overWriteScriptWithId:b,onOpenChange:w,onImportSuccess:N}=e,C=(0,n.useRouter)(),k=(0,n.useParams)();b=b||k.scriptId;let{getSites:I}=(0,f.b)(),{copyScripts:E}=(0,p.h)(),{alert:S}=(0,u.s)(),[D,Z]=(0,s.useState)(!1),[R,V]=(0,s.useState)({data:[]}),{formState:{errors:_},reset:T,watch:P,setValue:A,register:z,handleSubmit:F}=(0,i.cI)({defaultValues:{siteId:"",scriptId:"",confirmed:!b}}),M=P("confirmed"),O=(0,s.useMemo)(()=>D,[D]),U=(0,s.useCallback)(async()=>{try{var e;let t=(await l.Z.get("/api/sites?data="+JSON.stringify({types:["webeditor"]}))).data;if(null===(e=t.errors)||void 0===e?void 0:e.length)throw Error(t.errors.join(", "));V(t)}catch(e){S({title:"Error",message:"Failed to load sites: "+e.message,variant:"error",onClose:()=>w(!1)})}finally{Z(!1)}},[I,S,w]),L=F(async e=>{try{var t;if(!e.siteId)throw Error("Please select a site!");if(!e.scriptId)throw Error("Please provide a script ID!");if(!e.confirmed)throw Error("Please confirm that you want to overwrite this script!");Z(!0);let r=(await l.Z.post("/api/scripts/copy",{fromRemoteSiteId:e.siteId,scriptsIds:[e.scriptId],overWriteScriptWithId:b,broadcastAction:!0})).data;if(null===(t=r.errors)||void 0===t?void 0:t.length)throw Error(r.errors.join(", "));C.refresh(),S({variant:"success",title:"Success",message:"Script imported successfully!",onClose:()=>{null==N||N(),T({siteId:"",scriptId:"",confirmed:!1}),w(!1)}})}catch(e){S({variant:"error",title:"Error",message:"Failed to import script: "+e.message})}finally{Z(!1)}});return(0,s.useEffect)(()=>{j&&U()},[j,U]),(0,a.jsxs)(a.Fragment,{children:[D&&(0,a.jsx)(h.a,{overlay:!0}),(0,a.jsx)(v.u,{open:j,onOpenChange:()=>{w(!1)},title:"Import script",actions:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("span",{className:"text-xs text-danger",children:"* Required"}),(0,a.jsx)("div",{className:"flex-1"}),(0,a.jsx)(c.GG,{asChild:!0,children:(0,a.jsx)(m.z,{variant:"ghost",disabled:O,onClick:()=>w(!1),children:"Cancel"})}),(0,a.jsx)(m.z,{onClick:()=>L(),disabled:O,children:"Import"})]}),children:(0,a.jsxs)("div",{className:"flex flex-col gap-y-5",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)(x._,{htmlFor:"siteId",children:"Site *"}),(0,a.jsxs)(o.Ph,{name:"siteId",disabled:O,onValueChange:e=>A("siteId",e,{shouldDirty:!0}),children:[(0,a.jsx)(o.i4,{children:(0,a.jsx)(o.ki,{placeholder:"Select site"})}),(0,a.jsx)(o.Bw,{children:(0,a.jsxs)(o.DI,{children:[(0,a.jsx)(o.n5,{children:"Sites"}),R.data.map(e=>{let{siteId:t,name:r}=e;return(0,a.jsx)(o.Ql,{value:t,children:r},t)})]})})]}),!!(null===(t=_.siteId)||void 0===t?void 0:t.message)&&(0,a.jsx)("div",{className:"text-xs text-danger mt-1",children:_.siteId.message})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(x._,{htmlFor:"scriptId",children:"Script ID *"}),(0,a.jsx)(g.I,{...z("scriptId",{disabled:O,required:!0}),name:"scriptId"}),!!(null===(r=_.scriptId)||void 0===r?void 0:r.message)&&(0,a.jsx)("div",{className:"text-xs text-danger mt-1",children:_.scriptId.message})]}),(0,a.jsxs)("div",{className:(0,y.cn)("flex gap-x-2",!b&&"hidden"),children:[(0,a.jsx)(d.X,{name:"confirmed",id:"confirmed",disabled:O,checked:M,onCheckedChange:()=>A("confirmed",!M,{shouldDirty:!0})}),(0,a.jsx)(x._,{secondary:!0,htmlFor:"confirmed",children:"Confirm that you want to overwrite this script"})]})]})})]})}},34593:function(e,t,r){"use strict";r.d(t,{ScriptsTable:function(){return B}});var a=r(57437),s=r(6649),n=r(76942),i=r(15701),l=r(39661),o=r(37440),c=r(17647),d=r(90399),u=r(58184),f=r(50495),p=r(17501);function m(e){let{selected:t,setScriptsIdsToExport:r,onDelete:s}=e;return t.length?(0,a.jsx)(a.Fragment,{children:!!t.length&&(0,a.jsxs)(p.h,{children:[(0,a.jsxs)(f.z,{variant:"destructive",className:"h-auto w-auto",onClick:()=>s(),children:[(0,a.jsx)(d.Z,{className:"h-4 w-4 mr-1"}),(0,a.jsx)("span",{children:t.length>1?"Delete ".concat(t.length):"Delete"})]}),(0,a.jsxs)(f.z,{className:"h-auto w-auto",onClick:()=>r(),children:[(0,a.jsx)(u.Z,{className:"h-4 w-4 mr-1"}),(0,a.jsx)("span",{children:t.length>1?"Export ".concat(t.length):"Export"})]})]})}):null}var h=r(87138),x=r(45188),v=r(75733);/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let g=(0,r(78030).Z)("CopyPlus",[["line",{x1:"15",x2:"15",y1:"12",y2:"18",key:"1p7wdc"}],["line",{x1:"12",x2:"18",y1:"15",y2:"15",key:"1nscbv"}],["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);var y=r(6884),j=r(23787),b=r(46910),w=r(2265),N=r(80042),C=r.n(N),k=function(e){void 0===e&&(e={});var t=(0,w.useState)(e),r=t[0],a=t[1];return[r,(0,w.useCallback)(function(e){a(function(t){return Object.assign({},t,e instanceof Function?e(t):e)})},[])]},I=function(){var e,t,r=(e=(0,w.useRef)(!1),t=(0,w.useCallback)(function(){return e.current},[]),(0,w.useEffect)(function(){return e.current=!0,function(){e.current=!1}},[]),t),a=k({value:void 0,error:void 0,noUserInteraction:!0}),s=a[0],n=a[1];return[s,(0,w.useCallback)(function(e){if(r())try{if("string"!=typeof e&&"number"!=typeof e){var t,a,s=Error("Cannot copy typeof "+typeof e+" to clipboard, must be a string");n({value:e,error:s,noUserInteraction:!0});return}if(""===e){var s=Error("Cannot copy empty string to clipboard.");n({value:e,error:s,noUserInteraction:!0});return}a=e.toString(),t=C()(a),n({value:a,error:void 0,noUserInteraction:t})}catch(e){n({value:a,error:e,noUserInteraction:t})}},[])]},E=r(27776),S=r(20920);function D(e){let[t,r]=I(),[a,s]=(0,w.useState)(),n=(0,w.useCallback)(e=>(s((0,S.Z)()),r(e)),[r]);return(0,w.useEffect)(()=>{a&&(s(void 0),t.error?E.Am.error("Unable to copy value: ".concat(t.error.message)):t.value&&E.Am.success("Copied"+((null==e?void 0:e.showValueOnToast)?": ".concat(t.value):""),{position:"bottom-center"}))},[a,t,e]),[t,n]}function Z(e){let{value:t,showValueOnToast:r=!1,...s}=e,[n,i]=D({showValueOnToast:r});return(0,a.jsx)("div",{...s,onClick:function(){for(var e,r=arguments.length,a=Array(r),n=0;n<r;n++)a[n]=arguments[n];i("".concat(t)),null===(e=s.onClick)||void 0===e||e.call(s,...a)}})}function R(e){let{item:t,disabled:r,setScriptsIdsToExport:n,onDelete:i,onDuplicate:l}=e,[o,c]=D({showValueOnToast:!0});return t?(0,a.jsx)(a.Fragment,{children:(0,a.jsxs)(b.h_,{children:[(0,a.jsx)(b.$F,{asChild:!0,children:(0,a.jsx)(f.z,{variant:"ghost",size:"icon",className:"p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent",children:(0,a.jsx)(x.Z,{className:"h-4 w-4"})})}),(0,a.jsxs)(b.AW,{children:[(0,a.jsx)(b.Xi,{asChild:!0,children:(0,a.jsx)(h.default,{href:"/script/".concat(t.scriptId),children:(0,a.jsx)(a.Fragment,{children:r?(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(v.Z,{className:"mr-2 h-4 w-4"})," View"]}):(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(s.Z,{className:"mr-2 h-4 w-4"})," Edit"]})})})}),(0,a.jsxs)(b.Xi,{onClick:()=>l(),children:[(0,a.jsx)(g,{className:"mr-2 h-4 w-4"}),"Duplicate"]}),(0,a.jsxs)(b.Xi,{onClick:()=>n(),children:[(0,a.jsx)(u.Z,{className:"mr-2 h-4 w-4"}),"Export"]}),(0,a.jsx)(b.Xi,{asChild:!0,children:(0,a.jsxs)(Z,{showValueOnToast:!0,value:t.scriptId,children:[(0,a.jsx)(y.Z,{className:"mr-2 h-4 w-4"}),"Copy ID"]})}),(0,a.jsx)(b.Xi,{asChild:!0,children:(0,a.jsxs)(h.default,{target:"_blank",href:"/scripts/".concat(t.scriptId,"/metadata"),children:[(0,a.jsx)(j.Z,{className:"mr-2 h-4 w-4"}),"View metadata"]})}),!r&&(0,a.jsxs)(b.Xi,{onClick:()=>i(),className:"text-danger focus:bg-danger focus:text-danger-foreground",children:[(0,a.jsx)(d.Z,{className:"mr-2 h-4 w-4"}),(0,a.jsx)("span",{children:"Delete"})]})]})]})}):null}var V=r(16463),_=r(39343),T=r(38472),P=r(90837),A=r(46294),z=r(53699),F=r(67135),M=r(9704);function O(e){var t;let{open:r,scriptsIdsToExport:s,setScriptsIdsToExport:n,onOpenChange:o}=e,{getSites:d}=(0,c.b)(),{copyScripts:u}=(0,i.h)(),{alert:p}=(0,z.s)(),m=(0,V.useRouter)(),[h,x]=(0,w.useState)(!1),[v,g]=(0,w.useState)({data:[]}),{formState:{errors:y},setValue:j,reset:b,handleSubmit:N}=(0,_.cI)({defaultValues:{siteId:""}}),C=(0,w.useMemo)(()=>h,[h]),k=(0,w.useCallback)(async()=>{try{var e;let t=(await T.Z.get("/api/sites?data="+JSON.stringify({types:["webeditor"]}))).data;if(null===(e=t.errors)||void 0===e?void 0:e.length)throw Error(t.errors.join(", "));g(t)}catch(e){p({title:"Error",message:"Failed to load sites: "+e.message,variant:"error",onClose:()=>o(!1)})}finally{x(!1)}},[d,p,o]),I=N(async e=>{try{var t;if(!e.siteId)throw Error("Please select a site!");x(!0);let r=(await T.Z.post("/api/scripts/copy",{toRemoteSiteId:e.siteId,scriptsIds:s,broadcastAction:!0})).data;if(null===(t=r.errors)||void 0===t?void 0:t.length)throw Error(r.errors.join(", "));m.refresh(),p({variant:"success",title:"Success",message:"Script exported successfully!",onClose:()=>{b({siteId:""}),o(!1)}})}catch(e){p({variant:"error",title:"Error",message:"Failed to export script: "+e.message})}finally{x(!1)}});return(0,w.useEffect)(()=>{r&&k()},[r,k]),(0,a.jsxs)(a.Fragment,{children:[h&&(0,a.jsx)(l.a,{overlay:!0}),(0,a.jsx)(M.u,{open:r,onOpenChange:()=>{o(!1),r||n([])},title:"Export script",actions:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("span",{className:"text-xs text-danger",children:"* Required"}),(0,a.jsx)("div",{className:"flex-1"}),(0,a.jsx)(P.GG,{asChild:!0,children:(0,a.jsx)(f.z,{variant:"ghost",disabled:C,onClick:()=>o(!1),children:"Cancel"})}),(0,a.jsx)(f.z,{onClick:()=>I(),disabled:C,children:"Export"})]}),children:(0,a.jsx)("div",{className:"flex flex-col gap-y-5",children:(0,a.jsxs)("div",{children:[(0,a.jsx)(F._,{htmlFor:"siteId",children:"Site *"}),(0,a.jsxs)(A.Ph,{name:"siteId",disabled:C,onValueChange:e=>j("siteId",e,{shouldDirty:!0}),children:[(0,a.jsx)(A.i4,{children:(0,a.jsx)(A.ki,{placeholder:"Select site"})}),(0,a.jsx)(A.Bw,{children:(0,a.jsxs)(A.DI,{children:[(0,a.jsx)(A.n5,{children:"Sites"}),v.data.map(e=>{let{siteId:t,name:r}=e;return(0,a.jsx)(A.Ql,{value:t,children:r},t)})]})})]}),!!(null===(t=y.siteId)||void 0===t?void 0:t.message)&&(0,a.jsx)("div",{className:"text-xs text-danger mt-1",children:y.siteId.message})]})})})]})}var U=r(92513),L=r(88519);function X(e){let{disabled:t}=e,[r,s]=(0,w.useState)(!1),n=(0,V.useRouter)();return t?null:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(L.d,{open:r,onOpenChange:s}),(0,a.jsx)("div",{className:" fixed bottom-5 right-10 z-[1] ",children:(0,a.jsxs)(b.h_,{children:[(0,a.jsx)(b.$F,{asChild:!0,children:(0,a.jsx)(f.z,{size:"icon",className:"rounded-full w-12 h-12",children:(0,a.jsx)(U.Z,{className:"h-6 w-6"})})}),(0,a.jsxs)(b.AW,{children:[(0,a.jsx)(b.Xi,{onClick:()=>n.push("/new-script"),children:"New script"}),(0,a.jsx)(b.Xi,{onClick:()=>s(!0),children:"Import script"})]})]})})]})}var q=r(76230);function B(e){let{scripts:t,selected:r,loading:d,scriptsIdsToExport:u,disabled:f,setSelected:p,setScriptsIdsToExport:h,onDelete:x,onSort:v,onDuplicate:g}=function(e){let{scripts:t}=e,[r,a]=(0,w.useState)(t),[s,n]=(0,w.useState)([]),[l,o]=(0,w.useState)(!1),[d,u]=(0,w.useState)([]);(0,w.useEffect)(()=>{a(t)},[t]);let f=(0,V.useRouter)(),{viewOnly:p}=(0,c.b)(),{confirm:m}=(0,q.t)(),{alert:h}=(0,z.s)(),{deleteScripts:x,saveScripts:v,copyScripts:g}=(0,i.h)(),y=(0,w.useCallback)(async e=>{m(async()=>{var t;let s={...r};a(t=>({...t,data:t.data.filter(t=>!e.includes(t.scriptId))})),n([]),o(!0);let i=(await T.Z.delete("/api/scripts?data="+JSON.stringify({scriptsIds:e,broadcastAction:!0}))).data;(null===(t=i.errors)||void 0===t?void 0:t.length)?h({title:"Error",message:i.errors.join(", "),variant:"error",onClose:()=>a(s)}):(n([]),f.refresh(),h({title:"Success",message:"Scripts deleted successfully!",variant:"success"})),o(!1)},{danger:!0,title:"Delete scripts",message:"Are you sure you want to delete scripts?",positiveLabel:"Yes, delete"})},[x,m,h,f,r]),j=(0,w.useCallback)(async(e,t,s)=>{let n=[],i=s.map(e=>{let{oldIndex:t,newIndex:a}=e,s=r.data[t],i=s.position;return t!==a&&(i=r.data[a].position,n.push({scriptId:s.scriptId,position:i})),{...s,position:i}}).sort((e,t)=>e.position-t.position);a(e=>({...e,data:i})),await T.Z.post("/api/scripts/save",{data:n,broadcastAction:!0}),f.refresh()},[v,r,f]),b=(0,w.useCallback)(async e=>{let t=(e=e.filter(e=>e)).map(e=>{var t;return(null===(t=r.data.filter(t=>t.scriptId===e)[0])||void 0===t?void 0:t.title)||""});m(async()=>{try{var t;if(!e.length)throw Error("No scripts selected");o(!0);let r=(await T.Z.post("/api/scripts/copy",{scriptsIds:e,broadcastAction:!0})).data;if(null===(t=r.errors)||void 0===t?void 0:t.length)throw Error(r.errors.join(", "));f.refresh(),h({variant:"success",title:"Success",message:"Scripts duplicated successfully!"})}catch(e){h({variant:"error",title:"Error",message:"Failed to duplicate scripts: "+e.message})}finally{o(!1)}},{title:"Duplicate script",message:"<p>Are you sure you want to duplicate: ".concat(t.map(e=>"<div><b>".concat(e,"</b></div>")).join("")),positiveLabel:"Yes, duplicate"})},[m,g,h,f,r]),N=(0,w.useMemo)(()=>p,[p]),C=(0,w.useMemo)(()=>r.data.filter(e=>d.includes(e.scriptId)),[d,r]);return{scripts:r,selected:s,loading:l,scriptsIdsToExport:d,disabled:N,scriptsToExport:C,setScripts:a,setSelected:n,setLoading:o,setScriptsIdsToExport:u,onDelete:y,onSort:j,onDuplicate:b}}(e),{sys:y,viewOnly:j}=(0,c.b)(),{hospitals:b}=(0,i.h)();return(0,a.jsxs)(a.Fragment,{children:[d&&(0,a.jsx)(l.a,{overlay:!0}),!!u.length&&(0,a.jsx)(O,{open:!0,scriptsIdsToExport:u,onOpenChange:()=>h([]),setScriptsIdsToExport:h}),(0,a.jsx)(X,{disabled:f}),(0,a.jsx)("div",{className:"",children:(0,a.jsx)(n.DataTable,{selectedIndexes:r,onSelect:p,title:"Scripts",selectable:!f,sortable:!f,loading:d,maxRows:25,onSort:v,getRowOptions:e=>{let{rowIndex:r}=e,a=t.data[r];return a?{className:(0,o.cn)(!j&&a.isDraft&&"bg-danger/20 hover:bg-danger/30")}:{}},noDataMessage:(0,a.jsx)("div",{className:"mt-4 flex flex-col items-center justify-center gap-y-2",children:(0,a.jsx)("div",{children:"No scripts saved."})}),columns:[{name:"Position",cellRenderer(e){let{rowIndex:t}=e;return t+1}},{name:"Title"},{name:"Description"},{name:"Hospital",cellRenderer(e){var r;let{rowIndex:a}=e,s=t.data[a];return s?(null===(r=b.data.filter(e=>e.hospitalId===s.hospitalId)[0])||void 0===r?void 0:r.name)||"":null}},{name:"Version",align:"right",cellClassName:(0,o.cn)("w-[100px]","yes"===y.data.hide_data_table_version&&"hidden"),cellRenderer(e){let r=t.data[e.rowIndex];if(!r)return null;let n=r.isDraft?Math.max(0,r.version-1):r.version;return(0,a.jsxs)("div",{className:"inline-flex w-full justify-end items-center gap-x-[2px]",children:[(0,a.jsx)("div",{className:(0,o.cn)("w-2 h-2 rounded-full",n?"bg-green-400":"bg-gray-300")}),(0,a.jsx)("span",{children:n||r.version}),r.isDraft&&(0,a.jsx)(s.Z,{className:"h-4 w-4 text-muted-foreground"})]})}},{name:"Action",align:"right",cellClassName:"w-10",cellRenderer(e){let{rowIndex:r}=e,s=t.data[r];return s?(0,a.jsx)(R,{item:s,disabled:f,setScriptsIdsToExport:()=>h([s.scriptId]),onDelete:()=>x([s.scriptId]),onDuplicate:()=>g([s.scriptId])}):null}}],data:t.data.map(e=>[e.position,e.title||"",e.description||"",e.hospitalName||"",e.version,""])})}),(0,a.jsx)(m,{selected:r,onDelete:()=>x(r.map(e=>t.data[e].scriptId).filter(e=>e)),setScriptsIdsToExport:()=>h(r.map(e=>t.data[e].scriptId).filter(e=>e))})]})}},89274:function(e,t,r){"use strict";r.d(t,{ScriptsIndexTabs:function(){return l}});var a=r(57437),s=r(2265),n=r(87138),i=r(85273);function l(e){let{tab:t}=e,r=(0,s.useMemo)(()=>[{label:"Scripts",value:"scripts",href:"/",isActive:"scripts"===t},{label:"Data keys",value:"data-keys",href:"/data-keys",isActive:"data-keys"===t}],[t]),l=(r.find(e=>e.isActive)||r[0]).value,o=(0,s.useCallback)(()=>{},[]);return(0,a.jsx)("div",{children:(0,a.jsxs)(i.mQ,{defaultValue:l,value:l,className:"w-full [&>div]:w-full",onValueChange:o,children:[(0,a.jsx)(i.dr,{children:r.map(e=>(0,a.jsx)(i.SP,{asChild:!0,value:e.value,className:"flex-1",children:(0,a.jsx)(n.default,{href:e.href,children:e.label})},e.value))}),r.map(e=>(0,a.jsx)(i.nU,{value:e.value,className:"hidden"},e.value))]})})}},17501:function(e,t,r){"use strict";r.d(t,{h:function(){return i}});var a=r(57437),s=r(77606),n=r(37440);function i(e){let{children:t,className:r}=e;return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("div",{className:"h-16"}),(0,a.jsx)("div",{className:(0,n.cn)("\n                        fixed \n                        left-0 \n                        bottom-0 \n                        h-16 \n                        w-full \n                        border-t \n                        border-t-border \n                        z-[1] \n                        bg-primary-foreground \n                        dark:bg-background \n                        shadow-md \n                        dark:shadow-foreground/10\n                    "),children:(0,a.jsx)(s.V,{children:(0,a.jsx)("div",{className:(0,n.cn)("flex justify-end gap-x-4",r),children:t})})})]})}},77606:function(e,t,r){"use strict";r.d(t,{V:function(){return n}});var a=r(57437),s=r(37440);function n(e){let{className:t,...r}=e;return(0,a.jsx)("div",{...r,className:(0,s.cn)("w-full max-w-screen-xl mx-auto p-5",t)})}},39661:function(e,t,r){"use strict";r.d(t,{a:function(){return n}});var a=r(57437),s=r(89627);function n(e){let{overlay:t,transparent:r}=e;return(0,a.jsx)(a.Fragment,{children:(0,a.jsx)("div",{style:{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",...t?{height:"100%",position:"fixed",top:0,left:0,bottom:0,zIndex:999,backgroundColor:r?"transparent":"rgba(255,255,255,.6)"}:{padding:"50px 0"}},children:(0,a.jsx)(s.Z,{style:{height:24,width:24},className:"animate-spin"})})})}},9704:function(e,t,r){"use strict";r.d(t,{u:function(){return i}});var a=r(57437),s=r(90837),n=r(37440);function i(e){let{children:t,title:r,description:i,actions:l,trigger:o,contentProps:c,footerProps:d,...u}=e;return(0,a.jsx)(a.Fragment,{children:(0,a.jsxs)(s.Vq,{...u,children:[o,(0,a.jsxs)(s.cZ,{hideCloseButton:!0,className:(0,n.cn)("flex flex-col max-h-[90%] gap-y-4 p-0 m-0 sm:max-w-xl",null==c?void 0:c.className),...c,children:[(0,a.jsxs)(s.fK,{className:(0,n.cn)(r||i?"":"hidden","border-b border-b-border px-4 py-4"),children:[(0,a.jsx)(s.$N,{className:(0,n.cn)(r?"":"hidden"),children:r}),(0,a.jsx)(s.Be,{className:(0,n.cn)(i?"":"hidden"),children:i})]}),(0,a.jsx)("div",{className:"flex-1 flex flex-col overflow-y-auto px-4 py-2",children:t}),(0,a.jsx)(s.cN,{className:(0,n.cn)("border-t border-t-border px-4 py-2 items-center w-full",l?"":"hidden",null==d?void 0:d.className),...d,children:l})]})]})})}},58502:function(e,t,r){"use strict";r.d(t,{SocketEventsListener:function(){return i}});var a=r(2265),s=r(16463),n=r(7752);function i(e){let{events:t}=e,r=(0,a.useRef)({eventsTimeouts:{},eventsTimestamps:{}});(0,a.useRef)(new Date().getTime());let i=(0,s.useRouter)();return(0,a.useEffect)(()=>{t.forEach(e=>{let{name:t,action:a,delay:s=100,onEvent:l}=e;n.Z.on(t,function(){for(var e=arguments.length,n=Array(e),o=0;o<e;o++)n[o]=arguments[o];let c=()=>{var e,r;(!a||n[0]===a)&&(null===(e=l.callback)||void 0===e||e.call(l,...n),(null==l?void 0:l.refreshRouter)&&(console.log(t,"refreshing..."),i.refresh()),(null===(r=l.redirect)||void 0===r?void 0:r.to)&&(l.redirect.replace?i.replace(l.redirect.to):i.push(l.redirect.to)))},d=new Date().getTime();s?(clearTimeout(r.current.eventsTimeouts[t]),r.current.eventsTimeouts[t]=setTimeout(()=>{r.current.eventsTimestamps[t]=d,c()},s)):(r.current.eventsTimestamps[t]=new Date().getTime(),c())})})},[t,i]),null}},25704:function(e,t,r){"use strict";r.d(t,{Title:function(){return n}});var a=r(2265),s=r(20357);function n(e){let{children:t}=e;return(0,a.useEffect)(()=>{document.title=[s.env.NEXT_PUBLIC_APP_NAME||"",t||""].filter(e=>e).join(" - ")},[t]),(0,a.useEffect)(()=>()=>{document.title="".concat(s.env.NEXT_PUBLIC_APP_NAME||"")},[]),null}},90837:function(e,t,r){"use strict";r.d(t,{$N:function(){return x},Be:function(){return v},GG:function(){return u},Vq:function(){return o},cN:function(){return h},cZ:function(){return p},fK:function(){return m},hg:function(){return c}});var a=r(57437),s=r(2265),n=r(13304),i=r(74697),l=r(37440);let o=n.fC,c=n.xz,d=n.h_,u=n.x8,f=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)(n.aV,{ref:t,className:(0,l.cn)("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",r),...s})});f.displayName=n.aV.displayName;let p=s.forwardRef((e,t)=>{let{className:r,children:s,hideCloseButton:o,...c}=e;return(0,a.jsxs)(d,{children:[(0,a.jsx)(f,{}),(0,a.jsxs)(n.VY,{ref:t,className:(0,l.cn)("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",r),...c,children:[s,!0!==o&&(0,a.jsxs)(n.x8,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",children:[(0,a.jsx)(i.Z,{className:"h-4 w-4"}),(0,a.jsx)("span",{className:"sr-only",children:"Close"})]})]})]})});p.displayName=n.VY.displayName;let m=e=>{let{className:t,...r}=e;return(0,a.jsx)("div",{className:(0,l.cn)("flex flex-col space-y-1.5 text-center sm:text-left",t),...r})};m.displayName="DialogHeader";let h=e=>{let{className:t,...r}=e;return(0,a.jsx)("div",{className:(0,l.cn)("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",t),...r})};h.displayName="DialogFooter";let x=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)(n.Dx,{ref:t,className:(0,l.cn)("text-lg font-semibold leading-none tracking-tight",r),...s})});x.displayName=n.Dx.displayName;let v=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)(n.dk,{ref:t,className:(0,l.cn)("text-sm text-muted-foreground",r),...s})});v.displayName=n.dk.displayName},67135:function(e,t,r){"use strict";r.d(t,{_:function(){return c}});var a=r(57437),s=r(2265),n=r(38364),i=r(12218),l=r(37440);let o=(0,i.j)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),c=s.forwardRef((e,t)=>{let{className:r,secondary:s,error:i,...c}=e;return(0,a.jsx)(n.f,{ref:t,className:(0,l.cn)(o(),s&&"text-xs",i?"text-danger":"",r),...c})});c.displayName=n.f.displayName},46294:function(e,t,r){"use strict";r.d(t,{Bw:function(){return x},DI:function(){return u},Ph:function(){return d},Ql:function(){return g},i4:function(){return p},ki:function(){return f},n5:function(){return v}});var a=r(57437),s=r(2265),n=r(48297),i=r(42421),l=r(14392),o=r(22468),c=r(37440);let d=n.fC,u=n.ZA,f=n.B4,p=s.forwardRef((e,t)=>{let{className:r,children:s,error:l,...o}=e;return(0,a.jsxs)(n.xz,{ref:t,className:(0,c.cn)("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",l&&"border-danger",r),...o,children:[s,(0,a.jsx)(n.JO,{asChild:!0,children:(0,a.jsx)(i.Z,{className:"h-4 w-4 opacity-50"})})]})});p.displayName=n.xz.displayName;let m=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)(n.u_,{ref:t,className:(0,c.cn)("flex cursor-default items-center justify-center py-1",r),...s,children:(0,a.jsx)(l.Z,{className:"h-4 w-4"})})});m.displayName=n.u_.displayName;let h=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)(n.$G,{ref:t,className:(0,c.cn)("flex cursor-default items-center justify-center py-1",r),...s,children:(0,a.jsx)(i.Z,{className:"h-4 w-4"})})});h.displayName=n.$G.displayName;let x=s.forwardRef((e,t)=>{let{className:r,children:s,position:i="popper",...l}=e;return(0,a.jsx)(n.h_,{children:(0,a.jsxs)(n.VY,{ref:t,className:(0,c.cn)("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2","popper"===i&&"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",r),position:i,...l,children:[(0,a.jsx)(m,{}),(0,a.jsx)(n.l_,{className:(0,c.cn)("p-1","popper"===i&&"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),children:s}),(0,a.jsx)(h,{})]})})});x.displayName=n.VY.displayName;let v=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)(n.__,{ref:t,className:(0,c.cn)("py-1.5 pl-8 pr-2 text-sm font-semibold",r),...s})});v.displayName=n.__.displayName;let g=s.forwardRef((e,t)=>{let{className:r,children:s,...i}=e;return(0,a.jsxs)(n.ck,{ref:t,className:(0,c.cn)("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",r),...i,children:[(0,a.jsx)("span",{className:"absolute left-2 flex h-3.5 w-3.5 items-center justify-center",children:(0,a.jsx)(n.wU,{children:(0,a.jsx)(o.Z,{className:"h-4 w-4"})})}),(0,a.jsx)(n.eT,{children:s})]})});g.displayName=n.ck.displayName,s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)(n.Z0,{ref:t,className:(0,c.cn)("-mx-1 my-1 h-px bg-muted",r),...s})}).displayName=n.Z0.displayName},85273:function(e,t,r){"use strict";r.d(t,{SP:function(){return c},dr:function(){return o},mQ:function(){return l},nU:function(){return d}});var a=r(57437),s=r(2265),n=r(62447),i=r(37440);let l=n.fC,o=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)(n.aV,{ref:t,className:(0,i.cn)("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",r),...s})});o.displayName=n.aV.displayName;let c=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)(n.xz,{ref:t,className:(0,i.cn)("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",r),...s})});c.displayName=n.xz.displayName;let d=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)(n.VY,{ref:t,className:(0,i.cn)("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",r),...s})});d.displayName=n.VY.displayName},17647:function(e,t,r){"use strict";r.d(t,{AppContextProvider:function(){return v},b:function(){return x}});var a=r(57437),s=r(2265),n=r(79512),i=r(16463),l=r(23314),o=r(44785);let c=o.Z.get,d=o.Z.set;o.Z.remove;var u={get:c,set:d};function f(){let e=u.get("mode");return e||(e="view",u.set("mode",e,{expires:31536e7})),e}var p=r(7752),m=r(58502);let h=(0,s.createContext)(null),x=()=>(0,s.useContext)(h);function v(e){let{children:t,...r}=e,o=function(e){(0,i.useRouter)();let{isAdmin:t,isSuperUser:r,sys:a}=e,{setTheme:l}=(0,n.F)();(0,s.useEffect)(()=>{"yes"===a.data.hide_theme_toggle&&l("light")},[a]);let o=(0,s.useCallback)(()=>(t||r?f():"view")||"view",[r,t]),[c,d]=(0,s.useState)(o()),m=!t&&!r||"view"===c,h=(0,s.useCallback)(function(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];let a=function(e){return u.set("mode",e,{expires:31536e7}),f()}(...t);return p.Z.emit("mode_changed",o()),d(o()),a},[o]),x=(0,s.useCallback)(()=>{d(o())},[o]);return{...e,mode:c,viewOnly:m,onModeChange:x,getMode:f,setMode:h}}(r),[c,d]=(0,s.useState)(!1);return((0,l.Z)(()=>{d(!0)}),c)?(0,a.jsxs)(h.Provider,{value:o,children:[t,(0,a.jsx)(m.SocketEventsListener,{events:[{name:"mode_changed",onEvent:{callback:o.onModeChange}}]})]}):null}},15701:function(e,t,r){"use strict";r.d(t,{ScriptsContextProvider:function(){return d},h:function(){return c}});var a=r(57437),s=r(2265),n=r(16463),i=r(12491),l=r(23733);let o=(0,s.createContext)(null),c=()=>(0,s.useContext)(o);function d(e){let{children:t,...r}=e,c=function(e){let{}=e,t=(0,n.useRouter)(),{scriptId:r}=(0,n.useParams)(),{parsed:a}=(0,l.l)(),o=(0,s.useCallback)(()=>{t.push("/")},[t]),c=(0,s.useCallback)(()=>{t.push("/script/".concat(r,"?").concat(i.Z.stringify({...a,section:"screens"})))},[t,a,r]);return{onCancelDiagnosisForm:(0,s.useCallback)(()=>{t.push("/script/".concat(r,"?").concat(i.Z.stringify({...a,section:"diagnoses"})))},[t,a,r]),onCancelScreenForm:c,onCancelScriptForm:o}}(r);return(0,a.jsx)(o.Provider,{value:{...r,...c},children:t})}},53699:function(e,t,r){"use strict";r.d(t,{s:function(){return n}});var a=r(39099);let s={title:"",message:"",buttonLabel:"Ok",variant:"info",onClose:void 0},n=(0,a.Ue)(e=>({isOpen:!1,...s,alert:t=>e({isOpen:!0,...s,...t}),close:()=>e({isOpen:!1,onClose:void 0,...s})}))},76230:function(e,t,r){"use strict";r.d(t,{t:function(){return n}});var a=r(39099);let s={danger:!1,title:"Confirm",message:"Are you sure?",positiveLabel:"Ok",negativeLabel:"Cancel"},n=(0,a.Ue)(e=>({isOpen:!1,...s,confirm:(t,r)=>e({isOpen:!0,...s,...r,onConfirm:t}),close:()=>e({isOpen:!1,onConfirm:void 0,...s})}))},7752:function(e,t,r){"use strict";var a=r(34999),s=r(20357);let n=(0,a.io)(s.env.NEXT_PUBLIC_APP_URL);t.Z=n},80042:function(e,t,r){"use strict";var a=r(85786),s={"text/plain":"Text","text/html":"Url",default:"Text"};e.exports=function(e,t){var r,n,i,l,o,c,d,u,f=!1;t||(t={}),i=t.debug||!1;try{if(o=a(),c=document.createRange(),d=document.getSelection(),(u=document.createElement("span")).textContent=e,u.ariaHidden="true",u.style.all="unset",u.style.position="fixed",u.style.top=0,u.style.clip="rect(0, 0, 0, 0)",u.style.whiteSpace="pre",u.style.webkitUserSelect="text",u.style.MozUserSelect="text",u.style.msUserSelect="text",u.style.userSelect="text",u.addEventListener("copy",function(r){if(r.stopPropagation(),t.format){if(r.preventDefault(),void 0===r.clipboardData){i&&console.warn("unable to use e.clipboardData"),i&&console.warn("trying IE specific stuff"),window.clipboardData.clearData();var a=s[t.format]||s.default;window.clipboardData.setData(a,e)}else r.clipboardData.clearData(),r.clipboardData.setData(t.format,e)}t.onCopy&&(r.preventDefault(),t.onCopy(r.clipboardData))}),document.body.appendChild(u),c.selectNodeContents(u),d.addRange(c),!document.execCommand("copy"))throw Error("copy command was unsuccessful");f=!0}catch(a){i&&console.error("unable to copy using execCommand: ",a),i&&console.warn("trying IE specific stuff");try{window.clipboardData.setData(t.format||"text",e),t.onCopy&&t.onCopy(window.clipboardData),f=!0}catch(a){i&&console.error("unable to copy using clipboardData: ",a),i&&console.error("falling back to prompt"),r="message"in t?t.message:"Copy to clipboard: #{key}, Enter",n=(/mac os x/i.test(navigator.userAgent)?"⌘":"Ctrl")+"+C",l=r.replace(/#{\s*key\s*}/g,n),window.prompt(l,e)}}finally{d&&("function"==typeof d.removeRange?d.removeRange(c):d.removeAllRanges()),u&&document.body.removeChild(u),o()}return f}},6884:function(e,t,r){"use strict";r.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r(78030).Z)("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},23787:function(e,t,r){"use strict";r.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r(78030).Z)("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]])},75733:function(e,t,r){"use strict";r.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r(78030).Z)("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},92513:function(e,t,r){"use strict";r.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r(78030).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},6649:function(e,t,r){"use strict";r.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r(78030).Z)("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]])},58184:function(e,t,r){"use strict";r.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r(78030).Z)("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]])},87138:function(e,t,r){"use strict";r.d(t,{default:function(){return s.a}});var a=r(231),s=r.n(a)},85786:function(e){e.exports=function(){var e=document.getSelection();if(!e.rangeCount)return function(){};for(var t=document.activeElement,r=[],a=0;a<e.rangeCount;a++)r.push(e.getRangeAt(a));switch(t.tagName.toUpperCase()){case"INPUT":case"TEXTAREA":t.blur();break;default:t=null}return e.removeAllRanges(),function(){"Caret"===e.type&&e.removeAllRanges(),e.rangeCount||r.forEach(function(t){e.addRange(t)}),t&&t.focus()}}},62447:function(e,t,r){"use strict";r.d(t,{VY:function(){return R},aV:function(){return D},fC:function(){return S},xz:function(){return Z}});var a=r(2265),s=r(78149),n=r(98324),i=r(53398),l=r(31383),o=r(25171),c=r(87513),d=r(91715),u=r(53201),f=r(57437),p="Tabs",[m,h]=(0,n.b)(p,[i.Pc]),x=(0,i.Pc)(),[v,g]=m(p),y=a.forwardRef((e,t)=>{let{__scopeTabs:r,value:a,onValueChange:s,defaultValue:n,orientation:i="horizontal",dir:l,activationMode:p="automatic",...m}=e,h=(0,c.gm)(l),[x,g]=(0,d.T)({prop:a,onChange:s,defaultProp:n});return(0,f.jsx)(v,{scope:r,baseId:(0,u.M)(),value:x,onValueChange:g,orientation:i,dir:h,activationMode:p,children:(0,f.jsx)(o.WV.div,{dir:h,"data-orientation":i,...m,ref:t})})});y.displayName=p;var j="TabsList",b=a.forwardRef((e,t)=>{let{__scopeTabs:r,loop:a=!0,...s}=e,n=g(j,r),l=x(r);return(0,f.jsx)(i.fC,{asChild:!0,...l,orientation:n.orientation,dir:n.dir,loop:a,children:(0,f.jsx)(o.WV.div,{role:"tablist","aria-orientation":n.orientation,...s,ref:t})})});b.displayName=j;var w="TabsTrigger",N=a.forwardRef((e,t)=>{let{__scopeTabs:r,value:a,disabled:n=!1,...l}=e,c=g(w,r),d=x(r),u=I(c.baseId,a),p=E(c.baseId,a),m=a===c.value;return(0,f.jsx)(i.ck,{asChild:!0,...d,focusable:!n,active:m,children:(0,f.jsx)(o.WV.button,{type:"button",role:"tab","aria-selected":m,"aria-controls":p,"data-state":m?"active":"inactive","data-disabled":n?"":void 0,disabled:n,id:u,...l,ref:t,onMouseDown:(0,s.M)(e.onMouseDown,e=>{n||0!==e.button||!1!==e.ctrlKey?e.preventDefault():c.onValueChange(a)}),onKeyDown:(0,s.M)(e.onKeyDown,e=>{[" ","Enter"].includes(e.key)&&c.onValueChange(a)}),onFocus:(0,s.M)(e.onFocus,()=>{let e="manual"!==c.activationMode;m||n||!e||c.onValueChange(a)})})})});N.displayName=w;var C="TabsContent",k=a.forwardRef((e,t)=>{let{__scopeTabs:r,value:s,forceMount:n,children:i,...c}=e,d=g(C,r),u=I(d.baseId,s),p=E(d.baseId,s),m=s===d.value,h=a.useRef(m);return a.useEffect(()=>{let e=requestAnimationFrame(()=>h.current=!1);return()=>cancelAnimationFrame(e)},[]),(0,f.jsx)(l.z,{present:n||m,children:r=>{let{present:a}=r;return(0,f.jsx)(o.WV.div,{"data-state":m?"active":"inactive","data-orientation":d.orientation,role:"tabpanel","aria-labelledby":u,hidden:!a,id:p,tabIndex:0,...c,ref:t,style:{...e.style,animationDuration:h.current?"0s":void 0},children:a&&i})}})});function I(e,t){return"".concat(e,"-trigger-").concat(t)}function E(e,t){return"".concat(e,"-content-").concat(t)}k.displayName=C;var S=y,D=b,Z=N,R=k}},function(e){e.O(0,[4868,4900,5176,9554,7776,9343,1072,231,6300,8472,1682,220,8972,6942,7478,7023,1744],function(){return e(e.s=38261)}),_N_E=e.O()}]);