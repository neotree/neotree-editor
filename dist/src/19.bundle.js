(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{407:function(t,n,i){"use strict";i.r(n),i.d(n,"ScriptEditor",function(){return _});var e=i(19),r=i.n(e),a=i(20),c=i.n(a),s=i(21),o=i.n(s),p=i(22),u=i.n(p),l=i(25),d=i.n(l),f=i(23),h=i.n(f),S=i(24),m=i.n(S),v=i(0),w=i.n(v),y=i(2),b=i.n(y),g=i(26),E=i(12),j=i(41),k=i(52),_=function(t){function n(){var t,i;r()(this,n);for(var e=arguments.length,a=new Array(e),c=0;c<e;c++)a[c]=arguments[c];return i=o()(this,(t=u()(n)).call.apply(t,[this].concat(a))),m()(d()(i),"state",{}),i}return h()(n,t),c()(n,[{key:"componentWillMount",value:function(){var t=this,n=this.props,i=n.scriptId,e=n.actions;i&&"new"!==i&&(this.setState({loadingScript:!0}),e.get("get-script",{id:i,onResponse:function(){return t.setState({loadingScript:!1})},onFailure:function(n){return t.setState({loadScriptError:n})},onSuccess:function(n){var i=n.payload;t.setState({script:i.script}),e.updateApiData({script:i.script})}}))}},{key:"componentWillUnmount",value:function(){this.props.actions.updateApiData({script:null})}},{key:"render",value:function(){return this.state.loadingScript?w.a.createElement(k.a,{className:"ui__flex ui__justifyContent_center"}):w.a.createElement("h1",null,"Script Editor")}}]),n}(w.a.Component);_.propTypes={actions:b.a.object,scriptId:b.a.string.isRequired,isEditMode:b.a.bool.isRequired},n.default=Object(g.hot)(Object(E.f)(Object(j.a)(_,function(t,n){return{script:t.apiData.script,scriptId:n.match.params.scriptId,isEditMode:!!t.apiData.script}})))}}]);