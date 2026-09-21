import { FactoryBuilding, ColonyState, ResourceNode, BuildingType, Enemy, Projectile } from '../types';
import { FACTORY_BLUEPRINTS, BuildingBlueprint } from './constants';
import { soundManager } from '../audio/soundManager';

export class FactoryManager {
  public buildings: FactoryBuilding[] = [];
  public resourceNodes: ResourceNode[] = [];
  public colony: ColonyState = {
    name: 'Sector-4 Outpost',
    population: 6,
    colonists: 6,
    maxPopulation: 14,
    powerProduced: 50,
    powerConsumed: 18,
    powerProduction: 50,
    powerConsumption: 18,
    rawOre: 90,
    titanium: 40,
    energyCells: 25,
    colonyCredits: 200,
    defenseRating: 50,
    raidTimer: 180,
    raidActive: false,
    raidWave: 1,
  };

  constructor() {
    this.initStartingColony();
    this.initResourceNodes();
  }

  public initStartingColony() {
    this.buildings = [
      {
        id: 'colony_hub_1',
        type: 'command_hub',
        name: 'Colony Command Hub',
        x: 1650,
        y: 1650,
        level: 1,
        hp: 800,
        maxHp: 800,
        powerKw: 15,
        isActive: true,
        productionTimer: 0,
        productionInterval: 5,
        defenseRange: 280,
        color: '#38bdf8',
      },
      {
        id: 'solar_gen_1',
        type: 'solar_generator',
        name: 'Solar Power Array Alpha',
        x: 1740,
        y: 1600,
        level: 1,
        hp: 300,
        maxHp: 300,
        powerKw: 35,
        isActive: true,
        productionTimer: 0,
        productionInterval: 1,
        color: '#facc15',
      },
      {
        id: 'ore_extractor_1',
        type: 'ore_extractor',
        name: 'Automated Ore Extractor #1',
        x: 1780,
        y: 1720,
        level: 1,
        hp: 400,
        maxHp: 400,
        powerKw: -8,
        isActive: true,
        productionTimer: 0,
        productionInterval: 3.0,
        color: '#fb923c',
      },
      {
        id: 'defense_turret_1',
        type: 'defense_turret',
        name: 'Twin-Gatling Sentry Tower',
        x: 1580,
        y: 1760,
        level: 1,
        hp: 450,
        maxHp: 450,
        powerKw: -12,
        isActive: true,
        productionTimer: 0,
        productionInterval: 0.25,
        defenseRange: 380,
        color: '#ef4444',
      },
    ];
    this.recalculatePowerAndStats();
  }

  public initResourceNodes() {
    this.resourceNodes = [
      { id: 'node_iron_1', type: 'iron', x: 1820, y: 1760, amount: 850, maxAmount: 1000, richness: 1.2 },
      { id: 'node_iron_2', type: 'iron', x: 1950, y: 1550, amount: 600, maxAmount: 800, richness: 1.0 },
      { id: 'node_titanium_1', type: 'titanium', x: 1350, y: 1850, amount: 450, maxAmount: 500, richness: 1.5 },
      { id: 'node_plasma_1', type: 'plasma', x: 2100, y: 1700, amount: 300, maxAmount: 400, richness: 2.0 },
      { id: 'node_salvage_1', type: 'salvage', x: 1420, y: 1350, amount: 400, maxAmount: 400, richness: 1.1 },
    ];
  }

  public recalculatePowerAndStats() {
    let produced = 0;
    let consumed = 0;
    let defense = 20;
    let maxPop = 8;

    for (const b of this.buildings) {
      if (!b.isActive) continue;
      if (b.powerKw > 0) produced += b.powerKw * (b.level * 0.8 + 0.2);
      else consumed += Math.abs(b.powerKw);

      if (b.type === 'defense_turret') defense += 30 * b.level;
      if (b.type === 'laser_turret') defense += 50 * b.level;
      if (b.type === 'shield_dome' || b.type === 'shield_generator') defense += 40 * b.level;
      if (b.type === 'habitat' || b.type === 'bio_dome') maxPop += 6 * b.level;
    }

    this.colony.powerProduced = Math.round(produced);
    this.colony.powerConsumed = Math.round(consumed);
    this.colony.powerProduction = Math.round(produced);
    this.colony.powerConsumption = Math.round(consumed);
    this.colony.defenseRating = defense;
    this.colony.maxPopulation = maxPop;
    this.colony.colonists = this.colony.population ?? 6;
  }

