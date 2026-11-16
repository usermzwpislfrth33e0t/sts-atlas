/* STS / Station Engineering 01 — nine orbital infrastructure typologies.
   Uses the existing 79 facility records; all geometry is local WebGL. */
import * as THREE from './vendor/three.module.js';
const V=window.STS3D;
const host=document.getElementById('facilitiesView');
if(!V?.STATIONS?.length||!host)throw Error('STS station catalogue unavailable');
const catalogue=V.STATIONS;
const counts=Object.fromEntries([...new Set(catalogue.map(s=>s.type))].map(k=>[k,catalogue.filter(s=>s.type===k).length]));
const types=[
 ['HUB','환승 허브','Interchange hub','대형 환승 링, 압력 연결축, 다중 접안교, 관제 모듈',
  [['ring','도킹 링','다수의 선박을 수용하는 원형 접안·결합 구조입니다.'],['spine','연결축','밀폐 수송통로와 하중 전달 트러스가 연결됩니다.'],['berths','다중 접안교','계류부의 표준 인터페이스와 설비 공급 연결구입니다.'],['services','운영·정비부','관제실, 보급 구획, 전력과 열관리 설비입니다.']]],
 ['TERMINAL','항만 터미널','Passenger and freight terminal','여객 동선, 검역, 화물 취급, 선박 접근',
  [['docks','접안 헤드','여객선과 화물선의 접근 방향을 분리한 계류부입니다.'],['concourse','중앙 터미널','승객 이동·검역과 압력 연결 통로를 포함합니다.'],['berths','여객·화물 선석','선석마다 독립된 승강·물류 접속구가 있습니다.'],['utilities','항만 운영부','통신·냉각·화물 취급용 기초 설비입니다.']]],
 ['YARD','조선·정비소','Orbital shipyard','개방형 드라이도크, 구조 트러스, 제작 갠트리',
  [['dock','드라이도크','조립 중인 선체를 고정할 수 있는 개방형 지그입니다.'],['gantry','이동형 갠트리','용접·검사·구조 부품 취급을 위한 이동식 작업대입니다.'],['industry','제작 시설','자재 보관과 조립을 담당하는 산업 모듈입니다.'],['service','작업·보급부','추진제 탱크, 승무원·작업자 시설과 작업선 선석입니다.']]],
 ['RELAY','통신·항법 중계소','Tracking and communication relay','지향성 안테나, 센서 마스트, 통신 배열',
  [['sensor','탐지 구조물','교통 표적과 빔 조준을 추적하는 센서 구성입니다.'],['dishes','지향성 안테나','장거리 통신 및 추적용 가변 지향 안테나입니다.'],['arrays','배열형 송수신부','전력 수집 및 신호 송수신용 전개 패널입니다.'],['core','중계·자세제어부','통신 장비, 제한적인 작업 공간, 자세 제어계입니다.']]],
 ['ARRAY','광학 출항 배열','Beam launch and alignment array','출항 정렬 링, 광학 송전부, 냉각 구조',
  [['frame','광학 정렬 프레임','세일선 출항 방향과 송신부의 기준 축을 맞춥니다.'],['emitters','출력 배열','다수의 독립 발광·빔 형성 장치로 구성됩니다.'],['optics','광학 주축','빔 정렬과 진동 제어를 담당하는 광학 지지 구조입니다.'],['power','전력·방열부','전원 분배, 축전 및 방열 구조입니다.']]],
 ['SAFETY','안전·구난 감시소','Traffic safety outpost','추적 센서, 구조선 대기대, 관제와 경보',
  [['sensors','광역 관측 프레임','파편과 위험 접근체를 추적하기 위한 센서입니다.'],['control','관제실','안전 명령과 구조선 출동을 조정합니다.'],['rescue','구난·구조 접안부','긴급 진입 장비와 구조선 접안부입니다.'],['arms','점검 작업장치','외부 선체를 검사하고 회수하는 작업 암입니다.']]],
 ['CATCHER','궤도 캐처','Rotating tether catcher','중심 허브, 회전 테더, 양단 포획 클로와 화물 인계 시설',
  [['frame','회전 테더·중심 허브','회전하는 2기 또는 4기의 테더가 궤도 운동량을 교환합니다. 모형은 4방향 배치를 보여주며 실제 길이(15–180 km)는 축척으로 그리지 않았습니다.'],['capture','테더 끝단 포획 클로','테더 끝단의 포획 구조가 접근체의 상대속도를 맞춰 결합합니다. 중단 조건에서는 비상 분리가 가능해야 합니다.'],['cargo','궤도 화물 인계부','포획 후 작업선이 화물을 분리·정렬해 항만 및 다음 운송수단으로 인계합니다.'],['control','궤도·안전 제어부','궤도 보정 추진기, 교통 센서, 진입창 검증과 충돌 회피 제어를 담당합니다.']]],
 ['POWER','발전·송전 시설','Power generation and transmission','발전 모듈, 열관리, 전력 송전 개구',
  [['reactor','발전 모듈','발전 및 에너지 전환 장치가 격리된 장착부입니다.'],['radiators','대형 방열 구조','발전과 전력 변환 과정의 폐열을 처리합니다.'],['beam','송전부','광학 또는 마이크로파 계통의 지향성 송신부입니다.'],['support','서비스·차폐부','차폐 모듈, 전력 계측 및 정비 연결부입니다.']]],
 ['SERVICE','보급·지원 시설','Service and logistics station','추진제 저장, 예인선, 보급·정비 선석',
  [['core','지원 모듈','정비·화물 취급·통신과 일반 운영 업무를 수행합니다.'],['tanks','저장 탱크','추진제, 반응질량 및 각종 공급 물자를 저장합니다.'],['docks','서비스 선석','예인선과 보급선을 위한 다방향 접안 구조입니다.'],['radiators','전력·열관리부','보급 작업에 필요한 발전·방열·자세제어 설비입니다.']]]
];
const profile=Object.fromEntries(types.map(t=>[t[0],t]));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const section=document.createElement('section');section.id='stationyardSection';section.className='stationyard-section';
section.innerHTML=[
 '<div class="stationyard-eyebrow">STATION ARCHITECTURE / 2120 — 79 REGISTERED INSTALLATIONS</div>',
 '<div class="stationyard-intro"><div><h3>정거장 설계</h3><p>등록된 시설을 형식별로 살펴보는 3D 구조 뷰어입니다. 정거장 종류와 시설명을 선택하고, 회전하거나 부품을 선택해 보세요.</p></div><span class="stationyard-version">STS / ENGINEERING 01</span></div>',
 '<div class="shipyard-console stationyard-console"><div class="shipyard-main">',
 '<div class="stationyard-classes" role="group" aria-label="정거장 분류">',
 ...types.map((t,i)=>'<button type="button" data-type="'+t[0]+'" class="stationyard-class" aria-pressed="false"><small>'+String(i+1).padStart(2,'0')+' / '+t[0]+' · '+counts[t[0]]+'</small><strong>'+t[1]+'</strong></button>'),
 '</div>',
 '<div class="stationyard-catalogue"><label for="stationyardSelect">FACILITY REGISTER</label><select id="stationyardSelect" aria-label="3D 정거장 시설 선택"></select><span id="stationyardCount"></span></div>',
 '<div class="shipyard-viewport stationyard-viewport" id="stationyardViewport"><canvas id="stationyardCanvas" aria-label="정거장 3D 모형. 드래그로 회전, 두 손가락으로 확대·축소"></canvas>',
 '<div class="shipyard-sensor"><span><i></i>STS / STATION ENGINEERING VIEWPORT</span><b>DRAG TO ORBIT · PINCH / WHEEL TO ZOOM</b></div>',
 '<span class="shipyard-watermark">MATERIAL / SHADED</span><span class="shipyard-coordinates" id="stationyardCoord">AZ / EL / ZOOM</span><div id="stationyardPins"></div></div>',
 '<div class="shipyard-toolbar"><div class="shipyard-tools">',
 '<button type="button" class="shipyard-tool" id="stationyardAuto" aria-pressed="true">⟳ AUTO ROTATE</button>',
 '<button type="button" class="shipyard-tool" id="stationyardExplode" aria-pressed="false">EXPLODED</button>',
 '<button type="button" class="shipyard-tool" id="stationyardWire" aria-pressed="false">WIREFRAME</button>',
 '<button type="button" class="shipyard-tool" id="stationyardReset">RESET</button>',
 '<button type="button" class="shipyard-tool" id="stationyardPlus" aria-label="확대">＋</button>',
 '<button type="button" class="shipyard-tool" id="stationyardMinus" aria-label="축소">－</button></div><span class="shipyard-readout">3D GEOMETRY · LOCAL WEBGL</span></div>',
 '</div><aside class="shipyard-sidebar"><div class="shipyard-sidebar-top">',
 '<span class="shipyard-series" id="stationyardType"></span><h3 id="stationyardName"></h3><p id="stationyardRole"></p>',
 '</div><div class="shipyard-specs" id="stationyardSpecs"></div>',
 '<div class="shipyard-parts" id="stationyardParts"></div>',
 '<div class="shipyard-part-note"><b id="stationyardPartTitle"></b><p id="stationyardPartDesc"></p></div>',
 '</aside></div>',
 '<div class="stationyard-note">모델은 각 시설의 운영상 역할에 따른 형식별 개념 설계입니다. 부품 배치와 치수는 확정된 도면이 아닙니다. 등록부의 운영 자료는 기존 STS 설정을 따릅니다.</div>'
].join('');
const regControls=host.querySelector('.registry-controls');(regControls||host).before(section);
const $=q=>section.querySelector(q),$$=q=>[...section.querySelectorAll(q)];
const viewport=$('#stationyardViewport'),canvas=$('#stationyardCanvas');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x08131e);
const camera=new THREE.PerspectiveCamera(37,1,.1,400);
let renderer;try{renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:!matchMedia('(max-width:700px)').matches,powerPreference:'default'})}
catch(err){viewport.insertAdjacentHTML('beforeend','<p class="stationyard-error">이 브라우저에서는 3D 렌더링을 시작할 수 없습니다. WebGL 지원을 확인해 주세요.</p>');console.warn(err)}
if(renderer){renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.19;renderer.setPixelRatio(Math.min(devicePixelRatio||1,matchMedia('(max-width:700px)').matches?1.2:1.6))}
scene.add(new THREE.HemisphereLight(0xe8f4ff,0x101e2d,1.65));
function directional(col,intensity,x,y,z){const light=new THREE.DirectionalLight(col,intensity);light.position.set(x,y,z);scene.add(light)}
directional(0xe8f5ff,3.2,-7,9,11);directional(0x96b8d8,1.8,8,-3,-9);directional(0xe0af82,.62,4,7,-5);
const material={
 alloy:new THREE.MeshStandardMaterial({color:0x7e96a5,metalness:.69,roughness:.42,side:THREE.DoubleSide}),
 white:new THREE.MeshStandardMaterial({color:0xbccbd4,metalness:.37,roughness:.53,side:THREE.DoubleSide}),
 ceramic:new THREE.MeshStandardMaterial({color:0xe2e6e5,metalness:.20,roughness:.56,side:THREE.DoubleSide}),
 dark:new THREE.MeshStandardMaterial({color:0x283c4c,metalness:.57,roughness:.49,side:THREE.DoubleSide}),
 frame:new THREE.MeshStandardMaterial({color:0x576d7a,metalness:.76,roughness:.44,side:THREE.DoubleSide}),
 copper:new THREE.MeshStandardMaterial({color:0x895d46,metalness:.61,roughness:.43,side:THREE.DoubleSide}),
 gold:new THREE.MeshStandardMaterial({color:0xb7955a,metalness:.75,roughness:.38,side:THREE.DoubleSide}),
 hazard:new THREE.MeshStandardMaterial({color:0xc18b41,metalness:.48,roughness:.47,side:THREE.DoubleSide}),
 solar:new THREE.MeshStandardMaterial({color:0x263b50,metalness:.51,roughness:.47,side:THREE.DoubleSide}),
 glass:new THREE.MeshPhysicalMaterial({color:0x3b798d,metalness:.19,roughness:.25,clearcoat:.5,side:THREE.DoubleSide}),
 blue:new THREE.MeshStandardMaterial({color:0x9fc6d8,metalness:.36,roughness:.34,side:THREE.DoubleSide}),
 light:new THREE.MeshStandardMaterial({color:0x8fd8f4,emissive:0x4caaca,emissiveIntensity:1.5,roughness:.38}),
 amber:new THREE.MeshStandardMaterial({color:0xdfb77a,emissive:0x8c6029,emissiveIntensity:1.1}),
 red:new THREE.MeshStandardMaterial({color:0xc56e66,emissive:0x903d3e,emissiveIntensity:1.3})
};
const V3=(a,b,c)=>new THREE.Vector3(a||0,b||0,c||0);
const main=new THREE.Group();scene.add(main);
let root,parts={},anchors={},selected=null,activeRecord=null;
const state={yaw:-.61,pitch:.29,dist:25,targetDist:25,auto:!matchMedia('(prefers-reduced-motion: reduce)').matches,explode:false,wire:false,moving:new Map(),dirty:true,w:0,h:0};
function part(name){const g=new THREE.Group();g.userData.part=name;root.add(g);parts[name]=g;return g}
function add(g,geometry,mat='alloy',pos=[0,0,0],rotation){const m=new THREE.Mesh(geometry,material[mat].clone());m.position.set(...pos);if(rotation)m.rotation.set(...rotation);m.userData.part=g.userData.part;g.add(m);return m}
function box(g,p,s,mat='alloy'){return add(g,new THREE.BoxGeometry(...s),mat,p)}
function beam(g,a,b,r=.055,mat='frame',segments=8){
 const A=V3(...a),B=V3(...b),d=B.clone().sub(A),len=d.length();if(len<.001)return;
 const mesh=add(g,new THREE.CylinderGeometry(r,r,len,segments),mat,A.add(B).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(V3(0,1,0),d.normalize());return mesh}
function tube(g,a,b,r=.5,mat='white',segments=16,r2=r){const A=V3(...a),B=V3(...b),d=B.clone().sub(A);
 const m=add(g,new THREE.CylinderGeometry(r2,r,d.length(),segments),mat,A.add(B).multiplyScalar(.5));m.quaternion.setFromUnitVectors(V3(0,1,0),d.normalize());return m}
function ring(g,R,r,z,mat='frame',n=48){return add(g,new THREE.TorusGeometry(R,r,9,n),mat,[0,0,z])}
function orb(g,p,r,mat='light'){return add(g,new THREE.SphereGeometry(r,10,8),mat,p)}
function octagonal(g,R,z,r=.14,mat='frame',n=12){for(let i=0;i<n;i++){let a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n;beam(g,[Math.cos(a)*R,Math.sin(a)*R,z],[Math.cos(b)*R,Math.sin(b)*R,z],r,mat,8)}}
function beacon(g,p){tube(g,[p[0],p[1],p[2]],[p[0],p[1]+.47,p[2]],.025,'frame',7);orb(g,[p[0],p[1]+.5,p[2]],.085,'amber')}
function lattice(g,z0,z1,r=.6,steps=6){const P=[[-r,-r],[r,-r],[r,r],[-r,r]];for(const [x,y] of P)beam(g,[x,y,z0],[x,y,z1],.052,'alloy');
for(let i=0;i<steps;i++){let a=z0+(z1-z0)*i/steps,b=z0+(z1-z0)*(i+1)/steps;for(let j=0;j<4;j++){const A=P[j],B=P[(j+1)%4];beam(g,[A[0],A[1],a],[B[0],B[1],a],.038,'frame');beam(g,[A[0],A[1],a],[B[0],B[1],b],.028,'frame')}}}
function port(g,p,R=.36,mat='gold',axis='z'){let rr=ring(g,R,.045,p[2],mat,24);rr.position.x=p[0];rr.position.y=p[1];if(axis==='x')rr.rotation.y=Math.PI/2;return rr}
function pressure(g,a,b,R=.67,mat='white'){tube(g,[0,0,a],[0,0,b],R,mat,20);
 for(let z=a+.27;z<b;z+=.75){ring(g,R+.025,.034,z,'frame',24)}
 for(let z=a+.45;z<b-.25;z+=1.1){for(const s of [-1,1])box(g,[s*R*.99,0,z],[.09,.22,.42],'glass')}
 for(let z=a+.24;z<b-.17;z+=.6){for(let j=0;j<8;j++){const t=j*Math.PI/4;const x=Math.cos(t)*(R+.026),y=Math.sin(t)*(R+.026);
 const shield=box(g,[x,y,z],[.18,.047,.37],j%3===0?'alloy':j%2===0?'white':'frame');shield.rotation.z=t;
 if(j%4===0)box(g,[x*1.018,y*1.018,z],[.08,.055,.18],'dark')}}}
function panels(g,xCenter,zCenter,span=4,length=3,y=0){
 for(let s of [-1,1]){const w=span*.44,x=xCenter+s*(span*.26+.38);const slab=box(g,[x,y,zCenter],[w,.035,length],'solar');
 for(let j=0;j<5;j++){let xx=x-w*.5+j*w/4;beam(g,[xx,y+.037,zCenter-length*.48],[xx,y+.037,zCenter+length*.48],.018,'blue',5)}
 for(let j=0;j<5;j++){let z=zCenter-length*.5+j*length/4;beam(g,[x-w*.49,y+.039,z],[x+w*.49,y+.039,z],.014,'frame',5)}
 beam(g,[xCenter,y-.08,zCenter],[x,y,zCenter],.055,'frame')}
}
function tanks(g,baseZ=4,number=6,r=0.38){for(let i=0;i<number;i++){const side=i%2?-1:1,layer=Math.floor(i/2),x=side*(.9+layer*.62),y=-.72-(i%3)*.12;const z=baseZ+(layer%2)*.7;
 tube(g,[x,y,z-.85],[x,y,z+.85],r,'white',14);for(const zz of [-.6,.55]){const t=ring(g,r+.03,.05,z+zz,'gold',18);t.position.x=x;t.position.y=y}box(g,[x,y+r,z],[.38,.11,.65],'dark')}}
function dockingArms(g,zs=[-1.5,1.5,4.5]){for(const z of zs)for(const s of [-1,1]){let y=s*1.25;beam(g,[0,s*.54,z],[0,y,z],.15,'frame');
 box(g,[0,y,z],[2.65,.27,.43],'alloy');box(g,[0,y+s*.15,z],[2.25,.06,.31],'white');
 for(const x of [-1.15,1.15]){box(g,[x,y,z],[.34,.47,.55],'ceramic');beacon(g,[x,y+.25,z]);box(g,[x,y+s*.13,z+.31],[.27,.15,.08],'glass')}
 for(const x of [-.8,.8]){port(g,[x,y,z+.24],.18,'blue');box(g,[x,y+s*.11,z],[.30,.075,.12],'hazard')}
 for(let x=-1.06;x<1.14;x+=.35){beam(g,[x,y+.21,z-.17],[x,y+.21,z+.17],.022,'frame',6)}
 }}
function trussBox(g,x0,x1,y0,y1,z0,z1){const corners=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];for(const [x,y] of corners)beam(g,[x,y,z0],[x,y,z1],.075,'frame');for(const z of [z0,z1])for(let i=0;i<4;i++){let a=corners[i],b=corners[(i+1)%4];beam(g,[...a,z],[...b,z],.072,'alloy')}for(let i=0;i<4;i++){let a=corners[i],b=corners[(i+1)%4];beam(g,[...a,z0],[...b,z1],.042,'frame')}}
function dish(g,p,R=1.05,tilt=0){const curve=[];for(let i=0;i<=16;i++){const r=R*i/16;curve.push(new THREE.Vector2(r,-.32+.34*(r/R)**2))}
 const geom=new THREE.LatheGeometry(curve,48);const m=add(g,geom,'alloy',p,[tilt,0,.35]);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(R,.034,6,48),material.ceramic.clone());
 rim.rotation.x=Math.PI/2;rim.position.set(p[0],p[1]+.01,p[2]);rim.userData.part=g.userData.part;g.add(rim);
 for(let k=0;k<12;k++){const a=k*Math.PI/6,rr=R*.90;beam(g,[p[0],p[1]-.28,p[2]],[p[0]+Math.cos(a)*rr,p[1],p[2]+Math.sin(a)*rr],.015,'frame',5)}
 beam(g,[p[0],p[1]-.12,p[2]],[p[0],p[1]+R*.70,p[2]],.045,'frame');orb(g,[p[0],p[1]+R*.70,p[2]],.11,'light');return m}
