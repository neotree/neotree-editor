(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{264:function(e,t,n){"use strict";var a=n(10),r=n.n(a),l=n(9),i=n.n(l),o=n(20),c=n.n(o),s=n(0),u=n.n(s),m=n(2),d=n.n(m),p=n(376),f=n(343),b=n(344),g=n(250),E=n(346),h=n(347),v=n(137),y=n(315),w=n(304),O=n(12),x=n.n(O),j=n(5),k=n.n(j),S=n(277),C=n.n(S),P=n(345),I=n(265),D=n(258),T=n.n(D),F=n(248),N=n(281),R=n.n(N),W=n(374),A=Object(I.c)((function(){return u.a.createElement("div",null,u.a.createElement(W.a,{title:"Drag to reposition"},u.a.createElement(F.a,{style:{cursor:"move"}},u.a.createElement(R.a,null))))})),z=Object(I.b)((function(e){var t=e.row,n=e.rowIndex,a=e.selectable,r=e.classes,l=e.selected,o=e.setSelected,c=e.displayFields,s=e.action,m=e.sortable;return u.a.createElement(f.a,{className:k()(r.dataItemRow,{selected:l.map((function(e){return e.rowIndex})).includes(n)})},a&&u.a.createElement(b.a,{padding:"none"},u.a.createElement(y.a,{checked:l.map((function(e){return e.rowIndex})).includes(n),onChange:function(){return o((function(e){return e.map((function(e){return e.rowIndex})).includes(n)?e.filter((function(e){return e.rowIndex!==n})):[].concat(T()(e),[{row:t,rowIndex:n}])}))}})),m&&u.a.createElement(b.a,{padding:"none"},u.a.createElement(A,null)),c.map((function(e,a){var r=e.render?e.render({row:t,rowIndex:n,column:e.key,columnIndex:a}):t[e.key];return u.a.createElement(b.a,i()({},e.cellProps,{key:"".concat(n).concat(e.key).concat(a)}),r)})),s?u.a.createElement(b.a,{align:"right",padding:"none"},s):null)})),M=Object(I.a)((function(e){var t=e.rows,n=e.sortable,a=e.classes,r=e.selected,l=e.selectable,i=e.setSelected,o=e.displayFields,c=e.renderRowAction,s=e.filter;return u.a.createElement(P.a,null,t.map((function(e,t){var m=t;return s&&!s(e)?null:u.a.createElement(z,{key:"".concat(m).concat(t),row:e,sortable:n,index:t,rowIndex:t,classes:a,selectable:l,action:c?c(e,t)||u.a.createElement(u.a.Fragment,null):null,displayFields:o,selected:r,setSelected:i})})))}));function _(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function q(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?_(Object(n),!0).forEach((function(t){r()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):_(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var H=x()((function(e){return{table:{minWidth:800},headerWrap:{position:"relative",height:60},header:{position:"absolute",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",boxSizing:"border-box",padding:e.spacing()},dataItemRow:{"&:hover, &.selected":{backgroundColor:e.palette.action.hover}}}}));function $(e){var t=e.noDataMsg,n=e.title,a=e.selectable,r=e.renderRowAction,l=e.data,o=e.onSortData,s=e.displayFields,m=e.renderHeaderActions,d=e.filter;a=!1!==a;var O=H(),x=u.a.useState([]),j=c()(x,2),S=j[0],P=j[1],I=u.a.useState(l),D=c()(I,2),T=D[0],F=D[1];return u.a.useEffect((function(){JSON.stringify(T)!==JSON.stringify(l)&&F(l)}),[l]),u.a.createElement(u.a.Fragment,null,u.a.createElement(g.a,{square:!0,elevation:0},u.a.createElement("div",{className:k()(O.headerWrap)},u.a.createElement("div",{className:k()(O.header)},u.a.createElement(v.a,{variant:"h6"},n),u.a.createElement("div",{style:{marginLeft:"auto"}}),m&&m({selected:S}))),u.a.createElement(w.a,null),T.length?u.a.createElement(p.a,{component:g.a},u.a.createElement(E.a,{className:k()(O.table)},u.a.createElement(h.a,null,u.a.createElement(f.a,null,a&&u.a.createElement(b.a,{padding:"none"},u.a.createElement(y.a,{indeterminate:S.length>0&&S.length<T.length,checked:T.length>0&&S.length===T.length,onChange:function(){return P((function(e){return e.length<T.length?T.map((function(e,t){return{row:e,rowIndex:t}})):[]}))}})),!!o&&u.a.createElement(b.a,null),s.map((function(e,t){return u.a.createElement(b.a,i()({},e.cellProps,{key:"".concat(e.key).concat(t)}),u.a.createElement("b",null,e.label))})),r?u.a.createElement(b.a,{align:"right"},u.a.createElement("b",null,"Action")):null)),u.a.createElement(M,{rows:T,filter:d,selectable:a,renderRowAction:r,classes:O,displayFields:s,selected:S,setSelected:P,useDragHandle:!0,sortable:!!o,onSortEnd:function(e){var t=e.oldIndex,n=e.newIndex,a=C()(T,{$splice:[[t,1],[n,0,T[t]]]}).map((function(e,t){return q(q({},e),{},{position:t+1})}));F(a),o(a)}}))):u.a.createElement("div",{style:{textAlign:"center",padding:25}},u.a.createElement(v.a,{color:"textSecondary"},t||"No data"))))}$.propTypes={noDataMsg:d.a.string,selectable:d.a.bool,renderRowAction:d.a.func,title:d.a.string.isRequired,displayFields:d.a.array.isRequired,renderHeaderActions:d.a.func,onSortData:d.a.func,data:d.a.array.isRequired,filter:d.a.func};t.a=$},266:function(e,t,n){"use strict";var a=n(32),r=n(142);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var l=r(n(0)),i=(0,a(n(143)).default)(l.createElement("path",{d:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"}),"Delete");t.default=i},288:function(e,t,n){"use strict";t.a={PAGE_TITLE:"Scripts"}},289:function(e,t,n){"use strict";n.d(t,"a",(function(){return p}));var a=n(0),r=n.n(a),l=n(2),i=n.n(l),o=n(326),c=n(248),s=n(137),u=n(309),m=n.n(u),d=n(15);function p(e){var t=e.backLink,n=e.title,a=Object(d.g)();return r.a.createElement(r.a.Fragment,null,r.a.createElement(o.a,{container:!0,alignItems:"center",spacing:1},r.a.createElement(o.a,{item:!0,xs:1,sm:1},r.a.createElement(c.a,{onClick:function(){return t?a.push(t):a.goBack()}},r.a.createElement(m.a,null))),r.a.createElement(o.a,{item:!0,xs:11,sm:11},r.a.createElement(s.a,{variant:"h5"},n))))}p.propTypes={title:i.a.node,backLink:i.a.string}},291:function(e,t,n){"use strict";n.d(t,"b",(function(){return y}));var a=n(9),r=n.n(a),l=n(258),i=n.n(l),o=n(20),c=n.n(o),s=n(11),u=n.n(s),m=n(0),d=n.n(m),p=n(2),f=n.n(p),b=n(5),g=n.n(b),E=n(12),h=n.n(E),v=n(219);function y(e){return new Promise((function(t,n){var a=new FormData;a.append("file",e,e.filename),fetch("/upload-file",{method:"POST",body:a}).then((function(e){return e.json()})).then((function(e){var a=e.file,r=e.error,l=e.errors;if(r=(r?[r]:l||[]).join("\n"))return n(r);t({type:a.content_type,size:a.size,filename:a.filename,fileId:a.id,data:"".concat(window.location.origin,"/file/").concat(a.id)})})).catch(n)}))}var w=["onUploadSuccess","onUploadComplete","children","className"],O=h()((function(){return{root:{position:"relative"},input:{position:"absolute",top:0,left:0,bottom:0,right:0,opacity:0}}})),x=d.a.forwardRef((function(e,t){var n=e.onUploadSuccess,a=e.onUploadComplete,l=e.children,o=e.className,s=u()(e,w),m=d.a.useState(!1),p=c()(m,2),f=p[0],b=p[1],E=d.a.useRef(null);d.a.useImperativeHandle(t,(function(){return{input:E,uploading:f}}));var h=O();return d.a.createElement(d.a.Fragment,null,d.a.createElement("div",{className:g()(o,h.root)},f?d.a.createElement(v.a,{size:15}):l,d.a.createElement("input",r()({},s,{type:"file",ref:E,value:"",className:g()(h.input),onChange:function(e){b(!0);var t=i()(e.target.files),r=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];b(!1),n&&n(t),a&&a(t)};Promise.all(t.map((function(e){return new Promise((function(t){y(e).then((function(e){return t(e)})).catch((function(e){return t({error:e})}))}))}))).then((function(e){return r(null,e)})).catch(r)}}))))}));x.propTypes={children:f.a.node,onUploadSuccess:f.a.func,onUploadComplete:f.a.func};t.a=x},293:function(e,t,n){"use strict";n.d(t,"a",(function(){return a})),n.d(t,"b",(function(){return r})),n.d(t,"c",(function(){return l}));var a=[{name:"date",label:"Date"},{name:"datetime",label:"Date + Time"},{name:"dropdown",label:"Dropdown"},{name:"number",label:"Number"},{name:"text",label:"Text"},{name:"time",label:"Time"},{name:"period",label:"Time period"}],r=[{name:"diagnosis",label:"Diagnosis"},{name:"checklist",label:"Checklist"},{name:"form",label:"Form"},{name:"management",label:"Management"},{name:"multi_select",label:"Multiple choice list"},{name:"single_select",label:"Single choice list"},{name:"progress",label:"Progress"},{name:"timer",label:"Timer"},{name:"yesno",label:"Yes/No"},{name:"zw_edliz_summary_table",label:"EDLIZ summary table (ZW)"},{name:"mwi_edliz_summary_table",label:"EDLIZ summary table (MWI)"}],l=[{name:"risk",label:"Risk factor"},{name:"sign",label:"Sign/Symptom"}]},294:function(e,t,n){"use strict";var a=n(10),r=n.n(a),l=n(0),i=n.n(l),o=n(387),c=n(307),s=n(263),u=n.n(s),m=n(266),d=n.n(m),p=n(137),f=n(326),b=n(291);function g(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function E(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?g(Object(n),!0).forEach((function(t){r()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):g(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}t.a=function(e){var t=e.labels,n=e.value,a=e.onChange,r=e.noTitle;n=E({text:"",title:"",image:null},n),t=E({text:"Text",title:"Title",image:"Image"},t);var l=function(e){return a(E(E({},n),e))};return i.a.createElement(i.a.Fragment,null,!r&&i.a.createElement(i.a.Fragment,null,i.a.createElement("div",null,i.a.createElement(o.a,{fullWidth:!0,value:n.title||"",label:t.title,onChange:function(e){return l({title:e.target.value})}})),i.a.createElement("br",null)),i.a.createElement(f.a,{container:!0,spacing:1,alignItems:"flex-end"},i.a.createElement(f.a,{item:!0,xs:10,sm:10},i.a.createElement(o.a,{fullWidth:!0,rows:5,multiline:!0,value:n.text||"",label:t.text,onChange:function(e){return l({text:e.target.value})}})),i.a.createElement(f.a,{item:!0,xs:2,sm:2},i.a.createElement("div",{style:{textAlign:"center",minHeight:100,display:"flex",alignItems:"center",justifyContent:"center"}},n.image&&n.image.data?i.a.createElement("img",{role:"presentation",src:n.image.data,style:{width:100,height:"auto"}}):i.a.createElement("div",{stype:{padding:20}},i.a.createElement(p.a,{color:"textSecondary",variant:"caption"},"No image"))),i.a.createElement("br",null),i.a.createElement(f.a,{container:!0},i.a.createElement(f.a,{item:!0,xs:6,sm:6,style:{textAlign:"center"}},i.a.createElement(b.a,{accept:"image/*",onUploadComplete:function(e){var t=e[0];if(t&&t.error)return alert(t.error.message||t.error);a({image:t})}},i.a.createElement(c.a,{size:"small",color:"secondary"},i.a.createElement(u.a,{fontSize:"small"})))),i.a.createElement(f.a,{item:!0,xs:6,sm:6,style:{textAlign:"center"}},i.a.createElement(c.a,{size:"small",disabled:!n.image,onClick:function(){return l({image:null})}},i.a.createElement(d.a,{fontSize:"small"})))))),i.a.createElement("br",null),i.a.createElement("br",null))}},307:function(e,t,n){"use strict";var a=n(3),r=n(1),l=n(0),i=n(4),o=n(6),c=n(94),s=n(8),u=l.forwardRef((function(e,t){var n=e.children,o=e.classes,u=e.className,m=e.color,d=void 0===m?"default":m,p=e.component,f=void 0===p?"button":p,b=e.disabled,g=void 0!==b&&b,E=e.disableFocusRipple,h=void 0!==E&&E,v=e.focusVisibleClassName,y=e.size,w=void 0===y?"large":y,O=e.variant,x=void 0===O?"circular":O,j=Object(a.a)(e,["children","classes","className","color","component","disabled","disableFocusRipple","focusVisibleClassName","size","variant"]);return l.createElement(c.a,Object(r.a)({className:Object(i.a)(o.root,u,"large"!==w&&o["size".concat(Object(s.a)(w))],g&&o.disabled,"extended"===x&&o.extended,{primary:o.primary,secondary:o.secondary,inherit:o.colorInherit}[d]),component:f,disabled:g,focusRipple:!h,focusVisibleClassName:Object(i.a)(o.focusVisible,v),ref:t},j),l.createElement("span",{className:o.label},n))}));t.a=Object(o.a)((function(e){return{root:Object(r.a)({},e.typography.button,{boxSizing:"border-box",minHeight:36,transition:e.transitions.create(["background-color","box-shadow","border"],{duration:e.transitions.duration.short}),borderRadius:"50%",padding:0,minWidth:0,width:56,height:56,boxShadow:e.shadows[6],"&:active":{boxShadow:e.shadows[12]},color:e.palette.getContrastText(e.palette.grey[300]),backgroundColor:e.palette.grey[300],"&:hover":{backgroundColor:e.palette.grey.A100,"@media (hover: none)":{backgroundColor:e.palette.grey[300]},"&$disabled":{backgroundColor:e.palette.action.disabledBackground},textDecoration:"none"},"&$focusVisible":{boxShadow:e.shadows[6]},"&$disabled":{color:e.palette.action.disabled,boxShadow:e.shadows[0],backgroundColor:e.palette.action.disabledBackground}}),label:{width:"100%",display:"inherit",alignItems:"inherit",justifyContent:"inherit"},primary:{color:e.palette.primary.contrastText,backgroundColor:e.palette.primary.main,"&:hover":{backgroundColor:e.palette.primary.dark,"@media (hover: none)":{backgroundColor:e.palette.primary.main}}},secondary:{color:e.palette.secondary.contrastText,backgroundColor:e.palette.secondary.main,"&:hover":{backgroundColor:e.palette.secondary.dark,"@media (hover: none)":{backgroundColor:e.palette.secondary.main}}},extended:{borderRadius:24,padding:"0 16px",width:"auto",minHeight:"auto",minWidth:48,height:48,"&$sizeSmall":{width:"auto",padding:"0 8px",borderRadius:17,minWidth:34,height:34},"&$sizeMedium":{width:"auto",padding:"0 16px",borderRadius:20,minWidth:40,height:40}},focusVisible:{},disabled:{},colorInherit:{color:"inherit"},sizeSmall:{width:40,height:40},sizeMedium:{width:48,height:48}}}),{name:"MuiFab"})(u)},311:function(e,t,n){"use strict";n.d(t,"a",(function(){return g}));var a=n(20),r=n.n(a),l=n(0),i=n.n(l),o=n(2),c=n.n(o),s=n(225),u=n(138),m=n(223),d=n(222),p=n(221),f=n(219),b=n(291);function g(e){var t=e.data,n=e.save,a=i.a.useState(!1),l=r()(a,2),o=l[0],c=l[1],g=function(){var e=t.image1,n=t.image2,a=t.image3,r=[];if(e||n||a){var l=function(e,t){return t&&!t.fileId&&r.push({name:e,img:t})};l("image1",e),l("image2",n),l("image3",a)}return r};return i.a.createElement(i.a.Fragment,null,i.a.createElement(s.a,{fullWidth:!0,maxWidth:"sm",open:g().length>0,onClose:function(){}},i.a.createElement(p.a,null,"These images must be saved in the database"),i.a.createElement(d.a,null,g().map((function(e,t){return i.a.createElement("div",{key:t},i.a.createElement("div",{style:{width:"90%",maxWidth:200,margin:"auto",display:"flex",alignItems:"center",justifyContent:"center"}},i.a.createElement("img",{style:{width:"100%",height:"auto"},role:"presentation",src:e.img.data})),i.a.createElement("br",null))}))),i.a.createElement(m.a,null,i.a.createElement(u.a,{onClick:function(){var e=g();c(!0),Promise.all(e.map((function(e){for(var t=e.img,n=t.data,a=atob(n.split(",")[1]),r=n.split(",")[0].split(":")[1].split(";")[0],l=new ArrayBuffer(a.length),i=new Uint8Array(l),o=0;o<a.length;o++)i[o]=a.charCodeAt(o);var c=new Blob([l],{type:r});return Object(b.b)(new File([c],t.filename))}))).catch((function(e){c(!1),alert(e.msg||e.message||JSON.stringify(e))})).then((function(t){var a={};t.forEach((function(t,n){a[e[n].name]=t})),c(!1),n(a)}))}},o?i.a.createElement(f.a,{size:15}):"Save"))))}g.propTypes={data:c.a.object.isRequired,save:c.a.func.isRequired}},312:function(e,t,n){"use strict";t.a={PAGE_TITLE:"Diagnoses"}},392:function(e,t,n){"use strict";n.r(t);var a=n(42),r=n.n(a),l=n(20),i=n.n(l),o=n(29),c=n.n(o),s=n(0),u=n.n(s),m=n(2),d=n.n(m),p=n(15),f=n(312),b=n(288),g=n(57),E=n(26),h=n(10),v=n.n(h),y=n(327),w=n(328),O=n(379),x=n(138),j=n(137),k=n(387),S=n(294),C=n(289),P=n(311),I=n(258),D=n.n(I),T=n(264),F=n(248),N=n(263),R=n.n(N),W=n(9),A=n.n(W),z=n(11),M=n.n(z),_=n(225),q=n(221),H=n(222),$=n(223),L=n(325),V=n(399),U=n(393),J=n(293),B=["children","onClick","data","onSave"];function G(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function Z(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?G(Object(n),!0).forEach((function(t){v()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):G(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var K=u.a.forwardRef((function(e,t){var n=e.children,a=e.onClick,r=e.data,l=e.onSave,o=M()(e,B),c=Object(E.d)().state.viewMode,s=u.a.useState(!1),m=i()(s,2),d=m[0],p=m[1],f=Z({name:null,expression:null,type:J.c[0].name||"",weight:null},r),b=u.a.useState(f),g=i()(b,2),h=g[0],v=g[1],y=function(e){return v((function(t){return Z(Z({},t),"function"==typeof e?e(t):e)}))};return u.a.useEffect((function(){y(f)}),[d]),u.a.createElement(u.a.Fragment,null,u.a.createElement("div",A()({},o,{ref:t,onClick:function(e){p(!0),a&&a(e)}}),n),u.a.createElement(_.a,{open:d,maxWidth:"sm",fullWidth:!0,onClose:function(){return p(!1)}},u.a.createElement(q.a,null,r?"Edit":"Add"," symptom"),u.a.createElement(H.a,null,u.a.createElement(V.a,{name:"type",value:h.type,onChange:function(e){return y({type:e.target.value})}},J.c.map((function(e){return u.a.createElement(L.a,{key:e.name,value:e.name,control:u.a.createElement(U.a,null),label:e.label})}))),u.a.createElement("br",null),u.a.createElement("br",null),u.a.createElement("div",null,u.a.createElement(k.a,{fullWidth:!0,required:!0,error:!h.name,value:h.name||"",label:"Name",onChange:function(e){return y({name:e.target.value})}})),u.a.createElement("br",null),u.a.createElement("br",null),u.a.createElement("div",null,u.a.createElement(k.a,{fullWidth:!0,value:h.weight||"",label:"Weight",onChange:function(e){return y({weight:e.target.value})}}),u.a.createElement(j.a,{variant:"caption",color:"textSecondary"},"Must be in the range: 0.0 - 1.0 (",u.a.createElement("b",null,"default 1.0"),")")),u.a.createElement("br",null),u.a.createElement("br",null),u.a.createElement("div",null,u.a.createElement(k.a,{fullWidth:!0,value:h.expression||"",label:"Sign/Risk expression",onChange:function(e){return y({expression:e.target.value})}}),u.a.createElement(j.a,{variant:"caption",color:"textSecondary"},"Example: ",u.a.createElement("b",null,"($key = true and $key2 = false) or $key3 = 'HD'")))),u.a.createElement($.a,null,u.a.createElement(x.a,{onClick:function(){return p(!1)}},"Cancel"),u.a.createElement(x.a,{variant:"contained",color:"primary",disabled:"view"===c,onClick:function(){l(h),p(!1)}},"Save"))))}));K.propTypes={onClick:d.a.func,form:d.a.object.isRequired,children:d.a.node,data:d.a.object,onSave:d.a.func.isRequired};var Y=K,Q=n(267),X=n.n(Q),ee=n(359),te=n(253);function ne(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function ae(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?ne(Object(n),!0).forEach((function(t){v()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):ne(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function re(e){var t=e.row,n=e.rowIndex,a=e.form,r=e.setForm,l=Object(E.d)().state.viewMode,o=u.a.useState(null),c=i()(o,2),s=c[0],m=c[1],d=function(){return m(null)};return u.a.createElement(u.a.Fragment,null,u.a.createElement(F.a,{onClick:function(e){return m(e.currentTarget)}},u.a.createElement(X.a,null)),u.a.createElement(ee.a,{anchorEl:s,keepMounted:!0,open:Boolean(s),onClose:d},u.a.createElement(te.a,{onClick:d,component:Y,form:a,data:t,onSave:function(e){return r({symptoms:a.symptoms.map((function(t,a){return n===a?ae(ae({},t),e):t}))})}},"view"===l?"View":"Edit"),"view"===l?null:u.a.createElement(te.a,{onClick:function(e){r({symptoms:a.symptoms.filter((function(e,t){return t!==n}))}),d()}},u.a.createElement(j.a,{color:"error"},"Delete"))))}re.propTypes={rowIndex:d.a.number,row:d.a.object,form:d.a.object,setForm:d.a.func.isRequired};var le=re;function ie(e){var t=e.form,n=e.setForm;return u.a.createElement(u.a.Fragment,null,u.a.createElement(T.a,{selectable:!1,noDataMsg:"No signs/risks",title:"Signs/Risks",data:t.symptoms,renderHeaderActions:function(){return u.a.createElement(Y,{form:t,onSave:function(e){return n({symptoms:[].concat(D()(t.symptoms),[e])})}},u.a.createElement(F.a,null,u.a.createElement(R.a,null)))},renderRowAction:function(e,a){return u.a.createElement(le,{row:e,form:t,rowIndex:a,setForm:n})},displayFields:[{key:"type",label:"Type"},{key:"name",label:"Name"}],onSortData:function(e){n({symptoms:e})}}))}ie.propTypes={form:d.a.object,setForm:d.a.func};var oe=ie;function ce(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function se(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?ce(Object(n),!0).forEach((function(t){v()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):ce(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function ue(e){var t=e.diagnosis,n=e.script,a=Object(E.d)().state.viewMode,l=Object(p.g)(),o=Object(p.h)().scriptId,s=u.a.useState(se({description:null,expression:null,expressionMeaning:null,image1:null,image2:null,image3:null,name:null,text1:null,text2:null,text3:null,symptoms:[],scriptId:o},t)),m=i()(s,2),d=m[0],f=m[1],b=function(e){return f((function(t){return se(se({},t),"function"==typeof e?e(t):e)}))},h=u.a.useState(!1),v=i()(h,2),I=v[0],D=v[1],T=u.a.useCallback((function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=e.redirectOnSuccess,a=e.form;r()(c.a.mark((function e(){var r;return c.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return D(!0),e.prev=1,e.next=4,fetch(t?"/update-diagnosis":"/create-diagnosis",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify(se(se({},d),a))});case 4:return r=e.sent,e.next=7,r.json();case 7:if(!(r=e.sent).errors||!r.errors.length){e.next=10;break}return e.abrupt("return",alert(JSON.stringify(r.errors)));case 10:!1!==n&&l.push("/scripts/".concat(o,"/diagnoses")),e.next=16;break;case 13:e.prev=13,e.t0=e.catch(1),alert(e.t0.message);case 16:D(!1);case 17:case"end":return e.stop()}}),e,null,[[1,13]])})))()}));return u.a.createElement(u.a.Fragment,null,u.a.createElement(P.a,{data:d,save:function(e){var t=se(se({},d),e);b(t),T({redirectOnSuccess:!1,form:t})}}),u.a.createElement(y.a,null,u.a.createElement(w.a,null,u.a.createElement(C.a,{backLink:t?"/scripts/".concat(t.scriptId,"/diagnoses"):null,title:"".concat(t?"Edit":"Add"," diagnosis")}),u.a.createElement("br",null),u.a.createElement("br",null),u.a.createElement("div",null,u.a.createElement(k.a,{fullWidth:!0,required:!0,error:!d.name,value:d.name||"",label:"Name",onChange:function(e){return b({name:e.target.value})}})),u.a.createElement("br",null),u.a.createElement("br",null),u.a.createElement("div",null,u.a.createElement(k.a,{fullWidth:!0,required:!0,error:!d.key,value:d.key||"",label:"Key",onChange:function(e){return b({key:e.target.value})}})),u.a.createElement("br",null),u.a.createElement("br",null),u.a.createElement("div",null,u.a.createElement(k.a,{fullWidth:!0,value:d.description||"",label:"Description",onChange:function(e){return b({description:e.target.value})}})),u.a.createElement("br",null),u.a.createElement("br",null),u.a.createElement("div",null,u.a.createElement(k.a,{fullWidth:!0,value:d.expression||"",label:"Diagnosis expression (e.g. $Temp > 37 or $Gestation < 20)",onChange:function(e){return b({expression:e.target.value})}})),u.a.createElement("br",null),u.a.createElement("br",null),u.a.createElement("div",null,u.a.createElement(k.a,{fullWidth:!0,multiline:!0,rows:3,value:d.expressionMeaning||"",label:"Expression explanation (e.g. Temperature greater than 37 degrees or Gestation period less than 20 weeks)",onChange:function(e){return b({expressionMeaning:e.target.value})}})),u.a.createElement("br",null),u.a.createElement("br",null),u.a.createElement(S.a,{noTitle:!0,labels:{text:"Text 1",image:"Image 1"},value:{text:d.text1,image:d.image1},onChange:function(e){var t=e.text,n=e.image;return b({text1:t,image1:n})}}),u.a.createElement("br",null),u.a.createElement("br",null),u.a.createElement(S.a,{noTitle:!0,labels:{text:"Text 2",image:"Image 2"},value:{text:d.text2,image:d.image2},onChange:function(e){var t=e.text,n=e.image;return b({text2:t,image2:n})}}),u.a.createElement("br",null),u.a.createElement("br",null),u.a.createElement(S.a,{noTitle:!0,labels:{text:"Text 3",image:"Image 3"},value:{text:d.text3,image:d.image3},onChange:function(e){var t=e.text,n=e.image;return b({text3:t,image3:n})}}),u.a.createElement("br",null),u.a.createElement("br",null)),u.a.createElement(O.a,{style:{justifyContent:"flex-end"}},"view"===a&&u.a.createElement(j.a,{color:"error",variant:"caption"},"Can't save because you're in view mode"),u.a.createElement(x.a,{color:"primary",onClick:function(){return T()},disabled:"view"===a||!(d.name&&!I)},"Save"))),u.a.createElement("br",null),u.a.createElement("br",null),u.a.createElement(oe,{form:d,setForm:b,diagnosis:t,script:n}),I&&u.a.createElement(g.a,{transparent:!0}))}ue.propTypes={diagnosis:d.a.object,script:d.a.object};var me=ue;function de(){var e=Object(p.h)(),t=e.scriptId,n=e.diagnosisId,a=u.a.useState(null),l=i()(a,2),o=l[0],s=l[1],m=u.a.useState(null),d=i()(m,2),h=d[0],v=d[1],y=u.a.useState(!1),w=i()(y,2),O=w[0],x=w[1];u.a.useEffect((function(){r()(c.a.mark((function e(){var a,r,l,i,o,u;return c.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return x(!0),e.prev=1,e.next=4,fetch("/get-script?scriptId=".concat(t));case 4:return a=e.sent,e.next=7,a.json();case 7:r=e.sent,l=r.script,v(l),e.next=14;break;case 12:e.prev=12,e.t0=e.catch(1);case 14:if("new"===n){e.next=29;break}return e.prev=15,e.next=18,fetch("/get-diagnosis?id=".concat(n));case 18:return i=e.sent,e.next=21,i.json();case 21:o=e.sent,u=o.diagnosis,s(u),e.next=29;break;case 26:e.prev=26,e.t1=e.catch(15),alert(e.t1.message);case 29:x(!1);case 30:case"end":return e.stop()}}),e,null,[[1,12],[15,26]])})))()}),[]);var j=h?[b.a.PAGE_TITLE,h.title,f.a.PAGE_TITLE,o?o.title:O?"":"New diagnosis"].filter((function(e){return e})):[];return Object(E.b)(j.join(" > ")),O?u.a.createElement(g.a,{transparent:!0}):u.a.createElement(u.a.Fragment,null,u.a.createElement(me,{script:h,diagnosis:o}))}de.propTypes={script:d.a.object};t.default=de}}]);