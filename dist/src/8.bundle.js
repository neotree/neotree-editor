(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{132:function(e,t,n){var r=n(143),a=n(144),i=n(145);e.exports=function(e,t){return r(e)||a(e,t)||i()}},135:function(e,t,n){"use strict";var r=n(0),a=function(){return Object(r.useReducer)(function(e){return!e},!1)[1]};t.a=function(e,t){for(var n=arguments.length,i=new Array(n>2?n-2:0),c=2;c<n;c++)i[c-2]=arguments[c];var o=[],l=t,u=function(t){l=e(l,t),o.forEach(function(e){return e()})},s=function(){var e=a();return Object(r.useEffect)(function(){var t=function(){return e()};o.push(t),t();return function(){var e=o.indexOf(t);o.splice(e,1)}},[]),[l,u].concat(i)};return s}},143:function(e,t){e.exports=function(e){if(Array.isArray(e))return e}},144:function(e,t){e.exports=function(e,t){var n=[],r=!0,a=!1,i=void 0;try{for(var c,o=e[Symbol.iterator]();!(r=(c=o.next()).done)&&(n.push(c.value),!t||n.length!==t);r=!0);}catch(e){a=!0,i=e}finally{try{r||null==o.return||o.return()}finally{if(a)throw i}}return n}},145:function(e,t){e.exports=function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}},146:function(e,t,n){"use strict";var r=n(0),a=n.n(r),i=n(2),c=function(e){var t=e.children,n=e.options;n=n||{allScripts:!0,allConfigKeys:!0};var r="";return Object.keys(n).forEach(function(e,t){r+="".concat(e,"=").concat(n[e]),t<Object.keys(n).length-1&&(r+="&")}),a.a.createElement("a",{target:"_blank",style:{color:"inherit",textDecoration:"none",fontWeight:"inherit"},rel:"noopener noreferrer",href:"/export-data?".concat(r)},t||"Export")};c.propTypes={options:n.n(i).a.object},t.a=c},183:function(e,t,n){"use strict";var r=n(3),a=n.n(r),i=n(135),c={UPDATE:"UPDATE",updateState:function(e){return{type:"UPDATE",partialState:e}}},o={scripts:[]};t.a=Object(i.a)(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:o,t=arguments.length>1?arguments[1]:void 0;if(t.type===c.UPDATE){var n=a()({},e);return a()({},e,{},"function"==typeof t.partialState?t.partialState(n):t.partialState)}return e},o,c)},406:function(e,t,n){"use strict";n.r(t);var r=n(10),a=n.n(r),i=n(132),c=n.n(i),o=n(0),l=n.n(o),u=n(2),s=n.n(u),p=n(26),d=n(12),f=n(183),m=n(42),h=n(52),E=n(3),g=n.n(E),y=n(43),b=n.n(y),v=n(19),S=n.n(v),D=n(20),C=n.n(D),x=n(21),_=n.n(x),w=n(22),k=n.n(w),T=n(25),j=n.n(T),A=n(23),O=n.n(A),I=n(24),B=n.n(I),N=n(120),P=n(123),F=n(146),z=function(e){function t(e){var n;return S()(this,t),n=_()(this,k()(t).call(this,e)),B()(j()(n),"toggleClipboardPasteBox",function(){return n.setState({openClipboardPasteBox:!n.state.openClipboardPasteBox})}),B()(j()(n),"handleAddScriptClick",function(){return n.props.history.push("/dashboard/scripts/new")}),B()(j()(n),"handleEditScriptClick",function(e){return n.props.history.push("/dashboard/scripts/".concat(e))}),B()(j()(n),"handleDeleteClick",function(){var e=n.props.updateState,t=n.state.scriptIdForAction;n.setState({deletingScript:!0}),m.a.post("/delete-script",{id:t}).catch(function(e){return n.setState({deleteScriptError:e,deletingScript:!1})}).then(function(){n.setState({deletingScript:!1}),e(function(e){return{scripts:e.scripts.filter(function(e){return e.id!==t})}}),n.closeDeleteConfirmDialog()})}),B()(j()(n),"handleDuplicateScript",function(e){var t=n.props.updateState;n.setState({duplicatingScript:!0}),m.a.post("/duplicate-script",{id:e}).catch(function(e){return n.setState({duplicateScriptError:e,duplicatingScript:!1})}).then(function(r){var a=r.payload;n.setState({duplicatingScript:!1}),t(function(t){var n=b()(t.scripts),r=n.map(function(t,n){return t.id===e?n:null}).filter(function(e){return null!==e})[0]||0;return n.splice(r+1,0,a.script),{scripts:n}})})}),B()(j()(n),"openDeleteConfirmDialog",function(e){return n.setState(g()({},n.state,{openDeleteConfirmDialog:!0,scriptIdForAction:e}))}),B()(j()(n),"closeDeleteConfirmDialog",function(){return n.setState(g()({},n.state,{openDeleteConfirmDialog:!1,scriptIdForAction:null,deleteScriptError:null}))}),n.state={openDeleteConfirmDialog:!1,scriptIdForAction:null},n}return O()(t,e),C()(t,[{key:"render",value:function(){var e=this,t=this.props.scripts,n=this.state,r=n.deletingScript,a=n.deleteScriptError,i={container:{display:"flex",boxSizing:"border-box",justifyContent:"center",height:"100%"},table:{width:"640px"},fab:{position:"fixed",bottom:24,right:24,zIndex:900}},c=l.a.createElement(N.Dialog,{open:this.state.openDeleteConfirmDialog},[l.a.createElement(N.DialogTitle,null,"Delete"),l.a.createElement(N.DialogContent,null,r?l.a.createElement(h.a,{className:"ui__flex ui__justifyContent_center"}):l.a.createElement("div",null,a?l.a.createElement("div",{className:"ui__dangerColor"},a.msg||a.message||JSON.stringify(a)):l.a.createElement("p",null,"Are you sure you want to delete this configuration key?"))),r?null:l.a.createElement(N.DialogActions,null,l.a.createElement(N.Button,{type:"button",onClick:this.handleDeleteClick,accent:!0},"Delete"),l.a.createElement(N.Button,{type:"button",onClick:this.closeDeleteConfirmDialog},"Cancel"))].map(function(e,t){return e&&l.a.cloneElement(e,{key:t})})),o=l.a.createElement("div",null,l.a.createElement(N.DataTable,{style:{width:"780px"},shadow:0,rows:t.map(function(e){return g()({id:e.id},e.data)})},l.a.createElement(N.TableHeader,{name:"title"},"Title"),l.a.createElement(N.TableHeader,{name:"description"},"Description"),l.a.createElement(N.TableHeader,{name:"id",style:{width:"64px"},cellFormatter:function(t,n,r){var a="more-user-action-menu".concat(r);return l.a.createElement("div",null,l.a.createElement("div",{style:{position:"relative",color:"#999999"},className:"ui__flex ui__alignItems_center"},l.a.createElement("div",{className:"ui__cursor_pointer",onClick:e.handleEditScriptClick.bind(e,t)},l.a.createElement(P.e,{style:{fontSize:"24px"}}))," ",l.a.createElement("div",{id:a,className:"ui__cursor_pointer"},l.a.createElement(P.i,{style:{fontSize:"24px"}})),l.a.createElement(N.Menu,{target:a,align:"right"},l.a.createElement(N.MenuItem,{onClick:e.openDeleteConfirmDialog.bind(e,t)},"Delete"),l.a.createElement(N.MenuItem,null,l.a.createElement(F.a,{options:{script:t}})))))}}))),u=l.a.createElement(N.Card,{shadow:0,style:{width:"320px"}},l.a.createElement(N.CardTitle,null,"There are no scripts"),l.a.createElement(N.CardText,null,l.a.createElement("span",null,"To create your first script click on the orange icon at the bottom right of the window."),l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement("br",null)));return l.a.createElement("div",null,l.a.createElement(N.FABButton,{style:i.fab,colored:!0,ripple:!0,onClick:this.handleAddScriptClick},l.a.createElement(P.a,null)),l.a.createElement("div",{style:i.container},t.length?o:u),c)}}]),t}(o.Component);z.propTypes={scripts:s.a.array.isRequired,actions:s.a.object.isRequired};var U=z,H=function(e){var t=Object(o.useState)(!1),n=c()(t,2),r=n[0],i=n[1],u=Object(o.useState)(null),s=c()(u,2),p=(s[0],s[1]),d=Object(f.a)(),E=c()(d,3),g=E[0].scripts,y=E[1],b=E[2];return Object(o.useEffect)(function(){i(!0),m.a.get("/get-scripts").then(function(e){return i(!1),e}).then(function(e){var t=e.payload;i(!1),y(b.updateState({scripts:t.scripts||[]}))}).catch(function(e){i(!1),p(e)})},[]),l.a.createElement("div",null,!g.length&&r&&l.a.createElement(h.a,{className:"ui__flex ui__justifyContent_center"}),!g.length&&r?null:l.a.createElement(U,a()({},e,{scripts:g,updateState:function(e){return y(b.updateState(e))}})))};H.propTypes={match:s.a.object};t.default=Object(p.hot)(Object(d.f)(H))}}]);