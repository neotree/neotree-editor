(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{201:function(e,t,n){"use strict";var r=n(6),a=n.n(r),c=n(13),o=n.n(c),i=n(20),l=n.n(i),s=n(0),u=n.n(s),d=n(2),f=n.n(d),p=n(324),g=n(320),m=n(321),b=n(188),O=n(325),y=n(326),v=n(105),E=n(338),h=n(323),j=n(40),w=n.n(j),P=n(10),D=n.n(P),S=n(220),k=n.n(S),C=n(322),x=n(200),I=n(195),R=n.n(I),F=n(189),A=n(221),T=n.n(A),N=n(318),q=Object(x.c)((function(){return u.a.createElement("div",null,u.a.createElement(N.a,{title:"Drag to reposition"},u.a.createElement(F.a,{style:{cursor:"move"}},u.a.createElement(T.a,null))))})),W=Object(x.b)((function(e){var t=e.row,n=e.rowIndex,r=e.selectable,c=e.classes,o=e.selected,i=e.setSelected,l=e.displayFields,s=e.action;return u.a.createElement(g.a,{className:D()(c.dataItemRow,{selected:o.map((function(e){return e.rowIndex})).includes(n)})},r&&u.a.createElement(m.a,{padding:"none"},u.a.createElement(E.a,{checked:o.map((function(e){return e.rowIndex})).includes(n),onChange:function(){return i((function(e){return e.map((function(e){return e.rowIndex})).includes(n)?e.filter((function(e){return e.rowIndex!==n})):[].concat(R()(e),[{row:t,rowIndex:n}])}))}})),u.a.createElement(m.a,{padding:"none"},u.a.createElement(q,null)),l.map((function(e,r){var c=e.render?e.render({row:t,rowIndex:n,column:e.key,columnIndex:r}):(t.data||t)[e.key];return u.a.createElement(m.a,a()({},e.cellProps,{key:"".concat(n).concat(e.key).concat(r)}),c)})),s?u.a.createElement(m.a,{align:"right",padding:"none"},s):null)})),_=Object(x.a)((function(e){var t=e.rows,n=e.classes,r=e.selected,a=e.selectable,c=e.setSelected,o=e.displayFields,i=e.renderRowAction;return u.a.createElement(C.a,null,t.map((function(e,t){var l=t;return u.a.createElement(W,{key:"".concat(l).concat(t),row:e,index:t,rowIndex:t,classes:n,selectable:a,action:i?i(e,t)||u.a.createElement(u.a.Fragment,null):null,displayFields:o,selected:r,setSelected:c})})))}));function J(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function H(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?J(Object(n),!0).forEach((function(t){o()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):J(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var M=w()((function(e){return{table:{minWidth:800},headerWrap:{position:"relative",height:60},header:{position:"absolute",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",boxSizing:"border-box",padding:e.spacing()},dataItemRow:{"&:hover, &.selected":{backgroundColor:e.palette.action.hover}}}}));function L(e){var t=e.noDataMsg,n=e.title,r=e.selectable,c=e.renderRowAction,o=e.data,i=e.onSortData,s=e.displayFields,d=e.renderHeaderActions;r=!1!==r;var f=M(),j=u.a.useState([]),w=l()(j,2),P=w[0],S=w[1],C=u.a.useState(o),x=l()(C,2),I=x[0],R=x[1];return u.a.useEffect((function(){R(o)}),[o]),u.a.useEffect((function(){if(JSON.stringify(I)!==JSON.stringify(o)){var e=I.map((function(e,t){return H(H({},e),{},{position:t+1})}));R(e),i&&i(e)}}),[I]),u.a.createElement(u.a.Fragment,null,u.a.createElement(b.a,{square:!0,elevation:0},u.a.createElement("div",{className:D()(f.headerWrap)},u.a.createElement("div",{className:D()(f.header)},u.a.createElement(v.a,{variant:"h6"},n),u.a.createElement("div",{style:{marginLeft:"auto"}}),d&&d({selected:P}))),u.a.createElement(h.a,null),I.length?u.a.createElement(p.a,{component:b.a},u.a.createElement(O.a,{className:D()(f.table)},u.a.createElement(y.a,null,u.a.createElement(g.a,null,r&&u.a.createElement(m.a,{padding:"none"},u.a.createElement(E.a,{indeterminate:P.length>0&&P.length<I.length,checked:I.length>0&&P.length===I.length,onChange:function(){return S((function(e){return e.length<I.length?I.map((function(e,t){return{row:e,rowIndex:t}})):[]}))}})),u.a.createElement(m.a,null),s.map((function(e,t){return u.a.createElement(m.a,a()({},e.cellProps,{key:"".concat(e.key).concat(t)}),u.a.createElement("b",null,e.label))})),c?u.a.createElement(m.a,{align:"right"},u.a.createElement("b",null,"Action")):null)),u.a.createElement(_,{rows:I,selectable:r,renderRowAction:c,classes:f,displayFields:s,selected:P,setSelected:S,useDragHandle:!0,onSortEnd:function(e){var t=e.oldIndex,n=e.newIndex;return R((function(e){return k()(e,{$splice:[[t,1],[n,0,e[t]]]})}))}}))):u.a.createElement("div",{style:{textAlign:"center",padding:25}},u.a.createElement(v.a,{color:"textSecondary"},t||"No data"))))}L.propTypes={noDataMsg:f.a.string,selectable:f.a.bool,renderRowAction:f.a.func,title:f.a.string.isRequired,displayFields:f.a.array.isRequired,renderHeaderActions:f.a.func,onSortData:f.a.func,data:f.a.array.isRequired};t.a=L},213:function(e,t,n){"use strict";n.d(t,"d",(function(){return l})),n.d(t,"f",(function(){return s})),n.d(t,"b",(function(){return u})),n.d(t,"c",(function(){return d})),n.d(t,"e",(function(){return f})),n.d(t,"g",(function(){return p})),n.d(t,"a",(function(){return g}));var r=n(13),a=n.n(r),c=n(28);function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var l=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/get-diagnoses",i({body:e},t))},s=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/update-diagnoses",i({method:"POST",body:e},t))},u=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/delete-diagnosis",i({method:"POST",body:e},t))},d=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/duplicate-diagnosis",i({method:"POST",body:e},t))},f=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/get-diagnosis",i({body:e},t))},p=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/update-diagnosis",i({method:"POST",body:e},t))},g=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(c.a)("/create-diagnosis",i({method:"POST",body:e},t))}},250:function(e,t,n){"use strict";t.a={PAGE_TITLE:"Diagnoses"}},251:function(e,t,n){"use strict";var r=n(6),a=n.n(r),c=n(20),o=n.n(c),i=n(9),l=n.n(i),s=n(0),u=n.n(s),d=n(2),f=n.n(d),p=n(166),g=n(163),m=n(162),b=n(161),O=n(106),y=n(105),v=n(164),E=n(204),h=u.a.forwardRef((function(e,t){var n=e.children,r=e.ids,c=e.type,i=e.onClick,s=e.onSuccess,d=l()(e,["children","ids","type","onClick","onSuccess"]),f=r.length>1,h=u.a.useState(!1),j=o()(h,2),w=j[0],P=j[1],D=u.a.useState(!1),S=o()(D,2),k=S[0],C=S[1],x=u.a.useState(!1),I=o()(x,2),R=I[0],F=I[1],A=u.a.useState([]),T=o()(A,2),N=T[0],q=T[1],W=u.a.useState(null),_=o()(W,2),J=_[0],H=_[1],M=u.a.useState(!1),L=o()(M,2),G=L[0],z=L[1],B=u.a.useState(""),K=o()(B,2),$=K[0],Q=K[1],U=u.a.useState(!1),V=o()(U,2),X=V[0],Y=V[1];u.a.useEffect((function(){H(null),Q(null),w&&!R&&(C(!0),E.g().then((function(e){var t=e.error,n=e.scripts;if(t)return H(t);q(n),F(!0),C(!1)})).then((function(e){H(e),C(!1)})))}),[w]);var Z=f?"diagnosis"===c?"diagnoses":"screens":c;return u.a.createElement(u.a.Fragment,null,u.a.createElement("div",a()({},d,{ref:t,onClick:function(e){P(!0),i&&i(e)}}),n),u.a.createElement(p.a,{open:w,onClose:function(){return P(!1)},fullWidth:!0,maxWidth:"sm"},u.a.createElement(b.a,null,"Copy ",Z),k?u.a.createElement(m.a,null,u.a.createElement("div",{style:{textAlign:"center"}},u.a.createElement(v.a,null))):u.a.createElement(u.a.Fragment,null,u.a.createElement(m.a,null,u.a.createElement(y.a,null,"Copy to"),u.a.createElement("select",{value:$||"",style:{maxWidth:200,background:"transparent",border:"1px solid #ddd",padding:10,outline:"none !important"},onChange:function(e){return Q(e.target.value)}},u.a.createElement("option",{value:""},"Select script"),N.map((function(e,t){return u.a.createElement("option",{key:t,value:e.id},e.data.title)})))),u.a.createElement(g.a,null,u.a.createElement(O.a,{disabled:G,onClick:function(){return P(!1)}},"Cancel"),u.a.createElement(O.a,{color:"primary",variant:"contained",disabled:G||!$,onClick:function(){var e=null;switch(c){case"screen":e=E.b;break;case"diagnosis":e=E.a}e&&(z(!0),H(null),e({ids:r,script_id:$}).then((function(e){var t=e.error,n=e.items;H(t),z(!1),Q(""),s&&s(n,$),Y(!0)})).catch((function(e){H(e),z(!1)})))}},"Copy"),J?u.a.createElement(y.a,{variant:"caption",color:"error"},J.msg||J.message||JSON.stringify(J)):null))),u.a.createElement(p.a,{open:X,onClose:function(){return Y(!1)},fullWidth:!0,maxWidth:"sm"},u.a.createElement(m.a,null,u.a.createElement("div",{style:{textAlign:"center"}},u.a.createElement(y.a,null,"Copied ",u.a.createElement("b",null,Z)," successfully."))),u.a.createElement(g.a,null,u.a.createElement(O.a,{accent:!0,onClick:function(){P(!1),Y(!1)}},"OK"))))}));h.propTypes={onClick:f.a.func,children:f.a.node,ids:f.a.array.isRequired,onSuccess:f.a.func,type:f.a.oneOf(["screen","diagnosis"]).isRequired},t.a=h},254:function(e,t,n){"use strict";n.d(t,"b",(function(){return P})),n.d(t,"a",(function(){return D}));var r=n(13),a=n.n(r),c=n(20),o=n.n(c),i=n(0),l=n.n(i),s=n(12),u=n(213);function d(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function f(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?d(Object(n),!0).forEach((function(t){a()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):d(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function g(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?p(Object(n),!0).forEach((function(t){a()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):p(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function m(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function b(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?m(Object(n),!0).forEach((function(t){a()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):m(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var O=n(195),y=n.n(O);function v(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function E(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?v(Object(n),!0).forEach((function(t){a()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):v(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function h(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function j(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?h(Object(n),!0).forEach((function(t){a()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):h(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var w=l.a.createContext(null),P=function(){return l.a.useContext(w)},D=function(e){return function(t){var n=Object(s.i)().scriptId,r=l.a.useState({diagnoses:[]}),a=o()(r,2),c=a[0],i=a[1],d=function(e){return i((function(t){return j(j({},t),"function"==typeof e?e(t):e)}))},p=function(e){var t=e.setState;return function(e){t({loadingDiagnoses:!0});var n=function(e,n){t(f(f({getDiagnosesError:e},n),{},{diagnosesInitialised:!0,loadingDiagnoses:!1}))};u.d(e).then((function(e){return n(e.errors,e)})).catch(n)}}({setState:d}),m=function(e){var t=e.setState;return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];if(e.length){t({deletingDiagnoses:!0});var n=function(n){t((function(t){var r=t.diagnoses;return g({deleteDiagnosesError:n,deletingDiagnoses:!1},n?null:{diagnoses:r.filter((function(t){return e.indexOf(t.id)<0}))})}))};u.b({id:e[0]}).then((function(e){return n(e.errors,e)})).catch(n)}}}({setState:d}),O=function(e){var t=e.setState;return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];if(e.length){t({updatingDiagnoses:!0});var n=function(e,n){t(b(b({updateDiagnosesError:e},n),{},{updatingDiagnoses:!1}))};u.f({diagnoses:e}).then((function(e){return n(e.errors,e)})).catch(n)}}}({setState:d}),v=function(e){var t=e.setState;return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];if(e.length){t({duplicatingDiagnoses:!0});var n=function(n,r){t((function(t){var a=t.diagnoses;return E({duplicateDiagnosesError:n,duplicatingDiagnoses:!1},n?null:{diagnoses:a.reduce((function(t,n){return[].concat(y()(t),[n],y()(e.indexOf(n.id)<0?[]:[r.diagnosis]))}),[])})}))};u.c({id:e[0]}).then((function(e){return n(e.errors,e)})).catch(n)}}}({setState:d});return l.a.useEffect((function(){p({script_id:n})}),[]),l.a.createElement(w.Provider,{value:{state:c,setState:d,_setState:i,getDiagnoses:p,deleteDiagnoses:m,updateDiagnoses:O,duplicateDiagnoses:v}},l.a.createElement(e,t))}}},271:function(e,t,n){"use strict";var r=n(6),a=n.n(r),c=n(195),o=n.n(c),i=n(0),l=n.n(i),s=n(254),u=n(202),d=n(251),f=l.a.forwardRef((function(e,t){var n=Object(u.b)().state.script,r=Object(s.b)().setState;return l.a.createElement(l.a.Fragment,null,l.a.createElement(d.a,a()({},e,{ref:t,type:"diagnosis",onSuccess:function(e,t){t===n.id&&r((function(t){return{diagnoses:[].concat(o()(t.diagnoses),o()(e))}}))}})))}));t.a=f},295:function(e,t,n){"use strict";n.r(t);var r=n(0),a=n.n(r),c=n(2),o=n.n(c),i=n(189),l=n(205),s=n.n(l),u=n(106),d=n(202),f=n(37),p=n(318),g=n(271);function m(e){var t=e.selected,n=Object(d.b)().state.script;return a.a.createElement(a.a.Fragment,null,t.length>0&&a.a.createElement(a.a.Fragment,null,a.a.createElement(g.a,{ids:t.map((function(e){return e.row.id}))},a.a.createElement(u.a,null,"Copy"))),a.a.createElement(f.b,{to:"/scripts/".concat(n.id,"/diagnoses/new")},a.a.createElement(p.a,{title:"New diagnosis"},a.a.createElement(i.a,null,a.a.createElement(s.a,null)))))}m.propTypes={selected:o.a.array.isRequired},t.default=function(e){return a.a.createElement(m,e)}},303:function(e,t,n){"use strict";n.r(t);var r=n(20),a=n.n(r),c=n(0),o=n.n(c),i=n(2),l=n.n(i),s=n(189),u=n(211),d=n.n(u),f=n(300),p=n(327),g=n(105),m=n(37),b=n(6),O=n.n(b),y=n(9),v=n.n(y),E=n(81),h=n(254),j=o.a.forwardRef((function(e,t){var n=e.children,r=e.ids,c=e.onClick,i=v()(e,["children","ids","onClick"]),l=r.length>1,s=Object(E.a)(),u=a()(s,2),d=u[0],f=u[1],p=Object(h.b)().deleteDiagnoses;return o.a.createElement(o.a.Fragment,null,o.a.createElement("div",O()({},i,{ref:t,onClick:function(e){f(),c&&c(e)}}),n),d({title:"Delete diagnosis".concat(l?"s":""),message:"Are you sure you want to delete diagnosis".concat(l?"s":"","?"),onConfirm:function(){return p(r)}}))}));j.propTypes={onClick:l.a.func,children:l.a.node,ids:l.a.array.isRequired};var w=j,P=n(271);function D(e){var t=e.row,n=o.a.useState(null),r=a()(n,2),c=r[0],i=r[1],l=function(){return i(null)};return o.a.createElement(o.a.Fragment,null,o.a.createElement(s.a,{onClick:function(e){return i(e.currentTarget)}},o.a.createElement(d.a,null)),o.a.createElement(f.a,{anchorEl:c,keepMounted:!0,open:Boolean(c),onClose:l},o.a.createElement(p.a,{component:m.b,to:"/scripts/".concat(t.script_id,"/diagnoses/").concat(t.id),onClick:l},"Edit"),o.a.createElement(p.a,{onClick:l,ids:[t.id],component:P.a},"Copy"),o.a.createElement(p.a,{onClick:l,ids:[t.id],component:w},o.a.createElement(g.a,{color:"error"},"Delete"))))}D.propTypes={row:l.a.object.isRequired,rowIndex:l.a.number.isRequired};t.default=function(e,t){return o.a.createElement(D,{row:e,rowIndex:t})}},332:function(e,t,n){"use strict";n.r(t);var r=n(0),a=n.n(r),c=n(254),o=n(201),i=n(79),l=n(164),s=n(250);t.default=Object(c.a)((function(){var e=Object(c.b)(),t=e.updateDiagnoses,r=e.setState,u=e.state,d=u.diagnoses,f=u.diagnosesInitialised,p=u.loadingDiagnoses,g=u.duplicatingDiagnoses,m=u.deletingDiagnoses;return a.a.createElement(a.a.Fragment,null,f?a.a.createElement(a.a.Fragment,null,a.a.createElement(o.a,{selectable:!0,noDataMsg:"No diagnoses",title:s.a.PAGE_TITLE,data:d,renderHeaderActions:n(295).default,renderRowAction:n(303).default,displayFields:[{key:"name",label:"Name"},{key:"description",label:"Description"}],onSortData:function(e){r({diagnoses:e}),t(e.map((function(e){return{id:e.id,position:e.position}})))}})):null,p&&a.a.createElement("div",{style:{margin:25,textAlign:"center"}},a.a.createElement(l.a,null)),m||g?a.a.createElement(i.a,null):null)}))}}]);