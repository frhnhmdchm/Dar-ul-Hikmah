/* ============================================================
 * gate.js — Signature entrance arch (~5 m × 3.3 m, adjustable).
 * Deep-red fascia, white lettering, balloons, bunting, lights,
 * welcome/ticket desk outside the passage.
 * ============================================================ */
import * as THREE from 'three';
import { VENUE, EVENT, COLORS } from './config.js';
import { MAT, LightRegistry } from './materials.js';
import { makeSignTexture, balloonMaterials } from './textures.js';

export function buildGate(registry){
  const g = new THREE.Group();
  g.name = 'entrance-gate';
  const W = VENUE.gateWidth, H = VENUE.gateHeight;
  const zFront = -VENUE.mainD/2 + 0.6;   // just inside front boundary

  // ---------- support columns (decorative, red with white bands) ----------
  const colH = H - 0.75;
  [-1,1].forEach(side=>{
    const x = side*(W/2 + 0.55);
    const col = new THREE.Group();
    // base plinth
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.05,0.28,0.9), MAT.charcoal);
    base.position.y = 0.14; col.add(base);
    // shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.30,0.34,colH-0.5,14), MAT.red);
    shaft.position.y = 0.28 + (colH-0.5)/2; col.add(shaft);
    // white inset bands
    [0.35,0.62].forEach(f=>{
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.315,0.315,0.12,14), MAT.white);
      band.position.y = 0.28 + (colH-0.5)*f; col.add(band);
    });
    // capital
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.95,0.22,0.8), MAT.white);
    cap.position.y = colH - 0.05; col.add(cap);
    const capTop = new THREE.Mesh(new THREE.BoxGeometry(0.8,0.12,0.7), MAT.redDark);
    capTop.position.y = colH + 0.12; col.add(capTop);
    col.position.set(x, 0, zFront);
    col.traverse(m=>{ if(m.isMesh){m.castShadow=true;} });
    g.add(col);
  });

  // ---------- header: deep-red central fascia with white inset border ----------
  const headH = 0.95, headW = W + 2.6;
  const fasciaMat = new THREE.MeshStandardMaterial({
    map: makeSignTexture({
      w: 1400, h: 300, bg:'#7a141a', border:'#ffffff', borderWidth:10, borderInset:14,
      lines:[
        {text:EVENT.school, size:74, color:'#ffffff', spacing:4},
        {text:`${EVENT.village}  •  ${EVENT.shortTitle}`, size:56, color:'#ffd98a'}
      ]}),
    roughness:0.55});
  const fascia = new THREE.Mesh(new THREE.BoxGeometry(headW, headH, 0.42), fasciaMat);
  fascia.position.set(0, H - headH/2 + 0.15, zFront);
  fascia.castShadow = true;
  fascia.userData.info = { name:'MAIN ENTRANCE GATE', use:'Branded arrival arch & photo moment',
    dims:`${headW.toFixed(1)} m wide × ${H.toFixed(1)} m high (adjustable)`,
    footprint:'Passage ≈ '+W+' m clear width', note:'Modular steel/ply concept. Lettering per event branding.' };
  g.add(fascia);

  // header top cornice + location strip below
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(headW+0.3, 0.14, 0.55), MAT.white);
  cornice.position.set(0, H+0.22, zFront); g.add(cornice);
  const locStrip = new THREE.Mesh(new THREE.PlaneGeometry(W+1.6, 0.3),
    new THREE.MeshBasicMaterial({map:makeSignTexture({w:900,h:90,bg:'#ffffff',lines:[{text:EVENT.locationLine,size:46,color:'#7a141a'}]})}));
  locStrip.position.set(0, H-headH-0.02, zFront+0.22); g.add(locStrip);

  // slogan panel on a small side board (separate smaller panel)
  const sloganPanel = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.5),
    new THREE.MeshBasicMaterial({map:makeSignTexture({w:760,h:170,bgGrad:['#c62828','#7a141a'],border:'#e8b64c',
      lines:[{text:EVENT.slogan,size:44,color:'#ffffff'}]})}));
  sloganPanel.position.set(-(W/2+0.55), 1.75, zFront+0.5);
  sloganPanel.rotation.y = Math.PI*0.12;
  g.add(sloganPanel);

  // decorative side panels flanking the passage (red-white printed)
  [-1,1].forEach(side=>{
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.5, 0.12),
      new THREE.MeshStandardMaterial({map:makeSignTexture({w:300,h:500,bg:'#ffffff',border:'#9e1b23',borderWidth:16,
        lines:[{text:'2026',size:120,color:'#9e1b23'},{text:'★ ★ ★',size:60,color:'#e8b64c'},{text:'FAMILY',size:52,color:'#2b2b2e'}]}),roughness:0.6}));
    sp.position.set(side*(W/2+0.55), 0.95, zFront+0.62);
    sp.castShadow = true;
    g.add(sp);
  });

  // school logo position — typographic roundel (no invented official logo art)
  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.34, 32),
    new THREE.MeshBasicMaterial({map:makeSignTexture({w:256,h:256,bg:'#ffffff',border:'#9e1b23',borderWidth:16,
      lines:[{text:'DH',size:96,color:'#9e1b23'},{text:'SCHOOL',size:30,color:'#2b2b2e'}]})}));
  logo.position.set(0, H+0.55, zFront);
  g.add(logo);
  const logoRing = new THREE.Mesh(new THREE.TorusGeometry(0.36,0.035,10,36), MAT.gold);
  logoRing.position.copy(logo.position); g.add(logoRing);

  // ---------- warm string lights along header ----------
  const bulbGeo = new THREE.SphereGeometry(0.045, 8, 8);
  for(let i=0;i<26;i++){
    const b = new THREE.Mesh(bulbGeo, MAT.bulbWarmOn);
    b.position.set(-headW/2+0.3 + i*(headW-0.6)/25, H-headH-0.1, zFront+0.24);
    g.add(b);
  }
  registry.addEmissive(MAT.bulbWarmOn);
  const gateLight = new THREE.PointLight(0xffd9a0, 8, 9, 2);
  gateLight.position.set(0, H-0.4, zFront+0.8);
  registry.addLight(gateLight); g.add(gateLight);

  // ---------- balloon clusters at upper corners + garland across header ----------
  const balloonMats = balloonMaterials();
  const balloonGeo = new THREE.SphereGeometry(0.14, 12, 10);
  balloonGeo.scale(1, 1.25, 1);
  function cluster(cx, cy, cz, n=14, spread=0.85){
    for(let i=0;i<n;i++){
      const m = new THREE.Mesh(balloonGeo, balloonMats[i%balloonMats.length]);
      const a = Math.random()*Math.PI*2, r = Math.pow(Math.random(),0.6)*spread;
      m.position.set(cx+Math.cos(a)*r, cy+Math.sin(a)*r*0.7+Math.random()*0.3, cz+(Math.random()-0.5)*0.35);
      m.rotation.z = (Math.random()-0.5)*0.6;
      m.castShadow = false;
      g.add(m);
    }
  }
  cluster(-W/2-0.4, H+0.15, zFront, 16, 0.9);
  cluster( W/2+0.4, H+0.15, zFront, 16, 0.9);
  // alternating garland along the header bottom
  for(let i=0;i<20;i++){
    const t=i/19, x=-headW/2+0.2+t*(headW-0.4);
    const sag = Math.sin(t*Math.PI)*0.22;
    const m=new THREE.Mesh(balloonGeo, balloonMats[i%2===0?0:1]);
    m.position.set(x, H-headH-0.34-sag, zFront+0.1);
    m.scale.setScalar(0.8);
    g.add(m);
  }

  // ---------- bunting extending into the carnival ----------
  const buntGroup = new THREE.Group(); buntGroup.name='gate-bunting';
  const flagGeo = new THREE.BufferGeometry();
  flagGeo.setAttribute('position', new THREE.Float32BufferAttribute(
    [ -0.16,0,0,  0.16,0,0,  0, -0.34, 0 ], 3));
  flagGeo.computeVertexNormals();
  const flagRed = new THREE.MeshBasicMaterial({color:COLORS.red, side:THREE.DoubleSide});
  const flagWhite = new THREE.MeshBasicMaterial({color:0xffffff, side:THREE.DoubleSide});
  [ -1, 1 ].forEach(side=>{
    for(let i=0;i<16;i++){
      const f = new THREE.Mesh(flagGeo, i%2? flagWhite : flagRed);
      const t=i/15;
      f.position.set(side*(W/2+0.5) - side*t*3.2, 2.9 - Math.sin(t*Math.PI*0.9)*0.35 - t*0.2, zFront + 1.2 + t*7.5);
      f.rotation.y = side*0.35;
      buntGroup.add(f);
    }
    // rope line
    const ropePts=[new THREE.Vector3(side*(W/2+0.5),2.9,zFront+1.2),
                   new THREE.Vector3(side*(W/2+0.5)-side*3.2,2.55,zFront+8.7)];
    const rope=new THREE.Line(new THREE.BufferGeometry().setFromPoints(ropePts),
      new THREE.LineBasicMaterial({color:0xd8cdbb}));
    buntGroup.add(rope);
  });
  g.add(buntGroup);

  // ---------- ticket & welcome desk OUTSIDE the passage ----------
  const desk = new THREE.Group(); desk.name='welcome-desk';
  const dTop = new THREE.Mesh(new THREE.BoxGeometry(1.8,0.08,0.8), MAT.white);
  dTop.position.y=0.95; desk.add(dTop);
  const dFront = new THREE.Mesh(new THREE.BoxGeometry(1.8,0.9,0.06),
    new THREE.MeshStandardMaterial({map:makeSignTexture({w:520,h:200,bg:'#9e1b23',border:'#fff',
      lines:[{text:'TICKETS & WELCOME',size:52,color:'#fff'}]}),roughness:0.6}));
  dFront.position.set(0,0.5,0.4); desk.add(dFront);
  const dBody = new THREE.Mesh(new THREE.BoxGeometry(1.7,0.85,0.7), MAT.charcoal);
  dBody.position.y=0.5; desk.add(dBody);
  desk.position.set(W/2+2.4, 0, zFront-1.4);
  desk.rotation.y = -0.35;
  desk.traverse(m=>{if(m.isMesh)m.castShadow=true;});
  desk.userData.info = { name:'TICKET & WELCOME DESK', use:'Entry management, guest help',
    dims:'1.8 m counter (editable)', footprint:'Outside main passage', note:'Parent volunteers / staffed by school team.' };
  g.add(desk);

  g.userData.info = { name:'MAIN ENTRANCE GATE', use:'Signature branded arrival arch',
    dims:`≈ ${W} m wide × ${H} m high (adjustable)`, footprint:'Front boundary, centered',
    note:'Displays DAR-UL-HIKMAH SCHOOL • KATHORE KALAN • FAMILY CARNIVAL 2026 with balloons & warm lights.' };

  return g;
}
