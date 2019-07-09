(window.webpackJsonp=window.webpackJsonp||[]).push([[22],{399:function(e,t,n){"use strict";n.r(t);var a=n(19),o=n.n(a),i=n(20),l=n.n(i),r=n(21),c=n.n(r),s=n(22),u=n.n(s),f=n(25),g=n.n(f),y=n(23),m=n.n(y),d=n(24),p=n.n(d),C=n(0),h=n.n(C),E=n(2),K=n.n(E),b=n(26),D=n(12),v=n(41),S=n(52),k=n(42),w=n.n(k),_=n(3),x=n.n(_),A=n(120),T=n(123),F=function(e){function t(e){var n;return o()(this,t),n=c()(this,u()(t).call(this,e)),p()(g()(n),"handleInputChange",function(e,t){return n.setState(x()({},n.state,p()({},e,t.target.value)))}),p()(g()(n),"handleCreateClick",function(){var e=n.props.actions,t=n.state,a=t.configKey,o=t.label,i=t.summary;n.setState({creatingConfigKey:!0}),e.post("create-config-key",{data:JSON.stringify({configKey:a,label:o,summary:i}),onResponse:function(){return n.setState({creatingConfigKey:!1})},onFailure:function(e){return n.setState({createConfigKeyError:e})},onSuccess:function(t){var a=t.payload;e.updateApiData(function(e){return{configKeys:[a.configKey].concat(w()(e.configKeys))}}),n.closeCreateConfigKeyDialog()}})}),p()(g()(n),"handleDeleteClick",function(){var e=n.props.actions,t=n.state.configKeyIdForAction;n.setState({deletingConfigKey:!0}),e.post("delete-config-key",{id:t,onResponse:function(){return n.setState({deletingConfigKey:!1})},onFailure:function(e){return n.setState({deleteConfigKeyError:e})},onSuccess:function(){e.updateApiData(function(e){return{configKeys:e.configKeys.filter(function(e){return e.id!==t})}}),n.closeDeleteConfirmDialog()}})}),p()(g()(n),"openCreateConfigKeyDialog",function(){return n.setState(x()({},n.state,{openCreateConfigKeyDialog:!0}))}),p()(g()(n),"closeCreateConfigKeyDialog",function(){return n.setState(x()({},n.state,{openCreateConfigKeyDialog:!1,configKey:"",label:"",summary:""}))}),p()(g()(n),"openDeleteConfirmDialog",function(e){return n.setState(x()({},n.state,{openDeleteConfirmDialog:!0,configKeyIdForAction:e}))}),p()(g()(n),"closeDeleteConfirmDialog",function(){return n.setState(x()({},n.state,{openDeleteConfirmDialog:!1,configKeyIdForAction:null,deleteScriptError:null,createConfigKeyError:null}))}),n.state={openDeleteConfirmDialog:!1,openCreateConfigKeyDialog:!1,configKeyIdForAction:"",configKey:"",label:"",summary:""},n}return m()(t,e),l()(t,[{key:"render",value:function(){var e=this,t=this.props.configKeys,n=this.state,a=n.configKey,o=n.label,i=n.summary,l=n.deletingConfigKey,r=n.deleteConfigKeyError,c=n.creatingConfigKey,s=n.createConfigKeyError,u={container:{display:"flex",boxSizing:"border-box",justifyContent:"center",height:"100%"},table:{width:"780px"},fab:{position:"fixed",bottom:24,right:24,zIndex:900}},f=h.a.createElement(A.Dialog,{open:this.state.openCreateConfigKeyDialog,style:{width:"540px"}},h.a.createElement(A.DialogContent,null,h.a.createElement(A.Textfield,{style:{width:"100%"},floatingLabel:!0,label:"Key",onChange:this.handleInputChange.bind(this,"configKey"),value:a}),h.a.createElement(A.Textfield,{style:{width:"100%"},floatingLabel:!0,label:"Label",onChange:this.handleInputChange.bind(this,"label"),value:o}),h.a.createElement(A.Textfield,{style:{width:"100%"},floatingLabel:!0,label:"Summary",onChange:this.handleInputChange.bind(this,"summary"),value:i}),s?h.a.createElement("div",{className:"ui__dangerColor ui__textAlign_center"},s.msg||s.message||JSON.stringify(s)):null),h.a.createElement(A.DialogActions,null,[c?null:h.a.createElement(A.Button,{type:"button",onClick:this.handleCreateClick,accent:!0},"Create"),c?null:h.a.createElement(A.Button,{type:"button",onClick:this.closeCreateConfigKeyDialog},"Cancel"),c?h.a.createElement(S.a,{size:25}):null].map(function(e,t){return e&&h.a.cloneElement(e,{key:t})}))),g=h.a.createElement(A.Dialog,{open:this.state.openDeleteConfirmDialog},[h.a.createElement(A.DialogContent,null,l?h.a.createElement(S.a,{className:"ui__flex ui__justifyContent_center"}):h.a.createElement("div",null,r?h.a.createElement("div",{className:"ui__dangerColor"},r.msg||r.message||JSON.stringify(r)):h.a.createElement("p",null,"Are you sure you want to delete this configuration key?"))),l?null:h.a.createElement(A.DialogActions,null,h.a.createElement(A.Button,{type:"button",onClick:this.handleDeleteClick,accent:!0},"Delete"),h.a.createElement(A.Button,{type:"button",onClick:this.closeDeleteConfirmDialog},"Cancel"))].map(function(e,t){return e&&h.a.cloneElement(e,{key:t})})),y=h.a.createElement("div",null,h.a.createElement(A.DataTable,{style:{width:"780px"},shadow:0,rows:t.map(function(e){return x()({id:e.id},e.data)})},h.a.createElement(A.TableHeader,{name:"configKey"},"Key"),h.a.createElement(A.TableHeader,{name:"label"},"Label"),h.a.createElement(A.TableHeader,{name:"summary"},"Summary"),h.a.createElement(A.TableHeader,{name:"id",style:{width:"32px"},cellFormatter:function(t){return h.a.createElement("div",null,h.a.createElement("div",{className:"ui__cursor_pointer",style:{position:"relative",color:"#999999"},onClick:e.openDeleteConfirmDialog.bind(e,t)},h.a.createElement(T.d,{style:{fontSize:"24px"}})))}}))),m=h.a.createElement(A.Card,{shadow:0,style:{width:"420px"}},h.a.createElement(A.CardTitle,null,"There are no configuration keys"),h.a.createElement(A.CardText,null,h.a.createElement("span",null,"To create your first configuration key click on the orange icon at the bottom right of the window."),h.a.createElement("br",null),h.a.createElement("br",null),h.a.createElement("br",null)));return h.a.createElement("div",null,h.a.createElement(A.FABButton,{style:u.fab,colored:!0,ripple:!0,onClick:this.openCreateConfigKeyDialog},h.a.createElement(T.a,{style:{fontSize:"24px"}})),h.a.createElement("div",{style:u.container},t&&t.length>0?y:m),f,g)}}]),t}(C.Component);n.d(t,"ConfigKeys",function(){return I});var I=function(e){function t(){var e,n;o()(this,t);for(var a=arguments.length,i=new Array(a),l=0;l<a;l++)i[l]=arguments[l];return n=c()(this,(e=u()(t)).call.apply(e,[this].concat(i))),p()(g()(n),"state",{}),n}return m()(t,e),l()(t,[{key:"componentWillMount",value:function(){var e=this,t=this.props.actions;this.setState({loadingConfigKeys:!0}),t.get("get-config-keys",{onResponse:function(){return e.setState({loadingConfigKeys:!1})},onFailure:function(t){return e.setState({loadConfigKeysError:t})},onSuccess:function(n){var a=n.payload;e.setState({configKeys:a.configKeys}),t.updateApiData({configKeys:a.configKeys})}})}},{key:"componentWillUnmount",value:function(){this.props.actions.updateApiData({configKeys:[]})}},{key:"render",value:function(){return this.state.loadingConfigKeyss?h.a.createElement(S.a,{className:"ui__flex ui__justifyContent_center"}):h.a.createElement("div",null,h.a.createElement(F,this.props))}}]),t}(h.a.Component);I.propTypes={actions:K.a.object};t.default=Object(b.hot)(Object(D.f)(Object(v.a)(I,function(e){return{configKeys:e.apiData.configKeys||[]}})))}}]);