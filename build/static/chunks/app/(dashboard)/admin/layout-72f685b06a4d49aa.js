(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8940],{11459:function(e,t,r){Promise.resolve().then(r.bind(r,17081)),Promise.resolve().then(r.bind(r,25704))},17081:function(e,t,r){"use strict";r.d(t,{AdminHeader:function(){return m}});var n=r(57437),a=r(2265),s=r(42421),o=r(16463),i=r(87138),d=r(46910),l=r(50495),c=r(37440),u=r(64344);let f=[{label:"Dashboard",href:"/admin",section:"dashboard"},{label:"Emails",href:"/admin/emails",section:"emails"},{label:"System",href:"/admin/sys",section:"sys"},{label:"Logs",href:"/admin/logs",section:"logs"},{label:"App",href:"/admin/app",section:"app"}];function m(e){let{user:t}=e,r=(0,o.usePathname)(),m=(0,a.useMemo)(()=>{var e;let t=null===(e=f.filter(e=>e.href===r)[0])||void 0===e?void 0:e.section;return f.filter(e=>e.section===t)[0]||f[0]},[r]);return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)("div",{className:"flex gap-x-2 p-4",children:[(0,n.jsx)("div",{className:"text-2xl",children:"".concat(m.label)}),(0,n.jsx)("div",{className:"flex-1"}),(null==t?void 0:t.role)==="super_user"&&(0,n.jsx)(n.Fragment,{children:(0,n.jsx)("div",{children:(0,n.jsxs)(d.h_,{children:[(0,n.jsx)(d.$F,{asChild:!0,children:(0,n.jsxs)(l.z,{variant:"outline",children:[m.label,(0,n.jsx)(s.Z,{className:"ml-2 h-4 w-4 text-muted-foreground"})]})}),(0,n.jsx)(d.AW,{children:f.map(e=>(0,n.jsx)(d.Xi,{asChild:!0,className:(0,c.cn)("focus:bg-primary/20 focus:text-primary",m.section===e.section&&"bg-primary text-primary-foreground"),children:(0,n.jsx)(i.default,{href:e.href,children:e.label})},e.section))})]})})})]}),(0,n.jsx)(u.Z,{className:"my-5"})]})}},25704:function(e,t,r){"use strict";r.r(t),r.d(t,{Title:function(){return a}});var n=r(2265);function a(e){let{children:t}=e;return(0,n.useEffect)(()=>{document.title=["Neotree",t].filter(e=>e).join(" - ")},[t]),(0,n.useEffect)(()=>()=>{document.title="".concat("Neotree")},[]),null}},50495:function(e,t,r){"use strict";r.d(t,{d:function(){return d},z:function(){return l}});var n=r(57437),a=r(2265),s=r(71538),o=r(12218),i=r(37440);let d=(0,o.j)("\n    inline-flex\n    items-center\n    justify-center\n    whitespace-nowrap\n    rounded-md\n    text-sm\n    font-medium\n    transition-colors\n    focus-visible:outline-none\n    disabled:pointer-events-none\n    disabled:opacity-50\n  ",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/80",outline:"border border-input bg-background hover:bg-primary/20","primary-outline":"border border-primary text-primary bg-transparent hover:bg-primary/20",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/90",ghost:"hover:bg-primary/20 hover:text-primary",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),l=a.forwardRef((e,t)=>{let{className:r,variant:a,size:o,asChild:l=!1,...c}=e,u=l?s.g7:"button";return(0,n.jsx)(u,{className:(0,i.cn)(d({variant:a,size:o,className:r})),ref:t,...c})});l.displayName="Button"},46910:function(e,t,r){"use strict";r.d(t,{$F:function(){return u},AW:function(){return f},Ju:function(){return p},VD:function(){return h},Xi:function(){return m},h_:function(){return c}});var n=r(57437),a=r(2265),s=r(81622),o=r(87592),i=r(22468),d=r(28165),l=r(37440);let c=s.fC,u=s.xz;s.ZA,s.Uv,s.Tr,s.Ee,a.forwardRef((e,t)=>{let{className:r,inset:a,children:i,...d}=e;return(0,n.jsxs)(s.fF,{ref:t,className:(0,l.cn)("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",a&&"pl-8",r),...d,children:[i,(0,n.jsx)(o.Z,{className:"ml-auto h-4 w-4"})]})}).displayName=s.fF.displayName,a.forwardRef((e,t)=>{let{className:r,...a}=e;return(0,n.jsx)(s.tu,{ref:t,className:(0,l.cn)("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",r),...a})}).displayName=s.tu.displayName;let f=a.forwardRef((e,t)=>{let{className:r,sideOffset:a=4,...o}=e;return(0,n.jsx)(s.Uv,{children:(0,n.jsx)(s.VY,{ref:t,sideOffset:a,className:(0,l.cn)("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",r),...o})})});f.displayName=s.VY.displayName;let m=a.forwardRef((e,t)=>{let{className:r,inset:a,...o}=e;return(0,n.jsx)(s.ck,{ref:t,className:(0,l.cn)("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",a&&"pl-8",r),...o})});m.displayName=s.ck.displayName,a.forwardRef((e,t)=>{let{className:r,children:a,checked:o,...d}=e;return(0,n.jsxs)(s.oC,{ref:t,className:(0,l.cn)("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",r),checked:o,...d,children:[(0,n.jsx)("span",{className:"absolute left-2 flex h-3.5 w-3.5 items-center justify-center",children:(0,n.jsx)(s.wU,{children:(0,n.jsx)(i.Z,{className:"h-4 w-4"})})}),a]})}).displayName=s.oC.displayName,a.forwardRef((e,t)=>{let{className:r,children:a,...o}=e;return(0,n.jsxs)(s.Rk,{ref:t,className:(0,l.cn)("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",r),...o,children:[(0,n.jsx)("span",{className:"absolute left-2 flex h-3.5 w-3.5 items-center justify-center",children:(0,n.jsx)(s.wU,{children:(0,n.jsx)(d.Z,{className:"h-2 w-2 fill-current"})})}),a]})}).displayName=s.Rk.displayName;let p=a.forwardRef((e,t)=>{let{className:r,inset:a,...o}=e;return(0,n.jsx)(s.__,{ref:t,className:(0,l.cn)("px-2 py-1.5 text-sm font-semibold",a&&"pl-8",r),...o})});p.displayName=s.__.displayName;let h=a.forwardRef((e,t)=>{let{className:r,...a}=e;return(0,n.jsx)(s.Z0,{ref:t,className:(0,l.cn)("-mx-1 my-1 h-px bg-muted",r),...a})});h.displayName=s.Z0.displayName},64344:function(e,t,r){"use strict";r.d(t,{Z:function(){return i}});var n=r(57437),a=r(2265),s=r(48484),o=r(37440);let i=a.forwardRef((e,t)=>{let{className:r,orientation:a="horizontal",decorative:i=!0,...d}=e;return(0,n.jsx)(s.f,{ref:t,decorative:i,orientation:a,className:(0,o.cn)("shrink-0 bg-border","horizontal"===a?"h-[1px] w-full":"h-full w-[1px]",r),...d})});i.displayName=s.f.displayName},37440:function(e,t,r){"use strict";r.d(t,{cn:function(){return s}});var n=r(44839),a=r(96164);function s(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return(0,a.m6)((0,n.W)(t))}},42421:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(78030).Z)("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},87138:function(e,t,r){"use strict";r.d(t,{default:function(){return a.a}});var n=r(231),a=r.n(n)},16463:function(e,t,r){"use strict";var n=r(71169);r.o(n,"useParams")&&r.d(t,{useParams:function(){return n.useParams}}),r.o(n,"usePathname")&&r.d(t,{usePathname:function(){return n.usePathname}}),r.o(n,"useRouter")&&r.d(t,{useRouter:function(){return n.useRouter}}),r.o(n,"useSearchParams")&&r.d(t,{useSearchParams:function(){return n.useSearchParams}})},48484:function(e,t,r){"use strict";r.d(t,{f:function(){return l}});var n=r(2265),a=r(25171),s=r(57437),o="horizontal",i=["horizontal","vertical"],d=n.forwardRef((e,t)=>{let{decorative:r,orientation:n=o,...d}=e,l=i.includes(n)?n:o;return(0,s.jsx)(a.WV.div,{"data-orientation":l,...r?{role:"none"}:{"aria-orientation":"vertical"===l?l:void 0,role:"separator"},...d,ref:t})});d.displayName="Separator";var l=d}},function(e){e.O(0,[4868,5360,8429,7946,231,7478,7023,1744],function(){return e(e.s=11459)}),_N_E=e.O()}]);