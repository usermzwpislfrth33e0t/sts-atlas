/* STS Shipyard 07 — local Three.js WebGL engineering viewer */
import * as THREE from './vendor/three.module.js';

const host=document.getElementById('vesselsView');
if(!host)throw new Error('Shipyard host missing');
const specs=[
 {id:'freighter',serial:'01 / BULK CARGO',name:'Beam-sail freighter',role:'Cargo / bulk',drive:'Station-beamed electric',frame:'Segmented rectenna receiver',use:'Interplanetary cargo',desc:'대형 분할 세일은 광압 추진용 돛이 아니라 정거장의 마이크로파·레이저 전력을 받는 렉테나·광전 수신막입니다. 화물 트러스 끝의 수신막 중앙에는 하중 전달용 개구부를 두고, 주 전기추진기는 수신막보다 훨씬 후방에 배치합니다. 노즐은 선미 방향으로 배기하여 추진 중 수신막이 배기류에 직접 노출되지 않도록 했습니다.',parts:[['membrane','분할 반사막','마이크로파 렉테나 또는 광전 수신 셀을 여러 구획으로 분리합니다. 집전 회로와 열감시 회로가 각 구획에 분산되며 광압 자체가 주 추진력인 것은 아닙니다.'],['booms','전개 붐과 장력재','중앙 허브와 방사형 붐, 외곽 장력재가 수신막의 평탄도와 전개 형상을 유지합니다.'],['bus','항법·제어 구획','전력 집전·변환, 송전 빔 추적, 항법·통신·자세제어 기능이 한곳에 배치됩니다.'],['payload','화물 트러스','중심 구조와 분리된 규격 화물 컨테이너·산업재 탱크의 장착 구역입니다.'],['thrusters','후방 전기 추진부','주 전기추진기 2기는 수신막보다 선미 쪽에 있으며 배기축은 선체 뒤를 향합니다. 추진 하중은 중앙 트러스를 따라 전달되며, 도킹용 보조 스러스터는 별도 계통입니다.']]},
 {id:'clipper',serial:'02 / EXPRESS SERVICE',name:'Beam-sail clipper',role:'Express service',drive:'Hybrid beamed power',frame:'Tandem receiver wings',use:'Priority transfer',desc:'고출력 송전창을 이용하는 G4 급행형 세일선입니다. 전후방의 분할 수신막은 마이크로파와 레이저 전력을 받아 전력 변환계로 전달합니다. 승무원 캡슐과 소형 우선 화물 팟을 중심축에 집중 배치하여 화물량보다 운항 시간을 우선합니다.',parts:[['membrane','전후방 세일 패널','전후방 수신막에는 마이크로파 정류 셀과 레이저 광전 셀을 구역별로 배치합니다.'],['booms','회전 마스트','접이식·회전식 마스트가 수신면의 정렬과 진동 억제를 담당합니다.'],['bus','승무원 캡슐','항법실, 승무원 생활구역, 축전계, 중앙 전력 버스와 비상 제어계를 포함합니다.'],['payload','신속 화물 팟','긴급 화물과 우선 여객 서비스에 맞춘 독립 밀폐 팟입니다.'],['thrusters','접근 추진기','항로 추진용 전기 추진계와 정거장 접근용 보조 기동 추진계를 분리합니다.']]},
 {id:'fusion',serial:'03 / LONG RANGE',name:'Fusion transport',role:'Crew and logistics',drive:'Onboard fusion',frame:'Axial truss / thermal radiators',use:'Outer-system transfer',desc:'핵융합선은 STS 송전망 밖에서도 독립 항행할 수 있습니다. 후방 반응로와 주 추진부를 전방 승무원 구역에서 긴 종축 트러스로 분리하고, 측면 방열익을 통해 폐열을 처리합니다. 회전 거주 링은 장거리 유인 임무를 위한 구성입니다.',parts:[['habitat','회전 거주 링','원심 가속을 이용하는 장거리 승무원 거주 구획입니다.'],['spine','종축 트러스','추력 하중을 전달하고 승무원 구획과 반응로 사이에 차폐 거리를 확보합니다.'],['radiators','대면적 방열기','전력 변환과 반응로의 폐열을 배출하는 분리형 방열판입니다.'],['reactor','핵융합 반응로','선내 에너지를 생산하는 핵융합 계통과 연료 관리·차폐 구역입니다.'],['engine','후방 추진 노즐','임무에 따라 저추력·펄스 추진계를 적용하며 보조 자세제어 엔진을 따로 둡니다.']]},
 {id:'tug',serial:'04 / ORBITAL OPERATIONS',name:'Orbital tug',role:'Towing and salvage',drive:'Chemical / electric',frame:'Capture ring and manipulators',use:'Station operations',desc:'정거장과 궤도 캐처 주변에서 선체·화물 모듈을 견인하고 조립 작업을 지원하는 단거리 작업선입니다. 포획 링, 관절형 암, 추진제·작업 장비 탱크를 갖추며 장거리 세일선과 달리 다방향 기동성과 도킹 정밀도를 우선합니다.',parts:[['arms','포획 링·작업 암','표준 결합 링과 다관절 매니퓰레이터로 구조재·화물 모듈을 고정합니다.'],['bus','조종·센서실','근접 항법, 도킹 제어, 관측 센서와 작업자 밀폐 공간을 포함합니다.'],['payload','추진제·운송 탱크','추진제와 교체식 정비 장비의 독립 저장부입니다.'],['thrusters','다방향 스러스터','정거장 근접에서 병진·회전·제동을 정밀 제어하는 다방향 추진계입니다.']]}
];
const shipProfiles={"freighter":{"desc":"STS 화물선의 대형 세일은 광압을 이용하는 돛이 아니라 정거장에서 송신한 전력을 받는 수신막입니다. 수신된 전력은 집전 버스와 변환계를 거쳐 선내 전기 추진계로 공급됩니다. 긴 화물 트러스에는 규격화된 컨테이너·탱크를 독립 장착합니다.","receiver":"G2–G4 / M형 또는 H형","mass":"IV–V / 출항 질량 900 t 이상","service":"정기 벌크·표준 화물","operations":"정거장 송전창과 운항 일정에 의존합니다. 송전 중단, 패널 과열, 포인팅 손실에 대비한 전력 저장·열관리·보조 추진계가 필요합니다.","parts":["마이크로파 렉테나 또는 광전 수신 셀을 여러 구획으로 분리합니다. 집전 회로와 열감시 회로가 각 구획에 분산되며 광압 자체가 주 추진력인 것은 아닙니다.","중앙 허브와 방사형 붐, 외곽 장력재가 수신막의 평탄도와 전개 형상을 유지합니다.","전력 집전·변환, 송전 빔 추적, 항법·통신·자세제어 기능이 한곳에 배치됩니다.","중심 구조와 분리된 규격 화물 컨테이너·산업재 탱크의 장착 구역입니다.","수신 전력으로 구동하는 전기 추진부와 도킹용 보조 스러스터를 구분합니다."]},"clipper":{"desc":"고출력 송전창을 이용하는 G4 급행형 세일선입니다. 전후방의 분할 수신막은 마이크로파와 레이저 전력을 받아 전력 변환계로 전달합니다. 승무원 캡슐과 소형 우선 화물 팟을 중심축에 집중 배치하여 화물량보다 운항 시간을 우선합니다.","receiver":"G4 / H형 복합 수신막","mass":"II–III / 출항 질량 80–900 t","service":"급행 여객·특송","operations":"고출력 빔의 정밀 추적과 패널별 열관리, 수신각 조절이 필수입니다. 높은 서비스 요금과 송전 스케줄 제약이 뒤따릅니다.","parts":["전후방 수신막에는 마이크로파 정류 셀과 레이저 광전 셀을 구역별로 배치합니다.","접이식·회전식 마스트가 수신면의 정렬과 진동 억제를 담당합니다.","항법실, 승무원 생활구역, 축전계, 중앙 전력 버스와 비상 제어계를 포함합니다.","긴급 화물과 우선 여객 서비스에 맞춘 독립 밀폐 팟입니다.","항로 추진용 전기 추진계와 정거장 접근용 보조 기동 추진계를 분리합니다."]},"fusion":{"desc":"핵융합선은 STS 송전망 밖에서도 독립 항행할 수 있습니다. 후방 반응로와 주 추진부를 전방 승무원 구역에서 긴 종축 트러스로 분리하고, 측면 방열익을 통해 폐열을 처리합니다. 회전 거주 링은 장거리 유인 임무를 위한 구성입니다.","receiver":"외부 송전 불필요","mass":"임무별 상이 · 고정 질량급 없음","service":"탐사·구조·군용·외행성 지원","operations":"DFD는 장시간 저추력, MLF는 고추력·고기동, ICF-P는 대형 실험·심우주 분야에 배정됩니다. 현재 모형은 특정 엔진 형식을 확정하지 않은 개념 설계입니다.","parts":["원심 가속을 이용하는 장거리 승무원 거주 구획입니다.","추력 하중을 전달하고 승무원 구획과 반응로 사이에 차폐 거리를 확보합니다.","전력 변환과 반응로의 폐열을 배출하는 분리형 방열판입니다.","선내 에너지를 생산하는 핵융합 계통과 연료 관리·차폐 구역입니다.","임무에 따라 저추력·펄스 추진계를 적용하며 보조 자세제어 엔진을 따로 둡니다."]},"tug":{"desc":"정거장과 궤도 캐처 주변에서 선체·화물 모듈을 견인하고 조립 작업을 지원하는 단거리 작업선입니다. 포획 링, 관절형 암, 추진제·작업 장비 탱크를 갖추며 장거리 세일선과 달리 다방향 기동성과 도킹 정밀도를 우선합니다.","receiver":"독립 저장 전력·보조 추진","mass":"I–II / 소형 지원선 계열","service":"정거장 정비·도킹·구난","operations":"화물의 상대속도를 맞춘 뒤 포획·견인합니다. 실질적인 성능은 작업 암의 범위, 추진제 여유, 화물 결합 표준에 좌우됩니다.","parts":["표준 결합 링과 다관절 매니퓰레이터로 구조재·화물 모듈을 고정합니다.","근접 항법, 도킹 제어, 관측 센서와 작업자 밀폐 공간을 포함합니다.","추진제와 교체식 정비 장비의 독립 저장부입니다.","정거장 근접에서 병진·회전·제동을 정밀 제어하는 다방향 추진계입니다."]}};
const $=(q)=>host.querySelector(q),$$=(q)=>[...host.querySelectorAll(q)];
const esc=(s)=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
host.classList.add('shipyard-view','shipyard-seven');
host.innerHTML=[
 '<div class="page-eyebrow micro accent">03 / VESSEL ARCHITECTURE · SHIPYARD 08</div>',
 '<div class="generic-header"><h2>선박 설계<span>.</span></h2><button type="button" id="shipGoHome">← INDEX</button></div>',
 '<div class="shipyard-headline"><p>외부 전력 수신식 세일선과 독립 추진식 핵융합선의 구조를 비교합니다. 전력 수신·추진·방열·거주·화물 계통을 나누어 살펴볼 수 있습니다.</p><span class="shipyard-label">ENGINEERING CONCEPTS / <strong>2120</strong></span></div>',
 '<div class="shipyard-console"><div class="shipyard-main">',
 '<nav class="shipyard-modelstrip" aria-label="선박 형식 선택">',
 ...specs.map((m)=>'<button type="button" class="shipyard-model" data-model="'+m.id+'" aria-pressed="false"><small>'+esc(m.serial)+'</small><strong>'+esc(m.name)+'</strong></button>'),
 '</nav>',
 '<div class="shipyard-viewport" id="shipViewport">',
 '<canvas id="shipCanvas" aria-label="마우스 또는 손가락으로 회전·확대할 수 있는 선박 3D 모형"></canvas>',
 '<div class="shipyard-sensor"><span><i></i>STS / LIVE ENGINEERING MODEL</span><b>DRAG TO ORBIT · PINCH / SCROLL TO ZOOM</b></div>',
 '<span class="shipyard-watermark" id="shipRenderMode">SURFACE / MATERIAL</span>',
 '<span class="shipyard-coordinates" id="shipCoordinates">AZ 000° / EL 000°</span>',
 '<div id="shipPins"></div></div>',
 '<div class="shipyard-toolbar"><div class="shipyard-tools">',
 '<button class="shipyard-tool" id="shipRotate" type="button" aria-pressed="true">⟳ AUTO ROTATE</button>',
 '<button class="shipyard-tool" id="shipExplode" type="button" aria-pressed="false">EXPLODED</button>',
 '<button class="shipyard-tool" id="shipWire" type="button" aria-pressed="false">WIREFRAME</button>',
 '<button class="shipyard-tool" id="shipReset" type="button">RESET</button>',
 '<button class="shipyard-tool" id="shipPlus" type="button" aria-label="확대">＋</button>',
 '<button class="shipyard-tool" id="shipMinus" type="button" aria-label="축소">－</button>',
 '</div><span class="shipyard-readout">REAL-TIME WEBGL · LOCAL 3D ASSETS</span></div></div>',
 '<aside class="shipyard-sidebar"><div class="shipyard-sidebar-top"><span class="shipyard-series" id="shipSeries"></span><h3 id="shipName"></h3><p id="shipDescription"></p></div>',
 '<div class="shipyard-specs" id="shipSpecs"></div><div class="sts-ship-dossier" id="shipDossier"></div><div class="shipyard-parts" id="shipParts"></div>',
 '<div class="shipyard-part-note"><b id="shipPartName"></b><p id="shipPartDetail"></p></div></aside></div>',
 '<div class="shipyard-fineprint"><span>DESIGN STUDY / CONCEPT ART · 세부 제원과 함급은 설정 자료 확정 후 반영</span><span>THREE-DIMENSIONAL MODEL / MANUAL ORBIT / EXPLODED VIEW</span></div>'
].join('');
window.STS_SHIPYARD_V7_READY=true;
$('#shipGoHome')?.addEventListener('click',()=>document.getElementById('brandBtn')?.click());
const canvas=$('#shipCanvas'),viewport=$('#shipViewport');
const mobile=matchMedia('(max-width: 750px)').matches;
const scene=new THREE.Scene();
scene.background=new THREE.Color('#071019');
const camera=new THREE.PerspectiveCamera(39,1,.1,350);
const renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:!mobile,powerPreference:'high-performance'});
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.42;
renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.25:1.6));
renderer.setClearColor(0x071019,1);
scene.add(new THREE.HemisphereLight(0xe0f2ff,0x102131,1.85));
function lamp(c,intensity,xyz){const l=new THREE.DirectionalLight(c,intensity);l.position.set(...xyz);scene.add(l)}
lamp(0xf4f7f9,4.0,[-6,11,9]);lamp(0x8abce7,2.6,[7,-5,-10]);lamp(0xffc99f,1.05,[2,8,-4]);
const starPositions=[];
for(let i=0;i<180;i++){const a=i*2.399963,b=Math.asin(2*((i*37%179)/179)-1),r=100;starPositions.push(Math.cos(a)*Math.cos(b)*r,Math.sin(b)*r,Math.sin(a)*Math.cos(b)*r)}
const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));
scene.add(new THREE.Points(sg,new THREE.PointsMaterial({size:.22,color:0x9abed4,sizeAttenuation:false,transparent:true,opacity:.33,depthWrite:false})));
const shipStage=new THREE.Group();scene.add(shipStage);
const colors={
 foil: new THREE.MeshPhysicalMaterial({color:0xd7e8f2,metalness:.44,roughness:.33,clearcoat:.85,clearcoatRoughness:.18,side:THREE.DoubleSide}),
 foilDark: new THREE.MeshPhysicalMaterial({color:0x91b7ca,metalness:.38,roughness:.39,clearcoat:.58,side:THREE.DoubleSide}),
 ceramic:new THREE.MeshStandardMaterial({color:0xd8e0e3,metalness:.25,roughness:.45}),
 metal:new THREE.MeshStandardMaterial({color:0x8095a5,metalness:.64,roughness:.36}),
 steel:new THREE.MeshStandardMaterial({color:0xb2c5d0,metalness:.55,roughness:.33}),
 hull:new THREE.MeshStandardMaterial({color:0x41596e,metalness:.55,roughness:.46}),
 graphite:new THREE.MeshStandardMaterial({color:0x243b4b,metalness:.32,roughness:.57}),
 copper:new THREE.MeshStandardMaterial({color:0x875c4a,metalness:.57,roughness:.4,side:THREE.DoubleSide}),
 bronze:new THREE.MeshStandardMaterial({color:0xc5a471,metalness:.61,roughness:.34}),
 hazard:new THREE.MeshStandardMaterial({color:0xd38c53,metalness:.41,roughness:.38}),
 glass:new THREE.MeshPhysicalMaterial({color:0x36677e,metalness:.19,roughness:.16,clearcoat:.7}),
 glow:new THREE.MeshStandardMaterial({color:0x78d2f4,emissive:0x299fd3,emissiveIntensity:2.0,metalness:.1,roughness:.25}),
 darkEngine:new THREE.MeshStandardMaterial({color:0x283e50,metalness:.69,roughness:.4}),
 panel:new THREE.MeshStandardMaterial({color:0x253b46,metalness:.38,roughness:.63,side:THREE.DoubleSide})
};
let root=null,groups={},pins={},activeModel=null,selectedPart=null;
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
function setPart(key){const g=new THREE.Group();g.userData.part=key;g.userData.originalPosition=g.position.clone();root.add(g);groups[key]=g;return g}
function mesh(g,geometry,mat,pos=V(),rotation=null){const m=new THREE.Mesh(geometry,colors[mat].clone());m.position.copy(pos);if(rotation)m.rotation.set(...rotation);m.userData.part=g.userData.part;g.add(m);return m}
function box(g,pos,size,mat='steel'){return mesh(g,new THREE.BoxGeometry(...size),mat,V(...pos))}
function rod(g,a,b,r,mat='steel',seg=10){const A=V(...a),B=V(...b),diff=B.clone().sub(A),geo=new THREE.CylinderGeometry(r,r,diff.length(),seg,1,false);
 const m=mesh(g,geo,mat,A.clone().add(B).multiplyScalar(.5));m.quaternion.setFromUnitVectors(V(0,1,0),diff.normalize());return m}
