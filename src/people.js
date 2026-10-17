/* ============================================================
 * people.js — Stylized-realistic visitors in Pakistani winter wear.
 * Instanced body parts grouped into characters; three crowd
 * settings: empty / light / lively. Placed in curated clusters
 * (never inside ride operating areas or blocking routes).
 * ============================================================ */
import * as THREE from 'three';

const KAMEEZ = [0x3b5a8c,0x7a4a4a,0x2f6b4f,0x8c7a3b,0x4a4a5e,0xb9b0a0,0x6b3b52,0x274b66,0x99552e,0xd9cfc0];
const SHAJAM = [0x2b2b2e,0x4a4a50,0x6b6250,0x3a4a5a,0x5a4632];
const SKIN  = [0xc98d5e,0xb5794c,0xd3a06f];
const CAPS  = [0x2b2b2e,0x7a141a,0xf5f1ea,0x3b5a8c];

function makePerson(rng){
  const g=new THREE.Group();
  const h = 1.55 + rng()*0.25;              // adult height ~1.55–1.8
  const child = rng() < 0.32;
  if(child) { g.scale.setScalar(0.62 + rng()*0.1); }
  const kameez = KAMEEZ[Math.floor(rng()*KAMEEZ.length)];
  const shalwar= SHAJAM[Math.floor(rng()*SHAJAM.length)];
  const skin   = SKIN[Math.floor(rng()*SKIN.length)];

  // shalwar (two tapered legs fused as a skirt-like cone for stylization)
  const legs=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.2,h*0.48,8),
    new THREE.MeshStandardMaterial({color:shalwar,roughness:0.9}));
  legs.position.y=h*0.24; g.add(legs);
  // kameez torso (long tunic)
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.22,h*0.42,10),
    new THREE.MeshStandardMaterial({color:kameez,roughness:0.85}));
  torso.position.y=h*0.62; g.add(torso);
  // vest / waistcoat on some adults (winter layering)
  if(!child && rng()<0.5){
    const vest=new THREE.Mesh(new THREE.CylinderGeometry(0.185,0.215,h*0.3,10),
      new THREE.MeshStandardMaterial({color:0x2b2b2e,roughness:0.8}));
    vest.position.y=h*0.6; g.add(vest);
  }
  // shawl/winter scarf on some
  if(rng()<0.4){
    const shawl=new THREE.Mesh(new THREE.TorusGeometry(0.16,0.05,6,14),
      new THREE.MeshStandardMaterial({color:(kameez+0x222222)&0xffffff,roughness:0.95}));
    shawl.rotation.x=Math.PI/2.4; shawl.position.y=h*0.82; g.add(shawl);
  }
  // arms
  [-1,1].forEach(s=>{
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.05,h*0.34,6),
      new THREE.MeshStandardMaterial({color:kameez,roughness:0.85}));
    arm.position.set(s*0.21,h*0.63,0);
    arm.rotation.z=s*(0.12+rng()*0.12);
    g.add(arm);
  });
  // head + cap
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.11,10,8),
    new THREE.MeshStandardMaterial({color:skin,roughness:0.7}));
  head.position.y=h*0.92; g.add(head);
  if(!child && rng()<0.6){
    const cap=new THREE.Mesh(new THREE.SphereGeometry(0.112,10,6,0,Math.PI*2,0,Math.PI/2),
      new THREE.MeshStandardMaterial({color:CAPS[Math.floor(rng()*CAPS.length)],roughness:0.85}));
    cap.position.y=h*0.935; g.add(cap);
  }
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  return g;
}

/* Deterministic RNG so layout is stable between rebuilds */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}

/** Curated placement spots: [x,z,rotY,weight] — weight used to choose density tier.
 *  Tiers: 1 = always present (light), 2 = lively only. */
