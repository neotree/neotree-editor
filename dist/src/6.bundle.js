(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{198:function(e,t){for(var n=[],r=0;r<256;++r)n[r]=(r+256).toString(16).substr(1);e.exports=function(e,t){var r=t||0,a=n;return[a[e[r++]],a[e[r++]],a[e[r++]],a[e[r++]],"-",a[e[r++]],a[e[r++]],"-",a[e[r++]],a[e[r++]],"-",a[e[r++]],a[e[r++]],"-",a[e[r++]],a[e[r++]],a[e[r++]],a[e[r++]],a[e[r++]],a[e[r++]]].join("")}},319:function(e,t,n){var r=n(320);"string"==typeof r&&(r=[[e.i,r,""]]);var a={hmr:!0,transform:void 0,insertInto:void 0};n(27)(r,a);r.locals&&(e.exports=r.locals)},320:function(e,t,n){(e.exports=n(13)(!1)).push([e.i,".ui__fileInput {\n  position: relative; }\n  .ui__fileInput input {\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    opacity: 0;\n    cursor: pointer; }\n",""])},321:function(e,t,n){"use strict";(function(e){n.d(t,"a",function(){return d});var r=n(16),a=n.n(r),i=n(19),o=n.n(i),s=n(20),u=n.n(s),c=n(24),l=n.n(c),f=n(322),p=n.n(f),d=function(){function t(n){var r=this,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};o()(this,t),l()(this,"_initRequest",function(){var t=r.xhr=new e.XMLHttpRequest;t.open("POST",r.url,!0),t.responseType="json"});var s=i.url,u=i.metadata,c=i.fieldname,f=i.preserveFilename,p=a()(i,["url","metadata","fieldname","preserveFilename"]);if(!n)throw new Error("MISSING: file!");if(!s)throw new Error("MISSING: url!");this.file=n,this.fieldname=c||"file",this.options=p,this.metadata=u||{},this.preserveFilename=f,this.url=s}return u()(t,[{key:"upload",value:function(){var e=this;return new Promise(function(t,n){if(!e.file)return n(new Error("File is required!"));var r=function(){e._initRequest(),e._initListeners(t,n),e._sendRequest()};e.file.type.match("image")?e.readImage(function(t,n){e.metadata=Object.assign({},e.metadata,n),r()}):r()})}},{key:"abort",value:function(){this.xhr&&this.xhr.abort()}},{key:"_initListeners",value:function(e,t){var n=this.xhr;n.addEventListener("error",this.options.onError||function(){return t({msg:"Failed to upload",status:n.status,statusText:n.statusText})}),n.addEventListener("abort",this.options.onAbort||function(){return t()}),n.addEventListener("progress",this.options.onProgress),n.addEventListener("readystatechange",function(){4===n.readyState&&200===n.status&&e(n.response)})}},{key:"_sendRequest",value:function(){var t=new e.FormData;t.append(this.fieldname,this.file),t.append("metadata",this.metadata),t.append("filename",this.preserveFilename?this.file.name:"".concat(p()(),"-").concat(this.file.name)),this.xhr.send(t)}},{key:"readImage",value:function(t){var n=new e.FileReader;n.onerror=t,n.onload=function(n){var r=new e.Image;r.src=n.target.result,r.onerror=t,r.onload=function(){return t(null,{width:r.width,height:r.height})}},n.readAsDataURL(this.file)}}]),t}()}).call(this,n(14))},322:function(e,t,n){"use strict";const r=n(323),a=n(325),i=function(){return r()};i.regex={v4:/^([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12})|(0{8}-0{4}-0{4}-0{4}-0{12})$/,v5:/^([a-f0-9]{8}-[a-f0-9]{4}-5[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12})|(0{8}-0{4}-0{4}-0{4}-0{12})$/},i.is=function(e){return!!e&&(i.regex.v4.test(e)||i.regex.v5.test(e))},i.empty=function(){return"00000000-0000-0000-0000-000000000000"},i.fromString=function(e){if(!e)throw new Error("Text is missing.");return a(e,"bb5d0ffa-9a4c-4d7c-8fc2-0a7d2220ba45")},e.exports=i},323:function(e,t,n){var r=n(324),a=n(198);e.exports=function(e,t,n){var i=t&&n||0;"string"==typeof e&&(t="binary"===e?new Array(16):null,e=null);var o=(e=e||{}).random||(e.rng||r)();if(o[6]=15&o[6]|64,o[8]=63&o[8]|128,t)for(var s=0;s<16;++s)t[i+s]=o[s];return t||a(o)}},324:function(e,t){var n="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof window.msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto);if(n){var r=new Uint8Array(16);e.exports=function(){return n(r),r}}else{var a=new Array(16);e.exports=function(){for(var e,t=0;t<16;t++)0==(3&t)&&(e=4294967296*Math.random()),a[t]=e>>>((3&t)<<3)&255;return a}}},325:function(e,t,n){var r=n(326),a=n(327);e.exports=r("v5",80,a)},326:function(e,t,n){var r=n(198);e.exports=function(e,t,n){var a=function(e,a,i,o){var s=i&&o||0;if("string"==typeof e&&(e=function(e){e=unescape(encodeURIComponent(e));for(var t=new Array(e.length),n=0;n<e.length;n++)t[n]=e.charCodeAt(n);return t}(e)),"string"==typeof a&&(a=function(e){var t=[];return e.replace(/[a-fA-F0-9]{2}/g,function(e){t.push(parseInt(e,16))}),t}(a)),!Array.isArray(e))throw TypeError("value must be an array of bytes");if(!Array.isArray(a)||16!==a.length)throw TypeError("namespace must be uuid string or an Array of 16 byte values");var u=n(a.concat(e));if(u[6]=15&u[6]|t,u[8]=63&u[8]|128,i)for(var c=0;c<16;++c)i[s+c]=u[c];return i||r(u)};try{a.name=e}catch(e){}return a.DNS="6ba7b810-9dad-11d1-80b4-00c04fd430c8",a.URL="6ba7b811-9dad-11d1-80b4-00c04fd430c8",a}},327:function(e,t,n){"use strict";function r(e,t,n,r){switch(e){case 0:return t&n^~t&r;case 1:return t^n^r;case 2:return t&n^t&r^n&r;case 3:return t^n^r}}function a(e,t){return e<<t|e>>>32-t}e.exports=function(e){var t=[1518500249,1859775393,2400959708,3395469782],n=[1732584193,4023233417,2562383102,271733878,3285377520];if("string"==typeof e){var i=unescape(encodeURIComponent(e));e=new Array(i.length);for(var o=0;o<i.length;o++)e[o]=i.charCodeAt(o)}e.push(128);var s=e.length/4+2,u=Math.ceil(s/16),c=new Array(u);for(o=0;o<u;o++){c[o]=new Array(16);for(var l=0;l<16;l++)c[o][l]=e[64*o+4*l]<<24|e[64*o+4*l+1]<<16|e[64*o+4*l+2]<<8|e[64*o+4*l+3]}for(c[u-1][14]=8*(e.length-1)/Math.pow(2,32),c[u-1][14]=Math.floor(c[u-1][14]),c[u-1][15]=8*(e.length-1)&4294967295,o=0;o<u;o++){for(var f=new Array(80),p=0;p<16;p++)f[p]=c[o][p];for(p=16;p<80;p++)f[p]=a(f[p-3]^f[p-8]^f[p-14]^f[p-16],1);var d=n[0],h=n[1],v=n[2],m=n[3],y=n[4];for(p=0;p<80;p++){var g=Math.floor(p/20),b=a(d,5)+r(g,h,v,m)+y+t[g]+f[p]>>>0;y=m,m=v,v=a(h,30)>>>0,h=d,d=b}n[0]=n[0]+d>>>0,n[1]=n[1]+h>>>0,n[2]=n[2]+v>>>0,n[3]=n[3]+m>>>0,n[4]=n[4]+y>>>0}return[n[0]>>24&255,n[0]>>16&255,n[0]>>8&255,255&n[0],n[1]>>24&255,n[1]>>16&255,n[1]>>8&255,255&n[1],n[2]>>24&255,n[2]>>16&255,n[2]>>8&255,255&n[2],n[3]>>24&255,n[3]>>16&255,n[3]>>8&255,255&n[3],n[4]>>24&255,n[4]>>16&255,n[4]>>8&255,255&n[4]]}},421:function(e,t,n){"use strict";n.r(t);var r=n(19),a=n.n(r),i=n(20),o=n.n(i),s=n(21),u=n.n(s),c=n(22),l=n.n(c),f=n(25),p=n.n(f),d=n(23),h=n.n(d),v=n(24),m=n.n(v),y=n(0),g=n.n(y),b=n(2),w=n.n(b),E=n(26),x=n(34),_=n.n(x),A=n(12),C=n(119),R=n(41),T=g.a.createContext(null),I=n(3),j=n.n(I),k=n(10),S=n.n(k),N=n(16),q=n.n(N),D=(n(319),function(e){function t(){return a()(this,t),u()(this,l()(t).apply(this,arguments))}return h()(t,e),o()(t,[{key:"render",value:function(){var e=this.props,t=e.children,n=e.className,r=e.style,a=e.id,i=q()(e,["children","className","style","id"]);return g.a.createElement("div",{id:a,style:r,className:_()(n,"ui__fileInput")},t,g.a.createElement("input",S()({},i,{type:"file"})))}}]),t}(g.a.Component));D.propTypes={children:w.a.node,id:w.a.string,className:w.a.string,style:w.a.object};var F=D,L=n(52),P=n(321),M=function(e){function t(){var e,n;a()(this,t);for(var r=arguments.length,i=new Array(r),o=0;o<r;o++)i[o]=arguments[o];return n=u()(this,(e=l()(t)).call.apply(e,[this].concat(i))),m()(p()(n),"state",{importingData:!1}),m()(p()(n),"onFileInputChange",function(e){var t=n.props,r=t.actions,a=t.host;n.setState({importDataError:null,importingData:!0}),new P.a(e.target.files[0],{url:"".concat(a,"/import-data")}).upload().then(function(e){var t=e.payload;n.setState(j()({importingData:!1},t)),r.$updateApp(j()({},t))}).catch(function(e){return n.setState({error:e})})}),n}return h()(t,e),o()(t,[{key:"render",value:function(){var e=this;return g.a.createElement(T.Consumer,null,function(){var t=e.state,n=t.error,r=t.importingData,a=t.data_import_info;return g.a.createElement("div",null,n?g.a.createElement("div",{className:"ui__dangerColor"},n.msg||n.message||JSON.stringify(n)):g.a.createElement("div",null,r?g.a.createElement(L.a,{className:"ui__flex ui__justifyContent_center"}):g.a.createElement("div",null,a&&a.date?g.a.createElement("p",null,"Data was imported!!!"):null,g.a.createElement(F,{value:"",onChange:e.onFileInputChange},g.a.createElement(C.Button,{raised:!0,accent:!0,ripple:!0},"Upload json file")))))})}}]),t}(g.a.Component);M.propTypes={actions:w.a.object.isRequired,host:w.a.string.isRequired};var O=M,U=function(e){var t=e.children,n=e.options;n=n||{allScripts:!0,allConfigKeys:!0};var r="";return Object.keys(n).forEach(function(e,t){r+="".concat(e,"=").concat(n[e]),t<Object.keys(n).length-1&&(r+="&")}),g.a.createElement("a",{target:"_blank",style:{color:"inherit",textDecoration:"none",fontWeight:"inherit"},rel:"noopener noreferrer",href:"/export-data?".concat(r)},t||"Export")};U.propTypes={options:w.a.object};var $=U,V=function(e){function t(){return a()(this,t),u()(this,l()(t).apply(this,arguments))}return h()(t,e),o()(t,[{key:"render",value:function(){return g.a.createElement("div",null,g.a.createElement($,null,g.a.createElement(C.Button,{raised:!0,accent:!0,ripple:!0},"Export everything")))}}]),t}(g.a.Component);V.propTypes={actions:w.a.object.isRequired,host:w.a.string.isRequired};var J=V;n.d(t,"ImportDataPage",function(){return B});var B=function(e){function t(){var e,n;a()(this,t);for(var r=arguments.length,i=new Array(r),o=0;o<r;o++)i[o]=arguments[o];return n=u()(this,(e=l()(t)).call.apply(e,[this].concat(i))),m()(p()(n),"state",{activeTab:0}),n}return h()(t,e),o()(t,[{key:"render",value:function(){var e=this,t=this.state.activeTab;return g.a.createElement(T.Provider,{value:this},g.a.createElement("div",{className:_()("ui__flex")},g.a.createElement("div",{className:_()("ui__shadow"),style:{background:"#fff",margin:"auto",minWidth:250,textAlign:"center"}},g.a.createElement(C.Tabs,{activeTab:t,onChange:function(t){return e.setState({activeTab:t})}},g.a.createElement(C.Tab,null,"Import"),g.a.createElement(C.Tab,null,"Export")),g.a.createElement("div",{style:{padding:"25px 10px"}},0===t&&g.a.createElement(O,this.props),1===t&&g.a.createElement(J,this.props)))))}}]),t}(g.a.Component);B.propTypes={actions:w.a.object.isRequired};t.default=Object(E.hot)(Object(A.f)(Object(R.a)(B,function(e){return{host:e.$APP.host,data_import_info:e.$APP.data_import_info||{}}})))}}]);