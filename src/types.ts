/**
 * Ashen Road - Types & Data Models
 */

export type GameMode =
  | 'TITLE'
  | 'PLAYING'
  | 'DIALOGUE'
  | 'INVENTORY'
  | 'QUESTS'
  | 'SHOP'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'VICTORY'
  | 'COLONY'
  | 'HACKING'
  | 'RADIAL_WEAPONS'
  | 'WEAPON_UPGRADE'
  | 'SHORTCUTS_GUIDE'
  | 'MISSION_WALKTHROUGH';

export type ItemType = 'WEAPON' | 'GUN' | 'ARMOR' | 'CONSUMABLE' | 'QUEST' | 'MISC' | 'TOOL' | 'MATERIAL';

export type GunId =
  | 'glock'
  | 'shotgun'
  | 'ak47'
  | 'sniper'
  | 'smg'
  | 'rpg'
  | 'plasma'
  | 'tesla'
  | 'flamethrower'
  | 'minigun'
  | 'cryo'
  | 'railgun'
  | 'cluster_missile'
  | 'sawblade'
  | 'orbital_strike';

export interface GunConfig {
  id: GunId;
  name: string;
  category: string;
  damage: number;
  fireRate: number; // shots per second
  magSize: number;
  currentMag: number;
  reserveAmmo: number;
  maxReserveAmmo: number;
  reloadTime: number; // in seconds
  bulletSpeed: number;
  bulletCount: number; // pellets per trigger pull
  spread: number; // radians
  recoil: number; // screen shake amount
  knockback: number;
  range: number;
  isAuto: boolean;
  penetration: number; // number of enemies it can pierce
  splashRadius: number; // explosion radius in pixels
  isRocket?: boolean;
  isLaser?: boolean;
  isTesla?: boolean;
  isFlamethrower?: boolean;
  isCryo?: boolean;
  isRailgun?: boolean;
  isCluster?: boolean;
  isSawblade?: boolean;
  isOrbital?: boolean;
  color: string;
  description: string;
  value: number;
  // Weapon Evolution & Advancement
  tier?: number; // 1 to 5
  weaponXp?: number;
  weaponXpMax?: number;
  kills?: number;
  advancementPerk?: string;
  advancementName?: string;
}

export type Gun = GunConfig;

export type VehicleType =
  | 'scout_buggy'
  | 'siege_tank'
  | 'mech_walker'
  | 'harvester'
  | 'mafia_sedan'
  | 'muscle_car'
  | 'armored_van'
  | 'sports_coupe'
  | 'river_speedboat'
  | 'patrol_gunboat';

export interface VehiclePassenger {
  id: string;
  name: string;
  isPlayer?: boolean;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  name: string;
  x: number;
  y: number;
  angle: number;
  speed: number;
  maxSpeed: number;
  hp: number;
  maxHp: number;
  armor: number;
  shield: number;
  maxShield: number;
  weaponCooldown: number;
  isOccupied?: boolean;
  color: string;
  icon?: string;
  weaponType: 'dual_blaster' | 'heavy_cannon' | 'twin_vulcan' | 'mining_drill' | 'tommy_turret' | 'boat_cannon' | 'ram_bumper';
  isBoat?: boolean;
  passengers?: VehiclePassenger[];
  maxPassengers?: number;
  isDestroyed?: boolean;
  destroyedTimer?: number;
  smokeTimer?: number;
  flameTimer?: number;
}

export type BuildingType =
  | 'command_hub'
  | 'habitat'
  | 'ore_extractor'
  | 'solar_generator'
  | 'fusion_reactor'
  | 'ammo_fabricator'
  | 'defense_turret'
  | 'laser_turret'
  | 'vehicle_foundry'
  | 'vehicle_factory'
  | 'bio_dome'
  | 'shield_generator'
  | 'shield_dome'
  | 'speakeasy'
  | 'casino'
  | 'arms_depot'
  | 'guard_tower'
  | 'boat_marina'
  | 'chop_shop'
  | 'safehouse_hq';

export type FactoryBuildingType = BuildingType;

export interface FactoryBuilding {
  id: string;
  type: BuildingType;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  level: number;
  powerKw: number; // Positive generates, negative consumes
  outputTimer?: number;
  outputInterval?: number;
  productionTimer?: number;
  productionInterval?: number;
  defenseRange?: number;
  color?: string;
  productionRate?: number;
  isActive: boolean;
  targetEnemyId?: string;
  attackCooldown?: number;
  isOverclocked?: boolean;
  overclockTimer?: number;
}

export interface ColonyState {
  name?: string;
  population?: number;
  maxPopulation?: number;
  colonists?: number;
  powerProduced?: number;
  powerConsumed?: number;
  powerProduction?: number;
  powerConsumption?: number;
  rawOre: number;
  titanium: number;
  energyCells: number;
  colonyCredits: number;
  defenseRating: number;
  raidTimer: number;
  raidActive: boolean;
  raidWave: number;
}

