/* STS Shipyard / interactive engineering models. 100% local, no fonts/CDN/3D libraries. */
(()=>{'use strict';
const host=document.querySelector('#vesselsView');if(!host)return;
const names=['Beam-sail freighter','Beam-sail clipper','Fusion transport','Orbital tug'];
const models=[
 {id:'freighter',number:'01',serial:'FREIGHT / BEAM SAIL',name:names[0],desc:'사분면 반사막과 독립 트러스를 가진 장거리 화물선. 세일은 전개식 빔 수신면이며 대형 화물부는 후방 구조 트러스에 탑재됩니다.',role:'Bulk freight',drive:'Beamed sail',assembly:'Membrane / truss',service:'Interplanetary cargo',parts:[['membrane','사분면 반사막','4개 분할 패널. 빔 입사각에 따른 응력과 반사면 관리가 핵심입니다.'],['booms','복합재 붐·장력 케이블','세일 형태를 유지하는 다중 붐과 리깅 구조입니다.'],['bus','제어·수신 허브','빔 추적 센서, 자세 제어, 수신부 및 조향장치 집합입니다.'],['payload','컨테이너 트러스','화물 컨테이너와 조립식 트러스가 세일에서 떨어진 위치에 자리합니다.'],['thrusters','자세 제어 모듈','정밀 도킹과 세일 자세 조절을 담당하는 소형 보조 추진기입니다.']]},
 {id:'clipper',number:'02',serial:'COURIER / BEAM SAIL',name:names[1],desc:'여객·긴급화물을 위한 고속 세일선 구상. 좁은 선체에 두 겹의 비대칭 세일을 배치하고, 핵심 승무원 구획은 선체 중앙에 집중시켰습니다.',role:'Express / courier',drive:'Beamed sail',assembly:'Twin sail panels',service:'Priority transfer',parts:[['membrane','이중 세일 패널','주·보조 수광면을 분리한 가변형 전개막입니다.'],['booms','마스트·힌지','회전 가능한 붐과 잠금 힌지로 입사각을 조정합니다.'],['bus','승무원 캡슐','전방 유인 구획과 전자장비 중심부입니다.'],['payload','고속 화물 팟','정밀 화물을 담는 탈착식 밀폐 컨테이너입니다.'],['thrusters','접근 추진부','터미널 접근과 자세 제어에 사용하는 보조 엔진입니다.']]},
 {id:'fusion',number:'03',serial:'LONG RANGE / FUSION',name:names[2],desc:'전방 승무원 구획과 후방 핵융합 추진부를 긴 구조축으로 분리한 수송선. 방열면을 선체에서 멀리 배치하고 엔진 주변을 독립된 정비 구역으로 구성합니다.',role:'Crew / logistics',drive:'Fusion drive',assembly:'Long axial spine',service:'Outer-system transport',parts:[['habitat','회전식 거주 링','장기 항해 승무원을 위한 회전 구획과 전방 항행실입니다.'],['spine','주 구조 트러스','거주구와 추진부를 연결하는 장거리 지지 구조물입니다.'],['radiators','전개식 방열판','추진계와 내부 전력계에서 발생한 폐열을 우주로 방출합니다.'],['reactor','추진·에너지 구획','후방 핵융합 구동부와 차폐벽, 정비·열관리 계통입니다.'],['engine','주 엔진 노즐','복수의 엔진 벨과 노즐 정렬 구동부입니다.']]},
 {id:'tug',number:'04',serial:'LOCAL / ORBITAL SERVICE',name:names[3],desc:'정거장 주변에서 선박을 견인하고 항만 구조물을 재배치하는 작업선. 전방 포획 링, 양측 매니퓰레이터, 중앙 연료탱크로 이루어집니다.',role:'Towing / salvage',drive:'Chemical / electric',assembly:'Manipulator cradle',service:'Station operations',parts:[['arms','포획 암·테더','선체와 표준 포획체를 결박하는 이중 관절 매니퓰레이터입니다.'],['bus','명령·제어 모듈','유인·원격 제어가 가능한 독립 조종실입니다.'],['payload','연료탱크·화물','단거리 재배치를 위한 추진제와 표준 화물 고정대입니다.'],['thrusters','벡터 스러스터','정밀 상대운동 제어를 위한 다방향 노즐군입니다.']]}
];
const material={foil:[222,233,236],foil2:[141,175,194],foil3:[185,207,221],light:[210,227,236],metal:[102,123,137],steel:[150,174,188],dark:[45,64,81],blue:[65,102,127],aqua:[108,202,232],gold:[197,156,91],heat:[129,91,81],black:[22,35,47],ceramic:[218,215,202],shadow:[30,49,64],orange:[213,123,72]};
const TAU=Math.PI*2,clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const v=(x,y,z)=>[x,y,z],add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2]],norm=a=>mul(a,1/(Math.hypot(...a)||1));
class Mesh{
 constructor(){this.tris=[];this.lines=[];this.anchors={}}
 tri(a,b,c,mat,part,alpha=1){this.tris.push({pts:[a,b,c],mat,part,alpha})}
 quad(a,b,c,d,mat,part,alpha=1){this.tri(a,b,c,mat,part,alpha);this.tri(a,c,d,mat,part,alpha)}
 line(a,b,mat,part,width=1){this.lines.push({a,b,mat,part,width})}
 anchor(part,p){this.anchors[part]=p}
 box(p,dim,mat,part){const [x,y,z]=p,[w,h,d]=dim.map(n=>n/2),q=[v(x-w,y-h,z-d),v(x+w,y-h,z-d),v(x+w,y+h,z-d),v(x-w,y+h,z-d),v(x-w,y-h,z+d),v(x+w,y-h,z+d),v(x+w,y+h,z+d),v(x-w,y+h,z+d)];for(const face of [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]])this.quad(...face.map(i=>q[i]),mat,part)}
 tube(a,b,r,mat,part,sides=9){const t=norm(sub(b,a)),axis=Math.abs(t[1])<.85?v(0,1,0):v(1,0,0),u=norm(cross(t,axis)),w=norm(cross(t,u));const circle=(p,i)=>add(p,add(mul(u,Math.cos(i*TAU/sides)*r),mul(w,Math.sin(i*TAU/sides)*r)));for(let i=0;i<sides;i++){const p=circle(a,i),q=circle(a,i+1),r1=circle(b,i+1),s=circle(b,i);this.quad(p,q,r1,s,mat,part);this.tri(a,q,p,mat,part);this.tri(b,s,r1,mat,part)}}
 ring(center,r,t,plane,mat,part,segments=28){const n=Math.min(36,segments),sides=6,pt=(a,b)=>{const rr=r+Math.cos(b)*t,nn=Math.sin(b)*t;return plane==='xz'?v(Math.cos(a)*rr,nn,Math.sin(a)*rr):plane==='yz'?v(nn,Math.cos(a)*rr,Math.sin(a)*rr):v(Math.cos(a)*rr,Math.sin(a)*rr,nn)};for(let i=0;i<n;i++){const a=i*TAU/n,b=(i+1)*TAU/n;for(let j=0;j<sides;j++){const c=j*TAU/sides,d=(j+1)*TAU/sides;this.quad(add(center,pt(a,c)),add(center,pt(b,c)),add(center,pt(b,d)),add(center,pt(a,d)),mat,part)}this.line(add(center,pt(a,0)),add(center,pt(b,0)),'light',part,.4)}} 
 taper(a,b,r0,r1,mat,part,sides=12){const t=norm(sub(b,a)),ax=Math.abs(t[1])<.88?v(0,1,0):v(1,0,0),u=norm(cross(t,ax)),w=norm(cross(t,u));const pt=(p,r,i)=>add(p,add(mul(u,Math.cos(i*TAU/sides)*r),mul(w,Math.sin(i*TAU/sides)*r)));for(let i=0;i<sides;i++){this.quad(pt(a,r0,i),pt(a,r0,i+1),pt(b,r1,i+1),pt(b,r1,i),mat,part);this.tri(a,pt(a,r0,i),pt(a,r0,i+1),mat,part);this.tri(b,pt(b,r1,i+1),pt(b,r1,i),mat,part)}}
 pod(x,y,z,len,r,mat,part){this.taper(v(x,y,z-len*.5),v(x,y,z-len*.32),r*.65,r,mat,part,12);this.tube(v(x,y,z-len*.32),v(x,y,z+len*.36),r,mat,part,12);this.taper(v(x,y,z+len*.36),v(x,y,z+len*.55),r,.04,mat,part,12);for(let k=0;k<3;k++)this.ring(v(x,y,z-len*.2+k*len*.25),r+.011,.022,'xy',k===1?'gold':'steel',part,16)}
 radiator(side){const s=side;for(let k=0;k<2;k++){const y=s*(1.25+k*.19);this.tube(v(0,y,-4.2),v(0,y,3.5),.07,'steel','radiators',6)}for(let j=0;j<3;j++){const a=j*1.68-2.3,b=a+1.49;for(let i=0;i<5;i++){const x0=s*(1.3+i*.91),x1=s*(1.3+(i+1)*.91),z0=a,z1=b;const yy=s*.18+.028*Math.sin(j+i);this.quad(v(x0,yy,z0),v(x1,yy,z0),v(x1,yy,z1),v(x0,yy,z1),i%2?'heat':'shadow','radiators',.99);this.line(v(x0,yy+.02,z0),v(x1,yy+.02,z0),'steel','radiators',.65)}this.tube(v(s*1.22,s*.14,a),v(s*5.9,s*.14,a),.055,'metal','radiators',6)}for(let z of [-2.35,2.5])this.tube(v(s*.60,0,z),v(s*5.7,s*.14,z),.065,'steel','radiators',6)}

}
function sail(M,scale=1,z0=-4){const R=5.7*scale,hub=.68*scale,nR=6,nA=11;for(let k=0;k<4;k++){const aa=k*Math.PI*.5+.075,bb=(k+1)*Math.PI*.5-.075;const point=(u,w)=>{const r=hub+(R-hub)*u,a=aa+(bb-aa)*w,sag=.22*(u*u)-.10*Math.sin(w*Math.PI)*u;return v(Math.cos(a)*r,Math.sin(a)*r,z0+sag*scale)};for(let i=0;i<nR;i++)for(let j=0;j<nA;j++){const u=i/nR,w=j/nA,u2=(i+1)/nR,w2=(j+1)/nA;const mat=((i+j)%5===0)?'foil':((i+j+k)%3===0?'foil3':'foil2');M.quad(point(u,w),point(u2,w),point(u2,w2),point(u,w2),mat,'membrane',.98)}for(let j=0;j<=nA;j+=2){M.line(point(0,j/nA),point(1,j/nA),j===0||j===nA?'light':'steel','booms',j===0||j===nA?1.35:.65)}for(let i=1;i<=nR;i++){for(let j=0;j<nA;j++){M.line(point(i/nR,j/nA),point(i/nR,(j+1)/nA),'foil3','membrane',.30)}}M.tube(v(0,0,z0-.25),point(1,0),.035,'steel','booms',7);M.tube(v(0,0,z0-.25),point(1,1),.035,'steel','booms',7);M.line(point(1,0),point(1,1),'ceramic','booms',1.6)}M.taper(v(0,0,z0-.65),v(0,0,z0+.65),.34,.42,'metal','bus');M.ring(v(0,0,z0+.42),.46,.08,'xy','gold','bus',20);for(let k=0;k<8;k++){const a=k*TAU/8;M.tube(v(0,0,z0+.4),v(Math.cos(a)*.92*scale,Math.sin(a)*.92*scale,z0+.06),.035,'steel','booms',6)}M.anchor('membrane',v(-3.1*scale,2.6*scale,z0));M.anchor('booms',v(3.2*scale,2.1*scale,z0-.08));}
function modelFreighter(){const M=new Mesh();sail(M,1,-4.15);const u=[[-.68,-.68],[.68,-.68],[.68,.68],[-.68,.68]];for(let i=0;i<4;i++){const a=u[i],b=u[(i+1)%4];M.tube(v(a[0],a[1],-2.9),v(a[0],a[1],6.8),.07,'steel','payload',7);for(const z of [-2.7,-1,1,3,5,6.65])M.tube(v(a[0],a[1],z),v(b[0],b[1],z),.052,'light','payload',7);for(let z=-2.6;z<6.1;z+=1.72)M.tube(v(a[0],a[1],z),v(b[0],b[1],z+1.72),.038,'metal','payload',6)}for(let z=-2.1;z<5.8;z+=2){for(const x of [-.4,.4])for(const y of [-.37,.37]){M.box(v(x,y,z),v(.67,.55,1.68),((z+x+y)%3)>1?'ceramic':'metal','payload');M.line(v(x-.3,y+.287,z-.68),v(x+.3,y+.287,z-.68),'steel','payload',.9);M.line(v(x-.3,y+.287,z+.68),v(x+.3,y+.287,z+.68),'steel','payload',.9)}}M.tube(v(0,0,-3.3),v(0,0,7),.17,'steel','bus',12);for(let s of [-1,1]){M.tube(v(s*3.3,s*3.0,-4),v(s*.55,s*.55,-1.35),.037,'steel','booms',6);M.tube(v(s*3.3,-s*3,-4),v(s*.55,-s*.55,-1.35),.037,'steel','booms',6)}M.taper(v(0,0,6.1),v(0,0,7.65),.83,.49,'light','bus');M.taper(v(0,0,7.65),v(0,0,8.6),.49,.06,'ceramic','bus');M.ring(v(0,0,6.55),.86,.085,'xy','blue','bus',20);for(let x of [-1,1]){M.taper(v(x*.92,-.2,5.75),v(x*.92,-.2,6.8),.28,.32,'metal','thrusters');M.ring(v(x*.92,-.2,5.75),.28,.045,'xy','aqua','thrusters',16)}M.anchor('payload',v(.45,.35,2));M.anchor('bus',v(.25,.38,7.4));M.anchor('thrusters',v(1,-.2,6));return M}
function modelClipper(){const M=new Mesh();const wing=(s,z,size,part='membrane')=>{const n=8;const p=(u,w)=>{const x=s*(.52+u*4.65*size),y=(w*2-1)*(1.0+u*(1.45-u*.65))*size;return v(x,y,z+u*.95*size+w*.13)};for(let i=0;i<n;i++)for(let j=0;j<3;j++){const a=i/n,b=(i+1)/n,c=j/3,d=(j+1)/3;M.quad(p(a,c),p(b,c),p(b,d),p(a,d),(i+j)%3===0?'foil':'foil2',part,.98)}for(let j of [0,.5,1])M.tube(p(0,j),p(1,j),.028,'light','booms',6);for(let i=0;i<=n;i+=2)M.line(p(i/n,0),p(i/n,1),'steel','membrane',.6)};for(let s of [-1,1]){wing(s,-3.1,1);wing(s,-.35,.66);M.tube(v(s*.6,0,-3.25),v(s*.58,0,5.5),.055,'steel','booms',7);M.tube(v(0,0,-2.5),v(s*5,0,-2.15),.049,'steel','booms',7)}M.tube(v(0,0,-3.7),v(0,0,6.2),.24,'metal','bus',12);for(let z of [-2.1,0,2.1,4.2])M.ring(v(0,0,z),.28,.04,'xy','gold','bus',16);M.taper(v(0,0,3.3),v(0,0,5.9),.62,.72,'ceramic','bus');M.taper(v(0,0,5.9),v(0,0,7.1),.72,.08,'light','bus');M.box(v(0,.49,4.6),v(.85,.12,1.1),'dark','bus');for(let s of [-1,1]){M.pod(s*.94,-.42,2.0,3.4,.36,'metal','payload');M.tube(v(s*.65,-.1,3.6),v(s*.94,-.42,3.3),.04,'steel','payload',7);M.taper(v(s*.44,-.18,-4.0),v(s*.44,-.18,-4.8),.23,.31,'blue','thrusters');M.ring(v(s*.44,-.18,-4.8),.30,.05,'xy','aqua','thrusters',16)}M.anchor('membrane',v(-3,1.5,-2.7));M.anchor('booms',v(3.2,1.2,-1.9));M.anchor('bus',v(0,.4,5.1));M.anchor('payload',v(-1,-.4,2));M.anchor('thrusters',v(.5,-.18,-4.8));return M}
function modelFusion(){const M=new Mesh();const corners=[[-.46,-.46],[.46,-.46],[.46,.46],[-.46,.46]];for(let z=-6;z<7.5;z+=1.15){for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4];M.tube(v(a[0],a[1],z),v(a[0],a[1],z+1.15),.049,'light','spine',6);M.tube(v(a[0],a[1],z),v(b[0],b[1],z+1.15),.031,'steel','spine',6)}}M.tube(v(0,0,-6.7),v(0,0,8.2),.19,'metal','spine',12);for(const s of [-1,1])M.radiator(s);for(let z of [-2.75,-.9,.95]){M.taper(v(0,0,z-.73),v(0,0,z+.73),.84,.84,'metal','reactor',14);M.ring(v(0,0,z-.78),.89,.066,'xy','gold','reactor',22);M.ring(v(0,0,z+.75),.89,.06,'xy','steel','reactor',22);for(let a=0;a<6;a++){const t=a*TAU/6;M.box(v(Math.cos(t)*.81,Math.sin(t)*.81,z),v(.24,.24,1.12),'shadow','reactor')}}M.box(v(0,0,-4.75),v(2.1,2.1,.64),'dark','reactor');for(let s of [-1,1])for(let y of [-.5,.5]){M.taper(v(s*.68,y,-5.35),v(s*.68,y,-7.35),.31,.48,'blue','engine',12);M.ring(v(s*.68,y,-7.35),.48,.075,'xy','aqua','engine',18);M.taper(v(s*.68,y,-7.4),v(s*.68,y,-7.9),.45,.22,'shadow','engine',12)}M.tube(v(0,0,5),v(0,0,9.2),.5,'ceramic','habitat',16);M.ring(v(0,0,5.3),.61,.075,'xy','gold','habitat',20);M.taper(v(0,0,8.4),v(0,0,10),.62,.09,'light','habitat',14);const R=2.45,z=6.6;M.ring(v(0,0,z),R,.34,'xy','steel','habitat',32);for(let i=0;i<12;i++){const a=i*TAU/12,p=v(Math.cos(a)*R,Math.sin(a)*R,z);M.box(p,v(.68,.65,.85),i%3===0?'ceramic':'metal','habitat');M.tube(v(0,0,z),p,.07,'light','habitat',7);M.line(v(Math.cos(a)*(R+.34),Math.sin(a)*(R+.34),z),v(Math.cos(a+.25)*(R+.34),Math.sin(a+.25)*(R+.34),z),'gold','habitat',.8)}M.anchor('habitat',v(1.3,1.9,6.6));M.anchor('spine',v(.46,.46,3.0));M.anchor('radiators',v(4.7,.18,.35));M.anchor('reactor',v(0,.8,-2.75));M.anchor('engine',v(.68,-.5,-7.5));return M}
function modelTug(){const M=new Mesh();M.taper(v(0,0,-1.65),v(0,0,1.9),1.02,1.12,'metal','bus',12);M.taper(v(0,0,1.9),v(0,0,3.1),1.14,.65,'ceramic','bus',12);M.box(v(0,.95,.45),v(1.52,.3,1.7),'dark','bus');M.box(v(0,.89,2.37),v(.92,.13,.62),'black','bus');for(let s of [-1,1]){M.box(v(s*1.02,0,.42),v(.37,.8,1.5),'steel','bus');M.box(v(s*.8,1.04,-.42),v(.37,.15,.52),'orange','bus');M.pod(s*1.04,-.75,-1.2,2.9,.47,'ceramic','payload');M.tube(v(s*1.27,0,1.25),v(s*2.05,.25,2.1),.21,'steel','arms',10);M.ring(v(s*2.05,.25,2.1),.26,.07,'xy','gold','arms',16);M.tube(v(s*2.05,.25,2.1),v(s*2.65,.2,3.35),.16,'metal','arms',10);M.tube(v(s*2.65,.2,3.35),v(s*1.65,0,4.2),.11,'light','arms',9);M.box(v(s*1.65,0,4.2),v(.26,.25,.56),'orange','arms');M.taper(v(s*.7,-.15,-2.0),v(s*.7,-.15,-3.1),.36,.45,'blue','thrusters');M.ring(v(s*.7,-.15,-3.1),.44,.06,'xy','aqua','thrusters',18);M.taper(v(s*1.38,.68,-.7),v(s*1.85,.68,-.9),.19,.27,'metal','thrusters')}M.ring(v(0,0,4.0),1.72,.16,'xy','steel','arms',32);M.ring(v(0,0,3.68),1.42,.09,'xy','metal','arms',30);for(let a=0;a<8;a++){const t=a*TAU/8;M.tube(v(Math.cos(t)*1.45,Math.sin(t)*1.45,3.72),v(Math.cos(t)*1.72,Math.sin(t)*1.72,4),.064,a%2?'steel':'orange','arms',6)}M.tube(v(0,1.03,-.2),v(0,1.9,-.25),.07,'steel','bus',7);M.box(v(0,1.89,-.24),v(.64,.15,.22),'aqua','bus');M.anchor('arms',v(1.74,1.01,3.9));M.anchor('bus',v(.65,1.0,1.25));M.anchor('payload',v(-1,-.75,-1.2));M.anchor('thrusters',v(.7,-.15,-3));return M}

