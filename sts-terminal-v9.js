/* STS Operations Terminal 09. Preserves original site routing and audio.
   No CDN, no new WebGL contexts, no simulated authentication. */
(()=>{'use strict';
const portal=document.getElementById('portal'),nativeEnter=document.getElementById('enterBtn'),
      nativeSkip=document.getElementById('bootSkip'),nativeBoot=document.getElementById('boot'),
      app=document.getElementById('app');
if(!portal||!nativeEnter||!nativeSkip||!nativeBoot||!app){console.warn('STS terminal: original entry controls unavailable');return}
const STS=window.STS3D||{},reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('sts10-terminal');
// iOS WebKit may request an MP3 even with preload="none" when the audio
// element has a src. Keep only data-src until the user explicitly taps BGM.
const bgm=document.getElementById('bgm');
const bgmButton=document.getElementById('bgmBtn');
if(bgm&&bgmButton){
 const pending=bgm.getAttribute('data-src')||bgm.getAttribute('src');
 if(pending&&!bgm.hasAttribute('data-src')){
   bgm.setAttribute('data-src',pending);
   bgm.removeAttribute('src');
   bgm.load();
 }
 bgmButton.addEventListener('click',()=>{
   if(!bgm.getAttribute('src')){
     const audioPath=bgm.getAttribute('data-src');
     if(audioPath)bgm.setAttribute('src',audioPath);
   }
 },true);
}
const stationCount=STS.STATIONS?.length||79,linkCount=STS.ROUTES?.length||128,corridorCount=STS.PRESETS?.length||12;
let started=false,finished=false,destination='home',phase=-1,bootToken=0;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const metric=(name,value)=>'<div class="sts9-metric"><small>'+esc(name)+'</small><strong>'+esc(value)+'</strong></div>';
const command=(n,mode,title,sub)=>'<button type="button" class="sts9-action" data-sts9-destination="'+mode+'"><span class="sts9-action-code">'+n+'</span><span class="sts9-action-label">'+title+'<small>'+sub+'</small></span><span class="sts9-action-arrow" aria-hidden="true">↗</span></button>';
nativeEnter.classList.add('sts9-legacy-trigger');
portal.classList.add('sts9-portal');
portal.innerHTML=[
 '<div class="sts9-edge" aria-hidden="true"></div>',
 '<header class="sts9-head"><div class="sts9-head-left"><span class="sts9-monogram">S<i>·</i>T<i>·</i>S</span><span class="sts9-header-label">SOLAR TRAFFIC SYSTEM / PUBLIC ARCHIVE</span></div>',
 '<div class="sts9-head-right"><span class="sts9-lit">PUBLIC ACCESS</span><span>2120 / SOL</span></div></header>',
 '<div class="sts9-stage"><div class="sts9-intro">',
 '<div class="sts9-overline">NETWORK OPERATIONS INDEX / REV. 2120</div>',
 '<h1 class="sts9-title">Solar Traffic<span>System / Archive.</span></h1>',
 '<p class="sts9-description">2120년 제1차 건설사업 완료 기준. 태양계 여객·화물 항로, 송전 시설, 정거장 및 선박 운용 기록.</p>',
 '<div class="sts9-metrics">'+metric('FACILITIES',stationCount)+metric('TRAFFIC LINKS',linkCount)+metric('CORRIDORS',corridorCount)+metric('EPOCH','2120')+'</div>',
 '<div class="sts9-command-heading"><span>AVAILABLE COMMANDS</span><span>READ ONLY / 03 ENTRIES</span></div>',
 '<nav class="sts9-actions" aria-label="공개 기록 접근 경로">',
 command('01','home','기록 열람','OPEN ARCHIVE DIRECTORY'),
 command('02','atlas','항행 지도','OPEN NAVIGATION ATLAS'),
 command('03','about','체계 개요','READ SYSTEM REFERENCE'),
 '</nav>',
 '<a class="sts9-direct-link" href="./?direct=atlas&v=terminal-9.1">DIRECT ACCESS / SKIP STARTUP ↗</a>',
 '<p class="sts9-portal-note">시설·항로 기록은 축약된 개략 자료입니다. 지도는 실제 천체력과 비행 궤적을 계산하지 않습니다.</p>',
 '</div><aside class="sts9-scope" aria-label="항행망 도식">',
 '<div class="sts9-scope-top"><span>SCHEMATIC / TRAFFIC TOPOLOGY</span><span>FIG 001 — SOL</span></div>',
 '<div class="sts9-scope-body"><canvas id="sts9PortalMap" class="sts9-scope-canvas" aria-label="지구, 달, 화성, 소행성대, 목성권, 토성권의 항로 연결 개략도"></canvas><div class="sts9-scope-cross" aria-hidden="true"></div>',
 '<div class="sts9-scope-coordinate"><span>REFERENCE / 2120</span><span>NOT TO SCALE</span></div></div>',
 '<div class="sts9-scope-foot"><div><small>DATA SET</small><strong>STATION / ROUTE REGISTER</strong></div><div><small>DISPLAY MODE</small><strong>SCHEMATIC / LOCAL</strong></div></div></aside></div>',
 '<footer class="sts9-foot"><span>PUBLIC ARCHIVE / READ ONLY</span><span>EARTH · LUNA · MARS · BELT · JOVIAN · SATURNIAN</span><span>STS / 2120</span></footer>'
].join('');
portal.appendChild(nativeEnter);
nativeEnter.setAttribute('aria-hidden','true');nativeEnter.tabIndex=-1;
const stages=[
 {code:'01',title:'INITIALIZE SESSION',detail:'공개 열람 화면과 입력 장치를 준비합니다.',test:()=>!!document.getElementById('app'),result:'PUBLIC / READ ONLY'},
 {code:'02',title:'READ STATION REGISTER',detail:'정거장 등록 자료를 확인합니다.',test:()=>Array.isArray(STS.STATIONS)&&STS.STATIONS.length>0,result:stationCount+' ENTRIES INDEXED'},
 {code:'03',title:'INDEX TRAFFIC LINKS',detail:'시설 간 연결 정보를 불러옵니다.',test:()=>Array.isArray(STS.ROUTES)&&STS.ROUTES.length>0,result:linkCount+' LINKS INDEXED'},
 {code:'04',title:'LOAD CORRIDOR REGISTER',detail:'운항 회랑과 환승 자료를 확인합니다.',test:()=>Array.isArray(STS.PRESETS)&&STS.PRESETS.length>0,result:corridorCount+' CORRIDORS READY'},
 {code:'05',title:'CHECK GRAPHICS SUPPORT',detail:'그래픽 환경을 확인합니다.',test:()=>typeof window.CanvasRenderingContext2D!=='undefined',result:typeof window.WebGLRenderingContext!=='undefined'?'WEBGL AVAILABLE':'2D FALLBACK AVAILABLE'},
 {code:'06',title:'OPEN PUBLIC DIRECTORY',detail:'항행망 등록 자료의 열람 화면을 엽니다.',test:()=>!!app,result:'SESSION READY'}
];
const boot=document.createElement('section');boot.className='sts9-boot';boot.id='sts9BootOverlay';boot.setAttribute('aria-hidden','true');
boot.innerHTML=[
 '<div class="sts9-boot-grid"><header class="sts9-boot-head"><strong>STS / PUBLIC OPERATIONS TERMINAL</strong><span>SESSION INIT / 2120</span></header>',
 '<main class="sts9-boot-main"><div class="sts9-boot-primary">',
 '<div class="sts9-boot-meta" id="sts9BootMeta">SYS/INIT &nbsp; 01:06 &nbsp; / &nbsp; PUBLIC</div>',
 '<h2 class="sts9-boot-title" id="sts9BootTitle">INITIALIZE SESSION</h2>',
 '<p class="sts9-boot-subtitle" id="sts9BootDescription">공개 열람 화면을 준비합니다.</p>',
 '<div class="sts9-boot-progress-frame"><div class="sts9-boot-progress-track" id="sts9Progress">'+Array.from({length:32},()=>'<i aria-hidden="true"></i>').join('')+'</div></div>',
 '<div class="sts9-boot-progress-label"><span id="sts9BootStep">01 / 06 · INITIALIZE</span><span id="sts9BootPct">00%</span></div>',
 '<div class="sts9-boot-tasks" id="sts9BootTasks">'+stages.map((x)=>'<div class="sts9-boot-task" data-stage="'+x.code+'"><span class="sts9-boot-task-number">'+x.code+'</span><strong>'+x.title+'</strong><span class="sts9-boot-task-status">WAIT</span></div>').join('')+'</div>',
 '</div><aside class="sts9-boot-display"><div class="sts9-boot-display-top"><span>NETWORK INDEX / SCHEMATIC</span><span>MONITOR A</span></div>',
 '<div class="sts9-boot-map"><canvas id="sts9BootMap" class="sts9-boot-canvas" aria-label="항행망 검증 도식"></canvas><div class="sts9-scope-cross" aria-hidden="true"></div></div>',
 '<div class="sts9-boot-console"><div>STS / <strong>PUBLIC RECORDS</strong> <span class="sts9-console-cursor" aria-hidden="true"></span></div>',
 '<div id="sts9Log1">STATUS / WAITING FOR LOCAL INDEX</div><div id="sts9Log2">DATA / STATION · ROUTE · VESSEL</div></div></aside></main>',
 '<footer class="sts9-boot-foot"><span>LOCAL DATA / NO REMOTE AUTHENTICATION</span>',
 '<button class="sts9-boot-skip" type="button" id="sts9BootSkip">SKIP SEQUENCE ↗</button></footer></div>'
].join('');
document.body.appendChild(boot);
const byId=id=>document.getElementById(id);
const progressBars=[...boot.querySelectorAll('#sts9Progress i')];
const rows=[...boot.querySelectorAll('.sts9-boot-task')];
const state={phase:-1,sweeps:0};
function updateProgress(pct){const n=Math.round(pct/100*progressBars.length);
progressBars.forEach((el,i)=>el.classList.toggle('is-on',i<n));
byId('sts9BootPct').textContent=String(pct).padStart(2,'0')+'%';
}
function setStage(index,status){
 const st=stages[index];phase=index;state.phase=index;
 const pct=Math.min(100,Math.round((index+1)/stages.length*100));
 byId('sts9BootTitle').textContent=st.title;
 byId('sts9BootDescription').textContent=st.detail;
 byId('sts9BootMeta').textContent='PUBLIC INDEX / MODULE '+st.code+' OF 06';
 byId('sts9BootStep').textContent=st.code+' / 06 · '+st.title;
 byId('sts9Log1').textContent='MODULE '+st.code+' / '+(status||st.result);
 byId('sts9Log2').textContent='ACCESS / '+(index===5?'PUBLIC SESSION':'READ-ONLY REGISTER');
 rows.forEach((row,i)=>{
   const label=row.querySelector('.sts9-boot-task-status');
   row.classList.toggle('is-active',i===index);
   row.classList.toggle('is-done',i<index||i===index&&status!=='NOT AVAILABLE');
   label.textContent=i<index?'OK':i===index?(status==='NOT AVAILABLE'?'N/A':'OK'):'WAIT';
 });
 updateProgress(pct);
 if(index===5)boot.classList.add('sts9-boot-finish');
}
function proceedToView(){
 if(finished)return;
 finished=true;bootToken++;
 try{
   // Run the site's legacy finalizer only once, after the complete new
   // sequence (or when SKIP was explicitly pressed).
   if(!app.classList.contains('ready'))nativeSkip.click();
   if(destination!=='home'){
     const link=document.querySelector('#app [data-view="'+destination+'"]');
     if(link)link.click();
   }
 }catch(error){console.error('STS entry finalization:',error)}
 // Keep the sequence visible while the destination sets up its first
 // frame. Removing the overlay before starting the map caused blank flashes.
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
   boot.classList.remove('sts9-boot-open');
   boot.setAttribute('aria-hidden','true');
   boot.style.pointerEvents='none';
   window.STS_TERMINAL_V9_STATE={started:true,finished:true,destination,phase};
 }));
}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function performSequence(token){
 for(let i=0;i<stages.length;i++){
  if(token!==bootToken||finished)return;
  const good=stages[i].test();
  setStage(i,good?stages[i].result:'NOT AVAILABLE');
  await pause(reduce?65:225);
 }
 if(token!==bootToken||finished)return;
 // The original site is finalized only after the new six-stage sequence.
 // Never trigger its legacy skip while the entry animation is running.
 byId('sts9BootTitle').textContent='SESSION READY';
 byId('sts9BootDescription').textContent='공개 기록 열람 화면으로 이동합니다.';
 byId('sts9BootStep').textContent='06 / 06 · READY';
 byId('sts9Log1').textContent='REGISTER / '+stationCount+' FACILITIES · '+linkCount+' LINKS';
 byId('sts9Log2').textContent='DISPLAY / '+destination.toUpperCase()+' VIEW';
 await pause(reduce?75:210);
 if(token===bootToken)proceedToView();
}
function launch(mode){
 if(started||finished)return;started=true;destination=['home','atlas','about'].includes(mode)?mode:'home';bootToken++;
 boot.classList.add('sts9-boot-open');boot.setAttribute('aria-hidden','false');boot.style.pointerEvents='auto';
 // Start audio from the real user gesture, but suppress the obsolete
 // native boot visually. It has a 2.02 second completion timer; our sequence
 // is guaranteed shorter and finalizes the app once, at the end.
 try{nativeEnter.click()}catch(error){console.error('STS terminal entry:',error)}
 document.activeElement?.blur?.();
 performSequence(bootToken);
}
portal.querySelectorAll('[data-sts9-destination]').forEach(btn=>{
 btn.addEventListener('click',()=>launch(btn.dataset.sts9Destination));
});
byId('sts9BootSkip').addEventListener('click',()=>{
 if(!started)return;
 proceedToView();
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&boot.classList.contains('sts9-boot-open')){e.stopImmediatePropagation();proceedToView();return}
 if(e.key!=='Enter'&&e.key!==' ')return;
 if(!started&&!finished&&portal.style.display!=='none'&&!e.target?.closest?.('[data-sts9-destination]')){
  if(e.target?.closest?.('button,input,select,textarea,a'))return;
  e.preventDefault();e.stopImmediatePropagation();launch('home');
 }
},true);

