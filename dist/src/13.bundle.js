(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{264:function(e,t,a){"use strict";a.r(t),function(e){var n,r=a(0),o=a.n(r),i=a(419),c=a(22),l=a(366),s=a(367),d=a(420);(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&n(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var u,f,p=function(){return Object(c.b)(i.a.PAGE_TITLE),Object(c.c)("settings"),o.a.createElement(o.a.Fragment,null,o.a.createElement("div",null,o.a.createElement(l.a,null,o.a.createElement(s.a,null,o.a.createElement(d.a,null)))))},g=p;t.default=g,(u="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(u.register(p,"SettingsPage","/home/farai/WorkBench/neotree-editor/src/containers/SettingsPage/index.js"),u.register(g,"default","/home/farai/WorkBench/neotree-editor/src/containers/SettingsPage/index.js")),(f="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&f(e)}.call(this,a(8)(e))},365:function(e,t,a){"use strict";var n=a(3),r=a(1),o=a(0),i=(a(2),a(4)),c=a(7),l=[0,1,2,3,4,5,6,7,8,9,10],s=["auto",!0,1,2,3,4,5,6,7,8,9,10,11,12];function d(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,a=parseFloat(e);return"".concat(a/t).concat(String(e).replace(String(a),"")||"px")}var u=o.forwardRef((function(e,t){var a=e.alignContent,c=void 0===a?"stretch":a,l=e.alignItems,s=void 0===l?"stretch":l,d=e.classes,u=e.className,f=e.component,p=void 0===f?"div":f,g=e.container,m=void 0!==g&&g,v=e.direction,b=void 0===v?"row":v,y=e.item,x=void 0!==y&&y,h=e.justify,j=void 0===h?"flex-start":h,E=e.lg,O=void 0!==E&&E,w=e.md,G=void 0!==w&&w,S=e.sm,H=void 0!==S&&S,L=e.spacing,k=void 0===L?0:L,C=e.wrap,W=void 0===C?"wrap":C,M=e.xl,P=void 0!==M&&M,K=e.xs,B=void 0!==K&&K,z=e.zeroMinWidth,A=void 0!==z&&z,N=Object(n.a)(e,["alignContent","alignItems","classes","className","component","container","direction","item","justify","lg","md","sm","spacing","wrap","xl","xs","zeroMinWidth"]),I=Object(i.a)(d.root,u,m&&[d.container,0!==k&&d["spacing-xs-".concat(String(k))]],x&&d.item,A&&d.zeroMinWidth,"row"!==b&&d["direction-xs-".concat(String(b))],"wrap"!==W&&d["wrap-xs-".concat(String(W))],"stretch"!==s&&d["align-items-xs-".concat(String(s))],"stretch"!==c&&d["align-content-xs-".concat(String(c))],"flex-start"!==j&&d["justify-xs-".concat(String(j))],!1!==B&&d["grid-xs-".concat(String(B))],!1!==H&&d["grid-sm-".concat(String(H))],!1!==G&&d["grid-md-".concat(String(G))],!1!==O&&d["grid-lg-".concat(String(O))],!1!==P&&d["grid-xl-".concat(String(P))]);return o.createElement(p,Object(r.a)({className:I,ref:t},N))})),f=Object(c.a)((function(e){return Object(r.a)({root:{},container:{boxSizing:"border-box",display:"flex",flexWrap:"wrap",width:"100%"},item:{boxSizing:"border-box",margin:"0"},zeroMinWidth:{minWidth:0},"direction-xs-column":{flexDirection:"column"},"direction-xs-column-reverse":{flexDirection:"column-reverse"},"direction-xs-row-reverse":{flexDirection:"row-reverse"},"wrap-xs-nowrap":{flexWrap:"nowrap"},"wrap-xs-wrap-reverse":{flexWrap:"wrap-reverse"},"align-items-xs-center":{alignItems:"center"},"align-items-xs-flex-start":{alignItems:"flex-start"},"align-items-xs-flex-end":{alignItems:"flex-end"},"align-items-xs-baseline":{alignItems:"baseline"},"align-content-xs-center":{alignContent:"center"},"align-content-xs-flex-start":{alignContent:"flex-start"},"align-content-xs-flex-end":{alignContent:"flex-end"},"align-content-xs-space-between":{alignContent:"space-between"},"align-content-xs-space-around":{alignContent:"space-around"},"justify-xs-center":{justifyContent:"center"},"justify-xs-flex-end":{justifyContent:"flex-end"},"justify-xs-space-between":{justifyContent:"space-between"},"justify-xs-space-around":{justifyContent:"space-around"},"justify-xs-space-evenly":{justifyContent:"space-evenly"}},function(e,t){var a={};return l.forEach((function(n){var r=e.spacing(n);0!==r&&(a["spacing-".concat(t,"-").concat(n)]={margin:"-".concat(d(r,2)),width:"calc(100% + ".concat(d(r),")"),"& > $item":{padding:d(r,2)}})})),a}(e,"xs"),e.breakpoints.keys.reduce((function(t,a){return function(e,t,a){var n={};s.forEach((function(e){var t="grid-".concat(a,"-").concat(e);if(!0!==e)if("auto"!==e){var r="".concat(Math.round(e/12*1e8)/1e6,"%");n[t]={flexBasis:r,flexGrow:0,maxWidth:r}}else n[t]={flexBasis:"auto",flexGrow:0,maxWidth:"none"};else n[t]={flexBasis:0,flexGrow:1,maxWidth:"100%"}})),"xs"===a?Object(r.a)(e,n):e[t.breakpoints.up(a)]=n}(t,e,a),t}),{}))}),{name:"MuiGrid"})(u);t.a=f},366:function(e,t,a){"use strict";var n=a(1),r=a(3),o=a(0),i=(a(2),a(4)),c=a(236),l=a(7),s=o.forwardRef((function(e,t){var a=e.classes,l=e.className,s=e.raised,d=void 0!==s&&s,u=Object(r.a)(e,["classes","className","raised"]);return o.createElement(c.a,Object(n.a)({className:Object(i.a)(a.root,l),elevation:d?8:1,ref:t},u))}));t.a=Object(l.a)({root:{overflow:"hidden"}},{name:"MuiCard"})(s)},367:function(e,t,a){"use strict";var n=a(1),r=a(3),o=a(0),i=(a(2),a(4)),c=a(7),l=o.forwardRef((function(e,t){var a=e.classes,c=e.className,l=e.component,s=void 0===l?"div":l,d=Object(r.a)(e,["classes","className","component"]);return o.createElement(s,Object(n.a)({className:Object(i.a)(a.root,c),ref:t},d))}));t.a=Object(c.a)({root:{padding:16,"&:last-child":{paddingBottom:24}}},{name:"MuiCardContent"})(l)},419:function(e,t,a){"use strict";(function(e){var a;(a="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&a(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var n,r,o={PAGE_TITLE:"Settings"};t.a=o,(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&n.register(o,"default","/home/farai/WorkBench/neotree-editor/src/constants/copy/settings.js"),(r="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&r(e)}).call(this,a(8)(e))},420:function(e,t,a){"use strict";(function(e){var n,r=a(24),o=a.n(r),i=a(0),c=a.n(i),l=a(27),s=a(470),d=a(84),u=a(101),f=a(422),p=a.n(f),g=a(365),m=a(246),v=a(241),b=a(240),y=a(242),x=a(421);(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&n(e);var h="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e},j=function(){var e=c.a.useRef(null),t=c.a.useState(!1),a=o()(t,2),n=a[0],r=a[1],i=c.a.useState(null),f=o()(i,2),h=f[0],j=f[1],E=c.a.useState(null),O=o()(E,2),w=O[0],G=O[1],S=c.a.useState(!1),H=o()(S,2),L=H[0],k=H[1],C=c.a.useState(!1),W=o()(C,2),M=W[0],P=W[1],K=c.a.useState(""),B=o()(K,2),z=B[0],A=B[1];c.a.useEffect((function(){x.b().then((function(e){var t=e.apiKey;r(!0),A(t||"")})).catch((function(e){r(!0),j(e)}))}),[]);var N=function(){P(!0),x.a({apiKey:z}).then((function(e){var t=e.apiKey;P(!1),A(t)})).catch((function(e){P(!1),G(e)}))};return c.a.createElement(c.a.Fragment,null,c.a.createElement(l.a,{variant:"h6"},"Api keys"),c.a.createElement("br",null),n?c.a.createElement(c.a.Fragment,null,h?c.a.createElement(l.a,{color:"error"},h.msg||h.message||JSON.stringify(h)):c.a.createElement(c.a.Fragment,null,c.a.createElement(g.a,{container:!0,spacing:2,alignItems:"center"},c.a.createElement(g.a,{item:!0,xs:12,sm:4},c.a.createElement(s.a,{inputRef:e,value:z?z.key:"",disabled:!z||M,placeholder:"API KEY",fullWidth:!0,onChange:function(){},onFocus:function(e){e.target.select(),document.execCommand("copy")}})),c.a.createElement(g.a,{item:!0,xs:12,sm:8},z?c.a.createElement(c.a.Fragment,null,c.a.createElement(u.a,{size:"small",onClick:function(){return e.current.focus()}},c.a.createElement(p.a,{fontSize:"small"})),"  ",c.a.createElement("a",{href:"/api/download-api-config",target:"__blank",style:{textDecoration:"none",outline:"none !important"}},c.a.createElement(d.a,{size:"small",color:"primary"},"Download api config file")),"  "):null,z?null:c.a.createElement(d.a,{variant:"contained",color:"primary",disabled:M,onClick:function(){G(null),z?k(!0):N()}},"Genarate Api Key")),w?c.a.createElement(l.a,{color:"error",variant:"caption"},w.msg||w.message||JSON.stringify(w)):null))):c.a.createElement(y.a,{size:20}),c.a.createElement(m.a,{open:L,onClose:function(){return k(!1)}},c.a.createElement(b.a,null,c.a.createElement(l.a,null,"Are you sure you want to change the existing api key?")),c.a.createElement(v.a,null,c.a.createElement(d.a,{onClick:function(){k(!1)}},"No"),c.a.createElement(d.a,{color:"primary",onClick:function(){N(),k(!1)}},"Yes"))))};h(j,"useRef{inputRef}\nuseState{[initialised, setInitialised](false)}\nuseState{[initError, setInitErrror](null)}\nuseState{[keyGenError, setKeyGenError](null)}\nuseState{[openConfirmKeyGenModal, setOpenConfirmKeyGenModal](false)}\nuseState{[generatingKey, setGeneratingKey](false)}\nuseState{[apiKey, setApiKey]('')}\nuseEffect{}");var E,O,w=j;t.a=w,(E="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(E.register(j,"ApiKey","/home/farai/WorkBench/neotree-editor/src/containers/SettingsPage/ApiKey.js"),E.register(w,"default","/home/farai/WorkBench/neotree-editor/src/containers/SettingsPage/ApiKey.js")),(O="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&O(e)}).call(this,a(8)(e))},421:function(e,t,a){"use strict";(function(e){a.d(t,"b",(function(){return f})),a.d(t,"a",(function(){return p}));var n,r=a(11),o=a.n(r),i=a(64);function c(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?c(Object(a),!0).forEach((function(t){o()(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):c(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&n(e);"undefined"!=typeof reactHotLoaderGlobal&&reactHotLoaderGlobal.default.signature;var s,d,u=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/initialise-data",l({body:e},t))},f=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/api/key",l({body:e},t))},p=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/api/generate-key",l({method:"POST",body:e},t))},g=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/export-to-firebase",l({method:"POST",body:e},t))},m=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return Object(i.a)("/import-firebase",l({method:"POST",body:e},t))};(s="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(s.register(u,"initialiseApp","/home/farai/WorkBench/neotree-editor/src/api/app/index.js"),s.register(f,"getApiKey","/home/farai/WorkBench/neotree-editor/src/api/app/index.js"),s.register(p,"generateApiKey","/home/farai/WorkBench/neotree-editor/src/api/app/index.js"),s.register(g,"exportToFirebase","/home/farai/WorkBench/neotree-editor/src/api/app/index.js"),s.register(m,"importFirebase","/home/farai/WorkBench/neotree-editor/src/api/app/index.js")),(d="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&d(e)}).call(this,a(8)(e))},422:function(e,t,a){"use strict";var n=a(33);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var r=n(a(0)),o=(0,n(a(158)).default)(r.default.createElement("path",{d:"M2 5c-.55 0-1 .45-1 1v15c0 1.1.9 2 2 2h15c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1-.45-1-1V6c0-.55-.45-1-1-1zm19-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm-1 16H8c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z"}),"FilterNoneRounded");t.default=o}}]);