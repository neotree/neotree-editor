(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8940],{11459:function(e,t,r){Promise.resolve().then(r.bind(r,17081)),Promise.resolve().then(r.bind(r,25704))},17081:function(e,t,r){"use strict";r.d(t,{AdminHeader:function(){return m}});var n=r(57437),a=r(2265),o=r(42421),i=r(16463),s=r(87138),l=r(46910),d=r(50495),c=r(37440),u=r(64344);let f=[{label:"Dashboard",href:"/admin",section:"dashboard"},{label:"Emails",href:"/admin/emails",section:"emails"},{label:"System",href:"/admin/sys",section:"sys"},{label:"Logs",href:"/admin/logs",section:"logs"},{label:"App",href:"/admin/app",section:"app"}];function m(e){let{user:t}=e,r=(0,i.usePathname)(),m=(0,a.useMemo)(()=>{var e;let t=null===(e=f.filter(e=>e.href===r)[0])||void 0===e?void 0:e.section;return f.filter(e=>e.section===t)[0]||f[0]},[r]);return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)("div",{className:"flex gap-x-2 p-4",children:[(0,n.jsx)("div",{className:"text-2xl",children:"".concat(m.label)}),(0,n.jsx)("div",{className:"flex-1"}),(null==t?void 0:t.role)==="super_user"&&(0,n.jsx)(n.Fragment,{children:(0,n.jsx)("div",{children:(0,n.jsxs)(l.h_,{children:[(0,n.jsx)(l.$F,{asChild:!0,children:(0,n.jsxs)(d.z,{variant:"outline",children:[m.label,(0,n.jsx)(o.Z,{className:"ml-2 h-4 w-4 text-muted-foreground"})]})}),(0,n.jsx)(l.AW,{children:f.map(e=>(0,n.jsx)(l.Xi,{asChild:!0,className:(0,c.cn)("focus:bg-primary/20 focus:text-primary",m.section===e.section&&"bg-primary text-primary-foreground"),children:(0,n.jsx)(s.default,{href:e.href,children:e.label})},e.section))})]})})})]}),(0,n.jsx)(u.Z,{className:"my-5"})]})}},25704:function(e,t,r){"use strict";r.r(t),r.d(t,{Title:function(){return o}});var n=r(2265),a=r(20357);function o(e){let{children:t}=e;return(0,n.useEffect)(()=>{document.title=[a.env.NEXT_PUBLIC_APP_NAME,t].filter(e=>e).join(" - ")},[t]),(0,n.useEffect)(()=>()=>{document.title="".concat(a.env.NEXT_PUBLIC_APP_NAME)},[]),null}},50495:function(e,t,r){"use strict";r.d(t,{d:function(){return l},z:function(){return d}});var n=r(57437),a=r(2265),o=r(71538),i=r(12218),s=r(37440);let l=(0,i.j)("\n    inline-flex\n    items-center\n    justify-center\n    whitespace-nowrap\n    rounded-md\n    text-sm\n    font-medium\n    transition-colors\n    focus-visible:outline-none\n    disabled:pointer-events-none\n    disabled:opacity-50\n  ",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/80",outline:"border border-input bg-background hover:bg-primary/20","primary-outline":"border border-primary text-primary bg-transparent hover:bg-primary/20",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/90",ghost:"hover:bg-primary/20 hover:text-primary",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),d=a.forwardRef((e,t)=>{let{className:r,variant:a,size:i,asChild:d=!1,...c}=e,u=d?o.g7:"button";return(0,n.jsx)(u,{className:(0,s.cn)(l({variant:a,size:i,className:r})),ref:t,...c})});d.displayName="Button"},46910:function(e,t,r){"use strict";r.d(t,{$F:function(){return u},AW:function(){return f},Ju:function(){return p},VD:function(){return h},Xi:function(){return m},h_:function(){return c}});var n=r(57437),a=r(2265),o=r(81622),i=r(87592),s=r(22468),l=r(28165),d=r(37440);let c=o.fC,u=o.xz;o.ZA,o.Uv,o.Tr,o.Ee,a.forwardRef((e,t)=>{let{className:r,inset:a,children:s,...l}=e;return(0,n.jsxs)(o.fF,{ref:t,className:(0,d.cn)("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",a&&"pl-8",r),...l,children:[s,(0,n.jsx)(i.Z,{className:"ml-auto h-4 w-4"})]})}).displayName=o.fF.displayName,a.forwardRef((e,t)=>{let{className:r,...a}=e;return(0,n.jsx)(o.tu,{ref:t,className:(0,d.cn)("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",r),...a})}).displayName=o.tu.displayName;let f=a.forwardRef((e,t)=>{let{className:r,sideOffset:a=4,...i}=e;return(0,n.jsx)(o.Uv,{children:(0,n.jsx)(o.VY,{ref:t,sideOffset:a,className:(0,d.cn)("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",r),...i})})});f.displayName=o.VY.displayName;let m=a.forwardRef((e,t)=>{let{className:r,inset:a,...i}=e;return(0,n.jsx)(o.ck,{ref:t,className:(0,d.cn)("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",a&&"pl-8",r),...i})});m.displayName=o.ck.displayName,a.forwardRef((e,t)=>{let{className:r,children:a,checked:i,...l}=e;return(0,n.jsxs)(o.oC,{ref:t,className:(0,d.cn)("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",r),checked:i,...l,children:[(0,n.jsx)("span",{className:"absolute left-2 flex h-3.5 w-3.5 items-center justify-center",children:(0,n.jsx)(o.wU,{children:(0,n.jsx)(s.Z,{className:"h-4 w-4"})})}),a]})}).displayName=o.oC.displayName,a.forwardRef((e,t)=>{let{className:r,children:a,...i}=e;return(0,n.jsxs)(o.Rk,{ref:t,className:(0,d.cn)("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",r),...i,children:[(0,n.jsx)("span",{className:"absolute left-2 flex h-3.5 w-3.5 items-center justify-center",children:(0,n.jsx)(o.wU,{children:(0,n.jsx)(l.Z,{className:"h-2 w-2 fill-current"})})}),a]})}).displayName=o.Rk.displayName;let p=a.forwardRef((e,t)=>{let{className:r,inset:a,...i}=e;return(0,n.jsx)(o.__,{ref:t,className:(0,d.cn)("px-2 py-1.5 text-sm font-semibold",a&&"pl-8",r),...i})});p.displayName=o.__.displayName;let h=a.forwardRef((e,t)=>{let{className:r,...a}=e;return(0,n.jsx)(o.Z0,{ref:t,className:(0,d.cn)("-mx-1 my-1 h-px bg-muted",r),...a})});h.displayName=o.Z0.displayName},64344:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});var n=r(57437),a=r(2265),o=r(48484),i=r(37440);let s=a.forwardRef((e,t)=>{let{className:r,orientation:a="horizontal",decorative:s=!0,...l}=e;return(0,n.jsx)(o.f,{ref:t,decorative:s,orientation:a,className:(0,i.cn)("shrink-0 bg-border","horizontal"===a?"h-[1px] w-full":"h-full w-[1px]",r),...l})});s.displayName=o.f.displayName},37440:function(e,t,r){"use strict";r.d(t,{cn:function(){return o}});var n=r(44839),a=r(96164);function o(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return(0,a.m6)((0,n.W)(t))}},42421:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(78030).Z)("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},87138:function(e,t,r){"use strict";r.d(t,{default:function(){return a.a}});var n=r(231),a=r.n(n)},20357:function(e,t,r){"use strict";var n,a;e.exports=(null==(n=r.g.process)?void 0:n.env)&&"object"==typeof(null==(a=r.g.process)?void 0:a.env)?r.g.process:r(88081)},88081:function(e){!function(){var t={229:function(e){var t,r,n,a=e.exports={};function o(){throw Error("setTimeout has not been defined")}function i(){throw Error("clearTimeout has not been defined")}function s(e){if(t===setTimeout)return setTimeout(e,0);if((t===o||!t)&&setTimeout)return t=setTimeout,setTimeout(e,0);try{return t(e,0)}catch(r){try{return t.call(null,e,0)}catch(r){return t.call(this,e,0)}}}!function(){try{t="function"==typeof setTimeout?setTimeout:o}catch(e){t=o}try{r="function"==typeof clearTimeout?clearTimeout:i}catch(e){r=i}}();var l=[],d=!1,c=-1;function u(){d&&n&&(d=!1,n.length?l=n.concat(l):c=-1,l.length&&f())}function f(){if(!d){var e=s(u);d=!0;for(var t=l.length;t;){for(n=l,l=[];++c<t;)n&&n[c].run();c=-1,t=l.length}n=null,d=!1,function(e){if(r===clearTimeout)return clearTimeout(e);if((r===i||!r)&&clearTimeout)return r=clearTimeout,clearTimeout(e);try{r(e)}catch(t){try{return r.call(null,e)}catch(t){return r.call(this,e)}}}(e)}}function m(e,t){this.fun=e,this.array=t}function p(){}a.nextTick=function(e){var t=Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)t[r-1]=arguments[r];l.push(new m(e,t)),1!==l.length||d||s(f)},m.prototype.run=function(){this.fun.apply(null,this.array)},a.title="browser",a.browser=!0,a.env={},a.argv=[],a.version="",a.versions={},a.on=p,a.addListener=p,a.once=p,a.off=p,a.removeListener=p,a.removeAllListeners=p,a.emit=p,a.prependListener=p,a.prependOnceListener=p,a.listeners=function(e){return[]},a.binding=function(e){throw Error("process.binding is not supported")},a.cwd=function(){return"/"},a.chdir=function(e){throw Error("process.chdir is not supported")},a.umask=function(){return 0}}},r={};function n(e){var a=r[e];if(void 0!==a)return a.exports;var o=r[e]={exports:{}},i=!0;try{t[e](o,o.exports,n),i=!1}finally{i&&delete r[e]}return o.exports}n.ab="//";var a=n(229);e.exports=a}()},48484:function(e,t,r){"use strict";r.d(t,{f:function(){return d}});var n=r(2265),a=r(25171),o=r(57437),i="horizontal",s=["horizontal","vertical"],l=n.forwardRef((e,t)=>{let{decorative:r,orientation:n=i,...l}=e,d=s.includes(n)?n:i;return(0,o.jsx)(a.WV.div,{"data-orientation":d,...r?{role:"none"}:{"aria-orientation":"vertical"===d?d:void 0,role:"separator"},...l,ref:t})});l.displayName="Separator";var d=l}},function(e){e.O(0,[4868,5360,8429,659,231,7478,7023,1744],function(){return e(e.s=11459)}),_N_E=e.O()}]);