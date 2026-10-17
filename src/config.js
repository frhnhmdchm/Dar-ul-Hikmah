/* ============================================================
 * config.js — Central configuration for DAR-UL-HIKMAH
 * FAMILY CARNIVAL 2026. All event text, colors, stall names,
 * ride data and layout parameters live here (editable).
 * ============================================================ */

export const EVENT = {
  school: 'DAR-UL-HIKMAH SCHOOL',
  title: 'DAR-UL-HIKMAH FAMILY CARNIVAL 2026',
  shortTitle: 'FAMILY CARNIVAL 2026',
  date: '26 DECEMBER 2026',
  village: 'KATHORE KALAN',
  locationLine: 'CHAK NO. 303 JB • KATHORE KALAN',
  slogan: 'LIGHTING MINDS, SHAPING TOMORROW',
  areaConfirmed: 505.857,                 // m² — confirmed venue area
  capacityTarget: 250,                    // visitors during the event
  operatingModel: 'School-operated stalls, vendor stalls and parent-operated stalls.',
  sponsors: []                            // optional sponsor logo objects: {name, texture}
};

export const COLORS = {
  red:        0x9e1b23,   // deep crimson — primary
  redDark:    0x7a141a,
  redBright:  0xc62828,
  white:      0xffffff,
  offWhite:   0xf5f1ea,
  charcoal:   0x2b2b2e,
  charcoalLt: 0x4a4a50,
  gold:       0xe8b64c,
  ivory:      0xf3e6c8,
  blue:       0x2f6fb3,
  skyBlue:    0x63a9e0,
  yellow:     0xf2c14e,
  green:      0x3f9d5a,
  pink:       0xefa7c4,
  paleBlue:   0xa7d3ef,
  ground:     0x8d8478,
  grass:      0x6f7a4f,
  pavement:   0xa9a296
};

/* ---------------- VENUE GEOMETRY ----------------
 * 1 world unit = 1 metre. Provisional square ≈ √505.857 = 22.491 m.
 * The actual surveyed shape is NOT verified — this footprint is editable. */
export const VENUE = {
  mainW: 22.491,           // width  (X) of provisional main square
  mainD: 22.491,           // depth  (Z)
  gateWidth: 5.0,          // entrance arch passage width
  gateHeight: 3.3,         // entrance arch height
  // Expansion area sits behind the main venue (+Z direction), visually distinct.
  extW: 24,                // extension width
  extD: 20,                // extension depth
  extGap: 0.6              // physical gap between boundaries (connected via walkway)
};

/* ---------------- LIGHTING PRESETS ---------------- */
export const LIGHT_PRESETS = {
  day: {
    name: 'Daylight',
    skyTop: 0x8ec3e8, skyBottom: 0xdcecf7, fog: 0xdfeaf2, fogDensity: 0.0035,
    sunColor: 0xfff4e0, sunIntensity: 3.1, sunPos: [-28, 42, 22],
    ambColor: 0xbfd4e8, ambIntensity: 0.85, hemiSky: 0xcfe3f5, hemiGround: 0x9a8f7d, hemiInt: 0.7,
    exposure: 1.0, warmBoost: 0.0
  },
  golden: {
    name: 'Golden Hour',
    skyTop: 0x5f7fae, skyBottom: 0xf7b06a, fog: 0xe8a76b, fogDensity: 0.006,
    sunColor: 0xffb060, sunIntensity: 2.6, sunPos: [-46, 12, 30],
    ambColor: 0xffd9a8, ambIntensity: 0.55, hemiSky: 0xf7c98d, hemiGround: 0x6b5a44, hemiInt: 0.65,
    exposure: 1.05, warmBoost: 0.35
  },
  evening: {
    name: 'Evening Festival',
    skyTop: 0x0d1230, skyBottom: 0x3a2a4d, fog: 0x181428, fogDensity: 0.0085,
    sunColor: 0x7a86c9, sunIntensity: 0.28, sunPos: [30, 18, -20],
    ambColor: 0x3a3f6b, ambIntensity: 0.32, hemiSky: 0x2c3566, hemiGround: 0x211b18, hemiInt: 0.35,
    exposure: 1.15, warmBoost: 1.0
  }
};

