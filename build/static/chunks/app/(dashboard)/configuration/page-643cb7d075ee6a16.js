(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9851],{94934:function(e,t,n){Promise.resolve().then(n.bind(n,65233)),Promise.resolve().then(n.bind(n,25704)),Promise.resolve().then(n.bind(n,24989))},65233:function(e,t,n){"use strict";n.d(t,{ConfigKeysTable:function(){return E}});var a=n(57437),r=n(75944),s=n(24989),o=n(39661),i=n(37440),l=n(53453),c=n(90399),d=n(50495),u=n(17501);function m(){let{selected:e,configKeys:t,onDelete:n}=(0,s.u)();if(!e.length)return null;let r=t.data.filter((t,n)=>e.includes(n)).map(e=>e.configKeyId);return(0,a.jsx)(a.Fragment,{children:!!e.length&&(0,a.jsx)(u.h,{children:(0,a.jsxs)(d.z,{variant:"destructive",className:"h-auto w-auto",onClick:()=>n(r),children:[(0,a.jsx)(c.Z,{className:"h-4 w-4 mr-1"}),(0,a.jsx)("span",{children:e.length>1?"Delete ".concat(e.length):"Delete"})]})})})}var f=n(45188),h=n(6649),x=n(75733),y=n(46910);function g(e){let{item:t}=e,{disabled:n,onDelete:r,setActiveItemId:o}=(0,s.u)();return(0,a.jsx)(a.Fragment,{children:(0,a.jsxs)(y.h_,{children:[(0,a.jsx)(y.$F,{asChild:!0,children:(0,a.jsx)(d.z,{variant:"ghost",size:"icon",className:"p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent",children:(0,a.jsx)(f.Z,{className:"h-4 w-4"})})}),(0,a.jsxs)(y.AW,{children:[(0,a.jsx)(y.Xi,{onClick:()=>o(t.configKeyId),children:n?(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(x.Z,{className:"mr-2 h-4 w-4"})," View"]}):(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(h.Z,{className:"mr-2 h-4 w-4"})," Edit"]})}),!n&&(0,a.jsxs)(y.Xi,{onClick:()=>r([t.configKeyId]),className:"text-danger focus:bg-danger focus:text-danger-foreground",children:[(0,a.jsx)(c.Z,{className:"mr-2 h-4 w-4"}),(0,a.jsx)("span",{children:"Delete"})]})]})]})})}var p=n(2265),v=n(92513),b=n(39343),j=n(20920),k=n(83102),w=n(67135),N=n(95317);function C(e){let{formData:t}=e,{disabled:n,onSave:r}=(0,s.u)(),{register:o,handleSubmit:i}=(0,b.cI)({defaultValues:{key:(null==t?void 0:t.key)||"",label:(null==t?void 0:t.label)||"",configKeyId:(null==t?void 0:t.configKeyId)||(0,j.Z)(),summary:(null==t?void 0:t.summary)||""}}),l=i(e=>r([e]));return(0,a.jsx)(a.Fragment,{children:(0,a.jsxs)(N.ue,{hideCloseButton:!0,side:"right",className:"p-0 m-0 flex flex-col",children:[(0,a.jsxs)(N.Tu,{className:"py-4 px-4 border-b border-b-border",children:[(0,a.jsx)(N.bC,{children:"".concat(t?"Update":"Add"," template")}),(0,a.jsx)(N.Ei,{className:"hidden"})]}),(0,a.jsxs)("div",{className:"flex-1 flex flex-col py-2 px-4 gap-y-4 overflow-y-auto",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)(w._,{htmlFor:"key",children:"Key *"}),(0,a.jsx)(k.I,{...o("key",{disabled:n,required:!0})})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(w._,{htmlFor:"label",children:"Label *"}),(0,a.jsx)(k.I,{...o("label",{disabled:n,required:!0})})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)(w._,{htmlFor:"summary",children:"Summary"}),(0,a.jsx)(k.I,{...o("summary",{disabled:n})})]})]}),(0,a.jsxs)(N.FF,{className:"border-t border-t-border px-4 py-2 gap-x-2",children:[(0,a.jsx)("div",{className:"flex-1"}),(0,a.jsx)(N.sw,{asChild:!0,children:(0,a.jsx)(d.z,{variant:"ghost",children:"Cancel"})}),(0,a.jsx)(d.z,{onClick:()=>l(),children:"Save"})]})]})})}function S(e){let{formData:t,open:n}=e,{disabled:r,isFormOpen:o,onFormOpenChange:i}=(0,s.u)(),l=(0,p.useMemo)(()=>n||o,[n,o]);return(0,a.jsx)(a.Fragment,{children:(0,a.jsxs)(N.yo,{open:l,onOpenChange:e=>{i(e)},children:[!t&&!r&&(0,a.jsx)(N.aM,{asChild:!0,children:(0,a.jsx)(d.z,{size:"icon",className:"rounded-full w-12 h-12",children:(0,a.jsx)(v.Z,{className:"h-6 w-6"})})}),l&&(0,a.jsx)(C,{...e})]})})}function E(){let{sys:e,viewOnly:t}=(0,l.b)(),{disabled:n,loading:c,selected:d,configKeys:u,activeItem:f,setSelected:h,onSort:x}=(0,s.u)();return(0,a.jsxs)(a.Fragment,{children:[c&&(0,a.jsx)(o.a,{overlay:!0}),(0,a.jsx)("div",{className:"",children:(0,a.jsx)(r.DataTable,{selectedIndexes:d,onSelect:h,title:"Configuration",selectable:!n,sortable:!n,loading:c,maxRows:25,onSort:x,getRowOptions:e=>{let{rowIndex:n}=e,a=u.data[n];return a?{className:(0,i.cn)(!t&&a.isDraft&&"bg-danger/20 hover:bg-danger/30")}:{}},search:{inputPlaceholder:"Search config keys"},noDataMessage:(0,a.jsxs)("div",{className:"mt-4 flex flex-col items-center justify-center gap-y-2",children:[(0,a.jsx)("div",{children:"No config keys saved. To add settings, click:"}),(0,a.jsx)(S,{})]}),columns:[{name:"Position",cellRenderer(e){let{rowIndex:t}=e;return t+1}},{name:"Key"},{name:"Label"},{name:"Description"},{name:"Version",align:"right",cellClassName:(0,i.cn)("min-w-10","yes"===e.data.hide_data_table_version&&"hidden"),cellRenderer(e){let t=u.data[e.rowIndex];if(!t)return null;let n=t.isDraft?Math.max(0,t.version-1):t.version;return(0,a.jsxs)("div",{className:"inline-flex items-center gap-x-[2px]",children:[(0,a.jsx)("div",{className:(0,i.cn)("w-2 h-2 rounded-full",n?"bg-green-400":"bg-gray-300")}),(0,a.jsx)("span",{children:n||t.version}),!!n&&t.version!==n&&(0,a.jsxs)("span",{children:["(Draft v",t.version,")"]})]})}},{name:"Action",align:"right",cellClassName:"w-10",cellRenderer(e){let{rowIndex:t}=e,n=u.data[t];return n?(0,a.jsx)(g,{item:n}):null}}],data:u.data.map(e=>[e.position,e.key||"",e.label||"",e.summary||"",e.version,""])})}),!!u.data.length&&(0,a.jsx)("div",{className:"fixed bottom-5 right-10",children:(0,a.jsx)(S,{})}),!!f&&(0,a.jsx)(S,{formData:f,open:!0}),(0,a.jsx)(m,{})]})}},17501:function(e,t,n){"use strict";n.d(t,{h:function(){return o}});var a=n(57437),r=n(77606),s=n(37440);function o(e){let{children:t,className:n}=e;return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("div",{className:"h-16"}),(0,a.jsx)("div",{className:(0,s.cn)("\n                        fixed \n                        left-0 \n                        bottom-0 \n                        h-16 \n                        w-full \n                        border-t \n                        border-t-border \n                        z-[1] \n                        bg-primary-foreground \n                        dark:bg-background \n                        shadow-md \n                        dark:shadow-foreground/10\n                    "),children:(0,a.jsx)(r.V,{children:(0,a.jsx)("div",{className:(0,s.cn)("flex justify-end gap-x-4",n),children:t})})})]})}},77606:function(e,t,n){"use strict";n.d(t,{V:function(){return s}});var a=n(57437),r=n(37440);function s(e){let{className:t,...n}=e;return(0,a.jsx)("div",{...n,className:(0,r.cn)("w-full max-w-screen-xl mx-auto p-5",t)})}},39661:function(e,t,n){"use strict";n.d(t,{a:function(){return s}});var a=n(57437),r=n(89627);function s(e){let{overlay:t,transparent:n}=e;return(0,a.jsx)(a.Fragment,{children:(0,a.jsx)("div",{style:{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",...t?{height:"100%",position:"fixed",top:0,left:0,bottom:0,zIndex:999,backgroundColor:n?"transparent":"rgba(255,255,255,.6)"}:{padding:"50px 0"}},children:(0,a.jsx)(r.Z,{style:{height:24,width:24},className:"animate-spin"})})})}},25704:function(e,t,n){"use strict";n.r(t),n.d(t,{Title:function(){return s}});var a=n(2265),r=n(20357);function s(e){let{children:t}=e;return(0,a.useEffect)(()=>{document.title=[r.env.NEXT_PUBLIC_APP_NAME,t].filter(e=>e).join(" - ")},[t]),(0,a.useEffect)(()=>()=>{document.title="".concat(r.env.NEXT_PUBLIC_APP_NAME)},[]),null}},67135:function(e,t,n){"use strict";n.d(t,{_:function(){return c}});var a=n(57437),r=n(2265),s=n(38364),o=n(12218),i=n(37440);let l=(0,o.j)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),c=r.forwardRef((e,t)=>{let{className:n,secondary:r,error:o,...c}=e;return(0,a.jsx)(s.f,{ref:t,className:(0,i.cn)(l(),r&&"text-xs",o?"text-danger":"",n),...c})});c.displayName=s.f.displayName},95317:function(e,t,n){"use strict";n.d(t,{Ei:function(){return v},FF:function(){return g},Tu:function(){return y},aM:function(){return d},bC:function(){return p},sw:function(){return u},ue:function(){return x},yo:function(){return c}});var a=n(57437),r=n(2265),s=n(13304),o=n(12218),i=n(74697),l=n(37440);let c=s.fC,d=s.xz,u=s.x8,m=s.h_,f=r.forwardRef((e,t)=>{let{className:n,...r}=e;return(0,a.jsx)(s.aV,{className:(0,l.cn)("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",n),...r,ref:t})});f.displayName=s.aV.displayName;let h=(0,o.j)("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",{variants:{side:{top:"inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",bottom:"inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",left:"inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",right:"inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"}},defaultVariants:{side:"right"}}),x=r.forwardRef((e,t)=>{let{side:n="right",className:r,children:o,hideCloseButton:c,...d}=e;return(0,a.jsxs)(m,{children:[(0,a.jsx)(f,{}),(0,a.jsxs)(s.VY,{ref:t,className:(0,l.cn)(h({side:n}),r),...d,children:[o,!0!==c&&(0,a.jsxs)(s.x8,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",children:[(0,a.jsx)(i.Z,{className:"h-4 w-4"}),(0,a.jsx)("span",{className:"sr-only",children:"Close"})]})]})]})});x.displayName=s.VY.displayName;let y=e=>{let{className:t,...n}=e;return(0,a.jsx)("div",{className:(0,l.cn)("flex flex-col space-y-2 text-center sm:text-left",t),...n})};y.displayName="SheetHeader";let g=e=>{let{className:t,...n}=e;return(0,a.jsx)("div",{className:(0,l.cn)("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",t),...n})};g.displayName="SheetFooter";let p=r.forwardRef((e,t)=>{let{className:n,...r}=e;return(0,a.jsx)(s.Dx,{ref:t,className:(0,l.cn)("text-lg font-semibold text-foreground",n),...r})});p.displayName=s.Dx.displayName;let v=r.forwardRef((e,t)=>{let{className:n,...r}=e;return(0,a.jsx)(s.dk,{ref:t,className:(0,l.cn)("text-sm text-muted-foreground",n),...r})});v.displayName=s.dk.displayName},53453:function(e,t,n){"use strict";n.d(t,{AppContextProvider:function(){return l},b:function(){return i}});var a=n(57437),r=n(2265),s=n(79512);let o=(0,r.createContext)(null),i=()=>(0,r.useContext)(o);function l(e){let{children:t,...n}=e,{isAdmin:i,isSuperUser:l,mode:c,sys:d}=n,{setTheme:u}=(0,s.F)();(0,r.useEffect)(()=>{"yes"===d.data.hide_theme_toggle&&u("light")},[d]);let m={...n,viewOnly:!i&&!l||"view"===c};return(0,a.jsx)(o.Provider,{value:m,children:t})}},24989:function(e,t,n){"use strict";n.d(t,{ConfigKeysContextProvider:function(){return m},u:function(){return u}});var a=n(57437),r=n(2265),s=n(16463),o=n(12599),i=n(53699),l=n(76230),c=n(53453);let d=(0,r.createContext)(null),u=()=>(0,r.useContext)(d);function m(e){let{children:t,...n}=e,u=function(e){let{configKeys:t,saveConfigKeys:n,deleteConfigKeys:a}=e,d=(0,s.useRouter)(),{viewOnly:u}=(0,c.b)(),[m,f]=(0,r.useState)(t),[h,x]=(0,r.useState)(),[y,g]=(0,r.useState)(!1),[p,v]=(0,r.useState)(!1),[b,j]=(0,r.useState)(!1),[k,w]=(0,r.useState)([]),{alert:N}=(0,i.s)(),{confirm:C}=(0,l.t)();(0,r.useEffect)(()=>{f(t)},[t]);let S=(0,r.useCallback)(e=>{e&&h||g(e),e||x(void 0)},[h]),E=(0,r.useCallback)(async e=>{var t;v(!0);let a=await n({data:e,broadcastAction:!0});(null===(t=a.errors)||void 0===t?void 0:t.length)?N({title:"Error",message:a.errors.join(", "),variant:"error"}):(S(!1),d.refresh(),N({title:"Success",message:"Config keys saved successfully!",variant:"success"})),v(!1)},[n,N,S,d]),I=(0,r.useCallback)(async e=>{C(async()=>{var t;let n={...m};f(t=>({...t,data:t.data.filter(t=>!e.includes(t.configKeyId))})),w([]),j(!0);let r=await a({configKeysIds:e,broadcastAction:!0});(null===(t=r.errors)||void 0===t?void 0:t.length)?N({title:"Error",message:r.errors.join(", "),variant:"error",onClose:()=>f(n)}):(S(!1),w([]),d.refresh(),N({title:"Success",message:"Config keys deleted successfully!",variant:"success"})),j(!1)},{danger:!0,title:"Delete config keys",message:"Are you sure you want to delete config keys?",positiveLabel:"Yes, delete"})},[a,C,N,d,m]),M=(0,r.useCallback)(async(e,t)=>{let a=(0,o.q)([...m.data],e,t),r=[];a.forEach((e,t)=>{if(m.data[t].position!==e.position){let n=t+1;r.push({configKeyId:e.configKeyId,position:n}),a[t].position=n}}),f(e=>({...e,data:a})),await n({data:r,broadcastAction:!0})},[n,N]),T=(0,r.useMemo)(()=>h?m.data.filter(e=>e.configKeyId===h)[0]:null,[h,m]);return{saving:p,isFormOpen:y,activeItemId:h,loading:b,selected:k,configKeys:m,activeItem:T,disabled:(0,r.useMemo)(()=>u,[u]),onSort:M,setConfigKeys:f,setSelected:w,setLoading:j,setActiveItemId:x,setSaving:v,onFormOpenChange:S,onSave:E,onDelete:I}}(n);return(0,a.jsx)(d.Provider,{value:{...n,...u},children:t})}},53699:function(e,t,n){"use strict";n.d(t,{s:function(){return s}});var a=n(39099);let r={title:"",message:"",buttonLabel:"Ok",variant:"info",onClose:void 0},s=(0,a.Ue)(e=>({isOpen:!1,...r,alert:t=>e({isOpen:!0,...r,...t}),close:()=>e({isOpen:!1,onClose:void 0,...r})}))},76230:function(e,t,n){"use strict";n.d(t,{t:function(){return s}});var a=n(39099);let r={danger:!1,title:"Confirm",message:"Are you sure?",positiveLabel:"Ok",negativeLabel:"Cancel"},s=(0,a.Ue)(e=>({isOpen:!1,...r,confirm:(t,n)=>e({isOpen:!0,...r,...n,onConfirm:t}),close:()=>e({isOpen:!1,onConfirm:void 0,...r})}))},45188:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(78030).Z)("EllipsisVertical",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"12",cy:"5",r:"1",key:"gxeob9"}],["circle",{cx:"12",cy:"19",r:"1",key:"lyex9k"}]])},75733:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(78030).Z)("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},89627:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(78030).Z)("Loader",[["path",{d:"M12 2v4",key:"3427ic"}],["path",{d:"m16.2 7.8 2.9-2.9",key:"r700ao"}],["path",{d:"M18 12h4",key:"wj9ykh"}],["path",{d:"m16.2 16.2 2.9 2.9",key:"1bxg5t"}],["path",{d:"M12 18v4",key:"jadmvz"}],["path",{d:"m4.9 19.1 2.9-2.9",key:"bwix9q"}],["path",{d:"M2 12h4",key:"j09sii"}],["path",{d:"m4.9 4.9 2.9 2.9",key:"giyufr"}]])},92513:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(78030).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},6649:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(78030).Z)("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]])},90399:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(78030).Z)("Trash",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}]])},74697:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(78030).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},20920:function(e,t,n){"use strict";n.d(t,{Z:function(){return l}});for(var a,r={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)},s=new Uint8Array(16),o=[],i=0;i<256;++i)o.push((i+256).toString(16).slice(1));var l=function(e,t,n){if(r.randomUUID&&!t&&!e)return r.randomUUID();var i=(e=e||{}).random||(e.rng||function(){if(!a&&!(a="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)))throw Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return a(s)})();if(i[6]=15&i[6]|64,i[8]=63&i[8]|128,t){n=n||0;for(var l=0;l<16;++l)t[n+l]=i[l];return t}return function(e,t=0){return(o[e[t+0]]+o[e[t+1]]+o[e[t+2]]+o[e[t+3]]+"-"+o[e[t+4]]+o[e[t+5]]+"-"+o[e[t+6]]+o[e[t+7]]+"-"+o[e[t+8]]+o[e[t+9]]+"-"+o[e[t+10]]+o[e[t+11]]+o[e[t+12]]+o[e[t+13]]+o[e[t+14]]+o[e[t+15]]).toLowerCase()}(i)}},38364:function(e,t,n){"use strict";n.d(t,{f:function(){return i}});var a=n(2265),r=n(25171),s=n(57437),o=a.forwardRef((e,t)=>(0,s.jsx)(r.WV.label,{...e,ref:t,onMouseDown:t=>{var n;t.target.closest("button, input, select, textarea")||(null===(n=e.onMouseDown)||void 0===n||n.call(e,t),!t.defaultPrevented&&t.detail>1&&t.preventDefault())}}));o.displayName="Label";var i=o},79512:function(e,t,n){"use strict";n.d(t,{F:function(){return c},f:function(){return d}});var a=n(2265),r=["light","dark"],s="(prefers-color-scheme: dark)",o="undefined"==typeof window,i=a.createContext(void 0),l={setTheme:e=>{},themes:[]},c=()=>{var e;return null!=(e=a.useContext(i))?e:l},d=e=>a.useContext(i)?e.children:a.createElement(m,{...e}),u=["light","dark"],m=e=>{let{forcedTheme:t,disableTransitionOnChange:n=!1,enableSystem:o=!0,enableColorScheme:l=!0,storageKey:c="theme",themes:d=u,defaultTheme:m=o?"system":"light",attribute:g="data-theme",value:p,children:v,nonce:b}=e,[j,k]=a.useState(()=>h(c,m)),[w,N]=a.useState(()=>h(c)),C=p?Object.values(p):d,S=a.useCallback(e=>{let t=e;if(!t)return;"system"===e&&o&&(t=y());let a=p?p[t]:t,s=n?x():null,i=document.documentElement;if("class"===g?(i.classList.remove(...C),a&&i.classList.add(a)):a?i.setAttribute(g,a):i.removeAttribute(g),l){let e=r.includes(m)?m:null,n=r.includes(t)?t:e;i.style.colorScheme=n}null==s||s()},[]),E=a.useCallback(e=>{let t="function"==typeof e?e(e):e;k(t);try{localStorage.setItem(c,t)}catch(e){}},[t]),I=a.useCallback(e=>{N(y(e)),"system"===j&&o&&!t&&S("system")},[j,t]);a.useEffect(()=>{let e=window.matchMedia(s);return e.addListener(I),I(e),()=>e.removeListener(I)},[I]),a.useEffect(()=>{let e=e=>{e.key===c&&E(e.newValue||m)};return window.addEventListener("storage",e),()=>window.removeEventListener("storage",e)},[E]),a.useEffect(()=>{S(null!=t?t:j)},[t,j]);let M=a.useMemo(()=>({theme:j,setTheme:E,forcedTheme:t,resolvedTheme:"system"===j?w:j,themes:o?[...d,"system"]:d,systemTheme:o?w:void 0}),[j,E,t,w,o,d]);return a.createElement(i.Provider,{value:M},a.createElement(f,{forcedTheme:t,disableTransitionOnChange:n,enableSystem:o,enableColorScheme:l,storageKey:c,themes:d,defaultTheme:m,attribute:g,value:p,children:v,attrs:C,nonce:b}),v)},f=a.memo(e=>{let{forcedTheme:t,storageKey:n,attribute:o,enableSystem:i,enableColorScheme:l,defaultTheme:c,value:d,attrs:u,nonce:m}=e,f="system"===c,h="class"===o?"var d=document.documentElement,c=d.classList;".concat("c.remove(".concat(u.map(e=>"'".concat(e,"'")).join(","),")"),";"):"var d=document.documentElement,n='".concat(o,"',s='setAttribute';"),x=l?(r.includes(c)?c:null)?"if(e==='light'||e==='dark'||!e)d.style.colorScheme=e||'".concat(c,"'"):"if(e==='light'||e==='dark')d.style.colorScheme=e":"",y=function(e){let t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=!(arguments.length>2)||void 0===arguments[2]||arguments[2],a=d?d[e]:e,s=t?e+"|| ''":"'".concat(a,"'"),i="";return l&&n&&!t&&r.includes(e)&&(i+="d.style.colorScheme = '".concat(e,"';")),"class"===o?t||a?i+="c.add(".concat(s,")"):i+="null":a&&(i+="d[s](n,".concat(s,")")),i},g=t?"!function(){".concat(h).concat(y(t),"}()"):i?"!function(){try{".concat(h,"var e=localStorage.getItem('").concat(n,"');if('system'===e||(!e&&").concat(f,")){var t='").concat(s,"',m=window.matchMedia(t);if(m.media!==t||m.matches){").concat(y("dark"),"}else{").concat(y("light"),"}}else if(e){").concat(d?"var x=".concat(JSON.stringify(d),";"):"").concat(y(d?"x[e]":"e",!0),"}").concat(f?"":"else{"+y(c,!1,!1)+"}").concat(x,"}catch(e){}}()"):"!function(){try{".concat(h,"var e=localStorage.getItem('").concat(n,"');if(e){").concat(d?"var x=".concat(JSON.stringify(d),";"):"").concat(y(d?"x[e]":"e",!0),"}else{").concat(y(c,!1,!1),";}").concat(x,"}catch(t){}}();");return a.createElement("script",{nonce:m,dangerouslySetInnerHTML:{__html:g}})}),h=(e,t)=>{let n;if(!o){try{n=localStorage.getItem(e)||void 0}catch(e){}return n||t}},x=()=>{let e=document.createElement("style");return e.appendChild(document.createTextNode("*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),document.head.appendChild(e),()=>{window.getComputedStyle(document.body),setTimeout(()=>{document.head.removeChild(e)},1)}},y=e=>(e||(e=window.matchMedia(s)),e.matches?"dark":"light")}},function(e){e.O(0,[4868,5360,8429,2592,9343,7946,1072,5007,5944,7478,7023,1744],function(){return e(e.s=94934)}),_N_E=e.O()}]);