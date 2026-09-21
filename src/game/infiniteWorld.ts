/**
 * Ashen Road - Infinite Procedural World Engine
 * Generates endless chunks across 360-degree coordinates with distinct biomes,
 * landmarks, tactical supply drops, ammo caches, and scaling enemy encounters.
 */
import { Collider, WorldObject, Chest, Enemy } from '../types';
import { CHUNK_SIZE, ITEMS } from './constants';
import { TerrainRegion, GrassTuft } from './worldGen';

export interface InfiniteChunk {
  cx: number;
  cy: number;
  key: string;
  biome: BiomeType;
  region: TerrainRegion;
  grassTufts: GrassTuft[];
  objects: WorldObject[];
  colliders: Collider[];
  chests: Chest[];
  enemies: Enemy[];
  isCoreZone: boolean;
}

export type BiomeType =
  | 'core_village'
  | 'woodlands'
  | 'badlands'
  | 'frost_tundra'
  | 'wasteland_outpost'
  | 'catacombs';

// Deterministic PRNG for chunk coordinates
function chunkRng(cx: number, cy: number, seed: number = 98234) {
  let h = Math.imul(cx ^ (cy << 16), 0x5bd1e995) ^ seed;
  h = Math.imul(h ^ (h >>> 15), 0x5bd1e995);
  h = h ^ (h >>> 13);
  let s = (h >>> 0);
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const BIOME_PALETTES: Record<BiomeType, { bg: string; tint: string; grass: string; name: string }> = {
  core_village: {
    bg: '#262626',
    tint: '#3f3f46',
    grass: '#52525b',
    name: 'Little Italy & Downtown Core',
  },
  woodlands: {
    bg: '#1e293b',
    tint: '#334155',
    grass: '#475569',
    name: 'Metropolitan Suburbs & Outskirts',
  },
  badlands: {
    bg: '#1c1917',
    tint: '#292524',
    grass: '#d97706',
    name: 'Industrial Rail Depot & Foundries',
  },
  frost_tundra: {
    bg: '#0f172a',
    tint: '#1e293b',
    grass: '#0284c7',
    name: 'North Port Marina & Shipyards',
  },
  wasteland_outpost: {
    bg: '#18181b',
    tint: '#27272a',
    grass: '#dc2626',
    name: 'Rival Cartel Compounds & Fronts',
  },
  catacombs: {
    bg: '#09090b',
    tint: '#18181b',
    grass: '#9333ea',
    name: 'Underground Speakeasies & Smuggler Tunnels',
  },
};

export class InfiniteWorldManager {
  private chunks = new Map<string, InfiniteChunk>();
  private openedChestIds = new Set<string>();
  private deadEnemyIds = new Set<string>();

  public getChunkKey(cx: number, cy: number): string {
    return `${cx}_${cy}`;
  }

  public recordEnemyKilled(id: string) {
    this.deadEnemyIds.add(id);
    for (const chunk of this.chunks.values()) {
      const e = chunk.enemies.find(item => item.id === id);
      if (e) {
        e.isDead = true;
        e.hp = 0;
      }
    }
  }

  public isEnemyKilled(id: string): boolean {
    return this.deadEnemyIds.has(id);
  }

  public isCoreZone(cx: number, cy: number): boolean {
    const minX = 0;
    const maxX = Math.ceil(3000 / CHUNK_SIZE);
    const minY = 0;
    const maxY = Math.ceil(2000 / CHUNK_SIZE);
    return cx >= minX && cx <= maxX && cy >= minY && cy <= maxY;
  }

  public getBiome(cx: number, cy: number): BiomeType {
    if (this.isCoreZone(cx, cy)) return 'core_village';

    const dist = Math.hypot(cx, cy);
    const angle = Math.atan2(cy, cx);
    const mod = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 5) % 5;

    if (mod === 0) return 'woodlands';
    if (mod === 1) return 'badlands';
    if (mod === 2) return 'frost_tundra';
    if (mod === 3) return 'wasteland_outpost';
    return 'catacombs';
  }

  public getChunk(cx: number, cy: number): InfiniteChunk {
    const key = this.getChunkKey(cx, cy);
    const existing = this.chunks.get(key);
    if (existing) return existing;

    const chunk = this.generateChunk(cx, cy);
    this.chunks.set(key, chunk);

    // Limit cache size to 64 active chunks to maintain high performance
    if (this.chunks.size > 64) {
      const oldestKey = this.chunks.keys().next().value;
      if (oldestKey) {
        this.chunks.delete(oldestKey);
      }
    }

    return chunk;
  }

  private generateChunk(cx: number, cy: number): InfiniteChunk {
    const key = this.getChunkKey(cx, cy);
    const isCore = this.isCoreZone(cx, cy);
    const biome = this.getBiome(cx, cy);
    const palette = BIOME_PALETTES[biome];
    const rand = chunkRng(cx, cy);

    const worldX = cx * CHUNK_SIZE;
    const worldY = cy * CHUNK_SIZE;

    const region: TerrainRegion = {
      name: `${palette.name} [Sector ${cx}, ${cy}]`,
      x: worldX,
      y: worldY,
      w: CHUNK_SIZE,
      h: CHUNK_SIZE,
      bgCol: palette.bg,
      tintCol: palette.tint,
    };

    const grassTufts: GrassTuft[] = [];
    const objects: WorldObject[] = [];
    const colliders: Collider[] = [];
    const chests: Chest[] = [];
    const enemies: Enemy[] = [];

    // If core zone, terrain objects and enemies are managed by base handcrafted layout
    if (!isCore) {
      // 1. Procedural grass / detail tufts
      const tuftCount = 14 + Math.floor(rand() * 12);
      for (let i = 0; i < tuftCount; i++) {
        const tx = worldX + 30 + rand() * (CHUNK_SIZE - 60);
        const ty = worldY + 30 + rand() * (CHUNK_SIZE - 60);
        grassTufts.push({
          x: tx,
          y: ty,
          color: palette.grass,
          lines: [
            { dx: -4, dy: 0, len: 7 + rand() * 4, angle: -0.25 },
            { dx: 0, dy: 0, len: 9 + rand() * 4, angle: 0 },
            { dx: 4, dy: 0, len: 6 + rand() * 4, angle: 0.25 },
          ],
        });
      }

      // 2. Procedural environmental structures & obstacles
      const obstacleCount = 4 + Math.floor(rand() * 5);
      for (let i = 0; i < obstacleCount; i++) {
        const ox = worldX + 60 + rand() * (CHUNK_SIZE - 120);
        const oy = worldY + 60 + rand() * (CHUNK_SIZE - 120);
        const objTypeRoll = rand();

        if (objTypeRoll < 0.4) {
          // Tree or Crystal Formation
          const radius = 22 + Math.floor(rand() * 10);
          objects.push({
            id: `inf_tree_${cx}_${cy}_${i}`,
            type: 'tree',
            x: ox,
            y: oy,
            radius,
            color: biome === 'frost_tundra' ? '#38bdf8' : biome === 'badlands' ? '#78350f' : undefined,
          });
          colliders.push({
            id: `inf_col_tree_${cx}_${cy}_${i}`,
            type: 'circle',
            x: ox,
            y: oy,
            radius: radius * 0.55,
          });
        } else if (objTypeRoll < 0.75) {
          // Ancient Ruin Column / Wasteland Barrier
          const rw = 40 + Math.floor(rand() * 30);
          const rh = 30 + Math.floor(rand() * 20);
          objects.push({
            id: `inf_ruin_${cx}_${cy}_${i}`,
            type: 'ruin',
            x: ox,
            y: oy,
            w: rw,
            h: rh,
            color: biome === 'wasteland_outpost' ? '#57534e' : '#475569',
          });
          colliders.push({
            id: `inf_col_ruin_${cx}_${cy}_${i}`,
            type: 'rect',
            x: ox,
            y: oy,
            w: rw,
            h: rh,
          });
        }
      }

      // 3. Supply Crate / Weapon Drop (40% chance per sector)
      if (rand() < 0.45) {
        const chestX = worldX + 100 + rand() * (CHUNK_SIZE - 200);
        const chestY = worldY + 100 + rand() * (CHUNK_SIZE - 200);
        const chestId = `inf_chest_${cx}_${cy}`;
        const isOpened = this.openedChestIds.has(chestId);

        // Distance from center scales rewards
        const distFromCenter = Math.hypot(cx, cy);
        const goldReward = 40 + Math.floor(distFromCenter * 25);

        // Chance to contain powerful gun, tech material, or ammo
        let droppedItem = 'ammo_cache';
        const lootRoll = rand();
        if (lootRoll < 0.45) {
          const gunPool = [
            'glock_gun',
            'shotgun_gun',
            'ak47_gun',
            'smg_gun',
            'sniper_gun',
            'plasma_gun',
            'rpg_gun',
            'tesla_gun',
            'flamethrower_gun',
            'minigun_gun',
            'cryo_gun',
            'railgun_gun',
            'cluster_missile_gun',
            'sawblade_gun',
            'orbital_strike_gun',
          ];
          const idx = Math.min(gunPool.length - 1, Math.floor(rand() * gunPool.length));
          droppedItem = gunPool[idx];
        } else if (lootRoll < 0.75) {
          const matPool = ['raw_ore', 'titanium_alloy', 'energy_cell', 'cyber_deck'];
          const mIdx = Math.floor(rand() * matPool.length);
          droppedItem = matPool[mIdx];
        }

        chests.push({
          id: chestId,
          x: chestX,
          y: chestY,
          opened: isOpened,
          gold: goldReward,
          itemId: droppedItem,
        });

        // Add small collider so player can't walk directly through unopened chest
        if (!isOpened) {
          colliders.push({
            id: `inf_col_${chestId}`,
            type: 'circle',
            x: chestX,
            y: chestY,
            radius: 16,
          });
        }
      }

      // 4. Procedural Enemy Spawns (Patrols and Swarms scaling with distance)
      // "lots of attackers with lots of types"
      const dist = Math.hypot(cx, cy);
      const enemyCount = 4 + Math.min(10, Math.floor(rand() * 4 + dist * 0.5));

      // Check if this sector spawns a roaming Titan Colossus World Boss
      const isTitanSector = dist >= 3.5 && (Math.abs(cx) % 4 === 2) && (Math.abs(cy) % 4 === 2);

      if (isTitanSector) {
        const titanId = `inf_titan_${cx}_${cy}`;
        const isDead = this.isEnemyKilled(titanId);
        const titanScale = 1 + Math.min(4, dist * 0.3);
        enemies.push({
          id: titanId,
          type: 'titan_colossus',
          name: `TITAN COLOSSUS PRIME LV.${Math.max(5, Math.round(dist * 2))}`,
          x: worldX + CHUNK_SIZE / 2,
          y: worldY + CHUNK_SIZE / 2,
          vx: 0,
          vy: 0,
          spawnX: worldX + CHUNK_SIZE / 2,
          spawnY: worldY + CHUNK_SIZE / 2,
          hp: isDead ? 0 : Math.round(1400 * titanScale),
          maxHp: Math.round(1400 * titanScale),
          shield: isDead ? 0 : Math.round(400 * titanScale),
          maxShield: Math.round(400 * titanScale),
          speed: 70,
          attack: Math.round(45 * titanScale),
          defense: Math.round(12 * titanScale),
          state: 'IDLE',
          stateTimer: 2,
          wanderTarget: null,
          attackCooldown: 0,
          hurtTimer: 0,
          isDead,
          respawnTimer: 0,
          xpValue: Math.round(400 * titanScale),
          goldMin: Math.round(150 * titanScale),
          goldMax: Math.round(350 * titanScale),
          radius: 38,
          isBoss: true,
          specialTimer: 2.0,
          color: '#dc2626',
        });
      }

      for (let i = 0; i < enemyCount; i++) {
        const enemyId = `inf_enemy_${cx}_${cy}_${i}`;
        const isDead = this.isEnemyKilled(enemyId);

        const ex = worldX + 80 + rand() * (CHUNK_SIZE - 160);
        const ey = worldY + 80 + rand() * (CHUNK_SIZE - 160);

        // Enemy variety based on biome and distance
        let enemyType:
          | 'wolf'
          | 'bandit'
          | 'skeleton'
          | 'cultist'
          | 'emp_spider'
          | 'stalker'
          | 'behemoth'
          | 'broodmother'
          | 'combat_drone'
          | 'mortar_walker'
          | 'shield_enforcer'
          | 'kamikaze_bomber'
          | 'sniper_assassin'
          | 'phase_shifter'
          | 'summoner_witch'
          | 'juggernaut_charger'
          | 'toxic_spitter'
          | 'tesla_shocktrooper'
          | 'commander_officer'
          | 'swarmer' = 'swarmer';

        const typeRoll = rand();

        if (biome === 'badlands' || biome === 'wasteland_outpost') {
          if (typeRoll < 0.12) enemyType = 'shield_enforcer';
          else if (typeRoll < 0.24) enemyType = 'kamikaze_bomber';
          else if (typeRoll < 0.36) enemyType = 'sniper_assassin';
          else if (typeRoll < 0.48) enemyType = 'juggernaut_charger';
          else if (typeRoll < 0.60) enemyType = 'mortar_walker';
          else if (typeRoll < 0.72) enemyType = 'combat_drone';
          else if (typeRoll < 0.84) enemyType = 'commander_officer';
          else enemyType = 'tesla_shocktrooper';
        } else if (biome === 'catacombs') {
          if (typeRoll < 0.15) enemyType = 'phase_shifter';
          else if (typeRoll < 0.30) enemyType = 'summoner_witch';
          else if (typeRoll < 0.45) enemyType = 'stalker';
          else if (typeRoll < 0.60) enemyType = 'toxic_spitter';
          else if (typeRoll < 0.75) enemyType = 'behemoth';
          else if (typeRoll < 0.88) enemyType = 'cultist';
          else enemyType = 'skeleton';
        } else if (biome === 'frost_tundra') {
          if (typeRoll < 0.18) enemyType = 'kamikaze_bomber';
          else if (typeRoll < 0.36) enemyType = 'shield_enforcer';
          else if (typeRoll < 0.54) enemyType = 'sniper_assassin';
          else if (typeRoll < 0.72) enemyType = 'broodmother';
          else if (typeRoll < 0.86) enemyType = 'combat_drone';
          else enemyType = 'swarmer';
        } else {
          // Woodlands & general sectors
          if (typeRoll < 0.15) enemyType = 'swarmer';
          else if (typeRoll < 0.30) enemyType = 'emp_spider';
          else if (typeRoll < 0.45) enemyType = 'kamikaze_bomber';
          else if (typeRoll < 0.60) enemyType = 'toxic_spitter';
          else if (typeRoll < 0.75) enemyType = 'shield_enforcer';
          else if (typeRoll < 0.88) enemyType = 'bandit';
          else enemyType = 'wolf';
        }

        // Stats scale smoothly with distance
        const levelScaling = 1 + Math.min(4.0, dist * 0.28);
        let baseHp = 60;
        let baseDmg = 12;
        let baseSpeed = 85;
        let shieldVal = 0;
        let enemyRadius = 16;
        let enemyColor = '#94a3b8';

        if (enemyType === 'shield_enforcer') {
          baseHp = 220;
          baseDmg = 18;
          baseSpeed = 75;
          shieldVal = Math.round(90 * levelScaling);
          enemyRadius = 20;
          enemyColor = '#0284c7';
        } else if (enemyType === 'kamikaze_bomber') {
          baseHp = 65;
          baseDmg = 55;
          baseSpeed = 160;
          enemyRadius = 14;
          enemyColor = '#f59e0b';
        } else if (enemyType === 'sniper_assassin') {
          baseHp = 80;
          baseDmg = 38;
          baseSpeed = 90;
          enemyRadius = 15;
          enemyColor = '#dc2626';
        } else if (enemyType === 'phase_shifter') {
          baseHp = 130;
          baseDmg = 24;
          baseSpeed = 110;
          shieldVal = Math.round(50 * levelScaling);
          enemyRadius = 17;
          enemyColor = '#a855f7';
        } else if (enemyType === 'summoner_witch') {
          baseHp = 160;
          baseDmg = 20;
          baseSpeed = 70;
          enemyRadius = 18;
          enemyColor = '#9333ea';
        } else if (enemyType === 'juggernaut_charger') {
          baseHp = 380;
          baseDmg = 34;
          baseSpeed = 65;
          shieldVal = Math.round(110 * levelScaling);
          enemyRadius = 25;
          enemyColor = '#ea580c';
        } else if (enemyType === 'toxic_spitter') {
          baseHp = 110;
          baseDmg = 16;
          baseSpeed = 80;
          enemyRadius = 16;
          enemyColor = '#84cc16';
        } else if (enemyType === 'tesla_shocktrooper') {
          baseHp = 150;
          baseDmg = 22;
          baseSpeed = 95;
          enemyRadius = 18;
          enemyColor = '#38bdf8';
        } else if (enemyType === 'commander_officer') {
          baseHp = 260;
          baseDmg = 25;
          baseSpeed = 80;
          shieldVal = Math.round(80 * levelScaling);
          enemyRadius = 21;
          enemyColor = '#eab308';
        } else if (enemyType === 'swarmer') {
          baseHp = 35;
          baseDmg = 9;
          baseSpeed = 145;
          enemyRadius = 12;
          enemyColor = '#f43f5e';
        } else if (enemyType === 'emp_spider') {
          baseHp = 95;
          baseDmg = 16;
          baseSpeed = 115;
          enemyColor = '#06b6d4';
        } else if (enemyType === 'stalker') {
          baseHp = 120;
          baseDmg = 28;
          baseSpeed = 125;
          enemyColor = '#8b5cf6';
        } else if (enemyType === 'behemoth') {
          baseHp = 350;
          baseDmg = 26;
          baseSpeed = 60;
          shieldVal = Math.round(120 * levelScaling);
          enemyRadius = 26;
          enemyColor = '#f97316';
        } else if (enemyType === 'broodmother') {
          baseHp = 220;
          baseDmg = 14;
          baseSpeed = 70;
          enemyRadius = 22;
          enemyColor = '#ec4899';
        } else if (enemyType === 'combat_drone') {
          baseHp = 85;
          baseDmg = 15;
          baseSpeed = 120;
          shieldVal = Math.round(40 * levelScaling);
          enemyColor = '#38bdf8';
        } else if (enemyType === 'mortar_walker') {
          baseHp = 180;
          baseDmg = 32;
          baseSpeed = 60;
          enemyRadius = 20;
          enemyColor = '#eab308';
        } else if (enemyType === 'wolf') {
          baseHp = 45;
          baseDmg = 10;
          baseSpeed = 120;
        } else if (enemyType === 'skeleton') {
          baseHp = 75;
          baseDmg = 14;
          baseSpeed = 80;
        } else if (enemyType === 'cultist') {
          baseHp = 50;
          baseDmg = 16;
          baseSpeed = 75;
        }

        const maxHp = Math.round(baseHp * levelScaling);
        const attackDmg = Math.round(baseDmg * levelScaling);

        enemies.push({
          id: enemyId,
          type: enemyType,
          name: `${enemyType.replace('_', ' ').toUpperCase()} LV.${Math.max(1, Math.round(dist))}`,
          x: ex,
          y: ey,
          vx: 0,
          vy: 0,
          spawnX: ex,
          spawnY: ey,
          hp: isDead ? 0 : maxHp,
          maxHp,
          shield: isDead ? 0 : shieldVal,
          maxShield: shieldVal,
          speed: baseSpeed + rand() * 20,
          attack: attackDmg,
          defense: Math.round(2 * levelScaling),
          state: 'IDLE',
          stateTimer: 1 + rand() * 2,
          wanderTarget: null,
          attackCooldown: 0,
          hurtTimer: 0,
          isDead,
          respawnTimer: 0,
          xpValue: Math.round(25 * levelScaling),
          goldMin: Math.round(10 * levelScaling),
          goldMax: Math.round(30 * levelScaling),
          radius: enemyRadius,
          specialTimer: 2.0 + rand() * 2,
          isCloaked: enemyType === 'stalker',
          color: enemyColor,
          isShieldUp: enemyType === 'shield_enforcer',
        });
      }
    }

    return {
      cx,
      cy,
      key,
      biome,
      region,
      grassTufts,
      objects,
      colliders,
      chests,
      enemies,
      isCoreZone: isCore,
    };
  }

  public recordChestOpened(id: string) {
    this.openedChestIds.add(id);
    for (const chunk of this.chunks.values()) {
      const c = chunk.chests.find(item => item.id === id);
      if (c) {
        c.opened = true;
      }
    }
  }

  /**
   * Returns all active chunks intersecting the visible screen viewport + 1 buffer ring
   */
  public getVisibleChunks(
    playerX: number,
    playerY: number,
    screenW: number,
    screenH: number
  ): InfiniteChunk[] {
    const minX = playerX - screenW / 2 - CHUNK_SIZE;
    const maxX = playerX + screenW / 2 + CHUNK_SIZE;
    const minY = playerY - screenH / 2 - CHUNK_SIZE;
    const maxY = playerY + screenH / 2 + CHUNK_SIZE;

    const startCx = Math.floor(minX / CHUNK_SIZE);
    const endCx = Math.floor(maxX / CHUNK_SIZE);
    const startCy = Math.floor(minY / CHUNK_SIZE);
    const endCy = Math.floor(maxY / CHUNK_SIZE);

    const visible: InfiniteChunk[] = [];
    for (let cx = startCx; cx <= endCx; cx++) {
      for (let cy = startCy; cy <= endCy; cy++) {
        visible.push(this.getChunk(cx, cy));
      }
    }
    return visible;
  }
}

export const infiniteWorldManager = new InfiniteWorldManager();
