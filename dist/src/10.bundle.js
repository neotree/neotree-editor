(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{284:function(e,t,a){"use strict";(function(e){var n,r=a(11),o=a.n(r),i=a(9),c=a.n(i),l=a(24),s=a.n(l),d=a(0),u=a.n(d),f=a(2),p=a.n(f),g=a(459),m=a(390),b=a(391),h=a(236),v=a(393),y=a(394),E=a(27),S=a(473),L=a(360),H=a(14),G=a.n(H),w=a(5),j=a.n(w),O=a(310),k=a.n(O),x=a(289);function D(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function P(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?D(Object(a),!0).forEach((function(t){o()(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):D(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&n(e);var C="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},I=G()((function(e){return{table:{minWidth:800},headerWrap:{position:"relative",height:60},header:{position:"absolute",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",boxSizing:"border-box",padding:e.spacing()},dataItemRow:{"&:hover, &.selected":{backgroundColor:e.palette.action.hover}}}}));function W(e){var t=e.noDataMsg,a=e.title,n=e.selectable,r=e.renderRowAction,o=e.data,i=e.onSortData,l=e.displayFields,d=e.renderHeaderActions;n=!1!==n;var f=I(),p=u.a.useState([]),H=s()(p,2),G=H[0],w=H[1],O=u.a.useState(o),D=s()(O,2),C=D[0],W=D[1];return u.a.useEffect((function(){JSON.stringify(C)!==JSON.stringify(o)&&W(o)}),[o]),u.a.createElement(u.a.Fragment,null,u.a.createElement(h.a,{square:!0,elevation:0},u.a.createElement("div",{className:j()(f.headerWrap)},u.a.createElement("div",{className:j()(f.header)},u.a.createElement(E.a,{variant:"h6"},a),u.a.createElement("div",{style:{marginLeft:"auto"}}),d&&d({selected:G}))),u.a.createElement(L.a,null),C.length?u.a.createElement(g.a,{component:h.a},u.a.createElement(v.a,{className:j()(f.table)},u.a.createElement(y.a,null,u.a.createElement(m.a,null,n&&u.a.createElement(b.a,{padding:"none"},u.a.createElement(S.a,{indeterminate:G.length>0&&G.length<C.length,checked:C.length>0&&G.length===C.length,onChange:function(){return w((function(e){return e.length<C.length?C.map((function(e,t){return{row:e,rowIndex:t}})):[]}))}})),u.a.createElement(b.a,null),l.map((function(e,t){return u.a.createElement(b.a,c()({},e.cellProps,{key:"".concat(e.key).concat(t)}),u.a.createElement("b",null,e.label))})),r?u.a.createElement(b.a,{align:"right"},u.a.createElement("b",null,"Action")):null)),u.a.createElement(x.a,{rows:C,selectable:n,renderRowAction:r,classes:f,displayFields:l,selected:G,setSelected:w,useDragHandle:!0,onSortEnd:function(e){var t=e.oldIndex,a=e.newIndex,n=k()(C,{$splice:[[t,1],[a,0,C[t]]]}).map((function(e,t){return P(P({},e),{},{position:t+1})}));W(n),i(n)}}))):u.a.createElement("div",{style:{textAlign:"center",padding:25}},u.a.createElement(E.a,{color:"textSecondary"},t||"No data"))))}C(W,"useStyles{classes}\nuseState{[selected, setSelected]([])}\nuseState{[data, setData](_data)}\nuseEffect{}",(function(){return[I]})),W.propTypes={noDataMsg:p.a.string,selectable:p.a.bool,renderRowAction:p.a.func,title:p.a.string.isRequired,displayFields:p.a.array.isRequired,renderHeaderActions:p.a.func,onSortData:p.a.func,data:p.a.array.isRequired};var M,B,T=W;t.a=T,(M="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(M.register(I,"useStyles","/home/farai/WorkBench/neotree-editor/src/components/DataTable/index.js"),M.register(W,"DataTable","/home/farai/WorkBench/neotree-editor/src/components/DataTable/index.js"),M.register(T,"default","/home/farai/WorkBench/neotree-editor/src/components/DataTable/index.js")),(B="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&B(e)}).call(this,a(8)(e))},289:function(e,t,a){"use strict";(function(e){var n,r=a(0),o=a.n(r),i=a(392),c=a(288),l=a(290);(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&n(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var s,d,u=Object(c.a)((function(e){var t=e.rows,a=e.classes,n=e.selected,r=e.selectable,c=e.setSelected,s=e.displayFields,d=e.renderRowAction;return o.a.createElement(i.a,null,t.map((function(e,t){var i=t;return o.a.createElement(l.a,{key:"".concat(i).concat(t),row:e,index:t,rowIndex:t,classes:a,selectable:r,action:d?d(e,t)||o.a.createElement(o.a.Fragment,null):null,displayFields:s,selected:n,setSelected:c})})))}));t.a=u,(s="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&s.register(u,"default","/home/farai/WorkBench/neotree-editor/src/components/DataTable/Body.js"),(d="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&d(e)}).call(this,a(8)(e))},290:function(e,t,a){"use strict";(function(e){var n,r=a(9),o=a.n(r),i=a(279),c=a.n(i),l=a(0),s=a.n(l),d=a(390),u=a(391),f=a(473),p=a(101),g=a(5),m=a.n(g),b=a(288),h=a(312),v=a.n(h),y=a(457);(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&n(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var E,S,L=Object(b.c)((function(){return s.a.createElement("div",null,s.a.createElement(y.a,{title:"Drag to reposition"},s.a.createElement(p.a,{style:{cursor:"move"}},s.a.createElement(v.a,null))))})),H=Object(b.b)((function(e){var t=e.row,a=e.rowIndex,n=e.selectable,r=e.classes,i=e.selected,l=e.setSelected,p=e.displayFields,g=e.action;return s.a.createElement(d.a,{className:m()(r.dataItemRow,{selected:i.map((function(e){return e.rowIndex})).includes(a)})},n&&s.a.createElement(u.a,{padding:"none"},s.a.createElement(f.a,{checked:i.map((function(e){return e.rowIndex})).includes(a),onChange:function(){return l((function(e){return e.map((function(e){return e.rowIndex})).includes(a)?e.filter((function(e){return e.rowIndex!==a})):[].concat(c()(e),[{row:t,rowIndex:a}])}))}})),s.a.createElement(u.a,{padding:"none"},s.a.createElement(L,null)),p.map((function(e,n){var r=e.render?e.render({row:t,rowIndex:a,column:e.key,columnIndex:n}):t[e.key];return s.a.createElement(u.a,o()({},e.cellProps,{key:"".concat(a).concat(e.key).concat(n)}),r)})),g?s.a.createElement(u.a,{align:"right",padding:"none"},g):null)}));t.a=H,(E="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(E.register(L,"DragHandle","/home/farai/WorkBench/neotree-editor/src/components/DataTable/Row.js"),E.register(H,"default","/home/farai/WorkBench/neotree-editor/src/components/DataTable/Row.js")),(S="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&S(e)}).call(this,a(8)(e))},345:function(e,t,a){"use strict";(function(e){var a;(a="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&a(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var n,r,o={PAGE_TITLE:"Diagnoses"};t.a=o,(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&n.register(o,"default","/home/farai/WorkBench/neotree-editor/src/constants/copy/diagnoses.js"),(r="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&r(e)}).call(this,a(8)(e))},348:function(e,t,a){"use strict";(function(e){var n,r=a(37),o=a.n(r),i=a(55),c=a.n(i),l=a(9),s=a.n(l),d=a(24),u=a.n(d),f=a(13),p=a.n(f),g=a(0),m=a.n(g),b=a(2),h=a.n(b),v=a(246),y=a(241),E=a(240),S=a(239),L=a(84),H=a(27),G=a(242),w=a(349);(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&n(e);var j="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},O=m.a.forwardRef(j((function(e,t){var a=e.children,n=e.items,r=e.type,i=e.onClick,l=e.onSuccess,d=p()(e,["children","items","type","onClick","onSuccess"]),f=n.length>1,g=m.a.useState(!1),b=u()(g,2),h=b[0],j=b[1],O=m.a.useState(!1),k=u()(O,2),x=k[0],D=k[1],P=m.a.useState(!1),C=u()(P,2),I=C[0],W=C[1],M=m.a.useState([]),B=u()(M,2),T=B[0],R=B[1],A=m.a.useState(null),F=u()(A,2),N=F[0],q=F[1],J=m.a.useState(!1),_=u()(J,2),z=_[0],K=_[1],$=m.a.useState(""),Q=u()($,2),U=Q[0],V=Q[1],X=m.a.useState(!1),Y=u()(X,2),Z=Y[0],ee=Y[1];m.a.useEffect((function(){q(null),V(null),h&&!I&&(D(!0),w.a().then((function(e){var t=e.error,a=e.scripts;if(t)return q(t);R(a),W(!0),D(!1)})).then((function(e){q(e),D(!1)})))}),[h]);var te=f?"diagnosis"===r?"diagnoses":"screens":r;return m.a.createElement(m.a.Fragment,null,m.a.createElement("div",s()({},d,{ref:t,onClick:function(e){j(!0),i&&i(e)}}),a),m.a.createElement(v.a,{open:h,onClose:function(){return j(!1)},fullWidth:!0,maxWidth:"sm"},m.a.createElement(S.a,null,"Copy ",te),x?m.a.createElement(E.a,null,m.a.createElement("div",{style:{textAlign:"center"}},m.a.createElement(G.a,null))):m.a.createElement(m.a.Fragment,null,m.a.createElement(E.a,null,m.a.createElement(H.a,null,"Copy to"),m.a.createElement("select",{value:U||"",style:{maxWidth:200,background:"transparent",border:"1px solid #ddd",padding:10,outline:"none !important"},onChange:function(e){return V(e.target.value)}},m.a.createElement("option",{value:""},"Select script"),T.map((function(e,t){return m.a.createElement("option",{key:t,value:e.scriptId},e.title)})))),m.a.createElement(y.a,null,m.a.createElement(L.a,{disabled:z,onClick:function(){return j(!1)}},"Cancel"),m.a.createElement(L.a,{color:"primary",variant:"contained",disabled:z||!U,onClick:function(){var e=null;switch(r){case"screen":e="/copy-screens";break;case"diagnosis":e="/copy-diagnoses"}e&&c()(o.a.mark((function t(){var a,r,i;return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return K(!0),t.prev=1,t.next=4,fetch(e,{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({items:n,targetScriptId:U})});case 4:return a=t.sent,t.next=7,a.json();case 7:r=t.sent,(i=r.errors)&&i.length?alert(JSON.stringify(i)):(ee(!0),l&&l(n,U)),t.next=15;break;case 12:t.prev=12,t.t0=t.catch(1),alert(t.t0.message);case 15:K(!1);case 16:case"end":return t.stop()}}),t,null,[[1,12]])})))()}},"Copy"),N?m.a.createElement(H.a,{variant:"caption",color:"error"},N.msg||N.message||JSON.stringify(N)):null))),m.a.createElement(v.a,{open:Z,onClose:function(){return ee(!1)},fullWidth:!0,maxWidth:"sm"},m.a.createElement(E.a,null,m.a.createElement("div",{style:{textAlign:"center"}},m.a.createElement(H.a,null,"Copied ",m.a.createElement("b",null,te)," successfully."))),m.a.createElement(y.a,null,m.a.createElement(L.a,{accent:!0,onClick:function(){j(!1),ee(!1)}},"OK"))))}),"useState{[open, setOpen](false)}\nuseState{[loading, setLoading](false)}\nuseState{[scriptsLoaded, setScriptsLoaded](false)}\nuseState{[scripts, setScripts]([])}\nuseState{[error, setError](null)}\nuseState{[copying, setCopying](false)}\nuseState{[scriptId, setScriptId]('')}\nuseState{[displaySuccessModal, setDisplaySuccessModal](false)}\nuseEffect{}"));O.propTypes={onClick:h.a.func,children:h.a.node,items:h.a.arrayOf(h.a.shape({diagnosisId:h.a.string,screenId:h.a.string,scriptId:h.a.string.isRequired})).isRequired,onSuccess:h.a.func,type:h.a.oneOf(["screen","diagnosis"]).isRequired};var k,x,D=O;t.a=D,(k="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(k.register(O,"CopyScriptItems","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/CopyScriptItems.js"),k.register(D,"default","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/CopyScriptItems.js")),(x="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&x(e)}).call(this,a(8)(e))},349:function(e,t,a){"use strict";(function(e){a.d(t,"a",(function(){return u}));var n,r=a(11),o=a.n(r),i=a(64);function c(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?c(Object(a),!0).forEach((function(t){o()(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):c(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&n(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var s,d,u=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/get-scripts",l({body:e},t))},f=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/update-scripts",l({method:"POST",body:e},t))},p=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/delete-scripts",l({method:"POST",body:e},t))},g=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/duplicate-scripts",l({method:"POST",body:e},t))},m=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/get-script",l({body:e},t))},b=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/update-script",l({method:"POST",body:e},t))},h=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/create-script",l({method:"POST",body:e},t))},v=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/copy-screens",l({method:"POST",body:e},t))},y=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/copy-diagnoses",l({method:"POST",body:e},t))};(s="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(s.register(u,"getScripts","/home/farai/WorkBench/neotree-editor/src/api/scripts/index.js"),s.register(f,"updateScripts","/home/farai/WorkBench/neotree-editor/src/api/scripts/index.js"),s.register(p,"deleteScripts","/home/farai/WorkBench/neotree-editor/src/api/scripts/index.js"),s.register(g,"duplicateScripts","/home/farai/WorkBench/neotree-editor/src/api/scripts/index.js"),s.register(m,"getScript","/home/farai/WorkBench/neotree-editor/src/api/scripts/index.js"),s.register(b,"updateScript","/home/farai/WorkBench/neotree-editor/src/api/scripts/index.js"),s.register(h,"createScript","/home/farai/WorkBench/neotree-editor/src/api/scripts/index.js"),s.register(v,"copyScreens","/home/farai/WorkBench/neotree-editor/src/api/scripts/index.js"),s.register(y,"copyDiagnoses","/home/farai/WorkBench/neotree-editor/src/api/scripts/index.js")),(d="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&d(e)}).call(this,a(8)(e))},379:function(e,t,a){"use strict";(function(e){var n,r=a(9),o=a.n(r),i=a(0),c=a.n(i),l=a(6),s=a(348);(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&n(e);var d,u,f="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},p=c.a.forwardRef(f((function(e,t){var a=Object(l.h)().scriptId;return c.a.createElement(c.a.Fragment,null,c.a.createElement(s.a,o()({},e,{ref:t,type:"diagnosis",onSuccess:function(e,t){a===t&&window.location.reload()}})))}),"useParams{{ scriptId }}",(function(){return[l.h]}))),g=p;t.a=g,(d="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(d.register(p,"CopyDiagnoses","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/Diagnoses/Forms/CopyDiagnoses.js"),d.register(g,"default","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/Diagnoses/Forms/CopyDiagnoses.js")),(u="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&u(e)}).call(this,a(8)(e))},436:function(e,t,a){"use strict";a.r(t),function(e){var n,r=a(37),o=a.n(r),i=a(55),c=a.n(i),l=a(24),s=a.n(l),d=a(0),u=a.n(d),f=a(6),p=a(284),g=a(242),m=a(345),b=a(22);(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&n(e);var h="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},v=function(){var e=Object(b.d)().state.viewMode,t=Object(f.h)().scriptId,n=u.a.useState([]),r=s()(n,2),i=r[0],l=r[1],d=u.a.useState(!1),h=s()(d,2),v=h[0],y=h[1],E=u.a.useState(!1),S=s()(E,2),L=S[0],H=S[1];return u.a.useEffect((function(){c()(o.a.mark((function e(){var a,n,r;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return H(!0),e.prev=1,e.next=4,fetch("/get-diagnoses?scriptId=".concat(t));case 4:return a=e.sent,e.next=7,a.json();case 7:n=e.sent,r=n.diagnoses,l(r),e.next=15;break;case 12:e.prev=12,e.t0=e.catch(1),alert(e.t0.message);case 15:y(!0),H(!1);case 17:case"end":return e.stop()}}),e,null,[[1,12]])})))()}),[]),u.a.createElement(u.a.Fragment,null,v?u.a.createElement(u.a.Fragment,null,u.a.createElement(p.a,{selectable:!0,noDataMsg:"No diagnoses",title:m.a.PAGE_TITLE,data:i,renderHeaderActions:"view"===e?null:a(437).default,renderRowAction:"view"===e?null:a(438).default,displayFields:[{key:"position",label:"Position",render:function(e){return e.row.position}},{key:"name",label:"Name"},{key:"description",label:"Description"}],onSortData:function(e){l(e),c()(o.a.mark((function t(){var a;return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,fetch("/update-diagnoses",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({diagnoses:e.map((function(e){return{id:e.id,position:e.position}}))})});case 3:return a=t.sent,t.next=6,a.json();case 6:t.next=10;break;case 8:t.prev=8,t.t0=t.catch(0);case 10:case"end":return t.stop()}}),t,null,[[0,8]])})))()}})):null,L&&u.a.createElement("div",{style:{margin:25,textAlign:"center"}},u.a.createElement(g.a,null)))};h(v,"useAppContext{{ state: { viewMode } }}\nuseParams{{ scriptId }}\nuseState{[diagnoses, setDiagnoses]([])}\nuseState{[diagnosesInitialised, setDiagnosesInitialised](false)}\nuseState{[loadingDiagnoses, setLoadingDiagnoses](false)}\nuseEffect{}",(function(){return[b.d,f.h]}));var y,E,S=v;t.default=S,(y="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(y.register(v,"DiagnosesList","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/Diagnoses/index.js"),y.register(S,"default","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/Diagnoses/index.js")),(E="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&E(e)}.call(this,a(8)(e))},437:function(e,t,a){"use strict";a.r(t),function(e){var n,r=a(0),o=a.n(r),i=a(2),c=a.n(i),l=a(101),s=a(281),d=a.n(s),u=a(84),f=a(6),p=a(30),g=a(457),m=a(379);function b(e){var t=e.selected,a=Object(f.h)().scriptId;return o.a.createElement(o.a.Fragment,null,t.length>0&&o.a.createElement(o.a.Fragment,null,o.a.createElement(m.a,{diagnoses:t.map((function(e){var t=e.row;return{diagnosisId:t.diagnosisId,scriptId:t.scriptId}}))},o.a.createElement(u.a,null,"Copy"))),o.a.createElement(p.b,{to:"/scripts/".concat(a,"/diagnoses/new")},o.a.createElement(g.a,{title:"New diagnosis"},o.a.createElement(l.a,null,o.a.createElement(d.a,null)))))}(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&n(e),("undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e})(b,"useParams{{ scriptId }}",(function(){return[f.h]})),b.propTypes={selected:c.a.array.isRequired};var h,v,y=function(e){return o.a.createElement(b,e)};t.default=y,(h="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(h.register(b,"Actions","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/Diagnoses/_renderHeaderActions.js"),h.register(y,"default","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/Diagnoses/_renderHeaderActions.js")),(v="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&v(e)}.call(this,a(8)(e))},438:function(e,t,a){"use strict";a.r(t),function(e){var n,r=a(24),o=a.n(r),i=a(0),c=a.n(i),l=a(2),s=a.n(l),d=a(101),u=a(287),f=a.n(u),p=a(445),g=a(61),m=a(27),b=a(30),h=a(439),v=a(379);function y(e){var t=e.row,a=c.a.useState(null),n=o()(a,2),r=n[0],i=n[1],l=function(){return i(null)};return c.a.createElement(c.a.Fragment,null,c.a.createElement(d.a,{onClick:function(e){return i(e.currentTarget)}},c.a.createElement(f.a,null)),c.a.createElement(p.a,{anchorEl:r,keepMounted:!0,open:Boolean(r),onClose:l},c.a.createElement(g.a,{component:b.b,to:"/scripts/".concat(t.scriptId,"/diagnoses/").concat(t.id),onClick:l},"Edit"),c.a.createElement(g.a,{onClick:l,items:[t],component:v.a},"Copy"),c.a.createElement(g.a,{onClick:l,diagnoses:[{id:t.id}],component:h.a},c.a.createElement(m.a,{color:"error"},"Delete"))))}(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&n(e),("undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e})(y,"useState{[anchorEl, setAnchorEl](null)}"),y.propTypes={row:s.a.object.isRequired,rowIndex:s.a.number.isRequired};var E,S,L=function(e,t){return c.a.createElement(y,{row:e,rowIndex:t})};t.default=L,(E="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(E.register(y,"Action","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/Diagnoses/_renderRowAction.js"),E.register(L,"default","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/Diagnoses/_renderRowAction.js")),(S="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&S(e)}.call(this,a(8)(e))},439:function(e,t,a){"use strict";(function(e){var n,r=a(37),o=a.n(r),i=a(55),c=a.n(i),l=a(9),s=a.n(l),d=a(24),u=a.n(d),f=a(13),p=a.n(f),g=a(0),m=a.n(g),b=a(2),h=a.n(b),v=a(86),y=a(105);(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&n(e);var E="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},S=m.a.forwardRef(E((function(e,t){var a=e.children,n=e.diagnoses,r=e.onClick,i=p()(e,["children","diagnoses","onClick"]),l=n.length>1,d=Object(v.a)(),f=u()(d,2),g=f[0],b=f[1],h=m.a.useState(!1),E=u()(h,2),S=E[0],L=E[1];return m.a.createElement(m.a.Fragment,null,m.a.createElement("div",s()({},i,{ref:t,onClick:function(e){b(),r&&r(e)}}),a),g({title:"Delete diagnosis".concat(l?"s":""),message:"Are you sure you want to delete diagnosis".concat(l?"s":"","?"),onConfirm:function(){c()(o.a.mark((function e(){var t,a,r;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return L(!0),e.prev=1,e.next=4,fetch("/delete-diagnoses",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({diagnoses:n})});case 4:return t=e.sent,e.next=7,t.json();case 7:a=e.sent,(r=a.errors)&&r.length?alert(JSON.stringify(r)):window.location.reload(),e.next=15;break;case 12:e.prev=12,e.t0=e.catch(1),alert(e.t0.message);case 15:L(!1);case 16:case"end":return e.stop()}}),e,null,[[1,12]])})))()}}),S?m.a.createElement(y.a,null):null)}),"useConfirmModal{[renderConfirmModal, confirm]}\nuseState{[deletingDiagnoses, setDeletingDiagnoses](false)}",(function(){return[v.a]})));S.propTypes={onClick:h.a.func,children:h.a.node,diagnoses:h.a.arrayOf(h.a.shape({id:h.a.number.isRequired})).isRequired};var L,H,G=S;t.a=G,(L="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(L.register(S,"DeleteDiagnoses","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/Diagnoses/Forms/DeleteDiagnoses.js"),L.register(G,"default","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/Diagnoses/Forms/DeleteDiagnoses.js")),(H="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&H(e)}).call(this,a(8)(e))}}]);