const builders={freighter:modelFreighter,clipper:modelClipper,fusion:modelFusion,tug:modelTug};
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
host.classList.add('shipyard-view');
host.innerHTML=`<div class="page-eyebrow micro accent">03 / VESSEL ARCHITECTURE · DESIGN STUDY 06</div><div class="generic-header"><h2>선박 설계<span>.</span></h2><button data-view="home">← INDEX</button></div><div class="shipyard-headline"><p>STS 항행망에 투입되는 선박의 구조 설계. 선박 형식별 구조를 살펴볼 수 있는 설계 뷰어입니다. 선체를 회전하거나 확대하고, 부품을 선택하면 해당 계통의 설명을 확인할 수 있습니다.</p><span class="shipyard-label">FOUR ENGINEERING CONCEPTS / <strong>2120</strong></span></div><div class="shipyard-console"><div class="shipyard-main"><nav class="shipyard-modelstrip" aria-label="선박 형식 선택">${models.map(m=>`<button type="button" class="shipyard-model" data-model="${m.id}" aria-pressed="${m.id==='freighter'}"><small>${m.number} / ${m.serial.split(' / ')[0]}</small><strong>${m.name}</strong></button>`).join('')}</nav><div class="shipyard-viewport" id="shipViewport"><canvas id="shipCanvas" aria-label="회전·확대 가능한 우주선 3차원 도면"></canvas><div class="shipyard-sensor"><span><i></i>STS / ENGINEERING VIEWPORT</span><b>DRAG TO ROTATE · PINCH / WHEEL TO ZOOM</b></div><span class="shipyard-watermark" id="shipRenderMode">MATERIAL / SHADED</span><span class="shipyard-coordinates" id="shipCoordinates">AZ 032° / EL 019°</span><span class="shipyard-axes">MODEL SPACE<br>X / Y / Z</span><div id="shipPins"></div></div><div class="shipyard-toolbar"><div class="shipyard-tools"><button type="button" class="shipyard-tool" id="shipRotate" aria-pressed="true">⟳ AUTO ROTATE</button><button type="button" class="shipyard-tool" id="shipExplode" aria-pressed="false">EXPLODED</button><button type="button" class="shipyard-tool" id="shipWire" aria-pressed="false">WIREFRAME</button><button type="button" class="shipyard-tool" id="shipReset">RESET</button><button type="button" class="shipyard-tool" id="shipPlus" aria-label="확대">＋</button><button type="button" class="shipyard-tool" id="shipMinus" aria-label="축소">－</button></div><span class="shipyard-readout">ENGINEERING STUDY / INTERACTIVE MODEL</span></div></div><aside class="shipyard-sidebar"><div class="shipyard-sidebar-top"><span class="shipyard-series" id="shipSeries"></span><h3 id="shipName"></h3><p id="shipDescription"></p></div><div class="shipyard-specs" id="shipSpecs"></div><div class="shipyard-parts" id="shipParts"></div><div class="shipyard-part-note"><b id="shipPartName">SYSTEM SELECTED</b><p id="shipPartDetail"></p></div></aside></div><div class="shipyard-fineprint"><span>DESIGN STUDY · 비확정 설계 시안 · 역사·함급·운용 제원은 추후 설정집과 대조</span><span>RENDER / INTERACTIVE · TOUCH & MOUSE</span></div>`;
const $=s=>host.querySelector(s),$$=s=>[...host.querySelectorAll(s)],canvas=$('#shipCanvas'),vp=$('#shipViewport'),ctx=canvas.getContext('2d',{alpha:false});
if(!ctx)return;
const back=host.querySelector('.generic-header [data-view="home"]');if(back)back.addEventListener('click',()=>document.querySelector('#brandBtn')?.click());
const state={id:'freighter',mesh:null,yaw:-.55,pitch:.40,zoom:1.0,auto:!matchMedia('(prefers-reduced-motion: reduce)').matches,explode:false,explodeT:0,wire:false,active:'membrane',w:0,h:0,dpr:1,last:0,drag:new Map(),lastPos:null,dirty:true};
const seed=n=>(Math.sin(n*987.67)*43758.5453)%1;const stars=Array.from({length:95},(_,i)=>({x:Math.abs(seed(i*1.7+1)),y:Math.abs(seed(i*2.3+9)),size:i%17===0?1.3:.65,opacity:.1+(i%7)*.045}));
function expOffset(part){if(!state.explodeT)return [0,0,0];const f=state.explodeT;const ranges={freighter:{membrane:[-1.6,0,-1.6],booms:[0,.4,-.9],bus:[1.2,.8,1.3],payload:[.9,-1,1.8],thrusters:[1.6,-.8,3]},clipper:{membrane:[-1.5,0,-1.9],booms:[0,.6,-1],bus:[.9,0,1.9],payload:[1.5,-.8,2],thrusters:[1,0,-1]},fusion:{habitat:[.0,.9,1.8],spine:[0,0,0],radiators:[2.3,.8,.2],reactor:[0,-.8,-1.4],engine:[0,-.6,-2.3]},tug:{arms:[1.9,.9,1],bus:[0,.4,0],payload:[-.7,-1,-.8],thrusters:[0,0,-2]}};return mul(ranges[state.id]?.[part]||[0,0,0],f)}
function rotate(p){const cy=Math.cos(state.yaw),sy=Math.sin(state.yaw),cp=Math.cos(state.pitch),sp=Math.sin(state.pitch),x=p[0]*cy+p[2]*sy,z=p[2]*cy-p[0]*sy;return [x,p[1]*cp-z*sp,p[1]*sp+z*cp]}
function position(p,part){return rotate(add(p,expOffset(part)))}
function screen(p){const depth=Math.max(.33,1-p[2]/29),sc=Math.min(state.w/17.8,state.h/14.8)*state.zoom/depth;return {x:state.w*.5+p[0]*sc,y:state.h*.52-p[1]*sc,z:p[2],sc}}
function color(mat,shade=1,active=false){const src=material[mat]||material.metal,boost=active?1.27:1;return `rgb(${src.map(x=>clamp(Math.round(x*shade*boost),0,255)).join(',')})`}
function paint(){const w=state.w,h=state.h;if(!w||!h)return;ctx.setTransform(state.dpr,0,0,state.dpr,0,0);ctx.clearRect(0,0,w,h);const bg=ctx.createRadialGradient(w*.44,h*.39,10,w*.5,h*.5,Math.max(w,h)*.78);bg.addColorStop(0,'#172637');bg.addColorStop(.48,'#0c1520');bg.addColorStop(1,'#060b11');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);for(const s of stars){ctx.fillStyle=`rgba(165,198,223,${s.opacity})`;ctx.fillRect(s.x*w,s.y*h,s.size,s.size)}ctx.lineWidth=.6;ctx.strokeStyle='#6c9fbe10';for(let k=0;k<9;k++){const y=h*.16+k*h*.085;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}for(let k=0;k<13;k++){const x=k*w/12;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}ctx.strokeStyle='#b4d8ec19';ctx.lineWidth=.8;const cx=w*.5,cy=h*.52;for(const dx of [-1,1])for(const dy of [-1,1]){ctx.beginPath();ctx.moveTo(cx+dx*w*.36,cy+dy*h*.32);ctx.lineTo(cx+dx*(w*.36-16),cy+dy*h*.32);ctx.moveTo(cx+dx*w*.36,cy+dy*h*.32);ctx.lineTo(cx+dx*w*.36,cy+dy*(h*.32-16));ctx.stroke()}
 const mesh=state.mesh;if(!mesh)return;const items=[];for(const f of mesh.tris){const ps=f.pts.map(p=>position(p,f.part)),depth=(ps[0][2]+ps[1][2]+ps[2][2])/3;items.push({f,ps,depth})}items.sort((a,b)=>a.depth-b.depth);const light=norm([-.27,.51,1]);
 for(const it of items){const {f,ps}=it,screenPts=ps.map(screen);if(screenPts.some(q=>!Number.isFinite(q.x)))continue;const n=norm(cross(sub(ps[1],ps[0]),sub(ps[2],ps[0]))),d=Math.abs(n[0]*light[0]+n[1]*light[1]+n[2]*light[2]),rim=1-Math.abs(n[2]),shade=clamp(.56+d*.53+rim*.10,.38,1.25),hilite=state.active===f.part;ctx.globalAlpha=state.wire?.23:(f.alpha*(state.active&&!hilite?.97:1));ctx.fillStyle=state.wire?'#254154':color(f.mat,shade,hilite);ctx.beginPath();ctx.moveTo(screenPts[0].x,screenPts[0].y);ctx.lineTo(screenPts[1].x,screenPts[1].y);ctx.lineTo(screenPts[2].x,screenPts[2].y);ctx.closePath();ctx.fill();if(state.wire){ctx.strokeStyle=hilite?'#c5eaff':'#54758e';ctx.lineWidth=.6;ctx.stroke()}}
 ctx.globalAlpha=1;for(const l of mesh.lines){const a=screen(position(l.a,l.part)),b=screen(position(l.b,l.part));if(!Number.isFinite(a.x)||!Number.isFinite(b.x))continue;ctx.strokeStyle=color(l.mat,.93,state.active===l.part);ctx.lineWidth=clamp(l.width*state.zoom,.5,3);ctx.globalAlpha=state.active===l.part?1:(state.wire?.86:.50);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}ctx.globalAlpha=1;
 const spots=$$('#shipPins .shipyard-pin');for(const s of spots){const point=mesh.anchors[s.dataset.part];if(!point){s.hidden=true;continue}const p=screen(position(point,s.dataset.part));s.hidden=p.x<20||p.x>w-20||p.y<20||p.y>h-20;s.style.left=`${p.x}px`;s.style.top=`${p.y}px`}
 const deg=rad=>((rad*180/Math.PI)%360+360)%360;$('#shipCoordinates').textContent=`AZ ${Math.round(deg(state.yaw)).toString().padStart(3,'0')}° / EL ${Math.round(deg(state.pitch)).toString().padStart(2,'0')}° / ZOOM ${state.zoom.toFixed(1)}×`;
}
function resize(){const r=vp.getBoundingClientRect();state.w=Math.max(260,Math.round(r.width));state.h=Math.max(240,Math.round(r.height));state.dpr=Math.min(window.devicePixelRatio||1,window.innerWidth<700?1.0:1.35);canvas.width=Math.round(state.w*state.dpr);canvas.height=Math.round(state.h*state.dpr);state.dirty=true}
const observer=new ResizeObserver(resize);observer.observe(vp);
function selectPart(part){const m=models.find(m=>m.id===state.id);const p=m.parts.find(a=>a[0]===part)||m.parts[0];state.active=p[0];$$('.shipyard-part').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.part===part)));$$('.shipyard-pin').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.part===part)));$('#shipPartName').textContent=`${p[0].toUpperCase()} / ${p[1]}`;$('#shipPartDetail').textContent=p[2];state.dirty=true}
function selectModel(id){const m=models.find(x=>x.id===id);if(!m)return;state.id=id;state.mesh=builders[id]();state.explodeT=state.explode?1:0;state.yaw=id==='fusion'?-.76:-.50;state.pitch=id==='fusion'?.53:.40;state.zoom=id==='fusion'?1.16:1.10;$$('.shipyard-model').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.model===id)));$('#shipSeries').textContent=m.number+' / '+m.serial;$('#shipName').textContent=m.name;$('#shipDescription').textContent=m.desc;$('#shipSpecs').innerHTML=[['ROLE',m.role],['PROPULSION',m.drive],['CONFIGURATION',m.assembly],['NETWORK USE',m.service]].map(x=>`<div><small>${x[0]}</small><strong>${escapeHtml(x[1])}</strong></div>`).join('');$('#shipParts').innerHTML=`<div class="shipyard-parts-title">SELECT A COMPONENT / ${m.parts.length} SYSTEMS</div>`+m.parts.map((p,i)=>`<button type="button" class="shipyard-part" data-part="${p[0]}" aria-pressed="false"><span><em>${String(i+1).padStart(2,'0')}</em>${escapeHtml(p[1])}</span></button>`).join('');$('#shipPins').innerHTML=m.parts.map((p,i)=>`<button class="shipyard-pin" type="button" data-part="${p[0]}" aria-label="${escapeHtml(p[1])} 선택" aria-pressed="false"></button>`).join('');$$('.shipyard-part, .shipyard-pin').forEach(b=>b.addEventListener('click',()=>selectPart(b.dataset.part)));selectPart(m.parts[0][0]);state.dirty=true}
$$('.shipyard-model').forEach(b=>b.addEventListener('click',()=>selectModel(b.dataset.model)));
$('#shipRotate').addEventListener('click',e=>{state.auto=!state.auto;e.currentTarget.setAttribute('aria-pressed',String(state.auto));state.dirty=true});
$('#shipExplode').addEventListener('click',e=>{state.explode=!state.explode;e.currentTarget.setAttribute('aria-pressed',String(state.explode));state.dirty=true});
$('#shipWire').addEventListener('click',e=>{state.wire=!state.wire;e.currentTarget.setAttribute('aria-pressed',String(state.wire));$('#shipRenderMode').textContent=state.wire?'TECHNICAL / WIREFRAME':'MATERIAL / SHADED';state.dirty=true});
$('#shipReset').addEventListener('click',()=>{state.yaw=state.id==='fusion'?-.76:-.52;state.pitch=state.id==='fusion'?.53:.40;state.zoom=state.id==='fusion'?1.16:1.10;state.dirty=true});
$('#shipPlus').addEventListener('click',()=>{state.zoom=clamp(state.zoom*1.2,.55,2.45);state.dirty=true});
$('#shipMinus').addEventListener('click',()=>{state.zoom=clamp(state.zoom/1.2,.55,2.45);state.dirty=true});
vp.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;vp.setPointerCapture(e.pointerId);state.drag.set(e.pointerId,{x:e.clientX,y:e.clientY});state.auto=false;$('#shipRotate').setAttribute('aria-pressed','false');vp.classList.add('dragging')});
vp.addEventListener('pointermove',e=>{if(!state.drag.has(e.pointerId))return;const before=state.drag.get(e.pointerId);const now={x:e.clientX,y:e.clientY};state.drag.set(e.pointerId,now);if(state.drag.size===1){state.yaw+=((now.x-before.x)/Math.max(250,vp.clientWidth))*Math.PI*1.7;state.pitch=clamp(state.pitch+(now.y-before.y)/Math.max(250,vp.clientHeight)*Math.PI, -.96,1.16)}else if(state.drag.size===2){const others=[...state.drag.entries()].filter(([k])=>k!==e.pointerId);const d1=Math.hypot(before.x-others[0][1].x,before.y-others[0][1].y),d2=Math.hypot(now.x-others[0][1].x,now.y-others[0][1].y);if(d1>10)state.zoom=clamp(state.zoom*d2/d1,.55,2.45)}state.dirty=true});
for(const n of ['pointerup','pointercancel','lostpointercapture'])vp.addEventListener(n,e=>{state.drag.delete(e.pointerId);if(!state.drag.size)vp.classList.remove('dragging')});
vp.addEventListener('wheel',e=>{e.preventDefault();state.zoom=clamp(state.zoom*(e.deltaY>0?.91:1.09),.55,2.45);state.dirty=true},{passive:false});
let lastFrame=0;function tick(t){if(window.STS_SHIPYARD_V7_READY)return;requestAnimationFrame(tick);if(document.hidden||!host.classList.contains('active')||!state.mesh)return;if(t-lastFrame<48)return;const dt=Math.min((t-lastFrame)/1000,.08);lastFrame=t;if(state.auto){state.yaw+=dt*.11;state.dirty=true}const target=state.explode?1:0;if(Math.abs(target-state.explodeT)>.002){state.explodeT+=(target-state.explodeT)*Math.min(1,dt*7);state.dirty=true}if(!state.dirty)return;paint();state.dirty=false}
selectModel('freighter');resize();requestAnimationFrame(tick);
// Atlas connection: model scale follows projected pixels rather than arbitrary world units.
const Atlas3D=window.STS3D?.Atlas3D;
if(Atlas3D){
  const originalUpdate=Atlas3D.prototype.updateJourney;
  Atlas3D.prototype.updateJourney=function(dt){
    const before=this.shipPos&&this.shipPos.slice();
    const result=originalUpdate.call(this,dt);
    if(before&&this.shipPos){
      const delta=sub(this.shipPos,before),speed=Math.hypot(...delta);
      if(speed>0.000015){
        const direction=norm(delta);
        const prev=this._shipFacing||direction;
        this._shipFacing=norm(add(mul(prev,.76),mul(direction,.24)));
        this.shipDir=this._shipFacing.slice();
      }
    }else if(!this.shipPos){this._shipFacing=null}
    return result;
  };
  Atlas3D.prototype.drawShip=function(center,forward){
    if(!this.useWebGL||!this.basis||!center)return;
    const projected=this.project(center,this.basis);if(!projected)return;
    const f=norm(forward||[0,0,1]);
    const up=Math.abs(f[1])>.94?v(1,0,0):v(0,1,0);
    const x=norm(cross(up,f)),y=norm(cross(f,x)),axes=[x,y,f];
    const apparent=clamp(Math.min(this.width,this.height)*.18,60,114);
    const zScale=clamp(apparent/(Math.max(.02,projected.scale)*4.9),.08,95);
    const p=(xx,yy,zz)=>add(center,add(add(mul(x,xx*zScale),mul(y,yy*zScale)),mul(f,zz*zScale)));
    const box=(xx,yy,zz,dx,dy,dz,c,alpha=1)=>this.drawMesh(this.box,p(xx,yy,zz),[dx*zScale,dy*zScale,dz*zScale],c,alpha,.68,axes);
    // Four independently shaded reflector quadrants, clear truss spine and loaded cargo racks.
    for(const sign of [-1,1])for(const updown of [-1,1]){
      box(sign*.78,updown*.78,-1.4,1.48,1.48,.035,sign===updown?'#d6ecf4':'#a5cbdc',.96);
      box(sign*.78,updown*.78,-1.46,1.39,.024,.024,'#d6e7ee');
      box(sign*.78,updown*.78,-1.46,.024,1.38,.024,'#d6e7ee');
      box(sign*.53,updown*.53,-1.7,.075,.075,.35,'#acc8da');
      box(sign*.35,updown*.35,.30,.34,.33,1.12,'#6d8595');
    }
    box(0,0,-1.40,3.08,.08,.09,'#d5e4eb');
    box(0,0,-1.40,.08,3.08,.09,'#d5e4eb');
    box(0,0,.20,.22,.22,3.5,'#e3e9e9');
    box(0,0,2.24,.58,.53,.72,'#ecf1ef');
    box(0,0,2.78,.30,.29,.58,'#91b0c4');
    for(const xx of [-.4,.4])for(const yy of [-.31,.31])for(const zz of [0,.7,1.4]){
      box(xx,yy,zz,.48,.4,.57,zz===.7?'#b5c4ca':'#879caa');
    }
    for(const xx of [-1,1]){box(xx*.36,-.23,2.62,.24,.20,.44,'#9cb5c7');box(xx*.36,-.23,2.88,.17,.15,.15,'#8ccfe8',.92)}
  };
  // This overlay remains readable when the atlas switches to its 2D fallback,
  // when a planet occludes the WebGL model, or at solar-system camera distances.
  const originalOverlay=Atlas3D.prototype.renderOverlay;
  Atlas3D.prototype.renderOverlay=function(){
    originalOverlay.call(this);
    if(!this.shipPos||!this.basis)return;
    const point=this.project(this.shipPos,this.basis);
    if(!point||point.x<-110||point.x>this.width+110||point.y<-110||point.y>this.height+110)return;
    const f=norm(this.shipDir||[0,0,1]);
    const ahead=this.project(add(this.shipPos,mul(f,Math.max(.5,point.z*.016))),this.basis);
    let angle=0;
    if(ahead&&Math.hypot(ahead.x-point.x,ahead.y-point.y)>0.12){
      angle=Math.atan2(ahead.x-point.x,-(ahead.y-point.y));
    }else{
      angle=this._shipLastAngle||0;
    }
    const previous=this._shipLastAngle;
    if(Number.isFinite(previous)){
      let diff=angle-previous;while(diff>Math.PI)diff-=TAU;while(diff<-Math.PI)diff+=TAU;
      angle=previous+diff*.22;
    }
    this._shipLastAngle=angle;
    const c=this.ctx;
    const shipSize=clamp(Math.min(this.width,this.height)*.115,43,72);
    const sc=shipSize/56;
    c.save();c.translate(point.x,point.y);c.rotate(angle);c.scale(sc,sc);
    c.shadowColor='#8fd5f7';c.shadowBlur=5;c.globalAlpha=.94;
    const reflect=(sx,sy,light)=>{
      c.beginPath();c.moveTo(sx*1.8,sy*1.8);c.lineTo(sx*29,sy*4.8);
      c.quadraticCurveTo(sx*36,sy*26,sx*27,sy*29);
      c.lineTo(sx*4.8,sy*29);c.closePath();
      const g=c.createLinearGradient(sx*3,sy*3,sx*28,sy*28);
      g.addColorStop(0,light?'#d7edf6':'#8fb4c8');
      g.addColorStop(.52,light?'#edf6fb':'#aecad9');
      g.addColorStop(1,light?'#88a9bd':'#577f98');
      c.fillStyle=g;c.fill();c.strokeStyle='#cee8f6';c.lineWidth=.85;c.stroke();
      c.beginPath();c.moveTo(sx*3,sy*3);c.lineTo(sx*29,sy*29);c.moveTo(sx*13,sy*6);
      c.lineTo(sx*14,sy*28);c.moveTo(sx*6,sy*14);c.lineTo(sx*29,sy*14);
      c.strokeStyle='#cfdfeb8a';c.lineWidth=.65;c.stroke();
    };
    reflect(-1,-1,true);reflect(1,-1,false);reflect(-1,1,false);reflect(1,1,true);
    c.shadowBlur=0;c.fillStyle='#e5eff6';c.strokeStyle='#06121e';c.lineWidth=1;
    c.fillRect(-2.7,-4.1,5.4,32);c.strokeRect(-2.7,-4.1,5.4,32);
    for(const xx of [-8,8])for(const yy of [8,16,24]){
      c.fillStyle='#819aab';c.fillRect(xx-4,yy-4,8,8);
      c.strokeStyle='#d9e9f1';c.strokeRect(xx-4,yy-4,8,8);
    }
    c.fillStyle='#dce9f2';c.beginPath();c.moveTo(0,-12);c.lineTo(5,-3);c.lineTo(5,4);c.lineTo(-5,4);c.lineTo(-5,-3);c.closePath();c.fill();
    c.fillStyle='#93dafa';c.fillRect(-2,29,4,3.5);
    c.restore();
    // Replace the legacy label with one that stays clear of the vessel.
    c.save();c.setTransform(this.dpr,0,0,this.dpr,0,0);
    const oldX=Math.min(this.width-180,point.x+10),oldY=Math.max(35,point.y-18);
    c.fillStyle='#08131de8';c.fillRect(oldX-2,oldY-12,180,18);
    const tx=Math.min(this.width-183,Math.max(8,point.x+shipSize*.64));
    const ty=Math.max(25,Math.min(this.height-10,point.y-shipSize*.50));
    c.fillStyle='#0b1b29eb';c.fillRect(tx-5,ty-12,176,20);
    c.fillStyle='#cae6f4';c.font='10px ui-monospace,monospace';
    c.fillText('BEAM SAIL / IN TRANSIT',tx,ty+2);
    c.restore();
  };
}
import('./shipyard-v7.js?v=7.0').catch(err=>console.error('STS Shipyard WebGL load failed:',err));
})();