const nodes=[
 {x:.14,y:.51,id:'SOL',w:1.3},
 {x:.31,y:.34,id:'EARTH',w:1.7},
 {x:.42,y:.49,id:'LUNA',w:.9},
 {x:.55,y:.23,id:'MARS',w:1.25},
 {x:.63,y:.58,id:'CERES',w:1.1},
 {x:.83,y:.37,id:'CALLISTO',w:1.0},
 {x:.83,y:.77,id:'TITAN',w:1.1}
];
const paths=[[1,2],[1,3],[3,4],[4,5],[5,6],[2,4],[1,4]];
function bezier(a,b,u,sign){
 const mx=(a.x+b.x)/2,my=(a.y+b.y)/2+(sign||1)*Math.min(.10,Math.abs(a.x-b.x)*.11),t=1-u;
 return {x:t*t*a.x+2*t*u*mx+u*u*b.x,y:t*t*a.y+2*t*u*my+u*u*b.y};
}
function drawNetwork(canvas,time,detail){
 const rect=canvas.getBoundingClientRect();const w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));if(w<15||h<15)return;
 const dpr=Math.min(1.45,window.devicePixelRatio||1),pw=Math.round(w*dpr),ph=Math.round(h*dpr);
 if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph}
 const c=canvas.getContext('2d');if(!c)return;
 c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);c.save();
 const spacing=Math.max(25,Math.min(51,Math.floor(w/10)));
 c.lineWidth=.5;c.strokeStyle='#83abc419';
 for(let x=0;x<w;x+=spacing){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke()}
 for(let y=0;y<h;y+=spacing){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}
 c.save();c.translate(w*.49,h*.47);c.strokeStyle='#7fabc626';c.lineWidth=.7;
 for(let j=1;j<=4;j++){c.beginPath();c.ellipse(0,0,w*.11*j,h*.082*j,-.2,0,Math.PI*2);c.stroke()}
 for(let a=0;a<360;a+=15){const t=a*Math.PI/180,x=Math.cos(t)*w*.41,y=Math.sin(t)*h*.35;c.beginPath();c.moveTo(x,y);c.lineTo(x*1.018,y*1.018);c.stroke()}
 c.restore();
 const pos=nodes.map(n=>({x:n.x*w,y:n.y*h,id:n.id,w:n.w}));
 c.setLineDash([4,7]);c.strokeStyle='#79a6c32c';c.lineWidth=1;
 for(const [idx,[i,j]] of paths.entries()){
  const a=nodes[i],b=nodes[j],sign=idx%2?-1:1;
  c.beginPath();for(let k=0;k<=30;k++){const t=k/30,p=bezier(a,b,t,sign),x=p.x*w,y=p.y*h;if(!k)c.moveTo(x,y);else c.lineTo(x,y)}
  c.stroke();
 }
 c.setLineDash([]);
 const activePaths=detail?Math.min(paths.length,Math.max(1,detail+1)):paths.length;
 for(let k=0;k<activePaths;k++){
  const [i,j]=paths[k],a=nodes[i],b=nodes[j],sign=k%2?-1:1;
  c.strokeStyle=k===Math.floor(time*.00016)%paths.length?'#a6d9f077':'#709db14f';
  c.lineWidth=k===Math.floor(time*.00016)%paths.length?1.35:.85;
  c.beginPath();for(let n=0;n<=25;n++){const p=bezier(a,b,n/25,sign);if(!n)c.moveTo(p.x*w,p.y*h);else c.lineTo(p.x*w,p.y*h)}
  c.stroke();
  if(!reduce){
   const t=(time*.00014*(.65+k*.06)+k*.21)%1,p=bezier(a,b,t,sign);
   c.shadowColor='#9ccee9';c.shadowBlur=7;c.fillStyle='#cbeafa';
   c.beginPath();c.arc(p.x*w,p.y*h,1.7,0,Math.PI*2);c.fill();c.shadowBlur=0;
  }
 }
 const isTiny=w<370;
 for(const [i,p] of pos.entries()){
   if(i===0){c.fillStyle='#c3c5b1';c.beginPath();c.arc(p.x,p.y,5,0,Math.PI*2);c.fill();c.strokeStyle='#c0c5af38';for(const r of [9,18]){c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.stroke()}}
   else{c.strokeStyle='#9fc7dc';c.lineWidth=1;c.strokeRect(p.x-4,p.y-4,8,8);c.fillStyle='#a6cce0';c.fillRect(p.x-1.7,p.y-1.7,3.4,3.4)}
   c.fillStyle=i===1?'#d9edf9':'#91aec0';c.font='9px ui-monospace,monospace';c.textBaseline='middle';
   if(!isTiny||i===1||i===3||i===5||i===6)c.fillText(p.id,p.x+9,p.y-11);
 }
 c.strokeStyle='#8aadc069';c.lineWidth=.8;
 const points=[[15,15,1,1],[w-15,15,-1,1],[15,h-15,1,-1],[w-15,h-15,-1,-1]];
 for(const [x,y,sx,sy] of points){c.beginPath();c.moveTo(x+sx*12,y);c.lineTo(x,y);c.lineTo(x,y+sy*12);c.stroke()}
 if(!reduce){const px=(time*.018)%Math.max(50,w+80)-40;const gl=c.createLinearGradient(px-30,0,px+30,0);gl.addColorStop(0,'#7fb3d100');gl.addColorStop(.5,'#9fd3f012');gl.addColorStop(1,'#7fb3d100');c.fillStyle=gl;c.fillRect(px-30,0,60,h)}
 c.restore();
}
const portalCanvas=byId('sts9PortalMap'),bootCanvas=byId('sts9BootMap');
let lastFrame=-100;
function renderLoop(now){
 if(!portal.isConnected||finished&&app.classList.contains('ready')&&!boot.classList.contains('sts9-boot-open'))return;
 if(now-lastFrame<(reduce?120:45)){requestAnimationFrame(renderLoop);return}
 lastFrame=now;
 if(portal.style.display!=='none'&&!started)drawNetwork(portalCanvas,now,0);
 if(boot.classList.contains('sts9-boot-open'))drawNetwork(bootCanvas,now,phase);
 requestAnimationFrame(renderLoop);
}
requestAnimationFrame(renderLoop);
window.STS_TERMINAL_V9_READY=true;
window.STS_TERMINAL_V9_STATE={started:false,finished:false,destination:'home',phase:-1};
window.STS_TERMINAL_V9_LAUNCH=launch;
// A dedicated recovery URL skips visual startup and uses the original routing
// API. It is useful when a mobile in-app browser stalls on heavy visual layers.
const directMode=new URLSearchParams(location.search).get('direct');
if(['home','atlas','about','facilities','vessels'].includes(directMode)){
 requestAnimationFrame(()=>{
  try{
   portal.style.display='none';nativeEnter.click();
   if(!app.classList.contains('ready'))nativeSkip.click();
   const go=document.querySelector('#app [data-view="'+directMode+'"]');
   if(go&&directMode!=='home')go.click();
   started=true;finished=true;destination=directMode;
   window.STS_TERMINAL_V9_STATE={started:true,finished:true,destination:directMode,phase:5,direct:true};
  }catch(error){console.error('STS direct access:',error);
   portal.style.display='';nativeSkip.click();app.classList.add('ready');
  }
 });
}
})();