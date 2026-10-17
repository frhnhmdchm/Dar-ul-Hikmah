/* ============================================================
 * rides.js — Six fully modeled ride concepts:
 * Mini Ferris Wheel, Mini Carousel, Bouncy Castle, Kiddie Train,
 * Inflatable Slide, Children's Spin Ride.
 * Each returns {group, update(t,dt)} for animation.
 * ============================================================ */
import * as THREE from 'three';
import { COLORS } from './config.js';
import { MAT } from './materials.js';
import { makeSignTexture, balloonMaterials } from './textures.js';

/* ---------- shared helpers ---------- */
export function makeRideLabel(text, width=2.4){
  const g = new THREE.Group();
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, width*0.28),
    new THREE.MeshBasicMaterial({map:makeSignTexture({
      w: Math.round(width*260), h: Math.round(width*73),
      bgGrad:['#c62828','#7a141a'], border:'#ffffff', borderWidth:10,
      lines:[{text, size: Math.round(90/Math.max(1,text.length/8)), color:'#ffffff'}]}),
      side:THREE.DoubleSide}));
  panel.position.y = 1.35;
  g.add(panel);
  const legGeo = new THREE.CylinderGeometry(0.05,0.06,1.35,8);
  [-width*0.4,width*0.4].forEach(dx=>{
    const l=new THREE.Mesh(legGeo,MAT.darkSteel);
    l.position.set(dx,0.67,0); g.add(l);
  });
  g.userData.rideLabel = true;
  return g;
}

function clearanceRing(radius, color=0xffd27a){
  const pts=[];
  for(let i=0;i<=48;i++){
    const a=i/48*Math.PI*2;
    pts.push(new THREE.Vector3(Math.cos(a)*radius,0.05,Math.sin(a)*radius));
  }
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineDashedMaterial({color, dashSize:0.3, gapSize:0.18}));
}

function barrierArc(radius, from, to, h=0.9){
  const g=new THREE.Group();
  const posts=[], n=Math.max(3,Math.floor((to-from)/(Math.PI/5)));
  for(let i=0;i<=n;i++){
    const a=from+(to-from)*i/n;
    const p=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.05,h,8),MAT.steel);
    p.position.set(Math.cos(a)*radius,h/2,Math.sin(a)*radius);
    p.castShadow=true; g.add(p);
    posts.push(p.position.clone());
  }
  // rails between consecutive posts
  for(let i=0;i<posts.length-1;i++){
    const a=posts[i], b=posts[i+1];
    const len=a.distanceTo(b);
    [0.35,0.7].forEach(hh=>{
      const rail=new THREE.Mesh(new THREE.BoxGeometry(len,0.05,0.05),MAT.redBright);
      rail.position.copy(a.clone().add(b).multiplyScalar(0.5));
      rail.position.y=hh;
      rail.lookAt(b.x,hh,b.z);
      rail.rotateY(0);
      const dir=b.clone().sub(a);
      rail.rotation.y=Math.atan2(-dir.z,dir.x);
      g.add(rail);
    });
  }
  return g;
}

function bulbString(points, count, mat){
  const curve=new THREE.CatmullRomCurve3(points);
  const geo=new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
  const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x5a5248}));
  const g=new THREE.Group(); g.add(line);
  for(let i=0;i<count;i++){
    const p=curve.getPoint(i/(count-1));
    const b=new THREE.Mesh(new THREE.SphereGeometry(0.035,6,6),mat);
    b.position.copy(p); g.add(b);
  }
  return g;
}

/* ============================================================
 * RIDE 01 — MINI FERRIS WHEEL (≈7 m Ø)
 * ============================================================ */
