exports.id=502,exports.ids=[502],exports.modules={57995:(e,s,r)=>{Promise.resolve().then(r.bind(r,79530)),Promise.resolve().then(r.bind(r,96948)),Promise.resolve().then(r.bind(r,10827)),Promise.resolve().then(r.t.bind(r,79404,23))},79530:(e,s,r)=>{"use strict";r.d(s,{DiagnosisForm:()=>O});var t=r(10326),i=r(17577),a=r(35047),n=r(90772),l=r(54432),o=r(87673),d=r(31048),c=r(68483),m=r(11870),x=r(77863),h=r(99463),p=r(74723),u=r(47463),g=r(44099),j=r(82617),y=r(96221),f=r(3529),v=r(58464),b=r(88870),N=r(61541),w=r(83855),k=r(39447),D=r(69508),F=r(47035),C=r(9162),$=r(62288),I=r(60097),S=r(46670),z=r(29354);function R({disabled:e,selected:s,onDelete:r,onCopy:i}){return t.jsx(t.Fragment,{children:!!s.length&&t.jsx(z.h,{children:(0,t.jsxs)(n.z,{variant:"destructive",className:"h-auto w-auto",disabled:e,onClick:()=>r(),children:[t.jsx(F.Z,{className:"h-4 w-4 mr-1"}),t.jsx("span",{children:s.length>1?`Delete ${s.length} symptoms`:"Delete symptom"})]})})})}var Z=r(2025),M=r(88846),V=r(53313),_=r(61892),P=r(69486);function A({children:e,symptom:s,form:r,disabled:a,...o}){let{data:c,index:m}={...s},[h,g]=(0,i.useState)(!1),j=(0,i.useCallback)(()=>({symptomId:c?.symptomId||(0,u.Z)(),expression:c?.expression||"",name:c?.name||"",weight:c?.weight||null,type:c?.type||v.ph[0].value,position:c?.position||1,printable:c?.printable||!0,...c}),[c]),{reset:y,watch:f,register:b,handleSubmit:N,setValue:w}=(0,p.cI)({defaultValues:j()}),k=f("type"),D=f("name"),F=f("printable"),C=(0,i.useMemo)(()=>!!a,[a]),I=N(e=>{!(0,_.x)(m)&&c?r.setValue("symptoms",r.getValues("symptoms").map((s,r)=>({...s,...r===m?e:null}))):r.setValue("symptoms",[...r.getValues("symptoms"),e],{shouldDirty:!0}),g(!1)});return t.jsx(t.Fragment,{children:t.jsx(Z.u,{open:h,title:c?"Add symptom":"Edit symptom",trigger:"function"==typeof e?e({extraProps:o}):e,onOpenChange:e=>{g(e),y(j())},actions:(0,t.jsxs)(t.Fragment,{children:[t.jsx("span",{className:(0,x.cn)("text-danger text-xs",C&&"hidden"),children:"* Required"}),t.jsx("div",{className:"flex-1"}),t.jsx($.GG,{asChild:!0,children:t.jsx(n.z,{variant:"ghost",children:"Cancel"})}),t.jsx(n.z,{disabled:C,onClick:()=>I(),children:"Save"})]}),children:(0,t.jsxs)("div",{className:"flex flex-col gap-y-5",children:[t.jsx(P.D,{children:"Type"}),t.jsx("div",{children:t.jsx(M.E,{disabled:C,defaultValue:k,onValueChange:e=>w("type",e,{shouldDirty:!0}),className:"flex flex-col gap-y-4",children:v.ph.map(e=>(0,t.jsxs)("div",{className:"flex items-center space-x-2",children:[t.jsx(M.m,{value:e.value,id:e.value}),t.jsx(d._,{secondary:!0,htmlFor:e.value,children:e.label})]},e.value))})}),t.jsx(P.D,{children:"Properties"}),(0,t.jsxs)("div",{children:[t.jsx(d._,{error:!C&&!D,htmlFor:"name",children:"Name *"}),t.jsx(l.I,{...b("name",{disabled:C,required:!0}),name:"name",error:!C&&!D})]}),(0,t.jsxs)("div",{children:[t.jsx(d._,{htmlFor:"weight",children:"Weight "}),t.jsx(l.I,{...b("weight",{disabled:C}),name:"weight",type:"number"}),(0,t.jsxs)("span",{className:"text-xs text-muted-foreground",children:["Must be in the range: 0.0 - 1.0 (",t.jsx("b",{children:"default 1.0"}),")"]})]}),(0,t.jsxs)("div",{children:[t.jsx(d._,{htmlFor:"expression",children:"Sign/Risk expression "}),t.jsx(l.I,{...b("expression",{disabled:C}),name:"expression"}),(0,t.jsxs)("span",{className:"text-xs text-muted-foreground",children:["Example: ",t.jsx("b",{children:"($key = true and $key2 = false) or $key3 = 'HD'"})]})]}),t.jsx(P.D,{children:"Print"}),(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex-1 flex items-center space-x-2",children:[t.jsx(V.X,{id:"printable",disabled:C,checked:F,onCheckedChange:()=>w("printable",!F,{shouldDirty:!0})}),t.jsx(d._,{htmlFor:"printable",children:"Print"})]}),t.jsx("span",{className:"text-muted-foreground text-xs",children:"If not checked, data will not be display on the session summary and the printout."})]})]})})})}function T({form:e,disabled:s}){let[r,a]=(0,i.useState)([]),{confirm:l}=(0,S.t)(),o=e.watch("symptoms"),d=(0,i.useCallback)((s,r)=>{let t=(0,N.q)([...o],s,r);e.setValue("symptoms",t.map((e,s)=>({...e,position:s+1})),{shouldDirty:!0})},[e,o]),c=(0,i.useCallback)(s=>{let r=o.filter((e,r)=>s.includes(r)).map(e=>`<div class="font-bold text-danger">${e.name}</div>`).join("");l(()=>{let r=o.filter((e,r)=>!s.includes(r));e.setValue("symptoms",r.map((e,s)=>({...e,position:s+1})),{shouldDirty:!0}),a([])},{title:"Delete",message:`<p>Are you sure you want to delete ${s.length>1?`${s.length} symptoms: `:"symptom: "}</p> ${r}`,danger:!0,positiveLabel:"Delete"})},[e,o,l]),m=(0,i.useCallback)(s=>{let r=o.filter((e,r)=>s.includes(r)).map(e=>`<div class="font-bold">${e.name}</div>`).join("");l(()=>{let r=[...o,...o.filter((e,r)=>s.includes(r)).map((e,s)=>({...e,position:o.length+1+s}))];e.setValue("symptoms",r.map((e,s)=>({...e,position:s+1})),{shouldDirty:!0}),a([])},{title:"Duplicate",message:`<p>Are you sure you want to duplicate ${s.length>1?`${s.length} symptoms: `:"symptom: "}</p> ${r}`,positiveLabel:"Duplicate"})},[e,o,l]);return(0,t.jsxs)(t.Fragment,{children:[t.jsx(C.DataTable,{title:"Symptoms",sortable:!s,selectable:!s,onSort:d,selectedIndexes:r,onSelect:a,search:{inputPlaceholder:"Search symptoms"},headerActions:t.jsx(t.Fragment,{children:t.jsx(A,{form:e,disabled:s,children:!s&&t.jsx($.hg,{asChild:!0,children:(0,t.jsxs)(n.z,{className:"text-primary border-primary",variant:"outline",children:[t.jsx(w.Z,{className:"h-4 w-4 mr-1"}),"New symptom"]})})})}),columns:[{name:"Type"},{name:"Name"},{name:"Action",align:"right",cellRenderer({rowIndex:r}){let i=o[r];return(0,t.jsxs)(I.h_,{children:[t.jsx(I.$F,{asChild:!0,children:t.jsx(n.z,{variant:"ghost",size:"icon",className:"p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent",children:t.jsx(k.Z,{className:"h-4 w-4"})})}),(0,t.jsxs)(I.AW,{children:[t.jsx(I.Xi,{asChild:!0,children:t.jsx(A,{disabled:s,form:e,symptom:{data:i,index:r},children:({extraProps:e})=>(0,t.jsxs)($.hg,{...e,className:(0,x.cn)(e?.className,"w-full"),children:[t.jsx(D.Z,{className:"w-4 h-4 mr-2"}),t.jsx("span",{children:s?"View":"Edit"})]})})}),(0,t.jsxs)(I.Xi,{onClick:()=>c([r]),className:(0,x.cn)("text-danger focus:bg-danger focus:text-danger-foreground"),disabled:s,children:[t.jsx(F.Z,{className:"mr-2 h-4 w-4"}),t.jsx("span",{children:"Delete"})]})]})]})}}],data:o.map(e=>[e.type,e.name,""])}),!s&&t.jsx(R,{disabled:s,selected:r,onDelete:()=>c(r),onCopy:()=>m(r)})]})}function O(e){let s=(0,a.useRouter)(),r=function({formData:e,scriptId:s}){let r=(0,a.useRouter)(),[t,n]=(0,i.useState)(!1),{saveDiagnoses:l}=(0,j.h)(),{alert:o}=(0,y.s)(),{viewOnly:d}=(0,f.b)(),c=(0,i.useMemo)(()=>`/script/${s}?section=diagnoses`,[s]),m=(0,i.useCallback)(()=>({version:e?.version||1,scriptId:e?.scriptId||s,diagnosisId:e?.diagnosisId||(0,u.Z)(),name:e?.name||"",description:e?.description||"",key:e?.key||"",expression:e?.expression||"",expressionMeaning:e?.expressionMeaning||"",severityOrder:e?.severityOrder||null,symptoms:e?.symptoms||[],text1:e?.text1||"",text2:e?.text2||"",text3:e?.text3||"",image1:e?.image1||null,image2:e?.image2||null,image3:e?.image3||null,preferences:e?.preferences||v.$7}),[e,s]),x=(0,p.cI)({defaultValues:m()}),{formState:{dirtyFields:h},handleSubmit:b}=x,N=(0,i.useMemo)(()=>!!Object.keys(h).length,[h]),w=b(async e=>{try{n(!0);let s={...e,severityOrder:e.severityOrder?Number(e.severityOrder):null};if(!s.scriptId)throw Error("Diagnosis is missing script reference!");let t=(await g.Z.post("/api/diagnoses/save",{data:[s],broadcastAction:!0})).data;if(t.errors?.length)throw Error(t.errors.join(", "));r.refresh(),o({variant:"success",message:"Diagnosis draft was saved successfully!",onClose:()=>r.push(c)})}catch(e){o({variant:"error",message:"Failed to save draft: "+e.message})}finally{n(!1)}}),k=(0,i.useMemo)(()=>t||d,[t,d]);return{...x,formIsDirty:N,saving:t,scriptPageHref:c,disabled:k,save:w,getDefaultValues:m}}(e),{formIsDirty:N,saving:w,scriptPageHref:k,disabled:D,register:F,watch:C,setValue:$,save:I}=r,S=C("name"),z=C("key"),R=C("image1"),Z=C("image2"),M=C("image3"),V=C("preferences"),_=(0,i.useCallback)(()=>{s.push(k)},[s,k]);return(0,t.jsxs)(t.Fragment,{children:[w&&t.jsx(m.a,{overlay:!0}),(0,t.jsxs)("div",{className:"flex flex-col gap-y-5 [&>*]:px-4",children:[(0,t.jsxs)("div",{children:[t.jsx(d._,{htmlFor:"name",error:!D&&!S,children:"Name *"}),t.jsx(l.I,{...F("name",{disabled:D,required:!0}),name:"name",noRing:!1,error:!D&&!S})]}),(0,t.jsxs)("div",{className:"flex gap-x-2",children:[(0,t.jsxs)("div",{children:[t.jsx(d._,{htmlFor:"severityOrder",children:"Severity order"}),t.jsx(l.I,{...F("severityOrder",{disabled:D}),name:"severityOrder",noRing:!1,type:"number"})]}),(0,t.jsxs)("div",{className:"flex-1",children:[t.jsx(d._,{htmlFor:"key",error:!D&&!z,children:"Key *"}),t.jsx(l.I,{...F("key",{disabled:D,required:!0}),name:"key",noRing:!1,error:!D&&!z})]})]}),(0,t.jsxs)("div",{children:[t.jsx(d._,{htmlFor:"description",children:"Description"}),t.jsx(l.I,{...F("description",{disabled:D}),name:"description",noRing:!1}),t.jsx(h.w,{id:"description",title:"Description",disabled:D,data:V,onSave:e=>$("preferences",e,{shouldDirty:!0})})]}),(0,t.jsxs)("div",{children:[t.jsx(d._,{htmlFor:"expression",children:"Diagnosis expression (e.g. $Temp > 37 or $Gestation < 20)"}),t.jsx(l.I,{...F("expression",{disabled:D}),name:"expression",noRing:!1})]}),(0,t.jsxs)("div",{children:[t.jsx(d._,{htmlFor:"expressionMeaning",children:"Diagnosis expression (e.g. Temperature greater than 37 or Gestation period less than 20 weeks)"}),t.jsx(l.I,{...F("expressionMeaning",{disabled:D}),name:"expressionMeaning",noRing:!1})]}),[["text1",R],["text2",Z],["text3",M]].map(([e,s],r)=>{let a=`image${r+1}`;return t.jsx(i.Fragment,{children:(0,t.jsxs)("div",{className:"flex gap-x-4",children:[(0,t.jsxs)("div",{className:"flex-1",children:[(0,t.jsxs)(d._,{htmlFor:`imageTextFields.${r}.text`,children:["Text ",r+1]}),t.jsx(o.g,{...F(e,{disabled:D}),name:`text${r+1}`,noRing:!1,rows:5}),t.jsx(h.w,{id:e,title:`Text ${r+1}`,disabled:D,data:V,onSave:e=>$("preferences",e,{shouldDirty:!0})})]}),t.jsx(b.M,{disabled:D,image:s,onChange:e=>$(a,e,{shouldDirty:!0})})]})},`imageTextFields.${r}`)})]}),(0,t.jsxs)("div",{className:"flex items-center justify-end gap-x-2 py-6 px-4",children:[t.jsx("span",{className:(0,x.cn)("text-danger text-xs",D&&"hidden"),children:"* Required"}),t.jsx("div",{className:"flex-1"}),t.jsx(n.z,{variant:"ghost",onClick:()=>_(),children:"Cancel"}),t.jsx(n.z,{disabled:D,onClick:()=>I(),children:"Save Draft"})]}),t.jsx(c.Z,{className:"my-20"}),t.jsx("div",{children:t.jsx(T,{disabled:D,form:r})})]})}},88870:(e,s,r)=>{"use strict";r.d(s,{M:()=>x});var t=r(10326),i=r(83855),a=r(47035),n=r(2165),l=r(15491),o=r(90772),d=r(46670),c=r(71708),m=r(9900);function x({image:e,disabled:s,onChange:r}){let x=(0,m.Y)(),[h,{width:p}]=(0,n.Z)(),{confirm:u}=(0,d.t)(),g=`${e?.data||""}`.split("?").filter((e,s)=>s).join(""),{width:j,height:y}=l.Z.parse(g);return t.jsx(t.Fragment,{children:(0,t.jsxs)("div",{ref:h,className:"flex flex-col gap-y-2 min-w-60 max-w-60",children:[t.jsx("div",{className:"w-full flex flex-col items-center justify-center min-h-28",children:t.jsx(c.E,{alt:"",width:Number(j||"0"),height:Number(y||"0"),containerWidth:p,src:e?.data||"/images/placeholder.png"})}),(0,t.jsxs)("div",{className:"flex items-center justify-center gap-x-4",children:[t.jsx(o.z,{size:"icon",className:"w-8 h-8 rounded-full",disabled:s,onClick:()=>x.openModal({onSelectFiles([e]){r({data:e.url,fileId:e.fileId,filename:e.filename,size:e.size,contentType:e.contentType})}}),children:t.jsx(i.Z,{className:"h-4 w-4"})}),!!e&&t.jsx(o.z,{variant:"destructive",size:"icon",className:"w-8 h-8 rounded-full",disabled:s,onClick:()=>u(()=>r(null),{title:"Delete image",message:"Are you sure you want to delete this image?",danger:!0}),children:t.jsx(a.Z,{className:"h-4 w-4"})})]})]})})}},96948:(e,s,r)=>{"use strict";r.d(s,{Alert:()=>a});var t=r(96221),i=r(35047);function a(e){(0,i.useRouter)();let{alert:s}=(0,t.s)();return null}r(17577)},68483:(e,s,r)=>{"use strict";r.d(s,{Z:()=>c});var t=r(10326),i=r(17577),a=r(45226),n="horizontal",l=["horizontal","vertical"],o=i.forwardRef((e,s)=>{let{decorative:r,orientation:i=n,...o}=e,d=l.includes(i)?i:n;return(0,t.jsx)(a.WV.div,{"data-orientation":d,...r?{role:"none"}:{"aria-orientation":"vertical"===d?d:void 0,role:"separator"},...o,ref:s})});o.displayName="Separator";var d=r(77863);let c=i.forwardRef(({className:e,orientation:s="horizontal",decorative:r=!0,...i},a)=>t.jsx(o,{ref:a,decorative:r,orientation:s,className:(0,d.cn)("shrink-0 bg-border","horizontal"===s?"h-[1px] w-full":"h-full w-[1px]",e),...i}));c.displayName=o.displayName},89503:(e,s,r)=>{"use strict";r.d(s,{A:()=>l});var t=r(68570);let i=(0,t.createProxy)(String.raw`/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/components/diagnoses/form.tsx`),{__esModule:a,$$typeof:n}=i;i.default;let l=(0,t.createProxy)(String.raw`/home/farai/Workbench/Neotree/neotree-editor-master/app/(dashboard)/(scripts)/components/diagnoses/form.tsx#DiagnosisForm`)},49246:(e,s,r)=>{"use strict";r.r(s),r.d(s,{default:()=>a});var t=r(19510),i=r(62553);function a(){return t.jsx(i.a,{overlay:!0})}},57890:(e,s,r)=>{"use strict";r.r(s),r.d(s,{default:()=>a});var t=r(19510),i=r(62553);function a(){return t.jsx(i.a,{overlay:!0})}},86098:(e,s,r)=>{"use strict";r.d(s,{b:()=>l});var t=r(68570);let i=(0,t.createProxy)(String.raw`/home/farai/Workbench/Neotree/neotree-editor-master/components/alert.tsx`),{__esModule:a,$$typeof:n}=i;i.default;let l=(0,t.createProxy)(String.raw`/home/farai/Workbench/Neotree/neotree-editor-master/components/alert.tsx#Alert`)}};