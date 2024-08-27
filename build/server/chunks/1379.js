exports.id=1379,exports.ids=[1379],exports.modules={5803:(e,t,r)=>{"use strict";r.r(t),r.d(t,{$$ACTION_0:()=>E,$$ACTION_1:()=>_,$$ACTION_2:()=>U,$$ACTION_3:()=>L,createUsers:()=>N,deleteUsers:()=>R,getFullUser:()=>w,getUser:()=>x,getUsers:()=>A,isEmailRegistered:()=>$,searchUsers:()=>v,updateUsers:()=>D});var a=r(24330);r(60166);var o=r(57745),s=r(9576),n=r(67096),i=r.n(n),l=r(10413),d=r(57418),c=r(47625);async function u(e){for(let t of e){let e=new Date;await l.Z.update(d.users).set({deletedAt:e,email:t,displayName:"Former user",firstName:null,lastName:null,avatar:null,avatar_md:null,avatar_sm:null}).where((0,o.eq)(d.users.userId,t))}return!0}async function f(e,t){let r=[];for(let t of e){let e=await i().hash(t.password||(0,s.Z)(),12);r.push({...t,password:e,userId:t.userId||(0,s.Z)()})}let a={inserted:[],success:!1};try{if(await l.Z.insert(d.users).values(r),t?.returnInserted){let e=await (0,c.yT)({userIds:r.map(e=>e.userId)});a.inserted=e.data}a.success=!0}catch(e){a.error=e.message}finally{return a}}async function g(e,t){let r=[];for(let{userId:a,data:s}of e)try{delete s.id,delete s.createdAt,delete s.updatedAt,delete s.email,delete s.userId,await l.Z.update(d.users).set(s).where((0,o.eq)(d.users.userId,a));let e=t?.returnUpdated?await (0,c.IQ)(a):void 0;r.push({userId:a,user:e})}catch(e){r.push({userId:a,error:e.message})}return r}var m=r(57435),p=r(6866),h=r(70733),y=r(66267),b=r(40618);async function $(e){try{m.Z.log("isEmailRegistered");let t=await (0,c.IQ)(e);return m.Z.log("isEmailRegistered: ",!!t),{yes:!!t}}catch(e){return m.Z.error("getUser ERROR:",e),{errors:[e.message],yes:!1}}}async function x(e){try{return await (0,y.isAllowed)("get_user"),await (0,c.IQ)(e)||null}catch(e){return m.Z.error("getUser ERROR:",e),null}}async function w(e){try{return await (0,y.isAllowed)("get_user"),await (0,c.C)(e)||null}catch(e){return m.Z.error("getFullUser ERROR:",e),null}}let A=(0,a.j)("5882312855a480b48e4a548efe7ab3b4b7be1cbd",E);async function E(...e){try{return await (0,y.isAllowed)("get_users"),await (0,c.yT)(...e)}catch(e){return{...c.Ko,error:e.message}}}let v=(0,a.j)("4f324e3ae3e95d4bfe179d6c364878b829b5679f",_);async function _(...e){try{return await (0,y.isAllowed)("search_users"),await (0,c.yT)(...e)}catch(e){return{...c.Ko,error:e.message}}}async function R(e){if(await (0,y.isAllowed)("delete_users"),e.length){let{data:t}=await (0,c.yT)({userIds:e});await u(e),await Promise.all(t.filter(e=>e.activationDate).map(e=>(0,p.Y)({toEmail:e.email,...function({name:e}){let t=`Your ${process.env.NEXT_PUBLIC_APP_NAME} account has been deleted.`;return{subject:"Account deleted",textMessage:[`Hi ${e},
`,t+"\n"].join("\n"),htmlMessage:`
            <p class="text-lg font-bold">Hi ${e}</p>
            <p>${t}</p>
        `}}({name:e.displayName})})))}return!0}let N=(0,a.j)("e3b5e0f3bf52df374364240f2245074b5ed484f1",U);async function U(...e){try{await (0,y.isAllowed)("create_users");let t=await f(...e);for(let t of e[0])try{let e=await (0,h.n)({userId:t.userId,hoursValid:1});await (0,p.Y)({toEmail:t.email,...function({token:e,name:t}){let r=`Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}.
Use this link, to activate your account:`,a=`${process.env.NEXT_PUBLIC_APP_URL}/authorize/${e}`;return{subject:`Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}`,textMessage:[`Hi ${t},
`,r+"\n",a,"Note that this link expires in 1 hour and can only be used once.","If you haven&apos;t requested this email, there&apos;s nothing to worry about - you can safely ignore it."].join("\n"),htmlMessage:`
            <p class="text-lg font-bold">Hi ${t}</p>
            <p>${r}</p>
            <div class="my-md text-center text-lg font-bold">
                <a href="${a}">Activate account</a>
            </div>
            <p>Note that this link expires in 1 hour and can only be used once.</p>
            <p>If you haven&apos;t requested this email, there&apos;s nothing to worry about - you can safely ignore it.</p>
        `}}({name:t.displayName,token:e.token})})}catch(e){}return t}catch(e){throw m.Z.error("createUsers ERROR",e),e}}let D=(0,a.j)("1e2ece632c05346b91ecbbe64716357a90904f1c",L);async function L(...e){try{return await (0,y.isAllowed)("update_users"),await g(...e)}catch(e){throw m.Z.error("updateUsers ERROR",e),e}}(0,b.h)([$,x,w,A,v,R,N,D]),(0,a.j)("e14de0855656a139be38da1eb195d1260aab939f",$),(0,a.j)("3b283529780cec927ba8cf799424ba93a64cf967",x),(0,a.j)("3668a8b3d9cb731ce980e807e685806a5e398296",w),(0,a.j)("1632ab3ee9c3ed1d9c642ca6d6aad0d465c2b78d",A),(0,a.j)("7dea9d27942bd3f422efbcb2759f2a1e6f0e47b0",v),(0,a.j)("f473c495622b12310fe5bb30b7bd203dd6af5dd6",R),(0,a.j)("b0f3eb0c3196b639a47bea345c9cc318d1f0ee7d",N),(0,a.j)("8d2db919828d70c401076c38fa1f04c6336f324c",D)},46697:(e,t,r)=>{"use strict";r.d(t,{Zb:()=>n,aY:()=>i});var a=r(19510),o=r(71159),s=r(50650);let n=o.forwardRef(({className:e,...t},r)=>a.jsx("div",{ref:r,className:(0,s.cn)("rounded-lg border bg-card text-card-foreground shadow-sm",e),...t}));n.displayName="Card",o.forwardRef(({className:e,...t},r)=>a.jsx("div",{ref:r,className:(0,s.cn)("flex flex-col space-y-1.5 p-6",e),...t})).displayName="CardHeader",o.forwardRef(({className:e,...t},r)=>a.jsx("h3",{ref:r,className:(0,s.cn)("text-2xl font-semibold leading-none tracking-tight",e),...t})).displayName="CardTitle",o.forwardRef(({className:e,...t},r)=>a.jsx("p",{ref:r,className:(0,s.cn)("text-sm text-muted-foreground",e),...t})).displayName="CardDescription";let i=o.forwardRef(({className:e,...t},r)=>a.jsx("div",{ref:r,className:(0,s.cn)("p-6 pt-0",e),...t}));i.displayName="CardContent",o.forwardRef(({className:e,...t},r)=>a.jsx("div",{ref:r,className:(0,s.cn)("flex items-center p-6 pt-0",e),...t})).displayName="CardFooter"},70733:(e,t,r)=>{"use strict";r.d(t,{n:()=>i});var a=r(51744),o=r.n(a),s=r(10413),n=r(57418);async function i({userId:e,hoursValid:t}){return(await s.Z.insert(n.tokens).values({userId:e,validUntil:o()(new Date).add(t,"hour").toDate(),token:Math.floor(1e5+9e5*Math.random())}).returning())[0]}},33814:(e,t,r)=>{"use strict";r.r(t),r.d(t,{getLogoBase64:()=>d});var a=r(24330);r(60166);var o=r(87561),s=r.n(o),n=r(49411),i=r.n(n),l=r(57435);async function d(e="logo.png"){try{return function(e){let t=s().readFileSync(e),r=Buffer.from(t).toString("base64"),a=e.split(".").pop();return`data:image/${a};base64,${r}`}(i().resolve("public/images",e))}catch(e){return l.Z.error("getLogoBase64 ERROR",__dirname,e),""}}(0,r(40618).h)([d]),(0,a.j)("6e6effe94e451b894f3a14181e3576af7566ed75",d)},6866:(e,t,r)=>{"use strict";r.d(t,{Y:()=>d});var a=r(55245),o=r(2090),s=r.n(o),n=r(33814);let i={primary:{DEFAULT:"#70A487",foreground:"rgb(255,255,255)",900:"#7DAC92",800:"#8AB49D",700:"#97BCA8",600:"#A4C5B3",500:"#B1CDBE",400:"#BED5C9",300:"#CBDED3",200:"#D8E6DE",100:"#E5EEE9"},secondary:{DEFAULT:"#2B304A",foreground:"rgb(255,255,255)",900:"#383F61",800:"#454D78",700:"#525C8E",600:"#606CA4",500:"#7781B1",400:"#8E96BE",300:"#A4ABCB",200:"#BBC0D8",100:"#D2D5E5"},danger:{DEFAULT:"#b20008",foreground:"#fff"},success:{DEFAULT:"#00b894",foreground:"#fff"}};var l=r(57435);async function d({toEmail:e,subject:t,textMessage:r,htmlMessage:o,messageTitle:d}){let c=await (0,n.getLogoBase64)("logo.png"),u=await (0,n.getLogoBase64)("logo-light.png"),f=a.createTransport({host:process.env.MAIL_HOST,port:Number(process.env.MAIL_PORT),secure:!1,auth:{user:process.env.MAIL_USERNAME,pass:process.env.MAIL_PASSWORD}});f.use("compile",s()({cidPrefix:"wellToDoHedgehog107"}));let g={from:`"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,sender:process.env.MAIL_FROM_ADDRESS,to:"string"==typeof e?[e]:e,subject:`[${process.env.NEXT_PUBLIC_APP_NAME}] ${t}`,text:r,html:function({title:e,body:t,logo:r,logoLight:a}){let o={sm:"6px",md:"16px",lg:"24px"},s={xs:"200px",sm:"400px",md:"800px",lg:"1200px"},n={center:"center",end:"flex-end",start:"flex-start",baseline:"baseline"};return`
        <!DOCTYPE html>
        <html>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">

                <style>
                    .font-normal {
                        font-family: "Roboto", sans-serif;
                        font-weight: 400;
                        font-style: normal;
                        font-size: 16px;
                    }

                    .font-bold {
                        font-family: "Roboto", sans-serif;
                        font-weight: 700;
                        font-style: normal;
                    }

                    .block { display: block; }
                    .inline { display: inline; }
                    .inline-block { display: inline-block; }
                    .inline-flex { display: inline-flex; }
                    .flex { display: flex; }

                    .flex-row { flex-flow: row; }
                    .flex-col { flex-flow: column; }
                    .flex-1 { flex: 1; }

                    a {
                        text-decoration: none;
                        color: ${i.primary.DEFAULT};
                    }
                    
                    ${["center","end","start","baseline"].map(e=>`
                            .items-${e} { align-items: ${n[e]}; }
                            .justify-${e} { justify-content: ${n[e]}; }
                        `).join("")}

                    .w-full { width: 100%; }
                    .min-w-full { min-width: 100%; }
                    .w-auto { width: auto; }

                    .h-full { height: 100%; }
                    .min-h-full { min-height: 100%; }
                    .h-auto { height: auto; }

                    .m-auto { margin: auto; }
                    .ml-auto { margin-left: auto; }
                    .mr-auto { margin-right: auto; }
                    .mt-auto { margin-top: auto; }
                    .mb-auto { margin-bottom: auto; }

                    .text-primary { color: ${i.primary.DEFAULT}; }
                    .text-primary-foreground { color: ${i.primary.foreground}; }
                    .text-secondary { color: ${i.secondary.DEFAULT}; }
                    .text-secondary-foreground { color: ${i.secondary.foreground}; }
                    .text-danger { color: ${i.danger.DEFAULT}; }
                    .text-danger-foreground { color: ${i.danger.foreground}; }
                    .text-success { color: ${i.success.DEFAULT}; }
                    .text-success-foreground { color: ${i.success.foreground}; }

                    .bg-primary { background-color: ${i.primary.DEFAULT}; }
                    .bg-primary-foreground { background-color: ${i.primary.foreground}; }
                    .bg-secondary { background-color: ${i.secondary.DEFAULT}; }
                    .bg-secondary-foreground { background-color: ${i.secondary.foreground}; }
                    .bg-danger { background-color: ${i.danger.DEFAULT}; }
                    .bg-danger-foreground { background-color: ${i.danger.foreground}; }
                    .bg-success { background-color: ${i.success.DEFAULT}; }
                    .bg-success-foreground { background-color: ${i.success.foreground}; }

                    .text-sm { font-size: 12px; }
                    .text-base { font-size: 16px; }
                    .text-lg { font-size: 24px; }

                    .text-left { text-align: left; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .text-justify { text-align: justify; }

                    ${["sm","md","lg"].map(e=>`
                            .w-${e} { width: ${s[e]}; }
                            .max-w-${e} { max-width: ${s[e]}; }
                            .min-w-${e} { min-width: ${s[e]}; }

                            .m-${e} { margin: ${o[e]}; }
                            .ml-${e} { margin-left: ${o[e]}; }
                            .mr-${e} { margin-right: ${o[e]}; }
                            .mt-${e} { margin-top: ${o[e]}; }
                            .mb-${e} { margin-bottom: ${o[e]}; }
                            .mx-${e} { 
                                margin-left: ${o[e]}; 
                                margin-right: ${o[e]}; 
                            }
                            .my-${e} { 
                                margin-top: ${o[e]}; 
                                margin-bottom: ${o[e]}; 
                            }

                            .p-${e} { padding: ${o[e]}; }
                            .pl-${e} { padding-left: ${o[e]}; }
                            .pr-${e} { padding-right: ${o[e]}; }
                            .pt-${e} { padding-top: ${o[e]}; }
                            .pb-${e} { padding-bottom: ${o[e]}; }
                            .px-${e} { 
                                padding-left: ${o[e]}; 
                                padding-right: ${o[e]}; 
                            }
                            .py-${e} { 
                                padding-top: ${o[e]}; 
                                padding-bottom: ${o[e]}; 
                            }
                        `).join("")}

                    #logo { display: block; }
                    #logoLight { display: none; }

                    @media (prefers-color-scheme: dark) {
                        #logo { display: none; }
                        #logoLight { display: block; }
                    }
                </style>
            </head>

            <body class="text-base font-normal">
                <div style="width:100%;max-width:${s.md};margin:auto;">
                    <div>
                        ${r||a?`
                            <div style="width:100%;max-width:${s.xs};margin:auto;">
                                <img
                                    id="logo"
                                    src="${r||a}"
                                    alt="${process.env.NEXT_PUBLIC_APP_NAME}"
                                    style="width:100%;height:auto;"
                                />
                                <img
                                    id="logoLight"
                                    src="${a||r}"
                                    alt="${process.env.NEXT_PUBLIC_APP_NAME}"
                                    style="width:100%;height:auto;"
                                />
                            </div>    
                        `:""}

                        ${e?`
                            <div style="margin-bottom:${o.md};">
                                ${e}
                            </div>    
                        `:""}

                        <div style="margin-bottom:${o.md};">
                            ${t}
                        </div>

                        <div style="display:flex;align-items:center;justify-content:flex-end;">
                            <span>&copy;&nbsp;</span>
                            <a style="color:${i.primary.DEFAULT};" href="${process.env.NEXT_PUBLIC_APP_URL}">Neotree</a>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `}({logo:c,logoLight:u,body:o||r,title:d})};await new Promise((e,t)=>{f.sendMail(g,function(r,a){if(!r)return e(a);l.Z.error("sendEmail ERR",r.message),t(r)})})}},2090:(e,t,r)=>{var a=r(92484),o=r(6113);e.exports=function(e){return e=e||{},function(t,r){if(!t||!t.data||!t.data.html)return r();t.resolveContent(t.data,"html",function(s,n){if(s)return r(s);var i={};n=a(n,function(t,r){if(i[r])return i[r].cid;var a=(e.cidPrefix||"")+o.randomBytes(8).toString("hex");return i[r]={contentType:t,cid:a,content:r,encoding:"base64",contentDisposition:"inline"},a}),t.data.html=n,t.data.attachments||(t.data.attachments=[]),Object.keys(i).forEach(function(e){t.data.attachments.push(i[e])}),r()})}}},92484:e=>{e.exports=function(e,t){return e.replace(/(<img[\s\S]*? src=['"])data:(image\/(?:png|jpe?g|gif));base64,([\s\S]*?)(['"][\s\S]*?>)/g,function(e,r,a,o,s){return r+"cid:"+t(a,o)+s}).replace(/(url\(\s*('|"|&quot;|&QUOT;|&apos;|&#3[49];|&#[xX]2[27];)?)data:(image\/(?:png|jpe?g|gif));base64,([\s\S]*?)(\2\s*\))/g,function(e,r,a,o,s,n){return r+"cid:"+t(o,s)+n})}}};