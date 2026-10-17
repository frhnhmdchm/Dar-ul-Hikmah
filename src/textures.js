/* ============================================================
 * textures.js — Procedural canvas textures & sign builders.
 * Reliable text rendering via 2D canvas → CanvasTexture.
 * ============================================================ */
import * as THREE from 'three';
import { COLORS } from './config.js';

const texCache = new Map();
const MAX_ANISO = 8;

export function hex(c){ return '#' + c.toString(16).padStart(6,'0'); }

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

/** Generic signboard texture. opts:
 *  w,h (px), bg, border, lines:[{text,size,color,weight,font,spacing}] */
export function makeSignTexture(opts){
  const key = JSON.stringify(opts);
  if (texCache.has(key)) return texCache.get(key);
  const W = opts.w || 512, H = opts.h || 256;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  // background
  if (opts.bgGrad){
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0, opts.bgGrad[0]); g.addColorStop(1, opts.bgGrad[1]);
    ctx.fillStyle = g;
  } else ctx.fillStyle = opts.bg || hex(COLORS.redDark);
  ctx.fillRect(0,0,W,H);

  // inset border
  if (opts.border){
    ctx.strokeStyle = opts.border;
    ctx.lineWidth = opts.borderWidth || Math.max(4, W*0.012);
    const m = ctx.lineWidth/2 + (opts.borderInset||8);
    roundRect(ctx, m, m, W-2*m, H-2*m, opts.radius||10);
    ctx.stroke();
  }

  // subtle top sheen for painted look
  const sh = ctx.createLinearGradient(0,0,0,H*0.5);
  sh.addColorStop(0,'rgba(255,255,255,0.07)'); sh.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle = sh; ctx.fillRect(0,0,W,H*0.5);

  // text lines
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lines = opts.lines || [];
  let totalH = 0;
  const measured = lines.map(l=>{
    const size = l.size || 40;
    totalH += size * (l.gap || 1.25);
    return size;
  });
  let y = H/2 - totalH/2;
  lines.forEach((l,i)=>{
    const size = measured[i];
    y += size*(l.gap||1.25)/2;
    const font = l.font || '"Trebuchet MS","Segoe UI",Arial,sans-serif';
    ctx.font = `${l.weight||'bold'} ${size}px ${font}`;
    ctx.fillStyle = l.color || '#ffffff';
    if (l.spacing){
      // manual letter spacing
      const chars = [...l.text];
      const widths = chars.map(ch=>ctx.measureText(ch).width);
      let tw = widths.reduce((a,b)=>a+b,0) + (chars.length-1)*l.spacing;
      let cx = W/2 - tw/2;
      const oy = y; y += size*(l.gap||1.25)/2;
      chars.forEach((ch,j)=>{ ctx.fillText(ch, cx+widths[j]/2, oy); cx += widths[j]+l.spacing; });
      return;
    }
    if (l.shadow){ ctx.shadowColor='rgba(0,0,0,.45)'; ctx.shadowBlur=size*0.18; }
    ctx.fillText(l.text, l.x!=null?l.x:W/2, y);
    ctx.shadowBlur = 0;
    y += size*(l.gap||1.25)/2;
  });

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = MAX_ANISO;
  texCache.set(key, tex);
  return tex;
}

/** Striped canopy fabric texture (radial-ish stripes drawn flat). */
export function makeStripeTexture(colorA, colorB, count=8, vertical=true){
  const key = `stripe-${colorA}-${colorB}-${count}-${vertical}`;
  if (texCache.has(key)) return texCache.get(key);
  const W=512,H=512;
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
  const ctx=cv.getContext('2d');
  const bw = W/count;
  for(let i=0;i<count;i++){
    ctx.fillStyle = i%2===0 ? hex(colorA) : hex(colorB);
    if (vertical) ctx.fillRect(i*bw,0,bw+1,H);
    else ctx.fillRect(0,i*(H/count),W,H/count+1);
  }
  // fabric shading
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'rgba(255,255,255,0.10)');
  g.addColorStop(0.5,'rgba(0,0,0,0.0)');
  g.addColorStop(1,'rgba(0,0,0,0.16)');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const tex=new THREE.CanvasTexture(cv);
  tex.colorSpace=THREE.SRGBColorSpace; tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  texCache.set(key,tex);
  return tex;
}

