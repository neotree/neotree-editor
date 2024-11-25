"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[932],{20021:function(e,t,n){n.d(t,{M:function(){return f}});var r=n(57437),a=n(92513),i=n(90399),l=n(5192),o=n(12491),s=n(50495),d=n(76230),u=n(77605),c=n(21475);function f(e){let{image:t,disabled:n,onChange:f}=e,h=(0,c.Y)(),[p,{width:m}]=(0,l.Z)(),{confirm:g}=(0,d.t)(),v="".concat((null==t?void 0:t.data)||"").split("?").filter((e,t)=>t).join(""),{width:y,height:w}=o.Z.parse(v);return(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)("div",{ref:p,className:"flex flex-col gap-y-2 min-w-60 max-w-60",children:[(0,r.jsx)("div",{className:"w-full flex flex-col items-center justify-center min-h-28",children:(0,r.jsx)(u.E,{alt:"",width:Number(y||"0"),height:Number(w||"0"),containerWidth:m,src:(null==t?void 0:t.data)||"/images/placeholder.png"})}),(0,r.jsxs)("div",{className:"flex items-center justify-center gap-x-4",children:[(0,r.jsx)(s.z,{size:"icon",className:"w-8 h-8 rounded-full",disabled:n,onClick:()=>h.openModal({onSelectFiles(e){let[t]=e;f({data:t.url,fileId:t.fileId,filename:t.filename,size:t.size,contentType:t.contentType})}}),children:(0,r.jsx)(a.Z,{className:"h-4 w-4"})}),!!t&&(0,r.jsx)(s.z,{variant:"destructive",size:"icon",className:"w-8 h-8 rounded-full",disabled:n,onClick:()=>g(()=>f(null),{title:"Delete image",message:"Are you sure you want to delete this image?",danger:!0}),children:(0,r.jsx)(i.Z,{className:"h-4 w-4"})})]})]})})}},95229:function(e,t,n){n.d(t,{Alert:function(){return l}});var r=n(53699),a=n(16463),i=n(2265);function l(e){let t=(0,a.useRouter)(),{alert:n}=(0,r.s)();return(0,i.useEffect)(()=>{let{redirectTo:r,onClose:a,...i}=e;n({...i,variant:i.variant||"error",buttonLabel:i.buttonLabel||"Ok",onClose:()=>{null==a||a(),r&&t.replace(r)}})},[n,t,e]),null}},77605:function(e,t,n){n.d(t,{E:function(){return i}});var r=n(57437),a=n(48625);function i(e){let{width:t=0,height:n=0,containerWidth:i,...l}=e;l.sizes;let o={width:"100%",height:"auto"};if(n&&t&&i){let e=(0,a.a)({imageWidth:t,imageHeight:n,containerWidth:i});o.width=e.imageWidth,o.height=e.imageHeight}return(0,r.jsx)("img",{...l,src:l.src,style:{...o,...l.style}})}},64344:function(e,t,n){n.d(t,{Z:function(){return o}});var r=n(57437),a=n(2265),i=n(48484),l=n(37440);let o=a.forwardRef((e,t)=>{let{className:n,orientation:a="horizontal",decorative:o=!0,...s}=e;return(0,r.jsx)(i.f,{ref:t,decorative:o,orientation:a,className:(0,l.cn)("shrink-0 bg-border","horizontal"===a?"h-[1px] w-full":"h-full w-[1px]",n),...s})});o.displayName=i.f.displayName},21475:function(e,t,n){n.d(t,{Y:function(){return i}});var r=n(39099),a=n(38472);let i=(0,r.Ue)((e,t)=>{let n=async n=>{try{let{reset:r,...i}={...n};r&&(i.page=1),e({loading:!0,unhandledErrors:[]});let{data:l,errors:o,totalPages:s,totalRows:d,page:u}=(await a.Z.get("/api/files?data=".concat(JSON.stringify({...i,limit:i.limit||t().limit,page:i.page||t().page})))).data;if(null==o?void 0:o.length)e({unhandledErrors:o});else{let n=r?l:[...t().files,...l];n=n.filter((e,t)=>t===n.map(e=>e.fileId).indexOf(e.fileId)),i.siteId&&i.siteId!==t().siteId&&(n=l),e({files:n,totalPages:s,totalRows:d,page:u,siteId:i.siteId||t().siteId,lastFilesQueryDate:l.length?new Date:null})}}catch(t){e({unhandledErrors:[t.message]})}finally{e({loading:!1})}};return{isModalOpen:!1,loading:!1,siteId:"",files:[],unhandledErrors:[],lastFilesQueryDate:null,page:1,limit:15,totalPages:1,totalRows:0,onSelectFiles:null,selectMultiple:!1,getFiles:n,openModal(r){e({onSelectFiles:(null==r?void 0:r.onSelectFiles)||null,isModalOpen:!0}),t().lastFilesQueryDate||n()},closeModal:()=>e({isModalOpen:!1})}})},48625:function(e,t,n){async function r(e){return new Promise((t,n)=>{let r=new Image;r.onload=function(){t({width:r.width,height:r.height})},r.onerror=function(e,t,r,a,i){n(i||Error("Failed to load image"))},r.src=e})}function a(e){let{imageWidth:t,imageHeight:n,containerWidth:r}=e;return t>r&&(n=r/t*n,t=r),{imageWidth:t,imageHeight:n}}n.d(t,{a:function(){return a},p:function(){return r}})},92513:function(e,t,n){n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(78030).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},6649:function(e,t,n){n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(78030).Z)("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]])},99497:function(e,t,n){n.d(t,{ck:function(){return W},fC:function(){return S},z$:function(){return A}});var r=n(2265),a=n(78149),i=n(1584),l=n(98324),o=n(25171),s=n(53398),d=n(91715),u=n(87513),c=n(75238),f=n(47250),h=n(31383),p=n(57437),m="Radio",[g,v]=(0,l.b)(m),[y,w]=g(m),x=r.forwardRef((e,t)=>{let{__scopeRadio:n,name:l,checked:s=!1,required:d,disabled:u,value:c="on",onCheck:f,...h}=e,[m,g]=r.useState(null),v=(0,i.e)(t,e=>g(e)),w=r.useRef(!1),x=!m||!!m.closest("form");return(0,p.jsxs)(y,{scope:n,checked:s,disabled:u,children:[(0,p.jsx)(o.WV.button,{type:"button",role:"radio","aria-checked":s,"data-state":E(s),"data-disabled":u?"":void 0,disabled:u,value:c,...h,ref:v,onClick:(0,a.M)(e.onClick,e=>{s||null==f||f(),x&&(w.current=e.isPropagationStopped(),w.current||e.stopPropagation())})}),x&&(0,p.jsx)(j,{control:m,bubbles:!w.current,name:l,value:c,checked:s,required:d,disabled:u,style:{transform:"translateX(-100%)"}})]})});x.displayName=m;var k="RadioIndicator",b=r.forwardRef((e,t)=>{let{__scopeRadio:n,forceMount:r,...a}=e,i=w(k,n);return(0,p.jsx)(h.z,{present:r||i.checked,children:(0,p.jsx)(o.WV.span,{"data-state":E(i.checked),"data-disabled":i.disabled?"":void 0,...a,ref:t})})});b.displayName=k;var j=e=>{let{control:t,checked:n,bubbles:a=!0,...i}=e,l=r.useRef(null),o=(0,f.D)(n),s=(0,c.t)(t);return r.useEffect(()=>{let e=l.current,t=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"checked").set;if(o!==n&&t){let r=new Event("click",{bubbles:a});t.call(e,n),e.dispatchEvent(r)}},[o,n,a]),(0,p.jsx)("input",{type:"radio","aria-hidden":!0,defaultChecked:n,...i,tabIndex:-1,ref:l,style:{...e.style,...s,position:"absolute",pointerEvents:"none",opacity:0,margin:0}})};function E(e){return e?"checked":"unchecked"}var N=["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"],R="RadioGroup",[I,C]=(0,l.b)(R,[s.Pc,v]),M=(0,s.Pc)(),z=v(),[F,D]=I(R),P=r.forwardRef((e,t)=>{let{__scopeRadioGroup:n,name:r,defaultValue:a,value:i,required:l=!1,disabled:c=!1,orientation:f,dir:h,loop:m=!0,onValueChange:g,...v}=e,y=M(n),w=(0,u.gm)(h),[x,k]=(0,d.T)({prop:i,defaultProp:a,onChange:g});return(0,p.jsx)(F,{scope:n,name:r,required:l,disabled:c,value:x,onValueChange:k,children:(0,p.jsx)(s.fC,{asChild:!0,...y,orientation:f,dir:w,loop:m,children:(0,p.jsx)(o.WV.div,{role:"radiogroup","aria-required":l,"aria-orientation":f,"data-disabled":c?"":void 0,dir:w,...v,ref:t})})})});P.displayName=R;var Z="RadioGroupItem",L=r.forwardRef((e,t)=>{let{__scopeRadioGroup:n,disabled:l,...o}=e,d=D(Z,n),u=d.disabled||l,c=M(n),f=z(n),h=r.useRef(null),m=(0,i.e)(t,h),g=d.value===o.value,v=r.useRef(!1);return r.useEffect(()=>{let e=e=>{N.includes(e.key)&&(v.current=!0)},t=()=>v.current=!1;return document.addEventListener("keydown",e),document.addEventListener("keyup",t),()=>{document.removeEventListener("keydown",e),document.removeEventListener("keyup",t)}},[]),(0,p.jsx)(s.ck,{asChild:!0,...c,focusable:!u,active:g,children:(0,p.jsx)(x,{disabled:u,required:d.required,checked:g,...f,...o,name:d.name,ref:m,onCheck:()=>d.onValueChange(o.value),onKeyDown:(0,a.M)(e=>{"Enter"===e.key&&e.preventDefault()}),onFocus:(0,a.M)(o.onFocus,()=>{var e;v.current&&(null===(e=h.current)||void 0===e||e.click())})})})});L.displayName=Z;var O=r.forwardRef((e,t)=>{let{__scopeRadioGroup:n,...r}=e,a=z(n);return(0,p.jsx)(b,{...a,...r,ref:t})});O.displayName="RadioGroupIndicator";var S=P,W=L,A=O}}]);