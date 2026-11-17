/* STS / Canonical reference 2120. This text follows the project design document. */
(()=>{'use strict';
document.title='STS / Solar Traffic System — Navigation Atlas 2120';
const $=q=>document.querySelector(q);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const header=(num,title,desc)=>'<div class="sts-doc-eyebrow">'+num+'</div><h3>'+title+'</h3><p>'+desc+'</p>';
const table=(heads,rows)=>'<div class="sts-doc-table-wrap"><table class="sts-doc-table"><thead><tr>'+heads.map(x=>'<th>'+E(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(x=>'<td>'+E(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
function section(num,title,desc,body){
return '<section class="sts-doc-section">'+header(num,title,desc)+body+'</section>';
}
const port=$('.portal-title');
if(port)port.innerHTML='Solar Traffic<br><em>System.</em>';
const opening=$('.portal-kr');if(opening)opening.textContent='2120년 제1차 건설사업 완료 기준. 태양계 여객·화물 항로, 송전 시설, 정거장 및 선박 운용 기록.';
const homeTitle=$('.home-copy h2');if(homeTitle)homeTitle.innerHTML='STS<br><span>Network Atlas.</span>';
const homeIntro=$('.home-copy p');if(homeIntro)homeIntro.textContent='2120년 기준 주요 시설 79곳과 교통 연결 128개, 정기 운항 회랑 12개를 수록한 항행망 등록 자료입니다.';
const about=$('#aboutView');if(about){
 const h=about.querySelector('.about-columns h3');if(h)h.textContent='Solar Traffic System / 2120';
 const intro=about.querySelectorAll('.about-columns > div:first-child p');
 if(intro[0])intro[0].textContent='STS는 지구권에서 토성권까지 여객·화물 운송, 정거장 간 전력 공급, 구조·정비를 연결하는 태양계 교통망입니다. 2120년은 제1차 건설사업 완료 시점입니다.';
 if(intro[1])intro[1].textContent='지도에는 개별 명칭과 자료가 확보된 주요 시설 79곳을 수록했습니다. 이는 태양계 전체 시설의 총수가 아닙니다. 궤도, 천체 크기, 항로 곡선은 탐색을 위한 개략 표현이며 실제 천체력이나 실시간 비행 궤적이 아닙니다.';
 const doc=document.createElement('div');doc.id='stsCanonicalReference';doc.className='sts-doc-root';
 doc.innerHTML=[
 section('01 / NETWORK STATUS','제1차 건설사업 완료 상태',
  '2120년의 STS는 전력 송전식 정기 교통과 선내 핵융합 추진식 독립 항행을 함께 운영합니다.',
 '<div class="sts-doc-columns"><div><h4>송전 의존형</h4><p>세일선은 정거장이 발사한 전력을 수신막으로 받아 선내 추진계에 전달합니다. 대량 여객·화물과 정기 운항에 사용하지만 송전창·항로 인프라에 의존합니다.</p></div><div><h4>독립 항행형</h4><p>핵융합선은 선내 에너지 생산 능력을 바탕으로 송전망 밖에서 운항합니다. 탐사·군용·구조·외행성 지원에 쓰이며 비용과 유지 부담이 큽니다.</p></div></div>'+
 table(['권역','운용 상태'],[
 ['지구·달','고밀도 여객·화물 교통, 캐처·조선소 집중'],['화성','정기 장거리 여객과 출발·감속 인계'],['소행성대','원자재·얼음·산업재 중심 물류'],['목성','칼리스토 거점 중심, 특수선·핵융합선 비중 증가'],['토성','타이탄 중심의 장거리 화물·연구 지원'],['천왕성·해왕성','시범 또는 계획 단계, 정규 간선망 밖']
 ])),
 section('02 / POWER RECEPTION','세일선의 전력 수신 체계',
  '세일은 주 추진력을 얻는 광압 반사 돛이 아니라 전력 수신 구조물입니다. 수신막, 중앙 집전 버스, 전력 변환부, 방열판과 전기 추진계가 하나의 시스템으로 작동합니다.',
 table(['분류','정식 명칭','주 용도','운용상 제약'],[
 ['M','Microwave Rectenna Sail','지구권·달권 등 근거리','면적이 크고 빔 확산 관리 필요'],
 ['L','Laser Photovoltaic Sail','행성 간 장거리','포인팅 정밀도와 열관리 중요'],
 ['H','Hybrid Sail','장거리 여객·고성능 화물','마이크로파·레이저 겸용, 가장 높은 설비 비용']
 ])+
 '<p class="sts-doc-note">수신막 구조: 분산 렉테나·광전 셀 / 방사형 전개 트러스 / 외곽 장력 케이블 / 집전 버스 / 열 배출면 / 미세 자세제어 베인.</p>'+
 table(['세대','수신막 대표 직경','운용 분야'],[
 ['G1','60–120 m','지구–달 초기 화물'],['G2','120–220 m','초기 상용 여객·화성 항로'],['G3','220–380 m','표준화 장거리 여객·화물'],['G4','350–600 m','고출력 급행·대형 장거리선']
 ])+
 '<p class="sts-doc-footnote">설정용 수신 효율: 마이크로파 72–84%, 레이저 광전 45–62%, 통합 전력계 65–78%. 정거장 송신, 빔 확산과 포인팅 손실을 포함한 전체 전송 효율과는 구별합니다.</p>'),
 section('03 / VESSEL NOMENCLATURE','선박 분류와 등록 체계',
  '세일선의 세대(G), 용도, 출항 질량등급, 전력 수신방식을 조합해 형식코드를 부여합니다.',
 table(['구분','코드','내용'],[
 ['용도','P / C / B / X / R / U','Passenger / Cargo / Bulk / Express / Rescue / Utility'],
 ['질량 I','I','20–80 t'],['질량 II','II','80–250 t'],['질량 III','III','250–900 t'],
 ['질량 IV','IV','900–4,000 t'],['질량 V','V','4,000 t 이상'],
 ['표기 예','G3-P-III-H','3세대 / 여객선 / III급 / 복합 수신']
 ])+
 '<p class="sts-doc-note">핵융합선 계열은 FSV(일반), FSC(구조·경비), FER(탐사), FBT(대형 예인), FMS(군용)로 구분합니다. 엔진 계열은 DFD(장시간 저추력), MLF(고추력 자기압축 펄스), ICF-P(대형 관성핵융합 실험·심우주용)입니다.</p>'),
 section('04 / STATION DESIGN','정거장과 전력 인프라',
  '정거장의 기본 기능은 출입항, 환승, 송전, 정비·구조, 조선, 발전입니다. 지도 등록부에서는 실제 운용 용도에 따라 특화 시설을 추가로 분류합니다.',
 table(['등록 분류','주요 기능','대표 시설'],[
 ['TERMINAL','여객·화물의 행성권 입출항','Clarke Terminal'],
 ['HUB','환승·항로 분기 및 송전 인계','Gateway L1 Hub / Selene Hub'],
 ['RELAY','광학 송전·항법·통신 중계','Farview L2 Relay'],
 ['SERVICE','보급·정비·의료·예인 지원','Peary Transfer'],
 ['YARD','선체 조립·세일 수리·모듈 교체','Armstrong Yard / Phobos Yard'],
 ['POWER','발전과 송전 전원 공급','Aristarchus Power Farm'],
 ['ARRAY','고출력 출항용 송전·빔 정렬','Ashby Departure Array'],
 ['SAFETY','추적·궤도 파편 감시·구조','Tyndall Watch'],
 ['CATCHER','회전 테더 포획과 궤도 간 인계','Catcher East / Boreal']
 ])+
 '<p class="sts-doc-note">규모 등급: Alpha(초대형 허브·조선·대규모 발전), Beta(지역 중심), Gamma(표준 송전·정비), Delta(지원·계측·통신). 등급은 규모 분류이며 각 시설의 등록 형식과 별개입니다.</p>'),
 section('05 / ORBITAL CATCHERS','궤도 캐처',
  'Orbital Catcher는 중심 허브에서 2기 또는 4기의 회전 테더가 뻗는 포획·궤도 인계 설비입니다. 포획 클로, 도킹 링, 궤도 보정 추진기, 충돌 회피 센서, 비상 분리계를 갖춥니다.',
 table(['형식','테더 길이','용도 / 포획 질량'],[
 ['OC-L','15–30 km','경량 무인 화물 / 20 t 이하'],
 ['OC-M','40–80 km','표준 포획 / 20–120 t'],
 ['OC-H','80–180 km','대형·유인 검증 / 120–800 t'],
 ['OC-T','20–60 km','궤도 간 인계 특화'],
 ['OC-P','임무별 상이','행성 진출입 특화']
 ])+
 '<p class="sts-doc-footnote">지구권에 대형 캐처가 집중되며 화성·달권에도 운영됩니다. 소행성대에는 일부 거점만 설치되며 목성·토성권은 궤도 인계형 위주입니다. 지도에서 캐처 크기와 회전 테더 길이는 실제 축척으로 표현하지 않습니다.</p>'),
 section('06 / ROUTE CLASSIFICATION','항로와 운항 시간',
  '행성의 상대 위치가 계속 변하므로 STS 항로는 고정된 공간상의 도로가 아니라 출항 시간과 송전 가능 구간으로 관리됩니다.',
 table(['등급','역할'],[
 ['Trunk-A','지구–달, 지구–화성 초간선'],
 ['Trunk-B','화성–세레스, 세레스–목성 간선'],
 ['Regional-C','행성권 내부 및 인접 거점'],
 ['Frontier-D','외행성 저밀도 운항'],
 ['Service-E','구조·정비·자재 지원']
 ])+
 table(['구간','운송 조건','설정상 소요 시간'],[
 ['지구–달','표준 화물','2–4일'],
 ['지구–달','급행 여객','18–30시간'],
 ['지구–화성','저속 화물','120–240일'],
 ['지구–화성','표준 여객','90–150일'],
 ['지구–화성','급행','45–70일'],
 ['화성–세레스','표준 화물 / 여객','40–90일 / 30–70일'],
 ['세레스–칼리스토','표준 화물 / 급행 지원','90–180일 / 50–100일'],
 ['칼리스토–타이탄','표준 화물','140–260일']
 ])+
 '<p class="sts-doc-footnote">위 수치는 설정상 운항 범위입니다. 항행 지도에서 그려지는 연결선은 서비스·환승 관계를 표시하며 실제 우주선의 궤도나 이 시간값을 실시간 계산한 결과가 아닙니다.</p>'),
 section('07 / REGISTER SCOPE','자료 수록 범위',
  '2120년 제1차 건설 완료 배치안과 현재 웹사이트의 개별 시설 기록을 구별합니다.',
 '<div class="sts-doc-columns"><div><h4>전체 배치안</h4><p>지구·달·화성·소행성대·목성권·토성권 및 태양중심 독립 릴레이의 운영 분포를 설정하는 상위 계획입니다. 개별 명칭·위치가 확정되지 않은 소규모 시설도 포함합니다.</p></div><div><h4>현재 등록부</h4><p>명칭이 정해진 주요 시설 79곳, 교통 연결 128개, 등록 운항 회랑 12개입니다. 전체 시설 숫자에 대한 완결된 조사나 모든 소형 시설의 목록은 아닙니다.</p></div></div>'+
 table(['운용권','주요 거점'],[
 ['지구·달','Clarke · Armstrong · Gateway · Selene · Shackleton'],
 ['화성','Ares High Hub · Phobos · Deimos · Utopia · Valles'],
 ['소행성대','Ceres · Vesta · Pallas · Hygiea · Psyche'],
 ['목성','Callisto · Ganymede · Europa · Amalthea'],
 ['토성','Titan · Rhea · Enceladus · Iapetus']
 ]))
 ].join('');
 about.appendChild(doc);
}
const fleet=[
['여객 세일선','MSV Meridian','G3-P-III-H','화성 정기 여객'],
['여객 세일선','MSV Halcyon','G3-P-II-H','지구–달 / 화성 혼합 운항'],
['여객 세일선','MSV Kestrel','G2-P-II-H','2087년 사고 기록'],
['여객 세일선','MSV Wayfarer','Liner','표준 여객선 계열'],
['급행·특송','MSV Calypso','G4-X-II-H','고출력 급행'],
['급행·특송','MSV Vesper','G4-X-III-H','프리미엄 장거리'],
['급행·특송','MSV Peregrine','Clipper','고속 여객·특급 화물'],
['급행·특송','MSV Swift','Packet','우편·소화물'],
['급행·특송','MSV Dart','Packet','우편·소화물'],
['급행·특송','MSV Relay Finch','Packet','소형 자동화 특송'],
['화물 세일선','MSV Resolute','G2-C-III-M','대량 규격 화물'],
['화물 세일선','MSV Iron Crest','G3-B-V-H','광석·산업재 벌크'],
['화물 세일선','MSV Borealis Grain','G2-C-III-M','표준 화물'],
['화물 세일선','MSV Outer Reach','G4-B-V-H','대형 장거리 벌크'],
['지원·작업선','MSV Lantern','Tender / Utility','정거장 지원'],
['지원·작업선','MSV Samaritan','Tender / Utility','구조·의료 지원'],
['지원·작업선','MSV Harbor Fox','Tender / Utility','도킹·정비'],
['핵융합선','FSV Argo I','FSV','초기 실증선'],
['핵융합선','FSV Tantalus','FSV','외행성 급행 화물'],
['핵융합선','FSC Redhaven','FSC','구조 임무'],
['핵융합선','FER Long Meridian','FER','장거리 탐사'],
['핵융합선','FBT Atlas Forge','FBT','대형 예인'],
['핵융합선','FMS Vigilant','FMS','군용 초계']
];
const categories=['전체','여객 세일선','급행·특송','화물 세일선','지원·작업선','핵융합선'];
function renderFleet(){
 const host=$('#vesselsView');if(!host||!host.classList.contains('shipyard-seven')||$('#stsFleetRegistry'))return false;
 const root=document.createElement('section');root.className='sts-fleet-root';root.id='stsFleetRegistry';
 root.innerHTML='<div class="sts-doc-eyebrow">FLEET REFERENCE / 2120</div><h3>대표 선박 등록부</h3><p>MSV 계열 세일선과 FSV 계열 핵융합선의 대표 선명을 정리했습니다. 형식코드가 정해진 함선은 기존 표기를 그대로 사용했습니다. 그 외 함선의 질량·출력·건조소·취역연도는 미확정입니다.</p>'+
 '<div class="sts-fleet-filters" role="group" aria-label="선박 운용별 분류">'+categories.map((c,i)=>'<button type="button" data-fleet="'+E(c)+'" aria-pressed="'+(i===0)+'">'+E(c)+'</button>').join('')+'</div>'+
 '<div class="sts-doc-table-wrap"><table class="sts-doc-table"><thead><tr><th>선명</th><th>계열·형식</th><th>등록 운용</th></tr></thead><tbody id="stsFleetRows"></tbody></table></div>'+
 '<p class="sts-doc-footnote">본 목록은 대표 함선 선명 자료입니다. 선박 도감 위의 3D 모델 4종은 개별 함선의 확정 설계가 아닌 형식별 참고 모델입니다.</p>';
 host.appendChild(root);
 const tbody=root.querySelector('#stsFleetRows');const render=category=>{
  tbody.innerHTML=fleet.filter(x=>category==='전체'||x[0]===category).map(x=>'<tr><td><strong>'+E(x[1])+'</strong><small>'+E(x[0])+'</small></td><td>'+E(x[2])+'</td><td>'+E(x[3])+'</td></tr>').join('');
  root.querySelectorAll('[data-fleet]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fleet===category)));
 };
 root.querySelectorAll('[data-fleet]').forEach(b=>b.addEventListener('click',()=>render(b.dataset.fleet)));
 render('전체');return true;
}
if(!renderFleet()&&$('#vesselsView')){const observer=new MutationObserver(()=>{if(renderFleet())observer.disconnect()});observer.observe($('#vesselsView'),{childList:true})}
window.STS_CANONICAL_REFERENCE_READY=true;
})();