export function buildFerrisWheel(registry){
  const g=new THREE.Group(); g.name='ride-ferris';
  const R=3.5, hubY=R+0.9;

  // A-frame supports
  [[-1],[1]].forEach(([s])=>{
    [-1,1].forEach(sz=>{
      const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.14,hubY+0.4,10),MAT.steel);
      beam.position.set(s*0.55,(hubY+0.4)/2,sz*1.1);
      beam.rotation.z=-s*0.16; beam.rotation.x=sz*0.18;
      beam.castShadow=true; g.add(beam);
    });
    const foot=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.2,2.6),MAT.charcoal);
    foot.position.set(s*0.75,0.1,0); g.add(foot);
  });
  // cross tie
  const tie=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,2.4,8),MAT.darkSteel);
  tie.rotation.x=Math.PI/2; tie.position.set(0,1.4,0); g.add(tie);

  // rotating assembly
  const rot=new THREE.Group(); rot.position.set(0,hubY,0); g.add(rot);
  // twin rims
  [-0.35,0.35].forEach(z=>{
    const rim=new THREE.Mesh(new THREE.TorusGeometry(R,0.07,10,60),MAT.redBright);
    rim.position.z=z; rot.add(rim);
    const inner=new THREE.Mesh(new THREE.TorusGeometry(R-0.35,0.03,8,48),MAT.white);
    inner.position.z=z; rot.add(inner);
  });
  // spokes + cross ties
  const SPOKES=8;
  for(let i=0;i<SPOKES;i++){
    const a=i/SPOKES*Math.PI*2;
    [-0.35,0.35].forEach(z=>{
      const sp=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,R,6),MAT.steel);
      sp.position.set(Math.cos(a)*R/2, Math.sin(a)*R/2, z);
      sp.rotation.z=a-Math.PI/2; rot.add(sp);
    });
    const xtie=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.7,6),MAT.darkSteel);
    xtie.rotation.x=Math.PI/2;
    xtie.position.set(Math.cos(a)*(R-0.2),Math.sin(a)*(R-0.2),0); rot.add(xtie);
  }
  // hub
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,0.95,16),MAT.gold);
  hub.rotation.x=Math.PI/2; rot.add(hub);
  const hubCap=new THREE.Mesh(new THREE.SphereGeometry(0.2,12,10),MAT.redDark);
  hubCap.position.z=0.55; rot.add(hubCap);

  // gondolas (benches with backrest) — stay upright via counter-rotation
  const N=8, gondMats=[MAT.plasticRed,MAT.plasticBlue,MAT.plasticYellow,MAT.offWhite];
  const gondolas=[];
  for(let i=0;i<N;i++){
    const a=i/N*Math.PI*2;
    const pivot=new THREE.Group();
    pivot.position.set(Math.cos(a)*R, Math.sin(a)*R, 0);
    rot.add(pivot);
    const cell=new THREE.Group(); pivot.add(cell);
    const m=gondMats[i%gondMats.length];
    // seat bench
    const seat=new THREE.Mesh(new THREE.BoxGeometry(0.62,0.08,0.4),m);
    seat.position.y=-0.05; cell.add(seat);
    const back=new THREE.Mesh(new THREE.BoxGeometry(0.62,0.42,0.07),m);
    back.position.set(0,0.18,-0.18); cell.add(back);
    // floor plate + safety bar
    const floor=new THREE.Mesh(new THREE.BoxGeometry(0.66,0.05,0.5),MAT.charcoal);
    floor.position.y=-0.13; cell.add(floor);
    const bar=new THREE.Mesh(new THREE.TorusGeometry(0.24,0.02,6,14,Math.PI),MAT.steel);
    bar.rotation.y=Math.PI/2; bar.position.set(0,0.28,0.05); cell.add(bar);
    // hangers
    [-0.3,0.3].forEach(x=>{
      const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.3,6),MAT.steel);
      arm.position.set(x,0.15,0); cell.add(arm);
    });
    cell.traverse(o=>{if(o.isMesh)o.castShadow=true;});
    gondolas.push({pivot,cell,a});
  }
  // decorative bulbs around outer rim
  const bulbs=[];
  for(let i=0;i<28;i++){
    const a=i/28*Math.PI*2;
    const b=new THREE.Mesh(new THREE.SphereGeometry(0.05,6,6),MAT.bulbColor.clone());
    b.position.set(Math.cos(a)*(R+0.12),Math.sin(a)*(R+0.12),(i%2?0.35:-0.35));
    rot.add(b); bulbs.push(b.material);
    registry.addEmissive(b.material);
  }
  // center disc decoration behind hub
  const disc=new THREE.Mesh(new THREE.CircleGeometry(1.0,24),
    new THREE.MeshStandardMaterial({map:makeSignTexture({w:300,h:300,bg:'#c62828',border:'#fff',borderWidth:14,
      lines:[{text:'DH',size:110,color:'#fff'},{text:'2026',size:44,color:'#ffd98a'}]}),side:THREE.DoubleSide,roughness:0.6}));
  disc.position.z=-0.02; rot.add(disc);

  // boarding platform + barriers + operator booth
  const plat=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.25,1.6),MAT.woodLight);
  plat.position.set(0.2,0.12,R+0.9); g.add(plat);
  const steps=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.12,0.5),MAT.charcoalLt);
  steps.position.set(0.2,0.06,R+1.75); g.add(steps);
  g.add(barrierArc(R+1.9, -0.35, Math.PI+0.35, 0.85));
  const opBooth=new THREE.Group();
  const ob=new THREE.Mesh(new THREE.BoxGeometry(1.0,1.1,0.8),MAT.red);
  ob.position.y=0.55; opBooth.add(ob);
  const obTop=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.08,1.0),MAT.white);
  obTop.position.y=1.15; opBooth.add(obTop);
  const obWin=new THREE.Mesh(new THREE.PlaneGeometry(0.7,0.4),MAT.glass);
  obWin.position.set(0,0.75,0.41); opBooth.add(obWin);
  const console1=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.3,0.3),MAT.charcoal);
  console1.position.set(0,0.9,0.6); opBooth.add(console1);
  opBooth.position.set(-2.6,0,R+1.4); opBooth.rotation.y=0.5;
  opBooth.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  g.add(opBooth);

  const ring=clearanceRing(R+2.4); g.add(ring);
  const label=makeRideLabel('MINI FERRIS WHEEL',2.8);
  label.userData.rideLabel=true;
  label.position.set(0,0,R+3.1); g.add(label);

  // warm light on wheel for evening
  const wl=new THREE.PointLight(0xffd27a,6,10,2);
  wl.position.set(0,hubY,R+1); registry.addLight(wl); g.add(wl);

  let angle=0;
  return { group:g, update(dt,on){
    if(on) angle+=dt*0.22;
    rot.rotation.z=angle;
    gondolas.forEach(({pivot,cell})=>{ cell.rotation.z=-angle; });
    bulbs.forEach((m,i)=>{ m.emissiveIntensity=m.userData.base*(0.85+0.25*Math.sin(angle*6+i)); });
  }, info:{name:'MINI FERRIS WHEEL',use:"Children's ride — panoramic slow rotation",
    dims:'≈ 7 m diameter (editable)',footprint:'≈ 7 m Ø + perimeter queue/boarding/safety clearance',
    note:'Concept model only — not a real-world installation specification. Supplier certification required.'}};
}