/* ---------------- FOOD STREETS (8 stalls) ----------------
 * Every menu/price is PROPOSED & EDITABLE — not finalized. */
export const FOOD_STALLS = [
  { id:'food-biryani', name:'BIRYANI & PULAO', canopy:'red-white', signColor:COLORS.redDark,
    dims:'2.0 m × 1.6 m (editable)', use:'Food stall — rice dishes',
    foods:['biryani','pulao'], note:'Menus and prices are proposals, editable before the event.' },
  { id:'food-pasta', name:'CHICKEN & PASTA', canopy:'white-crimson', signColor:COLORS.charcoal,
    dims:'2.0 m × 1.6 m (editable)', use:'Food stall — pasta dishes',
    foods:['creamy-chicken','spicy-chicken'], note:'Vendor / parent operated concept.' },
  { id:'food-fries', name:'FRIES & CRUNCHY SNACKS', canopy:'striped-rw', signColor:COLORS.red,
    dims:'2.0 m × 1.6 m (editable)', use:'Snack stall',
    foods:['fries'], note:'Keep counter clean and commercially presentable.' },
  { id:'food-samosa', name:'SAMOSA, ROLLS & CHAAT', canopy:'white-red-valance', signColor:COLORS.redDark,
    dims:'2.0 m × 1.6 m (editable)', use:'Local snack stall',
    foods:['samosa','rolls','chaat'], note:'Locally authentic Pakistani food identity.' },
  { id:'food-popcorn', name:'POPCORN', canopy:'striped-multi', signColor:COLORS.yellow,
    dims:'2.0 m × 1.6 m (editable)', use:'Popcorn stall',
    foods:['popcorn'], note:'Especially attractive to children.' },
  { id:'food-cotton', name:'COTTON CANDY & SWEET TREATS', canopy:'white-crimson', signColor:COLORS.pink,
    dims:'2.0 m × 1.6 m (editable)', use:'Sweet treats stall',
    foods:['cotton-candy'], note:'Pink / pale-blue / white candy floss displays.' },
  { id:'food-dessert', name:'DESSERTS & HOMEMADE SWEETS', canopy:'white-elegant', signColor:COLORS.redDark,
    dims:'2.0 m × 1.6 m (editable)', use:'Dessert stall',
    foods:['cupcakes','brownies','traditional'], note:'Homemade treats — parent operated.' },
  { id:'food-drinks', name:'DRINKS & WATER', canopy:'red-white', signColor:COLORS.blue,
    dims:'2.0 m × 1.6 m (editable)', use:'Drinks stall',
    foods:['bottled-water','cooler'], note:'No trademarked beverage logos without permission.' }
];

/* ---------------- GAMES STREET (6 booths) ---------------- */
export const GAME_STALLS = [
  { id:'game-ring', name:'RING TOSS CHALLENGE', game:'ring-toss',
    dims:'2.0 m × 1.6 m (editable)', use:'Skill game booth', note:'Prizes on shelves; keep queue clear of routes.' },
  { id:'game-bottle', name:'BOTTLE KNOCKDOWN', game:'bottle-knock',
    dims:'2.0 m × 1.6 m (editable)', use:'Throwing game booth', note:'Soft balls only — safe play props.' },
  { id:'game-spin', name:'SPIN TO WIN', game:'spin-wheel',
    dims:'2.0 m × 1.6 m (editable)', use:'Prize wheel booth', note:'Wheel segments and prizes editable.' },
  { id:'game-cup', name:'CUP STACK CHALLENGE', game:'cup-stack',
    dims:'2.0 m × 1.6 m (editable)', use:'Speed stacking game', note:'Optional timer board.' },
  { id:'game-basket', name:'BASKETBALL TOSS', game:'basket-toss',
    dims:'2.0 m × 1.6 m (editable)', use:'Mini hoop toss', note:'Compact carnival setup, not a full court.' },
  { id:'game-prize', name:'PRIZES & REDEMPTION', game:'redemption',
    dims:'2.0 m × 1.6 m (editable)', use:'Prize collection counter', note:'Stationery, small toys, stickers — school-friendly.' }
];

/* ---------------- RIDES (6 concepts) ----------------
 * All dimensions are illustrative concept values, adjustable to the
 * manufacturer's actual equipment. NOT certified safety specifications. */