function controlPod(g,p=[0,0,0],size=1){box(g,p,[1.7*size,.8*size,1.25*size],'ceramic');box(g,[p[0],p[1]+.25*size,p[2]+.3*size],[1.54*size,.30*size,.18*size],'glass');
for(const x of [-.7,.7])beacon(g,[p[0]+x*size,p[1]+.48*size,p[2]])}
function segmentedRing(g,R,z,mat='white'){ring(g,R,.27,z,mat,64);ring(g,R-.27,.055,z,'gold',64);
 for(let i=0;i<24;i++){const a=i*2*Math.PI/24,x=Math.cos(a)*R,y=Math.sin(a)*R;
 const p=box(g,[x,y,z],[.55,.31,.69],i%4===0?'ceramic':i%3===0?'alloy':'frame');p.rotation.z=a+Math.PI*.5;
 const rr=box(g,[x*1.063,y*1.063,z+.17],[.20,.045,.40],i%5===0?'hazard':'dark');rr.rotation.z=a+Math.PI*.5;
 if(i%2===0)orb(g,[x*1.04,y*1.04,z+.42],.055,i%6===0?'amber':'light');
 if(i%3===0){beam(g,[Math.cos(a)*R,Math.sin(a)*R,z-.38],[Math.cos(a)*R,Math.sin(a)*R,z+.39],.045,'gold',7)}
 }}
