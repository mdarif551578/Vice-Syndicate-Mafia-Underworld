/**
 * Mafia Open World - City Map Generation & District Layout
 */
import { Collider, WorldObject, Chest, TurfDistrict, DestructibleProp } from '../types';
import { WORLD_WIDTH, WORLD_HEIGHT, WORLD_SEED, INITIAL_TURF_DISTRICTS } from './constants';

export function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export interface TerrainRegion {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  bgCol: string;
  tintCol: string;
}

export interface GrassTuft {
  x: number;
  y: number;
  lines: { dx: number; dy: number; len: number; angle: number }[];
  color: string;
}

export interface WorldData {
  regions: TerrainRegion[];
  grassTufts: GrassTuft[];
  objects: WorldObject[];
  colliders: Collider[];
  chests: Chest[];
  watchtowerInscription: { x: number; y: number; text: string };
  fountain: { x: number; y: number; radius: number };
  turfDistricts: TurfDistrict[];
  props: DestructibleProp[];
}

export function generateWorld(): WorldData {
  const rng = createRng(WORLD_SEED);
  const objects: WorldObject[] = [];
  const colliders: Collider[] = [];
  const chests: Chest[] = [];
  const props: DestructibleProp[] = [];

  // 1. City Terrain Districts
  const regions: TerrainRegion[] = [
    // Little Italy & Falcone Strip (Center-South)
    {
      name: 'Little Italy & Falcone Strip',
      x: 950,
      y: 1100,
      w: 1050,
      h: 900,
      bgCol: '#262626',
      tintCol: '#3f3f46',
    },
    // Downtown Financial District & City Hall (North)
    {
      name: 'Downtown Financial & City Bank',
      x: 950,
      y: 0,
      w: 1050,
      h: 840,
      bgCol: '#18181b',
      tintCol: '#27272a',
    },
    // Waterfront Docks & Marina (South-West)
    {
      name: 'Waterfront Docks & Smuggler Port',
      x: 0,
      y: 1100,
      w: 950,
      h: 900,
      bgCol: '#1e293b',
      tintCol: '#0f766e',
    },
    // West Shore Outskirts (North-West)
    {
      name: 'West Industrial Outskirts',
      x: 0,
      y: 0,
      w: 950,
      h: 840,
      bgCol: '#27272a',
      tintCol: '#3f3f46',
    },
    // Neon Casino & Chinatown Strip (North-East)
    {
      name: 'Neon Strip & Chinatown Quarter',
      x: 2000,
      y: 0,
      w: 1000,
      h: 840,
      bgCol: '#171717',
      tintCol: '#581c87',
    },
    // Industrial Chop Shop & Rail Yard (South-East)
    {
      name: 'Industrial Chop Shop & Rail Yard',
      x: 2000,
      y: 1100,
      w: 1000,
      h: 900,
      bgCol: '#27272a',
      tintCol: '#52525b',
    },
    // River Basin Channel (Center East-West water channel)
    {
      name: 'Grand Central River Basin',
      x: 0,
      y: 840,
      w: 3000,
      h: 260,
      bgCol: '#0369a1',
      tintCol: '#0284c7',
    },
  ];

  // 2. City Pavement Pebbles & Grass Tufts in Park Plazas
  const grassTufts: GrassTuft[] = [];
  for (let i = 0; i < 260; i++) {
    const gx = 40 + rng() * (WORLD_WIDTH - 80);
    const gy = 40 + rng() * (WORLD_HEIGHT - 80);

    // Skip inside deep river channel
    if (gy > 850 && gy < 1090) continue;

    const color = gy > 1100 ? '#52525b' : '#3f3f46';
    const lines = [
      { dx: -2, dy: -6, len: 6, angle: -0.2 },
      { dx: 0, dy: -8, len: 8, angle: 0 },
      { dx: 2, dy: -6, len: 6, angle: 0.2 },
    ];
    grassTufts.push({ x: gx, y: gy, lines, color });
  }

  // 3. Central Marble Fountain in Little Italy Piazza
  const fountain = { x: 1500, y: 1500, radius: 28 };
  objects.push({
    id: 'piazza_fountain',
    type: 'fountain',
    x: fountain.x,
    y: fountain.y,
    radius: fountain.radius,
    label: 'Plaza Fountain',
  });
  colliders.push({
    id: 'col_fountain',
    type: 'circle',
    x: fountain.x,
    y: fountain.y,
    radius: fountain.radius + 2,
    name: 'Plaza Marble Fountain',
  });

  // 4. Major City Architecture & Buildings
  const buildings = [
    // --- LITTLE ITALY (Center South) ---
    // Don Falcone's Safehouse Manor
    {
      id: 'falcone_manor',
      x: 1420,
      y: 1320,
      w: 160,
      h: 95,
      roofColor: '#991b1b',
      color: '#d4b896',
      name: 'Don Falcone Estate & HQ',
      label: 'Falcone Manor',
    },
    // Luigi's Italian Ristorante & Speakeasy
    {
      id: 'luigi_ristorante',
      x: 1200,
      y: 1440,
      w: 110,
      h: 75,
      roofColor: '#b45309',
      color: '#e2e8f0',
      name: "Luigi's Ristorante & Speakeasy",
      label: 'Ristorante',
    },
    // Syndicate Arms Foundry
    {
      id: 'arms_foundry',
      x: 1650,
      y: 1440,
      w: 115,
      h: 75,
      roofColor: '#78350f',
      color: '#94a3b8',
      name: 'Falcone Munitions Depot',
      label: 'Arms Depot',
    },
    // Capo Brownstone Tenements
    {
      id: 'tenement_1',
      x: 1220,
      y: 1640,
      w: 95,
      h: 70,
      roofColor: '#7f1d1d',
      color: '#a8a29e',
      name: 'Syndicate Brownstone',
      label: 'Brownstone',
    },
    {
      id: 'tenement_2',
      x: 1650,
      y: 1640,
      w: 95,
      h: 70,
      roofColor: '#7f1d1d',
      color: '#a8a29e',
      name: 'Syndicate Brownstone',
      label: 'Brownstone',
    },

    // --- DOWNTOWN FINANCIAL DISTRICT (North) ---
    // First National City Bank (Central Target)
    {
      id: 'city_bank',
      x: 1360,
      y: 160,
      w: 180,
      h: 120,
      roofColor: '#0f172a',
      color: '#f8fafc',
      name: 'First National City Bank',
      label: 'City Bank',
    },
    // Grand Skyscraper Tower 1 (West of Bank)
    {
      id: 'skyscraper_1',
      x: 1080,
      y: 130,
      w: 160,
      h: 190,
      roofColor: '#1e293b',
      color: '#334155',
      name: 'Empire Syndicate Tower',
      label: 'Empire Tower',
    },
    // Grand Skyscraper Tower 2 (East of Bank)
    {
      id: 'skyscraper_2',
      x: 1680,
      y: 130,
      w: 160,
      h: 190,
      roofColor: '#1e293b',
      color: '#475569',
      name: 'Metropolitan Financial Center',
      label: 'Metro Tower',
    },
    // Moretti Hotel & Lounge (Downtown South)
    {
      id: 'moretti_lounge',
      x: 1380,
      y: 460,
      w: 140,
      h: 80,
      roofColor: '#1e1b4b',
      color: '#cbd5e1',
      name: 'Moretti Grand Hotel',
      label: 'Moretti Hotel',
    },

    // --- NEON CASINO & CHINATOWN (North-East) ---
    // The Grand Royale Casino
    {
      id: 'casino_grand_royale',
      x: 2280,
      y: 150,
      w: 200,
      h: 130,
      roofColor: '#7e22ce',
      color: '#1e1b4b',
      name: 'The Grand Royale Casino',
      label: 'Grand Royale Casino',
    },
    // Velvet Nightclub & Lounge
    {
      id: 'velvet_nightclub',
      x: 2600,
      y: 200,
      w: 140,
      h: 80,
      roofColor: '#be185d',
      color: '#18181b',
      name: 'The Velvet Rose Lounge',
      label: 'Velvet Club',
    },

    // --- WATERFRONT PORT & DOCKS (South-West) ---
    // Contraband Warehouse Alpha
    {
      id: 'warehouse_port_1',
      x: 180,
      y: 1240,
      w: 180,
      h: 110,
      roofColor: '#334155',
      color: '#475569',
      name: 'Bratva Smuggler Warehouse 4',
      label: 'Port Warehouse 4',
    },
    // Contraband Warehouse Beta
    {
      id: 'warehouse_port_2',
      x: 480,
      y: 1240,
      w: 170,
      h: 105,
      roofColor: '#1f2937',
      color: '#374151',
      name: 'Harbor Shipping Warehouse 9',
      label: 'Port Warehouse 9',
    },

    // --- INDUSTRIAL CHOP SHOP (South-East) ---
    // Syndicate Chop Shop Garage
    {
      id: 'chop_shop_garage',
      x: 2240,
      y: 1380,
      w: 180,
      h: 110,
      roofColor: '#6b21a8',
      color: '#52525b',
      name: 'Syndicate Chop Shop & Garage',
      label: 'Chop Shop',
    },
    // Rail Freight Depot
    {
      id: 'rail_freight_depot',
      x: 2560,
      y: 1400,
      w: 190,
      h: 100,
      roofColor: '#451a03',
      color: '#78716c',
      name: 'Central Freight Terminal',
      label: 'Freight Depot',
    },
  ];

  buildings.forEach(b => {
    objects.push({
      id: b.id,
      type: 'house',
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
      color: b.color,
      roofColor: b.roofColor,
      label: b.label,
    });
    colliders.push({
      id: `col_${b.id}`,
      type: 'rect',
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
      name: b.name,
    });
  });

  // 5. River Marina Boardwalk Piers (Wooden docks extending into river for boats)
  const piers = [
    { id: 'pier_west_port', x: 340, y: 880, w: 90, h: 180, name: 'Waterfront Boat Pier' },
    { id: 'pier_center_marina', x: 1420, y: 1020, w: 90, h: 90, name: 'Little Italy Marina Pier' },
    { id: 'pier_east_marina', x: 2500, y: 880, w: 90, h: 180, name: 'Casino River Pier' },
  ];
  piers.forEach(p => {
    objects.push({
      id: p.id,
      type: 'ruin',
      x: p.x,
      y: p.y,
      w: p.w,
      h: p.h,
      color: '#78350f',
      label: 'Boat Pier',
    });
  });

  // 6. River Bridges (Crossing the river with asphalt roadways & railings)
  const bridges = [
    { id: 'bridge_west', x: 740, y: 830, w: 110, h: 280, name: 'West Commercial Bridge' },
    { id: 'bridge_broadway', x: 1435, y: 830, w: 110, h: 280, name: 'Broadway Suspension Bridge' },
    { id: 'bridge_east', x: 2180, y: 830, w: 110, h: 280, name: 'East Neon Bridge' },
  ];
  bridges.forEach(b => {
    objects.push({
      id: b.id,
      type: 'road',
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
      color: '#334155',
      label: b.name,
    });
  });

  // 7. Destructible Props: Fire Hydrants, Explosive Fuel Barrels, Streetlamps, Crates, Parking Meters
  let propIdx = 1;

  // Hydrants along Little Italy & Downtown curbs
  const hydrantCoords = [
    { x: 1330, y: 1470 }, { x: 1610, y: 1470 }, { x: 1380, y: 1570 }, { x: 1580, y: 1570 },
    { x: 1330, y: 340 }, { x: 1630, y: 340 }, { x: 1420, y: 440 }, { x: 1540, y: 440 },
    { x: 2260, y: 340 }, { x: 620, y: 1470 }
  ];
  hydrantCoords.forEach(c => {
    props.push({
      id: `prop_hydrant_${propIdx++}`,
      type: 'fire_hydrant',
      x: c.x,
      y: c.y,
      hp: 35,
      maxHp: 35,
      isDestroyed: false,
      radius: 9,
    });
  });

  // Explosive Barrels near warehouses, alleys, and rail yard
  const barrelCoords = [
    { x: 230, y: 1380 }, { x: 250, y: 1380 }, { x: 420, y: 1370 }, { x: 440, y: 1370 },
    { x: 2450, y: 1420 }, { x: 2470, y: 1420 }, { x: 2500, y: 1420 },
    { x: 1040, y: 340 }, { x: 1060, y: 340 }, { x: 1880, y: 340 },
    { x: 700, y: 1500 }, { x: 720, y: 1500 }
  ];
  barrelCoords.forEach(c => {
    props.push({
      id: `prop_barrel_${propIdx++}`,
      type: 'explosive_barrel',
      x: c.x,
      y: c.y,
      hp: 25,
      maxHp: 25,
      isDestroyed: false,
      radius: 12,
    });
  });

  // Streetlamps with warm golden light cones
  const lampCoords = [
    { x: 1310, y: 1450 }, { x: 1450, y: 1450 }, { x: 1550, y: 1450 }, { x: 1690, y: 1450 },
    { x: 1310, y: 1550 }, { x: 1450, y: 1550 }, { x: 1550, y: 1550 }, { x: 1690, y: 1550 },
    { x: 1310, y: 360 }, { x: 1450, y: 360 }, { x: 1550, y: 360 }, { x: 1690, y: 360 },
    { x: 730, y: 840 }, { x: 730, y: 1100 }, { x: 1425, y: 840 }, { x: 1425, y: 1100 },
    { x: 2170, y: 840 }, { x: 2170, y: 1100 }, { x: 2260, y: 360 }, { x: 2520, y: 360 }
  ];
  lampCoords.forEach(c => {
    props.push({
      id: `prop_lamp_${propIdx++}`,
      type: 'street_lamp',
      x: c.x,
      y: c.y,
      hp: 50,
      maxHp: 50,
      isDestroyed: false,
      radius: 8,
    });
  });

  // Contraband Crates with cash and ammo
  const crateCoords = [
    { x: 1160, y: 1470 }, { x: 1175, y: 1485 }, { x: 1720, y: 1470 }, { x: 1735, y: 1485 },
    { x: 300, y: 1270 }, { x: 320, y: 1270 }, { x: 600, y: 1270 }, { x: 620, y: 1270 },
    { x: 2180, y: 1420 }, { x: 2200, y: 1420 }, { x: 2700, y: 1420 }
  ];
  crateCoords.forEach(c => {
    props.push({
      id: `prop_crate_${propIdx++}`,
      type: 'shipping_crate',
      x: c.x,
      y: c.y,
      hp: 30,
      maxHp: 30,
      isDestroyed: false,
      radius: 11,
    });
  });

  // 8. Informant Dead-Drop Wiretap (Preserving quest/lore at 1360, 785)
  const watchtowerInscription = {
    x: 1360,
    y: 785,
    text: '"Syndicate Informant Wiretap: Don Moretti holds the vault access key within the First National City Bank. Mobilize your troops and breach the downtown vault!"',
  };
  objects.push({
    id: 'syndicate_wiretap',
    type: 'inscription',
    x: watchtowerInscription.x,
    y: watchtowerInscription.y,
    radius: 14,
    interactable: true,
    interactionPrompt: '[E] Tap Syndicate Wire',
    onInteractId: 'read_watchtower',
    label: 'Police Wiretap',
  });
  colliders.push({
    id: 'col_wiretap',
    type: 'circle',
    x: watchtowerInscription.x,
    y: watchtowerInscription.y,
    radius: 12,
  });

  // 9. Underground Bank Vault Gate
  objects.push({
    id: 'inner_keep_gate',
    type: 'gate',
    x: 1410,
    y: 280,
    w: 80,
    h: 18,
    color: '#b91c1c',
    interactable: true,
    interactionPrompt: '[E] Crack Vault Gate',
    onInteractId: 'gate_interact',
    label: 'Bank Vault Door',
  });
  colliders.push({
    id: 'col_inner_gate',
    type: 'rect',
    x: 1410,
    y: 280,
    w: 80,
    h: 18,
    name: 'Reinforced Bank Vault Door',
  });

  // 10. Syndicate Chests & Safehouse Lockers
  chests.push(
    // Falcone Safehouse Starter Stash
    {
      id: 'chest_village',
      x: 1400,
      y: 1370,
      opened: false,
      gold: 150,
      itemId: 'healing_herb',
    },
    // Contraband Warehouse Stash
    {
      id: 'chest_forest',
      x: 250,
      y: 1290,
      opened: false,
      gold: 250,
      itemId: 'large_potion',
    },
    // Bridge Toll Lockbox
    {
      id: 'chest_watchtower',
      x: 1390,
      y: 810,
      opened: false,
      gold: 180,
      itemId: 'leather_armor',
    },
    // Bratva Arms Crate (Contains Syndicate Master Key)
    {
      id: 'chest_ashen_key',
      x: 450,
      y: 1380,
      opened: false,
      gold: 350,
      itemId: 'ashen_key',
      requiresGuardsDefeated: true,
    },
    // First National Bank Master Vault
    {
      id: 'chest_keep',
      x: 1440,
      y: 200,
      opened: false,
      gold: 1200,
      itemId: 'large_potion',
    }
  );

  return {
    regions,
    grassTufts,
    objects,
    colliders,
    chests,
    watchtowerInscription,
    fountain,
    turfDistricts: INITIAL_TURF_DISTRICTS,
    props,
  };
}
