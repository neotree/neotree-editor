"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2477],{84760:function(e,t,n){n.d(t,{D:function(){return s}});var r=n(57437),a=n(37440);function s(e){let{children:t,className:n}=e;return(0,r.jsx)("div",{className:(0,a.cn)("pb-1 border-b border-b-primary",n),children:(0,r.jsx)("span",{className:"uppercase text-primary text-sm",children:t})})}},39661:function(e,t,n){n.d(t,{a:function(){return s}});var r=n(57437),a=n(89627);function s(e){let{overlay:t,transparent:n}=e;return(0,r.jsx)(r.Fragment,{children:(0,r.jsx)("div",{style:{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",...t?{height:"100%",position:"fixed",top:0,left:0,bottom:0,zIndex:999,backgroundColor:n?"transparent":"rgba(255,255,255,.6)"}:{padding:"50px 0"}},children:(0,r.jsx)(a.Z,{style:{height:24,width:24},className:"animate-spin"})})})}},9704:function(e,t,n){n.d(t,{u:function(){return l}});var r=n(57437),a=n(90837),s=n(37440);function l(e){let{children:t,title:n,description:l,actions:i,trigger:o,contentProps:c,footerProps:u,...d}=e;return(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)(a.Vq,{...d,children:[o,(0,r.jsxs)(a.cZ,{hideCloseButton:!0,className:(0,s.cn)("flex flex-col max-h-[90%] gap-y-4 p-0 m-0 sm:max-w-xl",null==c?void 0:c.className),...c,children:[(0,r.jsxs)(a.fK,{className:(0,s.cn)(n||l?"":"hidden","border-b border-b-border px-4 py-4"),children:[(0,r.jsx)(a.$N,{className:(0,s.cn)(n?"":"hidden"),children:n}),(0,r.jsx)(a.Be,{className:(0,s.cn)(l?"":"hidden"),children:l})]}),(0,r.jsx)("div",{className:"flex-1 flex flex-col overflow-y-auto px-4 py-2",children:t}),(0,r.jsx)(a.cN,{className:(0,s.cn)("border-t border-t-border px-4 py-2 items-center w-full",i?"":"hidden",null==u?void 0:u.className),...u,children:i})]})]})})}},58502:function(e,t,n){n.d(t,{SocketEventsListener:function(){return l}});var r=n(2265),a=n(16463),s=n(7752);function l(e){let{events:t}=e,n=(0,r.useRef)({eventsTimeouts:{},eventsTimestamps:{}});(0,r.useRef)(new Date().getTime());let l=(0,a.useRouter)();return(0,r.useEffect)(()=>{t.forEach(e=>{let{name:t,action:r,delay:a=100,onEvent:i}=e;s.Z.on(t,function(){for(var e=arguments.length,s=Array(e),o=0;o<e;o++)s[o]=arguments[o];let c=()=>{var e,n;(!r||s[0]===r)&&(null===(e=i.callback)||void 0===e||e.call(i,...s),(null==i?void 0:i.refreshRouter)&&(console.log(t,"refreshing..."),l.refresh()),(null===(n=i.redirect)||void 0===n?void 0:n.to)&&(i.redirect.replace?l.replace(i.redirect.to):l.push(i.redirect.to)))},u=new Date().getTime();a?(clearTimeout(n.current.eventsTimeouts[t]),n.current.eventsTimeouts[t]=setTimeout(()=>{n.current.eventsTimestamps[t]=u,c()},a)):(n.current.eventsTimestamps[t]=new Date().getTime(),c())})})},[t,l]),null}},25704:function(e,t,n){n.r(t),n.d(t,{Title:function(){return s}});var r=n(2265),a=n(20357);function s(e){let{children:t}=e;return(0,r.useEffect)(()=>{document.title=[a.env.NEXT_PUBLIC_APP_NAME,t].filter(e=>e).join(" - ")},[t]),(0,r.useEffect)(()=>()=>{document.title="".concat(a.env.NEXT_PUBLIC_APP_NAME)},[]),null}},90837:function(e,t,n){n.d(t,{$N:function(){return x},Be:function(){return v},GG:function(){return d},Vq:function(){return o},cN:function(){return g},cZ:function(){return m},fK:function(){return p},hg:function(){return c}});var r=n(57437),a=n(2265),s=n(13304),l=n(74697),i=n(37440);let o=s.fC,c=s.xz,u=s.h_,d=s.x8,f=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)(s.aV,{ref:t,className:(0,i.cn)("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",n),...a})});f.displayName=s.aV.displayName;let m=a.forwardRef((e,t)=>{let{className:n,children:a,hideCloseButton:o,...c}=e;return(0,r.jsxs)(u,{children:[(0,r.jsx)(f,{}),(0,r.jsxs)(s.VY,{ref:t,className:(0,i.cn)("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",n),...c,children:[a,!0!==o&&(0,r.jsxs)(s.x8,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",children:[(0,r.jsx)(l.Z,{className:"h-4 w-4"}),(0,r.jsx)("span",{className:"sr-only",children:"Close"})]})]})]})});m.displayName=s.VY.displayName;let p=e=>{let{className:t,...n}=e;return(0,r.jsx)("div",{className:(0,i.cn)("flex flex-col space-y-1.5 text-center sm:text-left",t),...n})};p.displayName="DialogHeader";let g=e=>{let{className:t,...n}=e;return(0,r.jsx)("div",{className:(0,i.cn)("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",t),...n})};g.displayName="DialogFooter";let x=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)(s.Dx,{ref:t,className:(0,i.cn)("text-lg font-semibold leading-none tracking-tight",n),...a})});x.displayName=s.Dx.displayName;let v=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)(s.dk,{ref:t,className:(0,i.cn)("text-sm text-muted-foreground",n),...a})});v.displayName=s.dk.displayName},67135:function(e,t,n){n.d(t,{_:function(){return c}});var r=n(57437),a=n(2265),s=n(38364),l=n(12218),i=n(37440);let o=(0,l.j)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),c=a.forwardRef((e,t)=>{let{className:n,secondary:a,error:l,...c}=e;return(0,r.jsx)(s.f,{ref:t,className:(0,i.cn)(o(),a&&"text-xs",l?"text-danger":"",n),...c})});c.displayName=s.f.displayName},85070:function(e,t,n){n.d(t,{E:function(){return o},m:function(){return c}});var r=n(57437),a=n(2265),s=n(99497),l=n(28165),i=n(37440);let o=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)(s.fC,{className:(0,i.cn)("grid gap-2",n),...a,ref:t})});o.displayName=s.fC.displayName;let c=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)(s.ck,{ref:t,className:(0,i.cn)("aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",n),...a,children:(0,r.jsx)(s.z$,{className:"flex items-center justify-center",children:(0,r.jsx)(l.Z,{className:"h-2.5 w-2.5 fill-current text-current"})})})});c.displayName=s.ck.displayName},93146:function(e,t,n){n.d(t,{g:function(){return l}});var r=n(57437),a=n(2265),s=n(37440);let l=a.forwardRef((e,t)=>{let{className:n,noRing:a,...l}=e;return(0,r.jsx)("textarea",{className:(0,s.cn)("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",a&&"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",n),ref:t,...l})});l.displayName="Textarea"},83146:function(e,t,n){n.d(t,{Tf:function(){return a},m1:function(){return r},ph:function(){return s}});let r=[{label:"Admission",value:"admission"},{label:"Discharge",value:"discharge"},{label:"Neolab",value:"neolab"}],a=[{value:"checklist",label:"Checklist"},{value:"form",label:"Form"},{value:"management",label:"Management"},{value:"multi_select",label:"Multiple choice list"},{value:"single_select",label:"Single choice list"},{value:"progress",label:"Progress"},{value:"timer",label:"Timer"},{value:"yesno",label:"Yes/No"},{value:"zw_edliz_summary_table",label:"EDLIZ summary table (ZW)"},{value:"mwi_edliz_summary_table",label:"EDLIZ summary table (MWI)"},{value:"diagnosis",label:"Diagnosis"}],s=[{value:"risk",label:"Risk factor"},{value:"sign",label:"Sign/Symptom"}]},17647:function(e,t,n){n.d(t,{AppContextProvider:function(){return v},b:function(){return x}});var r=n(57437),a=n(2265),s=n(79512),l=n(16463),i=n(23314),o=n(44785);let c=o.Z.get,u=o.Z.set;o.Z.remove;var d={get:c,set:u};function f(){let e=d.get("mode");return e||(e="view",d.set("mode",e,{expires:31536e7})),e}var m=n(7752),p=n(58502);let g=(0,a.createContext)(null),x=()=>(0,a.useContext)(g);function v(e){let{children:t,...n}=e,o=function(e){(0,l.useRouter)();let{isAdmin:t,isSuperUser:n,sys:r}=e,{setTheme:i}=(0,s.F)();(0,a.useEffect)(()=>{"yes"===r.data.hide_theme_toggle&&i("light")},[r]);let o=(0,a.useCallback)(()=>(t||n?f():"view")||"view",[n,t]),[c,u]=(0,a.useState)(o()),p=!t&&!n||"view"===c,g=(0,a.useCallback)(function(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];let r=function(e){return d.set("mode",e,{expires:31536e7}),f()}(...t);return m.Z.emit("mode_changed",o()),u(o()),r},[o]),x=(0,a.useCallback)(()=>{u(o())},[o]);return{...e,mode:c,viewOnly:p,onModeChange:x,getMode:f,setMode:g}}(n),[c,u]=(0,a.useState)(!1);return((0,i.Z)(()=>{u(!0)}),c)?(0,r.jsxs)(g.Provider,{value:o,children:[t,(0,r.jsx)(p.SocketEventsListener,{events:[{name:"mode_changed",onEvent:{callback:o.onModeChange}}]})]}):null}},15701:function(e,t,n){n.d(t,{ScriptsContextProvider:function(){return u},h:function(){return c}});var r=n(57437),a=n(2265),s=n(16463),l=n(12491),i=n(23733);let o=(0,a.createContext)(null),c=()=>(0,a.useContext)(o);function u(e){let{children:t,...n}=e,c=function(e){let{}=e,t=(0,s.useRouter)(),{scriptId:n}=(0,s.useParams)(),{parsed:r}=(0,i.l)(),o=(0,a.useCallback)(()=>{t.push("/")},[t]),c=(0,a.useCallback)(()=>{t.push("/script/".concat(n,"?").concat(l.Z.stringify({...r,section:"screens"})))},[t,r,n]);return{onCancelDiagnosisForm:(0,a.useCallback)(()=>{t.push("/script/".concat(n,"?").concat(l.Z.stringify({...r,section:"diagnoses"})))},[t,r,n]),onCancelScreenForm:c,onCancelScriptForm:o}}(n);return(0,r.jsx)(o.Provider,{value:{...n,...c},children:t})}},53699:function(e,t,n){n.d(t,{s:function(){return s}});var r=n(39099);let a={title:"",message:"",buttonLabel:"Ok",variant:"info",onClose:void 0},s=(0,r.Ue)(e=>({isOpen:!1,...a,alert:t=>e({isOpen:!0,...a,...t}),close:()=>e({isOpen:!1,onClose:void 0,...a})}))},76230:function(e,t,n){n.d(t,{t:function(){return s}});var r=n(39099);let a={danger:!1,title:"Confirm",message:"Are you sure?",positiveLabel:"Ok",negativeLabel:"Cancel"},s=(0,r.Ue)(e=>({isOpen:!1,...a,confirm:(t,n)=>e({isOpen:!0,...a,...n,onConfirm:t}),close:()=>e({isOpen:!1,onConfirm:void 0,...a})}))},21453:function(e,t,n){n.d(t,{x:function(){return r}});function r(e){return null==e||""===e}},7752:function(e,t,n){var r=n(34999),a=n(20357);let s=(0,r.io)(a.env.NEXT_PUBLIC_APP_URL);t.Z=s}}]);