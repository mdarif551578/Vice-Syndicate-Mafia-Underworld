/**
 * Ashen Road - Combat Calculation & Enemy Spawners
 */
import { Enemy, EnemyType, Player } from '../types';
import { ATTACK_RANGE, ATTACK_ARC_DEG } from './constants';

export function createEnemy(
  id: string,
  type: EnemyType,
  x: number,
  y: number,
  isBoss = false
): Enemy {
  switch (type) {
    case 'wolf':
      return {
        id,
        type: 'wolf',
        name: 'Forest Wolf',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 35,
        maxHp: 35,
        attack: 7,
        defense: 1,
        speed: 120,
        xpValue: 15,
        goldMin: 3,
        goldMax: 7,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 14,
      };

    case 'bandit':
      return {
        id,
        type: 'bandit',
        name: 'Forest Bandit',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 60,
        maxHp: 60,
        attack: 12,
        defense: 3,
        speed: 90,
        xpValue: 25,
        goldMin: 8,
        goldMax: 15,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 16,
      };

    case 'skeleton':
      return {
        id,
        type: 'skeleton',
        name: 'Ashen Skeleton',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 75,
        maxHp: 75,
        attack: 15,
        defense: 4,
        speed: 70,
        xpValue: 35,
        goldMin: 5,
        goldMax: 12,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 16,
      };

    case 'cultist':
      return {
        id,
        type: 'cultist',
        name: 'Shadow Cultist',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 100,
        maxHp: 100,
        attack: 18,
        defense: 5,
        speed: 65,
        xpValue: 50,
        goldMin: 15,
        goldMax: 25,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 16,
      };

    case 'boss':
      return {
        id,
        type: 'boss',
        name: 'The Ashen Lord',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 800,
        maxHp: 800,
        attack: 25,
        defense: 8,
        speed: 55,
        xpValue: 500,
        goldMin: 500,
        goldMax: 500,
        state: 'IDLE',
        stateTimer: 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 28,
        isBoss: true,
        bossAttackPattern: 0,
        bossAttackTimer: 2.0,
      };

    case 'emp_spider':
      return {
        id,
        type: 'emp_spider',
        name: 'EMP Arachnid Drone',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 95,
        maxHp: 95,
        attack: 16,
        defense: 4,
        speed: 135,
        xpValue: 40,
        goldMin: 12,
        goldMax: 22,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 15,
        specialTimer: 3.5,
        color: '#06b6d4',
      };

    case 'stalker':
      return {
        id,
        type: 'stalker',
        name: 'Cloaked Cyber-Stalker',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 120,
        maxHp: 120,
        attack: 30,
        defense: 3,
        speed: 150,
        xpValue: 65,
        goldMin: 20,
        goldMax: 35,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 17,
        isCloaked: true,
        cloakTimer: 4.0,
        color: '#8b5cf6',
      };

    case 'behemoth':
      return {
        id,
        type: 'behemoth',
        name: 'Grounded Siege Behemoth',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 380,
        maxHp: 380,
        shield: 150,
        maxShield: 150,
        attack: 28,
        defense: 12,
        speed: 48,
        xpValue: 120,
        goldMin: 45,
        goldMax: 85,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 26,
        specialTimer: 3.0,
        color: '#f97316',
      };

    case 'broodmother':
      return {
        id,
        type: 'broodmother',
        name: 'Nanite Broodmother',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 240,
        maxHp: 240,
        attack: 14,
        defense: 6,
        speed: 60,
        xpValue: 90,
        goldMin: 30,
        goldMax: 60,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 24,
        specialTimer: 4.0,
        color: '#ec4899',
      };

    case 'swarmer':
      return {
        id,
        type: 'swarmer',
        name: 'Nanite Swarmer',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 25,
        maxHp: 25,
        attack: 8,
        defense: 0,
        speed: 170,
        xpValue: 10,
        goldMin: 2,
        goldMax: 6,
        state: 'IDLE',
        stateTimer: Math.random(),
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 8,
        color: '#f43f5e',
      };

    case 'combat_drone':
      return {
        id,
        type: 'combat_drone',
        name: 'Rogue Hunter Drone',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 85,
        maxHp: 85,
        shield: 50,
        maxShield: 50,
        attack: 15,
        defense: 3,
        speed: 105,
        xpValue: 45,
        goldMin: 15,
        goldMax: 28,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 14,
        specialTimer: 2.2,
        color: '#38bdf8',
      };

    case 'mortar_walker':
      return {
        id,
        type: 'mortar_walker',
        name: 'Artillery Mortar Walker',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 180,
        maxHp: 180,
        attack: 35,
        defense: 8,
        speed: 50,
        xpValue: 75,
        goldMin: 25,
        goldMax: 50,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 20,
        specialTimer: 3.5,
        color: '#eab308',
      };

    case 'mafia_tommy_gunner':
      return {
        id,
        type: 'mafia_tommy_gunner',
        name: 'Moretti Tommy Gunner',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 95,
        maxHp: 95,
        attack: 16,
        defense: 4,
        speed: 95,
        xpValue: 45,
        goldMin: 20,
        goldMax: 45,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 16,
        faction: 'moretti_mob',
        humanVisual: {
          suitColor: '#18181b',
          shirtColor: '#f8fafc',
          tieColor: '#dc2626',
          hatType: 'fedora',
          hatColor: '#18181b',
          skinTone: '#fbcfe8',
          weaponHeld: 'tommy_gun',
          hairColor: '#27272a',
          walkCycle: Math.random() * 10,
        },
      };

    case 'mafia_enforcer':
      return {
        id,
        type: 'mafia_enforcer',
        name: 'Syndicate Enforcer',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 150,
        maxHp: 150,
        attack: 24,
        defense: 7,
        speed: 80,
        xpValue: 60,
        goldMin: 35,
        goldMax: 70,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 18,
        faction: 'moretti_mob',
        humanVisual: {
          suitColor: '#292524',
          shirtColor: '#44403c',
          tieColor: '#78716c',
          hatType: 'flatcap',
          hatColor: '#1c1917',
          skinTone: '#fed7aa',
          weaponHeld: 'sawed_off',
          hairColor: '#451a03',
          walkCycle: Math.random() * 10,
        },
      };

    case 'mafia_hitman':
      return {
        id,
        type: 'mafia_hitman',
        name: 'Underworld Hitman',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 110,
        maxHp: 110,
        attack: 28,
        defense: 5,
        speed: 120,
        xpValue: 70,
        goldMin: 40,
        goldMax: 80,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 16,
        faction: 'moretti_mob',
        humanVisual: {
          suitColor: '#09090b',
          shirtColor: '#f4f4f5',
          tieColor: '#991b1b',
          hatType: 'sunglasses',
          hatColor: '#09090b',
          skinTone: '#fecdd3',
          weaponHeld: 'dual_pistols',
          hairColor: '#18181b',
          walkCycle: Math.random() * 10,
        },
      };

    case 'mafia_capo':
      return {
        id,
        type: 'mafia_capo',
        name: 'Capo Luigi Moretti',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 300,
        maxHp: 300,
        attack: 32,
        defense: 10,
        speed: 100,
        xpValue: 120,
        goldMin: 80,
        goldMax: 160,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 20,
        faction: 'moretti_mob',
        humanVisual: {
          suitColor: '#f1f5f9',
          shirtColor: '#3b82f6',
          tieColor: '#1e40af',
          hatType: 'fedora',
          hatColor: '#f1f5f9',
          skinTone: '#fed7aa',
          weaponHeld: 'revolver',
          hairColor: '#71717a',
          walkCycle: Math.random() * 10,
          hasCigar: true,
        },
      };

    case 'mafia_don':
      return {
        id,
        type: 'mafia_don',
        name: 'Don Moretti (The Godfather)',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 650,
        maxHp: 650,
        attack: 42,
        defense: 14,
        speed: 90,
        xpValue: 300,
        goldMin: 250,
        goldMax: 500,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 24,
        faction: 'moretti_mob',
        humanVisual: {
          suitColor: '#1e1b4b',
          shirtColor: '#ffffff',
          tieColor: '#dc2626',
          hatType: 'fedora',
          hatColor: '#1e1b4b',
          skinTone: '#fed7aa',
          weaponHeld: 'tommy_gun',
          hairColor: '#e2e8f0',
          walkCycle: 0,
          hasCigar: true,
        },
      };

    case 'bratva_soldier':
      return {
        id,
        type: 'bratva_soldier',
        name: 'Bratva Smuggler Soldier',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 120,
        maxHp: 120,
        attack: 20,
        defense: 6,
        speed: 95,
        xpValue: 50,
        goldMin: 25,
        goldMax: 55,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 17,
        faction: 'bratva_cartel',
        humanVisual: {
          suitColor: '#1e293b',
          shirtColor: '#0f172a',
          tieColor: '#0284c7',
          hatType: 'flatcap',
          hatColor: '#0f172a',
          skinTone: '#fed7aa',
          weaponHeld: 'ak47',
          hairColor: '#b45309',
          walkCycle: Math.random() * 10,
        },
      };

    case 'yakuza_ronin':
      return {
        id,
        type: 'yakuza_ronin',
        name: 'Yakuza Syndicate Ronin',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 135,
        maxHp: 135,
        attack: 26,
        defense: 5,
        speed: 115,
        xpValue: 65,
        goldMin: 30,
        goldMax: 65,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 16,
        faction: 'yakuza_clan',
        humanVisual: {
          suitColor: '#172554',
          shirtColor: '#ffffff',
          tieColor: '#9333ea',
          hatType: 'sunglasses',
          hatColor: '#172554',
          skinTone: '#fde047',
          weaponHeld: 'katana',
          hairColor: '#09090b',
          walkCycle: Math.random() * 10,
        },
      };

    case 'syndicate_sniper':
      return {
        id,
        type: 'syndicate_sniper',
        name: 'Syndicate Rooftop Marksman',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 85,
        maxHp: 85,
        attack: 38,
        defense: 3,
        speed: 85,
        xpValue: 55,
        goldMin: 25,
        goldMax: 60,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 15,
        faction: 'moretti_mob',
        humanVisual: {
          suitColor: '#334155',
          shirtColor: '#1e293b',
          tieColor: '#ef4444',
          hatType: 'fedora',
          hatColor: '#1e293b',
          skinTone: '#fbcfe8',
          weaponHeld: 'sniper',
          hairColor: '#52525b',
          walkCycle: Math.random() * 10,
        },
      };

    case 'friendly_troop':
      return {
        id,
        type: 'friendly_troop',
        name: 'Falcone Family Soldier',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 140,
        maxHp: 140,
        attack: 22,
        defense: 6,
        speed: 110,
        xpValue: 0,
        goldMin: 0,
        goldMax: 0,
        state: 'IDLE',
        stateTimer: Math.random() * 2,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 16,
        faction: 'player_syndicate',
        isTroop: true,
        troopCommand: 'follow',
        humanVisual: {
          suitColor: '#18181b',
          shirtColor: '#ffffff',
          tieColor: '#dc2626',
          hatType: 'fedora',
          hatColor: '#18181b',
          skinTone: '#fed7aa',
          weaponHeld: 'tommy_gun',
          hairColor: '#18181b',
          walkCycle: Math.random() * 10,
        },
      };

    case 'civilian_pedestrian':
      return {
        id,
        type: 'civilian_pedestrian',
        name: 'City Citizen',
        x,
        y,
        vx: 0,
        vy: 0,
        hp: 40,
        maxHp: 40,
        attack: 0,
        defense: 0,
        speed: 60,
        xpValue: 5,
        goldMin: 5,
        goldMax: 15,
        state: 'IDLE',
        stateTimer: Math.random() * 3,
        wanderTarget: null,
        attackCooldown: 0,
        hurtTimer: 0,
        spawnX: x,
        spawnY: y,
        isDead: false,
        respawnTimer: 0,
        radius: 14,
        faction: 'civilian',
        humanVisual: {
          suitColor: '#78716c',
          shirtColor: '#f5f5f4',
          tieColor: '#0284c7',
          hatType: 'flatcap',
          hatColor: '#57534e',
          skinTone: '#fed7aa',
          weaponHeld: 'none',
          hairColor: '#44403c',
          walkCycle: Math.random() * 10,
        },
      };
  }
}

