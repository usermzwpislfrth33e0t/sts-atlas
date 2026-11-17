/* STS ACOUSTIC ENGINE 12.0
   Synthesized, original interface audio. Respects SFX toggle and browser playback policy. */
(()=>{
'use strict';
if(window.STS_SOUND_V12)return;
let ac,limiter,gain,noise,stepObserver,lastTick=0;
function enabled(){const b=document.getElementById('sfxBtn');return !b||b.getAttribute('aria-pressed')!=='false'}
function ready(){
 try{
  if(!ac){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;
   ac=new Audio();limiter=ac.createDynamicsCompressor();limiter.threshold.value=-13;limiter.ratio.value=7;limiter.attack.value=.003;limiter.release.value=.15;
   gain=ac.createGain();gain.gain.value=.76;limiter.connect(gain).connect(ac.destination);
   const len=Math.round(ac.sampleRate*.5);noise=ac.createBuffer(1,len,ac.sampleRate);
   let z=10907,data=noise.getChannelData(0);for(let i=0;i<len;i++){z=(z*1664525+1013904223)>>>0;data[i]=z/2147483647.5-1}
  }
  if(ac.state==='suspended')ac.resume();return true;
 }catch(e){return false}
}
function osc(f,d,v,type='sine',delay=0,target=.7){
 const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();o.type=type;
 o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(25,f*target),t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.00012,v),t+.009);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 o.connect(g).connect(limiter);o.start(t);o.stop(t+d+.02);
}
function hiss(freq=1700,dur=.09,vol=.04,delay=0,q=.75){
 const t=ac.currentTime+delay,n=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();n.buffer=noise;f.type='bandpass';f.frequency.value=freq;f.Q.value=q;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 n.connect(f).connect(g).connect(limiter);n.start(t);n.stop(t+dur+.02);
}
function play(kind){
 if(!enabled()||!ready())return;
 try{
  switch(kind){
  case 'engage':hiss(550,.35,.092);osc(90,.43,.16,'triangle',0,.48);osc(380,.19,.074,'sawtooth',.035,.58);osc(640,.25,.08,'triangle',.24,1.43);osc(950,.33,.052,'sine',.36,.86);hiss(2150,.20,.054,.18);break;
  case 'boot':hiss(1750,.085,.065);osc(420,.12,.064,'triangle',0,1.4);osc(1060,.13,.03,'sine',.035,.9);break;
  case 'ready':osc(300,.26,.11,'triangle');osc(600,.34,.087,'sine',.075,1.25);osc(900,.46,.067,'sine',.16,1.12);hiss(2800,.15,.052,.09);break;
  case 'open':hiss(1100,.18,.071);osc(225,.23,.11,'triangle',0,.65);osc(700,.15,.051,'sine',.06,1.18);break;
  case 'confirm':osc(640,.17,.075,'sine',0,1.2);osc(970,.21,.055,'sine',.08,.94);hiss(3000,.07,.043,.015);break;
  case 'select':osc(560,.11,.058,'triangle',0,.8);osc(880,.13,.023,'sine',.037,1.03);hiss(2300,.05,.027);break;
  default:osc(540,.065,.038,'triangle');hiss(1800,.04,.022);break;
  }
 }catch(e){}
}
window.STS_SOUND_V12=play;
const terminal=document.getElementById('sts9BootTitle');
if(terminal){let prev='';new MutationObserver(()=>{
 const text=terminal.textContent;if(!text||text===prev)return;prev=text;
 play(text==='SESSION READY'?'ready':'boot');
}).observe(terminal,{childList:true,characterData:true,subtree:true})}
const archive=document.getElementById('sr2Checks');
if(archive)new MutationObserver(changes=>{
 if(document.getElementById('sr2Shade')?.hidden)return;
 if(!changes.some(m=>m.type==='attributes'&&m.target.classList.contains('done')))return;
 const now=performance.now();if(now-lastTick>140){lastTick=now;play('confirm')}
}).observe(archive,{attributes:true,attributeFilter:['class'],subtree:true});
document.addEventListener('click',e=>{
 const b=e.target.closest?.('button');if(!b||!b.isConnected||!enabled())return;
 if(b.closest('.sts12-actions-area')||b.id==='sfxBtn'||b.id==='bgmBtn')return;
 if(b.matches('#stsAccessRequest,.sr2-primary,.sts-archive-button'))play('open');
 else if(b.matches('.home-link,.menu-tool,[data-view],.sts9-boot-skip,.sr2-muted,.sts-book-toc button,.sts-event summary'))play('select');
},true);
})();