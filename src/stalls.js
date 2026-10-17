/* ============================================================
 * stalls.js — Reusable food & game stall builders.
 * Consistent canopy height / fascia style / counter material,
 * with per-stall food or game props modeled in 3D.
 * ============================================================ */
import * as THREE from 'three';
import { COLORS } from './config.js';
import { MAT } from './materials.js';
import { makeSignTexture, makeStripeTexture, makeMenuTexture } from './textures.js';

const STALL_W = 2.0, STALL_D = 1.6, COUNTER_H = 0.95, CANOPY_H = 2.3;

/* ---------- shared sub-builders ---------- */
function canopyStyle(kind){
  switch(kind){
    case 'red-white':       return {tex:makeStripeTexture(COLORS.red,COLORS.white,6), valance:COLORS.white};
    case 'white-crimson':   return {tex:makeStripeTexture(COLORS.white,COLORS.redBright,6), valance:COLORS.redBright};
    case 'striped-rw':      return {tex:makeStripeTexture(COLORS.redBright,COLORS.white,8), valance:COLORS.red};
    case 'white-red-valance':return {tex:makeStripeTexture(COLORS.white,COLORS.offWhite,4), valance:COLORS.red};
    case 'striped-multi':   return {tex:makeStripeTexture(COLORS.yellow,COLORS.redBright,7), valance:COLORS.white};
    case 'white-elegant':   return {tex:makeStripeTexture(COLORS.white,COLORS.ivory,4), valance:COLORS.gold};
    default:                return {tex:makeStripeTexture(COLORS.red,COLORS.white,6), valance:COLORS.white};
  }
}

export function makeStallShell(stall, opts={}){
  const g = new THREE.Group();
  g.name = stall.id;
  const w = opts.w || STALL_W, d = opts.d || STALL_D;

  // posts
  const postGeo = new THREE.CylinderGeometry(0.045,0.05,CANOPY_H,8);
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sz])=>{
    const p=new THREE.Mesh(postGeo,MAT.steel);
    p.position.set(sx*(w/2-0.08),CANOPY_H/2,sz*(d/2-0.08));
    p.castShadow=true; g.add(p);
  });

  // canopy — slightly curved fabric (box with pyramid-ish top)
  const style = canopyStyle(stall.canopy);
  const canMat = new THREE.MeshStandardMaterial({map:style.tex, roughness:0.85, side:THREE.DoubleSide});
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*0.78, 0.5, 4), canMat);
  roof.rotation.y = Math.PI/4;
  roof.position.y = CANOPY_H+0.18;
  roof.scale.set(1,1,(d+0.3)/(w+0.3));
  roof.castShadow = true;
  g.add(roof);
  // eave band + valance
  const eave = new THREE.Mesh(new THREE.BoxGeometry(w+0.36,0.1,d+0.36), MAT.white);
  eave.position.y = CANOPY_H-0.08; g.add(eave);
  const valMat = new THREE.MeshStandardMaterial({color:style.valance, roughness:0.85, side:THREE.DoubleSide});
  const valance = new THREE.Mesh(new THREE.BoxGeometry(w+0.36,0.22,0.03), valMat);
  valance.position.set(0, CANOPY_H-0.22, d/2+0.17); g.add(valance);

  // counter body + white top
  const cBody = new THREE.Mesh(new THREE.BoxGeometry(w, COUNTER_H-0.08, d*0.62), MAT.charcoal);
  cBody.position.set(0, (COUNTER_H-0.08)/2, d*0.14);
  cBody.castShadow = true; g.add(cBody);
  const cTop = new THREE.Mesh(new THREE.BoxGeometry(w+0.1, 0.07, d*0.66), MAT.offWhite);
  cTop.position.set(0, COUNTER_H, d*0.14);
  cTop.castShadow = true; g.add(cTop);
  // coordinated counter front panel (deep red)
  const front = new THREE.Mesh(new THREE.BoxGeometry(w, 0.72, 0.05), MAT.redDark);
  front.position.set(0, 0.5, d*0.14 + d*0.31 + 0.02); g.add(front);

  // fascia sign above counter
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(w*0.96, 0.42),
    new THREE.MeshBasicMaterial({map:makeSignTexture({
      w:700,h:150,bg:'#'+ (stall.signColor||COLORS.redDark).toString(16).padStart(6,'0'),
      border:'#ffffff', borderWidth:8,
      lines:[{text:stall.name,size: stall.name.length>22?40:52,color:'#ffffff'}]}),side:THREE.DoubleSide}));
  sign.position.set(0, CANOPY_H-0.55, d/2+0.19);
  g.add(sign);

  // menu board on the right post side
  if (opts.menu){
    const menu = new THREE.Mesh(new THREE.PlaneGeometry(0.55,0.72),
      new THREE.MeshBasicMaterial({map:makeMenuTexture(opts.menuTitle||'MENU',opts.menu),side:THREE.DoubleSide}));
    menu.position.set(-w/2+0.32, 1.55, d/2-0.02);
    g.add(menu);
  }

  // warm overhead light bar + point light
  const bar = new THREE.Mesh(new THREE.BoxGeometry(w*0.8,0.05,0.08), MAT.bulbWarmOn);
  bar.position.set(0, CANOPY_H-0.42, d*0.1);
  g.add(bar);
  const lamp = new THREE.PointLight(0xffc98a, 3.2, 4.5, 2);
  lamp.position.set(0, CANOPY_H-0.5, d*0.25);
  g.add(lamp);
  g.userData.lamps = g.userData.lamps || [];
  g.userData.lamps.push({light:lamp, mat:MAT.bulbWarmOn});

  // rear backdrop panel for depth
  const back = new THREE.Mesh(new THREE.BoxGeometry(w, CANOPY_H-0.6, 0.06), MAT.white);
  back.position.set(0, (CANOPY_H-0.6)/2+0.35, -d/2+0.1);
  g.add(back);

  g.userData.info = { name:stall.name, use:stall.use, dims:stall.dims,
    footprint:`${w} m × ${d} m`, note:stall.note };
  return g;
}

