"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1344],{42421:function(e,t,r){r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(78030).Z)("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},14392:function(e,t,r){r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(78030).Z)("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]])},89627:function(e,t,r){r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(78030).Z)("Loader",[["path",{d:"M12 2v4",key:"3427ic"}],["path",{d:"m16.2 7.8 2.9-2.9",key:"r700ao"}],["path",{d:"M18 12h4",key:"wj9ykh"}],["path",{d:"m16.2 16.2 2.9 2.9",key:"1bxg5t"}],["path",{d:"M12 18v4",key:"jadmvz"}],["path",{d:"m4.9 19.1 2.9-2.9",key:"bwix9q"}],["path",{d:"M2 12h4",key:"j09sii"}],["path",{d:"m4.9 4.9 2.9 2.9",key:"giyufr"}]])},38364:function(e,t,r){r.d(t,{f:function(){return i}});var n=r(2265),l=r(25171),o=r(57437),a=n.forwardRef((e,t)=>(0,o.jsx)(l.WV.label,{...e,ref:t,onMouseDown:t=>{var r;t.target.closest("button, input, select, textarea")||(null===(r=e.onMouseDown)||void 0===r||r.call(e,t),!t.defaultPrevented&&t.detail>1&&t.preventDefault())}}));a.displayName="Label";var i=a},48297:function(e,t,r){r.d(t,{VY:function(){return eV},ZA:function(){return e_},JO:function(){return eP},ck:function(){return eH},wU:function(){return eB},eT:function(){return eA},__:function(){return eW},h_:function(){return eN},fC:function(){return eE},$G:function(){return eO},u_:function(){return eK},Z0:function(){return eF},xz:function(){return eD},B4:function(){return eI},l_:function(){return eL}});var n=r(2265),l=r(54887);function o(e,[t,r]){return Math.min(r,Math.max(t,e))}var a=r(78149),i=r(90976),u=r(1584),d=r(98324),s=r(87513),c=r(53938),p=r(20589),f=r(80467),v=r(53201),h=r(25510),m=r(56935),w=r(25171),g=r(71538),x=r(75137),y=r(91715),b=r(1336),S=r(47250),C=r(31725),j=r(78369),k=r(49418),M=r(57437),T=[" ","Enter","ArrowUp","ArrowDown"],R=[" ","Enter"],E="Select",[D,I,P]=(0,i.B)(E),[N,V]=(0,d.b)(E,[P,h.D7]),L=(0,h.D7)(),[_,W]=N(E),[H,A]=N(E),B=e=>{let{__scopeSelect:t,children:r,open:l,defaultOpen:o,onOpenChange:a,value:i,defaultValue:u,onValueChange:d,dir:c,name:p,autoComplete:f,disabled:m,required:w}=e,g=L(t),[x,b]=n.useState(null),[S,C]=n.useState(null),[j,k]=n.useState(!1),T=(0,s.gm)(c),[R=!1,E]=(0,y.T)({prop:l,defaultProp:o,onChange:a}),[I,P]=(0,y.T)({prop:i,defaultProp:u,onChange:d}),N=n.useRef(null),V=!x||!!x.closest("form"),[W,A]=n.useState(new Set),B=Array.from(W).map(e=>e.props.value).join(";");return(0,M.jsx)(h.fC,{...g,children:(0,M.jsxs)(_,{required:w,scope:t,trigger:x,onTriggerChange:b,valueNode:S,onValueNodeChange:C,valueNodeHasChildren:j,onValueNodeHasChildrenChange:k,contentId:(0,v.M)(),value:I,onValueChange:P,open:R,onOpenChange:E,dir:T,triggerPointerDownPosRef:N,disabled:m,children:[(0,M.jsx)(D.Provider,{scope:t,children:(0,M.jsx)(H,{scope:e.__scopeSelect,onNativeOptionAdd:n.useCallback(e=>{A(t=>new Set(t).add(e))},[]),onNativeOptionRemove:n.useCallback(e=>{A(t=>{let r=new Set(t);return r.delete(e),r})},[]),children:r})}),V?(0,M.jsxs)(eM,{"aria-hidden":!0,required:w,tabIndex:-1,name:p,autoComplete:f,value:I,onChange:e=>P(e.target.value),disabled:m,children:[void 0===I?(0,M.jsx)("option",{value:""}):null,Array.from(W)]},B):null]})})};B.displayName=E;var K="SelectTrigger",O=n.forwardRef((e,t)=>{let{__scopeSelect:r,disabled:n=!1,...l}=e,o=L(r),i=W(K,r),d=i.disabled||n,s=(0,u.e)(t,i.onTriggerChange),c=I(r),[p,f,v]=eT(e=>{let t=c().filter(e=>!e.disabled),r=t.find(e=>e.value===i.value),n=eR(t,e,r);void 0!==n&&i.onValueChange(n.value)}),m=()=>{d||(i.onOpenChange(!0),v())};return(0,M.jsx)(h.ee,{asChild:!0,...o,children:(0,M.jsx)(w.WV.button,{type:"button",role:"combobox","aria-controls":i.contentId,"aria-expanded":i.open,"aria-required":i.required,"aria-autocomplete":"none",dir:i.dir,"data-state":i.open?"open":"closed",disabled:d,"data-disabled":d?"":void 0,"data-placeholder":ek(i.value)?"":void 0,...l,ref:s,onClick:(0,a.M)(l.onClick,e=>{e.currentTarget.focus()}),onPointerDown:(0,a.M)(l.onPointerDown,e=>{let t=e.target;t.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),0===e.button&&!1===e.ctrlKey&&(m(),i.triggerPointerDownPosRef.current={x:Math.round(e.pageX),y:Math.round(e.pageY)},e.preventDefault())}),onKeyDown:(0,a.M)(l.onKeyDown,e=>{let t=""!==p.current;e.ctrlKey||e.altKey||e.metaKey||1!==e.key.length||f(e.key),(!t||" "!==e.key)&&T.includes(e.key)&&(m(),e.preventDefault())})})})});O.displayName=K;var F="SelectValue",U=n.forwardRef((e,t)=>{let{__scopeSelect:r,className:n,style:l,children:o,placeholder:a="",...i}=e,d=W(F,r),{onValueNodeHasChildrenChange:s}=d,c=void 0!==o,p=(0,u.e)(t,d.onValueNodeChange);return(0,b.b)(()=>{s(c)},[s,c]),(0,M.jsx)(w.WV.span,{...i,ref:p,style:{pointerEvents:"none"},children:ek(d.value)?(0,M.jsx)(M.Fragment,{children:a}):o})});U.displayName=F;var Z=n.forwardRef((e,t)=>{let{__scopeSelect:r,children:n,...l}=e;return(0,M.jsx)(w.WV.span,{"aria-hidden":!0,...l,ref:t,children:n||"▼"})});Z.displayName="SelectIcon";var z=e=>(0,M.jsx)(m.h,{asChild:!0,...e});z.displayName="SelectPortal";var q="SelectContent",Y=n.forwardRef((e,t)=>{let r=W(q,e.__scopeSelect),[o,a]=n.useState();return((0,b.b)(()=>{a(new DocumentFragment)},[]),r.open)?(0,M.jsx)(J,{...e,ref:t}):o?l.createPortal((0,M.jsx)(X,{scope:e.__scopeSelect,children:(0,M.jsx)(D.Slot,{scope:e.__scopeSelect,children:(0,M.jsx)("div",{children:e.children})})}),o):null});Y.displayName=q;var[X,G]=N(q),J=n.forwardRef((e,t)=>{let{__scopeSelect:r,position:l="item-aligned",onCloseAutoFocus:o,onEscapeKeyDown:i,onPointerDownOutside:d,side:s,sideOffset:v,align:h,alignOffset:m,arrowPadding:w,collisionBoundary:x,collisionPadding:y,sticky:b,hideWhenDetached:S,avoidCollisions:C,...T}=e,R=W(q,r),[E,D]=n.useState(null),[P,N]=n.useState(null),V=(0,u.e)(t,e=>D(e)),[L,_]=n.useState(null),[H,A]=n.useState(null),B=I(r),[K,O]=n.useState(!1),F=n.useRef(!1);n.useEffect(()=>{if(E)return(0,j.Ry)(E)},[E]),(0,p.EW)();let U=n.useCallback(e=>{let[t,...r]=B().map(e=>e.ref.current),[n]=r.slice(-1),l=document.activeElement;for(let r of e)if(r===l||(null==r||r.scrollIntoView({block:"nearest"}),r===t&&P&&(P.scrollTop=0),r===n&&P&&(P.scrollTop=P.scrollHeight),null==r||r.focus(),document.activeElement!==l))return},[B,P]),Z=n.useCallback(()=>U([L,E]),[U,L,E]);n.useEffect(()=>{K&&Z()},[K,Z]);let{onOpenChange:z,triggerPointerDownPosRef:Y}=R;n.useEffect(()=>{if(E){let e={x:0,y:0},t=t=>{var r,n,l,o;e={x:Math.abs(Math.round(t.pageX)-(null!==(l=null===(r=Y.current)||void 0===r?void 0:r.x)&&void 0!==l?l:0)),y:Math.abs(Math.round(t.pageY)-(null!==(o=null===(n=Y.current)||void 0===n?void 0:n.y)&&void 0!==o?o:0))}},r=r=>{e.x<=10&&e.y<=10?r.preventDefault():E.contains(r.target)||z(!1),document.removeEventListener("pointermove",t),Y.current=null};return null!==Y.current&&(document.addEventListener("pointermove",t),document.addEventListener("pointerup",r,{capture:!0,once:!0})),()=>{document.removeEventListener("pointermove",t),document.removeEventListener("pointerup",r,{capture:!0})}}},[E,z,Y]),n.useEffect(()=>{let e=()=>z(!1);return window.addEventListener("blur",e),window.addEventListener("resize",e),()=>{window.removeEventListener("blur",e),window.removeEventListener("resize",e)}},[z]);let[G,J]=eT(e=>{let t=B().filter(e=>!e.disabled),r=t.find(e=>e.ref.current===document.activeElement),n=eR(t,e,r);n&&setTimeout(()=>n.ref.current.focus())}),ee=n.useCallback((e,t,r)=>{let n=!F.current&&!r;(void 0!==R.value&&R.value===t||n)&&(_(e),n&&(F.current=!0))},[R.value]),et=n.useCallback(()=>null==E?void 0:E.focus(),[E]),er=n.useCallback((e,t,r)=>{let n=!F.current&&!r;(void 0!==R.value&&R.value===t||n)&&A(e)},[R.value]),en="popper"===l?Q:$,el=en===Q?{side:s,sideOffset:v,align:h,alignOffset:m,arrowPadding:w,collisionBoundary:x,collisionPadding:y,sticky:b,hideWhenDetached:S,avoidCollisions:C}:{};return(0,M.jsx)(X,{scope:r,content:E,viewport:P,onViewportChange:N,itemRefCallback:ee,selectedItem:L,onItemLeave:et,itemTextRefCallback:er,focusSelectedItem:Z,selectedItemText:H,position:l,isPositioned:K,searchRef:G,children:(0,M.jsx)(k.Z,{as:g.g7,allowPinchZoom:!0,children:(0,M.jsx)(f.M,{asChild:!0,trapped:R.open,onMountAutoFocus:e=>{e.preventDefault()},onUnmountAutoFocus:(0,a.M)(o,e=>{var t;null===(t=R.trigger)||void 0===t||t.focus({preventScroll:!0}),e.preventDefault()}),children:(0,M.jsx)(c.XB,{asChild:!0,disableOutsidePointerEvents:!0,onEscapeKeyDown:i,onPointerDownOutside:d,onFocusOutside:e=>e.preventDefault(),onDismiss:()=>R.onOpenChange(!1),children:(0,M.jsx)(en,{role:"listbox",id:R.contentId,"data-state":R.open?"open":"closed",dir:R.dir,onContextMenu:e=>e.preventDefault(),...T,...el,onPlaced:()=>O(!0),ref:V,style:{display:"flex",flexDirection:"column",outline:"none",...T.style},onKeyDown:(0,a.M)(T.onKeyDown,e=>{let t=e.ctrlKey||e.altKey||e.metaKey;if("Tab"===e.key&&e.preventDefault(),t||1!==e.key.length||J(e.key),["ArrowUp","ArrowDown","Home","End"].includes(e.key)){let t=B().filter(e=>!e.disabled).map(e=>e.ref.current);if(["ArrowUp","End"].includes(e.key)&&(t=t.slice().reverse()),["ArrowUp","ArrowDown"].includes(e.key)){let r=e.target,n=t.indexOf(r);t=t.slice(n+1)}setTimeout(()=>U(t)),e.preventDefault()}})})})})})})});J.displayName="SelectContentImpl";var $=n.forwardRef((e,t)=>{let{__scopeSelect:r,onPlaced:l,...a}=e,i=W(q,r),d=G(q,r),[s,c]=n.useState(null),[p,f]=n.useState(null),v=(0,u.e)(t,e=>f(e)),h=I(r),m=n.useRef(!1),g=n.useRef(!0),{viewport:x,selectedItem:y,selectedItemText:S,focusSelectedItem:C}=d,j=n.useCallback(()=>{if(i.trigger&&i.valueNode&&s&&p&&x&&y&&S){let e=i.trigger.getBoundingClientRect(),t=p.getBoundingClientRect(),r=i.valueNode.getBoundingClientRect(),n=S.getBoundingClientRect();if("rtl"!==i.dir){let l=n.left-t.left,a=r.left-l,i=e.left-a,u=e.width+i,d=Math.max(u,t.width),c=o(a,[10,window.innerWidth-10-d]);s.style.minWidth=u+"px",s.style.left=c+"px"}else{let l=t.right-n.right,a=window.innerWidth-r.right-l,i=window.innerWidth-e.right-a,u=e.width+i,d=Math.max(u,t.width),c=o(a,[10,window.innerWidth-10-d]);s.style.minWidth=u+"px",s.style.right=c+"px"}let a=h(),u=window.innerHeight-20,d=x.scrollHeight,c=window.getComputedStyle(p),f=parseInt(c.borderTopWidth,10),v=parseInt(c.paddingTop,10),w=parseInt(c.borderBottomWidth,10),g=f+v+d+parseInt(c.paddingBottom,10)+w,b=Math.min(5*y.offsetHeight,g),C=window.getComputedStyle(x),j=parseInt(C.paddingTop,10),k=parseInt(C.paddingBottom,10),M=e.top+e.height/2-10,T=y.offsetHeight/2,R=f+v+(y.offsetTop+T);if(R<=M){let e=y===a[a.length-1].ref.current;s.style.bottom="0px";let t=p.clientHeight-x.offsetTop-x.offsetHeight;s.style.height=R+Math.max(u-M,T+(e?k:0)+t+w)+"px"}else{let e=y===a[0].ref.current;s.style.top="0px";let t=Math.max(M,f+x.offsetTop+(e?j:0)+T);s.style.height=t+(g-R)+"px",x.scrollTop=R-M+x.offsetTop}s.style.margin="".concat(10,"px 0"),s.style.minHeight=b+"px",s.style.maxHeight=u+"px",null==l||l(),requestAnimationFrame(()=>m.current=!0)}},[h,i.trigger,i.valueNode,s,p,x,y,S,i.dir,l]);(0,b.b)(()=>j(),[j]);let[k,T]=n.useState();(0,b.b)(()=>{p&&T(window.getComputedStyle(p).zIndex)},[p]);let R=n.useCallback(e=>{e&&!0===g.current&&(j(),null==C||C(),g.current=!1)},[j,C]);return(0,M.jsx)(ee,{scope:r,contentWrapper:s,shouldExpandOnScrollRef:m,onScrollButtonChange:R,children:(0,M.jsx)("div",{ref:c,style:{display:"flex",flexDirection:"column",position:"fixed",zIndex:k},children:(0,M.jsx)(w.WV.div,{...a,ref:v,style:{boxSizing:"border-box",maxHeight:"100%",...a.style}})})})});$.displayName="SelectItemAlignedPosition";var Q=n.forwardRef((e,t)=>{let{__scopeSelect:r,align:n="start",collisionPadding:l=10,...o}=e,a=L(r);return(0,M.jsx)(h.VY,{...a,...o,ref:t,align:n,collisionPadding:l,style:{boxSizing:"border-box",...o.style,"--radix-select-content-transform-origin":"var(--radix-popper-transform-origin)","--radix-select-content-available-width":"var(--radix-popper-available-width)","--radix-select-content-available-height":"var(--radix-popper-available-height)","--radix-select-trigger-width":"var(--radix-popper-anchor-width)","--radix-select-trigger-height":"var(--radix-popper-anchor-height)"}})});Q.displayName="SelectPopperPosition";var[ee,et]=N(q,{}),er="SelectViewport",en=n.forwardRef((e,t)=>{let{__scopeSelect:r,nonce:l,...o}=e,i=G(er,r),d=et(er,r),s=(0,u.e)(t,i.onViewportChange),c=n.useRef(0);return(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)("style",{dangerouslySetInnerHTML:{__html:"[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}"},nonce:l}),(0,M.jsx)(D.Slot,{scope:r,children:(0,M.jsx)(w.WV.div,{"data-radix-select-viewport":"",role:"presentation",...o,ref:s,style:{position:"relative",flex:1,overflow:"auto",...o.style},onScroll:(0,a.M)(o.onScroll,e=>{let t=e.currentTarget,{contentWrapper:r,shouldExpandOnScrollRef:n}=d;if((null==n?void 0:n.current)&&r){let e=Math.abs(c.current-t.scrollTop);if(e>0){let n=window.innerHeight-20,l=Math.max(parseFloat(r.style.minHeight),parseFloat(r.style.height));if(l<n){let o=l+e,a=Math.min(n,o),i=o-a;r.style.height=a+"px","0px"===r.style.bottom&&(t.scrollTop=i>0?i:0,r.style.justifyContent="flex-end")}}}c.current=t.scrollTop})})})]})});en.displayName=er;var el="SelectGroup",[eo,ea]=N(el),ei=n.forwardRef((e,t)=>{let{__scopeSelect:r,...n}=e,l=(0,v.M)();return(0,M.jsx)(eo,{scope:r,id:l,children:(0,M.jsx)(w.WV.div,{role:"group","aria-labelledby":l,...n,ref:t})})});ei.displayName=el;var eu="SelectLabel",ed=n.forwardRef((e,t)=>{let{__scopeSelect:r,...n}=e,l=ea(eu,r);return(0,M.jsx)(w.WV.div,{id:l.id,...n,ref:t})});ed.displayName=eu;var es="SelectItem",[ec,ep]=N(es),ef=n.forwardRef((e,t)=>{let{__scopeSelect:r,value:l,disabled:o=!1,textValue:i,...d}=e,s=W(es,r),c=G(es,r),p=s.value===l,[f,h]=n.useState(null!=i?i:""),[m,g]=n.useState(!1),x=(0,u.e)(t,e=>{var t;return null===(t=c.itemRefCallback)||void 0===t?void 0:t.call(c,e,l,o)}),y=(0,v.M)(),b=()=>{o||(s.onValueChange(l),s.onOpenChange(!1))};if(""===l)throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");return(0,M.jsx)(ec,{scope:r,value:l,disabled:o,textId:y,isSelected:p,onItemTextChange:n.useCallback(e=>{h(t=>{var r;return t||(null!==(r=null==e?void 0:e.textContent)&&void 0!==r?r:"").trim()})},[]),children:(0,M.jsx)(D.ItemSlot,{scope:r,value:l,disabled:o,textValue:f,children:(0,M.jsx)(w.WV.div,{role:"option","aria-labelledby":y,"data-highlighted":m?"":void 0,"aria-selected":p&&m,"data-state":p?"checked":"unchecked","aria-disabled":o||void 0,"data-disabled":o?"":void 0,tabIndex:o?void 0:-1,...d,ref:x,onFocus:(0,a.M)(d.onFocus,()=>g(!0)),onBlur:(0,a.M)(d.onBlur,()=>g(!1)),onPointerUp:(0,a.M)(d.onPointerUp,b),onPointerMove:(0,a.M)(d.onPointerMove,e=>{if(o){var t;null===(t=c.onItemLeave)||void 0===t||t.call(c)}else e.currentTarget.focus({preventScroll:!0})}),onPointerLeave:(0,a.M)(d.onPointerLeave,e=>{if(e.currentTarget===document.activeElement){var t;null===(t=c.onItemLeave)||void 0===t||t.call(c)}}),onKeyDown:(0,a.M)(d.onKeyDown,e=>{var t;(null===(t=c.searchRef)||void 0===t?void 0:t.current)!==""&&" "===e.key||(R.includes(e.key)&&b()," "===e.key&&e.preventDefault())})})})})});ef.displayName=es;var ev="SelectItemText",eh=n.forwardRef((e,t)=>{let{__scopeSelect:r,className:o,style:a,...i}=e,d=W(ev,r),s=G(ev,r),c=ep(ev,r),p=A(ev,r),[f,v]=n.useState(null),h=(0,u.e)(t,e=>v(e),c.onItemTextChange,e=>{var t;return null===(t=s.itemTextRefCallback)||void 0===t?void 0:t.call(s,e,c.value,c.disabled)}),m=null==f?void 0:f.textContent,g=n.useMemo(()=>(0,M.jsx)("option",{value:c.value,disabled:c.disabled,children:m},c.value),[c.disabled,c.value,m]),{onNativeOptionAdd:x,onNativeOptionRemove:y}=p;return(0,b.b)(()=>(x(g),()=>y(g)),[x,y,g]),(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)(w.WV.span,{id:c.textId,...i,ref:h}),c.isSelected&&d.valueNode&&!d.valueNodeHasChildren?l.createPortal(i.children,d.valueNode):null]})});eh.displayName=ev;var em="SelectItemIndicator",ew=n.forwardRef((e,t)=>{let{__scopeSelect:r,...n}=e;return ep(em,r).isSelected?(0,M.jsx)(w.WV.span,{"aria-hidden":!0,...n,ref:t}):null});ew.displayName=em;var eg="SelectScrollUpButton",ex=n.forwardRef((e,t)=>{let r=G(eg,e.__scopeSelect),l=et(eg,e.__scopeSelect),[o,a]=n.useState(!1),i=(0,u.e)(t,l.onScrollButtonChange);return(0,b.b)(()=>{if(r.viewport&&r.isPositioned){let e=function(){a(t.scrollTop>0)},t=r.viewport;return e(),t.addEventListener("scroll",e),()=>t.removeEventListener("scroll",e)}},[r.viewport,r.isPositioned]),o?(0,M.jsx)(eS,{...e,ref:i,onAutoScroll:()=>{let{viewport:e,selectedItem:t}=r;e&&t&&(e.scrollTop=e.scrollTop-t.offsetHeight)}}):null});ex.displayName=eg;var ey="SelectScrollDownButton",eb=n.forwardRef((e,t)=>{let r=G(ey,e.__scopeSelect),l=et(ey,e.__scopeSelect),[o,a]=n.useState(!1),i=(0,u.e)(t,l.onScrollButtonChange);return(0,b.b)(()=>{if(r.viewport&&r.isPositioned){let e=function(){let e=t.scrollHeight-t.clientHeight;a(Math.ceil(t.scrollTop)<e)},t=r.viewport;return e(),t.addEventListener("scroll",e),()=>t.removeEventListener("scroll",e)}},[r.viewport,r.isPositioned]),o?(0,M.jsx)(eS,{...e,ref:i,onAutoScroll:()=>{let{viewport:e,selectedItem:t}=r;e&&t&&(e.scrollTop=e.scrollTop+t.offsetHeight)}}):null});eb.displayName=ey;var eS=n.forwardRef((e,t)=>{let{__scopeSelect:r,onAutoScroll:l,...o}=e,i=G("SelectScrollButton",r),u=n.useRef(null),d=I(r),s=n.useCallback(()=>{null!==u.current&&(window.clearInterval(u.current),u.current=null)},[]);return n.useEffect(()=>()=>s(),[s]),(0,b.b)(()=>{var e;let t=d().find(e=>e.ref.current===document.activeElement);null==t||null===(e=t.ref.current)||void 0===e||e.scrollIntoView({block:"nearest"})},[d]),(0,M.jsx)(w.WV.div,{"aria-hidden":!0,...o,ref:t,style:{flexShrink:0,...o.style},onPointerDown:(0,a.M)(o.onPointerDown,()=>{null===u.current&&(u.current=window.setInterval(l,50))}),onPointerMove:(0,a.M)(o.onPointerMove,()=>{var e;null===(e=i.onItemLeave)||void 0===e||e.call(i),null===u.current&&(u.current=window.setInterval(l,50))}),onPointerLeave:(0,a.M)(o.onPointerLeave,()=>{s()})})}),eC=n.forwardRef((e,t)=>{let{__scopeSelect:r,...n}=e;return(0,M.jsx)(w.WV.div,{"aria-hidden":!0,...n,ref:t})});eC.displayName="SelectSeparator";var ej="SelectArrow";function ek(e){return""===e||void 0===e}n.forwardRef((e,t)=>{let{__scopeSelect:r,...n}=e,l=L(r),o=W(ej,r),a=G(ej,r);return o.open&&"popper"===a.position?(0,M.jsx)(h.Eh,{...l,...n,ref:t}):null}).displayName=ej;var eM=n.forwardRef((e,t)=>{let{value:r,...l}=e,o=n.useRef(null),a=(0,u.e)(t,o),i=(0,S.D)(r);return n.useEffect(()=>{let e=o.current,t=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,"value").set;if(i!==r&&t){let n=new Event("change",{bubbles:!0});t.call(e,r),e.dispatchEvent(n)}},[i,r]),(0,M.jsx)(C.T,{asChild:!0,children:(0,M.jsx)("select",{...l,ref:a,defaultValue:r})})});function eT(e){let t=(0,x.W)(e),r=n.useRef(""),l=n.useRef(0),o=n.useCallback(e=>{let n=r.current+e;t(n),function e(t){r.current=t,window.clearTimeout(l.current),""!==t&&(l.current=window.setTimeout(()=>e(""),1e3))}(n)},[t]),a=n.useCallback(()=>{r.current="",window.clearTimeout(l.current)},[]);return n.useEffect(()=>()=>window.clearTimeout(l.current),[]),[r,o,a]}function eR(e,t,r){var n;let l=t.length>1&&Array.from(t).every(e=>e===t[0])?t[0]:t,o=(n=Math.max(r?e.indexOf(r):-1,0),e.map((t,r)=>e[(n+r)%e.length]));1===l.length&&(o=o.filter(e=>e!==r));let a=o.find(e=>e.textValue.toLowerCase().startsWith(l.toLowerCase()));return a!==r?a:void 0}eM.displayName="BubbleSelect";var eE=B,eD=O,eI=U,eP=Z,eN=z,eV=Y,eL=en,e_=ei,eW=ed,eH=ef,eA=eh,eB=ew,eK=ex,eO=eb,eF=eC},31725:function(e,t,r){r.d(t,{T:function(){return a},f:function(){return i}});var n=r(2265),l=r(25171),o=r(57437),a=n.forwardRef((e,t)=>(0,o.jsx)(l.WV.span,{...e,ref:t,style:{position:"absolute",border:0,width:1,height:1,padding:0,margin:-1,overflow:"hidden",clip:"rect(0, 0, 0, 0)",whiteSpace:"nowrap",wordWrap:"normal",...e.style}}));a.displayName="VisuallyHidden";var i=a}}]);