/* ============================================================
 * RIDE 02 — MINI CAROUSEL (≈5 m Ø)
 * ============================================================ */
export function buildCarousel(registry){
  const g=new THREE.Group(); g.name='ride-carousel';
  const R=2.5;

  // circular raised base with red-white skirt
  const base=new THREE.Mesh(new THREE.CylinderGeometry(R+0.35,R+0.45,0.3,32),MAT.redDark);
  base.position.y=0.15; base.receiveShadow=true; g.add(base);
  const skirt=new THREE.Mesh(new THREE.CylinderGeometry(R+0.36,R+0.36,0.12,32),MAT.white);
  skirt.position.y=0.36; g.add(skirt);
  const deck=new THREE.Mesh(new THREE.CylinderGeometry(R+0.3,R+0.3,0.06,32),
    new THREE.MeshStandardMaterial({map:makeSignTexture({w:512,h:512,bg:'#f5f1ea',
      lines:[{text:'',size:10}]}),roughness:0.7}));
  deck.material.map=null; deck.material.color.setHex(0xe9e2d3);
  deck.position.y=0.44; g.add(deck);

  // rotating top: canopy + center column + animals
  const top=new THREE.Group(); top.position.y=0.45; g.add(top);
  // central ornamental column
  const col=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.3,2.3,16),MAT.gold);
  col.position.y=1.15; top.add(col);
  const colDetail=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.26,0.3,16),MAT.red);
  colDetail.position.y=0.7; top.add(colDetail);
  const crown=new THREE.Mesh(new THREE.SphereGeometry(0.16,12,10),MAT.gold);
  crown.position.y=2.62; top.add(crown);
  const finial=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.3,10),MAT.redBright);
  finial.position.y=2.85; top.add(finial);

  // striped canopy (red & white radial stripes via texture repeat trick: cone segments)
  const canopyGeo=new THREE.ConeGeometry(R+0.5,0.85,24,1,true);
  const canopyTex=makeSignTexture({w:1024,h:256,bg:'#ffffff',lines:[]});
  // draw stripes onto a fresh canvas texture instead:
  const cv=document.createElement('canvas'); cv.width=1024; cv.height=256;
  const ctx=cv.getContext('2d');
  for(let i=0;i<24;i++){
    ctx.fillStyle=i%2?'#ffffff':'#c62828';
    ctx.fillRect(i*1024/24,0,1024/24+1,256);
  }
  const cTex=new THREE.CanvasTexture(cv); cTex.colorSpace=THREE.SRGBColorSpace;
  const canopy=new THREE.Mesh(canopyGeo,new THREE.MeshStandardMaterial({map:cTex,roughness:0.7,side:THREE.DoubleSide}));
  canopy.position.y=2.55; canopy.castShadow=true; top.add(canopy);
  // gold scalloped trim ring
  const trim=new THREE.Mesh(new THREE.TorusGeometry(R+0.48,0.07,10,40),MAT.gold);
  trim.rotation.x=Math.PI/2; trim.position.y=2.14; top.add(trim);
  for(let i=0;i<24;i++){
    const a=i/24*Math.PI*2;
    const scallop=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,6),MAT.gold);
    scallop.scale.set(1,0.6,1);
    scallop.position.set(Math.cos(a)*(R+0.48),2.06,Math.sin(a)*(R+0.48));
    top.add(scallop);
  }
  // bulbs under trim
  const cBulbs=[];
  for(let i=0;i<18;i++){
    const a=i/18*Math.PI*2;
    const b=new THREE.Mesh(new THREE.SphereGeometry(0.045,6,6),MAT.bulbWarmOn.clone());
    b.position.set(Math.cos(a)*(R+0.35),2.0,Math.sin(a)*(R+0.35));
    top.add(b); cBulbs.push(b.material); registry.addEmissive(b.material);
  }

  // carousel animals / seats — 8 positions alternating horses & cars
  const seats=[];
  const horseCols=[MAT.offWhite,MAT.redBright,MAT.skyBlue,MAT.paleBlue,MAT.yellow,MAT.pink,MAT.ivory,MAT.green];
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2;
    const px=Math.cos(a)*(R-0.55), pz=Math.sin(a)*(R-0.55);
    const cell=new THREE.Group(); cell.position.set(px,0,pz); top.add(cell);
    // brass pole
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1.7,8),MAT.gold);
    pole.position.y=1.0; cell.add(pole);
    const m=horseCols[i];
    if(i%2===0){
      // stylized horse
      const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.16,0.42,6,10),m);
      body.rotation.z=Math.PI/2; body.position.y=0.75; cell.add(body);
      const neck=new THREE.Mesh(new THREE.CapsuleGeometry(0.09,0.3,5,8),m);
      neck.position.set(0.3,0.95,0); neck.rotation.z=-0.7; cell.add(neck);
      const head=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.12,0.12),m);
      head.position.set(0.46,1.08,0); cell.add(head);
      [-0.18,0.18].forEach(dx=>[-0.09,0.09].forEach(dz=>{
        const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.03,0.5,6),m);
        leg.position.set(dx,0.42,dz); cell.add(leg);
      }));
      const saddle=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.08,0.24),MAT.redDark);
      saddle.position.set(0,0.92,0); cell.add(saddle);
      const tail=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.25,6),MAT.charcoalLt);
      tail.position.set(-0.36,0.8,0); tail.rotation.z=0.9; cell.add(tail);
    } else {
      // small car seat
      const carB=new THREE.Mesh(new THREE.BoxGeometry(0.62,0.2,0.4),m);
      carB.position.y=0.62; cell.add(carB);
      const cabin=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.18,0.34),m);
      cabin.position.set(-0.05,0.8,0); cell.add(cabin);
      const hood=new THREE.Mesh(new THREE.SphereGeometry(0.14,10,8),m);
      hood.scale.set(1.4,0.6,1.1); hood.position.set(0.28,0.68,0); cell.add(hood);
      [-0.2,0.22].forEach(dx=>[-0.2,0.2].forEach(dz=>{
        const wh=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.05,10),MAT.charcoal);
        wh.rotation.x=Math.PI/2; wh.position.set(dx,0.55,dz); cell.add(wh);
      }));
    }
    cell.rotation.y=-a+Math.PI/2;
    cell.traverse(o=>{if(o.isMesh)o.castShadow=true;});
    seats.push({cell,phase:i*0.8});
  }

  // boarding side: gap in barrier + platform
  const boardPlat=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.18,1.0),MAT.woodLight);
  boardPlat.position.set(0,0.09,R+1.0); g.add(boardPlat);
  g.add(barrierArc(R+1.3, 0.55, Math.PI*2-0.55, 0.8));
  // operator position
  const opDesk=new THREE.Mesh(new THREE.BoxGeometry(0.8,1.0,0.5),MAT.red);
  opDesk.position.set(-(R+1.2),0.5,R+0.4); opDesk.rotation.y=0.6; opDesk.castShadow=true; g.add(opDesk);
  const opBox=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.2,0.25),MAT.charcoal);
  opBox.position.set(-(R+1.2),1.1,R+0.4); g.add(opBox);
  // queue markers
  [-0.5,0.5].forEach(dx=>{
    const q=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.08,0.9,8),MAT.steel);
    q.position.set(dx*2.0,0.45,R+1.8); g.add(q);
    const flag=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.18,0.02),MAT.redBright);
    flag.position.set(dx*2.0+0.15,0.85,R+1.8); g.add(flag);
  });

  const label=makeRideLabel('MINI CAROUSEL',2.6);
  label.position.set(0,0,R+2.2); g.add(label);
  const cl=clearanceRing(R+1.9); g.add(cl);
  const wl=new THREE.PointLight(0xffcf8a,5,9,2); wl.position.set(0,2.2,0);
  registry.addLight(wl); g.add(wl);

  let ang=0, t=0;
  return {group:g, update(dt,on){
    if(on){ ang+=dt*0.35; t+=dt; }
    top.rotation.y=ang;
    seats.forEach(({cell,phase})=>{ cell.position.y=Math.sin(t*1.6+phase)*0.07; });
    cBulbs.forEach((m,i)=>{ m.emissiveIntensity=m.userData.base*(0.85+0.2*Math.sin(t*3+i*0.7)); });
  }, info:{name:'MINI CAROUSEL',use:"Children's ride — ornamental roundabout",
    dims:'≈ 5 m diameter (editable)',footprint:'≈ 5 m Ø + queue & operator space',
    note:'Concept model. Subject to manufacturer equipment specifications.'}};
}

