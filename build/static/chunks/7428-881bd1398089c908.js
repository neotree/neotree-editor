"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7428],{7428:function(e,l,a){a.d(l,{ScriptForm:function(){return M}});var i=a(57437),n=a(46294),s=a(50495),t=a(83102),r=a(67135),d=a(39661),o=a(15701),c=a(37440),u=a(86466),m=a(85070),h=a(83146),x=a(2265),f=a(39343);/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let p=(0,a(78030).Z)("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);var v=a(92513),b=a(45188),y=a(99913),j=a(90399),g=a(95317),N=a(46910),w=a(90837),C=a(9704),D=a(75944),k=a(18934),S=a(93146),F=a(76230),T=a(78591);function I(e){var l;let{disabled:a,form:{watch:n,setValue:t,getDefaultNuidSearchFields:r}}=e,d=n("nuidSearchFields"),o=n("nuidSearchEnabled"),[c,u]=(0,x.useState)(),[m,h]=(0,x.useState)(o),[f,w]=(0,x.useState)(),[C,k]=(0,x.useState)(!1);(0,x.useEffect)(()=>{o&&!m&&k(!0),h(o)},[m,o]);let{confirm:S}=(0,F.t)(),T=(0,x.useCallback)(e=>{S(()=>t("nuidSearchFields",d.filter((l,a)=>a!==e),{shouldDirty:!0}),{danger:!0,title:"Delete field",message:"Are you sure you want to delete field?",positiveLabel:"Delete",negativeLabel:"Cancel"})},[d,S,t]),I=(0,x.useCallback)(()=>{},[]);return(0,i.jsxs)(i.Fragment,{children:[!!c&&(0,i.jsx)(_,{open:!0,field:null==c?void 0:c.field,fieldType:null==c?void 0:null===(l=c.field)||void 0===l?void 0:l.type,onClose:()=>u(void 0),onChange:e=>{t("nuidSearchFields",d.map((l,a)=>a===(null==c?void 0:c.index)?{...l,...e}:l),{shouldDirty:!0}),u(void 0)}}),!!f&&(0,i.jsx)(_,{open:!0,fieldType:f,onClose:()=>w(void 0),onChange:e=>{t("nuidSearchFields",[...d,{...e,type:f}],{shouldDirty:!0}),w(void 0)}}),(0,i.jsxs)(g.yo,{open:C,onOpenChange:e=>{e||k(!1)},children:[o&&(0,i.jsx)(g.aM,{asChild:!0,children:(0,i.jsx)("a",{href:"#",className:"text-muted-foreground hover:text-primary",onClick:e=>{e.preventDefault(),k(!0)},children:(0,i.jsx)(p,{className:"w-4 h-4 mr-1"})})}),(0,i.jsxs)(g.ue,{hideCloseButton:!0,side:"right",className:"p-0 m-0 flex flex-col w-full max-w-full sm:max-w-[80%] md:max-w-[80%] lg:max-w-[50%]",children:[(0,i.jsxs)(g.Tu,{className:"flex flex-row items-center py-2 px-4 border-b border-b-border text-left sm:text-left",children:[(0,i.jsx)(g.bC,{children:"Configure NUID Search page"}),(0,i.jsx)(g.Ei,{className:"hidden"})]}),(0,i.jsx)("div",{className:"flex-1 flex flex-col py-2 px-0 gap-y-4 overflow-y-auto",children:(0,i.jsx)(D.DataTable,{title:"Fields",sortable:!0,headerActions:(0,i.jsx)(i.Fragment,{children:(0,i.jsxs)(N.h_,{children:[(0,i.jsx)(N.$F,{asChild:!0,children:(0,i.jsxs)(s.z,{variant:"ghost",disabled:a,children:[(0,i.jsx)(v.Z,{className:"h-4 w-4 mr-2"}),"Add field"]})}),(0,i.jsxs)(N.AW,{children:[(0,i.jsx)(N.Xi,{className:"focus:text-primary focus:bg-primary/20",onClick:()=>w("dropdown"),children:"Yes/No"}),(0,i.jsx)(N.Xi,{onClick:()=>w("text"),children:"NUID Search"})]})]})}),columns:[{name:"Type"},{name:"Key"},{name:"Label"},{name:"Condition"},{name:"Action",align:"right",cellRenderer(e){let{rowIndex:l}=e,n=d[l];return(0,i.jsx)(i.Fragment,{children:(0,i.jsxs)(N.h_,{children:[(0,i.jsx)(N.$F,{asChild:!0,children:(0,i.jsx)(s.z,{variant:"ghost",size:"icon",className:"p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent",children:(0,i.jsx)(b.Z,{className:"h-4 w-4"})})}),(0,i.jsxs)(N.AW,{children:[(0,i.jsxs)(N.Xi,{className:"focus:text-primary focus:bg-primary/20",onClick:()=>u({index:l,field:n}),children:[(0,i.jsx)(y.Z,{className:"mr-2 h-4 w-4"}),"Edit"]}),(0,i.jsxs)(N.Xi,{disabled:a,onClick:()=>T(l),className:"text-danger focus:bg-danger focus:text-danger-foreground",children:[(0,i.jsx)(j.Z,{className:"mr-2 h-4 w-4"}),(0,i.jsx)("span",{children:"Delete"})]})]})]})})}}],data:d.map(e=>[e.type,e.key,e.label,e.condition,""])})}),(0,i.jsxs)("div",{className:"border-t border-t-border px-4 py-2 flex gap-x-2",children:[(0,i.jsx)("div",{className:"ml-auto"}),(0,i.jsx)(g.sw,{asChild:!0,children:(0,i.jsx)(s.z,{variant:"ghost",onClick:()=>{},children:"Cancel"})}),(0,i.jsx)(g.sw,{asChild:!0,children:(0,i.jsx)(s.z,{onClick:()=>I(),disabled:a,children:"Save"})})]})]})]})]})}function _(e){let{open:l,field:a,fieldType:n,onChange:d,onClose:o}=e,{getDefaultValues:c}=(0,k.U)({...a,type:n}),{watch:u,register:m,handleSubmit:h}=(0,f.cI)({defaultValues:c()}),p=u("type"),v=u("values"),b=h(d),y=(0,x.useMemo)(()=>"dropdown"===p?(0,T.s)(v):[],[v,p]);return(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(C.u,{title:a?"Edit field":"Add field",open:l,onOpenChange:e=>{e||o()},actions:(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("span",{className:"text-sm text-danger",children:"* Required"}),(0,i.jsx)("div",{className:"flex-1"}),(0,i.jsx)(w.GG,{asChild:!0,children:(0,i.jsx)(s.z,{variant:"ghost",children:"Cancel"})}),(0,i.jsx)(s.z,{onClick:()=>b(),disabled:!!y.length,children:"Save"})]}),children:(0,i.jsxs)("div",{className:"flex flex-col gap-y-5",children:[(0,i.jsxs)("div",{children:[(0,i.jsx)(r._,{htmlFor:"label",children:"Label *"}),(0,i.jsx)(t.I,{...m("label",{required:!0})})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)(r._,{htmlFor:"key",children:"Key *"}),(0,i.jsx)(t.I,{...m("key",{required:!0})})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)(r._,{htmlFor:"condition",children:"Condition"}),(0,i.jsx)(t.I,{...m("condition",{required:!1})})]}),"dropdown"===p&&(0,i.jsxs)("div",{children:[(0,i.jsx)(r._,{htmlFor:"values",children:"Options *"}),(0,i.jsx)(S.g,{...m("values",{required:!0}),rows:5}),!!y.length&&(0,i.jsx)("span",{className:"text-xs text-danger",children:y.join(", ")})]})]})})})}var V=a(84760),E=a(16463),z=a(87138),K=a(88519);function R(e){let{disabled:l}=e,[a,n]=(0,x.useState)(!1),{scriptId:t}=(0,E.useParams)();return l?null:(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(K.d,{open:a,onOpenChange:n,onImportSuccess:()=>window.location.reload()}),(0,i.jsx)("div",{className:" fixed bottom-5 right-10 ",children:(0,i.jsxs)(N.h_,{children:[(0,i.jsx)(N.$F,{asChild:!0,children:(0,i.jsx)(s.z,{size:"icon",className:"rounded-full w-12 h-12",children:(0,i.jsx)(v.Z,{className:"h-6 w-6"})})}),(0,i.jsxs)(N.AW,{children:[(0,i.jsx)(N.Xi,{onClick:()=>n(!0),children:"Import script"}),(0,i.jsx)(N.Xi,{asChild:!0,children:(0,i.jsx)(z.default,{href:"/script/".concat(t,"/new-screen"),children:"New screen"})}),(0,i.jsx)(N.Xi,{asChild:!0,children:(0,i.jsx)(z.default,{href:"/script/".concat(t,"/new-diagnosis"),children:"New diagnosis"})})]})]})})]})}var Z=a(76905),U=a(21453),Y=a(53699),A=a(53453);function M(e){let{onCancelScriptForm:l}=(0,o.h)(),a=function(e){let{formData:l}=e,{alert:a}=(0,Y.s)(),{viewOnly:i}=(0,A.b)(),n=(0,E.useRouter)(),[s,t]=(0,x.useState)(!1),{saveScripts:r}=(0,o.h)(),d=(0,x.useCallback)(()=>({position:(null==l?void 0:l.position)||void 0,scriptId:(null==l?void 0:l.scriptId)||void 0,type:(null==l?void 0:l.type)||h.m1[0].value,title:(null==l?void 0:l.title)||"",printTitle:(null==l?void 0:l.printTitle)||"",description:(null==l?void 0:l.description)||"",hospitalId:(null==l?void 0:l.hospitalId)||null,exportable:!!(0,U.x)(null==l?void 0:l.exportable)||(null==l?void 0:l.exportable),nuidSearchEnabled:!(0,U.x)(null==l?void 0:l.nuidSearchEnabled)&&(null==l?void 0:l.nuidSearchEnabled),nuidSearchFields:(null==l?void 0:l.nuidSearchFields)||[]}),[l]),c=(0,f.cI)({defaultValues:d()}),u=(0,x.useCallback)(()=>{var e;c.getValues("nuidSearchFields");let a=c.getValues("type"),i=c.getValues("nuidSearchEnabled"),n=(null==l?void 0:null===(e=l.nuidSearchFields)||void 0===e?void 0:e.length)?l.nuidSearchFields:"admission"===a?Z.fR.admission:Z.fR.other;return i||(n=[]),n},[c,null==l?void 0:l.nuidSearchFields]),{handleSubmit:m,formState:{dirtyFields:p}}=c,v=(0,x.useMemo)(()=>!!Object.keys(p).length,[p]),b=m(async e=>{var l;t(!0);let i=await r({data:[e],broadcastAction:!0});(null===(l=i.errors)||void 0===l?void 0:l.length)?a({title:"Error",message:i.errors.join(", "),variant:"error"}):(n.refresh(),a({title:"Success",message:"Scripts saved successfully!",variant:"success",onClose:()=>n.push("/")})),t(!1)}),y=(0,x.useMemo)(()=>i,[i]);return{...e,...c,formIsDirty:v,loading:s,disabled:y,setLoading:t,getDefaultFormValues:d,getDefaultNuidSearchFields:u,onSubmit:b}}(e),{formData:p,formIsDirty:v,hospitals:b,loading:y,disabled:j,reset:g,watch:N,setValue:w,register:C,getDefaultFormValues:D,getDefaultNuidSearchFields:k,onSubmit:S}=a,F=N("type"),T=N("hospitalId"),_=N("exportable");N("nuidSearchFields");let z=N("nuidSearchEnabled");return(0,i.jsxs)(i.Fragment,{children:[y&&(0,i.jsx)(d.a,{overlay:!0}),(0,i.jsx)(R,{disabled:j,resetForm:()=>g(D())}),(0,i.jsxs)("div",{className:"flex flex-col gap-y-4 [&>*]:px-4",children:[(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(V.D,{children:"Type"}),(0,i.jsx)("div",{children:(0,i.jsx)(m.E,{disabled:j,defaultValue:F,onValueChange:e=>w("type",e,{shouldDirty:!0}),className:"flex flex-col gap-y-4",children:h.m1.map(e=>(0,i.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,i.jsx)(m.m,{value:e.value,id:e.value}),(0,i.jsx)(r._,{secondary:!0,htmlFor:e.value,children:e.label})]},e.value))})}),(0,i.jsx)(V.D,{className:"mt-5",children:"Hospital"}),(0,i.jsxs)("div",{children:[(0,i.jsx)(r._,{secondary:!0,htmlFor:"hospital",children:"Hospital"}),(0,i.jsxs)(n.Ph,{value:T||"",required:!0,name:"hospital",disabled:j,onValueChange:e=>{w("hospitalId",e||null,{shouldDirty:!0})},children:[(0,i.jsx)(n.i4,{children:(0,i.jsx)(n.ki,{placeholder:"Select hospital"})}),(0,i.jsx)(n.Bw,{children:(0,i.jsxs)(n.DI,{children:[(0,i.jsx)(n.n5,{children:"Hospitals"}),b.map(e=>(0,i.jsx)(n.Ql,{value:e.hospitalId,children:e.name},e.hospitalId))]})})]})]}),(0,i.jsx)(V.D,{className:"mt-5",children:"Properties"}),(0,i.jsxs)("div",{children:[(0,i.jsx)(r._,{secondary:!0,htmlFor:"title",children:"Title *"}),(0,i.jsx)(t.I,{...C("title",{required:!0,disabled:j}),placeholder:"Title",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)(r._,{secondary:!0,htmlFor:"printTitle",children:"Print title"}),(0,i.jsx)(t.I,{...C("printTitle",{disabled:j}),placeholder:"Print title",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)(r._,{secondary:!0,htmlFor:"description",children:"Description"}),(0,i.jsx)(t.I,{...C("description",{disabled:j}),placeholder:"Description",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"})]}),(0,i.jsxs)("div",{className:"flex gap-x-2",children:[(0,i.jsx)(u.X,{name:"exportable",id:"exportable",disabled:j,checked:_,onCheckedChange:()=>w("exportable",!_,{shouldDirty:!0})}),(0,i.jsx)(r._,{secondary:!0,htmlFor:"exportable",children:"Exportable"})]}),(0,i.jsx)(V.D,{className:"mt-5",children:"Neotree ID Search"}),(0,i.jsxs)("div",{className:"flex gap-x-2",children:[(0,i.jsx)(u.X,{name:"nuidSearchEnabled",id:"nuidSearchEnabled",disabled:j,checked:z,onCheckedChange:()=>{w("nuidSearchEnabled",!z,{shouldDirty:!0}),w("nuidSearchFields",k(),{shouldDirty:!0})}}),(0,i.jsx)(r._,{secondary:!0,htmlFor:"nuidSearchEnabled",children:"Enable NUID Search"}),(0,i.jsx)(I,{disabled:j,form:a})]})]}),(0,i.jsxs)("div",{className:(0,c.cn)("flex gap-x-2 py-4"),children:[(0,i.jsx)("div",{className:"ml-auto"}),(0,i.jsx)(s.z,{variant:"ghost",onClick:()=>l(),children:"Cancel"}),(0,i.jsx)(s.z,{onClick:()=>S(),disabled:!v,children:"Save draft"})]})]})]})}},84760:function(e,l,a){a.d(l,{D:function(){return s}});var i=a(57437),n=a(37440);function s(e){let{children:l,className:a}=e;return(0,i.jsx)("div",{className:(0,n.cn)("pb-1 border-b border-b-primary",a),children:(0,i.jsx)("span",{className:"uppercase text-primary text-sm",children:l})})}},18934:function(e,l,a){a.d(l,{U:function(){return s}});var i=a(2265),n=a(20920);function s(e){return{getDefaultValues:(0,i.useCallback)(()=>({fieldId:(null==e?void 0:e.fieldId)||(0,n.Z)(),type:(null==e?void 0:e.type)||"",key:(null==e?void 0:e.key)||"",label:(null==e?void 0:e.label)||"",refKey:(null==e?void 0:e.refKey)||"",calculation:(null==e?void 0:e.calculation)||"",condition:(null==e?void 0:e.condition)||"",dataType:(null==e?void 0:e.dataType)||"",defaultValue:(null==e?void 0:e.defaultValue)||"",format:(null==e?void 0:e.format)||"",minValue:(null==e?void 0:e.minValue)||"",maxValue:(null==e?void 0:e.maxValue)||"",minDate:(null==e?void 0:e.minDate)||"",maxDate:(null==e?void 0:e.maxDate)||"",minTime:(null==e?void 0:e.minTime)||"",maxTime:(null==e?void 0:e.maxTime)||"",minDateKey:(null==e?void 0:e.minDateKey)||"",maxDateKey:(null==e?void 0:e.maxDateKey)||"",minTimeKey:(null==e?void 0:e.minTimeKey)||"",maxTimeKey:(null==e?void 0:e.maxTimeKey)||"",values:(null==e?void 0:e.values)||"",confidential:(null==e?void 0:e.confidential)||!1,optional:(null==e?void 0:e.optional)||!1,printable:(null==e?void 0:e.printable)||!1,prePopulate:(null==e?void 0:e.prePopulate)||[],...e}),[e])}}},85070:function(e,l,a){a.d(l,{E:function(){return d},m:function(){return o}});var i=a(57437),n=a(2265),s=a(99497),t=a(28165),r=a(37440);let d=n.forwardRef((e,l)=>{let{className:a,...n}=e;return(0,i.jsx)(s.fC,{className:(0,r.cn)("grid gap-2",a),...n,ref:l})});d.displayName=s.fC.displayName;let o=n.forwardRef((e,l)=>{let{className:a,...n}=e;return(0,i.jsx)(s.ck,{ref:l,className:(0,r.cn)("aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",a),...n,children:(0,i.jsx)(s.z$,{className:"flex items-center justify-center",children:(0,i.jsx)(t.Z,{className:"h-2.5 w-2.5 fill-current text-current"})})})});o.displayName=s.ck.displayName},95317:function(e,l,a){a.d(l,{Ei:function(){return y},FF:function(){return v},Tu:function(){return p},aM:function(){return c},bC:function(){return b},sw:function(){return u},ue:function(){return f},yo:function(){return o}});var i=a(57437),n=a(2265),s=a(13304),t=a(12218),r=a(74697),d=a(37440);let o=s.fC,c=s.xz,u=s.x8,m=s.h_,h=n.forwardRef((e,l)=>{let{className:a,...n}=e;return(0,i.jsx)(s.aV,{className:(0,d.cn)("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",a),...n,ref:l})});h.displayName=s.aV.displayName;let x=(0,t.j)("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",{variants:{side:{top:"inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",bottom:"inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",left:"inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",right:"inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"}},defaultVariants:{side:"right"}}),f=n.forwardRef((e,l)=>{let{side:a="right",className:n,children:t,hideCloseButton:o,...c}=e;return(0,i.jsxs)(m,{children:[(0,i.jsx)(h,{}),(0,i.jsxs)(s.VY,{ref:l,className:(0,d.cn)(x({side:a}),n),...c,children:[t,!0!==o&&(0,i.jsxs)(s.x8,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",children:[(0,i.jsx)(r.Z,{className:"h-4 w-4"}),(0,i.jsx)("span",{className:"sr-only",children:"Close"})]})]})]})});f.displayName=s.VY.displayName;let p=e=>{let{className:l,...a}=e;return(0,i.jsx)("div",{className:(0,d.cn)("flex flex-col space-y-2 text-center sm:text-left",l),...a})};p.displayName="SheetHeader";let v=e=>{let{className:l,...a}=e;return(0,i.jsx)("div",{className:(0,d.cn)("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",l),...a})};v.displayName="SheetFooter";let b=n.forwardRef((e,l)=>{let{className:a,...n}=e;return(0,i.jsx)(s.Dx,{ref:l,className:(0,d.cn)("text-lg font-semibold text-foreground",a),...n})});b.displayName=s.Dx.displayName;let y=n.forwardRef((e,l)=>{let{className:a,...n}=e;return(0,i.jsx)(s.dk,{ref:l,className:(0,d.cn)("text-sm text-muted-foreground",a),...n})});y.displayName=s.dk.displayName},93146:function(e,l,a){a.d(l,{g:function(){return t}});var i=a(57437),n=a(2265),s=a(37440);let t=n.forwardRef((e,l)=>{let{className:a,noRing:n,...t}=e;return(0,i.jsx)("textarea",{className:(0,s.cn)("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",n&&"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",a),ref:l,...t})});t.displayName="Textarea"},76905:function(e,l,a){a.d(l,{Uv:function(){return n},d4:function(){return i},fR:function(){return t}});let i=[{value:"allSearches",label:"Found in all searches"},{value:"admissionSearches",label:"Found in admission searches"},{value:"twinSearches",label:"Found in twin searches"}],n=[{name:"date",label:"Date"},{name:"datetime",label:"Date + Time"},{name:"dropdown",label:"Dropdown"},{name:"number",label:"Number"},{name:"text",label:"Text"},{name:"time",label:"Time"},{name:"period",label:"Time period"}],s={calculation:null,condition:"",confidential:!1,dataType:null,defaultValue:null,format:null,type:null,key:null,refKey:null,label:null,minValue:null,maxValue:null,optional:!1,minDate:null,maxDate:null,minTime:null,maxTime:null,minDateKey:"",maxDateKey:"",minTimeKey:"",maxTimeKey:"",values:""},t={admission:[{...s,type:"dropdown",key:"BabyTransfered",values:"Y,Yes\nN,No",label:"Has the baby been transfered from another facility"},{...s,type:"text",key:"patientNUID",label:"Search patient's NUID",condition:"$BabyTransfered = 'Y'"},{...s,type:"dropdown",key:"BabyTwin",values:"Y,Yes\nN,No",label:"Does the baby have a twin?"},{...s,type:"text",key:"BabyTwinNUID",label:"Search twin's NUID",condition:"$BabyTwin = 'Y'"}],other:[{...s,type:"text",key:"patientNUID",values:"Y,Yes\nN,No",label:"Search patient's NUID"}]}},83146:function(e,l,a){a.d(l,{Tf:function(){return n},m1:function(){return i},ph:function(){return s}});let i=[{label:"Admission",value:"admission"},{label:"Discharge",value:"discharge"},{label:"Neolab",value:"neolab"}],n=[{value:"checklist",label:"Checklist"},{value:"form",label:"Form"},{value:"management",label:"Management"},{value:"multi_select",label:"Multiple choice list"},{value:"single_select",label:"Single choice list"},{value:"progress",label:"Progress"},{value:"timer",label:"Timer"},{value:"yesno",label:"Yes/No"},{value:"zw_edliz_summary_table",label:"EDLIZ summary table (ZW)"},{value:"mwi_edliz_summary_table",label:"EDLIZ summary table (MWI)"},{value:"diagnosis",label:"Diagnosis"}],s=[{value:"risk",label:"Risk factor"},{value:"sign",label:"Sign/Symptom"}]},21453:function(e,l,a){a.d(l,{x:function(){return i}});function i(e){return null==e||""===e}},78591:function(e,l,a){a.d(l,{s:function(){return i}});function i(e){let l=[],a=(e||"").split("\n").map(function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return e.trim()}).map(e=>{let l=e.split(",");return{value:l[0],label:l[1]}}),i=a.map(e=>e.value),n=a.map(e=>e.label),s=a.filter(e=>!e.value||!e.label),t=i.filter((e,l)=>i.indexOf(e)!==l);return(n.filter((e,l)=>n.indexOf(e)!==l).length||t.length)&&l.push("Dropdown values contain duplicate data"),s.length&&l.push("Incorrect dropdown values format"),l}},99913:function(e,l,a){a.d(l,{Z:function(){return i}});/**
 * @license lucide-react v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,a(78030).Z)("Pen",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]])},87138:function(e,l,a){a.d(l,{default:function(){return n.a}});var i=a(231),n=a.n(i)}}]);