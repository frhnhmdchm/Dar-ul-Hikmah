/* ============================================================
 * layout.js — Places all carnival content into the scene and
 * manages Mode A (main venue) / Mode B (expanded carnival),
 * ride visibility toggles, label toggles and raycast registry.
 * ============================================================ */
import * as THREE from 'three';
import { VENUE, FOOD_STALLS, GAME_STALLS, RIDES } from './config.js';
import { MAT } from './materials.js';
import { buildFoodStall, buildGameStall } from './stalls.js';
import { buildFerrisWheel, buildCarousel, buildBouncyCastle,
         buildKiddieTrain, buildInflatableSlide, buildSpinRide } from './rides.js';
import { buildStage, buildScienceZone, buildPhotoWall,
         buildSupportFacilities, buildEmergencyRoute } from './zones.js';

export class CarnivalLayout {
  constructor(scene, registry){
    this.scene = scene;
    this.registry = registry;
    this.root = new THREE.Group();
    scene.add(this.root);

    this.rides = {};        // id -> {obj, update, info}
    this.selectables = [];  // objects for raycasting
    this.labels = [];       // ride label groups
    this.animators = [];    // functions(dt,on)
    this.spinWheels = [];   // game wheels gently idle
    this.rotating = [];     // misc rotating decor (solar system)
    this.layout = 'expanded';
    this.rideEnabled = {}; RIDES.forEach(r=>this.rideEnabled[r.id]=true);

    this.build();
  }

  /* positions computed relative to current VENUE dims */
  get hw(){ return VENUE.mainW/2; }
  get hd(){ return VENUE.mainD/2; }
  get extCz(){ return this.hd + VENUE.extGap + VENUE.extD/2; }

  place(obj, x, z, ry=0, parent=this.root){
    obj.position.set(x, obj.position.y||0, z);
    if(ry) obj.rotation.y = ry;
    parent.add(obj);
    return obj;
  }

