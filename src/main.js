/* ============================================================
 * main.js — Application bootstrap: renderer, scene, layout,
 * UI wiring, raycast selection, animation loop, cleanup.
 * ============================================================ */
import * as THREE from 'three';
import { VENUE, RIDES, SHOTS, VIEWS, PROMO_VIEWS } from './config.js';
import { initMaterials, LightRegistry } from './materials.js';
import { Venue } from './venue.js';
import { buildGate } from './gate.js';
import { CarnivalLayout } from './layout.js';
import { buildDecorations } from './decor.js';
import { Crowd } from './people.js';
import { LightingSystem } from './lighting.js';
import { CameraDirector } from './camera.js';
import { disposeCaches } from './textures.js';

initMaterials();

const canvas = document.getElementById('scene-canvas');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, innerWidth/innerHeight, 0.1, 400);
camera.position.set(-24,17,46);

const registry = new LightRegistry();

/* ---------- build world ---------- */
const lighting = new LightingSystem(scene, renderer);
const venue = new Venue(scene);
let gate = buildGate(registry);
scene.add(gate);
// register gate & welcome desk for picking
gate.traverse(o=>{ if(o.isMesh) o.userData.pickRoot = gate; });
const layout = new CarnivalLayout(scene, registry);
const decor = buildDecorations(VENUE);
scene.add(decor);
const crowd = new Crowd(scene);
crowd.setExpanded(true);

/* warm boost hook: dim/brighten stall lamps & bulbs with mode */
lighting.onWarmBoost = (boost)=>{
  registry.applyBoost(boost);
};
registry.applyBoost(0.35);

const director = new CameraDirector(camera, canvas);

/* ---------- state ---------- */
const state = {
  light:'golden', layout:'expanded', visitors:true, decor:true,
  labels:true, measure:false, animate:true, crowd:'lively'
};

/* ---------- UI helpers ---------- */
const $ = id => document.getElementById(id);
const statusLine = $('status-line');
function setStatus(){
  const lmap={day:'Daylight',golden:'Golden hour',evening:'Evening festival'};
  const map_={main:'Main venue (505.857 m²)',expanded:'Expanded carnival'};
  statusLine.textContent = `${lmap[state.light]} • ${map_[state.layout]}`;
  $('layout-note').textContent = state.layout==='main'
    ? 'Mode A — attractions inside the confirmed provisional boundary. Bouncy castle is the space-appropriate ride here.'
    : 'Mode B — main venue + proposed rides & attractions extension (additional space required, location not yet confirmed).';
}

/* view buttons */
document.querySelectorAll('#view-buttons button').forEach(b=>{
  b.addEventListener('click', ()=>{
    if(state.layout==='main' && ['rides','ferris','carousel'].includes(b.dataset.view)){
      setLayout('expanded');
    }
    director.goView(b.dataset.view);
  });
});

/* promo buttons */
document.querySelectorAll('#promo-buttons button').forEach(b=>{
  b.addEventListener('click', ()=>{
    const p = PROMO_VIEWS[b.dataset.promo];
    if(!p) return;
    if(p.layout) setLayout(p.layout);
    if(p.light) setLight(p.light);
    director.goTo(p.pos, p.look, 2.0);
  });
});

/* lighting segmented */
function setLight(key){
  state.light=key;
  lighting.applyPreset(key);
  document.querySelectorAll('#light-buttons button').forEach(b=>
    b.classList.toggle('active', b.dataset.light===key));
  setStatus();
}
document.querySelectorAll('#light-buttons button').forEach(b=>
  b.addEventListener('click', ()=>setLight(b.dataset.light)));

/* layout segmented */
function setLayout(key){
  state.layout=key;
  layout.setLayout(key);
  venue.setLayout(key);
  crowd.setExpanded(key==='expanded');
  // hide extension ground in main mode? keep visible but flagged off-screen:
  venue.extGround.visible = key==='expanded';
  document.querySelectorAll('#layout-buttons button').forEach(b=>
    b.classList.toggle('active', b.dataset.layout===key));
  setStatus();
}
document.querySelectorAll('#layout-buttons button').forEach(b=>
  b.addEventListener('click', ()=>setLayout(b.dataset.layout)));

/* toggles */
$('chk-visitors').addEventListener('change',e=>{ state.visitors=e.target.checked; crowd.setEnabled(state.visitors); });
$('crowd-mode').addEventListener('change',e=>{ state.crowd=e.target.value; crowd.setMode(e.target.value); });
$('chk-decor').addEventListener('change',e=>{ state.decor=e.target.checked; decor.visible=state.decor; });
$('chk-labels').addEventListener('change',e=>{ state.labels=e.target.checked; layout.setLabels(state.labels); });
$('chk-measure').addEventListener('change',e=>{ state.measure=e.target.checked; venue.setMeasurements(state.measure); });
$('chk-rotate').addEventListener('change',e=>{ state.animate=e.target.checked; });

/* ride toggles panel */
const ridePanel = $('ride-toggles');
RIDES.forEach(r=>{
  const label=document.createElement('label');
  const cb=document.createElement('input');
  cb.type='checkbox'; cb.checked=true;
  cb.addEventListener('change',()=>layout.setRideVisible(r.id,cb.checked));
  const span=document.createElement('span');
  span.innerHTML=`${r.name} <em style="opacity:.6;font-size:10px">— ${r.footprint}</em>`;
  label.append(cb,span);
  label.title = `${r.spaceNeeded}. ${r.note}`;
  ridePanel.append(label);
});

