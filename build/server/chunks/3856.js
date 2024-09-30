exports.id=3856,exports.ids=[3856],exports.modules={14442:(e,a,t)=>{Promise.resolve().then(t.bind(t,25813)),Promise.resolve().then(t.bind(t,93254)),Promise.resolve().then(t.bind(t,15086)),Promise.resolve().then(t.bind(t,97043)),Promise.resolve().then(t.bind(t,8037)),Promise.resolve().then(t.bind(t,72346)),Promise.resolve().then(t.bind(t,3529))},69807:(e,a,t)=>{Promise.resolve().then(t.t.bind(t,12994,23)),Promise.resolve().then(t.t.bind(t,96114,23)),Promise.resolve().then(t.t.bind(t,9727,23)),Promise.resolve().then(t.t.bind(t,79671,23)),Promise.resolve().then(t.t.bind(t,41868,23)),Promise.resolve().then(t.t.bind(t,84759,23))},40513:(e,a,t)=>{Promise.resolve().then(t.t.bind(t,79404,23))},25813:(e,a,t)=>{"use strict";t.d(a,{AlertModal:()=>c});var r=t(10326),s=t(17577),n=t(12534),i=t(99440),o=t(96221),l=t(90772),d=t(77863);function c(){let{isOpen:e,title:a,message:t,variant:c,buttonLabel:f,close:m,onClose:h}=(0,o.s)(),u=(0,s.useCallback)(()=>{h?.(),m()},[m,h]);return r.jsx(i.aR,{open:e,onOpenChange:u,children:(0,r.jsxs)(i._T,{children:[(0,r.jsxs)(i.fY,{children:[r.jsx(i.f$,{className:(0,d.cn)(!a&&"hidden"),children:a}),!!t&&(0,r.jsxs)("div",{className:(0,d.cn)("flex gap-y-4 flex-col sm:items-start sm:flex-row sm:gap-x-4"),children:["error"===c&&r.jsx("div",{className:"flex justify-center",children:r.jsx(n.BJv,{className:"text-red-600 min-w-12 min-h-12 w-12 h-12"})}),"success"===c&&r.jsx("div",{className:"flex justify-center",children:r.jsx(n._rq,{className:"text-green-600 min-w-12 min-h-12 w-12 h-12"})}),r.jsx("div",{className:"flex-1 text-lg",children:t})]})]}),r.jsx(i.xo,{children:r.jsx("div",{className:"flex justify-end",children:r.jsx(l.z,{onClick:u,variant:"outline",children:f})})})]})})}},93254:(e,a,t)=>{"use strict";t.d(a,{ConfirmModal:()=>d});var r=t(10326),s=t(99440),n=t(12534),i=t(46670),o=t(90772),l=t(77863);function d(){let{isOpen:e,danger:a,title:t,message:d,positiveLabel:c,negativeLabel:f,close:m,onConfirm:h}=(0,i.t)();return r.jsx(s.aR,{open:e,onOpenChange:m,children:(0,r.jsxs)(s._T,{className:"p-0 max-h-[80%] flex flex-col",children:[!!t&&r.jsx(s.fY,{className:"py-2 px-4",children:r.jsx(s.f$,{children:t})}),(0,r.jsxs)("div",{className:(0,l.cn)("px-4 flex-1 flex flex-col gap-y-4 items-center sm:items-start sm:flex-row sm:gap-x-4 overflow-y-auto",!t&&"py-2"),children:[a&&r.jsx(n.bcx,{className:"text-red-600 min-w-10 min-h-10 w-10 h-10"}),r.jsx("div",{dangerouslySetInnerHTML:{__html:d}})]}),(0,r.jsxs)(s.xo,{className:"px-4 py-2",children:[r.jsx(s.le,{children:f}),r.jsx(o.z,{variant:a?"destructive":void 0,asChild:!0,children:r.jsx(s.OL,{onClick:()=>h?.(),children:c})})]})]})})}},15086:(e,a,t)=>{"use strict";t.d(a,{AuthContextProvider:()=>n});var r=t(10326),s=t(77109);function n({children:e}){return r.jsx(s.SessionProvider,{children:e})}},97043:(e,a,t)=>{"use strict";t.d(a,{ThemeProvider:()=>n});var r=t(10326);t(17577);var s=t(14831);function n({children:e,...a}){return r.jsx(s.f,{...a,children:e})}},8037:(e,a,t)=>{"use strict";t.d(a,{SocketEventsListener:()=>n});var r=t(17577),s=t(35047);function n({events:e}){return(0,r.useRef)({eventsTimeouts:{},eventsTimestamps:{}}),(0,r.useRef)(new Date().getTime()),(0,s.useRouter)(),null}t(63697)},99440:(e,a,t)=>{"use strict";t.d(a,{OL:()=>x,_T:()=>f,aR:()=>l,f$:()=>u,fY:()=>m,le:()=>p,xo:()=>h});var r=t(10326),s=t(17577),n=t(80440),i=t(77863),o=t(90772);let l=n.fC;n.xz;let d=n.h_,c=s.forwardRef(({className:e,...a},t)=>r.jsx(n.aV,{className:(0,i.cn)("fixed inset-0 z-[99999999999] bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",e),...a,ref:t}));c.displayName=n.aV.displayName;let f=s.forwardRef(({className:e,...a},t)=>(0,r.jsxs)(d,{children:[r.jsx(c,{}),r.jsx(n.VY,{ref:t,className:(0,i.cn)("fixed left-[50%] top-[50%] z-[99999999999] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",e),...a})]}));f.displayName=n.VY.displayName;let m=({className:e,...a})=>r.jsx("div",{className:(0,i.cn)("flex flex-col space-y-2 text-center sm:text-left",e),...a});m.displayName="AlertDialogHeader";let h=({className:e,...a})=>r.jsx("div",{className:(0,i.cn)("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",e),...a});h.displayName="AlertDialogFooter";let u=s.forwardRef(({className:e,...a},t)=>r.jsx(n.Dx,{ref:t,className:(0,i.cn)("text-lg font-semibold",e),...a}));u.displayName=n.Dx.displayName,s.forwardRef(({className:e,...a},t)=>r.jsx(n.dk,{ref:t,className:(0,i.cn)("text-sm text-muted-foreground",e),...a})).displayName=n.dk.displayName;let x=s.forwardRef(({className:e,...a},t)=>r.jsx(n.aU,{ref:t,className:(0,i.cn)((0,o.d)(),e),...a}));x.displayName=n.aU.displayName;let p=s.forwardRef(({className:e,...a},t)=>r.jsx(n.$j,{ref:t,className:(0,i.cn)((0,o.d)({variant:"outline"}),"mt-2 sm:mt-0",e),...a}));p.displayName=n.$j.displayName},90772:(e,a,t)=>{"use strict";t.d(a,{d:()=>l,z:()=>d});var r=t(10326),s=t(17577),n=t(34214),i=t(28671),o=t(77863);let l=(0,i.j)(`
    inline-flex
    items-center
    justify-center
    whitespace-nowrap
    rounded-md
    text-sm
    font-medium
    transition-colors
    focus-visible:outline-none
    disabled:pointer-events-none
    disabled:opacity-50
  `,{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/80",outline:"border border-input bg-background hover:bg-primary/20","primary-outline":"border border-primary text-primary bg-transparent hover:bg-primary/20",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/90",ghost:"hover:bg-primary/20 hover:text-primary",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),d=s.forwardRef(({className:e,variant:a,size:t,asChild:s=!1,...i},d)=>{let c=s?n.g7:"button";return r.jsx(c,{className:(0,o.cn)(l({variant:a,size:t,className:e})),ref:d,...i})});d.displayName="Button"},72346:(e,a,t)=>{"use strict";t.d(a,{Toaster:()=>i});var r=t(10326),s=t(14831),n=t(85999);let i=({...e})=>{let{theme:a="system"}=(0,s.F)();return r.jsx(n.x7,{theme:a,richColors:!0,position:"top-center",...e})}},3529:(e,a,t)=>{"use strict";t.d(a,{AppContextProvider:()=>g,b:()=>p});var r=t(10326),s=t(17577),n=t(14831),i=t(35047),o=t(60222),l=t(66562);let d=l.Z.get,c=l.Z.set,f=(l.Z.remove,{get:d,set:c});function m(){let e=f.get("mode");return e||(e="view",f.set("mode",e,{expires:31536e7})),e}var h=t(63697),u=t(8037);let x=(0,s.createContext)(null),p=()=>(0,s.useContext)(x);function g({children:e,...a}){let t=function(e){(0,i.useRouter)();let{isAdmin:a,isSuperUser:t,sys:r}=e,{setTheme:o}=(0,n.F)(),l=(0,s.useCallback)(()=>(a||t?m():"view")||"view",[t,a]),[d,c]=(0,s.useState)(l()),u=!a&&!t||"view"===d,x=(0,s.useCallback)((...e)=>{let a=function(e){return f.set("mode",e,{expires:31536e7}),m()}(...e);return h.Z.emit("mode_changed",l()),c(l()),a},[l]),p=(0,s.useCallback)(()=>{c(l())},[l]);return{...e,mode:d,viewOnly:u,onModeChange:p,getMode:m,setMode:x}}(a),[l,d]=(0,s.useState)(!1);return((0,o.Z)(()=>{d(!0)}),l)?(0,r.jsxs)(x.Provider,{value:t,children:[e,r.jsx(u.SocketEventsListener,{events:[{name:"mode_changed",onEvent:{callback:t.onModeChange}}]})]}):null}},96221:(e,a,t)=>{"use strict";t.d(a,{s:()=>n});var r=t(60114);let s={title:"",message:"",buttonLabel:"Ok",variant:"info",onClose:void 0},n=(0,r.Ue)(e=>({isOpen:!1,...s,alert:a=>e({isOpen:!0,...s,...a}),close:()=>e({isOpen:!1,onClose:void 0,...s})}))},46670:(e,a,t)=>{"use strict";t.d(a,{t:()=>n});var r=t(60114);let s={danger:!1,title:"Confirm",message:"Are you sure?",positiveLabel:"Ok",negativeLabel:"Cancel"},n=(0,r.Ue)(e=>({isOpen:!1,...s,confirm:(a,t)=>e({isOpen:!0,...s,...t,onConfirm:a}),close:()=>e({isOpen:!1,onConfirm:void 0,...s})}))},63697:(e,a,t)=>{"use strict";t.d(a,{Z:()=>r});let r=(0,t(68848).io)(process.env.NEXT_PUBLIC_APP_URL)},77863:(e,a,t)=>{"use strict";t.d(a,{cn:()=>n});var r=t(41135),s=t(31009);function n(...e){return(0,s.m6)((0,r.W)(e))}},65376:(e,a,t)=>{"use strict";t.r(a),t.d(a,{$$ACTION_0:()=>v,getSites:()=>p,importRemoteScripts:()=>g});var r=t(24330);t(60166);var s=t(92237),n=t(57435),i=t(66267),o=t(29712),l=t(57745),d=t(88317),c=t(10413),f=t(57418),m=t(49530),h=t(20706);async function u({siteId:e,scriptsIds:a},t){let r={success:!1};try{if(!e)throw Error("Missing siteId");let s=await c.Z.query.sites.findFirst({where:(0,l.eq)(f.sites.siteId,e)});if(!s)throw Error("Site not found");let i=process.env.NEXT_PUBLIC_APP_URL,u=o.Z.create({baseURL:`${i}/api`});for(let{scriptId:e,overWriteExistingScriptWithId:t}of(u.interceptors.request.use(async e=>(e.headers&&(e.headers["x-api-key"]=s.apiKey),n.Z.error(e.method,[`${i}/api`,e.url].join("")),e)),u.interceptors.response.use(e=>e,e=>new Promise((a,t)=>t(e))),a)){let{data:a=[],errors:s}=(await u.get("/scripts/with-items?"+m.Z.stringify({scriptsIds:JSON.stringify([e])}))).data;if(s?.length)r.success=!1,r.errors=s;else{let e=await (0,h.gX)(a.map(e=>({...e,scriptId:t||e.scriptId})),{overWriteScriptId:!t});e.errors&&(r.success=!1,r.errors=[...r.errors||[],...e.errors])}}!r.errors?.length&&(r.success=!0,t?.broadcastAction&&d.Z.emit("data_changed","create_scripts_drafts"))}catch(a){let e=a.response?.data?.message||a.response?.data||a.message;r.success=!1,r.errors=[e],n.Z.error("importRemoteScripts ERROR",e)}finally{return r}}var x=t(40618);let p=s.Q,g=(0,r.j)("0c0d3a976a0d3670bfcd783a4eda74ef47d08486",v);async function v(...e){let a={success:!1};try{await (0,i.isAllowed)(["import_scripts"]),a=await u(...e)}catch(e){a.errors=[e.message],n.Z.error("importRemoteScripts ERROR",e.message)}finally{return a}}(0,x.h)([p,g]),(0,r.j)("fb88c3f5187f1ae67c65c11fdc8ca29dc4350c9d",p),(0,r.j)("eb767362e2857509ccd48c4eb7968f5169ef228f",g)},60563:(e,a,t)=>{"use strict";t.r(a),t.d(a,{$$ACTION_0:()=>h,$$ACTION_1:()=>x,getSys:()=>m,updateSys:()=>u});var r=t(24330);t(60166);var s=t(57745),n=t(88317),i=t(57435),o=t(10413),l=t(57418);async function d(e={},a){let t={success:!1};try{for(let a of Object.keys(e))try{await o.Z.update(l.sys).set({value:e[a]}).where((0,s.eq)(l.sys.key,a))}catch(e){t.errors=[...t?.errors||[],e.message]}!t.errors?.length&&(t.success=!0,a?.broadcastAction&&n.Z.emit("update_system"))}catch(e){t.success=!1,t.errors=[e.message],i.Z.error("_updateSys ERROR",e.message)}finally{return t}}async function c(){let e={data:{}};try{let a=(await o.Z.query.sys.findMany()).reduce((e,a)=>({...e,[a.key]:a.value}),{});e.data=a}catch(a){e.errors=[a.message],i.Z.error("_getSys ERROR",a.message)}finally{return e}}var f=t(40618);let m=(0,r.j)("458e0bb776cc3d544fd3487595ecc0d4d43114fc",h);async function h(...e){return await c(...e)}let u=(0,r.j)("33d8b15ec8dd98c91eac63d85211264cf0a630b8",x);async function x(...e){let a={success:!1};try{a=await d(...e)}catch(e){a.errors=[e.message],i.Z.error("getSys ERROR",e.message)}finally{return a}}(0,f.h)([m,u]),(0,r.j)("b0d634be4cc158e4043dd09673ee30e8e18999af",m),(0,r.j)("62ecd67a03f8f29d7d9a14399a69f12cd0186bad",u)},69684:(e,a,t)=>{"use strict";t.r(a),t.d(a,{default:()=>$,metadata:()=>q});var r=t(19510),s=t(81082),n=t.n(s);t(3641);var i=t(68570);let o=(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/components/providers/auth-context-provider.tsx`),{__esModule:l,$$typeof:d}=o;o.default;let c=(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/components/providers/auth-context-provider.tsx#AuthContextProvider`),f=(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/components/providers/theme-provider.tsx`),{__esModule:m,$$typeof:h}=f;f.default;let u=(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/components/providers/theme-provider.tsx#ThemeProvider`),x=(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/components/ui/sonner.tsx`),{__esModule:p,$$typeof:g}=x;x.default;let v=(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/components/ui/sonner.tsx#Toaster`),y=(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/components/modals/confirm.tsx`),{__esModule:b,$$typeof:j}=y;y.default;let P=(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/components/modals/confirm.tsx#ConfirmModal`),w=(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/components/modals/alert.tsx`),{__esModule:_,$$typeof:A}=w;w.default;let N=(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/components/modals/alert.tsx#AlertModal`),Z=(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/contexts/app/index.tsx`),{__esModule:S,$$typeof:M}=Z;Z.default,(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/contexts/app/index.tsx#AppContext`),(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/contexts/app/index.tsx#useAppContext`);let R=(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/contexts/app/index.tsx#AppContextProvider`);var k=t(60563),C=t(65376),T=t(40801),V=t(53911);t(67272);let W=(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/components/socket-events-listener.tsx`),{__esModule:H,$$typeof:O}=W;W.default;let U=(0,i.createProxy)(String.raw`/Users/lafarai/Werq/BWS/NeoTree/neotree-webeditor/components/socket-events-listener.tsx#SocketEventsListener`),q={title:"Neotree",description:"Neotree",icons:[{media:"(prefers-color-scheme: light)",url:"/images/favicon.ico",href:"/images/favicon.ico"},{media:"(prefers-color-scheme: dark)",url:"/images/favicon.ico",href:"/images/favicon.ico"}]};async function $({children:e}){let[a,t,s]=await Promise.all([V.getEditorDetails(),(0,T.getAuthenticatedUserWithRoles)(),(0,k.getSys)()]);return r.jsx("html",{lang:"en",children:r.jsx("body",{className:n().className,children:r.jsx(c,{children:(0,r.jsxs)(u,{attribute:"class",defaultTheme:"light",enableSystem:!0,disableTransitionOnChange:!0,children:[(0,r.jsxs)(R,{...V,...k,...a,...t,sys:s,getSites:C.getSites,children:[e,r.jsx(U,{events:[{name:"mode_changed",onEvent:{refreshRouter:!0}},{name:"update_system",onEvent:{refreshRouter:!0}},{name:"data_changed",onEvent:{refreshRouter:!0}}]})]}),r.jsx(v,{}),r.jsx(P,{}),r.jsx(N,{})]})})})})}},96560:(e,a,t)=>{"use strict";t.r(a),t.d(a,{default:()=>l});var r=t(19510),s=t(84101),n=t(2946),i=t(55848),o=t(57371);function l(){return r.jsx("div",{className:"w-full h-full flex items-center justify-center",children:(0,r.jsxs)("div",{className:"px-4 py-4 flex flex-col gap-y-5 text-center justify-center items-center",children:[r.jsx(s.T,{}),r.jsx("div",{className:"text-6xl sm:text-9xl font-extrabold text-secondary dark:text-secondary-foreground",children:"Four, Oh! Four"}),r.jsx("div",{children:"Sorry, can't find the page you're looking for."}),r.jsx(n.z,{variant:"outline",size:"lg",asChild:!0,children:r.jsx(o.default,{href:"/",replace:!0,children:(0,r.jsxs)(r.Fragment,{children:[r.jsx(i.Z,{className:"w-6 h-6 mr-2"}),r.jsx("span",{className:"text-xl",children:"Home"})]})})})]})})}},84101:(e,a,t)=>{"use strict";t.d(a,{T:()=>i});var r=t(19510),s=t(57371),n=t(50650);function i({size:e,href:a,className:t,variant:i="default",theme:o="auto"}){let l=r.jsx("div",{className:(0,n.cn)("font-bold text-primary",(()=>{switch(e){case"sm":return"w-20";case"lg":return"w-40";case"xl":return"w-80";case"2xl":return"w-[600px]";default:return"w-28"}})(),t),children:"icon"===i?r.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"145.29",height:"78.354",viewBox:"0 0 145.29 78.354",className:"w-full h-auto",children:(0,r.jsxs)("g",{id:"Group_1377","data-name":"Group 1377",transform:"translate(0)",children:[r.jsx("path",{id:"Path_885","data-name":"Path 885",d:"M80.664,59.008a6.663,6.663,0,0,1-.159-1.541c-.006-.5.022-.993.056-1.487a20.31,20.31,0,0,1,2.705-8.488A13.118,13.118,0,0,1,87.514,43a7.745,7.745,0,0,1,6.009-1.066.191.191,0,0,1,0,.368l0,0A10.833,10.833,0,0,0,88.9,44.863a18.447,18.447,0,0,0-3.181,4.1A47.879,47.879,0,0,0,83.244,53.8c-.386.839-.754,1.695-1.125,2.559-.2.43-.363.868-.554,1.306l-.267.659c-.09.213-.178.459-.24.633l-.025.07a.193.193,0,0,1-.248.114A.2.2,0,0,1,80.664,59.008Z",transform:"translate(-3.081 -5.835)",fill:"#2b304a"}),r.jsx("path",{id:"Path_886","data-name":"Path 886",d:"M81.873,58.957c-.063-.175-.149-.42-.241-.633l-.267-.659c-.189-.438-.354-.876-.554-1.306-.37-.865-.739-1.72-1.123-2.559a48.218,48.218,0,0,0-2.477-4.838,18.487,18.487,0,0,0-3.18-4.1A10.833,10.833,0,0,0,69.409,42.3l0,0a.191.191,0,0,1-.13-.236.2.2,0,0,1,.135-.132A7.74,7.74,0,0,1,75.416,43a13.118,13.118,0,0,1,4.248,4.5,20.309,20.309,0,0,1,2.705,8.488c.033.493.063.989.056,1.487a6.664,6.664,0,0,1-.159,1.541.193.193,0,0,1-.368.019Z",transform:"translate(-9.675 -5.835)",fill:"#2b304a"}),(0,r.jsxs)("g",{id:"Group_1284","data-name":"Group 1284",transform:"translate(0 57.147)",children:[r.jsx("path",{id:"Path_887","data-name":"Path 887",d:"M48.5,63.117V74.659a1.605,1.605,0,1,1-3.208,0V63.491c0-3.291-2.042-5.416-5.041-5.416a5.163,5.163,0,0,0-5.333,5.416V74.659a1.605,1.605,0,1,1-3.208,0V56.784a1.61,1.61,0,0,1,1.625-1.666,1.629,1.629,0,0,1,1.584,1.666v.749a8.317,8.317,0,0,1,6.041-2.415C45.586,55.118,48.5,58.242,48.5,63.117Z",transform:"translate(-31.711 -55.118)",fill:"#2b304a"}),r.jsx("path",{id:"Path_888","data-name":"Path 888",d:"M65.279,64.493V64.7a1.772,1.772,0,0,1-1.958,2H48.988a7.165,7.165,0,0,0,7.458,6.668,8.063,8.063,0,0,0,5.292-1.958,1.666,1.666,0,0,1,1.084-.459,1.378,1.378,0,0,1,1.415,1.415,1.862,1.862,0,0,1-.792,1.46,10.79,10.79,0,0,1-7.04,2.5,10.605,10.605,0,0,1-.376-21.207A8.984,8.984,0,0,1,65.279,64.493Zm-16.166-.625H61.986a5.747,5.747,0,0,0-6.041-5.833A6.918,6.918,0,0,0,49.113,63.867Z",transform:"translate(-23.53 -55.118)",fill:"#2b304a"}),r.jsx("path",{id:"Path_889","data-name":"Path 889",d:"M81.9,65.7A10.625,10.625,0,1,1,71.273,55.118,10.563,10.563,0,0,1,81.9,65.7Zm-17.959.043a7.267,7.267,0,0,0,7.293,7.582,7.631,7.631,0,1,0-7.293-7.582Z",transform:"translate(-14.732 -55.118)",fill:"#2b304a"}),r.jsx("path",{id:"Path_890","data-name":"Path 890",d:"M82.669,55.407H87.71a1.437,1.437,0,1,1,0,2.874H82.669V69.364c0,2.667,1.376,3.875,4.292,3.875.708,0,1.208-.084,1.666-.084a1.291,1.291,0,0,1,1.458,1.25,1.431,1.431,0,0,1-1.166,1.458,8.954,8.954,0,0,1-2.624.292c-4.418,0-6.834-2.333-6.834-6.583V58.281H77.377a1.438,1.438,0,1,1,0-2.874h2.083",transform:"translate(-5.796 -54.948)",fill:"#2b304a"}),r.jsx("path",{id:"Path_891","data-name":"Path 891",d:"M98.757,56.909a1.5,1.5,0,0,1-1.625,1.5,5.984,5.984,0,0,0-6.334,6v10.25a1.605,1.605,0,1,1-3.208,0V56.784a1.611,1.611,0,0,1,1.626-1.666A1.627,1.627,0,0,1,90.8,56.784v1.5a8.145,8.145,0,0,1,6.334-2.875A1.526,1.526,0,0,1,98.757,56.909Z",transform:"translate(1.076 -55.118)",fill:"#2b304a"}),r.jsx("path",{id:"Path_892","data-name":"Path 892",d:"M115.537,64.493V64.7a1.772,1.772,0,0,1-1.958,2H99.246a7.166,7.166,0,0,0,7.459,6.668A8.059,8.059,0,0,0,112,71.409a1.673,1.673,0,0,1,1.084-.459,1.379,1.379,0,0,1,1.417,1.415,1.862,1.862,0,0,1-.792,1.46,10.791,10.791,0,0,1-7.042,2.5,10.605,10.605,0,0,1-.374-21.207A8.984,8.984,0,0,1,115.537,64.493Zm-16.166-.625h12.875a5.748,5.748,0,0,0-6.041-5.833A6.921,6.921,0,0,0,99.372,63.867Z",transform:"translate(5.961 -55.118)",fill:"#2b304a"}),r.jsx("path",{id:"Path_893","data-name":"Path 893",d:"M130.531,64.493V64.7a1.772,1.772,0,0,1-1.958,2H114.24a7.166,7.166,0,0,0,7.459,6.668,8.059,8.059,0,0,0,5.29-1.958,1.67,1.67,0,0,1,1.084-.459,1.379,1.379,0,0,1,1.417,1.415,1.862,1.862,0,0,1-.792,1.46,10.791,10.791,0,0,1-7.042,2.5,10.605,10.605,0,0,1-.374-21.207A8.984,8.984,0,0,1,130.531,64.493Zm-16.166-.625H127.24a5.749,5.749,0,0,0-6.041-5.833A6.919,6.919,0,0,0,114.366,63.867Z",transform:"translate(14.758 -55.118)",fill:"#2b304a"})]}),r.jsx("path",{id:"Path_894","data-name":"Path 894",d:"M69.853,22.729a1.984,1.984,0,0,1,.4,1.282,1.935,1.935,0,0,1-.611,1.365,1.81,1.81,0,0,1-1.452.438,2.047,2.047,0,0,1-1.206-.592l1.142-.335a1.771,1.771,0,0,0,.719-.4A5.347,5.347,0,0,0,69.853,22.729Z",transform:"translate(-11.015 -16.976)",fill:"#70a487"}),r.jsx("path",{id:"Path_895","data-name":"Path 895",d:"M70.662,26.239a11.037,11.037,0,0,1,1.073-1.157c.178-.186.308-.428.551-.5a1.653,1.653,0,0,1,.911-.008.1.1,0,0,1,.075.092,1.338,1.338,0,0,1-.309.9,1.393,1.393,0,0,1-.724.328,15.275,15.275,0,0,1-1.509.447.063.063,0,0,1-.078-.043A.069.069,0,0,1,70.662,26.239Z",transform:"translate(-8.864 -15.929)",fill:"#70a487"}),r.jsx("path",{id:"Path_896","data-name":"Path 896",d:"M72.955,21.678a1.327,1.327,0,0,1-.068,1.092,1.433,1.433,0,0,1-.993.754,1.536,1.536,0,0,1-1.173-.27,1.584,1.584,0,0,1-.6-.889,9.644,9.644,0,0,0,1.549-.008A3.35,3.35,0,0,0,72.955,21.678Z",transform:"translate(-9.176 -17.592)",fill:"#70a487"}),r.jsx("path",{id:"Path_897","data-name":"Path 897",d:"M81.24,26.792A13.745,13.745,0,0,0,78.51,22.63a7.648,7.648,0,0,0-4.118-2.34,7.9,7.9,0,0,0-4.6.687,10.032,10.032,0,0,0-3.757,2.717,8.985,8.985,0,0,0-1.479,8.549,7.885,7.885,0,0,0,6.184,5.476,1.318,1.318,0,0,1,1.084.982l.019.071a12.176,12.176,0,0,0,3.956,5.99,20.038,20.038,0,0,0,6.525,3.74c4.775,1.785,10.049,1.176,14.774-.8a23.673,23.673,0,0,0,6.414-4.113,20.209,20.209,0,0,0,2.585-2.78,14.245,14.245,0,0,0,1.89-3.166,5.645,5.645,0,0,0,.408-3.213,5.01,5.01,0,0,0-1.661-2.739,11.55,11.55,0,0,0-6.764-2.6l.168-.013a48.305,48.305,0,0,1-7.551.073c-1.242-.083-2.48-.187-3.713-.325l-1.845-.217a4.589,4.589,0,0,0-1.718-.027,15.026,15.026,0,0,0-6.3,3.351,11.97,11.97,0,0,0-2.417,2.707,4.6,4.6,0,0,0-.76,3.478,4.717,4.717,0,0,1,.557-3.594,12.335,12.335,0,0,1,2.306-2.937,15.473,15.473,0,0,1,6.452-3.811,6.707,6.707,0,0,1,1.956-.108l1.839.04c1.227.016,2.45,0,3.67-.036a53.618,53.618,0,0,0,7.2-.592.926.926,0,0,1,.148-.013h.021a13.292,13.292,0,0,1,8.353,2.751,7.582,7.582,0,0,1,2.658,4.022,8.228,8.228,0,0,1-.4,4.792c-2.329,5.611-7,9.549-12.25,11.917a25.592,25.592,0,0,1-8.4,2.122,20.71,20.71,0,0,1-8.649-1.25,21.868,21.868,0,0,1-7.488-4.446,14.962,14.962,0,0,1-4.646-7.6l1.1,1.054a9.839,9.839,0,0,1-5.093-2.648,10.939,10.939,0,0,1-2.842-4.857A10.542,10.542,0,0,1,69.3,19.7a9.073,9.073,0,0,1,5.3-.341,8.4,8.4,0,0,1,4.314,2.916A13.477,13.477,0,0,1,81.24,26.792Z",transform:"translate(-14.001 -19.103)",fill:"#70a487"})]})}):(0,r.jsxs)(r.Fragment,{children:[r.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"145.29",height:"78.354",viewBox:"0 0 145.29 78.354",className:(0,n.cn)("w-full h-auto","auto"===o?"dark:hidden":"light"!==o&&"hidden"),children:(0,r.jsxs)("g",{id:"Group_1377","data-name":"Group 1377",transform:"translate(0)",children:[r.jsx("path",{id:"Path_885","data-name":"Path 885",d:"M80.664,59.008a6.663,6.663,0,0,1-.159-1.541c-.006-.5.022-.993.056-1.487a20.31,20.31,0,0,1,2.705-8.488A13.118,13.118,0,0,1,87.514,43a7.745,7.745,0,0,1,6.009-1.066.191.191,0,0,1,0,.368l0,0A10.833,10.833,0,0,0,88.9,44.863a18.447,18.447,0,0,0-3.181,4.1A47.879,47.879,0,0,0,83.244,53.8c-.386.839-.754,1.695-1.125,2.559-.2.43-.363.868-.554,1.306l-.267.659c-.09.213-.178.459-.24.633l-.025.07a.193.193,0,0,1-.248.114A.2.2,0,0,1,80.664,59.008Z",transform:"translate(-3.081 -5.835)",fill:"#2b304a"}),r.jsx("path",{id:"Path_886","data-name":"Path 886",d:"M81.873,58.957c-.063-.175-.149-.42-.241-.633l-.267-.659c-.189-.438-.354-.876-.554-1.306-.37-.865-.739-1.72-1.123-2.559a48.218,48.218,0,0,0-2.477-4.838,18.487,18.487,0,0,0-3.18-4.1A10.833,10.833,0,0,0,69.409,42.3l0,0a.191.191,0,0,1-.13-.236.2.2,0,0,1,.135-.132A7.74,7.74,0,0,1,75.416,43a13.118,13.118,0,0,1,4.248,4.5,20.309,20.309,0,0,1,2.705,8.488c.033.493.063.989.056,1.487a6.664,6.664,0,0,1-.159,1.541.193.193,0,0,1-.368.019Z",transform:"translate(-9.675 -5.835)",fill:"#2b304a"}),(0,r.jsxs)("g",{id:"Group_1284","data-name":"Group 1284",transform:"translate(0 57.147)",children:[r.jsx("path",{id:"Path_887","data-name":"Path 887",d:"M48.5,63.117V74.659a1.605,1.605,0,1,1-3.208,0V63.491c0-3.291-2.042-5.416-5.041-5.416a5.163,5.163,0,0,0-5.333,5.416V74.659a1.605,1.605,0,1,1-3.208,0V56.784a1.61,1.61,0,0,1,1.625-1.666,1.629,1.629,0,0,1,1.584,1.666v.749a8.317,8.317,0,0,1,6.041-2.415C45.586,55.118,48.5,58.242,48.5,63.117Z",transform:"translate(-31.711 -55.118)",fill:"#2b304a"}),r.jsx("path",{id:"Path_888","data-name":"Path 888",d:"M65.279,64.493V64.7a1.772,1.772,0,0,1-1.958,2H48.988a7.165,7.165,0,0,0,7.458,6.668,8.063,8.063,0,0,0,5.292-1.958,1.666,1.666,0,0,1,1.084-.459,1.378,1.378,0,0,1,1.415,1.415,1.862,1.862,0,0,1-.792,1.46,10.79,10.79,0,0,1-7.04,2.5,10.605,10.605,0,0,1-.376-21.207A8.984,8.984,0,0,1,65.279,64.493Zm-16.166-.625H61.986a5.747,5.747,0,0,0-6.041-5.833A6.918,6.918,0,0,0,49.113,63.867Z",transform:"translate(-23.53 -55.118)",fill:"#2b304a"}),r.jsx("path",{id:"Path_889","data-name":"Path 889",d:"M81.9,65.7A10.625,10.625,0,1,1,71.273,55.118,10.563,10.563,0,0,1,81.9,65.7Zm-17.959.043a7.267,7.267,0,0,0,7.293,7.582,7.631,7.631,0,1,0-7.293-7.582Z",transform:"translate(-14.732 -55.118)",fill:"#2b304a"}),r.jsx("path",{id:"Path_890","data-name":"Path 890",d:"M82.669,55.407H87.71a1.437,1.437,0,1,1,0,2.874H82.669V69.364c0,2.667,1.376,3.875,4.292,3.875.708,0,1.208-.084,1.666-.084a1.291,1.291,0,0,1,1.458,1.25,1.431,1.431,0,0,1-1.166,1.458,8.954,8.954,0,0,1-2.624.292c-4.418,0-6.834-2.333-6.834-6.583V58.281H77.377a1.438,1.438,0,1,1,0-2.874h2.083",transform:"translate(-5.796 -54.948)",fill:"#2b304a"}),r.jsx("path",{id:"Path_891","data-name":"Path 891",d:"M98.757,56.909a1.5,1.5,0,0,1-1.625,1.5,5.984,5.984,0,0,0-6.334,6v10.25a1.605,1.605,0,1,1-3.208,0V56.784a1.611,1.611,0,0,1,1.626-1.666A1.627,1.627,0,0,1,90.8,56.784v1.5a8.145,8.145,0,0,1,6.334-2.875A1.526,1.526,0,0,1,98.757,56.909Z",transform:"translate(1.076 -55.118)",fill:"#2b304a"}),r.jsx("path",{id:"Path_892","data-name":"Path 892",d:"M115.537,64.493V64.7a1.772,1.772,0,0,1-1.958,2H99.246a7.166,7.166,0,0,0,7.459,6.668A8.059,8.059,0,0,0,112,71.409a1.673,1.673,0,0,1,1.084-.459,1.379,1.379,0,0,1,1.417,1.415,1.862,1.862,0,0,1-.792,1.46,10.791,10.791,0,0,1-7.042,2.5,10.605,10.605,0,0,1-.374-21.207A8.984,8.984,0,0,1,115.537,64.493Zm-16.166-.625h12.875a5.748,5.748,0,0,0-6.041-5.833A6.921,6.921,0,0,0,99.372,63.867Z",transform:"translate(5.961 -55.118)",fill:"#2b304a"}),r.jsx("path",{id:"Path_893","data-name":"Path 893",d:"M130.531,64.493V64.7a1.772,1.772,0,0,1-1.958,2H114.24a7.166,7.166,0,0,0,7.459,6.668,8.059,8.059,0,0,0,5.29-1.958,1.67,1.67,0,0,1,1.084-.459,1.379,1.379,0,0,1,1.417,1.415,1.862,1.862,0,0,1-.792,1.46,10.791,10.791,0,0,1-7.042,2.5,10.605,10.605,0,0,1-.374-21.207A8.984,8.984,0,0,1,130.531,64.493Zm-16.166-.625H127.24a5.749,5.749,0,0,0-6.041-5.833A6.919,6.919,0,0,0,114.366,63.867Z",transform:"translate(14.758 -55.118)",fill:"#2b304a"})]}),r.jsx("path",{id:"Path_894","data-name":"Path 894",d:"M69.853,22.729a1.984,1.984,0,0,1,.4,1.282,1.935,1.935,0,0,1-.611,1.365,1.81,1.81,0,0,1-1.452.438,2.047,2.047,0,0,1-1.206-.592l1.142-.335a1.771,1.771,0,0,0,.719-.4A5.347,5.347,0,0,0,69.853,22.729Z",transform:"translate(-11.015 -16.976)",fill:"#70a487"}),r.jsx("path",{id:"Path_895","data-name":"Path 895",d:"M70.662,26.239a11.037,11.037,0,0,1,1.073-1.157c.178-.186.308-.428.551-.5a1.653,1.653,0,0,1,.911-.008.1.1,0,0,1,.075.092,1.338,1.338,0,0,1-.309.9,1.393,1.393,0,0,1-.724.328,15.275,15.275,0,0,1-1.509.447.063.063,0,0,1-.078-.043A.069.069,0,0,1,70.662,26.239Z",transform:"translate(-8.864 -15.929)",fill:"#70a487"}),r.jsx("path",{id:"Path_896","data-name":"Path 896",d:"M72.955,21.678a1.327,1.327,0,0,1-.068,1.092,1.433,1.433,0,0,1-.993.754,1.536,1.536,0,0,1-1.173-.27,1.584,1.584,0,0,1-.6-.889,9.644,9.644,0,0,0,1.549-.008A3.35,3.35,0,0,0,72.955,21.678Z",transform:"translate(-9.176 -17.592)",fill:"#70a487"}),r.jsx("path",{id:"Path_897","data-name":"Path 897",d:"M81.24,26.792A13.745,13.745,0,0,0,78.51,22.63a7.648,7.648,0,0,0-4.118-2.34,7.9,7.9,0,0,0-4.6.687,10.032,10.032,0,0,0-3.757,2.717,8.985,8.985,0,0,0-1.479,8.549,7.885,7.885,0,0,0,6.184,5.476,1.318,1.318,0,0,1,1.084.982l.019.071a12.176,12.176,0,0,0,3.956,5.99,20.038,20.038,0,0,0,6.525,3.74c4.775,1.785,10.049,1.176,14.774-.8a23.673,23.673,0,0,0,6.414-4.113,20.209,20.209,0,0,0,2.585-2.78,14.245,14.245,0,0,0,1.89-3.166,5.645,5.645,0,0,0,.408-3.213,5.01,5.01,0,0,0-1.661-2.739,11.55,11.55,0,0,0-6.764-2.6l.168-.013a48.305,48.305,0,0,1-7.551.073c-1.242-.083-2.48-.187-3.713-.325l-1.845-.217a4.589,4.589,0,0,0-1.718-.027,15.026,15.026,0,0,0-6.3,3.351,11.97,11.97,0,0,0-2.417,2.707,4.6,4.6,0,0,0-.76,3.478,4.717,4.717,0,0,1,.557-3.594,12.335,12.335,0,0,1,2.306-2.937,15.473,15.473,0,0,1,6.452-3.811,6.707,6.707,0,0,1,1.956-.108l1.839.04c1.227.016,2.45,0,3.67-.036a53.618,53.618,0,0,0,7.2-.592.926.926,0,0,1,.148-.013h.021a13.292,13.292,0,0,1,8.353,2.751,7.582,7.582,0,0,1,2.658,4.022,8.228,8.228,0,0,1-.4,4.792c-2.329,5.611-7,9.549-12.25,11.917a25.592,25.592,0,0,1-8.4,2.122,20.71,20.71,0,0,1-8.649-1.25,21.868,21.868,0,0,1-7.488-4.446,14.962,14.962,0,0,1-4.646-7.6l1.1,1.054a9.839,9.839,0,0,1-5.093-2.648,10.939,10.939,0,0,1-2.842-4.857A10.542,10.542,0,0,1,69.3,19.7a9.073,9.073,0,0,1,5.3-.341,8.4,8.4,0,0,1,4.314,2.916A13.477,13.477,0,0,1,81.24,26.792Z",transform:"translate(-14.001 -19.103)",fill:"#70a487"})]})}),r.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"145.29",height:"78.354",viewBox:"0 0 145.29 78.354",className:(0,n.cn)("w-full h-auto","auto"===o?"hidden dark:hidden":"dark"!==o&&"hidden"),children:(0,r.jsxs)("g",{id:"Group_1378","data-name":"Group 1378",transform:"translate(0)",children:[r.jsx("path",{id:"Path_885","data-name":"Path 885",d:"M80.664,59.008a6.663,6.663,0,0,1-.159-1.541c-.006-.5.022-.993.056-1.487a20.31,20.31,0,0,1,2.705-8.488A13.118,13.118,0,0,1,87.514,43a7.745,7.745,0,0,1,6.009-1.066.191.191,0,0,1,0,.368l0,0A10.833,10.833,0,0,0,88.9,44.863a18.447,18.447,0,0,0-3.181,4.1A47.879,47.879,0,0,0,83.244,53.8c-.386.839-.754,1.695-1.125,2.559-.2.43-.363.868-.554,1.306l-.267.659c-.09.213-.178.459-.24.633l-.025.07a.193.193,0,0,1-.248.114A.2.2,0,0,1,80.664,59.008Z",transform:"translate(-3.081 -5.835)",fill:"#ffffff"}),r.jsx("path",{id:"Path_886","data-name":"Path 886",d:"M81.873,58.957c-.063-.175-.149-.42-.241-.633l-.267-.659c-.189-.438-.354-.876-.554-1.306-.37-.865-.739-1.72-1.123-2.559a48.218,48.218,0,0,0-2.477-4.838,18.487,18.487,0,0,0-3.18-4.1A10.833,10.833,0,0,0,69.409,42.3l0,0a.191.191,0,0,1-.13-.236.2.2,0,0,1,.135-.132A7.74,7.74,0,0,1,75.416,43a13.118,13.118,0,0,1,4.248,4.5,20.309,20.309,0,0,1,2.705,8.488c.033.493.063.989.056,1.487a6.664,6.664,0,0,1-.159,1.541.193.193,0,0,1-.368.019Z",transform:"translate(-9.675 -5.835)",fill:"#ffffff"}),(0,r.jsxs)("g",{id:"Group_1284","data-name":"Group 1284",transform:"translate(0 57.147)",children:[r.jsx("path",{id:"Path_887","data-name":"Path 887",d:"M48.5,63.117V74.659a1.605,1.605,0,1,1-3.208,0V63.491c0-3.291-2.042-5.416-5.041-5.416a5.163,5.163,0,0,0-5.333,5.416V74.659a1.605,1.605,0,1,1-3.208,0V56.784a1.61,1.61,0,0,1,1.625-1.666,1.629,1.629,0,0,1,1.584,1.666v.749a8.317,8.317,0,0,1,6.041-2.415C45.586,55.118,48.5,58.242,48.5,63.117Z",transform:"translate(-31.711 -55.118)",fill:"#ffffff"}),r.jsx("path",{id:"Path_888","data-name":"Path 888",d:"M65.279,64.493V64.7a1.772,1.772,0,0,1-1.958,2H48.988a7.165,7.165,0,0,0,7.458,6.668,8.063,8.063,0,0,0,5.292-1.958,1.666,1.666,0,0,1,1.084-.459,1.378,1.378,0,0,1,1.415,1.415,1.862,1.862,0,0,1-.792,1.46,10.79,10.79,0,0,1-7.04,2.5,10.605,10.605,0,0,1-.376-21.207A8.984,8.984,0,0,1,65.279,64.493Zm-16.166-.625H61.986a5.747,5.747,0,0,0-6.041-5.833A6.918,6.918,0,0,0,49.113,63.867Z",transform:"translate(-23.53 -55.118)",fill:"#ffffff"}),r.jsx("path",{id:"Path_889","data-name":"Path 889",d:"M81.9,65.7A10.625,10.625,0,1,1,71.273,55.118,10.563,10.563,0,0,1,81.9,65.7Zm-17.959.043a7.267,7.267,0,0,0,7.293,7.582,7.631,7.631,0,1,0-7.293-7.582Z",transform:"translate(-14.732 -55.118)",fill:"#ffffff"}),r.jsx("path",{id:"Path_890","data-name":"Path 890",d:"M82.669,55.407H87.71a1.437,1.437,0,1,1,0,2.874H82.669V69.364c0,2.667,1.376,3.875,4.292,3.875.708,0,1.208-.084,1.666-.084a1.291,1.291,0,0,1,1.458,1.25,1.431,1.431,0,0,1-1.166,1.458,8.954,8.954,0,0,1-2.624.292c-4.418,0-6.834-2.333-6.834-6.583V58.281H77.377a1.438,1.438,0,1,1,0-2.874h2.083",transform:"translate(-5.796 -54.948)",fill:"#ffffff"}),r.jsx("path",{id:"Path_891","data-name":"Path 891",d:"M98.757,56.909a1.5,1.5,0,0,1-1.625,1.5,5.984,5.984,0,0,0-6.334,6v10.25a1.605,1.605,0,1,1-3.208,0V56.784a1.611,1.611,0,0,1,1.626-1.666A1.627,1.627,0,0,1,90.8,56.784v1.5a8.145,8.145,0,0,1,6.334-2.875A1.526,1.526,0,0,1,98.757,56.909Z",transform:"translate(1.076 -55.118)",fill:"#ffffff"}),r.jsx("path",{id:"Path_892","data-name":"Path 892",d:"M115.537,64.493V64.7a1.772,1.772,0,0,1-1.958,2H99.246a7.166,7.166,0,0,0,7.459,6.668A8.059,8.059,0,0,0,112,71.409a1.673,1.673,0,0,1,1.084-.459,1.379,1.379,0,0,1,1.417,1.415,1.862,1.862,0,0,1-.792,1.46,10.791,10.791,0,0,1-7.042,2.5,10.605,10.605,0,0,1-.374-21.207A8.984,8.984,0,0,1,115.537,64.493Zm-16.166-.625h12.875a5.748,5.748,0,0,0-6.041-5.833A6.921,6.921,0,0,0,99.372,63.867Z",transform:"translate(5.961 -55.118)",fill:"#ffffff"}),r.jsx("path",{id:"Path_893","data-name":"Path 893",d:"M130.531,64.493V64.7a1.772,1.772,0,0,1-1.958,2H114.24a7.166,7.166,0,0,0,7.459,6.668,8.059,8.059,0,0,0,5.29-1.958,1.67,1.67,0,0,1,1.084-.459,1.379,1.379,0,0,1,1.417,1.415,1.862,1.862,0,0,1-.792,1.46,10.791,10.791,0,0,1-7.042,2.5,10.605,10.605,0,0,1-.374-21.207A8.984,8.984,0,0,1,130.531,64.493Zm-16.166-.625H127.24a5.749,5.749,0,0,0-6.041-5.833A6.919,6.919,0,0,0,114.366,63.867Z",transform:"translate(14.758 -55.118)",fill:"#ffffff"})]}),r.jsx("path",{id:"Path_894","data-name":"Path 894",d:"M69.853,22.729a1.984,1.984,0,0,1,.4,1.282,1.935,1.935,0,0,1-.611,1.365,1.81,1.81,0,0,1-1.452.438,2.047,2.047,0,0,1-1.206-.592l1.142-.335a1.771,1.771,0,0,0,.719-.4A5.347,5.347,0,0,0,69.853,22.729Z",transform:"translate(-11.015 -16.976)",fill:"#ffffff"}),r.jsx("path",{id:"Path_895","data-name":"Path 895",d:"M70.662,26.239a11.037,11.037,0,0,1,1.073-1.157c.178-.186.308-.428.551-.5a1.653,1.653,0,0,1,.911-.008.1.1,0,0,1,.075.092,1.338,1.338,0,0,1-.309.9,1.393,1.393,0,0,1-.724.328,15.275,15.275,0,0,1-1.509.447.063.063,0,0,1-.078-.043A.069.069,0,0,1,70.662,26.239Z",transform:"translate(-8.864 -15.929)",fill:"#ffffff"}),r.jsx("path",{id:"Path_896","data-name":"Path 896",d:"M72.955,21.678a1.327,1.327,0,0,1-.068,1.092,1.433,1.433,0,0,1-.993.754,1.536,1.536,0,0,1-1.173-.27,1.584,1.584,0,0,1-.6-.889,9.644,9.644,0,0,0,1.549-.008A3.35,3.35,0,0,0,72.955,21.678Z",transform:"translate(-9.176 -17.592)",fill:"#ffffff"}),r.jsx("path",{id:"Path_897","data-name":"Path 897",d:"M81.24,26.792A13.745,13.745,0,0,0,78.51,22.63a7.648,7.648,0,0,0-4.118-2.34,7.9,7.9,0,0,0-4.6.687,10.032,10.032,0,0,0-3.757,2.717,8.985,8.985,0,0,0-1.479,8.549,7.885,7.885,0,0,0,6.184,5.476,1.318,1.318,0,0,1,1.084.982l.019.071a12.176,12.176,0,0,0,3.956,5.99,20.038,20.038,0,0,0,6.525,3.74c4.775,1.785,10.049,1.176,14.774-.8a23.673,23.673,0,0,0,6.414-4.113,20.209,20.209,0,0,0,2.585-2.78,14.245,14.245,0,0,0,1.89-3.166,5.645,5.645,0,0,0,.408-3.213,5.01,5.01,0,0,0-1.661-2.739,11.55,11.55,0,0,0-6.764-2.6l.168-.013a48.305,48.305,0,0,1-7.551.073c-1.242-.083-2.48-.187-3.713-.325l-1.845-.217a4.589,4.589,0,0,0-1.718-.027,15.026,15.026,0,0,0-6.3,3.351,11.97,11.97,0,0,0-2.417,2.707,4.6,4.6,0,0,0-.76,3.478,4.717,4.717,0,0,1,.557-3.594,12.335,12.335,0,0,1,2.306-2.937,15.473,15.473,0,0,1,6.452-3.811,6.707,6.707,0,0,1,1.956-.108l1.839.04c1.227.016,2.45,0,3.67-.036a53.618,53.618,0,0,0,7.2-.592.926.926,0,0,1,.148-.013h.021a13.292,13.292,0,0,1,8.353,2.751,7.582,7.582,0,0,1,2.658,4.022,8.228,8.228,0,0,1-.4,4.792c-2.329,5.611-7,9.549-12.25,11.917a25.592,25.592,0,0,1-8.4,2.122,20.71,20.71,0,0,1-8.649-1.25,21.868,21.868,0,0,1-7.488-4.446,14.962,14.962,0,0,1-4.646-7.6l1.1,1.054a9.839,9.839,0,0,1-5.093-2.648,10.939,10.939,0,0,1-2.842-4.857A10.542,10.542,0,0,1,69.3,19.7a9.073,9.073,0,0,1,5.3-.341,8.4,8.4,0,0,1,4.314,2.916A13.477,13.477,0,0,1,81.24,26.792Z",transform:"translate(-14.001 -19.103)",fill:"#ffffff"})]})})]})});return a?r.jsx(s.default,{href:a,children:l}):l}},2946:(e,a,t)=>{"use strict";t.d(a,{z:()=>d});var r=t(19510),s=t(71159),n=t(43025),i=t(60791),o=t(50650);let l=(0,i.j)(`
    inline-flex
    items-center
    justify-center
    whitespace-nowrap
    rounded-md
    text-sm
    font-medium
    transition-colors
    focus-visible:outline-none
    disabled:pointer-events-none
    disabled:opacity-50
  `,{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/80",outline:"border border-input bg-background hover:bg-primary/20","primary-outline":"border border-primary text-primary bg-transparent hover:bg-primary/20",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/90",ghost:"hover:bg-primary/20 hover:text-primary",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),d=s.forwardRef(({className:e,variant:a,size:t,asChild:s=!1,...i},d)=>{let c=s?n.g7:"button";return r.jsx(c,{className:(0,o.cn)(l({variant:a,size:t,className:e})),ref:d,...i})});d.displayName="Button"},92237:(e,a,t)=>{"use strict";t.d(a,{_:()=>c,Q:()=>d});var r=t(57745),s=t(10413),n=t(57418),i=t(57435),o=t(71615);let l=()=>{let e=function(){let e=(0,o.headers)(),a=e.get("x-url"),t=e.get("x-next-url-host"),r=e.get("x-next-url-href"),s=e.get("x-next-url-port"),n=e.get("x-next-url-hostname"),i=e.get("x-next-url-pathname"),l=e.get("x-next-url-search"),d=e.get("x-next-url-protocol"),c=e.get("x-next-url-username"),f=e.get("x-next-url-locale"),m=e.get("x-next-url-origin"),h=e.get("x-geo-city"),u=e.get("x-geo-country");return{url:a||"",host:t||"",href:r||"",port:s||"",hostname:n||"",pathname:i||"",search:l||"",protocol:d||"",username:c||"",locale:f||"",origin:m||"",city:h||"",country:u||"",region:e.get("x-geo-region")||"",latitude:e.get("x-geo-latitude")||"",longitude:e.get("x-geo-longitude")||""}}();return{webeditor:{name:"Local editor",siteId:"fb76af5a-bf86-4050-821e-44f1bf316bf4",link:e.origin,type:"webeditor",apiKey:"localhost"},nodeapi:{name:"Local editor",siteId:"5cb4aa54-2cfe-49e2-9cdd-392a9b8c124e",link:e.origin,type:"webeditor",apiKey:"localhost"}}};async function d(e){try{let{types:a=[]}={...e},t=[...a.length?[(0,r.d3)(n.sites.type,a)]:[]],i=await s.Z.query.sites.findMany({where:t.length?(0,r.xD)(...t):void 0,columns:{siteId:!0,type:!0,name:!0,link:!0}});return l(),{data:[...i]}}catch(e){return i.Z.error("_getSites ERROR",e.message),{data:[],errors:[e.message]}}}async function c(e){try{let a=await s.Z.query.sites.findFirst({where:(0,r.eq)(n.sites.siteId,e),columns:{apiKey:!0,link:!0}}),t=a||null;if(!a){let a=l();Object.values(a).forEach(a=>{a.siteId===e&&(t={link:a.link,apiKey:a.apiKey})})}return{data:t}}catch(e){return i.Z.error("_getSiteApiKey ERROR",e.message),{data:null,errors:[e.message]}}}},3641:()=>{},50650:(e,a,t)=>{"use strict";t.d(a,{cn:()=>n});var r=t(55761),s=t(62386);function n(...e){return(0,s.m6)((0,r.W)(e))}},67272:()=>{}};