function tapered(g,a,b,r0,r1,mat='metal',seg=16){const A=V(...a),B=V(...b),diff=B.clone().sub(A),geo=new THREE.CylinderGeometry(r1,r0,diff.length(),seg,1,false);
 const m=mesh(g,geo,mat,A.clone().add(B).multiplyScalar(.5));m.quaternion.setFromUnitVectors(V(0,1,0),diff.normalize());return m}
function ring(g,R,t,z,mat='steel',segments=64){return mesh(g,new THREE.TorusGeometry(R,t,9,segments),mat,V(0,0,z))}
function radRing(g,R,t,z,mat='steel',segments=32){return ring(g,R,t,z,mat,segments)}
function sphere(g,pos,r,mat='metal'){return mesh(g,new THREE.SphereGeometry(r,12,8),mat,V(...pos))}
function pod(g,x,y,z,len,r,mat='ceramic'){tapered(g,[x,y,z-len*.5],[x,y,z-len*.29],r*.72,r,mat,14);rod(g,[x,y,z-len*.29],[x,y,z+len*.34],r,mat,14);tapered(g,[x,y,z+len*.34],[x,y,z+len*.52],r,.025,mat,14);for(const zz of [-.2,.21]){const q=ring(g,r+.017,.03,z+len*zz,'bronze',20);q.position.x=x;q.position.y=y}}
function sailSector(g,k,R,z,inner=.65,opening=.066){const n=13,m=22,positions=[],col=[],indices=[];const base=new THREE.Color(k%2===0?0xc1d9e9:0x9bbacd);
 const lo=k*Math.PI/2+opening,hi=(k+1)*Math.PI/2-opening;
 for(let i=0;i<=n;i++)for(let j=0;j<=m;j++){const u=i/n,w=j/m,a=lo+(hi-lo)*w,r=inner+(R-inner)*u,sag=.37*u*u+.055*Math.sin(w*Math.PI)*u;
   positions.push(Math.cos(a)*r,Math.sin(a)*r,z+sag);
   const c=base.clone().multiplyScalar(.87+.18*Math.sin(i*1.47+j*.9+k)+.08*Math.cos(j*.46));
   col.push(c.r,c.g,c.b);
 }
 for(let i=0;i<n;i++)for(let j=0;j<m;j++){const a=i*(m+1)+j,b=a+m+1;indices.push(a,b,a+1,b,b+1,a+1)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(indices);geo.computeVertexNormals();
 const mat=colors.foil.clone();mat.color.set(0xffffff);mat.vertexColors=true;mat.side=THREE.DoubleSide;const sail=new THREE.Mesh(geo,mat);sail.userData.part=g.userData.part;g.add(sail);
 const traces=[];const pos=(i,j)=>{const q=(i*(m+1)+j)*3;return [positions[q],positions[q+1],positions[q+2]+.019]};
 for(let i=1;i<n;i+=2)for(let j=0;j<m;j++)traces.push(...pos(i,j),...pos(i,j+1));
 for(let j=1;j<m;j+=2)for(let i=0;i<n;i++)traces.push(...pos(i,j),...pos(i+1,j));
 const traceGeo=new THREE.BufferGeometry();traceGeo.setAttribute('position',new THREE.Float32BufferAttribute(traces,3));
 const trace=new THREE.LineSegments(traceGeo,new THREE.LineBasicMaterial({color:0x607e9b,transparent:true,opacity:.78}));trace.userData.part=g.userData.part;g.add(trace);
 const edge=(theta)=>[Math.cos(theta)*R,Math.sin(theta)*R,z+.37];
 for(const a of [lo,hi]){rod(g,[Math.cos(a)*inner,Math.sin(a)*inner,z],edge(a),.034,'steel',8)}
 for(let j=0;j<9;j++){const a=lo+(hi-lo)*j/8;rod(g,[0,0,z-.10],edge(a),j%4===0?.027:.012,j%4===0?'steel':'metal',6)}
 for(let j=0;j<18;j++){const a=lo+(hi-lo)*j/18,b=lo+(hi-lo)*(j+1)/18;rod(g,edge(a),edge(b),.034,'ceramic',6)}
}
function addSail(g,R,z){for(let k=0;k<4;k++)sailSector(g,k,R,z);ring(g,.64,.16,z,'metal',28)}
function structuralTruss(g,z0,z1,r=.65,step=1.35){const points=[[-r,-r],[r,-r],[r,r],[-r,r]];for(const [x,y] of points)rod(g,[x,y,z0],[x,y,z1],.058,'steel',8);
 for(let z=z0;z<z1-.02;z+=step){const next=Math.min(z1,z+step);for(let i=0;i<4;i++){const a=points[i],b=points[(i+1)%4];rod(g,[...a,z],[...b,z],.041,'metal',7);rod(g,[...a,z],[...b,next],.032,'metal',6)}}}
function reflectedWing(g,s,z0,spread=1){const vs=[],cols=[],inds=[],nx=15,ny=5;
 for(let i=0;i<=nx;i++)for(let j=0;j<=ny;j++){const u=i/nx,w=j/ny,x=s*(.63+u*4.9*spread),h=(.53+1.17*u-.4*u*u)*spread,y=(2*w-1)*h;
  vs.push(x,y,z0+1.12*u*spread+.21*Math.sin(w*Math.PI));const c=new THREE.Color(i%3===0?0xd2e6f0:0x9dbfce).multiplyScalar(.78+.16*Math.cos(i*.6+j));cols.push(c.r,c.g,c.b)}
 for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const a=i*(ny+1)+j,b=a+ny+1;inds.push(a,b,a+1,b,b+1,a+1)}
 const tracks=[];const p=(i,j)=>{const o=(i*(ny+1)+j)*3;return [vs[o],vs[o+1],vs[o+2]+.02]};
 for(let i=0;i<=nx;i+=2)for(let j=0;j<ny;j++)tracks.push(...p(i,j),...p(i,j+1));
 for(let j=0;j<=ny;j++)for(let i=0;i<nx;i++)tracks.push(...p(i,j),...p(i+1,j));
 const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(tracks,3));
 const track=new THREE.LineSegments(tg,new THREE.LineBasicMaterial({color:0x476d89,transparent:true,opacity:.75}));track.userData.part=g.userData.part;g.add(track);
 const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));ge.setIndex(inds);ge.computeVertexNormals();
 const mat=colors.foil.clone();mat.vertexColors=true;mat.color.set(0xffffff);const m=new THREE.Mesh(ge,mat);m.userData.part=g.userData.part;g.add(m);
 for(const w of [0,.5,1]){const yy=(2*w-1)*(.53+1.17-.4)*spread;rod(g,[s*.63,(2*w-1)*.53*spread,z0],[s*(.63+4.9*spread),yy,z0+1.12*spread],.027,'steel',8)}
 for(let i=1;i<8;i++){let u=i/8,x=s*(.63+u*4.9*spread),h=(.53+1.17*u-.4*u*u)*spread;rod(g,[x,-h,z0+1.12*u*spread],[x,h,z0+1.12*u*spread],.015,'metal',6)}
}
function buildFreighter(){
 const sail=setPart('membrane'),booms=setPart('booms'),bus=setPart('bus'),payload=setPart('payload'),drive=setPart('thrusters');
 // Receiver aperture at z=-5.1. The slender thrust spine passes through
 // the central aperture, while both engine nozzles are farther aft (−Z).
 addSail(sail,6.05,-5.1);
 structuralTruss(payload,-3.65,6.65,.72,1.25);
 structuralTruss(booms,-8.55,-3.58,.32,1.0);
 rod(bus,[0,0,-9.7],[0,0,8.3],.18,'steel',12);
 for(const z of [-6.15,-7.58,-8.70])ring(booms,.53,.055,z,'metal',28);
 box(booms,[0,0,-7.0],[.77,.77,1.35],'darkEngine');
 for(const x of [-1,1])for(const y of [-1,1]){rod(booms,[x*4.1,y*4.1,-4.72],[x*.6,y*.6,-2.4],.04,'metal',8);rod(booms,[x*.56,y*.56,-5],[x*.46,y*.46,-3.05],.055,'steel',7)}
 for(let z=-2.75;z<6.1;z+=1.6)for(const x of [-.39,.39])for(const y of [-.38,.38]){
    box(payload,[x,y,z],[.67,.58,1.36],((Math.round(z*10)+Math.round(x*10))%3===0)?'ceramic':'metal');
    box(payload,[x,y+.295,z],[.54,.02,1.21],'hull');
    rod(payload,[x-.3,y+.31,z-.49],[x+.3,y+.31,z-.49],.024,'steel',5);
 }
 tapered(bus,[0,0,6.2],[0,0,7.55],.87,.6,'ceramic',16);
 tapered(bus,[0,0,7.55],[0,0,8.4],.60,.08,'steel',16);
 ring(bus,.88,.06,6.37,'bronze',36);
 box(bus,[0,.66,6.97],[.86,.12,.55],'glass');
 // PROTECTED EXHAUST KEEP-OUT / +Z = bow, −Z = nozzle exhaust.
 // Sail envelope: z ≈ −5.10 to −4.73, radius 0.65..6.05.
 // Nozzles: z = −9.59; thrust exhaust to −Z, away from the sail.
 // Two balanced electric drive pods are carried by the central thrust spine.
 for(const sign of [-1,1]){
   const x=sign*.43,y=0;
   tapered(drive,[x,y,-7.46],[x,y,-9.48],.24,.32,'darkEngine',20);
   const rim=ring(drive,.34,.065,-9.53,'bronze',28);
   const glow=ring(drive,.25,.044,-9.59,'glow',28);
   rim.position.x=glow.position.x=x;
   for(const z of [-7.50,-8.76])
     rod(drive,[0,0,z],[x,y,z],.072,'steel',9);
   rod(drive,[sign*.31,sign*.30,-7.20],[x,y,-7.62],.08,'steel',10);
 }
 return {membrane:[-3.15,2.7,-4.65],booms:[.4,.44,-6.8],bus:[0,.65,7.35],payload:[.7,.75,2.8],thrusters:[.43,0,-9.54]};
}
function buildClipper(){
 const sail=setPart('membrane'),booms=setPart('booms'),bus=setPart('bus'),payload=setPart('payload'),drive=setPart('thrusters');
 for(const x of [-1,1]){reflectedWing(sail,x,-3.45,1);reflectedWing(sail,x,-.95,.59);
  rod(booms,[x*.5,0,-3.7],[x*.5,0,5.9],.075,'steel',10);
  rod(booms,[0,0,-3.45],[x*5.4,0,-2.3],.062,'metal',8);
  rod(booms,[x*.65,0,-.95],[x*3.6,0,-.4],.045,'metal',8)}
 pod(bus,0,0,4.48,5.6,.67,'ceramic');box(bus,[0,.64,4.5],[.7,.11,1.64],'glass');
 ring(bus,.72,.075,3.19,'bronze',28);
 rod(bus,[0,0,-4.5],[0,0,6.9],.16,'steel',12);
 tapered(bus,[0,0,6.45],[0,0,7.3],.52,.05,'steel',16);
 for(const s of [-1,1]){pod(payload,s*1.05,-.43,1.6,3.6,.38,'metal');
  for(const z of [1.1,2.8])rod(payload,[s*.5,-.1,z],[s*1.05,-.43,z],.055,'steel',8);
  tapered(drive,[s*.43,-.23,-4],[s*.43,-.23,-4.9],.29,.38,'hull',12);
  const nozzle=ring(drive,.39,.07,-4.91,'glow',24);nozzle.position.x=s*.43;nozzle.position.y=-.23}
 return {membrane:[-3.2,1.4,-2.7],booms:[3.3,.85,-2.3],bus:[0,.7,5.05],payload:[-1.05,-.43,1.6],thrusters:[.43,-.2,-4.9]};
}
function buildFusion(){
 const hab=setPart('habitat'),spine=setPart('spine'),rad=setPart('radiators'),react=setPart('reactor'),eng=setPart('engine');
 structuralTruss(spine,-6.6,8.8,.52,1.22);
 rod(spine,[0,0,-7.9],[0,0,9.3],.21,'metal',12);
 for(const s of [-1,1]){for(let j=0;j<3;j++){const z=-2.9+j*2.05;for(let i=0;i<5;i++){const x0=s*(1.25+i*.93),x1=s*(1.25+(i+1)*.93),yy=.16+s*.04;
     const g=new THREE.BufferGeometry();const p=[x0,yy,z,x1,yy,z,x1,yy,z+1.8,x0,yy,z+1.8];g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();mesh(rad,g,i%2?'copper':'panel');
     rod(rad,[x0,yy+.01,z],[x0,yy+.01,z+1.8],.027,'bronze',7);
   }rod(rad,[s*1.1,.1,z],[s*5.92,.1,z],.078,'steel',8)}for(const z of [-2.95,3.25])rod(rad,[s*.55,0,z],[s*5.92,.13,z],.07,'metal',8)}
 for(const z of [-3.7,-1.7,.3]){rod(react,[0,0,z],[0,0,z+1.5],.77,'metal',16);ring(react,.83,.085,z,'bronze',32);ring(react,.83,.085,z+1.5,'steel',32);
  for(let a=0;a<8;a++){const t=a*Math.PI/4;box(react,[Math.cos(t)*.79,Math.sin(t)*.79,z+.72],[.24,.20,1.3],'hull')}}
 box(react,[0,0,-5.35],[2.6,2.6,.7],'graphite');
 for(const s of [-1,1])for(const y of [-.56,.56]){tapered(eng,[s*.69,y,-6.25],[s*.69,y,-8.23],.37,.6,'darkEngine',18);
  tapered(eng,[s*.69,y,-8.23],[s*.69,y,-8.8],.6,.34,'steel',18);
  const q=ring(eng,.37,.09,-8.80,'glow',32);q.position.x=s*.69;q.position.y=y}
 rod(hab,[0,0,5.2],[0,0,9.7],.51,'ceramic',18);
 ring(hab,.64,.08,5.27,'bronze',30);
 tapered(hab,[0,0,9.1],[0,0,10.5],.65,.08,'steel',20);
 ring(hab,2.42,.41,6.8,'metal',64);
 ring(hab,2.42,.09,7.22,'bronze',64);
 for(let k=0;k<16;k++){const a=k*Math.PI/8,x=Math.cos(a)*2.42,y=Math.sin(a)*2.42;
  box(hab,[x,y,6.8],[.67,.65,.76],k%4===0?'ceramic':'hull');
  rod(hab,[0,0,6.8],[x,y,6.8],.074,'steel',10);
  sphere(hab,[x,y,7.2],.08,'bronze')}
 return {habitat:[1.2,2.05,6.82],spine:[.55,.5,3.6],radiators:[4.6,.15,.0],reactor:[0,.85,-2.1],engine:[.7,-.55,-8.8]};
}
function buildTug(){
 const arms=setPart('arms'),bus=setPart('bus'),payload=setPart('payload'),drive=setPart('thrusters');
 tapered(bus,[0,0,-1.7],[0,0,1.9],1.13,1.17,'metal',18);
 tapered(bus,[0,0,1.9],[0,0,3.2],1.17,.62,'ceramic',18);
 box(bus,[0,.94,.62],[1.48,.21,1.68],'glass');
 box(bus,[0,.88,2.5],[.89,.16,.42],'hull');
 ring(bus,1.18,.075,-1.3,'bronze',38);
 for(const s of [-1,1]){box(bus,[s*1.0,.42,.1],[.35,.74,1.64],'hull');box(bus,[s*1.02,1.0,-.48],[.48,.14,.42],'hazard');
  pod(payload,s*1.05,-.75,-1.3,3.35,.5,'ceramic');
  rod(arms,[s*1.12,0,1.4],[s*2.15,.3,2.03],.22,'metal',14);
  sphere(arms,[s*2.15,.3,2.03],.3,'hazard');
  rod(arms,[s*2.15,.3,2.03],[s*2.7,.22,3.45],.18,'steel',12);
  sphere(arms,[s*2.7,.22,3.45],.23,'metal');
  rod(arms,[s*2.7,.22,3.45],[s*1.87,.10,4.12],.11,'ceramic',10);
  box(arms,[s*1.84,.1,4.18],[.3,.28,.6],'hazard');
  tapered(drive,[s*.72,-.2,-2.3],[s*.72,-.2,-3.35],.37,.45,'hull',14);
  const q=ring(drive,.46,.085,-3.36,'glow',26);q.position.x=s*.72;q.position.y=-.2}
 ring(arms,1.75,.18,4.0,'steel',64);
 ring(arms,1.41,.085,3.69,'metal',56);
 for(let k=0;k<8;k++){const a=k*Math.PI/4;rod(arms,[Math.cos(a)*1.43,Math.sin(a)*1.43,3.69],[Math.cos(a)*1.75,Math.sin(a)*1.75,4.0],.062,k%2?'steel':'hazard',8)}
 rod(bus,[0,1.12,-.5],[0,1.95,-.5],.075,'steel',8);
 box(bus,[0,1.97,-.5],[.74,.14,.18],'glow');
 return {arms:[1.65,1.2,3.98],bus:[.7,1.0,1.35],payload:[-1,-.75,-1.25],thrusters:[.7,-.2,-3.4]};
}
const builders={freighter:buildFreighter,clipper:buildClipper,fusion:buildFusion,tug:buildTug};
/* Navigation Atlas / share the SAME procedural geometry as the engineering viewer.
   This is a detached group: selecting a map ship does not disturb the active
   shipyard camera, selected part or WebGL canvas. */
