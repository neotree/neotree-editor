(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{191:function(e,t,r){"use strict";var n=r(6),a=r.n(n),c=r(9),o=r.n(c),i=r(0),l=r.n(i),s=r(2),u=r.n(s),d=r(27),p=r(10),f=r.n(p),b=r(79),m=r(218),g=Object(d.d)((function(){return{root:{display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center"},bg:function(e){return{backgroundColor:e.transparent?"transparent":"rgba(0,0,0,.2)"}}}})),h=function(e){var t=e.className,r=e.loaderProps,n=e.transparent,c=o()(e,["className","loaderProps","transparent"]),i=g({transparent:n});return l.a.createElement(l.a.Fragment,null,l.a.createElement(b.a,a()({},c,{className:f()(i.root,i.bg,t)}),l.a.createElement(m.a,a()({color:"primary"},r))))};h.propTypes={className:u.a.string,loaderProps:u.a.object,transparent:u.a.bool},t.a=h},196:function(e,t,r){"use strict";var n=r(6),a=r.n(n),c=r(16),o=r.n(c),i=r(20),l=r.n(i),s=r(0),u=r.n(s),d=r(2),p=r.n(d),f=r(318),b=r(314),m=r(315),g=r(181),h=r(319),y=r(320),O=r(101),v=r(332),j=r(317),E=r(39),w=r.n(E),S=r(10),P=r.n(S),k=r(215),x=r.n(k),D=r(316),C=r(195),I=r(188),T=r.n(I),N=r(182),R=r(216),F=r.n(R),A=Object(C.c)((function(){return u.a.createElement(N.a,{style:{cursor:"move"}},u.a.createElement(F.a,null))})),M=Object(C.b)((function(e){var t=e.row,r=e.rowIndex,n=e.selectable,c=e.classes,o=e.selected,i=e.setSelected,l=e.displayFields,s=e.action;return u.a.createElement(b.a,{className:P()(c.dataItemRow,{selected:o.map((function(e){return e.rowIndex})).includes(r)})},n&&u.a.createElement(m.a,{padding:"none"},u.a.createElement(v.a,{checked:o.map((function(e){return e.rowIndex})).includes(r),onChange:function(){return i((function(e){return e.map((function(e){return e.rowIndex})).includes(r)?e.filter((function(e){return e.rowIndex!==r})):[].concat(T()(e),[{row:t,rowIndex:r}])}))}})),u.a.createElement(m.a,{padding:"none"},u.a.createElement(A,null)),l.map((function(e,n){var c=e.render?e.render({row:t,rowIndex:r,column:e.key,columnIndex:n}):(t.data||t)[e.key];return u.a.createElement(m.a,a()({},e.cellProps,{key:"".concat(r).concat(e.key).concat(n)}),c)})),s?u.a.createElement(m.a,{align:"right",padding:"none"},s):null)})),z=Object(C.a)((function(e){var t=e.rows,r=e.classes,n=e.selected,a=e.selectable,c=e.setSelected,o=e.displayFields,i=e.renderRowAction;return u.a.createElement(D.a,null,t.map((function(e,t){var l=t;return u.a.createElement(M,{key:"".concat(l).concat(t),row:e,index:t,rowIndex:t,classes:r,selectable:a,action:i?i(e,t)||u.a.createElement(u.a.Fragment,null):null,displayFields:o,selected:n,setSelected:c})})))}));function q(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function H(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?q(Object(r),!0).forEach((function(t){o()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):q(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var V=w()((function(e){return{table:{minWidth:800},headerWrap:{position:"relative",height:60},header:{position:"absolute",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",boxSizing:"border-box",padding:e.spacing()},dataItemRow:{"&:hover, &.selected":{backgroundColor:e.palette.action.hover}}}}));function W(e){var t=e.noDataMsg,r=e.title,n=e.selectable,c=e.renderRowAction,o=e.data,i=e.onSortData,s=e.displayFields,d=e.renderHeaderActions;n=!1!==n;var p=V(),E=u.a.useState([]),w=l()(E,2),S=w[0],k=w[1],D=u.a.useState(o),C=l()(D,2),I=C[0],T=C[1];return u.a.useEffect((function(){T(o)}),[o]),u.a.useEffect((function(){if(JSON.stringify(I)!==JSON.stringify(o)){var e=I.map((function(e,t){return H(H({},e),{},{position:t+1})}));T(e),i&&i(e)}}),[I]),u.a.createElement(u.a.Fragment,null,u.a.createElement(g.a,{square:!0,elevation:0},u.a.createElement("div",{className:P()(p.headerWrap)},u.a.createElement("div",{className:P()(p.header)},u.a.createElement(O.a,{variant:"h6"},r),u.a.createElement("div",{style:{marginLeft:"auto"}}),d&&d({selected:S}))),u.a.createElement(j.a,null),I.length?u.a.createElement(f.a,{component:g.a},u.a.createElement(h.a,{className:P()(p.table)},u.a.createElement(y.a,null,u.a.createElement(b.a,null,n&&u.a.createElement(m.a,{padding:"none"},u.a.createElement(v.a,{indeterminate:S.length>0&&S.length<I.length,checked:I.length>0&&S.length===I.length,onChange:function(){return k((function(e){return e.length<I.length?I.map((function(e,t){return{row:e,rowIndex:t}})):[]}))}})),u.a.createElement(m.a,null),s.map((function(e,t){return u.a.createElement(m.a,a()({},e.cellProps,{key:"".concat(e.key).concat(t)}),u.a.createElement("b",null,e.label))})),c?u.a.createElement(m.a,{align:"right"},u.a.createElement("b",null,"Action")):null)),u.a.createElement(z,{rows:I,selectable:n,renderRowAction:c,classes:p,displayFields:s,selected:S,setSelected:k,useDragHandle:!0,onSortEnd:function(e){var t=e.oldIndex,r=e.newIndex;return T((function(e){return x()(e,{$splice:[[t,1],[r,0,e[t]]]})}))}}))):u.a.createElement("div",{style:{textAlign:"center",padding:25}},u.a.createElement(O.a,{color:"textSecondary"},t||"No data"))))}W.propTypes={noDataMsg:p.a.string,selectable:p.a.bool,renderRowAction:p.a.func,title:p.a.string.isRequired,displayFields:p.a.array.isRequired,renderHeaderActions:p.a.func,onSortData:p.a.func,data:p.a.array.isRequired};t.a=W},199:function(e,t,r){"use strict";r.d(t,"g",(function(){return l})),r.d(t,"i",(function(){return s})),r.d(t,"d",(function(){return u})),r.d(t,"e",(function(){return d})),r.d(t,"f",(function(){return p})),r.d(t,"h",(function(){return f})),r.d(t,"c",(function(){return b})),r.d(t,"b",(function(){return m})),r.d(t,"a",(function(){return g}));var n=r(16),a=r.n(n),c=r(40);function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var l=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/get-scripts",i({body:e},t))},s=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/update-scripts",i({method:"POST",body:e},t))},u=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/delete-script",i({method:"POST",body:e},t))},d=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/duplicate-script",i({method:"POST",body:e},t))},p=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/get-script",i({body:e},t))},f=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/update-script",i({method:"POST",body:e},t))},b=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/create-script",i({method:"POST",body:e},t))},m=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/copy-screens",i({method:"POST",body:e},t))},g=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/copy-diagnoses",i({method:"POST",body:e},t))}},201:function(e,t,r){"use strict";function n(e){var t,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:166;function n(){for(var n=arguments.length,a=new Array(n),c=0;c<n;c++)a[c]=arguments[c];var o=this,i=function(){e.apply(o,a)};clearTimeout(t),t=setTimeout(i,r)}return n.clear=function(){clearTimeout(t)},n}r.d(t,"a",(function(){return n}))},202:function(e,t,r){"use strict";var n=r(26);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var a=n(r(0)),c=(0,n(r(106)).default)(a.default.createElement("path",{d:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"}),"Delete");t.default=c},204:function(e,t,r){"use strict";t.a={PAGE_TITLE:"Scripts"}},205:function(e,t,r){"use strict";function n(e){return e?(e.map?e:[e]).reduce((function(e,t){return"".concat(e).concat(function(e){return"string"==typeof e?e:e.msg||e.message||JSON.stringify(e)}(t),"\n")}),""):""}r.d(t,"a",(function(){return n}))},218:function(e,t,r){"use strict";var n=r(1),a=r(3),c=r(0),o=(r(2),r(4)),i=r(5),l=r(8);function s(e){var t,r,n;return t=e,r=0,n=1,e=(Math.min(Math.max(r,t),n)-r)/(n-r),e=(e-=1)*e*e+1}var u=c.forwardRef((function(e,t){var r,i=e.classes,u=e.className,d=e.color,p=void 0===d?"primary":d,f=e.disableShrink,b=void 0!==f&&f,m=e.size,g=void 0===m?40:m,h=e.style,y=e.thickness,O=void 0===y?3.6:y,v=e.value,j=void 0===v?0:v,E=e.variant,w=void 0===E?"indeterminate":E,S=Object(a.a)(e,["classes","className","color","disableShrink","size","style","thickness","value","variant"]),P={},k={},x={};if("determinate"===w||"static"===w){var D=2*Math.PI*((44-O)/2);P.strokeDasharray=D.toFixed(3),x["aria-valuenow"]=Math.round(j),"static"===w?(P.strokeDashoffset="".concat(((100-j)/100*D).toFixed(3),"px"),k.transform="rotate(-90deg)"):(P.strokeDashoffset="".concat((r=(100-j)/100,r*r*D).toFixed(3),"px"),k.transform="rotate(".concat((270*s(j/70)).toFixed(3),"deg)"))}return c.createElement("div",Object(n.a)({className:Object(o.a)(i.root,u,"inherit"!==p&&i["color".concat(Object(l.a)(p))],{indeterminate:i.indeterminate,static:i.static}[w]),style:Object(n.a)({width:g,height:g},k,h),ref:t,role:"progressbar"},x,S),c.createElement("svg",{className:i.svg,viewBox:"".concat(22," ").concat(22," ").concat(44," ").concat(44)},c.createElement("circle",{className:Object(o.a)(i.circle,b&&i.circleDisableShrink,{indeterminate:i.circleIndeterminate,static:i.circleStatic}[w]),style:P,cx:44,cy:44,r:(44-O)/2,fill:"none",strokeWidth:O})))}));t.a=Object(i.a)((function(e){return{root:{display:"inline-block"},static:{transition:e.transitions.create("transform")},indeterminate:{animation:"$circular-rotate 1.4s linear infinite"},colorPrimary:{color:e.palette.primary.main},colorSecondary:{color:e.palette.secondary.main},svg:{display:"block"},circle:{stroke:"currentColor"},circleStatic:{transition:e.transitions.create("stroke-dashoffset")},circleIndeterminate:{animation:"$circular-dash 1.4s ease-in-out infinite",strokeDasharray:"80px, 200px",strokeDashoffset:"0px"},"@keyframes circular-rotate":{"0%":{transformOrigin:"50% 50%"},"100%":{transform:"rotate(360deg)"}},"@keyframes circular-dash":{"0%":{strokeDasharray:"1px, 200px",strokeDashoffset:"0px"},"50%":{strokeDasharray:"100px, 200px",strokeDashoffset:"-15px"},"100%":{strokeDasharray:"100px, 200px",strokeDashoffset:"-125px"}},circleDisableShrink:{animation:"none"}}}),{name:"MuiCircularProgress",flip:!1})(u)},237:function(e,t,r){"use strict";var n=r(6),a=r.n(n),c=r(9),o=r.n(c),i=r(0),l=r.n(i),s=r(11),u=r(2),d=r.n(u),p=r(10),f=r.n(p),b=r(39),m=r.n(b)()((function(){return{root:{position:"fixed",bottom:20,right:20,zIndex:10}}})),g=l.a.forwardRef((function(e,t){var r=e.className,n=o()(e,["className"]),c=m();return l.a.createElement(l.a.Fragment,null,Object(s.createPortal)(l.a.createElement("div",a()({},n,{ref:t,className:f()(r,c.root)})),document.body))}));g.propTypes={className:d.a.string},t.a=g},238:function(e,t,r){"use strict";var n=r(3),a=r(1),c=r(0),o=(r(2),r(4)),i=r(5),l=r(76),s=r(8),u=c.forwardRef((function(e,t){var r=e.children,i=e.classes,u=e.className,d=e.color,p=void 0===d?"default":d,f=e.component,b=void 0===f?"button":f,m=e.disabled,g=void 0!==m&&m,h=e.disableFocusRipple,y=void 0!==h&&h,O=e.focusVisibleClassName,v=e.size,j=void 0===v?"large":v,E=e.variant,w=void 0===E?"round":E,S=Object(n.a)(e,["children","classes","className","color","component","disabled","disableFocusRipple","focusVisibleClassName","size","variant"]);return c.createElement(l.a,Object(a.a)({className:Object(o.a)(i.root,u,"round"!==w&&i.extended,"large"!==j&&i["size".concat(Object(s.a)(j))],g&&i.disabled,{primary:i.primary,secondary:i.secondary,inherit:i.colorInherit}[p]),component:b,disabled:g,focusRipple:!y,focusVisibleClassName:Object(o.a)(i.focusVisible,O),ref:t},S),c.createElement("span",{className:i.label},r))}));t.a=Object(i.a)((function(e){return{root:Object(a.a)({},e.typography.button,{boxSizing:"border-box",minHeight:36,transition:e.transitions.create(["background-color","box-shadow","border"],{duration:e.transitions.duration.short}),borderRadius:"50%",padding:0,minWidth:0,width:56,height:56,boxShadow:e.shadows[6],"&:active":{boxShadow:e.shadows[12]},color:e.palette.getContrastText(e.palette.grey[300]),backgroundColor:e.palette.grey[300],"&:hover":{backgroundColor:e.palette.grey.A100,"@media (hover: none)":{backgroundColor:e.palette.grey[300]},"&$disabled":{backgroundColor:e.palette.action.disabledBackground},textDecoration:"none"},"&$focusVisible":{boxShadow:e.shadows[6]},"&$disabled":{color:e.palette.action.disabled,boxShadow:e.shadows[0],backgroundColor:e.palette.action.disabledBackground}}),label:{width:"100%",display:"inherit",alignItems:"inherit",justifyContent:"inherit"},primary:{color:e.palette.primary.contrastText,backgroundColor:e.palette.primary.main,"&:hover":{backgroundColor:e.palette.primary.dark,"@media (hover: none)":{backgroundColor:e.palette.primary.main}}},secondary:{color:e.palette.secondary.contrastText,backgroundColor:e.palette.secondary.main,"&:hover":{backgroundColor:e.palette.secondary.dark,"@media (hover: none)":{backgroundColor:e.palette.secondary.main}}},extended:{borderRadius:24,padding:"0 16px",width:"auto",minHeight:"auto",minWidth:48,height:48,"&$sizeSmall":{width:"auto",padding:"0 8px",borderRadius:17,minWidth:34,height:34},"&$sizeMedium":{width:"auto",padding:"0 16px",borderRadius:20,minWidth:40,height:40}},focusVisible:{},disabled:{},colorInherit:{color:"inherit"},sizeSmall:{width:40,height:40},sizeMedium:{width:48,height:48}}}),{name:"MuiFab"})(u)},247:function(e,t,r){"use strict";r.d(t,"b",(function(){return w})),r.d(t,"a",(function(){return S}));var n=r(16),a=r.n(n),c=r(20),o=r.n(c),i=r(0),l=r.n(i),s=r(199);function u(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function d(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?u(Object(r),!0).forEach((function(t){a()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):u(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function f(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?p(Object(r),!0).forEach((function(t){a()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):p(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function b(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function m(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?b(Object(r),!0).forEach((function(t){a()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):b(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var g=r(188),h=r.n(g);function y(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function O(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?y(Object(r),!0).forEach((function(t){a()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):y(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function v(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function j(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?v(Object(r),!0).forEach((function(t){a()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):v(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var E=l.a.createContext(null),w=function(){return l.a.useContext(E)},S=function(e){return function(t){var r=l.a.useState({scripts:[]}),n=o()(r,2),a=n[0],c=n[1],i=function(e){return c((function(t){return j(j({},t),"function"==typeof e?e(t):e)}))},u=function(e){var t=e.setState;return function(){t({loadingScripts:!0});var e=function(e,r){t(d(d({getScriptsError:e},r),{},{scriptsInitialised:!0,loadingScripts:!1}))};s.g().then((function(t){return e(t.errors,t)})).catch(e)}}({setState:i}),p=function(e){var t=e.setState;return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];if(e.length){t({deletingScripts:!0});var r=function(r){t((function(t){var n=t.scripts;return f({deleteScriptsError:r,deletingScripts:!1},r?null:{scripts:n.filter((function(t){return e.indexOf(t.id)<0}))})}))};s.d({id:e[0]}).then((function(e){return r(e.errors,e)})).catch(r)}}}({setState:i}),b=function(e){var t=e.setState;return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];if(e.length){t({updatingScripts:!0});var r=function(e,r){t(m(m({updateScriptsError:e},r),{},{updatingScripts:!1}))};s.i({scripts:e}).then((function(e){return r(e.errors,e)})).catch(r)}}}({setState:i}),g=function(e){var t=e.setState;return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];if(e.length){t({duplicatingScripts:!0});var r=function(r,n){t((function(t){var a=t.scripts;return O({duplicateScriptsError:r,duplicatingScripts:!1},r?null:{scripts:a.reduce((function(t,r){return[].concat(h()(t),[r],h()(e.indexOf(r.id)<0?[]:[n.script]))}),[])})}))};s.e({id:e[0]}).then((function(e){return r(e.errors,e)})).catch(r)}}}({setState:i});return l.a.useEffect((function(){u()}),[]),l.a.createElement(E.Provider,{value:{state:a,setState:i,_setState:c,getScripts:u,deleteScripts:p,updateScripts:b,duplicateScripts:g}},l.a.createElement(e,t))}}},259:function(e,t,r){"use strict";var n=r(6),a=r.n(n),c=r(20),o=r.n(c),i=r(9),l=r.n(i),s=r(0),u=r.n(s),d=r(2),p=r.n(d),f=r(80),b=r(247),m=u.a.forwardRef((function(e,t){var r=e.children,n=e.ids,c=e.onClick,i=l()(e,["children","ids","onClick"]),s=n.length>1,d=Object(f.a)(),p=o()(d,2),m=p[0],g=p[1],h=Object(b.b)().deleteScripts;return u.a.createElement(u.a.Fragment,null,u.a.createElement("div",a()({},i,{ref:t,onClick:function(e){g(),c&&c(e)}}),r),m({title:"Delete script".concat(s?"s":""),message:"Are you sure you want to delete script".concat(s?"s":"","?"),onConfirm:function(){return h(n)}}))}));m.propTypes={onClick:p.a.func,children:p.a.node,ids:p.a.array.isRequired},t.a=m},260:function(e,t,r){"use strict";var n=r(6),a=r.n(n),c=r(188),o=r.n(c),i=r(20),l=r.n(i),s=r(9),u=r.n(s),d=r(0),p=r.n(d),f=r(2),b=r.n(f),m=r(191),g=r(199),h=r(205),y=r(247),O=p.a.forwardRef((function(e,t){var r=e.children,n=e.onClick,c=e.ids,i=u()(e,["children","onClick","ids"]),s=Object(y.b)().setState,d=p.a.useState(!1),f=l()(d,2),b=f[0],O=f[1];return p.a.createElement(p.a.Fragment,null,p.a.createElement("div",a()({},i,{ref:t,onClick:function(e){O(!0),g.e({id:c[0]}).catch((function(e){O(!1),alert(Object(h.a)(e))})).then((function(e){var t=e.script;O(!1),s((function(e){return{scripts:e.scripts.reduce((function(e,r){return[].concat(o()(e),[r],o()(c.includes(r.id)?[t]:[]))}),[])}}))})),n&&n(e)}}),r),b&&p.a.createElement(m.a,null))}));O.propTypes={onClick:b.a.func,children:b.a.node,ids:b.a.array.isRequired},t.a=O},275:function(e,t,r){"use strict";r.r(t);var n=r(0),a=r.n(n),c=r(204),o=r(27),i=r(25),l=r(247),s=r(57),u=r(196),d=r(191);t.default=Object(l.a)((function(){Object(i.b)(c.a.PAGE_TITLE),Object(o.e)(c.a.PAGE_TITLE);var e=Object(l.b)(),t=e.updateScripts,n=e.setState,p=e.state,f=p.scripts,b=p.scriptsInitialised,m=p.loadingScripts,g=p.duplicatingScripts,h=p.deletingScripts;return a.a.createElement(a.a.Fragment,null,b?a.a.createElement(a.a.Fragment,null,a.a.createElement(u.a,{noDataMsg:"No scripts",selectable:!1,title:c.a.PAGE_TITLE,data:f,renderHeaderActions:r(281).default,renderRowAction:r(282).default,displayFields:[{key:"title",label:"Title"},{key:"description",label:"Description"}],onSortData:function(e){n({scripts:e}),t(e.map((function(e){return{id:e.id,position:e.position}})))}})):null,m&&a.a.createElement(s.a,null),h||g?a.a.createElement(d.a,null):null)}))},281:function(e,t,r){"use strict";r.r(t);var n=r(0),a=r.n(n),c=r(2),o=r.n(c),i=r(182),l=r(200),s=r.n(l),u=r(202),d=r.n(u),p=r(102),f=r(36),b=r(238),m=r(237),g=r(259),h=r(260);function y(e){var t=e.selected;return a.a.createElement(a.a.Fragment,null,t.length>0&&a.a.createElement(a.a.Fragment,null,a.a.createElement(h.a,{ids:t},a.a.createElement(p.a,null,"Duplicate")),a.a.createElement(g.a,{ids:t},a.a.createElement(i.a,null,a.a.createElement(d.a,null)))),a.a.createElement(f.b,{to:"/scripts/new"},a.a.createElement(i.a,null,a.a.createElement(s.a,null))),a.a.createElement(m.a,null,a.a.createElement(f.b,{to:"/scripts/new"},a.a.createElement(b.a,{color:"secondary"},a.a.createElement(s.a,null)))))}y.propTypes={selected:o.a.array.isRequired},t.default=function(e){return a.a.createElement(y,e)}},282:function(e,t,r){"use strict";r.r(t);var n=r(20),a=r.n(n),c=r(0),o=r.n(c),i=r(2),l=r.n(i),s=r(182),u=r(206),d=r.n(u),p=r(294),f=r(321),b=r(101),m=r(36),g=r(259),h=r(260);function y(e){var t=e.row,r=o.a.useState(null),n=a()(r,2),c=n[0],i=n[1],l=function(){return i(null)};return o.a.createElement(o.a.Fragment,null,o.a.createElement(s.a,{onClick:function(e){return i(e.currentTarget)}},o.a.createElement(d.a,null)),o.a.createElement(p.a,{anchorEl:c,keepMounted:!0,open:Boolean(c),onClose:l},o.a.createElement(f.a,{component:m.b,to:"/scripts/".concat(t.id),onClick:l},"Edit"),o.a.createElement(f.a,{onClick:l,ids:[t.id],component:h.a},"Duplicate"),o.a.createElement(f.a,{onClick:l,ids:[t.id],component:g.a},o.a.createElement(b.a,{color:"error"},"Delete"))))}y.propTypes={row:l.a.object.isRequired,rowIndex:l.a.number.isRequired},t.default=function(e,t){return o.a.createElement(y,{row:e,rowIndex:t})}}}]);