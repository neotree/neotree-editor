(window.webpackJsonp=window.webpackJsonp||[]).push([[21],{398:function(e,t,n){"use strict";n.r(t);var r=n(10),a=n.n(r),o=n(9),i=n.n(o),c=n(0),l=n.n(c),u=n(28),p={VERIFY_EMAIL_ADDRESS_BUTTON_TEXT:"Continue",EMAIL_ADDRESS_INPUT_LABEL:"Email address",PASSWORD_INPUT_LABEL:"Password",CONFIRM_PASSWORD_INPUT_LABEL:"Confirm password","sign-in":{PAGE_TITLE:"Sign in",FORM_TITLE:"Sign in",SUBMIT_BUTTON_LABEL:"Sign in"},"sign-up":{PAGE_TITLE:"Sign up",FORM_TITLE:"Sign up",SUBMIT_BUTTON_LABEL:"Sign up"},"forgot-password":{PAGE_TITLE:"Forgot password?",FORM_TITLE:"Forgot password?",SUBMIT_BUTTON_LABEL:"Submit"},"change-password":{PAGE_TITLE:"Change password",FORM_TITLE:"Change password",SUBMIT_BUTTON_LABEL:"Submit"}},s=n(12),E=n.n(s),d=n(5),T=n.n(d),g=n(252),b=n(137),m=n(127),O=n(15),f=n(25);function h(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function _(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?h(Object(n),!0).forEach((function(t){a()(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):h(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var L=Object(u.a)((function(){return Promise.all([n.e(0),n.e(1),n.e(17)]).then(n.bind(null,399))})),w=Object(u.a)((function(){return n.e(20).then(n.bind(null,385))})),I=Object(u.a)((function(){return n.e(19).then(n.bind(null,386))})),S=function(e){return l.a.createElement(L,i()({},e,{authType:"sign-in"}))},P=E()((function(e){return{root:{position:"fixed",top:0,left:0,width:"100%",height:"100%",overlay:"auto",display:"flex",backgroundColor:e.palette.background.default},rootInner:{margin:"auto",width:"100%"},header:{textAlign:"center",margin:e.spacing()},paper:{margin:"25px auto",padding:e.spacing(2)},paperWidth:{width:"90%",maxWidth:350}}}));t.default=function(){var e=Object(O.h)().authType,t=P(),n=_(_({},p),e?p[e]:null);Object(f.b)(n.PAGE_TITLE);var r={authType:e,copy:n};return l.a.createElement(l.a.Fragment,null,l.a.createElement("div",{className:T()(t.root)},l.a.createElement("div",{className:T()(t.rootInner)},l.a.createElement(g.a,{className:T()(t.paper,t.paperWidth)},l.a.createElement("div",{className:T()(t.header)},l.a.createElement(m.a,null),l.a.createElement("br",null),l.a.createElement(b.a,{variant:"button"},n.FORM_TITLE)),l.a.createElement("br",null),l.a.createElement(O.d,null,l.a.createElement(O.b,{exact:!0,path:"/sign-in",render:function(e){return l.a.createElement(S,i()({},e,r))}}),l.a.createElement(O.b,{exact:!0,path:"/forgot-password",render:function(e){return l.a.createElement(w,i()({},e,r))}}),l.a.createElement(O.b,{exact:!0,path:"/change-password",render:function(e){return l.a.createElement(I,i()({},e,r))}}),l.a.createElement(O.b,{path:"/",render:function(){return l.a.createElement(O.a,{to:"/sign-in"})}}))))))}}}]);