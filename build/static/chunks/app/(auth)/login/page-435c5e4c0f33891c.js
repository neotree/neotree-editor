(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4665],{83091:function(e,t,n){Promise.resolve().then(n.bind(n,25185)),Promise.resolve().then(n.bind(n,25704))},25185:function(e,t,n){"use strict";n.d(t,{Form:function(){return D}});var r=n(57437),i=n(2265),o=n(39343),l=n(38472),a=n(83102),s=n(50495),u=n(53699);function c(e){let{email:t,sendAuthCode:n,onEmailVerified:c,isEmailRegistered:d}=e,{alert:f}=(0,u.s)(),[p,m]=(0,i.useState)(!1),{register:v,handleSubmit:h}=(0,o.cI)({shouldUnregister:!1,defaultValues:{email:t||""}}),g=h(async e=>{let{email:t}=e;try{m(!0);let e=await l.Z.get("/api/users/is-email-registered?email="+t),{errors:r,yes:i,isActive:o}=e.data;if(console.log(e),(null==r?void 0:r.length)||!i){var n;f({title:"Error",message:(null==r?void 0:null===(n=r.join)||void 0===n?void 0:n.call(r,", "))||"Email address not registered, are you sure that address is typed correctly?",variant:"error"})}else c({email:t,isActive:!!o})}catch(e){f({title:"Error",message:e.message,variant:"error"})}finally{m(!1)}});return(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)("form",{className:" flex flex-col gap-y-4 ",onSubmit:e=>{e.preventDefault(),g()},children:[(0,r.jsx)("div",{children:(0,r.jsx)(a.I,{type:"email",placeholder:"Email address",...v("email",{required:!0,disabled:p})})}),(0,r.jsx)("div",{className:"flex flex-col gap-y-2",children:(0,r.jsx)(s.z,{type:"submit",disabled:p,className:"w-full",children:p?"Please wait...":"Continue"})})]})})}var d=n(30998),f=n(16463),p=Object.defineProperty,m=Object.defineProperties,v=Object.getOwnPropertyDescriptors,h=Object.getOwnPropertySymbols,g=Object.prototype.hasOwnProperty,b=Object.prototype.propertyIsEnumerable,y=(e,t,n)=>t in e?p(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,x=(e,t)=>{for(var n in t||(t={}))g.call(t,n)&&y(e,n,t[n]);if(h)for(var n of h(t))b.call(t,n)&&y(e,n,t[n]);return e},w=(e,t)=>m(e,v(t)),E=(e,t)=>{var n={};for(var r in e)g.call(e,r)&&0>t.indexOf(r)&&(n[r]=e[r]);if(null!=e&&h)for(var r of h(e))0>t.indexOf(r)&&b.call(e,r)&&(n[r]=e[r]);return n},S=i.createContext({}),j=i.forwardRef((e,t)=>{let n;var r,o,l,a,s,{value:u,onChange:c,maxLength:d,textAlign:f="left",pattern:p="^\\d+$",inputMode:m="numeric",onComplete:v,pushPasswordManagerStrategy:h="increase-width",containerClassName:g,noScriptCSSFallback:b=C,render:y,children:j}=e,k=E(e,["value","onChange","maxLength","textAlign","pattern","inputMode","onComplete","pushPasswordManagerStrategy","containerClassName","noScriptCSSFallback","render","children"]);let[N,R]=i.useState("string"==typeof k.defaultValue?k.defaultValue:""),T=null!=u?u:N,O=(n=i.useRef(),i.useEffect(()=>{n.current=T}),n.current),A=i.useCallback(e=>{null==c||c(e),R(e)},[c]),D=i.useMemo(()=>p?"string"==typeof p?new RegExp(p):p:null,[p]),I=i.useRef(null),M=i.useRef(null),F=i.useRef({value:T,onChange:A,isIOS:"undefined"!=typeof window&&(null==(o=null==(r=null==window?void 0:window.CSS)?void 0:r.supports)?void 0:o.call(r,"-webkit-touch-callout","none"))}),W=i.useRef({prev:[null==(l=I.current)?void 0:l.selectionStart,null==(a=I.current)?void 0:a.selectionEnd,null==(s=I.current)?void 0:s.selectionDirection]});i.useImperativeHandle(t,()=>I.current,[]),i.useEffect(()=>{let e=I.current,t=M.current;if(!e||!t)return;function n(){if(document.activeElement!==e){H(null),U(null);return}let t=e.selectionStart,n=e.selectionEnd,r=e.selectionDirection,i=e.maxLength,o=e.value,l=W.current.prev,a=-1,s=-1,u;if(0!==o.length&&null!==t&&null!==n){let e=t===n,r=t===o.length&&o.length<i;if(e&&!r){if(0===t)a=0,s=1,u="forward";else if(t===i)a=t-1,s=t,u="backward";else if(i>1&&o.length>1){let e=0;if(null!==l[0]&&null!==l[1]){u=t<l[1]?"backward":"forward";let n=l[0]===l[1]&&l[0]<i;"backward"!==u||n||(e=-1)}a=e+t,s=e+t+1}}-1!==a&&-1!==s&&a!==s&&I.current.setSelectionRange(a,s,u)}let c=-1!==a?a:t,d=-1!==s?s:n,f=null!=u?u:r;H(c),U(d),W.current.prev=[c,d,f]}if(F.current.value!==e.value&&F.current.onChange(e.value),W.current.prev=[e.selectionStart,e.selectionEnd,e.selectionDirection],document.addEventListener("selectionchange",n,{capture:!0}),n(),document.activeElement===e&&V(!0),!document.getElementById("input-otp-style")){let e=document.createElement("style");if(e.id="input-otp-style",document.head.appendChild(e),e.sheet){let t="background: transparent !important; color: transparent !important; border-color: transparent !important; opacity: 0 !important; box-shadow: none !important; -webkit-box-shadow: none !important; -webkit-text-fill-color: transparent !important;";P(e.sheet,"[data-input-otp]::selection { background: transparent !important; color: transparent !important; }"),P(e.sheet,`[data-input-otp]:autofill { ${t} }`),P(e.sheet,`[data-input-otp]:-webkit-autofill { ${t} }`),P(e.sheet,"@supports (-webkit-touch-callout: none) { [data-input-otp] { letter-spacing: -.6em !important; font-weight: 100 !important; font-stretch: ultra-condensed; font-optical-sizing: none !important; left: -1px !important; right: 1px !important; } }"),P(e.sheet,"[data-input-otp] + * { pointer-events: all !important; }")}}let r=()=>{t&&t.style.setProperty("--root-height",`${e.clientHeight}px`)};r();let i=new ResizeObserver(r);return i.observe(e),()=>{document.removeEventListener("selectionchange",n,{capture:!0}),i.disconnect()}},[]);let[_,L]=i.useState(!1),[B,V]=i.useState(!1),[z,H]=i.useState(null),[$,U]=i.useState(null);i.useEffect(()=>{var e;setTimeout(e=()=>{var e,t,n,r;null==(e=I.current)||e.dispatchEvent(new Event("input"));let i=null==(t=I.current)?void 0:t.selectionStart,o=null==(n=I.current)?void 0:n.selectionEnd,l=null==(r=I.current)?void 0:r.selectionDirection;null!==i&&null!==o&&(H(i),U(o),W.current.prev=[i,o,l])},0),setTimeout(e,10),setTimeout(e,50)},[T,B]),i.useEffect(()=>{void 0!==O&&T!==O&&O.length<d&&T.length===d&&(null==v||v(T))},[d,v,O,T]);let q=function({containerRef:e,inputRef:t,pushPasswordManagerStrategy:n,isFocused:r}){let o=i.useRef({done:!1,refocused:!1}),[l,a]=i.useState(!1),[s,u]=i.useState(!1),[c,d]=i.useState(!1),f=i.useMemo(()=>"none"!==n&&("increase-width"===n||"experimental-no-flickering"===n)&&l&&s,[l,s,n]),p=i.useCallback(()=>{let r=e.current,i=t.current;if(!r||!i||c||"none"===n)return;let l=r.getBoundingClientRect().left+r.offsetWidth,s=r.getBoundingClientRect().top+r.offsetHeight/2;if(!(0===document.querySelectorAll('[data-lastpass-icon-root],com-1password-button,[data-dashlanecreated],[style$="2147483647 !important;"]').length&&document.elementFromPoint(l-18,s)===r)&&(a(!0),d(!0),!o.current.refocused&&document.activeElement===i)){let e=[i.selectionStart,i.selectionEnd];i.blur(),i.focus(),i.setSelectionRange(e[0],e[1]),o.current.refocused=!0}},[e,t,c,n]);return i.useEffect(()=>{let t=e.current;if(!t||"none"===n)return;function r(){u(window.innerWidth-t.getBoundingClientRect().right>=40)}r();let i=setInterval(r,1e3);return()=>{clearInterval(i)}},[e,n]),i.useEffect(()=>{let e=r||document.activeElement===t.current;if("none"===n||!e)return;let i=setTimeout(p,0),o=setTimeout(p,2e3),l=setTimeout(p,5e3),a=setTimeout(()=>{d(!0)},6e3);return()=>{clearTimeout(i),clearTimeout(o),clearTimeout(l),clearTimeout(a)}},[t,r,n,p]),{hasPWMBadge:l,willPushPWMBadge:f,PWM_BADGE_SPACE_WIDTH:"40px"}}({containerRef:M,inputRef:I,pushPasswordManagerStrategy:h,isFocused:B}),Z=i.useCallback(e=>{let t=e.currentTarget.value.slice(0,d);if(t.length>0&&D&&!D.test(t)){e.preventDefault();return}"string"==typeof O&&t.length<O.length&&document.dispatchEvent(new Event("selectionchange")),A(t)},[d,A,O,D]),G=i.useCallback(()=>{var e;if(I.current){let t=Math.min(I.current.value.length,d-1),n=I.current.value.length;null==(e=I.current)||e.setSelectionRange(t,n),H(t),U(n)}V(!0)},[d]),X=i.useCallback(e=>{var t,n;let r=I.current;if(!F.current.isIOS||!e.clipboardData||!r)return;let i=e.clipboardData.getData("text/plain");e.preventDefault();let o=null==(t=I.current)?void 0:t.selectionStart,l=null==(n=I.current)?void 0:n.selectionEnd,a=(o!==l?T.slice(0,o)+i+T.slice(l):T.slice(0,o)+i+T.slice(o)).slice(0,d);if(a.length>0&&D&&!D.test(a))return;r.value=a,A(a);let s=Math.min(a.length,d-1),u=a.length;r.setSelectionRange(s,u),H(s),U(u)},[d,A,D,T]),J=i.useMemo(()=>({position:"relative",cursor:k.disabled?"default":"text",userSelect:"none",WebkitUserSelect:"none",pointerEvents:"none"}),[k.disabled]),K=i.useMemo(()=>({position:"absolute",inset:0,width:q.willPushPWMBadge?`calc(100% + ${q.PWM_BADGE_SPACE_WIDTH})`:"100%",clipPath:q.willPushPWMBadge?`inset(0 ${q.PWM_BADGE_SPACE_WIDTH} 0 0)`:void 0,height:"100%",display:"flex",textAlign:f,opacity:"1",color:"transparent",pointerEvents:"all",background:"transparent",caretColor:"transparent",border:"0 solid transparent",outline:"0 solid transparent",boxShadow:"none",lineHeight:"1",letterSpacing:"-.5em",fontSize:"var(--root-height)",fontFamily:"monospace",fontVariantNumeric:"tabular-nums"}),[q.PWM_BADGE_SPACE_WIDTH,q.willPushPWMBadge,f]),Q=i.useMemo(()=>i.createElement("input",w(x({autoComplete:k.autoComplete||"one-time-code"},k),{"data-input-otp":!0,"data-input-otp-mss":z,"data-input-otp-mse":$,inputMode:m,pattern:null==D?void 0:D.source,style:K,maxLength:d,value:T,ref:I,onPaste:e=>{var t;X(e),null==(t=k.onPaste)||t.call(k,e)},onChange:Z,onMouseOver:e=>{var t;L(!0),null==(t=k.onMouseOver)||t.call(k,e)},onMouseLeave:e=>{var t;L(!1),null==(t=k.onMouseLeave)||t.call(k,e)},onFocus:e=>{var t;G(),null==(t=k.onFocus)||t.call(k,e)},onBlur:e=>{var t;V(!1),null==(t=k.onBlur)||t.call(k,e)}})),[Z,G,X,m,K,d,$,z,k,null==D?void 0:D.source,T]),Y=i.useMemo(()=>({slots:Array.from({length:d}).map((e,t)=>{let n=B&&null!==z&&null!==$&&(z===$&&t===z||t>=z&&t<$),r=void 0!==T[t]?T[t]:null;return{char:r,isActive:n,hasFakeCaret:n&&null===r}}),isFocused:B,isHovering:!k.disabled&&_}),[B,_,d,$,z,k.disabled,T]),ee=i.useMemo(()=>y?y(Y):i.createElement(S.Provider,{value:Y},j),[j,Y,y]);return i.createElement(i.Fragment,null,null!==b&&i.createElement("noscript",null,i.createElement("style",null,b)),i.createElement("div",{ref:M,"data-input-otp-container":!0,style:J,className:g},ee,i.createElement("div",{style:{position:"absolute",inset:0,pointerEvents:"none"}},Q)))});function P(e,t){try{e.insertRule(t)}catch(e){console.error("input-otp could not insert CSS rule:",t)}}j.displayName="Input";var C=`
[data-input-otp] {
  --nojs-bg: white !important;
  --nojs-fg: black !important;

  background-color: var(--nojs-bg) !important;
  color: var(--nojs-fg) !important;
  caret-color: var(--nojs-fg) !important;
  letter-spacing: .25em !important;
  text-align: center !important;
  border: 1px solid var(--nojs-fg) !important;
  border-radius: 4px !important;
  width: 100% !important;
}
@media (prefers-color-scheme: dark) {
  [data-input-otp] {
    --nojs-bg: black !important;
    --nojs-fg: white !important;
  }
}`;/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let k=(0,n(78030).Z)("Dot",[["circle",{cx:"12.1",cy:"12.1",r:"1",key:"18d7e5"}]]);var N=n(37440);let R=i.forwardRef((e,t)=>{let{className:n,containerClassName:i,...o}=e;return(0,r.jsx)(j,{ref:t,containerClassName:(0,N.cn)("flex items-center gap-2 has-[:disabled]:opacity-50",i),className:(0,N.cn)("disabled:cursor-not-allowed",n),...o})});R.displayName="InputOTP";let T=i.forwardRef((e,t)=>{let{className:n,...i}=e;return(0,r.jsx)("div",{ref:t,className:(0,N.cn)("flex items-center",n),...i})});T.displayName="InputOTPGroup";let O=i.forwardRef((e,t)=>{let{index:n,className:o,...l}=e,{char:a,hasFakeCaret:s,isActive:u}=i.useContext(S).slots[n];return(0,r.jsxs)("div",{ref:t,className:(0,N.cn)("relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",u&&"z-10 ring-2 ring-ring ring-offset-background",o),...l,children:[a,s&&(0,r.jsx)("div",{className:"pointer-events-none absolute inset-0 flex items-center justify-center",children:(0,r.jsx)("div",{className:"h-4 w-px animate-caret-blink bg-foreground duration-1000"})})]})});function A(e){let{email:t,onSendCode:n,sendAuthCode:c,setPassword:p,shouldSetPassword:m}=e,{alert:v}=(0,u.s)();(0,f.useRouter)();let[h,g]=(0,i.useState)(!1),[b,y]=(0,i.useState)(!1),[x,w]=(0,i.useState)(!0),{watch:E,setValue:S,register:j,handleSubmit:P}=(0,o.cI)({shouldUnregister:!1,defaultValues:{email:t,code:"",password:"",passwordConfirm:""}}),C=E("code"),k=P(async e=>{try{if(g(!0),m){let{errors:n}=(await l.Z.post("/api/users/set-password",{...e,email:t})).data;if(null==n?void 0:n.length)throw Error(n.join(", "))}let n=await (0,d.signIn)("credentials",{...e,email:t,redirect:!1});if(null==n?void 0:n.ok)window.location.href="/";else throw Error((null==n?void 0:n.error)||"Failed to sign in")}catch(e){v({title:"Error",message:e.message,variant:"error"})}finally{g(!1)}});return(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)("form",{className:" flex flex-col gap-y-4 ",onSubmit:e=>{e.preventDefault(),k()},children:[(0,r.jsx)("div",{children:(0,r.jsx)(a.I,{type:"email",placeholder:"Email address",...j("email",{disabled:!0})})}),(0,r.jsx)("div",{className:(0,N.cn)("flex justify-center",b?"":"hidden"),children:(0,r.jsx)(R,{maxLength:6,value:C,required:b,onChange:e=>{S("code",e),6===e.length&&k()},children:(0,r.jsx)(T,{children:(()=>{let e=[];for(let t=0;t<6;t++)e.push((0,r.jsx)(O,{index:t,className:"w-14"},t));return e})()})})}),(0,r.jsx)("div",{className:(0,N.cn)(x?"":"hidden"),children:(0,r.jsx)(a.I,{type:"password",placeholder:"Password",...j("password",{required:x,disabled:h})})}),!!m&&(0,r.jsx)("div",{className:(0,N.cn)(x?"":"hidden"),children:(0,r.jsx)(a.I,{type:"password",placeholder:"Confirm password",...j("passwordConfirm",{required:!0,disabled:h})})}),(0,r.jsxs)("div",{className:"flex flex-col gap-y-2",children:[(0,r.jsx)(s.z,{type:"submit",disabled:h,className:"w-full",children:h?"Please wait...":"Sign in"}),(0,r.jsxs)("div",{className:(0,N.cn)("flex flex-col items-end gap-y-1",m&&"hidden"),children:[(0,r.jsx)("a",{href:"#",className:(0,N.cn)("text text-sm transition-colors text-secondary/60 hover:text-secondary",h&&"opacity-20"),onClick:e=>{e.preventDefault(),h||(S("code",""),S("password",""),x?(w(!1),y(!0),c({email:t})):(w(!0),y(!1)))},children:x?"Email me a sign in code":"Sign in with password"}),b&&(0,r.jsx)("a",{href:"#",className:(0,N.cn)("text text-sm transition-colors text-secondary/60 hover:text-secondary",h&&"opacity-20"),onClick:e=>{e.preventDefault(),h||n()},children:"Resend code"})]})]})]})})}function D(e){let{sendAuthCode:t,isEmailRegistered:n,setPassword:o}=e,[l,a]=(0,i.useState)("verifyEmailForm"),[s,u]=(0,i.useState)(""),[d,f]=(0,i.useState)(!1);return(0,r.jsxs)(r.Fragment,{children:["verifyEmailForm"===l&&(0,r.jsx)(c,{email:s,sendAuthCode:t,isEmailRegistered:n,onEmailVerified:e=>{let{email:t,isActive:n}=e;u(t),f(!n),a("signInForm")}}),"signInForm"===l&&(0,r.jsx)(A,{email:s,onSendCode:()=>{a("verifyEmailForm"),f(!1)},sendAuthCode:t,shouldSetPassword:d,setPassword:o})]})}O.displayName="InputOTPSlot",i.forwardRef((e,t)=>{let{...n}=e;return(0,r.jsx)("div",{ref:t,role:"separator",...n,children:(0,r.jsx)(k,{})})}).displayName="InputOTPSeparator"},25704:function(e,t,n){"use strict";n.d(t,{Title:function(){return o}});var r=n(2265),i=n(20357);function o(e){let{children:t}=e;return(0,r.useEffect)(()=>{document.title=[i.env.NEXT_PUBLIC_APP_NAME,t].filter(e=>e).join(" - ")},[t]),(0,r.useEffect)(()=>()=>{document.title="".concat(i.env.NEXT_PUBLIC_APP_NAME)},[]),null}},50495:function(e,t,n){"use strict";n.d(t,{d:function(){return s},z:function(){return u}});var r=n(57437),i=n(2265),o=n(71538),l=n(12218),a=n(37440);let s=(0,l.j)("\n    inline-flex\n    items-center\n    justify-center\n    whitespace-nowrap\n    rounded-md\n    text-sm\n    font-medium\n    transition-colors\n    focus-visible:outline-none\n    disabled:pointer-events-none\n    disabled:opacity-50\n  ",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/80",outline:"border border-input bg-background hover:bg-primary/20","primary-outline":"border border-primary text-primary bg-transparent hover:bg-primary/20",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/90",ghost:"hover:bg-primary/20 hover:text-primary",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),u=i.forwardRef((e,t)=>{let{className:n,variant:i,size:l,asChild:u=!1,...c}=e,d=u?o.g7:"button";return(0,r.jsx)(d,{className:(0,a.cn)(s({variant:i,size:l,className:n})),ref:t,...c})});u.displayName="Button"},83102:function(e,t,n){"use strict";n.d(t,{I:function(){return l}});var r=n(57437),i=n(2265),o=n(37440);let l=i.forwardRef((e,t)=>{let{className:n,type:i,noRing:l,error:a,...s}=e;return(0,r.jsx)("input",{type:i,className:(0,o.cn)("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",l&&"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",a&&"border-danger",a&&!l&&"focus-visible:ring-danger",n),ref:t,...s})});l.displayName="Input"},53699:function(e,t,n){"use strict";n.d(t,{s:function(){return o}});var r=n(39099);let i={title:"",message:"",buttonLabel:"Ok",variant:"info",onClose:void 0},o=(0,r.Ue)(e=>({isOpen:!1,...i,alert:t=>e({isOpen:!0,...i,...t}),close:()=>e({isOpen:!1,onClose:void 0,...i})}))},37440:function(e,t,n){"use strict";n.d(t,{cn:function(){return o}});var r=n(44839),i=n(96164);function o(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];return(0,i.m6)((0,r.W)(t))}},78030:function(e,t,n){"use strict";n.d(t,{Z:function(){return s}});var r=n(2265);/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),o=function(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];return t.filter((e,t,n)=>!!e&&n.indexOf(e)===t).join(" ")};/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var l={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r.forwardRef)((e,t)=>{let{color:n="currentColor",size:i=24,strokeWidth:a=2,absoluteStrokeWidth:s,className:u="",children:c,iconNode:d,...f}=e;return(0,r.createElement)("svg",{ref:t,...l,width:i,height:i,stroke:n,strokeWidth:s?24*Number(a)/Number(i):a,className:o("lucide",u),...f},[...d.map(e=>{let[t,n]=e;return(0,r.createElement)(t,n)}),...Array.isArray(c)?c:[c]])}),s=(e,t)=>{let n=(0,r.forwardRef)((n,l)=>{let{className:s,...u}=n;return(0,r.createElement)(a,{ref:l,iconNode:t,className:o("lucide-".concat(i(e)),s),...u})});return n.displayName="".concat(e),n}},16463:function(e,t,n){"use strict";var r=n(71169);n.o(r,"useParams")&&n.d(t,{useParams:function(){return r.useParams}}),n.o(r,"usePathname")&&n.d(t,{usePathname:function(){return r.usePathname}}),n.o(r,"useRouter")&&n.d(t,{useRouter:function(){return r.useRouter}}),n.o(r,"useSearchParams")&&n.d(t,{useSearchParams:function(){return r.useSearchParams}})},20357:function(e,t,n){"use strict";var r,i;e.exports=(null==(r=n.g.process)?void 0:r.env)&&"object"==typeof(null==(i=n.g.process)?void 0:i.env)?n.g.process:n(88081)},88081:function(e){!function(){var t={229:function(e){var t,n,r,i=e.exports={};function o(){throw Error("setTimeout has not been defined")}function l(){throw Error("clearTimeout has not been defined")}function a(e){if(t===setTimeout)return setTimeout(e,0);if((t===o||!t)&&setTimeout)return t=setTimeout,setTimeout(e,0);try{return t(e,0)}catch(n){try{return t.call(null,e,0)}catch(n){return t.call(this,e,0)}}}!function(){try{t="function"==typeof setTimeout?setTimeout:o}catch(e){t=o}try{n="function"==typeof clearTimeout?clearTimeout:l}catch(e){n=l}}();var s=[],u=!1,c=-1;function d(){u&&r&&(u=!1,r.length?s=r.concat(s):c=-1,s.length&&f())}function f(){if(!u){var e=a(d);u=!0;for(var t=s.length;t;){for(r=s,s=[];++c<t;)r&&r[c].run();c=-1,t=s.length}r=null,u=!1,function(e){if(n===clearTimeout)return clearTimeout(e);if((n===l||!n)&&clearTimeout)return n=clearTimeout,clearTimeout(e);try{n(e)}catch(t){try{return n.call(null,e)}catch(t){return n.call(this,e)}}}(e)}}function p(e,t){this.fun=e,this.array=t}function m(){}i.nextTick=function(e){var t=Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];s.push(new p(e,t)),1!==s.length||u||a(f)},p.prototype.run=function(){this.fun.apply(null,this.array)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=m,i.addListener=m,i.once=m,i.off=m,i.removeListener=m,i.removeAllListeners=m,i.emit=m,i.prependListener=m,i.prependOnceListener=m,i.listeners=function(e){return[]},i.binding=function(e){throw Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(e){throw Error("process.chdir is not supported")},i.umask=function(){return 0}}},n={};function r(e){var i=n[e];if(void 0!==i)return i.exports;var o=n[e]={exports:{}},l=!0;try{t[e](o,o.exports,r),l=!1}finally{l&&delete n[e]}return o.exports}r.ab="//";var i=r(229);e.exports=i}()},34492:function(e,t,n){"use strict";/**
 * @license React
 * use-sync-external-store-shim.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var r=n(2265),i="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},o=r.useState,l=r.useEffect,a=r.useLayoutEffect,s=r.useDebugValue;function u(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!i(e,n)}catch(e){return!0}}var c="undefined"==typeof window||void 0===window.document||void 0===window.document.createElement?function(e,t){return t()}:function(e,t){var n=t(),r=o({inst:{value:n,getSnapshot:t}}),i=r[0].inst,c=r[1];return a(function(){i.value=n,i.getSnapshot=t,u(i)&&c({inst:i})},[e,n,t]),l(function(){return u(i)&&c({inst:i}),e(function(){u(i)&&c({inst:i})})},[e]),s(n),n};t.useSyncExternalStore=void 0!==r.useSyncExternalStore?r.useSyncExternalStore:c},85107:function(e,t,n){"use strict";/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var r=n(2265),i=n(10554),o="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},l=i.useSyncExternalStore,a=r.useRef,s=r.useEffect,u=r.useMemo,c=r.useDebugValue;t.useSyncExternalStoreWithSelector=function(e,t,n,r,i){var d=a(null);if(null===d.current){var f={hasValue:!1,value:null};d.current=f}else f=d.current;var p=l(e,(d=u(function(){function e(e){if(!s){if(s=!0,l=e,e=r(e),void 0!==i&&f.hasValue){var t=f.value;if(i(t,e))return a=t}return a=e}if(t=a,o(l,e))return t;var n=r(e);return void 0!==i&&i(t,n)?t:(l=e,a=n)}var l,a,s=!1,u=void 0===n?null:n;return[function(){return e(t())},null===u?void 0:function(){return e(u())}]},[t,n,r,i]))[0],d[1]);return s(function(){f.hasValue=!0,f.value=p},[p]),c(p),p}},10554:function(e,t,n){"use strict";e.exports=n(34492)},35006:function(e,t,n){"use strict";e.exports=n(85107)},1584:function(e,t,n){"use strict";n.d(t,{F:function(){return i},e:function(){return o}});var r=n(2265);function i(...e){return t=>e.forEach(e=>{"function"==typeof e?e(t):null!=e&&(e.current=t)})}function o(...e){return r.useCallback(i(...e),e)}},71538:function(e,t,n){"use strict";n.d(t,{A4:function(){return s},g7:function(){return l}});var r=n(2265),i=n(1584),o=n(57437),l=r.forwardRef((e,t)=>{let{children:n,...i}=e,l=r.Children.toArray(n),s=l.find(u);if(s){let e=s.props.children,n=l.map(t=>t!==s?t:r.Children.count(e)>1?r.Children.only(null):r.isValidElement(e)?e.props.children:null);return(0,o.jsx)(a,{...i,ref:t,children:r.isValidElement(e)?r.cloneElement(e,void 0,n):null})}return(0,o.jsx)(a,{...i,ref:t,children:n})});l.displayName="Slot";var a=r.forwardRef((e,t)=>{let{children:n,...o}=e;if(r.isValidElement(n)){let e,l;let a=(e=Object.getOwnPropertyDescriptor(n.props,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning?n.ref:(e=Object.getOwnPropertyDescriptor(n,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning?n.props.ref:n.props.ref||n.ref;return r.cloneElement(n,{...function(e,t){let n={...t};for(let r in t){let i=e[r],o=t[r];/^on[A-Z]/.test(r)?i&&o?n[r]=(...e)=>{o(...e),i(...e)}:i&&(n[r]=i):"style"===r?n[r]={...i,...o}:"className"===r&&(n[r]=[i,o].filter(Boolean).join(" "))}return{...e,...n}}(o,n.props),ref:t?(0,i.F)(t,a):a})}return r.Children.count(n)>1?r.Children.only(null):null});a.displayName="SlotClone";var s=({children:e})=>(0,o.jsx)(o.Fragment,{children:e});function u(e){return r.isValidElement(e)&&e.type===s}},12218:function(e,t,n){"use strict";n.d(t,{j:function(){return o}});let r=e=>"boolean"==typeof e?"".concat(e):0===e?"0":e,i=function(){for(var e,t,n=0,r="";n<arguments.length;)(e=arguments[n++])&&(t=function e(t){var n,r,i="";if("string"==typeof t||"number"==typeof t)i+=t;else if("object"==typeof t){if(Array.isArray(t))for(n=0;n<t.length;n++)t[n]&&(r=e(t[n]))&&(i&&(i+=" "),i+=r);else for(n in t)t[n]&&(i&&(i+=" "),i+=n)}return i}(e))&&(r&&(r+=" "),r+=t);return r},o=(e,t)=>n=>{var o;if((null==t?void 0:t.variants)==null)return i(e,null==n?void 0:n.class,null==n?void 0:n.className);let{variants:l,defaultVariants:a}=t,s=Object.keys(l).map(e=>{let t=null==n?void 0:n[e],i=null==a?void 0:a[e];if(null===t)return null;let o=r(t)||r(i);return l[e][o]}),u=n&&Object.entries(n).reduce((e,t)=>{let[n,r]=t;return void 0===r||(e[n]=r),e},{});return i(e,s,null==t?void 0:null===(o=t.compoundVariants)||void 0===o?void 0:o.reduce((e,t)=>{let{class:n,className:r,...i}=t;return Object.entries(i).every(e=>{let[t,n]=e;return Array.isArray(n)?n.includes({...a,...u}[t]):({...a,...u})[t]===n})?[...e,n,r]:e},[]),null==n?void 0:n.class,null==n?void 0:n.className)}},39099:function(e,t,n){"use strict";n.d(t,{Ue:function(){return f}});let r=e=>{let t;let n=new Set,r=(e,r)=>{let i="function"==typeof e?e(t):e;if(!Object.is(i,t)){let e=t;t=(null!=r?r:"object"!=typeof i||null===i)?i:Object.assign({},t,i),n.forEach(n=>n(t,e))}},i=()=>t,o={setState:r,getState:i,getInitialState:()=>l,subscribe:e=>(n.add(e),()=>n.delete(e)),destroy:()=>{console.warn("[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."),n.clear()}},l=t=e(r,i,o);return o},i=e=>e?r(e):r;var o=n(2265),l=n(35006);let{useDebugValue:a}=o,{useSyncExternalStoreWithSelector:s}=l,u=!1,c=e=>e,d=e=>{"function"!=typeof e&&console.warn("[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`.");let t="function"==typeof e?i(e):e,n=(e,n)=>(function(e,t=c,n){n&&!u&&(console.warn("[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"),u=!0);let r=s(e.subscribe,e.getState,e.getServerState||e.getInitialState,t,n);return a(r),r})(t,e,n);return Object.assign(n,t),n},f=e=>e?d(e):d}},function(e){e.O(0,[4868,9343,6300,8472,998,7478,7023,1744],function(){return e(e.s=83091)}),_N_E=e.O()}]);