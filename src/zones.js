/* ============================================================
 * zones.js — Main stage, science/art zone, photo wall, seating,
 * support facilities (water point, first aid, event desk, bins,
 * emergency route & exit markers), sponsor boards.
 * ============================================================ */
import * as THREE from 'three';
import { EVENT, STAGE, PHOTO_WALL, COLORS } from './config.js';
import { MAT } from './materials.js';
import { makeSignTexture, makePosterTexture, balloonMaterials } from './textures.js';

/* ---------------- MAIN STAGE ---------------- */
export function buildStage(registry){
  const g=new THREE.Group(); g.name='main-stage';
  const {w,d,h}=STAGE;
  // platform + modular panels
  const plat=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),MAT.charcoal);
  plat.position.y=h/2; plat.castShadow=true; plat.receiveShadow=true; g.add(plat);
  // front modular panel strips (red)
  for(let i=0;i<6;i++){
    const p=new THREE.Mesh(new THREE.BoxGeometry(w/6-0.06,h-0.15,0.06),i%2?MAT.redDark:MAT.red);
    p.position.set(-w/2+w/12+i*w/6, h/2, d/2+0.04); g.add(p);
  }
  // step arrangement
  const step1=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.2,0.5),MAT.charcoalLt);
  step1.position.set(w/2-1.2,0.1,d/2+0.45); g.add(step1);
  const step2=step1.clone(); step2.scale.y=0.55; step2.position.y=0.055; step2.position.z=d/2+0.85; g.add(step2);

  // backdrop: deep-red central + white side panels
  const bdH=2.6, bdY=h+bdH/2;
  const center=new THREE.Mesh(new THREE.BoxGeometry(w*0.62,bdH,0.12),
    new THREE.MeshStandardMaterial({map:makeSignTexture({w:1100,h:460,bg:'#7a141a',border:'#ffffff',borderWidth:12,
      lines:[
        {text:EVENT.school,size:78,color:'#ffffff',spacing:3},
        {text:EVENT.shortTitle,size:64,color:'#ffd98a'},
        {text:EVENT.slogan,size:36,color:'#f5f1ea'}]}),roughness:0.6}));
  center.position.set(0,bdY,-d/2+0.1); center.castShadow=true; g.add(center);
  [-1,1].forEach(s=>{
    const side=new THREE.Mesh(new THREE.BoxGeometry(w*0.18,bdH,0.1),MAT.white);
    side.position.set(s*(w*0.40),bdY,-d/2+0.1); g.add(side);
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(w*0.18,bdH*0.28,0.11),MAT.redBright);
    stripe.position.set(s*(w*0.40),bdY-bdH*0.3,-d/2+0.1); g.add(stripe);
  });
  // top valance with date
  const val=new THREE.Mesh(new THREE.PlaneGeometry(w*0.9,0.34),
    new THREE.MeshBasicMaterial({map:makeSignTexture({w:1000,h:120,bg:'#9e1b23',
      lines:[{text:`★  ${EVENT.date}  •  ${EVENT.village}  ★`,size:56,color:'#fff'}]})}));
  val.position.set(0,h+bdH+0.2,-d/2+0.12); g.add(val);

  // microphone stand
  const micPole=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.03,1.35,8),MAT.charcoal);
  micPole.position.set(0,h+0.68,0.2); g.add(micPole);
  const micBase=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.18,0.03,12),MAT.charcoal);
  micBase.position.set(0,h+0.02,0.2); g.add(micBase);
  const mic=new THREE.Mesh(new THREE.SphereGeometry(0.045,8,8),MAT.darkSteel);
  mic.position.set(0,h+1.38,0.28); g.add(mic);
  const boom=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.3,6),MAT.charcoal);
  boom.rotation.x=Math.PI/3; boom.position.set(0,h+1.3,0.24); g.add(boom);

  // two speaker stacks
  [-1,1].forEach(s=>{
    const stack=new THREE.Group();
    const big=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.75,0.4),MAT.charcoal);
    big.position.y=0.38; stack.add(big);
    const cone=new THREE.Mesh(new THREE.CircleGeometry(0.16,14),MAT.charcoalLt);
    cone.position.set(0,0.45,0.21); stack.add(cone);
    const small=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.4,0.32),MAT.charcoal);
    small.position.y=0.95; stack.add(small);
    const poleM=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.2,6),MAT.steel);
    poleM.position.y=0.76; stack.add(poleM);
    stack.position.set(s*(w/2-0.55),h,-0.4);
    stack.traverse(o=>{if(o.isMesh)o.castShadow=true;});
    g.add(stack);
  });

  // decorative side lighting (up-lights) + warm truss points
  [-1,1].forEach(s=>{
    const l=new THREE.PointLight(0xff9d6b,4,7,2);
    l.position.set(s*(w/2+0.4),h+1.6,0.6);
    registry.addLight(l); g.add(l);
    const fixture=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.12,0.2,8),MAT.redBright);
    fixture.position.copy(l.position); g.add(fixture);
  });
  const wash=new THREE.PointLight(0xfff0d0,5,9,2);
  wash.position.set(0,h+2.4,1.8); registry.addLight(wash); g.add(wash);

  // clear front performance area marker strip
  const apron=new THREE.Mesh(new THREE.PlaneGeometry(w,1.4),
    new THREE.MeshStandardMaterial({color:0x9a9284,roughness:0.9}));
  apron.rotation.x=-Math.PI/2;
  apron.position.set(0,0.015,d/2+0.8);
  g.add(apron);

  g.userData.info={name:'MAIN STAGE',use:'Opening ceremony, performances, prize distribution',
    dims:`≈ ${w} m × ${d} m platform (editable)`,footprint:'+ audience clearance in front',
    note:'Compact event stage concept. Sound & rigging to be checked on site.'};
  return g;
}