/* ============================================================
 * RIDE 03 — INFLATABLE BOUNCY CASTLE (≈5×5 m)
 * ============================================================ */
export function buildBouncyCastle(registry){
  const g=new THREE.Group(); g.name='ride-bouncy';
  const tube=(r,len,mat,axis='y')=>{
    const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,6,12),mat);
    if(axis==='x')m.rotation.z=Math.PI/2;
    if(axis==='z')m.rotation.x=Math.PI/2;
    m.castShadow=true; m.receiveShadow=true;
    return m;
  };
  const S=5, half=S/2;
  // inflated floor
  const floor=new THREE.Mesh(new THREE.BoxGeometry(S-0.3,0.3,S-0.3),MAT.vinylYellow);
  floor.position.y=0.18; floor.receiveShadow=true; g.add(floor);
  // bouncing surface (soft red interior)
  const bounce=new THREE.Mesh(new THREE.BoxGeometry(S-1.1,0.12,S-1.1),MAT.vinylRed);
  bounce.position.y=0.38; g.add(bounce);

  // perimeter walls as rounded tubes
  const wallH=1.15;
  [[0,-half,'x'],[0,half,'x'],[-half,0,'z'],[half,0,'z']].forEach(([x,z,ax])=>{
    const w=tube(0.28,S-0.5,MAT.vinylRed,ax);
    w.position.set(x,0.55,z); g.add(w);
    const w2=tube(0.24,S-0.5,MAT.vinylWhite,ax);
    w2.position.set(x,wallH,z); g.add(w2);
  });
  // corner towers with turret caps
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz],i)=>{
    const t=tube(0.34,1.3,i%2?MAT.vinylBlue:MAT.vinylRed,'y');
    t.position.set(sx*half,0.95,sz*half); g.add(t);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(0.4,12,10),MAT.vinylYellow);
    cap.scale.y=1.25; cap.position.set(sx*half,wallH+0.85,sz*half); cap.castShadow=true; g.add(cap);
    const tip=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.3,8),MAT.vinylWhite);
    tip.position.set(sx*half,wallH+1.55,sz*half); g.add(tip);
  });
  // front entrance arch (gap in -Z wall handled by two short segments)
  // remove middle of front wall visually: add entrance tunnel tubes
  const entX=0, entZ=-half;
  const archL=tube(0.26,0.9,MAT.vinylBlue,'z'); archL.position.set(-0.85,0.9,entZ+0.2); g.add(archL);
  const archR=archL.clone(); archR.position.x=0.85; g.add(archR);
  const archTop=tube(0.26,1.7,MAT.vinylYellow,'x'); archTop.position.set(0,1.55,entZ+0.2); g.add(archTop);
  // smiling face pillars at entrance
  [-1.35,1.35].forEach(dx=>{
    const post=tube(0.2,1.4,dx<0?MAT.vinylRed:MAT.vinylBlue,'y');
    post.position.set(dx,0.75,entZ-0.15); g.add(post);
    const eye=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,8),MAT.charcoal);
    eye.position.set(dx,1.3,entZ-0.32); g.add(eye);
  });
  // internal slide-ish roof accents: mini roof over back wall
  const roofBeam=tube(0.2,3.6,MAT.vinylWhite,'x');
  roofBeam.position.set(0,wallH+0.5,half-0.2); g.add(roofBeam);

  // rules sign
  const rules=new THREE.Mesh(new THREE.PlaneGeometry(0.8,1.0),
    new THREE.MeshBasicMaterial({map:makeSignTexture({w:340,h:430,bg:'#ffffff',border:'#c62828',borderWidth:14,
      lines:[{text:'RULES',size:56,color:'#9e1b23'},
             {text:'• Max 4 kids',size:34,color:'#2b2b2e'},
             {text:'• No shoes',size:34,color:'#2b2b2e'},
             {text:'• No flips',size:34,color:'#2b2b2e'},
             {text:'• Adults supervise',size:28,color:'#2b2b2e'}]}),side:THREE.DoubleSide}));
  rules.position.set(-half-0.1,1.0,-half+0.4); rules.rotation.y=Math.PI/2.4; g.add(rules);
  const rLeg=tube(0.03,1.0,MAT.darkSteel,'y'); rLeg.position.set(-half-0.1,0.5,-half+0.4); g.add(rLeg);

  // staff supervision point
  const chair=new THREE.Group();
  const seat=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.06,0.5),MAT.redBright);
  seat.position.y=0.45; chair.add(seat);
  const cb=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.06),MAT.redBright);
  cb.position.set(0,0.7,-0.22); chair.add(cb);
  [[-0.2,-0.2],[0.2,-0.2],[-0.2,0.2],[0.2,0.2]].forEach(([x,z])=>{
    const l=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.45,6),MAT.steel);
    l.position.set(x,0.22,z); chair.add(l);
  });
  chair.position.set(half+1.0,0,-half+0.6); chair.rotation.y=-0.5;
  chair.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  g.add(chair);
  const umbrellaPole=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,2.0,6),MAT.steel);
  umbrellaPole.position.set(half+1.0,1.0,-half+0.6); g.add(umbrellaPole);
  const umb=new THREE.Mesh(new THREE.ConeGeometry(1.0,0.4,10),MAT.red);
  umb.position.set(half+1.0,2.1,-half+0.6); umb.castShadow=true; g.add(umb);

  // clearance zone ring (square-ish circle)
  g.add(clearanceRing(half+1.6,0x9fd08a));

  const label=makeRideLabel('BOUNCY CASTLE',2.6);
  label.position.set(0,0,-half-1.4); label.rotation.y=Math.PI; g.add(label);

  // gentle idle bobbing of whole castle when animated
  let tt=0;
  return {group:g, update(dt,on){
    if(on){ tt+=dt; g.position.y=Math.sin(tt*1.2)*0.015; }
    else g.position.y=0;
  }, info:{name:'BOUNCY CASTLE',use:'Inflatable children’s play structure',
    dims:'≈ 5 m × 5 m (adjustable)',footprint:'≈ 5×5 m + surrounding clearance zone',
    note:'Shown as default attraction in BOTH layouts. Requires anchoring, power blower & staff supervision per supplier.'}};
}

