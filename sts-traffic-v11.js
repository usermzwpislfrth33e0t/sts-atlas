/* STS / Traffic & Geometry Bridge 11.0
   Shared engineering models; independent fusion navigation; beam links;
   scenario telemetry. Rendered inside the existing Atlas WebGL context. */
(()=>{'use strict';
const V=window.STS3D,Atlas=V?.Atlas3D,drawer=document.getElementById('journeyDrawer'),U=V?.MAP_SCALE||8;
if(!Atlas||!drawer){console.warn('STS traffic: Atlas module unavailable');return;}
const $=s=>document.querySelector(s),q=s=>drawer.querySelector(s);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),TAU=2*Math.PI;
const vec=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,n)=>a.map(x=>x*n);
const length=a=>Math.hypot(...a),unit=a=>mul(a,1/(length(a)||1));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((t,x,i)=>t+x*b[i],0);
const interp=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const format=(n,d=1)=>Number.isFinite(n)?n.toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:d}):'—';
const shipInfo={
 freighter:{label:'Beam-sail freighter',kr:'빔세일 화물선',drive:'M / H RECEIVER',time:.99,beam:.92,mass:2600},
 clipper:{label:'Beam-sail clipper',kr:'급행 세일선',drive:'L / H RECEIVER',time:.52,beam:.70,mass:180},
 fusion:{label:'Fusion transport',kr:'핵융합 수송선',drive:'FUSION / D–³He',time:1,power:3.8,mass:840},
 tug:{label:'Service cutter',kr:'핵융합 지원선 (시연)',drive:'FUSION / AUXILIARY',time:.73,power:1.8,mass:140}
};
const state={mode:'sail',vessel:'freighter',scale:1,paused:false,follow:true,ready:false,showBeam:true,sender:null,beamGW:0,energyTJ:0,phase:'STANDBY',activeHours:0,lastPaint:0,final:null};
window.STS_TRAFFIC_V11_STATE=state;
const modeLabel=m=>m==='fusion'?'INDEPENDENT FUSION CORRIDOR':'STS BEAM NETWORK';
const sources=V.STATIONS.filter(s=>['ARRAY','RELAY','POWER','HUB'].includes(s.type)&&((s.electric_GWe||0)>.18));
const routes=V.ROUTES;
const modelCache=new WeakMap();
function cacheFor(atlas){if(!modelCache.has(atlas))modelCache.set(atlas,{ship:new Map(),station:new Map(),line:null,route:null});return modelCache.get(atlas)}
function releaseModel(root){
 root.traverse(o=>{if(o.geometry?.dispose)o.geometry.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){m.map?.dispose?.();m.dispose?.()}}});
}
function gpuModel(atlas,key,kind){
 if(!atlas.gl)return null;
 const collection=cacheFor(atlas)[kind];
 if(collection.has(key))return collection.get(key);
 const factory=kind==='ship'?window.STS_SHIPYARD_EXPORT_MODEL:window.STS_STATIONYARD_EXPORT_MODEL;
 if(typeof factory!=='function')return null;
 let root;
 try{root=factory(key)}catch(err){console.warn('STS 3D model transfer:',key,err);return null}
 if(!root)return null;
 root.updateMatrixWorld(true);
 const bucket=new Map();let triangles=0;
 root.traverse(o=>{
  if(!o.isMesh||!o.geometry?.attributes?.position)return;
  const geo=o.geometry,pos=geo.attributes.position,vColors=geo.attributes.color;
  const idx=geo.index?.array,mat=Array.isArray(o.material)?o.material[0]:o.material;
  const color='#'+(mat?.color?.getHexString?.()||'b8cbd8'),base=mat?.color||{r:.73,g:.8,b:.86};
  let dst=bucket.get(color);if(!dst){dst={p:[],c:[]};bucket.set(color,dst)}
  const M=o.matrixWorld.elements,n=idx?idx.length:pos.count;
  for(let i=0;i<n;i++){
   const j=idx?idx[i]:i,x=pos.getX(j),y=pos.getY(j),z=pos.getZ(j);
   dst.p.push(M[0]*x+M[4]*y+M[8]*z+M[12],M[1]*x+M[5]*y+M[9]*z+M[13],M[2]*x+M[6]*y+M[10]*z+M[14]);
   dst.c.push(base.r*(vColors&&mat?.vertexColors?vColors.getX(j):1),
              base.g*(vColors&&mat?.vertexColors?vColors.getY(j):1),
              base.b*(vColors&&mat?.vertexColors?vColors.getZ(j):1));
  }
  triangles+=Math.floor(n/3);
 });
 const parts=[];for(const [color,data] of bucket){
  if(data.p.length<9)continue;
  const mesh=atlas.makeMesh(data);
  if(mesh){mesh.colors=new Map([[color,mesh.c]]);parts.push({mesh,color})}
 }
 releaseModel(root);
 const assembled={parts,triangles};
 collection.set(key,assembled);
 // Models are cached by type, not repeated once per station. Reuse the
 // engineering geometry with the native Atlas GPU buffers, no extra WebGL.
 return assembled;
}
function drawEngineering(atlas,kind,key,position,scale,axes,emissive=.25){
 const obj=gpuModel(atlas,key,kind);
 if(!obj)return false;
 for(const part of obj.parts)atlas.drawMesh(part.mesh,position,[scale,scale,scale],part.color,1,emissive,axes);
 return true;
}
const drawStationOriginal=Atlas.prototype.drawStation;
Atlas.prototype.drawStation=function(st){
 if(!this.useWebGL||!this.basis)return drawStationOriginal.call(this,st);
 const projection=this.project(st.xyz,this.basis);
 if(!projection||projection.x<-60||projection.x>this.width+60||projection.y<-60||projection.y>this.height+60)return;
 const selected=this.selected?.id===st.id,leg=this.activeJourney?.legs?.[this.activeJourney.leg||0];
 const nearbyNode=leg&&(leg.from.id===st.id||leg.to.id===st.id||state.sender?.id===st.id);
 const close=this.camera.dist<30*U&&length(sub(st.xyz,this.camera.target))<18*U;
 // The distant station marker is drawn by Atlas renderOverlay instead of the
 // former inaccurate, oversized box-and-torus 3D proxy.
 if(!(selected||nearbyNode)||!close)return;
 if(!drawEngineering(this,'station',st.type,st.xyz,selected?.34:.25,null,.56))
   drawStationOriginal.call(this,st);
};
const drawShipOriginal=Atlas.prototype.drawShip;
Atlas.prototype.drawShip=function(center,forward){
 if(!center||!this.basis)return;
 const key=this.activeJourney?.preset.vessel||state.vessel;
 const dir=unit(forward||[0,0,1]),up=Math.abs(dir[1])>.94?[1,0,0]:[0,1,0];
 const x=unit(cross(up,dir)),y=unit(cross(dir,x));
 // Models use engineering +Z as bow; flip changes the engine vector, not velocity.
 const angle=clamp(this.shipFlipAngle||0,0,Math.PI),cx=Math.cos(angle),sx=Math.sin(angle);
 const axes=[vec(mul(x,cx),mul(dir,-sx)),y,vec(mul(dir,cx),mul(x,sx))];
 const scale=key==='fusion'?.37:key==='clipper'?.36:.34;
 this.stsShipWorldScale=scale;this.stsShipAxes=axes;
 if(!this.useWebGL||!drawEngineering(this,'ship',key,center,scale,axes,.68))
   drawShipOriginal.call(this,center,forward);
};
function deriveFusionNodes(){
 return V.STATIONS.filter(s=>['HUB','TERMINAL','YARD'].includes(s.type)&&
 ['Earth','Luna','Mars','Belt','Jupiter','Saturn'].includes(s.region)&&
 !s.orbit?.includes('지상')).sort((a,b)=>a.id.localeCompare(b.id));
}
function option(st){return '<option value="'+st.id+'">'+escape(st.id+' / '+st.name+' · '+st.region)+'</option>'}
const panel=document.createElement('section');panel.id='stsTrafficPanel';panel.className='sts11-panel';
panel.innerHTML=
 '<div class="sts11-heading"><span>TRAFFIC CONTROL / V12</span><span>REFERENCE / 2120</span></div>'+
 '<div class="sts11-label">TRANSPORT MODE / 추진 방식</div>'+
 '<div class="sts11-modes" role="group" aria-label="추진 방식"><button data-mode="sail" aria-pressed="true">BEAM-SAIL <small>정거장 송전망</small></button><button data-mode="fusion" aria-pressed="false">FUSION <small>독립 항행 회랑</small></button></div>'+
 '<div class="sts11-label">VESSEL MODEL / 선박 형식</div><div class="sts11-ships" role="group" aria-label="선박 형식">'+
 ['freighter','clipper','fusion','tug'].map(id=>'<button type="button" data-vessel="'+id+'" aria-pressed="'+String(id==='freighter')+'"><strong>'+shipInfo[id].label+'</strong><small>'+shipInfo[id].kr+'</small></button>').join('')+'</div>'+
 '<div class="sts11-fusion" id="stsFusionCorridor" hidden><div class="sts11-label">FUSION CORRIDOR / 독립 운항 구간</div><div class="sts11-fusion-grid"><label>ORIGIN<select id="stsFusionFrom"></select></label><label>DESTINATION<select id="stsFusionTo"></select></label></div><p>기존 송전 간선망을 경유하지 않는 독립 항행 시나리오입니다.</p></div>'+
 '<div class="sts11-label">SIMULATION TIME SCALE / 운항 시간 배율</div><div class="sts11-speed" role="group" aria-label="시간 배율">'+
 [1,5,20,100].map(n=>'<button type="button" data-timescale="'+n+'" aria-pressed="'+String(n===1)+'">'+n+'×</button>').join('')+
 '<button type="button" id="sts11Pause" aria-pressed="false">PAUSE</button></div>'+ 
 '<button type="button" class="sts11-follow" id="sts11Follow" aria-pressed="true">CHASE CAMERA / 선박 추적 ON</button>'+
 '<p class="sts11-footnote">시뮬레이션 기준 1× = 실제 1초당 시나리오 2시간. 운항 시간·속도·전력은 설정 기반의 예시 계산값이며 실제 천체력 예측이 아닙니다.</p>'+
 '<div class="sts11-telemetry" aria-live="off">'+
 '<div><small>SPEED / 속도</small><strong id="sts11Speed">— km/s</strong></div>'+
 '<div><small>POWER / 수신·반응로</small><strong id="sts11Power">— GW</strong></div>'+
 '<div><small>ENERGY / 누적</small><strong id="sts11Energy">— TJ</strong></div>'+
 '<div><small>PHASE / 운항 단계</small><strong id="sts11Phase">STANDBY</strong></div>'+
 '<div><small>ETA / 예상 잔여</small><strong id="sts11Eta">—</strong></div>'+
 '<div><small>ELAPSED / 경과 시간</small><strong id="sts11Elapsed">—</strong></div>'+
 '</div>'+
 '<div class="sts11-beam" id="sts11BeamPanel"><div><span>ACTIVE POWER FEED / 송전 연결</span><strong id="sts11BeamFrom">STANDBY</strong></div><div><span>RECEIVER / 수신 방식</span><strong id="sts11BeamMode">—</strong></div>'+
 '<label><input type="checkbox" id="sts11BeamVisible" checked>지도에 실시간 송전 빔 표시</label></div>'+
 '<div class="sts11-status" id="sts11Status">READY / SELECT VESSEL AND ROUTE</div>';
