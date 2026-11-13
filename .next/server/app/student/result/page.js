(()=>{var e={};e.id=2596,e.ids=[2596],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4770:e=>{"use strict";e.exports=require("crypto")},2254:e=>{"use strict";e.exports=require("node:buffer")},6005:e=>{"use strict";e.exports=require("node:crypto")},7261:e=>{"use strict";e.exports=require("node:util")},290:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>s.a,__next_app__:()=>c,originalPathname:()=>x,pages:()=>p,routeModule:()=>u,tree:()=>d}),r(5774),r(8440),r(5009),r(1837);var n=r(3191),i=r(8716),o=r(7922),s=r.n(o),a=r(5231),l={};for(let e in a)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>a[e]);r.d(t,l);let d=["",{children:["student",{children:["result",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,5774)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/result/page.jsx"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,8440)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/layout.jsx"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,5009)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/layout.jsx"],"not-found":[()=>Promise.resolve().then(r.bind(r,1837)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/not-found.jsx"]}],p=["/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/result/page.jsx"],x="/student/result/page",c={require:r,loadChunk:()=>Promise.resolve()},u=new n.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/student/result/page",pathname:"/student/result",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},4108:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,2994,23)),Promise.resolve().then(r.t.bind(r,6114,23)),Promise.resolve().then(r.t.bind(r,9727,23)),Promise.resolve().then(r.t.bind(r,9671,23)),Promise.resolve().then(r.t.bind(r,1868,23)),Promise.resolve().then(r.t.bind(r,4759,23))},4696:(e,t,r)=>{Promise.resolve().then(r.bind(r,9180))},329:(e,t,r)=>{Promise.resolve().then(r.bind(r,5773))},5359:(e,t,r)=>{Promise.resolve().then(r.bind(r,2766))},5303:()=>{},5773:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>a});var n=r(326),i=r(7577),o=r.n(i);r(434);var s=r(5047);"undefined"==typeof globalThis||globalThis.localStorage||(globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{},clear:()=>{},key:()=>null,length:0});let a=()=>{let e=(0,s.useRouter)(),[t,r]=(0,i.useState)(!1),[a,l]=(0,i.useState)("Student"),[d,p]=(0,i.useState)({examName:"EPS-TOPIK Exam",score:0,total:40,attempted:0,questions:[],selectedAnswers:{}}),[x,c]=(0,i.useState)(!1),[u,m]=(0,i.useState)(null);o().useEffect(()=>{try{let e=localStorage.getItem("currentUser")||"Student";l(e);let t=localStorage.getItem("lastExamResult");t&&p(JSON.parse(t))}catch(e){}r(!0)},[]),o().useEffect(()=>{let e=async()=>{};return e(),window.addEventListener("online",e),()=>window.removeEventListener("online",e)},[]);let{examName:h,questions:g=[],selectedAnswers:f={}}=d,b=[...g.filter(e=>e.type&&"reading"===e.type.toLowerCase()||void 0!==e.qIndex&&e.qIndex<=20).slice(0,20),...g.filter(e=>e.type&&"listening"===e.type.toLowerCase()||void 0!==e.qIndex&&e.qIndex>20).slice(0,20)];0===b.length&&g.length>0&&(b=g.slice(0,40));let y=b.length>0?b.length:40,j=0,w=0,v=(e,t)=>{if(e){if(void 0!==f[e.id])return f[e.id];if(void 0!==e.qIndex&&void 0!==f[e.qIndex])return f[e.qIndex];if(void 0!==f[t])return f[t]}};b.forEach((e,t)=>{let r=v(e,t);null!=r&&""!==r&&(j+=1,void 0!==e.answer&&Number(r)===Number(e.answer)&&(w+=1))});let k=y>0?(w/y*100).toFixed(2):"0.00",S=y-j;if(!t)return null;if(x){if(null!==u){let e=b[u],t=v(e,u),r=null!=t&&""!==t&&void 0!==e.answer&&Number(t)===Number(e.answer);return(0,n.jsxs)("div",{style:{maxWidth:"1050px",margin:"40px auto",padding:"20px",fontFamily:"Arial, sans-serif"},children:[(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"},children:[(0,n.jsxs)("h2",{style:{color:"#1e293b",margin:0},children:["Question ",u+1," Review (",e.type,")"]}),n.jsx("button",{onClick:()=>m(null),style:{backgroundColor:"#0284c7",color:"white",border:"none",padding:"10px 20px",borderRadius:"4px",fontWeight:"bold",cursor:"pointer"},children:"Go Back"})]}),(0,n.jsxs)("div",{style:{backgroundColor:"white",border:"1px solid #cbd5e1",borderRadius:"8px",padding:"30px",boxShadow:"0 2px 6px rgba(0,0,0,0.05)"},children:[n.jsx("p",{style:{color:"#1e293b",fontSize:"15px",fontWeight:"bold",margin:"0 0 10px 0"},children:e.mainHeading||(u<20?`[ ${u+1} ] 다음을 읽고 알맞은 것을 고르십시오.`:`[ ${u+1} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`)}),e.questionHeading&&n.jsx("p",{style:{color:"#334155",fontSize:"14px",fontWeight:"bold",margin:"0 0 10px 0"},children:e.questionHeading}),(0,n.jsxs)("p",{style:{color:"#1e293b",fontSize:"18px",fontWeight:"bold",margin:"0 0 15px 0"},children:[u+1,". ",e.description||""]}),e.image&&n.jsx("div",{style:{margin:"15px 0",textAlign:"center"},children:n.jsx("img",{src:e.image,alt:"Question Visual",style:{maxHeight:"180px",maxWidth:"240px",objectFit:"contain",borderRadius:"6px",border:"1px solid #cbd5e1"}})}),e.audio&&n.jsx("div",{style:{margin:"15px 0"},children:n.jsx("audio",{controls:!0,controlsList:"nodownload",onContextMenu:e=>e.preventDefault(),src:e.audio,style:{width:"100%",height:"35px"}})}),n.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px",marginTop:"25px"},children:Array.isArray(e.options)&&e.options.map((i,o)=>{let s="object"==typeof i&&null!==i?i.text:i,a="object"==typeof i&&null!==i?i.image:null,l="object"==typeof i&&null!==i?i.audio:null,d="#f8fafc",p="#1e293b",x="1px solid #cbd5e1",c="white",u="#0284c7",m="2px solid #0284c7";return Number(o)===Number(e.answer)&&(d="#f0fdf4",p="#166534",x="1px solid #16a34a",c="#16a34a",u="white",m="2px solid #16a34a"),Number(o)!==Number(t)||r||(d="#fef2f2",p="#991b1b",x="1px solid #ef4444",c="#ef4444",u="white",m="2px solid #ef4444"),(0,n.jsxs)("div",{style:{display:"flex",flexDirection:"column",padding:"12px 15px",backgroundColor:d,color:p,border:x,borderRadius:"6px"},children:[(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",width:"100%"},children:[n.jsx("div",{style:{width:"30px",height:"30px",borderRadius:"50%",backgroundColor:c,color:u,border:m,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"14px",marginRight:"15px",flexShrink:0},children:o+1}),n.jsx("span",{style:{fontSize:"16px",flex:1},children:s}),Number(o)===Number(e.answer)&&(0,n.jsxs)("span",{style:{fontSize:"12px",fontWeight:"700",color:"#16a34a",marginLeft:"10px",display:"inline-flex",alignItems:"center",gap:"4px"},children:[n.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"#16a34a",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round",children:n.jsx("polyline",{points:"20 6 9 17 4 12"})}),"Correct Answer"]}),Number(o)===Number(t)&&Number(o)!==Number(e.answer)&&(0,n.jsxs)("span",{style:{fontSize:"12px",fontWeight:"700",color:"#ef4444",marginLeft:"10px",display:"inline-flex",alignItems:"center",gap:"4px"},children:[(0,n.jsxs)("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"#ef4444",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round",children:[n.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),n.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]}),"Your Answer"]})]}),a&&n.jsx("div",{style:{marginTop:"8px",paddingLeft:"45px"},children:n.jsx("img",{src:a,alt:`Opt ${o+1}`,style:{maxHeight:"50px",borderRadius:"4px"}})}),l&&n.jsx("div",{style:{marginTop:"8px",paddingLeft:"45px"},children:n.jsx("audio",{controls:!0,controlsList:"nodownload",onContextMenu:e=>e.preventDefault(),src:l,style:{width:"100%",height:"25px"}})})]},o)})}),(0,n.jsxs)("div",{style:{marginTop:"25px",display:"flex",justifyContent:"space-between"},children:[n.jsx("button",{onClick:()=>m(e=>Math.max(0,e-1)),disabled:0===u,style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"10px 20px",borderRadius:"4px",fontWeight:"bold",cursor:0===u?"not-allowed":"pointer"},children:"❮ Previous Question"}),n.jsx("button",{onClick:()=>m(e=>Math.min(b.length-1,e+1)),disabled:u===b.length-1,style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"10px 20px",borderRadius:"4px",fontWeight:"bold",cursor:u===b.length-1?"not-allowed":"pointer"},children:"Next Question ❯"})]})]})]})}return(0,n.jsxs)("div",{style:{maxWidth:"1000px",margin:"40px auto",padding:"20px",fontFamily:"Arial, sans-serif"},children:[n.jsx("div",{style:{marginBottom:"15px"},children:n.jsx("button",{onClick:()=>c(!1),style:{backgroundColor:"#0284c7",color:"white",border:"none",padding:"8px 18px",borderRadius:"4px",fontWeight:"bold",cursor:"pointer"},children:"Back"})}),(0,n.jsxs)("div",{style:{backgroundColor:"white",border:"1px solid #cbd5e1",borderRadius:"8px",overflow:"hidden",boxShadow:"0 2px 6px rgba(0,0,0,0.05)"},children:[(0,n.jsxs)("div",{style:{display:"flex",backgroundColor:"#0284c7",color:"white",padding:"15px 20px",justifyContent:"space-between",fontWeight:"bold",fontSize:"15px",flexWrap:"wrap",gap:"10px"},children:[(0,n.jsxs)("span",{children:["Total Questions: ",y]}),(0,n.jsxs)("span",{children:["Exam: ",h]}),(0,n.jsxs)("span",{children:["Solved: ",j]}),(0,n.jsxs)("span",{children:["UnSolved: ",S]})]}),n.jsx("div",{style:{padding:"25px"},children:(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",gap:"20px",flexWrap:"wrap"},children:[(0,n.jsxs)("div",{style:{flex:1,minWidth:"300px",borderRight:"2px solid #e2e8f0",paddingRight:"15px"},children:[n.jsx("h3",{style:{textAlign:"center",color:"#0284c7",marginBottom:"15px",fontSize:"16px"},children:"Reading Questions"}),n.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"8px"},children:b.slice(0,20).map((e,t)=>{let r=v(e,t),i=null!=r&&""!==r,o=i&&void 0!==e.answer&&Number(r)===Number(e.answer),s="white",a="#cbd5e1",l="#1e293b";return i&&(o?(s="#16a34a",a="#15803d"):(s="#ef4444",a="#dc2626"),l="white"),n.jsx("button",{onClick:()=>m(t),style:{padding:"12px 0",backgroundColor:s,border:`1px solid ${a}`,borderRadius:"4px",fontWeight:"bold",fontSize:"15px",cursor:"pointer",color:l},children:t+1},e.id||t)})})]}),(0,n.jsxs)("div",{style:{flex:1,minWidth:"300px",paddingLeft:"5px"},children:[n.jsx("h3",{style:{textAlign:"center",color:"#0284c7",marginBottom:"15px",fontSize:"16px"},children:"Listening Questions"}),n.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"8px"},children:b.slice(20,40).map((e,t)=>{let r=t+20,i=v(e,r),o=null!=i&&""!==i,s=o&&void 0!==e.answer&&Number(i)===Number(e.answer),a="white",l="#cbd5e1",d="#1e293b";return o&&(s?(a="#16a34a",l="#15803d"):(a="#ef4444",l="#dc2626"),d="white"),n.jsx("button",{onClick:()=>m(r),style:{padding:"12px 0",backgroundColor:a,border:`1px solid ${l}`,borderRadius:"4px",fontWeight:"bold",fontSize:"15px",cursor:"pointer",color:d},children:r+1},e.id||r)})})]})]})})]})]})}return(0,n.jsxs)("div",{style:{minHeight:"100vh",backgroundColor:"#f8fafc",fontFamily:"Arial, sans-serif",display:"flex",flexDirection:"column"},children:[n.jsx("style",{dangerouslySetInnerHTML:{__html:`
        .result-summary-top-bar {
          background-color: #0284c7;
          color: white;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .result-summary-wrap {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          box-sizing: border-box;
        }
        .result-summary-card {
          width: 100%;
          max-width: 500px;
          background-color: white;
          border-radius: 16px;
          padding: 26px 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
          max-height: 94vh;
          overflow-y: auto;
        }
        .result-summary-header {
          text-align: center;
          margin-bottom: 18px;
        }
        .result-summary-trophy {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: #fef3c7;
          border: 1px solid #fde68a;
          margin: 0 auto 10px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }
        .result-summary-title {
          color: #0f172a;
          font-size: 22px;
          margin: 0 0 8px 0;
          font-weight: 800;
        }
        .result-summary-badge {
          display: inline-block;
          background-color: #f1f5f9;
          padding: 6px 16px;
          border-radius: 20px;
          color: #475569;
          font-weight: 600;
          font-size: 13.5px;
        }
        .result-summary-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .result-summary-stats {
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          border: 1px solid #e2e8f0;
        }
        .result-summary-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* LANDSCAPE MODE: FIT ON SCREEN CLEANLY WITHOUT SCROLL OR OVERFLOW */
        @media (orientation: landscape) and (max-height: 650px) {
          .result-summary-top-bar {
            display: none !important;
          }
          .result-summary-wrap {
            padding: 6px 12px !important;
            height: 100vh !important;
            min-height: 100vh !important;
            overflow: hidden !important;
          }
          .result-summary-card {
            max-width: 650px !important;
            padding: 10px 16px !important;
            max-height: 96vh !important;
            border-radius: 12px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }
          .result-summary-header {
            margin-bottom: 6px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 10px !important;
            text-align: left !important;
          }
          .result-summary-trophy {
            width: 32px !important;
            height: 32px !important;
            font-size: 18px !important;
            margin: 0 !important;
            flex-shrink: 0 !important;
          }
          .result-summary-title {
            font-size: 15.5px !important;
            margin: 0 !important;
          }
          .result-summary-badge {
            font-size: 11.5px !important;
            padding: 2px 8px !important;
          }
          .result-summary-grid {
            flex-direction: row !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .result-summary-stats {
            flex: 1.25 !important;
            padding: 8px 12px !important;
            gap: 4px !important;
            margin-bottom: 0 !important;
          }
          .result-summary-stats > div {
            padding-bottom: 3px !important;
            max-width: 100% !important;
          }
          .result-summary-stats span {
            font-size: 12.5px !important;
          }
          .result-summary-actions {
            flex: 1 !important;
            flex-direction: column !important;
            justify-content: center !important;
            gap: 8px !important;
          }
          .result-summary-actions button {
            width: 100% !important;
            max-width: none !important;
            min-width: 0 !important;
            padding: 9px 12px !important;
            font-size: 13px !important;
          }
        }
      `}}),n.jsx("div",{className:"result-summary-top-bar",children:n.jsx("span",{children:"Exam Summary"})}),n.jsx("div",{className:"result-summary-wrap",children:(0,n.jsxs)("div",{className:"result-summary-card",children:[(0,n.jsxs)("div",{className:"result-summary-header",children:[n.jsx("div",{className:"result-summary-trophy",children:"\uD83C\uDFC6"}),(0,n.jsxs)("div",{children:[n.jsx("h2",{className:"result-summary-title",children:"Congratulations, Exam Ended!"}),(0,n.jsxs)("div",{className:"result-summary-badge",children:[n.jsx("span",{style:{color:"#0284c7"},children:"\uD83D\uDC64 Name:"})," ",a," \xa0 | \xa0 ",n.jsx("span",{style:{color:"#0284c7"},children:"Exam:"})," ",h]})]})]}),(0,n.jsxs)("div",{className:"result-summary-grid",children:[(0,n.jsxs)("div",{className:"result-summary-stats",children:[(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"280px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"6px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"14.5px",fontWeight:"600"},children:"Total Questions"}),n.jsx("span",{style:{color:"#0f172a",fontSize:"15px",fontWeight:"bold"},children:y})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"280px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"6px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"14.5px",fontWeight:"600"},children:"Total Attempted"}),n.jsx("span",{style:{color:"#0f172a",fontSize:"15px",fontWeight:"bold"},children:j})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"280px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"6px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"14.5px",fontWeight:"600"},children:"Total Correct"}),n.jsx("span",{style:{color:"#16a34a",fontSize:"17px",fontWeight:"900"},children:w})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"280px",paddingTop:"4px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"14.5px",fontWeight:"600"},children:"Your Percentage"}),(0,n.jsxs)("span",{style:{color:k>=40?"#0284c7":"#ef4444",fontSize:"17px",fontWeight:"900"},children:[k,"%"]})]})]}),(0,n.jsxs)("div",{className:"result-summary-actions",children:[n.jsx("button",{type:"button",onClick:()=>c(!0),style:{flex:1,minWidth:"160px",maxWidth:"220px",backgroundColor:"#0284c7",color:"white",border:"none",padding:"12px 20px",borderRadius:"8px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",transition:"transform 0.2s",boxShadow:"0 4px 6px rgba(2, 132, 199, 0.2)"},onMouseOver:e=>e.target.style.transform="translateY(-2px)",onMouseOut:e=>e.target.style.transform="translateY(0)",children:"VIEW RESULT"}),n.jsx("button",{type:"button",onClick:()=>e.push("/student"),style:{flex:1,minWidth:"160px",maxWidth:"220px",backgroundColor:"#f1f5f9",color:"#475569",border:"1px solid #cbd5e1",padding:"12px 20px",borderRadius:"8px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",transition:"all 0.2s"},onMouseOver:e=>{e.target.style.backgroundColor="#e2e8f0",e.target.style.transform="translateY(-2px)"},onMouseOut:e=>{e.target.style.backgroundColor="#f1f5f9",e.target.style.transform="translateY(0)"},children:"CLOSE"})]})]})]})})]})}},2766:(e,t,r)=>{"use strict";r.d(t,{default:()=>o});var n=r(326),i=r(7577);function o({allowedRoles:e=[],children:t}){let[r,o]=(0,i.useState)(!0),[s,a]=(0,i.useState)(null);return!r&&s?(0,n.jsxs)("div",{style:{minHeight:"100vh",width:"100vw",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backgroundColor:"#0f172a",color:"#f8fafc",fontFamily:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',padding:"20px"},children:[n.jsx("p",{style:{fontSize:"15px",color:"#f87171",marginBottom:"16px"},children:s}),n.jsx("button",{onClick:()=>{window.location.href="/"},style:{background:"#3b82f6",color:"#fff",border:"none",borderRadius:"8px",padding:"10px 20px",cursor:"pointer"},children:"Return to Login"})]}):t}},9180:(e,t,r)=>{"use strict";function n(){return null}r.d(t,{default:()=>n}),r(7577)},5009:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>a,metadata:()=>s,viewport:()=>o});var n=r(9510);r(3346),r(3093);let i=(0,r(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/components/PwaDesktopInstaller.jsx#default`),o={themeColor:"#003b73",width:"device-width",initialScale:1,maximumScale:5,viewportFit:"cover"},s={title:"ExamJK — Exam Japanese and Korean",description:"ExamJK: Japanese and Korean CBT & UBT Examination and Learning System",manifest:"/manifest.json",icons:{icon:"/icon-192.png",shortcut:"/icon-192.png",apple:"/apple-touch-icon.png"},appleWebApp:{capable:!0,statusBarStyle:"black-translucent",title:"ExamJK"}};function a({children:e}){return(0,n.jsxs)("html",{lang:"en",children:[(0,n.jsxs)("head",{children:[n.jsx("meta",{charSet:"utf-8"}),n.jsx("meta",{name:"application-name",content:"ExamJK"}),n.jsx("meta",{name:"apple-mobile-web-app-capable",content:"yes"}),n.jsx("meta",{name:"apple-mobile-web-app-status-bar-style",content:"black-translucent"}),n.jsx("meta",{name:"apple-mobile-web-app-title",content:"ExamJK"}),n.jsx("meta",{name:"mobile-web-app-capable",content:"yes"}),n.jsx("meta",{name:"theme-color",content:"#003b73"}),n.jsx("link",{rel:"apple-touch-icon",href:"/apple-touch-icon.png"}),n.jsx("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),n.jsx("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"}),n.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@400;500;600;700;800;900&family=Noto+Sans+JP:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap",rel:"stylesheet"})]}),(0,n.jsxs)("body",{children:[e,n.jsx(i,{})]})]})}},1837:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>i});var n=r(9510);function i(){return(0,n.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",textAlign:"center",padding:"20px"},children:[n.jsx("h2",{style:{fontSize:"24px",fontWeight:"bold",color:"#1e3a8a",marginBottom:"10px"},children:"404 - Page Not Found"}),n.jsx("p",{style:{color:"#64748b",marginBottom:"20px"},children:"The page you are looking for does not exist."}),n.jsx("a",{href:"/",style:{backgroundColor:"#2563eb",color:"white",padding:"10px 20px",borderRadius:"6px",textDecoration:"none",fontWeight:"bold"},children:"Return Home"})]})}},8440:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>p,dynamic:()=>a,metadata:()=>l});var n=r(9510),i=r(8408),o=r(8585),s=r(2858);let a="force-dynamic",l={title:"Student Portal — ExamJK",description:"Student Exam Center and Dashboard"},d=["student","admin","institute"];async function p({children:e}){let t=await (0,i.xn)();return t&&d.includes(t.role)||(0,o.redirect)("/?error=unauthorized"),n.jsx(s.Z,{allowedRoles:d,children:e})}},5774:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>n});let n=(0,r(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/result/page.jsx#default`)},2858:(e,t,r)=>{"use strict";r.d(t,{Z:()=>n});let n=(0,r(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/components/ClientAuthGuard.jsx#default`)},3346:()=>{},3093:()=>{},8408:(e,t,r)=>{"use strict";r.d(t,{Gv:()=>p,WX:()=>c,c_:()=>d,fT:()=>x,xn:()=>u});var n=r(2023),i=r(6091),o=r(6176),s=r(1615);let a=(process.env.JWT_SECRET||"sigma-ubt-production-secret-key-2026").trim();process.env.JWT_SECRET&&"sigma-ubt-production-secret-key-2026"!==process.env.JWT_SECRET||console.warn("[SECURITY CRITICAL] JWT_SECRET is not configured with a secure random key. Generate one with `openssl rand -hex 32` and set it in your production .env file.");let l=new TextEncoder().encode(a);async function d(e){return await n.hash(e,10)}async function p(e,t){return await n.compare(e,t)}async function x(e){return await new i.N(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(l)}async function c(e){try{let{payload:t}=await (0,o._)(e,l);return t}catch(e){return null}}async function u(e){try{let t=null;if(e){let r=e.cookies.get("sigma_session")?.value;if(r)t=r;else{let r=e.headers.get("authorization");r&&r.startsWith("Bearer ")&&(t=r.split(" ")[1])}}else{let e=(0,s.cookies)();t=e.get("sigma_session")?.value}if(!t)return null;return await c(t)}catch(e){return null}}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[8948,3881,4669,7512],()=>r(290));module.exports=n})();