/* ---------------- SCIENCE • ART • CREATIVITY ZONE ---------------- */
export function buildScienceZone(){
  const g=new THREE.Group(); g.name='science-zone';

  // overhead banner arch
  const bannerPts=[];
  for(let i=0;i<=24;i++){
    const t=i/24;
    bannerPts.push(new THREE.Vector3(-3+t*6, 2.6+Math.sin(t*Math.PI)*0.35, 0));
  }
  const banner=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bannerPts),24,0.035,6),MAT.redBright);
  g.add(banner);
  const bTxt=new THREE.Mesh(new THREE.PlaneGeometry(4.6,0.62),
    new THREE.MeshBasicMaterial({map:makeSignTexture({w:1000,h:140,bgGrad:['#c62828','#7a141a'],border:'#fff',
      lines:[{text:'SCIENCE • ART • CREATIVITY',size:60,color:'#fff'},{text:'DISCOVER SOMETHING NEW',size:34,color:'#ffd98a'}]}),side:THREE.DoubleSide}));
  bTxt.position.set(0,2.45,0.06); g.add(bTxt);

  // display table helper with coordinated cover
  function table(x,z,rotY=0){
    const t=new THREE.Group();
    const top=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.06,0.8),MAT.offWhite);
    top.position.y=0.78; t.add(top);
    const cloth=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.7,0.72),MAT.red);
    cloth.position.y=0.42; t.add(cloth);
    [[-0.8,-0.35],[0.8,-0.35],[-0.8,0.35],[0.8,0.35]].forEach(([dx,dz])=>{
      const l=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.75,6),MAT.steel);
      l.position.set(dx,0.38,dz); t.add(l);
    });
    t.position.set(x,0,z); t.rotation.y=rotY;
    t.traverse(o=>{if(o.isMesh)o.castShadow=true;});
    return t;
  }
  g.add(table(-2.2,1.6),table(0,1.6),table(2.2,1.6));

  // 1) Solar system model
  const sys=new THREE.Group();
  const sunMat=new THREE.MeshStandardMaterial({color:0xffcf5a,emissive:0xffa64a,emissiveIntensity:1.4});
  const sun=new THREE.Mesh(new THREE.SphereGeometry(0.12,12,10),sunMat);
  sys.add(sun);
  const planetCols=[0xb98c5a,0xe8c06a,0x4f8fd0,0xc65a3a,0xd8b47a,0xe0cf9a];
  for(let i=0;i<6;i++){
    const r=0.22+i*0.075;
    const ring=new THREE.Mesh(new THREE.TorusGeometry(r,0.004,6,32),MAT.charcoalLt);
    ring.rotation.x=Math.PI/2; sys.add(ring);
    const pl=new THREE.Mesh(new THREE.SphereGeometry(0.028+i*0.004,8,8),
      new THREE.MeshStandardMaterial({color:planetCols[i],roughness:0.6}));
    const a=i*1.3;
    pl.position.set(Math.cos(a)*r,0,Math.sin(a)*r); sys.add(pl);
  }
  const sysStand=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.5,6),MAT.steel);
  sysStand.position.y=-0.25; sys.add(sysStand);
  sys.position.set(-2.2,1.35,1.6); g.add(sys);
  sys.userData.spin=true;

  // 2) Solar energy demonstration — mini panel on stand + bulb
  const pv=new THREE.Group();
  const panel=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.03,0.5),
    new THREE.MeshStandardMaterial({color:0x1c2f52,roughness:0.25,metalness:0.4}));
  panel.rotation.x=-0.5; pv.add(panel);
  for(let i=0;i<3;i++)for(let j=0;j<4;j++){
    const cell=new THREE.Mesh(new THREE.PlaneGeometry(0.14,0.1),
      new THREE.MeshStandardMaterial({color:0x2f4f8f,roughness:0.2,metalness:0.5}));
    cell.rotation.x=-0.5-Math.PI/2+Math.PI/2; cell.rotation.x=-Math.PI/2-0.5+Math.PI; // face up-ish
    cell.rotation.x=-0.5; cell.position.set(-0.21+j*0.14,0.021+ (2-j)*0.006,-0.14+i*0.1);
    pv.add(cell);
  }
  const pvStand=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.03,0.4,6),MAT.darkSteel);
  pvStand.position.y=-0.2; pv.add(pvStand);
  const pvBulb=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,8),
    new THREE.MeshStandardMaterial({color:0xfff3b0,emissive:0xffdf70,emissiveIntensity:1.2}));
  pvBulb.position.set(0.45,-0.1,0.1); pv.add(pvBulb);
  pv.position.set(0,1.25,1.6); g.add(pv);

  // 3) Physics experiment — balance scale
  const bal=new THREE.Group();
  const bPost=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.03,0.5,6),MAT.wood);
  bPost.position.y=0.25; bal.add(bPost);
  const beam=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.02,0.04),MAT.woodLight);
  beam.position.y=0.5; beam.rotation.z=0.12; bal.add(beam);
  [-0.3,0.3].forEach((dx,i)=>{
    const pan=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.02,10),MAT.steel);
    pan.position.set(dx,0.44-(i?0.07:-0.07)*0.4,0); bal.add(pan);
    const str=new THREE.Mesh(new THREE.CylinderGeometry(0.004,0.004,0.08,4),MAT.charcoalLt);
    str.position.set(dx,0.48,0); bal.add(str);
  });
  bal.position.set(2.2,1.1,1.6); g.add(bal);

  // 4) Student-built engineering model — bridge truss
  const br=new THREE.Group();
  const deckB=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.03,0.25),MAT.wood);
  br.add(deckB);
  [-1,1].forEach(zs=>{
    for(let i=0;i<4;i++){
      const x=-0.36+i*0.24;
      const vert=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.22,0.02),MAT.woodLight);
      vert.position.set(x,0.12,zs*0.11); br.add(vert);
      const diag=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.28,0.02),MAT.woodLight);
      diag.position.set(x+0.12,0.12,zs*0.11); diag.rotation.z=0.8*(i%2?1:-1); br.add(diag);
    }
  });
  br.position.set(-2.2,1.05,-0.6); g.add(br);

  // vertical exhibition boards with posters
  const posters=[
    ['SOLAR SYSTEM','Planets & orbits',COLORS.blue,'#f5f1ea','🪐'],
    ['GREEN ENERGY','Solar power demo',COLORS.green,'#f5f1ea','☀'],
    ['FORCE & MOTION','Physics experiments',COLORS.red,'#f5f1ea','⚖'],
    ['MY BRIDGE','Student engineering',COLORS.charcoal,'#ffd98a','🌉'],
    ['ART GALLERY','Student artwork',COLORS.pink,'#f5f1ea','🎨']
  ];
  posters.forEach((p,i)=>{
    const board=new THREE.Group();
    const sheet=new THREE.Mesh(new THREE.PlaneGeometry(0.75,1.0),
      new THREE.MeshBasicMaterial({map:makePosterTexture(p[0],p[1],p[2],p[3],p[4]),side:THREE.DoubleSide}));
    sheet.position.y=1.35; board.add(sheet);
    const frame=new THREE.Mesh(new THREE.BoxGeometry(0.82,1.08,0.03),MAT.white);
    frame.position.y=1.35; frame.position.z=-0.02; board.add(frame);
    [-0.32,0.32].forEach(dx=>{
      const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,1.8,6),MAT.steel);
      leg.position.set(dx,0.9,-0.05); board.add(leg);
    });
    board.position.set(-3.4+i*1.7, 0, -1.4);
    board.rotation.y = (i-2)*0.12;
    g.add(board);
  });

  // student artwork on easel + crafts table
  const easel=new THREE.Group();
  const canvasArt=new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.5),
    new THREE.MeshBasicMaterial({map:makeSignTexture({w:300,h:250,bg:'#fdf6e3',
      lines:[{text:'🏫 ☀ 🌳',size:70,color:'#333'},{text:'MY SCHOOL',size:34,color:'#9e1b23'}]})}));
  canvasArt.position.y=1.0; easel.add(canvasArt);
  [-0.25,0.25].forEach(dx=>{
    const l=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,1.3,6),MAT.wood);
    l.position.set(dx,0.65,-0.05); l.rotation.x=0.12; easel.add(l);
  });
  easel.position.set(2.2,0,-0.6); g.add(easel);

  // handmade crafts on second-row table
  const craftT=table(0,-0.6);
  const cols=[COLORS.red,COLORS.yellow,COLORS.skyBlue,COLORS.green];
  for(let i=0;i<5;i++){
    const pot=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.07,0.12,8),
      new THREE.MeshStandardMaterial({color:cols[i%4],roughness:0.6}));
    pot.position.set(-0.6+i*0.3,0.9,-0.6); g.add(pot);
  }
  g.add(craftT);

  g.userData.info={name:'SCIENCE • ART • CREATIVITY ZONE',use:'Educational exhibition — student projects',
    dims:'≈ 7 m × 4 m zone (editable)',footprint:'Banner arch + 3 tables + poster boards',
    note:'School-operated educational area. Exhibits rotate by class groups.'};
  return g;
}

