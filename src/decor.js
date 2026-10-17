/* ============================================================
 * decor.js — Festive decoration system: bunting lines, balloon
 * garlands, flags, string lights, potted plants, direction boards.
 * Uses instancing for repeated items.
 * ============================================================ */
import * as THREE from 'three';
import { COLORS } from './config.js';
import { MAT } from './materials.js';
import { makeSignTexture, balloonMaterials } from './textures.js';

export function buildDecorations(VENUE){
  const g=new THREE.Group(); g.name='decorations';

  /* ---- Instanced balloons helper ---- */
  const bGeo=new THREE.SphereGeometry(0.13,10,8); bGeo.scale(1,1.22,1);
  const bmats=balloonMaterials();
  function balloonGarland(points, perSeg=6, mats=bmats){
    const curve=new THREE.CatmullRomCurve3(points);
    const total=perSeg*(points.length-1);
    const inst=new THREE.InstancedMesh(bGeo,mats[0],total);
    const dummy=new THREE.Object3D();
    const color=new THREE.Color();
    for(let i=0;i<total;i++){
      const t=i/(total-1);
      const p=curve.getPoint(t);
      p.y += Math.sin(t*Math.PI)* -0.12; // slight sag baked in curve already
      dummy.position.copy(p);
      dummy.rotation.set((Math.random()-0.5)*0.4,(Math.random()-0.5)*0.4,(Math.random()-0.5)*0.5);
      const s=0.8+Math.random()*0.4; dummy.scale.setScalar(s);
      dummy.updateMatrix();
      inst.setMatrixAt(i,dummy.matrix);
      inst.setColorAt(i,color.setHex(mats[i%mats.length].color.getHex()));
    }
    inst.instanceMatrix.needsUpdate=true;
    if(inst.instanceColor) inst.instanceColor.needsUpdate=true;
    return inst;
  }

  const hw=VENUE.mainW/2, hd=VENUE.mainD/2;

  /* ---- Balloon garlands along the food street top line & gate→stage ---- */
  g.add(balloonGarland([
    new THREE.Vector3(-hw+1.2,2.9,-hd*0.42),
    new THREE.Vector3(-hw/2,3.15,-hd*0.42),
    new THREE.Vector3(0,2.95,-hd*0.42),
    new THREE.Vector3(hw/2,3.15,-hd*0.42),
    new THREE.Vector3(hw-1.2,2.9,-hd*0.42)],8));
  g.add(balloonGarland([
    new THREE.Vector3(-hw+1.2,2.8,hd*0.1),
    new THREE.Vector3(0,3.05,hd*0.1),
    new THREE.Vector3(hw-1.2,2.8,hd*0.1)],8));

  /* ---- Red-white triangular bunting across the venue (instanced flags) ---- */
  const flagShape=new THREE.BufferGeometry();
  flagShape.setAttribute('position',new THREE.Float32BufferAttribute(
    [-0.15,0,0, 0.15,0,0, 0,-0.32,0],3));
  flagShape.computeVertexNormals();
  const buntLines=[
    [[-hw+0.6,3.4,-hd+2.2],[hw-0.6,3.4,-hd+2.2]],
    [[-hw+0.6,3.3,0.2],[hw-0.6,3.3,0.2]],
    [[-hw+0.6,3.5,hd-2.6],[hw-0.6,3.5,hd-2.6]],
    [[-hw+0.6,3.2,-hd+2.2],[-hw+0.6,3.2,hd-2.6]],
    [[hw-0.6,3.2,-hd+2.2],[hw-0.6,3.2,hd-2.6]]
  ];
  buntLines.forEach(([a,b],li)=>{
    const A=new THREE.Vector3(...a), B=new THREE.Vector3(...b);
    const n=Math.floor(A.distanceTo(B)/0.55);
    const instR=new THREE.InstancedMesh(flagShape,new THREE.MeshStandardMaterial({color:COLORS.red,side:THREE.DoubleSide,roughness:0.8}),Math.ceil(n/2));
    const instW=new THREE.InstancedMesh(flagShape,new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide,roughness:0.8}),Math.floor(n/2));
    const dummy=new THREE.Object3D();
    let ri=0,wi=0;
    for(let i=0;i<n;i++){
      const t=i/(n-1);
      const p=A.clone().lerp(B,t);
      p.y -= Math.sin(t*Math.PI)*0.35;
      dummy.position.copy(p);
      dummy.rotation.y = (A.z===B.z)?0:Math.PI/2;
      dummy.updateMatrix();
      if(i%2===0) instR.setMatrixAt(ri++,dummy.matrix);
      else instW.setMatrixAt(wi++,dummy.matrix);
    }
    instR.instanceMatrix.needsUpdate=true; instW.instanceMatrix.needsUpdate=true;
    g.add(instR,instW);
    // rope
    const ropePts=[];
    for(let i=0;i<=20;i++){
      const t=i/20;
      const p=A.clone().lerp(B,t); p.y-=Math.sin(t*Math.PI)*0.35;
      ropePts.push(p);
    }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ropePts),
      new THREE.LineBasicMaterial({color:0xd8cdbb})));
  });

  /* ---- Warm string lights on poles down the promenade edges ---- */
  const poleGeo=new THREE.CylinderGeometry(0.04,0.05,3.2,8);
  const poles=[];
  [-1,1].forEach(s=>{
    for(let i=0;i<4;i++){
      const p=new THREE.Mesh(poleGeo,MAT.darkSteel);
      p.position.set(s*3.0,1.6,-hd+3+i*((hd*2-6)/3));
      p.castShadow=true; g.add(p); poles.push(p.position.clone());
    }
  });
  // catenary strings between adjacent poles each side with bulbs
  const bulbGeo=new THREE.SphereGeometry(0.035,6,6);
  const stringMat=MAT.bulbWarmOn;
  [-1,1].forEach(s=>{
    for(let i=0;i<3;i++){
      const a=new THREE.Vector3(s*3.0,3.1,-hd+3+i*((hd*2-6)/3));
      const b=new THREE.Vector3(s*3.0,3.1,-hd+3+(i+1)*((hd*2-6)/3));
      const pts=[];
      for(let j=0;j<=12;j++){
        const t=j/12;
        const p=a.clone().lerp(b,t);
        p.y-=Math.sin(t*Math.PI)*0.45;
        pts.push(p);
      }
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({color:0x4a4038})));
      for(let j=1;j<12;j+=2){
        const bl=new THREE.Mesh(bulbGeo,stringMat);
        bl.position.copy(pts[j]); g.add(bl);
      }
    }
  });

  /* ---- Decorative flags on short poles near rides & zones ---- */
  const flagPoleGeo=new THREE.CylinderGeometry(0.025,0.03,2.2,6);
  const flagQuad=new THREE.PlaneGeometry(0.5,0.32);
  const flagCols=[COLORS.red,COLORS.white,COLORS.gold];
  [[-hw+1.4,hd-1.2],[hw-1.4,hd-1.2]].forEach(([x,z],i)=>{
    const fp=new THREE.Mesh(flagPoleGeo,MAT.steel);
    fp.position.set(x,1.1,z); g.add(fp);
    const fl=new THREE.Mesh(flagQuad,new THREE.MeshStandardMaterial({
      map:makeSignTexture({w:256,h:170,bg:flagCols[i%3]===COLORS.red?'#9e1b23':'#ffffff',
        border:'#9e1b23',lines:[{text:'DH',size:80,color:flagCols[i%3]===COLORS.red?'#fff':'#9e1b23'}]}),
      side:THREE.DoubleSide,roughness:0.85}));
    fl.position.set(x+0.27,2.0,z); g.add(fl);
  });

  /* ---- Potted plants sprinkled at zone corners ---- */
  const potGeo=new THREE.CylinderGeometry(0.18,0.14,0.3,10);
  const bushGeo=new THREE.SphereGeometry(0.24,8,6);
  const bushMat=new THREE.MeshStandardMaterial({color:0x4c7a3a,roughness:0.9});
  const potMat=new THREE.MeshStandardMaterial({color:0xb0573a,roughness:0.8});
  [[-hw+0.9,-hd+3.4],[hw-0.9,-hd+3.4],[-hw+0.9,2.2],[hw-0.9,2.2],[0.5,hd-0.9],[-0.5,hd-0.9]].forEach(([x,z])=>{
    const pot=new THREE.Mesh(potGeo,potMat); pot.position.set(x,0.15,z); pot.castShadow=true;
    const bush=new THREE.Mesh(bushGeo,bushMat); bush.position.set(x,0.5,z); bush.castShadow=true;
    bush.scale.set(1,1.25,1);
    g.add(pot,bush);
  });

  /* ---- Directional boards (matching style) ---- */
  function dirBoard(text, x,z, rotY, target){
    const b=new THREE.Group();
    const board=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.4),
      new THREE.MeshBasicMaterial({map:makeSignTexture({w:600,h:160,bgGrad:['#c62828','#7a141a'],border:'#fff',
        lines:[{text:`${text}  →`,size:52,color:'#fff'}]}),side:THREE.DoubleSide}));
    board.position.y=1.7; b.add(board);
    const post=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.05,1.7,8),MAT.darkSteel);
    post.position.y=0.85; b.add(post);
    b.position.set(x,0,z); b.rotation.y=rotY;
    b.userData.info={name:`DIRECTION BOARD — ${text}`,use:'Wayfinding signage',
      dims:'1.5 m × 0.4 panel',footprint:'~0.5 m²',note:'Coordinated red-white style; points toward '+target+'.'};
    g.add(b);
  }
  dirBoard('FOOD STREET', -2.6, -hd+3.6, 0.3, 'food street (left row)');
  dirBoard('GAMES STREET', 2.6, -hd+3.6, -0.3, 'games street (right row)');
  dirBoard('RIDE ZONE', -2.6, hd-2.2, 0.2, 'rides ahead / extension');
  dirBoard('MAIN STAGE', 2.6, hd-2.2, -0.2, 'main stage');

  /* ---- Photo-op balloon columns near photo wall ---- */
  [[-4.2-2.2,-2.9],[-4.2+2.2,-2.9]].forEach(([x,z])=>{
    for(let i=0;i<7;i++){
      const m=new THREE.Mesh(bGeo,bmats[(i+x>0?1:0)%bmats.length]);
      m.position.set(x+(Math.random()-0.5)*0.3, 0.2+i*0.36, z+(Math.random()-0.5)*0.3);
      g.add(m);
    }
  });

  return g;
}