export function spawnInitialEnemies(): Enemy[] {
  const list: Enemy[] = [];
  let count = 1;

  // 1. Little Italy - Friendly Falcone troops protecting player HQ + Citizens walking sidewalks
  const friendlyPositions = [
    { x: 1350, y: 1480 }, { x: 1420, y: 1520 }, { x: 1550, y: 1490 },
    { x: 1620, y: 1540 }, { x: 1480, y: 1380 }, { x: 1520, y: 1380 }
  ];
  friendlyPositions.forEach(pt => {
    list.push(createEnemy(`troop_${count++}`, 'friendly_troop', pt.x, pt.y));
  });

  // Civilians walking the sidewalks of Little Italy & Downtown
  const citizenPositions = [
    { x: 1250, y: 1510 }, { x: 1680, y: 1510 }, { x: 1480, y: 1650 },
    { x: 1100, y: 1510 }, { x: 1850, y: 1510 }, { x: 1480, y: 760 },
    { x: 1320, y: 380 }, { x: 1600, y: 380 }, { x: 2350, y: 380 }
  ];
  citizenPositions.forEach(pt => {
    list.push(createEnemy(`citizen_${count++}`, 'civilian_pedestrian', pt.x, pt.y));
  });

  // 2. Downtown Financial District - Moretti Crime Family Squad
  const morettiTommyGunners = [
    { x: 1300, y: 280 }, { x: 1450, y: 280 }, { x: 1580, y: 280 },
    { x: 1220, y: 450 }, { x: 1720, y: 450 }, { x: 1480, y: 550 },
    { x: 1380, y: 620 }, { x: 1580, y: 620 }
  ];
  morettiTommyGunners.forEach(pt => {
    list.push(createEnemy(`moretti_${count++}`, 'mafia_tommy_gunner', pt.x, pt.y));
  });

  const morettiEnforcers = [
    { x: 1200, y: 260 }, { x: 1680, y: 260 }, { x: 1480, y: 180 }, { x: 1350, y: 420 }
  ];
  morettiEnforcers.forEach(pt => {
    list.push(createEnemy(`moretti_enf_${count++}`, 'mafia_enforcer', pt.x, pt.y));
  });

  const morettiHitmen = [
    { x: 1100, y: 320 }, { x: 1800, y: 320 }, { x: 1480, y: 680 }
  ];
  morettiHitmen.forEach(pt => {
    list.push(createEnemy(`moretti_hit_${count++}`, 'mafia_hitman', pt.x, pt.y));
  });

  // Capo guarding Bank Entrance
  list.push(createEnemy(`capo_moretti_1`, 'mafia_capo', 1440, 240));

  // Don Moretti inside City Bank plaza
  list.push(createEnemy(`boss_don_moretti`, 'mafia_don', 1440, 140, true));

  // 3. Waterfront Port & Docks - Bratva Russian Smugglers
  const bratvaPositions = [
    { x: 250, y: 1350 }, { x: 380, y: 1320 }, { x: 520, y: 1360 },
    { x: 220, y: 1480 }, { x: 420, y: 1520 }, { x: 650, y: 1450 },
    { x: 350, y: 920 },  { x: 450, y: 920 } // Guards on pier
  ];
  bratvaPositions.forEach(pt => {
    list.push(createEnemy(`bratva_${count++}`, 'bratva_soldier', pt.x, pt.y));
  });

  // 4. Neon Casino Quarter - Yakuza Ronin
  const yakuzaPositions = [
    { x: 2250, y: 260 }, { x: 2400, y: 240 }, { x: 2550, y: 270 },
    { x: 2320, y: 380 }, { x: 2480, y: 380 }, { x: 2680, y: 320 }
  ];
  yakuzaPositions.forEach(pt => {
    list.push(createEnemy(`yakuza_${count++}`, 'yakuza_ronin', pt.x, pt.y));
  });

  // 5. River Bridge Snipers & Guard Checkpoints
  list.push(createEnemy(`sniper_bridge_w`, 'syndicate_sniper', 790, 830));
  list.push(createEnemy(`sniper_bridge_e`, 'syndicate_sniper', 2230, 830));

  return list;
}

