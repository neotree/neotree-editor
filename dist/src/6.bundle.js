(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{124:function(e,t,n){"use strict";n.d(t,"a",function(){return w});var a=n(10),r=n.n(a),i=n(16),o=n.n(i),s=n(19),c=n.n(s),l=n(20),u=n.n(l),d=n(21),p=n.n(d),m=n(22),h=n.n(m),f=n(25),g=n.n(f),E=n(23),y=n.n(E),v=n(24),S=n.n(v),C=n(0),_=n.n(C),b=n(2),T=n.n(b),I=n(34),D=n.n(I),k=n(120),N=n(122),w=function(e){function t(){var e,n;c()(this,t);for(var a=arguments.length,r=new Array(a),i=0;i<a;i++)r[i]=arguments[i];return n=p()(this,(e=h()(t)).call.apply(e,[this].concat(r))),S()(g()(n),"handleLeftNavClick",function(){n.props.onLeftNavItemClicked&&n.props.onLeftNavItemClicked()}),n}return y()(t,e),u()(t,[{key:"render",value:function(){var e=this.props,t=e.children,n=e.className,a=e.hideSpacer,i=e.leftNavIcon,s=(e.onLeftNavItemClicked,e.title),c=(e.transparent,o()(e,["children","className","hideSpacer","leftNavIcon","onLeftNavItemClicked","title","transparent"])),l=D()(n,"mdl-toolbar__header","mdl-layout__header","mdl-layout__header--transparent"),u=D()("mdl-toolbar__header-row",{"mdl-toolbar__header-row-with-left-icon":i}),d=D()("mdl-toolbar__left-nav"),p=D()("mdl-toolbar__right-nav");return _.a.createElement("header",r()({className:l},c),i?_.a.createElement("div",{className:D()(d,"ui__cursor_pointer"),style:{fontSize:"24px"},onClick:this.handleLeftNavClick},_.a.createElement(N.b,null)):_.a.createElement("div",{style:{width:"24px"}}),_.a.createElement(k.HeaderRow,{className:u,title:s||"",hideSpacer:a},t?_.a.createElement(k.Navigation,{className:p},t):null))}}]),t}(C.Component);w.propTypes={className:T.a.string,title:T.a.node,leftNavIcon:T.a.string,onLeftNavItemClicked:T.a.func,hideSpacer:T.a.bool}},126:function(e,t,n){"use strict";n.d(t,"c",function(){return a}),n.d(t,"b",function(){return r}),n.d(t,"d",function(){return i}),n.d(t,"e",function(){return o}),n.d(t,"f",function(){return s}),n.d(t,"a",function(){return c});var a={COMPUTE:"compute",DATE_NOW:"date_now",DATE_NOON:"date_noon",DATE_MIDNIGHT:"date_midnight",EMPTY:"",UID:"uid"},r={BOOLEAN:"boolean",DATETIME:"datetime",DATE:"date",ID:"id",NUMBER:"number",PERIOD:"period",SET_ID:"set<id>",STRING:"string",TIME:"time",VOID:"void"},i={DATE:"date",DATETIME:"datetime",DROPDOWN:"dropdown",NUMBER:"number",PERIOD:"period",TEXT:"text",TIME:"time"},o={CHECKLIST:"checklist",FORM:"form",LIST:"list",MANAGEMENT:"management",MULTI_SELECT:"multi_select",PROGRESS:"progress",SINGLE_SELECT:"single_select",TIMER:"timer",YESNO:"yesno"},s={SIGN:"sign",RISK:"risk"},c=o.CHECKLIST},129:function(e,t,n){"use strict";n.d(t,"a",function(){return v});var a=n(10),r=n.n(a),i=n(16),o=n.n(i),s=n(19),c=n.n(s),l=n(20),u=n.n(l),d=n(21),p=n.n(d),m=n(22),h=n.n(m),f=n(23),g=n.n(f),E=n(0),y=n.n(E),v=function(e){function t(){return c()(this,t),p()(this,h()(t).apply(this,arguments))}return g()(t,e),u()(t,[{key:"render",value:function(){var e=this.props,t=e.children,n=o()(e,["children"]);return y.a.createElement("div",r()({style:{display:"flex",flexDirection:"row",justifyContent:"flex-end",marginTop:"16px",marginBottom:"8px"}},n),t)}}]),t}(E.Component)},138:function(e,t,n){"use strict";var a=n(10),r=n.n(a),i=n(16),o=n.n(i),s=n(19),c=n.n(s),l=n(20),u=n.n(l),d=n(21),p=n.n(d),m=n(22),h=n.n(m),f=n(25),g=n.n(f),E=n(23),y=n.n(E),v=n(24),S=n.n(v),C=n(0),_=n.n(C),b=n(2),T=n.n(b),I=n(34),D=n.n(I),k=n(122),N=n(41),w=(n(145),function(e){function t(){var e,n;c()(this,t);for(var a=arguments.length,r=new Array(a),i=0;i<a;i++)r[i]=arguments[i];return n=p()(this,(e=h()(t)).call.apply(e,[this].concat(r))),S()(g()(n),"onCopy",function(){n.input.select(),document.execCommand("copy"),n.input.blur()}),n}return y()(t,e),u()(t,[{key:"render",value:function(){var e=this,t=this.props,n=t.className,a=t.data,i=t.host,s=t.children,c=o()(t,["className","data","host","children"]);return _.a.createElement("div",r()({},c,{className:D()(n,"ui__copyToClipBoard"),style:Object.assign({},c.style,{position:"relative"})}),_.a.createElement("input",{ref:function(t){return e.input=t},value:JSON.stringify({neotree:{data:a,host:i}}),onChange:function(){return{}},style:{position:"absolute",zIndex:-1}}),_.a.createElement("div",{onClick:this.onCopy,className:"ui__copyToClipBoardBtn"},s||_.a.createElement(k.e,null)))}}]),t}(_.a.Component));w.propTypes={children:T.a.node,className:T.a.string,data:T.a.string.isRequired,style:T.a.object,host:T.a.string.isRequired},t.a=Object(N.a)(w,function(e){return{host:e.$APP.host}})},139:function(e,t,n){"use strict";function a(e,t,n){if(n>=e.length)for(var a=n-e.length;1+a--;)e.push(void 0);return e.splice(n,0,e.splice(t,1)[0]),e}n.d(t,"a",function(){return a})},142:function(e,t,n){"use strict";var a=n(10),r=n.n(a),i=n(19),o=n.n(i),s=n(20),c=n.n(s),l=n(21),u=n.n(l),d=n(22),p=n.n(d),m=n(25),h=n.n(m),f=n(23),g=n.n(f),E=n(24),y=n.n(E),v=n(0),S=n.n(v),C=n(2),_=n.n(C),b=n(3),T=n.n(b),I=n(16),D=n.n(I),k=n(34),N=n.n(k),w=n(12),R=n(120),x=n(52),A=n(41),M=function(e){return new Promise(function(t,n){if(e){var a="Ooops! Seems like you pasted invalid content.";try{var r=JSON.parse(e);r.neotree&&r.neotree.data&&r.neotree.host?t(r.neotree):n(a)}catch(e){n(a)}}else n("No data copied to clipboard")})},O=function(e){function t(){var e,n;o()(this,t);for(var a=arguments.length,r=new Array(a),i=0;i<a;i++)r[i]=arguments[i];return n=u()(this,(e=p()(t)).call.apply(e,[this].concat(r))),y()(h()(n),"state",{content:""}),y()(h()(n),"onClose",function(){n.setState({error:null}),n.props.onClose()}),y()(h()(n),"validateAndSave",function(e){if(n.setState({error:null}),e){var t=n.props,a=t.actions,r=t.host,i=t.destination,o=t.history,s=t.redirectTo,c=t.onSuccess,l=t.accept;M(e).then(function(e){var t=e.data,u=D()(e,["data"]),d=(t=JSON.parse(t)).dataType===l;if(!d)return alert("You can only paste a '".concat(l,"' here, you pasted a '").concat(t.dataType,"' instead."));n.setState({saving:!0},d?function(){a.post("copy-data",{destination:T()({host:r},i),source:T()({},u,{},t),onResponse:function(){return n.setState({saving:!1})},onFailure:function(e){return n.setState({error:e})},onSuccess:function(e){var t=e.payload;o.push(s(t)),c&&c(t)}})}:void 0)}).catch(function(e){return n.setState({error:{msg:e.msg||e.message||JSON.stringify(e)}})})}}),n}return g()(t,e),c()(t,[{key:"componentWillUpdate",value:function(e){e.clipboardData!==this.props.clipboardData&&this.validateAndSave(e.clipboardData)}},{key:"render",value:function(){var e=this,t=this.props.open,n=this.state,a=n.saving,r=n.content,i=n.error;return S.a.createElement(R.Dialog,{open:t||!1,style:{width:"260px"}},a?S.a.createElement(R.DialogContent,null,S.a.createElement("div",{className:N()("ui__flex ui__alignItems_center ui__justifyContent_center")},S.a.createElement(x.a,null))):S.a.createElement(S.a.Fragment,null,S.a.createElement(R.DialogContent,{className:N()("ui__flex ui__alignItems_center ui__justifyContent_center uiBg__faintGreyColor"),style:{border:"1px dotted #ccc",position:"relative"}},S.a.createElement("span",null,"Paste here"),S.a.createElement("textarea",{autoFocus:!0,ref:function(t){return e.input=t},onChange:function(t){return e.validateAndSave(t.target.value)},value:r,style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",zIndex:10,opacity:0}})),S.a.createElement(R.DialogActions,null,i?S.a.createElement("span",{className:"ui__dangerColor ui__smallFontSize",style:{marginRight:"auto"}},i.msg||i.message||JSON.stringify(i)):null,S.a.createElement(R.Button,{type:"button",onClick:this.onClose},"Cancel"))))}}]),t}(S.a.Component);O.propTypes={open:_.a.bool,onClose:_.a.func.isRequired,options:_.a.object,actions:_.a.object.isRequired,destination:_.a.object.isRequired,host:_.a.string.isRequired,redirectTo:_.a.func.isRequired,onSuccess:_.a.func,accept:_.a.string.isRequired};var j=Object(w.f)(Object(A.a)(O,function(e){return{host:e.$APP.host}})),B=function(e){function t(){var e,n;o()(this,t);for(var a=arguments.length,r=new Array(a),i=0;i<a;i++)r[i]=arguments[i];return n=u()(this,(e=p()(t)).call.apply(e,[this].concat(r))),y()(h()(n),"state",{}),y()(h()(n),"onPaste",function(e){var t=e.clipboardData.getData("text/plain");M(t).then(function(){return n.setState({togglePasteBoard:!0,clipboardData:t})})}),n}return g()(t,e),c()(t,[{key:"componentDidMount",value:function(){window.addEventListener("paste",this.onPaste,!0)}},{key:"componentWillUnmount",value:function(){window.removeEventListener("paste",this.onPaste,!0)}},{key:"render",value:function(){var e=this.props,t=e.children,n=e.modal,a=e.data,i=e.redirectTo,o=e.onSuccess,s=e.accept;return S.a.createElement("div",null,t,S.a.createElement(j,r()({},n,{accept:s,onSuccess:o,clipboardData:this.state.clipboardData,destination:a,redirectTo:i})))}}]),t}(v.Component);B.propTypes={children:_.a.node,modal:_.a.shape({onClose:_.a.func.isRequired,open:_.a.bool}).isRequired,data:_.a.shape({dataId:_.a.string,dataType:_.a.string}).isRequired,redirectTo:_.a.func.isRequired,onSuccess:_.a.func,accept:_.a.string.isRequired};t.a=B},145:function(e,t,n){var a=n(146);"string"==typeof a&&(a=[[e.i,a,""]]);var r={hmr:!0,transform:void 0,insertInto:void 0};n(27)(a,r);a.locals&&(e.exports=a.locals)},146:function(e,t,n){(e.exports=n(14)(!1)).push([e.i,".ui__copyToClipBoard {\n  display: inline-block; }\n  .ui__copyToClipBoard input {\n    -webkit-transform: scale(0);\n            transform: scale(0); }\n  .ui__copyToClipBoard .ui__copyToClipBoardBtn {\n    display: inline;\n    position: relative; }\n",""])},161:function(e,t,n){"use strict";var a=n(10),r=n.n(a),i=n(16),o=n.n(i),s=n(19),c=n.n(s),l=n(20),u=n.n(l),d=n(21),p=n.n(d),m=n(22),h=n.n(m),f=n(23),g=n.n(f),E=n(24),y=n.n(E),v=n(0),S=n.n(v),C=n(2),_=n.n(C),b=n(34),T=n.n(b),I=function(e){function t(){return c()(this,t),p()(this,h()(t).apply(this,arguments))}return g()(t,e),u()(t,[{key:"render",value:function(){var e=this.props,t=e.className,n=(e.name,e.numeric),a=e.children,i=(e.cellFormatter,o()(e,["className","name","numeric","children","cellFormatter"])),s=T()({"mdl-data-table__cell--non-numeric":!n},t);return S.a.createElement("th",r()({className:s},i),a)}}]),t}(v.Component);y()(I,"propTypes",{cellFormatter:_.a.func,className:_.a.string,name:_.a.string.isRequired,numeric:_.a.bool});var D=n(25),k=n.n(D),N=n(136),w=n.n(N),R=n(122),x=n(207),A=n(208),M=n.n(A),O=[2,3,4,6,8,16,24].map(function(e){return"mdl-shadow--".concat(e,"dp")}),j=function(e){function t(){var e,n;c()(this,t);for(var a=arguments.length,r=new Array(a),i=0;i<a;i++)r[i]=arguments[i];return n=p()(this,(e=h()(t)).call.apply(e,[this].concat(r))),y()(k()(n),"renderCell",function(e,t,n){var a=e.numeric?"":"mdl-data-table__cell--non-numeric";return S.a.createElement("td",{key:e.name,className:a},e.cellFormatter?e.cellFormatter(t[e.name],t,n):t[e.name])}),y()(k()(n),"sortAdapterFn",function(e){var t=e.oldIndex,a=e.newIndex,r=n.props.onSort;r&&r(t,a)}),n}return g()(t,e),u()(t,[{key:"render",value:function(){var e=this,t=this.props,n=t.className,a=t.shadow,i=t.children,s=(t.onSort,t.rowKeyColumn,t.rows),c=o()(t,["className","shadow","children","onSort","rowKeyColumn","rows"]),l=void 0!==a,u=w()(a||0,0,O.length-1),d=T()("mdl-data-table",y()({},O[u],l),n),p=i?S.a.Children.toArray(i):null,m=Object(x.SortableHandle)(function(){return S.a.createElement(R.h,{style:{fontSize:"24px"},className:"ui__cursor_pointer"})}),h=Object(x.SortableElement)(function(t){var n=t.row,a=t.index;return S.a.createElement("tr",{className:n.className},S.a.createElement("td",null,S.a.createElement(m,null)),p.map(function(t){return e.renderCell(t.props,n,a)}))}),f=Object(x.SortableContainer)(function(e){var t=e.rows;return S.a.createElement("tbody",null,t.map(function(e,t){return S.a.createElement(h,{key:M.a.generate(),index:t,row:e})}))});return S.a.createElement("table",r()({className:d},c),S.a.createElement("thead",null,S.a.createElement("tr",null,S.a.createElement("th",null," "),p)),S.a.createElement(f,{rows:s,onSortEnd:this.sortAdapterFn,useDragHandle:!0}))}}]),t}(v.Component);y()(j,"propTypes",{className:_.a.string,onSort:_.a.func,rowKeyColumn:_.a.string,rows:_.a.arrayOf(_.a.object).isRequired,shadow:_.a.number}),n.d(t,"b",function(){return I}),n.d(t,"a",function(){return j})},213:function(e,t){},230:function(e,t){},232:function(e,t){},400:function(e,t,n){"use strict";n.r(t);var a=n(19),r=n.n(a),i=n(20),o=n.n(i),s=n(21),c=n.n(s),l=n(22),u=n.n(l),d=n(25),p=n.n(d),m=n(23),h=n.n(m),f=n(24),g=n.n(f),E=n(0),y=n.n(E),v=n(2),S=n.n(v),C=n(26),_=n(12),b=n(41),T=n(52),I=n(3),D=n.n(I),k=n(120),N=n(129),w=n(124),R=n(42),x=n.n(R),A=n(122),M=n(139),O=n(126),j=n(138),B=n(142),P=n(161),L=function(e){function t(){var e,n;r()(this,t);for(var a=arguments.length,i=new Array(a),o=0;o<a;o++)i[o]=arguments[o];return n=c()(this,(e=u()(t)).call.apply(e,[this].concat(i))),g()(p()(n),"state",{openSelectScreenTypeDialog:!1,screens:[],addScreenType:O.a}),g()(p()(n),"togglePasteBoard",function(){return n.setState({openPasteBoard:!n.state.openPasteBoard})}),g()(p()(n),"handleAddScreenClick",function(){var e=n.props,t=e.actions,a=e.scriptId,r=e.history,i=n.state.addScreenType;n.setState({addingScreen:!1}),t.post("create-screen",{script_id:a,type:i,onResponse:function(){return n.setState({addingScreen:!1})},onFailure:function(e){return n.setState({addScreenError:e})},onSuccess:function(e){var i=e.payload;t.updateApiData({screen:i.screen}),r.push("/dashboard/scripts/".concat(a,"/screens/").concat(i.screen.id)),n.closeSelectScreenTypeDialog()}})}),g()(p()(n),"handleDeleteScreenClick",function(e){return function(){var t=n.props,a=t.actions,r=t.scriptId;n.setState({deletingScreen:!1}),a.post("delete-screen",{id:e,scriptId:r,onResponse:function(){return n.setState({deletingScreen:!1})},onFailure:function(e){return n.setState({deleteScreenError:e})},onSuccess:function(){a.updateApiData(function(t){return{screens:t.screens.filter(function(t){return t.id!==e})}})}})}}),g()(p()(n),"handleEditScreenClick",function(e){return function(){return n.props.onEditScreenClick(e)}}),g()(p()(n),"handleInputChange",function(e,t){return n.setState(g()({},e,t.target.value))}),g()(p()(n),"openSelectScreenTypeDialog",function(){return n.setState({openSelectScreenTypeDialog:!0})}),g()(p()(n),"closeSelectScreenTypeDialog",function(){return n.setState({openSelectScreenTypeDialog:!1,addScreenTitle:null,addScreenType:O.a})}),g()(p()(n),"swapScreenItems",function(e,t){var a=n.props.screens,r=Object(M.a)(x()(a),e,t),i=n.props.actions;n.setState({sortingScreens:!1}),i.post("update-screens",{returnUpdated:!0,screens:r.map(function(e,t){return{id:e.id,position:t}}),onResponse:function(){return n.setState({sortingScreens:!1})},onFailure:function(e){return n.setState({deleteScriptError:e})},onSuccess:function(e){var t=e.payload;return i.updateApiData({screens:t.screens})}})}),n}return h()(t,e),o()(t,[{key:"render",value:function(){var e=this,t=this.props,n=t.screens,a=t.scriptId,r=this.state.addScreenType,i={screens:{marginTop:"24px",width:"780px"},table:{width:"100%"},emptyMessageContainer:{display:"flex",boxSizing:"border-box",alignItems:"center",justifyContent:"center",color:"#757575",fontSize:"16px"}},o=y.a.createElement(k.Dialog,{open:this.state.openSelectScreenTypeDialog,style:{width:"260px"}},y.a.createElement(k.DialogContent,null,y.a.createElement("p",null,"Select screen type:"),y.a.createElement(k.RadioGroup,{container:"div",childContainer:"div",name:"addScreenType",value:r||O.a,onChange:this.handleInputChange.bind(this,"addScreenType")},y.a.createElement(k.Radio,{value:O.e.CHECKLIST,ripple:!0},"Checklist"),y.a.createElement(k.Radio,{value:O.e.FORM,ripple:!0},"Form"),y.a.createElement(k.Radio,{value:O.e.MANAGEMENT,ripple:!0},"Management"),y.a.createElement(k.Radio,{value:O.e.MULTI_SELECT,ripple:!0},"Multiple choice list"),y.a.createElement(k.Radio,{value:O.e.LIST,ripple:!0},"Simple list"),y.a.createElement(k.Radio,{value:O.e.SINGLE_SELECT,ripple:!0},"Single choice list"),y.a.createElement(k.Radio,{value:O.e.PROGRESS,ripple:!0},"Progress"),y.a.createElement(k.Radio,{value:O.e.TIMER,ripple:!0},"Timer"),y.a.createElement(k.Radio,{value:O.e.YESNO,ripple:!0},"Yes/No"))),y.a.createElement(k.DialogActions,null,y.a.createElement(k.Button,{type:"button",onClick:this.handleAddScreenClick,accent:!0},"Create"),y.a.createElement(k.Button,{type:"button",onClick:this.closeSelectScreenTypeDialog},"Cancel")));return y.a.createElement(B.a,{modal:{onClose:this.togglePasteBoard,open:this.state.openPasteBoard},accept:"screen",data:{dataId:a,dataType:"script"},redirectTo:function(e){return"/dashboard/scripts/".concat(a,"/screens/").concat(e.screen.id)}},y.a.createElement(k.Card,{shadow:0,style:i.screens},y.a.createElement(w.a,{title:"Screens"},y.a.createElement("div",null,y.a.createElement("div",{id:"add_new",className:"ui__cursor_pointer"},y.a.createElement(A.i,{style:{fontSize:"24px"}})),y.a.createElement(k.Menu,{target:"add_new",align:"right"},y.a.createElement(k.MenuItem,{onClick:this.openSelectScreenTypeDialog},"Add new"),y.a.createElement(k.MenuItem,{onClick:this.togglePasteBoard},"Paste")))),n&&n.length>0?y.a.createElement(P.a,{style:i.table,rows:n.map(function(e){return D()({id:e.id,position:e.position},e.data)}),rowKeyColumn:"position",onSort:this.swapScreenItems},y.a.createElement(P.b,{name:"position"},"Pos"),y.a.createElement(P.b,{name:"epicId"},"Epic"),y.a.createElement(P.b,{name:"storyId"},"Story"),y.a.createElement(P.b,{name:"refId"},"Ref."),y.a.createElement(P.b,{name:"title",style:{width:"100%"},cellFormatter:function(e,t){var n=t.title;return n?n.length<=30?n:"".concat(n.substring(0,29),"..."):""}},"Title"),y.a.createElement(P.b,{name:"id",style:{width:"48px"},cellFormatter:function(t){return y.a.createElement("div",{className:"ui__flex ui__alignItems_center",style:{color:"#999999"}},y.a.createElement("div",{className:"ui__cursor_pointer",onClick:e.handleEditScreenClick(t)},y.a.createElement(A.f,{style:{fontSize:"24px"}}))," ",y.a.createElement("div",{style:{position:"relative"}},y.a.createElement("div",{id:"menu_".concat(t),className:"ui__cursor_pointer"},y.a.createElement(A.i,{style:{fontSize:"24px"}})),y.a.createElement(k.Menu,{target:"menu_".concat(t),align:"right"},y.a.createElement(k.MenuItem,null,y.a.createElement(j.a,{data:JSON.stringify({dataId:t,dataType:"screen"})},y.a.createElement("span",null,"Copy"))),y.a.createElement(k.MenuItem,{onClick:e.handleDeleteScreenClick(t)},"Delete"))))}})):y.a.createElement(k.CardText,null,y.a.createElement("div",{style:i.emptyMessageContainer},y.a.createElement("div",null,"The list of screens is empty")))),o)}}]),t}(E.Component);L.propTypes={screens:S.a.array.isRequired,actions:S.a.object.isRequired,scriptId:S.a.string.isRequired,onEditScreenClick:S.a.func.isRequired};var q=L,F=function(e){function t(){var e,n;r()(this,t);for(var a=arguments.length,i=new Array(a),o=0;o<a;o++)i[o]=arguments[o];return n=c()(this,(e=u()(t)).call.apply(e,[this].concat(i))),g()(p()(n),"state",{}),n}return h()(t,e),o()(t,[{key:"componentWillMount",value:function(){var e=this,t=this.props,n=t.actions,a=t.scriptId;this.setState({loadingScreens:!0}),n.get("get-screens",{script_id:a,onResponse:function(){return e.setState({loadingScreens:!1})},onFailure:function(t){return e.setState({loadScreensError:t})},onSuccess:function(t){var a=t.payload;e.setState({screens:a.screens}),n.updateApiData({screens:a.screens})}})}},{key:"componentWillUnmount",value:function(){this.props.actions.updateApiData({screens:[]})}},{key:"render",value:function(){return this.state.loadingScreens?y.a.createElement(T.a,{className:"ui__flex ui__justifyContent_center"}):y.a.createElement(q,this.props)}}]),t}(y.a.Component);F.propTypes={actions:S.a.object};var z=Object(C.hot)(Object(_.f)(Object(b.a)(F,function(e){return{screens:e.apiData.screens||[]}}))),U=function(e){function t(e){var n;return r()(this,t),n=c()(this,u()(t).call(this,e)),g()(p()(n),"togglePasteBoard",function(){return n.setState({openPasteBoard:!n.state.openPasteBoard})}),g()(p()(n),"handleAddDiagnosisClick",function(){var e=n.props,t=e.history,a=e.scriptId;t.push("/dashboard/scripts/".concat(a,"/diagnosis/new"))}),g()(p()(n),"handleDeleteDiagnosisClick",function(e){return function(){var t=n.props,a=t.actions,r=t.scriptId;n.setState({deletingDiagnosis:!0}),a.post("delete-diagnosis",{id:e,scriptId:r,onResponse:function(){return n.setState({deletingDiagnosis:!1})},onFailure:function(e){return n.setState({deleteDiagnosisError:e})},onSuccess:function(){a.updateApiData(function(t){return{diagnoses:t.diagnoses.filter(function(t){return t.id!==e})}}),n.closeDeleteConfirmDialog()}})}}),g()(p()(n),"handleEditDiagnosisClick",function(e){return function(){return n.props.onEditDiagnosisClick(e)}}),g()(p()(n),"handleInputChange",function(e,t){return n.setState(D()({},n.state,g()({},e,t.target.value)))}),n.state={openDeleteConfirmDialog:!1,scriptIdForAction:null},n}return h()(t,e),o()(t,[{key:"render",value:function(){var e=this,t=this.props,n=t.diagnoses,a=t.scriptId,r={diagnosis:{marginTop:"24px",width:"780px"},table:{width:"100%"},emptyMessageContainer:{display:"flex",boxSizing:"border-box",alignItems:"center",justifyContent:"center",color:"#757575",fontSize:"16px"}};return y.a.createElement(B.a,{modal:{onClose:this.togglePasteBoard,open:this.state.openPasteBoard},accept:"diagnosis",data:{dataId:a,dataType:"diagnosis"},redirectTo:function(e){return"/dashboard/scripts/".concat(a,"/diagnosis/").concat(e.diagnosis.id)}},y.a.createElement(k.Card,{shadow:0,style:r.diagnosis},y.a.createElement(w.a,{title:"Diagnosis"},y.a.createElement("div",{id:"add_new",className:"ui__cursor_pointer"},y.a.createElement(A.i,{style:{fontSize:"24px"}})),y.a.createElement("div",null,y.a.createElement(k.Menu,{target:"add_new",align:"right"},y.a.createElement(k.MenuItem,{onClick:this.handleAddDiagnosisClick},"Add new"),y.a.createElement(k.MenuItem,{onClick:this.togglePasteBoard},"Paste")))),n.length>0?y.a.createElement(k.DataTable,{style:{width:"780px"},shadow:0,rows:n.map(function(e){return D()({id:e.id},e.data)})},y.a.createElement(k.TableHeader,{name:"name"},"Name"),y.a.createElement(k.TableHeader,{name:"description"},"Description"),y.a.createElement(k.TableHeader,{name:"id",style:{width:"48px"},cellFormatter:function(t){return y.a.createElement("div",{className:"ui__flex ui__alignItems_center",style:{color:"#999999"}},y.a.createElement("div",{className:"ui__cursor_pointer",onClick:e.handleEditDiagnosisClick(t)},y.a.createElement(A.f,{style:{fontSize:"24px"}}))," ",y.a.createElement("div",{style:{position:"relative"}},y.a.createElement("div",{id:"menu_".concat(t),className:"ui__cursor_pointer"},y.a.createElement(A.i,{style:{fontSize:"24px"}})),y.a.createElement(k.Menu,{target:"menu_".concat(t),align:"right"},y.a.createElement(k.MenuItem,null,y.a.createElement(j.a,{data:JSON.stringify({dataId:t,dataType:"diagnosis"})},y.a.createElement("span",null,"Copy"))),y.a.createElement(k.MenuItem,{onClick:e.handleDeleteDiagnosisClick(t)},"Delete"))))}})):y.a.createElement(k.CardText,null,y.a.createElement("div",{style:r.emptyMessageContainer},y.a.createElement("div",null,"The list of screens is empty")))))}}]),t}(E.Component);U.propTypes={scriptId:S.a.string.isRequired,onEditDiagnosisClick:S.a.func.isRequired};var G=U,W=function(e){function t(){var e,n;r()(this,t);for(var a=arguments.length,i=new Array(a),o=0;o<a;o++)i[o]=arguments[o];return n=c()(this,(e=u()(t)).call.apply(e,[this].concat(i))),g()(p()(n),"state",{}),n}return h()(t,e),o()(t,[{key:"componentWillMount",value:function(){var e=this,t=this.props,n=t.actions,a=t.scriptId;this.setState({loadingDiagnoses:!0}),n.get("get-diagnoses",{script_id:a,onResponse:function(){return e.setState({loadingDiagnoses:!1})},onFailure:function(t){return e.setState({loadDiagnosesError:t})},onSuccess:function(t){var a=t.payload;e.setState({diagnoses:a.diagnoses}),n.updateApiData({diagnoses:a.diagnoses})}})}},{key:"componentWillUnmount",value:function(){this.props.actions.updateApiData({diagnoses:[]})}},{key:"render",value:function(){return this.state.loadingDiagnosess?y.a.createElement(T.a,{className:"ui__flex ui__justifyContent_center"}):y.a.createElement(G,this.props)}}]),t}(y.a.Component);W.propTypes={actions:S.a.object};var H=Object(C.hot)(Object(_.f)(Object(b.a)(W,function(e){return{diagnoses:e.apiData.diagnoses||[]}}))),J=function(e){function t(){var e,n;r()(this,t);for(var a=arguments.length,i=new Array(a),o=0;o<a;o++)i[o]=arguments[o];return n=c()(this,(e=u()(t)).call.apply(e,[this].concat(i))),g()(p()(n),"state",{activeTab:0,script:D()({title:"",description:""},(n.props.script||{}).data)}),g()(p()(n),"setScriptAsState",function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:n.props;e.script&&n.setState({script:e.script.data})}),g()(p()(n),"handleBackClick",function(){return n.props.history.goBack()}),g()(p()(n),"handleEditScreenClick",function(e){var t=n.props,a=t.scriptId;t.history.push("/dashboard/scripts/".concat(a,"/screens/").concat(e))}),g()(p()(n),"handleEditDiagnosisClick",function(e){var t=n.props,a=t.scriptId;t.history.push("/dashboard/scripts/".concat(a,"/diagnosis/").concat(e))}),g()(p()(n),"handleInputChange",function(e,t){return n.setState({script:D()({},n.state.script,g()({},e,t.target.value))})}),g()(p()(n),"handleSubmitClick",function(){var e=n.props,t=e.isEditMode,a=e.history,r=e.actions,i=e.scriptId,o=n.state.script;n.setState({savingScript:!0}),r.post(t?"update-script":"create-script",D()({},t?{id:i}:{},{data:JSON.stringify({title:o.title,description:o.description}),onResponse:function(){return n.setState({savingScript:!0})},onFailure:function(e){return n.setState({saveScriptError:e})},onSuccess:function(e){var t=e.payload;r.updateApiData({script:t.script}),a.goBack()}}))}),n}return h()(t,e),o()(t,[{key:"componentWillUpdate",value:function(e){e.script!==this.props.script&&this.setScriptAsState(e)}},{key:"render",value:function(){var e,t=this,n=this.props,a=n.isEditMode,r=n.scriptId,i=this.state,o=i.activeTab,s=i.script,c="".concat(a?"Edit":"Add"," script"),l=a?"Update":"Create",u={container:{display:"flex",boxSizing:"border-box",justifyContent:"center"},form:{width:"780px"},fieldLeft:{marginRight:"12px"},fieldRight:{marginLeft:"12px"}};switch(o){case 0:e=y.a.createElement(z,{scriptId:r,onEditScreenClick:this.handleEditScreenClick});break;case 1:e=y.a.createElement(H,{scriptId:r,onEditDiagnosisClick:this.handleEditDiagnosisClick});break;default:e=null}var d=y.a.createElement("div",{style:{marginTop:"24px"}},y.a.createElement(k.Tabs,{activeTab:o,onChange:function(e){return t.setState({activeTab:e})},ripple:!0},y.a.createElement(k.Tab,null,"Screens"),y.a.createElement(k.Tab,null,"Diagnosis")),y.a.createElement("section",null,e));return y.a.createElement("div",{style:u.container},y.a.createElement("div",null,y.a.createElement(k.Card,{shadow:0,style:u.form},y.a.createElement(w.a,{leftNavIcon:"arrow_back",title:c,onLeftNavItemClicked:this.handleBackClick}),y.a.createElement(k.CardText,null,y.a.createElement(k.Textfield,{style:{width:"100%"},floatingLabel:!0,label:"Title",required:!0,onChange:this.handleInputChange.bind(this,"title"),value:s.title}),y.a.createElement(k.Textfield,{style:{width:"100%"},floatingLabel:!0,label:"Description",value:s.description,onChange:this.handleInputChange.bind(this,"description")}),y.a.createElement(N.a,null,a?y.a.createElement(k.Button,{style:D()({},u.fieldLeft),onClick:this.handleSubmitClick.bind(this,"apply"),raised:!0,ripple:!0},"Apply"):null,y.a.createElement(k.Button,{style:D()({},u.fieldRight),onClick:this.handleSubmitClick.bind(this,"update"),raised:!0,accent:!0,ripple:!0},l)))),a?d:null))}}]),t}(E.Component);J.propTypes={actions:S.a.object.isRequired,history:S.a.object.isRequired,isEditMode:S.a.bool.isRequired,scriptId:S.a.string.isRequired,script:S.a.object},n.d(t,"ScriptEditor",function(){return K});var K=function(e){function t(){var e,n;r()(this,t);for(var a=arguments.length,i=new Array(a),o=0;o<a;o++)i[o]=arguments[o];return n=c()(this,(e=u()(t)).call.apply(e,[this].concat(i))),g()(p()(n),"state",{}),n}return h()(t,e),o()(t,[{key:"componentWillMount",value:function(){var e=this,t=this.props,n=t.scriptId,a=t.actions;n&&"new"!==n&&(this.setState({loadingScript:!0}),a.get("get-script",{id:n,onResponse:function(){return e.setState({loadingScript:!1})},onFailure:function(t){return e.setState({loadScriptError:t})},onSuccess:function(t){var n=t.payload;e.setState({script:n.script}),a.updateApiData({script:n.script})}}))}},{key:"componentWillUnmount",value:function(){this.props.actions.updateApiData({script:null})}},{key:"render",value:function(){return this.state.loadingScript?y.a.createElement(T.a,{className:"ui__flex ui__justifyContent_center"}):y.a.createElement(J,this.props)}}]),t}(y.a.Component);K.propTypes={actions:S.a.object,scriptId:S.a.string.isRequired,isEditMode:S.a.bool.isRequired};t.default=Object(C.hot)(Object(_.f)(Object(b.a)(K,function(e,t){return{script:e.apiData.script,scriptId:t.match.params.scriptId,isEditMode:!!e.apiData.script}})))}}]);