const SPOTS=[
  // gate arrival cluster
  [ -1.6,-8.4, 0.4,1],[ 1.4,-8.9,-0.3,1],[ 2.6,-7.6, 2.6,2],[-2.4,-6.8, 0.8,2],[ 0.2,-6.2, 3.0,2],
  // welcome desk
  [ VENUEX()+3.6,-9.6, -0.6,1],
  // food street front (customers at counters z≈-2.4 row → stand at z≈-1.6..-2)
  [-8.2,-1.6, 0,1],[-5.4,-1.9, 0.2,1],[-2.6,-1.6,-0.1,2],[ 0.2,-1.9, 0.1,2],[ 3.0,-1.6, 0,2],[ 5.8,-1.9,-0.2,1],[ 8.4,-1.7, 0.1,2],
  [-7.0,-2.6, 0.5,2],[ 4.4,-2.7,-0.4,2],
  // games street front (x≈9.4 row → stand x≈8.2)
  [ 8.0,2.6, 1.6,1],[ 8.2,5.4, 1.4,2],[ 8.0,8.2, 1.7,2],[ 8.3,10.6, 1.5,1],
  // science zone
  [-9.6,3.4,-1.4,1],[-10.2,6.6,-1.2,2],[-8.8,8.6,-1.6,2],[-11.0,1.6,-0.8,2],
  // seating zone
  [ 0.6,-3.9, 0,1], // (placeholder adjusted by main offset later)
  // stage audience (front area, keeps stage clear)
  [-1.6, 13.4, 3.1,1],[ 0.4,13.8, 3.0,2],[ 2.2,13.2, 2.9,2],[-3.2,14.0, 3.2,2],[ 0.0,15.0, 3.1,2],
  // photo wall
  [-4.2,-4.4, 0,1],[-3.4,-4.9, 0.4,2],[-5.0,-5.0,-0.4,2],
  // promenade strollers
  [ 1.2,-4.5, 0.2,2],[-1.0,0.5, 3.0,2],[ 1.6,3.5, 0.1,2],[-1.4,6.5, 2.9,1],[ 0.8,9.0, 0.3,2],
  // bouncy castle perimeter (outside clearance ring)
  [-7.6,12.6, 1.2,1],[-6.0,14.6, 2.4,2],
  // vendor staff positions (behind counters)
  [-8.4,-3.6, 0,1],[-5.6,-3.6, 0,1],[-2.8,-3.6, 0,1],[ 0.0,-3.6, 0,1],[ 2.8,-3.6, 0,1],[ 5.6,-3.6, 0,1],[ 8.4,-3.6, 0,1],
  [ 10.6,2.6, 1.6,1],[ 10.6,5.4, 1.6,1],[ 10.6,8.2, 1.6,1],
  // extension ride watchers (expanded mode adds via addExpandedSpots)
];

function VENUEX(){ return 4.7; } // approx gate side x for welcome desk staff

const EXT_SPOTS=[
  // ferris queue
  [-4.6,27.4, 0.3,1],[-5.4,28.6, 0.1,2],
  // carousel boarding
  [ 7.6,34.6, 3.0,1],[ 8.6,35.2, 2.8,2],
  // slide queue
  [-10.6,35.2, 0.2,2],
  // train display viewers
  [ 1.2,31.4, 0,2],[ 2.2,30.6,-0.3,2],
  // spin ride watcher
  [ 12.6,27.0, 2.9,2]
];

export class Crowd {
  constructor(scene){
    this.scene=scene;
    this.group=new THREE.Group();
    scene.add(this.group);
    this.mode='lively';
    this.build();
  }
  build(){
    this.group.clear();
    const rng=mulberry32(1234);
    const all=[...SPOTS,...EXT_SPOTS];
    this.persons=[];
    all.forEach(([x,z,ry,tier],i)=>{
      const p=makePerson(rng);
      p.position.set(x,0,z);
      p.rotation.y=ry+(rng()-0.5)*0.4;
      p.userData.tier=tier;
      p.userData.ext=EXT_SPOTS.some(e=>e[0]===x&&e[1]===z);
      this.group.add(p);
      this.persons.push(p);
    });
    this.applyMode();
  }
  setMode(mode){ this.mode=mode; this.applyMode(); }
  applyMode(){
    const showEmpty = this.mode==='empty';
    this.persons.forEach(p=>{
      if(showEmpty){ p.visible=false; return; }
      let vis = this.mode==='lively' ? true : p.userData.tier===1;
      if(p.userData.ext && !this.expanded) vis=false;
      p.visible=vis && this.enabled!==false;
    });
  }
  setEnabled(on){ this.enabled=on; this.applyMode(); }
  setExpanded(on){ this.expanded=on; this.applyMode(); }
}