/**
 * Checks if target point (tx, ty) is inside the player's attack arc
 */
export function isPointInAttackArc(
  px: number,
  py: number,
  facingAngle: number,
  tx: number,
  ty: number,
  range = ATTACK_RANGE,
  arcDeg = ATTACK_ARC_DEG
): boolean {
  const dx = tx - px;
  const dy = ty - py;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;

  const targetAngle = Math.atan2(dy, dx);
  let diff = targetAngle - facingAngle;
  // Normalize diff to -PI .. PI
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  const halfArcRad = (arcDeg * Math.PI) / 360;
  return Math.abs(diff) <= halfArcRad;
}

/**
 * Calculate player outgoing damage
 */
export function calculatePlayerDamage(player: Player): { damage: number; isCrit: boolean } {
  const weaponDamage = player.equipment.weapon?.damage || 0;
  const base = player.baseAttack + weaponDamage;
  const isCrit = Math.random() < 0.1; // 10% critical chance
  const raw = isCrit ? base * 2 : base;
  return { damage: Math.max(1, raw), isCrit };
}

/**
 * Calculate damage taken by player
 */
export function calculateDamageToPlayer(enemyAttack: number, playerDefense: number): number {
  return Math.max(1, enemyAttack - playerDefense);
}

/**
 * Leveling XP required formula: floor(100 * 1.5^(level - 1))
 */
export function getXpRequired(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}
