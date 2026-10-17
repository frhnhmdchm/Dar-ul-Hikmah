/* ============================================================
 * materials.js — Shared PBR material library.
 * Fabric, painted wood, metal, plastic, pavement etc.
 * ============================================================ */
import * as THREE from 'three';
import { COLORS } from './config.js';

export const MAT = {};

export function initMaterials(){
  const std = (o)=> new THREE.MeshStandardMaterial(o);
  MAT.red        = std({color:COLORS.red, roughness:0.65});
  MAT.redDark    = std({color:COLORS.redDark, roughness:0.6});
  MAT.redBright  = std({color:COLORS.redBright, roughness:0.55});
  MAT.white      = std({color:COLORS.white, roughness:0.6});
  MAT.offWhite   = std({color:COLORS.offWhite, roughness:0.7});
  MAT.charcoal   = std({color:COLORS.charcoal, roughness:0.7});
  MAT.charcoalLt = std({color:COLORS.charcoalLt, roughness:0.75});
  MAT.gold       = std({color:COLORS.gold, roughness:0.35, metalness:0.75});
  MAT.ivory      = std({color:COLORS.ivory, roughness:0.6});
  MAT.blue       = std({color:COLORS.blue, roughness:0.55});
  MAT.skyBlue    = std({color:COLORS.skyBlue, roughness:0.5});
  MAT.yellow     = std({color:COLORS.yellow, roughness:0.5});
  MAT.green      = std({color:COLORS.green, roughness:0.6});
  MAT.pink       = std({color:COLORS.pink, roughness:0.6});
  MAT.paleBlue   = std({color:COLORS.paleBlue, roughness:0.6});
  MAT.steel      = std({color:0xb9bec4, roughness:0.32, metalness:0.85});
  MAT.darkSteel  = std({color:0x6d7176, roughness:0.45, metalness:0.7});
  MAT.wood       = std({color:0x9a6b45, roughness:0.8});
  MAT.woodLight  = std({color:0xc49a6c, roughness:0.8});
  MAT.pavement   = std({color:COLORS.pavement, roughness:0.92});
  MAT.ground     = std({color:COLORS.ground, roughness:0.95});
  MAT.grass      = std({color:COLORS.grass, roughness:0.95});
  MAT.sandGround = std({color:0x6e6250, roughness:1.0});
  MAT.rice       = std({color:0xf6efdd, roughness:0.9});
  MAT.riceHerb   = std({color:0xe8dfc2, roughness:0.9});
  MAT.chicken    = std({color:0xd9a15b, roughness:0.8});
  MAT.spicy      = std({color:0xc2502f, roughness:0.8});
  MAT.pastaCream = std({color:0xf0dcab, roughness:0.75});
  MAT.fry        = std({color:0xf2b53c, roughness:0.7});
  MAT.samosa     = std({color:0xd99a3f, roughness:0.75});
  MAT.roll       = std({color:0xe6c98f, roughness:0.8});
  MAT.chaat      = std({color:0xcf8a3e, roughness:0.7});
  MAT.chickpea   = std({color:0xcdb98a, roughness:0.8});
  MAT.potatoCh   = std({color:0xe0b25a, roughness:0.8});
  MAT.chutney    = std({color:0x5f8a2f, roughness:0.6});
  MAT.chutneyR   = std({color:0xa33b22, roughness:0.6});
  MAT.popcorn    = std({color:0xfff6da, roughness:0.85});
  MAT.candyPink  = std({color:0xf48fb8, roughness:0.95});
  MAT.candyBlue  = std({color:0xaadcf2, roughness:0.95});
  MAT.candyWhite = std({color:0xfdfdfd, roughness:0.95});
  MAT.cupcake    = std({color:0xf6cfd9, roughness:0.8});
  MAT.brownie    = std({color:0x53301b, roughness:0.7});
  MAT.sweetGold  = std({color:0xe2ae58, roughness:0.5});
  MAT.waterBottle= std({color:0xdff0fa, roughness:0.15, metalness:0.0, transparent:true, opacity:0.85});
  MAT.glass      = std({color:0xcfe6f5, roughness:0.1, transparent:true, opacity:0.35});
  MAT.plasticRed = std({color:COLORS.redBright, roughness:0.35});
  MAT.plasticBlue= std({color:0x2f7fc4, roughness:0.35});
  MAT.plasticYellow=std({color:0xf7ca35, roughness:0.35});
  MAT.ballSoft   = std({color:0xd8543f, roughness:0.9});
  MAT.basketball = std({color:0xd9622b, roughness:0.85});
  MAT.paperTray  = std({color:0xf3e9d2, roughness:0.9});
  MAT.blackBoard = std({color:0x1d1f22, roughness:0.85});
  // emissive bulbs
  MAT.bulbWarmOn = std({color:0xffe9b0, emissive:0xffcf7a, emissiveIntensity:1.6, roughness:0.4});
  MAT.bulbWarmOff= std({color:0xcaa46a, emissive:0x000000, roughness:0.5});
  MAT.bulbColor  = std({color:0xffffff, emissive:0xffd27a, emissiveIntensity:1.4, roughness:0.4});
  // inflatable vinyl
  MAT.vinylRed   = std({color:0xd0303a, roughness:0.28});
  MAT.vinylWhite = std({color:0xf7f4ec, roughness:0.28});
  MAT.vinylBlue  = std({color:0x3a83c8, roughness:0.28});
  MAT.vinylYellow= std({color:0xf5c534, roughness:0.28});
}

/* Emissive objects registry so lighting modes can dim/brighten them. */
export class LightRegistry {
  constructor(){ this.emissives = []; this.lights = []; }
  addEmissive(mat){ this.emissives.push({mat, base: mat.emissiveIntensity ?? 1}); return mat; }
  addLight(light, warm=true){ this.lights.push({light, warm, base: light.intensity}); return light; }
  /** boost: 0 (day) → 1 (evening) */
  applyBoost(boost){
    for(const e of this.emissives){
      e.mat.emissiveIntensity = e.base * (0.15 + 1.5*boost);
    }
    for(const l of this.lights){
      if (l.warm) l.light.intensity = l.base * (0.05 + 1.6*boost);
    }
  }
}
