(window.webpackJsonp=window.webpackJsonp||[]).push([[21],{408:function(t,n,e){"use strict";e.r(n),e.d(n,"List",function(){return A});var s=e(19),r=e.n(s),a=e(20),i=e.n(a),c=e(21),o=e.n(c),p=e(22),u=e.n(p),l=e(25),f=e.n(l),d=e(23),h=e.n(d),S=e(24),y=e.n(S),v=e(0),m=e.n(v),w=e(2),g=e.n(w),b=e(26),k=e(12),_=e(41),j=e(52),A=function(t){function n(){var t,e;r()(this,n);for(var s=arguments.length,a=new Array(s),i=0;i<s;i++)a[i]=arguments[i];return e=o()(this,(t=u()(n)).call.apply(t,[this].concat(a))),y()(f()(e),"state",{}),e}return h()(n,t),i()(n,[{key:"componentWillMount",value:function(){var t=this,n=this.props.actions;this.setState({loadingScripts:!0}),n.get("get-scripts",{onResponse:function(){return t.setState({loadingScripts:!1})},onFailure:function(n){return t.setState({loadScriptsError:n})},onSuccess:function(e){var s=e.payload;t.setState({scripts:s.scripts}),n.updateApiData({scripts:s.scripts})}})}},{key:"componentWillUnmount",value:function(){this.props.actions.updateApiData({scripts:[]})}},{key:"render",value:function(){return this.state.loadingScripts?m.a.createElement(j.a,{className:"ui__flex ui__justifyContent_center"}):m.a.createElement("h1",null,"Scripts")}}]),n}(m.a.Component);A.propTypes={scripts:g.a.array},n.default=Object(b.hot)(Object(k.f)(Object(_.a)(A,function(t){return{scripts:t.apiData.scripts||[]}})))}}]);