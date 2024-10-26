"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4248],{29439:function(e,t,n){n.d(t,{M:function(){return C}});var a=n(57437),r=n(2265),l=n(92513),i=n(90399),s=n(5192),d=n(12491),o=n(38472),c=n(50495),u=n(76230),f=n(20920),h=n(58184);/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let p=(0,n(78030).Z)("File",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}]]);var m=n(9704),g=n(37440),v=n(39661),x=n(53699);async function y(e){return new Promise((t,n)=>{let a=new Image;a.onload=function(){t({width:a.width,height:a.height})},a.onerror=function(e,t,a,r,l){n(l||Error("Failed to load image"))},a.src=e})}function j(e){let{width:t=0,height:n=0,containerWidth:r,...l}=e;l.sizes;let i={width:"100%",height:"auto"};if(n&&t&&r){let e=function(e){let{imageWidth:t,imageHeight:n,containerWidth:a}=e;return t>a&&(n=a/t*n,t=a),{imageWidth:t,imageHeight:n}}({imageWidth:t,imageHeight:n,containerWidth:r});i.width=e.imageWidth,i.height=e.imageHeight}return(0,a.jsx)("img",{...l,src:l.src,style:{...i,...l.style}})}function w(e){let{type:t,children:n,inputProps:l,fileDetails:i,onUpload:d,...o}=e,[u,{width:w}]=(0,s.Z)(),[b,k]=(0,r.useState)(!1),[N,C]=(0,r.useState)([]),[R,E]=(0,r.useState)(!1),{alert:z}=(0,x.s)(),Z=(0,r.useCallback)(async()=>{let e=(null==l?void 0:l.multiple)?N:[N[0]];try{for(let{file:t,metadata:n,fileId:a}of(E(!0),e)){let e=new FormData;e.append("file",t),e.append("fileId",a||(0,f.Z)()),e.append("filename",t.name),e.append("contentType",t.type),e.append("size","".concat(t.size)),e.append("metadata",JSON.stringify({...n})),i&&Object.keys(i).forEach(t=>{let n=i[t];e.append(t,JSON.stringify(n))}),await d(e)}k(!1),C([]),z({title:"Success",message:"File".concat(e.length>1?"s":""," uploaded successfully!"),variant:"success"})}catch(t){z({title:"Error",message:"Failed to upload file".concat(e.length>1?"s":"",": ").concat(t.message),variant:"error"})}finally{E(!1)}},[d,z,N,null==l?void 0:l.multiple,i]),L=(0,r.useCallback)(async e=>{try{var t;let n=[];if(null===(t=e.target.files)||void 0===t?void 0:t.length)for(let t=0;t<e.target.files.length;t++)n.push(e.target.files[t]);let a=[];for(let e of n){let t,n;let r=URL.createObjectURL(e),l={};if("".concat(e.type).includes("image"))try{let e=await y(r);l={...l,...e},t=r}catch(e){}a.push({fileId:(0,f.Z)(),file:e,url:r,imageURL:t,videoURL:n,metadata:l})}C(a)}catch(e){z({title:"Error",message:e.message})}},[z]);return(0,a.jsxs)(a.Fragment,{children:[R&&(0,a.jsx)(v.a,{overlay:!0}),(0,a.jsx)(m.u,{open:b,onOpenChange:e=>{k(e),C([])},title:"Upload file",trigger:n,...o,actions:(0,a.jsxs)(a.Fragment,{children:[!N.length&&(0,a.jsx)("div",{className:"flex-1"}),(0,a.jsx)(c.z,{variant:"ghost",onClick:()=>k(!1),children:"Cancel"}),!!N.length&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("div",{className:"flex-1"}),(0,a.jsx)(c.z,{variant:"destructive",onClick:()=>C([]),children:"Clear"}),(0,a.jsxs)(c.z,{disabled:!N.length,onClick:()=>Z(),className:(0,g.cn)(!N.length&&"hidden"),children:[(0,a.jsx)(h.Z,{className:"h-4 w-4 mr-2"}),(0,a.jsx)("span",{children:"Upload"})]})]})]}),children:(0,a.jsxs)("div",{ref:u,children:[1===N.length&&N.map(e=>{let t=(0,a.jsx)(p,{className:"w-20 h-20 text-muted-foreground"});return e.imageURL&&(t=(0,a.jsx)(j,{alt:"",width:e.metadata.width||0,height:e.metadata.height||0,containerWidth:w,src:e.imageURL||"/images/placeholder.png"})),(0,a.jsxs)("div",{className:(0,g.cn)("\n                                        flex\n                                        flex-col\n                                        gap-y-2\n                                        w-full\n                                        items-center\n                                        justify-center\n                                        text-xs\n                                    ",!(e.imageURL||e.videoURL)&&""),children:[t,(0,a.jsx)("span",{children:e.file.name})]},e.fileId)}),!N.length&&(0,a.jsxs)("div",{className:(0,g.cn)("\n                                    relative\n                                    w-full\n                                    h-36\n                                    bg-primary/20\n                                    flex\n                                    flex-col\n                                    items-center\n                                    justify-center\n                                    text-primary\n                                    uppercase\n                                    font-bold\n                                    rounded-md\n                                    transition-colors\n                                    hover:bg-primary/30\n                                ",!!N.length&&"hidden"),children:[(0,a.jsx)("div",{children:(null==l?void 0:l.placeholder)||"Choose file"}),(0,a.jsx)("input",{...l,type:"file",accept:t,value:"",className:(0,g.cn)("\n                                        absolute\n                                        left-0\n                                        top-0\n                                        w-full\n                                        h-full\n                                        opacity-0\n                                    "),onChange:L})]})]})})]})}var b=n(90837),k=n(15701),N=n(20357);function C(e){let{image:t,disabled:n,onChange:f}=e,[h,{width:p}]=(0,s.Z)(),{confirm:m}=(0,u.t)(),{uploadFile:g}=(0,k.h)(),v=(0,r.useCallback)(async e=>{let{file:t,errors:n}=(await o.Z.post("/api/files/upload",e)).data;if(null==n?void 0:n.length)throw Error(n.join(", "));if(t){let e=d.Z.stringify({...t.metadata});e=e?"?".concat(e):"",f({data:[N.env.NEXT_PUBLIC_APP_URL,"/files/".concat(t.fileId).concat(e)].join(""),fileId:t.fileId,filename:t.filename,size:t.size,contentType:t.contentType})}},[g,f]),x="".concat((null==t?void 0:t.data)||"").split("?").filter((e,t)=>t).join(""),{width:y,height:C}=d.Z.parse(x);return(0,a.jsx)(a.Fragment,{children:(0,a.jsxs)("div",{ref:h,className:"flex flex-col gap-y-2 min-w-60 max-w-60",children:[(0,a.jsx)("div",{className:"w-full flex flex-col items-center justify-center min-h-28",children:(0,a.jsx)(j,{alt:"",width:Number(y||"0"),height:Number(C||"0"),containerWidth:p,src:(null==t?void 0:t.data)||"/images/placeholder.png"})}),(0,a.jsxs)("div",{className:"flex items-center justify-center gap-x-4",children:[(0,a.jsx)(w,{type:"image/*",onUpload:v,children:(0,a.jsx)(b.hg,{asChild:!0,children:(0,a.jsx)(c.z,{size:"icon",className:"w-8 h-8 rounded-full",disabled:n,children:(0,a.jsx)(l.Z,{className:"h-4 w-4"})})})}),!!t&&(0,a.jsx)(c.z,{variant:"destructive",size:"icon",className:"w-8 h-8 rounded-full",disabled:n,onClick:()=>m(()=>f(null),{title:"Delete image",message:"Are you sure you want to delete this image?",danger:!0}),children:(0,a.jsx)(i.Z,{className:"h-4 w-4"})})]})]})})}},17501:function(e,t,n){n.d(t,{h:function(){return i}});var a=n(57437),r=n(77606),l=n(37440);function i(e){let{children:t,className:n}=e;return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("div",{className:"h-16"}),(0,a.jsx)("div",{className:(0,l.cn)("\n                        fixed \n                        left-0 \n                        bottom-0 \n                        h-16 \n                        w-full \n                        border-t \n                        border-t-border \n                        z-[1] \n                        bg-primary-foreground \n                        dark:bg-background \n                        shadow-md \n                        dark:shadow-foreground/10\n                    "),children:(0,a.jsx)(r.V,{children:(0,a.jsx)("div",{className:(0,l.cn)("flex justify-end gap-x-4",n),children:t})})})]})}},95229:function(e,t,n){n.d(t,{Alert:function(){return i}});var a=n(53699),r=n(16463),l=n(2265);function i(e){let t=(0,r.useRouter)(),{alert:n}=(0,a.s)();return(0,l.useEffect)(()=>{let{redirectTo:a,onClose:r,...l}=e;n({...l,variant:l.variant||"error",buttonLabel:l.buttonLabel||"Ok",onClose:()=>{null==r||r(),a&&t.replace(a)}})},[n,t,e]),null}},77606:function(e,t,n){n.d(t,{V:function(){return l}});var a=n(57437),r=n(37440);function l(e){let{className:t,...n}=e;return(0,a.jsx)("div",{...n,className:(0,r.cn)("w-full max-w-screen-xl mx-auto p-5",t)})}},64344:function(e,t,n){n.d(t,{Z:function(){return s}});var a=n(57437),r=n(2265),l=n(48484),i=n(37440);let s=r.forwardRef((e,t)=>{let{className:n,orientation:r="horizontal",decorative:s=!0,...d}=e;return(0,a.jsx)(l.f,{ref:t,decorative:s,orientation:r,className:(0,i.cn)("shrink-0 bg-border","horizontal"===r?"h-[1px] w-full":"h-full w-[1px]",n),...d})});s.displayName=l.f.displayName},92513:function(e,t,n){n.d(t,{Z:function(){return a}});/**
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
 */let a=(0,n(78030).Z)("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]])},99497:function(e,t,n){n.d(t,{ck:function(){return V},fC:function(){return O},z$:function(){return W}});var a=n(2265),r=n(78149),l=n(1584),i=n(98324),s=n(25171),d=n(53398),o=n(91715),c=n(87513),u=n(75238),f=n(47250),h=n(31383),p=n(57437),m="Radio",[g,v]=(0,i.b)(m),[x,y]=g(m),j=a.forwardRef((e,t)=>{let{__scopeRadio:n,name:i,checked:d=!1,required:o,disabled:c,value:u="on",onCheck:f,...h}=e,[m,g]=a.useState(null),v=(0,l.e)(t,e=>g(e)),y=a.useRef(!1),j=!m||!!m.closest("form");return(0,p.jsxs)(x,{scope:n,checked:d,disabled:c,children:[(0,p.jsx)(s.WV.button,{type:"button",role:"radio","aria-checked":d,"data-state":N(d),"data-disabled":c?"":void 0,disabled:c,value:u,...h,ref:v,onClick:(0,r.M)(e.onClick,e=>{d||null==f||f(),j&&(y.current=e.isPropagationStopped(),y.current||e.stopPropagation())})}),j&&(0,p.jsx)(k,{control:m,bubbles:!y.current,name:i,value:u,checked:d,required:o,disabled:c,style:{transform:"translateX(-100%)"}})]})});j.displayName=m;var w="RadioIndicator",b=a.forwardRef((e,t)=>{let{__scopeRadio:n,forceMount:a,...r}=e,l=y(w,n);return(0,p.jsx)(h.z,{present:a||l.checked,children:(0,p.jsx)(s.WV.span,{"data-state":N(l.checked),"data-disabled":l.disabled?"":void 0,...r,ref:t})})});b.displayName=w;var k=e=>{let{control:t,checked:n,bubbles:r=!0,...l}=e,i=a.useRef(null),s=(0,f.D)(n),d=(0,u.t)(t);return a.useEffect(()=>{let e=i.current,t=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"checked").set;if(s!==n&&t){let a=new Event("click",{bubbles:r});t.call(e,n),e.dispatchEvent(a)}},[s,n,r]),(0,p.jsx)("input",{type:"radio","aria-hidden":!0,defaultChecked:n,...l,tabIndex:-1,ref:i,style:{...e.style,...d,position:"absolute",pointerEvents:"none",opacity:0,margin:0}})};function N(e){return e?"checked":"unchecked"}var C=["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"],R="RadioGroup",[E,z]=(0,i.b)(R,[d.Pc,v]),Z=(0,d.Pc)(),L=v(),[I,U]=E(R),F=a.forwardRef((e,t)=>{let{__scopeRadioGroup:n,name:a,defaultValue:r,value:l,required:i=!1,disabled:u=!1,orientation:f,dir:h,loop:m=!0,onValueChange:g,...v}=e,x=Z(n),y=(0,c.gm)(h),[j,w]=(0,o.T)({prop:l,defaultProp:r,onChange:g});return(0,p.jsx)(I,{scope:n,name:a,required:i,disabled:u,value:j,onValueChange:w,children:(0,p.jsx)(d.fC,{asChild:!0,...x,orientation:f,dir:y,loop:m,children:(0,p.jsx)(s.WV.div,{role:"radiogroup","aria-required":i,"aria-orientation":f,"data-disabled":u?"":void 0,dir:y,...v,ref:t})})})});F.displayName=R;var M="RadioGroupItem",P=a.forwardRef((e,t)=>{let{__scopeRadioGroup:n,disabled:i,...s}=e,o=U(M,n),c=o.disabled||i,u=Z(n),f=L(n),h=a.useRef(null),m=(0,l.e)(t,h),g=o.value===s.value,v=a.useRef(!1);return a.useEffect(()=>{let e=e=>{C.includes(e.key)&&(v.current=!0)},t=()=>v.current=!1;return document.addEventListener("keydown",e),document.addEventListener("keyup",t),()=>{document.removeEventListener("keydown",e),document.removeEventListener("keyup",t)}},[]),(0,p.jsx)(d.ck,{asChild:!0,...u,focusable:!c,active:g,children:(0,p.jsx)(j,{disabled:c,required:o.required,checked:g,...f,...s,name:o.name,ref:m,onCheck:()=>o.onValueChange(s.value),onKeyDown:(0,r.M)(e=>{"Enter"===e.key&&e.preventDefault()}),onFocus:(0,r.M)(s.onFocus,()=>{var e;v.current&&(null===(e=h.current)||void 0===e||e.click())})})})});P.displayName=M;var S=a.forwardRef((e,t)=>{let{__scopeRadioGroup:n,...a}=e,r=L(n);return(0,p.jsx)(b,{...r,...a,ref:t})});S.displayName="RadioGroupIndicator";var O=F,V=P,W=S}}]);