(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7297],{40266:function(e,t,a){Promise.resolve().then(a.bind(a,57444)),Promise.resolve().then(a.bind(a,25704))},57444:function(e,t,a){"use strict";a.d(t,{UsersTable:function(){return M}});var s=a(57437),r=a(2265),l=a(27776),n=a(92940),i=a(19212),o=a.n(i),d=a(27071),c=a(37440);let u=d.zt,m=d.fC,f=d.xz,x=r.forwardRef((e,t)=>{let{className:a,sideOffset:r=4,...l}=e;return(0,s.jsx)(d.VY,{ref:t,sideOffset:r,className:(0,c.cn)("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",a),...l})});x.displayName=d.VY.displayName;var p=a(75944),h=a(99221),v=a(64344),j=a(39661),g=a(23733),N=a(76230),b=a(17647),y=a(30998),w=a(45188),C=a(90399),k=a(46910),_=a(50495);function I(e){var t,a;let{email:r,userId:l,userName:n,isActivated:i,onDelete:o}=e,d=(0,y.useSession)(),c=(0,g.l)();return(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)(k.h_,{children:[(0,s.jsx)(k.$F,{asChild:!0,children:(0,s.jsx)(_.z,{variant:"ghost",size:"icon",className:"p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent",children:(0,s.jsx)(w.Z,{className:"h-4 w-4"})})}),(0,s.jsxs)(k.AW,{children:[(0,s.jsx)(k.Ju,{children:n}),(0,s.jsx)(k.VD,{}),(0,s.jsx)(k.Xi,{onClick:()=>c.push({userId:l}),children:"Edit"}),(0,s.jsx)(k.Xi,{disabled:i,children:"Send activation code"}),(0,s.jsx)(k.VD,{}),(0,s.jsxs)(k.Xi,{onClick:o,className:"text-danger focus:bg-danger focus:text-danger-foreground",disabled:r===(null===(a=d.data)||void 0===a?void 0:null===(t=a.user)||void 0===t?void 0:t.email),children:[(0,s.jsx)(C.Z,{className:"mr-2 h-4 w-4"}),(0,s.jsx)("span",{children:"Delete"})]})]})]})})}var P=a(42873),E=a(20920),S=a(39343),R=a(95317),D=a(46294),F=a(83102),z=a(67135),Z=a(53699),U=a(95974);let L=/\S+@\S+\.\S+/;function A(e){let{open:t,userId:a,roles:l,getUser:n,onClose:i,updateUsers:o,createUsers:d,onSaveSuccess:u}=e,{alert:m}=(0,Z.s)(),{parsed:f,replace:x}=(0,g.l)(),p=a||f.userId,[h,v]=(0,r.useState)(!1),[N,b]=(0,r.useState)(!1),[,y]=(0,r.useState)(),[w,C]=(0,r.useState)(!p),{formState:{errors:k},watch:I,setValue:A,register:T,handleSubmit:V}=(0,S.cI)({defaultValues:{userId:p||(0,E.Z)(),email:"",displayName:"",firstName:"",lastName:"",role:"user",avatar:"",avatar_sm:"",avatar_md:""}}),O=(0,r.useCallback)(()=>{p&&(v(!0),n(p).then(e=>{y(e),e&&(A("userId",e.userId||""),A("email",e.email||""),A("displayName",e.displayName||""),A("firstName",e.firstName||""),A("lastName",e.lastName||""),A("role",e.role||"user"),A("avatar",e.avatar||""),A("avatar_sm",e.avatar_sm||""),A("avatar_md",e.avatar_md||""))}).catch(e=>m({title:"",message:"Failed to load user: "+e.message,variant:"error",onClose:()=>x({userId:void 0})})).finally(()=>v(!1)))},[p,x,m,A,n]);(0,U.q)(O);let B=V(e=>{(async()=>{try{b(!0),p?await o([{userId:p,data:e}]):await d([e]),u&&await u(),m({variant:"success",message:"User was saved successfully!",onClose:()=>{null==i||i(),x({userId:void 0})}})}catch(e){m({title:"",message:"Failed to save user: "+e.message,variant:"error"})}finally{b(!1)}})()}),M=I("role"),q=I("email");return h?(0,s.jsx)(j.a,{overlay:!0}):(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)(R.yo,{open:t||!!f.userId,onOpenChange:()=>{null==i||i(),x({userId:void 0})},children:[(0,s.jsx)(R.aM,{asChild:!0,children:(0,s.jsx)(_.z,{className:"md:hidden",variant:"ghost",children:(0,s.jsx)(P.Z,{className:"h-6 w-6"})})}),(0,s.jsxs)(R.ue,{side:"right",className:"p-0 m-0 flex flex-col",children:[(0,s.jsx)(R.Tu,{className:"py-2 px-4 border-b border-b-border",children:(0,s.jsxs)(R.bC,{children:[p?"Edit":"New"," User"]})}),(0,s.jsxs)("div",{className:"flex-1 flex flex-col py-2 px-4 gap-y-4 overflow-y-auto",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(z._,{htmlFor:"role",children:"Role"}),(0,s.jsxs)(D.Ph,{value:M,required:!0,name:"role",disabled:N,onValueChange:e=>{A("role",e)},children:[(0,s.jsx)(D.i4,{children:(0,s.jsx)(D.ki,{placeholder:"Filter by status"})}),(0,s.jsx)(D.Bw,{children:(0,s.jsxs)(D.DI,{children:[(0,s.jsx)(D.n5,{children:"User role"}),l.map(e=>(0,s.jsx)(D.Ql,{value:e.name,children:e.description},e.name))]})})]})]}),(0,s.jsxs)("div",{className:"flex flex-col gap-y-2",children:[(0,s.jsx)(z._,{htmlFor:"email",className:(0,c.cn)(w?"":"opacity-50"),children:"Email"}),w?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(F.I,{placeholder:"Email",type:"email",className:(0,c.cn)(k.email?"border-danger ring-danger focus-visible:ring-danger":""),...T("email",{required:!0,disabled:N,pattern:{value:L,message:"Incorrect email format"}})}),k.email&&(0,s.jsx)("span",{role:"alert",className:"text-xs text-danger",children:k.email.message})]}):(0,s.jsx)(F.I,{disabled:!0,value:q,onChange:()=>{},className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(z._,{htmlFor:"displayName",children:"Display name"}),(0,s.jsx)(F.I,{...T("displayName",{required:!0,disabled:N}),placeholder:"Display name"})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(z._,{htmlFor:"firstName",children:"First name"}),(0,s.jsx)(F.I,{...T("firstName",{required:!1,disabled:N}),placeholder:"First name"})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(z._,{htmlFor:"lastName",children:"Last name"}),(0,s.jsx)(F.I,{...T("lastName",{required:!1,disabled:N}),placeholder:"Last name"})]})]}),(0,s.jsxs)("div",{className:"border-t border-t-border px-4 py-2 flex justify-end gap-x-2",children:[(0,s.jsx)(R.sw,{asChild:!0,children:(0,s.jsx)(_.z,{variant:"outline",children:"Cancel"})}),(0,s.jsx)(_.z,{onClick:B,children:"Save"})]})]})]})})}var T=a(92513);let V=[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}];function O(e){let{selected:t,roles:a,getUsers:l,onDelete:n,toggleUserForm:i,searchUsers:o}=e,d=(0,g.l)(),[c,u]=(0,r.useState)(d.parsed.role||"all"),[m,f]=(0,r.useState)(d.parsed.status||"all");return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("div",{children:(0,s.jsxs)(D.Ph,{value:m,onValueChange:e=>{let t="all"===e?void 0:e;f(e),l({status:t},e=>!e&&d.push({status:t}))},children:[(0,s.jsx)(D.i4,{children:(0,s.jsx)(D.ki,{placeholder:"Filter by status"})}),(0,s.jsx)(D.Bw,{children:(0,s.jsxs)(D.DI,{children:[(0,s.jsx)(D.n5,{children:"User status"}),(0,s.jsx)(D.Ql,{value:"all",children:"All statuses"}),V.map(e=>(0,s.jsx)(D.Ql,{value:e.value,children:e.label},e.value))]})})]})}),(0,s.jsx)("div",{children:(0,s.jsxs)(D.Ph,{value:c,onValueChange:e=>{let t="all"===e?[]:[e];u(e),l({roles:t},e=>!e&&d.push({role:t[0]}))},children:[(0,s.jsx)(D.i4,{children:(0,s.jsx)(D.ki,{placeholder:"Filter by role"})}),(0,s.jsx)(D.Bw,{children:(0,s.jsxs)(D.DI,{children:[(0,s.jsx)(D.n5,{children:"User roles"}),(0,s.jsx)(D.Ql,{value:"all",children:"All roles"}),a.map(e=>(0,s.jsx)(D.Ql,{value:e.name,children:e.description},e.name))]})})]})}),(0,s.jsx)("div",{children:(0,s.jsxs)(_.z,{variant:"outline",className:"w-auto h-auto border-primary text-primary",onClick:()=>i(),children:[(0,s.jsx)(T.Z,{className:"w-4 h-4 mr-1"}),"New User"]})})]})}function B(e){let{open:t,userIds:a,roles:l,onClose:n,updateUsers:i,onSaveSuccess:o}=e,{alert:d}=(0,Z.s)(),{parsed:c,replace:u}=(0,g.l)(),[m,f]=(0,r.useState)(!1),{watch:x,setValue:p,handleSubmit:h}=(0,S.cI)({defaultValues:{role:""}}),v=(0,r.useCallback)(()=>{null==n||n(),u({bulkEdit:void 0}),p("role","")},[n,u,p]),j=h(e=>{(async()=>{try{f(!0),a.length&&(await i(a.map(t=>({userId:t,data:e}))),o&&await o()),d({variant:"success",message:"Users updated",onClose:v})}catch(e){d({title:"",message:"Failed to update users: "+e.message,variant:"error"})}finally{f(!1)}})()});(0,r.useEffect)(()=>{a.length||v()},[a,v]);let N=x("role");return(0,s.jsx)(s.Fragment,{children:(0,s.jsx)(R.yo,{open:"1"===c.bulkEdit,onOpenChange:e=>{e||v()},children:(0,s.jsxs)(R.ue,{side:"right",className:"p-0 m-0 flex flex-col",children:[(0,s.jsx)(R.Tu,{className:"py-2 px-4 border-b border-b-border",children:(0,s.jsx)(R.bC,{children:"Bulk edit users"})}),(0,s.jsx)("div",{className:"flex-1 flex flex-col py-2 px-4 gap-y-4 overflow-y-auto",children:(0,s.jsxs)("div",{children:[(0,s.jsx)(z._,{htmlFor:"role",children:"Role"}),(0,s.jsxs)(D.Ph,{value:N,required:!0,name:"role",disabled:m,onValueChange:e=>{p("role",e)},children:[(0,s.jsx)(D.i4,{children:(0,s.jsx)(D.ki,{placeholder:"-- select role --"})}),(0,s.jsx)(D.Bw,{children:(0,s.jsxs)(D.DI,{children:[(0,s.jsx)(D.n5,{children:"User role"}),l.map(e=>(0,s.jsx)(D.Ql,{value:e.name,children:e.description},e.name))]})})]})]})}),(0,s.jsxs)("div",{className:"border-t border-t-border px-4 py-2 flex justify-end gap-x-2",children:[(0,s.jsx)(R.sw,{asChild:!0,children:(0,s.jsx)(_.z,{variant:"outline",children:"Cancel"})}),(0,s.jsx)(_.z,{onClick:j,disabled:!N,children:"Save"})]})]})})})}function M(e){let{users:t,roles:a,getUsers:i,deleteUsers:d,getUser:y,updateUsers:w,createUsers:C,searchUsers:k}=e,_=(0,g.l)(),{mode:P}=(0,b.b)(),[E,S]=(0,r.useState)(t),[R,D]=(0,r.useState)(!1),[F,z]=(0,r.useState)([]),[Z,U]=(0,r.useState)(!1),{confirm:L}=(0,N.t)(),T=(0,r.useCallback)(async(e,a)=>{D(!0);let s=await i({..._.parsed,roles:_.parsed.role?[_.parsed.role]:void 0,page:1,limit:t.limit,...e});s.error?l.Am.error(s.error):(S(s),z([])),null==a||a(s.error,s),D(!1)},[i,_,t]),V=(0,r.useCallback)((e,t)=>{let a=E.data.filter(t=>e.includes(t.userId)).map(e=>e.displayName);L(()=>{(async()=>{try{D(!0),await d(e),await T(),null==t||t()}catch(e){l.Am.error(e.message)}finally{D(!1)}})()},{title:"Delete "+(a.length>1?"users":"user"),message:"<p>Are you sure you want to delete:</p> ".concat(a.map(e=>'<div class="font-bold text-danger">'.concat(e,"</div>")).join("")),negativeLabel:"Cancel",positiveLabel:"Delete",danger:!0})},[L,d,T,E]),M=_.parsed.userId||Z?(0,s.jsx)(A,{roles:a,open:Z,getUser:y,updateUsers:w,createUsers:C,onSaveSuccess:T,onClose:()=>U(!1)}):null,q=(0,s.jsx)(B,{roles:a,open:Z,userIds:F.map(e=>E.data[e].userId),updateUsers:w,onSaveSuccess:()=>T({page:E.page})}),Q=(0,r.useMemo)(()=>"view"===P,[P]);return(0,s.jsxs)("div",{className:"flex flex-col",children:[(0,s.jsx)(p.DataTable,{title:"Users",selectable:!Q,selectedIndexes:F,onSelect:z,search:{inputPlaceholder:"Search users"},headerActions:(0,s.jsx)(O,{users:E,roles:a,selected:F.map(e=>E.data[e].userId),onDelete:V,getUsers:T,searchUsers:k,toggleUserForm:()=>U(e=>!e)}),columns:[{name:"Display name"},{name:"Email"},{name:"Role"},{name:"Last login date"},{name:"Active",align:"right",cellRenderer(e){let t=E.data[e.rowIndex];return(0,s.jsx)(u,{delayDuration:0,children:(0,s.jsxs)(m,{children:[(0,s.jsx)(f,{asChild:!0,children:(0,s.jsx)(n.Z,{className:(0,c.cn)(t.activationDate?"text-green-400":"text-gray-400","w-4 h-4")})}),!!t.activationDate&&(0,s.jsx)(x,{children:(0,s.jsxs)("p",{className:"text-xs text-muted-foreground",children:["Activation date: ",o()(t.activationDate).format("LLL")]})})]})})}},{name:"Action",align:"right",cellRenderer(e){let t=E.data[e.rowIndex];return(0,s.jsx)(I,{email:t.email,userId:t.userId,userName:t.displayName,isActivated:!!t.activationDate,onDelete:()=>V([t.userId])})}}],data:E.data.map(e=>{var t;return[e.displayName,e.email,(null===(t=a.filter(t=>t.name===e.role)[0])||void 0===t?void 0:t.description)||e.role,e.lastLoginDate?o()(e.lastLoginDate).format("LLL"):"",""]})}),(0,s.jsx)(v.Z,{}),(0,s.jsx)("div",{className:"p-2",children:(0,s.jsx)(h.t,{currentPage:E.page,totalPages:E.totalPages,disabled:R,limit:E.limit||E.totalRows,totalRows:E.totalRows,collectionName:"users",onPaginate:e=>T({page:e},(e,t)=>!e&&_.push({page:(null==t?void 0:t.page)||E.page})),hideControls:!1,hideSummary:!1})}),M,q,R&&(0,s.jsx)(j.a,{overlay:!0})]})}},39661:function(e,t,a){"use strict";a.d(t,{a:function(){return l}});var s=a(57437),r=a(89627);function l(e){let{overlay:t,transparent:a}=e;return(0,s.jsx)(s.Fragment,{children:(0,s.jsx)("div",{style:{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",...t?{height:"100%",position:"fixed",top:0,left:0,bottom:0,zIndex:999,backgroundColor:a?"transparent":"rgba(255,255,255,.6)"}:{padding:"50px 0"}},children:(0,s.jsx)(r.Z,{style:{height:24,width:24},className:"animate-spin"})})})}},99221:function(e,t,a){"use strict";a.d(t,{t:function(){return b}});var s=a(57437),r=a(2265),l=a(70518),n=a(87592),i=a(63550),o=a(37440),d=a(50495);let c=e=>{let{className:t,...a}=e;return(0,s.jsx)("nav",{role:"navigation","aria-label":"pagination",className:(0,o.cn)("mx-auto flex w-full justify-center",t),...a})};c.displayName="Pagination";let u=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)("ul",{ref:t,className:(0,o.cn)("flex flex-row items-center gap-1",a),...r})});u.displayName="PaginationContent";let m=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)("li",{ref:t,className:(0,o.cn)("",a),...r})});m.displayName="PaginationItem";let f=e=>{let{className:t,isActive:a,size:r="icon",...l}=e;return(0,s.jsx)("a",{"aria-current":a?"page":void 0,className:(0,o.cn)((0,d.d)({variant:a?"outline":"ghost",size:r}),t),...l})};f.displayName="PaginationLink";let x=e=>{let{className:t,...a}=e;return(0,s.jsxs)(f,{"aria-label":"Go to previous page",size:"default",className:(0,o.cn)("gap-1 pl-2.5",t),...a,children:[(0,s.jsx)(l.Z,{className:"h-4 w-4"}),(0,s.jsx)("span",{children:"Previous"})]})};x.displayName="PaginationPrevious";let p=e=>{let{className:t,...a}=e;return(0,s.jsxs)(f,{"aria-label":"Go to next page",size:"default",className:(0,o.cn)("gap-1 pr-2.5",t),...a,children:[(0,s.jsx)("span",{children:"Next"}),(0,s.jsx)(n.Z,{className:"h-4 w-4"})]})};p.displayName="PaginationNext";let h=e=>{let{className:t,...a}=e;return(0,s.jsxs)("span",{"aria-hidden":!0,className:(0,o.cn)("flex h-9 w-9 items-center justify-center",t),...a,children:[(0,s.jsx)(i.Z,{className:"h-4 w-4"}),(0,s.jsx)("span",{className:"sr-only",children:"More pages"})]})};h.displayName="PaginationEllipsis";var v=a(78448);let j="LEFT",g="RIGHT";function N(e,t){let a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1,s=e,r=[];for(;s<=t;)r.push(s),s+=a;return r}function b(e){let{currentPage:t,totalPages:a,disabled:r,limit:l=1,totalRows:n,collectionName:i="results",hideControls:d,hideSummary:b,classes:y}=e,w=function(e){let{currentPage:t=1,totalPages:a=0,onPaginate:s}=e,r=[{id:"first",label:"Previous",disabled:t<2,isPrev:!0,isNext:!1,isEllipsis:!1,onClick:()=>s(t-1)}];return(function(e){let{totalPages:t=0,currentPage:a=1}=e;if(t>9){let e=[],s=a-2,r=a+2,l=t-1,n=s>2?s:2,i=r<l?r:l,o=7-(e=N(n,i)).length-1,d=n>2,c=i<l;return d&&!c?e=[j,...N(n-o,n-1),...e]:!d&&c?e=[...e,...N(i+1,i+o),g]:d&&c&&(e=[j,...e,g]),[1,...e,t]}return N(1,t)})(e).forEach(e=>{[j,g].includes(e)?r.push({label:"...",id:"".concat(e),disabled:!1,isPrev:!1,isNext:!1,isEllipsis:!0,onClick:()=>{}}):r.push({id:"".concat(e),label:"".concat(e),disabled:t===e,isPrev:!1,isNext:!1,isEllipsis:!1,onClick:()=>s(Number(e))})}),r.push({id:"last",label:"Next",disabled:a===t,isPrev:!1,isNext:!0,isEllipsis:!1,onClick:()=>s(t+1)}),r}(e);return d&&b?null:(0,s.jsxs)("div",{className:"flex flex-col justify-center items-center gap-y-2",children:[!b&&(0,s.jsxs)("div",{className:"text-xs opacity-50 min-w-10",children:["Showing ",n?(0,v.c)((t-1)*l+1):0,"\xa0-\xa0",(0,v.c)(Math.min(n,t*l)),"\xa0of\xa0",(0,v.c)(n,{separator:" "})," ",i]}),!d&&(0,s.jsx)(c,{children:(0,s.jsx)(u,{children:w.map(e=>(0,s.jsx)(m,{children:(()=>{let l="".concat(t)==="".concat(e.label),n=e.disabled||r,i="opacity-50",d=()=>!n&&e.onClick();return e.isPrev?(n=n||1===t,(0,s.jsx)(x,{href:"#",className:(0,o.cn)(1===t?i:""),onClick:e=>{e.stopPropagation(),e.preventDefault(),d()}})):e.isEllipsis?(0,s.jsx)(h,{className:(0,o.cn)(n?i:"","hidden md:flex",null==y?void 0:y.pageNumber)}):e.isNext?(n=n||t===a,(0,s.jsx)(p,{href:"#",className:(0,o.cn)(n?i:""),onClick:e=>{e.stopPropagation(),e.preventDefault(),d()}})):(0,s.jsx)(f,{href:"#",className:(0,o.cn)(n?i:"","hidden md:flex",null==y?void 0:y.pageNumber),isActive:l,onClick:e=>{e.stopPropagation(),e.preventDefault(),d()},children:e.label})})()},e.id))})})]})}},58502:function(e,t,a){"use strict";a.d(t,{SocketEventsListener:function(){return n}});var s=a(2265),r=a(16463),l=a(7752);function n(e){let{events:t}=e,a=(0,s.useRef)({eventsTimeouts:{},eventsTimestamps:{}});(0,s.useRef)(new Date().getTime());let n=(0,r.useRouter)();return(0,s.useEffect)(()=>{t.forEach(e=>{let{name:t,action:s,delay:r=100,onEvent:i}=e;l.Z.on(t,function(){for(var e=arguments.length,l=Array(e),o=0;o<e;o++)l[o]=arguments[o];let d=()=>{var e,a;(!s||l[0]===s)&&(null===(e=i.callback)||void 0===e||e.call(i,...l),(null==i?void 0:i.refreshRouter)&&(console.log(t,"refreshing..."),n.refresh()),(null===(a=i.redirect)||void 0===a?void 0:a.to)&&(i.redirect.replace?n.replace(i.redirect.to):n.push(i.redirect.to)))},c=new Date().getTime();r?(clearTimeout(a.current.eventsTimeouts[t]),a.current.eventsTimeouts[t]=setTimeout(()=>{a.current.eventsTimestamps[t]=c,d()},r)):(a.current.eventsTimestamps[t]=new Date().getTime(),d())})})},[t,n]),null}},25704:function(e,t,a){"use strict";a.r(t),a.d(t,{Title:function(){return l}});var s=a(2265),r=a(20357);function l(e){let{children:t}=e;return(0,s.useEffect)(()=>{document.title=[r.env.NEXT_PUBLIC_APP_NAME,t].filter(e=>e).join(" - ")},[t]),(0,s.useEffect)(()=>()=>{document.title="".concat(r.env.NEXT_PUBLIC_APP_NAME)},[]),null}},67135:function(e,t,a){"use strict";a.d(t,{_:function(){return d}});var s=a(57437),r=a(2265),l=a(38364),n=a(12218),i=a(37440);let o=(0,n.j)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),d=r.forwardRef((e,t)=>{let{className:a,secondary:r,error:n,...d}=e;return(0,s.jsx)(l.f,{ref:t,className:(0,i.cn)(o(),r&&"text-xs",n?"text-danger":"",a),...d})});d.displayName=l.f.displayName},46294:function(e,t,a){"use strict";a.d(t,{Bw:function(){return h},DI:function(){return u},Ph:function(){return c},Ql:function(){return j},i4:function(){return f},ki:function(){return m},n5:function(){return v}});var s=a(57437),r=a(2265),l=a(48297),n=a(42421),i=a(14392),o=a(22468),d=a(37440);let c=l.fC,u=l.ZA,m=l.B4,f=r.forwardRef((e,t)=>{let{className:a,children:r,error:i,...o}=e;return(0,s.jsxs)(l.xz,{ref:t,className:(0,d.cn)("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",i&&"border-danger",a),...o,children:[r,(0,s.jsx)(l.JO,{asChild:!0,children:(0,s.jsx)(n.Z,{className:"h-4 w-4 opacity-50"})})]})});f.displayName=l.xz.displayName;let x=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(l.u_,{ref:t,className:(0,d.cn)("flex cursor-default items-center justify-center py-1",a),...r,children:(0,s.jsx)(i.Z,{className:"h-4 w-4"})})});x.displayName=l.u_.displayName;let p=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(l.$G,{ref:t,className:(0,d.cn)("flex cursor-default items-center justify-center py-1",a),...r,children:(0,s.jsx)(n.Z,{className:"h-4 w-4"})})});p.displayName=l.$G.displayName;let h=r.forwardRef((e,t)=>{let{className:a,children:r,position:n="popper",...i}=e;return(0,s.jsx)(l.h_,{children:(0,s.jsxs)(l.VY,{ref:t,className:(0,d.cn)("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2","popper"===n&&"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",a),position:n,...i,children:[(0,s.jsx)(x,{}),(0,s.jsx)(l.l_,{className:(0,d.cn)("p-1","popper"===n&&"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),children:r}),(0,s.jsx)(p,{})]})})});h.displayName=l.VY.displayName;let v=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(l.__,{ref:t,className:(0,d.cn)("py-1.5 pl-8 pr-2 text-sm font-semibold",a),...r})});v.displayName=l.__.displayName;let j=r.forwardRef((e,t)=>{let{className:a,children:r,...n}=e;return(0,s.jsxs)(l.ck,{ref:t,className:(0,d.cn)("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",a),...n,children:[(0,s.jsx)("span",{className:"absolute left-2 flex h-3.5 w-3.5 items-center justify-center",children:(0,s.jsx)(l.wU,{children:(0,s.jsx)(o.Z,{className:"h-4 w-4"})})}),(0,s.jsx)(l.eT,{children:r})]})});j.displayName=l.ck.displayName,r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(l.Z0,{ref:t,className:(0,d.cn)("-mx-1 my-1 h-px bg-muted",a),...r})}).displayName=l.Z0.displayName},64344:function(e,t,a){"use strict";a.d(t,{Z:function(){return i}});var s=a(57437),r=a(2265),l=a(48484),n=a(37440);let i=r.forwardRef((e,t)=>{let{className:a,orientation:r="horizontal",decorative:i=!0,...o}=e;return(0,s.jsx)(l.f,{ref:t,decorative:i,orientation:r,className:(0,n.cn)("shrink-0 bg-border","horizontal"===r?"h-[1px] w-full":"h-full w-[1px]",a),...o})});i.displayName=l.f.displayName},95317:function(e,t,a){"use strict";a.d(t,{Ei:function(){return g},FF:function(){return v},Tu:function(){return h},aM:function(){return c},bC:function(){return j},sw:function(){return u},ue:function(){return p},yo:function(){return d}});var s=a(57437),r=a(2265),l=a(13304),n=a(12218),i=a(74697),o=a(37440);let d=l.fC,c=l.xz,u=l.x8,m=l.h_,f=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(l.aV,{className:(0,o.cn)("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",a),...r,ref:t})});f.displayName=l.aV.displayName;let x=(0,n.j)("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",{variants:{side:{top:"inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",bottom:"inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",left:"inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",right:"inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"}},defaultVariants:{side:"right"}}),p=r.forwardRef((e,t)=>{let{side:a="right",className:r,children:n,hideCloseButton:d,...c}=e;return(0,s.jsxs)(m,{children:[(0,s.jsx)(f,{}),(0,s.jsxs)(l.VY,{ref:t,className:(0,o.cn)(x({side:a}),r),...c,children:[n,!0!==d&&(0,s.jsxs)(l.x8,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",children:[(0,s.jsx)(i.Z,{className:"h-4 w-4"}),(0,s.jsx)("span",{className:"sr-only",children:"Close"})]})]})]})});p.displayName=l.VY.displayName;let h=e=>{let{className:t,...a}=e;return(0,s.jsx)("div",{className:(0,o.cn)("flex flex-col space-y-2 text-center sm:text-left",t),...a})};h.displayName="SheetHeader";let v=e=>{let{className:t,...a}=e;return(0,s.jsx)("div",{className:(0,o.cn)("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",t),...a})};v.displayName="SheetFooter";let j=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(l.Dx,{ref:t,className:(0,o.cn)("text-lg font-semibold text-foreground",a),...r})});j.displayName=l.Dx.displayName;let g=r.forwardRef((e,t)=>{let{className:a,...r}=e;return(0,s.jsx)(l.dk,{ref:t,className:(0,o.cn)("text-sm text-muted-foreground",a),...r})});g.displayName=l.dk.displayName},17647:function(e,t,a){"use strict";a.d(t,{AppContextProvider:function(){return v},b:function(){return h}});var s=a(57437),r=a(2265),l=a(79512),n=a(16463),i=a(23314),o=a(44785);let d=o.Z.get,c=o.Z.set;o.Z.remove;var u={get:d,set:c};function m(){let e=u.get("mode");return e||(e="view",u.set("mode",e,{expires:31536e7})),e}var f=a(7752),x=a(58502);let p=(0,r.createContext)(null),h=()=>(0,r.useContext)(p);function v(e){let{children:t,...a}=e,o=function(e){(0,n.useRouter)();let{isAdmin:t,isSuperUser:a,sys:s}=e,{setTheme:i}=(0,l.F)();(0,r.useEffect)(()=>{"yes"===s.data.hide_theme_toggle&&i("light")},[s]);let o=(0,r.useCallback)(()=>(t||a?m():"view")||"view",[a,t]),[d,c]=(0,r.useState)(o()),x=!t&&!a||"view"===d,p=(0,r.useCallback)(function(){for(var e=arguments.length,t=Array(e),a=0;a<e;a++)t[a]=arguments[a];let s=function(e){return u.set("mode",e,{expires:31536e7}),m()}(...t);return f.Z.emit("mode_changed",o()),c(o()),s},[o]),h=(0,r.useCallback)(()=>{c(o())},[o]);return{...e,mode:d,viewOnly:x,onModeChange:h,getMode:m,setMode:p}}(a),[d,c]=(0,r.useState)(!1);return((0,i.Z)(()=>{c(!0)}),d)?(0,s.jsxs)(p.Provider,{value:o,children:[t,(0,s.jsx)(x.SocketEventsListener,{events:[{name:"mode_changed",onEvent:{callback:o.onModeChange}}]})]}):null}},53699:function(e,t,a){"use strict";a.d(t,{s:function(){return l}});var s=a(39099);let r={title:"",message:"",buttonLabel:"Ok",variant:"info",onClose:void 0},l=(0,s.Ue)(e=>({isOpen:!1,...r,alert:t=>e({isOpen:!0,...r,...t}),close:()=>e({isOpen:!1,onClose:void 0,...r})}))},76230:function(e,t,a){"use strict";a.d(t,{t:function(){return l}});var s=a(39099);let r={danger:!1,title:"Confirm",message:"Are you sure?",positiveLabel:"Ok",negativeLabel:"Cancel"},l=(0,s.Ue)(e=>({isOpen:!1,...r,confirm:(t,a)=>e({isOpen:!0,...r,...a,onConfirm:t}),close:()=>e({isOpen:!1,onConfirm:void 0,...r})}))},95974:function(e,t,a){"use strict";a.d(t,{q:function(){return r}});var s=a(2265);function r(e){let t=(0,s.useRef)(0);return(0,s.useEffect)(()=>{if(t.current+=1,1!==t.current)return e()},[e])}},78448:function(e,t,a){"use strict";function s(e,t){let{decimals:a=0,separator:s=" "}={...t};isNaN(e=Number("".concat(e).replace(/[^a-z0-9.]+/gi,"")))&&(e="0");let r=(e="".concat(Number(e).toFixed(a>=0?a:2))).toString().split(".");return r[0]=r[0].replace(/\B(?=(\d{3})+(?!\d))/g,s),r.join(".")}a.d(t,{c:function(){return s}})},7752:function(e,t,a){"use strict";var s=a(34999),r=a(20357);let l=(0,s.io)(r.env.NEXT_PUBLIC_APP_URL);t.Z=l}},function(e){e.O(0,[6990,4868,5360,8429,659,7776,9343,1072,110,1816,1344,9370,1544,5944,7478,7023,1744],function(){return e(e.s=40266)}),_N_E=e.O()}]);