function hub(){const ringG=part('ring'),spine=part('spine'),berths=part('berths'),service=part('services');
segmentedRing(ringG,4.0,-4.5,'white');segmentedRing(ringG,3.75,-4.9,'frame');
for(let i=0;i<12;i++){const a=i*2*Math.PI/12;beam(ringG,[0,0,-4.5],[Math.cos(a)*3.8,Math.sin(a)*3.8,-4.5],.07,'frame')}
pressure(spine,-4.3,7.6,.59);lattice(spine,-3.8,7.3,.75,9);
dockingArms(berths,[-.5,2.2,4.9]);controlPod(service,[0,1.34,-4.5],.8);
for(const x of [-1.3,1.3])tube(service,[x,-.7,5],[x,-.7,8],.33,'ceramic');
panels(service,0,5.9,6.7,2,-1.6);beacon(service,[0,1.15,7.7]);
return {ring:[-2.8,2.7,-4.5],spine:[0,.6,.0],berths:[1.2,1.4,2.2],services:[0,1.4,6.0]}}
function terminal(){const docks=part('docks'),conc=part('concourse'),berths=part('berths'),util=part('utilities');
segmentedRing(docks,3.2,-5.1);segmentedRing(docks,2.9,-4.78,'frame');
for(let i=0;i<8;i++){const a=i*Math.PI/4;let x=3.28*Math.cos(a),y=3.28*Math.sin(a);box(docks,[x,y,-5.0],[.68,.54,1.1],'ceramic').rotation.z=a;port(docks,[x,y,-4.32],.23,'blue')}
pressure(conc,-4.75,8.6,.83);ring(conc,.87,.16,1,'gold',36);
for(let z=-4.1;z<8;z+=.8)for(let s of [-1,1]){box(conc,[s*.76,.18,z],[.10,.20,.5],'glass');box(conc,[s*.55,-.66,z],[.23,.13,.18],'dark')}
for(let z of [-2,0.5,3,5.5])for(const s of [-1,1]){const x=s*1.9;box(berths,[x,0,z],[2.9,.36,.6],'alloy');box(berths,[s*3.25,0,z],[.53,.76,.83],'ceramic');port(berths,[s*3.25,0,z+.43],.26,'blue');for(const sx of [-.6,.6])beacon(berths,[x+sx,.26,z])}
controlPod(util,[0,1.8,-4.8],1);lattice(util,7.1,9.2,.95,3);tanks(util,8.4,4,.32);panels(util,0,2.1,5.2,2.0,-1.3);
return {docks:[-2.7,2.0,-5],concourse:[0,.8,2.5],berths:[3.2,0,3],utilities:[0,1.65,7.7]}}
function yard(){const dock=part('dock'),gantry=part('gantry'),industry=part('industry'),service=part('service');
lattice(industry,-8,1.8,.93,10);controlPod(industry,[0,1.55,-5.6],1.1);
for(const x of [-3.6,3.6])for(const y of [-2.35,2.35])beam(dock,[x,y,1],[x,y,9.7],.16,'alloy');
for(const z of [1,3.2,5.4,7.6,9.7])trussBox(dock,-3.6,3.6,-2.35,2.35,z,z+.08);
for(let z=2;z<9;z+=1.25){beam(dock,[-2.0,-1.1,z],[2,-1.1,z],.06,'frame');box(dock,[0,-1.2,z],[3.0,.18,.32],'dark')}
tube(dock,[0,0,3.2],[0,0,7.5],.73,'frame');for(const z of [3,5,7])ring(dock,.82,.08,z,'ceramic',28);
for(const z of [2.1,5.3,8.2]){beam(gantry,[-4,2.75,z],[4,2.75,z],.17,'hazard');beam(gantry,[0,2.75,z],[0,1.2,z],.055,'hazard');box(gantry,[0,1.18,z],[.46,.54,.58],'alloy');
for(const x of [-3.5,3.5])beam(gantry,[x,2.35,z],[x,2.9,z],.10,'hazard')}
for(let z=-7;z<-1.2;z+=1.7){box(industry,[1.5,0,z],[1.6,1.0,1.1],'alloy');box(industry,[1.5,.52,z],[1.4,.05,.9],'dark')}
tanks(service,-5.6,6,.43);panels(service,0,-5.8,5.2,2.7,-1.8);beacon(service,[0,1.6,-6]);
return {dock:[3.3,1.6,6],gantry:[0,2.75,5.3],industry:[1.2,1,-3.3],service:[-1.4,-.9,-5.8]}}
function relay(){const sensor=part('sensor'),dishes=part('dishes'),arrays=part('arrays'),core=part('core');
lattice(sensor,-5,3.3,.28,11);segmentedRing(sensor,2.7,-2.5,'frame');for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(sensor,[0,0,-2.5],[Math.cos(a)*2.7,Math.sin(a)*2.7,-2.5],.055,'gold')}
beam(sensor,[0,-3.8,-2.5],[0,4.7,-2.5],.074,'frame');beacon(sensor,[0,4.7,-2.5]);
for(const p of [[1.2,1.2,1.4],[-1.3,1.6,.3],[.5,-1.8,1.6]])dish(dishes,p,p[0]<0?.68:1.03,.32);
lattice(arrays,3,9,.45,7);
for(const y of [-1.5,1.5]){box(arrays,[0,y,7],[8.7,.055,2.1],'solar');for(let i=0;i<10;i++)beam(arrays,[-4.3+i*.93,y+.04,5.98],[-4.3+i*.93,y+.04,8.02],.017,'blue',6)}
pressure(core,-5,-3.6,.62);pressure(core,1.25,3.6,.55);controlPod(core,[0,0,-5.4],.65);beacon(core,[0,.88,2.5]);
return {sensor:[-2.1,1.6,-2.5],dishes:[1.2,1.6,1.4],arrays:[3.5,1.4,7],core:[0,.6,2.2]}}
function array(){const frame=part('frame'),emit=part('emitters'),optics=part('optics'),power=part('power');
segmentedRing(frame,4.2,-5.2,'alloy');segmentedRing(frame,3.9,-4.8,'frame');
for(let i=0;i<12;i++){const a=i*2*Math.PI/12;beam(frame,[0,0,-5.0],[Math.cos(a)*3.92,Math.sin(a)*3.92,-5.0],.078,'gold')}
lattice(optics,-4.6,6.6,.78,8);pressure(optics,-4.8,-.7,.51,'glass');for(let z=-4;z<-.7;z+=.58)ring(optics,.58,.053,z,'light',24);
for(let z of [-.6,.9,2.4,3.9,5.4])for(const s of [-1,1]){let x=s*2.1,y=1.15;
box(emit,[x,y,z],[1.06,.24,.76],'alloy');box(emit,[x,y+.15,z],[.72,.11,.50],'light');
box(emit,[x,-y,z],[1.06,.24,.76],'alloy');box(emit,[x,-y-.15,z],[.72,.11,.50],'blue');
beam(emit,[s*.75,0,z],[x,y,z],.061,'frame')}
pressure(power,5.6,8.4,.84,'alloy');panels(power,0,6.8,8.1,3.1,-2.3);controlPod(power,[0,1.4,-4.1],.9);beacon(power,[0,1.8,7.6]);
return {frame:[-3.2,2.8,-5.0],emitters:[2.1,1.3,2.4],optics:[0,.5,-2.1],power:[3.5,-2.3,6.8]}}
function safety(){const sensors=part('sensors'),control=part('control'),rescue=part('rescue'),arms=part('arms');
segmentedRing(sensors,3.3,-1.0,'frame');for(let i=0;i<12;i++){const a=i*Math.PI/6;beam(sensors,[Math.cos(a)*3.3,Math.sin(a)*3.3,-1.0],[Math.cos(a)*3.3,Math.sin(a)*3.3,1],.06,'alloy')}
dish(sensors,[.8,2.35,1.8],.82,.3);beacon(sensors,[0,3.6,.2]);
pressure(control,-2.6,2.8,1.07);controlPod(control,[0,1.12,-1.5],.85);
for(const z of [-1.2,1.1]){box(rescue,[1.85,-1.0,z],[2.4,1.05,1.1],'white');box(rescue,[3.1,-.95,z],[.10,.76,.90],'hazard');for(const x of [1,2.6])beacon(rescue,[x,-.37,z])}
box(rescue,[-1.7,-1.4,1],[3.0,.26,1.35],'frame');for(const x of [-2.6,-.8])box(rescue,[x,-1.12,1],[.74,.54,.88],'ceramic');
const P=[[-1.15,-1.4,-.5],[-2.8,-2.0,1.6],[-3.7,-2.5,3.0],[-4.1,-2.4,4.1]];
for(let i=0;i<P.length-1;i++){beam(arms,P[i],P[i+1],.13,'alloy');orb(arms,P[i+1],.22,'hazard')}
return {sensors:[-2.3,2.4,-1],control:[0,1.7,-1.5],rescue:[2.55,-.95,1.1],arms:[-3.7,-2.5,3]}}
function catcher(){
 const frame=part('frame'),capture=part('capture'),cargo=part('cargo'),control=part('control');
 // Not to scale. Four rotating tether assemblies run in the same plane.
 const R=7.0;
 ring(frame,1.30,.29,-1.25,'alloy',48);ring(frame,1.10,.07,-1.23,'gold',48);
 tube(frame,[0,0,-2.55],[0,0,.72],.90,'ceramic',20);
 for(let i=0;i<4;i++){
   const a=i*Math.PI/2,ux=Math.cos(a),uy=Math.sin(a),vx=-uy,vy=ux;
   const pt=(r,t=0,z=-1.25)=>[ux*r+vx*t,uy*r+vy*t,z];
   for(const t of [-.20,.20])beam(frame,pt(1.1,t,-1.55),pt(R-.38,t,-1.55),.066,'frame',10);
   for(let r=1.3;r<R-.60;r+=.73){
     const rr=Math.min(R-.38,r+.73);
     beam(frame,pt(r,-.2,-1.55),pt(rr,.2,-1.55),.035,'alloy',6);
     beam(frame,pt(r,.2,-1.55),pt(rr,-.2,-1.55),.035,'alloy',6);
     beam(frame,pt(r,-.2,-1.55),pt(r,.2,-1.55),.040,'alloy',7);
     beam(frame,pt(r,0,-1.50),pt(r,0,-1.12),.042,'alloy',7);
   }
   beam(frame,pt(1.2,0,-1.55),pt(R-.25,0,-1.18),.038,'gold',8);
   for(let r=2;r<R;r+=1.35)box(frame,pt(r,0,-1.06),[.32,.22,.22],'dark').rotation.z=a;
   const tip=pt(R,0,-1.13);
   orb(capture,tip,.34,'alloy');
   const ringTip=ring(capture,.58,.11,tip[2]+.14,'white',36);ringTip.position.x=tip[0];ringTip.position.y=tip[1];
   const target=pt(R+.56,0,-1.13);
   beam(capture,pt(R,-.4,-1.05),target,.10,'hazard',10);
   beam(capture,pt(R,.4,-1.05),target,.10,'hazard',10);
   for(const t of [-.36,.36]){
     box(capture,pt(R+.53,t,-.88),[.34,.24,.42],i%2?'hazard':'white').rotation.z=a;
     orb(capture,pt(R+.61,t,-.53),.075,'light');
   }
   beacon(capture,pt(R-.45,0,-.97));
 }
 lattice(cargo,.15,6.8,.85,7);
 for(let z=1;z<5.6;z+=1.25)for(let x of [-.52,.52]){
   box(cargo,[x,-.4,z],[.86,.68,.98],z>3?'alloy':'white');
   box(cargo,[x,-.04,z],[.71,.04,.65],'dark');
 }
 pressure(control,-3.95,-2.1,.71,'alloy');
 controlPod(control,[0,1.2,5.9],.91);
 dish(control,[0,1.6,3.55],.72,.26);
 for(let x of [-1.55,1.55]){
   tube(control,[x,0,4.7],[x,0,7.2],.32,'frame',16);
   beacon(control,[x,.45,7.0]);
 }
 return {frame:[-4.5,0,-1.2],capture:[6.6,.3,-.9],cargo:[.7,-.4,2.8],control:[0,1.9,5.9]};
}
function power(){const reactor=part('reactor'),rad=part('radiators'),beamG=part('beam'),support=part('support');
lattice(reactor,-6.3,6,.79,9);for(const z of [-4.4,-1.85,.7]){tube(reactor,[0,0,z-1],[0,0,z+.98],1.05,'alloy',20);for(const zz of [-.92,.90])ring(reactor,1.09,.095,z+zz,'gold',32);
for(let k=0;k<8;k++){let a=k*Math.PI/4;box(reactor,[Math.cos(a)*1.05,Math.sin(a)*1.05,z],[.27,.3,1.5],'dark')}}
for(const s of [-1,1]){for(let z of [-3.3,.2,3.6]){box(rad,[s*3.1,0,z],[3.75,.06,2.2],'copper');for(let j=0;j<6;j++)beam(rad,[s*(1.24+j*.6),.05,z-1.07],[s*(1.24+j*.6),.05,z+1.07],.02,'frame')}}
pressure(support,3.8,7.2,.73,'white');dish(beamG,[0,.7,7.8],1.76,.9);for(let x of [-1.2,1.2]){dish(beamG,[x,-.6,6.3],.6,.65)}beacon(support,[0,1.6,6.7]);
return {reactor:[0,1.0,-1.8],radiators:[3.1,0,.2],beam:[0,1.35,7.8],support:[0,.7,5.5]}}
function service(){const core=part('core'),tanksG=part('tanks'),docks=part('docks'),rad=part('radiators');
lattice(core,-5.7,6.4,.78,8);pressure(core,-4.8,3.8,.87);controlPod(core,[0,1.25,-3],.95);
for(const s of [-1,1])for(const y of [-1,1]){let x=s*1.5,yy=y*1.1;tube(tanksG,[x,yy,-4],[x,yy,2],.48,'white');for(let z of [-3.5,.8]){const q=ring(tanksG,.53,.05,z,'gold',20);q.position.x=x;q.position.y=yy}}
for(const z of [-4,0,4.3])for(const s of [-1,1]){beam(docks,[s*.7,0,z],[s*3.15,0,z],.11,'alloy');box(docks,[s*3.15,0,z],[.65,.85,.85],'ceramic');const p=port(docks,[s*3.15,0,z+.45],.33,'blue');beacon(docks,[s*3.15,.5,z])}
panels(rad,0,5.0,6.8,2.5,-1.7);for(const x of [-.95,.95])tube(rad,[x,.8,4.0],[x,.8,5.9],.22,'frame');
return {core:[0,1.2,-3],tanks:[-1.5,1.1,-1.0],docks:[3.15,.0,0],radiators:[3,-1.7,5]}}

