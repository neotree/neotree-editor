(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{138:function(e,t,n){"use strict";var a=n(10),r=n.n(a),i=n(16),o=n.n(i),c=n(19),s=n.n(c),l=n(20),u=n.n(l),p=n(21),d=n.n(p),f=n(22),m=n.n(f),h=n(25),y=n.n(h),g=n(23),v=n.n(g),E=n(24),S=n.n(E),C=n(0),_=n.n(C),b=n(2),D=n.n(b),k=n(34),T=n.n(k),w=n(121),x=n(41),A=(n(145),function(e){function t(){var e,n;s()(this,t);for(var a=arguments.length,r=new Array(a),i=0;i<a;i++)r[i]=arguments[i];return n=d()(this,(e=m()(t)).call.apply(e,[this].concat(r))),S()(y()(n),"onCopy",function(){n.input.select(),document.execCommand("copy"),n.input.blur()}),n}return v()(t,e),u()(t,[{key:"render",value:function(){var e=this,t=this.props,n=t.className,a=t.data,i=t.host,c=t.children,s=o()(t,["className","data","host","children"]);return _.a.createElement("div",r()({},s,{className:T()(n,"ui__copyToClipBoard"),style:Object.assign({},s.style,{position:"relative"})}),_.a.createElement("input",{ref:function(t){return e.input=t},value:JSON.stringify({neotree:{data:a,host:i}}),onChange:function(){return{}},style:{position:"absolute",zIndex:-1}}),_.a.createElement("div",{onClick:this.onCopy,className:"ui__copyToClipBoardBtn"},c||_.a.createElement(w.e,null)))}}]),t}(_.a.Component));A.propTypes={children:D.a.node,className:D.a.string,data:D.a.string.isRequired,style:D.a.object,host:D.a.string.isRequired},t.a=Object(x.a)(A,function(e){return{host:e.$APP.host}})},142:function(e,t,n){"use strict";var a=n(10),r=n.n(a),i=n(19),o=n.n(i),c=n(20),s=n.n(c),l=n(21),u=n.n(l),p=n(22),d=n.n(p),f=n(25),m=n.n(f),h=n(23),y=n.n(h),g=n(24),v=n.n(g),E=n(0),S=n.n(E),C=n(2),_=n.n(C),b=n(3),D=n.n(b),k=n(16),T=n.n(k),w=n(34),x=n.n(w),A=n(12),N=n(120),j=n(52),B=n(41),R=function(e){return new Promise(function(t,n){if(e){var a="Ooops! Seems like you pasted invalid content.";try{var r=JSON.parse(e);r.neotree&&r.neotree.data&&r.neotree.host?t(r.neotree):n(a)}catch(e){n(a)}}else n("No data copied to clipboard")})},I=function(e){function t(){var e,n;o()(this,t);for(var a=arguments.length,r=new Array(a),i=0;i<a;i++)r[i]=arguments[i];return n=u()(this,(e=d()(t)).call.apply(e,[this].concat(r))),v()(m()(n),"state",{content:""}),v()(m()(n),"onClose",function(){n.setState({error:null}),n.props.onClose()}),v()(m()(n),"validateAndSave",function(e){if(n.setState({error:null}),e){var t=n.props,a=t.actions,r=t.host,i=t.destination,o=t.history,c=t.redirectTo,s=t.onSuccess,l=t.accept;R(e).then(function(e){var t=e.data,u=T()(e,["data"]),p=(t=JSON.parse(t)).dataType===l;if(!p)return alert("You can only paste a '".concat(l,"' here, you pasted a '").concat(t.dataType,"' instead."));n.setState({saving:!0},p?function(){a.post("copy-data",{destination:D()({host:r},i),source:D()({},u,{},t),onResponse:function(){return n.setState({saving:!1})},onFailure:function(e){return n.setState({error:e})},onSuccess:function(e){var t=e.payload;o.push(c(t)),s&&s(t)}})}:void 0)}).catch(function(e){return n.setState({error:{msg:e.msg||e.message||JSON.stringify(e)}})})}}),n}return y()(t,e),s()(t,[{key:"componentWillUpdate",value:function(e){e.clipboardData!==this.props.clipboardData&&this.validateAndSave(e.clipboardData)}},{key:"render",value:function(){var e=this,t=this.props.open,n=this.state,a=n.saving,r=n.content,i=n.error;return S.a.createElement(N.Dialog,{open:t||!1,style:{width:"260px"}},a?S.a.createElement(N.DialogContent,null,S.a.createElement("div",{className:x()("ui__flex ui__alignItems_center ui__justifyContent_center")},S.a.createElement(j.a,null))):S.a.createElement(S.a.Fragment,null,S.a.createElement(N.DialogContent,{className:x()("ui__flex ui__alignItems_center ui__justifyContent_center uiBg__faintGreyColor"),style:{border:"1px dotted #ccc",position:"relative"}},S.a.createElement("span",null,"Paste here"),S.a.createElement("textarea",{autoFocus:!0,ref:function(t){return e.input=t},onChange:function(t){return e.validateAndSave(t.target.value)},value:r,style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",zIndex:10,opacity:0}})),S.a.createElement(N.DialogActions,null,i?S.a.createElement("span",{className:"ui__dangerColor ui__smallFontSize",style:{marginRight:"auto"}},i.msg||i.message||JSON.stringify(i)):null,S.a.createElement(N.Button,{type:"button",onClick:this.onClose},"Cancel"))))}}]),t}(S.a.Component);I.propTypes={open:_.a.bool,onClose:_.a.func.isRequired,options:_.a.object,actions:_.a.object.isRequired,destination:_.a.object.isRequired,host:_.a.string.isRequired,redirectTo:_.a.func.isRequired,onSuccess:_.a.func,accept:_.a.string.isRequired};var O=Object(A.f)(Object(B.a)(I,function(e){return{host:e.$APP.host}})),q=function(e){function t(){var e,n;o()(this,t);for(var a=arguments.length,r=new Array(a),i=0;i<a;i++)r[i]=arguments[i];return n=u()(this,(e=d()(t)).call.apply(e,[this].concat(r))),v()(m()(n),"state",{}),v()(m()(n),"onPaste",function(e){var t=e.clipboardData.getData("text/plain");R(t).then(function(){return n.setState({togglePasteBoard:!0,clipboardData:t})})}),n}return y()(t,e),s()(t,[{key:"componentDidMount",value:function(){window.addEventListener("paste",this.onPaste,!0)}},{key:"componentWillUnmount",value:function(){window.removeEventListener("paste",this.onPaste,!0)}},{key:"render",value:function(){var e=this.props,t=e.children,n=e.modal,a=e.data,i=e.redirectTo,o=e.onSuccess,c=e.accept;return S.a.createElement("div",null,t,S.a.createElement(O,r()({},n,{accept:c,onSuccess:o,clipboardData:this.state.clipboardData,destination:a,redirectTo:i})))}}]),t}(E.Component);q.propTypes={children:_.a.node,modal:_.a.shape({onClose:_.a.func.isRequired,open:_.a.bool}).isRequired,data:_.a.shape({dataId:_.a.string,dataType:_.a.string}).isRequired,redirectTo:_.a.func.isRequired,onSuccess:_.a.func,accept:_.a.string.isRequired};t.a=q},145:function(e,t,n){var a=n(146);"string"==typeof a&&(a=[[e.i,a,""]]);var r={hmr:!0,transform:void 0,insertInto:void 0};n(27)(a,r);a.locals&&(e.exports=a.locals)},146:function(e,t,n){(e.exports=n(14)(!1)).push([e.i,".ui__copyToClipBoard {\n  display: inline-block; }\n  .ui__copyToClipBoard input {\n    -webkit-transform: scale(0);\n            transform: scale(0); }\n  .ui__copyToClipBoard .ui__copyToClipBoardBtn {\n    display: inline;\n    position: relative; }\n",""])},147:function(e,t,n){"use strict";var a=n(0),r=n.n(a),i=n(2),o=function(e){var t=e.children,n=e.options;n=n||{allScripts:!0,allConfigKeys:!0};var a="";return Object.keys(n).forEach(function(e,t){a+="".concat(e,"=").concat(n[e]),t<Object.keys(n).length-1&&(a+="&")}),r.a.createElement("a",{target:"_blank",style:{color:"inherit",textDecoration:"none",fontWeight:"inherit"},rel:"noopener noreferrer",href:"/export-data?".concat(a)},t||"Export")};o.propTypes={options:n.n(i).a.object},t.a=o},405:function(e,t,n){"use strict";n.r(t);var a=n(19),r=n.n(a),i=n(20),o=n.n(i),c=n(21),s=n.n(c),l=n(22),u=n.n(l),p=n(25),d=n.n(p),f=n(23),m=n.n(f),h=n(24),y=n.n(h),g=n(0),v=n.n(g),E=n(2),S=n.n(E),C=n(26),_=n(12),b=n(41),D=n(52),k=n(3),T=n.n(k),w=n(42),x=n.n(w),A=n(120),N=n(121),j=n(138),B=n(142),R=n(147),I=function(e){function t(e){var n;return r()(this,t),n=s()(this,u()(t).call(this,e)),y()(d()(n),"togglePasteBoard",function(){return n.setState({openPasteBoard:!n.state.openPasteBoard})}),y()(d()(n),"handleAddScriptClick",function(){return n.props.history.push("/dashboard/scripts/new")}),y()(d()(n),"handleEditScriptClick",function(e){return n.props.history.push("/dashboard/scripts/".concat(e))}),y()(d()(n),"handleDeleteClick",function(){var e=n.props.actions,t=n.state.scriptIdForAction;n.setState({deletingScript:!0}),e.post("delete-script",{id:t,onResponse:function(){return n.setState({deletingScript:!1})},onFailure:function(e){return n.setState({deleteScriptError:e})},onSuccess:function(){e.updateApiData(function(e){return{scripts:e.scripts.filter(function(e){return e.id!==t})}}),n.closeDeleteConfirmDialog()}})}),y()(d()(n),"handleDuplicateScript",function(e){var t=n.props.actions;n.setState({duplicatingScript:!0}),t.post("duplicate-script",{id:e,onResponse:function(){return n.setState({duplicatingScript:!1})},onFailure:function(e){return n.setState({duplicateScriptError:e})},onSuccess:function(n){var a=n.payload;t.updateApiData(function(t){var n=x()(t.scripts),r=n.map(function(t,n){return t.id===e?n:null}).filter(function(e){return null!==e})[0]||0;return n.splice(r+1,0,a.script),{scripts:n}})}})}),y()(d()(n),"openDeleteConfirmDialog",function(e){return n.setState(T()({},n.state,{openDeleteConfirmDialog:!0,scriptIdForAction:e}))}),y()(d()(n),"closeDeleteConfirmDialog",function(){return n.setState(T()({},n.state,{openDeleteConfirmDialog:!1,scriptIdForAction:null,deleteScriptError:null}))}),n.state={openDeleteConfirmDialog:!1,scriptIdForAction:null},n}return m()(t,e),o()(t,[{key:"render",value:function(){var e=this,t=this.props.scripts,n=this.state,a=n.deletingScript,r=n.deleteScriptError,i={container:{display:"flex",boxSizing:"border-box",justifyContent:"center",height:"100%"},table:{width:"640px"},fab:{position:"fixed",bottom:24,right:24,zIndex:900}},o=v.a.createElement(A.Dialog,{open:this.state.openDeleteConfirmDialog},[v.a.createElement(A.DialogTitle,null,"Delete"),v.a.createElement(A.DialogContent,null,a?v.a.createElement(D.a,{className:"ui__flex ui__justifyContent_center"}):v.a.createElement("div",null,r?v.a.createElement("div",{className:"ui__dangerColor"},r.msg||r.message||JSON.stringify(r)):v.a.createElement("p",null,"Are you sure you want to delete this configuration key?"))),a?null:v.a.createElement(A.DialogActions,null,v.a.createElement(A.Button,{type:"button",onClick:this.handleDeleteClick,accent:!0},"Delete"),v.a.createElement(A.Button,{type:"button",onClick:this.closeDeleteConfirmDialog},"Cancel"))].map(function(e,t){return e&&v.a.cloneElement(e,{key:t})})),c=v.a.createElement("div",null,v.a.createElement(A.DataTable,{style:{width:"780px"},shadow:0,rows:t.map(function(e){return T()({id:e.id},e.data)})},v.a.createElement(A.TableHeader,{name:"title"},"Title"),v.a.createElement(A.TableHeader,{name:"description"},"Description"),v.a.createElement(A.TableHeader,{name:"id",style:{width:"64px"},cellFormatter:function(t,n,a){var r="more-user-action-menu".concat(a);return v.a.createElement("div",null,v.a.createElement("div",{style:{position:"relative",color:"#999999"},className:"ui__flex ui__alignItems_center"},v.a.createElement("div",{className:"ui__cursor_pointer",onClick:e.handleEditScriptClick.bind(e,t)},v.a.createElement(N.f,{style:{fontSize:"24px"}}))," ",v.a.createElement("div",{id:r,className:"ui__cursor_pointer"},v.a.createElement(N.j,{style:{fontSize:"24px"}})),v.a.createElement(A.Menu,{target:r,align:"right"},v.a.createElement(A.MenuItem,{onClick:e.openDeleteConfirmDialog.bind(e,t)},"Delete"),v.a.createElement(A.MenuItem,{onClick:function(){return e.handleDuplicateScript(t)}},"Duplicate"),v.a.createElement(A.MenuItem,null,v.a.createElement(j.a,{data:JSON.stringify({dataId:t,dataType:"script"})},v.a.createElement("span",null,"Copy"))),v.a.createElement(A.MenuItem,null,v.a.createElement(R.a,{options:{script:t}})))))}}))),s=v.a.createElement(A.Card,{shadow:0,style:{width:"320px"}},v.a.createElement(A.CardTitle,null,"There are no scripts"),v.a.createElement(A.CardText,null,v.a.createElement("span",null,"To create your first script click on the orange icon at the bottom right of the window."),v.a.createElement("br",null),v.a.createElement("br",null),v.a.createElement("br",null)));return v.a.createElement(B.a,{modal:{onClose:this.togglePasteBoard,open:this.state.openPasteBoard},accept:"script",data:{},redirectTo:function(e){return"/dashboard/scripts/".concat(e.script.id)}},v.a.createElement(A.FABButton,{style:i.fab,colored:!0,ripple:!0,onClick:this.handleAddScriptClick},v.a.createElement(N.a,null)),v.a.createElement("div",{style:i.container},t.length?c:s),o)}}]),t}(g.Component);I.propTypes={scripts:S.a.array.isRequired,actions:S.a.object.isRequired};var O=I;n.d(t,"List",function(){return q});var q=function(e){function t(){var e,n;r()(this,t);for(var a=arguments.length,i=new Array(a),o=0;o<a;o++)i[o]=arguments[o];return n=s()(this,(e=u()(t)).call.apply(e,[this].concat(i))),y()(d()(n),"state",{}),n}return m()(t,e),o()(t,[{key:"componentWillMount",value:function(){var e=this,t=this.props.actions;this.setState({loadingScripts:!0}),t.get("get-scripts",{onResponse:function(){return e.setState({loadingScripts:!1})},onFailure:function(t){return e.setState({loadScriptsError:t})},onSuccess:function(n){var a=n.payload;e.setState({scripts:a.scripts}),t.updateApiData({scripts:a.scripts})}})}},{key:"componentWillUnmount",value:function(){this.props.actions.updateApiData({scripts:[]})}},{key:"render",value:function(){return this.state.loadingScripts?v.a.createElement(D.a,{className:"ui__flex ui__justifyContent_center"}):v.a.createElement(O,this.props)}}]),t}(v.a.Component);q.propTypes={scripts:S.a.array};t.default=Object(C.hot)(Object(_.f)(Object(b.a)(q,function(e){return{scripts:e.apiData.scripts||[]}})))}}]);