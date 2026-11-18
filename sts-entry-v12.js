/* STS NETWORK GATEWAY / V12.0
   Resilient portal skin. Keeps existing V9 action nodes and listeners alive,
   retains the original entry control as fallback, and draws only while visible. */
(()=>{
'use strict';
if(window.STS_GATEWAY_V12_READY)return;
const portal=document.getElementById('portal'),native=document.getElementById('enterBtn');
if(!portal||!native)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const v9=[...portal.querySelectorAll('.sts9-action[data-sts9-destination]')];
const hasTerminal=v9.length>0&&window.STS_TERMINAL_V9_READY===true;
const markup=[
'<div class="sts12-display"><div class="sts12-topline"></div>',
'<header class="sts12-header"><div class="sts12-head-brand"><span class="sts12-logo">S<span>·</span>T<span>·</span>S</span>',
'<span class="sts12-serial">SOLAR TRAFFIC SYSTEM<br>NETWORK CONTROL / 2120</span></div>',
'<div class="sts12-header-right"><span class="sts12-live"><i></i>PUBLIC CHANNEL</span><span class="sts12-header-epoch">STA / REFERENCE 2120</span></div></header>',
'<main class="sts12-layout"><section class="sts12-copy" aria-labelledby="sts12Title">',
'<div class="sts12-section-label"><span>NETWORK GATEWAY</span><span>CONTROL INTERFACE / SOL</span></div>',
'<div class="sts12-chapter">01 <b>/</b> PUBLIC OPERATIONS ARCHIVE</div>',
'<h1 id="sts12Title">SOLAR TRAFFIC<span>SYSTEM<span class="sts12-stop">.</span></span></h1>',
'<p class="sts12-description">2120년 제1차 건설사업 완료 기준.<br>태양계 항행망, 시설 및 선박의 공개 운용 기록.</p>',
'<div class="sts12-databand"><span><small>REFERENCE EPOCH</small><strong>2120</strong></span>',
'<span><small>REGISTERED FACILITIES</small><strong id="sts12Facilities">079</strong></span>',
'<span><small>NETWORK LINKS</small><strong id="sts12Links">128</strong></span></div></section>',
'<aside class="sts12-monitor" aria-label="태양계 항행망 개략 시각화">',
'<div class="sts12-screen-top"><span><i></i>LIVE NETWORK SCHEMATIC</span><span>DISPLAY 01 / SOL</span></div>',
'<div class="sts12-screen-body"><div class="sts12-screen-viewport"><canvas id="sts12Canvas" aria-label="주요 거점과 연결 회랑의 움직이는 항행망 도식"></canvas></div>',
'<div class="sts12-scan-overlay" aria-hidden="true"></div>',
'<div class="sts12-coordinates"><span>LONG-RANGE / TRANSIT TOPOLOGY</span><span>NOT TO SCALE</span></div>',
'<div class="sts12-corner tl"></div><div class="sts12-corner tr"></div><div class="sts12-corner bl"></div><div class="sts12-corner br"></div>',
'</div><div class="sts12-monitor-foot"><div><small>REFERENCE</small><strong>STA NETWORK INDEX</strong></div>',
'<div><small>TRANSMISSION</small><strong><span class="sts12-flash"></span> ACTIVE</strong></div>',
'<div><small>STATUS</small><strong>PUBLIC / READ ONLY</strong></div></div></aside>',
'<section class="sts12-actions-area"><div class="sts12-access-label"><span>ACCESS CONTROL / LOCAL SESSION</span><span>00. READY FOR CONNECTION</span></div>',
'<div class="sts12-primary-slot" id="sts12Primary"></div><div class="sts12-secondary" id="sts12Secondary"></div>',
'<div class="sts12-access-foot"><span>SESSION AUDIO / ENABLED ON INTERACTION</span><span>NO CREDENTIALS REQUIRED</span></div></section></main>',
'<footer class="sts12-footer"><span>STA / HISTORICAL & NAVIGATION RECORDS</span><span>EARTH · LUNA · MARS · BELT · JOVIAN · SATURNIAN</span><span>PUBLIC RELEASE / 2120</span></footer></div>'
].join('');
portal.insertAdjacentHTML('beforeend',markup);
portal.classList.add('sts12-portal');
const ui=portal.querySelector('.sts12-display'),mainSlot=ui.querySelector('#sts12Primary'),secondary=ui.querySelector('#sts12Secondary');
let trigger;
if(hasTerminal){
 trigger=v9.find(x=>x.dataset.sts9Destination==='home')||v9[0];
 mainSlot.appendChild(trigger);trigger.classList.add('sts12-main-action');
 const label=trigger.querySelector('.sts9-action-label');
 if(label)label.innerHTML='공개 항행망 접속<small>ESTABLISH CONNECTION / OPEN DIRECTORY</small>';
 for(const act of v9.filter(x=>x!==trigger)){
  secondary.appendChild(act);act.classList.add('sts12-side-action');
 }
}else{
 trigger=native;mainSlot.appendChild(native);
 native.removeAttribute('aria-hidden');native.tabIndex=0;
 native.classList.remove('sts9-legacy-trigger');
 native.classList.add('sts12-main-action','sts12-legacy-action');
 native.innerHTML='<span class="sts12-action-code">01 / CONNECT</span><span>공개 항행망 접속<small>ESTABLISH CONNECTION / OPEN DIRECTORY</small></span><span class="sts12-arrow">↗</span>';
 secondary.innerHTML='<span class="sts12-fallback-note">PUBLIC DIRECTORY / DOCUMENT ACCESS</span>';
}
const data=window.STS3D||{};
ui.querySelector('#sts12Facilities').textContent=String(data.STATIONS?.length||79).padStart(3,'0');
ui.querySelector('#sts12Links').textContent=String(data.ROUTES?.length||128).padStart(3,'0');
const transfer=document.createElement('div');
transfer.className='sts12-transfer';transfer.id='sts12Transfer';transfer.setAttribute('aria-hidden','true');
transfer.innerHTML=[
'<div class="sts12-transfer-inner"><div class="sts12-transfer-header"><span>STS / CENTRAL NETWORK</span><span>HANDSHAKE / REQUESTED</span></div>',
'<div class="sts12-transfer-glyph">S<span>/</span>T<span>/</span>S</div>',
'<div class="sts12-transfer-label">TRANSMISSION CHANNEL OPEN</div><div class="sts12-transfer-line"><i></i></div>',
'<div class="sts12-transfer-sub">PUBLIC ARCHIVE SESSION / CONNECTING</div></div>'
].join('');
document.body.appendChild(transfer);
let launched=false;
function begin(){
 if(launched)return;launched=true;
 window.STS_SOUND_V12?.('engage');
 transfer.classList.add('on');transfer.setAttribute('aria-hidden','false');
 setTimeout(()=>transfer.classList.add('done'),reduced?60:760);
 setTimeout(()=>{transfer.classList.remove('on','done');transfer.setAttribute('aria-hidden','true')},reduced?110:1240);
}
trigger.addEventListener('click',begin,true);
secondary.querySelectorAll('button[data-sts9-destination]').forEach(b=>b.addEventListener('click',begin,true));
const canvas=ui.querySelector('#sts12Canvas'),ctx=canvas?.getContext('2d',{alpha:false});
const nodes=[
 {id:'SOL',x:.22,y:.52,r:7,c:'#ead0a6'},
 {id:'EARTH',x:.43,y:.35,r:4.5,c:'#c9e4f4'},
 {id:'LUNA',x:.46,y:.46,r:2.4,c:'#9bc4d9'},
 {id:'MARS',x:.64,y:.22,r:3.6,c:'#d7a79d'},
 {id:'CERES',x:.66,y:.59,r:2.7,c:'#a8d4e9'},
 {id:'JOVIAN',x:.83,y:.36,r:4.2,c:'#b8c9d7'},
 {id:'SATURNIAN',x:.85,y:.78,r:3.7,c:'#b0c9d5'}
],tracks=[[1,2],[1,3],[2,4],[3,4],[4,5],[5,6],[1,4]];
let seed=70127;const stars=[];
for(let i=0;i<110;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed/4294967295;seed=(seed*1664525+1013904223)>>>0;stars.push({x,y:seed/4294967295,k:i%13===0?1.35:.65})}
let raf=0,prev=-100;
function draw(t){
 if(!portal.isConnected||launched||window.STS_V13_READY||portal.style.display==='none')return;
 raf=requestAnimationFrame(draw);
 if(document.visibilityState==='hidden'||t-prev<(reduced?140:36))return;prev=t;
 if(!ctx)return;
 const box=canvas.getBoundingClientRect(),w=Math.round(box.width),h=Math.round(box.height);if(w<40||h<40)return;
 const dpr=Math.min(1.55,devicePixelRatio||1);
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
 ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.fillStyle='#07111b';ctx.fillRect(0,0,w,h);
 const T=reduced?0:t*.001,small=w<470,step=small?32:45;
 ctx.lineWidth=.6;ctx.strokeStyle='rgba(99,150,178,.10)';
 for(let i=0;i<w;i+=step){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,h);ctx.stroke()}
 for(let i=0;i<h;i+=step){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(w,i);ctx.stroke()}
 for(const star of stars){ctx.fillStyle='rgba(197,222,236,'+(star.k>1?.42:.12)+')';ctx.fillRect(star.x*w,star.y*h,star.k,star.k)}
 const cx=w*.22,cy=h*.52;
 ctx.save();ctx.translate(cx,cy);ctx.rotate(-.2);
 for(let i=0;i<5;i++){
  ctx.beginPath();ctx.ellipse(0,0,w*(.17+i*.142),h*(.12+i*.115),0,0,Math.PI*2);
  ctx.strokeStyle=i===2?'rgba(158,197,218,.28)':'rgba(114,162,190,.17)';ctx.lineWidth=i===2?1:.7;ctx.stroke();
 }
 ctx.restore();
 ctx.strokeStyle='rgba(140,189,219,.2)';ctx.beginPath();ctx.moveTo(cx,10);ctx.lineTo(cx,h-10);ctx.moveTo(12,cy);ctx.lineTo(w-12,cy);ctx.stroke();
 const pt=nodes.map(n=>({x:n.x*w,y:n.y*h}));
 function pos(a,b,u,sign){const A=pt[a],B=pt[b],mx=(A.x+B.x)/2,my=(A.y+B.y)/2-sign*Math.min(h*.075,Math.abs(A.x-B.x)*.13),v=1-u;return {x:v*v*A.x+2*v*u*mx+u*u*B.x,y:v*v*A.y+2*v*u*my+u*u*B.y}}
 tracks.forEach(([a,b],i)=>{
  const chosen=i===Math.floor(T*.28)%tracks.length,sign=i%2?1:-1;
  ctx.beginPath();for(let k=0;k<=25;k++){const p=pos(a,b,k/25,sign);if(k)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y)}
  ctx.strokeStyle=chosen?'rgba(169,218,241,.6)':'rgba(117,165,193,.3)';ctx.lineWidth=chosen?1.4:.9;ctx.stroke();
  if(!reduced){const p=pos(a,b,(T*(.13+i*.012)+i*.14)%1,sign);ctx.save();ctx.fillStyle=chosen?'#e5f5fc':'#9ab8ca';ctx.shadowColor=chosen?'#b7e6ff':'#65b4ea';ctx.shadowBlur=chosen?13:5;ctx.beginPath();ctx.arc(p.x,p.y,chosen?2.5:1.5,0,Math.PI*2);ctx.fill();ctx.restore()}
 });
 pt.forEach((p,i)=>{
  const n=nodes[i];
  if(i===0){
   const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,35);
   g.addColorStop(0,'rgba(249,223,175,.3)');g.addColorStop(.3,'rgba(221,186,121,.11)');g.addColorStop(1,'rgba(221,186,121,0)');
   ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,35,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle='rgba(239,212,168,.38)';
   for(const r of [15,24]){ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.stroke()}
  }
  if(i===1){ctx.strokeStyle='rgba(184,224,247,.75)';ctx.strokeRect(p.x-8,p.y-8,16,16)}
  ctx.beginPath();ctx.arc(p.x,p.y,n.r,0,Math.PI*2);ctx.fillStyle=n.c;ctx.fill();
  if(!small||[0,1,3,4,5,6].includes(i)){
   ctx.font=(small?8:9)+'px ui-monospace,Consolas,monospace';ctx.fillStyle=i===1?'#d8edfa':'#89aabf';
   ctx.textAlign=p.x>w*.78?'right':'left';ctx.fillText(n.id,p.x+(p.x>w*.78?-11:11),p.y-(i===4?-19:13));
  }
 });
 if(!reduced){
  ctx.strokeStyle='rgba(166,220,243,.7)';ctx.lineWidth=1.7;ctx.beginPath();ctx.ellipse(cx,cy,w*.46,h*.41,-.2,T*.35,T*.35+.26);ctx.stroke();
 }
 ctx.fillStyle='#82a8c1';ctx.textAlign='left';ctx.font='9px ui-monospace,monospace';
 ctx.fillText('SOL / NODE 00',16,21);ctx.textAlign='right';ctx.fillText('NETWORK / 2120',w-14,21);
}
if(ctx)raf=requestAnimationFrame(draw);
window.STS_GATEWAY_V12_READY=true;
window.STS_GATEWAY_V12_DIAGNOSTICS=()=>({ready:true,terminal:hasTerminal,launched,canvas:!!ctx,actions:mainSlot.querySelectorAll('button').length,secondary:secondary.querySelectorAll('button').length});
})();