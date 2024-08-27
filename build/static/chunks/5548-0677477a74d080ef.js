(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5548],{78030:function(e,t,n){"use strict";n.d(t,{Z:function(){return u}});var r=n(2265);/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),o=function(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];return t.filter((e,t,n)=>!!e&&n.indexOf(e)===t).join(" ")};/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r.forwardRef)((e,t)=>{let{color:n="currentColor",size:l=24,strokeWidth:a=2,absoluteStrokeWidth:u,className:c="",children:s,iconNode:d,...p}=e;return(0,r.createElement)("svg",{ref:t,...i,width:l,height:l,stroke:n,strokeWidth:u?24*Number(a)/Number(l):a,className:o("lucide",c),...p},[...d.map(e=>{let[t,n]=e;return(0,r.createElement)(t,n)}),...Array.isArray(s)?s:[s]])}),u=(e,t)=>{let n=(0,r.forwardRef)((n,i)=>{let{className:u,...c}=n;return(0,r.createElement)(a,{ref:i,iconNode:t,className:o("lucide-".concat(l(e)),u),...c})});return n.displayName="".concat(e),n}},32309:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(78030).Z)("Dot",[["circle",{cx:"12.1",cy:"12.1",r:"1",key:"18d7e5"}]])},20357:function(e,t,n){"use strict";var r,l;e.exports=(null==(r=n.g.process)?void 0:r.env)&&"object"==typeof(null==(l=n.g.process)?void 0:l.env)?n.g.process:n(88081)},88081:function(e){!function(){var t={229:function(e){var t,n,r,l=e.exports={};function o(){throw Error("setTimeout has not been defined")}function i(){throw Error("clearTimeout has not been defined")}function a(e){if(t===setTimeout)return setTimeout(e,0);if((t===o||!t)&&setTimeout)return t=setTimeout,setTimeout(e,0);try{return t(e,0)}catch(n){try{return t.call(null,e,0)}catch(n){return t.call(this,e,0)}}}!function(){try{t="function"==typeof setTimeout?setTimeout:o}catch(e){t=o}try{n="function"==typeof clearTimeout?clearTimeout:i}catch(e){n=i}}();var u=[],c=!1,s=-1;function d(){c&&r&&(c=!1,r.length?u=r.concat(u):s=-1,u.length&&p())}function p(){if(!c){var e=a(d);c=!0;for(var t=u.length;t;){for(r=u,u=[];++s<t;)r&&r[s].run();s=-1,t=u.length}r=null,c=!1,function(e){if(n===clearTimeout)return clearTimeout(e);if((n===i||!n)&&clearTimeout)return n=clearTimeout,clearTimeout(e);try{n(e)}catch(t){try{return n.call(null,e)}catch(t){return n.call(this,e)}}}(e)}}function f(e,t){this.fun=e,this.array=t}function m(){}l.nextTick=function(e){var t=Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];u.push(new f(e,t)),1!==u.length||c||a(p)},f.prototype.run=function(){this.fun.apply(null,this.array)},l.title="browser",l.browser=!0,l.env={},l.argv=[],l.version="",l.versions={},l.on=m,l.addListener=m,l.once=m,l.off=m,l.removeListener=m,l.removeAllListeners=m,l.emit=m,l.prependListener=m,l.prependOnceListener=m,l.listeners=function(e){return[]},l.binding=function(e){throw Error("process.binding is not supported")},l.cwd=function(){return"/"},l.chdir=function(e){throw Error("process.chdir is not supported")},l.umask=function(){return 0}}},n={};function r(e){var l=n[e];if(void 0!==l)return l.exports;var o=n[e]={exports:{}},i=!0;try{t[e](o,o.exports,r),i=!1}finally{i&&delete n[e]}return o.exports}r.ab="//";var l=r(229);e.exports=l}()},1584:function(e,t,n){"use strict";n.d(t,{F:function(){return l},e:function(){return o}});var r=n(2265);function l(...e){return t=>e.forEach(e=>{"function"==typeof e?e(t):null!=e&&(e.current=t)})}function o(...e){return r.useCallback(l(...e),e)}},71538:function(e,t,n){"use strict";n.d(t,{A4:function(){return u},g7:function(){return i}});var r=n(2265),l=n(1584),o=n(57437),i=r.forwardRef((e,t)=>{let{children:n,...l}=e,i=r.Children.toArray(n),u=i.find(c);if(u){let e=u.props.children,n=i.map(t=>t!==u?t:r.Children.count(e)>1?r.Children.only(null):r.isValidElement(e)?e.props.children:null);return(0,o.jsx)(a,{...l,ref:t,children:r.isValidElement(e)?r.cloneElement(e,void 0,n):null})}return(0,o.jsx)(a,{...l,ref:t,children:n})});i.displayName="Slot";var a=r.forwardRef((e,t)=>{let{children:n,...o}=e;if(r.isValidElement(n)){let e,i;let a=(e=Object.getOwnPropertyDescriptor(n.props,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning?n.ref:(e=Object.getOwnPropertyDescriptor(n,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning?n.props.ref:n.props.ref||n.ref;return r.cloneElement(n,{...function(e,t){let n={...t};for(let r in t){let l=e[r],o=t[r];/^on[A-Z]/.test(r)?l&&o?n[r]=(...e)=>{o(...e),l(...e)}:l&&(n[r]=l):"style"===r?n[r]={...l,...o}:"className"===r&&(n[r]=[l,o].filter(Boolean).join(" "))}return{...e,...n}}(o,n.props),ref:t?(0,l.F)(t,a):a})}return r.Children.count(n)>1?r.Children.only(null):null});a.displayName="SlotClone";var u=({children:e})=>(0,o.jsx)(o.Fragment,{children:e});function c(e){return r.isValidElement(e)&&e.type===u}},12218:function(e,t,n){"use strict";n.d(t,{j:function(){return o}});let r=e=>"boolean"==typeof e?"".concat(e):0===e?"0":e,l=function(){for(var e,t,n=0,r="";n<arguments.length;)(e=arguments[n++])&&(t=function e(t){var n,r,l="";if("string"==typeof t||"number"==typeof t)l+=t;else if("object"==typeof t){if(Array.isArray(t))for(n=0;n<t.length;n++)t[n]&&(r=e(t[n]))&&(l&&(l+=" "),l+=r);else for(n in t)t[n]&&(l&&(l+=" "),l+=n)}return l}(e))&&(r&&(r+=" "),r+=t);return r},o=(e,t)=>n=>{var o;if((null==t?void 0:t.variants)==null)return l(e,null==n?void 0:n.class,null==n?void 0:n.className);let{variants:i,defaultVariants:a}=t,u=Object.keys(i).map(e=>{let t=null==n?void 0:n[e],l=null==a?void 0:a[e];if(null===t)return null;let o=r(t)||r(l);return i[e][o]}),c=n&&Object.entries(n).reduce((e,t)=>{let[n,r]=t;return void 0===r||(e[n]=r),e},{});return l(e,u,null==t?void 0:null===(o=t.compoundVariants)||void 0===o?void 0:o.reduce((e,t)=>{let{class:n,className:r,...l}=t;return Object.entries(l).every(e=>{let[t,n]=e;return Array.isArray(n)?n.includes({...a,...c}[t]):({...a,...c})[t]===n})?[...e,n,r]:e},[]),null==n?void 0:n.class,null==n?void 0:n.className)}},66431:function(e,t,n){"use strict";n.d(t,{VM:function(){return m},uZ:function(){return v}});var r=n(2265),l=Object.defineProperty,o=Object.defineProperties,i=Object.getOwnPropertyDescriptors,a=Object.getOwnPropertySymbols,u=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,s=(e,t,n)=>t in e?l(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,d=(e,t)=>{for(var n in t||(t={}))u.call(t,n)&&s(e,n,t[n]);if(a)for(var n of a(t))c.call(t,n)&&s(e,n,t[n]);return e},p=(e,t)=>o(e,i(t)),f=(e,t)=>{var n={};for(var r in e)u.call(e,r)&&0>t.indexOf(r)&&(n[r]=e[r]);if(null!=e&&a)for(var r of a(e))0>t.indexOf(r)&&c.call(e,r)&&(n[r]=e[r]);return n},m=r.createContext({}),v=r.forwardRef((e,t)=>{let n;var l,o,i,a,u,{value:c,onChange:s,maxLength:v,textAlign:b="left",pattern:y="^\\d+$",inputMode:w="numeric",onComplete:E,pushPasswordManagerStrategy:S="increase-width",containerClassName:C,noScriptCSSFallback:x=g,render:k,children:P}=e,T=f(e,["value","onChange","maxLength","textAlign","pattern","inputMode","onComplete","pushPasswordManagerStrategy","containerClassName","noScriptCSSFallback","render","children"]);let[M,R]=r.useState("string"==typeof T.defaultValue?T.defaultValue:""),j=null!=c?c:M,A=(n=r.useRef(),r.useEffect(()=>{n.current=j}),n.current),O=r.useCallback(e=>{null==s||s(e),R(e)},[s]),W=r.useMemo(()=>y?"string"==typeof y?new RegExp(y):y:null,[y]),D=r.useRef(null),N=r.useRef(null),B=r.useRef({value:j,onChange:O,isIOS:"undefined"!=typeof window&&(null==(o=null==(l=null==window?void 0:window.CSS)?void 0:l.supports)?void 0:o.call(l,"-webkit-touch-callout","none"))}),L=r.useRef({prev:[null==(i=D.current)?void 0:i.selectionStart,null==(a=D.current)?void 0:a.selectionEnd,null==(u=D.current)?void 0:u.selectionDirection]});r.useImperativeHandle(t,()=>D.current,[]),r.useEffect(()=>{let e=D.current,t=N.current;if(!e||!t)return;function n(){if(document.activeElement!==e){$(null),z(null);return}let t=e.selectionStart,n=e.selectionEnd,r=e.selectionDirection,l=e.maxLength,o=e.value,i=L.current.prev,a=-1,u=-1,c;if(0!==o.length&&null!==t&&null!==n){let e=t===n,r=t===o.length&&o.length<l;if(e&&!r){if(0===t)a=0,u=1,c="forward";else if(t===l)a=t-1,u=t,c="backward";else if(l>1&&o.length>1){let e=0;if(null!==i[0]&&null!==i[1]){c=t<i[1]?"backward":"forward";let n=i[0]===i[1]&&i[0]<l;"backward"!==c||n||(e=-1)}a=e+t,u=e+t+1}}-1!==a&&-1!==u&&a!==u&&D.current.setSelectionRange(a,u,c)}let s=-1!==a?a:t,d=-1!==u?u:n,p=null!=c?c:r;$(s),z(d),L.current.prev=[s,d,p]}if(B.current.value!==e.value&&B.current.onChange(e.value),L.current.prev=[e.selectionStart,e.selectionEnd,e.selectionDirection],document.addEventListener("selectionchange",n,{capture:!0}),n(),document.activeElement===e&&H(!0),!document.getElementById("input-otp-style")){let e=document.createElement("style");if(e.id="input-otp-style",document.head.appendChild(e),e.sheet){let t="background: transparent !important; color: transparent !important; border-color: transparent !important; opacity: 0 !important; box-shadow: none !important; -webkit-box-shadow: none !important; -webkit-text-fill-color: transparent !important;";h(e.sheet,"[data-input-otp]::selection { background: transparent !important; color: transparent !important; }"),h(e.sheet,`[data-input-otp]:autofill { ${t} }`),h(e.sheet,`[data-input-otp]:-webkit-autofill { ${t} }`),h(e.sheet,"@supports (-webkit-touch-callout: none) { [data-input-otp] { letter-spacing: -.6em !important; font-weight: 100 !important; font-stretch: ultra-condensed; font-optical-sizing: none !important; left: -1px !important; right: 1px !important; } }"),h(e.sheet,"[data-input-otp] + * { pointer-events: all !important; }")}}let r=()=>{t&&t.style.setProperty("--root-height",`${e.clientHeight}px`)};r();let l=new ResizeObserver(r);return l.observe(e),()=>{document.removeEventListener("selectionchange",n,{capture:!0}),l.disconnect()}},[]);let[_,F]=r.useState(!1),[I,H]=r.useState(!1),[V,$]=r.useState(null),[Z,z]=r.useState(null);r.useEffect(()=>{var e;setTimeout(e=()=>{var e,t,n,r;null==(e=D.current)||e.dispatchEvent(new Event("input"));let l=null==(t=D.current)?void 0:t.selectionStart,o=null==(n=D.current)?void 0:n.selectionEnd,i=null==(r=D.current)?void 0:r.selectionDirection;null!==l&&null!==o&&($(l),z(o),L.current.prev=[l,o,i])},0),setTimeout(e,10),setTimeout(e,50)},[j,I]),r.useEffect(()=>{void 0!==A&&j!==A&&A.length<v&&j.length===v&&(null==E||E(j))},[v,E,A,j]);let G=function({containerRef:e,inputRef:t,pushPasswordManagerStrategy:n,isFocused:l}){let o=r.useRef({done:!1,refocused:!1}),[i,a]=r.useState(!1),[u,c]=r.useState(!1),[s,d]=r.useState(!1),p=r.useMemo(()=>"none"!==n&&("increase-width"===n||"experimental-no-flickering"===n)&&i&&u,[i,u,n]),f=r.useCallback(()=>{let r=e.current,l=t.current;if(!r||!l||s||"none"===n)return;let i=r.getBoundingClientRect().left+r.offsetWidth,u=r.getBoundingClientRect().top+r.offsetHeight/2;if(!(0===document.querySelectorAll('[data-lastpass-icon-root],com-1password-button,[data-dashlanecreated],[style$="2147483647 !important;"]').length&&document.elementFromPoint(i-18,u)===r)&&(a(!0),d(!0),!o.current.refocused&&document.activeElement===l)){let e=[l.selectionStart,l.selectionEnd];l.blur(),l.focus(),l.setSelectionRange(e[0],e[1]),o.current.refocused=!0}},[e,t,s,n]);return r.useEffect(()=>{let t=e.current;if(!t||"none"===n)return;function r(){c(window.innerWidth-t.getBoundingClientRect().right>=40)}r();let l=setInterval(r,1e3);return()=>{clearInterval(l)}},[e,n]),r.useEffect(()=>{let e=l||document.activeElement===t.current;if("none"===n||!e)return;let r=setTimeout(f,0),o=setTimeout(f,2e3),i=setTimeout(f,5e3),a=setTimeout(()=>{d(!0)},6e3);return()=>{clearTimeout(r),clearTimeout(o),clearTimeout(i),clearTimeout(a)}},[t,l,n,f]),{hasPWMBadge:i,willPushPWMBadge:p,PWM_BADGE_SPACE_WIDTH:"40px"}}({containerRef:N,inputRef:D,pushPasswordManagerStrategy:S,isFocused:I}),q=r.useCallback(e=>{let t=e.currentTarget.value.slice(0,v);if(t.length>0&&W&&!W.test(t)){e.preventDefault();return}"string"==typeof A&&t.length<A.length&&document.dispatchEvent(new Event("selectionchange")),O(t)},[v,O,A,W]),U=r.useCallback(()=>{var e;if(D.current){let t=Math.min(D.current.value.length,v-1),n=D.current.value.length;null==(e=D.current)||e.setSelectionRange(t,n),$(t),z(n)}H(!0)},[v]),J=r.useCallback(e=>{var t,n;let r=D.current;if(!B.current.isIOS||!e.clipboardData||!r)return;let l=e.clipboardData.getData("text/plain");e.preventDefault();let o=null==(t=D.current)?void 0:t.selectionStart,i=null==(n=D.current)?void 0:n.selectionEnd,a=(o!==i?j.slice(0,o)+l+j.slice(i):j.slice(0,o)+l+j.slice(o)).slice(0,v);if(a.length>0&&W&&!W.test(a))return;r.value=a,O(a);let u=Math.min(a.length,v-1),c=a.length;r.setSelectionRange(u,c),$(u),z(c)},[v,O,W,j]),K=r.useMemo(()=>({position:"relative",cursor:T.disabled?"default":"text",userSelect:"none",WebkitUserSelect:"none",pointerEvents:"none"}),[T.disabled]),Q=r.useMemo(()=>({position:"absolute",inset:0,width:G.willPushPWMBadge?`calc(100% + ${G.PWM_BADGE_SPACE_WIDTH})`:"100%",clipPath:G.willPushPWMBadge?`inset(0 ${G.PWM_BADGE_SPACE_WIDTH} 0 0)`:void 0,height:"100%",display:"flex",textAlign:b,opacity:"1",color:"transparent",pointerEvents:"all",background:"transparent",caretColor:"transparent",border:"0 solid transparent",outline:"0 solid transparent",boxShadow:"none",lineHeight:"1",letterSpacing:"-.5em",fontSize:"var(--root-height)",fontFamily:"monospace",fontVariantNumeric:"tabular-nums"}),[G.PWM_BADGE_SPACE_WIDTH,G.willPushPWMBadge,b]),X=r.useMemo(()=>r.createElement("input",p(d({autoComplete:T.autoComplete||"one-time-code"},T),{"data-input-otp":!0,"data-input-otp-mss":V,"data-input-otp-mse":Z,inputMode:w,pattern:null==W?void 0:W.source,style:Q,maxLength:v,value:j,ref:D,onPaste:e=>{var t;J(e),null==(t=T.onPaste)||t.call(T,e)},onChange:q,onMouseOver:e=>{var t;F(!0),null==(t=T.onMouseOver)||t.call(T,e)},onMouseLeave:e=>{var t;F(!1),null==(t=T.onMouseLeave)||t.call(T,e)},onFocus:e=>{var t;U(),null==(t=T.onFocus)||t.call(T,e)},onBlur:e=>{var t;H(!1),null==(t=T.onBlur)||t.call(T,e)}})),[q,U,J,w,Q,v,Z,V,T,null==W?void 0:W.source,j]),Y=r.useMemo(()=>({slots:Array.from({length:v}).map((e,t)=>{let n=I&&null!==V&&null!==Z&&(V===Z&&t===V||t>=V&&t<Z),r=void 0!==j[t]?j[t]:null;return{char:r,isActive:n,hasFakeCaret:n&&null===r}}),isFocused:I,isHovering:!T.disabled&&_}),[I,_,v,Z,V,T.disabled,j]),ee=r.useMemo(()=>k?k(Y):r.createElement(m.Provider,{value:Y},P),[P,Y,k]);return r.createElement(r.Fragment,null,null!==x&&r.createElement("noscript",null,r.createElement("style",null,x)),r.createElement("div",{ref:N,"data-input-otp-container":!0,style:K,className:C},ee,r.createElement("div",{style:{position:"absolute",inset:0,pointerEvents:"none"}},X)))});function h(e,t){try{e.insertRule(t)}catch(e){console.error("input-otp could not insert CSS rule:",t)}}v.displayName="Input";var g=`
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
}`}}]);