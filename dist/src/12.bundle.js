(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{286:function(e,t,n){"use strict";t.a={PAGE_TITLE:"Scripts"}},319:function(e,t,n){"use strict";var a=n(42),r=n.n(a),c=n(9),s=n.n(c),i=n(20),l=n.n(i),o=n(11),u=n.n(o),p=n(29),d=n.n(p),f=n(0),m=n.n(f),E=n(2),w=n.n(E),v=n(102),h=n(56),k=["children","scripts","onClick"],b=m.a.forwardRef((function(e,t){var n=e.children,a=e.scripts,c=e.onClick,i=u()(e,k),o=a.length>1,p=Object(v.a)(),f=l()(p,2),E=f[0],w=f[1],b=m.a.useState(!1),y=l()(b,2),g=y[0],x=y[1];return m.a.createElement(m.a.Fragment,null,m.a.createElement("div",s()({},i,{ref:t,onClick:function(e){w(),c&&c(e)}}),n),E({title:"Delete script".concat(o?"s":""),message:"Are you sure you want to delete script".concat(o?"s":"","?"),onConfirm:function(){r()(d.a.mark((function e(){var t,n,r;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return x(!0),e.prev=1,e.next=4,fetch("/delete-scripts",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({scripts:a})});case 4:return t=e.sent,e.next=7,t.json();case 7:n=e.sent,(r=n.errors)&&r.length?alert(JSON.stringify(r)):window.location.reload(),e.next=15;break;case 12:e.prev=12,e.t0=e.catch(1),alert(e.t0.message);case 15:x(!1);case 16:case"end":return e.stop()}}),e,null,[[1,12]])})))()}}),g?m.a.createElement(h.a,null):null)}));b.propTypes={onClick:w.a.func,children:w.a.node,scripts:w.a.array.isRequired},t.a=b},320:function(e,t,n){"use strict";var a=n(9),r=n.n(a),c=n(42),s=n.n(c),i=n(20),l=n.n(i),o=n(11),u=n.n(o),p=n(29),d=n.n(p),f=n(0),m=n.n(f),E=n(2),w=n.n(E),v=n(56),h=["children","onClick","scripts"],k=m.a.forwardRef((function(e,t){var n=e.children,a=e.onClick,c=e.scripts,i=u()(e,h),o=m.a.useState(!1),p=l()(o,2),f=p[0],E=p[1],w=m.a.useState(null),k=l()(w,2),b=(k[0],k[1]);return m.a.createElement(m.a.Fragment,null,m.a.createElement("div",r()({},i,{ref:t,onClick:function(e){s()(d.a.mark((function e(){return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return E(!0),e.prev=1,e.next=4,fetch("/duplicate-scripts",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({scripts:c})});case 4:window.location.reload(),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(1),b(e.t0);case 10:E(!1);case 11:case"end":return e.stop()}}),e,null,[[1,7]])})))(),a&&a(e)}}),n),f&&m.a.createElement(v.a,null))}));k.propTypes={onClick:w.a.func,children:w.a.node,scripts:w.a.arrayOf(w.a.shape({scriptId:w.a.string})).isRequired},t.a=k},346:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),c=n(2),s=n.n(c),i=n(248),l=n(259),o=n.n(l),u=n(264),p=n.n(u),d=n(138),f=n(373),m=n(27),E=n(321),w=n(318),v=n(319),h=n(320);function k(e){var t=e.selected;return r.a.createElement(r.a.Fragment,null,t.length>0&&r.a.createElement(r.a.Fragment,null,r.a.createElement(h.a,{scripts:t.map((function(e){return{scriptId:e.row.scriptId}}))},r.a.createElement(d.a,null,"Duplicate")),r.a.createElement(v.a,{scripts:t.map((function(e){return{scriptId:e.row.scriptId}}))},r.a.createElement(i.a,null,r.a.createElement(p.a,null)))),r.a.createElement(m.b,{to:"/scripts/new"},r.a.createElement(f.a,{title:"New script"},r.a.createElement(i.a,null,r.a.createElement(o.a,null)))),r.a.createElement(w.a,null,r.a.createElement(m.b,{to:"/scripts/new"},r.a.createElement(E.a,{color:"secondary"},r.a.createElement(o.a,null)))))}k.propTypes={selected:s.a.array.isRequired},t.default=function(e){return r.a.createElement(k,e)}},347:function(e,t,n){"use strict";n.r(t);var a=n(20),r=n.n(a),c=n(0),s=n.n(c),i=n(2),l=n.n(i),o=n(248),u=n(265),p=n.n(u),d=n(359),f=n(253),m=n(137),E=n(27),w=n(25),v=n(319),h=n(320);function k(e){var t=e.row,n=Object(w.d)().state.viewMode,a=s.a.useState(null),c=r()(a,2),i=c[0],l=c[1],u=function(){return l(null)};return s.a.createElement(s.a.Fragment,null,s.a.createElement(o.a,{onClick:function(e){return l(e.currentTarget)}},s.a.createElement(p.a,null)),s.a.createElement(d.a,{anchorEl:i,keepMounted:!0,open:Boolean(i),onClose:u},s.a.createElement(f.a,{component:E.b,to:"/scripts/".concat(t.scriptId),onClick:u},"view"===n?"View":"Edit"),"view"===n?null:s.a.createElement(f.a,{onClick:u,scripts:[t],component:h.a},"Duplicate"),"view"===n?null:s.a.createElement(f.a,{onClick:u,scripts:[{id:t.id}],component:v.a},s.a.createElement(m.a,{color:"error"},"Delete"))))}k.propTypes={row:l.a.object.isRequired,rowIndex:l.a.number.isRequired},t.default=function(e,t){return s.a.createElement(k,{row:e,rowIndex:t})}},372:function(e,t,n){"use strict";n.r(t);var a=n(42),r=n.n(a),c=n(20),s=n.n(c),i=n(29),l=n.n(i),o=n(0),u=n.n(o),p=n(25),d=n(106),f=n(262),m=n(286);t.default=function(){var e=Object(p.d)().state.viewMode;Object(p.c)("scripts"),Object(p.b)(m.a.PAGE_TITLE);var t=u.a.useState([]),a=s()(t,2),c=a[0],i=a[1],o=u.a.useState(!1),E=s()(o,2),w=E[0],v=E[1],h=u.a.useState(!1),k=s()(h,2),b=k[0],y=k[1];return u.a.useEffect((function(){r()(l.a.mark((function e(){var t,n,a;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return y(!0),e.prev=1,e.next=4,fetch("/get-scripts");case 4:return t=e.sent,e.next=7,t.json();case 7:n=e.sent,a=n.scripts,i(a),e.next=15;break;case 12:e.prev=12,e.t0=e.catch(1),alert(e.t0.message);case 15:v(!0),y(!1);case 17:case"end":return e.stop()}}),e,null,[[1,12]])})))()}),[]),u.a.createElement(u.a.Fragment,null,w?u.a.createElement(u.a.Fragment,null,u.a.createElement(f.a,{noDataMsg:"No scripts",selectable:!1,title:m.a.PAGE_TITLE,data:c,renderHeaderActions:"view"===e?null:n(346).default,renderRowAction:n(347).default,displayFields:[{key:"position",label:"Position",render:function(e){return e.rowIndex+1}},{key:"title",label:"Title"},{key:"description",label:"Description"}],onSortData:"view"===e?void 0:function(e){i(e),r()(l.a.mark((function t(){var n;return l.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,fetch("/update-scripts",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({scripts:e.map((function(e){return{id:e.id,position:e.position}}))})});case 3:return n=t.sent,t.next=6,n.json();case 6:t.next=10;break;case 8:t.prev=8,t.t0=t.catch(0);case 10:case"end":return t.stop()}}),t,null,[[0,8]])})))()}})):null,b&&u.a.createElement(d.a,null))}}}]);