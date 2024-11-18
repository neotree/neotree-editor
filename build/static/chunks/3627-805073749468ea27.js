"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3627],{29439:function(e,t,n){n.d(t,{M:function(){return N}});var a=n(57437),l=n(2265),i=n(92513),r=n(90399),s=n(5192),d=n(12491),o=n(38472),c=n(50495),u=n(76230),h=n(20920),f=n(58184);/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let p=(0,n(78030).Z)("File",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}]]);var m=n(9704),g=n(37440),v=n(39661),y=n(53699);async function x(e){return new Promise((t,n)=>{let a=new Image;a.onload=function(){t({width:a.width,height:a.height})},a.onerror=function(e,t,a,l,i){n(i||Error("Failed to load image"))},a.src=e})}function j(e){let{width:t=0,height:n=0,containerWidth:l,...i}=e;i.sizes;let r={width:"100%",height:"auto"};if(n&&t&&l){let e=function(e){let{imageWidth:t,imageHeight:n,containerWidth:a}=e;return t>a&&(n=a/t*n,t=a),{imageWidth:t,imageHeight:n}}({imageWidth:t,imageHeight:n,containerWidth:l});r.width=e.imageWidth,r.height=e.imageHeight}return(0,a.jsx)("img",{...i,src:i.src,style:{...r,...i.style}})}function w(e){let{type:t,children:n,inputProps:i,fileDetails:r,onUpload:d,...o}=e,[u,{width:w}]=(0,s.Z)(),[k,b]=(0,l.useState)(!1),[C,N]=(0,l.useState)([]),[R,E]=(0,l.useState)(!1),{alert:Z}=(0,y.s)(),z=(0,l.useCallback)(async()=>{let e=(null==i?void 0:i.multiple)?C:[C[0]];try{for(let{file:t,metadata:n,fileId:a}of(E(!0),e)){let e=new FormData;e.append("file",t),e.append("fileId",a||(0,h.Z)()),e.append("filename",t.name),e.append("contentType",t.type),e.append("size","".concat(t.size)),e.append("metadata",JSON.stringify({...n})),r&&Object.keys(r).forEach(t=>{let n=r[t];e.append(t,JSON.stringify(n))}),await d(e)}b(!1),N([]),Z({title:"Success",message:"File".concat(e.length>1?"s":""," uploaded successfully!"),variant:"success"})}catch(t){Z({title:"Error",message:"Failed to upload file".concat(e.length>1?"s":"",": ").concat(t.message),variant:"error"})}finally{E(!1)}},[d,Z,C,null==i?void 0:i.multiple,r]),L=(0,l.useCallback)(async e=>{try{var t;let n=[];if(null===(t=e.target.files)||void 0===t?void 0:t.length)for(let t=0;t<e.target.files.length;t++)n.push(e.target.files[t]);let a=[];for(let e of n){let t,n;let l=URL.createObjectURL(e),i={};if("".concat(e.type).includes("image"))try{let e=await x(l);i={...i,...e},t=l}catch(e){}a.push({fileId:(0,h.Z)(),file:e,url:l,imageURL:t,videoURL:n,metadata:i})}N(a)}catch(e){Z({title:"Error",message:e.message})}},[Z]);return(0,a.jsxs)(a.Fragment,{children:[R&&(0,a.jsx)(v.a,{overlay:!0}),(0,a.jsx)(m.u,{open:k,onOpenChange:e=>{b(e),N([])},title:"Upload file",trigger:n,...o,actions:(0,a.jsxs)(a.Fragment,{children:[!C.length&&(0,a.jsx)("div",{className:"flex-1"}),(0,a.jsx)(c.z,{variant:"ghost",onClick:()=>b(!1),children:"Cancel"}),!!C.length&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("div",{className:"flex-1"}),(0,a.jsx)(c.z,{variant:"destructive",onClick:()=>N([]),children:"Clear"}),(0,a.jsxs)(c.z,{disabled:!C.length,onClick:()=>z(),className:(0,g.cn)(!C.length&&"hidden"),children:[(0,a.jsx)(f.Z,{className:"h-4 w-4 mr-2"}),(0,a.jsx)("span",{children:"Upload"})]})]})]}),children:(0,a.jsxs)("div",{ref:u,children:[1===C.length&&C.map(e=>{let t=(0,a.jsx)(p,{className:"w-20 h-20 text-muted-foreground"});return e.imageURL&&(t=(0,a.jsx)(j,{alt:"",width:e.metadata.width||0,height:e.metadata.height||0,containerWidth:w,src:e.imageURL||"/images/placeholder.png"})),(0,a.jsxs)("div",{className:(0,g.cn)("\n                                        flex\n                                        flex-col\n                                        gap-y-2\n                                        w-full\n                                        items-center\n                                        justify-center\n                                        text-xs\n                                    ",!(e.imageURL||e.videoURL)&&""),children:[t,(0,a.jsx)("span",{children:e.file.name})]},e.fileId)}),!C.length&&(0,a.jsxs)("div",{className:(0,g.cn)("\n                                    relative\n                                    w-full\n                                    h-36\n                                    bg-primary/20\n                                    flex\n                                    flex-col\n                                    items-center\n                                    justify-center\n                                    text-primary\n                                    uppercase\n                                    font-bold\n                                    rounded-md\n                                    transition-colors\n                                    hover:bg-primary/30\n                                ",!!C.length&&"hidden"),children:[(0,a.jsx)("div",{children:(null==i?void 0:i.placeholder)||"Choose file"}),(0,a.jsx)("input",{...i,type:"file",accept:t,value:"",className:(0,g.cn)("\n                                        absolute\n                                        left-0\n                                        top-0\n                                        w-full\n                                        h-full\n                                        opacity-0\n                                    "),onChange:L})]})]})})]})}var k=n(90837),b=n(15701),C=n(20357);function N(e){let{image:t,disabled:n,onChange:h}=e,[f,{width:p}]=(0,s.Z)(),{confirm:m}=(0,u.t)(),{uploadFile:g}=(0,b.h)(),v=(0,l.useCallback)(async e=>{let{file:t,errors:n}=(await o.Z.post("/api/files/upload",e)).data;if(null==n?void 0:n.length)throw Error(n.join(", "));if(t){let e=d.Z.stringify({...t.metadata});e=e?"?".concat(e):"",h({data:[C.env.NEXT_PUBLIC_APP_URL,"/files/".concat(t.fileId).concat(e)].join(""),fileId:t.fileId,filename:t.filename,size:t.size,contentType:t.contentType})}},[g,h]),y="".concat((null==t?void 0:t.data)||"").split("?").filter((e,t)=>t).join(""),{width:x,height:N}=d.Z.parse(y);return(0,a.jsx)(a.Fragment,{children:(0,a.jsxs)("div",{ref:f,className:"flex flex-col gap-y-2 min-w-60 max-w-60",children:[(0,a.jsx)("div",{className:"w-full flex flex-col items-center justify-center min-h-28",children:(0,a.jsx)(j,{alt:"",width:Number(x||"0"),height:Number(N||"0"),containerWidth:p,src:(null==t?void 0:t.data)||"/images/placeholder.png"})}),(0,a.jsxs)("div",{className:"flex items-center justify-center gap-x-4",children:[(0,a.jsx)(w,{type:"image/*",onUpload:v,children:(0,a.jsx)(k.hg,{asChild:!0,children:(0,a.jsx)(c.z,{size:"icon",className:"w-8 h-8 rounded-full",disabled:n,children:(0,a.jsx)(i.Z,{className:"h-4 w-4"})})})}),!!t&&(0,a.jsx)(c.z,{variant:"destructive",size:"icon",className:"w-8 h-8 rounded-full",disabled:n,onClick:()=>m(()=>h(null),{title:"Delete image",message:"Are you sure you want to delete this image?",danger:!0}),children:(0,a.jsx)(r.Z,{className:"h-4 w-4"})})]})]})})}},95229:function(e,t,n){n.d(t,{Alert:function(){return r}});var a=n(53699),l=n(16463),i=n(2265);function r(e){let t=(0,l.useRouter)(),{alert:n}=(0,a.s)();return(0,i.useEffect)(()=>{let{redirectTo:a,onClose:l,...i}=e;n({...i,variant:i.variant||"error",buttonLabel:i.buttonLabel||"Ok",onClose:()=>{null==l||l(),a&&t.replace(a)}})},[n,t,e]),null}},92513:function(e,t,n){n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(78030).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},6649:function(e,t,n){n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(78030).Z)("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]])},58184:function(e,t,n){n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(78030).Z)("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]])},99497:function(e,t,n){n.d(t,{ck:function(){return W},fC:function(){return O},z$:function(){return A}});var a=n(2265),l=n(78149),i=n(1584),r=n(98324),s=n(25171),d=n(53398),o=n(91715),c=n(87513),u=n(75238),h=n(47250),f=n(31383),p=n(57437),m="Radio",[g,v]=(0,r.b)(m),[y,x]=g(m),j=a.forwardRef((e,t)=>{let{__scopeRadio:n,name:r,checked:d=!1,required:o,disabled:c,value:u="on",onCheck:h,...f}=e,[m,g]=a.useState(null),v=(0,i.e)(t,e=>g(e)),x=a.useRef(!1),j=!m||!!m.closest("form");return(0,p.jsxs)(y,{scope:n,checked:d,disabled:c,children:[(0,p.jsx)(s.WV.button,{type:"button",role:"radio","aria-checked":d,"data-state":C(d),"data-disabled":c?"":void 0,disabled:c,value:u,...f,ref:v,onClick:(0,l.M)(e.onClick,e=>{d||null==h||h(),j&&(x.current=e.isPropagationStopped(),x.current||e.stopPropagation())})}),j&&(0,p.jsx)(b,{control:m,bubbles:!x.current,name:r,value:u,checked:d,required:o,disabled:c,style:{transform:"translateX(-100%)"}})]})});j.displayName=m;var w="RadioIndicator",k=a.forwardRef((e,t)=>{let{__scopeRadio:n,forceMount:a,...l}=e,i=x(w,n);return(0,p.jsx)(f.z,{present:a||i.checked,children:(0,p.jsx)(s.WV.span,{"data-state":C(i.checked),"data-disabled":i.disabled?"":void 0,...l,ref:t})})});k.displayName=w;var b=e=>{let{control:t,checked:n,bubbles:l=!0,...i}=e,r=a.useRef(null),s=(0,h.D)(n),d=(0,u.t)(t);return a.useEffect(()=>{let e=r.current,t=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"checked").set;if(s!==n&&t){let a=new Event("click",{bubbles:l});t.call(e,n),e.dispatchEvent(a)}},[s,n,l]),(0,p.jsx)("input",{type:"radio","aria-hidden":!0,defaultChecked:n,...i,tabIndex:-1,ref:r,style:{...e.style,...d,position:"absolute",pointerEvents:"none",opacity:0,margin:0}})};function C(e){return e?"checked":"unchecked"}var N=["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"],R="RadioGroup",[E,Z]=(0,r.b)(R,[d.Pc,v]),z=(0,d.Pc)(),L=v(),[I,U]=E(R),M=a.forwardRef((e,t)=>{let{__scopeRadioGroup:n,name:a,defaultValue:l,value:i,required:r=!1,disabled:u=!1,orientation:h,dir:f,loop:m=!0,onValueChange:g,...v}=e,y=z(n),x=(0,c.gm)(f),[j,w]=(0,o.T)({prop:i,defaultProp:l,onChange:g});return(0,p.jsx)(I,{scope:n,name:a,required:r,disabled:u,value:j,onValueChange:w,children:(0,p.jsx)(d.fC,{asChild:!0,...y,orientation:h,dir:x,loop:m,children:(0,p.jsx)(s.WV.div,{role:"radiogroup","aria-required":r,"aria-orientation":h,"data-disabled":u?"":void 0,dir:x,...v,ref:t})})})});M.displayName=R;var P="RadioGroupItem",F=a.forwardRef((e,t)=>{let{__scopeRadioGroup:n,disabled:r,...s}=e,o=U(P,n),c=o.disabled||r,u=z(n),h=L(n),f=a.useRef(null),m=(0,i.e)(t,f),g=o.value===s.value,v=a.useRef(!1);return a.useEffect(()=>{let e=e=>{N.includes(e.key)&&(v.current=!0)},t=()=>v.current=!1;return document.addEventListener("keydown",e),document.addEventListener("keyup",t),()=>{document.removeEventListener("keydown",e),document.removeEventListener("keyup",t)}},[]),(0,p.jsx)(d.ck,{asChild:!0,...u,focusable:!c,active:g,children:(0,p.jsx)(j,{disabled:c,required:o.required,checked:g,...h,...s,name:o.name,ref:m,onCheck:()=>o.onValueChange(s.value),onKeyDown:(0,l.M)(e=>{"Enter"===e.key&&e.preventDefault()}),onFocus:(0,l.M)(s.onFocus,()=>{var e;v.current&&(null===(e=f.current)||void 0===e||e.click())})})})});F.displayName=P;var S=a.forwardRef((e,t)=>{let{__scopeRadioGroup:n,...a}=e,l=L(n);return(0,p.jsx)(k,{...l,...a,ref:t})});S.displayName="RadioGroupIndicator";var O=M,W=F,A=S}}]);