(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{202:function(t,e,r){"use strict";r.d(e,"b",(function(){return m})),r.d(e,"a",(function(){return P}));var n=r(13),c=r.n(n),o=r(20),i=r.n(o),a=r(0),u=r.n(a),s=r(244),p=r(204);function f(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function O(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?f(Object(r),!0).forEach((function(e){c()(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):f(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}var b=r(9),l=r.n(b),d=r(82);function v(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function y(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?v(Object(r),!0).forEach((function(e){c()(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):v(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function j(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function g(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?j(Object(r),!0).forEach((function(e){c()(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):j(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}var h=u.a.createContext(null),m=function(){return u.a.useContext(h)},P=function(t){return function(e){var r=Object(s.a)(),n=r.match.params,c=n.scriptId,o=n.scriptSection,a=u.a.useState({scriptSection:o||"screens",form:{}}),f=i()(a,2),b=f[0],v=f[1],j=function(t){return v((function(e){return g(g({},e),"function"==typeof t?t(e):t)}))},m=function(t){return v((function(e){return g(g({},e),{},{form:g(g({},e.form),"function"==typeof t?t(e.form):t)})}))},P=function(t){var e=t.setState;return function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};e({loadingScript:!0});var r=function(t,r){e((function(e){var n=e.form;return O(O({initialiseScriptError:t,scriptInitialised:!0,loadingScript:!1},r),{},{form:O(O({},n),t?{}:r.script?r.script.data:{})})}))};p.f(t).then((function(t){return r(t.errors,t)})).catch(r)}}({setState:j}),S=function(t){var e=t.setState,r=t.router,n=r.history,c=r.match.params.scriptId,o=t.state,i=o.script,a=o.form;return function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=t.redirectOnSuccess,o=l()(t,["redirectOnSuccess"]),u=!1!==r;e({savingScript:!0});var s=function(t,r){t&&alert("Error(s):\n".concat(Object(d.a)(t))),e((function(e){var n=e.form;return{saveScriptError:t,savingScript:!1,form:y(y({},n),t?{}:r.script?r.script.data:{})}}))},f=i?p.h:p.c,O=JSON.stringify(y(y({},a),o));f(y(y({script_id:c,type:a.type},i),{},{data:O})).then((function(t){u&&t.script&&n.push("/scripts".concat(i?"":"/".concat(t.script.id))),s(t.errors,t)})).catch(s)}}({setState:j,state:b,router:r});u.a.useEffect((function(){j({scriptInitialised:"new"!==c,script:null,form:{}}),"new"!==c&&P({id:c})}),[c]);var w=b.shouldSaveForm;return u.a.useEffect((function(){w&&(S({redirectOnSuccess:!1}),j({shouldSaveForm:!1}))}),[w]),u.a.createElement(h.Provider,{value:{state:b,setState:j,_setState:v,getScript:P,setForm:m,saveScript:S,canSaveScript:function(){return b.form.title&&!b.savingScript},isFormReady:function(){return"new"===c||!!b.script},setFormAndSave:function(t){m(t),j({shouldSaveForm:!0})}}},u.a.createElement(t,e))}}},204:function(t,e,r){"use strict";r.d(e,"g",(function(){return u})),r.d(e,"i",(function(){return s})),r.d(e,"d",(function(){return p})),r.d(e,"e",(function(){return f})),r.d(e,"f",(function(){return O})),r.d(e,"h",(function(){return b})),r.d(e,"c",(function(){return l})),r.d(e,"b",(function(){return d})),r.d(e,"a",(function(){return v}));var n=r(13),c=r.n(n),o=r(28);function i(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function a(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?i(Object(r),!0).forEach((function(e){c()(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}var u=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length>1?arguments[1]:void 0;return Object(o.a)("/get-scripts",a({body:t},e))},s=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length>1?arguments[1]:void 0;return Object(o.a)("/update-scripts",a({method:"POST",body:t},e))},p=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length>1?arguments[1]:void 0;return Object(o.a)("/delete-script",a({method:"POST",body:t},e))},f=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length>1?arguments[1]:void 0;return Object(o.a)("/duplicate-script",a({method:"POST",body:t},e))},O=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length>1?arguments[1]:void 0;return Object(o.a)("/get-script",a({body:t},e))},b=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length>1?arguments[1]:void 0;return Object(o.a)("/update-script",a({method:"POST",body:t},e))},l=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length>1?arguments[1]:void 0;return Object(o.a)("/create-script",a({method:"POST",body:t},e))},d=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length>1?arguments[1]:void 0;return Object(o.a)("/copy-screens",a({method:"POST",body:t},e))},v=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length>1?arguments[1]:void 0;return Object(o.a)("/copy-diagnoses",a({method:"POST",body:t},e))}},244:function(t,e,r){"use strict";var n=r(13),c=r.n(n),o=r(12),i=r(93),a=r.n(i);function u(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function s(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?u(Object(r),!0).forEach((function(e){c()(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):u(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}e.a=function(){var t=Object(o.h)(),e=Object(o.g)(),r=Object(o.j)(),n=a.a.parse(t.search);return{location:t,history:e,match:r,queryStringParsed:n,objectToQueryString:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return"?".concat(a.a.stringify(s(s({},n),t)))}}}},288:function(t,e,r){"use strict";r.r(e);var n=r(0),c=r.n(n),o=r(202),i=r(12),a=r(42),u=Object(a.a)((function(){return Promise.all([r.e(0),r.e(2),r.e(4),r.e(12)]).then(r.bind(null,299))})),s=Object(a.a)((function(){return Promise.all([r.e(0),r.e(2),r.e(1),r.e(3),r.e(6)]).then(r.bind(null,296))})),p=Object(a.a)((function(){return Promise.all([r.e(0),r.e(2),r.e(1),r.e(3),r.e(7)]).then(r.bind(null,297))}));e.default=Object(o.a)((function(){return c.a.createElement(c.a.Fragment,null,c.a.createElement(i.d,null,c.a.createElement(i.b,{exact:!0,path:"/scripts/:scriptId",component:u}),c.a.createElement(i.b,{exact:!0,path:"/scripts/:scriptId/:scriptSection",component:u}),c.a.createElement(i.b,{exact:!0,path:"/scripts/:scriptId/screens/:screenId",component:s}),c.a.createElement(i.b,{exact:!0,path:"/scripts/:scriptId/diagnoses/:diagnosisId",component:p}),c.a.createElement(i.b,{path:"*",render:function(){return c.a.createElement(i.a,{to:""})}})))}))}}]);