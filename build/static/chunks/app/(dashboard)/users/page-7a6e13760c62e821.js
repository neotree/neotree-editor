(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7297],{40266:function(e,a,t){Promise.resolve().then(t.bind(t,57444)),Promise.resolve().then(t.bind(t,25704))},57444:function(e,a,t){"use strict";t.d(a,{UsersTable:function(){return q}});var s=t(57437),l=t(2265),r=t(27776),i=t(92940),n=t(19212),d=t.n(n),o=t(27071),c=t(37440);let u=o.zt,m=o.fC,f=o.xz,x=l.forwardRef((e,a)=>{let{className:t,sideOffset:l=4,...r}=e;return(0,s.jsx)(o.VY,{ref:a,sideOffset:l,className:(0,c.cn)("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",t),...r})});x.displayName=o.VY.displayName;var p=t(75944),h=t(99221),j=t(64344),v=t(39661),g=t(23733),N=t(76230),b=t(53453),y=t(30998),w=t(45188),C=t(90399),k=t(46910),I=t(50495);function P(e){var a,t;let{email:l,userId:r,userName:i,isActivated:n,onDelete:d}=e,o=(0,y.useSession)(),c=(0,g.l)();return(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)(k.h_,{children:[(0,s.jsx)(k.$F,{asChild:!0,children:(0,s.jsx)(I.z,{variant:"ghost",size:"icon",className:"p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent",children:(0,s.jsx)(w.Z,{className:"h-4 w-4"})})}),(0,s.jsxs)(k.AW,{children:[(0,s.jsx)(k.Ju,{children:i}),(0,s.jsx)(k.VD,{}),(0,s.jsx)(k.Xi,{onClick:()=>c.push({userId:r}),children:"Edit"}),(0,s.jsx)(k.Xi,{disabled:n,children:"Send activation code"}),(0,s.jsx)(k.VD,{}),(0,s.jsxs)(k.Xi,{onClick:d,className:"text-danger focus:bg-danger focus:text-danger-foreground",disabled:l===(null===(t=o.data)||void 0===t?void 0:null===(a=t.user)||void 0===a?void 0:a.email),children:[(0,s.jsx)(C.Z,{className:"mr-2 h-4 w-4"}),(0,s.jsx)("span",{children:"Delete"})]})]})]})})}var _=t(42873),S=t(20920),D=t(39343),E=t(95317),F=t(46294),z=t(83102),R=t(67135),U=t(53699),A=t(95974);let L=/\S+@\S+\.\S+/;function Z(e){let{open:a,userId:t,roles:r,getUser:i,onClose:n,updateUsers:d,createUsers:o,onSaveSuccess:u}=e,{alert:m}=(0,U.s)(),{parsed:f,replace:x}=(0,g.l)(),p=t||f.userId,[h,j]=(0,l.useState)(!1),[N,b]=(0,l.useState)(!1),[,y]=(0,l.useState)(),[w,C]=(0,l.useState)(!p),{formState:{errors:k},watch:P,setValue:Z,register:V,handleSubmit:O}=(0,D.cI)({defaultValues:{userId:p||(0,S.Z)(),email:"",displayName:"",firstName:"",lastName:"",role:"user",avatar:"",avatar_sm:"",avatar_md:""}}),T=(0,l.useCallback)(()=>{p&&(j(!0),i(p).then(e=>{y(e),e&&(Z("userId",e.userId),Z("email",e.email),Z("displayName",e.displayName),Z("firstName",e.firstName||""),Z("lastName",e.lastName||""),Z("role",e.role),Z("avatar",e.avatar||""),Z("avatar_sm",e.avatar_sm||""),Z("avatar_md",e.avatar_md||""))}).catch(e=>m({title:"",message:"Failed to load user: "+e.message,variant:"error",onClose:()=>x({userId:void 0})})).finally(()=>j(!1)))},[p,x,m,Z,i]);(0,A.q)(T);let B=O(e=>{(async()=>{try{b(!0),p?await d([{userId:p,data:e}]):await o([e]),u&&await u(),m({variant:"success",message:"User was saved successfully!",onClose:()=>{null==n||n(),x({userId:void 0})}})}catch(e){m({title:"",message:"Failed to save user: "+e.message,variant:"error"})}finally{b(!1)}})()}),q=P("role"),M=P("email");return h?(0,s.jsx)(v.a,{overlay:!0}):(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)(E.yo,{open:a||!!f.userId,onOpenChange:()=>{null==n||n(),x({userId:void 0})},children:[(0,s.jsx)(E.aM,{asChild:!0,children:(0,s.jsx)(I.z,{className:"md:hidden",variant:"ghost",children:(0,s.jsx)(_.Z,{className:"h-6 w-6"})})}),(0,s.jsxs)(E.ue,{side:"right",className:"p-0 m-0 flex flex-col",children:[(0,s.jsx)(E.Tu,{className:"py-2 px-4 border-b border-b-border",children:(0,s.jsxs)(E.bC,{children:[p?"Edit":"New"," User"]})}),(0,s.jsxs)("div",{className:"flex-1 flex flex-col py-2 px-4 gap-y-4 overflow-y-auto",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(R._,{htmlFor:"role",children:"Role"}),(0,s.jsxs)(F.Ph,{value:q,required:!0,name:"role",disabled:N,onValueChange:e=>{Z("role",e)},children:[(0,s.jsx)(F.i4,{children:(0,s.jsx)(F.ki,{placeholder:"Filter by status"})}),(0,s.jsx)(F.Bw,{children:(0,s.jsxs)(F.DI,{children:[(0,s.jsx)(F.n5,{children:"User role"}),r.map(e=>(0,s.jsx)(F.Ql,{value:e.name,children:e.description},e.name))]})})]})]}),(0,s.jsxs)("div",{className:"flex flex-col gap-y-2",children:[(0,s.jsx)(R._,{htmlFor:"email",className:(0,c.cn)(w?"":"opacity-50"),children:"Email"}),w?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(z.I,{placeholder:"Email",type:"email",className:(0,c.cn)(k.email?"border-danger ring-danger focus-visible:ring-danger":""),...V("email",{required:!0,disabled:N,pattern:{value:L,message:"Incorrect email format"}})}),k.email&&(0,s.jsx)("span",{role:"alert",className:"text-xs text-danger",children:k.email.message})]}):(0,s.jsx)(z.I,{disabled:!0,value:M,onChange:()=>{},className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(R._,{htmlFor:"displayName",children:"Display name"}),(0,s.jsx)(z.I,{...V("displayName",{required:!0,disabled:N}),placeholder:"Display name"})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(R._,{htmlFor:"firstName",children:"First name"}),(0,s.jsx)(z.I,{...V("firstName",{required:!1,disabled:N}),placeholder:"First name"})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(R._,{htmlFor:"lastName",children:"Last name"}),(0,s.jsx)(z.I,{...V("lastName",{required:!1,disabled:N}),placeholder:"Last name"})]})]}),(0,s.jsxs)("div",{className:"border-t border-t-border px-4 py-2 flex justify-end gap-x-2",children:[(0,s.jsx)(E.sw,{asChild:!0,children:(0,s.jsx)(I.z,{variant:"outline",children:"Cancel"})}),(0,s.jsx)(I.z,{onClick:B,children:"Save"})]})]})]})})}var V=t(92513);let O=[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}];function T(e){let{selected:a,roles:t,getUsers:r,onDelete:i,toggleUserForm:n,searchUsers:d}=e,o=(0,g.l)(),[c,u]=(0,l.useState)(o.parsed.role||"all"),[m,f]=(0,l.useState)(o.parsed.status||"all");return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("div",{children:(0,s.jsxs)(F.Ph,{value:m,onValueChange:e=>{let a="all"===e?void 0:e;f(e),r({status:a},e=>!e&&o.push({status:a}))},children:[(0,s.jsx)(F.i4,{children:(0,s.jsx)(F.ki,{placeholder:"Filter by status"})}),(0,s.jsx)(F.Bw,{children:(0,s.jsxs)(F.DI,{children:[(0,s.jsx)(F.n5,{children:"User status"}),(0,s.jsx)(F.Ql,{value:"all",children:"All statuses"}),O.map(e=>(0,s.jsx)(F.Ql,{value:e.value,children:e.label},e.value))]})})]})}),(0,s.jsx)("div",{children:(0,s.jsxs)(F.Ph,{value:c,onValueChange:e=>{let a="all"===e?[]:[e];u(e),r({roles:a},e=>!e&&o.push({role:a[0]}))},children:[(0,s.jsx)(F.i4,{children:(0,s.jsx)(F.ki,{placeholder:"Filter by role"})}),(0,s.jsx)(F.Bw,{children:(0,s.jsxs)(F.DI,{children:[(0,s.jsx)(F.n5,{children:"User roles"}),(0,s.jsx)(F.Ql,{value:"all",children:"All roles"}),t.map(e=>(0,s.jsx)(F.Ql,{value:e.name,children:e.description},e.name))]})})]})}),(0,s.jsx)("div",{children:(0,s.jsxs)(I.z,{variant:"outline",className:"w-auto h-auto border-primary text-primary",onClick:()=>n(),children:[(0,s.jsx)(V.Z,{className:"w-4 h-4 mr-1"}),"New User"]})})]})}function B(e){let{open:a,userIds:t,roles:r,onClose:i,updateUsers:n,onSaveSuccess:d}=e,{alert:o}=(0,U.s)(),{parsed:c,replace:u}=(0,g.l)(),[m,f]=(0,l.useState)(!1),{watch:x,setValue:p,handleSubmit:h}=(0,D.cI)({defaultValues:{role:""}}),j=(0,l.useCallback)(()=>{null==i||i(),u({bulkEdit:void 0}),p("role","")},[i,u,p]),v=h(e=>{(async()=>{try{f(!0),t.length&&(await n(t.map(a=>({userId:a,data:e}))),d&&await d()),o({variant:"success",message:"Users updated",onClose:j})}catch(e){o({title:"",message:"Failed to update users: "+e.message,variant:"error"})}finally{f(!1)}})()});(0,l.useEffect)(()=>{t.length||j()},[t,j]);let N=x("role");return(0,s.jsx)(s.Fragment,{children:(0,s.jsx)(E.yo,{open:"1"===c.bulkEdit,onOpenChange:e=>{e||j()},children:(0,s.jsxs)(E.ue,{side:"right",className:"p-0 m-0 flex flex-col",children:[(0,s.jsx)(E.Tu,{className:"py-2 px-4 border-b border-b-border",children:(0,s.jsx)(E.bC,{children:"Bulk edit users"})}),(0,s.jsx)("div",{className:"flex-1 flex flex-col py-2 px-4 gap-y-4 overflow-y-auto",children:(0,s.jsxs)("div",{children:[(0,s.jsx)(R._,{htmlFor:"role",children:"Role"}),(0,s.jsxs)(F.Ph,{value:N,required:!0,name:"role",disabled:m,onValueChange:e=>{p("role",e)},children:[(0,s.jsx)(F.i4,{children:(0,s.jsx)(F.ki,{placeholder:"-- select role --"})}),(0,s.jsx)(F.Bw,{children:(0,s.jsxs)(F.DI,{children:[(0,s.jsx)(F.n5,{children:"User role"}),r.map(e=>(0,s.jsx)(F.Ql,{value:e.name,children:e.description},e.name))]})})]})]})}),(0,s.jsxs)("div",{className:"border-t border-t-border px-4 py-2 flex justify-end gap-x-2",children:[(0,s.jsx)(E.sw,{asChild:!0,children:(0,s.jsx)(I.z,{variant:"outline",children:"Cancel"})}),(0,s.jsx)(I.z,{onClick:v,disabled:!N,children:"Save"})]})]})})})}function q(e){let{users:a,roles:t,getUsers:n,deleteUsers:o,getUser:y,updateUsers:w,createUsers:C,searchUsers:k}=e,I=(0,g.l)(),{mode:_}=(0,b.b)(),[S,D]=(0,l.useState)(a),[E,F]=(0,l.useState)(!1),[z,R]=(0,l.useState)([]),[U,A]=(0,l.useState)(!1),{confirm:L}=(0,N.t)(),V=(0,l.useCallback)(async(e,t)=>{F(!0);let s=await n({...I.parsed,roles:I.parsed.role?[I.parsed.role]:void 0,page:1,limit:a.limit,...e});s.error?r.Am.error(s.error):(D(s),R([])),null==t||t(s.error,s),F(!1)},[n,I,a]),O=(0,l.useCallback)((e,a)=>{let t=S.data.filter(a=>e.includes(a.userId)).map(e=>e.displayName);L(()=>{(async()=>{try{F(!0),await o(e),await V(),null==a||a()}catch(e){r.Am.error(e.message)}finally{F(!1)}})()},{title:"Delete "+(t.length>1?"users":"user"),message:"<p>Are you sure you want to delete:</p> ".concat(t.map(e=>'<div class="font-bold text-danger">'.concat(e,"</div>")).join("")),negativeLabel:"Cancel",positiveLabel:"Delete",danger:!0})},[L,o,V,S]),q=I.parsed.userId||U?(0,s.jsx)(Z,{roles:t,open:U,getUser:y,updateUsers:w,createUsers:C,onSaveSuccess:V,onClose:()=>A(!1)}):null,M=(0,s.jsx)(B,{roles:t,open:U,userIds:z.map(e=>S.data[e].userId),updateUsers:w,onSaveSuccess:()=>V({page:S.page})}),Q=(0,l.useMemo)(()=>"view"===_,[_]);return(0,s.jsxs)("div",{className:"flex flex-col",children:[(0,s.jsx)(p.DataTable,{title:"Users",selectable:!Q,selectedIndexes:z,onSelect:R,search:{inputPlaceholder:"Search users"},headerActions:(0,s.jsx)(T,{users:S,roles:t,selected:z.map(e=>S.data[e].userId),onDelete:O,getUsers:V,searchUsers:k,toggleUserForm:()=>A(e=>!e)}),columns:[{name:"Display name"},{name:"Email"},{name:"Role"},{name:"Last login date"},{name:"Active",align:"right",cellRenderer(e){let a=S.data[e.rowIndex];return(0,s.jsx)(u,{delayDuration:0,children:(0,s.jsxs)(m,{children:[(0,s.jsx)(f,{asChild:!0,children:(0,s.jsx)(i.Z,{className:(0,c.cn)(a.activationDate?"text-green-400":"text-gray-400","w-4 h-4")})}),!!a.activationDate&&(0,s.jsx)(x,{children:(0,s.jsxs)("p",{className:"text-xs text-muted-foreground",children:["Activation date: ",d()(a.activationDate).format("LLL")]})})]})})}},{name:"Action",align:"right",cellRenderer(e){let a=S.data[e.rowIndex];return(0,s.jsx)(P,{email:a.email,userId:a.userId,userName:a.displayName,isActivated:!!a.activationDate,onDelete:()=>O([a.userId])})}}],data:S.data.map(e=>{var a;return[e.displayName,e.email,(null===(a=t.filter(a=>a.name===e.role)[0])||void 0===a?void 0:a.description)||e.role,e.lastLoginDate?d()(e.lastLoginDate).format("LLL"):"",""]})}),(0,s.jsx)(j.Z,{}),(0,s.jsx)("div",{className:"p-2",children:(0,s.jsx)(h.t,{currentPage:S.page,totalPages:S.totalPages,disabled:E,limit:S.limit||S.totalRows,totalRows:S.totalRows,collectionName:"users",onPaginate:e=>V({page:e},(e,a)=>!e&&I.push({page:(null==a?void 0:a.page)||S.page})),hideControls:!1,hideSummary:!1})}),q,M,E&&(0,s.jsx)(v.a,{overlay:!0})]})}},39661:function(e,a,t){"use strict";t.d(a,{a:function(){return r}});var s=t(57437),l=t(89627);function r(e){let{overlay:a,transparent:t}=e;return(0,s.jsx)(s.Fragment,{children:(0,s.jsx)("div",{style:{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",...a?{height:"100%",position:"fixed",top:0,left:0,bottom:0,zIndex:999,backgroundColor:t?"transparent":"rgba(255,255,255,.6)"}:{padding:"50px 0"}},children:(0,s.jsx)(l.Z,{style:{height:24,width:24},className:"animate-spin"})})})}},99221:function(e,a,t){"use strict";t.d(a,{t:function(){return b}});var s=t(57437),l=t(2265),r=t(70518),i=t(87592),n=t(63550),d=t(37440),o=t(50495);let c=e=>{let{className:a,...t}=e;return(0,s.jsx)("nav",{role:"navigation","aria-label":"pagination",className:(0,d.cn)("mx-auto flex w-full justify-center",a),...t})};c.displayName="Pagination";let u=l.forwardRef((e,a)=>{let{className:t,...l}=e;return(0,s.jsx)("ul",{ref:a,className:(0,d.cn)("flex flex-row items-center gap-1",t),...l})});u.displayName="PaginationContent";let m=l.forwardRef((e,a)=>{let{className:t,...l}=e;return(0,s.jsx)("li",{ref:a,className:(0,d.cn)("",t),...l})});m.displayName="PaginationItem";let f=e=>{let{className:a,isActive:t,size:l="icon",...r}=e;return(0,s.jsx)("a",{"aria-current":t?"page":void 0,className:(0,d.cn)((0,o.d)({variant:t?"outline":"ghost",size:l}),a),...r})};f.displayName="PaginationLink";let x=e=>{let{className:a,...t}=e;return(0,s.jsxs)(f,{"aria-label":"Go to previous page",size:"default",className:(0,d.cn)("gap-1 pl-2.5",a),...t,children:[(0,s.jsx)(r.Z,{className:"h-4 w-4"}),(0,s.jsx)("span",{children:"Previous"})]})};x.displayName="PaginationPrevious";let p=e=>{let{className:a,...t}=e;return(0,s.jsxs)(f,{"aria-label":"Go to next page",size:"default",className:(0,d.cn)("gap-1 pr-2.5",a),...t,children:[(0,s.jsx)("span",{children:"Next"}),(0,s.jsx)(i.Z,{className:"h-4 w-4"})]})};p.displayName="PaginationNext";let h=e=>{let{className:a,...t}=e;return(0,s.jsxs)("span",{"aria-hidden":!0,className:(0,d.cn)("flex h-9 w-9 items-center justify-center",a),...t,children:[(0,s.jsx)(n.Z,{className:"h-4 w-4"}),(0,s.jsx)("span",{className:"sr-only",children:"More pages"})]})};h.displayName="PaginationEllipsis";var j=t(78448);let v="LEFT",g="RIGHT";function N(e,a){let t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1,s=e,l=[];for(;s<=a;)l.push(s),s+=t;return l}function b(e){let{currentPage:a,totalPages:t,disabled:l,limit:r=1,totalRows:i,collectionName:n="results",hideControls:o,hideSummary:b,classes:y}=e,w=function(e){let{currentPage:a=1,totalPages:t=0,onPaginate:s}=e,l=[{id:"first",label:"Previous",disabled:a<2,isPrev:!0,isNext:!1,isEllipsis:!1,onClick:()=>s(a-1)}];return(function(e){let{totalPages:a=0,currentPage:t=1}=e;if(a>9){let e=[],s=t-2,l=t+2,r=a-1,i=s>2?s:2,n=l<r?l:r,d=7-(e=N(i,n)).length-1,o=i>2,c=n<r;return o&&!c?e=[v,...N(i-d,i-1),...e]:!o&&c?e=[...e,...N(n+1,n+d),g]:o&&c&&(e=[v,...e,g]),[1,...e,a]}return N(1,a)})(e).forEach(e=>{[v,g].includes(e)?l.push({label:"...",id:"".concat(e),disabled:!1,isPrev:!1,isNext:!1,isEllipsis:!0,onClick:()=>{}}):l.push({id:"".concat(e),label:"".concat(e),disabled:a===e,isPrev:!1,isNext:!1,isEllipsis:!1,onClick:()=>s(Number(e))})}),l.push({id:"last",label:"Next",disabled:t===a,isPrev:!1,isNext:!0,isEllipsis:!1,onClick:()=>s(a+1)}),l}(e);return o&&b?null:(0,s.jsxs)("div",{className:"flex flex-col justify-center items-center gap-y-2",children:[!b&&(0,s.jsxs)("div",{className:"text-xs opacity-50 min-w-10",children:["Showing ",i?(0,j.c)((a-1)*r+1):0,"\xa0-\xa0",(0,j.c)(Math.min(i,a*r)),"\xa0of\xa0",(0,j.c)(i,{separator:" "})," ",n]}),!o&&(0,s.jsx)(c,{children:(0,s.jsx)(u,{children:w.map(e=>(0,s.jsx)(m,{children:(()=>{let r="".concat(a)==="".concat(e.label),i=e.disabled||l,n="opacity-50",o=()=>!i&&e.onClick();return e.isPrev?(i=i||1===a,(0,s.jsx)(x,{href:"#",className:(0,d.cn)(1===a?n:""),onClick:e=>{e.stopPropagation(),e.preventDefault(),o()}})):e.isEllipsis?(0,s.jsx)(h,{className:(0,d.cn)(i?n:"","hidden md:flex",null==y?void 0:y.pageNumber)}):e.isNext?(i=i||a===t,(0,s.jsx)(p,{href:"#",className:(0,d.cn)(i?n:""),onClick:e=>{e.stopPropagation(),e.preventDefault(),o()}})):(0,s.jsx)(f,{href:"#",className:(0,d.cn)(i?n:"","hidden md:flex",null==y?void 0:y.pageNumber),isActive:r,onClick:e=>{e.stopPropagation(),e.preventDefault(),o()},children:e.label})})()},e.id))})})]})}},25704:function(e,a,t){"use strict";t.r(a),t.d(a,{Title:function(){return r}});var s=t(2265),l=t(20357);function r(e){let{children:a}=e;return(0,s.useEffect)(()=>{document.title=[l.env.NEXT_PUBLIC_APP_NAME,a].filter(e=>e).join(" - ")},[a]),(0,s.useEffect)(()=>()=>{document.title="".concat(l.env.NEXT_PUBLIC_APP_NAME)},[]),null}},67135:function(e,a,t){"use strict";t.d(a,{_:function(){return o}});var s=t(57437),l=t(2265),r=t(38364),i=t(12218),n=t(37440);let d=(0,i.j)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),o=l.forwardRef((e,a)=>{let{className:t,secondary:l,error:i,...o}=e;return(0,s.jsx)(r.f,{ref:a,className:(0,n.cn)(d(),l&&"text-xs",i?"text-danger":"",t),...o})});o.displayName=r.f.displayName},46294:function(e,a,t){"use strict";t.d(a,{Bw:function(){return h},DI:function(){return u},Ph:function(){return c},Ql:function(){return v},i4:function(){return f},ki:function(){return m},n5:function(){return j}});var s=t(57437),l=t(2265),r=t(48297),i=t(42421),n=t(14392),d=t(22468),o=t(37440);let c=r.fC,u=r.ZA,m=r.B4,f=l.forwardRef((e,a)=>{let{className:t,children:l,error:n,...d}=e;return(0,s.jsxs)(r.xz,{ref:a,className:(0,o.cn)("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",n&&"border-danger",t),...d,children:[l,(0,s.jsx)(r.JO,{asChild:!0,children:(0,s.jsx)(i.Z,{className:"h-4 w-4 opacity-50"})})]})});f.displayName=r.xz.displayName;let x=l.forwardRef((e,a)=>{let{className:t,...l}=e;return(0,s.jsx)(r.u_,{ref:a,className:(0,o.cn)("flex cursor-default items-center justify-center py-1",t),...l,children:(0,s.jsx)(n.Z,{className:"h-4 w-4"})})});x.displayName=r.u_.displayName;let p=l.forwardRef((e,a)=>{let{className:t,...l}=e;return(0,s.jsx)(r.$G,{ref:a,className:(0,o.cn)("flex cursor-default items-center justify-center py-1",t),...l,children:(0,s.jsx)(i.Z,{className:"h-4 w-4"})})});p.displayName=r.$G.displayName;let h=l.forwardRef((e,a)=>{let{className:t,children:l,position:i="popper",...n}=e;return(0,s.jsx)(r.h_,{children:(0,s.jsxs)(r.VY,{ref:a,className:(0,o.cn)("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2","popper"===i&&"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",t),position:i,...n,children:[(0,s.jsx)(x,{}),(0,s.jsx)(r.l_,{className:(0,o.cn)("p-1","popper"===i&&"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),children:l}),(0,s.jsx)(p,{})]})})});h.displayName=r.VY.displayName;let j=l.forwardRef((e,a)=>{let{className:t,...l}=e;return(0,s.jsx)(r.__,{ref:a,className:(0,o.cn)("py-1.5 pl-8 pr-2 text-sm font-semibold",t),...l})});j.displayName=r.__.displayName;let v=l.forwardRef((e,a)=>{let{className:t,children:l,...i}=e;return(0,s.jsxs)(r.ck,{ref:a,className:(0,o.cn)("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",t),...i,children:[(0,s.jsx)("span",{className:"absolute left-2 flex h-3.5 w-3.5 items-center justify-center",children:(0,s.jsx)(r.wU,{children:(0,s.jsx)(d.Z,{className:"h-4 w-4"})})}),(0,s.jsx)(r.eT,{children:l})]})});v.displayName=r.ck.displayName,l.forwardRef((e,a)=>{let{className:t,...l}=e;return(0,s.jsx)(r.Z0,{ref:a,className:(0,o.cn)("-mx-1 my-1 h-px bg-muted",t),...l})}).displayName=r.Z0.displayName},64344:function(e,a,t){"use strict";t.d(a,{Z:function(){return n}});var s=t(57437),l=t(2265),r=t(48484),i=t(37440);let n=l.forwardRef((e,a)=>{let{className:t,orientation:l="horizontal",decorative:n=!0,...d}=e;return(0,s.jsx)(r.f,{ref:a,decorative:n,orientation:l,className:(0,i.cn)("shrink-0 bg-border","horizontal"===l?"h-[1px] w-full":"h-full w-[1px]",t),...d})});n.displayName=r.f.displayName},95317:function(e,a,t){"use strict";t.d(a,{Ei:function(){return g},FF:function(){return j},Tu:function(){return h},aM:function(){return c},bC:function(){return v},sw:function(){return u},ue:function(){return p},yo:function(){return o}});var s=t(57437),l=t(2265),r=t(13304),i=t(12218),n=t(74697),d=t(37440);let o=r.fC,c=r.xz,u=r.x8,m=r.h_,f=l.forwardRef((e,a)=>{let{className:t,...l}=e;return(0,s.jsx)(r.aV,{className:(0,d.cn)("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",t),...l,ref:a})});f.displayName=r.aV.displayName;let x=(0,i.j)("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",{variants:{side:{top:"inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",bottom:"inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",left:"inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",right:"inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"}},defaultVariants:{side:"right"}}),p=l.forwardRef((e,a)=>{let{side:t="right",className:l,children:i,hideCloseButton:o,...c}=e;return(0,s.jsxs)(m,{children:[(0,s.jsx)(f,{}),(0,s.jsxs)(r.VY,{ref:a,className:(0,d.cn)(x({side:t}),l),...c,children:[i,!0!==o&&(0,s.jsxs)(r.x8,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",children:[(0,s.jsx)(n.Z,{className:"h-4 w-4"}),(0,s.jsx)("span",{className:"sr-only",children:"Close"})]})]})]})});p.displayName=r.VY.displayName;let h=e=>{let{className:a,...t}=e;return(0,s.jsx)("div",{className:(0,d.cn)("flex flex-col space-y-2 text-center sm:text-left",a),...t})};h.displayName="SheetHeader";let j=e=>{let{className:a,...t}=e;return(0,s.jsx)("div",{className:(0,d.cn)("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",a),...t})};j.displayName="SheetFooter";let v=l.forwardRef((e,a)=>{let{className:t,...l}=e;return(0,s.jsx)(r.Dx,{ref:a,className:(0,d.cn)("text-lg font-semibold text-foreground",t),...l})});v.displayName=r.Dx.displayName;let g=l.forwardRef((e,a)=>{let{className:t,...l}=e;return(0,s.jsx)(r.dk,{ref:a,className:(0,d.cn)("text-sm text-muted-foreground",t),...l})});g.displayName=r.dk.displayName},53453:function(e,a,t){"use strict";t.d(a,{AppContextProvider:function(){return d},b:function(){return n}});var s=t(57437),l=t(2265),r=t(79512);let i=(0,l.createContext)(null),n=()=>(0,l.useContext)(i);function d(e){let{children:a,...t}=e,{isAdmin:n,isSuperUser:d,mode:o,sys:c}=t,{setTheme:u}=(0,r.F)();(0,l.useEffect)(()=>{"yes"===c.data.hide_theme_toggle&&u("light")},[c]);let m={...t,viewOnly:!n&&!d||"view"===o};return(0,s.jsx)(i.Provider,{value:m,children:a})}},53699:function(e,a,t){"use strict";t.d(a,{s:function(){return r}});var s=t(39099);let l={title:"",message:"",buttonLabel:"Ok",variant:"info",onClose:void 0},r=(0,s.Ue)(e=>({isOpen:!1,...l,alert:a=>e({isOpen:!0,...l,...a}),close:()=>e({isOpen:!1,onClose:void 0,...l})}))},76230:function(e,a,t){"use strict";t.d(a,{t:function(){return r}});var s=t(39099);let l={danger:!1,title:"Confirm",message:"Are you sure?",positiveLabel:"Ok",negativeLabel:"Cancel"},r=(0,s.Ue)(e=>({isOpen:!1,...l,confirm:(a,t)=>e({isOpen:!0,...l,...t,onConfirm:a}),close:()=>e({isOpen:!1,onConfirm:void 0,...l})}))},95974:function(e,a,t){"use strict";t.d(a,{q:function(){return l}});var s=t(2265);function l(e){let a=(0,s.useRef)(0);return(0,s.useEffect)(()=>{if(a.current+=1,1!==a.current)return e()},[e])}},78448:function(e,a,t){"use strict";function s(e,a){let{decimals:t=0,separator:s=" "}={...a};isNaN(e=Number("".concat(e).replace(/[^a-z0-9.]+/gi,"")))&&(e="0");let l=(e="".concat(Number(e).toFixed(t>=0?t:2))).toString().split(".");return l[0]=l[0].replace(/\B(?=(\d{3})+(?!\d))/g,s),l.join(".")}t.d(a,{c:function(){return s}})}},function(e){e.O(0,[6990,4868,5360,8429,2592,9343,7946,1072,5007,1344,9370,4686,5944,7478,7023,1744],function(){return e(e.s=40266)}),_N_E=e.O()}]);