function paintMark(g,text,p=[-.91,.21,0],width=1.3,height=.41){
 const cnv=document.createElement('canvas');cnv.width=512;cnv.height=160;const c=cnv.getContext('2d');
 if(!c)return;c.clearRect(0,0,512,160);
 c.fillStyle='#f0f3f3';c.font='bold 51px ui-monospace,monospace';c.fillText('STS  /  '+text,13,93);
 c.fillStyle='#91bace';c.fillRect(13,109,280,6);c.fillStyle='#dfe9ee';c.font='26px ui-monospace,monospace';c.fillText('INFRASTRUCTURE · 2120',13,145);
 const texture=new THREE.CanvasTexture(cnv);texture.colorSpace=THREE.SRGBColorSpace;
 const mat=new THREE.MeshStandardMaterial({map:texture,transparent:true,side:THREE.DoubleSide,emissive:0x18202a,emissiveIntensity:.2,roughness:.66,depthWrite:false});
 const model=new THREE.Mesh(new THREE.PlaneGeometry(width,height),mat);model.position.set(...p);model.rotation.y=-Math.PI/2;model.userData.part=g.userData.part;g.add(model);
}
function braceBridge(g,r,z0,z1){for(let s of [-1,1])for(let t of [-1,1]){
 const x=s*r,y=t*r;beam(g,[x,y,z0],[x,y,z1],.07,'frame');
 for(let i=0;i<4;i++){const a=z0+(z1-z0)*i/4,b=z0+(z1-z0)*(i+1)/4;
 beam(g,[x,y,a],[-x,y,b],.024,'gold',6)}
}}
function finishStation(ty,record){
 const first=profile[ty][4][0][0],g=parts[first];if(!g)return;
 const marked=parts[ty==='YARD'?'industry':ty==='RELAY'?'core':ty==='ARRAY'?'power':ty==='SAFETY'?'control':ty==='CATCHER'?'control':ty==='POWER'?'support':ty==='SERVICE'?'core':ty==='TERMINAL'?'concourse':'spine'];
 if(marked)paintMark(marked,record.id,[-.89,.30,ty==='YARD'?-4.0:ty==='ARRAY'?7:ty==='RELAY'?1.9:ty==='CATCHER'?5.4:ty==='POWER'?5:1.8],1.1,.33);
 if(ty==='YARD'){
  const D=parts.dock,G=parts.gantry;
  for(const x of [-3.6,3.6])for(const y of [-2.35,2.35])for(let z=1;z<9;z+=1.25){
   beam(D,[x,y,z],[x,y>0?y-.50:y+.50,z+1.25],.036,'frame');}
  for(let z=1.25;z<9;z+=.80){for(const x of [-3.1,3.1]){box(D,[x,-2.35,z],[.37,.11,.32],'dark');box(D,[x,-2.27,z],[.13,.06,.24],'hazard')}}
  for(const z of [2.1,5.3,8.2]){for(let x=-3;x<=3;x+=1.2){box(G,[x,2.82,z],[.25,.10,.45],'frame')}}
 }
 if(ty==='ARRAY'){const E=parts.emitters;
  for(const z of [-.6,.9,2.4,3.9,5.4])for(const s of [-1,1])for(const y of [-1.15,1.15]){
    box(E,[s*2.1,y,z+.10],[.78,.10,.43],'glass');
    for(let i=-1;i<=1;i++)box(E,[s*2.1+i*.22,y+(y>0?.17:-.17),z+.13],[.1,.025,.36],'light');
  }}
 if(ty==='SAFETY'){const R=parts.rescue,C=parts.control;
  for(const s of [-1,1]){box(R,[2.95,-.95,s*1.1],[.12,.63,.84],'dark');
   for(let z=-.25;z<.3;z+=.14)box(R,[3.04,-.70,s*1.1+z],[.035,.1,.08],'hazard')}
  for(let z=-2;z<2.2;z+=.55){box(C,[0,1.08,z],[.32,.10,.23],'glass')}
  const S=parts.sensors;for(const a of [0,Math.PI/2,Math.PI,1.5*Math.PI]){
   const x=Math.cos(a)*3.3,y=Math.sin(a)*3.3;
   box(S,[x,y,1.07],[.72,.14,.45],'solar').rotation.z=a;}
 }
 if(ty==='CATCHER'){
  // End-effector proximity marker and independent tether inspection nodes.
  const G=parts.capture;for(let a=0;a<4;a++){const t=a*Math.PI/2;
  const x=Math.cos(t)*6.1,y=Math.sin(t)*6.1;orb(G,[x,y,-.94],.11,'amber')}}

 if(ty==='POWER'){const R=parts.reactor;for(let z=-4.7;z<1.4;z+=.72){for(let a=0;a<8;a++){
  const t=a*Math.PI/4,x=Math.cos(t)*1.06,y=Math.sin(t)*1.06;
  box(R,[x,y,z],[.18,.06,.29],a%2?'dark':'gold').rotation.z=t}}}
 if(ty==='RELAY'){const A=parts.arrays;for(let z=6;z<8;z+=.36)for(let y of [-1.5,1.5]){
  beam(A,[-4.1,y+.06,z],[4.1,y+.06,z],.02,'frame',6)}}
 if(ty==='HUB'||ty==='TERMINAL'){const G=parts[ty==='HUB'?'services':'utilities'];
 for(let i=0;i<8;i++){const t=i*Math.PI/4;const x=Math.cos(t)*.9,y=Math.sin(t)*.9;
  box(G,[x,y,7.5],[.16,.11,.58],'dark').rotation.z=t}}
 if(ty==='SERVICE'){const T=parts.tanks;for(let x of [-1.5,1.5])for(let y of [-1.1,1.1])for(let z=-3.2;z<=1.2;z+=1.1){
  box(T,[x,y+.51,z],[.33,.055,.27],'dark');}}
}

