(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{221:function(e,t,r){"use strict";(function(e){var o,n=r(7),a=r.n(n),i=r(17),l=r.n(i),c=r(22),d=r.n(c),u=r(0),s=r.n(u),f=r(2),b=r.n(f),y=r(403),g=r(404),p=r(86),m=r(407),v=r(408),h=r(39),O=r(417),j=r(406),L=r(44),H=r.n(L),G=r(12),E=r.n(G),C=r(241),k=r.n(C),w=r(226);function K(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function P(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?K(Object(r),!0).forEach((function(t){l()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):K(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);var S="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},x=H()((function(e){return{table:{minWidth:800},headerWrap:{position:"relative",height:60},header:{position:"absolute",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",boxSizing:"border-box",padding:e.spacing()},dataItemRow:{"&:hover, &.selected":{backgroundColor:e.palette.action.hover}}}}));function D(e){var t=e.noDataMsg,r=e.title,o=e.selectable,n=e.renderRowAction,i=e.data,l=e.onSortData,c=e.displayFields,u=e.renderHeaderActions;o=!1!==o;var f=x(),b=s.a.useState([]),L=d()(b,2),H=L[0],G=L[1],C=s.a.useState(i),K=d()(C,2),S=K[0],D=K[1];return s.a.useEffect((function(){D(i)}),[i]),s.a.useEffect((function(){if(JSON.stringify(S)!==JSON.stringify(i)){var e=S.map((function(e,t){return P(P({},e),{},{position:t+1})}));D(e),l&&l(e)}}),[S]),s.a.createElement(s.a.Fragment,null,s.a.createElement(p.a,null,s.a.createElement("div",{className:E()(f.headerWrap)},s.a.createElement("div",{className:E()(f.header)},s.a.createElement(h.a,{variant:"h6"},r),s.a.createElement("div",{style:{marginLeft:"auto"}}),u&&u({selected:H}))),s.a.createElement(j.a,null),S.length?s.a.createElement(m.a,{className:E()(f.table)},s.a.createElement(v.a,null,s.a.createElement(y.a,null,o&&s.a.createElement(g.a,{padding:"none"},s.a.createElement(O.a,{indeterminate:H.length>0&&H.length<S.length,checked:S.length>0&&H.length===S.length,onChange:function(){return G((function(e){return e.length<S.length?S.map((function(e,t){return{row:e,rowIndex:t}})):[]}))}})),s.a.createElement(g.a,null),c.map((function(e,t){return s.a.createElement(g.a,a()({},e.cellProps,{key:"".concat(e.key).concat(t)}),s.a.createElement("b",null,e.label))})),n?s.a.createElement(g.a,{align:"right"},s.a.createElement("b",null,"Action")):null)),s.a.createElement(w.a,{rows:S,selectable:o,renderRowAction:n,classes:f,displayFields:c,selected:H,setSelected:G,useDragHandle:!0,onSortEnd:function(e){var t=e.oldIndex,r=e.newIndex;return D((function(e){return k()(e,{$splice:[[t,1],[r,0,e[t]]]})}))}})):s.a.createElement("div",{style:{textAlign:"center",padding:25}},s.a.createElement(h.a,{color:"textSecondary"},t||"No data"))))}S(D,"useStyles{classes}\nuseState{[selected, setSelected]([])}\nuseState{[data, setData](_data)}\nuseEffect{}\nuseEffect{}",(function(){return[x]})),D.propTypes={noDataMsg:b.a.string,selectable:b.a.bool,renderRowAction:b.a.func,title:b.a.string.isRequired,displayFields:b.a.array.isRequired,renderHeaderActions:b.a.func,onSortData:b.a.func,data:b.a.array.isRequired};var W,M,B=D;t.a=B,(W="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(W.register(x,"useStyles","/home/farai/WorkBench/neotree-editor/src/components/DataTable/index.js"),W.register(D,"DataTable","/home/farai/WorkBench/neotree-editor/src/components/DataTable/index.js"),W.register(B,"default","/home/farai/WorkBench/neotree-editor/src/components/DataTable/index.js")),(M="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&M(e)}).call(this,r(8)(e))},226:function(e,t,r){"use strict";(function(e){var o,n=r(0),a=r.n(n),i=r(405),l=r(222),c=r(227);(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var d,u,s=Object(l.a)((function(e){var t=e.rows,r=e.classes,o=e.selected,n=e.selectable,l=e.setSelected,d=e.displayFields,u=e.renderRowAction;return a.a.createElement(i.a,null,t.map((function(e,t){var i=t;return a.a.createElement(c.a,{key:"".concat(i).concat(t),row:e,index:t,rowIndex:t,classes:r,selectable:n,action:u?u(e,t)||a.a.createElement(a.a.Fragment,null):null,displayFields:d,selected:o,setSelected:l})})))}));t.a=s,(d="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&d.register(s,"default","/home/farai/WorkBench/neotree-editor/src/components/DataTable/Body.js"),(u="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&u(e)}).call(this,r(8)(e))},227:function(e,t,r){"use strict";(function(e){var o,n=r(7),a=r.n(n),i=r(218),l=r.n(i),c=r(0),d=r.n(c),u=r(403),s=r(404),f=r(417),b=r(125),y=r(12),g=r.n(y),p=r(222),m=r(242),v=r.n(m);(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var h,O,j=Object(p.c)((function(){return d.a.createElement(b.a,{style:{cursor:"move"}},d.a.createElement(v.a,null))})),L=Object(p.b)((function(e){var t=e.row,r=e.rowIndex,o=e.selectable,n=e.classes,i=e.selected,c=e.setSelected,b=e.displayFields,y=e.action;return d.a.createElement(u.a,{className:g()(n.dataItemRow,{selected:i.map((function(e){return e.rowIndex})).includes(r)})},o&&d.a.createElement(s.a,{padding:"none"},d.a.createElement(f.a,{checked:i.map((function(e){return e.rowIndex})).includes(r),onChange:function(){return c((function(e){return e.map((function(e){return e.rowIndex})).includes(r)?e.filter((function(e){return e.rowIndex!==r})):[].concat(l()(e),[{row:t,rowIndex:r}])}))}})),d.a.createElement(s.a,{padding:"none"},d.a.createElement(j,null)),b.map((function(e,o){var n=e.render?e.render({row:t,rowIndex:r,column:e.key,columnIndex:o}):(t.data||t)[e.key];return d.a.createElement(s.a,a()({},e.cellProps,{key:"".concat(r).concat(e.key).concat(o)}),n)})),y?d.a.createElement(s.a,{align:"right",padding:"none"},y):null)}));t.a=L,(h="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(h.register(j,"DragHandle","/home/farai/WorkBench/neotree-editor/src/components/DataTable/Row.js"),h.register(L,"default","/home/farai/WorkBench/neotree-editor/src/components/DataTable/Row.js")),(O="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&O(e)}).call(this,r(8)(e))},228:function(e,t,r){"use strict";(function(e){var o,n=r(7),a=r.n(n),i=r(11),l=r.n(i),c=r(0),d=r.n(c),u=r(2),s=r.n(u),f=r(29),b=r(12),y=r.n(b),g=r(93),p=r(409);(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);var m="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},v=Object(f.d)((function(){return{root:{display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center"},bg:function(e){return{backgroundColor:e.transparent?"transparent":"rgba(0,0,0,.2)"}}}})),h=function(e){var t=e.className,r=e.loaderProps,o=e.transparent,n=l()(e,["className","loaderProps","transparent"]),i=v({transparent:o});return d.a.createElement(d.a.Fragment,null,d.a.createElement(g.a,a()({},n,{className:y()(i.root,i.bg,t)}),d.a.createElement(p.a,a()({color:"primary"},r))))};m(h,"useStyles{classes}",(function(){return[v]})),h.propTypes={className:s.a.string,loaderProps:s.a.object,transparent:s.a.bool};var O,j,L=h;t.a=L,(O="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(O.register(v,"useStyles","/home/farai/WorkBench/neotree-editor/src/components/OverlayLoader.js"),O.register(h,"OverlayLoader","/home/farai/WorkBench/neotree-editor/src/components/OverlayLoader.js"),O.register(L,"default","/home/farai/WorkBench/neotree-editor/src/components/OverlayLoader.js")),(j="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&j(e)}).call(this,r(8)(e))},244:function(e,t,r){"use strict";var o=r(28);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=o(r(0)),a=(0,o(r(130)).default)(n.default.createElement("path",{d:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"}),"Delete");t.default=a},251:function(e,t,r){"use strict";(function(e){r.d(t,"d",(function(){return s})),r.d(t,"f",(function(){return f})),r.d(t,"b",(function(){return b})),r.d(t,"c",(function(){return y})),r.d(t,"e",(function(){return g})),r.d(t,"a",(function(){return p}));var o,n=r(17),a=r.n(n),i=r(90);function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){a()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var d,u,s=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/get-config-keys",c({body:e},t))},f=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/update-config-keys",c({method:"POST",body:e},t))},b=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/delete-config-key",c({method:"POST",body:e},t))},y=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/duplicate-config-key",c({method:"POST",body:e},t))},g=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/update-config-key",c({method:"POST",body:e},t))},p=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/create-config-key",c({method:"POST",body:e},t))};(d="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(d.register(s,"getConfigKeys","/home/farai/WorkBench/neotree-editor/src/api/config-keys/index.js"),d.register(f,"updateConfigKeys","/home/farai/WorkBench/neotree-editor/src/api/config-keys/index.js"),d.register(b,"deleteConfigKey","/home/farai/WorkBench/neotree-editor/src/api/config-keys/index.js"),d.register(y,"duplicateConfigKey","/home/farai/WorkBench/neotree-editor/src/api/config-keys/index.js"),d.register(g,"updateConfigKey","/home/farai/WorkBench/neotree-editor/src/api/config-keys/index.js"),d.register(p,"createConfigKey","/home/farai/WorkBench/neotree-editor/src/api/config-keys/index.js")),(u="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&u(e)}).call(this,r(8)(e))},257:function(e,t,r){"use strict";(function(e){r.d(t,"b",(function(){return h})),r.d(t,"a",(function(){return L}));var o,n=r(17),a=r.n(n),i=r(22),l=r.n(i),c=r(0),d=r.n(c),u=r(322),s=r(323),f=r(324),b=r(325),y=r(326);function g(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function p(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?g(Object(r),!0).forEach((function(t){a()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):g(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);var m="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},v=d.a.createContext(null),h=function(){return d.a.useContext(v)};m(h,"useContext{}");var O,j,L=function(e){return m((function(t){var r=d.a.useState({configKeys:[]}),o=l()(r,2),n=o[0],a=o[1],i=function(e){return a((function(t){return p(p({},t),"function"==typeof e?e(t):e)}))},c=Object(u.a)({setState:i}),g=Object(s.a)({setState:i}),m=Object(f.a)({setState:i}),h=Object(b.a)({setState:i}),O=Object(y.a)({state:n,setState:i});return d.a.useEffect((function(){c()}),[]),d.a.createElement(v.Provider,{value:{state:n,setState:i,_setState:a,getConfigKeys:c,deleteConfigKeys:g,updateConfigKeys:m,duplicateConfigKeys:h,saveConfigKey:O}},d.a.createElement(e,t))}),"useState{[state, _setState]({\n    configKeys: [],\n  })}\nuseEffect{}")};(O="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(O.register(v,"ConfigKeysContext","/home/farai/WorkBench/neotree-editor/src/contexts/config-keys/index.js"),O.register(h,"useConfigKeysContext","/home/farai/WorkBench/neotree-editor/src/contexts/config-keys/index.js"),O.register(L,"provideConfigKeysContext","/home/farai/WorkBench/neotree-editor/src/contexts/config-keys/index.js")),(j="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&j(e)}).call(this,r(8)(e))},269:function(e,t,r){"use strict";(function(e){var o,n=r(7),a=r.n(n),i=r(11),l=r.n(i),c=r(0),d=r.n(c),u=r(13),s=r(2),f=r.n(s),b=r(12),y=r.n(b),g=r(44),p=r.n(g);(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);var m="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},v=p()((function(){return{root:{position:"fixed",bottom:20,right:20,zIndex:10}}})),h=d.a.forwardRef(m((function(e,t){var r=e.className,o=l()(e,["className"]),n=v();return d.a.createElement(d.a.Fragment,null,Object(u.createPortal)(d.a.createElement("div",a()({},o,{ref:t,className:y()(r,n.root)})),document.body))}),"useStyles{classes}",(function(){return[v]})));h.propTypes={className:f.a.string};var O,j,L=h;t.a=L,(O="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(O.register(v,"useStyles","/home/farai/WorkBench/neotree-editor/src/components/FabWrap.js"),O.register(h,"FabWrap","/home/farai/WorkBench/neotree-editor/src/components/FabWrap.js"),O.register(L,"default","/home/farai/WorkBench/neotree-editor/src/components/FabWrap.js")),(j="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&j(e)}).call(this,r(8)(e))},289:function(e,t,r){"use strict";var o=r(3),n=r(1),a=r(0),i=(r(2),r(4)),l=r(5),c=r(89),d=r(10),u=a.forwardRef((function(e,t){var r=e.children,l=e.classes,u=e.className,s=e.color,f=void 0===s?"default":s,b=e.component,y=void 0===b?"button":b,g=e.disabled,p=void 0!==g&&g,m=e.disableFocusRipple,v=void 0!==m&&m,h=e.focusVisibleClassName,O=e.size,j=void 0===O?"large":O,L=e.variant,H=void 0===L?"round":L,G=Object(o.a)(e,["children","classes","className","color","component","disabled","disableFocusRipple","focusVisibleClassName","size","variant"]);return a.createElement(c.a,Object(n.a)({className:Object(i.a)(l.root,u,"round"!==H&&l.extended,"large"!==j&&l["size".concat(Object(d.a)(j))],p&&l.disabled,{primary:l.primary,secondary:l.secondary,inherit:l.colorInherit}[f]),component:y,disabled:p,focusRipple:!v,focusVisibleClassName:Object(i.a)(l.focusVisible,h),ref:t},G),a.createElement("span",{className:l.label},r))}));t.a=Object(l.a)((function(e){return{root:Object(n.a)({},e.typography.button,{boxSizing:"border-box",minHeight:36,transition:e.transitions.create(["background-color","box-shadow","border"],{duration:e.transitions.duration.short}),borderRadius:"50%",padding:0,minWidth:0,width:56,height:56,boxShadow:e.shadows[6],"&:active":{boxShadow:e.shadows[12]},color:e.palette.getContrastText(e.palette.grey[300]),backgroundColor:e.palette.grey[300],"&:hover":{backgroundColor:e.palette.grey.A100,"@media (hover: none)":{backgroundColor:e.palette.grey[300]},"&$disabled":{backgroundColor:e.palette.action.disabledBackground},textDecoration:"none"},"&$focusVisible":{boxShadow:e.shadows[6]},"&$disabled":{color:e.palette.action.disabled,boxShadow:e.shadows[0],backgroundColor:e.palette.action.disabledBackground}}),label:{width:"100%",display:"inherit",alignItems:"inherit",justifyContent:"inherit"},primary:{color:e.palette.primary.contrastText,backgroundColor:e.palette.primary.main,"&:hover":{backgroundColor:e.palette.primary.dark,"@media (hover: none)":{backgroundColor:e.palette.primary.main}}},secondary:{color:e.palette.secondary.contrastText,backgroundColor:e.palette.secondary.main,"&:hover":{backgroundColor:e.palette.secondary.dark,"@media (hover: none)":{backgroundColor:e.palette.secondary.main}}},extended:{borderRadius:24,padding:"0 16px",width:"auto",minHeight:"auto",minWidth:48,height:48,"&$sizeSmall":{width:"auto",padding:"0 8px",borderRadius:17,minWidth:34,height:34},"&$sizeMedium":{width:"auto",padding:"0 16px",borderRadius:20,minWidth:40,height:40}},focusVisible:{},disabled:{},colorInherit:{color:"inherit"},sizeSmall:{width:40,height:40},sizeMedium:{width:48,height:48}}}),{name:"MuiFab"})(u)},290:function(e,t,r){"use strict";(function(e){var o,n=r(7),a=r.n(n),i=r(22),l=r.n(i),c=r(11),d=r.n(c),u=r(0),s=r.n(u),f=r(2),b=r.n(f),y=r(76),g=r(257);(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);var p="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},m=s.a.forwardRef(p((function(e,t){var r=e.children,o=e.ids,n=e.onClick,i=d()(e,["children","ids","onClick"]),c=o.length>1,u=Object(y.a)(),f=l()(u,2),b=f[0],p=f[1],m=Object(g.b)().deleteConfigKeys;return s.a.createElement(s.a.Fragment,null,s.a.createElement("div",a()({},i,{ref:t,onClick:function(e){p(),n&&n(e)}}),r),b({title:"Delete config key".concat(c?"s":""),message:"Are you sure you want to delete config key".concat(c?"s":"","?"),onConfirm:function(){return m(o)}}))}),"useConfirmModal{[renderConfirmModal, confirm]}\nuseConfigKeysContext{{ deleteConfigKeys }}",(function(){return[y.a,g.b]})));m.propTypes={onClick:b.a.func,children:b.a.node,ids:b.a.array.isRequired};var v,h,O=m;t.a=O,(v="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(v.register(m,"DeleteConfigKeys","/home/farai/WorkBench/neotree-editor/src/containers/ConfigKeys/Forms/DeleteConfigKeys.js"),v.register(O,"default","/home/farai/WorkBench/neotree-editor/src/containers/ConfigKeys/Forms/DeleteConfigKeys.js")),(h="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&h(e)}).call(this,r(8)(e))},291:function(e,t,r){"use strict";(function(e){var o,n=r(7),a=r.n(n),i=r(22),l=r.n(i),c=r(11),d=r.n(c),u=r(0),s=r.n(u),f=r(2),b=r.n(f),y=r(76),g=r(257);(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);var p="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},m=s.a.forwardRef(p((function(e,t){var r=e.children,o=e.ids,n=e.onClick,i=d()(e,["children","ids","onClick"]),c=o.length>1,u=Object(g.b)().duplicateConfigKeys,f=Object(y.a)(),b=l()(f,2),p=b[0],m=b[1];return s.a.createElement(s.a.Fragment,null,s.a.createElement("div",a()({},i,{ref:t,onClick:function(e){m(),n&&n(e)}}),r),p({title:"Duplicate config key".concat(c?"s":""),message:"Are you sure you want to duplicate config key".concat(c?"s":"","?"),onConfirm:function(){return u(o)}}))}),"useConfigKeysContext{{ duplicateConfigKeys }}\nuseConfirmModal{[renderConfirmModal, confirm]}",(function(){return[g.b,y.a]})));m.propTypes={onClick:b.a.func,children:b.a.node,ids:b.a.array.isRequired};var v,h,O=m;t.a=O,(v="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(v.register(m,"DuplicateConfigKeys","/home/farai/WorkBench/neotree-editor/src/containers/ConfigKeys/Forms/DuplicateConfigKeys.js"),v.register(O,"default","/home/farai/WorkBench/neotree-editor/src/containers/ConfigKeys/Forms/DuplicateConfigKeys.js")),(h="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&h(e)}).call(this,r(8)(e))},292:function(e,t,r){"use strict";(function(e){var o,n=r(7),a=r.n(n),i=r(17),l=r.n(i),c=r(22),d=r.n(c),u=r(11),s=r.n(u),f=r(0),b=r.n(f),y=r(2),g=r.n(y),p=r(257),m=r(192),v=r(184),h=r(185),O=r(186),j=r(87),L=r(414),H=r(409),G=r(39);function E(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function C(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?E(Object(r),!0).forEach((function(t){l()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):E(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);var k="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},w=b.a.forwardRef(k((function(e,t){var r=e.children,o=e.onClick,n=e.configKey,i=s()(e,["children","onClick","configKey"]),l=Object(p.b)().saveConfigKey,c=b.a.useState(!1),u=d()(c,2),f=u[0],y=u[1],g=b.a.useState(!1),E=d()(g,2),k=E[0],w=E[1],K=b.a.useState(null),P=d()(K,2),S=P[0],x=P[1],D=b.a.useState(null),W=d()(D,2),M=W[0],B=W[1],F=C({},n?n.data:{}),T=b.a.useState(F),R=d()(T,2),I=R[0],A=R[1],N=function(e){return A((function(t){return C(C({},t),"function"==typeof e?e(t):e)}))};return b.a.useEffect((function(){n&&N(n.data)}),[n]),b.a.useEffect((function(){N(F)}),[f]),b.a.useEffect((function(){var e=null;I.label||(e=C(C({},e),{},{label:"Label is required"})),I.configKey||(e=C(C({},e),{},{configKey:"Key is required"})),x(e||null),B(null)}),[I]),b.a.createElement(b.a.Fragment,null,b.a.createElement("div",a()({},i,{ref:t,onClick:function(e){y(!0),o&&o(e)}}),r),b.a.createElement(m.a,{open:f,maxWidth:"sm",fullWidth:!0,onClose:function(){return k?null:y(!1)}},b.a.createElement(v.a,null,n?"Edit":"Add"," config key"),b.a.createElement(h.a,null,b.a.createElement("div",null,b.a.createElement(L.a,{fullWidth:!0,required:!0,error:!!S&&!!S.label,value:I.configKey||"",label:"Key",onChange:function(e){return N({configKey:e.target.value})}})),b.a.createElement("br",null),b.a.createElement("div",null,b.a.createElement(L.a,{fullWidth:!0,required:!0,error:!!S&&!!S.configKey,value:I.label||"",label:"Label",onChange:function(e){return N({label:e.target.value})}})),b.a.createElement("br",null),b.a.createElement("div",null,b.a.createElement(L.a,{fullWidth:!0,value:I.summary||"",label:"Summary",onChange:function(e){return N({summary:e.target.value})}})),M?b.a.createElement("div",null,b.a.createElement("br",null),b.a.createElement(G.a,{variant:"caption",color:"error"},JSON.stringify(M))):null),b.a.createElement(O.a,null,k?b.a.createElement(j.a,null,b.a.createElement(H.a,{size:20})):b.a.createElement(b.a.Fragment,null,b.a.createElement(j.a,{onClick:function(){return y(!1)}},"Cancel"),b.a.createElement(j.a,{variant:"contained",color:"primary",disabled:!!S,onClick:function(){w(!0),l(n,I,(function(e){w(!1),B(e),y(!1)}))}},"Save")))))}),"useConfigKeysContext{{ saveConfigKey }}\nuseState{[open, setOpen](false)}\nuseState{[saving, setSaving](false)}\nuseState{[formError, setFormError](null)}\nuseState{[saveError, setSaveError](null)}\nuseState{[form, _setForm](defaultForm)}\nuseEffect{}\nuseEffect{}\nuseEffect{}",(function(){return[p.b]})));w.propTypes={onClick:g.a.func,children:g.a.node,configKey:g.a.object};var K,P,S=w;t.a=S,(K="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(K.register(w,"ConfigKeyForm","/home/farai/WorkBench/neotree-editor/src/containers/ConfigKeys/Forms/ConfigKeyForm.js"),K.register(S,"default","/home/farai/WorkBench/neotree-editor/src/containers/ConfigKeys/Forms/ConfigKeyForm.js")),(P="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&P(e)}).call(this,r(8)(e))},320:function(e,t,r){"use strict";r.r(t),function(e){var o,n=r(0),a=r.n(n),i=r(321),l=r(29),c=r(19),d=r(257),u=r(61),s=r(221),f=r(228);(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);var b="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},y=function(){Object(c.b)(i.a.PAGE_TITLE),Object(l.e)(i.a.PAGE_TITLE);var e=Object(d.b)(),t=e.updateConfigKeys,o=e.setState,n=e.state,b=n.configKeys,y=n.configKeysInitialised,g=n.loadingConfigKeys,p=n.duplicatingConfigKeys,m=n.deletingConfigKeys;return a.a.createElement(a.a.Fragment,null,y?a.a.createElement(a.a.Fragment,null,a.a.createElement(s.a,{noDataMsg:"No config keys",selectable:!1,title:i.a.PAGE_TITLE,data:b,renderHeaderActions:r(327).default,renderRowAction:r(328).default,displayFields:[{key:"configKey",label:"Key"},{key:"label",label:"Label"},{key:"summary",label:"Summary"}],onSortData:function(e){o({configKeys:e}),t(e.map((function(e){return{id:e.id,position:e.position}})))}})):null,g&&a.a.createElement(u.a,null),m||p?a.a.createElement(f.a,null):null)};b(y,"useConfigKeysContext{{\n    updateConfigKeys,\n    setState,\n    state: {\n      configKeys,\n      configKeysInitialised,\n      loadingConfigKeys,\n      duplicatingConfigKeys,\n      deletingConfigKeys,\n    }\n  }}",(function(){return[d.b]}));var g,p,m=Object(d.a)(y);t.default=m,(g="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(g.register(y,"ConfigKeysList","/home/farai/WorkBench/neotree-editor/src/containers/ConfigKeys/List/index.js"),g.register(m,"default","/home/farai/WorkBench/neotree-editor/src/containers/ConfigKeys/List/index.js")),(p="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&p(e)}.call(this,r(8)(e))},321:function(e,t,r){"use strict";(function(e){var r;(r="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&r(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var o,n,a={PAGE_TITLE:"Configuration"};t.a=a,(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&o.register(a,"default","/home/farai/WorkBench/neotree-editor/src/constants/copy/configKeys.js"),(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&n(e)}).call(this,r(8)(e))},322:function(e,t,r){"use strict";(function(e){var o,n=r(17),a=r.n(n),i=r(251);function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){a()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var d,u,s=function(e){var t=e.setState;return function(){t({loadingConfigKeys:!0});var e=function(e,r){t(c(c({getConfigKeysError:e},r),{},{configKeysInitialised:!0,loadingConfigKeys:!1}))};i.d().then((function(t){return e(t.errors,t)})).catch(e)}};t.a=s,(d="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&d.register(s,"default","/home/farai/WorkBench/neotree-editor/src/contexts/config-keys/_getConfigKeys.js"),(u="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&u(e)}).call(this,r(8)(e))},323:function(e,t,r){"use strict";(function(e){var o,n=r(17),a=r.n(n),i=r(251);function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){a()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var d,u,s=function(e){var t=e.setState;return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];if(e.length){t({deletingConfigKeys:!0});var r=function(r){t((function(t){var o=t.configKeys;return c({deleteConfigKeysError:r,deletingConfigKeys:!1},r?null:{configKeys:o.filter((function(t){return e.indexOf(t.id)<0}))})}))};i.b({id:e[0]}).then((function(e){return r(e.errors,e)})).catch(r)}}};t.a=s,(d="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&d.register(s,"default","/home/farai/WorkBench/neotree-editor/src/contexts/config-keys/_deleteConfigKeys.js"),(u="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&u(e)}).call(this,r(8)(e))},324:function(e,t,r){"use strict";(function(e){var o,n=r(17),a=r.n(n),i=r(251);function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){a()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var d,u,s=function(e){var t=e.setState;return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];if(e.length){t({updatingConfigKeys:!0});var r=function(e,r){t(c(c({updateConfigKeysError:e},r),{},{updatingConfigKeys:!1}))};i.f({configKeys:e}).then((function(e){return r(e.errors,e)})).catch(r)}}};t.a=s,(d="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&d.register(s,"default","/home/farai/WorkBench/neotree-editor/src/contexts/config-keys/_updateConfigKeys.js"),(u="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&u(e)}).call(this,r(8)(e))},325:function(e,t,r){"use strict";(function(e){var o,n=r(218),a=r.n(n),i=r(17),l=r.n(i),c=r(251);function d(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function u(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?d(Object(r),!0).forEach((function(t){l()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):d(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var s,f,b=function(e){var t=e.setState;return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];if(e.length){t({duplicatingConfigKeys:!0});var r=function(r,o){t((function(t){var n=t.configKeys;return u({duplicateConfigKeysError:r,duplicatingConfigKeys:!1},r?null:{configKeys:n.reduce((function(t,r){return[].concat(a()(t),[r],a()(e.indexOf(r.id)<0?[]:[o.configKey]))}),[])})}))};c.c({id:e[0]}).then((function(e){return r(e.errors,e)})).catch(r)}}};t.a=b,(s="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&s.register(b,"default","/home/farai/WorkBench/neotree-editor/src/contexts/config-keys/_duplicateConfigKeys.js"),(f="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&f(e)}).call(this,r(8)(e))},326:function(e,t,r){"use strict";(function(e){var o,n=r(17),a=r.n(n),i=r(218),l=r.n(i),c=r(251);function d(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function u(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?d(Object(r),!0).forEach((function(t){a()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):d(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var s,f,b=function(e){var t=e.setState;return function(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},o=arguments.length>2?arguments[2]:void 0,n=function(r,n){o&&o(r,n),t((function(t){var r=t.configKeys,o=l()(r);return n&&n.configKey&&(o=e?r.map((function(e){return e.id===n.configKey.id?n.configKey:e})):[].concat(l()(r),[n.configKey])),{configKeys:o}}))},a=e?c.e:c.a,i=JSON.stringify(u({},r));a(u(u({},e),{},{data:i})).then((function(e){return n(e.errors,e)})).catch(n)}};t.a=b,(s="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&s.register(b,"default","/home/farai/WorkBench/neotree-editor/src/contexts/config-keys/_saveConfigKey.js"),(f="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&f(e)}).call(this,r(8)(e))},327:function(e,t,r){"use strict";r.r(t),function(e){var o,n=r(0),a=r.n(n),i=r(2),l=r.n(i),c=r(125),d=r(231),u=r.n(d),s=r(244),f=r.n(s),b=r(87),y=r(289),g=r(269),p=r(290),m=r(291),v=r(292);(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;function h(e){var t=e.selected;return a.a.createElement(a.a.Fragment,null,t.length>0&&a.a.createElement(a.a.Fragment,null,a.a.createElement(m.a,{ids:t},a.a.createElement(b.a,null,"Duplicate")),a.a.createElement(p.a,{ids:t},a.a.createElement(c.a,null,a.a.createElement(f.a,null)))),a.a.createElement(v.a,null,a.a.createElement(c.a,null,a.a.createElement(u.a,null))),a.a.createElement(g.a,null,a.a.createElement(v.a,null,a.a.createElement(y.a,{color:"secondary"},a.a.createElement(u.a,null)))))}h.propTypes={selected:l.a.array.isRequired};var O,j,L=function(e){return a.a.createElement(h,e)};t.default=L,(O="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(O.register(h,"Actions","/home/farai/WorkBench/neotree-editor/src/containers/ConfigKeys/List/_renderHeaderActions.js"),O.register(L,"default","/home/farai/WorkBench/neotree-editor/src/containers/ConfigKeys/List/_renderHeaderActions.js")),(j="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&j(e)}.call(this,r(8)(e))},328:function(e,t,r){"use strict";r.r(t),function(e){var o,n=r(22),a=r.n(n),i=r(0),l=r.n(i),c=r(2),d=r.n(c),u=r(125),s=r(235),f=r.n(s),b=r(389),y=r(410),g=r(39),p=r(290),m=r(291),v=r(292);function h(e){var t=e.row,r=l.a.useState(null),o=a()(r,2),n=o[0],i=o[1],c=function(){return i(null)};return l.a.createElement(l.a.Fragment,null,l.a.createElement(u.a,{onClick:function(e){return i(e.currentTarget)}},l.a.createElement(f.a,null)),l.a.createElement(b.a,{anchorEl:n,keepMounted:!0,open:Boolean(n),onClose:c},l.a.createElement(y.a,{onClick:c,configKey:t,component:v.a},"Edit"),l.a.createElement(y.a,{onClick:c,ids:[t.id],component:m.a},"Duplicate"),l.a.createElement(y.a,{onClick:c,ids:[t.id],component:p.a},l.a.createElement(g.a,{color:"error"},"Delete"))))}(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&o(e),("undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e})(h,"useState{[anchorEl, setAnchorEl](null)}"),h.propTypes={row:d.a.object.isRequired,rowIndex:d.a.number.isRequired};var O,j,L=function(e,t){return l.a.createElement(h,{row:e,rowIndex:t})};t.default=L,(O="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(O.register(h,"Action","/home/farai/WorkBench/neotree-editor/src/containers/ConfigKeys/List/_renderRowAction.js"),O.register(L,"default","/home/farai/WorkBench/neotree-editor/src/containers/ConfigKeys/List/_renderRowAction.js")),(j="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&j(e)}.call(this,r(8)(e))}}]);