/* ---------------- FAMILY PHOTO WALL ---------------- */
export function buildPhotoWall(){
  const g=new THREE.Group(); g.name='photo-wall';
  const {w,h}=PHOTO_WALL;
  const wall=new THREE.Mesh(new THREE.BoxGeometry(w,h,0.15),
    new THREE.MeshStandardMaterial({map:makeSignTexture({w:Math.round(w*280),h:Math.round(h*280),
      bg:'#9e1b23',border:'#ffffff',borderWidth:22,borderInset:26,
      lines:[
        {text:'I',size:120,color:'#ffffff'},
        {text:'♥',size:150,color:'#ff5a5f'},
        {text:'DAR-UL-HIKMAH',size:120,color:'#ffffff',spacing:6},
        {text:EVENT.shortTitle,size:74,color:'#ffd98a'},
        {text:EVENT.village,size:64,color:'#f5f1ea'}]}),roughness:0.6}));
  wall.position.y=h/2; wall.castShadow=true;
  wall.userData.info={name:'FAMILY PHOTO WALL',use:'Branded photo moment for families',
    dims:`≈ ${w} m × ${h} m (site feasibility permitting)`,footprint:'~4 m × 2.5 m incl. balloon decor',
    note:'Deep-red backdrop, high-contrast white text, gold accents.'};
  g.add(wall);
  // gold accent line
  const gl=new THREE.Mesh(new THREE.BoxGeometry(w,0.06,0.17),MAT.gold);
  gl.position.y=h-0.25; g.add(gl);
  // balloon garland along top edge
  const bm=balloonMaterials();
  const bGeo=new THREE.SphereGeometry(0.13,10,8); bGeo.scale(1,1.22,1);
  for(let i=0;i<16;i++){
    const b=new THREE.Mesh(bGeo,bm[(i+ (i%2))%bm.length]);
    b.position.set(-w/2+0.15+i*(w-0.3)/15, h+0.15+Math.sin(i*0.9)*0.08, 0.12);
    g.add(b);
  }
  // corner clusters
  [[-w/2-0.2,h*0.5],[w/2+0.2,h*0.5]].forEach(([cx,cy])=>{
    for(let i=0;i<8;i++){
      const b=new THREE.Mesh(bGeo,bm[i%bm.length]);
      b.position.set(cx+(Math.random()-0.5)*0.5, cy+(Math.random()-0.5)*0.8, 0.1);
      g.add(b);
    }
  });
  // legs / support behind
  [-1,1].forEach(s=>{
    const leg=new THREE.Mesh(new THREE.BoxGeometry(0.12,h,0.12),MAT.darkSteel);
    leg.position.set(s*(w/2-0.3),h/2,-0.25); leg.rotation.x=0.12; g.add(leg);
  });
  return g;
}

