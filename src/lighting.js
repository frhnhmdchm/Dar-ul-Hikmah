/* ============================================================
 * lighting.js — Day / Golden-hour / Evening system with smooth
 * animated transitions, sky gradient dome, sun, shadows.
 * ============================================================ */
import * as THREE from 'three';
import { LIGHT_PRESETS } from './config.js';

export class LightingSystem {
  constructor(scene, renderer){
    this.scene = scene;
    this.renderer = renderer;

    // Sky dome (gradient shader)
    const skyGeo = new THREE.SphereGeometry(160, 24, 16);
    this.skyUniforms = {
      topColor: {value:new THREE.Color(0x5f7fae)},
      bottomColor:{value:new THREE.Color(0xf7b06a)}
    };
    const skyMat = new THREE.ShaderMaterial({
      uniforms:this.skyUniforms,
      side:THREE.BackSide, depthWrite:false,
      vertexShader:`varying vec3 vPos; void main(){ vPos=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
      fragmentShader:`uniform vec3 topColor; uniform vec3 bottomColor; varying vec3 vPos;
        void main(){ float h=normalize(vPos).y*0.5+0.5; gl_FragColor=vec4(mix(bottomColor,topColor,pow(h,0.8)),1.0);} `
    });
    this.sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(this.sky);

    // Sun
    this.sun = new THREE.DirectionalLight(0xffb060, 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048,2048);
    const sc=this.sun.shadow.camera;
    sc.left=-40; sc.right=40; sc.top=45; sc.bottom=-40; sc.near=1; sc.far=160;
    this.sun.shadow.bias=-0.0006;
    this.sun.shadow.normalBias=0.02;
    scene.add(this.sun);
    scene.add(this.sun.target);
    this.sun.target.position.set(0,0,8);

    // soft fill
    this.fill = new THREE.DirectionalLight(0xbfd4e8, 0.35);
    this.fill.position.set(24,16,-18);
    scene.add(this.fill);

    this.hemi = new THREE.HemisphereLight(0xf7c98d,0x6b5a44,0.65);
    scene.add(this.hemi);
    this.amb = new THREE.AmbientLight(0xffd9a8,0.55);
    scene.add(this.amb);

    scene.fog = new THREE.FogExp2(0xe8a76b, 0.006);

    this.current = {};      // live interpolated values
    this.target  = null;
    this.modeKey = 'golden';
    this.applyPreset('golden', true);
  }

  applyPreset(key, instant=false){
    if(!LIGHT_PRESETS[key]) return;
    this.modeKey = key;
    const p = LIGHT_PRESETS[key];
    this.target = {
      skyTop:new THREE.Color(p.skyTop), skyBottom:new THREE.Color(p.skyBottom),
      fog:new THREE.Color(p.fog), fogDensity:p.fogDensity,
      sunColor:new THREE.Color(p.sunColor), sunIntensity:p.sunIntensity,
      sunPos:new THREE.Vector3(...p.sunPos),
      ambColor:new THREE.Color(p.ambColor), ambIntensity:p.ambIntensity,
      hemiSky:new THREE.Color(p.hemiSky), hemiGround:new THREE.Color(p.hemiGround), hemiInt:p.hemiInt,
      exposure:p.exposure, warmBoost:p.warmBoost,
      fillInt: key==='evening'?0.12:0.35
    };
    if(instant){ this.snap(this.target); }
  }

  snap(t){
    this.skyUniforms.topColor.value.copy(t.skyTop);
    this.skyUniforms.bottomColor.value.copy(t.skyBottom);
    this.scene.fog.color.copy(t.fog);
    this.scene.fog.density=t.fogDensity;
    this.sun.color.copy(t.sunColor); this.sun.intensity=t.sunIntensity;
    this.sun.position.copy(t.sunPos);
    this.amb.color.copy(t.ambColor); this.amb.intensity=t.ambIntensity;
    this.hemi.color.copy(t.hemiSky); this.hemi.groundColor.copy(t.hemiGround); this.hemi.intensity=t.hemiInt;
    this.renderer.toneMappingExposure=t.exposure;
    this.fill.intensity=t.fillInt;
    this._warmBoost=t.warmBoost;
    if(this.onWarmBoost) this.onWarmBoost(t.warmBoost);
  }

  update(dt){
    if(!this.target) return;
    const k = 1 - Math.pow(0.001, dt);   // smoothing factor ~ per second
    const t=this.target;
    this.skyUniforms.topColor.value.lerp(t.skyTop,k);
    this.skyUniforms.bottomColor.value.lerp(t.skyBottom,k);
    this.scene.fog.color.lerp(t.fog,k);
    this.scene.fog.density += (t.fogDensity-this.scene.fog.density)*k;
    this.sun.color.lerp(t.sunColor,k);
    this.sun.intensity += (t.sunIntensity-this.sun.intensity)*k;
    this.sun.position.lerp(t.sunPos,k);
    this.amb.color.lerp(t.ambColor,k);
    this.amb.intensity += (t.ambIntensity-this.amb.intensity)*k;
    this.hemi.color.lerp(t.hemiSky,k);
    this.hemi.groundColor.lerp(t.hemiGround,k);
    this.hemi.intensity += (t.hemiInt-this.hemi.intensity)*k;
    this.fill.intensity += (t.fillInt-this.fill.intensity)*k;
    this.renderer.toneMappingExposure += (t.exposure-this.renderer.toneMappingExposure)*k;
    const wb = this._warmBoost ?? 0;
    const nb = wb + (t.warmBoost-wb)*k;
    if(Math.abs(nb-t.warmBoost)>0.001 && this.onWarmBoost) this.onWarmBoost(nb);
    this._warmBoost = nb;
    if(Math.abs(nb-t.warmBoost)<0.002){
      this._warmBoost=t.warmBoost;
      if(this.onWarmBoost) this.onWarmBoost(t.warmBoost);
      this.target=null;
    }
  }
}
