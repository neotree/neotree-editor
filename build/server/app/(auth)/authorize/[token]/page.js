(()=>{var e={};e.id=8024,e.ids=[8024],e.modules={67096:e=>{"use strict";e.exports=require("bcrypt")},47849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},39491:e=>{"use strict";e.exports=require("assert")},14300:e=>{"use strict";e.exports=require("buffer")},32081:e=>{"use strict";e.exports=require("child_process")},6113:e=>{"use strict";e.exports=require("crypto")},82361:e=>{"use strict";e.exports=require("events")},57147:e=>{"use strict";e.exports=require("fs")},13685:e=>{"use strict";e.exports=require("http")},95687:e=>{"use strict";e.exports=require("https")},41808:e=>{"use strict";e.exports=require("net")},6005:e=>{"use strict";e.exports=require("node:crypto")},87561:e=>{"use strict";e.exports=require("node:fs")},49411:e=>{"use strict";e.exports=require("node:path")},22037:e=>{"use strict";e.exports=require("os")},71017:e=>{"use strict";e.exports=require("path")},4074:e=>{"use strict";e.exports=require("perf_hooks")},63477:e=>{"use strict";e.exports=require("querystring")},12781:e=>{"use strict";e.exports=require("stream")},24404:e=>{"use strict";e.exports=require("tls")},76224:e=>{"use strict";e.exports=require("tty")},57310:e=>{"use strict";e.exports=require("url")},73837:e=>{"use strict";e.exports=require("util")},59796:e=>{"use strict";e.exports=require("zlib")},18762:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>n.a,__next_app__:()=>l,originalPathname:()=>f,pages:()=>b,routeModule:()=>u,tree:()=>o}),r(16052),r(44713),r(77482),r(96560);var a=r(23191),d=r(88716),s=r(37922),n=r.n(s),c=r(95231),i={};for(let e in c)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(i[e]=()=>c[e]);r.d(t,i);let o=["",{children:["(auth)",{children:["authorize",{children:["[token]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,16052)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(auth)/authorize/[token]/page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,44713)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/(auth)/layout.tsx"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,77482)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(r.bind(r,96560)),"/home/farai/Workbench/Neotree/neotree-editor-master/app/not-found.tsx"]}],b=["/home/farai/Workbench/Neotree/neotree-editor-master/app/(auth)/authorize/[token]/page.tsx"],f="/(auth)/authorize/[token]/page",l={require:r,loadChunk:()=>Promise.resolve()},u=new a.AppPageRouteModule({definition:{kind:d.x.APP_PAGE,page:"/(auth)/authorize/[token]/page",pathname:"/authorize/[token]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:o}})},38362:(e,t,r)=>{let a={"103d82a5a607c9f7f049ac9bfe2bb62dc7128462":()=>Promise.resolve().then(r.bind(r,40801)).then(e=>e.getAuthenticatedUserWithRoles),"3054c9aa3ede38673855ee3dff9f25ad492b7d73":()=>Promise.resolve().then(r.bind(r,40801)).then(e=>e.getSession),"576365f197acb2f10e29644ba43ca25aec52e8b7":()=>Promise.resolve().then(r.bind(r,40801)).then(e=>e.getAuthenticatedUser),"055174a9ccd19bad29237b1c3a8c05cd527be07b":()=>Promise.resolve().then(r.bind(r,60563)).then(e=>e.getSys),"088c57d60b5ed83f7dd0192c87404045099f271b":()=>Promise.resolve().then(r.bind(r,60563)).then(e=>e.$$ACTION_0),"099e6b671d625a88f30c9806fa7bdac48e2a3710":()=>Promise.resolve().then(r.bind(r,60563)).then(e=>e.$$ACTION_1),"0c0d564b6e8549cd52e9489443ca8f11eb739d52":()=>Promise.resolve().then(r.bind(r,60563)).then(e=>e.updateSys),"4b9c4cf0240fcf15d4869a3f982ee2d97caf5ea6":()=>Promise.resolve().then(r.bind(r,82065)).then(e=>e.$$ACTION_0),"580940ab09cedb0e060484c8b6a6463e9a81461a":()=>Promise.resolve().then(r.bind(r,82065)).then(e=>e.getSitesWithoutConfidentialData),"6c76d6cc57800dd271e4df8386a0ae6e7ecbc435":()=>Promise.resolve().then(r.bind(r,82065)).then(e=>e.getSites),"783eb2f9264b34f18cf3044d2185e64f2f39333e":()=>Promise.resolve().then(r.bind(r,82065)).then(e=>e.getSite),"8e6d2d1bfc206d2044ed01620bfa151c6fd87125":()=>Promise.resolve().then(r.bind(r,82065)).then(e=>e.saveSites),"8d3a0534ac3ddb0c44a91b766b2183165c62dbed":()=>Promise.resolve().then(r.bind(r,66267)).then(e=>e.canAccessPage),"98c147f0ddb064f66a4d243e26ad14e1fbd69d9c":()=>Promise.resolve().then(r.bind(r,66267)).then(e=>e.isAllowed),"112a744ae93bf04aba1a4250d687a325a73a55c1":()=>Promise.resolve().then(r.bind(r,71271)).then(e=>e.publishData),"294bf0d6332f28a618099d7c02669de60070f8a2":()=>Promise.resolve().then(r.bind(r,71271)).then(e=>e.$$ACTION_1),"2995d4697010486034183adc4a3028bfd106123b":()=>Promise.resolve().then(r.bind(r,71271)).then(e=>e.discardDrafts),"354f249d3682e1a7ac814300889c8b929172be69":()=>Promise.resolve().then(r.bind(r,71271)).then(e=>e.getEditorDetails),"3af78304ef3b80b391189cdb5be758ed14bb9be7":()=>Promise.resolve().then(r.bind(r,71271)).then(e=>e.countAllDrafts),ac5d4de4d5312ee7fa1967d05ccea3edfbd18033:()=>Promise.resolve().then(r.bind(r,71271)).then(e=>e.$$ACTION_0),afc9c4d3ed7201152607116aa5f72d4579144ffc:()=>Promise.resolve().then(r.bind(r,71271)).then(e=>e.revalidatePath)};async function d(e,...t){return(await a[e]()).apply(null,t)}e.exports={"103d82a5a607c9f7f049ac9bfe2bb62dc7128462":d.bind(null,"103d82a5a607c9f7f049ac9bfe2bb62dc7128462"),"3054c9aa3ede38673855ee3dff9f25ad492b7d73":d.bind(null,"3054c9aa3ede38673855ee3dff9f25ad492b7d73"),"576365f197acb2f10e29644ba43ca25aec52e8b7":d.bind(null,"576365f197acb2f10e29644ba43ca25aec52e8b7"),"055174a9ccd19bad29237b1c3a8c05cd527be07b":d.bind(null,"055174a9ccd19bad29237b1c3a8c05cd527be07b"),"088c57d60b5ed83f7dd0192c87404045099f271b":d.bind(null,"088c57d60b5ed83f7dd0192c87404045099f271b"),"099e6b671d625a88f30c9806fa7bdac48e2a3710":d.bind(null,"099e6b671d625a88f30c9806fa7bdac48e2a3710"),"0c0d564b6e8549cd52e9489443ca8f11eb739d52":d.bind(null,"0c0d564b6e8549cd52e9489443ca8f11eb739d52"),"4b9c4cf0240fcf15d4869a3f982ee2d97caf5ea6":d.bind(null,"4b9c4cf0240fcf15d4869a3f982ee2d97caf5ea6"),"580940ab09cedb0e060484c8b6a6463e9a81461a":d.bind(null,"580940ab09cedb0e060484c8b6a6463e9a81461a"),"6c76d6cc57800dd271e4df8386a0ae6e7ecbc435":d.bind(null,"6c76d6cc57800dd271e4df8386a0ae6e7ecbc435"),"783eb2f9264b34f18cf3044d2185e64f2f39333e":d.bind(null,"783eb2f9264b34f18cf3044d2185e64f2f39333e"),"8e6d2d1bfc206d2044ed01620bfa151c6fd87125":d.bind(null,"8e6d2d1bfc206d2044ed01620bfa151c6fd87125"),"8d3a0534ac3ddb0c44a91b766b2183165c62dbed":d.bind(null,"8d3a0534ac3ddb0c44a91b766b2183165c62dbed"),"98c147f0ddb064f66a4d243e26ad14e1fbd69d9c":d.bind(null,"98c147f0ddb064f66a4d243e26ad14e1fbd69d9c"),"112a744ae93bf04aba1a4250d687a325a73a55c1":d.bind(null,"112a744ae93bf04aba1a4250d687a325a73a55c1"),"294bf0d6332f28a618099d7c02669de60070f8a2":d.bind(null,"294bf0d6332f28a618099d7c02669de60070f8a2"),"2995d4697010486034183adc4a3028bfd106123b":d.bind(null,"2995d4697010486034183adc4a3028bfd106123b"),"354f249d3682e1a7ac814300889c8b929172be69":d.bind(null,"354f249d3682e1a7ac814300889c8b929172be69"),"3af78304ef3b80b391189cdb5be758ed14bb9be7":d.bind(null,"3af78304ef3b80b391189cdb5be758ed14bb9be7"),ac5d4de4d5312ee7fa1967d05ccea3edfbd18033:d.bind(null,"ac5d4de4d5312ee7fa1967d05ccea3edfbd18033"),afc9c4d3ed7201152607116aa5f72d4579144ffc:d.bind(null,"afc9c4d3ed7201152607116aa5f72d4579144ffc")}},55072:(e,t,r)=>{Promise.resolve().then(r.bind(r,97152)),Promise.resolve().then(r.bind(r,10827))},97152:(e,t,r)=>{"use strict";r.d(t,{Form:()=>f});var a=r(10326),d=r(17577),s=r(77109),n=r(35047),c=r(85999),i=r(11870),o=r(33071),b=r(43059);async function f({token:e}){let t=(0,n.useRouter)(),r=(0,d.useCallback)(()=>{if(e?.user?.email){let r=(e,r)=>{e&&c.Am.error(e.message||e),r&&t.replace("/")};(0,s.signIn)("credentials",{email:e?.user?.email,code:e.token,redirect:!1}).then(e=>r(e?.error,e?.ok)).catch(r)}},[e,t]);return(0,b.q)(r),a.jsx(a.Fragment,{children:e?a.jsx("div",{children:a.jsx(i.a,{overlay:!1})}):a.jsx(o.Zb,{className:"border-danger bg-danger/20 text-center",children:a.jsx(o.aY,{className:"p-4 flex flex-col gap-y-4",children:a.jsx("div",{className:"text-danger",children:"Could not verify link, it may have expired"})})})})}},43059:(e,t,r)=>{"use strict";r.d(t,{q:()=>d});var a=r(17577);function d(e){return(0,a.useRef)(0),null}},16052:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>u});var a=r(19510),d=r(17530),s=r(57435);let n=async e=>{try{return await (0,d.y)(e)}catch(e){return s.Z.error("getToken ERROR",e),null}};var c=r(85431),i=r(68570);let o=(0,i.createProxy)(String.raw`/home/farai/Workbench/Neotree/neotree-editor-master/app/(auth)/authorize/[token]/components/form.tsx`),{__esModule:b,$$typeof:f}=o;o.default;let l=(0,i.createProxy)(String.raw`/home/farai/Workbench/Neotree/neotree-editor-master/app/(auth)/authorize/[token]/components/form.tsx#Form`);async function u({params:{token:e}}){let[t]=await Promise.all([...isNaN(Number(e))?[]:[n(Number(e))]]);return(0,a.jsxs)(a.Fragment,{children:[a.jsx(c.D,{children:"Sign in"}),a.jsx(l,{token:t})]})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[1633,1744,9937,3788,1490,9092,5802,7708,2685,413,6267,600,1966,1271,437,9874],()=>r(18762));module.exports=a})();