/* ---------- FOOD DISPLAYS ---------- */
function steelTray(w,d){
  const t=new THREE.Mesh(new THREE.CylinderGeometry(w/2,w/2-0.02,d,20),MAT.steel);
  return t;
}
function riceMound(mat, r=0.16){
  const mound=new THREE.Mesh(new THREE.SphereGeometry(r,10,8,0,Math.PI*2,0,Math.PI/2),mat);
  mound.scale.y=0.55;
  return mound;
}
function addGarnish(parent, center, colors, n=8, spread=0.12){
  for(let i=0;i<n;i++){
    const s=new THREE.Mesh(new THREE.SphereGeometry(0.012,6,6),
      new THREE.MeshStandardMaterial({color:colors[i%colors.length],roughness:0.8}));
    s.position.set(center.x+(Math.random()-0.5)*spread*2, center.y+0.01, center.z+(Math.random()-0.5)*spread*2);
    parent.add(s);
  }
}

export function buildFoodStall(stall){
  const menus = {
    'food-biryani':[['Chicken Biryani','Rs. —'],['Beef Pulao','Rs. —'],['Rice Special','Rs. —']],
    'food-pasta':[['Creamy Chicken','Rs. —'],['Spicy Pasta','Rs. —'],['Add Cheese','Rs. —']],
    'food-fries':[['Crispy Fries','Rs. —'],['Masala Fries','Rs. —'],['Nuggets','Rs. —']],
    'food-samosa':[['Samosa (2)','Rs. —'],['Chicken Roll','Rs. —'],['Chaat Plate','Rs. —']],
    'food-popcorn':[['Small Bag','Rs. —'],['Large Bag','Rs. —'],['Family Tub','Rs. —']],
    'food-cotton':[['Candy Floss','Rs. —'],['Rainbow Cone','Rs. —'],['Sweet Stick','Rs. —']],
    'food-dessert':[['Cupcake','Rs. —'],['Brownie','Rs. —'],['Traditional Sweet','Rs. —']],
    'food-drinks':[['Mineral Water','Rs. —'],['Juice Box','Rs. —'],['Soft Drink','Rs. —']]
  };
  const g = makeStallShell(stall,{menu:menus[stall.id]||[['Item','Rs. —']],menuTitle:stall.name.split(' ')[0]});
  const cy = COUNTER_H+0.04, cz = STALL_D*0.14;

  const foods = stall.foods||[];
  if(foods.includes('biryani')){
    [[-0.5,'#f6efdd'],[-0.05,'#e8dfc2'],[0.45,'#f0e6cc']].forEach(([x,c],i)=>{
      const tray=steelTray(0.42,0.14); tray.position.set(x,cy+0.07,cz); g.add(tray);
      const mound=riceMound(new THREE.MeshStandardMaterial({color:c,roughness:0.9}),0.19);
      mound.position.set(x,cy+0.13,cz); g.add(mound);
      addGarnish(g,mound.position,[0x3f7a2f,0xa33b22,0xf2e3b3],10,0.14);
    });
    const ladle=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.4,6),MAT.steel);
    ladle.position.set(0.45,cy+0.28,cz+0.1); ladle.rotation.z=0.5; g.add(ladle);
  }
  if(foods.includes('creamy-chicken')||foods.includes('spicy-chicken')){
    [['#f0dcab',-0.45],['#c2502f',0.1]].forEach(([c,x])=>{
      const tray=steelTray(0.46,0.12); tray.position.set(x,cy+0.06,cz); g.add(tray);
      const pile=new THREE.Mesh(new THREE.SphereGeometry(0.2,12,8,0,Math.PI*2,0,Math.PI/2),
        new THREE.MeshStandardMaterial({color:c,roughness:0.75}));
      pile.scale.set(1,0.5,0.8); pile.position.set(x,cy+0.11,cz); g.add(pile);
      // pasta twists + chicken chunks
      for(let i=0;i<7;i++){
        const t=new THREE.Mesh(new THREE.TorusKnotGeometry(0.028,0.011,24,5),
          new THREE.MeshStandardMaterial({color:c,roughness:0.7}));
        t.position.set(x+(Math.random()-0.5)*0.3, cy+0.16, cz+(Math.random()-0.5)*0.2);
        g.add(t);
      }
      for(let i=0;i<4;i++){
        const ch=new THREE.Mesh(new THREE.IcosahedronGeometry(0.035,0),MAT.chicken);
        ch.position.set(x+(Math.random()-0.5)*0.28, cy+0.18, cz+(Math.random()-0.5)*0.18);
        g.add(ch);
      }
    });
    // ingredient accents
    const bowl=new THREE.Mesh(new THREE.SphereGeometry(0.08,10,8,0,Math.PI*2,0,Math.PI/2),MAT.green);
    bowl.position.set(0.62,cy+0.05,cz); g.add(bowl);
  }
  if(foods.includes('fries')){
    for(let i=0;i<3;i++){
      const x=-0.5+i*0.5;
      const cone=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.06,0.2,10,1,true),MAT.paperTray);
      cone.position.set(x,cy+0.12,cz); g.add(cone);
      for(let j=0;j<9;j++){
        const f=new THREE.Mesh(new THREE.BoxGeometry(0.018,0.16,0.018),MAT.fry);
        f.position.set(x+(Math.random()-0.5)*0.09, cy+0.26+Math.random()*0.05, cz+(Math.random()-0.5)*0.09);
        f.rotation.set((Math.random()-0.5)*0.5,Math.random()*3,(Math.random()-0.5)*0.5);
        g.add(f);
      }
    }
    // condiment cups
    [-0.15,0.15].forEach(dx=>{
      const cup=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.035,0.06,10),
        new THREE.MeshStandardMaterial({color:dx<0?0xc2452a:0xe8d34a,roughness:0.5}));
      cup.position.set(0.62+dx*0.4,cy+0.03,cz+0.25); g.add(cup);
    });
  }
  if(foods.includes('samosa')){
    const tray=steelTray(0.5,0.1); tray.position.set(-0.45,cy+0.05,cz); g.add(tray);
    for(let i=0;i<6;i++){
      const sam=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.13,3),MAT.samosa);
      sam.rotation.x=Math.PI/2; sam.rotation.z=Math.PI/2;
      sam.position.set(-0.62+ (i%3)*0.16, cy+0.12, cz-0.08+Math.floor(i/3)*0.14);
      sam.rotation.set(0.3,0.8,1.2);
      g.add(sam);
    }
  }
  if(foods.includes('rolls')){
    const plate=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.19,0.03,14),MAT.white);
    plate.position.set(0.15,cy+0.03,cz); g.add(plate);
    for(let i=0;i<3;i++){
      const roll=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,0.22,8),MAT.roll);
      roll.rotation.z=Math.PI/2; roll.rotation.y=0.4*i-0.4;
      roll.position.set(0.15,cy+0.08+ (i===2?0.05:0), cz+(i-1)*0.07);
      g.add(roll);
    }
  }
  if(foods.includes('chaat')){
    const bowl=new THREE.Mesh(new THREE.SphereGeometry(0.14,12,8,0,Math.PI*2,0,Math.PI/2),MAT.steel);
    bowl.position.set(0.62,cy+0.02,cz); g.add(bowl);
    const base=new THREE.Mesh(new THREE.SphereGeometry(0.12,10,8,0,Math.PI*2,0,Math.PI/2),MAT.chaat);
    base.position.set(0.62,cy+0.05,cz); g.add(base);
    for(let i=0;i<10;i++){
      const pea=new THREE.Mesh(new THREE.SphereGeometry(0.016,6,6),
        i%2?MAT.chickpea:MAT.potatoCh);
      pea.position.set(0.62+(Math.random()-0.5)*0.16, cy+0.11, cz+(Math.random()-0.5)*0.16);
      g.add(pea);
    }
    [-0.05,0.05].forEach((dz,i)=>{
      const drizzle=new THREE.Mesh(new THREE.SphereGeometry(0.03,8,6),i?MAT.chutneyR:MAT.chutney);
      drizzle.scale.y=0.4; drizzle.position.set(0.62,cy+0.13,cz+dz); g.add(drizzle);
    });
  }
  if(foods.includes('popcorn')){
    // popcorn machine
    const frame=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.55,0.4),MAT.charcoal);
    frame.position.set(-0.45,cy+0.3,cz-0.15); g.add(frame);
    const glassBox=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.4,0.32),MAT.glass);
    glassBox.position.set(-0.45,cy+0.32,cz-0.1); g.add(glassBox);
    for(let i=0;i<16;i++){
      const p=new THREE.Mesh(new THREE.IcosahedronGeometry(0.025,0),MAT.popcorn);
      p.position.set(-0.6+Math.random()*0.3, cy+0.16+Math.random()*0.12, cz-0.2+Math.random()*0.2);
      g.add(p);
    }
    const roofP=new THREE.Mesh(new THREE.BoxGeometry(0.54,0.06,0.44),MAT.redBright);
    roofP.position.set(-0.45,cy+0.6,cz-0.15); g.add(roofP);
    // striped tubs
    [0.25,0.55].forEach((x,i)=>{
      const tub=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.065,0.16,12,1,true),
        new THREE.MeshStandardMaterial({map:makeStripeTexture(i?COLORS.white:COLORS.redBright,i?COLORS.redBright:COLORS.white,5),side:THREE.DoubleSide,roughness:0.8}));
      tub.position.set(x,cy+0.1,cz); g.add(tub);
      for(let j=0;j<8;j++){
        const p=new THREE.Mesh(new THREE.IcosahedronGeometry(0.028,0),MAT.popcorn);
        p.position.set(x+(Math.random()-0.5)*0.1, cy+0.2+Math.random()*0.05, cz+(Math.random()-0.5)*0.1);
        g.add(p);
      }
    });
  }
  if(foods.includes('cotton-candy')){
    // candy machine
    const mach=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.22,16),MAT.steel);
    mach.position.set(-0.55,cy+0.14,cz-0.1); g.add(mach);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(0.17,14,10,0,Math.PI*2,0,Math.PI/2),MAT.glass);
    dome.position.copy(mach.position); dome.position.y=cy+0.24; g.add(dome);
    // fluffy candy cones
    [[0.15,MAT.candyPink],[0.45,MAT.candyBlue],[0.72,MAT.candyWhite]].forEach(([x,m])=>{
      const cone=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.2,10),MAT.paperTray);
      cone.position.set(x,cy+0.12,cz); g.add(cone);
      const fluff=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,1),m);
      fluff.position.set(x,cy+0.3,cz); g.add(fluff);
      const stick=new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.006,0.12,5),MAT.woodLight);
      stick.position.set(x,cy+0.24,cz); g.add(stick);
    });
  }
  if(foods.includes('cupcakes')||foods.includes('brownies')||foods.includes('traditional')){
    // display trays with individual portions
    for(let row=0;row<2;row++){
      const tray=new THREE.Mesh(new THREE.BoxGeometry(0.85,0.03,0.3),MAT.steel);
      tray.position.set(0,cy+0.06+row*0.3,cz-0.02+row*0.06); g.add(tray);
      for(let i=0;i<4;i++){
        const x=-0.32+i*0.21;
        if(row===0){
          const cup=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.04,0.07,10),MAT.redBright);
          cup.position.set(x,cy+0.12,cz-0.02); g.add(cup);
          const top=new THREE.Mesh(new THREE.SphereGeometry(0.055,10,8,0,Math.PI*2,0,Math.PI/2),MAT.cupcake);
          top.position.set(x,cy+0.155,cz-0.02); g.add(top);
          const cherry=new THREE.Mesh(new THREE.SphereGeometry(0.014,6,6),MAT.redBright);
          cherry.position.set(x,cy+0.215,cz-0.02); g.add(cherry);
        } else {
          const br=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.05,0.12),MAT.brownie);
          br.position.set(x,cy+0.47,cz+0.04); g.add(br);
          const glaze=new THREE.Mesh(new THREE.BoxGeometry(0.11,0.012,0.11),
            new THREE.MeshStandardMaterial({color:0x3a1f10,roughness:0.3}));
          glaze.position.set(x,cy+0.5,cz+0.04); g.add(glaze);
        }
      }
    }
    // traditional sweets (barfi) plate
    const plate=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.15,0.02,14),MAT.steel);
    plate.position.set(0.72,cy+0.03,cz+0.15); g.add(plate);
    for(let i=0;i<4;i++){
      const b=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.03,0.07),MAT.sweetGold);
      b.position.set(0.72+(i%2?0.05:-0.05), cy+0.055+(i>1?0.03:0), cz+0.15+(i>1?0.05:-0.05));
      b.rotation.y=Math.random(); g.add(b);
    }
  }
  if(foods.includes('bottled-water')||foods.includes('cooler')){
    // bottled water rows
    for(let i=0;i<6;i++){
      const bt=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.032,0.18,8),MAT.waterBottle);
      bt.position.set(-0.65+i*0.09, cy+0.12, cz-0.12); g.add(bt);
      const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.02,8),MAT.blue);
      cap.position.set(-0.65+i*0.09, cy+0.22, cz-0.12); g.add(cap);
    }
    // insulated cooler
    const cool=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.5,0.45),MAT.skyBlue);
    cool.position.set(0.35,cy+0.28,cz-0.2); cool.castShadow=true; g.add(cool);
    const lid=new THREE.Mesh(new THREE.BoxGeometry(0.58,0.05,0.48),MAT.white);
    lid.position.set(0.35,cy+0.55,cz-0.2); g.add(lid);
    // cups stack + dispenser
    const disp=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.3,12),MAT.plasticRed);
    disp.position.set(-0.2,cy+0.2,cz+0.12); g.add(disp);
    for(let i=0;i<5;i++){
      const c=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.028,0.09,8),MAT.white);
      c.position.set(0.75,cy+0.06+i*0.085,cz+0.2); g.add(c);
    }
    // waste bin nearby (behind stall)
    const bin=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.13,0.4,10),MAT.charcoalLt);
    bin.position.set(0.9,0.2,-0.9); g.add(bin);
  }

  // plate/cutlery organizer for rice stalls
  if(foods.includes('pulao')){
    const org=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.18,0.2),MAT.woodLight);
    org.position.set(0.75,cy+0.1,cz+0.1); g.add(org);
    for(let i=0;i<5;i++){
      const pl=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.045,0.008,10),MAT.white);
      pl.position.set(0.75,cy+0.2+i*0.012,cz+0.1); g.add(pl);
    }
  }

  return g;
}