window.STS_SHIPYARD_EXPORT_MODEL=(id)=>{
 if(!builders[id])return null;
 const previousRoot=root,previousGroups=groups;
 try{
  root=new THREE.Group();groups={};
  builders[id]();
  root.updateMatrixWorld(true);
  return root;
 }finally{root=previousRoot;groups=previousGroups;}
};

const state={yaw:-.58,pitch:.32,dist:23,targetDist:23,auto:!matchMedia('(prefers-reduced-motion: reduce)').matches,explode:false,wire:false,drag:new Map(),touchPinch:0,w:0,h:0,dirty:true};
const raycaster=new THREE.Raycaster(),pointerNdc=new THREE.Vector2();
function recolor(){
 for(const [key,g] of Object.entries(groups)){g.traverse(obj=>{if(!obj.isMesh)return;
  const mat=obj.material;if(!mat.userData.initialEmissive)mat.userData.initialEmissive=mat.emissive.clone();
  if(mat.emissive){mat.emissive.copy(mat.userData.initialEmissive);if(key===selectedPart){mat.emissive.add(new THREE.Color(0x143b4b));mat.emissiveIntensity=Math.max(mat.emissiveIntensity||0,.46)}}
  mat.wireframe=state.wire;mat.needsUpdate=true;
 })}
}
function selectPart(id){if(!groups[id])return;selectedPart=id;
 const m=specs.find(m=>m.id===activeModel),part=m.parts.find(p=>p[0]===id);
 $$('.shipyard-part,.shipyard-pin').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.part===id)));
 $('#shipPartName').textContent=id.toUpperCase()+' / '+part[1];
 $('#shipPartDetail').textContent=part[2];recolor();state.dirty=true;
}
let anchors={};
function selectModel(id){
 const m=specs.find(m=>m.id===id);if(!m)return;
 activeModel=id;while(shipStage.children.length){const item=shipStage.children[0];shipStage.remove(item);item.traverse?.(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()})}
 root=new THREE.Group();shipStage.add(root);groups={};anchors=builders[id]();
 state.yaw=id==='fusion'?-.60:-.58;state.pitch=id==='fusion'?.27:.36;
 state.dist=id==='fusion'?29:id==='tug'?18:23;state.targetDist=state.dist;
 $$('.shipyard-model').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.model===id)));
 $('#shipSeries').textContent=m.serial;$('#shipName').textContent=m.name;$('#shipDescription').textContent=m.desc;const profile=shipProfiles[id];$('#shipDossier').innerHTML='<div class="sts-dossier-title">운항·기술 정보</div>'+[['수신·동력',profile.receiver],['질량 등급',profile.mass],['운용 분야',profile.service]].map(([a,b])=>'<div class="sts-dossier-row"><small>'+esc(a)+'</small><strong>'+esc(b)+'</strong></div>').join('')+'<p>'+esc(profile.operations)+'</p>';
 $('#shipSpecs').innerHTML=[['ROLE',m.role],['PROPULSION',m.drive],['STRUCTURE',m.frame],['OPERATIONS',m.use]].map(p=>'<div><small>'+p[0]+'</small><strong>'+esc(p[1])+'</strong></div>').join('');
 $('#shipParts').innerHTML='<div class="shipyard-parts-title">SELECT A SYSTEM / '+m.parts.length+' COMPONENTS</div>'+m.parts.map((p,i)=>'<button type="button" class="shipyard-part" data-part="'+p[0]+'" aria-pressed="false"><span><em>'+String(i+1).padStart(2,'0')+'</em>'+esc(p[1])+'</span></button>').join('');
 $('#shipPins').innerHTML=m.parts.map(p=>'<button type="button" class="shipyard-pin" data-part="'+p[0]+'" aria-pressed="false" title="'+esc(p[1])+'" aria-label="'+esc(p[1])+' 선택"></button>').join('');
 $$('.shipyard-part,.shipyard-pin').forEach(b=>b.addEventListener('click',()=>selectPart(b.dataset.part)));
 selectPart(m.parts[0][0]);state.dirty=true;
}
$$('.shipyard-model').forEach(b=>b.addEventListener('click',()=>selectModel(b.dataset.model)));
const control=(id,cb)=>$('#'+id).addEventListener('click',cb);
control('shipRotate',()=>{state.auto=!state.auto;$('#shipRotate').setAttribute('aria-pressed',String(state.auto))});
control('shipExplode',()=>{state.explode=!state.explode;$('#shipExplode').setAttribute('aria-pressed',String(state.explode));state.dirty=true});
control('shipWire',()=>{state.wire=!state.wire;$('#shipWire').setAttribute('aria-pressed',String(state.wire));$('#shipRenderMode').textContent=state.wire?'SURFACE / WIREFRAME':'SURFACE / MATERIAL';recolor();state.dirty=true});
control('shipReset',()=>{const m=activeModel;selectModel(m);state.auto=true;$('#shipRotate').setAttribute('aria-pressed','true')});
control('shipPlus',()=>{state.targetDist=Math.max(10,state.targetDist*.83)});
control('shipMinus',()=>{state.targetDist=Math.min(75,state.targetDist*1.2)});
let initialPointer=null;
viewport.addEventListener('pointerdown',e=>{
 if(e.target.closest('button'))return;viewport.setPointerCapture(e.pointerId);
 state.drag.set(e.pointerId,{x:e.clientX,y:e.clientY});initialPointer={x:e.clientX,y:e.clientY};
 state.auto=false;$('#shipRotate').setAttribute('aria-pressed','false');viewport.classList.add('dragging');
});
viewport.addEventListener('pointermove',e=>{
 if(!state.drag.has(e.pointerId))return;
 const prev=state.drag.get(e.pointerId),now={x:e.clientX,y:e.clientY};state.drag.set(e.pointerId,now);
 if(state.drag.size===1){state.yaw-=(now.x-prev.x)/Math.max(280,state.w)*4.1;state.pitch=Math.max(-1.32,Math.min(1.32,state.pitch+(now.y-prev.y)/Math.max(280,state.h)*3.1))}
 else if(state.drag.size===2){const other=[...state.drag.entries()].find(([id])=>id!==e.pointerId)?.[1];if(other){const d0=Math.hypot(other.x-prev.x,other.y-prev.y),d1=Math.hypot(other.x-now.x,other.y-now.y);if(d0>6)state.targetDist=Math.max(10,Math.min(75,state.targetDist*d0/d1))}}
 state.dirty=true;
});
for(const event of ['pointercancel','pointerup','lostpointercapture'])viewport.addEventListener(event,e=>{
 const start=initialPointer;state.drag.delete(e.pointerId);if(!state.drag.size)viewport.classList.remove('dragging');
 if(event==='pointerup'&&start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<6&&!e.target.closest('button')){
  const rect=canvas.getBoundingClientRect();pointerNdc.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  raycaster.setFromCamera(pointerNdc,camera);const hits=raycaster.intersectObjects(root.children,true);
  if(hits.length){let o=hits[0].object;while(o&&!o.userData?.part)o=o.parent;if(o?.userData.part)selectPart(o.userData.part)}
 }
 if(!state.drag.size)initialPointer=null;
});
viewport.addEventListener('wheel',e=>{e.preventDefault();state.targetDist=Math.max(10,Math.min(75,state.targetDist*(e.deltaY>0?1.1:.9)))},{passive:false});
function resize(){
 const b=viewport.getBoundingClientRect();if(!b.width||!b.height)return;
 state.w=b.width;state.h=b.height;camera.aspect=b.width/b.height;camera.updateProjectionMatrix();
 renderer.setSize(b.width,b.height,false);state.dirty=true;
}
new ResizeObserver(resize).observe(viewport);
let prevTime=0;
function update(now){
 requestAnimationFrame(update);
 if(document.hidden||!host.classList.contains('active')){prevTime=now;return}
 if(mobile&&now-prevTime<29)return;
 const dt=Math.min(.07,(now-prevTime)/1000||.02);prevTime=now;
 if(state.auto){state.yaw+=dt*.075;state.dirty=true}
 state.dist+=(state.targetDist-state.dist)*Math.min(1,dt*7);
 camera.position.set(Math.sin(state.yaw)*Math.cos(state.pitch)*state.dist,Math.sin(state.pitch)*state.dist,Math.cos(state.yaw)*Math.cos(state.pitch)*state.dist);
 camera.lookAt(0,0,0);
 const explodeOffsets={membrane:[0,0,-2.4],booms:[1.5,.55,-.7],bus:[0,1.05,2],payload:[.7,-1.4,1.5],thrusters:[1.6,-.55,2],habitat:[0,.7,2.7],spine:[0,0,0],radiators:[2.4,.85,0],reactor:[0,-.8,-1.4],engine:[0,-.6,-2.6],arms:[1.8,.8,1.25]};
 let animating=false;
 for(const [name,g] of Object.entries(groups)){
  const target=state.explode?(explodeOffsets[name]||[0,0,0]):[0,0,0];
  const dest=V(...target);if(g.position.distanceToSquared(dest)>.0002){g.position.lerp(dest,Math.min(1,dt*6));animating=true}
 }
 if(!state.dirty&&!animating&&Math.abs(state.targetDist-state.dist)<.003)return;
 renderer.render(scene,camera);
 $('#shipCoordinates').textContent='AZ '+((Math.round(state.yaw*180/Math.PI)%360+360)%360).toString().padStart(3,'0')+'° / EL '+Math.round(state.pitch*180/Math.PI)+'° / ZOOM '+(23/state.dist).toFixed(1)+'×';
 for(const pin of $$('.shipyard-pin')){
  const data=anchors[pin.dataset.part];if(!data)continue;
  const obj=groups[pin.dataset.part],pt=V(...data).add(obj.position).project(camera);
  const x=(pt.x*.5+.5)*state.w,y=(-pt.y*.5+.5)*state.h;
  pin.hidden=pt.z>1||x<30||y<30||x>state.w-30||y>state.h-30;
  pin.style.left=x+'px';pin.style.top=y+'px';
 }
 state.dirty=false;
}
selectModel('freighter');resize();requestAnimationFrame(update);