/** Ground / pavement texture with subtle noise. */
export function makeGroundTexture(base='#8d8478', spot='#7d7468'){
  const key=`ground-${base}-${spot}`;
  if(texCache.has(key)) return texCache.get(key);
  const S=512;
  const cv=document.createElement('canvas'); cv.width=S; cv.height=S;
  const ctx=cv.getContext('2d');
  ctx.fillStyle=base; ctx.fillRect(0,0,S,S);
  for(let i=0;i<2600;i++){
    ctx.fillStyle = Math.random()>0.5 ? spot : 'rgba(255,255,255,0.05)';
    const r=Math.random()*2+0.4;
    ctx.beginPath(); ctx.arc(Math.random()*S,Math.random()*S,r,0,7); ctx.fill();
  }
  // faint paving joints
  ctx.strokeStyle='rgba(0,0,0,0.10)'; ctx.lineWidth=2;
  for(let i=0;i<=8;i++){
    ctx.beginPath(); ctx.moveTo(i*S/8,0); ctx.lineTo(i*S/8,S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i*S/8); ctx.lineTo(S,i*S/8); ctx.stroke();
  }
  const tex=new THREE.CanvasTexture(cv);
  tex.colorSpace=THREE.SRGBColorSpace; tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  tex.repeat.set(6,6);
  texCache.set(key,tex);
  return tex;
}

/** Menu board texture for food stalls. items: [name, price] rows. */
export function makeMenuTexture(title, items, accent=COLORS.gold){
  const key=`menu-${title}-${JSON.stringify(items)}`;
  if(texCache.has(key)) return texCache.get(key);
  const W=320,H=420;
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='#221c1a'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=hex(accent); ctx.lineWidth=6;
  roundRect(ctx,8,8,W-16,H-16,10); ctx.stroke();
  ctx.fillStyle='#fff'; ctx.font='bold 26px "Trebuchet MS",Arial'; ctx.textAlign='center';
  ctx.fillText(title.toUpperCase(), W/2, 46);
  ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(24,62); ctx.lineTo(W-24,62); ctx.stroke();
  ctx.font='17px "Segoe UI",Arial'; ctx.textAlign='left';
  items.forEach((it,i)=>{
    const y=96+i*40;
    ctx.fillStyle='#f3ede2'; ctx.fillText(it[0], 26, y);
    ctx.fillStyle=hex(accent); ctx.textAlign='right'; ctx.fillText(it[1], W-26, y);
    ctx.textAlign='left';
    ctx.strokeStyle='rgba(255,255,255,.08)';
    ctx.beginPath(); ctx.moveTo(22,y+12); ctx.lineTo(W-22,y+12); ctx.stroke();
  });
  ctx.fillStyle='rgba(255,255,255,.4)'; ctx.font='12px Arial'; ctx.textAlign='center';
  ctx.fillText('PROPOSED MENU • PRICES EDITABLE', W/2, H-20);
  const tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace;
  texCache.set(key,tex);
  return tex;
}

/** Poster texture for science/art boards. */
export function makePosterTexture(title, sub, bg, fg, emoji){
  const key=`poster-${title}-${sub}`;
  if(texCache.has(key)) return texCache.get(key);
  const W=300,H=400;
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
  const ctx=cv.getContext('2d');
  ctx.fillStyle=hex(bg); ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#fff'; ctx.lineWidth=8; ctx.strokeRect(10,10,W-20,H-20);
  ctx.fillStyle='#fff'; ctx.textAlign='center';
  if (emoji){ ctx.font='84px serif'; ctx.fillText(emoji, W/2, 120); }
  ctx.font='bold 30px "Trebuchet MS",Arial';
  wrapText(ctx,title.toUpperCase(),W/2,emoji?180:120,W-40,34);
  ctx.font='16px "Segoe UI",Arial'; ctx.fillStyle=hex(fg);
  wrapText(ctx.sub.toUpperCase(),W/2,emoji?250:190,W-46,20);
  ctx.fillStyle='rgba(255,255,255,.5)'; ctx.font='11px Arial';
  ctx.fillText('STUDENT EXHIBIT', W/2, H-24);
  const tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace;
  texCache.set(key,tex);
  return tex;
}

export function wrapText(ctx,text,x,y,maxW,lh){
  const words=text.split(' ');
  let line='';
  for(const w of words){
    const test=line?line+' '+w:w;
    if(ctx.measureText(test).width>maxW && line){ ctx.fillText(line,x,y); line=w; y+=lh; }
    else line=test;
  }
  if(line) ctx.fillText(line,x,y);
  return y;
}

/** Balloon material set (shared). */
export function balloonMaterials(){
  return [COLORS.red, COLORS.white, COLORS.yellow, COLORS.skyBlue, COLORS.redBright, COLORS.pink].map(c=>
    new THREE.MeshStandardMaterial({color:c, roughness:0.32, metalness:0.0}));
}

/** Dispose every cached texture/material on teardown. */
export function disposeCaches(){
  texCache.forEach(t=>t.dispose && t.dispose());
  texCache.clear();
}