const builders={HUB:hub,TERMINAL:terminal,YARD:yard,RELAY:relay,ARRAY:array,SAFETY:safety,CATCHER:catcher,POWER:power,SERVICE:service};
function refreshAppearance(){for(const [key,g] of Object.entries(parts))g.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(!m.userData.base)m.userData.base=m.emissive.clone();
 m.emissive.copy(m.userData.base);if(key===selected)m.emissive.add(new THREE.Color(0x12354c));m.wireframe=state.wire;m.needsUpdate=true});state.dirty=true}
function choosePart(key){if(!parts[key])return;selected=key;const spec=profile[activeRecord.type][4].find(p=>p[0]===key);if(!spec)return;
 $('#stationyardPartTitle').textContent=key.toUpperCase()+' / '+spec[1];$('#stationyardPartDesc').textContent=spec[2];
 $$('#stationyardParts button, #stationyardPins button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.part===key)));
 refreshAppearance()}
function choose(st){
 if(!st)return;activeRecord=st;const cl=profile[st.type]||profile.SERVICE;
 $$('.stationyard-class').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.type===st.type)));
 $('#stationyardSelect').value=st.id;$('#stationyardCount').textContent=st.id+' / '+st.region.toUpperCase();
 $('#stationyardType').textContent=st.id+' / '+st.type+' / '+cl[2].toUpperCase();
 $('#stationyardName').textContent=st.name;$('#stationyardRole').textContent=st.role||cl[3];
 const stats=[['REGION',st.region],['ORBIT / LOCATION',st.orbit],['MASS',st.mass],['BERTHS',st.berths==null?'—':String(st.berths)],['ELECTRIC',st.electric||'—'],['COMMISSIONED',st.commissioned||'—']];
 $('#stationyardSpecs').innerHTML=stats.map(([a,b])=>'<div><small>'+esc(a)+'</small><strong>'+esc(b||'—')+'</strong></div>').join('');
 $('#stationyardParts').innerHTML='<div class="shipyard-parts-title">SYSTEMS / '+cl[4].length+' COMPONENTS</div>'+cl[4].map((p,i)=>'<button type="button" class="shipyard-part" data-part="'+p[0]+'" aria-pressed="false"><span><em>'+String(i+1).padStart(2,'0')+'</em>'+esc(p[1])+'</span></button>').join('');
 $('#stationyardPins').innerHTML=cl[4].map(p=>'<button type="button" class="shipyard-pin" data-part="'+p[0]+'" aria-label="'+esc(p[1])+' 선택" title="'+esc(p[1])+'" aria-pressed="false"></button>').join('');
 $$('#stationyardParts button, #stationyardPins button').forEach(b=>b.addEventListener('click',()=>choosePart(b.dataset.part)));
 while(main.children.length){const old=main.children[0];main.remove(old);old.traverse(o=>{o.geometry?.dispose();o.material?.dispose()})}
 root=new THREE.Group();main.add(root);parts={};anchors=builders[st.type]?.()||service();finishStation(st.type,st);
 const scale=Math.max(.85,Math.min(1.22,.85+Math.log10(Math.max(200,st.mass_t||15000))/18));root.scale.setScalar(scale);
 state.dist=st.type==='CATCHER'?38:st.type==='YARD'?34:st.type==='ARRAY'?31:st.type==='HUB'?31:st.type==='TERMINAL'?30:st.type==='RELAY'?29:27;state.targetDist=state.dist;
 state.yaw=-.66;state.pitch=.27;state.explode=false;$('#stationyardExplode').setAttribute('aria-pressed','false');
 choosePart(cl[4][0][0]);state.dirty=true;
}
const selector=$('#stationyardSelect');
selector.innerHTML=catalogue.map(st=>'<option value="'+esc(st.id)+'">'+esc(st.id+'  /  '+st.name+'  —  '+st.region)+'</option>').join('');
selector.addEventListener('change',()=>choose(V.STATION_BY_ID[selector.value]));
$$('.stationyard-class').forEach(b=>b.addEventListener('click',()=>choose(catalogue.find(st=>st.type===b.dataset.type))));
const act=(id,fn)=>$('#'+id).addEventListener('click',fn);
act('stationyardAuto',()=>{state.auto=!state.auto;$('#stationyardAuto').setAttribute('aria-pressed',String(state.auto))});
act('stationyardExplode',()=>{state.explode=!state.explode;$('#stationyardExplode').setAttribute('aria-pressed',String(state.explode));state.dirty=true});
act('stationyardWire',()=>{state.wire=!state.wire;$('#stationyardWire').setAttribute('aria-pressed',String(state.wire));refreshAppearance()});
act('stationyardReset',()=>{choose(activeRecord);state.auto=true;$('#stationyardAuto').setAttribute('aria-pressed','true')});
act('stationyardPlus',()=>state.targetDist=Math.max(13,state.targetDist*.84));
act('stationyardMinus',()=>state.targetDist=Math.min(74,state.targetDist*1.19));
const pointers=new Map();
viewport.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;
 viewport.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 state.auto=false;$('#stationyardAuto').setAttribute('aria-pressed','false');viewport.classList.add('dragging')});