export interface ResourceNode {
  id: string;
  type: 'iron_vein' | 'titanium_deposit' | 'plasma_crystal' | 'salvage_wreck' | 'iron' | 'titanium' | 'plasma' | 'salvage';
  name?: string;
  x: number;
  y: number;
  resourcesRemaining?: number;
  maxResources?: number;
  amount: number;
  maxAmount?: number;
  radius?: number;
  color?: string;
  richness?: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  stackable: boolean;
  quantity: number;
  value: number;
  damage?: number;
  defense?: number;
  restoreHp?: number;
  gunConfig?: GunConfig;
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
}

export interface Player {
  x: number;
  y: number;
  facingAngle: number; // in radians
  aimAngle: number; // gun aim towards crosshair
  speed: number;
  level: number;
  xp: number;
  gold: number;
  maxHp: number;
  hp: number;
  maxStamina: number;
  stamina: number;
  baseAttack: number;
  baseDefense: number;
  isAttacking: boolean;
  attackCooldown: number;
  attackAnimTimer: number;
  isSprinting: boolean;
  // Modern Shooter & Gun mechanics
  isShooting: boolean;
  shootCooldown: number;
  isReloading: boolean;
  reloadTimer: number;
  muzzleFlashTimer: number;
  hitmarkerTimer: number;
  // Tactical Dash / Dodge Roll
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  dashVx: number;
  dashVy: number;
  invulnerableTimer: number;
  // Gun Arsenal
  selectedGunIndex: number;
  unlockedGuns: GunConfig[];
  inventory: Item[];
  equipment: Equipment;
  staminaRegenDelay: number;
  // Hacking & Tech
  cyberEnergy: number;
  maxCyberEnergy: number;
  // Vehicle state
  mountedVehicle: Vehicle | null;
  // Infinite Ammo Toggle Mode
  isInfiniteAmmo?: boolean;
  // Auto-Aim and Auto-Shoot capabilities (default ON)
  autoAim: boolean;
  autoShoot: boolean;
  autoAimTargetId?: string | null;
  autoAimRange?: number;
}

export type FactionType =
  | 'player_syndicate'
  | 'moretti_mob'
  | 'bratva_cartel'
  | 'yakuza_clan'
  | 'civilians'
  | 'civilian'
  | 'neutral'
  | 'police';

export interface RespawnLocation {
  id: string;
  name: string;
  district: string;
  x: number;
  y: number;
  description: string;
  tag: string;
  color: string;
}

export interface CityDistrict {
  id: string;
  name: string;
  districtKey: string;
  x: number;
  y: number;
  width: number;
  height: number;
  controlledBy: FactionType;
  color: string;
  influence: number; // 0 to 100%
  isConquered: boolean;
  bossDefeated?: boolean;
  totalEnemies: number;
  remainingEnemies: number;
  flavor: string;
}

export interface VoiceBriefing {
  id: string;
  speaker: string;
  role: string;
  title: string;
  audioText: string;
  writtenText: string;
  missionId?: string;
  districtId?: string;
  timestamp?: number;
}

export interface HumanVisual {
  outfit?: 'pinstripe_suit' | 'trenchcoat' | 'vest' | 'leather_jacket' | 'hoodie' | 'dress' | 'fedora_suit' | string;
  hat?: 'fedora' | 'flat_cap' | 'none' | 'sunglasses' | 'bandana' | string;
  hatType?: string;
  hatColor?: string;
  hairColor: string;
  shirtColor?: string;
  suitColor: string;
  tieColor?: string;
  skinTone: string;
  hasCigar?: boolean;
  weaponInHands?: string;
  weaponHeld?: string;
  walkCycle?: number;
}

export type DestructiblePropType =
  | 'hydrant'
  | 'barrel'
  | 'streetlight'
  | 'crate'
  | 'dumpster'
  | 'bench'
  | 'barrier'
  | 'parking_meter'
  | 'fire_hydrant'
  | 'explosive_barrel'
  | 'street_lamp'
  | 'shipping_crate';

export interface DestructibleProp {
  id: string;
  type: DestructiblePropType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  isDestroyed: boolean;
  waterSprayTimer?: number;
  explosionTimer?: number;
  radius: number;
  color?: string;
}

export interface TurfDistrict {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  controllingFaction: FactionType;
  playerControlPercent: number; // 0 - 100
  incomePerMin: number;
  color: string;
  description: string;
}

export type EnemyType =
  | 'wolf'
  | 'bandit'
  | 'skeleton'
  | 'cultist'
  | 'boss'
  | 'emp_spider'
  | 'stalker'
  | 'behemoth'
  | 'broodmother'
  | 'swarmer'
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
  | 'titan_colossus'
  // Mafia Syndicate Human Types
  | 'mafia_tommy_gunner'
  | 'mafia_enforcer'
  | 'mafia_hitman'
  | 'mafia_capo'
  | 'mafia_don'
  | 'bratva_soldier'
  | 'yakuza_ronin'
  | 'syndicate_sniper'
  | 'friendly_troop'
  | 'civilian_pedestrian';

