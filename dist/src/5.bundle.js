(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{124:function(e,t,n){"use strict";n.d(t,"a",function(){return w});var a=n(10),r=n.n(a),i=n(16),c=n.n(i),l=n(19),o=n.n(l),s=n(20),u=n.n(s),d=n(21),p=n.n(d),m=n(22),f=n.n(m),h=n(25),E=n.n(h),S=n(23),g=n.n(S),v=n(24),y=n.n(v),C=n(0),b=n.n(C),T=n(2),_=n.n(T),D=n(34),I=n.n(D),k=n(120),N=n(123),w=function(e){function t(){var e,n;o()(this,t);for(var a=arguments.length,r=new Array(a),i=0;i<a;i++)r[i]=arguments[i];return n=p()(this,(e=f()(t)).call.apply(e,[this].concat(r))),y()(E()(n),"handleLeftNavClick",function(){n.props.onLeftNavItemClicked&&n.props.onLeftNavItemClicked()}),n}return g()(t,e),u()(t,[{key:"render",value:function(){var e=this.props,t=e.children,n=e.className,a=e.hideSpacer,i=e.leftNavIcon,l=(e.onLeftNavItemClicked,e.title),o=(e.transparent,c()(e,["children","className","hideSpacer","leftNavIcon","onLeftNavItemClicked","title","transparent"])),s=I()(n,"mdl-toolbar__header","mdl-layout__header","mdl-layout__header--transparent"),u=I()("mdl-toolbar__header-row",{"mdl-toolbar__header-row-with-left-icon":i}),d=I()("mdl-toolbar__left-nav"),p=I()("mdl-toolbar__right-nav");return b.a.createElement("header",r()({className:s},o),i?b.a.createElement("div",{className:I()(d,"ui__cursor_pointer"),style:{fontSize:"24px"},onClick:this.handleLeftNavClick},b.a.createElement(N.b,null)):b.a.createElement("div",{style:{width:"24px"}}),b.a.createElement(k.HeaderRow,{className:u,title:l||"",hideSpacer:a},t?b.a.createElement(k.Navigation,{className:p},t):null))}}]),t}(C.Component);w.propTypes={className:_.a.string,title:_.a.node,leftNavIcon:_.a.string,onLeftNavItemClicked:_.a.func,hideSpacer:_.a.bool}},128:function(e,t,n){"use strict";n.d(t,"a",function(){return v});var a=n(10),r=n.n(a),i=n(16),c=n.n(i),l=n(19),o=n.n(l),s=n(20),u=n.n(s),d=n(21),p=n.n(d),m=n(22),f=n.n(m),h=n(23),E=n.n(h),S=n(0),g=n.n(S),v=function(e){function t(){return o()(this,t),p()(this,f()(t).apply(this,arguments))}return E()(t,e),u()(t,[{key:"render",value:function(){var e=this.props,t=e.children,n=c()(e,["children"]);return g.a.createElement("div",r()({style:{display:"flex",flexDirection:"row",justifyContent:"flex-end",marginTop:"16px",marginBottom:"8px"}},n),t)}}]),t}(S.Component)},129:function(e,t,n){"use strict";n.d(t,"c",function(){return a}),n.d(t,"b",function(){return r}),n.d(t,"d",function(){return i}),n.d(t,"e",function(){return c}),n.d(t,"f",function(){return l}),n.d(t,"a",function(){return o});var a={COMPUTE:"compute",DATE_NOW:"date_now",DATE_NOON:"date_noon",DATE_MIDNIGHT:"date_midnight",EMPTY:"",UID:"uid"},r={BOOLEAN:"boolean",DATETIME:"datetime",DATE:"date",ID:"id",NUMBER:"number",PERIOD:"period",SET_ID:"set<id>",STRING:"string",TIME:"time",VOID:"void"},i={DATE:"date",DATETIME:"datetime",DROPDOWN:"dropdown",NUMBER:"number",PERIOD:"period",TEXT:"text",TIME:"time"},c={CHECKLIST:"checklist",FORM:"form",LIST:"list",MANAGEMENT:"management",MULTI_SELECT:"multi_select",PROGRESS:"progress",SINGLE_SELECT:"single_select",TIMER:"timer",YESNO:"yesno"},l={SIGN:"sign",RISK:"risk"},o=c.CHECKLIST},132:function(e,t,n){var a=n(143),r=n(144),i=n(145);e.exports=function(e,t){return a(e)||r(e,t)||i()}},135:function(e,t,n){"use strict";var a=n(0),r=function(){return Object(a.useReducer)(function(e){return!e},!1)[1]};t.a=function(e,t){for(var n=arguments.length,i=new Array(n>2?n-2:0),c=2;c<n;c++)i[c-2]=arguments[c];var l=[],o=t,s=function(t){o=e(o,t),l.forEach(function(e){return e()})},u=function(){var e=r();return Object(a.useEffect)(function(){var t=function(){return e()};l.push(t),t();return function(){var e=l.indexOf(t);l.splice(e,1)}},[]),[o,s].concat(i)};return u}},143:function(e,t){e.exports=function(e){if(Array.isArray(e))return e}},144:function(e,t){e.exports=function(e,t){var n=[],a=!0,r=!1,i=void 0;try{for(var c,l=e[Symbol.iterator]();!(a=(c=l.next()).done)&&(n.push(c.value),!t||n.length!==t);a=!0);}catch(e){r=!0,i=e}finally{try{a||null==l.return||l.return()}finally{if(r)throw i}}return n}},145:function(e,t){e.exports=function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}},161:function(e,t,n){"use strict";var a=n(10),r=n.n(a),i=n(16),c=n.n(i),l=n(19),o=n.n(l),s=n(20),u=n.n(s),d=n(21),p=n.n(d),m=n(22),f=n.n(m),h=n(23),E=n.n(h),S=n(24),g=n.n(S),v=n(0),y=n.n(v),C=n(2),b=n.n(C),T=n(34),_=n.n(T),D=function(e){function t(){return o()(this,t),p()(this,f()(t).apply(this,arguments))}return E()(t,e),u()(t,[{key:"render",value:function(){var e=this.props,t=e.className,n=(e.name,e.numeric),a=e.children,i=(e.cellFormatter,c()(e,["className","name","numeric","children","cellFormatter"])),l=_()({"mdl-data-table__cell--non-numeric":!n},t);return y.a.createElement("th",r()({className:l},i),a)}}]),t}(v.Component);g()(D,"propTypes",{cellFormatter:b.a.func,className:b.a.string,name:b.a.string.isRequired,numeric:b.a.bool});var I=n(43),k=n.n(I),N=n(25),w=n.n(N),x=n(138),O=n.n(x),j=n(123),A=n(199),R=n(200),M=n.n(R),L=[2,3,4,6,8,16,24].map(function(e){return"mdl-shadow--".concat(e,"dp")}),U=n(120),P=function(e){function t(){var e,n;o()(this,t);for(var a=arguments.length,r=new Array(a),i=0;i<a;i++)r[i]=arguments[i];return n=p()(this,(e=f()(t)).call.apply(e,[this].concat(r))),g()(w()(n),"renderCell",function(e,t,n){var a=e.numeric?"":"mdl-data-table__cell--non-numeric";return y.a.createElement("td",{key:e.name,className:a},e.cellFormatter?e.cellFormatter(t[e.name],t,n):t[e.name])}),g()(w()(n),"sortAdapterFn",function(e){var t=e.oldIndex,a=e.newIndex,r=n.props.onSort;r&&r(t,a)}),n}return E()(t,e),u()(t,[{key:"render",value:function(){var e=this,t=this.props,n=t.className,a=t.shadow,i=t.children,l=(t.onSort,t.rowKeyColumn,t.rows),o=t.selected,s=t.onSelect,u=c()(t,["className","shadow","children","onSort","rowKeyColumn","rows","selected","onSelect"]),d=o||[],p=void 0!==a,m=O()(a||0,0,L.length-1),f=_()("mdl-data-table",g()({},L[m],p),n),h=i?y.a.Children.toArray(i):null,E=Object(A.SortableHandle)(function(){return y.a.createElement(j.h,{style:{fontSize:"24px"},className:"ui__cursor_pointer"})}),S=Object(A.SortableElement)(function(t){var n=t.row,a=t.index;return y.a.createElement("tr",{className:n.className},y.a.createElement("td",null,y.a.createElement(U.Checkbox,{value:n.id,checked:d.includes(n.id),onChange:function(e){var t=e.target.value;s(d.includes(t)?d.filter(function(e){return e!==t}):[].concat(k()(d),[t]))}})),y.a.createElement("td",null,y.a.createElement(E,null)),h.map(function(t){return e.renderCell(t.props,n,a)}))}),v=Object(A.SortableContainer)(function(e){var t=e.rows;return y.a.createElement("tbody",null,t.map(function(e,t){return y.a.createElement(S,{key:M.a.generate(),index:t,row:e})}))});return y.a.createElement("table",r()({className:f},u),y.a.createElement("thead",null,y.a.createElement("tr",null,y.a.createElement("th",null," "),y.a.createElement("th",null," "),h)),y.a.createElement(v,{rows:l,onSortEnd:this.sortAdapterFn,useDragHandle:!0}))}}]),t}(v.Component);g()(P,"propTypes",{className:b.a.string,onSort:b.a.func,rowKeyColumn:b.a.string,rows:b.a.arrayOf(b.a.object).isRequired,shadow:b.a.number}),n.d(t,"b",function(){return D}),n.d(t,"a",function(){return P})},183:function(e,t,n){"use strict";var a=n(3),r=n.n(a),i=n(135),c={UPDATE:"UPDATE",updateState:function(e){return{type:"UPDATE",partialState:e}}},l={scripts:[]};t.a=Object(i.a)(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:l,t=arguments.length>1?arguments[1]:void 0;if(t.type===c.UPDATE){var n=r()({},e);return r()({},e,{},"function"==typeof t.partialState?t.partialState(n):t.partialState)}return e},l,c)},205:function(e,t){},222:function(e,t){},224:function(e,t){},400:function(e,t,n){"use strict";n.r(t);var a=n(10),r=n.n(a),i=n(132),c=n.n(i),l=n(0),o=n.n(l),s=n(2),u=n.n(s),d=n(12),p=n(3),m=n.n(p),f=n(135),h={UPDATE:"UPDATE",updateState:function(e){return{type:"UPDATE",partialState:e}}},E={diagnoses:[]},S=Object(f.a)(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:E,t=arguments.length>1?arguments[1]:void 0;if(t.type===h.UPDATE){var n=m()({},e);return m()({},e,{},"function"==typeof t.partialState?t.partialState(n):t.partialState)}return e},E,h),g={UPDATE:"UPDATE",updateState:function(e){return{type:"UPDATE",partialState:e}}},v={screens:[]},y=Object(f.a)(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:v,t=arguments.length>1?arguments[1]:void 0;if(t.type===g.UPDATE){var n=m()({},e);return m()({},e,{},"function"==typeof t.partialState?t.partialState(n):t.partialState)}return e},v,g),C=n(183),b=n(52),T=n(42),_=n(19),D=n.n(_),I=n(20),k=n.n(I),N=n(21),w=n.n(N),x=n(22),O=n.n(x),j=n(25),A=n.n(j),R=n(23),M=n.n(R),L=n(24),U=n.n(L),P=n(120),F=n(128),q=n(124),B=n(26),z=n(43),G=n.n(z),H=n(123),K=n(129),W=function(e){var t,n=e.data,a=e.children,r=e.itemsType,i=e.onSuccess,s=Object(l.useState)(!1),u=c()(s,2),d=u[0],p=u[1],f=Object(l.useState)(!1),h=c()(f,2),E=h[0],S=h[1],g=Object(l.useState)(!1),v=c()(g,2),y=v[0],C=v[1],_=Object(l.useState)([]),D=c()(_,2),I=D[0],k=D[1],N=Object(l.useState)(null),w=c()(N,2),x=w[0],O=w[1],j=Object(l.useState)(!1),A=c()(j,2),R=A[0],M=A[1],L=Object(l.useState)(""),U=c()(L,2),F=U[0],q=U[1],B=Object(l.useState)(!1),z=c()(B,2),G=z[0],H=z[1];return Object(l.useEffect)(function(){O(null),d&&!y&&(S(!0),T.a.get("/get-scripts").then(function(e){var t=e.payload,n=t.error,a=t.scripts;if(n)return O(n);k(a),C(!0),S(!1)}).then(function(e){O(e),S(!1)}))},[d]),o.a.createElement(o.a.Fragment,null,o.a.createElement("div",{style:{cursor:"pointer"},onClick:function(){return p(!0)}},a||"Copy"),o.a.createElement(P.Dialog,{open:d,onClose:function(){return p(!1)}},E?o.a.createElement(P.DialogContent,null,o.a.createElement(b.a,{className:"ui__flex ui__justifyContent_center"})):o.a.createElement(o.a.Fragment,null,o.a.createElement(P.DialogContent,null,o.a.createElement("p",null,"Copy to"),o.a.createElement("select",{value:F||"",style:{maxWidth:200,background:"transparent",border:"1px solid #ddd",padding:10,outline:"none !important"},onChange:function(e){return q(e.target.value)}},o.a.createElement("option",{value:""},"Select script"),I.map(function(e,t){return o.a.createElement("option",{key:t,value:e.id},e.data.title)}))),o.a.createElement(P.DialogActions,null,o.a.createElement(P.Button,{accent:!0,disabled:R||!F,onClick:function(){M(!0),O(null),T.a.post("/copy-".concat(r),m()({},n,{script_id:F})).then(function(e){var t=e.error,n=e.payload.items;O(t),M(!1),q(""),i&&i(n,F),H(!0)}).catch(function(e){O(e),M(!1)})}},"Copy"),o.a.createElement(P.Button,{disabled:R,onClick:function(){return p(!1)}},"Cancel"),x?o.a.createElement("span",{style:{color:"#b20008",fontSize:15}},x.msg||x.message||JSON.stringify(x)):null))),o.a.createElement(P.Dialog,{open:G,onClose:function(){return H(!1)}},o.a.createElement(P.DialogContent,null,o.a.createElement("div",{style:{textAlign:"center"}},o.a.createElement("p",null,(t=r).charAt(0).toUpperCase()+t.slice(1)," copied successfully."))),o.a.createElement(P.DialogActions,null,o.a.createElement(P.Button,{accent:!0,onClick:function(){p(!1),H(!1)}},"OK"))))};W.propTypes={children:u.a.node,itemsType:u.a.string.isRequired,data:u.a.object.isRequired};var J=W,Y=n(161),V=function(e){function t(){var e,n;D()(this,t);for(var a=arguments.length,r=new Array(a),i=0;i<a;i++)r[i]=arguments[i];return n=w()(this,(e=O()(t)).call.apply(e,[this].concat(r))),U()(A()(n),"state",{openSelectScreenTypeDialog:!1,screens:[],selected:[],addScreenType:K.a}),U()(A()(n),"handleAddScreenClick",function(){var e=n.props,t=e.updateState,a=e.scriptId,r=e.history,i=n.state.addScreenType;n.setState({addingScreen:!0}),T.a.post("/create-screen",{script_id:a,type:i}).catch(function(e){return n.setState({addScreenError:e,addingScreen:!1})}).then(function(e){var i=e.payload;n.setState({addingScreen:!1}),t({screen:i.screen}),r.push("/dashboard/scripts/".concat(a,"/screens/").concat(i.screen.id)),n.closeSelectScreenTypeDialog()})}),U()(A()(n),"handleDeleteScreenClick",function(e){return function(){var t=n.props,a=t.updateState,r=t.scriptId;n.setState({deletingScreen:!1}),T.a.post("/delete-screen",{id:e,scriptId:r}).catch(function(e){return n.setState({deleteScreenError:e,deletingScreen:!1})}).then(function(){n.setState({deletingScreen:!1}),a(function(t){return{screens:t.screens.filter(function(t){return t.id!==e}).map(function(e,t){return m()({},e,{position:t+1})})}})})}}),U()(A()(n),"handleEditScreenClick",function(e){return function(){return n.props.onEditScreenClick(e)}}),U()(A()(n),"handleInputChange",function(e,t){return n.setState(U()({},e,t.target.value))}),U()(A()(n),"openSelectScreenTypeDialog",function(){return n.setState({openSelectScreenTypeDialog:!0})}),U()(A()(n),"closeSelectScreenTypeDialog",function(){return n.setState({openSelectScreenTypeDialog:!1,addScreenTitle:null,addScreenType:K.a})}),U()(A()(n),"swapScreenItems",function(e,t){var a=n.props,r=a.updateState,i=a.screens,c=Object.assign([],i),l=c[e];c.splice(e,1),c.splice(t,0,l),r({screens:c=c.map(function(e,t){return m()({},e,{position:t+1})})}),n.setState({sortingScreens:!1}),T.a.post("/update-screens",{returnUpdated:!1,screens:c.map(function(e){return{id:e.id,position:e.position}})}).catch(function(e){return n.setState({deleteScriptError:e,sortingScreens:!1})}).then(function(){return n.setState({sortingScreens:!1})})}),U()(A()(n),"handleDuplicateScreen",function(e){var t=n.props.updateState;n.setState({duplicatingScreen:!0}),T.a.post("/duplicate-screen",{id:e}).catch(function(e){return n.setState({duplicateScreenError:e,duplicatingScreen:!1})}).then(function(a){var r=a.payload;n.setState({duplicatingScreen:!1}),t(function(t){var n=G()(t.screens),a=n.map(function(t,n){return t.id===e?n:null}).filter(function(e){return null!==e})[0]||0;return n.splice(a+1,0,r.screen),{screens:n.map(function(e,t){return m()({},e,{position:t+1})})}})})}),n}return M()(t,e),k()(t,[{key:"render",value:function(){var e=this,t=this.props,n=t.screens,a=t.match,r=t.updateState,i=this.state,c=i.addScreenType,l=i.selected,s={screens:{overflow:"unset",width:"100%",minWidth:"700px"},table:{width:"100%"},emptyMessageContainer:{display:"flex",boxSizing:"border-box",alignItems:"center",justifyContent:"center",color:"#757575",fontSize:"16px"}},u=o.a.createElement(P.Dialog,{open:this.state.openSelectScreenTypeDialog,style:{width:"260px"}},o.a.createElement(P.DialogContent,null,o.a.createElement("p",null,"Select screen type:"),o.a.createElement(P.RadioGroup,{container:"div",childContainer:"div",name:"addScreenType",value:c||K.a,onChange:this.handleInputChange.bind(this,"addScreenType")},o.a.createElement(P.Radio,{value:K.e.CHECKLIST,ripple:!0},"Checklist"),o.a.createElement(P.Radio,{value:K.e.FORM,ripple:!0},"Form"),o.a.createElement(P.Radio,{value:K.e.MANAGEMENT,ripple:!0},"Management"),o.a.createElement(P.Radio,{value:K.e.MULTI_SELECT,ripple:!0},"Multiple choice list"),o.a.createElement(P.Radio,{value:K.e.LIST,ripple:!0},"Simple list"),o.a.createElement(P.Radio,{value:K.e.SINGLE_SELECT,ripple:!0},"Single choice list"),o.a.createElement(P.Radio,{value:K.e.PROGRESS,ripple:!0},"Progress"),o.a.createElement(P.Radio,{value:K.e.TIMER,ripple:!0},"Timer"),o.a.createElement(P.Radio,{value:K.e.YESNO,ripple:!0},"Yes/No"))),o.a.createElement(P.DialogActions,null,o.a.createElement(P.Button,{type:"button",onClick:this.handleAddScreenClick,accent:!0},"Create"),o.a.createElement(P.Button,{type:"button",onClick:this.closeSelectScreenTypeDialog},"Cancel")));return o.a.createElement("div",null,o.a.createElement(P.Card,{shadow:0,style:s.screens},o.a.createElement(q.a,{title:"Screens"},l.length>0&&o.a.createElement(J,{itemsType:"screens",data:{ids:n.map(function(e){return l.includes(e.id)?e.id:null}).filter(function(e){return null!==e})},onSuccess:function(e,t){a.params.scriptId===t&&r(function(t){var n=t.screens;return{screens:[].concat(G()(e),G()(n))}})}}),o.a.createElement("div",{onClick:this.openSelectScreenTypeDialog,className:"ui__cursor_pointer"},o.a.createElement(H.a,{style:{fontSize:"24px"}}))),n&&n.length>0?o.a.createElement(Y.a,{style:s.table,rows:n.map(function(e){return m()({},e.data,{id:e.id,position:e.position})}),rowKeyColumn:"position",onSort:this.swapScreenItems,selected:l,onSelect:function(t){return e.setState({selected:t})}},o.a.createElement(Y.b,{name:"position"},"Pos"),o.a.createElement(Y.b,{name:"epicId"},"Epic"),o.a.createElement(Y.b,{name:"storyId"},"Story"),o.a.createElement(Y.b,{name:"refId"},"Ref."),o.a.createElement(Y.b,{name:"title",style:{width:"100%"},cellFormatter:function(e,t){var n=t.title;return n?n.length<=30?n:"".concat(n.substring(0,29),"..."):""}},"Title"),o.a.createElement(Y.b,{name:"id",style:{width:"48px"},cellFormatter:function(t){return o.a.createElement("div",{className:"ui__flex ui__alignItems_center",style:{color:"#999999"}},o.a.createElement("div",{className:"ui__cursor_pointer",onClick:e.handleEditScreenClick(t)},o.a.createElement(H.e,{style:{fontSize:"24px"}}))," ",o.a.createElement("div",{className:"ui__cursor_pointer",onClick:e.handleDeleteScreenClick(t)},o.a.createElement(H.f,{style:{fontSize:"24px"}})))}})):o.a.createElement(P.CardText,null,o.a.createElement("div",{style:s.emptyMessageContainer},o.a.createElement("div",null,"The list of screens is empty")))),u)}}]),t}(l.Component);V.propTypes={screens:u.a.array.isRequired,updateState:u.a.func.isRequired,scriptId:u.a.string.isRequired,onEditScreenClick:u.a.func.isRequired};var X=V,Q=function(e){var t=e.match.params.scriptId,n=Object(l.useState)(!1),a=c()(n,2),i=a[0],s=a[1],u=Object(l.useState)(null),d=c()(u,2),p=(d[0],d[1]),m=y(),f=c()(m,3),h=f[0].screens,E=f[1],S=f[2];return Object(l.useEffect)(function(){s(!0),T.a.get("/get-screens",{script_id:t}).then(function(e){return s(!1),e}).then(function(e){var t=e.payload;s(!1),E(S.updateState({screens:t.screens||[]}))}).catch(function(e){s(!1),p(e)})},[]),o.a.createElement("div",null,!h.length&&i&&o.a.createElement(b.a,{className:"ui__flex ui__justifyContent_center"}),!h.length&&i?null:o.a.createElement(X,r()({},e,{screens:h.sort(function(e,t){return e.position-t.position}),updateState:function(e){return E(S.updateState(e))}})))};Q.propTypes={match:u.a.object};var Z=Object(B.hot)(Object(d.f)(Q)),$=function(e){function t(e){var n;return D()(this,t),n=w()(this,O()(t).call(this,e)),U()(A()(n),"handleAddDiagnosisClick",function(){var e=n.props,t=e.history,a=e.scriptId;t.push("/dashboard/scripts/".concat(a,"/diagnosis/new"))}),U()(A()(n),"handleDeleteDiagnosisClick",function(e){return function(){var t=n.props,a=t.updateState,r=t.scriptId;n.setState({deletingDiagnosis:!0}),T.a.post("/delete-diagnosis",{id:e,scriptId:r}).then(function(){n.setState({deletingDiagnosis:!1}),a(function(t){return{diagnoses:t.diagnoses.filter(function(t){return t.id!==e})}}),n.closeDeleteConfirmDialog()}).catch(function(e){return n.setState({deleteDiagnosisError:e,deletingDiagnosis:!1})})}}),U()(A()(n),"handleEditDiagnosisClick",function(e){return function(){return n.props.onEditDiagnosisClick(e)}}),U()(A()(n),"handleInputChange",function(e,t){return n.setState(m()({},n.state,U()({},e,t.target.value)))}),U()(A()(n),"handleDuplicateDiagnosis",function(e){var t=n.props.updateState;n.setState({duplicatingDiagnosis:!0}),T.a.post("/duplicate-diagnosis",{id:e}).then(function(a){var r=a.payload;n.setState({duplicatingDiagnosis:!1}),t(function(t){var n=G()(t.diagnoses),a=n.map(function(t,n){return t.id===e?n:null}).filter(function(e){return null!==e})[0]||0;return n.splice(a+1,0,r.diagnosis),{diagnoses:n}})}).catch(function(e){return n.setState({duplicateDiagnosisError:e,duplicatingDiagnosis:!1})})}),n.state={selected:[],openDeleteConfirmDialog:!1,scriptIdForAction:null},n}return M()(t,e),k()(t,[{key:"render",value:function(){var e=this,t=this.props,n=t.diagnoses,a=t.match,r=t.updateState,i=this.state.selected,c={diagnosis:{overflow:"unset",width:"100%",minWidth:"700px"},table:{width:"100%"},emptyMessageContainer:{display:"flex",boxSizing:"border-box",alignItems:"center",justifyContent:"center",color:"#757575",fontSize:"16px"}};return o.a.createElement("div",null,o.a.createElement(P.Card,{shadow:0,style:c.diagnosis},o.a.createElement(q.a,{title:"Diagnosis"},i.length>0&&o.a.createElement(J,{itemsType:"diagnoses",data:{ids:n.map(function(e){return i.includes(e.id)?e.id:null}).filter(function(e){return null!==e})},onSuccess:function(e,t){a.params.scriptId===t&&r(function(t){var n=t.diagnoses;return{diagnoses:[].concat(G()(n),G()(e))}})}}),o.a.createElement("div",{onClick:this.handleAddDiagnosisClick,className:"ui__cursor_pointer"},o.a.createElement(H.a,{style:{fontSize:"24px"}}))),n.length>0?o.a.createElement(P.DataTable,{selectable:!0,onSelectionChanged:function(t){return e.setState({selected:t.map(function(e){return n.filter(function(t,n){return n===e})[0]}).filter(function(e){return e}).map(function(e){return e.id})})},style:{width:"780px"},shadow:0,rows:n.map(function(e){return m()({id:e.id},e.data)})},o.a.createElement(P.TableHeader,{name:"name"},"Name"),o.a.createElement(P.TableHeader,{name:"description"},"Description"),o.a.createElement(P.TableHeader,{name:"id",style:{width:"48px"},cellFormatter:function(t){return o.a.createElement("div",{className:"ui__flex ui__alignItems_center",style:{color:"#999999"}},o.a.createElement("div",{className:"ui__cursor_pointer",onClick:e.handleEditDiagnosisClick(t)},o.a.createElement(H.e,{style:{fontSize:"24px"}}))," ",o.a.createElement("div",{style:{position:"relative"}},o.a.createElement("div",{id:"menu_".concat(t),className:"ui__cursor_pointer"},o.a.createElement(H.i,{style:{fontSize:"24px"}})),o.a.createElement(P.Menu,{target:"menu_".concat(t),align:"right"},o.a.createElement(P.MenuItem,{onClick:function(){return e.handleDuplicateDiagnosis(t)}},"Duplicate"),o.a.createElement(P.MenuItem,{onClick:e.handleDeleteDiagnosisClick(t)},"Delete"))))}})):o.a.createElement(P.CardText,null,o.a.createElement("div",{style:c.emptyMessageContainer},o.a.createElement("div",null,"The list of screens is empty")))))}}]),t}(l.Component);$.propTypes={scriptId:u.a.string.isRequired,onEditDiagnosisClick:u.a.func.isRequired};var ee=$,te=function(e){var t=e.match.params.scriptId,n=Object(l.useState)(!1),a=c()(n,2),i=a[0],s=a[1],u=Object(l.useState)(null),d=c()(u,2),p=(d[0],d[1]),m=S(),f=c()(m,3),h=f[0].diagnoses,E=f[1],g=f[2];return Object(l.useEffect)(function(){s(!0),T.a.get("/get-diagnoses",{script_id:t}).then(function(e){return s(!1),e}).then(function(e){var t=e.payload;s(!1),E(g.updateState({diagnoses:t.diagnoses||[]}))}).catch(function(e){s(!1),p(e)})},[]),o.a.createElement("div",null,!h.length&&i&&o.a.createElement(b.a,{className:"ui__flex ui__justifyContent_center"}),!h.length&&i?null:o.a.createElement(ee,r()({},e,{diagnoses:h,updateState:function(e){return E(g.updateState(e))}})))};te.propTypes={match:u.a.object};var ne=Object(B.hot)(Object(d.f)(te)),ae=function(e){function t(){var e,n;D()(this,t);for(var a=arguments.length,r=new Array(a),i=0;i<a;i++)r[i]=arguments[i];return n=w()(this,(e=O()(t)).call.apply(e,[this].concat(r))),U()(A()(n),"state",{activeTab:0,script:m()({title:"",description:""},(n.props.script||{}).data)}),U()(A()(n),"setScriptAsState",function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:n.props;e.script&&n.setState({script:e.script.data})}),U()(A()(n),"handleBackClick",function(){return n.props.history.goBack()}),U()(A()(n),"handleEditScreenClick",function(e){var t=n.props,a=t.scriptId;t.history.push("/dashboard/scripts/".concat(a,"/screens/").concat(e))}),U()(A()(n),"handleEditDiagnosisClick",function(e){var t=n.props,a=t.scriptId;t.history.push("/dashboard/scripts/".concat(a,"/diagnosis/").concat(e))}),U()(A()(n),"handleInputChange",function(e,t){return n.setState({script:m()({},n.state.script,U()({},e,t.target.value))})}),U()(A()(n),"handleSubmitClick",function(){var e=n.props,t=e.isEditMode,a=e.history,r=e.actions,i=e.scriptId,c=n.state.script;n.setState({savingScript:!0}),r.post(t?"update-script":"create-script",m()({},t?{id:i}:{},{data:JSON.stringify({title:c.title,description:c.description}),onResponse:function(){return n.setState({savingScript:!0})},onFailure:function(e){return n.setState({saveScriptError:e})},onSuccess:function(e){var t=e.payload;r.updateApiData({script:t.script}),a.goBack()}}))}),n}return M()(t,e),k()(t,[{key:"componentWillUpdate",value:function(e){e.script!==this.props.script&&this.setScriptAsState(e)}},{key:"render",value:function(){var e,t=this,n=this.props,a=n.isEditMode,r=n.scriptId,i=this.state,c=i.activeTab,l=i.script,s="".concat(a?"Edit":"Add"," script"),u=a?"Update":"Create",d={container:{display:"flex",boxSizing:"border-box",justifyContent:"center"},form:{width:"780px"},fieldLeft:{marginRight:"12px"},fieldRight:{marginLeft:"12px"}};switch(c){case 0:e=o.a.createElement(Z,{scriptId:r,onEditScreenClick:this.handleEditScreenClick});break;case 1:e=o.a.createElement(ne,{scriptId:r,onEditDiagnosisClick:this.handleEditDiagnosisClick});break;default:e=null}var p=o.a.createElement("div",{style:{marginTop:"24px"}},o.a.createElement(P.Tabs,{activeTab:c,onChange:function(e){return t.setState({activeTab:e})},ripple:!0},o.a.createElement(P.Tab,null,"Screens"),o.a.createElement(P.Tab,null,"Diagnosis")),o.a.createElement("section",null,e)),f=function(){return o.a.createElement("div",{style:d.container},o.a.createElement("div",null,o.a.createElement(P.Card,{shadow:0,style:d.form},o.a.createElement(q.a,{leftNavIcon:"arrow_back",title:s,onLeftNavItemClicked:t.handleBackClick}),o.a.createElement(P.CardText,null,o.a.createElement(P.Textfield,{style:{width:"100%"},floatingLabel:!0,label:"Title",required:!0,onChange:t.handleInputChange.bind(t,"title"),value:l.title}),o.a.createElement(P.Textfield,{style:{width:"100%"},floatingLabel:!0,label:"Description",value:l.description,onChange:t.handleInputChange.bind(t,"description")}),o.a.createElement(F.a,null,a?o.a.createElement(P.Button,{style:m()({},d.fieldLeft),onClick:t.handleSubmitClick.bind(t,"apply"),raised:!0,ripple:!0},"Apply"):null,o.a.createElement(P.Button,{style:m()({},d.fieldRight),onClick:t.handleSubmitClick.bind(t,"update"),raised:!0,accent:!0,ripple:!0},u)))),a?p:null))};return a?o.a.createElement("div",null,f()):f()}}]),t}(l.Component);ae.propTypes={actions:u.a.object.isRequired,history:u.a.object.isRequired,isEditMode:u.a.bool.isRequired,scriptId:u.a.string.isRequired,script:u.a.object};var re=ae,ie=function(e){var t=e.match.params.scriptId,n=Object(l.useState)(!1),a=c()(n,2),i=a[0],s=a[1],u=Object(l.useState)(null),d=c()(u,2),p=(d[0],d[1]),m=Object(C.a)(),f=c()(m,3),h=f[0].script,E=f[1],g=f[2],v=function(e){return E(g.updateState(e))},_=y(),D=c()(_,3),I=(D[0],D[1]),k=D[2],N=S(),w=c()(N,3),x=(w[0],w[1]),O=w[2];return Object(l.useEffect)(function(){return x(O.updateState({diagnoses:[]})),I(k.updateState({screens:[]})),t&&"new"!==t&&(s(!0),T.a.get("/get-script",{id:t}).then(function(e){return s(!1),e}).then(function(e){var t=e.payload;s(!1),v({script:t.script||null})}).catch(function(e){s(!1),p(e)})),function(){v({script:null})}},[]),i?o.a.createElement(b.a,{className:"ui__flex ui__justifyContent_center"}):o.a.createElement(re,r()({},e,{script:h,isEditMode:!!h,scriptId:t,updateState:v}))};ie.propTypes={match:u.a.object.isRequired};t.default=Object(d.f)(ie)}}]);