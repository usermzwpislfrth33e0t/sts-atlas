/* STS / Historical Records Division — Release Procedure V2.0
   Cinematic fictional document-control sequence. No actual authentication performed.
   This module wraps the existing, persisted V1 access transition without altering the archive data. */
(function(){
'use strict';
if(window.STS_RELEASE_V2_ACTIVE)return;
var trigger=document.getElementById('stsAccessRequest');
var archive=document.getElementById('stsArchiveGate');
if(!trigger||!archive||typeof window.STS_HISTORY_DIAGNOSTICS!=='function')return;
window.STS_RELEASE_V2_ACTIVE=true;

var stages=[
 {id:'01',code:'REGISTER',name:'ACCESS REQUEST REGISTRATION',ko:'열람 요청 등록',note:'기록보관소의 원본 색인을 조회하고 열람 요청을 접수합니다.',result:'REQUEST 01 / LOGGED',resultKo:'열람 요청이 기록되었습니다.',checks:[
  ['OPEN SESSION CHANNEL','열람 세션 할당','STA-HR gateway / reader channel established'],
  ['RESOLVE ARCHIVE VOLUME','원본 소장처 조회','Historical Records Division / Volume III'],
  ['MOUNT 2128 REVISION INDEX','2128년 개정판 목차 대조','Eight chapter references located'],
  ['CHECK CATALOGUE POINTERS','문서번호 및 색인 경로 확인','STA-HR / 2128 / VOL-III'],
  ['ASSIGN REQUEST RECORD','열람 요청 접수번호 생성','Request register / temporary entry'],
  ['WRITE AUDIT RECEIPT','열람 요청 기록 반영','Request 01 accepted by release queue']
 ]},
 {id:'02',code:'VERIFY',name:'CROSS-INDEX VERIFICATION',ko:'기록 대조 및 검증',note:'연혁, 선박 등록부, 원고 목차를 교차 참조해 배포용 문서를 식별합니다.',result:'REQUEST 02 / VERIFIED',resultKo:'교차 색인 검증이 완료되었습니다.',checks:[
  ['LOAD CHRONOLOGY REFERENCES','2023–2120 공식 연혁 색인 조회','Chronology / 39 indexed events'],
  ['RECONCILE EIGHT CHAPTERS','제3권 8개 장과 교차 대조','Volume III / chapters 01–08'],
  ['COMPARE REGISTRY TERMS','선박 등록부 식별자 비교','Registry terminology / canonical lookup'],
  ['EXAMINE REVISION STAMP','2128년 개정 정보 검토','Document revision / 2128'],
  ['VALIDATE COPY MANIFEST','열람본 구성 목록 검증','Archive copy / manifest resolved'],
  ['ISSUE EXCERPT CLEARANCE','발췌본 공개 상태 확인','Partial excerpt / clearance issued']
 ]},
 {id:'03',code:'RELEASE',name:'PUBLIC RELEASE AUTHORIZATION',ko:'전체 본문 공개 승인',note:'공개본을 구성하고 장별 제한 표시를 해제합니다.',result:'PUBLIC RELEASE / COMPLETE',resultKo:'제3권의 전체 본문 공개가 승인되었습니다.',checks:[
  ['REVIEW DISTRIBUTION STATUS','공개 배포 상태 점검','Public edition / release review'],
  ['RESOLVE CHAPTER MANIFEST','8개 장의 본문 목록 결합','Volume III / complete chapter map'],
  ['CLEAR REDACTION INDEX','공개본의 제한 표시 해제','Release view / redactions cleared'],
  ['AUTHORIZE DOCUMENT COPY','열람용 공개 사본 승인','Release control / approved'],
  ['SYNCHRONIZE READER STATE','문서 열람 상태 동기화','Archive reader / release level 03'],
  ['PUBLISH RELEASE RECEIPT','최종 공개 승인 기록 작성','Public release / complete']
 ]}
];
var html=[
 '<div class="sr2-shade" id="sr2Shade" hidden>',
 '<section class="sr2-console" role="dialog" aria-modal="true" aria-labelledby="sr2Title" tabindex="-1">',
 '<header class="sr2-head"><div class="sr2-brand"><span class="sr2-brandmark">STA</span><span class="sr2-brandcopy">SOLAR TRANSIT AUTHORITY <b>HISTORICAL RECORDS DIVISION</b></span></div>',
 '<div class="sr2-head-right"><span class="sr2-status-dot"></span><span id="sr2Live">ARCHIVE CHANNEL ONLINE</span><button id="sr2Close" class="sr2-cross" type="button" aria-label="검증 창 닫기">×</button></div></header>',
 '<div class="sr2-identity"><span>STA / DOCUMENT CONTROL SYSTEM</span><span id="sr2Identity">VOL. III — REV. 2128</span><span>CONTROLLED COPY / SIMULATED</span></div>',
 '<div class="sr2-progress-track" aria-hidden="true"><span id="sr2MainProgress"></span></div>',
 '<div class="sr2-layout"><div class="sr2-main">',
 '<div class="sr2-kicker"><span id="sr2Sequence">PROCEDURE 01 / 03</span><span id="sr2Mode">DOCUMENT REGISTRATION</span></div>',
 '<h2 id="sr2Title">ACCESS REQUEST REGISTRATION</h2><p class="sr2-intro" id="sr2Intro"></p>',
 '<div class="sr2-visual"><div class="sr2-visual-label"><span>ARCHIVE RECONCILIATION ENGINE / VISUAL TRACE</span><span id="sr2GraphTag">NODE 01 · INDEX</span></div>',
 '<canvas id="sr2Canvas" aria-label="보관소 색인과 검사 진행 상황을 나타내는 가상 네트워크 그래픽"></canvas>',
 '<div class="sr2-visual-foot"><span id="sr2GraphicCaption">REFERENCE SET / STA-HR-2128</span><span id="sr2GraphicPercent">00.0%</span></div></div>',
 '<div class="sr2-readings"><div><small>DOCUMENT</small><strong>HISTORICAL RECORDS / VOL. III</strong></div><div><small>REVISION</small><strong>2128 · REVISED EDITION</strong></div><div><small>CURRENT OPERATION</small><strong id="sr2Current">INITIALIZING</strong></div></div>',
 '</div><aside class="sr2-side"><div class="sr2-side-head"><span>PROCESS VALIDATION</span><span id="sr2Count">00 / 06</span></div>',
 '<div id="sr2Checks" class="sr2-checks" role="list"></div>',
 '<div class="sr2-log-header"><span>LIVE CONTROL TRACE</span><span id="sr2TraceState">CONNECTING</span></div>',
 '<div id="sr2Logs" class="sr2-logs" aria-live="off"></div>',
 '</aside></div>',
 '<footer class="sr2-footer"><div class="sr2-footer-left"><span class="sr2-signal">●</span><span id="sr2FootText">FICTIONAL ARCHIVE PROCEDURE / NO REAL AUTHENTICATION</span></div>',
 '<div class="sr2-controls"><button type="button" id="sr2Abort" class="sr2-muted">CANCEL REQUEST</button><button type="button" id="sr2Fast" class="sr2-primary">EXPEDITE SEQUENCE <span>»</span></button><button type="button" id="sr2Return" class="sr2-primary" hidden>RETURN TO ARCHIVE <span>↗</span></button></div></footer>',
 '<div class="sr2-corners" aria-hidden="true"><i></i><i></i><i></i><i></i></div>',
 '</section></div>'
].join('');
document.body.insertAdjacentHTML('beforeend',html);
var root=document.getElementById('sr2Shade');
var box=root.querySelector('.sr2-console');
var by=function(id){return document.getElementById(id)};
var closeButton=by('sr2Close'),abortButton=by('sr2Abort'),fastButton=by('sr2Fast'),returnButton=by('sr2Return');
var canvas=by('sr2Canvas'),ctx=canvas.getContext('2d');
var active=false, committing=false, fast=false, finished=false, allowLegacy=false;
var stage=null, stageIndex=-1, stepIndex=0, pending=0, timer=0, frame=0, priorFocus=null, startTime=0, lastPaint=0;
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function put(id,value){by(id).textContent=value}
function access(){try{return Number(window.STS_HISTORY_DIAGNOSTICS().access)||0}catch(e){return 0}}
function line(s){var e=document.createElement('div');e.className='sr2-log-line';e.textContent=s;var p=by('sr2Logs');p.appendChild(e);p.scrollTop=p.scrollHeight;while(p.children.length>8)p.firstChild.remove()}
function stamp(){var v=Math.max(0,performance.now()-startTime)/1000;return ('00'+Math.floor(v/60)).slice(-2)+':'+('00'+Math.floor(v%60)).slice(-2)+'.'+('00'+Math.floor(v*100)%100).slice(-2)}
function clearTimer(){if(timer)clearTimeout(timer);timer=0}
function later(fn,ms){clearTimer();timer=setTimeout(fn,reduce?Math.min(45,ms):fast?Math.min(75,ms):ms)}
function progress(fraction){var p=Math.max(0,Math.min(1,fraction));by('sr2MainProgress').style.width=(stageIndex/3*100+p/3*100)+'%';put('sr2GraphicPercent',(p*100).toFixed(1)+'%')}
function setChecks(){
 by('sr2Checks').innerHTML='';
 stage.checks.forEach(function(c,i){
  var e=document.createElement('div');e.className='sr2-check';e.setAttribute('role','listitem');e.innerHTML='<span class="sr2-check-icon" aria-hidden="true">·</span><div class="sr2-check-copy"><strong></strong><span></span></div><small class="sr2-check-state">QUEUED</small>';
  e.querySelector('strong').textContent=c[0];e.querySelector('.sr2-check-copy span').textContent=c[1];e.dataset.n=i;by('sr2Checks').appendChild(e);
 });
}
function setState(i,kind){
 var e=by('sr2Checks').children[i];if(!e)return;
 e.className='sr2-check '+kind;
 e.querySelector('.sr2-check-icon').textContent=kind==='done'?'✓':kind==='running'?'◌':'·';
 e.querySelector('.sr2-check-state').textContent=kind==='done'?'CONFIRMED':kind==='running'?'IN REVIEW':'QUEUED';
}
function renderStage(){
 put('sr2Sequence','PROCEDURE '+stage.id+' / 03');
 put('sr2Mode',stage.code+' / AUTOMATED REVIEW');
 put('sr2Title',stage.name);
 put('sr2Intro',stage.note);
 put('sr2Identity','VOL. III — REV. 2128 / '+stage.code);
 put('sr2GraphTag','VECTOR '+stage.id+' / 03');
 put('sr2GraphicCaption',stage.code+' / ARCHIVE RELAY / 2128');
 put('sr2Current','SESSION ESTABLISHED');
 put('sr2TraceState','PROCESSING');
 put('sr2Count','00 / '+('0'+stage.checks.length).slice(-2));
 put('sr2Live','CONTROL CHANNEL ACTIVE');
 put('sr2FootText','FICTIONAL ARCHIVE PROCEDURE / NO REAL AUTHENTICATION');
 by('sr2Logs').replaceChildren();setChecks();progress(0);
 line('[ '+stamp()+' ]  '+stage.code+' SEQUENCE INITIALIZED');
 line('[ '+stamp()+' ]  RECORD STA-HR / VOLUME III / 2128');
}
function step(){
 if(!active||committing||finished)return;
 if(stepIndex>=stage.checks.length){completeSequence();return}
 var i=stepIndex,c=stage.checks[i];
 setState(i,'running');put('sr2Current',c[0]);
 put('sr2GraphTag','CHECK '+('0'+(i+1)).slice(-2)+' / '+('0'+stage.checks.length).slice(-2));
 put('sr2TraceState','TEST '+('0'+(i+1)).slice(-2));
 line('[ '+stamp()+' ]  > '+c[0]);
 later(function(){
  if(!active)return;
  setState(i,'done');
  line('[ '+stamp()+' ]  ✓ '+c[2]);
  stepIndex++;put('sr2Count',('0'+stepIndex).slice(-2)+' / '+('0'+stage.checks.length).slice(-2));
  progress(stepIndex/stage.checks.length);
  later(step,reduce?15:260);
 },reduce?50:650+(i%3)*145);
}
function completeSequence(){
 if(!active||committing)return;
 committing=true;
 put('sr2TraceState','PASS / '+stage.id);
 put('sr2Current','DOCUMENT CONTROL / ACCEPTED');
 put('sr2Live','RELEASE RECORD ACCEPTED');
 box.classList.add('sr2-done');
 put('sr2Title',stage.result);
 put('sr2Intro',stage.resultKo);
 put('sr2FootText','DOCUMENT RELEASE RECORD / '+stage.code+' COMPLETE');
 line('[ '+stamp()+' ]  ✓ ALL CONTROL RECORDS RECONCILED');
 line('[ '+stamp()+' ]  ✓ '+stage.result);
 // The original history module owns access changes and localStorage persistence.
 // Deliberately invoke its own registered handler, and never implement a parallel access store.
 allowLegacy=true;
 try{trigger.click()}finally{allowLegacy=false}
 later(function(){
  if(!active)return;
  var value=access();
  if(value!==stageIndex+1){
   put('sr2Title','RELEASE TRANSITION UNAVAILABLE');
   put('sr2Intro','문서 상태 전환을 확인하지 못했습니다. 보관소 화면으로 돌아가 다시 시도하십시오.');
   line('[ '+stamp()+' ]  ! ARCHIVE STATE NOT CONFIRMED');
  }else{
   line('[ '+stamp()+' ]  ✓ STORED RELEASE LEVEL / '+('0'+value).slice(-2));
  }
  finished=true;
  fastButton.hidden=true;abortButton.hidden=true;returnButton.hidden=false;
  returnButton.textContent=value===3?'OPEN RELEASED VOLUME ↗':'RETURN TO ARCHIVE ↗';
  returnButton.focus({preventScroll:true});
  // Leave the completed certificate visible long enough to read.
  if(value===stageIndex+1)later(function(){close(false)},reduce?250:3300);
 },reduce?70:575);
}
function open(){
 if(active||access()>=3||trigger.disabled)return;
 stageIndex=access();stage=stages[stageIndex];if(!stage)return;
 active=true;committing=false;finished=false;fast=false;stepIndex=0;startTime=performance.now();priorFocus=document.activeElement;
 root.hidden=false;document.body.classList.add('sr2-locked');
 box.classList.remove('sr2-done');fastButton.hidden=false;abortButton.hidden=false;returnButton.hidden=true;
 fastButton.disabled=false;put('sr2FootText','FICTIONAL ARCHIVE PROCEDURE / NO REAL AUTHENTICATION');
 renderStage();box.focus({preventScroll:true});root.scrollTop=0;box.scrollTop=0;
 if(ctx){lastPaint=0;frame=requestAnimationFrame(paint)}
 later(step,reduce?20:600);
}
function close(scrollBook){
 if(!active)return;
 clearTimer();active=false;cancelAnimationFrame(frame);root.hidden=true;
 document.body.classList.remove('sr2-locked');
 var goBook=scrollBook&&access()===3;
 if(goBook){
  var page=document.getElementById('stsBookPage');
  if(page)page.scrollIntoView({block:'start',behavior:reduce?'instant':'smooth'});
 }else if(priorFocus&&typeof priorFocus.focus==='function'){priorFocus.focus({preventScroll:true})}
 priorFocus=null;
}
trigger.addEventListener('click',function(e){
 if(allowLegacy)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(!active)open();
},true);
closeButton.addEventListener('click',function(){if(!committing)close(false)});
abortButton.addEventListener('click',function(){if(!committing)close(false)});
fastButton.addEventListener('click',function(){
 fast=true;fastButton.disabled=true;fastButton.textContent='PRIORITY PROCESSING…';
 // Flush a currently scheduled wait; subsequent checks are accelerated.
 clearTimer();if(active&&!committing)step();
});
returnButton.addEventListener('click',function(){close(access()===3)});
document.addEventListener('keydown',function(e){
 if(!active)return;
 if(e.key==='Escape'&&!committing){e.preventDefault();close(false);return}
 if(e.key!=='Tab')return;
 var nodes=[...box.querySelectorAll('button:not([disabled]):not([hidden])')].filter(function(n){return n.getClientRects().length>0});
 if(!nodes.length)return;
 var first=nodes[0],last=nodes[nodes.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
root.addEventListener('pointerdown',function(e){if(e.target===root&&!committing)close(false)});
function paint(now){
 if(!active||!ctx)return;
 frame=requestAnimationFrame(paint);
 if(now-lastPaint<32&&!reduce)return;lastPaint=now;
 var dpr=Math.min(1.75,window.devicePixelRatio||1),r=canvas.getBoundingClientRect(),w=r.width,h=r.height;
 if(w<10||h<10)return;
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 var cx=w*.50,cy=h*.50,R=Math.min(w*.255,h*.415),sec=(now-startTime)/1000;
 var p=stepIndex/stage.checks.length,ang=reduce?0:sec*.28,TAU=Math.PI*2;
 // Measured structural grid, understated enough to preserve document legibility.
 ctx.strokeStyle='rgba(116,160,190,.075)';ctx.lineWidth=.75;
 for(var x=22;x<w;x+=34){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
 for(var y=18;y<h;y+=34){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
 ctx.strokeStyle='rgba(119,178,214,.18)';ctx.lineWidth=1;
 for(var k=0;k<3;k++){
  ctx.beginPath();ctx.arc(cx,cy,R*(.59+k*.22),0,TAU);ctx.stroke();
 }
 ctx.save();ctx.translate(cx,cy);ctx.rotate(ang);
 for(var t=0;t<60;t++){
  var theta=t*TAU/60,a=t%5===0?R*1.10:R*1.05,b=R*1.155;
  ctx.strokeStyle=t%5===0?'rgba(171,211,235,.55)':'rgba(152,184,203,.22)';
  ctx.beginPath();ctx.moveTo(Math.cos(theta)*a,Math.sin(theta)*a);ctx.lineTo(Math.cos(theta)*b,Math.sin(theta)*b);ctx.stroke();
 }
 ctx.restore();
 var nodes=stageIndex===1?12:8;
 for(var j=0;j<nodes;j++){
  var th=j*TAU/nodes-Math.PI/2+(stageIndex===1?Math.PI/12:0);
  var px=cx+Math.cos(th)*R*.91,py=cy+Math.sin(th)*R*.91;
  ctx.strokeStyle='rgba(108,165,204,.25)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(px,py);ctx.stroke();
  if(stageIndex===1){
   var dest=(j+3)%nodes,th2=dest*TAU/nodes-Math.PI/2+Math.PI/12;
   ctx.strokeStyle='rgba(120,175,210,.11)';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(cx+Math.cos(th2)*R*.91,cy+Math.sin(th2)*R*.91);ctx.stroke();
  }
  var pulse=reduce?0.5:(.5+.5*Math.sin(sec*2.8-j*.7));
  var done=j/nodes<p;
  ctx.fillStyle=done?'rgba(192,231,248,.95)':('rgba(115,172,205,'+(.35+pulse*.4)+')');
  ctx.fillRect(px-2.4,py-2.4,4.8,4.8);
  if(done){ctx.strokeStyle='rgba(172,228,245,.32)';ctx.strokeRect(px-5,py-5,10,10)}
 }
 // Two independent data rings and moving packets.
 ctx.lineWidth=2;
 ctx.strokeStyle='rgba(174,222,245,.7)';ctx.beginPath();ctx.arc(cx,cy,R*.75,-Math.PI/2,-Math.PI/2+TAU*p);ctx.stroke();
 ctx.strokeStyle='rgba(134,205,244,.75)';ctx.beginPath();ctx.arc(cx,cy,R*1.23,-Math.PI/2+sec*.39,-Math.PI/2+sec*.39+.46);ctx.stroke();
 for(var q=0;q<3;q++){
  var a2=sec*(.27+q*.1)+q*TAU/3;
  var px2=cx+Math.cos(a2)*R*1.23,py2=cy+Math.sin(a2)*R*1.23;
  ctx.fillStyle=q===0?'#d5f2ff':'rgba(121,178,212,.7)';
  ctx.beginPath();ctx.arc(px2,py2,q===0?2.4:1.6,0,TAU);ctx.fill();
 }
 ctx.fillStyle='#d9ebf5';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='500 '+Math.max(15,Math.min(24,w*.035))+'px ui-monospace, monospace';
 ctx.fillText('VOL. III',cx,cy-10);
 ctx.fillStyle='#7dabc7';ctx.font='11px ui-monospace,monospace';ctx.fillText('REV / 2128',cx,cy+18);
 ctx.font='9px ui-monospace,monospace';ctx.fillStyle='#85a4b8';
 ctx.textAlign='left';ctx.fillText('NODE / STA-HR-03',18,h-17);ctx.textAlign='right';ctx.fillText(stage.code+' · '+('0'+stepIndex).slice(-2),w-18,h-17);
 if(reduce)cancelAnimationFrame(frame);
}
window.STS_RELEASE_V2_DIAGNOSTICS=function(){return {installed:true,active:active,stage:stageIndex+1,step:stepIndex,committing:committing,finished:finished,access:access(),checks:stage?stage.checks.length:0}};
})();
