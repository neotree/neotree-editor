"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[929],{80929:function(e,i,a){a.d(i,{A:function(){return F}});var s=a(57437),n=a(2265),t=a(16463),l=a(12491),r=a(20920),o=a(5192),d=a(95317),u=a(46294),c=a(86466),g=a(50495),m=a(83102),v=a(93146),h=a(67135),f=a(39661),x=a(44371),y=a(83146),b=a(76230),p=a(74166);let j=[{value:"drug",label:"Drug"},{value:"fluid",label:"Fluid"}],N=function(e){let i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"drug";return{itemId:"".concat((null==e?void 0:e.itemId)||(0,r.Z)()),type:"".concat((null==e?void 0:e.type)||i),key:"".concat((null==e?void 0:e.key)||""),drug:"".concat((null==e?void 0:e.drug)||""),minGestation:"".concat((null==e?void 0:e.minGestation)===null?"":null==e?void 0:e.minGestation),maxGestation:"".concat((null==e?void 0:e.maxGestation)===null?"":null==e?void 0:e.maxGestation),minWeight:"".concat((null==e?void 0:e.minWeight)===null?"":null==e?void 0:e.minWeight),maxWeight:"".concat((null==e?void 0:e.maxWeight)===null?"":null==e?void 0:e.maxWeight),minAge:"".concat((null==e?void 0:e.minAge)===null?"":null==e?void 0:e.minAge),maxAge:"".concat((null==e?void 0:e.maxAge)===null?"":null==e?void 0:e.maxAge),dosage:"".concat((null==e?void 0:e.dosage)===null?"":null==e?void 0:e.dosage),dosageMultiplier:"".concat((null==e?void 0:e.dosageMultiplier)===null?"":null==e?void 0:e.dosageMultiplier),hourlyFeed:"".concat((null==e?void 0:e.hourlyFeed)===null?"":null==e?void 0:e.hourlyFeed),hourlyFeedDivider:"".concat((null==e?void 0:e.hourlyFeedDivider)===null?"":null==e?void 0:e.hourlyFeedDivider),dayOfLife:"".concat((null==e?void 0:e.dayOfLife)||""),dosageText:"".concat((null==e?void 0:e.dosageText)||""),managementText:"".concat((null==e?void 0:e.managementText)||""),gestationKey:"".concat((null==e?void 0:e.gestationKey)||""),weightKey:"".concat((null==e?void 0:e.weightKey)||""),diagnosisKey:"".concat((null==e?void 0:e.diagnosisKey)||""),condition:"".concat((null==e?void 0:e.condition)||""),administrationFrequency:"".concat((null==e?void 0:e.administrationFrequency)||""),drugUnit:"".concat((null==e?void 0:e.drugUnit)||""),routeOfAdministration:"".concat((null==e?void 0:e.routeOfAdministration)||""),ageKey:"".concat((null==e?void 0:e.ageKey)||""),validationType:"".concat((null==e?void 0:e.validationType)||"default")}};function F(e){let{disabled:i,item:a,floating:r,onChange:F}=e,A=(0,t.useRouter)(),k=(0,t.useSearchParams)(),w=(0,n.useMemo)(()=>l.Z.parse(k.toString()),[k]),{itemId:C,addItem:T}=w,[I,K]=(0,o.Z)(),[D,G]=(0,o.Z)(),[W,_]=(0,n.useState)(!1),[S,M]=(0,n.useState)(N(a,T)),{keys:E,loading:Z}=(0,x.a)(),{confirm:O}=(0,b.t)();(0,n.useEffect)(()=>{_(!!C||!!T)},[C,T]),(0,n.useEffect)(()=>{M(N(a,T))},[a,T]);let U=(0,n.useCallback)(()=>{let e=()=>{F({...S,minWeight:S.minWeight?Number(S.minWeight):null,maxWeight:S.maxWeight?Number(S.maxWeight):null,minGestation:S.minGestation?Number(S.minGestation):null,maxGestation:S.maxGestation?Number(S.maxGestation):null,hourlyFeed:S.hourlyFeed?Number(S.hourlyFeed):null,hourlyFeedDivider:S.hourlyFeedDivider?Number(S.hourlyFeedDivider):null,minAge:S.minAge?Number(S.minAge):null,maxAge:S.maxAge?Number(S.maxAge):null,dosage:S.dosage?Number(S.dosage):null,dosageMultiplier:S.dosageMultiplier?Number(S.dosageMultiplier):null,type:S.type}),_(!1)};a&&S.key!==(null==a?void 0:a.key)?O(e,{danger:!0,title:"Confirm key change",message:'\n                    <p class="text-xl">Are you sure you want to change key?</p>\n                    <p>All references to the old key ('.concat(a.key,") will also be updated to: ").concat(S.key,"</p>\n                "),positiveLabel:"Yes, keep changes",negativeLabel:"No, do not save"}):e()},[S,a,F]),L=(0,n.useCallback)(()=>{_(!1),M(N(void 0,T)),A.push("?".concat(l.Z.stringify({...w,itemId:void 0,addItem:void 0})));let e=(null==K?void 0:K.top)||0;setTimeout(()=>window.scrollTo({top:e}),500)},[w,K,A.push]),{isFormComplete:q,isDrug:R,isFluid:P,validateWithCondition:z}=(0,n.useMemo)(()=>{let e="drug"===S.type,i="fluid"===S.type,a="condition"===S.validationType,s=!!(S.type&&S.key&&S.drug&&S.managementText&&S.dosageText&&S.administrationFrequency&&S.drugUnit&&S.routeOfAdministration&&S.dosage&&a?S.condition:S.weightKey&&S.minWeight&&S.maxWeight&&S.gestationKey&&S.minGestation&&S.maxGestation&&S.ageKey&&S.minAge&&S.maxAge&&Number(S.minGestation||"0")<=Number(S.maxGestation||"0")&&Number(S.minWeight||"0")<=Number(S.maxWeight||"0")&&Number(S.minAge||"0")<=Number(S.maxAge||"0")&&(!e||S.diagnosisKey)&&(!i||S.condition&&S.hourlyFeed&&S.hourlyFeedDivider&&Number(S.hourlyFeed||"0")<=Number(S.hourlyFeed||"0")&&Number(S.hourlyFeedDivider||"0")<=Number(S.hourlyFeedDivider||"0")));return{isDrug:e,isFluid:i,isFormComplete:s,validateWithCondition:a}},[S,T]),B=(0,n.useCallback)(()=>!q||Z||i,[q,Z,i]),H=(0,s.jsxs)("div",{className:"flex flex-col gap-y-4",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(h._,{secondary:!0,htmlFor:"type",children:"Type *"}),(0,s.jsxs)(u.Ph,{value:S.type,required:!0,name:"type",disabled:i,onValueChange:e=>{let i=N((null==a?void 0:a.type)===e?a:void 0,T);O(()=>M(a=>({...a,type:e,hourlyFeed:i.hourlyFeed,hourlyFeedDivider:i.hourlyFeedDivider,condition:i.condition,diagnosisKey:i.diagnosisKey,drugUnit:i.drugUnit})),{danger:!0,title:"Confirm type change",message:'\n                                <p class="text-xl">Are you sure you want to change type?</p>\n                                <ol style="list-style:auto;margin:10px;">\n                                    <li>Some fields will be cleared as they do not apply on all types!</li>\n                                    <li>All references to this '.concat(S.type," will be removed.</li>\n                                </ol>\n                            "),positiveLabel:"Yes, change type",negativeLabel:"No, keep the current type"})},children:[(0,s.jsx)(u.i4,{children:(0,s.jsx)(u.ki,{placeholder:"Select type"})}),(0,s.jsx)(u.Bw,{children:(0,s.jsx)(u.DI,{children:j.map(e=>(0,s.jsx)(u.Ql,{value:e.value,children:e.label},e.value))})})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsxs)(h._,{secondary:!0,htmlFor:"drug",children:[(0,p.Z)(S.type)," *"]}),(0,s.jsx)(m.I,{name:"drug",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.drug,disabled:i,onChange:e=>M(i=>({...i,drug:e.target.value}))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(h._,{secondary:!0,htmlFor:"key",children:"Key *"}),(0,s.jsx)(m.I,{name:"key",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.key,disabled:i,onChange:e=>M(i=>({...i,key:e.target.value}))})]}),(0,s.jsxs)("div",{children:[(0,s.jsxs)(h._,{secondary:!0,htmlFor:"condition",children:["Condition ",z?"*":""]}),(0,s.jsx)(v.g,{rows:3,name:"condition",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.condition,disabled:i,onChange:e=>M(i=>({...i,condition:e.target.value}))}),(0,s.jsxs)("span",{className:"font-bold opacity-50 text-xs",children:["e.g ",y._S]})]}),(0,s.jsxs)("div",{className:"flex gap-x-2",children:[(0,s.jsx)(c.X,{name:"validationType",id:"validationType",disabled:i,checked:"condition"===S.validationType,onCheckedChange:e=>M(e=>({...e,validationType:"condition"===e.validationType?"default":"condition"}))}),(0,s.jsx)(h._,{secondary:!0,htmlFor:"validationType",children:"Validate with conditional expression only"})]}),R&&(0,s.jsxs)("div",{children:[(0,s.jsxs)(h._,{secondary:!0,htmlFor:"diagnosisKey",children:["Diagnosis Key ",z?"":"*"]}),(0,s.jsx)(v.g,{rows:3,name:"gestationKey",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.diagnosisKey,disabled:i,onChange:e=>M(i=>({...i,diagnosisKey:e.target.value}))}),(0,s.jsx)("span",{className:"font-bold opacity-50 text-xs",children:"e.g NSep,Premature,Dehyd"})]}),(0,s.jsxs)("div",{children:[(0,s.jsxs)(h._,{secondary:!0,htmlFor:"gestationKey",children:["Gestation Key ",z?"":"*"]}),(0,s.jsx)(m.I,{name:"gestationKey",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.gestationKey,disabled:i,onChange:e=>M(i=>({...i,gestationKey:e.target.value}))})]}),(0,s.jsxs)("div",{className:"flex gap-x-2",children:[(0,s.jsxs)("div",{className:"flex-1",children:[(0,s.jsxs)(h._,{secondary:!0,htmlFor:"minGestation",children:["Min Gestation (weeks) ",z?"":"*"]}),(0,s.jsx)(m.I,{name:"minGestation",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.minGestation,type:"number",disabled:i,onChange:e=>{let i=e.target.value,a=S.maxGestation;i||(a=""),M(e=>({...e,minGestation:i,maxGestation:a}))}})]}),(0,s.jsxs)("div",{className:"flex-1",children:[(0,s.jsxs)(h._,{secondary:!0,htmlFor:"maxGestation",error:Number(S.minGestation||"0")>Number(S.maxGestation||"0"),children:["Max Gestation (weeks) ",z?"":"*"]}),(0,s.jsx)(m.I,{name:"maxGestation",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.maxGestation,type:"number",disabled:i||!S.minGestation,min:S.minGestation,error:Number(S.minGestation||"0")>Number(S.maxGestation||"0"),onChange:e=>M(i=>({...i,maxGestation:e.target.value}))})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsxs)(h._,{secondary:!0,htmlFor:"weightKey",children:["Weight Key ",z?"":"*"]}),(0,s.jsx)(m.I,{name:"weightKey",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.weightKey,disabled:i,onChange:e=>M(i=>({...i,weightKey:e.target.value}))})]}),(0,s.jsxs)("div",{className:"flex gap-x-2",children:[(0,s.jsxs)("div",{className:"flex-1",children:[(0,s.jsxs)(h._,{secondary:!0,htmlFor:"minWeight",children:["Min Weight (grams) ",z?"":"*"]}),(0,s.jsx)(m.I,{name:"minWeight",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.minWeight,type:"number",disabled:i,onChange:e=>{let i=e.target.value,a=S.maxWeight;i||(a=""),M(e=>({...e,minWeight:i,maxWeight:a}))}})]}),(0,s.jsxs)("div",{className:"flex-1",children:[(0,s.jsxs)(h._,{secondary:!0,htmlFor:"maxWeight",error:Number(S.minWeight||"0")>Number(S.maxWeight||"0"),children:["Max Weight (grams) ",z?"":"*"]}),(0,s.jsx)(m.I,{name:"maxWeight",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.maxWeight,type:"number",disabled:i||!S.minWeight,min:S.minWeight,error:Number(S.minWeight||"0")>Number(S.maxWeight||"0"),onChange:e=>M(i=>({...i,maxWeight:e.target.value}))})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsxs)(h._,{secondary:!0,htmlFor:"ageKey",children:["Day of Life (Age) Key ",z?"":"*"]}),(0,s.jsx)(m.I,{name:"ageKey",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.ageKey,disabled:i,onChange:e=>M(i=>({...i,ageKey:e.target.value}))})]}),(0,s.jsxs)("div",{className:"flex gap-x-2",children:[(0,s.jsxs)("div",{className:"flex-1",children:[(0,s.jsxs)(h._,{secondary:!0,htmlFor:"minAge",children:["Min Day of Life (Age - hours) ",z?"":"*"]}),(0,s.jsx)(m.I,{name:"minAge",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.minAge,type:"number",disabled:i,onChange:e=>{let i=e.target.value,a=S.maxAge;i||(a=""),M(e=>({...e,minAge:i,maxAge:a}))}})]}),(0,s.jsxs)("div",{className:"flex-1",children:[(0,s.jsxs)(h._,{secondary:!0,htmlFor:"maxAge",error:Number(S.minAge||"0")>Number(S.maxAge||"0"),children:["Max Day of Life (Age - hours) ",z?"":"*"]}),(0,s.jsx)(m.I,{name:"maxAge",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.maxAge,type:"number",disabled:i||!S.minAge,min:S.minAge,error:Number(S.minAge||"0")>Number(S.maxAge||"0"),onChange:e=>M(i=>({...i,maxAge:e.target.value}))})]})]}),P&&(0,s.jsx)(s.Fragment,{children:(0,s.jsxs)("div",{className:"flex gap-x-2",children:[(0,s.jsxs)("div",{className:"flex-1",children:[(0,s.jsx)(h._,{secondary:!0,htmlFor:"hourlyFeed",children:"Hourly feed *"}),(0,s.jsx)(m.I,{name:"hourlyFeed",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.hourlyFeed,type:"number",disabled:i,onChange:e=>M(i=>({...i,hourlyFeed:e.target.value}))})]}),(0,s.jsxs)("div",{className:"flex-1",children:[(0,s.jsx)(h._,{secondary:!0,htmlFor:"hourlyFeedDivider",children:"Hourly feed divider *"}),(0,s.jsx)(m.I,{name:"hourlyFeedDivider",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.hourlyFeedDivider,type:"number",disabled:i,onChange:e=>M(i=>({...i,hourlyFeedDivider:e.target.value}))})]})]})}),(0,s.jsxs)("div",{children:[(0,s.jsxs)(h._,{secondary:!0,htmlFor:"dosage",children:["Dose (e.g. ",P?"ml/kg/24hrs":"mg/kg",") *"]}),(0,s.jsx)(m.I,{name:"dosage",type:"number",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.dosage,disabled:i,onChange:e=>M(i=>({...i,dosage:e.target.value}))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(h._,{secondary:!0,htmlFor:"dosageMultiplier",children:"Drug Dose Multiplier *"}),(0,s.jsx)(m.I,{name:"dosageMultiplier",type:"number",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.dosageMultiplier,disabled:i,onChange:e=>M(i=>({...i,dosageMultiplier:e.target.value}))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(h._,{secondary:!0,htmlFor:"drugUnit",children:"Drug Unit *"}),(0,s.jsx)(m.I,{name:"drugUnit",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.drugUnit,disabled:i,onChange:e=>M(i=>({...i,drugUnit:e.target.value}))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(h._,{secondary:!0,htmlFor:"administrationFrequency",children:"Administration Frequency *"}),(0,s.jsx)(m.I,{name:"administrationFrequency",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.administrationFrequency,disabled:i,onChange:e=>M(i=>({...i,administrationFrequency:e.target.value}))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(h._,{secondary:!0,htmlFor:"routeOfAdministration",children:"Route of Administration *"}),(0,s.jsx)(m.I,{name:"routeOfAdministration",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.routeOfAdministration,disabled:i,onChange:e=>M(i=>({...i,routeOfAdministration:e.target.value}))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(h._,{secondary:!0,htmlFor:"managementText",children:"Management text *"}),(0,s.jsx)(m.I,{name:"managementText",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.managementText,disabled:i,onChange:e=>M(i=>({...i,managementText:e.target.value}))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(h._,{secondary:!0,htmlFor:"weight",children:"Dosage text *"}),(0,s.jsx)(m.I,{name:"dosageText",className:"focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",value:S.dosageText,disabled:i,onChange:e=>M(i=>({...i,dosageText:e.target.value}))})]})]});return(0,s.jsxs)(s.Fragment,{children:[Z&&(0,s.jsx)(f.a,{overlay:!0}),(0,s.jsx)("div",{ref:I,children:!1===r?H:(0,s.jsx)(d.yo,{open:W,onOpenChange:e=>{e||L()},children:(0,s.jsxs)(d.ue,{hideCloseButton:!0,side:"right",className:"p-0 m-0 flex flex-col w-full max-w-full sm:max-w-[80%] md:max-w-[80%] lg:max-w-[50%]",children:[(0,s.jsxs)(d.Tu,{className:"flex flex-row items-center py-2 px-4 border-b border-b-border text-left sm:text-left",children:[(0,s.jsxs)(d.bC,{children:[T?"Add":"",C?"Edit":""," ",(null==a?void 0:a.type)||T]}),(0,s.jsx)(d.Ei,{className:"hidden"})]}),(0,s.jsx)("div",{ref:D,className:"flex-1 py-2 px-0 overflow-y-auto",children:(0,s.jsx)("div",{className:"px-4",children:H})}),(0,s.jsxs)("div",{className:"border-t border-t-border px-4 py-2 flex gap-x-2",children:[(0,s.jsx)("span",{className:"text-danger text-xs my-auto",children:"* Required"}),(0,s.jsx)("div",{className:"ml-auto"}),(0,s.jsx)(d.sw,{asChild:!0,children:(0,s.jsx)(g.z,{variant:"ghost",onClick:()=>{},children:"Cancel"})}),(0,s.jsx)(g.z,{onClick:()=>U(),disabled:B(),children:"Save"})]})]})})})]})}},44371:function(e,i,a){a.d(i,{R:function(){return g},a:function(){return m}});var s=a(2265),n=a(16463),t=a(12491),l=a(38472),r=a(39099),o=a(53699),d=a(7752);let u={initialised:!1,loading:!1,keys:[],drugs:[]},c=(0,r.Ue)(e=>u);function g(){c.setState(u)}function m(){let e=c(),{drugs:i}=e,a=(0,n.useRouter)(),r=(0,n.useSearchParams)(),g=(0,s.useMemo)(()=>t.Z.parse(r.toString()),[r]),{itemId:m}=g,v=(0,s.useMemo)(()=>{var e;return null===(e=i.filter(e=>e.itemId===m||e.key===m)[0])||void 0===e?void 0:e.itemId},[m,i]),{alert:h}=(0,o.s)(),f=(0,s.useCallback)(async()=>{try{var e,i;c.setState({loading:!0});let a=await l.Z.get("/api/drugs-library?data="+JSON.stringify({returnDraftsIfExist:!0}));if(null===(e=a.data.errors)||void 0===e?void 0:e.length)throw Error(null===(i=a.data.errors)||void 0===i?void 0:i.join(", "));c.setState({drugs:a.data.data})}catch(e){h({title:"Error",message:e.message,variant:"error"})}finally{c.setState({loading:!1})}},[h]);!function(e){let{events:i}=e,a=(0,s.useMemo)(()=>i,[i]),t=(0,s.useRef)({eventsTimeouts:{},eventsTimestamps:{}});(0,s.useRef)(new Date().getTime());let l=(0,n.useRouter)();(0,s.useEffect)(()=>{a.forEach(e=>{let{name:i,action:a,delay:s=100,onEvent:n}=e;d.Z.on(i,function(){for(var e=arguments.length,r=Array(e),o=0;o<e;o++)r[o]=arguments[o];let d=()=>{var e,s;(!a||r[0]===a)&&(null===(e=n.callback)||void 0===e||e.call(n,...r),(null==n?void 0:n.refreshRouter)&&(console.log(i,"refreshing..."),l.refresh()),(null===(s=n.redirect)||void 0===s?void 0:s.to)&&(n.redirect.replace?l.replace(n.redirect.to):l.push(n.redirect.to)))},u=new Date().getTime();s?(clearTimeout(t.current.eventsTimeouts[i]),t.current.eventsTimeouts[i]=setTimeout(()=>{t.current.eventsTimestamps[i]=u,d()},s)):(t.current.eventsTimestamps[i]=new Date().getTime(),d())})})},[a,l])}({events:[{name:"data_changed",onEvent:{callback:async()=>{await f(),a.refresh()}}}]});let x=(0,s.useCallback)(async e=>{try{var i,s;c.setState(i=>({loading:!0,drugs:i.drugs.filter(i=>!e.includes(i.itemId))}));let n=await l.Z.delete("/api/drugs-library?data="+JSON.stringify({itemsIds:e}));if(null===(i=n.data.errors)||void 0===i?void 0:i.length)throw Error(null===(s=n.data.errors)||void 0===s?void 0:s.join(", "));a.refresh(),h({title:"",message:"Drug deleted successfully!",variant:"success"})}catch(e){h({title:"Error",message:e.message,variant:"error"})}finally{c.setState({loading:!1})}},[h,a.refresh]),y=(0,s.useCallback)(async e=>{try{var s,n;c.setState({loading:!0});let t=[],r=[],o=i;c.setState(i=>(o=!v&&e?[...i.drugs,e]:i.drugs.map(i=>i.itemId!==(null==e?void 0:e.itemId)?i:(e&&(i.key!==e.key&&r.push({old:i.key,new:e.key}),i.type!==e.type&&t.push(i.key)),{...i,...e})),{loading:!0,drugs:o}));let d={data:e?[e]:o,broadcastAction:!0},u=await l.Z.post("/api/drugs-library/save",d);if(null===(s=u.data.errors)||void 0===s?void 0:s.length)throw Error(null===(n=u.data.errors)||void 0===n?void 0:n.join(", "));await f(),a.refresh(),h({title:"",message:"Drug".concat(e?"":"s"," saved successfully!"),variant:"success"})}catch(e){h({title:"Error",message:e.message,variant:"error"})}finally{c.setState({loading:!1})}},[i,v,a.refresh]),b=(0,s.useCallback)(async e=>{try{var i,s;c.setState({loading:!0});let n={data:e.map(e=>({itemId:e})),broadcastAction:!0},t=await l.Z.post("/api/drugs-library/copy",n);if(null===(i=t.data.errors)||void 0===i?void 0:i.length)throw Error(null===(s=t.data.errors)||void 0===s?void 0:s.join(", "));await f(),a.refresh(),h({title:"",message:"Drug".concat(e.length<2?"":"s"," copied successfully!"),variant:"success"})}catch(e){h({title:"Error",message:e.message,variant:"error"})}finally{c.setState({loading:!1})}},[a.refresh]);return(0,s.useEffect)(()=>{c.getState().initialised||(f(),c.setState({initialised:!0}))},[f]),(0,s.useCallback)(()=>{c.setState(u)},[]),{...e,selectedItemId:v,addLink:e=>"?".concat(t.Z.stringify({...g,addItem:e})),editLink:e=>"?".concat(t.Z.stringify({...g,itemId:e})),getDrugs:f,deleteDrugs:x,saveDrugs:y,copyDrugs:b}}},74166:function(e,i){i.Z=e=>"".concat(e||"").charAt(0).toUpperCase()+"".concat(e||"").slice(1)}}]);