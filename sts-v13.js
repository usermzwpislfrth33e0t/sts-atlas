/* STS V13 — HELIOCENTRIC GATEWAY & ORBITAL DIRECTORY
   Original concept visualization. No astronomy claims, network services or hidden auth.
   Maintains every existing STS route and the V9 entry state machine. */
(()=>{
'use strict';
if(window.STS_V13_READY)return;
const portal=document.getElementById('portal');
const home=document.getElementById('homeView');
const main=document.querySelector('#sts12Primary .sts12-main-action');
const monitor=document.querySelector('#portal .sts12-monitor');
if(!portal||!home||!main||!monitor)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.documentElement.classList.add('sts13-installed');
portal.classList.add('sts13-gateway');
home.classList.add('sts13-home');
const raf=window.requestAnimationFrame.bind(window);
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const sections=[
 {view:'atlas',short:'항행 지도',en:'NAVIGATION ATLAS',desc:'태양계 항로 및 정거장 연결망을 탐색합니다.',meta:'79 FACILITIES / 128 LINKS',phase:-Math.PI/2},
 {view:'facilities',short:'시설 등록부',en:'FACILITY REGISTER',desc:'교통 터미널, 송전 시설과 지원 거점의 등록 정보를 조회합니다.',meta:'STATION / RELAY / HUB',phase:-Math.PI/6},
 {view:'vessels',short:'선박 설계',en:'VESSEL ARCHIVE',desc:'세일선·핵융합선 등 선박의 설계 및 운용 형식을 확인합니다.',meta:'SHIPYARD / ENGINEERING',phase:Math.PI/6},
 {view:'about',short:'항행망 개요',en:'SYSTEM REFERENCE',desc:'송전, 수신, 추진과 항행망 운용 원리를 살펴봅니다.',meta:'PUBLIC SYSTEM PRIMER',phase:Math.PI/2},
 {view:'chronology',short:'공식 연혁',en:'OFFICIAL CHRONOLOGY',desc:'2023년부터 2120년까지의 공식 연혁을 열람합니다.',meta:'39 ENTRIES / 5 PERIODS',phase:Math.PI*5/6},
 {view:'records',short:'역사기록 보관소',en:'HISTORICAL RECORDS',desc:'2128년 개정판 대우주개척시대사 제3권을 열람합니다.',meta:'VOLUME III / 2128 EDITION',phase:Math.PI*7/6}
];
/* Replace the V12 schematic visually without deleting its canvas. The original
   diagnostics and fallback renderer remain available and safely hidden. */
monitor.classList.add('sts13-monitor');
const screen=$('.sts12-screen-body',monitor);
const field=document.createElement('canvas');
field.id='sts13HeliosCanvas';field.className='sts13-helios-canvas';
field.setAttribute('aria-label','태양을 중심으로 행성들과 항행망 기준 궤도가 이동하는 개념 시각화');
screen.appendChild(field);
const status=document.createElement('div');status.className='sts13-monitor-hud';
status.innerHTML='<div class="sts13-hud-top"><span>STA / HELIOCENTRIC TRAFFIC OVERVIEW</span><span>MODEL 2120</span></div><div class="sts13-hud-bottom"><div><small>DISPLAY</small><strong>ORBITAL REFERENCE</strong></div><div><small>GRAPHICS</small><strong>SIMULATED MOTION</strong></div><div><small>ACCESS</small><strong>PUBLIC ARCHIVE</strong></div></div>';
screen.appendChild(status);
const top=$('.sts12-screen-top span:first-child',monitor);
if(top)top.innerHTML='<i></i> SOL SYSTEM / ORBITAL OVERVIEW';
const bottom=$('.sts12-coordinates',monitor);
if(bottom)bottom.innerHTML='<span>REFERENCE GEOMETRY / STYLIZED</span><span>NOT TO ASTRONOMICAL SCALE</span>';
const foot=$('.sts12-monitor-foot',monitor);
if(foot)foot.innerHTML='<div><small>DATA EPOCH</small><strong>2120 / FIRST PHASE</strong></div><div><small>REGISTER</small><strong>079 NODES</strong></div><div><small>TOPOLOGY</small><strong>128 LINKS</strong></div>';
/* Existing entry buttons retain all original V9 click handlers. */
const intro=$('.sts12-copy',portal);
intro?.classList.add('sts13-intro');
const wave=document.createElement('div');wave.className='sts13-title-frequency';wave.innerHTML='<span></span><span></span><span></span><span></span><span></span><span></span><span></span>';intro?.appendChild(wave);
/* EGO-inspired editing grammar: two opposing shutters, a luminous seam,
   restrained status typography and a controlled one-shot wave. All artwork is new. */
const curtain=document.createElement('section');
curtain.id='sts13Curtain';curtain.className='sts13-curtain';
curtain.setAttribute('aria-hidden','true');
curtain.innerHTML='<div class="sts13-shutter top"></div><div class="sts13-shutter bottom"></div><div class="sts13-seam"></div><div class="sts13-curtain-center"><span>STA / NETWORK ACCESS CONTROL</span><div class="sts13-curtain-mark">STS <i>/</i> 2120</div><strong id="sts13CurtainState">REQUESTING CONNECTION</strong><div class="sts13-curtain-progress"><i></i></div><small id="sts13CurtainCount">NETWORK REFERENCE / 000</small></div><div class="sts13-curtain-corner">PUBLIC SESSION / NO AUTHENTICATION</div>';
document.body.appendChild(curtain);
let gateStarted=false,gateTimers=[];
function schedule(fn,ms){const id=setTimeout(fn,ms);gateTimers.push(id)}
function cue(kind){try{window.STS_SOUND_V12?.(kind)}catch(e){}}
function activateGate(){
 if(gateStarted)return;
 gateStarted=true;curtain.classList.add('active');curtain.setAttribute('aria-hidden','false');
 portal.classList.add('sts13-launching'); // V12 already plays the entry impact sound.
 schedule(()=>{$('#sts13CurtainState').textContent='INDEX CHANNEL / ONLINE';$('#sts13CurtainCount').textContent='FACILITY INDEX / 079';curtain.classList.add('step2');cue('boot')},reduce?80:370);
 schedule(()=>{$('#sts13CurtainState').textContent='NETWORK ROUTES / SYNCHRONIZED';$('#sts13CurtainCount').textContent='TRAFFIC LINKS / 128';curtain.classList.add('step3');cue('confirm')},reduce?130:920);
 schedule(()=>{$('#sts13CurtainState').textContent='PUBLIC DIRECTORY / READY';$('#sts13CurtainCount').textContent='REFERENCE EPOCH / 2120';curtain.classList.add('releasing');cue('ready')},reduce?180:1510);
 schedule(()=>{curtain.classList.remove('active');curtain.classList.add('closed');curtain.setAttribute('aria-hidden','true');portal.classList.remove('sts13-launching')},reduce?250:1860);
}
main.addEventListener('click',activateGate,true);
$$('#sts12Secondary [data-sts9-destination]').forEach(b=>b.addEventListener('click',activateGate,true));
/* Orbital index: six actual buttons with accessible labels, not canvas hotspots. */
const shell=document.createElement('div');
shell.className='sts13-home-shell';
shell.innerHTML='<header class="sts13-directory-head"><div><span>STA / MAIN DIRECTORY</span><h2>System <em>Index.</em></h2><p>공개 항행망의 자료를 선택하십시오. 각 궤도는 열람 항목을 나타냅니다.</p></div><div class="sts13-directory-counter"><small>AVAILABLE REFERENCES</small><strong>06 <i>/</i> 06</strong><span>REF. 2120 / PUBLIC</span></div></header>'+
'<div class="sts13-home-layout"><section class="sts13-orbit-stage" aria-label="궤도형 항행망 목차">'+
'<div class="sts13-orbit-overline"><span>SOLAR SYSTEM / NAVIGATION DIRECTORY</span><span>INTERACTIVE / 06 SOURCES</span></div>'+
'<canvas id="sts13OrbitCanvas" aria-hidden="true"></canvas>'+
'<div class="sts13-orbit-core" aria-hidden="true"><span class="sts13-core-ring"></span><span class="sts13-core-pulse"></span><strong>STA</strong><small>SYSTEM CORE</small></div>'+
'<div id="sts13Nodes" class="sts13-orbit-nodes" role="group" aria-label="탐색할 목차"></div>'+
'<div class="sts13-orbit-footer"><span>SELECT A REFERENCE NODE</span><span>SWIPE OR USE ARROW KEYS</span></div></section>'+
'<aside class="sts13-inspect" id="sts13Inspector" aria-live="polite"><div class="sts13-inspect-head"><span>INDEX INSPECTOR / 2120</span><span>STA / 01</span></div>'+
'<div class="sts13-inspect-visual"><div class="sts13-inspect-orb"><span class="sts13-inspect-planet"></span></div><div class="sts13-inspect-reticle"></div><span class="sts13-inspect-corner">NODE DETAIL / REFERENCE</span></div>'+
'<div class="sts13-inspect-meta">CURRENT SELECTION <span id="sts13SelectedCode">01 / 06</span></div>'+
'<h3 id="sts13SelectedTitle">항행 지도</h3><div id="sts13SelectedEnglish" class="sts13-inspect-english">NAVIGATION ATLAS</div><p id="sts13SelectedDesc">항행망 조회</p>'+
'<div class="sts13-inspect-data"><span>ARCHIVE CLASS</span><strong id="sts13SelectedMeta">REFERENCE</strong></div>'+
'<button type="button" class="sts13-open" id="sts13Open"><span>OPEN SELECTED RECORD</span><b>↗</b></button>'+
'<div class="sts13-inspect-controls"><button type="button" id="sts13Prev" aria-label="이전 항목">‹ PREVIOUS</button><span id="sts13Current">01 / 06</span><button type="button" id="sts13Next" aria-label="다음 항목">NEXT ›</button></div>'+
'</aside></div>'+
'<footer class="sts13-directory-foot"><span>79 REGISTERED FACILITIES</span><span>128 NETWORK LINKS</span><span>SIMULATED ORBITAL MENU / NOT EPHEMERIDES</span></footer>';
home.insertBefore(shell,home.firstChild);
const nodeRoot=$('#sts13Nodes',shell);
nodeRoot.innerHTML=sections.map((item,i)=>'<button type="button" data-orbit-index="'+i+'" class="sts13-node" aria-pressed="false" aria-label="'+escapeHTML((i+1)+' '+item.short)+'"><span class="sts13-node-dot" aria-hidden="true"></span><span class="sts13-node-text"><small>'+String(i+1).padStart(2,'0')+'</small><strong>'+escapeHTML(item.short)+'</strong></span></button>').join('');
const nodeButtons=$$('[data-orbit-index]',shell);
const stage=$('.sts13-orbit-stage',shell),orbitCanvas=$('#sts13OrbitCanvas',shell);
const orbitCtx=orbitCanvas.getContext('2d',{alpha:true}),heliosCtx=field.getContext('2d',{alpha:false});
let selected=0,frame=0,lastDraw=-100,stageIsActive=true,lastOrbitW=-1,lastOrbitH=-1;
function select(index,withSound=true){
 selected=(index+sections.length)%sections.length;
 const item=sections[selected];
 nodeButtons.forEach((b,i)=>{b.classList.toggle('selected',i===selected);b.setAttribute('aria-pressed',String(i===selected))});
 $('#sts13SelectedCode').textContent=String(selected+1).padStart(2,'0')+' / 06';
 $('#sts13Inspector').dataset.index=String(selected);
 $('#sts13SelectedTitle').textContent=item.short;
 $('#sts13SelectedEnglish').textContent=item.en;
 $('#sts13SelectedDesc').textContent=item.desc;
 $('#sts13SelectedMeta').textContent=item.meta;
 $('#sts13Current').textContent=String(selected+1).padStart(2,'0')+' / 06';
 $('.sts13-inspect-head span:last-child').textContent='STA / '+String(selected+1).padStart(2,'0');
 shell.style.setProperty('--sts13-selection-hue',String(197+selected*4));
 if(withSound)cue('select');
}
nodeRoot.addEventListener('click',e=>{
 const b=e.target.closest('[data-orbit-index]');if(!b)return;
 const next=Number(b.dataset.orbitIndex);
 if(next===selected){openSection()}else select(next);
});
nodeRoot.addEventListener('keydown',e=>{
 if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Enter'].includes(e.key))return;
 e.preventDefault();
 if(e.key==='Enter'){openSection();return}
 select(selected+(e.key==='ArrowRight'||e.key==='ArrowDown'?1:-1));
 nodeButtons[selected].focus({preventScroll:true});
});
$('#sts13Prev').addEventListener('click',()=>select(selected-1));
$('#sts13Next').addEventListener('click',()=>select(selected+1));
$('#sts13Open').addEventListener('click',openSection);
function openSection(){
 const target=sections[selected].view;cue('open');
 shell.classList.add('sts13-travelling');
 setTimeout(()=>{shell.classList.remove('sts13-travelling');if(typeof window.STS_NAVIGATE==='function')window.STS_NAVIGATE(target);else home.querySelector('.home-links [data-view="'+target+'"]')?.click()},reduce?0:360);
}
let dragX=0,dragY=0,tracking=false;
stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;tracking=true;dragX=e.clientX;dragY=e.clientY},{passive:true});
stage.addEventListener('pointerup',e=>{if(!tracking)return;tracking=false;const dx=e.clientX-dragX,dy=e.clientY-dragY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)select(selected+(dx<0?1:-1))},{passive:true});
stage.addEventListener('pointercancel',()=>tracking=false);

