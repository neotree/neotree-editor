(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7647],{13709:function(e,n,t){Promise.resolve().then(t.bind(t,32454)),Promise.resolve().then(t.bind(t,95229)),Promise.resolve().then(t.bind(t,25704))},44099:function(e,n,t){"use strict";t.d(n,{W:function(){return l}});var s=t(57437),a=t(37440);function l(e){let{children:n,header:t,footer:l,classes:r}=e;return(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)("div",{className:(0,a.cn)("flex flex-col fixed h-full w-full top-0 left-0 z-[999999] bg-background",null==r?void 0:r.bg),children:[(0,s.jsx)("div",{className:(0,a.cn)("flex-1 overflow-y-auto",t&&"pt-14",l&&"pb-14"),children:n}),!!t&&(0,s.jsx)("div",{className:(0,a.cn)("fixed top-0 h-14 w-full border-b border-b-border bg-background p-4 flex items-center gap-x-2",null==r?void 0:r.bg),children:t}),!!l&&(0,s.jsx)("div",{className:(0,a.cn)("fixed bottom-0 h-14 w-full border-t border-t-border bg-background p-4 flex items-center gap-x-2",null==r?void 0:r.bg),children:l})]})})}},32454:function(e,n,t){"use strict";t.d(n,{SessionForm:function(){return N}});var s=t(57437),a=t(2265),l=t(79512),r=t(99913),i=t(59061),o=t(63550),d=t(50121),c=t(37440),u=t(50495),f=t(76230),m=t(44099),x=t(31742),v=t(75944),p=t(36013),b=t(74697),g=t(76780);function h(e){return(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)("div",{className:(0,c.cn)("hidden overflow-y-auto md:flex md:flex-col md:gap-y-4 fixed top-14 right-0 bottom-0 bg-background w-[350px]","border-l border-l-border"),children:[(0,s.jsx)("div",{className:"px-4 py-2 flex justify-end border-b border-b-border",children:(0,s.jsx)(u.z,{size:"icon",variant:"ghost",className:"rounded-full",onClick:e.onX,children:(0,s.jsx)(b.Z,{className:"h-5 w-5"})})}),(0,s.jsx)(j,{...e})]})})}function j(e){var n,t,l,r,i;let{script:o,diagnoses:d,screens:u}=e,[f,m]=(0,a.useState)("screens");return o.data?(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)("div",{className:"flex flex-col gap-y-4",children:[(0,s.jsxs)("div",{className:"flex flex-col gap-y-1 mt-4 px-4 text-sm",children:[(0,s.jsxs)("div",{children:["Script ID: ",(0,s.jsx)("b",{children:(null===(n=o.data)||void 0===n?void 0:n.oldScriptId)||(null===(t=o.data)||void 0===t?void 0:t.scriptId)})]}),(0,s.jsxs)("div",{children:["Script Title: ",(0,s.jsx)("b",{children:null===(l=o.data)||void 0===l?void 0:l.title})]}),(0,s.jsxs)("div",{children:["Script Version: ",(0,s.jsx)("b",{children:null===(r=o.data)||void 0===r?void 0:r.version})]}),(0,s.jsxs)("div",{children:["Hospital: ",(0,s.jsx)("b",{children:null===(i=o.data)||void 0===i?void 0:i.hospitalName})]})]}),(0,s.jsx)(x.Tabs,{options:[{value:"screens",label:"Screens"},{value:"diagnoses",label:"diagnoses"}],onChange:m}),(0,s.jsxs)("div",{children:["screens"===f&&(0,s.jsx)(v.DataTable,{columns:[{name:"Title"},{name:"Type"},{name:""}],data:u.data.map(e=>[e.title,e.type])}),"diagnoses"===f&&(0,s.jsx)(v.DataTable,{columns:[{name:"Name"},{name:""}],data:d.data.map(e=>[e.name,""])})]})]})}):(0,s.jsx)("div",{className:"p-4",children:(0,s.jsx)(p.Zb,{children:(0,s.jsxs)(p.aY,{className:(0,c.cn)("p-4 text-xl text-center text-danger bg-danger/10","flex flex-col justify-center items-center"),children:[(0,s.jsx)(g.Z,{className:"w-12 h-12"}),(0,s.jsx)("span",{children:"Script not found!"})]})})})}function N(e){let{session:n,script:t,diagnoses:x,screens:v}=e,{theme:p}=(0,l.F)(),{confirm:b}=(0,f.t)(),[g,j]=(0,a.useState)(JSON.stringify(n.data,null,4)),[N,y]=(0,a.useState)(!0),[w,C]=(0,a.useState)(!1),k=(0,a.useMemo)(()=>g!==JSON.stringify(n.data,null,4),[n.data,g]);return(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)(m.W,{header:(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("div",{children:["UID: ",(0,s.jsx)("b",{children:n.data.uid})]}),(0,s.jsx)("div",{className:"flex-1"}),N?(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)(u.z,{variant:"ghost",onClick:()=>y(!1),children:[(0,s.jsx)(r.Z,{className:"h-4 w-4 mr-2"}),"Edit"]})}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(u.z,{variant:"link",className:"text-danger hover:text-danger",onClick:()=>{let e=()=>{y(!0),j(JSON.stringify(n.data,null,4))};k?b(e,{danger:!0,title:"Cancel",message:"Are you sure you want to cancel? Your changes will be lost!",positiveLabel:"Yes, cancel"}):e()},children:"Cancel"}),(0,s.jsxs)(u.z,{children:[(0,s.jsx)(i.Z,{className:"h-4 w-4 mr-2"}),"Save"]})]}),w&&(0,s.jsx)("div",{className:"hidden md:block",children:(0,s.jsx)(u.z,{variant:"ghost",className:"text-primary",onClick:()=>C(!1),children:(0,s.jsx)(o.Z,{className:"h-6 w-6"})})})]}),children:[!w&&(0,s.jsx)(h,{...e,onX:()=>C(!0)}),(0,s.jsx)("div",{className:(0,c.cn)(!w&&"md:pr-[350px]"),children:(0,s.jsx)(d.Z,{value:g,language:"json",placeholder:"Enter JSON",onChange:e=>j(e.target.value),padding:15,disabled:N,"data-color-mode":p||"light",style:{fontFamily:"ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace"}})})]})})}},95229:function(e,n,t){"use strict";t.d(n,{Alert:function(){return r}});var s=t(53699),a=t(16463),l=t(2265);function r(e){let n=(0,a.useRouter)(),{alert:t}=(0,s.s)();return(0,l.useEffect)(()=>{let{redirectTo:s,onClose:a,...l}=e;t({...l,variant:l.variant||"error",buttonLabel:l.buttonLabel||"Ok",onClose:()=>{null==a||a(),s&&n.replace(s)}})},[t,n,e]),null}},31742:function(e,n,t){"use strict";t.d(n,{Tabs:function(){return x}});var s=t(57437),a=t(2265),l=t(87138),r=t(62447),i=t(37440);let o=r.fC,d=a.forwardRef((e,n)=>{let{className:t,...a}=e;return(0,s.jsx)(r.aV,{ref:n,className:(0,i.cn)("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",t),...a})});d.displayName=r.aV.displayName;let c=a.forwardRef((e,n)=>{let{className:t,...a}=e;return(0,s.jsx)(r.xz,{ref:n,className:(0,i.cn)("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",t),...a})});c.displayName=r.xz.displayName;let u=a.forwardRef((e,n)=>{let{className:t,...a}=e;return(0,s.jsx)(r.VY,{ref:n,className:(0,i.cn)("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",t),...a})});u.displayName=r.VY.displayName;var f=t(23733),m=t(12491);function x(e){let{options:n,searchParamsKey:t,onChange:r}=e,i=(0,a.useRef)(null),[x,v]=(0,a.useState)(0),p=(0,f.l)(),b=(0,a.useMemo)(()=>t?p.parsed[t]:null,[p.parsed,t]),g=(0,a.useMemo)(()=>{var e;return(null===(e=n.filter(e=>e.value===b)[0])||void 0===e?void 0:e.value)||n[0].value},[b,n]),h=(0,a.useMemo)(()=>!!t,[t]);return(0,a.useEffect)(()=>{x&&setTimeout(()=>{window.scrollTo({top:x}),v(0)},100)},[x]),(0,s.jsx)("div",{ref:i,children:(0,s.jsxs)(o,{defaultValue:g,className:"w-full [&>div]:w-full",onValueChange:r,children:[(0,s.jsx)(d,{children:n.map(e=>(0,s.jsx)(c,{asChild:h,value:e.value,className:"flex-1",onClick:()=>{var e,n;return v((null===(n=i.current)||void 0===n?void 0:null===(e=n.getBoundingClientRect())||void 0===e?void 0:e.top)||0)},children:h?(0,s.jsx)(l.default,{href:"?".concat(m.Z.stringify({...p.parsed,[t]:e.value})),children:e.label}):e.label},e.value))}),n.map(e=>(0,s.jsx)(u,{value:e.value,className:"hidden"},e.value))]})})}},25704:function(e,n,t){"use strict";t.r(n),t.d(n,{Title:function(){return a}});var s=t(2265);function a(e){let{children:n}=e;return(0,s.useEffect)(()=>{document.title=["Neotree",n].filter(e=>e).join(" - ")},[n]),(0,s.useEffect)(()=>()=>{document.title="".concat("Neotree")},[]),null}},36013:function(e,n,t){"use strict";t.d(n,{Zb:function(){return r},aY:function(){return i}});var s=t(57437),a=t(2265),l=t(37440);let r=a.forwardRef((e,n)=>{let{className:t,...a}=e;return(0,s.jsx)("div",{ref:n,className:(0,l.cn)("rounded-lg border bg-card text-card-foreground shadow-sm",t),...a})});r.displayName="Card",a.forwardRef((e,n)=>{let{className:t,...a}=e;return(0,s.jsx)("div",{ref:n,className:(0,l.cn)("flex flex-col space-y-1.5 p-6",t),...a})}).displayName="CardHeader",a.forwardRef((e,n)=>{let{className:t,...a}=e;return(0,s.jsx)("h3",{ref:n,className:(0,l.cn)("text-2xl font-semibold leading-none tracking-tight",t),...a})}).displayName="CardTitle",a.forwardRef((e,n)=>{let{className:t,...a}=e;return(0,s.jsx)("p",{ref:n,className:(0,l.cn)("text-sm text-muted-foreground",t),...a})}).displayName="CardDescription";let i=a.forwardRef((e,n)=>{let{className:t,...a}=e;return(0,s.jsx)("div",{ref:n,className:(0,l.cn)("p-6 pt-0",t),...a})});i.displayName="CardContent",a.forwardRef((e,n)=>{let{className:t,...a}=e;return(0,s.jsx)("div",{ref:n,className:(0,l.cn)("flex items-center p-6 pt-0",t),...a})}).displayName="CardFooter"},53699:function(e,n,t){"use strict";t.d(n,{s:function(){return l}});var s=t(39099);let a={title:"",message:"",buttonLabel:"Ok",variant:"info",onClose:void 0},l=(0,s.Ue)(e=>({isOpen:!1,...a,alert:n=>e({isOpen:!0,...a,...n}),close:()=>e({isOpen:!1,onClose:void 0,...a})}))},76230:function(e,n,t){"use strict";t.d(n,{t:function(){return l}});var s=t(39099);let a={danger:!1,title:"Confirm",message:"Are you sure?",positiveLabel:"Ok",negativeLabel:"Cancel"},l=(0,s.Ue)(e=>({isOpen:!1,...a,confirm:(n,t)=>e({isOpen:!0,...a,...t,onConfirm:n}),close:()=>e({isOpen:!1,onConfirm:void 0,...a})}))}},function(e){e.O(0,[8362,4868,5360,8429,2592,7946,9343,1072,231,5564,5944,7478,7023,1744],function(){return e(e.s=13709)}),_N_E=e.O()}]);