(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{264:function(e,t,n){"use strict";var a=n(10),r=n.n(a),c=n(9),l=n.n(c),o=n(20),i=n.n(o),s=n(0),u=n.n(s),d=n(2),p=n.n(d),m=n(376),f=n(343),g=n(344),E=n(250),y=n(346),b=n(347),v=n(137),h=n(315),w=n(304),O=n(12),S=n.n(O),k=n(5),x=n.n(k),j=n(277),I=n.n(j),C=n(345),P=n(265),R=n(258),D=n.n(R),F=n(248),A=n(281),N=n.n(A),T=n(374),q=Object(P.c)((function(){return u.a.createElement("div",null,u.a.createElement(T.a,{title:"Drag to reposition"},u.a.createElement(F.a,{style:{cursor:"move"}},u.a.createElement(N.a,null))))})),J=Object(P.b)((function(e){var t=e.row,n=e.rowIndex,a=e.selectable,r=e.classes,c=e.selected,o=e.setSelected,i=e.displayFields,s=e.action,d=e.sortable;return u.a.createElement(f.a,{className:x()(r.dataItemRow,{selected:c.map((function(e){return e.rowIndex})).includes(n)})},a&&u.a.createElement(g.a,{padding:"none"},u.a.createElement(h.a,{checked:c.map((function(e){return e.rowIndex})).includes(n),onChange:function(){return o((function(e){return e.map((function(e){return e.rowIndex})).includes(n)?e.filter((function(e){return e.rowIndex!==n})):[].concat(D()(e),[{row:t,rowIndex:n}])}))}})),d&&u.a.createElement(g.a,{padding:"none"},u.a.createElement(q,null)),i.map((function(e,a){var r=e.render?e.render({row:t,rowIndex:n,column:e.key,columnIndex:a}):t[e.key];return u.a.createElement(g.a,l()({},e.cellProps,{key:"".concat(n).concat(e.key).concat(a)}),r)})),s?u.a.createElement(g.a,{align:"right",padding:"none"},s):null)})),W=Object(P.a)((function(e){var t=e.rows,n=e.sortable,a=e.classes,r=e.selected,c=e.selectable,l=e.setSelected,o=e.displayFields,i=e.renderRowAction,s=e.filter;return u.a.createElement(C.a,null,t.map((function(e,t){var d=t;return s&&!s(e)?null:u.a.createElement(J,{key:"".concat(d).concat(t),row:e,sortable:n,index:t,rowIndex:t,classes:a,selectable:c,action:i?i(e,t)||u.a.createElement(u.a.Fragment,null):null,displayFields:o,selected:r,setSelected:l})})))}));function M(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function H(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?M(Object(n),!0).forEach((function(t){r()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):M(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var L=S()((function(e){return{table:{minWidth:800},headerWrap:{position:"relative",height:60},header:{position:"absolute",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",boxSizing:"border-box",padding:e.spacing()},dataItemRow:{"&:hover, &.selected":{backgroundColor:e.palette.action.hover}}}}));function G(e){var t=e.noDataMsg,n=e.title,a=e.selectable,r=e.renderRowAction,c=e.data,o=e.onSortData,s=e.displayFields,d=e.renderHeaderActions,p=e.filter;a=!1!==a;var O=L(),S=u.a.useState([]),k=i()(S,2),j=k[0],C=k[1],P=u.a.useState(c),R=i()(P,2),D=R[0],F=R[1];return u.a.useEffect((function(){JSON.stringify(D)!==JSON.stringify(c)&&F(c)}),[c]),u.a.createElement(u.a.Fragment,null,u.a.createElement(E.a,{square:!0,elevation:0},u.a.createElement("div",{className:x()(O.headerWrap)},u.a.createElement("div",{className:x()(O.header)},u.a.createElement(v.a,{variant:"h6"},n),u.a.createElement("div",{style:{marginLeft:"auto"}}),d&&d({selected:j}))),u.a.createElement(w.a,null),D.length?u.a.createElement(m.a,{component:E.a},u.a.createElement(y.a,{className:x()(O.table)},u.a.createElement(b.a,null,u.a.createElement(f.a,null,a&&u.a.createElement(g.a,{padding:"none"},u.a.createElement(h.a,{indeterminate:j.length>0&&j.length<D.length,checked:D.length>0&&j.length===D.length,onChange:function(){return C((function(e){return e.length<D.length?D.map((function(e,t){return{row:e,rowIndex:t}})):[]}))}})),!!o&&u.a.createElement(g.a,null),s.map((function(e,t){return u.a.createElement(g.a,l()({},e.cellProps,{key:"".concat(e.key).concat(t)}),u.a.createElement("b",null,e.label))})),r?u.a.createElement(g.a,{align:"right"},u.a.createElement("b",null,"Action")):null)),u.a.createElement(W,{rows:D,filter:p,selectable:a,renderRowAction:r,classes:O,displayFields:s,selected:j,setSelected:C,useDragHandle:!0,sortable:!!o,onSortEnd:function(e){var t=e.oldIndex,n=e.newIndex,a=I()(D,{$splice:[[t,1],[n,0,D[t]]]}).map((function(e,t){return H(H({},e),{},{position:t+1})}));F(a),o(a)}}))):u.a.createElement("div",{style:{textAlign:"center",padding:25}},u.a.createElement(v.a,{color:"textSecondary"},t||"No data"))))}G.propTypes={noDataMsg:p.a.string,selectable:p.a.bool,renderRowAction:p.a.func,title:p.a.string.isRequired,displayFields:p.a.array.isRequired,renderHeaderActions:p.a.func,onSortData:p.a.func,data:p.a.array.isRequired,filter:p.a.func};t.a=G},312:function(e,t,n){"use strict";t.a={PAGE_TITLE:"Diagnoses"}},316:function(e,t,n){"use strict";var a=n(42),r=n.n(a),c=n(9),l=n.n(c),o=n(20),i=n.n(o),s=n(11),u=n.n(s),d=n(29),p=n.n(d),m=n(0),f=n.n(m),g=n(2),E=n.n(g),y=n(225),b=n(223),v=n(222),h=n(221),w=n(138),O=n(137),S=n(219),k=n(10),x=n.n(k),j=n(60);function I(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function C(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?I(Object(n),!0).forEach((function(t){x()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):I(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var P=["children","items","type","onClick","onSuccess"],R=f.a.forwardRef((function(e,t){var n=e.children,a=e.items,c=e.type,o=e.onClick,s=e.onSuccess,d=u()(e,P),m=a.length>1,g=f.a.useState(!1),E=i()(g,2),k=E[0],x=E[1],I=f.a.useState(!1),R=i()(I,2),D=R[0],F=R[1],A=f.a.useState(!1),N=i()(A,2),T=N[0],q=N[1],J=f.a.useState([]),W=i()(J,2),M=W[0],H=W[1],L=f.a.useState(null),G=i()(L,2),_=G[0],z=G[1],B=f.a.useState(!1),K=i()(B,2),V=K[0],$=K[1],Q=f.a.useState(""),U=i()(Q,2),X=U[0],Y=U[1],Z=f.a.useState(!1),ee=i()(Z,2),te=ee[0],ne=ee[1];f.a.useEffect((function(){z(null),Y(null),k&&!T&&(F(!0),function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(j.a)("/get-scripts",C({body:e},t))}().then((function(e){var t=e.error,n=e.scripts;if(t)return z(t);H(n),q(!0),F(!1)})).then((function(e){z(e),F(!1)})))}),[k]);var ae=m?"diagnosis"===c?"diagnoses":"screens":c;return f.a.createElement(f.a.Fragment,null,f.a.createElement("div",l()({},d,{ref:t,onClick:function(e){x(!0),o&&o(e)}}),n),f.a.createElement(y.a,{open:k,onClose:function(){return x(!1)},fullWidth:!0,maxWidth:"sm"},f.a.createElement(h.a,null,"Copy ",ae),D?f.a.createElement(v.a,null,f.a.createElement("div",{style:{textAlign:"center"}},f.a.createElement(S.a,null))):f.a.createElement(f.a.Fragment,null,f.a.createElement(v.a,null,f.a.createElement(O.a,null,"Copy to"),f.a.createElement("select",{value:X||"",style:{maxWidth:200,background:"transparent",border:"1px solid #ddd",padding:10,outline:"none !important"},onChange:function(e){return Y(e.target.value)}},f.a.createElement("option",{value:""},"Select script"),M.map((function(e,t){return f.a.createElement("option",{key:t,value:e.scriptId},e.title)})))),f.a.createElement(b.a,null,f.a.createElement(w.a,{disabled:V,onClick:function(){return x(!1)}},"Cancel"),f.a.createElement(w.a,{color:"primary",variant:"contained",disabled:V||!X,onClick:function(){var e=null;switch(c){case"screen":e="/copy-screens";break;case"diagnosis":e="/copy-diagnoses"}e&&r()(p.a.mark((function t(){var n,r,c;return p.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return $(!0),t.prev=1,t.next=4,fetch(e,{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({items:a,targetScriptId:X})});case 4:return n=t.sent,t.next=7,n.json();case 7:r=t.sent,(c=r.errors)&&c.length?alert(JSON.stringify(c)):(ne(!0),s&&s(a,X)),t.next=15;break;case 12:t.prev=12,t.t0=t.catch(1),alert(t.t0.message);case 15:$(!1);case 16:case"end":return t.stop()}}),t,null,[[1,12]])})))()}},"Copy"),_?f.a.createElement(O.a,{variant:"caption",color:"error"},_.msg||_.message||JSON.stringify(_)):null))),f.a.createElement(y.a,{open:te,onClose:function(){return ne(!1)},fullWidth:!0,maxWidth:"sm"},f.a.createElement(v.a,null,f.a.createElement("div",{style:{textAlign:"center"}},f.a.createElement(O.a,null,"Copied ",f.a.createElement("b",null,ae)," successfully."))),f.a.createElement(b.a,null,f.a.createElement(w.a,{accent:!0,onClick:function(){x(!1),ne(!1)}},"OK"))))}));R.propTypes={onClick:E.a.func,children:E.a.node,items:E.a.arrayOf(E.a.shape({diagnosisId:E.a.string,screenId:E.a.string,scriptId:E.a.string.isRequired})).isRequired,onSuccess:E.a.func,type:E.a.oneOf(["screen","diagnosis"]).isRequired};t.a=R},334:function(e,t,n){"use strict";var a=n(9),r=n.n(a),c=n(0),l=n.n(c),o=n(15),i=n(316),s=l.a.forwardRef((function(e,t){var n=Object(o.h)().scriptId;return l.a.createElement(l.a.Fragment,null,l.a.createElement(i.a,r()({},e,{ref:t,type:"diagnosis",onSuccess:function(e,t){n===t&&window.location.reload()}})))}));t.a=s},355:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),c=n(2),l=n.n(c),o=n(248),i=n(263),s=n.n(i),u=n(138),d=n(15),p=n(27),m=n(374),f=n(334);function g(e){var t=e.selected,n=Object(d.h)().scriptId;return r.a.createElement(r.a.Fragment,null,t.length>0&&r.a.createElement(r.a.Fragment,null,r.a.createElement(f.a,{items:t.map((function(e){var t=e.row;return{diagnosisId:t.diagnosisId,scriptId:t.scriptId,id:t.id}}))},r.a.createElement(u.a,null,"Copy"))),r.a.createElement(p.b,{to:"/scripts/".concat(n,"/diagnoses/new")},r.a.createElement(m.a,{title:"New diagnosis"},r.a.createElement(o.a,null,r.a.createElement(s.a,null)))))}g.propTypes={selected:l.a.array.isRequired},t.default=function(e){return r.a.createElement(g,e)}},358:function(e,t,n){"use strict";n.r(t);var a=n(20),r=n.n(a),c=n(0),l=n.n(c),o=n(2),i=n.n(o),s=n(248),u=n(267),d=n.n(u),p=n(359),m=n(253),f=n(137),g=n(27),E=n(26),y=n(42),b=n.n(y),v=n(9),h=n.n(v),w=n(11),O=n.n(w),S=n(29),k=n.n(S),x=n(101),j=n(57),I=["children","diagnoses","onClick"],C=l.a.forwardRef((function(e,t){var n=e.children,a=e.diagnoses,c=e.onClick,o=O()(e,I),i=a.length>1,s=Object(x.a)(),u=r()(s,2),d=u[0],p=u[1],m=l.a.useState(!1),f=r()(m,2),g=f[0],E=f[1];return l.a.createElement(l.a.Fragment,null,l.a.createElement("div",h()({},o,{ref:t,onClick:function(e){p(),c&&c(e)}}),n),d({title:"Delete diagnosis".concat(i?"s":""),message:"Are you sure you want to delete diagnosis".concat(i?"s":"","?"),onConfirm:function(){b()(k.a.mark((function e(){var t,n,r;return k.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return E(!0),e.prev=1,e.next=4,fetch("/delete-diagnoses",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({diagnoses:a})});case 4:return t=e.sent,e.next=7,t.json();case 7:n=e.sent,(r=n.errors)&&r.length?alert(JSON.stringify(r)):window.location.reload(),e.next=15;break;case 12:e.prev=12,e.t0=e.catch(1),alert(e.t0.message);case 15:E(!1);case 16:case"end":return e.stop()}}),e,null,[[1,12]])})))()}}),g?l.a.createElement(j.a,null):null)}));C.propTypes={onClick:i.a.func,children:i.a.node,diagnoses:i.a.arrayOf(i.a.shape({id:i.a.number.isRequired})).isRequired};var P=C,R=n(334);function D(e){var t=e.row,n=Object(E.d)().state.viewMode,a=l.a.useState(null),c=r()(a,2),o=c[0],i=c[1],u=function(){return i(null)};return l.a.createElement(l.a.Fragment,null,l.a.createElement(s.a,{onClick:function(e){return i(e.currentTarget)}},l.a.createElement(d.a,null)),l.a.createElement(p.a,{anchorEl:o,keepMounted:!0,open:Boolean(o),onClose:u},l.a.createElement(m.a,{component:g.b,to:"/scripts/".concat(t.scriptId,"/diagnoses/").concat(t.id),onClick:u},"view"===n?"View":"Edit"),"view"===n?null:l.a.createElement(m.a,{onClick:u,items:[{diagnosisId:t.diagnosisId,scriptId:t.scriptId,id:t.id}],component:R.a},"Copy"),"view"===n?null:l.a.createElement(m.a,{onClick:u,diagnoses:[{id:t.id}],component:P},l.a.createElement(f.a,{color:"error"},"Delete"))))}D.propTypes={row:i.a.object.isRequired,rowIndex:i.a.number.isRequired};t.default=function(e,t){return l.a.createElement(D,{row:e,rowIndex:t})}},383:function(e,t,n){"use strict";n.r(t);var a=n(42),r=n.n(a),c=n(20),l=n.n(c),o=n(29),i=n.n(o),s=n(0),u=n.n(s),d=n(15),p=n(264),m=n(219),f=n(312),g=n(26);t.default=function(){var e=Object(g.d)().state.viewMode,t=Object(d.h)().scriptId,a=u.a.useState([]),c=l()(a,2),o=c[0],s=c[1],E=u.a.useState(!1),y=l()(E,2),b=y[0],v=y[1],h=u.a.useState(!1),w=l()(h,2),O=w[0],S=w[1];return u.a.useEffect((function(){r()(i.a.mark((function e(){var n,a,r;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return S(!0),e.prev=1,e.next=4,fetch("/get-diagnoses?scriptId=".concat(t));case 4:return n=e.sent,e.next=7,n.json();case 7:a=e.sent,r=a.diagnoses,s(r),e.next=15;break;case 12:e.prev=12,e.t0=e.catch(1),alert(e.t0.message);case 15:v(!0),S(!1);case 17:case"end":return e.stop()}}),e,null,[[1,12]])})))()}),[]),u.a.createElement(u.a.Fragment,null,b?u.a.createElement(u.a.Fragment,null,u.a.createElement(p.a,{selectable:"view"!==e,noDataMsg:"No diagnoses",title:f.a.PAGE_TITLE,data:o,renderHeaderActions:"view"===e?null:n(355).default,renderRowAction:n(358).default,displayFields:[{key:"position",label:"Position",render:function(e){return e.row.position}},{key:"name",label:"Name"},{key:"description",label:"Description"}],onSortData:"view"===e?void 0:function(e){s(e),r()(i.a.mark((function t(){var n;return i.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,fetch("/update-diagnoses",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({diagnoses:e.map((function(e){return{id:e.id,position:e.position}}))})});case 3:return n=t.sent,t.next=6,n.json();case 6:t.next=10;break;case 8:t.prev=8,t.t0=t.catch(0);case 10:case"end":return t.stop()}}),t,null,[[0,8]])})))()}})):null,O&&u.a.createElement("div",{style:{margin:25,textAlign:"center"}},u.a.createElement(m.a,null)))}}}]);