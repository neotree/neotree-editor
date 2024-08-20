"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7980],{87973:function(e,t,n){n.d(t,{M:function(){return k}});var a=n(57437),l=n(2265),i=n(92513),r=n(90399),s=n(5192),o=n(12491),c=n(50495),d=n(76230),u=n(20920),f=n(58184),m=n(99827),h=n(9704),p=n(37440),g=n(39661),x=n(53699);async function v(e){return new Promise((t,n)=>{let a=new Image;a.onload=function(){t({width:a.width,height:a.height})},a.onerror=function(e,t,a,l,i){n(i||Error("Failed to load image"))},a.src=e})}var b=n(66648);function y(e){let{width:t=0,height:n=0,containerWidth:l,...i}=e,r=i.sizes||"100vw",s={width:"100%",height:"auto"};if(n&&t&&l){r=void 0;let e=function(e){let{imageWidth:t,imageHeight:n,containerWidth:a}=e;return t>a&&(n=a/t*n,t=a),{imageWidth:t,imageHeight:n}}({imageWidth:t,imageHeight:n,containerWidth:l});s.width=e.imageWidth,s.height=e.imageHeight}return(0,a.jsx)(b.default,{...i,width:t,height:n,sizes:r,style:{...s,...i.style}})}function j(e){let{type:t,children:n,inputProps:i,fileDetails:r,onUpload:o,...d}=e,[b,{width:j}]=(0,s.Z)(),[N,w]=(0,l.useState)(!1),[C,k]=(0,l.useState)([]),[z,_]=(0,l.useState)(!1),{alert:Z}=(0,x.s)(),E=(0,l.useCallback)(async()=>{let e=(null==i?void 0:i.multiple)?C:[C[0]];try{for(let{file:t,metadata:n,fileId:a}of(_(!0),e)){let e=new FormData;e.append("file",t),e.append("fileId",a||(0,u.Z)()),e.append("filename",t.name),e.append("contentType",t.type),e.append("size","".concat(t.size)),e.append("metadata",JSON.stringify({...n})),r&&Object.keys(r).forEach(t=>{let n=r[t];e.append(t,JSON.stringify(n))}),await o(e)}w(!1),k([]),Z({title:"Success",message:"File".concat(e.length>1?"s":""," uploaded successfully!"),variant:"success"})}catch(t){Z({title:"Error",message:"Failed to upload file".concat(e.length>1?"s":"",": ").concat(t.message),variant:"error"})}finally{_(!1)}},[o,Z,C,null==i?void 0:i.multiple,r]),R=(0,l.useCallback)(async e=>{try{var t;let n=[];if(null===(t=e.target.files)||void 0===t?void 0:t.length)for(let t=0;t<e.target.files.length;t++)n.push(e.target.files[t]);let a=[];for(let e of n){let t,n;let l=URL.createObjectURL(e),i={};if("".concat(e.type).includes("image"))try{let e=await v(l);i={...i,...e},t=l}catch(e){}a.push({fileId:(0,u.Z)(),file:e,url:l,imageURL:t,videoURL:n,metadata:i})}k(a)}catch(e){Z({title:"Error",message:e.message})}},[Z]);return(0,a.jsxs)(a.Fragment,{children:[z&&(0,a.jsx)(g.a,{overlay:!0}),(0,a.jsx)(h.u,{open:N,onOpenChange:e=>{w(e),k([])},title:"Upload file",trigger:n,...d,actions:(0,a.jsxs)(a.Fragment,{children:[!C.length&&(0,a.jsx)("div",{className:"flex-1"}),(0,a.jsx)(c.z,{variant:"ghost",onClick:()=>w(!1),children:"Cancel"}),!!C.length&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("div",{className:"flex-1"}),(0,a.jsx)(c.z,{variant:"destructive",onClick:()=>k([]),children:"Clear"}),(0,a.jsxs)(c.z,{disabled:!C.length,onClick:()=>E(),className:(0,p.cn)(!C.length&&"hidden"),children:[(0,a.jsx)(f.Z,{className:"h-4 w-4 mr-2"}),(0,a.jsx)("span",{children:"Upload"})]})]})]}),children:(0,a.jsxs)("div",{ref:b,children:[1===C.length&&C.map(e=>{let t=(0,a.jsx)(m.Z,{className:"w-20 h-20 text-muted-foreground"});return e.imageURL&&(t=(0,a.jsx)(y,{alt:"",width:e.metadata.width||0,height:e.metadata.height||0,containerWidth:j,src:e.imageURL||"/images/placeholder.png"})),(0,a.jsxs)("div",{className:(0,p.cn)("\n                                        flex\n                                        flex-col\n                                        gap-y-2\n                                        w-full\n                                        items-center\n                                        justify-center\n                                        text-xs\n                                    ",!(e.imageURL||e.videoURL)&&""),children:[t,(0,a.jsx)("span",{children:e.file.name})]},e.fileId)}),!C.length&&(0,a.jsxs)("div",{className:(0,p.cn)("\n                                    relative\n                                    w-full\n                                    h-36\n                                    bg-primary/20\n                                    flex\n                                    flex-col\n                                    items-center\n                                    justify-center\n                                    text-primary\n                                    uppercase\n                                    font-bold\n                                    rounded-md\n                                    transition-colors\n                                    hover:bg-primary/30\n                                ",!!C.length&&"hidden"),children:[(0,a.jsx)("div",{children:(null==i?void 0:i.placeholder)||"Choose file"}),(0,a.jsx)("input",{...i,type:"file",accept:t,value:"",className:(0,p.cn)("\n                                        absolute\n                                        left-0\n                                        top-0\n                                        w-full\n                                        h-full\n                                        opacity-0\n                                    "),onChange:R})]})]})})]})}var N=n(90837),w=n(15701),C=n(20357);function k(e){let{image:t,disabled:n,onChange:u}=e,[f,{width:m}]=(0,s.Z)(),{confirm:h}=(0,d.t)(),{uploadFile:p}=(0,w.h)(),g=(0,l.useCallback)(async e=>{let{file:t,errors:n}=await p(e);if(null==n?void 0:n.length)throw Error(n.join(", "));if(t){let e=o.Z.stringify({...t.metadata});e=e?"?".concat(e):"",u({data:[C.env.NEXT_PUBLIC_APP_URL,"/files/".concat(t.fileId).concat(e)].join(""),fileId:t.fileId,filename:t.filename,size:t.size,contentType:t.contentType})}},[p,u]),x="".concat((null==t?void 0:t.data)||"").split("?").filter((e,t)=>t).join(""),{width:v,height:b}=o.Z.parse(x);return(0,a.jsx)(a.Fragment,{children:(0,a.jsxs)("div",{ref:f,className:"flex flex-col gap-y-2 min-w-60 max-w-60",children:[(0,a.jsx)("div",{className:"w-full flex flex-col items-center justify-center min-h-28",children:(0,a.jsx)(y,{alt:"",width:Number(v||"0"),height:Number(b||"0"),containerWidth:m,src:(null==t?void 0:t.data)||"/images/placeholder.png"})}),(0,a.jsxs)("div",{className:"flex items-center justify-center gap-x-4",children:[(0,a.jsx)(j,{type:"image/*",onUpload:g,children:(0,a.jsx)(N.hg,{asChild:!0,children:(0,a.jsx)(c.z,{size:"icon",className:"w-8 h-8 rounded-full",disabled:n,children:(0,a.jsx)(i.Z,{className:"h-4 w-4"})})})}),!!t&&(0,a.jsx)(c.z,{variant:"destructive",size:"icon",className:"w-8 h-8 rounded-full",disabled:n,onClick:()=>h(()=>u(null),{title:"Delete image",message:"Are you sure you want to delete this image?",danger:!0}),children:(0,a.jsx)(r.Z,{className:"h-4 w-4"})})]})]})})}},84760:function(e,t,n){n.d(t,{D:function(){return i}});var a=n(57437),l=n(37440);function i(e){let{children:t,className:n}=e;return(0,a.jsx)("div",{className:(0,l.cn)("pb-1 border-b border-b-primary",n),children:(0,a.jsx)("span",{className:"uppercase text-primary text-sm",children:t})})}},17501:function(e,t,n){n.d(t,{h:function(){return r}});var a=n(57437),l=n(77606),i=n(37440);function r(e){let{children:t,className:n}=e;return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("div",{className:"h-16"}),(0,a.jsx)("div",{className:(0,i.cn)("\n                        fixed \n                        left-0 \n                        bottom-0 \n                        h-16 \n                        w-full \n                        border-t \n                        border-t-border \n                        z-[1] \n                        bg-primary-foreground \n                        dark:bg-background \n                        shadow-md \n                        dark:shadow-foreground/10\n                    "),children:(0,a.jsx)(l.V,{children:(0,a.jsx)("div",{className:(0,i.cn)("flex justify-end gap-x-4",n),children:t})})})]})}},95229:function(e,t,n){n.d(t,{Alert:function(){return r}});var a=n(53699),l=n(16463),i=n(2265);function r(e){let t=(0,l.useRouter)(),{alert:n}=(0,a.s)();return(0,i.useEffect)(()=>{let{redirectTo:a,onClose:l,...i}=e;n({...i,variant:i.variant||"error",buttonLabel:i.buttonLabel||"Ok",onClose:()=>{null==l||l(),a&&t.replace(a)}})},[n,t,e]),null}},77606:function(e,t,n){n.d(t,{V:function(){return i}});var a=n(57437),l=n(37440);function i(e){let{className:t,...n}=e;return(0,a.jsx)("div",{...n,className:(0,l.cn)("w-full max-w-screen-xl mx-auto p-5",t)})}},39661:function(e,t,n){n.d(t,{a:function(){return i}});var a=n(57437),l=n(89627);function i(e){let{overlay:t,transparent:n}=e;return(0,a.jsx)(a.Fragment,{children:(0,a.jsx)("div",{style:{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",...t?{height:"100%",position:"fixed",top:0,left:0,bottom:0,zIndex:999,backgroundColor:n?"transparent":"rgba(255,255,255,.6)"}:{padding:"50px 0"}},children:(0,a.jsx)(l.Z,{style:{height:24,width:24},className:"animate-spin"})})})}},9704:function(e,t,n){n.d(t,{u:function(){return r}});var a=n(57437),l=n(90837),i=n(37440);function r(e){let{children:t,title:n,description:r,actions:s,trigger:o,contentProps:c,footerProps:d,...u}=e;return(0,a.jsx)(a.Fragment,{children:(0,a.jsxs)(l.Vq,{...u,children:[o,(0,a.jsxs)(l.cZ,{hideCloseButton:!0,className:(0,i.cn)("flex flex-col max-h-[90%] gap-y-4 p-0 m-0 sm:max-w-xl",null==c?void 0:c.className),...c,children:[(0,a.jsxs)(l.fK,{className:(0,i.cn)(n||r?"":"hidden","border-b border-b-border px-4 py-4"),children:[(0,a.jsx)(l.$N,{className:(0,i.cn)(n?"":"hidden"),children:n}),(0,a.jsx)(l.Be,{className:(0,i.cn)(r?"":"hidden"),children:r})]}),(0,a.jsx)("div",{className:"flex-1 flex flex-col overflow-y-auto px-4 py-2",children:t}),(0,a.jsx)(l.cN,{className:(0,i.cn)("border-t border-t-border px-4 py-2 items-center w-full",s?"":"hidden",null==d?void 0:d.className),...d,children:s})]})]})})}},25704:function(e,t,n){n.r(t),n.d(t,{Title:function(){return i}});var a=n(2265),l=n(20357);function i(e){let{children:t}=e;return(0,a.useEffect)(()=>{document.title=[l.env.NEXT_PUBLIC_APP_NAME,t].filter(e=>e).join(" - ")},[t]),(0,a.useEffect)(()=>()=>{document.title="".concat(l.env.NEXT_PUBLIC_APP_NAME)},[]),null}},90837:function(e,t,n){n.d(t,{$N:function(){return g},Be:function(){return x},GG:function(){return u},Vq:function(){return o},cN:function(){return p},cZ:function(){return m},fK:function(){return h},hg:function(){return c}});var a=n(57437),l=n(2265),i=n(13304),r=n(74697),s=n(37440);let o=i.fC,c=i.xz,d=i.h_,u=i.x8,f=l.forwardRef((e,t)=>{let{className:n,...l}=e;return(0,a.jsx)(i.aV,{ref:t,className:(0,s.cn)("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",n),...l})});f.displayName=i.aV.displayName;let m=l.forwardRef((e,t)=>{let{className:n,children:l,hideCloseButton:o,...c}=e;return(0,a.jsxs)(d,{children:[(0,a.jsx)(f,{}),(0,a.jsxs)(i.VY,{ref:t,className:(0,s.cn)("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",n),...c,children:[l,!0!==o&&(0,a.jsxs)(i.x8,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",children:[(0,a.jsx)(r.Z,{className:"h-4 w-4"}),(0,a.jsx)("span",{className:"sr-only",children:"Close"})]})]})]})});m.displayName=i.VY.displayName;let h=e=>{let{className:t,...n}=e;return(0,a.jsx)("div",{className:(0,s.cn)("flex flex-col space-y-1.5 text-center sm:text-left",t),...n})};h.displayName="DialogHeader";let p=e=>{let{className:t,...n}=e;return(0,a.jsx)("div",{className:(0,s.cn)("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",t),...n})};p.displayName="DialogFooter";let g=l.forwardRef((e,t)=>{let{className:n,...l}=e;return(0,a.jsx)(i.Dx,{ref:t,className:(0,s.cn)("text-lg font-semibold leading-none tracking-tight",n),...l})});g.displayName=i.Dx.displayName;let x=l.forwardRef((e,t)=>{let{className:n,...l}=e;return(0,a.jsx)(i.dk,{ref:t,className:(0,s.cn)("text-sm text-muted-foreground",n),...l})});x.displayName=i.dk.displayName},67135:function(e,t,n){n.d(t,{_:function(){return c}});var a=n(57437),l=n(2265),i=n(38364),r=n(12218),s=n(37440);let o=(0,r.j)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),c=l.forwardRef((e,t)=>{let{className:n,secondary:l,error:r,...c}=e;return(0,a.jsx)(i.f,{ref:t,className:(0,s.cn)(o(),l&&"text-xs",r?"text-danger":"",n),...c})});c.displayName=i.f.displayName},85070:function(e,t,n){n.d(t,{E:function(){return o},m:function(){return c}});var a=n(57437),l=n(2265),i=n(99497),r=n(28165),s=n(37440);let o=l.forwardRef((e,t)=>{let{className:n,...l}=e;return(0,a.jsx)(i.fC,{className:(0,s.cn)("grid gap-2",n),...l,ref:t})});o.displayName=i.fC.displayName;let c=l.forwardRef((e,t)=>{let{className:n,...l}=e;return(0,a.jsx)(i.ck,{ref:t,className:(0,s.cn)("aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",n),...l,children:(0,a.jsx)(i.z$,{className:"flex items-center justify-center",children:(0,a.jsx)(r.Z,{className:"h-2.5 w-2.5 fill-current text-current"})})})});c.displayName=i.ck.displayName},64344:function(e,t,n){n.d(t,{Z:function(){return s}});var a=n(57437),l=n(2265),i=n(48484),r=n(37440);let s=l.forwardRef((e,t)=>{let{className:n,orientation:l="horizontal",decorative:s=!0,...o}=e;return(0,a.jsx)(i.f,{ref:t,decorative:s,orientation:l,className:(0,r.cn)("shrink-0 bg-border","horizontal"===l?"h-[1px] w-full":"h-full w-[1px]",n),...o})});s.displayName=i.f.displayName},93146:function(e,t,n){n.d(t,{g:function(){return r}});var a=n(57437),l=n(2265),i=n(37440);let r=l.forwardRef((e,t)=>{let{className:n,noRing:l,...r}=e;return(0,a.jsx)("textarea",{className:(0,i.cn)("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",l&&"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",n),ref:t,...r})});r.displayName="Textarea"},83146:function(e,t,n){n.d(t,{Tf:function(){return l},m1:function(){return a},ph:function(){return i}});let a=[{label:"Admission",value:"admission"},{label:"Discharge",value:"discharge"},{label:"Neolab",value:"neolab"}],l=[{value:"checklist",label:"Checklist"},{value:"form",label:"Form"},{value:"management",label:"Management"},{value:"multi_select",label:"Multiple choice list"},{value:"single_select",label:"Single choice list"},{value:"progress",label:"Progress"},{value:"timer",label:"Timer"},{value:"yesno",label:"Yes/No"},{value:"zw_edliz_summary_table",label:"EDLIZ summary table (ZW)"},{value:"mwi_edliz_summary_table",label:"EDLIZ summary table (MWI)"},{value:"diagnosis",label:"Diagnosis"}],i=[{value:"risk",label:"Risk factor"},{value:"sign",label:"Sign/Symptom"}]},53453:function(e,t,n){n.d(t,{AppContextProvider:function(){return o},b:function(){return s}});var a=n(57437),l=n(2265),i=n(79512);let r=(0,l.createContext)(null),s=()=>(0,l.useContext)(r);function o(e){let{children:t,...n}=e,{isAdmin:s,isSuperUser:o,mode:c,sys:d}=n,{setTheme:u}=(0,i.F)();(0,l.useEffect)(()=>{"yes"===d.data.hide_theme_toggle&&u("light")},[d]);let f={...n,viewOnly:!s&&!o||"view"===c};return(0,a.jsx)(r.Provider,{value:f,children:t})}},15701:function(e,t,n){n.d(t,{ScriptsContextProvider:function(){return d},h:function(){return c}});var a=n(57437),l=n(2265),i=n(16463),r=n(12491),s=n(23733);let o=(0,l.createContext)(null),c=()=>(0,l.useContext)(o);function d(e){let{children:t,...n}=e,c=function(e){let{}=e,t=(0,i.useRouter)(),{scriptId:n}=(0,i.useParams)(),{parsed:a}=(0,s.l)(),o=(0,l.useCallback)(()=>{t.push("/")},[t]),c=(0,l.useCallback)(()=>{t.push("/script/".concat(n,"?").concat(r.Z.stringify({...a,section:"screens"})))},[t,a,n]);return{onCancelDiagnosisForm:(0,l.useCallback)(()=>{t.push("/script/".concat(n,"?").concat(r.Z.stringify({...a,section:"diagnoses"})))},[t,a,n]),onCancelScreenForm:c,onCancelScriptForm:o}}(n);return(0,a.jsx)(o.Provider,{value:{...n,...c},children:t})}},53699:function(e,t,n){n.d(t,{s:function(){return i}});var a=n(39099);let l={title:"",message:"",buttonLabel:"Ok",variant:"info",onClose:void 0},i=(0,a.Ue)(e=>({isOpen:!1,...l,alert:t=>e({isOpen:!0,...l,...t}),close:()=>e({isOpen:!1,onClose:void 0,...l})}))},76230:function(e,t,n){n.d(t,{t:function(){return i}});var a=n(39099);let l={danger:!1,title:"Confirm",message:"Are you sure?",positiveLabel:"Ok",negativeLabel:"Cancel"},i=(0,a.Ue)(e=>({isOpen:!1,...l,confirm:(t,n)=>e({isOpen:!0,...l,...n,onConfirm:t}),close:()=>e({isOpen:!1,onConfirm:void 0,...l})}))},21453:function(e,t,n){n.d(t,{x:function(){return a}});function a(e){return null==e||""===e}}}]);