/* Enlarged touch acquisition: canvas and moving marker layers can be clicked
   without relying exclusively on the child button hit-test. */
stage.addEventListener('click',e=>{
 if(e.target.closest?.('[data-orbit-index]')||e.target.closest?.('.sts13-orbit-core'))return;
 const x=e.clientX,y=e.clientY;
 let near=-1,dist=Infinity;
 nodeButtons.forEach((b,i)=>{
  const r=b.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  const d=Math.hypot(cx-x,cy-y);
  if(d<dist){dist=d;near=i}
 });
 if(near>=0&&dist<71){if(near===selected)openSection();else select(near)}
});

select(0,false);
/* Drawing utilities for retina screens, keeping a strict resolution ceiling. */
function canvasSize(c,ctx){
 const box=c.getBoundingClientRect(),w=box.width,h=box.height;
 if(w<40||h<40)return null;
 const dpr=Math.min(1.5,window.devicePixelRatio||1);
 const rw=Math.round(w*dpr),rh=Math.round(h*dpr);
 if(c.width!==rw||c.height!==rh){c.width=rw;c.height=rh}
 ctx.setTransform(dpr,0,0,dpr,0,0);return {w,h};
}
function starfield(ctx,w,h,time,amount){
 for(let i=0;i<amount;i++){
  const x=((i*92821+7919)%1009)/1009*w;
  const y=((i*63211+14413)%1031)/1031*h;
  const op=(i%11===0?.5:.2)*(reduce?1:.83+.17*Math.sin(time*.43+i));
  ctx.fillStyle='rgba(195,221,239,'+op.toFixed(3)+')';
  ctx.fillRect(x,y,i%19===0?1.5:.8,i%19===0?1.5:.8);
 }
}
function celestial(ctx,x,y,r,base,lit){
 const glow=ctx.createRadialGradient(x,y,0,x,y,r*3.7);
 glow.addColorStop(0,lit);glow.addColorStop(.34,'rgba(80,147,198,.045)');glow.addColorStop(1,'rgba(80,147,198,0)');
 ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,r*3.7,0,Math.PI*2);ctx.fill();
 const orb=ctx.createRadialGradient(x-r*.35,y-r*.45,r*.08,x+r*.18,y+r*.16,r*1.3);
 orb.addColorStop(0,base[0]);orb.addColorStop(.43,base[1]);orb.addColorStop(1,base[2]);
 ctx.fillStyle=orb;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='rgba(197,225,242,.25)';ctx.lineWidth=.5;ctx.stroke();
}
const palettes=[
 ['#fff5ce','#e7b96e','#b56c36'],['#e6f3fa','#4d93b4','#12253d'],
 ['#ebedf0','#9caebb','#3a4a59'],['#efc1a8','#a35c4d','#402b36'],
 ['#d9d9d0','#8c9aab','#38414f'],['#e6d6b8','#9b816e','#453a33']
];
function drawHelios(t){
 const dims=canvasSize(field,heliosCtx);if(!dims)return;
 const {w,h}=dims,ctx=heliosCtx,cx=w*.52,cy=h*.53,rx=Math.min(w*.47,h*.79),ry=Math.min(h*.43,w*.36);
 ctx.fillStyle='#07121f';ctx.fillRect(0,0,w,h);
 starfield(ctx,w,h,t,90);
 const bg=ctx.createRadialGradient(cx,cy,4,cx,cy,Math.max(w,h)*.72);
 bg.addColorStop(0,'rgba(31,75,112,.28)');bg.addColorStop(1,'rgba(5,14,26,0)');
 ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.translate(cx,cy);ctx.rotate(-.19);
 for(let i=0;i<6;i++){
  const scale=.26+i*.145;
  ctx.beginPath();ctx.ellipse(0,0,rx*scale*2.06,ry*scale*2.06,0,0,Math.PI*2);
  ctx.strokeStyle=i%2?'rgba(140,184,208,.31)':'rgba(115,163,192,.19)';
  ctx.lineWidth=i===2?.9:.65;ctx.stroke();
 }
 ctx.restore();
 const sunR=Math.max(9,Math.min(23,h*.052));
 celestial(ctx,cx,cy,sunR,palettes[0],'rgba(236,181,104,.29)');
 const orbitNames=['EARTH','MARS','BELT','JOVIAN','SATURNIAN'];
 const planetR=[sunR*.58,sunR*.45,sunR*.31,sunR*.79,sunR*.67];
 const planetPal=[palettes[1],palettes[3],palettes[2],palettes[5],palettes[4]];
 for(let i=0;i<5;i++){
  const scale=.40+i*.18,a=(reduce?0:t)*(.09/(1+i*.27))+i*1.43-.75;
  const rrX=rx*scale*2.06,rrY=ry*scale*2.06;
  const px=cx+rrX*Math.cos(a)*.981+rrY*Math.sin(a)*.19;
  const py=cy-rrX*Math.cos(a)*.19+rrY*Math.sin(a)*.981;
  // For deep orbits, position remains within the viewport; clipped edges are intentional.
  celestial(ctx,px,py,planetR[i],planetPal[i],'rgba(126,179,220,.08)');
  if(i===4){ctx.strokeStyle='rgba(196,215,225,.39)';ctx.beginPath();ctx.ellipse(px,py,planetR[i]*1.72,planetR[i]*.47,-.23,0,Math.PI*2);ctx.stroke()}
  if(px>20&&px<w-20&&py>20&&py<h-20&&(!w||w>430||i===0||i===1||i===3)){
   ctx.font='9px ui-monospace,monospace';ctx.textAlign=px>w*.70?'right':'left';
   ctx.fillStyle='rgba(171,207,229,.85)';ctx.fillText(orbitNames[i],px+(px>w*.70?-12:12),py-planetR[i]-7);
  }
 }
 // Directional bearing, ring sweep, and central registration marks.
 ctx.save();ctx.translate(cx,cy);ctx.strokeStyle='rgba(168,213,236,.5)';ctx.lineWidth=.8;
 for(const direction of [-1,1]){
  ctx.beginPath();ctx.moveTo(direction*sunR*1.7,0);ctx.lineTo(direction*sunR*2.4,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,direction*sunR*1.7);ctx.lineTo(0,direction*sunR*2.4);ctx.stroke();
 }
 const a=t*.27;
 ctx.strokeStyle='rgba(172,223,245,.82)';ctx.lineWidth=1.7;
 ctx.beginPath();ctx.ellipse(0,0,rx*.9,ry*.9,-.19,a,a+.32);ctx.stroke();
 ctx.restore();
}
function drawDirectory(t){
 const dims=canvasSize(orbitCanvas,orbitCtx);if(!dims)return;
 const {w,h}=dims,ctx=orbitCtx,cx=w*.5,cy=h*.53;
 ctx.clearRect(0,0,w,h);starfield(ctx,w,h,t,62);
 const mobile=w<640,layoutChanged=Math.abs(w-lastOrbitW)>.5||Math.abs(h-lastOrbitH)>.5;
 const rx=Math.min(w*(mobile?.37:.39),315),ry=Math.min(h*(mobile?.325:.34),230);
 ctx.save();ctx.translate(cx,cy);
 for(let i=0;i<4;i++){
  const k=.39+i*.22;
  ctx.beginPath();ctx.ellipse(0,0,rx*k,ry*k,-.08,0,Math.PI*2);
  ctx.strokeStyle=i===3?'rgba(142,192,222,.3)':'rgba(119,165,192,.19)';
  ctx.lineWidth=.85;ctx.stroke();
 }
 const rad=Math.max(26,Math.min(47,w*.085));
 const halo=ctx.createRadialGradient(0,0,0,0,0,rad*3.4);
 halo.addColorStop(0,'rgba(162,219,247,.17)');halo.addColorStop(1,'rgba(76,131,177,0)');
 ctx.fillStyle=halo;ctx.beginPath();ctx.arc(0,0,rad*3.4,0,Math.PI*2);ctx.fill();
 const orbitAngle=t*.19;
 ctx.strokeStyle='rgba(167,213,236,.53)';ctx.lineWidth=1.7;
 ctx.beginPath();ctx.ellipse(0,0,rx*.8,ry*.8,-.08,orbitAngle,orbitAngle+.29);ctx.stroke();
 ctx.restore();
 nodeButtons.forEach((button,i)=>{
  // Keep the hitbox anchored: only rings, packets and visual highlights animate.
  // Constantly moving DOM button coordinates break touch target stability on iOS.
  const item=sections[i],angle=item.phase,vr=i%3===0?.84:i%3===1?1:.92;
  const x=cx+Math.cos(angle)*rx*vr,y=cy+Math.sin(angle)*ry*vr;
  if(layoutChanged){button.style.left=x+'px';button.style.top=y+'px'}
  if(i===selected){
   ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);
   ctx.setLineDash([3,7]);ctx.strokeStyle='rgba(182,222,244,.48)';ctx.lineWidth=1;ctx.stroke();ctx.setLineDash([]);
   if(!reduce){
    const q=(t*.22)%1;
    ctx.fillStyle='#d2edfa';ctx.beginPath();ctx.arc(cx+(x-cx)*q,cy+(y-cy)*q,2,0,Math.PI*2);ctx.fill();
   }
   ctx.strokeStyle='rgba(174,218,241,.68)';ctx.lineWidth=1;
   ctx.beginPath();ctx.arc(x,y,33,0,Math.PI*2);ctx.stroke();
  }
 });
 if(layoutChanged){lastOrbitW=w;lastOrbitH=h}
}
function loop(ms){
 if(!document.getElementById('sts13HeliosCanvas')?.isConnected)return;
 frame=raf(loop);if(document.visibilityState==='hidden'||ms-lastDraw<(reduce?110:36))return;
 lastDraw=ms;const t=reduce?0:ms*.001;
 if(!gateStarted&&portal.style.display!=='none')drawHelios(t);
 if(home.classList.contains('active'))drawDirectory(t);
}
frame=raf(loop);
window.STS_V13_READY=true;
window.STS_V13_DIAGNOSTICS=()=>({ready:true,gateStarted,active:home.classList.contains('active'),nodes:nodeButtons.length,selected:sections[selected].view,heroCanvas:field.width,orbitCanvas:orbitCanvas.width,views:sections.map(s=>s.view)});
})();