/* ---------------- SUPPORT FACILITIES ---------------- */
export function buildSupportFacilities(){
  const grp=new THREE.Group(); grp.name='support';

  // Family seating zone: lightweight chairs + tables with covers
  const seatZone=new THREE.Group();
  for(let r=0;r<2;r++)for(let c=0;c<3;c++){
    const x=-1.2+c*1.2, z=r*1.4;
    const tbl=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.45,0.04,14),MAT.offWhite);
    const tl=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.04,0.72,8),MAT.steel);
    tbl.position.set(x,0.74,z); tl.position.set(x,0.36,z);
    seatZone.add(tbl,tl);
    // table runner decoration
    const runner=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.012,0.16),MAT.red);
    runner.position.set(x,0.77,z); seatZone.add(runner);
    [-0.75,0.75].forEach(dx=>{
      const ch=new THREE.Group();
      const s=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.05,0.4),MAT.plasticRed);
      s.position.y=0.44; ch.add(s);
      const b=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.45,0.05),MAT.plasticRed);
      b.position.set(0,0.66,-0.18); ch.add(b);
      [[-0.16,-0.16],[0.16,-0.16],[-0.16,0.16],[0.16,0.16]].forEach(([lx,lz])=>{
        const l=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.42,5),MAT.steel);
        l.position.set(lx,0.21,lz); ch.add(l);
      });
      ch.position.set(x+dx,0,z); ch.rotation.y=dx<0?Math.PI/2:-Math.PI/2;
      ch.traverse(o=>{if(o.isMesh)o.castShadow=true;});
      seatZone.add(ch);
    });
  }
  seatZone.userData.info={name:'FAMILY SEATING ZONE',use:'Rest area with chairs & tables',
    dims:'≈ 4 m × 3.5 m (editable)',footprint:'6 tables × 2 chairs',note:'Clean table covers, subtle decorations.'};
  grp.add(seatZone);

  // Drinking water point
  const water=new THREE.Group();
  const wtable=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.05,0.7),MAT.white);
  wtable.position.y=0.85; water.add(wtable);
  [[-0.6,-0.3],[0.6,-0.3],[-0.6,0.3],[0.6,0.3]].forEach(([x,z])=>{
    const l=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.85,6),MAT.steel);
    l.position.set(x,0.42,z); water.add(l);
  });
  const cooler=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.55,0.5),MAT.skyBlue);
  cooler.position.set(-0.3,1.15,0); water.add(cooler);
  const coolLid=new THREE.Mesh(new THREE.BoxGeometry(0.64,0.05,0.54),MAT.white);
  coolLid.position.set(-0.3,1.45,0); water.add(coolLid);
  for(let i=0;i<4;i++){
    const bt=new THREE.Mesh(new THREE.CylinderGeometry(0.028,0.03,0.17,8),MAT.waterBottle);
    bt.position.set(0.25+i*0.08,1.0,0.1); water.add(bt);
  }
  const wSign=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.3),
    new THREE.MeshBasicMaterial({map:makeSignTexture({w:420,h:140,bg:'#2f6fb3',border:'#fff',
      lines:[{text:'DRINKING WATER',size:52,color:'#fff'}]}),side:THREE.DoubleSide}));
  wSign.position.set(0,1.75,0); water.add(wSign);
  water.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  water.userData.info={name:'DRINKING WATER POINT',use:'Free drinking water for visitors',
    dims:'1.4 m counter',footprint:'~2 m²',note:'Bottled water + cooler; keep aisle clear.'};
  grp.add(water);

  // First aid point
  const fa=new THREE.Group();
  const faTable=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.05,0.6),MAT.white);
  faTable.position.y=0.85; fa.add(faTable);
  [[-0.5,-0.25],[0.5,-0.25],[-0.5,0.25],[0.5,0.25]].forEach(([x,z])=>{
    const l=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.85,6),MAT.steel);
    l.position.set(x,0.42,z); fa.add(l);
  });
  const box=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.3,0.25),MAT.white);
  box.position.set(0,1.05,0); fa.add(box);
  const crossV=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.2,0.26),new THREE.MeshStandardMaterial({color:0xd03030,roughness:0.5}));
  crossV.position.set(0,1.05,0.005); fa.add(crossV);
  const crossH=crossV.clone(); crossH.rotation.y=Math.PI/2; fa.add(crossH);
  const faFlag=new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.5),
    new THREE.MeshBasicMaterial({map:makeSignTexture({w:360,h:220,bg:'#ffffff',border:'#d03030',borderWidth:12,
      lines:[{text:'✚ FIRST AID',size:56,color:'#d03030'}]}),side:THREE.DoubleSide}));
  faFlag.position.set(0,1.8,0); fa.add(faFlag);
  const flagPole=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,1.8,6),MAT.steel);
  flagPole.position.set(0.45,0.9,0); fa.add(flagPole);
  fa.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  fa.userData.info={name:'FIRST AID POINT',use:'Basic medical assistance station',
    dims:'1.2 m table + signage',footprint:'~3 m²',note:'Staffed by trained volunteer; phone numbers posted.'};
  grp.add(fa);

  // Event management desk
  const em=new THREE.Group();
  const emDesk=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.9,0.7),MAT.charcoal);
  emDesk.position.y=0.45; em.add(emDesk);
  const emTop=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.06,0.8),MAT.white);
  emTop.position.y=0.93; em.add(emTop);
  const emFront=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.35),
    new THREE.MeshBasicMaterial({map:makeSignTexture({w:640,h:150,bgGrad:['#c62828','#7a141a'],border:'#fff',
      lines:[{text:'EVENT MANAGEMENT',size:52,color:'#fff'}]}),side:THREE.DoubleSide}));
  emFront.position.set(0,0.55,0.36); em.add(emFront);
  em.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  em.userData.info={name:'EVENT MANAGEMENT DESK',use:'Coordination, lost & found, announcements',
    dims:'1.6 m desk',footprint:'~3 m²',note:'School event team position near the stage.'};
  grp.add(em);

  // Waste bins set
  const bins=new THREE.Group();
  [0xd03030,0x3f9d5a].forEach((c,i)=>{
    const bin=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.16,0.55,10),
      new THREE.MeshStandardMaterial({color:c,roughness:0.6}));
    bin.position.set(i*0.5,0.28,0); bins.add(bin);
    const lid=new THREE.Mesh(new THREE.CylinderGeometry(0.21,0.21,0.05,10),MAT.charcoal);
    lid.position.set(i*0.5,0.58,0); bins.add(lid);
  });
  bins.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  bins.userData.info={name:'WASTE BINS',use:'Segregated waste collection points',
    dims:'2 × 40 L bins',footprint:'~1 m²',note:'Placed near food street & seating; multiple sets around venue.'};
  grp.add(bins);

  // Sponsor sign positions (designated placeholders)
  const sponsors=new THREE.Group(); sponsors.name='sponsor-boards';
  for(let i=0;i<3;i++){
    const sb=new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.7),
      new THREE.MeshBasicMaterial({map:makeSignTexture({w:640,h:280,bg:'#ffffff',border:'#2b2b2e',borderWidth:10,
        lines:[{text:'SPONSOR SPACE',size:44,color:'#2b2b2e'},{text:'YOUR BRAND HERE',size:30,color:'#9e1b23'}]}),side:THREE.DoubleSide}));
    sb.position.set(-2+i*2,1.1,0);
    sponsors.add(sb);
    [-0.7,0.7].forEach(dx=>{
      const l=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1.1,6),MAT.darkSteel);
      l.position.set(-2+i*2+dx,0.55,0); sponsors.add(l);
    });
  }
  sponsors.userData.info={name:'SPONSOR SIGNAGE POSITIONS',use:'Designated brand visibility spots',
    dims:'1.6 m × 0.7 m boards',footprint:'Along main promenade',note:'Placement subject to sponsorship agreement. No logos assumed.'};
  grp.add(sponsors);

  return grp;
}