  public canAfford(bp: BuildingBlueprint): boolean {
    return (
      this.colony.rawOre >= bp.costOre &&
      this.colony.titanium >= bp.costTitanium &&
      this.colony.energyCells >= bp.costEnergyCells &&
      this.colony.colonyCredits >= bp.costGold
    );
  }

  public constructBuilding(type: BuildingType, x: number, y: number): boolean {
    const res = this.buildStructure(type, x, y);
    return res.success;
  }

  public buildStructure(type: BuildingType, x: number, y: number): { success: boolean; msg: string } {
    let bp = FACTORY_BLUEPRINTS[type];
    if (!bp) {
      if (type === 'bio_dome') bp = FACTORY_BLUEPRINTS['habitat'];
      else if (type === 'vehicle_factory') bp = FACTORY_BLUEPRINTS['vehicle_foundry'];
      else if (type === 'shield_generator') bp = FACTORY_BLUEPRINTS['shield_dome'];
    }
    if (!bp) return { success: false, msg: 'Unknown Blueprint' };

    if (!this.canAfford(bp)) {
      return { success: false, msg: 'Insufficient Colony Resources!' };
    }

    // Deduct cost
    this.colony.rawOre -= bp.costOre;
    this.colony.titanium -= bp.costTitanium;
    this.colony.energyCells -= bp.costEnergyCells;
    this.colony.colonyCredits -= bp.costGold;

    const newBuilding: FactoryBuilding = {
      id: `bld_${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      name: bp.name,
      x,
      y,
      level: 1,
      hp: bp.hp,
      maxHp: bp.hp,
      powerKw: bp.powerKw,
      isActive: true,
      productionTimer: 0,
      productionInterval:
        type === 'ore_extractor' ? 3.0 : type === 'ammo_fabricator' ? 4.0 : type === 'defense_turret' ? 0.25 : 2.0,
      defenseRange: type === 'defense_turret' ? 380 : type === 'laser_turret' ? 440 : undefined,
      color: bp.color,
    };

    this.buildings.push(newBuilding);
    this.recalculatePowerAndStats();
    soundManager.playBuildingConstructed();

    return { success: true, msg: `Constructed ${bp.name}!` };
  }

  public repairBuilding(buildingId: string): boolean {
    const res = this.repairStructure(buildingId);
    return res.success;
  }

  public repairStructure(buildingId: string): { success: boolean; msg: string } {
    const b = this.buildings.find(item => item.id === buildingId);
    if (!b) return { success: false, msg: 'Building not found' };
    if (b.hp >= b.maxHp) return { success: false, msg: 'Building is already at full integrity' };

    const repairCostOre = 10;
    if (this.colony.rawOre < repairCostOre) {
      return { success: false, msg: 'Need 10 Raw Ore to repair!' };
    }

    this.colony.rawOre -= repairCostOre;
    b.hp = b.maxHp;
    soundManager.playEquipGun();
    return { success: true, msg: `Repaired ${b.name} to full health!` };
  }

  public upgradeBuilding(buildingId: string): { success: boolean; msg: string } {
    const b = this.buildings.find(item => item.id === buildingId);
    if (!b) return { success: false, msg: 'Building not found' };

    const upgradeCostOre = Math.round(20 * b.level);
    const upgradeCostTitanium = Math.round(15 * b.level);
    if (this.colony.rawOre < upgradeCostOre || this.colony.titanium < upgradeCostTitanium) {
      return { success: false, msg: 'Need more Ore & Titanium to upgrade!' };
    }

    this.colony.rawOre -= upgradeCostOre;
    this.colony.titanium -= upgradeCostTitanium;
    b.level++;
    b.maxHp += 150;
    b.hp = b.maxHp;
    this.recalculatePowerAndStats();
    soundManager.playBuildingConstructed();

    return { success: true, msg: `${b.name} upgraded to Level ${b.level}!` };
  }

  public dismantleBuilding(buildingId: string): { success: boolean; msg: string } {
    const idx = this.buildings.findIndex(item => item.id === buildingId);
    if (idx === -1) return { success: false, msg: 'Building not found' };

    const b = this.buildings[idx];
    const bp = FACTORY_BLUEPRINTS[b.type];
    if (bp) {
      // Refund 60% of materials
      this.colony.rawOre += Math.round(bp.costOre * 0.6);
      this.colony.titanium += Math.round(bp.costTitanium * 0.6);
      this.colony.energyCells += Math.round(bp.costEnergyCells * 0.6);
    }
    this.buildings.splice(idx, 1);
    this.recalculatePowerAndStats();
    soundManager.playCoin();

    return { success: true, msg: `Dismantled ${b.name} (Salvaged 60% resources)` };
  }

  public update(
    dt: number,
    enemies: Enemy[],
    projectiles: Projectile[],
    onNotify: (msg: string, color: string) => void
  ) {
    const isPowered = this.colony.powerProduced >= this.colony.powerConsumed;

    // 1. Update Buildings
    for (const b of this.buildings) {
      if (!b.isActive) continue;

      // Hacked overclock duration countdown
      if (b.overclockTimer && b.overclockTimer > 0) {
        b.overclockTimer -= dt;
      }
      const speedMultiplier = b.overclockTimer && b.overclockTimer > 0 ? 2.5 : 1.0;

      b.productionTimer += dt * speedMultiplier;

      // Extractors produce Ore
      if (b.type === 'ore_extractor' && isPowered) {
        if (b.productionTimer >= b.productionInterval) {
          b.productionTimer = 0;
          const yieldOre = Math.round(1 * b.level * speedMultiplier);
          this.colony.rawOre += yieldOre;
          this.colony.colonyCredits += 2;
        }
      }

      // Ammo Fabricators produce munitions
      if (b.type === 'ammo_fabricator' && isPowered) {
        if (b.productionTimer >= b.productionInterval) {
          b.productionTimer = 0;
          if (this.colony.rawOre >= 2) {
            this.colony.rawOre -= 2;
            this.colony.colonyCredits += 5;
          }
        }
      }

      // Sentry Gatling Turrets auto-fire upon enemies
      if (b.type === 'defense_turret' && isPowered) {
        if (b.productionTimer >= b.productionInterval) {
          b.productionTimer = 0;
          const target = this.findNearestHostileEnemy(b.x, b.y, b.defenseRange || 380, enemies);
          if (target) {
            this.fireTurretRound(b, target, projectiles);
          }
        }
      }

      // Laser Towers fire thermal beam
      if (b.type === 'laser_turret' && isPowered) {
        if (b.productionTimer >= (b.productionInterval || 1.0)) {
          b.productionTimer = 0;
          const target = this.findNearestHostileEnemy(b.x, b.y, b.defenseRange || 450, enemies);
          if (target) {
            this.fireLaserTurret(b, target, projectiles);
          }
        }
      }
    }

    // 2. Colony Population and Credits Growth
    if (Math.random() < 0.05 * dt) {
      if (this.colony.population < this.colony.maxPopulation && this.colony.powerProduced > this.colony.powerConsumed) {
        this.colony.population++;
        this.colony.colonyCredits += 25;
        onNotify(`Colonist joined! Population: ${this.colony.population}`, '#38bdf8');
      }
    }

    // 3. Raid Timer and Invasions
    this.colony.raidTimer -= dt;
    if (this.colony.raidTimer <= 0) {
      this.colony.raidTimer = 180; // Next raid in 3 minutes
      this.colony.raidWave++;
      onNotify(`⚠️ HOSTILE SECTOR RAID INCOMING! Wave ${this.colony.raidWave}!`, '#ef4444');
      soundManager.playBossExplosion();
    }
  }

  private findNearestHostileEnemy(x: number, y: number, maxRange: number, enemies: Enemy[]): Enemy | null {
    let nearest: Enemy | null = null;
    let minDist = maxRange;

    for (const e of enemies) {
      if (e.isDead || e.isHacked) continue;
      const dist = Math.hypot(e.x - x, e.y - y);
      if (dist < minDist) {
        minDist = dist;
        nearest = e;
      }
    }
    return nearest;
  }

  private fireTurretRound(b: FactoryBuilding, target: Enemy, projectiles: Projectile[]) {
    const angle = Math.atan2(target.y - b.y, target.x - b.x);
    const speed = 750;
    projectiles.push({
      id: `turret_bullet_${Math.random()}`,
      x: b.x,
      y: b.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 4,
      damage: 18 * b.level,
      life: 0.6,
      maxLife: 0.6,
      isHostile: false,
      isPlayerBullet: true,
      color: '#fb923c',
      penetration: 1,
      hitEntityIds: [],
    });
    soundManager.playPistolShot();
  }

  private fireLaserTurret(b: FactoryBuilding, target: Enemy, projectiles: Projectile[]) {
    const angle = Math.atan2(target.y - b.y, target.x - b.x);
    const speed = 1100;
    projectiles.push({
      id: `laser_turret_${Math.random()}`,
      x: b.x,
      y: b.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 6,
      damage: 48 * b.level,
      life: 0.5,
      maxLife: 0.5,
      isHostile: false,
      isPlayerBullet: true,
      color: '#c084fc',
      isLaser: true,
      penetration: 2,
      hitEntityIds: [],
    });
    soundManager.playLaserShot();
  }
}