/* cinematic tour controls */
const shotSel=$('shot-select');
SHOTS.forEach((s,i)=>{
  const o=document.createElement('option');
  o.value=i; o.textContent=s.title;
  shotSel.append(o);
});
$('btn-play').addEventListener('click',()=>{
  if(director.tour && !director.tour.playing) director.resumeTour();
  else { director.playTour(0); }
});
$('btn-pause').addEventListener('click',()=>director.pauseTour());
$('btn-restart').addEventListener('click',()=>director.playTour(0));
shotSel.addEventListener('change',()=>{
  if(shotSel.value!=='') director.jumpToShot(+shotSel.value);
});

const caption=$('shot-caption');
director.onShotStart=(s,idx)=>{
  caption.innerHTML=`<div class="sc-title">${s.title}</div><div class="sc-sub">${s.sub}</div>`;
  caption.classList.remove('hidden');
  if(s.light) setLight(s.light);
  if(s.layout && s.layout!==state.layout) setLayout(s.layout);
  shotSel.value=idx;
};
director.onShotEnd=()=>{ /* keep last caption briefly */ };
director.onTourEnd=()=>{ setTimeout(()=>caption.classList.add('hidden'),1500); };
director.onProgress=(idx,t)=>{
  const totalDur=SHOTS.reduce((a,b)=>a+b.dur,0);
  const done=SHOTS.slice(0,idx).reduce((a,b)=>a+b.dur,0)+t*SHOTS[idx].dur;
  $('tour-fill').style.width=(done/totalDur*100)+'%';
};

/* reset camera button lives in view grid via data-view="reset" */
document.querySelector('[data-view="reset"]').addEventListener('click',()=>director.reset());

/* menu toggle (mobile-friendly) */
$('btn-menu').addEventListener('click',()=>$('panel').classList.toggle('closed'));

/* info card close */
$('info-close').addEventListener('click',()=>$('info-card').classList.add('hidden'));

/* editable dimensions */
$('btn-apply-dims').addEventListener('click',()=>{
  const w=parseFloat($('inp-w').value)||VENUE.mainW;
  const d=parseFloat($('inp-d').value)||VENUE.mainD;
  const ew=parseFloat($('inp-ew').value)||VENUE.extW;
  const ed=parseFloat($('inp-ed').value)||VENUE.extD;
  VENUE.mainW=Math.max(14,Math.min(40,w));
  VENUE.mainD=Math.max(14,Math.min(40,d));
  VENUE.extW=Math.max(10,Math.min(40,ew));
  VENUE.extD=Math.max(10,Math.min(40,ed));
  venue.build();
  venue.setLayout(state.layout);
  venue.extGround.visible = state.layout==='expanded';
  venue.setMeasurements(state.measure);
  layout.build();
  layout.setLayout(state.layout);
  layout.setLabels(state.labels);
  scene.remove(gate);
  gate = buildGate(registry);
  gate.traverse(o=>{if(o.isMesh)o.userData.pickRoot=gate;});
  scene.add(gate);
});

/* ---------- raycast selection ---------- */
const raycaster=new THREE.Raycaster();
const pointer=new THREE.Vector2();
let downXY=null;
canvas.addEventListener('pointerdown',e=>{ downXY=[e.clientX,e.clientY]; });
canvas.addEventListener('pointerup',e=>{
  if(!downXY) return;
  const moved=Math.hypot(e.clientX-downXY[0], e.clientY-downXY[1]);
  downXY=null;
  if(moved>6) return;   // was a drag, not a click
  pointer.x=(e.clientX/innerWidth)*2-1;
  pointer.y=-(e.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const targets=[];
  [gate, layout.root].forEach(root=>root.traverse(o=>{ if(o.isMesh && o.visible) targets.push(o); }));
  const hits=raycaster.intersectObjects(targets,false);
  for(const h of hits){
    const info=CarnivalLayout.pickInfoFromIntersection(h.object);
    if(info){ showInfo(info); return; }
  }
});
function showInfo(info){
  $('info-name').textContent=info.name;
  const rows=[['Use',info.use],['Dimensions',info.dims],['Footprint',info.footprint]];
  $('info-body').innerHTML =
    rows.map(([k,v])=>`<div class="row"><b>${k}</b><span>${v||'—'}</span></div>`).join('')+
    `<div class="note">${info.note||''}</div>`;
  $('info-card').classList.remove('hidden');
}

/* ---------- responsive ---------- */
function onResize(){
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
}
addEventListener('resize',onResize);

/* ---------- loading sequence ---------- */
const loaderFill=$('loader-fill'), loaderStatus=$('loader-status');
let loadStep=0;
const steps=['Laying out the venue…','Building food street…','Setting up games…','Assembling rides…','Hanging decorations…','Opening the gates…'];
const loadTimer=setInterval(()=>{
  loadStep++;
  loaderStatus.textContent=steps[Math.min(loadStep,steps.length-1)];
  loaderFill.style.width=Math.min(100,loadStep/steps.length*100)+'%';
  if(loadStep>=steps.length){
    clearInterval(loadTimer);
    setTimeout(()=>document.getElementById('loader').classList.add('done'),350);
  }
},260);

/* ---------- animation loop ---------- */
const clock=new THREE.Clock();
let rafId=0;
function tick(){
  rafId=requestAnimationFrame(tick);
  const dt=Math.min(clock.getDelta(),0.05);
  lighting.update(dt);
  director.update(dt);
  layout.update(dt,state.animate);
  renderer.render(scene,camera);
}
tick();

setStatus();
setLayout('expanded');
setLight('golden');

/* initial hero framing */
director.goTo(VIEWS.hero.pos, VIEWS.hero.look, 2.2);

/* ---------- cleanup ---------- */
addEventListener('beforeunload',()=>{
  cancelAnimationFrame(rafId);
  renderer.dispose();
  disposeCaches();
});