/* ---------- GAME BOOTHS ---------- */
export function buildGameStall(stall){
  const g = makeStallShell(stall,{});
  const cy=COUNTER_H+0.04, cz=STALL_D*0.14;
  const game = stall.game;

  // prize shelf at rear
  const shelfG=new THREE.Group();
  const board=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.05,0.3),MAT.woodLight);
  board.position.set(0,1.35,-STALL_D/2+0.28); shelfG.add(board);
  const board2=board.clone(); board2.position.y=1.75; shelfG.add(board2);
  const prizeColors=[COLORS.yellow,COLORS.skyBlue,COLORS.pink,COLORS.green,COLORS.redBright];
  for(let i=0;i<6;i++){
    const pr=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.18,0.18),
      new THREE.MeshStandardMaterial({color:prizeColors[i%prizeColors.length],roughness:0.5}));
    pr.position.set(-0.65+i*0.26,1.47,-STALL_D/2+0.28); shelfG.add(pr);
  }
  for(let i=0;i<5;i++){
    const soft=new THREE.Mesh(new THREE.SphereGeometry(0.1,10,8),
      new THREE.MeshStandardMaterial({color:prizeColors[(i+2)%prizeColors.length],roughness:0.9}));
    soft.position.set(-0.55+i*0.28,1.87,-STALL_D/2+0.28); shelfG.add(soft);
  }
  g.add(shelfG);

  if(game==='ring-toss'){
    const table=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.06,0.7),MAT.woodLight);
    table.position.set(0,cy+0.35,cz+0.1); g.add(table);
    const legG=new THREE.CylinderGeometry(0.03,0.03,0.35,6);
    [[-0.6,-0.25],[0.6,-0.25],[-0.6,0.4],[0.6,0.4]].forEach(([x,z])=>{
      const l=new THREE.Mesh(legG,MAT.steel); l.position.set(x,cy+0.17,cz+z); g.add(l);
    });
    // pegs
    for(let i=0;i<5;i++){
      const px=-0.5+i*0.25, pz=cz+0.1+(i%2?0.15:-0.1);
      const peg=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.025,0.3,8),
        new THREE.MeshStandardMaterial({color:i%2?COLORS.redBright:COLORS.skyBlue,roughness:0.4}));
      peg.position.set(px,cy+0.65,pz); g.add(peg);
      const cap=new THREE.Mesh(new THREE.SphereGeometry(0.03,8,8),MAT.gold);
      cap.position.set(px,cy+0.81,pz); g.add(cap);
    }
    // rings
    const ringGeo=new THREE.TorusGeometry(0.07,0.016,8,18);
    for(let i=0;i<6;i++){
      const r=new THREE.Mesh(ringGeo,new THREE.MeshStandardMaterial({
        color:[0xd84040,0x3f8fd0,0xf2c14e][i%3],roughness:0.4}));
      r.rotation.x=Math.PI/2;
      r.position.set(-0.55+i*0.22, cy+0.4, cz+0.5);
      g.add(r);
    }
    // throwing line decal
    const line=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.012,0.05),MAT.white);
    line.position.set(0,0.01,STALL_D/2+0.55); g.add(line);
  }

  if(game==='bottle-knock'){
    // rear target panel
    const panel=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.0,0.05),
      new THREE.MeshStandardMaterial({map:makeSignTexture({w:600,h:400,bg:'#f5f1ea',border:'#9e1b23',
        lines:[{text:'KNOCK THEM',size:64,color:'#9e1b23'},{text:'DOWN!',size:64,color:'#c62828'}]}),roughness:0.7}));
    panel.position.set(0,1.0,-STALL_D/2+0.15); g.add(panel);
    // bottle pyramid 3-2-1
    const bottleGeo=new THREE.CylinderGeometry(0.035,0.045,0.2,8);
    const cols=[0xd84040,0x3f8fd0,0xf2c14e,0x3f9d5a];
    let idx=0;
    [[-0.11,0],[0.11,0],[0,0.22]].forEach(([dx,dy],i)=>{
      const b=new THREE.Mesh(bottleGeo,new THREE.MeshStandardMaterial({color:cols[i%cols.length],roughness:0.35}));
      b.position.set(dx,cy+0.5+dy,cz+0.15); g.add(b);
    });
    [[-0.11,0.44],[0.11,0.44]].forEach(()=>{ /* second tier handled below */ });
    [[0,0.44]].forEach(()=>{});
    const b2=new THREE.Mesh(bottleGeo,new THREE.MeshStandardMaterial({color:cols[3],roughness:0.35}));
    b2.position.set(0,cy+0.5+0.22+0.2,cz+0.15); g.add(b2);
    // soft balls in basket
    const basket=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.12,0.14,10,1,true),MAT.wood);
    basket.position.set(0.6,cy+0.1,cz+0.3); g.add(basket);
    for(let i=0;i<4;i++){
      const ball=new THREE.Mesh(new THREE.SphereGeometry(0.05,10,8),MAT.ballSoft);
      ball.position.set(0.6+(Math.random()-0.5)*0.12,cy+0.18+ (i>2?0.07:0),cz+0.3+(Math.random()-0.5)*0.12);
      g.add(ball);
    }
    const line=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.012,0.05),MAT.white);
    line.position.set(0,0.01,STALL_D/2+0.6); g.add(line);
  }

  if(game==='spin-wheel'){
    // big wheel beside counter
    const wheel=new THREE.Group(); wheel.name='spin-wheel-rot';
    const segCount=10;
    for(let i=0;i<segCount;i++){
      const geo=new THREE.CircleGeometry(0.62, 12, i*Math.PI*2/segCount, Math.PI*2/segCount);
      const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({
        color:[COLORS.red,COLORS.white,COLORS.yellow,COLORS.skyBlue,COLORS.green][i%5],
        side:THREE.DoubleSide,roughness:0.55}));
      wheel.add(m);
    }
    const rim=new THREE.Mesh(new THREE.TorusGeometry(0.64,0.035,10,40),MAT.charcoal);
    wheel.add(rim);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.1,12),MAT.gold);
    hub.rotation.x=Math.PI/2; wheel.add(hub);
    // bulbs around rim
    for(let i=0;i<20;i++){
      const a=i/20*Math.PI*2;
      const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.028,6,6),MAT.bulbWarmOn);
      bulb.position.set(Math.cos(a)*0.64,Math.sin(a)*0.64,0.05);
      wheel.add(bulb);
    }
    wheel.position.set(-0.1,1.55,-STALL_D/2+0.35);
    g.add(wheel);
    // support
    const sup=new THREE.Mesh(new THREE.BoxGeometry(0.12,1.5,0.12),MAT.darkSteel);
    sup.position.set(-0.1,0.75,-STALL_D/2+0.3); g.add(sup);
    // pointer
    const ptr=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.14,6),MAT.redBright);
    ptr.rotation.z=Math.PI; ptr.position.set(-0.1,2.25,-STALL_D/2+0.42); g.add(ptr);
    g.userData.spinWheel = wheel;
  }

  if(game==='cup-stack'){
    const table=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.06,0.7),MAT.offWhite);
    table.position.set(0,cy+0.3,cz+0.1); g.add(table);
    const legG=new THREE.CylinderGeometry(0.03,0.03,0.3,6);
    [[-0.6,-0.2],[0.6,-0.2],[-0.6,0.4],[0.6,0.4]].forEach(([x,z])=>{
      const l=new THREE.Mesh(legG,MAT.steel); l.position.set(x,cy+0.15,cz+z); g.add(l);
    });
    const cupCols=[0xd84040,0x3f8fd0,0xf2c14e,0x3f9d5a,0xffffff];
    // neat stacks
    [[-0.45,3],[-0.1,5],[0.25,4],[0.6,2]].forEach(([x,n],si)=>{
      for(let i=0;i<n;i++){
        const c=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.038,0.09,10),
          new THREE.MeshStandardMaterial({color:cupCols[(si+i)%cupCols.length],roughness:0.4}));
        c.position.set(x,cy+0.38+i*0.085,cz+0.1); g.add(c);
      }
    });
    // timer board
    const timer=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.26),
      new THREE.MeshBasicMaterial({map:makeSignTexture({w:300,h:190,bg:'#1d1f22',border:'#e8b64c',
        lines:[{text:'⏱ 60 SEC',size:56,color:'#ffd27a'}]}),side:THREE.DoubleSide}));
    timer.position.set(0.55,1.9,-STALL_D/2+0.2); g.add(timer);
  }

  if(game==='basket-toss'){
    // backboard + hoop on pole behind counter
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.9,8),MAT.darkSteel);
    pole.position.set(0,0.95,-STALL_D/2+0.3); g.add(pole);
    const bb=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.5,0.04),
      new THREE.MeshStandardMaterial({map:makeSignTexture({w:350,h:250,bg:'#ffffff',border:'#9e1b23',
        lines:[{text:'',size:10},{text:'▢',size:120,color:'#9e1b23'}]}),roughness:0.5}));
    bb.position.set(0,1.85,-STALL_D/2+0.32); g.add(bb);
    const hoop=new THREE.Mesh(new THREE.TorusGeometry(0.13,0.02,8,20),MAT.redBright);
    hoop.rotation.x=Math.PI/2; hoop.position.set(0,1.55,-STALL_D/2+0.5); g.add(hoop);
    // net
    const net=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.07,0.16,10,1,true),
      new THREE.MeshBasicMaterial({color:0xeeeeee,wireframe:true,transparent:true,opacity:0.7}));
    net.position.set(0,1.46,-STALL_D/2+0.5); g.add(net);
    // balls
    for(let i=0;i<3;i++){
      const ball=new THREE.Mesh(new THREE.SphereGeometry(0.07,10,8),MAT.basketball);
      ball.position.set(-0.5+i*0.5,cy+0.12,cz+0.35); g.add(ball);
    }
    // score panel
    const sc=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.24),
      new THREE.MeshBasicMaterial({map:makeSignTexture({w:380,h:180,bg:'#2b2b2e',border:'#fff',
        lines:[{text:'3 IN = PRIZE!',size:44,color:'#ffd27a'}]}),side:THREE.DoubleSide}));
    sc.position.set(-0.6,1.85,-STALL_D/2+0.31); g.add(sc);
    const line=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.012,0.05),MAT.white);
    line.position.set(0,0.01,STALL_D/2+0.7); g.add(line);
  }

  if(game==='redemption'){
    // tidy grouped prizes on counter: stationery, toys, stickers, balls
    const penCup=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.05,0.12,10),MAT.plasticBlue);
    penCup.position.set(-0.6,cy+0.1,cz); g.add(penCup);
    for(let i=0;i<6;i++){
      const pen=new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.006,0.16,5),
        new THREE.MeshStandardMaterial({color:[0x2244aa,0xaa2222,0x222222][i%3],roughness:0.4}));
      pen.position.set(-0.6+(Math.random()-0.5)*0.06,cy+0.22,cz+(Math.random()-0.5)*0.06);
      pen.rotation.z=(Math.random()-0.5)*0.3; g.add(pen);
    }
    // notebook stacks
    [[-0.2,0],[0,0.12],[0.2,0]].forEach(([x,dz],i)=>{
      for(let j=0;j<3;j++){
        const nb=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.02,0.2),
          new THREE.MeshStandardMaterial({color:[COLORS.red,COLORS.white,COLORS.charcoal][j%3],roughness:0.7}));
        nb.position.set(x,cy+0.05+j*0.025,cz+dz); g.add(nb);
      }
    });
    // sticker sheet stand
    const stand=new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.22),
      new THREE.MeshBasicMaterial({map:makeSignTexture({w:300,h:220,bg:'#fff',border:'#c62828',
        lines:[{text:'★ ✿ ☺ ⚽',size:60,color:'#333'},{text:'STICKERS',size:40,color:'#c62828'}]}),side:THREE.DoubleSide}));
    stand.position.set(0.55,cy+0.2,cz-0.05); stand.rotation.x=-0.25; g.add(stand);
    // small toy cars
    for(let i=0;i<3;i++){
      const car=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.05,0.07),
        new THREE.MeshStandardMaterial({color:[0xd84040,0x3f8fd0,0xf2c14e][i],roughness:0.4}));
      car.position.set(-0.55+i*0.18,cy+0.07,cz+0.4); g.add(car);
    }
    // collection counter sign
    const cs=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.3),
      new THREE.MeshBasicMaterial({map:makeSignTexture({w:640,h:160,bgGrad:['#c62828','#7a141a'],border:'#fff',
        lines:[{text:'COLLECT YOUR PRIZE HERE',size:48,color:'#fff'}]}),side:THREE.DoubleSide}));
    cs.position.set(0,CANOPY_H-1.15,STALL_D/2+0.2); g.add(cs);
  }

  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});
  return g;
}