export type EnemyState = 'IDLE' | 'WANDER' | 'CHASE' | 'ATTACK' | 'HURT' | 'DEAD';

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  xpValue: number;
  goldMin: number;
  goldMax: number;
  state: EnemyState;
  stateTimer: number;
  wanderTarget: { x: number; y: number } | null;
  attackCooldown: number;
  hurtTimer: number;
  spawnX: number;
  spawnY: number;
  isDead: boolean;
  respawnTimer: number;
  radius: number;
  isBoss?: boolean;
  bossAttackPattern?: number; // 0 = slash, 1 = projectile, 2 = ground burst
  bossAttackTimer?: number;
  // Advanced Enemy Properties
  shield?: number;
  maxShield?: number;
  isCloaked?: boolean;
  cloakTimer?: number;
  isHacked?: boolean;
  hackedTimer?: number;
  hackDuration?: number;
  specialTimer?: number;
  mortarTarget?: { x: number; y: number } | null;
  empTimer?: number;
  color?: string;
  // Intelligent Enemy Combat Properties
  sniperLaserTimer?: number;
  sniperAngle?: number;
  isCharging?: boolean;
  chargeVx?: number;
  chargeVy?: number;
  chargeTimer?: number;
  shieldAngle?: number;
  isShieldUp?: boolean;
  isKamikazeTicking?: boolean;
  kamikazeFuse?: number;
  summonTimer?: number;
  acidCooldown?: number;
  isBuffedByCommander?: boolean;
  // Mafia Syndicate & Human Character Properties
  faction?: FactionType;
  humanVisual?: HumanVisual;
  isTroop?: boolean;
  troopCommand?: 'follow' | 'hold' | 'attack';
  isCivilian?: boolean;
  panicTimer?: number;
  facingAngle?: number;
  targetEnemyId?: string;
  driveByCooldown?: number;
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  x: number;
  y: number;
  dialogueSequence: string[];
  currentDialogueIndex?: number;
  questToOffer?: string;
  isShop?: boolean;
  isInn?: boolean;
  shopInventory?: string[]; // item IDs
  iconType?: 'elder' | 'blacksmith' | 'innkeeper' | 'merchant';
}

export type QuestStatus = 'NOT_STARTED' | 'ACTIVE' | 'COMPLETED';

export interface QuestObjective {
  id: string;
  text: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  objectives: QuestObjective[];
  rewards: {
    xp: number;
    gold: number;
    itemId?: string;
  };
}

export interface Chest {
  id: string;
  x: number;
  y: number;
  opened: boolean;
  gold: number;
  itemId?: string;
  requiresGuardsDefeated?: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  life: number;
  maxLife: number;
  isHostile: boolean;
  color: string;
  isPlayerBullet?: boolean;
  penetration?: number;
  splashRadius?: number;
  isRocket?: boolean;
  isLaser?: boolean;
  isTesla?: boolean;
  isFlamethrower?: boolean;
  isCryo?: boolean;
  isRailgun?: boolean;
  isSawblade?: boolean;
  isOrbital?: boolean;
  ricochetsRemaining?: number;
  isCluster?: boolean;
  knockback?: number;
  hitEntityIds?: string[];
  trailTimer?: number;
  isHoming?: boolean;
  homingTargetId?: string;
  isAcidPool?: boolean;
  isSniperBeam?: boolean;
}

export interface DangerZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  timer: number;
  maxTimer: number;
  exploded: boolean;
  damage: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  shape?: 'circle' | 'spark' | 'smoke';
}

export interface DamageNumber {
  id: string;
  text: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  isCrit: boolean;
  color: string;
}

export interface Collider {
  id: string;
  type: 'circle' | 'rect';
  x: number;
  y: number;
  radius?: number;
  w?: number;
  h?: number;
  name?: string;
}

export interface WorldObject {
  id: string;
  type:
    | 'tree'
    | 'rock'
    | 'house'
    | 'fountain'
    | 'cart'
    | 'ruin'
    | 'gate'
    | 'inscription'
    | 'skyscraper'
    | 'bank'
    | 'casino'
    | 'warehouse'
    | 'pier'
    | 'bridge'
    | 'neon_sign'
    | 'street_lamp'
    | 'road'
    | 'dock';
  x: number;
  y: number;
  w?: number;
  h?: number;
  radius?: number;
  color?: string;
  roofColor?: string;
  interactable?: boolean;
  interactionPrompt?: string;
  onInteractId?: string;
  label?: string;
}

export interface SaveData {
  version: number;
  timestamp: number;
  player: {
    x: number;
    y: number;
    level: number;
    xp: number;
    gold: number;
    hp: number;
    maxHp: number;
    stamina: number;
    maxStamina: number;
    baseAttack: number;
    baseDefense: number;
    inventory: Item[];
    equipment: Equipment;
    autoAim?: boolean;
    autoShoot?: boolean;
    isInfiniteAmmo?: boolean;
    unlockedGuns?: Gun[];
    selectedGunIndex?: number;
  };
  quests: Record<string, QuestStatus>;
  questProgress: Record<string, number[]>;
  chests: Record<string, boolean>;
  world: {
    watchtowerExamined: boolean;
    bossDefeated: boolean;
    dayTime: number; // 0 to 600 seconds
  };
  colony?: ColonyState;
  buildings?: FactoryBuilding[];
  vehicles?: Vehicle[];
}