const oldHeading=q('.planner-heading');if(oldHeading)drawer.insertBefore(panel,oldHeading);
else drawer.appendChild(panel);
const selFrom=panel.querySelector('#stsFusionFrom'),selTo=panel.querySelector('#stsFusionTo'),fusionOptions=deriveFusionNodes();
selFrom.innerHTML=fusionOptions.map(option).join('');
selTo.innerHTML=fusionOptions.map(option).join('');
selFrom.value=V.STATION_BY_ID.E03?'E03':fusionOptions[0]?.id;
selTo.value=V.STATION_BY_ID.M01?'M01':fusionOptions[fusionOptions.length-1]?.id;
const ui=id=>document.getElementById(id);
const familySelect=()=>{panel.querySelectorAll('[data-vessel]').forEach(btn=>{btn.hidden=state.mode==='fusion'?btn.dataset.vessel!=='fusion':!['freighter','clipper'].includes(btn.dataset.vessel);btn.setAttribute('aria-pressed',String(state.vessel===btn.dataset.vessel))})};
function setMode(mode){
 state.mode=mode;state.vessel=mode==='fusion'?'fusion':'freighter';state.paused=false;
 panel.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 ui('stsFusionCorridor').hidden=mode!=='fusion';
 $('#journeyOptions').style.display=mode==='fusion'?'none':'';
 $('#journeySchedule').style.display=mode==='fusion'?'none':'';
 $('#journeyFind').disabled=mode==='fusion';
 familySelect();
 ui('sts11BeamPanel').hidden=mode==='fusion';
 ui('sts11Status').textContent=mode==='fusion'?'INDEPENDENT FUSION ROUTING / NO POWER BEAM':'STS BEAM NETWORK / TRANSMITTER TRACKING';
 const a=window.STS_GET_ATLAS?.();
 if(a){a.stopJourney();a.shipFlipAngle=0;}
}
panel.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
panel.querySelectorAll('[data-vessel]').forEach(b=>b.addEventListener('click',()=>{
 state.vessel=b.dataset.vessel;familySelect();
 ui('sts11Status').textContent=shipInfo[state.vessel].label.toUpperCase()+' / MODEL LOADED FROM ENGINEERING VIEW';
}));
panel.querySelectorAll('[data-timescale]').forEach(b=>b.addEventListener('click',()=>{
 state.scale=Number(b.dataset.timescale)||1;
 panel.querySelectorAll('[data-timescale]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));
 const a=window.STS_GET_ATLAS?.();if(a)a.speed=state.scale;
 ui('journeySpeed').textContent=state.scale+'×';
}));
ui('sts11BeamVisible').addEventListener('change',e=>{state.showBeam=e.target.checked});
ui('sts11Follow').addEventListener('click',()=>{
 state.follow=!state.follow;
 ui('sts11Follow').textContent='CHASE CAMERA / 선박 추적 '+(state.follow?'ON':'OFF');
 ui('sts11Follow').setAttribute('aria-pressed',String(state.follow));
});
ui('sts11Pause').addEventListener('click',()=>{
 const a=window.STS_GET_ATLAS?.();if(!a?.activeJourney)return;
 state.paused=!state.paused;
 ui('sts11Pause').setAttribute('aria-pressed',String(state.paused));
 ui('sts11Pause').textContent=state.paused?'RESUME':'PAUSE';
});
const AU_KM=149597870.7;
const regionAU={Earth:1,Luna:1.003,Mars:1.52,Belt:2.7,Helio:2.2,Jupiter:5.2,Saturn:9.54};
function distanceKm(from,to){
 if(from.region===to.region)return Math.max(12000,length(sub(from.xyz,to.xyz))/U*12000);
 const pair=[from.region,to.region];
 if(pair.includes('Earth')&&pair.includes('Luna'))return 384400;
 if(pair.includes('Mars')&&pair.includes('Earth'))return 78000000;
 if(pair.includes('Mars')&&pair.includes('Luna'))return 79000000;
 if(pair.includes('Helio'))return Math.max(.1,Math.abs((regionAU[from.region]||2)-(regionAU[to.region]||2)))*AU_KM;
 return Math.max(.15,Math.abs((regionAU[from.region]||2)-(regionAU[to.region]||2)))*AU_KM;
}
function hoursForLeg(a,b,mode,vessel){
 const pair=[a.region,b.region],days=mode==='fusion'
  ?(pair.includes('Saturn')?128:pair.includes('Jupiter')?86:pair.includes('Belt')?57:pair.includes('Mars')?43:pair.includes('Luna')?1.1:0.65)
  :(pair.includes('Saturn')?205:pair.includes('Jupiter')?130:pair.includes('Belt')?72:pair.includes('Mars')?125:pair.includes('Luna')?2.8:1.5);
 if(a.region===b.region)return clamp(12+length(sub(a.xyz,b.xyz))/U*1.3,12,100)*shipInfo[vessel].time;
 return days*24*shipInfo[vessel].time;
}
function pathFromPoints(from,to,mode){
 const route=mode==='sail'?routes.find(r=>r.from===from.id&&r.to===to.id||r.from===to.id&&r.to===from.id):null;
 if(route?.points?.length){const points=route.from===from.id?route.points:route.points.slice().reverse();return points.map(p=>p.slice())}
 const a=from.xyz,b=to.xyz,d=sub(b,a);
 const bend=mode==='fusion'?clamp(length(d)*.045,.15*U,5*U):clamp(length(d)*.09,.12*U,4*U);
 const off=unit(cross(unit(d),[0,1,0]));const pp=[];
 for(let i=0;i<=80;i++){const t=i/80;pp.push(vec(interp(a,b,t),mul(off,bend*Math.sin(Math.PI*t))))}
 return pp;
}
function sample(points,t){
 const at=clamp(t,0,1)*(points.length-1),i=Math.min(points.length-2,Math.floor(at)),f=at-i;
 return interp(points[i],points[i+1],f);
}
function profilePosition(t){
 const x=clamp(t,0,1);
 if(x<.25)return x*x/.375;
 if(x>.75)return 1-(1-x)*(1-x)/.375;
 return 1/6+(x-.25)/.75;
}
function profileVelocity(t){
 const x=clamp(t,0,1);
 if(x<.25)return x/.1875;
 if(x>.75)return (1-x)/.1875;
 return 1/.75;
}
function phaseAt(t){
 if(t>=.999)return 'ARRIVAL';
 if(t>.75)return 'DECELERATION';
 if(t>.68)return 'BRAKE FLIP';
 if(t<.23)return 'ACCELERATION';
 return 'MIDCOURSE COAST';
}
function transmitter(shipPos,routeLeg,elapsed,atlas){
 const ranked=sources.map(st=>({st,d:length(sub(st.xyz,shipPos)),power:st.electric_GWe||.4}))
  .sort((a,b)=>{
   const score=x=>x.d/Math.pow(x.power,.23)+(x.st.type==='ARRAY'?-3*U:x.st.type==='POWER'?-2.1*U:x.st.type==='RELAY'?-1.0*U:1*U);
   return score(a)-score(b);
  });
 // Station position spread is schematic and expanded in V12. Do not silently
 // drop a transmitter solely because the visualization scale changed.
 // Always choose from the actual registered ARRAY/POWER/RELAY/HUB catalogue.
 const best=ranked.filter(x=>x.d<35*U)[0]||ranked[0];
 const source=best?.st||null;
 if(!source)return {source:null,type:'OFFLINE',power:0};
 const regional=routeLeg.from.region==='Earth'&&routeLeg.to.region==='Luna'||routeLeg.from.region==='Luna'&&routeLeg.to.region==='Earth'||routeLeg.from.region===routeLeg.to.region;
 const type=regional?'MICROWAVE / M':'LASER / L';
 const loss=1/(1+best.d/(110*U));
 const power=Math.max(.01,Math.min(7.2,(source.electric_GWe||.6)*.34))*(regional?.78:.56)*shipInfo[state.vessel].beam*loss;
 return {source,type,power};
}
function makeLegs(preset){
 const nodes=preset.nodes,legs=[];
 for(let i=0;i<nodes.length-1;i++){
  const a=V.resolve(nodes[i]),b=V.resolve(nodes[i+1]);if(!a||!b)continue;
  legs.push({from:a,to:b,points:pathFromPoints(a,b,preset.mode),distanceKm:distanceKm(a,b),
   durationSec:hoursForLeg(a,b,preset.mode,preset.vessel)*3600});
 }
 return legs;
}
const originalShow=Atlas.prototype.showJourney,originalStop=Atlas.prototype.stopJourney,originalUpdate=Atlas.prototype.updateJourney;
Atlas.prototype.showJourney=function(preset){
 originalShow.call(this,preset);
 const j=this.activeJourney;if(!j)return;
 j.preset.mode=preset.mode||state.mode;
 j.preset.vessel=preset.vessel||state.vessel;
 j.legs=makeLegs(j.preset);
 j.totalSec=j.legs.reduce((a,l)=>a+l.durationSec,0);
 j.elapsedSec=0;j.energyTJ=0;j.previousPhase='';j.activeBeam=null;
 this.speed=state.scale;
 this.shipFlipAngle=0;state.energyTJ=0;state.sender=null;state.final=null;state.paused=false;
 ui('sts11Pause').textContent='PAUSE';ui('sts11Pause').setAttribute('aria-pressed','false');
 ui('sts11Status').textContent=modeLabel(j.preset.mode)+' / DEPARTURE AUTHORIZED';
 // A dedicated fusion route is drawn independently of the beamed corridors.
 const cache=cacheFor(this);cache.route=null;
};
Atlas.prototype.stopJourney=function(done){
 originalStop.call(this,done);
 this.shipFlipAngle=0;state.sender=null;state.beamGW=0;state.paused=false;
};
Atlas.prototype.updateJourney=function(dt){
 const j=this.activeJourney;
 if(!j?.legs)return originalUpdate.call(this,dt);
 if(state.paused)return;
 const speed=clamp(this.speed,1,100);
 const step=Math.max(0,dt)*speed*7200;
 j.elapsedSec=Math.min(j.totalSec,j.elapsedSec+step);
 let accum=0,leg=j.legs[j.legs.length-1],legNo=j.legs.length-1,local=1;
 for(let i=0;i<j.legs.length;i++){
  const l=j.legs[i];
  if(j.elapsedSec<=accum+l.durationSec){leg=l;legNo=i;local=clamp((j.elapsedSec-accum)/l.durationSec,0,1);break}
  accum+=l.durationSec;
 }
 if(!leg)return;
 if(legNo!==j.leg){
  j.leg=legNo;this.highlightJourneyLeg(legNo);
  this.onTransfer({leg:legNo,preset:j.preset,from:leg.from,to:leg.to,phase:'depart',route:this.currentJourneyRoute()});
  this.camera.destTarget=interp(leg.from.xyz,leg.to.xyz,.5);
  this.camera.destDist=clamp(length(sub(leg.to.xyz,leg.from.xyz))*2.3,13*U,75*U);
 }
 const p=profilePosition(local),a=sample(leg.points,clamp(p-.004,0,1)),b=sample(leg.points,clamp(p+.004,0,1));
 this.shipPos=sample(leg.points,p);
 this.shipDir=unit(sub(b,a));
 if(state.follow){
   // Exact tracking prevents large camera/ship lag at 20-100x.
   // World model size remains fixed rather than scaling with the screen.
   this.camera.destTarget=this.shipPos.slice();
   this.camera.target=this.shipPos.slice();
   this.camera.destDist=7.2*U;
   this.camera.dist+=(this.camera.destDist-this.camera.dist)*clamp(dt*9,0,1);
 }
 const phase=phaseAt(local);state.phase=phase;
 this.shipFlipAngle=local<=.68?0:local<.75?(local-.68)/.07*Math.PI:Math.PI;
 const instantKmS=leg.distanceKm/leg.durationSec*profileVelocity(local);
 j.currentSpeed=instantKmS;
 if(j.preset.mode==='sail'){
  const beam=transmitter(this.shipPos,leg,j.elapsedSec,this);
  j.activeBeam=beam;state.sender=beam.source;state.beamGW=beam.power;
  state.beamMode=beam.type;
  j.energyTJ+=beam.power*step/1000;
 }else{
  state.sender=null;state.beamGW=phase==='MIDCOURSE COAST'?.24:shipInfo[j.preset.vessel].power||3.8;
  state.beamMode='FUSION DRIVE';
  j.energyTJ+=state.beamGW*step/1000;
 }
 state.energyTJ=j.energyTJ;
 state.activeHours=j.elapsedSec/3600;
 if(this.animClock-state.lastPaint>.22){state.lastPaint=this.animClock;renderTelemetry(this,j,leg,local)}
 if(j.elapsedSec>=j.totalSec){
  this.activeJourney=null;this.travelMode='idle';state.phase='ARRIVED';state.final={elapsedSec:j.elapsedSec,energyTJ:j.energyTJ};
  this.onFinish(true);ui('sts11Status').textContent='ARRIVAL CONFIRMED / '+leg.to.name.toUpperCase();
  renderTelemetry(this,j,leg,1);
 }
};
function duration(seconds){
 const n=Math.max(0,Math.floor(seconds)),d=Math.floor(n/86400),h=Math.floor(n%86400/3600),m=Math.floor(n%3600/60),sec=n%60;
 return(d?d+'d ':'')+[h,m,sec].map(x=>String(x).padStart(2,'0')).join(':');
}
function renderTelemetry(atlas,j,leg,t){
 const secondsLeft=j.totalSec-j.elapsedSec;
 ui('sts11Speed').textContent=format(j.currentSpeed||0,3)+' km/s';
 ui('sts11Power').textContent=format(state.beamGW,2)+' GW';
 ui('sts11Energy').textContent=format(j.energyTJ,2)+' TJ';
 ui('sts11Phase').textContent=state.phase;
 ui('sts11Eta').textContent=duration(secondsLeft);
 ui('sts11Elapsed').textContent=duration(j.elapsedSec);
 ui('sts11BeamFrom').textContent=state.sender?state.sender.id+' / '+state.sender.name:'NO POWER FEED / COAST';
 ui('sts11BeamMode').textContent=state.beamMode+(state.sender?' · '+format(state.beamGW,2)+' GW':'');
 ui('sts11Status').textContent=shipInfo[j.preset.vessel].label.toUpperCase()+' / '+modeLabel(j.preset.mode)+' / '+format(100*j.elapsedSec/j.totalSec,1)+'%';
 ui('journeyProgress').style.width=format(100*j.elapsedSec/j.totalSec,1)+'%';
}
function updateGpuLine(atlas,key,points){
 if(!atlas.gl||!points.length)return null;
 const cache=cacheFor(atlas);
 if(!cache[key])cache[key]={p:atlas.gl.createBuffer(),n:0};
 const gl=atlas.gl,l=cache[key];l.n=points.length;
 gl.bindBuffer(gl.ARRAY_BUFFER,l.p);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points.flat()),gl.DYNAMIC_DRAW);
 return l;
}
const oldVisible=Atlas.prototype.visibleRoute;
Atlas.prototype.visibleRoute=function(route){
 if(this.activeJourney?.preset?.mode==='fusion')return null;
 return oldVisible.call(this,route);
};
const originalRender=Atlas.prototype.renderGL;
Atlas.prototype.renderGL=function(){
 originalRender.call(this);
 if(!this.gl||!this.shipPos)return;
 const j=this.activeJourney;
 if(j?.preset?.mode==='fusion'&&j.legs){
  const route=j.legs[j.leg]||j.legs[0];
  if(route){const line=updateGpuLine(this,'route',route.points);this.drawLine(line,'#deb892',.64,1)}
 }
 // The thruster plume is anchored at the rear of the chosen engineering model.
 // During the 180-degree brake flip the engines are shut off; the resulting
 // reverse heading makes retro-burn visible along the travel direction.
 if(j&&this.stsShipAxes&&(state.phase==='ACCELERATION'||state.phase==='DECELERATION')){
   const kind=j.preset.vessel||state.vessel,axis=this.stsShipAxes[2],sz=this.stsShipWorldScale||.35;
   const engineZ=kind==='fusion'?8.8:kind==='clipper'?4.91:4.41;
   const origin=vec(this.shipPos,mul(axis,-engineZ*sz));
   const exhaust=mul(axis,-(state.phase==='DECELERATION'?2.45:1.8));
   const tracer=updateGpuLine(this,'engine',[origin,vec(origin,exhaust)]);
   this.drawLine(tracer,kind==='fusion'?'#9cdcff':'#94d6ec',.72,1);
 }
 if(j?.preset?.mode==='sail'&&state.showBeam&&j.activeBeam?.source){
  const source=j.activeBeam.source,laser=j.activeBeam.type.startsWith('LASER');
  const line=updateGpuLine(this,'line',[source.xyz,this.shipPos]);
  const gl=this.gl;gl.disable(gl.DEPTH_TEST);
  this.drawLine(line,laser?'#cfb5ff':'#7ed9f5',.85,1);
  gl.enable(gl.DEPTH_TEST);
 }
};
const originalOverlay=Atlas.prototype.renderOverlay;
Atlas.prototype.renderOverlay=function(){
 originalOverlay.call(this);
 if(!this.shipPos||!this.basis)return;
 const c=this.ctx,w=this.width,h=this.height,ship=this.project(this.shipPos,this.basis);
 if(!ship||ship.x<-60||ship.x>w+60||ship.y<-60||ship.y>h+60)return;
 c.save();c.setTransform(this.dpr,0,0,this.dpr,0,0);
 const fusion=this.activeJourney?.preset?.mode==='fusion';
 const txt=fusion?'FUSION VESSEL / IN TRANSIT':'BEAM SAIL / IN TRANSIT';
 // Ship mode label is now unique; the base Atlas draws only the locator circle.
 const labelX=clamp(ship.x+20,8,Math.max(8,w-195)),labelY=clamp(ship.y-18,30,h-55);
 c.font='10px ui-monospace,monospace';const tw=Math.min(185,c.measureText(txt).width+16);
 c.fillStyle='#071524ea';c.fillRect(labelX-5,labelY-13,tw,18);
 c.fillStyle='#d2e9f7';c.fillText(txt,labelX,labelY);
 if(!fusion&&state.sender&&state.showBeam){
  const src=this.project(state.sender.xyz,this.basis);
  if(src){
   c.font='9px ui-monospace,monospace';
   c.fillStyle='#8fd9f4';const text='TX '+state.sender.id+' / '+state.beamMode+' / '+format(state.beamGW,2)+' GW';
   const px=clamp(src.x+9,8,Math.max(8,w-232)),py=clamp(src.y-14,44,h-85);
   c.fillStyle='#081a27eb';c.fillRect(px-4,py-12,c.measureText(text).width+10,18);
   c.fillStyle='#a7e4fb';c.fillText(text,px,py);
   c.strokeStyle='#b5ebff';c.lineWidth=1;c.beginPath();c.arc(src.x,src.y,6,0,TAU);c.stroke();
  }
 }
 c.restore();
};
function makeFusionPreset(){
 const from=selFrom.value,to=selTo.value;
 if(from===to)return null;
 const a=V.STATION_BY_ID[from],b=V.STATION_BY_ID[to];
 return {id:'fusion-'+from+'-'+to,name:a.name+' → '+b.name,desc:'INDEPENDENT FUSION CORRIDOR',
 nodes:[from,to],mode:'fusion',vessel:state.vessel};
}
ui('journeyStart').addEventListener('click',event=>{
 const atlas=window.STS_GET_ATLAS?.();if(!atlas)return;
 event.preventDefault();event.stopImmediatePropagation();
 let preset;
 if(state.mode==='fusion')preset=makeFusionPreset();
 else{
  const current=window.STS_GET_JOURNEY_PRESET?.()||V.PRESETS[0];
  preset={...current,nodes:[...current.nodes],mode:'sail',vessel:state.vessel};
 }
 if(!preset){ui('sts11Status').textContent='SELECT TWO DIFFERENT FUSION NODES';return}
 atlas.showJourney(preset);
 // On phones the lower inspector occupies 42% of the map viewport and hides
 // the camera-centered ship. Collapse it during flight, preserving the
 // existing manual panel toggle for station inspection.
 if(window.innerWidth<890)$('#atlasView')?.classList.add('panel-min');
 ui('journeyState').textContent='DEPARTURE AUTHORIZED / '+shipInfo[state.vessel].label;
 ui('sts11Status').textContent=modeLabel(state.mode)+' / SIMULATION ACTIVE';
},true);
ui('journeyStop').addEventListener('click',()=>{
 state.sender=null;state.phase='STANDBY';state.beamGW=0;
 ui('sts11Status').textContent='SIMULATION STOPPED';
});
ui('journeySpeed').hidden=true;
familySelect();
const selectedStationDraw=Atlas.prototype.drawStation;
let bridgeCheck=0;
const ensureStationBridge=()=>{
 if(window.STS_STATIONYARD_EXPORT_MODEL){
   if(Atlas.prototype.drawStation!==selectedStationDraw){
     // The station module is asynchronous; its atlas LOD override may land
     // after this script. Keep the final draw method on the geometry bridge.
     Atlas.prototype.drawStation=selectedStationDraw;
   }
 }else if(bridgeCheck++<60)setTimeout(ensureStationBridge,100);
};
ensureStationBridge();
window.STS_TRAFFIC_V11_DIAGNOSTICS=()=>{
 const atlas=window.STS_GET_ATLAS?.(),cache=atlas?cacheFor(atlas):null;
 return {mode:state.mode,vessel:state.vessel,source:state.sender?.id||null,
   beamGW:state.beamGW,phase:state.phase,scale:state.scale,
   shipModels:cache?[...cache.ship.entries()].map(([id,d])=>({id,triangles:d.triangles,parts:d.parts.length})):[],
   stationModels:cache?[...cache.station.entries()].map(([id,d])=>({id,triangles:d.triangles,parts:d.parts.length})):[],
   journey:!!atlas?.activeJourney,stationBridge:Atlas.prototype.drawStation===selectedStationDraw,
   shipFactory:!!window.STS_SHIPYARD_EXPORT_MODEL,stationFactory:!!window.STS_STATIONYARD_EXPORT_MODEL};
};
window.STS_TRAFFIC_V11_READY=true;
})();