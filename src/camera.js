/* ============================================================
 * camera.js — OrbitControls wrapper + smooth tweened presets +
 * cinematic tour player (Play / Pause / Restart / shot select).
 * ============================================================ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VIEWS, SHOTS } from './config.js';

const easeInOut = t => t<0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

export class CameraDirector {
  constructor(camera, canvas){
    this.camera = camera;
    this.controls = new OrbitControls(camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI*0.49;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 120;
    this.controls.target.set(0,2,4);

    this.tween = null;         // active single-shot tween
    this.tour = null;          // {idx, elapsed, playing}
    this.onShotStart = null;   // callbacks
    this.onShotEnd = null;
    this.onTourEnd = null;
    this.onProgress = null;
  }

  goTo(pos, look, dur=1.6, onDone=null){
    this.tour=null;
    this.tween = {
      t:0, dur,
      p0:this.camera.position.clone(), p1:new THREE.Vector3(...pos),
      l0:this.controls.target.clone(), l1:new THREE.Vector3(...look),
      onDone
    };
    this.controls.enabled=false;
  }

  goView(name){
    const v = VIEWS[name];
    if(v) this.goTo(v.pos, v.look, 1.8);
  }

  /* ---------- cinematic tour ---------- */
  playTour(startIdx=0){
    this.tour = { idx:startIdx, elapsed:0, playing:true };
    this.startCurrentShot();
  }
  startCurrentShot(){
    const s = SHOTS[this.tour.idx];
    this._shotLook = new THREE.Vector3(...s.look);
    this._from = new THREE.Vector3(...s.from);
    this._to = new THREE.Vector3(...s.to);
    this.camera.position.copy(this._from);
    this.controls.target.copy(this._shotLook);
    this.controls.enabled=false;
    if(this.onShotStart) this.onShotStart(s, this.tour.idx);
  }
  pauseTour(){ if(this.tour) this.tour.playing=false; if(this.onShotEnd) this.onShotEnd(true); }
  resumeTour(){ if(this.tour && !this.tour.playing){ this.tour.playing=true; } }
  stopTour(){
    this.tour=null; this.controls.enabled=true;
    if(this.onShotEnd) this.onShotEnd(false);
  }
  jumpToShot(idx){
    if(!this.tour) this.tour={idx:0,elapsed:0,playing:false};
    this.tour.idx=idx; this.tour.elapsed=0; this.tour.playing=true;
    this.startCurrentShot();
  }

  update(dt){
    if(this.tour){
      const s=SHOTS[this.tour.idx];
      if(this.tour.playing){
        this.tour.elapsed+=dt;
        const t=Math.min(1,this.tour.elapsed/s.dur);
        const e=easeInOut(t);
        this.camera.position.lerpVectors(this._from,this._to,e);
        // subtle look drift toward scene center for parallax feel
        this.controls.target.copy(this._shotLook);
        if(this.onProgress) this.onProgress(this.tour.idx, t);
        if(t>=1){
          if(this.tour.idx >= SHOTS.length-1){
            this.tour=null; this.controls.enabled=true;
            if(this.onTourEnd) this.onTourEnd();
            if(this.onShotEnd) this.onShotEnd(false);
          } else {
            this.tour.idx++; this.tour.elapsed=0;
            this.startCurrentShot();
          }
        }
      }
      return;
    }
    if(this.tween){
      const tw=this.tween;
      tw.t+=dt/tw.dur;
      const e=easeInOut(Math.min(1,tw.t));
      this.camera.position.lerpVectors(tw.p0,tw.p1,e);
      this.controls.target.lerpVectors(tw.l0,tw.l1,e);
      if(tw.t>=1){
        this.tween=null;
        this.controls.enabled=true;
        if(tw.onDone) tw.onDone();
      }
    }
    this.controls.update();
  }

  reset(){
    this.goTo(VIEWS.hero.pos, VIEWS.hero.look, 1.5);
  }
}
