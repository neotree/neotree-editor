(window.webpackJsonp=window.webpackJsonp||[]).push([[16],{260:function(e,t,r){"use strict";r.r(t),function(e){var a,n=r(33),o=r.n(n),c=r(45),l=r.n(c),i=r(23),s=r.n(i),u=r(0),d=r.n(u),p=r(6),f=r(236),m=r(444),b=r(398),g=r(64),v=r(130),h=r(397);(a="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&a(e);var y="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},E=function(){return d.a.createElement("div",{style:{margin:25,textAlign:"center"}},d.a.createElement(f.a,null))},S=Object(v.a)((function(){return Promise.all([r.e(2),r.e(11)]).then(r.bind(null,432))}),{LoaderComponent:E}),L=Object(v.a)((function(){return Promise.all([r.e(2),r.e(10)]).then(r.bind(null,436))}),{LoaderComponent:E});function k(){var e=Object(p.g)(),t=Object(p.h)(),r=t.scriptId,a=t.scriptSection,n=d.a.useState(null),c=s()(n,2),i=c[0],u=c[1],f=d.a.useState(!1),v=s()(f,2),y=v[0],E=v[1],k=d.a.useState(!1),H=s()(k,2),j=H[0],G=H[1],O=d.a.useState(a||"screens"),w=s()(O,2),x=w[0],C=w[1];return d.a.useEffect((function(){l()(o.a.mark((function e(){var t,a,n;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(G(!0),"new"===r){e.next=16;break}return e.prev=2,e.next=5,fetch("/get-script?scriptId=".concat(r));case 5:return t=e.sent,e.next=8,t.json();case 8:a=e.sent,n=a.script,u(n),e.next=16;break;case 13:e.prev=13,e.t0=e.catch(2),alert(e.t0.message);case 16:E(!0),G(!1);case 18:case"end":return e.stop()}}),e,null,[[2,13]])})))()}),[]),y?d.a.createElement(d.a.Fragment,null,d.a.createElement(h.a,{script:i}),d.a.createElement("br",null),i?d.a.createElement(d.a.Fragment,null,d.a.createElement(m.a,{centered:!0,value:x,indicatorColor:"primary",textColor:"primary",onChange:function(t,r){C(r),e.push("/scripts/".concat(i.scriptId,"/").concat(r))}},d.a.createElement(b.a,{value:"screens",label:"Screens"}),d.a.createElement(b.a,{value:"diagnoses",label:"Diagnoses"})),"screens"===x&&d.a.createElement(S,{script:i}),"diagnoses"===x&&d.a.createElement(L,{script:i})):null,j&&d.a.createElement(g.a,null)):d.a.createElement(g.a,null)}y(k,"useHistory{history}\nuseParams{{ scriptId, scriptSection: _scriptSection }}\nuseState{[script, setScript](null)}\nuseState{[scriptInitialised, setScriptInitialised](false)}\nuseState{[loadingScript, setLoadingScript](false)}\nuseState{[scriptSection, setScriptSection](_scriptSection || 'screens')}\nuseEffect{}",(function(){return[p.g,p.h]}));var H,j,G=k;t.default=G,(H="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(H.register(E,"LoaderComponent","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/index.js"),H.register(S,"Screens","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/index.js"),H.register(L,"Diagnoses","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/index.js"),H.register(k,"ScriptPage","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/index.js"),H.register(G,"default","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/index.js")),(j="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&j(e)}.call(this,r(8)(e))},315:function(e,t,r){"use strict";(function(e){r.d(t,"a",(function(){return g}));var a,n,o,c=r(0),l=r.n(c),i=r(2),s=r.n(i),u=r(365),d=r(102),p=r(27),f=r(337),m=r.n(f),b=r(6);function g(e){var t=e.backLink,r=e.title,a=Object(b.g)();return l.a.createElement(l.a.Fragment,null,l.a.createElement(u.a,{container:!0,alignItems:"center",spacing:1},l.a.createElement(u.a,{item:!0,xs:1,sm:1},l.a.createElement(d.a,{onClick:function(){return t?a.push(t):a.goBack()}},l.a.createElement(m.a,null))),l.a.createElement(u.a,{item:!0,xs:11,sm:11},l.a.createElement(p.a,{variant:"h5"},r))))}(a="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&a(e),("undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e})(g,"useHistory{history}",(function(){return[b.g]})),g.propTypes={title:s.a.node,backLink:s.a.string},(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&n.register(g,"TitleWithBackArrow","/home/farai/WorkBench/neotree-editor/src/components/TitleWithBackArrow.js"),(o="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&o(e)}).call(this,r(8)(e))},336:function(e,t,r){"use strict";(function(e){var a,n=r(9),o=r.n(n),c=r(13),l=r.n(c),i=r(0),s=r.n(i),u=r(2),d=r.n(u),p=r(5),f=r.n(p),m=r(14),b=r.n(m),g=r(360);(a="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&a(e);var v="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},h=b()((function(e){return{backgroundColor:function(t){var r=t.color,a=e.palette[r]?e.palette[r].main:null;return a?{backgroundColor:a}:{}}}})),y=s.a.forwardRef(v((function(e,t){var r=e.className,a=e.color,n=l()(e,["className","color"]),c=h({color:a});return s.a.createElement(s.a.Fragment,null,s.a.createElement(g.a,o()({},n,{ref:t,className:f()(r,c.backgroundColor)})))}),"useStyles{classes}",(function(){return[h]})));y.propTypes={className:d.a.string};var E,S,L=y;t.a=L,(E="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(E.register(h,"useStyles","/home/farai/WorkBench/neotree-editor/src/components/Divider.js"),E.register(y,"Divider","/home/farai/WorkBench/neotree-editor/src/components/Divider.js"),E.register(L,"default","/home/farai/WorkBench/neotree-editor/src/components/Divider.js")),(S="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&S(e)}).call(this,r(8)(e))},397:function(e,t,r){"use strict";(function(e){var a,n=r(33),o=r.n(n),c=r(45),l=r.n(c),i=r(11),s=r.n(i),u=r(23),d=r.n(u),p=r(0),f=r.n(p),m=r(2),b=r.n(m),g=r(366),v=r(367),h=r(463),y=r(470),E=r(474),S=r(472),L=r(6),k=r(336),H=r(27),j=r(462),G=r(61),O=r(315),w=r(64),x=r(21);function C(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function P(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?C(Object(r),!0).forEach((function(t){s()(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):C(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function W(e){var t=e.script,r=Object(x.d)().state.viewMode,a=Object(L.g)(),n=f.a.useState(P({},t)),c=d()(n,2),i=c[0],s=c[1],u=function(e){return s((function(t){return P(P({},t),"function"==typeof e?e(t):e)}))},p=f.a.useState(!1),m=d()(p,2),b=m[0],C=m[1],W=f.a.useCallback((function(){l()(o.a.mark((function e(){var r;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return C(!0),e.prev=1,e.next=4,fetch(t?"/update-script":"/create-script",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify(i)});case 4:return r=e.sent,e.next=7,r.json();case 7:(r=e.sent).errors&&r.errors.length?alert(JSON.stringify(r.errors)):a.push("/scripts".concat(t?"":"/".concat(r.script.script_id))),e.next=14;break;case 11:e.prev=11,e.t0=e.catch(1),alert("Ooops... ".concat(e.t0.message));case 14:C(!1);case 15:case"end":return e.stop()}}),e,null,[[1,11]])})))()}));return f.a.createElement(f.a.Fragment,null,f.a.createElement(g.a,null,f.a.createElement(v.a,null,f.a.createElement(O.a,{backLink:"/scripts",title:"".concat(t?"Edit":"Add"," script")}),f.a.createElement("br",null),f.a.createElement("br",null),f.a.createElement("div",null,f.a.createElement(y.a,{fullWidth:!0,required:!0,error:!i.title,value:i.title||"",label:"Title",onChange:function(e){return u({title:e.target.value})}})),f.a.createElement("br",null),f.a.createElement("div",null,f.a.createElement(y.a,{fullWidth:!0,value:i.printTitle||"",label:"Print title",onChange:function(e){return u({printTitle:e.target.value})}})),f.a.createElement("br",null),f.a.createElement("div",null,f.a.createElement(y.a,{fullWidth:!0,value:i.description||"",label:"Description",onChange:function(e){return u({description:e.target.value})}})),f.a.createElement("br",null),f.a.createElement("br",null),f.a.createElement(H.a,{variant:"button",color:"primary"},"Type"),f.a.createElement(k.a,{color:"primary"}),f.a.createElement("br",null),f.a.createElement(E.a,{name:"type",value:i.type||"",onChange:function(e){var t=e.target.value;u({type:t})}},[{name:"admission",label:"Admission"},{name:"discharge",label:"Discharge"}].map((function(e){return f.a.createElement(j.a,{key:e.name,value:e.name,control:f.a.createElement(S.a,null),label:e.label})})))),f.a.createElement(h.a,{style:{justifyContent:"flex-end"}},"view"===r&&f.a.createElement(H.a,{color:"error",variant:"caption"},"Can't save because you're in view mode"),f.a.createElement(G.a,{color:"primary",onClick:function(){return W()},disabled:"view"===r||!(i.title&&!b)},"Save"))),b?f.a.createElement(w.a,null):null)}(a="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&a(e),("undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e})(W,"useAppContext{{ state: { viewMode } }}\nuseHistory{history}\nuseState{[form, _setForm]({ ...script })}\nuseState{[savingScript, setSavingScript](false)}\nuseCallback{saveScript}",(function(){return[x.d,L.g]})),W.propTypes={script:b.a.object};var B,D,T=W;t.a=T,(B="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(B.register(W,"ScriptEditorForm","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/Form/index.js"),B.register(T,"default","/home/farai/WorkBench/neotree-editor/src/containers/ScriptPage/Form/index.js")),(D="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&D(e)}).call(this,r(8)(e))}}]);