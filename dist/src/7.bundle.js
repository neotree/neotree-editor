(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{263:function(e,t,n){"use strict";var a=n(10),r=n.n(a),o=n(9),c=n.n(o),l=n(20),i=n.n(l),s=n(0),u=n.n(s),d=n(2),m=n.n(d),f=n(376),p=n(343),b=n(344),h=n(250),g=n(346),y=n(347),v=n(137),E=n(315),k=n(304),w=n(12),O=n.n(w),j=n(5),x=n.n(j),C=n(277),S=n.n(C),I=n(345),N=n(264),R=n(258),K=n.n(R),P=n(248),F=n(281),z=n.n(F),D=n(374),T=Object(N.c)((function(){return u.a.createElement("div",null,u.a.createElement(D.a,{title:"Drag to reposition"},u.a.createElement(P.a,{style:{cursor:"move"}},u.a.createElement(z.a,null))))})),M=Object(N.b)((function(e){var t=e.row,n=e.rowIndex,a=e.selectable,r=e.classes,o=e.selected,l=e.setSelected,i=e.displayFields,s=e.action,d=e.sortable;return u.a.createElement(p.a,{className:x()(r.dataItemRow,{selected:o.map((function(e){return e.rowIndex})).includes(n)})},a&&u.a.createElement(b.a,{padding:"none"},u.a.createElement(E.a,{checked:o.map((function(e){return e.rowIndex})).includes(n),onChange:function(){return l((function(e){return e.map((function(e){return e.rowIndex})).includes(n)?e.filter((function(e){return e.rowIndex!==n})):[].concat(K()(e),[{row:t,rowIndex:n}])}))}})),d&&u.a.createElement(b.a,{padding:"none"},u.a.createElement(T,null)),i.map((function(e,a){var r=e.render?e.render({row:t,rowIndex:n,column:e.key,columnIndex:a}):t[e.key];return u.a.createElement(b.a,c()({},e.cellProps,{key:"".concat(n).concat(e.key).concat(a)}),r)})),s?u.a.createElement(b.a,{align:"right",padding:"none"},s):null)})),q=Object(N.a)((function(e){var t=e.rows,n=e.sortable,a=e.classes,r=e.selected,o=e.selectable,c=e.setSelected,l=e.displayFields,i=e.renderRowAction,s=e.filter;return u.a.createElement(I.a,null,t.map((function(e,t){var d=t;return s&&!s(e)?null:u.a.createElement(M,{key:"".concat(d).concat(t),row:e,sortable:n,index:t,rowIndex:t,classes:a,selectable:o,action:i?i(e,t)||u.a.createElement(u.a.Fragment,null):null,displayFields:l,selected:r,setSelected:c})})))}));function B(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function A(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?B(Object(n),!0).forEach((function(t){r()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):B(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var W=O()((function(e){return{table:{minWidth:800},headerWrap:{position:"relative",height:60},header:{position:"absolute",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",boxSizing:"border-box",padding:e.spacing()},dataItemRow:{"&:hover, &.selected":{backgroundColor:e.palette.action.hover}}}}));function H(e){var t=e.noDataMsg,n=e.title,a=e.selectable,r=e.renderRowAction,o=e.data,l=e.onSortData,s=e.displayFields,d=e.renderHeaderActions,m=e.filter;a=!1!==a;var w=W(),O=u.a.useState([]),j=i()(O,2),C=j[0],I=j[1],N=u.a.useState(o),R=i()(N,2),K=R[0],P=R[1];return u.a.useEffect((function(){JSON.stringify(K)!==JSON.stringify(o)&&P(o)}),[o]),u.a.createElement(u.a.Fragment,null,u.a.createElement(h.a,{square:!0,elevation:0},u.a.createElement("div",{className:x()(w.headerWrap)},u.a.createElement("div",{className:x()(w.header)},u.a.createElement(v.a,{variant:"h6"},n),u.a.createElement("div",{style:{marginLeft:"auto"}}),d&&d({selected:C}))),u.a.createElement(k.a,null),K.length?u.a.createElement(f.a,{component:h.a},u.a.createElement(g.a,{className:x()(w.table)},u.a.createElement(y.a,null,u.a.createElement(p.a,null,a&&u.a.createElement(b.a,{padding:"none"},u.a.createElement(E.a,{indeterminate:C.length>0&&C.length<K.length,checked:K.length>0&&C.length===K.length,onChange:function(){return I((function(e){return e.length<K.length?K.map((function(e,t){return{row:e,rowIndex:t}})):[]}))}})),!!l&&u.a.createElement(b.a,null),s.map((function(e,t){return u.a.createElement(b.a,c()({},e.cellProps,{key:"".concat(e.key).concat(t)}),u.a.createElement("b",null,e.label))})),r?u.a.createElement(b.a,{align:"right"},u.a.createElement("b",null,"Action")):null)),u.a.createElement(q,{rows:K,filter:m,selectable:a,renderRowAction:r,classes:w,displayFields:s,selected:C,setSelected:I,useDragHandle:!0,sortable:!!l,onSortEnd:function(e){var t=e.oldIndex,n=e.newIndex,a=S()(K,{$splice:[[t,1],[n,0,K[t]]]}).map((function(e,t){return A(A({},e),{},{position:t+1})}));P(a),l(a)}}))):u.a.createElement("div",{style:{textAlign:"center",padding:25}},u.a.createElement(v.a,{color:"textSecondary"},t||"No data"))))}H.propTypes={noDataMsg:m.a.string,selectable:m.a.bool,renderRowAction:m.a.func,title:m.a.string.isRequired,displayFields:m.a.array.isRequired,renderHeaderActions:m.a.func,onSortData:m.a.func,data:m.a.array.isRequired,filter:m.a.func};t.a=H},266:function(e,t,n){"use strict";var a=n(32),r=n(142);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=r(n(0)),c=(0,a(n(143)).default)(o.createElement("path",{d:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"}),"Delete");t.default=c},269:function(e,t,n){"use strict";var a=n(1),r=n(56),o=n(3),c=n(0),l=n(4),i=n(99),s=n(270),u=n(6),d=n(248),m=c.forwardRef((function(e,t){var n=e.autoFocus,u=e.checked,m=e.checkedIcon,f=e.classes,p=e.className,b=e.defaultChecked,h=e.disabled,g=e.icon,y=e.id,v=e.inputProps,E=e.inputRef,k=e.name,w=e.onBlur,O=e.onChange,j=e.onFocus,x=e.readOnly,C=e.required,S=e.tabIndex,I=e.type,N=e.value,R=Object(o.a)(e,["autoFocus","checked","checkedIcon","classes","className","defaultChecked","disabled","icon","id","inputProps","inputRef","name","onBlur","onChange","onFocus","readOnly","required","tabIndex","type","value"]),K=Object(i.a)({controlled:u,default:Boolean(b),name:"SwitchBase",state:"checked"}),P=Object(r.a)(K,2),F=P[0],z=P[1],D=Object(s.a)(),T=h;D&&void 0===T&&(T=D.disabled);var M="checkbox"===I||"radio"===I;return c.createElement(d.a,Object(a.a)({component:"span",className:Object(l.a)(f.root,p,F&&f.checked,T&&f.disabled),disabled:T,tabIndex:null,role:void 0,onFocus:function(e){j&&j(e),D&&D.onFocus&&D.onFocus(e)},onBlur:function(e){w&&w(e),D&&D.onBlur&&D.onBlur(e)},ref:t},R),c.createElement("input",Object(a.a)({autoFocus:n,checked:u,defaultChecked:b,className:f.input,disabled:T,id:M&&y,name:k,onChange:function(e){var t=e.target.checked;z(t),O&&O(e,t)},readOnly:x,ref:E,required:C,tabIndex:S,type:I,value:N},v)),F?m:g)}));t.a=Object(u.a)({root:{padding:9},checked:{},disabled:{},input:{cursor:"inherit",position:"absolute",opacity:0,width:"100%",height:"100%",top:0,left:0,margin:0,padding:0,zIndex:1}},{name:"PrivateSwitchBase"})(m)},304:function(e,t,n){"use strict";var a=n(1),r=n(3),o=n(0),c=n(4),l=n(6),i=n(17),s=o.forwardRef((function(e,t){var n=e.absolute,l=void 0!==n&&n,i=e.classes,s=e.className,u=e.component,d=void 0===u?"hr":u,m=e.flexItem,f=void 0!==m&&m,p=e.light,b=void 0!==p&&p,h=e.orientation,g=void 0===h?"horizontal":h,y=e.role,v=void 0===y?"hr"!==d?"separator":void 0:y,E=e.variant,k=void 0===E?"fullWidth":E,w=Object(r.a)(e,["absolute","classes","className","component","flexItem","light","orientation","role","variant"]);return o.createElement(d,Object(a.a)({className:Object(c.a)(i.root,s,"fullWidth"!==k&&i[k],l&&i.absolute,f&&i.flexItem,b&&i.light,"vertical"===g&&i.vertical),role:v,ref:t},w))}));t.a=Object(l.a)((function(e){return{root:{height:1,margin:0,border:"none",flexShrink:0,backgroundColor:e.palette.divider},absolute:{position:"absolute",bottom:0,left:0,width:"100%"},inset:{marginLeft:72},light:{backgroundColor:Object(i.a)(e.palette.divider,.08)},middle:{marginLeft:e.spacing(2),marginRight:e.spacing(2)},vertical:{height:"100%",width:1},flexItem:{alignSelf:"stretch",height:"auto"}}}),{name:"MuiDivider"})(s)},305:function(e,t,n){"use strict";var a=n(9),r=n.n(a),o=n(11),c=n.n(o),l=n(0),i=n.n(l),s=n(13),u=n(2),d=n.n(u),m=n(5),f=n.n(m),p=n(12),b=["className"],h=n.n(p)()((function(){return{root:{position:"fixed",bottom:20,right:20,zIndex:10}}})),g=i.a.forwardRef((function(e,t){var n=e.className,a=c()(e,b),o=h();return i.a.createElement(i.a.Fragment,null,Object(s.createPortal)(i.a.createElement("div",r()({},a,{ref:t,className:f()(n,o.root)})),document.body))}));g.propTypes={className:d.a.string},t.a=g},307:function(e,t,n){"use strict";var a=n(3),r=n(1),o=n(0),c=n(4),l=n(6),i=n(94),s=n(8),u=o.forwardRef((function(e,t){var n=e.children,l=e.classes,u=e.className,d=e.color,m=void 0===d?"default":d,f=e.component,p=void 0===f?"button":f,b=e.disabled,h=void 0!==b&&b,g=e.disableFocusRipple,y=void 0!==g&&g,v=e.focusVisibleClassName,E=e.size,k=void 0===E?"large":E,w=e.variant,O=void 0===w?"circular":w,j=Object(a.a)(e,["children","classes","className","color","component","disabled","disableFocusRipple","focusVisibleClassName","size","variant"]);return o.createElement(i.a,Object(r.a)({className:Object(c.a)(l.root,u,"large"!==k&&l["size".concat(Object(s.a)(k))],h&&l.disabled,"extended"===O&&l.extended,{primary:l.primary,secondary:l.secondary,inherit:l.colorInherit}[m]),component:p,disabled:h,focusRipple:!y,focusVisibleClassName:Object(c.a)(l.focusVisible,v),ref:t},j),o.createElement("span",{className:l.label},n))}));t.a=Object(l.a)((function(e){return{root:Object(r.a)({},e.typography.button,{boxSizing:"border-box",minHeight:36,transition:e.transitions.create(["background-color","box-shadow","border"],{duration:e.transitions.duration.short}),borderRadius:"50%",padding:0,minWidth:0,width:56,height:56,boxShadow:e.shadows[6],"&:active":{boxShadow:e.shadows[12]},color:e.palette.getContrastText(e.palette.grey[300]),backgroundColor:e.palette.grey[300],"&:hover":{backgroundColor:e.palette.grey.A100,"@media (hover: none)":{backgroundColor:e.palette.grey[300]},"&$disabled":{backgroundColor:e.palette.action.disabledBackground},textDecoration:"none"},"&$focusVisible":{boxShadow:e.shadows[6]},"&$disabled":{color:e.palette.action.disabled,boxShadow:e.shadows[0],backgroundColor:e.palette.action.disabledBackground}}),label:{width:"100%",display:"inherit",alignItems:"inherit",justifyContent:"inherit"},primary:{color:e.palette.primary.contrastText,backgroundColor:e.palette.primary.main,"&:hover":{backgroundColor:e.palette.primary.dark,"@media (hover: none)":{backgroundColor:e.palette.primary.main}}},secondary:{color:e.palette.secondary.contrastText,backgroundColor:e.palette.secondary.main,"&:hover":{backgroundColor:e.palette.secondary.dark,"@media (hover: none)":{backgroundColor:e.palette.secondary.main}}},extended:{borderRadius:24,padding:"0 16px",width:"auto",minHeight:"auto",minWidth:48,height:48,"&$sizeSmall":{width:"auto",padding:"0 8px",borderRadius:17,minWidth:34,height:34},"&$sizeMedium":{width:"auto",padding:"0 16px",borderRadius:20,minWidth:40,height:40}},focusVisible:{},disabled:{},colorInherit:{color:"inherit"},sizeSmall:{width:40,height:40},sizeMedium:{width:48,height:48}}}),{name:"MuiFab"})(u)},315:function(e,t,n){"use strict";var a=n(1),r=n(3),o=n(0),c=n(4),l=n(269),i=n(55),s=Object(i.a)(o.createElement("path",{d:"M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"}),"CheckBoxOutlineBlank"),u=Object(i.a)(o.createElement("path",{d:"M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"}),"CheckBox"),d=n(17),m=Object(i.a)(o.createElement("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"}),"IndeterminateCheckBox"),f=n(8),p=n(6),b=o.createElement(u,null),h=o.createElement(s,null),g=o.createElement(m,null),y=o.forwardRef((function(e,t){var n=e.checkedIcon,i=void 0===n?b:n,s=e.classes,u=e.color,d=void 0===u?"secondary":u,m=e.icon,p=void 0===m?h:m,y=e.indeterminate,v=void 0!==y&&y,E=e.indeterminateIcon,k=void 0===E?g:E,w=e.inputProps,O=e.size,j=void 0===O?"medium":O,x=Object(r.a)(e,["checkedIcon","classes","color","icon","indeterminate","indeterminateIcon","inputProps","size"]),C=v?k:p,S=v?k:i;return o.createElement(l.a,Object(a.a)({type:"checkbox",classes:{root:Object(c.a)(s.root,s["color".concat(Object(f.a)(d))],v&&s.indeterminate),checked:s.checked,disabled:s.disabled},color:d,inputProps:Object(a.a)({"data-indeterminate":v},w),icon:o.cloneElement(C,{fontSize:void 0===C.props.fontSize&&"small"===j?j:C.props.fontSize}),checkedIcon:o.cloneElement(S,{fontSize:void 0===S.props.fontSize&&"small"===j?j:S.props.fontSize}),ref:t},x))}));t.a=Object(p.a)((function(e){return{root:{color:e.palette.text.secondary},checked:{},disabled:{},indeterminate:{},colorPrimary:{"&$checked":{color:e.palette.primary.main,"&:hover":{backgroundColor:Object(d.a)(e.palette.primary.main,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}}},"&$disabled":{color:e.palette.action.disabled}},colorSecondary:{"&$checked":{color:e.palette.secondary.main,"&:hover":{backgroundColor:Object(d.a)(e.palette.secondary.main,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}}},"&$disabled":{color:e.palette.action.disabled}}}}),{name:"MuiCheckbox"})(y)},330:function(e,t,n){"use strict";var a=n(42),r=n.n(a),o=n(9),c=n.n(o),l=n(20),i=n.n(l),s=n(11),u=n.n(s),d=n(29),m=n.n(d),f=n(0),p=n.n(f),b=n(2),h=n.n(b),g=n(101),y=n(57),v=["children","configKeys","onClick"],E=p.a.forwardRef((function(e,t){var n=e.children,a=e.configKeys,o=e.onClick,l=u()(e,v),s=p.a.useState(!1),d=i()(s,2),f=d[0],b=d[1],h=a.length>1,E=Object(g.a)(),k=i()(E,2),w=k[0],O=k[1];return p.a.createElement(p.a.Fragment,null,p.a.createElement("div",c()({},l,{ref:t,onClick:function(e){O(),o&&o(e)}}),n),w({title:"Delete config key".concat(h?"s":""),message:"Are you sure you want to delete config key".concat(h?"s":"","?"),onConfirm:function(){r()(m.a.mark((function e(){var t,n,r;return m.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return b(!0),e.prev=1,e.next=4,fetch("/delete-config-keys",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({configKeys:a})});case 4:return t=e.sent,e.next=7,t.json();case 7:n=e.sent,(r=n.errors)&&r.length?alert(JSON.stringify(r)):window.location.reload(),e.next=15;break;case 12:e.prev=12,e.t0=e.catch(1),alert(e.t0.message);case 15:b(!1);case 16:case"end":return e.stop()}}),e,null,[[1,12]])})))()}}),f?p.a.createElement(y.a,null):null)}));E.propTypes={onClick:h.a.func,children:h.a.node,configKeys:h.a.array.isRequired},t.a=E},331:function(e,t,n){"use strict";var a=n(42),r=n.n(a),o=n(9),c=n.n(o),l=n(20),i=n.n(l),s=n(11),u=n.n(s),d=n(29),m=n.n(d),f=n(0),p=n.n(f),b=n(2),h=n.n(b),g=n(57),y=n(101),v=["children","configKeys","onClick"],E=p.a.forwardRef((function(e,t){var n=e.children,a=e.configKeys,o=e.onClick,l=u()(e,v),s=p.a.useState(!1),d=i()(s,2),f=d[0],b=d[1],h=Object(y.a)(),E=i()(h,2),k=E[0],w=E[1],O=a.length>1;return p.a.createElement(p.a.Fragment,null,p.a.createElement("div",c()({},l,{ref:t,onClick:function(e){w(),o&&o(e)}}),n),k({title:"Duplicate config key".concat(O?"s":""),message:"Are you sure you want to duplicate config key".concat(O?"s":"","?"),onConfirm:function(){r()(m.a.mark((function e(){var t,n,r;return m.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return b(!0),e.prev=1,e.next=4,fetch("/duplicate-config-keys",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({configKeys:a})});case 4:return t=e.sent,e.next=7,t.json();case 7:n=e.sent,(r=n.errors)&&r.length?alert(JSON.stringify(r)):window.location.reload(),e.next=15;break;case 12:e.prev=12,e.t0=e.catch(1),alert(e.t0.message);case 15:b(!1);case 16:case"end":return e.stop()}}),e,null,[[1,12]])})))()}}),f&&p.a.createElement(g.a,null))}));E.propTypes={onClick:h.a.func,children:h.a.node,configKeys:h.a.array.isRequired},t.a=E},332:function(e,t,n){"use strict";var a=n(9),r=n.n(a),o=n(42),c=n.n(o),l=n(10),i=n.n(l),s=n(20),u=n.n(s),d=n(11),m=n.n(d),f=n(29),p=n.n(f),b=n(0),h=n.n(b),g=n(2),y=n.n(g),v=n(225),E=n(221),k=n(222),w=n(223),O=n(138),j=n(387),x=n(219),C=n(137),S=n(57),I=n(26),N=["children","onClick","configKey"];function R(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function K(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?R(Object(n),!0).forEach((function(t){i()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):R(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var P=h.a.forwardRef((function(e,t){var n=e.children,a=e.onClick,o=e.configKey,l=m()(e,N),i=Object(I.d)().state.viewMode,s=h.a.useState(!1),d=u()(s,2),f=d[0],b=d[1],g=h.a.useState(!1),y=u()(g,2),R=y[0],P=y[1],F=h.a.useState(null),z=u()(F,2),D=z[0],T=z[1],M=h.a.useState(null),q=u()(M,2),B=q[0],A=q[1],W=K({},o),H=h.a.useState(W),V=u()(H,2),J=V[0],$=V[1],L=function(e){return $((function(t){return K(K({},t),"function"==typeof e?e(t):e)}))},_=h.a.useState(!1),G=u()(_,2),Q=G[0],U=G[1],X=h.a.useState(null),Y=u()(X,2),Z=(Y[0],Y[1]),ee=h.a.useCallback((function(){c()(p.a.mark((function e(){var t;return p.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return U(!0),e.prev=1,e.next=4,fetch(o?"/update-config-key":"/create-config-key",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify(J)});case 4:return t=e.sent,e.next=7,t.json();case 7:(t=e.sent).errors&&t.errors.length?alert(JSON.stringify(t.errors)):window.location.reload(),e.next=14;break;case 11:e.prev=11,e.t0=e.catch(1),Z(e.t0);case 14:U(!1);case 15:case"end":return e.stop()}}),e,null,[[1,11]])})))()}));return h.a.useEffect((function(){o&&L(o)}),[o]),h.a.useEffect((function(){L(W)}),[f]),h.a.useEffect((function(){var e=null;J.label||(e=K(K({},e),{},{label:"Label is required"})),J.configKey||(e=K(K({},e),{},{configKey:"Key is required"})),T(e||null),A(null)}),[J]),h.a.createElement(h.a.Fragment,null,h.a.createElement("div",r()({},l,{ref:t,onClick:function(e){b(!0),a&&a(e)}}),n),h.a.createElement(v.a,{open:f,maxWidth:"sm",fullWidth:!0,onClose:function(){return R?null:b(!1)}},h.a.createElement(E.a,null,o?"Edit":"Add"," config key"),h.a.createElement(k.a,null,h.a.createElement("div",null,h.a.createElement(j.a,{fullWidth:!0,required:!0,error:!!D&&!!D.label,value:J.configKey||"",label:"Key",onChange:function(e){return L({configKey:e.target.value})}})),h.a.createElement("br",null),h.a.createElement("div",null,h.a.createElement(j.a,{fullWidth:!0,required:!0,error:!!D&&!!D.configKey,value:J.label||"",label:"Label",onChange:function(e){return L({label:e.target.value})}})),h.a.createElement("br",null),h.a.createElement("div",null,h.a.createElement(j.a,{fullWidth:!0,value:J.summary||"",label:"Summary",onChange:function(e){return L({summary:e.target.value})}})),B?h.a.createElement("div",null,h.a.createElement("br",null),h.a.createElement(C.a,{variant:"caption",color:"error"},JSON.stringify(B))):null),h.a.createElement(w.a,null,R?h.a.createElement(O.a,null,h.a.createElement(x.a,{size:20})):h.a.createElement(h.a.Fragment,null,"view"===i&&h.a.createElement(C.a,{color:"error",variant:"caption"},"Can't save because you're in view mode"),h.a.createElement(O.a,{variant:"contained",color:"primary",disabled:"view"===i||!!D,onClick:function(){P(!0),ee(o,J,(function(e){P(!1),A(e),b(!1)}))}},"Save"),h.a.createElement(O.a,{onClick:function(){return b(!1)}},"Cancel")))),Q?h.a.createElement(S.a,null):null)}));P.propTypes={onClick:y.a.func,children:y.a.node,configKey:y.a.object},t.a=P},351:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),o=n(2),c=n.n(o),l=n(248),i=n(262),s=n.n(i),u=n(266),d=n.n(u),m=n(138),f=n(307),p=n(305),b=n(330),h=n(331),g=n(332);function y(e){var t=e.selected;return r.a.createElement(r.a.Fragment,null,t.length>0&&r.a.createElement(r.a.Fragment,null,r.a.createElement(h.a,{configKeys:t.map((function(e){return{configKeyId:e.row.configKeyId}}))},r.a.createElement(m.a,null,"Duplicate")),r.a.createElement(b.a,{configKeys:t.map((function(e){return{configKeyId:e.row.configKeyId}}))},r.a.createElement(l.a,null,r.a.createElement(d.a,null)))),r.a.createElement(g.a,null,r.a.createElement(l.a,null,r.a.createElement(s.a,null))),r.a.createElement(p.a,null,r.a.createElement(g.a,null,r.a.createElement(f.a,{color:"secondary"},r.a.createElement(s.a,null)))))}y.propTypes={selected:c.a.array.isRequired},t.default=function(e){return r.a.createElement(y,e)}},352:function(e,t,n){"use strict";n.r(t);var a=n(20),r=n.n(a),o=n(0),c=n.n(o),l=n(2),i=n.n(l),s=n(248),u=n(267),d=n.n(u),m=n(359),f=n(253),p=n(137),b=n(26),h=n(330),g=n(331),y=n(332);function v(e){var t=e.row,n=Object(b.d)().state.viewMode,a=c.a.useState(null),o=r()(a,2),l=o[0],i=o[1],u=function(){return i(null)};return c.a.createElement(c.a.Fragment,null,c.a.createElement(s.a,{onClick:function(e){return i(e.currentTarget)}},c.a.createElement(d.a,null)),c.a.createElement(m.a,{anchorEl:l,keepMounted:!0,open:Boolean(l),onClose:u},c.a.createElement(f.a,{onClick:u,configKey:t,component:y.a},"view"===n?"View":"Edit"),"view"===n?null:c.a.createElement(f.a,{onClick:u,configKeys:[{id:t.id}],component:g.a},"Duplicate"),"view"===n?null:c.a.createElement(f.a,{onClick:u,configKeys:[{id:t.id}],component:h.a},c.a.createElement(p.a,{color:"error"},"Delete"))))}v.propTypes={row:i.a.object.isRequired,rowIndex:i.a.number.isRequired},t.default=function(e,t){return c.a.createElement(v,{row:e,rowIndex:t})}},396:function(e,t,n){"use strict";n.r(t);var a=n(42),r=n.n(a),o=n(20),c=n.n(o),l=n(29),i=n.n(l),s=n(0),u=n.n(s),d=n(26),m="Configuration",f=n(105),p=n(263);t.default=function(){var e=Object(d.d)().state.viewMode;Object(d.c)("configKeys"),Object(d.b)(m);var t=u.a.useState([]),a=c()(t,2),o=a[0],l=a[1],s=u.a.useState(!1),b=c()(s,2),h=b[0],g=b[1],y=u.a.useState(!1),v=c()(y,2),E=v[0],k=v[1];return u.a.useEffect((function(){r()(i.a.mark((function e(){var t,n,a;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return k(!0),e.prev=1,e.next=4,fetch("/get-config-keys");case 4:return t=e.sent,e.next=7,t.json();case 7:n=e.sent,a=n.configKeys,l(a),e.next=15;break;case 12:e.prev=12,e.t0=e.catch(1),alert(e.t0.message);case 15:g(!0),k(!1);case 17:case"end":return e.stop()}}),e,null,[[1,12]])})))()}),[]),u.a.createElement(u.a.Fragment,null,h?u.a.createElement(u.a.Fragment,null,u.a.createElement(p.a,{noDataMsg:"No config keys",selectable:!1,title:m,data:o,renderHeaderActions:"view"===e?null:n(351).default,renderRowAction:n(352).default,displayFields:[{key:"configKey",label:"Key"},{key:"label",label:"Label"},{key:"summary",label:"Summary"}],onSortData:"view"===e?void 0:function(e){l(e),r()(i.a.mark((function t(){var n;return i.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,fetch("/update-config-keys",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({configKeys:e.map((function(e){return{id:e.id,position:e.position}}))})});case 3:return n=t.sent,t.next=6,n.json();case 6:t.next=10;break;case 8:t.prev=8,t.t0=t.catch(0);case 10:case"end":return t.stop()}}),t,null,[[0,8]])})))()}})):null,E&&u.a.createElement(f.a,null))}}}]);