/* ============================================================
 * RIDE 04 — MINI KIDDIE TRAIN (display configuration)
 * ============================================================ */
export function buildKiddieTrain(registry){
  const g=new THREE.Group(); g.name='ride-train';

  // display pad with painted "track" stripes (no operating loop through stalls)
  const pad=new THREE.Mesh(new THREE.BoxGeometry(8.6,0.08,3.6),
    new THREE.MeshStandardMaterial({color:0x8a8073,roughness:0.95}));
  pad.position.y=0.04; pad.receiveShadow=true; g.add(pad);
  [-1.1,1.1].forEach(z=>{
    const rail=new THREE.Mesh(new THREE.BoxGeometry(8.2,0.05,0.1),MAT.steel);
    rail.position.set(0,0.11,z); g.add(rail);
  });
  for(let i=0;i<14;i++){
    const sleep=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.04,2.4),MAT.wood);
    sleep.position.set(-3.9+i*0.6,0.1,0); g.add(sleep);
  }

  function carriage(color,bodyLen,isLoco){
    const c=new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(bodyLen,0.7,1.3),
      new THREE.MeshStandardMaterial({color,roughness:0.45}));
    body.position.y=0.62; c.add(body);
    // rounded roof
    const roof=new THREE.Mesh(new THREE.CylinderGeometry(0.68,0.68,bodyLen,12,1,false,0,Math.PI),
      new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.5}));
    roof.rotation.z=Math.PI/2; roof.rotation.x=Math.PI/2;
    roof.position.y=0.95; roof.scale.y=1; c.add(roof);
    // windows
    const nWin=Math.max(2,Math.floor(bodyLen/0.55));
    for(let i=0;i<nWin;i++){
      const win=new THREE.Mesh(new THREE.PlaneGeometry(0.32,0.28),MAT.glass);
      win.position.set(-bodyLen/2+0.35+i*(bodyLen-0.6)/(nWin-1||1),0.75,0.66);
      c.add(win);
      const win2=win.clone(); win2.rotation.y=Math.PI; win2.position.z=-0.66; c.add(win2);
    }
    // wheels
    [-bodyLen/2+0.35,bodyLen/2-0.35].forEach(dx=>[-0.55,0.55].forEach(dz=>{
      const w=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.1,12),MAT.charcoal);
      w.rotation.x=Math.PI/2; w.position.set(dx,0.32,dz); c.add(w);
      const hubW=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.12,10),MAT.gold);
      hubW.rotation.x=Math.PI/2; hubW.position.set(dx,0.32,dz); c.add(hubW);
    }));
    // trim stripe
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(bodyLen,0.1,1.34),MAT.gold);
    stripe.position.y=0.42; c.add(stripe);
    c.traverse(o=>{if(o.isMesh)o.castShadow=true;});
    if(isLoco){
      // locomotive nose + chimney + headlight
      const nose=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.55,1.1),new THREE.MeshStandardMaterial({color:0xd84040,roughness:0.45}));
      nose.position.set(bodyLen/2+0.3,0.5,0); c.add(nose);
      const chim=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.15,0.4,10),MAT.charcoal);
      chim.position.set(bodyLen/2+0.35,1.05,0); c.add(chim);
      const lampH=new THREE.Mesh(new THREE.SphereGeometry(0.09,10,8),
        new THREE.MeshStandardMaterial({color:0xfff3c0,emissive:0xffe08a,emissiveIntensity:1.5}));
      lampH.position.set(bodyLen/2+0.68,0.75,0); c.add(lampH);
      registry.addEmissive(lampH.material);
      const pilot=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.3,1.2),MAT.gold);
      pilot.position.set(bodyLen/2+0.75,0.3,0); c.add(pilot);
      // smile face on front
      const face=new THREE.Mesh(new THREE.CircleGeometry(0.22,16),
        new THREE.MeshBasicMaterial({map:makeSignTexture({w:160,h:160,bg:'#f7ca35',
          lines:[{text:'◠‿◠',size:60,color:'#2b2b2e'}]})}));
      face.position.set(bodyLen/2+0.9,0.62,0); face.rotation.y=Math.PI/2; c.add(face);
    } else {
      // coupling
      const link=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.4,6),MAT.darkSteel);
      link.rotation.z=Math.PI/2; link.position.set(-bodyLen/2-0.2,0.45,0); c.add(link);
    }
    return c;
  }

  const loco=carriage(0x2f7fc4,2.2,true); loco.position.set(2.9,0.12,0); g.add(loco);
  const c1=carriage(0xd84040,1.8,false); c1.position.set(0.55,0.12,0); g.add(c1);
  const c2=carriage(0xf2c14e,1.8,false); c2.position.set(-1.6,0.12,0); g.add(c2);
  const c3=carriage(0x3f9d5a,1.6,false); c3.position.set(-3.4,0.12,0); g.add(c3);

  // boarding point & waiting area
  const plat=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.15,1.2),MAT.woodLight);
  plat.position.set(2.9,0.07,2.2); g.add(plat);
  const bench=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.4,0.4),MAT.red);
  bench.position.set(-1.5,0.25,2.4); g.add(bench);
  const benchBack=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.5,0.08),MAT.redDark);
  benchBack.position.set(-1.5,0.6,2.25); g.add(benchBack);
  // route arrow decal around pad edge (illustrative only)
  const arrowPts=[];
  for(let i=0;i<=40;i++){
    const a=i/40*Math.PI*2;
    arrowPts.push(new THREE.Vector3(Math.cos(a)*4.6,0.13,Math.sin(a)*2.2));
  }
  const ar=new THREE.Line(new THREE.BufferGeometry().setFromPoints(arrowPts),
    new THREE.LineDashedMaterial({color:0xffd27a,dashSize:0.25,gapSize:0.15}));
  ar.computeLineDistances(); g.add(ar);

  const label=makeRideLabel('KIDDIE TRAIN',2.4);
  label.position.set(0,0,-2.6); label.rotation.y=Math.PI; g.add(label);

  return {group:g, update(){}, info:{name:'KIDDIE TRAIN',use:'Children’s ride — display configuration',
    dims:'Display area ≈ 8 m × 4 m (editable)',footprint:'≈ 9 × 5 m incl. boarding & waiting',
    note:'No track routed through stalls or emergency paths. Closed loop only on a verified route in the expanded venue.'}};
}