  build(){
    this.root.clear();
    this.selectables=[]; this.labels=[]; this.animators=[]; this.spinWheels=[]; this.rotating=[];

    const hw=this.hw, hd=this.hd;

    /* ---------- FOOD STREET: 8 stalls in a row along back-left wall ----------
     * Row at z = -hd + 1.4, facing +Z (customers toward promenade). */
    const foodZ = -hd + 1.5;
    const gapF = (hw*2 - 2.4) / FOOD_STALLS.length;
    FOOD_STALLS.forEach((st,i)=>{
      const s = buildFoodStall(st);
      const x = -hw + 1.2 + gapF*(i+0.5);
      this.place(s, x, foodZ, 0);
      s.userData.info = {name:st.name, use:st.use, dims:st.dims,
        footprint:'2.0 m × 1.6 m stall pitch', note:st.note};
      this.registerSelectable(s);
      this.collectLamps(s);
    });

    /* ---------- GAMES STREET: 6 booths along right wall facing -X ---------- */
    const gamesX = hw - 1.3;
    const spanG = hd*2 - 6;
    GAME_STALLS.forEach((st,i)=>{
      const s = buildGameStall(st);
      const z = -hd + 3.4 + spanG*(i+0.5)/GAME_STALLS.length;
      s.rotation.y = -Math.PI/2;
      this.place(s, gamesX, z);
      s.userData.info = {name:st.name, use:st.use, dims:st.dims,
        footprint:'2.0 m × 1.6 m booth pitch', note:st.note};
      this.registerSelectable(s);
      this.collectLamps(s);
      if(s.userData.spinWheel) this.spinWheels.push(s.userData.spinWheel);
    });

    /* ---------- MAIN STAGE: back of main venue (+Z end), facing gate ---------- */
    const stage = buildStage(this.registry);
    this.place(stage, 0, hd - 1.9, Math.PI);
    this.registerSelectable(stage);

    /* ---------- SCIENCE & ART ZONE: left side, mid field ---------- */
    const sci = buildScienceZone();
    sci.rotation.y = Math.PI/2;
    this.place(sci, -hw + 2.6, 6.0);
    this.registerSelectable(sci);
    // slow-rotate solar system model
    sci.traverse(o=>{ if(o.userData && o.userData.spin) this.rotating.push({obj:o, speed:0.25}); });

    /* ---------- PHOTO WALL: left-front corner near gate ---------- */
    const photo = buildPhotoWall();
    photo.rotation.y = 0; // faces -Z toward arriving visitors
    this.place(photo, -4.2, -hd + 2.6);
    this.registerSelectable(photo);

    /* ---------- SUPPORT FACILITIES ---------- */
    const sup = buildSupportFacilities();
    const seating = sup.children[0]; seating.position.set(3.6, 0, -7.6);
    const water   = sup.children[1]; water.position.set(hw-1.6, 0, -hd+2.2); water.rotation.y=-Math.PI/2;
    const firstAid= sup.children[2]; firstAid.position.set(-hw+1.6, 0, -hd+5.6);
    const emDesk  = sup.children[3]; emDesk.position.set(3.4, 0, hd-3.6); emDesk.rotation.y=Math.PI;
    const bins    = sup.children[4]; bins.position.set(hw-1.2, 0, -1.6);
    const sponsors= sup.children[5]; sponsors.position.set(0, 0, -hd+0.9); sponsors.rotation.y=Math.PI;
    sup.children.forEach(c=>this.registerSelectable(c));
    // extra waste bin pairs near food street
    [-6.5, 6.5].forEach(x=>{
      const b=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.16,0.55,10),MAT.charcoalLt);
      b.position.set(x,0.28,foodZ+1.3); b.castShadow=true; this.root.add(b);
    });

    /* ---------- EMERGENCY ROUTE ---------- */
    const route = buildEmergencyRoute();
    this.root.add(route);
    this.registerSelectable(route);
    this.emergencyRoute = route;

    /* ---------- BOUNCY CASTLE inside main venue (left-back quadrant) ---------- */
    const bc = buildBouncyCastle(this.registry);
    this.rides.bouncy = bc;
    this.place(bc.group, -hw + 4.4, hd - 5.4, 0.14);
    this.animators.push((dt,on)=>bc.update(dt,on));
    this.registerSelectable(bc.group, bc.info);
    this.labels.push(this.findLabel(bc.group));

    /* ---------- EXPANSION AREA RIDES (Mode B) ---------- */
    const cz = this.extCz; // extension center z
    const ferris = buildFerrisWheel(this.registry);
    this.rides.ferris = ferris;
    this.place(ferris.group, -6.5, cz + 0.5, 0);
    this.animators.push((dt,on)=>ferris.update(dt,on));
    this.registerSelectable(ferris.group, ferris.info);
    this.labels.push(this.findLabel(ferris.group));

    const carousel = buildCarousel(this.registry);
    this.rides.carousel = carousel;
    this.place(carousel.group, 7.5, cz - 1.0, 0);
    this.animators.push((dt,on)=>carousel.update(dt,on));
    this.registerSelectable(carousel.group, carousel.info);
    this.labels.push(this.findLabel(carousel.group));

    const train = buildKiddieTrain(this.registry);
    this.rides.train = train;
    this.place(train.group, 0, cz + VENUE.extD/2 - 2.4, 0);
    this.animators.push((dt,on)=>train.update(dt,on));
    this.registerSelectable(train.group, train.info);
    this.labels.push(this.findLabel(train.group));

    const slide = buildInflatableSlide(this.registry);
    this.rides.slide = slide;
    this.place(slide.group, -8.2, cz + 4.6, Math.PI/2);
    this.animators.push((dt,on)=>slide.update(dt,on));
    this.registerSelectable(slide.group, slide.info);
    this.labels.push(this.findLabel(slide.group));

    const spin = buildSpinRide(this.registry);
    this.rides.spin = spin;
    this.place(spin.group, 9.8, cz + 4.8, 0.4);
    this.animators.push((dt,on)=>spin.update(dt,on));
    this.registerSelectable(spin.group, spin.info);
    this.labels.push(this.findLabel(spin.group));

    this.applyLayout();
  }

  findLabel(group){
    let found=null;
    group.traverse(o=>{ if(o.userData && o.userData.rideLabel) found=o; });
    return found;
  }

  collectLamps(stallGroup){
    const lamps = stallGroup.userData.lamps || [];
    lamps.forEach(({light})=> this.registry.addLight(light));
  }

  registerSelectable(rootObj, infoOverride){
    const info = infoOverride || rootObj.userData.info;
    if(!info) return;
    rootObj.traverse(o=>{ if(o.isMesh) o.userData.pickRoot = rootObj; });
    rootObj.userData.info = info;
    this.selectables.push(rootObj);
  }

  setLayout(layout){
    this.layout = layout;
    this.applyLayout();
  }

  applyLayout(){
    const expanded = this.layout==='expanded';
    ['ferris','carousel','train','slide','spin'].forEach(id=>{
      this.rides[id].group.visible = expanded && this.rideEnabled[id];
    });
    this.rides.bouncy.group.visible = this.rideEnabled.bouncy;
    if(this.emergencyRoute) this.emergencyRoute.visible = true;
  }

  setRideVisible(id,on){
    this.rideEnabled[id]=on;
    this.applyLayout();
  }

  setLabels(on){
    this.root.traverse(o=>{ if(o.userData && o.userData.rideLabel) o.visible = on; });
  }

  update(dt, animateOn){
    this.animators.forEach(fn=>fn(dt,animateOn));
    this.spinWheels.forEach(w=>{ if(animateOn) w.rotation.z += dt*0.15; });
    this.rotating.forEach(r=>{ if(animateOn) r.obj.rotation.y += dt*r.speed; });
  }

  /** returns world-space camera focus target for a selectable root */
  static pickInfoFromIntersection(obj){
    let cur=obj;
    while(cur){
      if(cur.userData && cur.userData.info) return cur.userData.info;
      if(cur.userData && cur.userData.pickRoot) { cur=cur.userData.pickRoot; continue; }
      cur=cur.parent;
    }
    return null;
  }
}
