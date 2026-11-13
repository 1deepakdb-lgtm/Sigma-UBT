(()=>{var e={};e.id=4663,e.ids=[4663],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4770:e=>{"use strict";e.exports=require("crypto")},2254:e=>{"use strict";e.exports=require("node:buffer")},6005:e=>{"use strict";e.exports=require("node:crypto")},7261:e=>{"use strict";e.exports=require("node:util")},7631:(e,t,n)=>{"use strict";n.r(t),n.d(t,{GlobalError:()=>a.a,__next_app__:()=>c,originalPathname:()=>x,pages:()=>p,routeModule:()=>u,tree:()=>d}),n(3277),n(8440),n(5009),n(1837);var o=n(3191),i=n(8716),r=n(7922),a=n.n(r),s=n(5231),l={};for(let e in s)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>s[e]);n.d(t,l);let d=["",{children:["student",{children:["exam",{children:["[examId]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(n.bind(n,3277)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(n.bind(n,8440)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/layout.jsx"]}]},{layout:[()=>Promise.resolve().then(n.bind(n,5009)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/layout.jsx"],"not-found":[()=>Promise.resolve().then(n.bind(n,1837)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/not-found.jsx"]}],p=["/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx"],x="/student/exam/[examId]/page",c={require:n,loadChunk:()=>Promise.resolve()},u=new o.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/student/exam/[examId]/page",pathname:"/student/exam/[examId]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},4108:(e,t,n)=>{Promise.resolve().then(n.t.bind(n,2994,23)),Promise.resolve().then(n.t.bind(n,6114,23)),Promise.resolve().then(n.t.bind(n,9727,23)),Promise.resolve().then(n.t.bind(n,9671,23)),Promise.resolve().then(n.t.bind(n,1868,23)),Promise.resolve().then(n.t.bind(n,4759,23))},4696:(e,t,n)=>{Promise.resolve().then(n.bind(n,9180))},6473:(e,t,n)=>{Promise.resolve().then(n.bind(n,4387))},5359:(e,t,n)=>{Promise.resolve().then(n.bind(n,2766))},5303:()=>{},4387:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>a});var o=n(326),i=n(7577);n(434);var r=n(5047);"undefined"==typeof globalThis||globalThis.localStorage||(globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{},clear:()=>{},key:()=>null,length:0});let a=()=>{let e=(0,r.useRouter)(),t=(0,r.useParams)(),n=t?.examId,[a,s]=(0,i.useState)(""),[l,d]=(0,i.useState)(""),[p,x]=(0,i.useState)(!1),[c,u]=(0,i.useState)("overview"),[h,f]=(0,i.useState)(!1),[m,g]=(0,i.useState)([]),[b,y]=(0,i.useState)(0),[j,w]=(0,i.useState)({}),[v,S]=(0,i.useState)(3e3),[C,k]=(0,i.useState)(`Chapterwise 0${n}`),[I,R]=(0,i.useState)(!1),[W,T]=(0,i.useState)(null),[z,E]=(0,i.useState)(!1),[N,A]=(0,i.useState)(null);(0,i.useEffect)(()=>{try{e.prefetch("/student/result"),e.prefetch("/student")}catch(e){}},[e]),(0,i.useEffect)(()=>{try{let e=localStorage.getItem("currentUser")||"Student";s(e);let t=JSON.parse(localStorage.getItem("institutes")||"[]");t[0]?.logoUrl&&d(t[0].logoUrl)}catch(e){}},[]),(0,i.useEffect)(()=>()=>{},[]);let D=(0,i.useRef)(null),O=(0,i.useRef)({}),P=(0,i.useRef)(0),L=(0,i.useRef)({}),q=(0,i.useRef)(null),B=(0,i.useRef)({}),[_,H]=(0,i.useState)(!1),[M,J]=(0,i.useState)({}),[U,F]=(0,i.useState)(!1),[$,Q]=(0,i.useState)(null),[G,K]=(0,i.useState)({});(0,i.useEffect)(()=>{(async function(){try{let t=await fetch(`/api/student/exams/${n||"set-1-demo"}/start`,{method:"POST"});if(t.ok){let e=await t.json();if(e.questions&&e.questions.length>=40){g(e.questions),e.answerSheet&&K(e.answerSheet),Q(e.sessionId),e.examName&&k(e.examName);try{localStorage.setItem(`offline_ubt_exam_${n||"set-1-demo"}`,JSON.stringify({questions:e.questions,answerSheet:e.answerSheet||{},sessionId:e.sessionId,examName:e.examName,duration:e.duration,expiresAt:e.expiresAt,cachedAt:Date.now()}))}catch(e){console.warn("Could not write offline exam cache:",e)}return}}else{let n=await t.json().catch(()=>({}));alert(n.error||"Access Denied: You do not have authorization to access this exam."),e.push("/student");return}}catch(e){console.warn("Backend start API network error (attempting offline cache):",e);try{let e=localStorage.getItem(`offline_ubt_exam_${n||"set-1-demo"}`);if(e){let t=JSON.parse(e);if(t.questions&&t.questions.length>=40){g(t.questions),t.answerSheet&&K(t.answerSheet),Q(t.sessionId||`offline_${Date.now()}`),t.examName&&k(t.examName);return}}}catch(e){console.warn("Offline restore error:",e)}}let t=JSON.parse(localStorage.getItem("examSets"))||[],o=JSON.parse(localStorage.getItem("questionBank"))||[],i=t.find(e=>e.id.toString()===n?.toString()||e.name===n),r=i?i.name:`Chapterwise 0${n}`;k(r);let a={},s=a[""]||a[""],l=[].some(e=>e?.toString()===n?.toString()||e?.toString()===i?.id?.toString()||e?.toString()===i?.name?.toString()||e?.toString()===r?.toString()||"string"==typeof n&&e?.toString()===decodeURIComponent(n));if(i?.isFree||i?.setType==="FREE"||i?.name&&i.name.toLowerCase().includes("free demo")||r&&r.toLowerCase().includes("free demo")||l||s?.isBuyer||s?.hasPurchased,i&&i.creatorInstituteName&&!i.isPublished){let t={},n=("".toString().replace(/[^0-9]/g,"").slice(-10),e=>!1),o=null;for(let e in t)if((t[e]||[]).some(e=>n(e.phone))){o=e;break}if(!o||o.toLowerCase()!==i.creatorInstituteName.toLowerCase()){alert(`Access Restricted: This exam set is in the private bucket of "${i.creatorInstituteName}". Students from other institutes cannot access it.`),e.push("/student");return}}let d=i?i.packageName:"",p=o.filter(e=>e&&(e.setId?.toString()===n?.toString()||e.set===r||e.package===d&&e.set===r)),x=p.filter(e=>"Reading"===e.type),c=p.filter(e=>"Listening"===e.type),u=[];for(let e=1;e<=20;e++)x[e-1]?u.push({...x[e-1],id:x[e-1].id||e,type:"Reading"}):u.push({id:e,type:"Reading",mainHeading:`[ ${e} ] 다음을 읽고 알맞은 것을 고르십시오.`,questionHeading:"",description:"",image:"",audio:"",options:["가방","지갑","우산","이불"],answer:0});for(let e=1;e<=20;e++){let t=20+e;c[e-1]?u.push({...c[e-1],id:c[e-1].id||t,type:"Listening"}):u.push({id:t,type:"Listening",mainHeading:`[ ${t} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`,questionHeading:"",description:"",image:"",audio:"",options:["듣기 1","듣기 2","듣기 3","듣기 4"],answer:0})}g(u)})()},[n]),(0,i.useEffect)(()=>{q.current&&clearTimeout(q.current),Object.values(B.current).forEach(e=>clearTimeout(e)),B.current={},D.current&&(D.current.pause(),D.current.currentTime=0),Object.values(O.current).forEach(e=>{e&&(e.pause(),e.currentTime=0)}),P.current=0,L.current={},H(!1),J({}),F(!1)},[b]),(0,i.useEffect)(()=>{if(p){let e=setInterval(()=>{S(t=>t<=1?(clearInterval(e),en(),0):t-1)},1e3);return()=>clearInterval(e)}},[p]);let Y=e=>{let t=Math.floor(e/60).toString().padStart(2,"0"),n=(e%60).toString().padStart(2,"0");return`${t}:${n}`},V=e=>{let t=m[b];w({...j,[t.id]:e})},X=()=>{0===P.current&&(P.current=1,H(!0),F(!0))},Z=()=>{1===P.current?(q.current&&clearTimeout(q.current),q.current=setTimeout(()=>{D.current&&1===P.current&&(P.current=2,D.current.currentTime=0,D.current.play().catch(e=>console.log("Audio 2nd play error:",e)))},3e3)):P.current>=2&&F(!1)},ee=e=>{0===(L.current[e]||0)&&(L.current[e]=1,J(t=>({...t,[e]:!0})),F(!0))},et=e=>{let t=L.current[e]||1;1===t?(B.current[e]&&clearTimeout(B.current[e]),B.current[e]=setTimeout(()=>{let t=O.current[e];t&&1===L.current[e]&&(L.current[e]=2,t.currentTime=0,t.play().catch(e=>console.log("Opt audio 2nd play error:",e)))},3e3)):t>=2&&F(!1)},en=async()=>{try{q.current&&clearTimeout(q.current),Object.values(B.current).forEach(e=>clearTimeout(e)),D.current&&D.current.pause(),Object.values(O.current).forEach(e=>e&&e.pause());let t=m.map((e,t)=>{let n=G[e.id]??G[e.qIndex]??G[t+1]??e.answer;return{...e,answer:null!=n?Number(n):void 0}}),o=0,i=0,r={};t.forEach((e,t)=>{let n=void 0!==j[e.id]?j[e.id]:j[t];if(null!=n&&""!==n){let t=Number(n);r[e.id]=t,void 0!==e.qIndex&&(r[e.qIndex]=t),i+=1,void 0!==e.answer&&t===Number(e.answer)&&(o+=1)}});let a=t.length>0?t.length:40,s={examName:C,score:o,total:a,attempted:i,percentage:Math.round(o/a*100),passed:Math.round(o/a*100)>=40,questions:t,selectedAnswers:r,isOfflineSubmitted:!1},l=!1;if($&&"undefined"!=typeof navigator&&navigator.onLine)try{let e=new AbortController,i=setTimeout(()=>e.abort(),3500),d=await fetch(`/api/student/exams/${n||"set-1-demo"}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:$,selectedAnswers:r}),signal:e.signal});if(clearTimeout(i),d.ok){l=!0;let e=await d.json();if(e.result){let n=e.result;s.score=void 0!==n.correctAnswers?n.correctAnswers:o,s.total=n.totalQuestions||a,s.passed=!!n.passed,s.percentage=Math.round(s.score/s.total*100),Array.isArray(n.breakdown)&&(s.questions=t.map((e,t)=>{let o=n.breakdown.find(n=>n.qIndex===e.qIndex||n.qIndex===t+1);return o?{...e,answer:o.correctAnswer}:e}))}}}catch(e){console.warn("Submit API network notice (enqueuing for offline sync):",e)}if(!l){s.isOfflineSubmitted=!0;try{let e=JSON.parse(localStorage.getItem("offlineExamSyncQueue")||"[]");e.push({examId:n||"set-1-demo",sessionId:$||`offline_${Date.now()}`,selectedAnswers:r,score:o,total:a,submittedAt:new Date().toISOString()}),localStorage.setItem("offlineExamSyncQueue",JSON.stringify(e))}catch(e){console.warn("Could not save to offline sync queue:",e)}}localStorage.setItem("lastExamResult",JSON.stringify(s));let d=JSON.parse(localStorage.getItem("examResults"))||[];localStorage.setItem("examResults",JSON.stringify([s,...d])),T(s),R(!0),f(!1);try{e.push("/student/result")}catch(e){console.warn("Offline router navigation notice (active in-page review fallback):",e)}}catch(t){console.error("Submission error:",t);try{e.push("/student/result")}catch(e){}}};Object.keys(j).length,m.length;let eo={userSelect:"none",WebkitUserSelect:"none",MozUserSelect:"none",msUserSelect:"none"};if(!p)return(0,o.jsxs)("div",{className:"ubt-pre-exam-screen",style:{width:"100vw",minHeight:"100dvh",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:"#f8fafc",fontFamily:"Arial, sans-serif",boxSizing:"border-box",padding:"12px 14px",overflowY:"auto",...eo},onContextMenu:e=>e.preventDefault(),children:[o.jsx("style",{dangerouslySetInnerHTML:{__html:`
          .ubt-pre-exam-dialog {
            background-color: #ffffff;
            padding: 20px 24px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
            max-width: 760px;
            width: 100%;
            max-height: 94vh;
            max-height: 94dvh;
            overflow-y: auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            gap: 22px;
            margin: auto;
            align-items: center;
          }
          .ubt-pre-exam-col-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            justify-content: space-between;
          }
          .ubt-pre-exam-col-details {
            flex: 1.25;
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
          }
          .ubt-pre-exam-icon {
            width: 54px;
            height: 54px;
            background-color: #0284c7;
            border-radius: 50%;
            margin: 0 auto 8px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 10px rgba(2,132,199,0.3);
            flex-shrink: 0;
          }
          .ubt-pre-exam-title {
            color: #0f172a;
            font-size: 22px;
            margin: 0 0 4px 0;
            font-weight: 800;
          }
          .ubt-pre-exam-subtitle {
            color: #64748b;
            margin: 0 0 14px 0;
            font-size: 13px;
          }
          .ubt-pre-exam-table {
            background-color: #f8fafc;
            border-radius: 12px;
            padding: 12px 16px;
            border: 1px solid #e2e8f0;
            text-align: left;
            width: 100%;
            box-sizing: border-box;
          }
          .ubt-pre-exam-row {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 8px;
            margin-bottom: 8px;
            font-size: 13px;
          }
          .ubt-pre-exam-btn {
            flex: 1;
            padding: 11px;
            font-size: 13.5px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .ubt-pre-exam-buttons {
            display: flex;
            gap: 10px;
            width: 100%;
            margin-top: 14px;
          }

          /* Stack vertically on portrait mode phones or narrow views */
          @media (orientation: portrait), (max-width: 580px) {
            .ubt-pre-exam-dialog {
              flex-direction: column !important;
              max-width: 440px !important;
              padding: 18px 16px !important;
              gap: 14px !important;
            }
            .ubt-pre-exam-buttons {
              margin-top: 8px !important;
            }
          }
        `}}),(0,o.jsxs)("div",{className:"ubt-pre-exam-dialog",children:[(0,o.jsxs)("div",{className:"ubt-pre-exam-col-info",children:[o.jsx("div",{className:"ubt-pre-exam-icon",children:(0,o.jsxs)("svg",{width:"28",height:"28",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[o.jsx("path",{d:"M22 10v6M2 10l10-5 10 5-10 5z"}),o.jsx("path",{d:"M6 12v5c3 3 9 3 12 0v-5"})]})}),o.jsx("h2",{className:"ubt-pre-exam-title",children:"EPS-TOPIK UBT Exam"}),o.jsx("p",{className:"ubt-pre-exam-subtitle",children:"Please verify your details before starting"}),(0,o.jsxs)("div",{className:"ubt-pre-exam-buttons",children:[o.jsx("button",{type:"button",className:"ubt-pre-exam-btn",onClick:()=>e.push("/student"),style:{backgroundColor:"#f1f5f9",color:"#475569",border:"1px solid #cbd5e1"},children:"CANCEL"}),o.jsx("button",{type:"button",className:"ubt-pre-exam-btn",onClick:()=>{x(!0)},style:{backgroundColor:"#0284c7",color:"white",border:"none",boxShadow:"0 4px 6px rgba(2, 132, 199, 0.2)"},children:"GET STARTED"})]})]}),o.jsx("div",{className:"ubt-pre-exam-col-details",children:(0,o.jsxs)("div",{className:"ubt-pre-exam-table",children:[(0,o.jsxs)("div",{className:"ubt-pre-exam-row",children:[o.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Exam ID"}),o.jsx("span",{style:{color:"#0f172a",fontWeight:"bold"},children:"287378RM"})]}),(0,o.jsxs)("div",{className:"ubt-pre-exam-row",children:[o.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Student Name"}),o.jsx("span",{suppressHydrationWarning:!0,style:{color:"#0f172a",fontWeight:"bold"},children:a})]}),(0,o.jsxs)("div",{className:"ubt-pre-exam-row",children:[o.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Exam Title"}),o.jsx("span",{style:{color:"#0f172a",fontWeight:"bold"},children:C})]}),(0,o.jsxs)("div",{className:"ubt-pre-exam-row",children:[o.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Total Questions"}),o.jsx("span",{style:{color:"#2563eb",fontWeight:"bold"},children:"40 (20 Reading + 20 Listening)"})]}),(0,o.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"13px"},children:[o.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Time Limit"}),o.jsx("span",{style:{color:"#d97706",fontWeight:"bold"},children:"50 Minutes"})]})]})})]})]});if(I&&W){let t=W.questions||[],n=t.filter(e=>e.type&&"reading"===e.type.toLowerCase()||void 0!==e.qIndex&&e.qIndex<=20).slice(0,20),i=t.filter(e=>e.type&&"listening"===e.type.toLowerCase()||void 0!==e.qIndex&&e.qIndex>20).slice(0,20),r=[...n,...i].length>0?[...n,...i]:t.slice(0,40),s=W.selectedAnswers||{},l=(e,t)=>{if(e){if(void 0!==s[e.id])return s[e.id];if(void 0!==e.qIndex&&void 0!==s[e.qIndex])return s[e.qIndex];if(void 0!==s[t])return s[t]}};if(z&&null!==N){let e=r[N],t=l(e,N),n=null!=t&&""!==t,i=n&&e?.answer!==void 0&&Number(t)===Number(e.answer);return o.jsx("div",{style:{minHeight:"100vh",backgroundColor:"#f8fafc",padding:"16px",boxSizing:"border-box",fontFamily:"Arial, sans-serif",overflowY:"auto"},children:(0,o.jsxs)("div",{style:{maxWidth:"980px",margin:"0 auto"},children:[(0,o.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"},children:[(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"10px"},children:[o.jsx("button",{type:"button",onClick:()=>A(null),style:{backgroundColor:"#0284c7",color:"white",border:"none",padding:"8px 16px",borderRadius:"6px",fontWeight:"bold",cursor:"pointer",fontSize:"13px"},children:"❮ Back to Grid"}),(0,o.jsxs)("h3",{style:{margin:0,color:"#0f172a",fontSize:"18px",fontWeight:"800"},children:["Question ",N+1," Review (",e?.type||(N<20?"Reading":"Listening"),")"]})]}),(0,o.jsxs)("div",{style:{display:"flex",gap:"8px"},children:[o.jsx("span",{style:{backgroundColor:i?"#dcfce7":n?"#fee2e2":"#f1f5f9",color:i?"#15803d":n?"#b91c1c":"#64748b",padding:"6px 14px",borderRadius:"20px",fontWeight:"800",fontSize:"12px"},children:i?"✓ Correct":n?"✗ Incorrect":"○ Not Attempted"}),o.jsx("button",{type:"button",onClick:()=>{E(!1),A(null)},style:{backgroundColor:"#f1f5f9",color:"#334155",border:"1px solid #cbd5e1",padding:"6px 14px",borderRadius:"6px",fontWeight:"700",cursor:"pointer",fontSize:"12px"},children:"Summary"})]})]}),(0,o.jsxs)("div",{style:{backgroundColor:"white",border:"1px solid #cbd5e1",borderRadius:"10px",padding:"24px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"},children:[o.jsx("p",{style:{color:"#0f172a",fontSize:"15px",fontWeight:"bold",margin:"0 0 10px 0"},children:e?.mainHeading||(N<20?`[ ${N+1} ] 다음을 읽고 알맞은 것을 고르십시오.`:`[ ${N+1} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`)}),e?.questionHeading&&o.jsx("p",{style:{color:"#334155",fontSize:"14px",fontWeight:"bold",margin:"0 0 10px 0"},children:e.questionHeading}),(0,o.jsxs)("p",{style:{color:"#0f172a",fontSize:"17px",fontWeight:"bold",margin:"0 0 15px 0"},children:[N+1,". ",e?.description||""]}),e?.image&&o.jsx("div",{style:{margin:"15px 0",textAlign:"center"},children:o.jsx("img",{src:e.image,alt:"Question",style:{maxHeight:"180px",maxWidth:"260px",objectFit:"contain",borderRadius:"6px",border:"1px solid #cbd5e1"}})}),e?.audio&&o.jsx("div",{style:{margin:"15px 0"},children:o.jsx("audio",{controls:!0,controlsList:"nodownload",onContextMenu:e=>e.preventDefault(),src:e.audio,style:{width:"100%",height:"35px"}})}),o.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"10px",marginTop:"20px"},children:Array.isArray(e?.options)&&e.options.map((n,r)=>{let a="object"==typeof n&&null!==n?n.text:n,s="object"==typeof n&&null!==n?n.image:null,l="object"==typeof n&&null!==n?n.audio:null,d=Number(r)===Number(e.answer),p=Number(r)===Number(t),x="#f8fafc",c="1px solid #cbd5e1",u="#1e293b",h="white",f="2px solid #0284c7",m="#0284c7";return d?(x="#f0fdf4",c="1.5px solid #16a34a",u="#15803d",h="#16a34a",f="2px solid #16a34a",m="white"):p&&!i&&(x="#fef2f2",c="1.5px solid #ef4444",u="#b91c1c",h="#ef4444",f="2px solid #ef4444",m="white"),(0,o.jsxs)("div",{style:{display:"flex",flexDirection:"column",padding:"10px 14px",backgroundColor:x,border:c,borderRadius:"8px"},children:[(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",width:"100%"},children:[o.jsx("div",{style:{width:"28px",height:"28px",borderRadius:"50%",backgroundColor:h,color:m,border:f,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"13px",marginRight:"12px",flexShrink:0},children:r+1}),o.jsx("span",{style:{fontSize:"15px",flex:1,color:u},children:a}),d&&o.jsx("span",{style:{fontSize:"12px",fontWeight:"800",color:"#16a34a",marginLeft:"8px"},children:"✓ Correct Answer"}),p&&!d&&o.jsx("span",{style:{fontSize:"12px",fontWeight:"800",color:"#ef4444",marginLeft:"8px"},children:"✗ Your Answer"})]}),s&&o.jsx("div",{style:{marginTop:"6px",paddingLeft:"40px"},children:o.jsx("img",{src:s,alt:`Opt ${r+1}`,style:{maxHeight:"60px",borderRadius:"4px"}})}),l&&o.jsx("div",{style:{marginTop:"6px",paddingLeft:"40px"},children:o.jsx("audio",{controls:!0,controlsList:"nodownload",src:l,style:{width:"100%",height:"26px"}})})]},r)})}),(0,o.jsxs)("div",{style:{marginTop:"24px",display:"flex",justifyContent:"space-between"},children:[o.jsx("button",{type:"button",onClick:()=>A(e=>Math.max(0,e-1)),disabled:0===N,style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"9px 18px",borderRadius:"6px",fontWeight:"bold",cursor:0===N?"not-allowed":"pointer",opacity:0===N?.5:1},children:"❮ Previous"}),o.jsx("button",{type:"button",onClick:()=>A(e=>Math.min(r.length-1,e+1)),disabled:N===r.length-1,style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"9px 18px",borderRadius:"6px",fontWeight:"bold",cursor:N===r.length-1?"not-allowed":"pointer",opacity:N===r.length-1?.5:1},children:"Next ❯"})]})]})]})})}return z&&null===N?o.jsx("div",{style:{minHeight:"100vh",backgroundColor:"#f8fafc",padding:"16px",boxSizing:"border-box",fontFamily:"Arial, sans-serif",overflowY:"auto"},children:(0,o.jsxs)("div",{style:{maxWidth:"980px",margin:"0 auto"},children:[(0,o.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"},children:[o.jsx("button",{type:"button",onClick:()=>E(!1),style:{backgroundColor:"#0284c7",color:"white",border:"none",padding:"8px 16px",borderRadius:"6px",fontWeight:"bold",cursor:"pointer",fontSize:"13px"},children:"❮ Back to Summary"}),(0,o.jsxs)("div",{style:{display:"flex",gap:"12px",alignItems:"center"},children:[(0,o.jsxs)("span",{style:{fontSize:"13px",fontWeight:"700",color:"#16a34a"},children:["● Correct (",W.score,")"]}),(0,o.jsxs)("span",{style:{fontSize:"13px",fontWeight:"700",color:"#ef4444"},children:["● Incorrect (",W.attempted-W.score,")"]}),(0,o.jsxs)("span",{style:{fontSize:"13px",fontWeight:"700",color:"#64748b"},children:["● Unanswered (",W.total-W.attempted,")"]})]})]}),(0,o.jsxs)("div",{style:{backgroundColor:"white",border:"1px solid #cbd5e1",borderRadius:"10px",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"},children:[(0,o.jsxs)("div",{style:{backgroundColor:"#0284c7",color:"white",padding:"12px 20px",display:"flex",justifyContent:"space-between",fontWeight:"bold",fontSize:"14px",flexWrap:"wrap",gap:"8px"},children:[(0,o.jsxs)("span",{children:["Exam: ",W.examName]}),(0,o.jsxs)("span",{children:["Score: ",W.score," / ",W.total," (",W.percentage,"%)"]}),o.jsx("span",{children:"Click any question number to review"})]}),o.jsx("div",{style:{padding:"20px"},children:(0,o.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",gap:"20px",flexWrap:"wrap"},children:[(0,o.jsxs)("div",{style:{flex:1,minWidth:"280px"},children:[o.jsx("h4",{style:{textAlign:"center",color:"#0284c7",margin:"0 0 12px 0",fontSize:"15px"},children:"Reading Questions (1 - 20)"}),o.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"8px"},children:r.slice(0,20).map((e,t)=>{let n=l(e,t),i=null!=n&&""!==n,r=i&&void 0!==e.answer&&Number(n)===Number(e.answer),a="white",s="#cbd5e1",d="#1e293b";return i&&(r?(a="#16a34a",s="#15803d"):(a="#ef4444",s="#dc2626"),d="white"),o.jsx("button",{type:"button",onClick:()=>A(t),style:{padding:"10px 0",backgroundColor:a,border:`1.5px solid ${s}`,borderRadius:"6px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",color:d},children:t+1},t)})})]}),(0,o.jsxs)("div",{style:{flex:1,minWidth:"280px"},children:[o.jsx("h4",{style:{textAlign:"center",color:"#0284c7",margin:"0 0 12px 0",fontSize:"15px"},children:"Listening Questions (21 - 40)"}),o.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"8px"},children:r.slice(20,40).map((e,t)=>{let n=t+20,i=l(e,n),r=null!=i&&""!==i,a=r&&void 0!==e.answer&&Number(i)===Number(e.answer),s="white",d="#cbd5e1",p="#1e293b";return r&&(a?(s="#16a34a",d="#15803d"):(s="#ef4444",d="#dc2626"),p="white"),o.jsx("button",{type:"button",onClick:()=>A(n),style:{padding:"10px 0",backgroundColor:s,border:`1.5px solid ${d}`,borderRadius:"6px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",color:p},children:n+1},n)})})]})]})})]})]})}):(0,o.jsxs)("div",{style:{minHeight:"100vh",backgroundColor:"#f8fafc",fontFamily:"Arial, sans-serif",display:"flex",flexDirection:"column"},children:[o.jsx("div",{style:{backgroundColor:"#0284c7",color:"white",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:"16px",fontWeight:"bold",boxShadow:"0 2px 4px rgba(0,0,0,0.1)"},children:o.jsx("span",{children:"Exam Summary (Offline Mode Active)"})}),o.jsx("div",{style:{flex:1,display:"flex",justifyContent:"center",alignItems:"center",padding:"20px"},children:(0,o.jsxs)("div",{style:{width:"100%",maxWidth:"480px",backgroundColor:"white",borderRadius:"12px",padding:"28px",boxShadow:"0 10px 30px rgba(0,0,0,0.08)",border:"1px solid #e2e8f0"},children:[(0,o.jsxs)("div",{style:{textAlign:"center",marginBottom:"18px"},children:[o.jsx("div",{style:{width:"64px",height:"64px",borderRadius:"50%",backgroundColor:"#fef3c7",border:"1px solid #fde68a",margin:"0 auto 10px auto",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"32px"},children:"\uD83C\uDFC6"}),o.jsx("h2",{style:{color:"#0f172a",fontSize:"22px",margin:"0 0 8px 0",fontWeight:"800"},children:"Congratulations, Exam Ended!"}),(0,o.jsxs)("div",{style:{display:"inline-block",backgroundColor:"#f1f5f9",padding:"6px 14px",borderRadius:"20px",color:"#475569",fontWeight:"600",fontSize:"13px"},children:[o.jsx("span",{style:{color:"#0284c7"},children:"\uD83D\uDC64 Name:"})," ",a," \xa0 | \xa0 ",o.jsx("span",{style:{color:"#0284c7"},children:"Exam:"})," ",W.examName]}),o.jsx("div",{style:{marginTop:"10px"},children:o.jsx("span",{style:{backgroundColor:"#fef3c7",color:"#b45309",border:"1px solid #fde68a",padding:"4px 12px",borderRadius:"12px",fontSize:"12px",fontWeight:"700",display:"inline-flex",alignItems:"center",gap:"5px"},children:"⚡ Completed & Submitted Offline • Review Active"})})]}),(0,o.jsxs)("div",{style:{backgroundColor:"#f8fafc",borderRadius:"10px",padding:"16px 20px",marginBottom:"20px",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",border:"1px solid #e2e8f0"},children:[(0,o.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"6px"},children:[o.jsx("span",{style:{color:"#64748b",fontSize:"14px",fontWeight:"600"},children:"Total Questions"}),o.jsx("span",{style:{color:"#0f172a",fontSize:"15px",fontWeight:"bold"},children:W.total})]}),(0,o.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"6px"},children:[o.jsx("span",{style:{color:"#64748b",fontSize:"14px",fontWeight:"600"},children:"Total Attempted"}),o.jsx("span",{style:{color:"#0f172a",fontSize:"15px",fontWeight:"bold"},children:W.attempted})]}),(0,o.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"6px"},children:[o.jsx("span",{style:{color:"#64748b",fontSize:"14px",fontWeight:"600"},children:"Total Correct"}),o.jsx("span",{style:{color:"#16a34a",fontSize:"17px",fontWeight:"900"},children:W.score})]}),(0,o.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",paddingTop:"4px"},children:[o.jsx("span",{style:{color:"#64748b",fontSize:"14px",fontWeight:"600"},children:"Your Percentage"}),(0,o.jsxs)("span",{style:{color:W.percentage>=40?"#0284c7":"#ef4444",fontSize:"17px",fontWeight:"900"},children:[W.percentage,"%"]})]})]}),(0,o.jsxs)("div",{style:{display:"flex",justifyContent:"center",gap:"12px",flexWrap:"wrap"},children:[o.jsx("button",{type:"button",onClick:()=>E(!0),style:{flex:1,minWidth:"160px",backgroundColor:"#0284c7",color:"white",border:"none",padding:"12px 18px",borderRadius:"6px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",boxShadow:"0 4px 6px rgba(2, 132, 199, 0.2)"},children:"VIEW REVIEW (1-40)"}),o.jsx("button",{type:"button",onClick:()=>e.push("/student"),style:{flex:1,minWidth:"160px",backgroundColor:"#f1f5f9",color:"#475569",border:"1px solid #cbd5e1",padding:"12px 18px",borderRadius:"6px",fontWeight:"bold",fontSize:"14px",cursor:"pointer"},children:"CLOSE"})]})]})})]})}if(0===m.length)return o.jsx("div",{style:{padding:"50px",textAlign:"center"},children:"Loading exam questions..."});let ei={width:"100vw",minHeight:"100dvh",height:"100vh",display:"flex",flexDirection:"column",backgroundColor:"rgba(241, 245, 249, 0.92)",fontFamily:"Arial, sans-serif",boxSizing:"border-box",padding:"12px",overflow:"hidden",position:"relative",backgroundImage:"none",...eo};return(0,o.jsxs)("div",{className:"ubt-exam-wrapper",style:ei,onContextMenu:e=>e.preventDefault(),children:[o.jsx("style",{dangerouslySetInnerHTML:{__html:`
        .ubt-exam-wrapper {
          width: 100vw;
          min-height: 100dvh;
          height: 100vh;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          padding: 12px;
          overflow: hidden;
          position: relative;
        }
        .ubt-exam-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 1050px;
          width: 100%;
          height: 100%;
          margin: auto;
          justify-content: center;
          min-height: 0;
        }
        .ubt-exam-card {
          background-color: rgba(255, 255, 255, 0.95);
          border: 1px solid #cbd5e1;
          border-top: none;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 550px;
          min-height: 550px;
        }
        .ubt-exam-columns {
          display: flex;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }
        .ubt-exam-left {
          flex: 1.2;
          padding: 20px 25px;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          height: 100%;
        }
        .ubt-exam-right {
          flex: 1;
          padding: 20px 25px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 10px;
          overflow-y: auto;
          height: 100%;
        }
        .ubt-exam-header-bar {
          display: flex;
          background-color: #0284c7;
          color: white;
          padding: 12px 20px;
          border-radius: 8px 8px 0 0;
          justify-content: space-between;
          font-weight: bold;
          font-size: 15px;
          gap: 8px;
        }
        .ubt-exam-nav-bar {
          display: flex;
          padding: 12px 25px;
          background-color: #f8fafc;
          border-top: 1px solid #cbd5e1;
          border-radius: 0 0 8px 8px;
          justify-content: space-between;
          gap: 8px;
          flex-shrink: 0;
        }
        .ubt-overview-box {
          background-color: rgba(255, 255, 255, 0.95);
          border: 1px solid #cbd5e1;
          border-top: none;
          padding: 25px 30px;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          overflow-y: auto;
          max-height: 80vh;
        }
        .ubt-overview-flex {
          display: flex;
          justify-content: space-between;
          gap: 25px;
        }

        /* LANDSCAPE OPTIMIZED EXAM STYLING FOR ALL MOBILE & TABLET DEVICES */
        @media (orientation: landscape) and (max-height: 600px) {
          .ubt-exam-wrapper {
            padding: 4px 8px !important;
            height: 100vh !important;
            height: 100dvh !important;
            overflow: hidden !important;
          }
          .ubt-exam-main {
            height: 100% !important;
            max-width: 100% !important;
            justify-content: center !important;
          }
          .ubt-exam-card {
            height: calc(100dvh - 8px) !important;
            min-height: 0 !important;
            max-height: calc(100dvh - 8px) !important;
          }
          .ubt-exam-columns {
            flex-direction: row !important;
            flex: 1 !important;
            overflow: hidden !important;
            min-height: 0 !important;
          }
          .ubt-exam-left {
            flex: 1.25 !important;
            padding: 8px 14px !important;
            border-right: 1.5px solid #e2e8f0 !important;
            border-bottom: none !important;
            max-height: none !important;
            overflow-y: auto !important;
            height: 100% !important;
          }
          .ubt-exam-left p {
            font-size: 15.5px !important;
            margin-bottom: 6px !important;
            line-height: 1.35 !important;
          }
          .ubt-exam-right {
            flex: 1 !important;
            padding: 8px 14px !important;
            overflow-y: auto !important;
            height: 100% !important;
            max-height: none !important;
            gap: 6px !important;
          }
          .ubt-exam-header-bar {
            padding: 6px 14px !important;
            font-size: 12.5px !important;
            border-radius: 6px 6px 0 0 !important;
          }
          .ubt-exam-nav-bar {
            padding: 6px 14px !important;
            border-radius: 0 0 6px 6px !important;
          }
          .ubt-exam-nav-bar button {
            padding: 6px 14px !important;
            font-size: 12px !important;
          }
          .ubt-overview-box {
            padding: 10px 14px !important;
            max-height: calc(100dvh - 45px) !important;
          }
          .ubt-overview-flex {
            flex-direction: row !important;
            gap: 12px !important;
          }
          .ubt-overview-flex button {
            padding: 6px 0 !important;
            font-size: 11.5px !important;
          }
        }

        /* FALLBACK FOR PORTRAIT MOBILE BEFORE ROTATION */
        @media (orientation: portrait) and (max-width: 768px) {
          .ubt-exam-wrapper {
            padding: 6px !important;
            height: 100dvh !important;
            overflow-y: auto !important;
          }
          .ubt-exam-main {
            height: 100% !important;
            justify-content: flex-start !important;
          }
          .ubt-exam-header-bar {
            padding: 10px 12px !important;
            font-size: 12.5px !important;
            flex-wrap: wrap !important;
          }
          .ubt-exam-card {
            height: auto !important;
            min-height: 0 !important;
            flex: 1 !important;
            max-height: calc(100dvh - 75px) !important;
          }
          .ubt-exam-columns {
            flex-direction: column !important;
            overflow-y: auto !important;
            flex: 1 !important;
          }
          .ubt-exam-left {
            flex: none !important;
            max-height: 42vh !important;
            border-right: none !important;
            border-bottom: 1.5px solid #cbd5e1 !important;
            padding: 12px 14px !important;
            height: auto !important;
          }
          .ubt-exam-left p {
            font-size: 17px !important;
          }
          .ubt-exam-right {
            flex: 1 !important;
            max-height: 46vh !important;
            padding: 12px 14px !important;
            height: auto !important;
          }
          .ubt-exam-nav-bar {
            padding: 9px 12px !important;
            gap: 6px !important;
          }
          .ubt-exam-nav-bar button {
            padding: 8px 12px !important;
            font-size: 12px !important;
          }
          .ubt-overview-box {
            padding: 16px 14px !important;
            max-height: calc(100dvh - 75px) !important;
          }
          .ubt-overview-flex {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .ubt-overview-flex > div:first-child {
            border-right: none !important;
            border-bottom: 1.5px solid #e2e8f0 !important;
            padding-right: 0 !important;
            padding-bottom: 16px !important;
          }
          .ubt-overview-flex > div:last-child {
            padding-left: 0 !important;
          }
        }
      `}}),h&&o.jsx("div",{style:{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",backgroundColor:"rgba(0, 0, 0, 0.6)",display:"flex",justifyContent:"center",alignItems:"center",zIndex:99999999,padding:"16px",boxSizing:"border-box"},children:(0,o.jsxs)("div",{style:{backgroundColor:"white",padding:"24px 20px",borderRadius:"12px",maxWidth:"420px",width:"100%",boxShadow:"0 4px 20px rgba(0,0,0,0.3)",boxSizing:"border-box"},children:[o.jsx("h3",{style:{margin:"0 0 12px 0",color:"#1e293b",fontSize:"18px",fontWeight:"700"},children:"Confirm Submission"}),o.jsx("p",{style:{color:"#475569",fontSize:"14px",marginBottom:"20px",lineHeight:"1.4"},children:"Are you sure you want to submit and end the exam?"}),(0,o.jsxs)("div",{style:{display:"flex",justifyContent:"flex-end",gap:"10px"},children:[o.jsx("button",{type:"button",onClick:()=>f(!1),style:{backgroundColor:"transparent",color:"#0284c7",border:"none",fontWeight:"bold",fontSize:"13px",cursor:"pointer",padding:"8px 14px",borderRadius:"4px"},children:"CANCEL"}),o.jsx("button",{type:"button",onClick:en,style:{backgroundColor:"#0284c7",color:"white",border:"none",fontWeight:"bold",fontSize:"13px",cursor:"pointer",padding:"8px 18px",borderRadius:"4px"},children:"AGREE"})]})]})}),"overview"===c?(0,o.jsxs)("div",{className:"ubt-exam-main",style:{flex:1,display:"flex",flexDirection:"column",maxWidth:"850px",width:"100%",height:"100%",margin:"auto",justifyContent:"center"},children:[(0,o.jsxs)("div",{className:"ubt-exam-header-bar",style:{display:"flex",backgroundColor:"#0284c7",color:"white",padding:"14px 20px",borderRadius:"8px 8px 0 0",justifyContent:"space-between",fontWeight:"bold",fontSize:"15px"},children:[o.jsx("span",{children:"Remaining Questions: 40"}),o.jsx("span",{children:C}),(0,o.jsxs)("span",{children:["Time Remaining: ",Y(v)]})]}),(0,o.jsxs)("div",{className:"ubt-overview-box",style:{backgroundColor:"rgba(255, 255, 255, 0.95)",border:"1px solid #cbd5e1",borderTop:"none",padding:"25px 30px",borderRadius:"0 0 8px 8px",boxShadow:"0 4px 15px rgba(0,0,0,0.06)"},children:[(0,o.jsxs)("div",{className:"ubt-overview-flex",style:{display:"flex",justifyContent:"space-between",gap:"25px"},children:[(0,o.jsxs)("div",{style:{flex:1,borderRight:"2px solid #e2e8f0",paddingRight:"15px"},children:[o.jsx("h4",{style:{textAlign:"center",color:"#0284c7",margin:"0 0 15px 0",fontSize:"15px"},children:"Reading Questions (1 - 20)"}),o.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"10px"},children:m.slice(0,20).map((e,t)=>o.jsx("button",{type:"button",onClick:()=>{y(t),u("single")},style:{padding:"12px 0",backgroundColor:void 0!==j[e.id]?"#dcfce7":"white",border:"1px solid #0284c7",borderRadius:"5px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",color:"#1e293b",transition:"0.15s"},children:t+1},e.id))})]}),(0,o.jsxs)("div",{style:{flex:1,paddingLeft:"15px"},children:[o.jsx("h4",{style:{textAlign:"center",color:"#0284c7",margin:"0 0 15px 0",fontSize:"15px"},children:"Listening Questions (21 - 40)"}),o.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"10px"},children:m.slice(20,40).map((e,t)=>{let n=t+20;return o.jsx("button",{type:"button",onClick:()=>{y(n),u("single")},style:{padding:"12px 0",backgroundColor:void 0!==j[e.id]?"#dcfce7":"white",border:"1px solid #0284c7",borderRadius:"5px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",color:"#1e293b",transition:"0.15s"},children:n+1},e.id)})})]})]}),o.jsx("div",{style:{marginTop:"25px",textAlign:"right"},children:o.jsx("button",{type:"button",onClick:()=>f(!0),style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"12px 24px",fontSize:"15px",fontWeight:"bold",borderRadius:"5px",cursor:"pointer"},children:"SUBMIT AND FINISH EXAM"})})]})]}):o.jsx("div",{className:"ubt-exam-main",style:{flex:1,display:"flex",flexDirection:"column",maxWidth:"1050px",width:"100%",height:"100%",margin:"auto",justifyContent:"center"},children:(()=>{let e=m[b];return(0,o.jsxs)("div",{style:{display:"flex",flexDirection:"column",height:"100%",minHeight:0},children:[(0,o.jsxs)("div",{className:"ubt-exam-header-bar",style:{display:"flex",backgroundColor:"#0284c7",color:"white",padding:"12px 20px",borderRadius:"8px 8px 0 0",justifyContent:"space-between",fontWeight:"bold",fontSize:"15px"},children:[o.jsx("span",{children:"Remaining Questions: 40"}),o.jsx("span",{children:C}),(0,o.jsxs)("span",{children:["Time Remaining: ",Y(v)]})]}),(0,o.jsxs)("div",{className:"ubt-exam-card",style:{backgroundColor:"rgba(255, 255, 255, 0.95)",border:"1px solid #cbd5e1",borderTop:"none",borderRadius:"0 0 8px 8px",boxShadow:"0 4px 15px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",justifyContent:"space-between",height:"550px",minHeight:"550px"},children:[(0,o.jsxs)("div",{className:"ubt-exam-columns",style:{display:"flex",flex:1,overflow:"hidden"},children:[(0,o.jsxs)("div",{className:"ubt-exam-left",style:{flex:1.2,padding:"20px 25px",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",overflowY:"auto",height:"100%"},children:[o.jsx("p",{style:{color:"#1e293b",fontSize:"20px",fontWeight:"bold",margin:"0 0 10px 0"},children:e.mainHeading||(b<20?"[ 1 - 20 ] 다음을 읽고 알맞은 것을 고르십시오.":"[ 21 - 40 ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.")}),e.questionHeading&&o.jsx("p",{style:{color:"#334155",fontSize:"20px",fontWeight:"bold",margin:"0 0 10px 0"},children:e.questionHeading}),e.description&&o.jsx("div",{style:{border:"1px solid #94a3b8",borderRadius:"6px",padding:"12px 15px",backgroundColor:"white",color:"#1e293b",fontSize:"20px",fontWeight:"bold",lineHeight:"1.5",whiteSpace:"pre-wrap",marginBottom:"12px"},children:e.description}),e.image&&o.jsx("div",{style:{margin:"auto",border:"1px solid #cbd5e1",padding:"10px",borderRadius:"6px",backgroundColor:"white",textAlign:"center"},children:o.jsx("img",{src:e.image,alt:"Question Visual",style:{display:"block",maxHeight:"250px",maxWidth:"100%",width:"auto",height:"auto",objectFit:"contain",margin:"0 auto",pointerEvents:"none",imageRendering:"high-quality",WebkitImageRendering:"-webkit-optimize-contrast"},draggable:"false"})}),e.audio&&o.jsx("div",{style:{marginTop:"12px",padding:"10px",backgroundColor:"#f8fafc",borderRadius:"6px",border:"1px solid #cbd5e1",textAlign:"center"},children:o.jsx("audio",{ref:D,controls:!0,controlsList:"nodownload noremoteplayback noplaybackrate",onContextMenu:e=>e.preventDefault(),onPlay:X,onEnded:Z,src:e.audio,style:{width:"100%",height:"32px",pointerEvents:_||U?"none":"auto",opacity:_?.5:1,filter:_?"grayscale(80%)":"none"}})})]}),o.jsx("div",{className:"ubt-exam-right",style:{flex:1,padding:"20px 25px",display:"flex",flexDirection:"column",justifyContent:"flex-start",gap:"10px",overflowY:"auto",height:"100%"},children:(()=>{let t=e.options||[],n=t.some(e=>!!("object"==typeof e&&null!==e&&e.image));return!n&&t.every(e=>{let t="object"==typeof e&&null!==e?(e.text||"").trim():(e||"").toString().trim();return!t||["①","②","③","④","1","2","3","4"].includes(t)})?(0,o.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"16px",justifyContent:"center",height:"100%",padding:"10px"},children:[o.jsx("p",{style:{color:"#475569",fontSize:"16px",margin:"0 0 10px 0",fontWeight:"600",textAlign:"center"},children:"\uD83C\uDFA7 다음을 듣고 알맞은 번호를 고르십시오. (Blind Listening)"}),o.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"},children:t.map((t,n)=>{let i=j[e.id]===n;return(0,o.jsxs)("button",{type:"button",onClick:()=>V(n),style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 15px",borderRadius:"12px",border:i?"3px solid #0284c7":"1.5px solid #cbd5e1",backgroundColor:i?"#e0f2fe":"white",cursor:"pointer",boxShadow:i?"0 6px 16px rgba(2, 132, 199, 0.25)":"0 2px 6px rgba(0,0,0,0.04)",transition:"all 0.15s ease"},children:[o.jsx("span",{style:{fontSize:"40px",fontWeight:"bold",color:i?"#0284c7":"#1e293b",lineHeight:1},children:["①","②","③","④"][n]}),(0,o.jsxs)("span",{style:{fontSize:"14px",color:i?"#0369a1":"#64748b",marginTop:"8px",fontWeight:"600"},children:["선택 ",n+1]})]},n)})})]}):n?o.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",width:"100%",padding:"5px 0"},children:t.map((t,n)=>{let i=j[e.id]===n,r="object"==typeof t&&null!==t?t.text:t,a="object"==typeof t&&null!==t?t.image:null;return(0,o.jsxs)("div",{onClick:()=>V(n),style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px",borderRadius:"8px",border:i?"2.5px solid #0284c7":"1.5px solid #cbd5e1",backgroundColor:i?"#eff6ff":"white",cursor:"pointer",boxShadow:i?"0 4px 10px rgba(2, 132, 199, 0.2)":"0 1px 3px rgba(0,0,0,0.05)",position:"relative"},children:[o.jsx("div",{style:{alignSelf:"flex-start",width:"28px",height:"28px",borderRadius:"50%",border:"2px solid #0284c7",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"15px",backgroundColor:i?"#0284c7":"white",color:i?"white":"#0284c7",marginBottom:"6px"},children:n+1}),a&&o.jsx("img",{src:a,alt:`Choice ${n+1}`,style:{maxHeight:"110px",maxWidth:"100%",width:"auto",height:"auto",objectFit:"contain",borderRadius:"4px",pointerEvents:"none"},draggable:"false"}),r&&!["①","②","③","④","1","2","3","4"].includes(r.trim())&&o.jsx("span",{style:{fontSize:"14px",fontWeight:"600",color:"#1e293b",marginTop:"6px",textAlign:"center"},children:r})]},n)})}):t.map((t,n)=>{let i=j[e.id]===n,r="object"==typeof t&&null!==t?t.text:t,a="object"==typeof t&&null!==t?t.image:null,s="object"==typeof t&&null!==t?t.audio:e.optionAudios?.[n]||null,l=M[n];return(0,o.jsxs)("div",{onClick:()=>V(n),style:{display:"flex",flexDirection:"column",padding:"10px 12px",borderBottom:"1px solid #e2e8f0",cursor:"pointer",backgroundColor:i?"#eff6ff":"transparent"},children:[(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",width:"100%"},children:[o.jsx("div",{style:{width:"32px",height:"32px",borderRadius:"50%",border:"2px solid #0284c7",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"16px",marginRight:"15px",backgroundColor:i?"#0284c7":"white",color:i?"white":"#0284c7",flexShrink:0},children:n+1}),o.jsx("span",{style:{fontSize:"20px",fontWeight:"normal",color:"#1e293b",flex:1},dangerouslySetInnerHTML:{__html:r}})]}),a&&o.jsx("div",{style:{marginTop:"6px",paddingLeft:"47px"},children:o.jsx("img",{src:a,alt:`Option ${n+1}`,style:{maxHeight:"80px",maxWidth:"100%",width:"auto",height:"auto",borderRadius:"4px",border:"1px solid #cbd5e1"}})}),s&&o.jsx("div",{style:{marginTop:"6px",paddingLeft:"47px",width:"100%"},onClick:e=>e.stopPropagation(),children:o.jsx("audio",{ref:e=>O.current[n]=e,controls:!0,controlsList:"nodownload noremoteplayback noplaybackrate",onContextMenu:e=>e.preventDefault(),onPlay:()=>ee(n),onEnded:()=>et(n),src:s,style:{width:"100%",height:"30px",pointerEvents:l||U?"none":"auto",opacity:l?.5:1,filter:l?"grayscale(80%)":"none"}})})]},n)})})()})]}),(0,o.jsxs)("div",{className:"ubt-exam-nav-bar",style:{display:"flex",padding:"12px 25px",backgroundColor:"#f8fafc",borderTop:"1px solid #cbd5e1",borderRadius:"0 0 8px 8px",justifyContent:"space-between"},children:[o.jsx("button",{type:"button",onClick:()=>{q.current&&clearTimeout(q.current),Object.values(B.current).forEach(e=>clearTimeout(e)),D.current&&D.current.pause(),Object.values(O.current).forEach(e=>e&&e.pause()),y(e=>Math.max(0,e-1))},disabled:0===b,style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"9px 18px",borderRadius:"4px",fontWeight:"bold",cursor:0===b?"not-allowed":"pointer",fontSize:"13px"},children:"❮ PREVIOUS"}),o.jsx("button",{type:"button",onClick:()=>{q.current&&clearTimeout(q.current),Object.values(B.current).forEach(e=>clearTimeout(e)),D.current&&D.current.pause(),Object.values(O.current).forEach(e=>e&&e.pause()),u("overview")},style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"9px 18px",borderRadius:"4px",fontWeight:"bold",cursor:"pointer",fontSize:"13px"},children:"TOTAL QUESTIONS"}),o.jsx("button",{type:"button",onClick:()=>{q.current&&clearTimeout(q.current),Object.values(B.current).forEach(e=>clearTimeout(e)),D.current&&D.current.pause(),Object.values(O.current).forEach(e=>e&&e.pause()),b<m.length-1?y(e=>e+1):f(!0)},style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"9px 18px",borderRadius:"4px",fontWeight:"bold",cursor:"pointer",fontSize:"13px"},children:b===m.length-1?"SUBMIT ❯":"NEXT ❯"})]})]})]})})()})]})}},2766:(e,t,n)=>{"use strict";n.d(t,{default:()=>r});var o=n(326),i=n(7577);function r({allowedRoles:e=[],children:t}){let[n,r]=(0,i.useState)(!0),[a,s]=(0,i.useState)(null);return!n&&a?(0,o.jsxs)("div",{style:{minHeight:"100vh",width:"100vw",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backgroundColor:"#0f172a",color:"#f8fafc",fontFamily:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',padding:"20px"},children:[o.jsx("p",{style:{fontSize:"15px",color:"#f87171",marginBottom:"16px"},children:a}),o.jsx("button",{onClick:()=>{window.location.href="/"},style:{background:"#3b82f6",color:"#fff",border:"none",borderRadius:"8px",padding:"10px 20px",cursor:"pointer"},children:"Return to Login"})]}):t}},9180:(e,t,n)=>{"use strict";function o(){return null}n.d(t,{default:()=>o}),n(7577)},5009:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>s,metadata:()=>a,viewport:()=>r});var o=n(9510);n(3346),n(3093);let i=(0,n(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/components/PwaDesktopInstaller.jsx#default`),r={themeColor:"#003b73",width:"device-width",initialScale:1,maximumScale:5,viewportFit:"cover"},a={title:"ExamJK — Exam Japanese and Korean",description:"ExamJK: Japanese and Korean CBT & UBT Examination and Learning System",manifest:"/manifest.json",icons:{icon:"/icon-192.png",shortcut:"/icon-192.png",apple:"/apple-touch-icon.png"},appleWebApp:{capable:!0,statusBarStyle:"black-translucent",title:"ExamJK"}};function s({children:e}){return(0,o.jsxs)("html",{lang:"en",children:[(0,o.jsxs)("head",{children:[o.jsx("meta",{charSet:"utf-8"}),o.jsx("meta",{name:"application-name",content:"ExamJK"}),o.jsx("meta",{name:"apple-mobile-web-app-capable",content:"yes"}),o.jsx("meta",{name:"apple-mobile-web-app-status-bar-style",content:"black-translucent"}),o.jsx("meta",{name:"apple-mobile-web-app-title",content:"ExamJK"}),o.jsx("meta",{name:"mobile-web-app-capable",content:"yes"}),o.jsx("meta",{name:"theme-color",content:"#003b73"}),o.jsx("link",{rel:"apple-touch-icon",href:"/apple-touch-icon.png"}),o.jsx("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),o.jsx("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"}),o.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@400;500;600;700;800;900&family=Noto+Sans+JP:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap",rel:"stylesheet"})]}),(0,o.jsxs)("body",{children:[e,o.jsx(i,{})]})]})}},1837:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>i});var o=n(9510);function i(){return(0,o.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",textAlign:"center",padding:"20px"},children:[o.jsx("h2",{style:{fontSize:"24px",fontWeight:"bold",color:"#1e3a8a",marginBottom:"10px"},children:"404 - Page Not Found"}),o.jsx("p",{style:{color:"#64748b",marginBottom:"20px"},children:"The page you are looking for does not exist."}),o.jsx("a",{href:"/",style:{backgroundColor:"#2563eb",color:"white",padding:"10px 20px",borderRadius:"6px",textDecoration:"none",fontWeight:"bold"},children:"Return Home"})]})}},3277:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>o});let o=(0,n(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx#default`)},8440:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>p,dynamic:()=>s,metadata:()=>l});var o=n(9510),i=n(8408),r=n(8585),a=n(2858);let s="force-dynamic",l={title:"Student Portal — ExamJK",description:"Student Exam Center and Dashboard"},d=["student","admin","institute"];async function p({children:e}){let t=await (0,i.xn)();return t&&d.includes(t.role)||(0,r.redirect)("/?error=unauthorized"),o.jsx(a.Z,{allowedRoles:d,children:e})}},2858:(e,t,n)=>{"use strict";n.d(t,{Z:()=>o});let o=(0,n(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/components/ClientAuthGuard.jsx#default`)},3346:()=>{},3093:()=>{},8408:(e,t,n)=>{"use strict";n.d(t,{Gv:()=>p,WX:()=>c,c_:()=>d,fT:()=>x,xn:()=>u});var o=n(2023),i=n(6091),r=n(6176),a=n(1615);let s=(process.env.JWT_SECRET||"sigma-ubt-production-secret-key-2026").trim();process.env.JWT_SECRET&&"sigma-ubt-production-secret-key-2026"!==process.env.JWT_SECRET||console.warn("[SECURITY CRITICAL] JWT_SECRET is not configured with a secure random key. Generate one with `openssl rand -hex 32` and set it in your production .env file.");let l=new TextEncoder().encode(s);async function d(e){return await o.hash(e,10)}async function p(e,t){return await o.compare(e,t)}async function x(e){return await new i.N(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(l)}async function c(e){try{let{payload:t}=await (0,r._)(e,l);return t}catch(e){return null}}async function u(e){try{let t=null;if(e){let n=e.cookies.get("sigma_session")?.value;if(n)t=n;else{let n=e.headers.get("authorization");n&&n.startsWith("Bearer ")&&(t=n.split(" ")[1])}}else{let e=(0,a.cookies)();t=e.get("sigma_session")?.value}if(!t)return null;return await c(t)}catch(e){return null}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),o=t.X(0,[8948,3881,4669,7512],()=>n(7631));module.exports=o})();