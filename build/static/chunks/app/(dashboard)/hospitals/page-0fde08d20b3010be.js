(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4075],{37306:function(e,t,a){Promise.resolve().then(a.bind(a,36734)),Promise.resolve().then(a.bind(a,25704))},36734:function(e,t,a){"use strict";a.d(t,{HospitalsTable:function(){return R}});var s=a(57437),l=a(2265),n=a(27776),i=a(75944),r=a(99221),o=a(64344),c=a(39661),d=a(23733),u=a(76230),p=a(45188),f=a(90399),m=a(46910),h=a(50495);function x(e){let{hospitalId:t,hospitalName:a,onDelete:l}=e,n=(0,d.l)();return(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)(m.h_,{children:[(0,s.jsx)(m.$F,{asChild:!0,children:(0,s.jsx)(h.z,{variant:"ghost",size:"icon",className:"p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent",children:(0,s.jsx)(p.Z,{className:"h-4 w-4"})})}),(0,s.jsxs)(m.AW,{children:[(0,s.jsx)(m.Ju,{children:a}),(0,s.jsx)(m.VD,{}),(0,s.jsx)(m.Xi,{onClick:()=>n.push({hospitalId:t}),children:"Edit"}),(0,s.jsx)(m.VD,{}),(0,s.jsxs)(m.Xi,{onClick:l,className:"text-danger focus:bg-danger focus:text-danger-foreground",children:[(0,s.jsx)(f.Z,{className:"mr-2 h-4 w-4"}),(0,s.jsx)("span",{children:"Delete"})]})]})]})})}var g=a(42873),y=a(20920),v=a(39343),j=a(95317),N=a(83102),b=a(67135),w=a(53699),k=a(95974);function C(e){let{open:t,hospitalId:a,getHospital:n,onClose:i,updateHospitals:r,createHospitals:o,onSaveSuccess:u}=e,{alert:p}=(0,w.s)(),{parsed:f,replace:m}=(0,d.l)(),x=a||f.hospitalId,[C,I]=(0,l.useState)(!1),[Z,P]=(0,l.useState)(!1),[,S]=(0,l.useState)(),{setValue:D,register:R,handleSubmit:E}=(0,v.cI)({defaultValues:{hospitalId:x||(0,y.Z)(),name:""}}),z=(0,l.useCallback)(()=>{x&&(I(!0),n(x).then(e=>{S(e),e&&(D("hospitalId",e.hospitalId),D("name",e.name))}).catch(e=>p({title:"",message:"Failed to load hospital: "+e.message,variant:"error",onClose:()=>m({hospitalId:void 0})})).finally(()=>I(!1)))},[x,m,p,D,n]);(0,k.q)(z);let V=E(e=>{(async()=>{try{P(!0),x?await r([{hospitalId:x,data:e}]):await o([e]),u&&await u(),p({variant:"success",message:"Hospital was saved successfully!",onClose:()=>{null==i||i(),m({hospitalId:void 0})}})}catch(e){p({title:"",message:"Failed to save hospital: "+e.message,variant:"error"})}finally{P(!1)}})()});return C?(0,s.jsx)(c.a,{overlay:!0}):(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)(j.yo,{open:t||!!f.hospitalId,onOpenChange:()=>{null==i||i(),m({hospitalId:void 0})},children:[(0,s.jsx)(j.aM,{asChild:!0,children:(0,s.jsx)(h.z,{className:"md:hidden",variant:"ghost",children:(0,s.jsx)(g.Z,{className:"h-6 w-6"})})}),(0,s.jsxs)(j.ue,{side:"right",className:"p-0 m-0 flex flex-col",children:[(0,s.jsx)(j.Tu,{className:"py-2 px-4 border-b border-b-border",children:(0,s.jsxs)(j.bC,{children:[x?"Edit":"New"," Hospital"]})}),(0,s.jsx)("div",{className:"flex-1 flex flex-col py-2 px-4 gap-y-4 overflow-y-auto",children:(0,s.jsxs)("div",{children:[(0,s.jsx)(b._,{htmlFor:"name",children:"Hospital Name"}),(0,s.jsx)(N.I,{...R("name",{required:!0,disabled:Z}),placeholder:"Hospital Name",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"})]})}),(0,s.jsxs)("div",{className:"border-t border-t-border px-4 py-2 flex justify-end gap-x-2",children:[(0,s.jsx)(j.sw,{asChild:!0,children:(0,s.jsx)(h.z,{variant:"outline",children:"Cancel"})}),(0,s.jsx)(h.z,{onClick:V,children:"Save"})]})]})]})})}var I=a(92513),Z=a(5192),P=a(19573);function S(e){let{searchHospitals:t,onDelete:a}=e,c=(0,l.useRef)(),[u,{width:p}]=(0,Z.Z)(),f=(0,d.l)(),[m,h]=(0,l.useState)(!1),[g,y]=(0,l.useState)(!1),[j,b]=(0,l.useState)(!1),[w,k]=(0,l.useState)(),[C,I]=(0,l.useState)(),{watch:S,register:D,handleSubmit:R}=(0,v.cI)({defaultValues:{searchValue:""}}),E=S("searchValue"),z=(0,l.useMemo)(()=>(null==w?void 0:w.page)||1,[null==w?void 0:w.page]),V=(0,l.useMemo)(()=>f.parsed.hospitalId,[f.parsed.hospitalId]);(0,l.useEffect)(()=>{E||h(!1)},[E]);let M=(0,l.useCallback)(async e=>{try{if(E||(null==w?void 0:w.searchValue)!==E){b(!0);let a=await t({searchValue:E,limit:5,...e});a.error?n.Am.error(a.error):k(a)}}catch(e){n.Am.error(e.message)}finally{b(!1)}},[E,w,t]);(0,l.useEffect)(()=>{if(V&&w&&C!==V){var e;I(null===(e=w.data.filter(e=>e.hospitalId===V)[0])||void 0===e?void 0:e.hospitalId)}},[V,w,C]),(0,l.useEffect)(()=>{C&&!V&&(I(void 0),M({page:z}))},[V,C,z,M]);let H=R(e=>{let{searchValue:t}=e;(async()=>{try{if(t){c.current&&clearTimeout(c.current),y(!0),h(!0);let e=document.querySelector("[data-search-input]");setTimeout(()=>null==e?void 0:e.focus(),10),await M({searchValue:t})}else k(void 0),h(!1)}catch(e){n.Am.error(e.message)}finally{y(!1)}})()});return(0,s.jsxs)(P.J2,{open:m,onOpenChange:e=>{h(e)},children:[(0,s.jsx)(P.xo,{disabled:!0,className:"w-full",children:(0,s.jsx)("form",{onSubmit:H,className:"",ref:u,children:(0,s.jsx)(N.I,{...D("searchValue",{required:!0}),type:"search",placeholder:"Search hospitals","data-search-input":"true",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",onFocus:e=>{h(!!E),setTimeout(()=>e.target.focus(),0)},onKeyUp:()=>{c.current&&clearTimeout(c.current),c.current=setTimeout(H,1e3)}})})}),(0,s.jsx)(P.yk,{style:{width:p},className:"flex flex-col gap-y-2 p-0",children:!!w&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(i.DataTable,{loading:j,maxRows:5,columns:[{name:"Name"},{name:"Action",align:"right",cellRenderer(e){let t=w.data[e.rowIndex];return(0,s.jsx)(x,{hospitalId:t.hospitalId,hospitalName:t.name,onDelete:()=>a([t.hospitalId],()=>M({page:w.page}))})}}],data:w.data.map(e=>[e.name||"",""])}),(0,s.jsx)(o.Z,{}),(0,s.jsx)("div",{className:"p-2",children:(0,s.jsx)(r.t,{currentPage:w.page,totalPages:w.totalPages,disabled:j,limit:w.limit||w.totalRows,totalRows:w.totalRows,collectionName:"hospitals",onPaginate:e=>M({page:e}),hideControls:!1,hideSummary:!1})})]})})]})}function D(e){let{selected:t,onDelete:a,toggleHospitalForm:n,searchHospitals:i}=e,r=(0,d.l)(),[c,u]=(0,l.useState)(r.parsed.role||"all"),[p,m]=(0,l.useState)(r.parsed.status||"all");return(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)("div",{className:"py-4 flex flex-col gap-y-2",children:[(0,s.jsxs)("div",{className:"px-4 flex flex-col gap-y-2 md:flex-row md:gap-y-0 md:gap-x-2",children:[(0,s.jsxs)("div",{className:"flex items-center gap-x-2",children:[(0,s.jsx)("span",{className:"text-2xl md:mr-auto",children:"Hospitals"}),(0,s.jsx)("div",{className:"ml-auto"}),(0,s.jsxs)(h.z,{variant:"outline",className:"w-auto h-auto border-primary text-primary",onClick:()=>n(),children:[(0,s.jsx)(I.Z,{className:"w-4 h-4 mr-1"}),(0,s.jsx)("span",{children:"New Hospital"})]})]}),(0,s.jsx)("div",{className:"flex-1",children:(0,s.jsx)(S,{searchHospitals:i,onDelete:a})})]}),!!t.length&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(o.Z,{}),(0,s.jsxs)("div",{className:"px-4 flex flex-wrap gap-x-2 gap-y-1",children:[(0,s.jsx)("div",{className:"md:ml-auto"}),(0,s.jsx)("div",{children:(0,s.jsxs)(h.z,{variant:"destructive",className:"h-auto w-auto",onClick:()=>a(t),children:[(0,s.jsx)(f.Z,{className:"h-4 w-4 mr-1"}),(0,s.jsx)("span",{children:t.length>1?"Delete ".concat(t.length," selected hospitals"):"Delete selected hospital"})]})})]})]})]})})}function R(e){let{hospitals:t,getHospitals:a,deleteHospitals:p,getHospital:f,updateHospitals:m,createHospitals:h,searchHospitals:g}=e,y=(0,d.l)(),[v,j]=(0,l.useState)(t),[N,b]=(0,l.useState)(!1),[w,k]=(0,l.useState)([]),[I,Z]=(0,l.useState)(!1),{confirm:P}=(0,u.t)(),S=(0,l.useCallback)(async(e,s)=>{b(!0);let l=await a({...y.parsed,roles:y.parsed.role?[y.parsed.role]:void 0,page:1,limit:t.limit,...e});l.error?n.Am.error(l.error):(j(l),k([])),null==s||s(l.error,l),b(!1)},[a,y,t]),R=(0,l.useCallback)((e,t)=>{let a=v.data.filter(t=>e.includes(t.hospitalId)).map(e=>e.name);P(()=>{(async()=>{try{b(!0),await p(e),await S(),null==t||t()}catch(e){n.Am.error(e.message)}finally{b(!1)}})()},{title:"Delete "+(a.length>1?"hospitals":"hospital"),message:"<p>Are you sure you want to delete:</p> ".concat(a.map(e=>'<div class="font-bold text-danger">'.concat(e,"</div>")).join("")),negativeLabel:"Cancel",positiveLabel:"Delete",danger:!0})},[P,p,S,v]),E=y.parsed.hospitalId||I?(0,s.jsx)(C,{open:I,getHospital:f,updateHospitals:m,createHospitals:h,onSaveSuccess:S,onClose:()=>Z(!1)}):null;return(0,s.jsxs)("div",{className:"flex flex-col",children:[(0,s.jsx)(D,{hospitals:v,selected:w.map(e=>v.data[e].hospitalId),onDelete:R,getHospitals:S,searchHospitals:g,toggleHospitalForm:()=>Z(e=>!e)}),(0,s.jsx)(o.Z,{}),(0,s.jsx)(i.DataTable,{selectable:!0,selectedIndexes:w,onSelect:k,columns:[{name:"Name"},{name:"Action",align:"right",cellRenderer(e){let t=v.data[e.rowIndex];return(0,s.jsx)(x,{hospitalId:t.hospitalId,hospitalName:t.name,onDelete:()=>R([t.hospitalId])})}}],data:v.data.map(e=>[e.name,""])}),(0,s.jsx)(o.Z,{}),(0,s.jsx)("div",{className:"p-2",children:(0,s.jsx)(r.t,{currentPage:v.page,totalPages:v.totalPages,disabled:N,limit:v.limit||v.totalRows,totalRows:v.totalRows,collectionName:"hospitals",onPaginate:e=>S({page:e},(e,t)=>!e&&y.push({page:(null==t?void 0:t.page)||v.page})),hideControls:!1,hideSummary:!1})}),E,N&&(0,s.jsx)(c.a,{overlay:!0})]})}},39661:function(e,t,a){"use strict";a.d(t,{a:function(){return n}});var s=a(57437),l=a(89627);function n(e){let{overlay:t,transparent:a}=e;return(0,s.jsx)(s.Fragment,{children:(0,s.jsx)("div",{style:{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",...t?{height:"100%",position:"fixed",top:0,left:0,bottom:0,zIndex:999,backgroundColor:a?"transparent":"rgba(255,255,255,.6)"}:{padding:"50px 0"}},children:(0,s.jsx)(l.Z,{style:{height:24,width:24},className:"animate-spin"})})})}},99221:function(e,t,a){"use strict";a.d(t,{t:function(){return N}});var s=a(57437),l=a(2265),n=a(70518),i=a(87592),r=a(63550),o=a(37440),c=a(50495);let d=e=>{let{className:t,...a}=e;return(0,s.jsx)("nav",{role:"navigation","aria-label":"pagination",className:(0,o.cn)("mx-auto flex w-full justify-center",t),...a})};d.displayName="Pagination";let u=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)("ul",{ref:t,className:(0,o.cn)("flex flex-row items-center gap-1",a),...l})});u.displayName="PaginationContent";let p=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)("li",{ref:t,className:(0,o.cn)("",a),...l})});p.displayName="PaginationItem";let f=e=>{let{className:t,isActive:a,size:l="icon",...n}=e;return(0,s.jsx)("a",{"aria-current":a?"page":void 0,className:(0,o.cn)((0,c.d)({variant:a?"outline":"ghost",size:l}),t),...n})};f.displayName="PaginationLink";let m=e=>{let{className:t,...a}=e;return(0,s.jsxs)(f,{"aria-label":"Go to previous page",size:"default",className:(0,o.cn)("gap-1 pl-2.5",t),...a,children:[(0,s.jsx)(n.Z,{className:"h-4 w-4"}),(0,s.jsx)("span",{children:"Previous"})]})};m.displayName="PaginationPrevious";let h=e=>{let{className:t,...a}=e;return(0,s.jsxs)(f,{"aria-label":"Go to next page",size:"default",className:(0,o.cn)("gap-1 pr-2.5",t),...a,children:[(0,s.jsx)("span",{children:"Next"}),(0,s.jsx)(i.Z,{className:"h-4 w-4"})]})};h.displayName="PaginationNext";let x=e=>{let{className:t,...a}=e;return(0,s.jsxs)("span",{"aria-hidden":!0,className:(0,o.cn)("flex h-9 w-9 items-center justify-center",t),...a,children:[(0,s.jsx)(r.Z,{className:"h-4 w-4"}),(0,s.jsx)("span",{className:"sr-only",children:"More pages"})]})};x.displayName="PaginationEllipsis";var g=a(78448);let y="LEFT",v="RIGHT";function j(e,t){let a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1,s=e,l=[];for(;s<=t;)l.push(s),s+=a;return l}function N(e){let{currentPage:t,totalPages:a,disabled:l,limit:n=1,totalRows:i,collectionName:r="results",hideControls:c,hideSummary:N,classes:b}=e,w=function(e){let{currentPage:t=1,totalPages:a=0,onPaginate:s}=e,l=[{id:"first",label:"Previous",disabled:t<2,isPrev:!0,isNext:!1,isEllipsis:!1,onClick:()=>s(t-1)}];return(function(e){let{totalPages:t=0,currentPage:a=1}=e;if(t>9){let e=[],s=a-2,l=a+2,n=t-1,i=s>2?s:2,r=l<n?l:n,o=7-(e=j(i,r)).length-1,c=i>2,d=r<n;return c&&!d?e=[y,...j(i-o,i-1),...e]:!c&&d?e=[...e,...j(r+1,r+o),v]:c&&d&&(e=[y,...e,v]),[1,...e,t]}return j(1,t)})(e).forEach(e=>{[y,v].includes(e)?l.push({label:"...",id:"".concat(e),disabled:!1,isPrev:!1,isNext:!1,isEllipsis:!0,onClick:()=>{}}):l.push({id:"".concat(e),label:"".concat(e),disabled:t===e,isPrev:!1,isNext:!1,isEllipsis:!1,onClick:()=>s(Number(e))})}),l.push({id:"last",label:"Next",disabled:a===t,isPrev:!1,isNext:!0,isEllipsis:!1,onClick:()=>s(t+1)}),l}(e);return c&&N?null:(0,s.jsxs)("div",{className:"flex flex-col justify-center items-center gap-y-2",children:[!N&&(0,s.jsxs)("div",{className:"text-xs opacity-50 min-w-10",children:["Showing ",i?(0,g.c)((t-1)*n+1):0,"\xa0-\xa0",(0,g.c)(Math.min(i,t*n)),"\xa0of\xa0",(0,g.c)(i,{separator:" "})," ",r]}),!c&&(0,s.jsx)(d,{children:(0,s.jsx)(u,{children:w.map(e=>(0,s.jsx)(p,{children:(()=>{let n="".concat(t)==="".concat(e.label),i=e.disabled||l,r="opacity-50",c=()=>!i&&e.onClick();return e.isPrev?(i=i||1===t,(0,s.jsx)(m,{href:"#",className:(0,o.cn)(1===t?r:""),onClick:e=>{e.stopPropagation(),e.preventDefault(),c()}})):e.isEllipsis?(0,s.jsx)(x,{className:(0,o.cn)(i?r:"","hidden md:flex",null==b?void 0:b.pageNumber)}):e.isNext?(i=i||t===a,(0,s.jsx)(h,{href:"#",className:(0,o.cn)(i?r:""),onClick:e=>{e.stopPropagation(),e.preventDefault(),c()}})):(0,s.jsx)(f,{href:"#",className:(0,o.cn)(i?r:"","hidden md:flex",null==b?void 0:b.pageNumber),isActive:n,onClick:e=>{e.stopPropagation(),e.preventDefault(),c()},children:e.label})})()},e.id))})})]})}},25704:function(e,t,a){"use strict";a.r(t),a.d(t,{Title:function(){return l}});var s=a(2265);function l(e){let{children:t}=e;return(0,s.useEffect)(()=>{document.title=["Neotree",t].filter(e=>e).join(" - ")},[t]),(0,s.useEffect)(()=>()=>{document.title="".concat("Neotree")},[]),null}},67135:function(e,t,a){"use strict";a.d(t,{_:function(){return c}});var s=a(57437),l=a(2265),n=a(38364),i=a(12218),r=a(37440);let o=(0,i.j)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),c=l.forwardRef((e,t)=>{let{className:a,secondary:l,error:i,...c}=e;return(0,s.jsx)(n.f,{ref:t,className:(0,r.cn)(o(),l&&"text-xs",i?"text-danger":"",a),...c})});c.displayName=n.f.displayName},64344:function(e,t,a){"use strict";a.d(t,{Z:function(){return r}});var s=a(57437),l=a(2265),n=a(48484),i=a(37440);let r=l.forwardRef((e,t)=>{let{className:a,orientation:l="horizontal",decorative:r=!0,...o}=e;return(0,s.jsx)(n.f,{ref:t,decorative:r,orientation:l,className:(0,i.cn)("shrink-0 bg-border","horizontal"===l?"h-[1px] w-full":"h-full w-[1px]",a),...o})});r.displayName=n.f.displayName},95317:function(e,t,a){"use strict";a.d(t,{Ei:function(){return v},FF:function(){return g},Tu:function(){return x},aM:function(){return d},bC:function(){return y},sw:function(){return u},ue:function(){return h},yo:function(){return c}});var s=a(57437),l=a(2265),n=a(13304),i=a(12218),r=a(74697),o=a(37440);let c=n.fC,d=n.xz,u=n.x8,p=n.h_,f=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)(n.aV,{className:(0,o.cn)("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",a),...l,ref:t})});f.displayName=n.aV.displayName;let m=(0,i.j)("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",{variants:{side:{top:"inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",bottom:"inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",left:"inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",right:"inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"}},defaultVariants:{side:"right"}}),h=l.forwardRef((e,t)=>{let{side:a="right",className:l,children:i,hideCloseButton:c,...d}=e;return(0,s.jsxs)(p,{children:[(0,s.jsx)(f,{}),(0,s.jsxs)(n.VY,{ref:t,className:(0,o.cn)(m({side:a}),l),...d,children:[i,!0!==c&&(0,s.jsxs)(n.x8,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",children:[(0,s.jsx)(r.Z,{className:"h-4 w-4"}),(0,s.jsx)("span",{className:"sr-only",children:"Close"})]})]})]})});h.displayName=n.VY.displayName;let x=e=>{let{className:t,...a}=e;return(0,s.jsx)("div",{className:(0,o.cn)("flex flex-col space-y-2 text-center sm:text-left",t),...a})};x.displayName="SheetHeader";let g=e=>{let{className:t,...a}=e;return(0,s.jsx)("div",{className:(0,o.cn)("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",t),...a})};g.displayName="SheetFooter";let y=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)(n.Dx,{ref:t,className:(0,o.cn)("text-lg font-semibold text-foreground",a),...l})});y.displayName=n.Dx.displayName;let v=l.forwardRef((e,t)=>{let{className:a,...l}=e;return(0,s.jsx)(n.dk,{ref:t,className:(0,o.cn)("text-sm text-muted-foreground",a),...l})});v.displayName=n.dk.displayName},53699:function(e,t,a){"use strict";a.d(t,{s:function(){return n}});var s=a(39099);let l={title:"",message:"",buttonLabel:"Ok",variant:"info",onClose:void 0},n=(0,s.Ue)(e=>({isOpen:!1,...l,alert:t=>e({isOpen:!0,...l,...t}),close:()=>e({isOpen:!1,onClose:void 0,...l})}))},76230:function(e,t,a){"use strict";a.d(t,{t:function(){return n}});var s=a(39099);let l={danger:!1,title:"Confirm",message:"Are you sure?",positiveLabel:"Ok",negativeLabel:"Cancel"},n=(0,s.Ue)(e=>({isOpen:!1,...l,confirm:(t,a)=>e({isOpen:!0,...l,...a,onConfirm:t}),close:()=>e({isOpen:!1,onConfirm:void 0,...l})}))},95974:function(e,t,a){"use strict";a.d(t,{q:function(){return l}});var s=a(2265);function l(e){let t=(0,s.useRef)(0);return(0,s.useEffect)(()=>{if(t.current+=1,1!==t.current)return e()},[e])}},78448:function(e,t,a){"use strict";function s(e,t){let{decimals:a=0,separator:s=" "}={...t};isNaN(e=Number("".concat(e).replace(/[^a-z0-9.]+/gi,"")))&&(e="0");let l=(e="".concat(Number(e).toFixed(a>=0?a:2))).toString().split(".");return l[0]=l[0].replace(/\B(?=(\d{3})+(?!\d))/g,s),l.join(".")}a.d(t,{c:function(){return s}})},70518:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(78030).Z)("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]])},45188:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(78030).Z)("EllipsisVertical",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"12",cy:"5",r:"1",key:"gxeob9"}],["circle",{cx:"12",cy:"19",r:"1",key:"lyex9k"}]])},63550:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(78030).Z)("Ellipsis",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]])},89627:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(78030).Z)("Loader",[["path",{d:"M12 2v4",key:"3427ic"}],["path",{d:"m16.2 7.8 2.9-2.9",key:"r700ao"}],["path",{d:"M18 12h4",key:"wj9ykh"}],["path",{d:"m16.2 16.2 2.9 2.9",key:"1bxg5t"}],["path",{d:"M12 18v4",key:"jadmvz"}],["path",{d:"m4.9 19.1 2.9-2.9",key:"bwix9q"}],["path",{d:"M2 12h4",key:"j09sii"}],["path",{d:"m4.9 4.9 2.9 2.9",key:"giyufr"}]])},42873:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(78030).Z)("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]])},92513:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(78030).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},90399:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(78030).Z)("Trash",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}]])},74697:function(e,t,a){"use strict";a.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(78030).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},20920:function(e,t,a){"use strict";a.d(t,{Z:function(){return o}});for(var s,l={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)},n=new Uint8Array(16),i=[],r=0;r<256;++r)i.push((r+256).toString(16).slice(1));var o=function(e,t,a){if(l.randomUUID&&!t&&!e)return l.randomUUID();var r=(e=e||{}).random||(e.rng||function(){if(!s&&!(s="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)))throw Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return s(n)})();if(r[6]=15&r[6]|64,r[8]=63&r[8]|128,t){a=a||0;for(var o=0;o<16;++o)t[a+o]=r[o];return t}return function(e,t=0){return(i[e[t+0]]+i[e[t+1]]+i[e[t+2]]+i[e[t+3]]+"-"+i[e[t+4]]+i[e[t+5]]+"-"+i[e[t+6]]+i[e[t+7]]+"-"+i[e[t+8]]+i[e[t+9]]+"-"+i[e[t+10]]+i[e[t+11]]+i[e[t+12]]+i[e[t+13]]+i[e[t+14]]+i[e[t+15]]).toLowerCase()}(r)}},38364:function(e,t,a){"use strict";a.d(t,{f:function(){return r}});var s=a(2265),l=a(25171),n=a(57437),i=s.forwardRef((e,t)=>(0,n.jsx)(l.WV.label,{...e,ref:t,onMouseDown:t=>{var a;t.target.closest("button, input, select, textarea")||(null===(a=e.onMouseDown)||void 0===a||a.call(e,t),!t.defaultPrevented&&t.detail>1&&t.preventDefault())}}));i.displayName="Label";var r=i},48484:function(e,t,a){"use strict";a.d(t,{f:function(){return c}});var s=a(2265),l=a(25171),n=a(57437),i="horizontal",r=["horizontal","vertical"],o=s.forwardRef((e,t)=>{let{decorative:a,orientation:s=i,...o}=e,c=r.includes(s)?s:i;return(0,n.jsx)(l.WV.div,{"data-orientation":c,...a?{role:"none"}:{"aria-orientation":"vertical"===c?c:void 0,role:"separator"},...o,ref:t})});o.displayName="Separator";var c=o}},function(e){e.O(0,[4868,5360,8429,2592,7946,9343,1072,4549,5944,7478,7023,1744],function(){return e(e.s=37306)}),_N_E=e.O()}]);