/* ============================================================
 * RIDE 05 — MINI INFLATABLE SLIDE (≈4×6 m)
 * ============================================================ */
export function buildInflatableSlide(registry){
  const g=new THREE.Group(); g.name='ride-slide';
  const tube=(r,len,mat,rot=[0,0,0])=>{
    const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,6,12),mat);
    m.rotation.set(...rot); m.castShadow=true; return m;
  };
  // base mat
  const base=new THREE.Mesh(new THREE.BoxGeometry(4,0.16,6),MAT.vinylBlue);
  base.position.y=0.08; base.receiveShadow=true; g.add(base);

  // climbing section (back, +Z): stepped inflated ridges
  for(let i=0;i<5;i++){
    const step=tube(0.16,3.2,MAT.vinylYellow,[0,0,Math.PI/2]);
    step.position.set(0,0.4+i*0.42, 2.3-i*0.32);
    g.add(step);
  }
  // side rails climbing
  [-1.7,1.7].forEach(x=>{
    const rail=tube(0.2,2.6,x<0?MAT.vinylRed:MAT.vinylRed,[Math.atan2(1.6,2.2),0,0]);
    rail.position.set(x,1.3,1.3);
    rail.rotation.x=-Math.atan2(1.9,2.0);
    g.add(rail);
  });
  // top platform
  const topPlat=new THREE.Mesh(new THREE.BoxGeometry(3.4,0.5,1.4),MAT.vinylWhite);
  topPlat.position.set(0,2.35,0.1); topPlat.castShadow=true; g.add(topPlat);
  const topTubeF=tube(0.2,3.2,MAT.vinylBlue,[0,0,Math.PI/2]); topTubeF.position.set(0,2.75,-0.5); g.add(topTubeF);
  // guard tubes around platform
  [-1.6,1.6].forEach(x=>{
    const t=tube(0.18,1.2,MAT.vinylBlue,[Math.PI/2,0,0]);
    t.position.set(x,2.7,0.3); g.add(t);
  });
  // slide surface (sloped)
  const slopeLen=3.4;
  const slide=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.12,slopeLen),
    new THREE.MeshStandardMaterial({color:0x9adcf2,roughness:0.25}));
  slide.position.set(0,1.35,-1.55);
  slide.rotation.x=Math.PI/2-0.62;
  slide.castShadow=true; g.add(slide);
  // slide side rails
  [-1.15,1.15].forEach(x=>{
    const rail=tube(0.16,slopeLen,MAT.vinylRed,[Math.PI/2-0.62,0,0]);
    rail.position.set(x,1.5,-1.55);
    g.add(rail);
  });
  // soft landing zone
  const land=new THREE.Mesh(new THREE.BoxGeometry(3.0,0.3,1.6),MAT.vinylYellow);
  land.position.set(0,0.22,-3.4); land.receiveShadow=true; g.add(land);
  // decorative arch at top
  const arch=tube(0.14,2.6,MAT.vinylYellow,[0,0,Math.PI/2]);
  arch.position.set(0,3.1,0.1); g.add(arch);
  [-1.3,1.3].forEach(x=>{
    const p=tube(0.14,0.7,MAT.vinylYellow,[Math.PI/2,0,0]);
    p.position.set(x,2.85,0.1); g.add(p);
  });

  // queue markers along +Z approach
  for(let i=0;i<3;i++){
    const q=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.08,0.9,8),MAT.steel);
    q.position.set(1.2,0.45,2.4+i*0.9); g.add(q);
    if(i<2){
      const rope=tube(0.02,0.85,MAT.redBright,[Math.PI/2,0,0]);
      rope.position.set(1.2,0.75,2.85+i*0.9); g.add(rope);
    }
  }
  g.add(clearanceRing(4.2,0x9fd08a));

  const label=makeRideLabel('INFLATABLE SLIDE',2.6);
  label.position.set(0,0,-4.6); label.rotation.y=Math.PI; g.add(label);

  return {group:g, update(){}, info:{name:'INFLATABLE SLIDE',use:'Inflatable children’s slide',
    dims:'≈ 4 m × 6 m (adjustable)',footprint:'≈ 6 × 8 m incl. queue & landing clearance',
    note:'Optional additional attraction. Commercial inflatable sizes vary — match actual unit.'}};
}

