(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const E=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const data=window.STS_CHRONICLE,book=window.STS_HISTORICAL_BOOK;
const time=$('#chronologyView'),hist=$('#recordsView');
if(!data||!book||!time||!hist){console.error('STS historical data or view missing');return}
let era=0,q='',chapter=0,access=0,busy=false;
try{access=Math.max(0,Math.min(3,Number(localStorage.getItem('sts-history-release-2128')||0)))}catch(e){}
const total=data.eras.reduce((n,e)=>n+e.events.length,0);
const about=$('#aboutView');
if(about&&!$('#stsExplained')){
const html=`<section class="sts-overview-v3" id="stsExplained">
 <div class="sov-kicker">SYSTEM PRIMER / NETWORK OPERATIONS / 2120</div>
 <h3 style="font-size:clamp(27px,3.5vw,43px);font-weight:500;letter-spacing:-.04em;margin:14px 0">STS는 어떻게 작동하는가</h3>
 <p class="sov-lead">Solar Traffic System은 지구권과 달권, 화성권, 소행성대, 목성권과 토성권의 주요 거점을 연결하는 광역 교통 인프라와 운항 규격이다. 발전·송전 시설, 우주선, 터미널, 환승 허브, 궤도 포획 장치가 연동하여 여객과 화물을 운송한다.</p>
 <div class="sov-kicker" style="margin-bottom:12px">01 / BEAM-SAIL POWER CHAIN</div>
 <div class="sov-flow">
  <div class="sov-step"><small>TRANSMIT / 01</small><h3>정거장이 전력을 송신한다</h3><p>발전·송전 시설은 운항창에 맞춰 마이크로파 또는 레이저 전력을 보낸다. 장거리 구간에는 태양 중심 송전 릴레이가 배치된다.</p></div>
  <div class="sov-step"><small>RECEIVE / 02</small><h3>세일선이 전력을 수신한다</h3><p>렉테나와 광전 수신막이 전력을 회수한다. 세일은 빛의 압력으로 움직이는 돛이 아니라 선박의 대형 수신 장치다.</p></div>
  <div class="sov-step"><small>PROPULSION / 03</small><h3>추진기관을 가동한다</h3><p>수신 전력은 플라즈마·전기추진기관으로 전달된다. 추진제는 별도로 싣는다. 송전이 중단되어도 관성비행은 계속되며 감속에는 다시 추력이 필요하다.</p></div>
 </div>
 <div class="sov-compare">
  <section><div class="sov-kicker">MSV / BEAM-SAIL VESSEL</div><h3>세일선</h3><p>외부 송전으로 추진하는 정기 운송선이다. 대형 자체 발전설비를 줄일 수 있어 상용 여객과 대량 화물 수송에 적합하다. 송전 시설과 항로 시간표에 의존한다.</p><small>정기 여객 / 벌크 화물 / 특송 / 지원</small></section>
  <section><div class="sov-kicker">FSV / FUSION SPACE VESSEL</div><h3>핵융합선</h3><p>선내 핵융합로와 추진기관으로 독립 운항한다. 송전망 밖의 구조·탐사·외행성 운송에 적합하나 방열·차폐·연료 설비가 크고 유지 비용이 높다.</p><small>독립 직항 / 구조 / 탐사 / 외행성 지원</small></section>
 </div>
 <div class="sov-kicker" style="margin:18px 0 9px">02 / SUPPORT INFRASTRUCTURE</div>
 <p class="sov-lead" style="font-size:14px">터미널은 입출항·화물 처리를, 허브는 환승을, 릴레이와 배열은 송전을 담당한다. 조선소와 지원 정거장은 수리·보급·구조를 수행한다. 궤도 캐처는 회전 테더로 물체의 궤도 에너지를 교환하는 별도 시설이다. 항로는 우주에 고정된 길이 아니라 출항 시점과 행성 위치에 따라 달라지는 운항 관계다.</p>
 <div class="sov-links"><button data-history-nav="chronology">공식 연혁 ↗</button><button data-history-nav="records">역사 기록 ↗</button><button data-history-nav="vessels">선박 설계 ↗</button></div>
</section>`;
const t=$('.about-columns',about);if(t)t.insertAdjacentHTML('beforebegin',html);else about.insertAdjacentHTML('beforeend',html);
}
const header=(crumb,title,sub)=>`<div class="sts-hist-top"><div><div class="sts-hist-crumb">${crumb}</div><h2 class="sts-hist-title">${title}<span style="color:#8dbbd6">.</span></h2><p class="sts-hist-subtitle">${sub}</p></div><button data-history-nav="home" class="sts-hist-back">← INDEX</button></div>`;
const meta=rows=>`<div class="sts-hist-meta">${rows.map(([a,b])=>`<div><span>${E(a)}</span><strong>${E(b)}</strong></div>`).join('')}</div>`;
time.innerHTML=header('SOLAR TRANSIT AUTHORITY / STA-HR/2120-01','Official Chronology','2023–2120년. 초전도 소재의 실용화에서 STS 제1차 건설사업 종료까지의 공식 연혁이다.')+
 meta([['ISSUING AUTHORITY','Solar Transit Authority'],['DOCUMENT','STA-HR/2120-01'],['EDITION','제3차 개정'],['INDEX',total+' ENTRIES / 5 PERIODS']])+
 `<div class="sts-hist-search"><label for="stsHistorySearch">INDEX QUERY</label><input id="stsHistorySearch" type="search" placeholder="연도 · 사건명 · 내용 검색" autocomplete="off"><span id="stsHistoryCount" class="sts-hist-counter"></span></div>
 <nav class="sts-era-tabs" id="stsEraTabs" aria-label="연혁 시대 선택"></nav><div id="stsChronicleContent"></div><section id="stsRegistryDoc" class="sts-hist-registry"></section>`;
const tabs=$('#stsEraTabs'),out=$('#stsChronicleContent');
tabs.innerHTML=data.eras.map((e,i)=>`<button class="sts-era-tab" data-era="${i}" aria-pressed="${i===0}"><span class="era-year">${E(e.period)}</span><span class="era-name">${E(e.title)}</span></button>`).join('');
function renderChronicle(){
 let shown=0;
 const entries=era===-1?data.eras.map((e,i)=>({e,i})):[{e:data.eras[era],i:era}];
 out.innerHTML=entries.map(({e,i})=>{
  const events=e.events.filter(a=>(a.join(' ')+' '+e.period+' '+e.title).toLowerCase().includes(q));shown+=events.length;
  if(!events.length)return '';
  return `<section><div class="sts-era-display"><div><div class="sts-hist-crumb">PERIOD ${String(i+1).padStart(2,'0')} / ${E(e.period)}</div><h3>${E(e.title)}</h3></div><small>${events.length} RECORDS</small></div><div class="sts-event-list">${events.map(a=>`<details class="sts-event"><summary><time class="sts-event-date">${E(a[0])}</time><span class="sts-event-name">${E(a[1])}<span class="sts-event-excerpt">${E(a[2].slice(0,110))}</span></span><span class="sts-event-arrow" aria-hidden="true">+</span></summary><p class="sts-event-body">${E(a[2])}</p></details>`).join('')}</div></section>`;
 }).join('')||'<p class="sts-event-empty">검색 조건에 해당하는 기록이 없습니다.</p>';
 $('#stsHistoryCount').textContent=shown+' RECORDS'+(q?' / FILTERED':'');
 $$('.sts-era-tab',tabs).forEach((b,i)=>b.setAttribute('aria-pressed',String(i===era)));
}
tabs.addEventListener('click',ev=>{const b=ev.target.closest('[data-era]');if(!b)return;era=+b.dataset.era;q='';$('#stsHistorySearch').value='';renderChronicle()});
$('#stsHistorySearch').addEventListener('input',ev=>{q=ev.target.value.trim().toLowerCase();era=q?-1:0;renderChronicle()});
renderChronicle();
const reg=data.registry;
$('#stsRegistryDoc').innerHTML=`<div class="sts-hist-crumb">APPENDIX 01 / VESSEL REGISTRY STANDARD</div><h3>${E(reg.heading)}</h3>
${reg.paragraphs.slice(0,2).map(x=>`<p>${E(x)}</p>`).join('')}
<div class="sts-hist-table-wrap"><table class="sts-hist-table"><thead><tr><th>선명</th><th>등록번호</th><th>기종</th><th>비고</th></tr></thead>
<tbody>${reg.rows.map(row=>`<tr>${row.map(x=>`<td>${E(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
${reg.meanings.concat(reg.paragraphs.slice(2)).map(x=>`<p>${E(x)}</p>`).join('')}
<div class="sts-hist-foot">STA-HR/2120-01 · 제3차 개정 · 2120 기준</div>`;
const gateSteps=[
 ['INDEX AVAILABLE / RESTRICTED COPY','제3권 개정판의 목차만 열람할 수 있습니다. 전체 본문은 단계적 공개 절차에 따라 표시됩니다.','REQUEST ACCESS / 01'],
 ['REQUEST 01 LOGGED','열람 요청이 기록되었습니다. 현재 목차만 공개됩니다.','VERIFY DOCUMENT INDEX / 02'],
 ['REQUEST 02 VERIFIED','교차 색인이 확인되었습니다. 각 장의 첫 문단을 열람할 수 있습니다.','RELEASE COMPLETE TEXT / 03'],
 ['PUBLIC RELEASE / COMPLETE','2128년 개정판 전체 본문이 공개되었습니다.','DOCUMENT RELEASED']
];
hist.innerHTML=header('STA / HISTORICAL RECORDS DIVISION / 2128','대우주개척시대사','제3권. 초전도 혁명과 태양계 교통망의 형성<br>2128년 개정판 · 8개 장 · 역사 서술 원문')+
 `<div class="sts-hist-meta"><div><span>SERIES</span><strong>HISTORICAL RECORDS DIVISION</strong></div><div><span>DOCUMENT</span><strong>대우주개척시대사 / 제3권</strong></div><div><span>EDITION</span><strong>2128년 개정판</strong></div><div><span>ACCESS</span><strong id="stsAccessShort"></strong></div></div>
 <section class="sts-archive-stage" id="stsArchiveGate" aria-label="역사기록 열람 절차">
 <div class="sts-archive-header"><span class="sts-archive-caption">STA FILE CONTROL / RELEASE RECORD</span><span class="sts-archive-state" id="stsGateStatus" aria-live="polite"></span></div>
 <div class="sts-archive-main"><div><div class="sts-hist-crumb">DOCUMENT RELEASE PROCEDURE</div><h3 id="stsGateTitle"></h3><p id="stsGateDesc"></p>
 <div class="sts-archive-progress" aria-hidden="true"><i id="stsGateProgress"></i></div>
 <div class="sts-archive-steps" id="stsGateSteps"><span>01 / REGISTER</span><span>02 / VERIFY</span><span>03 / RELEASE</span></div>
 <button type="button" class="sts-archive-button" id="stsAccessRequest"></button>
 <button type="button" class="sts-archive-reset" id="stsAccessReset">RESTART PROCEDURE</button>
 </div><div><div class="sts-hist-crumb">VERIFICATION TRACE</div><ul class="sts-archive-logs" id="stsAccessLog" aria-live="polite"></ul></div></div></section>
 <div class="sts-book-layout"><nav class="sts-book-toc" id="stsBookToc" aria-label="역사기록 목차"></nav><div class="sts-book-article"><article class="sts-book-page" id="stsBookPage" aria-live="polite"></article></div></div>
 <p class="sts-hist-foot">STA-HR / 2128 REVISION · 본 페이지의 열람 제한은 작품 내 기록보관소 연출이며 실제 인증·접근 통제가 아닙니다.</p>`;
const logs=['00 / CATALOGUE INDEX READY','01 / READER REQUEST LOGGED','02 / CROSS-INDEX VERIFIED','03 / PUBLIC RELEASE AUTHORIZED'];
function renderGate(){
 const g=gateSteps[access];
 $('#stsGateTitle').textContent=g[0];$('#stsGateDesc').textContent=g[1];
 $('#stsGateStatus').textContent=`STEP ${String(access).padStart(2,'0')} / 03 · ${g[0]}`;
 $('#stsAccessShort').textContent=access===3?'PUBLIC RELEASE':access===2?'PARTIAL EXCERPT':'RESTRICTED COPY';
 $('#stsGateProgress').style.width=access/3*100+'%';
 $$('#stsGateSteps span').forEach((s,i)=>s.classList.toggle('done',i<access));
 $('#stsAccessRequest').textContent=g[2];$('#stsAccessRequest').disabled=access===3||busy;
 $('#stsAccessLog').innerHTML=logs.slice(0,access+1).map((s,i)=>`<li class="${i===access?'active':''}">${E(s)}</li>`).join('');
}
function renderBook(){
 const item=book.chapters[chapter],paras=item.body.trim().split(/\n\s*\n/).filter(Boolean);
 const shown=access===3?paras:access===2?paras.slice(0,1):[];
 $('#stsBookToc').innerHTML='<h4>VOLUME III / CONTENTS</h4>'+book.chapters.map((c,i)=>`<button type="button" data-chapter="${i}" aria-current="${i===chapter?'page':'false'}">${String(i+1).padStart(2,'0')} / ${E(c.title.slice(5))}</button>`).join('');
 const rest=paras.length-shown.length;
 $('#stsBookPage').innerHTML=`<div class="chapter-kicker">CHAPTER ${String(chapter+1).padStart(2,'0')} / 08 · ${access===3?'PUBLIC RELEASE':'RESTRICTED COPY'}</div>
 <h3>${E(item.title)}</h3><div class="sts-book-prose">${shown.map(x=>`<p>${E(x)}</p>`).join('')}</div>
 ${rest?`<div aria-hidden="true"><div class="sts-book-redaction"></div><div class="sts-book-redaction"></div><div class="sts-book-redaction"></div></div><div class="sts-book-gate">${access===2?`${rest}개 문단이 아직 공개되지 않았습니다. 마지막 열람 요청을 진행하십시오.`:'본문 미공개 / 열람 요청 절차를 진행하십시오.'}</div>`:''}
 <div class="sts-book-next"><button type="button" data-book-step="-1" ${chapter===0?'disabled':''}>← PREVIOUS</button><button type="button" data-book-step="1" ${chapter===7?'disabled':''}>NEXT →</button></div>
 <div class="sts-book-page-num">STA-HR / VOL.III · ${String(chapter+1).padStart(2,'0')} / 08</div>`;
}
renderGate();renderBook();
$('#stsAccessRequest').addEventListener('click',()=>{
 if(access===3||busy)return;
 busy=true;const gate=$('#stsArchiveGate'),b=$('#stsAccessRequest');
 gate.classList.add('is-releasing');b.disabled=true;b.textContent='VERIFYING RECORD…';
 setTimeout(()=>{
  access=Math.min(3,access+1);
  try{localStorage.setItem('sts-history-release-2128',String(access))}catch(e){}
  busy=false;gate.classList.remove('is-releasing');renderGate();renderBook();
 },matchMedia('(prefers-reduced-motion:reduce)').matches?0:440);
});
$('#stsAccessReset').addEventListener('click',()=>{if(busy)return;access=0;chapter=0;try{localStorage.removeItem('sts-history-release-2128')}catch(e){}renderGate();renderBook()});
hist.addEventListener('click',ev=>{
 const b=ev.target.closest('[data-chapter]'),step=ev.target.closest('[data-book-step]');
 if(!b&&!step)return;
 const target=b?+b.dataset.chapter:chapter+Number(step.dataset.bookStep);
 if(target<0||target>=book.chapters.length)return;
 chapter=target;renderBook();
 if(innerWidth<780)$('#stsBookPage').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
});
document.addEventListener('click',ev=>{
 const b=ev.target.closest('[data-history-nav]');if(!b)return;
 const target=b.dataset.historyNav;
 if(typeof window.STS_NAVIGATE==='function')window.STS_NAVIGATE(target);
 else document.querySelector(`[data-view="${target}"]`)?.click();
});
window.STS_HISTORY_DIAGNOSTICS=()=>({eras:data.eras.length,events:total,chapters:book.chapters.length,paragraphs:book.chapters.map(c=>c.body.trim().split(/\n\s*\n/).length),registry:data.registry.rows.length,access,chapter,primer:!!$('#stsExplained'),timeline:!!$('#stsChronicleContent'),reader:!!$('#stsBookPage')});
window.STS_HISTORY_READY=true;
})();
