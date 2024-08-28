(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4075],{37306:function(e,t,a){Promise.resolve().then(a.bind(a,36734)),Promise.resolve().then(a.bind(a,25704))},36734:function(e,t,a){"use strict";a.d(t,{HospitalsTable:function(){return D}});var s=a(57437),l=a(2265),i=a(27776),n=a(75944),r=a(99221),o=a(64344),c=a(39661),d=a(23733),u=a(76230),p=a(45188),m=a(90399),f=a(46910),x=a(50495);function h(e){let{hospitalId:t,hospitalName:a,onDelete:l}=e,i=(0,d.l)();return(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)(f.h_,{children:[(0,s.jsx)(f.$F,{asChild:!0,children:(0,s.jsx)(x.z,{variant:"ghost",size:"icon",className:"p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent",children:(0,s.jsx)(p.Z,{className:"h-4 w-4"})})}),(0,s.jsxs)(f.AW,{children:[(0,s.jsx)(f.Ju,{children:a}),(0,s.jsx)(f.VD,{}),(0,s.jsx)(f.Xi,{onClick:()=>i.push({hospitalId:t}),children:"Edit"}),(0,s.jsx)(f.VD,{}),(0,s.jsxs)(f.Xi,{onClick:l,className:"text-danger focus:bg-danger focus:text-danger-foreground",children:[(0,s.jsx)(m.Z,{className:"mr-2 h-4 w-4"}),(0,s.jsx)("span",{children:"Delete"})]})]})]})})}var g=a(42873),j=a(20920),N=a(39343),v=a(95317),b=a(83102),y=a(67135),w=a(53699),C=a(95974);function I(e){let{open:t,hospitalId:a,getHospital:i,onClose:n,updateHospitals:r,createHospitals:o,onSaveSuccess:u}=e,{alert:p}=(0,w.s)(),{parsed:m,replace:f}=(0,d.l)(),h=a||m.hospitalId,[I,P]=(0,l.useState)(!1),[k,S]=(0,l.useState)(!1),[,E]=(0,l.useState)(),{setValue:R,register:D,handleSubmit:F}=(0,N.cI)({defaultValues:{hospitalId:h||(0,j.Z)(),name:""}}),H=(0,l.useCallback)(()=>{h&&(P(!0),i(h).then(e=>{E(e),e&&(R("hospitalId",e.hospitalId),R("name",e.name))}).catch(e=>p({title:"",message:"Failed to load hospital: "+e.message,variant:"error",onClose:()=>f({hospitalId:void 0})})).finally(()=>P(!1)))},[h,f,p,R,i]);(0,C.q)(H);let Z=F(e=>{(async()=>{try{S(!0),h?await r([{hospitalId:h,data:e}]):await o([e]),u&&await u(),p({variant:"success",message:"Hospital was saved successfully!",onClose:()=>{null==n||n(),f({hospitalId:void 0})}})}catch(e){p({title:"",message:"Failed to save hospital: "+e.message,variant:"error"})}finally{S(!1)}})()});return I?(0,s.jsx)(c.a,{overlay:!0}):(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)(v.yo,{open:t||!!m.hospitalId,onOpenChange:()=>{null==n||n(),f({hospitalId:void 0})},children:[(0,s.jsx)(v.aM,{asChild:!0,children:(0,s.jsx)(x.z,{className:"md:hidden",variant:"ghost",children:(0,s.jsx)(g.Z,{className:"h-6 w-6"})})}),(0,s.jsxs)(v.ue,{side:"right",className:"p-0 m-0 flex flex-col",children:[(0,s.jsx)(v.Tu,{className:"py-2 px-4 border-b border-b-border",children:(0,s.jsxs)(v.bC,{children:[h?"Edit":"New"," Hospital"]})}),(0,s.jsx)("div",{className:"flex-1 flex flex-col py-2 px-4 gap-y-4 overflow-y-auto",children:(0,s.jsxs)("div",{children:[(0,s.jsx)(y._,{htmlFor:"name",children:"Hospital Name"}),(0,s.jsx)(b.I,{...D("name",{required:!0,disabled:k}),placeholder:"Hospital Name",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"})]})}),(0,s.jsxs)("div",{className:"border-t border-t-border px-4 py-2 flex justify-end gap-x-2",children:[(0,s.jsx)(v.sw,{asChild:!0,children:(0,s.jsx)(x.z,{variant:"outline",children:"Cancel"})}),(0,s.jsx)(x.z,{onClick:Z,children:"Save"})]})]})]})})}var P=a(92513),k=a(5192),S=a(19573);function E(e){let{searchHospitals:t,onDelete:a}=e,c=(0,l.useRef)(),[u,{width:p}]=(0,k.Z)(),m=(0,d.l)(),[f,x]=(0,l.useState)(!1),[g,j]=(0,l.useState)(!1),[v,y]=(0,l.useState)(!1),[w,C]=(0,l.useState)(),[I,P]=(0,l.useState)(),{watch:E,register:R,handleSubmit:D}=(0,N.cI)({defaultValues:{searchValue:""}}),F=E("searchValue"),H=(0,l.useMemo)(()=>(null==w?void 0:w.page)||1,[null==w?void 0:w.page]),Z=(0,l.useMemo)(()=>m.parsed.hospitalId,[m.parsed.hospitalId]);(0,l.useEffect)(()=>{F||x(!1)},[F]);let z=(0,l.useCallback)(async e=>{try{if(F||(null==w?void 0:w.searchValue)!==F){y(!0);let a=await t({searchValue:F,limit:5,...e});a.error?i.Am.error(a.error):C(a)}}catch(e){i.Am.error(e.message)}finally{y(!1)}},[F,w,t]);(0,l.useEffect)(()=>{if(Z&&w&&I!==Z){var e;P(null===(e=w.data.filter(e=>e.hospitalId===Z)[0])||void 0===e?void 0:e.hospitalId)}},[Z,w,I]),(0,l.useEffect)(()=>{I&&!Z&&(P(void 0),z({page:H}))},[Z,I,H,z]);let _=D(e=>{let{searchValue:t}=e;(async()=>{try{if(t){c.current&&clearTimeout(c.current),j(!0),x(!0);let e=document.querySelector("[data-search-input]");setTimeout(()=>null==e?void 0:e.focus(),10),await z({searchValue:t})}else C(void 0),x(!1)}catch(e){i.Am.error(e.message)}finally{j(!1)}})()});return(0,s.jsxs)(S.J2,{open:f,onOpenChange:e=>{x(e)},children:[(0,s.jsx)(S.xo,{disabled:!0,className:"w-full",children:(0,s.jsx)("form",{onSubmit:_,className:"",ref:u,children:(0,s.jsx)(b.I,{...R("searchValue",{required:!0}),type:"search",placeholder:"Search hospitals","data-search-input":"true",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",onFocus:e=>{x(!!F),setTimeout(()=>e.target.focus(),0)},onKeyUp:()=>{c.current&&clearTimeout(c.current),c.current=setTimeout(_,1e3)}})})}),(0,s.jsx)(S.yk,{style:{width:p},className:"flex flex-col gap-y-2 p-0",children:!!w&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.DataTable,{loading:v,maxRows:5,columns:[{name:"Name"},{name:"Action",align:"right",cellRenderer(e){let t=w.data[e.rowIndex];return(0,s.jsx)(h,{hospitalId:t.hospitalId,hospitalName:t.name,onDelete:()=>a([t.hospitalId],()=>z({page:w.page}))})}}],data:w.data.map(e=>[e.name||"",""])}),(0,s.jsx)(o.Z,{}),(0,s.jsx)("div",{className:"p-2",children:(0,s.jsx)(r.t,{currentPage:w.page,totalPages:w.totalPages,disabled:v,limit:w.limit||w.totalRows,totalRows:w.totalRows,collectionName:"hospitals",onPaginate:e=>z({page:e}),hideControls:!1,hideSummary:!1})})]})})]})}function R(e){let{selected:t,onDelete:a,toggleHospitalForm:i,searchHospitals:n}=e,r=(0,d.l)(),[c,u]=(0,l.useState)(r.parsed.role||"all"),[p,f]=(0,l.useState)(r.parsed.status||"all");return(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)("div",{className:"py-4 flex flex-col gap-y-2",children:[(0,s.jsxs)("div",{className:"px-4 flex flex-col gap-y-2 md:flex-row md:gap-y-0 md:gap-x-2",children:[(0,s.jsxs)("div",{className:"flex items-center gap-x-2",children:[(0,s.jsx)("span",{className:"text-2xl md:mr-auto",children:"Hospitals"}),(0,s.jsx)("div",{className:"ml-auto"}),(0,s.jsxs)(x.z,{variant:"outline",className:"w-auto h-auto border-primary text-primary",onClick:()=>i(),children:[(0,s.jsx)(P.Z,{className:"w-4 h-4 mr-1"}),(0,s.jsx)("span",{children:"New Hospital"})]})]}),(0,s.jsx)("div",{className:"flex-1",children:(0,s.jsx)(E,{searchHospitals:n,onDelete:a})})]}),!!t.length&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(o.Z,{}),(0,s.jsxs)("div",{className:"px-4 flex flex-wrap gap-x-2 gap-y-1",children:[(0,s.jsx)("div",{className:"md:ml-auto"}),(0,s.jsx)("div",{children:(0,s.jsxs)(x.z,{variant:"destructive",className:"h-auto w-auto",onClick:()=>a(t),children:[(0,s.jsx)(m.Z,{className:"h-4 w-4 mr-1"}),(0,s.jsx)("span",{children:t.length>1?"Delete ".concat(t.length," selected hospitals"):"Delete selected hospital"})]})})]})]})]})})}function D(e){let{hospitals:t,getHospitals:a,deleteHospitals:p,getHospital:m,updateHospitals:f,createHospitals:x,searchHospitals:g}=e,j=(0,d.l)(),[N,v]=(0,l.useState)(t),[b,y]=(0,l.useState)(!1),[w,C]=(0,l.useState)([]),[P,k]=(0,l.useState)(!1),{confirm:S}=(0,u.t)(),E=(0,l.useCallback)(async(e,s)=>{y(!0);let l=await a({...j.parsed,roles:j.parsed.role?[j.parsed.role]:void 0,page:1,limit:t.limit,...e});l.error?i.Am.error(l.error):(v(l),C([])),null==s||s(l.error,l),y(!1)},[a,j,t]),D=(0,l.useCallback)((e,t)=>{let a=N.data.filter(t=>e.includes(t.hospitalId)).map(e=>e.name);S(()=>{(async()=>{try{y(!0),await p(e),await E(),null==t||t()}catch(e){i.Am.error(e.message)}finally{y(!1)}})()},{title:"Delete "+(a.length>1?"hospitals":"hospital"),message:"<p>Are you sure you want to delete:</p> ".concat(a.map(e=>'<div class="font-bold text-danger">'.concat(e,"</div>")).join("")),negativeLabel:"Cancel",positiveLabel:"Delete",danger:!0})},[S,p,E,N]),F=j.parsed.hospitalId||P?(0,s.jsx)(I,{open:P,getHospital:m,updateHospitals:f,createHospitals:x,onSaveSuccess:E,onClose:()=>k(!1)}):null;return(0,s.jsxs)("div",{className:"flex flex-col",children:[(0,s.jsx)(R,{hospitals:N,selected:w.map(e=>N.data[e].hospitalId),onDelete:D,getHospitals:E,searchHospitals:g,toggleHospitalForm:()=>k(e=>!e)}),(0,s.jsx)(o.Z,{}),(0,s.jsx)(n.DataTable,{selectable:!0,selectedIndexes:w,onSelect:C,columns:[{name:"Name"},{name:"Action",align:"right",cellRenderer(e){let t=N.data[e.rowIndex];return(0,s.jsx)(h,{hospitalId:t.hospitalId,hospitalName:t.name,onDelete:()=>D([t.hospitalId])})}}],data:N.data.map(e=>[e.name,""])}),(0,s.jsx)(o.Z,{}),(0,s.jsx)("div",{className:"p-2",children:(0,s.jsx)(r.t,{currentPage:N.page,totalPages:N.totalPages,disabled:b,limit:N.limit||N.totalRows,totalRows:N.totalRows,collectionName:"hospitals",onPaginate:e=>E({page:e},(e,t)=>!e&&j.push({page:(null==t?void 0:t.page)||N.page})),hideControls:!1,hideSummary:!1})}),F,b&&(0,s.jsx)(c.a,{overlay:!0})]})}},39661:function(e,t,a){"use strict";a.d(t,{a:function(){return i}});var s=a(57437),l=a(89627);function i(e){let{overlay:t,transparent:a}=e;return(0,s.jsx)(s.Fragment,{children:(0,s.jsx)("div",{style:{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",...t?{height:"100%",position:"fixed",top:0,left:0,bottom:0,zIndex:999,backgroundColor:a?"transparent":"rgba(255,255,255,.6)"}:{padding:"50px 0"}},children:(0,s.jsx)(l.Z,{style:{height:24,width:24},className:"animate-spin"})})})}},99221:function(e,t,a){"use strict";a.d(t,{t:function(){return b}});var s=a(57437),l=a(2265),i=a(70518),n=a(87592),r=a(63550),o=a(37440),c=a(50495);let d=e=>{let{className:t,...a}=e;return(0,s.jsx)("nav",{role:"navigation","aria-label":"pagination",className:(0,o.cn)("mx-auto flex w-full justify-center",t),...a})};d.displayName="Pagination";let u=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)("ul",{ref:t,className:(0,o.cn)("flex flex-row items-center gap-1",a),...l})});u.displayName="PaginationContent";let p=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)("li",{ref:t,className:(0,o.cn)("",a),...l})});p.displayName="PaginationItem";let m=e=>{let{className:t,isActive:a,size:l="icon",...i}=e;return(0,s.jsx)("a",{"aria-current":a?"page":void 0,className:(0,o.cn)((0,c.d)({variant:a?"outline":"ghost",size:l}),t),...i})};m.displayName="PaginationLink";let f=e=>{let{className:t,...a}=e;return(0,s.jsxs)(m,{"aria-label":"Go to previous page",size:"default",className:(0,o.cn)("gap-1 pl-2.5",t),...a,children:[(0,s.jsx)(i.Z,{className:"h-4 w-4"}),(0,s.jsx)("span",{children:"Previous"})]})};f.displayName="PaginationPrevious";let x=e=>{let{className:t,...a}=e;return(0,s.jsxs)(m,{"aria-label":"Go to next page",size:"default",className:(0,o.cn)("gap-1 pr-2.5",t),...a,children:[(0,s.jsx)("span",{children:"Next"}),(0,s.jsx)(n.Z,{className:"h-4 w-4"})]})};x.displayName="PaginationNext";let h=e=>{let{className:t,...a}=e;return(0,s.jsxs)("span",{"aria-hidden":!0,className:(0,o.cn)("flex h-9 w-9 items-center justify-center",t),...a,children:[(0,s.jsx)(r.Z,{className:"h-4 w-4"}),(0,s.jsx)("span",{className:"sr-only",children:"More pages"})]})};h.displayName="PaginationEllipsis";var g=a(78448);let j="LEFT",N="RIGHT";function v(e,t){let a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1,s=e,l=[];for(;s<=t;)l.push(s),s+=a;return l}function b(e){let{currentPage:t,totalPages:a,disabled:l,limit:i=1,totalRows:n,collectionName:r="results",hideControls:c,hideSummary:b,classes:y}=e,w=function(e){let{currentPage:t=1,totalPages:a=0,onPaginate:s}=e,l=[{id:"first",label:"Previous",disabled:t<2,isPrev:!0,isNext:!1,isEllipsis:!1,onClick:()=>s(t-1)}];return(function(e){let{totalPages:t=0,currentPage:a=1}=e;if(t>9){let e=[],s=a-2,l=a+2,i=t-1,n=s>2?s:2,r=l<i?l:i,o=7-(e=v(n,r)).length-1,c=n>2,d=r<i;return c&&!d?e=[j,...v(n-o,n-1),...e]:!c&&d?e=[...e,...v(r+1,r+o),N]:c&&d&&(e=[j,...e,N]),[1,...e,t]}return v(1,t)})(e).forEach(e=>{[j,N].includes(e)?l.push({label:"...",id:"".concat(e),disabled:!1,isPrev:!1,isNext:!1,isEllipsis:!0,onClick:()=>{}}):l.push({id:"".concat(e),label:"".concat(e),disabled:t===e,isPrev:!1,isNext:!1,isEllipsis:!1,onClick:()=>s(Number(e))})}),l.push({id:"last",label:"Next",disabled:a===t,isPrev:!1,isNext:!0,isEllipsis:!1,onClick:()=>s(t+1)}),l}(e);return c&&b?null:(0,s.jsxs)("div",{className:"flex flex-col justify-center items-center gap-y-2",children:[!b&&(0,s.jsxs)("div",{className:"text-xs opacity-50 min-w-10",children:["Showing ",n?(0,g.c)((t-1)*i+1):0,"\xa0-\xa0",(0,g.c)(Math.min(n,t*i)),"\xa0of\xa0",(0,g.c)(n,{separator:" "})," ",r]}),!c&&(0,s.jsx)(d,{children:(0,s.jsx)(u,{children:w.map(e=>(0,s.jsx)(p,{children:(()=>{let i="".concat(t)==="".concat(e.label),n=e.disabled||l,r="opacity-50",c=()=>!n&&e.onClick();return e.isPrev?(n=n||1===t,(0,s.jsx)(f,{href:"#",className:(0,o.cn)(1===t?r:""),onClick:e=>{e.stopPropagation(),e.preventDefault(),c()}})):e.isEllipsis?(0,s.jsx)(h,{className:(0,o.cn)(n?r:"","hidden md:flex",null==y?void 0:y.pageNumber)}):e.isNext?(n=n||t===a,(0,s.jsx)(x,{href:"#",className:(0,o.cn)(n?r:""),onClick:e=>{e.stopPropagation(),e.preventDefault(),c()}})):(0,s.jsx)(m,{href:"#",className:(0,o.cn)(n?r:"","hidden md:flex",null==y?void 0:y.pageNumber),isActive:i,onClick:e=>{e.stopPropagation(),e.preventDefault(),c()},children:e.label})})()},e.id))})})]})}},25704:function(e,t,a){"use strict";a.r(t),a.d(t,{Title:function(){return i}});var s=a(2265),l=a(20357);function i(e){let{children:t}=e;return(0,s.useEffect)(()=>{document.title=[l.env.NEXT_PUBLIC_APP_NAME,t].filter(e=>e).join(" - ")},[t]),(0,s.useEffect)(()=>()=>{document.title="".concat(l.env.NEXT_PUBLIC_APP_NAME)},[]),null}},67135:function(e,t,a){"use strict";a.d(t,{_:function(){return c}});var s=a(57437),l=a(2265),i=a(38364),n=a(12218),r=a(37440);let o=(0,n.j)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),c=l.forwardRef((e,t)=>{let{className:a,secondary:l,error:n,...c}=e;return(0,s.jsx)(i.f,{ref:t,className:(0,r.cn)(o(),l&&"text-xs",n?"text-danger":"",a),...c})});c.displayName=i.f.displayName},64344:function(e,t,a){"use strict";a.d(t,{Z:function(){return r}});var s=a(57437),l=a(2265),i=a(48484),n=a(37440);let r=l.forwardRef((e,t)=>{let{className:a,orientation:l="horizontal",decorative:r=!0,...o}=e;return(0,s.jsx)(i.f,{ref:t,decorative:r,orientation:l,className:(0,n.cn)("shrink-0 bg-border","horizontal"===l?"h-[1px] w-full":"h-full w-[1px]",a),...o})});r.displayName=i.f.displayName},95317:function(e,t,a){"use strict";a.d(t,{Ei:function(){return N},FF:function(){return g},Tu:function(){return h},aM:function(){return d},bC:function(){return j},sw:function(){return u},ue:function(){return x},yo:function(){return c}});var s=a(57437),l=a(2265),i=a(13304),n=a(12218),r=a(74697),o=a(37440);let c=i.fC,d=i.xz,u=i.x8,p=i.h_,m=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)(i.aV,{className:(0,o.cn)("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",a),...l,ref:t})});m.displayName=i.aV.displayName;let f=(0,n.j)("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",{variants:{side:{top:"inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",bottom:"inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",left:"inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",right:"inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"}},defaultVariants:{side:"right"}}),x=l.forwardRef((e,t)=>{let{side:a="right",className:l,children:n,hideCloseButton:c,...d}=e;return(0,s.jsxs)(p,{children:[(0,s.jsx)(m,{}),(0,s.jsxs)(i.VY,{ref:t,className:(0,o.cn)(f({side:a}),l),...d,children:[n,!0!==c&&(0,s.jsxs)(i.x8,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",children:[(0,s.jsx)(r.Z,{className:"h-4 w-4"}),(0,s.jsx)("span",{className:"sr-only",children:"Close"})]})]})]})});x.displayName=i.VY.displayName;let h=e=>{let{className:t,...a}=e;return(0,s.jsx)("div",{className:(0,o.cn)("flex flex-col space-y-2 text-center sm:text-left",t),...a})};h.displayName="SheetHeader";let g=e=>{let{className:t,...a}=e;return(0,s.jsx)("div",{className:(0,o.cn)("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",t),...a})};g.displayName="SheetFooter";let j=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)(i.Dx,{ref:t,className:(0,o.cn)("text-lg font-semibold text-foreground",a),...l})});j.displayName=i.Dx.displayName;let N=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)(i.dk,{ref:t,className:(0,o.cn)("text-sm text-muted-foreground",a),...l})});N.displayName=i.dk.displayName},53699:function(e,t,a){"use strict";a.d(t,{s:function(){return i}});var s=a(39099);let l={title:"",message:"",buttonLabel:"Ok",variant:"info",onClose:void 0},i=(0,s.Ue)(e=>({isOpen:!1,...l,alert:t=>e({isOpen:!0,...l,...t}),close:()=>e({isOpen:!1,onClose:void 0,...l})}))},76230:function(e,t,a){"use strict";a.d(t,{t:function(){return i}});var s=a(39099);let l={danger:!1,title:"Confirm",message:"Are you sure?",positiveLabel:"Ok",negativeLabel:"Cancel"},i=(0,s.Ue)(e=>({isOpen:!1,...l,confirm:(t,a)=>e({isOpen:!0,...l,...a,onConfirm:t}),close:()=>e({isOpen:!1,onConfirm:void 0,...l})}))},95974:function(e,t,a){"use strict";a.d(t,{q:function(){return l}});var s=a(2265);function l(e){let t=(0,s.useRef)(0);return(0,s.useEffect)(()=>{if(t.current+=1,1!==t.current)return e()},[e])}},78448:function(e,t,a){"use strict";function s(e,t){let{decimals:a=0,separator:s=" "}={...t};isNaN(e=Number("".concat(e).replace(/[^a-z0-9.]+/gi,"")))&&(e="0");let l=(e="".concat(Number(e).toFixed(a>=0?a:2))).toString().split(".");return l[0]=l[0].replace(/\B(?=(\d{3})+(?!\d))/g,s),l.join(".")}a.d(t,{c:function(){return s}})}},function(e){e.O(0,[4868,5360,8429,659,7776,9343,1072,8553,5944,7478,7023,1744],function(){return e(e.s=37306)}),_N_E=e.O()}]);