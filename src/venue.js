/* ============================================================
 * venue.js — Ground planes, provisional boundary lines,
 * extension area treatment, walkway connection, site labels.
 * All geometry regenerates when dimensions change (editable).
 * ============================================================ */
import * as THREE from 'three';
import { VENUE, EVENT, COLORS } from './config.js';
import { MAT } from './materials.js';
import { makeGroundTexture, makeSignTexture } from './textures.js';

export class Venue {
  constructor(scene){
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'venue';
    scene.add(this.group);
    this.groundTex = makeGroundTexture();
    this.extGroundTex = makeGroundTexture('#7c7364','#6b6254');
    this.build();
  }

  /** main square centered on origin; entrance on -Z front edge. */
  get mainHalfW(){ return VENUE.mainW/2; }
  get mainHalfD(){ return VENUE.mainD/2; }
  get extCenterZ(){ return this.mainHalfD + VENUE.extGap + VENUE.extD/2; }

  build(){
    // clear previous
    this.group.traverse(o=>{ if(o.isMesh){ o.geometry.dispose?.(); }});
    this.group.clear();

    const {mainW, mainD} = VENUE;

    // Surrounding terrain (earth beyond the venue)
    const surround = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 260),
      new THREE.MeshStandardMaterial({color:0x776c58, roughness:1}));
    surround.rotation.x = -Math.PI/2;
    surround.position.set(0,-0.06, 30);
    surround.receiveShadow = true;
    this.group.add(surround);

    // Main venue paved ground
    const gTex = this.groundTex.clone(); gTex.needsRepeat = true;
    gTex.repeat.set(mainW/3.6, mainD/3.6); gTex.wrapS=gTex.wrapT=THREE.RepeatWrapping;
    const mainGround = new THREE.Mesh(new THREE.PlaneGeometry(mainW, mainD),
      new THREE.MeshStandardMaterial({map:gTex, roughness:0.93}));
    mainGround.rotation.x=-Math.PI/2;
    mainGround.receiveShadow = true;
    mainGround.name='ground-main';
    this.group.add(mainGround);

    // Central promenade band (slightly lighter paving) running gate→stage→extension
    const promLen = mainD + VENUE.extGap + VENUE.extD + 6;
    const prom = new THREE.Mesh(new THREE.PlaneGeometry(4.6, promLen),
      new THREE.MeshStandardMaterial({color:COLORS.pavement, roughness:0.9}));
    prom.rotation.x=-Math.PI/2;
    prom.position.set(0, 0.005, (-mainD/2 - 3 + (this.extCenterZ + VENUE.extD/2)) / 2);
    prom.receiveShadow = true;
    this.group.add(prom);

    // ---------- Confirmed-boundary line (red/white chain look) ----------
    const borderMat = new THREE.LineDashedMaterial({color:COLORS.redBright, dashSize:0.35, gapSize:0.22, linewidth:1});
    const pts = [
      new THREE.Vector3(-mainW/2,0.09,-mainD/2),
      new THREE.Vector3( mainW/2,0.09,-mainD/2),
      new THREE.Vector3( mainW/2,0.09, mainD/2),
      new THREE.Vector3(-mainW/2,0.09, mainD/2),
      new THREE.Vector3(-mainW/2,0.09,-mainD/2)
    ];
    const borderGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const border = new THREE.Line(borderGeo, borderMat);
    border.computeLineDistances();
    this.group.add(border);

    // boundary corner posts
    const postGeo = new THREE.CylinderGeometry(0.05,0.06,0.9,8);
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sz])=>{
      const p = new THREE.Mesh(postGeo, MAT.steel);
      p.position.set(sx*mainW/2, 0.45, sz*mainD/2);
      p.castShadow = true;
      this.group.add(p);
    });

    // "CONFIRMED AREA" label strip along left edge
    const confLabel = new THREE.Mesh(new THREE.PlaneGeometry(mainD*0.62, 0.62),
      new THREE.MeshBasicMaterial({map:makeSignTexture({w:900,h:90,bg:'#ffffff',
        lines:[{text:`CONFIRMED VENUE AREA ${EVENT.areaConfirmed} m² • PROVISIONAL UNSURVEYED FOOTPRINT`,size:44,color:'#7a141a'}]}),
        transparent:true}));
    confLabel.rotation.x=-Math.PI/2; confLabel.rotation.z=Math.PI/2;
    confLabel.position.set(-mainW/2+0.55, 0.02, 0);
    this.group.add(confLabel);

    // ---------- Extension ground (different treatment: gravel/grass tone) ----------
    const eTex = this.extGroundTex.clone();
    eTex.repeat.set(VENUE.extW/3.2, VENUE.extD/3.2); eTex.wrapS=eTex.wrapT=THREE.RepeatWrapping;
    const extGround = new THREE.Mesh(new THREE.PlaneGeometry(VENUE.extW, VENUE.extD),
      new THREE.MeshStandardMaterial({map:eTex, roughness:0.97}));
    extGround.rotation.x=-Math.PI/2;
    extGround.position.set(0, 0.0, this.extCenterZ);
    extGround.receiveShadow = true;
    extGround.name='ground-ext';
    this.extGround = extGround;
    this.group.add(extGround);

    // extension outline — subtle white dashed with corner markers
    const ep = [
      new THREE.Vector3(-VENUE.extW/2,0.09,this.extCenterZ-VENUE.extD/2),
      new THREE.Vector3( VENUE.extW/2,0.09,this.extCenterZ-VENUE.extD/2),
      new THREE.Vector3( VENUE.extW/2,0.09,this.extCenterZ+VENUE.extD/2),
      new THREE.Vector3(-VENUE.extW/2,0.09,this.extCenterZ+VENUE.extD/2),
      new THREE.Vector3(-VENUE.extW/2,0.09,this.extCenterZ-VENUE.extD/2)
    ];
    const extBorder = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(ep),
      new THREE.LineDashedMaterial({color:0xf2e9d8, dashSize:0.5, gapSize:0.3}));
    extBorder.computeLineDistances();
    this.group.add(extBorder);

    // walkway connector over the gap
    const walk = new THREE.Mesh(new THREE.PlaneGeometry(3.2, VENUE.extGap+0.8),
      new THREE.MeshStandardMaterial({color:0xb5ada0, roughness:0.9}));
    walk.rotation.x=-Math.PI/2;
    walk.position.set(0,0.012,this.mainHalfD+VENUE.extGap/2);
    this.group.add(walk);

    // Extension banner sign at its front-left corner
    const extSign = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.15),
      new THREE.MeshBasicMaterial({map:makeSignTexture({w:1100,h:230,bgGrad:['#3a3a3f','#26262b'],border:'#e8b64c',
        lines:[
          {text:'PROPOSED RIDES & ATTRACTIONS EXTENSION',size:52,color:'#ffffff'},
          {text:'ADDITIONAL SPACE REQUIRED • LOCATION NOT YET CONFIRMED',size:34,color:'#e8b64c'}
        ]})}));
    extSign.position.set(-VENUE.extW/2+3.2, 1.5, this.extCenterZ-VENUE.extD/2+0.15);
    extSign.rotation.y = Math.PI;   // faces the main venue / arriving visitors
    this.group.add(extSign);
    // sign legs
    const legGeo = new THREE.CylinderGeometry(0.05,0.05,1.5,6);
    [-2.4,2.4].forEach(dx=>{
      const l=new THREE.Mesh(legGeo,MAT.darkSteel);
      l.position.set(extSign.position.x+dx,0.75,extSign.position.z);
      this.group.add(l);
    });

    // ---------- Measurement overlay group (toggleable) ----------
    this.measureGroup = new THREE.Group();
    this.measureGroup.visible = false;
    this.group.add(this.measureGroup);
    this.buildMeasurements();
  }

  dimLine(from,to,label){
    const a=new THREE.Vector3(...from), b=new THREE.Vector3(...to);
    const geo=new THREE.BufferGeometry().setFromPoints([a,b]);
    const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xffd27a}));
    this.measureGroup.add(line);
    // end ticks
    const tick=new THREE.CylinderGeometry(0.03,0.03,0.5,6);
    [a,b].forEach(p=>{const m=new THREE.Mesh(tick,MAT.gold);m.position.copy(p);m.position.y=0.25;this.measureGroup.add(m);});
    const mid=a.clone().add(b).multiplyScalar(0.5);
    const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:makeSignTexture({w:300,h:110,bg:'rgba(30,30,32,0.85)',lines:[{text:label,size:52,color:'#ffd27a'}]}),depthTest:false}));
    spr.scale.set(2.2,0.8,1); spr.position.copy(mid); spr.position.y=1.0;
    this.measureGroup.add(spr);
  }

  buildMeasurements(){
    this.measureGroup.clear();
    const {mainW,mainD}=VENUE, y=0.12;
    this.dimLine([-mainW/2,y,-mainD/2],[mainW/2,y,-mainD/2],`${mainW.toFixed(2)} m`);
    this.dimLine([mainW/2,y,-mainD/2],[mainW/2,y,mainD/2],`${mainD.toFixed(2)} m`);
    const z0=this.extCenterZ-VENUE.extD/2, z1=this.extCenterZ+VENUE.extD/2;
    this.dimLine([-VENUE.extW/2,y,z0],[VENUE.extW/2,y,z0],`EXT ${VENUE.extW.toFixed(1)} m`);
    this.dimLine([VENUE.extW/2,y,z0],[VENUE.extW/2,y,z1],`EXT ${VENUE.extD.toFixed(1)} m`);
    const area=(mainW*mainD).toFixed(1);
    this.dimLine([-mainW/2+0.3,y,mainD/2-0.3],[-mainW/2+0.3,y,-mainD/2+0.3],'');
    const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:makeSignTexture({w:420,h:120,bg:'rgba(158,27,35,0.9)',lines:[{text:`≈ ${area} m²`,size:56,color:'#fff'}]}),depthTest:false}));
    spr.scale.set(3,0.85,1); spr.position.set(0,1.2,0);
    this.measureGroup.add(spr);
  }

  setLayout(layout){
    // extension visuals only shown in expanded mode
    const showExt = layout==='expanded';
    this.extGround.visible = showExt;
    this.measureGroup.visible = this._measure && showExt ? true : this._measure;
  }
  setMeasurements(on){ this._measure=on; this.measureGroup.visible=on; }
}
