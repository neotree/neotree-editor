(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{347:function(e,t,n){"use strict";var r=n(1),a=n(55),i=n(3),o=n(0),c=n(4),l=(n(2),n(215)),u=n(6),s=n(38),d=n(71),f=n(58),m=n(14),p=o.forwardRef((function(e,t){var n=e.children,u=e.classes,p=e.className,E=e.collapsedHeight,v=e.collapsedSize,g=void 0===v?"0px":v,h=e.component,y=void 0===h?"div":h,b=e.disableStrictModeCompat,w=void 0!==b&&b,O=e.in,j=e.onEnter,x=e.onEntered,T=e.onEntering,I=e.onExit,S=e.onExited,D=e.onExiting,R=e.style,A=e.timeout,_=void 0===A?s.b.standard:A,L=e.TransitionComponent,P=void 0===L?l.a:L,C=Object(i.a)(e,["children","classes","className","collapsedHeight","collapsedSize","component","disableStrictModeCompat","in","onEnter","onEntered","onEntering","onExit","onExited","onExiting","style","timeout","TransitionComponent"]),N=Object(f.a)(),k=o.useRef(),H=o.useRef(null),B=o.useRef(),M="number"==typeof(E||g)?"".concat(E||g,"px"):E||g;o.useEffect((function(){return function(){clearTimeout(k.current)}}),[]);var W=N.unstable_strictMode&&!w,F=o.useRef(null),U=Object(m.a)(t,W?F:void 0),z=function(e){return function(t,n){if(e){var r=W?[F.current,t]:[t,n],i=Object(a.a)(r,2),o=i[0],c=i[1];void 0===c?e(o):e(o,c)}}},J=z((function(e,t){e.style.height=M,j&&j(e,t)})),q=z((function(e,t){var n=H.current?H.current.clientHeight:0,r=Object(d.a)({style:R,timeout:_},{mode:"enter"}).duration;if("auto"===_){var a=N.transitions.getAutoHeightDuration(n);e.style.transitionDuration="".concat(a,"ms"),B.current=a}else e.style.transitionDuration="string"==typeof r?r:"".concat(r,"ms");e.style.height="".concat(n,"px"),T&&T(e,t)})),V=z((function(e,t){e.style.height="auto",x&&x(e,t)})),X=z((function(e){var t=H.current?H.current.clientHeight:0;e.style.height="".concat(t,"px"),I&&I(e)})),Y=z(S),G=z((function(e){var t=H.current?H.current.clientHeight:0,n=Object(d.a)({style:R,timeout:_},{mode:"exit"}).duration;if("auto"===_){var r=N.transitions.getAutoHeightDuration(t);e.style.transitionDuration="".concat(r,"ms"),B.current=r}else e.style.transitionDuration="string"==typeof n?n:"".concat(n,"ms");e.style.height=M,D&&D(e)}));return o.createElement(P,Object(r.a)({in:O,onEnter:J,onEntered:V,onEntering:q,onExit:X,onExited:Y,onExiting:G,addEndListener:function(e,t){var n=W?e:t;"auto"===_&&(k.current=setTimeout(n,B.current||0))},nodeRef:W?F:void 0,timeout:"auto"===_?null:_},C),(function(e,t){return o.createElement(y,Object(r.a)({className:Object(c.a)(u.root,u.container,p,{entered:u.entered,exited:!O&&"0px"===M&&u.hidden}[e]),style:Object(r.a)({minHeight:M},R),ref:U},t),o.createElement("div",{className:u.wrapper,ref:H},o.createElement("div",{className:u.wrapperInner},n)))}))}));p.muiSupportAuto=!0,t.a=Object(u.a)((function(e){return{root:{height:0,overflow:"hidden",transition:e.transitions.create("height")},entered:{height:"auto",overflow:"visible"},hidden:{visibility:"hidden"},wrapper:{display:"flex"},wrapperInner:{width:"100%"}}}),{name:"MuiCollapse"})(p)},397:function(e,t,n){"use strict";n.r(t);var r=n(10),a=n.n(r),i=n(20),o=n.n(i),c=n(0),l=n.n(c),u=n(2),s=n.n(u),d=n(347),f=n(385),m=n(138),p=function(e){var t=e.children,n=e.events;return n=n||{},l.a.useEffect((function(){var e=function(e){return Object.keys(n).forEach((function(t){var r=n[t];r&&window[e](t,r,!0)}))};return e("addEventListener"),function(){e("removeEventListener")}})),l.a.createElement(l.a.Fragment,null,t)};p.propTypes={children:s.a.any,events:s.a.object};var E=p,v=n(219),g=n(137),h=n(12),y=n.n(h),b=n(5),w=n.n(b),O=n(129);function j(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function x(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?j(Object(n),!0).forEach((function(t){a()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):j(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var T=y()((function(){return{actionsWrap:{textAlign:"right"},actions:{display:"flex",justifyContent:"flex-end",alignItems:"center"}}})),I=function(e){var t=e.copy,n=l.a.useState({authType:"sign-in",emailRegistration:{},form:{email:"",password:"",password2:""}}),r=o()(n,2),a=r[0],i=r[1],c=function(e){return i((function(t){return x(x({},t),"function"==typeof e?e(t):e)}))},u=function(e){return c((function(t){return{form:x(x({},t.form),"function"==typeof e?e(t.form):e)}}))},s=a.loading,p=a.authType,h=a.authenticateError,y=a.emailRegistration,b=a.form,j=b.email,I=b.password,S=b.password2,D=function(){var e=!s&&j;if(y.userId){var t=I&&(!!y.activated||I===S);e=e&&t}return!e},R=function(){D()||(c({loading:!0,authenticateError:null}),Object(O.a)(p,{id:y.userId,username:j,password:I,password2:S}).then((function(){window.location.href="/"})).catch((function(e){c({loading:!1,authenticateError:e})})))},A=function(){c({loading:!0,authenticateError:null}),Object(O.b)({email:j}).then((function(e){c({loading:!1,emailRegistration:e,authType:e.userId&&!e.activated?"sign-up":"sign-in"})})).catch((function(e){return c({loading:!1,authenticateError:e})}))},_=T(),L=y.errors||h,P=function(e){return l.a.createElement("div",{className:w()(_.actionsWrap)},!!L&&L.map((function(e,t){var n=t;return l.a.createElement("div",{key:n},l.a.createElement(g.a,{color:"error",variant:"caption"},e))})),l.a.createElement("div",{className:w()(_.actions)},e))},C=s?l.a.createElement(v.a,{color:"secondary",size:20}):null;return l.a.createElement(l.a.Fragment,null,l.a.createElement(E,{events:{keyup:function(e){if(13===e.keyCode)return y.userId?void R():A()}}},l.a.createElement("div",null,l.a.createElement(f.a,{fullWidth:!0,variant:"outlined",type:"email",name:"email",value:j||"",label:t.EMAIL_ADDRESS_INPUT_LABEL,onChange:function(e){return u({email:e.target.value})}})),l.a.createElement("br",null),l.a.createElement(d.a,{in:!y.userId},P(l.a.createElement(l.a.Fragment,null,l.a.createElement(m.a,{disableElevation:!0,size:"large",color:"primary",variant:"contained",endIcon:C,onClick:function(){return A()},disabled:D()},t.VERIFY_EMAIL_ADDRESS_BUTTON_TEXT)))),l.a.createElement(d.a,{in:!!y.userId},l.a.createElement("div",null,l.a.createElement("div",null,l.a.createElement(f.a,{fullWidth:!0,variant:"outlined",type:"password",name:"password",value:I||"",label:t.PASSWORD_INPUT_LABEL,onChange:function(e){return u({password:e.target.value})}})),l.a.createElement("br",null),"sign-up"===p&&l.a.createElement(l.a.Fragment,null,l.a.createElement("br",null),l.a.createElement("div",null,l.a.createElement(f.a,{fullWidth:!0,variant:"outlined",type:"password",name:"password2",value:S||"",label:t.PASSWORD_INPUT_LABEL,onChange:function(e){return u({password2:e.target.value})}})),l.a.createElement("br",null)),P(l.a.createElement(l.a.Fragment,null,l.a.createElement(m.a,{disableElevation:!0,size:"large",color:"primary",variant:"contained",endIcon:C,onClick:function(){return R()},disabled:D()},t.SUBMIT_BUTTON_LABEL)))))))};I.propTypes={copy:s.a.object.isRequired};t.default=I}}]);