export const RIDES = [
  { id:'ferris', name:'MINI FERRIS WHEEL', diameter:7.0, footprint:'≈ 7 m Ø structure + perimeter clearance',
    spaceNeeded:'≈ 10 × 10 m incl. queue, boarding & safety perimeter',
    layouts:{main:false, expanded:true}, inMainVenue:false,
    note:'Concept model. Real equipment specifications, anchoring and clearances must be verified with the supplier and checked on site.' },
  { id:'carousel', name:'MINI CAROUSEL', diameter:5.0, footprint:'≈ 5 m Ø',
    spaceNeeded:'≈ 8 × 8 m incl. queue & operator position',
    layouts:{main:false, expanded:true}, inMainVenue:false,
    note:'Concept model. Manufacturer specifications apply.' },
  { id:'bouncy', name:'BOUNCY CASTLE', diameter:null, footprint:'≈ 5 m × 5 m (adjustable)',
    spaceNeeded:'≈ 7 × 7 m incl. surrounding clearance zone',
    layouts:{main:true, expanded:true}, inMainVenue:true,
    note:'Shown in BOTH layouts as the space-appropriate children’s ride for the main venue. Supplier anchoring & supervision required.' },
  { id:'train', name:'KIDDIE TRAIN', diameter:null, footprint:'Display area ≈ 8 m × 4 m',
    spaceNeeded:'≈ 9 × 5 m incl. boarding & waiting area',
    layouts:{main:false, expanded:true}, inMainVenue:false,
    note:'No track is routed through stalls or emergency paths. Display configuration shown; a closed loop needs a verified route in the expanded venue.' },
  { id:'slide', name:'INFLATABLE SLIDE', diameter:null, footprint:'≈ 4 m × 6 m (adjustable)',
    spaceNeeded:'≈ 6 × 8 m incl. queue & landing clearance',
    layouts:{main:false, expanded:true}, inMainVenue:false,
    note:'Commercial inflatable equipment varies — dimensions must match actual unit.' },
  { id:'spin', name:"CHILDREN'S SPIN RIDE", diameter:3.6, footprint:'≈ 3.6 m Ø platform',
    spaceNeeded:'≈ 6 × 6 m incl. boarding point',
    layouts:{main:false, expanded:true}, inMainVenue:false,
    note:'Generic concept until an actual equipment model is selected. No manufacturer specs, capacity or speed claims are made.' }
];

/* ---------------- STAGE / ZONES ---------------- */
export const STAGE = { w:6.0, d:2.5, h:0.6, name:'MAIN STAGE' };
export const PHOTO_WALL = { w:3.5, h:2.5, name:'FAMILY PHOTO WALL' };

/* ---------------- CINEMATIC SHOTS ----------------
 * cam:[x,y,z] lookAt:[x,y,z] dur seconds. Optional light/layout switch. */