viewport.addEventListener('pointermove',e=>{const old=pointers.get(e.pointerId);if(!old)return;const now={x:e.clientX,y:e.clientY};pointers.set(e.pointerId,now);
 if(pointers.size===1){state.yaw-=(now.x-old.x)/Math.max(260,state.w)*4;state.pitch=Math.max(-1.39,Math.min(1.39,state.pitch+(now.y-old.y)/Math.max(260,state.h)*3))}
 else if(pointers.size===2){const other=[...pointers.entries()].find(([id])=>id!==e.pointerId)?.[1];if(other){const a=Math.hypot(other.x-old.x,other.y-old.y),b=Math.hypot(other.x-now.x,other.y-now.y);if(a>5&&b>5)state.targetDist=Math.max(13,Math.min(74,state.targetDist*a/b))}}
 state.dirty=true});
for(const event of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(event,e=>{pointers.delete(e.pointerId);if(!pointers.size)viewport.classList.remove('dragging')});
viewport.addEventListener('wheel',e=>{e.preventDefault();state.targetDist=Math.max(13,Math.min(74,state.targetDist*(e.deltaY>0?1.1:.9)))},{passive:false});
function resize(){if(!renderer)return;const b=viewport.getBoundingClientRect();if(!b.width||!b.height)return;state.w=b.width;state.h=b.height;camera.aspect=b.width/b.height;camera.updateProjectionMatrix();renderer.setSize(b.width,b.height,false);state.dirty=true}
new ResizeObserver(resize).observe(viewport);
let previous=0;
function frame(t){requestAnimationFrame(frame);if(!renderer||document.hidden||!host.classList.contains('active')){previous=t;return}
if(matchMedia('(max-width:700px)').matches&&t-previous<32)return;
const dt=Math.min(.07,(t-previous)/1000||.02);previous=t;
if(state.auto){state.yaw+=dt*.06;state.dirty=true}
 if(activeRecord?.type==='CATCHER'&&!state.explode){
   const spin=dt*.052;
   if(parts.frame&&parts.capture){parts.frame.rotation.z+=spin;parts.capture.rotation.z+=spin;state.dirty=true;}
 }
state.dist+=(state.targetDist-state.dist)*Math.min(1,dt*8);
camera.position.set(Math.sin(state.yaw)*Math.cos(state.pitch)*state.dist,Math.sin(state.pitch)*state.dist,Math.cos(state.yaw)*Math.cos(state.pitch)*state.dist);camera.lookAt(0,0,0);
const offsets={ring:[-1.0,0,-2],spine:[0,0,0],berths:[1.2,.8,1.4],services:[0,1.7,1.2],docks:[0,0,-2],concourse:[0,0,0],utilities:[1,-1.5,2],dock:[1.5,0,2],gantry:[0,1.5,0],industry:[-1.4,0,-1],service:[-1,0,-2],sensor:[-1.2,0,-1],dishes:[1.1,1.3,0],arrays:[2.3,0,2],core:[0,0,0],frame:[-1,0,-2],emitters:[1,1.5,0],optics:[0,0,0],power:[2.0,-1.2,2],sensors:[-.6,0,0],control:[0,.7,0],rescue:[2,0,1],arms:[-1,0,0],capture:[0,0,-1],cargo:[0,0,1],reactor:[0,0,-1],radiators:[2.1,0,0],beam:[0,1.5,1],support:[0,0,1],tanks:[1.5,-.7,-1]};
let moving=false;
for(const [key,g] of Object.entries(parts)){const target=state.explode?(offsets[key]||[0,0,0]):[0,0,0];const dest=V3(...target);
 if(g.position.distanceToSquared(dest)>.0003){g.position.lerp(dest,Math.min(1,dt*5));moving=true}}
if(!state.dirty&&!moving&&Math.abs(state.targetDist-state.dist)<.002)return;
renderer.render(scene,camera);
$('#stationyardCoord').textContent='AZ '+((Math.round(state.yaw*180/Math.PI)%360+360)%360).toString().padStart(3,'0')+'° / EL '+Math.round(state.pitch*180/Math.PI)+'° / ZOOM '+(27/state.dist).toFixed(1)+'×';
for(const pin of $$('#stationyardPins button')){const position=anchors[pin.dataset.part];if(!position)continue;const G=parts[pin.dataset.part];
const p=G.localToWorld(V3(...position)).project(camera);const x=(p.x*.5+.5)*state.w,y=(-p.y*.5+.5)*state.h;
pin.hidden=p.z>1||x<25||y<30||x>state.w-25||y>state.h-25;pin.style.left=x+'px';pin.style.top=y+'px'}
state.dirty=false}
choose(V.STATION_BY_ID.E03||catalogue[0]);resize();requestAnimationFrame(frame);
window.STS_STATIONYARD_READY=true;
window.STS_STATIONYARD_SELECT=(id)=>{const record=V.STATION_BY_ID[id];if(record)choose(record)};

const registry=document.getElementById('registryGrid');
if(registry){
 const installActions=()=>{
  const cards=[...registry.children].filter(c=>c.matches?.('.registry-card'));
  for(const card of cards){
    const st=V.STATION_BY_ID[card.dataset.id];if(!st)continue;
    const shell=document.createElement('div');shell.className='stationyard-card-shell';
    registry.insertBefore(shell,card);shell.appendChild(card);
    const button=document.createElement('button');button.type='button';button.className='stationyard-card-open';
    button.textContent='3D MODEL ↗';button.setAttribute('aria-label',st.name+' 3D 설계 보기');
    button.addEventListener('click',ev=>{ev.stopPropagation();choose(st);section.scrollIntoView({behavior:'smooth',block:'start'})});
    shell.appendChild(button);
  }
 };
 new MutationObserver(installActions).observe(registry,{childList:true});
 installActions();
}
const inspector=document.getElementById('inspector'),detailID=document.getElementById('detailID');
if(inspector&&detailID){
 const attachInspectorAction=()=>{
  const id=detailID.textContent.trim(),st=V.STATION_BY_ID[id];
  if(!st||inspector.querySelector('.stationyard-inspector-open'))return;
  const btn=document.createElement('button');btn.type='button';btn.className='stationyard-inspector-open';
  btn.textContent='VIEW 3D STATION MODEL  ↗';
  btn.addEventListener('click',()=>{
   choose(st);
   const nav=document.querySelector('[data-view="facilities"]');if(nav)nav.click();
   section.scrollIntoView({behavior:'smooth',block:'start'});
  });
  inspector.appendChild(btn);
 };
 new MutationObserver(attachInspectorAction).observe(inspector,{childList:true});
 attachInspectorAction();
}


/* Map model replacement: pooled, screen-space LOD. Never instantiate Three.js on atlas WebGL. */
const atlas=V.Atlas3D;
if(atlas?.prototype){
 atlas.prototype.drawStation=function(st){
  if(!this.useWebGL||!this.gl)return;
  const p=this.project(st.xyz,this.basis);if(!p)return;
  const x=st.xyz,dist=this.camera.dist,selected=this.selected?.id===st.id;
  // Only the focused station receives an enlarged detailed model.
  // Other nearby facilities remain compact, preventing orbital clusters
  // from obscuring each other or the parent planet.
  const px=selected?22:(dist<62?2.2:5);
  const k=Math.max(selected?.09:.03,Math.min(selected?1.1:.31,px/Math.max(1,p.scale)));
  const near=selected&&dist<145;
  const medium=near||dist>=62&&dist<115&&p.scale>.36;
  const center=(a,b,c)=>[x[0]+a*k,x[1]+b*k,x[2]+c*k];
  const draw=(shape,a,b,c,s,color,emi=.48,alpha=1)=>this.drawMesh(this[shape],center(a,b,c),s.map(t=>t*k),color,alpha,emi);
  const primary=selected?'#dceefa':'#9db8c9',dark='#667f90',blue='#8cc3d9',accent='#d0b582';
  const box=(a,b,c,sx,sy,sz,col=primary)=>draw('box',a,b,c,[sx,sy,sz],col);
  const ring=(a,b,c,r=.9,th=.16,col=primary)=>draw('torus',a,b,c,[r,th,r],col);
  const cyl=(a,b,c,rx,ry,rz,col=primary)=>draw('cylinder',a,b,c,[rx,ry,rz],col);
  const beamAngle=(a,b,c,len,width,angle,col=primary)=>{
   const co=Math.cos(angle),si=Math.sin(angle),axes=[[co,si,0],[-si,co,0],[0,0,1]];
   this.drawMesh(this.box,center(a,b,c),[len*k,width*k,.085*k],col,1,.56,axes);
  };
  box(0,0,0,.48,.29,1.6,dark);
  if(!medium){if(['HUB','TERMINAL','ARRAY','CATCHER'].includes(st.type))ring(0,0,-.58,1,.16,primary);else box(0,0,.5,.90,.09,.23,primary);return}
  switch(st.type){
   case 'HUB':ring(0,0,-1.3,1.35,.19);ring(0,0,-1.3,1.05,.05,dark);for(let b of [-.85,.85])for(let z of [-.4,.6])box(0,b,z,1.25,.15,.32,primary);break;
   case 'TERMINAL':ring(0,0,-1.25,1.07,.28);cyl(0,0,.15,.36,1.75,.36);for(let a of [-1,1])for(let z of [-.5,.55])box(a*.9,0,z,1.05,.20,.25);break;
   case 'YARD':for(let a of [-1.25,1.25])for(let b of [-.76,.76])box(a,b,.5,.13,.12,2.5,dark);for(let z of [-.7,.9])box(0,1.0,z,2.8,.15,.14,accent);break;
   case 'RELAY':cyl(0,.15,0,.19,1.8,.19);ring(0,0,-.3,.95,.08);box(-1.25,0,.8,1.85,.045,.7,dark);box(1.25,0,.8,1.85,.045,.7,dark);break;
   case 'ARRAY':ring(0,0,-1.4,1.45,.20);cyl(0,0,-.7,.27,.8,.27,blue);for(let a of [-1,1])for(let b of [-1,1])box(a*.85,b*.63,.5,.45,.26,.70,blue);break;
   case 'SAFETY':ring(0,0,-.2,1.05,.14);cyl(0,0,.1,.5,1.0,.5);box(1.1,-.3,.7,1.05,.35,.75);break;
   case 'CATCHER':{
    cyl(0,0,0,.37,.8,.37,dark);
    ring(0,0,-.50,.54,.11,primary);
    const a=this.animClock*.20;
    for(let i=0;i<4;i++){const t=a+i*Math.PI*.5;
      beamAngle(Math.cos(t)*1.25,Math.sin(t)*1.25,-.25,2.5,.065,t,primary);
      const px=Math.cos(t)*2.45,py=Math.sin(t)*2.45;
      ring(px,py,-.25,.23,.06,i%2?blue:accent);
      box(px,py,.04,.22,.18,.18,accent);
    }
    box(0,0,.96,.72,.32,.78,dark);break;
   }
   case 'POWER':for(let z of [-.8,.2,.9])cyl(0,0,z,.5,.65,.5);for(let a of [-1,1])box(a*1.45,0,.3,2.15,.045,1.5,accent);break;
   case 'SERVICE':for(let a of [-1,1])for(let b of [-1,1])cyl(a*.7,b*.62,.2,.22,1.5,.22);for(let a of [-1,1])box(a*1.1,0,1,1.15,.27,.24);break;
   default:box(0,0,.7,1,.13,.5)}
  if(!near)return;
  if(st.type==='YARD'){for(const z of [-.8,.25,1.2])box(0,.82,z,1.9,.09,.10,accent)}
  if(st.type==='HUB'||st.type==='TERMINAL'){for(let a of [-1,1])box(a*.6,0,1.4,.35,.38,.45,blue)}
  if(st.type==='ARRAY'||st.type==='RELAY'){for(let a of [-1,1])box(a*.8,0,1.5,.82,.06,.45,dark)}
  if(st.type==='SAFETY'){box(0,1.1,.5,.22,.3,.2,blue)}
  if(st.type==='POWER'||st.type==='SERVICE'){box(0,0,1.6,.45,.38,.5,blue)}
 };
  // Keep selected planets legible, prevent the Sun and distant planets from
  // becoming giant foreground surfaces during local station inspection.
  const oldBodyVisible=atlas.prototype.bodyVisible;
  atlas.prototype.bodyVisible=function(body){
    if(!oldBodyVisible.call(this,body))return false;
    if(this.camera.dist>=118)return true;
    if(body.id===this.selected?.id)return true;
    const target=this.camera.target||[0,0,0];
    const delta=Math.hypot(body.xyz[0]-target[0],body.xyz[1]-target[1],body.xyz[2]-target[2]);
    if(body.id==='SOL' && Math.hypot(...target)>10 && this.camera.dist<100)return false;
    return !(this.camera.dist<78&&delta>Math.max(21,this.camera.dist*.83));
  };
  const oldRenderGL=atlas.prototype.renderGL;
  atlas.prototype.renderGL=function(){
    const old=[];
    if(this.basis){
      for(const body of V.BODIES){
        const p=this.project(body.xyz,this.basis);
        if(!p)continue;
        const isSelected=body.id===this.selected?.id;
        const limit=isSelected?84:this.camera.dist>=125?70:34;
        old.push([body,body.size]);
        body.size=Math.min(body.size,limit/Math.max(1,p.scale));
      }
    }
    try{return oldRenderGL.call(this)}
    finally{for(const [b,size] of old)b.size=size}
  };
  // Mobile overlays should identify the selected object without showing
  // a dense carpet of intersecting labels over a small map.
  const originalOverlay=atlas.prototype.renderOverlay;
  atlas.prototype.renderOverlay=function(){
    if(this.width>=650||this.shipPos)return originalOverlay.call(this);
    const c=this.ctx,w=this.width,h=this.height;
    c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,w,h);c.save();
    for(const star of this.starfield){c.fillStyle='#d5e5ee';c.globalAlpha=star.alpha*.85;c.fillRect(star.x*w,star.y*h,star.size,star.size)}
    c.globalAlpha=1;
    const chosen=this.selected,pins=[],used=[],selectedPoint=chosen?.xyz?this.project(chosen.xyz,this.basis):null;
    if(chosen?.xyz&&selectedPoint&&selectedPoint.x>=0&&selectedPoint.x<=w&&selectedPoint.y>=0&&selectedPoint.y<=h){
      pins.push({obj:chosen,p:selectedPoint,priority:99});
    }
    const allow=(o)=>o.kind==='STATION'?this.visibleStation(o):this.bodyVisible(o);
    const others=[...V.BODIES,...V.STATIONS].filter(o=>o!==chosen&&o.xyz&&allow(o)).map(o=>({obj:o,p:this.project(o.xyz,this.basis)}))
      .filter(e=>e.p&&e.p.x>20&&e.p.x<w-20&&e.p.y>45&&e.p.y<h-55)
      .sort((a,b)=>{
        const ra=Math.hypot(a.p.x-w/2,a.p.y-h/2),rb=Math.hypot(b.p.x-w/2,b.p.y-h/2);
        return (a.obj.kind==='STATION'?0:30)-(b.obj.kind==='STATION'?0:30)+ra-rb;
      });
    for(const entry of others){if(pins.length>=6)break;if(pins.some(q=>Math.hypot(q.p.x-entry.p.x,q.p.y-entry.p.y)<54))continue;pins.push(entry)}
    for(const {obj,p} of pins){
      if(p.x<-30||p.x>w+30||p.y<-30||p.y>h+30)continue;
      const primary=obj===chosen,label=String(obj.name||obj.id).toUpperCase();
      c.font=(primary?'600 11px':'9px')+' ui-monospace,monospace';
      const tw=c.measureText(label).width,left=Math.max(10,Math.min(w-tw-10,p.x+12)),top=Math.max(52,Math.min(h-46,p.y-9));
      const box={left:left-3,top:top-13,width:tw+7,height:18};
      if(used.some(b=>box.left<b.left+b.width&&box.left+box.width>b.left&&box.top<b.top+b.height&&box.top+box.height>b.top)&&!primary)continue;
      used.push(box);
      c.fillStyle=primary?'#0b1928f1':'#0c1825c2';c.fillRect(box.left,box.top,box.width,box.height);
      c.fillStyle=primary?'#e4f5ff':'#9bb7ca';c.fillText(label,left,top);
      c.strokeStyle=primary?'#cbeaff':'#87abc1b0';c.lineWidth=primary?1.3:1;
      c.beginPath();c.arc(p.x,p.y,primary?7:3.1,0,Math.PI*2);c.stroke();
      if(primary){c.beginPath();c.setLineDash([4,5]);c.arc(p.x,p.y,20,0,Math.PI*2);c.stroke();c.setLineDash([])}
    }
    c.restore();
  };

}