/* ============================================================
 * RIDE 06 — CHILDREN'S SPIN RIDE (generic concept)
 * ============================================================ */
export function buildSpinRide(registry){
  const g=new THREE.Group(); g.name='ride-spin';
  const R=1.8;
  // base
  const base=new THREE.Mesh(new THREE.CylinderGeometry(R+0.5,R+0.6,0.25,24),MAT.charcoal);
  base.position.y=0.12; g.add(base);
  const deck=new THREE.Mesh(new THREE.CylinderGeometry(R+0.42,R+0.42,0.08,24),
    new THREE.MeshStandardMaterial({color:0xe9e2d3,roughness:0.7}));
  deck.position.y=0.28; g.add(deck);
  // central support column with decorative panels
  const rot=new THREE.Group(); rot.position.y=0.32; g.add(rot);
  const col=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.24,1.5,14),MAT.redBright);
  col.position.y=0.75; rot.add(col);
  // decorative triangular panels radiating at mid height
  for(let i=0;i<6;i++){
    const a=i/6*Math.PI*2;
    const panel=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.5,3),
      [MAT.plasticYellow,MAT.skyBlue,MAT.plasticRed][i%3]);
    panel.position.set(Math.cos(a)*0.32,1.05,Math.sin(a)*0.32);
    panel.rotation.set(Math.PI/2,0,-a+Math.PI/2);
    rot.add(panel);
  }
  // rotating platform
  const plat=new THREE.Mesh(new THREE.CylinderGeometry(R,R,0.12,24),MAT.white);
  plat.position.y=0.35; rot.add(plat);
  const platTrim=new THREE.Mesh(new THREE.TorusGeometry(R,0.05,8,32),MAT.gold);
  platTrim.rotation.x=Math.PI/2; platTrim.position.y=0.35; rot.add(platTrim);
  // supported seats (small molded chairs with backrests) around platform
  const seatCols=[MAT.plasticRed,MAT.plasticBlue,MAT.plasticYellow,MAT.pink,MAT.green,MAT.skyBlue];
  for(let i=0;i<6;i++){
    const a=i/6*Math.PI*2;
    const sx=Math.cos(a)*(R-0.4), sz=Math.sin(a)*(R-0.4);
    const s=new THREE.Group(); s.position.set(sx,0.41,sz); s.rotation.y=-a+Math.PI/2;
    const seatBase=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.08,0.4),seatCols[i]);
    s.add(seatBase);
    const backr=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.45,0.08),seatCols[i]);
    backr.position.set(0,0.26,-0.18); s.add(backr);
    // grab handle
    const handle=new THREE.Mesh(new THREE.TorusGeometry(0.09,0.02,6,12),MAT.steel);
    handle.position.set(0,0.3,0.12); handle.rotation.x=0.6; s.add(handle);
    // support strut to column
    const strut=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,sx!==0?Math.hypot(sx,sz):0.9,6),MAT.steel);
    strut.rotation.z=Math.PI/2; strut.position.set(-sx/2,0.05,-sz/2);
    strut.rotation.y=Math.atan2(sz,sx)+Math.PI;
    s.add(strut);
    s.traverse(o=>{if(o.isMesh)o.castShadow=true;});
    rot.add(s);
  }
  // top canopy disc with bulbs
  const canopy=new THREE.Mesh(new THREE.CylinderGeometry(1.1,0.4,0.3,16),MAT.red);
  canopy.position.y=1.85; rot.add(canopy);
  const bulbs=[];
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2;
    const b=new THREE.Mesh(new THREE.SphereGeometry(0.04,6,6),MAT.bulbWarmOn.clone());
    b.position.set(Math.cos(a)*0.85,1.72,Math.sin(a)*0.85);
    rot.add(b); bulbs.push(b.material); registry.addEmissive(b.material);
  }
  // boarding gap barrier
  g.add(barrierArc(R+0.9, 0.5, Math.PI*2-0.5, 0.75));
  const boardPad=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.12,0.9),MAT.woodLight);
  boardPad.position.set(0,0.06,R+1.2); g.add(boardPad);
  g.add(clearanceRing(R+1.5));
  const label=makeRideLabel("CHILDREN'S SPIN RIDE",2.8);
  label.position.set(0,0,R+2.0); g.add(label);

  let ang=0;
  return {group:g, update(dt,on){
    if(on) ang+=dt*0.5;
    rot.rotation.y=ang;
    bulbs.forEach((m,i)=>{ m.emissiveIntensity=m.userData.base*(0.85+0.2*Math.sin(ang*4+i)); });
  }, info:{name:"CHILDREN'S SPIN RIDE",use:'Low-speed spinning ride (optional concept)',
    dims:'≈ 3.6 m Ø platform (editable)',footprint:'≈ 6 × 6 m incl. boarding point',
    note:'Generic concept until an actual equipment model is selected. No capacity/speed/certification claims.'}};
}