export const SHOTS = [
  { id:'s1', title:'Shot 1 · The Grand Reveal', sub:'The complete family carnival from above',
    from:[-30,26,52], to:[-12,13,26], look:[2,2,-2], dur:8, layout:'expanded' },
  { id:'s2', title:'Shot 2 · Kathore Kalan Entrance', sub:'DAR-UL-HIKMAH SCHOOL • KATHORE KALAN',
    from:[0,3.2,-18.5], to:[0,4.6,-13], look:[0,2.6,VENUE.mainD/2+0.4], dur:7, layout:'expanded' },
  { id:'s3a', title:'Shot 3 · The Ride Zone', sub:'Ferris wheel, carousel & children’s rides',
    from:[-16,8,44], to:[10,6,40], look:[0,3,32], dur:8, layout:'expanded' },
  { id:'s3b', title:'Shot 3b · Mini Ferris Wheel', sub:'Slow rotation — gondolas stay upright',
    from:[7,4.5,26], to:[5,6,23], look:[-6.5,3.6,32.5], dur:6, layout:'expanded' },
  { id:'s3c', title:'Shot 3c · Mini Carousel', sub:'Striped canopy & ornamental seats',
    from:[13,3.4,36], to:[11,4.4,33], look:[7.5,1.6,31.5], dur:6, layout:'expanded' },
  { id:'s4', title:'Shot 4 · Food Street', sub:'Eight detailed food stalls',
    from:[-13,3.2,-3], to:[12,3.2,-3], look:[0,1.4,3.6], dur:9, layout:'expanded' },
  { id:'s5', title:'Shot 5 · Games & Prizes', sub:'Six carnival game booths',
    from:[13.5,3.6,12], to:[13.5,3.2,2], look:[9.4,1.3,6], dur:7, layout:'expanded' },
  { id:'s6', title:'Shot 6 · Science & Creativity', sub:'School exhibition zone',
    from:[-14,3.4,10], to:[-14,2.8,2], look:[-9.6,1.3,6], dur:7, layout:'expanded' },
  { id:'s7', title:'Shot 7 · Main Stage', sub:'Branded backdrop & stage lighting',
    from:[0,2.6,16], to:[0,3.4,11], look:[0,1.9,1.6], dur:6, layout:'expanded' },
  { id:'s8', title:'Shot 8 · Family Photo Wall', sub:'I ♥ DAR-UL-HIKMAH',
    from:[-4.2,1.7,-5.6], to:[-4.2,1.7,-4.6], look:[-4.2,1.5,-2.2], dur:5, layout:'expanded' },
  { id:'s9', title:'Shot 9 · Evening Festival', sub:'Illuminated rides, gate & stalls',
    from:[-22,10,50], to:[-8,7,38], look:[0,3,18], dur:8, light:'evening', layout:'expanded' },
  { id:'s10', title:'Shot 10 · Final Hero Frame', sub:'DAR-UL-HIKMAH FAMILY CARNIVAL 2026 • 26 DECEMBER 2026 • KATHORE KALAN',
    from:[-26,20,58], to:[-18,16,48], look:[0,2,4], dur:8, layout:'expanded' }
];

/* ---------------- CAMERA VIEW PRESETS ---------------- */
export const VIEWS = {
  hero:      { pos:[-24,17,46],  look:[0,2,2],   label:'Hero View' },
  gate:      { pos:[0,2.2,-16],  look:[0,2.4,11],label:'Entrance Gate' },
  gateLow:   { pos:[-6,5.5,-15], look:[0,2.2,14],label:'Gate Elevated' },
  rides:     { pos:[-4,9,46],    look:[0,3,31],  label:'Ride Zone' },
  ferris:    { pos:[6,5,26],     look:[-6.5,3.6,32.5], label:'Ferris Wheel' },
  carousel:  { pos:[13,3.6,36],  look:[7.5,1.6,31.5],  label:'Carousel' },
  food:      { pos:[0,4.2,-6],   look:[0,1.4,3.6], label:'Food Street' },
  games:     { pos:[14,4,7],     look:[9.4,1.3,6], label:'Games Street' },
  science:   { pos:[-14.5,3.4,6],look:[-9.6,1.3,6],label:'Science & Art' },
  stage:     { pos:[0,2.8,13],   look:[0,1.9,1.6], label:'Main Stage' },
  photo:     { pos:[-4.2,1.7,-5.2], look:[-4.2,1.5,-2.2], label:'Photo Wall' },
  plan:      { pos:[0,Math.max(VENUE.mainW,VENUE.extW)+14,16], look:[0,0,12], label:'Overhead Site Plan' }
};

export const PROMO_VIEWS = {
  hero16:     { pos:[-24,17,46], look:[0,2,2], aspect:16/9, light:null, layout:'expanded' },
  portrait916:{ pos:[0,3.4,-15], look:[0,2.6,16], aspect:9/16, light:null, layout:'expanded' },
  foodShow:   { pos:[-8,3.4,-2.5], look:[1,1.4,4], aspect:16/9, layout:'expanded' },
  rideShow:   { pos:[10,6,24], look:[-1,3,32], aspect:16/9, layout:'expanded' },
  gamesShow:  { pos:[13.6,3.4,7], look:[9.4,1.3,6], aspect:16/9, layout:'expanded' },
  eveningShow:{ pos:[-16,9,44], look:[0,3,16], aspect:16/9, light:'evening', layout:'expanded' },
  sponsor:    { pos:[14,22,44], look:[0,1,10], aspect:16/9, layout:'expanded' },
  siteplan:   { pos:[0,Math.max(VENUE.mainW,VENUE.extW)+16,14], look:[0,0,12], aspect:4/3, layout:'expanded' }
};
