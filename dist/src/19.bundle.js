(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{406:function(e,n,t){"use strict";t.r(n),t.d(n,"ScreenEditor",function(){return k});var r=t(19),a=t.n(r),c=t(20),s=t.n(c),i=t(21),o=t.n(i),u=t(22),p=t.n(u),d=t(25),l=t.n(d),f=t(23),h=t.n(f),m=t(24),S=t.n(m),v=t(0),w=t.n(v),y=t(2),b=t.n(y),g=t(26),E=t(12),I=t(41),j=t(52),k=function(e){function n(){var e,t;a()(this,n);for(var r=arguments.length,c=new Array(r),s=0;s<r;s++)c[s]=arguments[s];return t=o()(this,(e=p()(n)).call.apply(e,[this].concat(c))),S()(l()(t),"state",{}),t}return h()(n,e),s()(n,[{key:"componentWillMount",value:function(){var e=this,n=this.props,t=n.screenId,r=n.actions;t&&"new"!==t&&(this.setState({loadingScreen:!0}),r.get("get-screen",{id:t,onResponse:function(){return e.setState({loadingScreen:!1})},onFailure:function(n){return e.setState({loadScreenError:n})},onSuccess:function(n){var t=n.payload;e.setState({screen:t.screen}),r.updateApiData({screen:t.screen})}}))}},{key:"componentWillUnmount",value:function(){this.props.actions.updateApiData({screen:null})}},{key:"render",value:function(){return this.state.loadingScreens?w.a.createElement(j.a,{className:"ui__flex ui__justifyContent_center"}):w.a.createElement("h1",null,"Screen Editor")}}]),n}(w.a.Component);k.propTypes={actions:b.a.object,screenId:b.a.string.isRequired,isEditMode:b.a.bool.isRequired},n.default=Object(g.hot)(Object(E.f)(Object(I.a)(k,function(e,n){return{screen:e.apiData.screen,screenId:n.match.params.screenId,scriptId:n.match.params.scriptId,isEditMode:!!e.apiData.screen}})))}}]);