/* ---------------- EMERGENCY ROUTE & EXIT MARKERS ---------------- */
export function buildEmergencyRoute(){
  const g=new THREE.Group(); g.name='emergency-route';
  // conceptual route: from stage area down right side to gate
  const pts=[new THREE.Vector3(4.2,0.06,-2),
             new THREE.Vector3(4.2,0.06,-6),
             new THREE.Vector3(2.5,0.06,-8.5),
             new THREE.Vector3(0.8,0.06,-9.6)];
  const curve=new THREE.CatmullRomCurve3(pts);
  const geo=new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
  const line=new THREE.Line(geo,new THREE.LineDashedMaterial({color:0x35c04a,dashSize:0.4,gapSize:0.22}));
  line.computeLineDistances(); g.add(line);
  // EXIT marker at end
  const ex=new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.34),
    new THREE.MeshBasicMaterial({map:makeSignTexture({w:360,h:150,bg:'#1f9d3a',border:'#fff',
      lines:[{text:'EXIT →',size:60,color:'#fff'}]}),side:THREE.DoubleSide}));
  const exPole=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,2.2,6),MAT.steel);
  exPole.position.set(0.8,1.1,-9.6); g.add(exPole);
  ex.position.set(0.8,2.15,-9.6); ex.rotation.y=Math.PI; g.add(ex);
  // start marker
  const st=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.3),
    new THREE.MeshBasicMaterial({map:makeSignTexture({w:420,h:140,bg:'#1f9d3a',
      lines:[{text:'EMERGENCY ROUTE',size:44,color:'#fff'}]}),side:THREE.DoubleSide}));
  st.position.set(4.2,1.6,-2); st.rotation.y=-Math.PI/2; g.add(st);
  g.userData.info={name:'EMERGENCY ROUTE (CONCEPTUAL)',use:'Designated clear exit path illustration',
    dims:'≈ 1.2 m wide corridor',footprint:'Right-side corridor to gate',
    note:'Conceptual planning illustration only — final routes require an actual safety assessment.'};
  return g;
}
