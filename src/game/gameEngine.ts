/**
 * Ashen Road - Core Game Engine
 * Coordinates physics, AI state machines, combat, quests, inventory, and events
 */
import {
  GameMode,
  Player,
  Enemy,
  NPC,
  Quest,
  Chest,
  Projectile,
  DangerZone,
  Item,
  GunConfig,
} from '../types';
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  PLAYER_BASE_SPEED,
  PLAYER_SPRINT_SPEED,
  SPRINT_STAMINA_COST,
  ATTACK_STAMINA_COST,
  ATTACK_COOLDOWN,
  ATTACK_RANGE,
  STAMINA_REGEN_RATE,
  STAMINA_REGEN_DELAY,
  INTERACTION_RANGE,
  DASH_SPEED,
  DASH_DURATION,
  DASH_COOLDOWN,
  DASH_STAMINA_COST,
  ITEMS,
  NPCS,
  INITIAL_QUESTS,
  INITIAL_GUN_ARSENAL,
  FACTORY_BLUEPRINTS,
  VEHICLE_BLUEPRINTS,
  RESPAWN_LOCATIONS,
} from './constants';
import { generateWorld, WorldData } from './worldGen';
import { resolveMovement, depenetratePosition } from './collision';
import { infiniteWorldManager, InfiniteChunk } from './infiniteWorld';
import {
  spawnInitialEnemies,
  isPointInAttackArc,
  calculatePlayerDamage,
  calculateDamageToPlayer,
  getXpRequired,
} from './combat';
import { ParticleSystem } from './particles';
import { soundManager } from '../audio/soundManager';
import { saveGame, loadGame } from './saveManager';
import { FactoryManager } from './factoryManager';
import { VehicleManager } from './vehicleManager';
import { HackManager } from './hackManager';
import {
  Vehicle,
  FactoryBuilding,
  ColonyState,
  ResourceNode,
  BuildingType,
  VehicleType,
  CityDistrict,
  RespawnLocation,
} from '../types';
import { voiceNarrator } from '../audio/voiceNarrator';
import { MISSION_BRIEFINGS } from './missionNarratives';

export class GameEngine {
  public mode: GameMode = 'TITLE';
  public player: Player;
  public enemies: Enemy[] = [];
  public npcs: NPC[] = [];
  public quests: Quest[] = [];
  public world: WorldData;
  public projectiles: Projectile[] = [];
  public dangerZones: DangerZone[] = [];
  public particles = new ParticleSystem();
  public camera = { x: 0, y: 0 };
  public dayTime = 60; // Start in daytime
  public isGateUnlocked = false;

  // Open-World City Districts & Territory Conquest
  public districts: CityDistrict[] = [
    {
      id: 'dist_little_italy',
      name: 'Little Italy (Safehouse Sanctuary)',
      districtKey: 'little_italy',
      x: 1000,
      y: 1100,
      width: 1000,
      height: 900,
      controlledBy: 'player_syndicate',
      color: '#10b981',
      influence: 100,
      isConquered: true,
      totalEnemies: 0,
      remainingEnemies: 0,
      flavor: 'Falcone Family fortified safehouse and courtyard.',
    },
    {
      id: 'dist_downtown',
      name: 'Downtown Financial & City Bank',
      districtKey: 'downtown',
      x: 1200,
      y: 100,
      width: 1200,
      height: 900,
      controlledBy: 'moretti_mob',
      color: '#ef4444',
      influence: 15,
      isConquered: false,
      totalEnemies: 8,
      remainingEnemies: 8,
      flavor: 'Moretti Mob fortress with heavily guarded cash vaults.',
    },
    {
      id: 'dist_waterfront',
      name: 'Waterfront Smuggler Docks',
      districtKey: 'waterfront',
      x: 100,
      y: 1100,
      width: 900,
      height: 1000,
      controlledBy: 'bratva_cartel',
      color: '#3b82f6',
      influence: 10,
      isConquered: false,
      totalEnemies: 6,
      remainingEnemies: 6,
      flavor: 'Bratva Cartel shipping containers and black-market depots.',
    },
    {
      id: 'dist_chinatown',
      name: 'Chinatown Neon Strip',
      districtKey: 'chinatown',
      x: 100,
      y: 100,
      width: 1100,
      height: 1000,
      controlledBy: 'yakuza_clan',
      color: '#a855f7',
      influence: 20,
      isConquered: false,
      totalEnemies: 7,
      remainingEnemies: 7,
      flavor: 'Yakuza Clan high-tech casinos and neon alleys.',
    },
    {
      id: 'dist_industrial',
      name: 'Industrial Rail Yard & Chop Shop',
      districtKey: 'industrial',
      x: 2200,
      y: 1000,
      width: 1200,
      height: 1100,
      controlledBy: 'neutral',
      color: '#64748b',
      influence: 0,
      isConquered: false,
      totalEnemies: 9,
      remainingEnemies: 9,
      flavor: 'Contested train depots, automated workshops, and scrap yards.',
    },
  ];

  // Mobile / Touch controls sync listener callback
  public onMobileControlsChange?: (visible: boolean) => void;

  public getDistricts(): CityDistrict[] {
    return this.districts;
  }

  // Infinite World & Shooter extensions
  public crosshair = { x: 1500, y: 1400, screenX: 400, screenY: 300 };
  public screenShake = { x: 0, y: 0, intensity: 0 };
  public infiniteChunks: InfiniteChunk[] = [];
  public activeInfiniteEnemies: Enemy[] = [];

  // Factory, Colony, Vehicle & Cyber Systems
  public factoryMgr = new FactoryManager();
  public vehicleMgr = new VehicleManager();
  public hackMgr = new HackManager();

  // Mobile / Touchscreen controls state
  public touchMovement = { dx: 0, dy: 0, active: false };
  public touchAim = { angle: 0, active: false };
  public isTouchShooting = false;
  public toastNotification: { text: string; color: string; timer: number } | null = null;
  public isMobileControlsVisible = false;

  // Active UI modal contexts
  public activeNPC: NPC | null = null;
  public activeShopNPC: NPC | null = null;
  public dialogueLineIndex = 0;
  public deathGoldLost = 0;
  public victoryStats = { level: 1, gold: 0, questsCompleted: 0 };

  // Keys state
  private keys: Record<string, boolean> = {};

  // Story & World flags
  public watchtowerExamined = false;
  public bossDefeated = false;

  // Track user interaction for audio unlocking
  private audioUnlocked = false;
  private currentRegionTrack: 'village' | 'forest' | 'ashen' | 'boss' = 'village';

  constructor() {
    this.world = generateWorld();
    this.player = this.createInitialPlayer();
    this.enemies = spawnInitialEnemies();
    this.npcs = JSON.parse(JSON.stringify(NPCS));
    this.quests = JSON.parse(JSON.stringify(INITIAL_QUESTS));
  }

  private createInitialPlayer(): Player {
    const glockGun = { ...ITEMS.glock_gun };
    const ak47Gun = { ...ITEMS.ak47_gun };
    const shotgunGun = { ...ITEMS.shotgun_gun };
    const clothTunic = { ...ITEMS.cloth_tunic };
    const healingHerb = { ...ITEMS.healing_herb, quantity: 3 };
    const ammoCache = { ...ITEMS.ammo_cache, quantity: 2 };
    const cyberDeck = { ...ITEMS.cyber_deck };
    const rawOre = { ...ITEMS.raw_ore, quantity: 25 };
    const titanium = { ...ITEMS.titanium_alloy, quantity: 15 };
    const energyCell = { ...ITEMS.energy_cell, quantity: 10 };

    const guns = INITIAL_GUN_ARSENAL.map(g => ({ ...g }));

    return {
      x: 1500,
      y: 1585,
      facingAngle: -Math.PI / 2, // Facing up
      aimAngle: -Math.PI / 2,
      speed: PLAYER_BASE_SPEED,
      level: 1,
      xp: 0,
      gold: 150,
      maxHp: 100,
      hp: 100,
      maxStamina: 100,
      stamina: 100,
      cyberEnergy: 100,
      maxCyberEnergy: 100,
      mountedVehicle: null,
      baseAttack: 10,
      baseDefense: 3,
      isAttacking: false,
      attackCooldown: 0,
      attackAnimTimer: 0,
      isSprinting: false,
      // Modern Shooter & Gun mechanics
      isShooting: false,
      shootCooldown: 0,
      isReloading: false,
      reloadTimer: 0,
      muzzleFlashTimer: 0,
      hitmarkerTimer: 0,
      // Tactical Dash / Dodge Roll
      isDashing: false,
      dashTimer: 0,
      dashCooldown: 0,
      dashVx: 0,
      dashVy: 0,
      invulnerableTimer: 0,
      // Gun Arsenal
      selectedGunIndex: 2, // Start with iconic AK-47 equipped
      unlockedGuns: guns,
      inventory: [
        glockGun,
        ak47Gun,
        shotgunGun,
        clothTunic,
        healingHerb,
        ammoCache,
        cyberDeck,
        rawOre,
        titanium,
        energyCell,
      ],
      equipment: {
        weapon: ak47Gun,
        armor: clothTunic,
      },
      staminaRegenDelay: 0,
      // Auto-Aim and Auto-Shoot capabilities (default ON)
      autoAim: true,
      autoShoot: true,
      autoAimTargetId: null,
      autoAimRange: 380,
      isInfiniteAmmo: false,
    };
  }

  public newGame() {
    this.player = this.createInitialPlayer();
    this.enemies = spawnInitialEnemies();
    this.npcs = JSON.parse(JSON.stringify(NPCS));
    this.quests = JSON.parse(JSON.stringify(INITIAL_QUESTS));
    this.world = generateWorld();
    this.projectiles = [];
    this.dangerZones = [];
    this.particles = new ParticleSystem();
    this.dayTime = 60;
    this.watchtowerExamined = false;
    this.bossDefeated = false;
    this.isGateUnlocked = false;
    this.mode = 'PLAYING';
    this.unlockAudio();

    // Realistic voice radio broadcast dispatch
    setTimeout(() => {
      voiceNarrator.narrate(MISSION_BRIEFINGS.welcome);
    }, 1200);
  }

  public continueGame(): boolean {
    const saved = loadGame();
    if (!saved) return false;

    this.newGame();

    // Restore player
    this.player.x = saved.player.x;
    this.player.y = saved.player.y;
    // Unstuck check: if saved position was inside the central fountain, move to safe courtyard
    if (Math.hypot(this.player.x - 1500, this.player.y - 1500) < 48) {
      this.player.x = 1500;
      this.player.y = 1585;
    }
    this.player.level = saved.player.level;
    this.player.xp = saved.player.xp;
    this.player.gold = saved.player.gold;
    this.player.hp = saved.player.hp;
    this.player.maxHp = saved.player.maxHp;
    this.player.stamina = saved.player.stamina;
    this.player.maxStamina = saved.player.maxStamina;
    this.player.baseAttack = saved.player.baseAttack;
    this.player.baseDefense = saved.player.baseDefense;
    this.player.inventory = saved.player.inventory;
    this.player.equipment = saved.player.equipment;
    this.player.autoAim = saved.player.autoAim !== undefined ? saved.player.autoAim : true;
    this.player.autoShoot = saved.player.autoShoot !== undefined ? saved.player.autoShoot : true;
    this.player.isInfiniteAmmo = !!saved.player.isInfiniteAmmo;
    this.player.autoAimTargetId = null;
    this.player.autoAimRange = 380;

    // Restore quests
    this.quests.forEach(q => {
      if (saved.quests[q.id]) {
        q.status = saved.quests[q.id];
      }
      if (saved.questProgress[q.id]) {
        q.objectives.forEach((obj, idx) => {
          obj.current = saved.questProgress[q.id][idx] || 0;
          obj.completed = obj.current >= obj.required;
        });
      }
    });

    // Restore chests
    this.world.chests.forEach(c => {
      if (saved.chests[c.id]) {
        c.opened = saved.chests[c.id];
      }
    });

    // Restore world
    this.watchtowerExamined = saved.world.watchtowerExamined;
    this.bossDefeated = saved.world.bossDefeated;
    this.dayTime = saved.world.dayTime;

    if (this.bossDefeated) {
      const boss = this.enemies.find(e => e.type === 'boss');
      if (boss) boss.isDead = true;
    }

    // Restore arsenal & colony if saved
    if (saved.player.unlockedGuns && saved.player.unlockedGuns.length > 0) {
      this.player.unlockedGuns = saved.player.unlockedGuns;
    }
    if (saved.player.selectedGunIndex !== undefined) {
      this.player.selectedGunIndex = saved.player.selectedGunIndex;
    }
    if (saved.colony) {
      this.factoryMgr.colony = { ...this.factoryMgr.colony, ...saved.colony };
    }
    if (saved.buildings && saved.buildings.length > 0) {
      this.factoryMgr.buildings = saved.buildings;
      this.factoryMgr.recalculatePowerAndStats();
    }
    if (saved.vehicles && saved.vehicles.length > 0) {
      this.vehicleMgr.vehicles = saved.vehicles;
    }

    this.mode = 'PLAYING';
    this.unlockAudio();
    return true;
  }

  public quickSave(): boolean {
    const ok = saveGame(
      this.player,
      this.quests,
      this.world.chests,
      {
        watchtowerExamined: this.watchtowerExamined,
        bossDefeated: this.bossDefeated,
        dayTime: this.dayTime,
      },
      {
        guns: this.player.unlockedGuns,
        selectedGunIndex: this.player.selectedGunIndex,
        colony: this.factoryMgr.colony,
        buildings: this.factoryMgr.buildings,
        vehicles: this.vehicleMgr.vehicles,
      }
    );
    if (ok) {
      soundManager.playCoin();
      this.showToast('💾 GAME PROGRESS SAVED [F5]', '#10b981');
    }
    return ok;
  }

  public autoSave(): boolean {
    return saveGame(
      this.player,
      this.quests,
      this.world.chests,
      {
        watchtowerExamined: this.watchtowerExamined,
        bossDefeated: this.bossDefeated,
        dayTime: this.dayTime,
      },
      {
        guns: this.player.unlockedGuns,
        selectedGunIndex: this.player.selectedGunIndex,
        colony: this.factoryMgr.colony,
        buildings: this.factoryMgr.buildings,
        vehicles: this.vehicleMgr.vehicles,
      }
    );
  }

  public toggleAudio(): boolean {
    const isMuted = soundManager.toggleMute();
    this.showToast(isMuted ? '🔇 AUDIO: MUTED [M]' : '🔊 AUDIO: UNMUTED [M]', isMuted ? '#ef4444' : '#10b981');
    return !isMuted;
  }

  public toggleInfiniteAmmo(): boolean {
    this.player.isInfiniteAmmo = !this.player.isInfiniteAmmo;
    soundManager.playClick();
    this.showToast(
      this.player.isInfiniteAmmo ? '∞ INFINITE AMMO: ACTIVATED [U]' : 'INFINITE AMMO: DEACTIVATED [U]',
      this.player.isInfiniteAmmo ? '#f59e0b' : '#94a3b8'
    );
    return !!this.player.isInfiniteAmmo;
  }

  public quickHeal(): boolean {
    if (this.player.hp >= this.player.maxHp) {
      this.showToast('Health is already at 100% full!', '#22c55e');
      return false;
    }
    const healItem = this.player.inventory.find(
      i => i.type === 'CONSUMABLE' && (i.restoreHp || 0) > 0 && (i.quantity || 0) > 0
    );
    if (!healItem) {
      this.showToast('No healing potions or herbs in inventory! [Q]', '#ef4444');
      soundManager.playOutOfAmmo();
      return false;
    }
    this.useItem(healItem);
    this.showToast(`Used ${healItem.name} (+${healItem.restoreHp} HP) [Q]`, '#22c55e');
    return true;
  }

  public unlockAudio() {
    if (!this.audioUnlocked) {
      this.audioUnlocked = true;
      soundManager.unlock();
      soundManager.playMusic(this.currentRegionTrack);
    }
  }

  // Handle Input KeyDown
  public onKeyDown(code: string, event?: KeyboardEvent) {
    this.unlockAudio();
    this.keys[code] = true;

    // F5 or F9 Quick-Save - prevent browser page refresh
    if (code === 'F5' || code === 'F9') {
      if (event) event.preventDefault();
      this.quickSave();
      return;
    }

    // Global Key shortcuts
    if (code === 'Escape') {
      if (this.mode === 'PLAYING') {
        this.mode = 'PAUSED';
        soundManager.playClick();
      } else if (
        [
          'PAUSED',
          'INVENTORY',
          'QUESTS',
          'SHOP',
          'DIALOGUE',
          'COLONY',
          'HACKING',
          'RADIAL_WEAPONS',
          'WEAPON_UPGRADE',
          'SHORTCUTS_GUIDE',
        ].includes(this.mode)
      ) {
        this.mode = 'PLAYING';
        this.activeNPC = null;
        this.activeShopNPC = null;
        soundManager.playClick();
      }
      return;
    }

    // Shortcuts reference modal toggle (? or / or F1)
    if (code === 'Slash' || code === 'F1') {
      if (this.mode === 'SHORTCUTS_GUIDE') {
        this.mode = 'PLAYING';
        soundManager.playClick();
      } else {
        this.mode = 'SHORTCUTS_GUIDE';
        soundManager.playClick();
      }
      return;
    }

    // Mute Audio toggle (M)
    if (code === 'KeyM') {
      this.toggleAudio();
      return;
    }

    if (this.mode === 'PLAYING') {
      // Weapon selection keys [1] through [9], [0]
      if (code === 'Digit1' || code === 'Numpad1') this.selectGun(0);
      else if (code === 'Digit2' || code === 'Numpad2') this.selectGun(1);
      else if (code === 'Digit3' || code === 'Numpad3') this.selectGun(2);
      else if (code === 'Digit4' || code === 'Numpad4') this.selectGun(3);
      else if (code === 'Digit5' || code === 'Numpad5') this.selectGun(4);
      else if (code === 'Digit6' || code === 'Numpad6') this.selectGun(5);
      else if (code === 'Digit7' || code === 'Numpad7') this.selectGun(6);
      else if (code === 'Digit8' || code === 'Numpad8') this.selectGun(7);
      else if (code === 'Digit9' || code === 'Numpad9') this.selectGun(8);
      else if (code === 'Digit0' || code === 'Numpad0') this.selectGun(9);
      else if (code === 'KeyQ') {
        // Q: Quick-Heal using healing consumable
        this.quickHeal();
      } else if (code === 'KeyG') {
        // G: Radial Weapon Wheel
        this.mode = 'RADIAL_WEAPONS';
        soundManager.playClick();
      } else if (code === 'Tab') {
        if (event) event.preventDefault();
        this.nextGun();
      } else if (code === 'KeyR') {
        this.reloadEquippedGun();
      } else if (code === 'Space') {
        // Spacebar triggers Tactical Dash / Dodge Roll
        if (event) event.preventDefault();
        this.executeDash();
      } else if (code === 'KeyF') {
        // Melee slash or interaction
        this.executeAttack();
      } else if (code === 'KeyH') {
        // Cyber Hacking terminal
        this.mode = 'HACKING';
        soundManager.playClick();
      } else if (code === 'KeyV') {
        // Mount / Dismount Vehicle if near, otherwise replay voice narrative
        if (this.player.mountedVehicle || this.getNearestInteractable()?.text.includes('Board')) {
          this.toggleMountVehicle();
        } else {
          voiceNarrator.replayCurrent();
        }
      } else if (code === 'KeyM') {
        // Open Syndicate Operations & Mission Walkthrough Intel Guide
        this.mode = 'MISSION_WALKTHROUGH';
        soundManager.playClick();
      } else if (code === 'KeyB' || code === 'KeyC') {
        // Factory & Colony Construction Modal
        this.mode = 'COLONY';
        soundManager.playClick();
      } else if (code === 'KeyT') {
        // Toggle mobile touchscreen controls preview
        this.isMobileControlsVisible = !this.isMobileControlsVisible;
        this.onMobileControlsChange?.(this.isMobileControlsVisible);
        soundManager.playClick();
        this.showToast(this.isMobileControlsVisible ? '📱 TOUCH CONTROLS: ON [T]' : '📱 TOUCH CONTROLS: OFF [T]', '#38bdf8');
      } else if (code === 'KeyI') {
        this.mode = 'INVENTORY';
        soundManager.playClick();
      } else if (code === 'KeyJ' || code === 'KeyL') {
        this.mode = 'QUESTS';
        soundManager.playClick();
      } else if (code === 'KeyE') {
        this.handleInteraction();
      } else if (code === 'KeyO' || code === 'KeyY') {
        this.toggleAutoAim();
      } else if (code === 'KeyP' || code === 'KeyZ') {
        this.toggleAutoShoot();
      } else if (code === 'KeyU') {
        this.toggleInfiniteAmmo();
      } else if (code === 'KeyK') {
        this.mode = 'WEAPON_UPGRADE';
        soundManager.playClick();
      }
    } else if (this.mode === 'COLONY') {
      if (code === 'Escape' || code === 'KeyB' || code === 'KeyC') {
        this.mode = 'PLAYING';
        soundManager.playClick();
      }
    } else if (this.mode === 'HACKING') {
      if (code === 'Escape' || code === 'KeyH') {
        this.mode = 'PLAYING';
        soundManager.playClick();
      }
    } else if (this.mode === 'RADIAL_WEAPONS') {
      if (code === 'Escape' || code === 'KeyG' || code === 'KeyQ') {
        this.mode = 'PLAYING';
        soundManager.playClick();
      }
    } else if (this.mode === 'WEAPON_UPGRADE') {
      if (code === 'Escape' || code === 'KeyK') {
        this.mode = 'PLAYING';
        soundManager.playClick();
      }
    } else if (this.mode === 'INVENTORY') {
      if (code === 'Escape' || code === 'KeyI') {
        this.mode = 'PLAYING';
        soundManager.playClick();
      }
    } else if (this.mode === 'QUESTS') {
      if (code === 'Escape' || code === 'KeyJ' || code === 'KeyL') {
        this.mode = 'PLAYING';
        soundManager.playClick();
      }
    } else if (this.mode === 'SHORTCUTS_GUIDE') {
      if (code === 'Escape' || code === 'Slash' || code === 'F1') {
        this.mode = 'PLAYING';
        soundManager.playClick();
      }
    } else if (this.mode === 'MISSION_WALKTHROUGH') {
      if (code === 'Escape' || code === 'KeyM') {
        this.mode = 'PLAYING';
        soundManager.playClick();
      }
    } else if (this.mode === 'DIALOGUE') {
      if (code === 'KeyE' || code === 'Enter' || code === 'Space') {
        this.advanceDialogue();
      }
    } else if (this.mode === 'GAME_OVER') {
      if (code === 'Enter' || code === 'Space') {
        this.respawnPlayer();
      }
    } else if (this.mode === 'VICTORY') {
      if (code === 'Enter' || code === 'Space') {
        this.mode = 'PLAYING';
      }
    }
  }

  public onKeyUp(code: string) {
    this.keys[code] = false;
  }

  // Mouse and Aim Input Handlers
  public onMouseMove(canvasX: number, canvasY: number, screenW: number, screenH: number) {
    this.crosshair.screenX = canvasX;
    this.crosshair.screenY = canvasY;
    this.crosshair.x = canvasX + this.camera.x;
    this.crosshair.y = canvasY + this.camera.y;

    if (this.mode === 'PLAYING') {
      const p = this.player;
      const angle = Math.atan2(this.crosshair.y - p.y, this.crosshair.x - p.x);
      p.aimAngle = angle;
      p.facingAngle = angle;
    }
  }

  public onMouseDown(button: number) {
    this.unlockAudio();
    if (this.mode !== 'PLAYING') return;

    if (button === 0) {
      // Left Click: Shoot equipped gun
      this.player.isShooting = true;
      this.shootEquippedGun();
    } else if (button === 2) {
      // Right Click: Tactical Dash
      this.executeDash();
    }
  }

  public onMouseUp(button: number) {
    if (button === 0) {
      this.player.isShooting = false;
    }
  }

  public onWheel(deltaY: number) {
    if (this.mode !== 'PLAYING') return;
    if (deltaY > 0) {
      this.nextGun();
    } else if (deltaY < 0) {
      this.prevGun();
    }
  }

  // Update Game Loop (called every frame with delta seconds)
  public update(dt: number, screenW: number, screenH: number) {
    // Only simulate world in PLAYING mode
    if (this.mode !== 'PLAYING') return;

    // 1. Day / Night Cycle
    this.dayTime = (this.dayTime + dt) % 600;

    // 2. Stream Infinite World Chunks around player
    this.infiniteChunks = infiniteWorldManager.getVisibleChunks(
      this.player.x,
      this.player.y,
      screenW,
      screenH
    );
    this.activeInfiniteEnemies = this.infiniteChunks.flatMap(c => c.enemies);

    // 3. Screen Shake Damping
    if (this.screenShake.intensity > 0) {
      this.screenShake.intensity = Math.max(0, this.screenShake.intensity - dt * 25);
    }

    // 4. Tactical Dash physics
    this.updatePlayerDash(dt);

    // 5. Player Movement & Sprinting
    this.updatePlayerMovement(dt);

    // 5b. Auto-Aim and Auto-Shoot proximity targeting
    this.updateAutoAimAndShoot(dt);

    // 6. Player Automatic Shooting & Reloading
    this.updatePlayerGunState(dt);

    // 7. Player Melee & Stamina Regen
    this.updatePlayerCombat(dt);

    // 8. Update Camera smooth follow with no bounds clamp
    this.updateCamera(screenW, screenH);

    // 9. Update Projectiles (Player bullets & hostile spells)
    this.updateProjectiles(dt);

    // 10. Update Danger Zones
    this.updateDangerZones(dt);

    // 11. Update Enemies (both handcrafted and infinite sector roaming mobs)
    this.updateEnemies(dt);

    // 11b. Update Factory Buildings, Colony Systems & Raids
    const allEnemies = this.enemies.concat(this.activeInfiniteEnemies);
    this.factoryMgr.update(dt, allEnemies, this.projectiles, (msg, color) => {
      this.showToast(msg, color);
    });

    // 11c. Update Vehicles
    this.vehicleMgr.update(dt, this.player, allEnemies);

    // 11d. Update Cybernetic Hacking
    this.hackMgr.update(dt, this.player, allEnemies);

    // 11e. Toast notification timer
    if (this.toastNotification) {
      this.toastNotification.timer -= dt;
      if (this.toastNotification.timer <= 0) {
        this.toastNotification = null;
      }
    }

    // 12. Update Particles & Damage Numbers
    this.particles.update(dt);

    // 13. Update Region Trendy Music
    this.updateMusicTrack();
  }

  public showToast(text: string, color = '#38bdf8') {
    this.toastNotification = { text, color, timer: 3.5 };
    this.particles.addDamageNumber(text, this.player.x, this.player.y, true, color);
  }

  public setTouchMovement(dx: number, dy: number, active: boolean) {
    this.touchMovement.dx = dx;
    this.touchMovement.dy = dy;
    this.touchMovement.active = active;
  }

  public setTouchAim(angle: number, active: boolean) {
    this.touchAim.angle = angle;
    this.touchAim.active = active;
    if (active) {
      this.player.aimAngle = angle;
      this.player.facingAngle = angle;
    }
  }

  public setTouchShooting(active: boolean) {
    this.isTouchShooting = active;
    this.player.isShooting = active;
    if (active) {
      this.shootEquippedGun();
    }
  }

  public toggleAutoAim(): boolean {
    this.player.autoAim = !this.player.autoAim;
    soundManager.playClick();
    this.showToast(
      this.player.autoAim ? 'AUTO-AIM: ON (LOCK ENGAGED)' : 'AUTO-AIM: OFF (MANUAL AIM)',
      this.player.autoAim ? '#38bdf8' : '#94a3b8'
    );
    return this.player.autoAim;
  }

  public toggleAutoShoot(): boolean {
    this.player.autoShoot = !this.player.autoShoot;
    soundManager.playClick();
    this.showToast(
      this.player.autoShoot ? 'AUTO-FIRE: ON (PROXIMITY TRIGGER)' : 'AUTO-FIRE: OFF (MANUAL TRIGGER)',
      this.player.autoShoot ? '#ef4444' : '#94a3b8'
    );
    return this.player.autoShoot;
  }

  public getAllActiveEnemies(): Enemy[] {
    const map = new Map<string, Enemy>();
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e && !e.isDead && e.hp > 0) map.set(e.id, e);
    }
    for (let i = 0; i < this.activeInfiniteEnemies.length; i++) {
      const e = this.activeInfiniteEnemies[i];
      if (e && !e.isDead && e.hp > 0) map.set(e.id, e);
    }
    if (this.infiniteChunks) {
      for (let c = 0; c < this.infiniteChunks.length; c++) {
        const chunk = this.infiniteChunks[c];
        if (chunk && chunk.enemies) {
          for (let e = 0; e < chunk.enemies.length; e++) {
            const enemy = chunk.enemies[e];
            if (enemy && !enemy.isDead && enemy.hp > 0) map.set(enemy.id, enemy);
          }
        }
      }
    }
    return Array.from(map.values());
  }

  public upgradeGunTier(gun: GunConfig): void {
    if (!gun) return;
    const currentTier = gun.tier || 1;
    if (currentTier >= 5) return;

    gun.tier = currentTier + 1;
    // Scale weapon stats: +35% damage, +15% fireRate, +25% magSize, +penetration
    gun.damage = Math.round(gun.damage * 1.35 + 5);
    gun.fireRate = Math.min(25, Number((gun.fireRate * 1.15).toFixed(1)));
    gun.magSize = Math.round(gun.magSize * 1.25);
    gun.currentMag = gun.magSize;
    gun.reserveAmmo = Math.max(gun.reserveAmmo, gun.magSize * 4);
    gun.maxReserveAmmo = Math.max(gun.maxReserveAmmo, gun.magSize * 8);
    gun.penetration = (gun.penetration || 1) + 1;
    gun.range = Math.round(gun.range * 1.1);

    soundManager.playLevelUp();
    this.particles.spawnLevelUp(this.player.x, this.player.y);
    this.showToast(`🔥 ${gun.name} ascended to Tier ${gun.tier}!`, '#f59e0b');
  }

  private updateAutoAimAndShoot(dt: number) {
    const p = this.player;
    if (this.mode !== 'PLAYING') return;

    // Determine target detection range
    const gun = this.getEquippedGun();
    const effectiveRange = p.mountedVehicle
      ? 480
      : gun
      ? Math.max(280, Math.min(540, gun.range))
      : (p.autoAimRange || 380);

    // Collect all living hostile enemies across world and chunks
    const allEnemies = this.getAllActiveEnemies();
    let closestEnemy: Enemy | null = null;
    let closestDistSq = effectiveRange * effectiveRange;

    for (let i = 0; i < allEnemies.length; i++) {
      const e = allEnemies[i];
      if (e.isDead || e.hp <= 0) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const distSq = dx * dx + dy * dy;
      if (distSq <= closestDistSq) {
        closestDistSq = distSq;
        closestEnemy = e;
      }
    }

    if (closestEnemy) {
      p.autoAimTargetId = closestEnemy.id;
      const distToEnemy = Math.sqrt(closestDistSq);
      const targetAngle = Math.atan2(closestEnemy.y - p.y, closestEnemy.x - p.x);

      // 1. Auto-Aim: Align player facing and aim angle towards closest enemy
      if (p.autoAim || p.autoShoot) {
        // If user is not explicitly moving a touch aim joystick, lock aim onto target
        if (!this.touchAim.active) {
          p.aimAngle = targetAngle;
          p.facingAngle = targetAngle;
        }
      }

      // 2. Auto-Shoot / Retaliation: Automatically discharge weapon or melee when target is in range
      if (p.autoShoot && !p.isDashing) {
        // Immediate close-quarters melee defense if enemy is within 75px or gun cannot shoot
        if (distToEnemy <= 75) {
          if (p.attackCooldown <= 0) {
            this.executeAttack();
          }
        }

        if (p.mountedVehicle) {
          if (p.mountedVehicle.weaponCooldown <= 0) {
            this.shootEquippedGun();
          }
        } else if (gun) {
          // If infinite ammo enabled, ensure current magazine never reads 0
          if (p.isInfiniteAmmo) {
            gun.currentMag = gun.magSize;
            p.isReloading = false;
          }

          if (gun.currentMag > 0 || p.isInfiniteAmmo) {
            if (p.shootCooldown <= 0 && !p.isReloading) {
              this.shootEquippedGun();
            }
          } else if (gun.currentMag <= 0 && gun.reserveAmmo > 0 && !p.isReloading) {
            this.reloadEquippedGun();
          } else if (gun.currentMag <= 0 && gun.reserveAmmo <= 0) {
            // Out of ammo on this weapon: check if another unlocked weapon has ammo
            const altIndex = p.unlockedGuns.findIndex(g => g.currentMag > 0 || g.reserveAmmo > 0);
            if (altIndex !== -1 && altIndex !== p.selectedGunIndex) {
              this.selectGun(altIndex);
            } else if (p.attackCooldown <= 0) {
              // No ammo left anywhere: fight back with melee!
              this.executeAttack();
            }
          }
        } else if (p.attackCooldown <= 0) {
          // Unarmed or no gun equipped: melee attack
          this.executeAttack();
        }
      }
    } else {
      p.autoAimTargetId = null;
    }
  }

  public executeCyberHack() {
    const allEnemies = this.enemies.concat(this.activeInfiniteEnemies);
    this.hackMgr.executeHack(
      this.player,
      allEnemies,
      this.factoryMgr.buildings,
      (msg, color) => this.showToast(msg, color)
    );
  }

  public toggleMountVehicle() {
    const res = this.vehicleMgr.toggleMountVehicle(this.player);
    this.showToast(res.msg, res.success ? '#38bdf8' : '#ef4444');
  }

  public buildStructure(type: BuildingType): boolean {
    const res = this.factoryMgr.buildStructure(type, this.player.x + 45, this.player.y + 45);
    this.showToast(res.msg, res.success ? '#22c55e' : '#ef4444');
    return res.success;
  }

  public upgradeBuilding(id: string): boolean {
    const res = this.factoryMgr.upgradeBuilding(id);
    this.showToast(res.msg, res.success ? '#38bdf8' : '#ef4444');
    return res.success;
  }

  public dismantleBuilding(id: string): boolean {
    const res = this.factoryMgr.dismantleBuilding(id);
    this.showToast(res.msg, res.success ? '#fbbf24' : '#ef4444');
    return res.success;
  }

  public spawnVehicle(type: VehicleType): Vehicle {
    const v = this.vehicleMgr.spawnVehicle(type, this.player.x + 50, this.player.y + 50);
    this.showToast(`Fabricated ${v.name}!`, '#38bdf8');
    return v;
  }

  private updatePlayerDash(dt: number) {
    const p = this.player;

    if (p.dashCooldown > 0) p.dashCooldown -= dt;
    if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;

    if (p.isDashing) {
      p.dashTimer -= dt;
      const activeColliders = this.world.colliders.concat(
        this.infiniteChunks.flatMap(c => c.colliders)
      );
      const resolved = resolveMovement(
        p.x,
        p.y,
        p.dashVx * dt,
        p.dashVy * dt,
        14,
        WORLD_WIDTH,
        WORLD_HEIGHT,
        activeColliders
      );
      p.x = resolved.x;
      p.y = resolved.y;

      // Spawn periodic dash particles
      if (Math.random() < 0.6) {
        this.particles.spawnDashTrail(p.x, p.y, p.aimAngle);
      }

      if (p.dashTimer <= 0) {
        p.isDashing = false;
      }
    }
  }

  private updatePlayerGunState(dt: number) {
    const p = this.player;

    if (isNaN(p.shootCooldown) || p.shootCooldown < 0) {
      p.shootCooldown = 0;
    } else if (p.shootCooldown > 0) {
      p.shootCooldown -= dt;
    }

    if (p.muzzleFlashTimer > 0) p.muzzleFlashTimer -= dt;
    if (p.hitmarkerTimer > 0) p.hitmarkerTimer -= dt;

    // Handle reloading timer
    if (p.isReloading) {
      if (isNaN(p.reloadTimer) || p.reloadTimer < 0) {
        this.completeReload();
      } else {
        p.reloadTimer -= dt;
        if (p.reloadTimer <= 0) {
          this.completeReload();
        }
      }
    }

    // Handle continuous automatic fire when left-click or touch fire is held
    if ((p.isShooting || this.isTouchShooting) && !p.isDashing && !p.isReloading) {
      const gun = this.getEquippedGun();
      if (gun && gun.isAuto && p.shootCooldown <= 0) {
        this.shootEquippedGun();
      }
    }
  }

  private updatePlayerMovement(dt: number) {
    const p = this.player;

    // While dashing, movement is controlled by dash velocity
    if (p.isDashing) return;

    // Input direction: keyboard or touch joystick
    let dx = 0;
    let dy = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

    // Override with touch joystick if active
    if (this.touchMovement.active && (Math.abs(this.touchMovement.dx) > 0.05 || Math.abs(this.touchMovement.dy) > 0.05)) {
      dx = this.touchMovement.dx;
      dy = this.touchMovement.dy;
    }

    // Override aim with touch joystick if active
    if (this.touchAim.active) {
      p.aimAngle = this.touchAim.angle;
      p.facingAngle = this.touchAim.angle;
    }

    // Normalize diagonal movement
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
      // If not aiming with mouse or touch, face moving direction
      if (!this.touchAim.active && this.crosshair.screenX === 400 && this.crosshair.screenY === 300) {
        p.facingAngle = Math.atan2(dy, dx);
      }
    }

    // Vehicle mounted speed vs on-foot speed
    if (p.mountedVehicle) {
      p.speed = p.mountedVehicle.maxSpeed;
      p.isSprinting = false;
    } else {
      // Sprinting with Shift
      const wantsSprint = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && len > 0;
      if (wantsSprint && p.stamina > 2) {
        p.isSprinting = true;
        p.speed = PLAYER_SPRINT_SPEED;
        p.stamina = Math.max(0, p.stamina - SPRINT_STAMINA_COST * dt);
        p.staminaRegenDelay = STAMINA_REGEN_DELAY;
      } else {
        p.isSprinting = false;
        p.speed = PLAYER_BASE_SPEED;
      }
    }

    // Combine base world colliders + active visible chunk colliders
    const activeColliders = this.world.colliders.concat(
      this.infiniteChunks.flatMap(c => c.colliders)
    );

    if (len > 0) {
      const moveDist = p.speed * dt;
      const proposedDx = dx * moveDist;
      const proposedDy = dy * moveDist;

      // Slide resolution in infinite world
      const resolved = resolveMovement(
        p.x,
        p.y,
        proposedDx,
        proposedDy,
        14, // Player radius
        WORLD_WIDTH,
        WORLD_HEIGHT,
        activeColliders
      );
      p.x = resolved.x;
      p.y = resolved.y;
    } else {
      // Ensure stationary player is never trapped inside any obstacles
      const depen = depenetratePosition(p.x, p.y, 14, activeColliders);
      p.x = depen.x;
      p.y = depen.y;
    }
  }

  private updatePlayerCombat(dt: number) {
    const p = this.player;

    // Attack cooldown and animation timer
    if (p.attackCooldown > 0) {
      p.attackCooldown -= dt;
    }
    if (p.attackAnimTimer > 0) {
      p.attackAnimTimer -= dt;
      if (p.attackAnimTimer <= 0) {
        p.isAttacking = false;
      }
    }

    // Stamina regeneration
    if (p.staminaRegenDelay > 0) {
      p.staminaRegenDelay -= dt;
    } else if (p.stamina < p.maxStamina) {
      p.stamina = Math.min(p.maxStamina, p.stamina + STAMINA_REGEN_RATE * dt);
    }
  }

  // Gun Arsenal Management
  public getEquippedGun(): GunConfig | null {
    const p = this.player;
    if (p.unlockedGuns && p.unlockedGuns.length > 0) {
      const idx = Math.max(0, Math.min(p.unlockedGuns.length - 1, p.selectedGunIndex));
      return p.unlockedGuns[idx];
    }
    return null;
  }

  public selectGun(index: number) {
    const p = this.player;
    if (index >= 0 && index < p.unlockedGuns.length) {
      p.selectedGunIndex = index;
      const gun = p.unlockedGuns[index];
      p.isReloading = false;
      p.reloadTimer = 0;
      soundManager.playClick();
      this.particles.addDamageNumber(`Equipped: ${gun.name}`, p.x, p.y, true, gun.color);
    }
  }

  public nextGun() {
    const p = this.player;
    if (p.unlockedGuns.length > 0) {
      this.selectGun((p.selectedGunIndex + 1) % p.unlockedGuns.length);
    }
  }

  public prevGun() {
    const p = this.player;
    if (p.unlockedGuns.length > 0) {
      const total = p.unlockedGuns.length;
      this.selectGun((p.selectedGunIndex - 1 + total) % total);
    }
  }

  public reloadEquippedGun() {
    const p = this.player;
    const gun = this.getEquippedGun();
    if (!gun || p.isReloading) return;

    if (gun.currentMag >= gun.magSize) {
      this.particles.addDamageNumber('Magazine Full!', p.x, p.y, false, '#f59e0b');
      return;
    }
    if (gun.reserveAmmo <= 0) {
      this.particles.addDamageNumber('Out of Reserve Ammo!', p.x, p.y, false, '#ef4444');
      soundManager.playEmptyGun();
      return;
    }

    p.isReloading = true;
    p.reloadTimer = gun.reloadTime;
    soundManager.playReload();
    this.particles.addDamageNumber('Reloading...', p.x, p.y, false, '#38bdf8');
  }

  private completeReload() {
    const p = this.player;
    const gun = this.getEquippedGun();
    p.isReloading = false;
    p.reloadTimer = 0;
    if (!gun) return;

    const needed = gun.magSize - gun.currentMag;
    const toLoad = Math.min(needed, gun.reserveAmmo);
    gun.currentMag += toLoad;
    gun.reserveAmmo -= toLoad;
    this.particles.addDamageNumber(`Loaded [${gun.currentMag}/${gun.reserveAmmo}]`, p.x, p.y, false, '#22c55e');
  }

  public shootEquippedGun() {
    const p = this.player;
    if (p.isDashing || p.isReloading) return;

    // 1. If player is mounted in a vehicle, fire vehicle mounted weaponry!
    if (p.mountedVehicle) {
      this.vehicleMgr.fireVehicleWeapon(p.mountedVehicle, p.aimAngle, this.projectiles);
      this.addScreenShake(3);
      return;
    }

    if (p.shootCooldown > 0) return;

    const gun = this.getEquippedGun();
    if (!gun) {
      this.executeAttack();
      return;
    }

    if (gun.currentMag <= 0 && !p.isInfiniteAmmo) {
      if (gun.reserveAmmo > 0) {
        this.reloadEquippedGun();
      } else {
        soundManager.playEmptyGun();
        this.particles.addDamageNumber('CLICK! Empty', p.x, p.y, false, '#ef4444');
      }
      return;
    }

    // Fire round
    if (!p.isInfiniteAmmo) {
      gun.currentMag--;
    }
    p.shootCooldown = 1 / gun.fireRate;
    p.muzzleFlashTimer = 0.08;
    this.addScreenShake(gun.recoil);

    // Audio by gun ID
    if (gun.id === 'glock') soundManager.playPistolShot();
    else if (gun.id === 'shotgun') soundManager.playShotgunShot();
    else if (gun.id === 'ak47') soundManager.playAssaultRifleShot();
    else if (gun.id === 'sniper') soundManager.playSniperShot();
    else if (gun.id === 'smg') soundManager.playSMGShot();
    else if (gun.id === 'rpg') soundManager.playRocketLaunch();
    else if (gun.id === 'plasma') soundManager.playLaserShot();
    else if (gun.id === 'tesla') soundManager.playTeslaShock();
    else if (gun.id === 'flamethrower') soundManager.playFlamethrower();
    else if (gun.id === 'minigun') soundManager.playMinigunShot();
    else if (gun.id === 'cryo') soundManager.playCryoShot();
    else if (gun.id === 'railgun') soundManager.playRailgunShot();
    else if (gun.id === 'cluster_missile') soundManager.playRocketLaunch();
    else if (gun.id === 'sawblade') soundManager.playSawblade();
    else if (gun.id === 'orbital_strike') soundManager.playOrbitalStrike();

    // Muzzle sparks
    const muzzleDist = 24;
    const muzzleX = p.x + Math.cos(p.aimAngle) * muzzleDist;
    const muzzleY = p.y + Math.sin(p.aimAngle) * muzzleDist;
    this.particles.spawnMuzzleSparks(muzzleX, muzzleY, p.aimAngle, gun.color);

    // Level-scaled bullet damage
    const levelBonus = Math.floor((p.level - 1) * 2);
    const bulletDmg = gun.damage + levelBonus;

    for (let i = 0; i < gun.bulletCount; i++) {
      const spread = (Math.random() - 0.5) * gun.spread;
      const angle = p.aimAngle + spread;
      const vx = Math.cos(angle) * gun.bulletSpeed;
      const vy = Math.sin(angle) * gun.bulletSpeed;
      const life = gun.range / gun.bulletSpeed;

      this.projectiles.push({
        id: `bullet_${Math.random()}`,
        x: muzzleX,
        y: muzzleY,
        vx,
        vy,
        radius: gun.isRocket ? 5 : gun.isLaser ? 4 : 3,
        damage: bulletDmg,
        life,
        maxLife: life,
        isHostile: false,
        isPlayerBullet: true,
        color: gun.color,
        penetration: gun.penetration,
        splashRadius: gun.splashRadius,
        isRocket: gun.isRocket,
        isLaser: gun.isLaser,
        isTesla: gun.isTesla,
        isFlamethrower: gun.isFlamethrower,
        isCryo: gun.isCryo,
        isRailgun: gun.isRailgun,
        isCluster: gun.isCluster,
        isSawblade: gun.isSawblade,
        isOrbital: gun.isOrbital,
        knockback: gun.knockback,
        hitEntityIds: [],
      });
    }
  }

  public executeDash() {
    const p = this.player;
    if (p.dashCooldown > 0 || p.stamina < DASH_STAMINA_COST) return;

    p.stamina = Math.max(0, p.stamina - DASH_STAMINA_COST);
    p.staminaRegenDelay = 1.0;

    // Dash in direction of movement keys if moving, otherwise aim angle
    let dx = 0;
    let dy = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

    let dashAngle = p.aimAngle;
    if (Math.hypot(dx, dy) > 0) {
      dashAngle = Math.atan2(dy, dx);
    }

    p.isDashing = true;
    p.dashTimer = DASH_DURATION;
    p.dashCooldown = DASH_COOLDOWN;
    p.invulnerableTimer = DASH_DURATION;
    p.dashVx = Math.cos(dashAngle) * DASH_SPEED;
    p.dashVy = Math.sin(dashAngle) * DASH_SPEED;

    soundManager.playDash();
    this.particles.spawnDashTrail(p.x, p.y, dashAngle);
    this.particles.addDamageNumber('DODGE!', p.x, p.y, true, '#38bdf8');
  }

  public addScreenShake(amount: number) {
    this.screenShake.intensity = Math.min(20, this.screenShake.intensity + amount);
  }

  public refillAllAmmo() {
    const p = this.player;
    p.unlockedGuns.forEach(g => {
      g.currentMag = g.magSize;
      g.reserveAmmo = g.maxReserveAmmo;
    });
    soundManager.playReload();
    this.particles.addDamageNumber('ALL AMMO REFILLED!', p.x, p.y, true, '#fbbf24');
  }

  public executeAttack() {
    const p = this.player;
    if (p.attackCooldown > 0 || p.stamina < ATTACK_STAMINA_COST) return;

    p.attackCooldown = ATTACK_COOLDOWN;
    p.attackAnimTimer = 0.16; // Visual swing duration
    p.isAttacking = true;
    p.stamina -= ATTACK_STAMINA_COST;
    p.staminaRegenDelay = STAMINA_REGEN_DELAY;

    soundManager.playSwordSwing();

    // Damage enemies in arc (both core + infinite chunks)
    const { damage, isCrit } = calculatePlayerDamage(p);
    const allEnemies = this.enemies.concat(this.activeInfiniteEnemies);

    for (let i = 0; i < allEnemies.length; i++) {
      const e = allEnemies[i];
      if (e.isDead) continue;

      if (isPointInAttackArc(p.x, p.y, p.facingAngle, e.x, e.y, ATTACK_RANGE)) {
        const netDmg = Math.max(1, damage - e.defense);
        e.hp -= netDmg;
        e.hurtTimer = 0.15;
        e.state = 'HURT';

        // Knockback slightly away from player
        const angle = Math.atan2(e.y - p.y, e.x - p.x);
        e.x += Math.cos(angle) * 16;
        e.y += Math.sin(angle) * 16;

        this.particles.spawnHit(e.x, e.y, isCrit ? '#fbbf24' : '#ef4444');
        this.particles.addDamageNumber(`-${netDmg}`, e.x, e.y, isCrit);
        soundManager.playEnemyHit(isCrit);

        // Check enemy death
        if (e.hp <= 0) {
          this.handleEnemyDeath(e);
        }
      }
    }
  }

  private handleEnemyDeath(e: Enemy) {
    e.isDead = true;
    e.state = 'DEAD';
    e.respawnTimer = 60; // 60 seconds respawn

    // Grant XP and Gold
    const goldDrop = e.goldMin + Math.floor(Math.random() * (e.goldMax - e.goldMin + 1));
    this.addGold(goldDrop);
    this.addXp(e.xpValue);

    this.particles.spawnDeath(e.x, e.y);
    soundManager.playCoin();

    // Chance to drop Healing Herb (15%)
    if (Math.random() < 0.15) {
      this.addItemToInventory({ ...ITEMS.healing_herb });
      this.particles.addDamageNumber('+Herb', e.x, e.y, false, '#34d399');
    }

    // Chance to drop Ammo Cache (25%)
    if (Math.random() < 0.25) {
      this.addItemToInventory({ ...ITEMS.ammo_cache });
      this.particles.addDamageNumber('+Ammo Cache', e.x, e.y, true, '#fbbf24');
    }

    // Update Quest Objectives
    this.updateQuestKillProgress(e.type);

    // Update Open-World District Territory Conquest & Influence
    this.updateTerritoryConquest(e);

    // Final Boss Defeat
    if (e.type === 'boss') {
      this.bossDefeated = true;
      soundManager.playBossExplosion();
      this.particles.spawnBossBurst(e.x, e.y, 60);

      // Complete Quest 5
      const q5 = this.quests.find(q => q.id === 'quest_5');
      if (q5 && q5.status === 'ACTIVE') {
        q5.objectives[0].current = 1;
        q5.objectives[0].completed = true;
        this.completeQuest(q5);
      }

      this.victoryStats = {
        level: this.player.level,
        gold: this.player.gold,
        questsCompleted: this.quests.filter(q => q.status === 'COMPLETED').length,
      };

      // Trigger Victory Screen after brief delay
      window.setTimeout(() => {
        this.mode = 'VICTORY';
        soundManager.playMusic('victory');
      }, 1200);
    }
  }

  private updateQuestKillProgress(enemyType: string) {
    this.quests.forEach(q => {
      if (q.status !== 'ACTIVE') return;

      if (q.id === 'quest_1' && enemyType === 'wolf') {
        const obj = q.objectives[0];
        if (obj.current < obj.required) {
          obj.current++;
          if (obj.current >= obj.required) {
            obj.completed = true;
            this.particles.addDamageNumber('Quest Objective Complete!', this.player.x, this.player.y, true, '#fbbf24');
          }
        }
      } else if (q.id === 'quest_3') {
        if (enemyType === 'skeleton') {
          const obj = q.objectives[0];
          if (obj.current < obj.required) {
            obj.current++;
            if (obj.current >= obj.required) obj.completed = true;
          }
        } else if (enemyType === 'cultist') {
          const obj = q.objectives[1];
          if (obj.current < obj.required) {
            obj.current++;
            if (obj.current >= obj.required) obj.completed = true;
          }
        }
      }
    });
  }

  private updateTerritoryConquest(e: Enemy) {
    for (let i = 0; i < this.districts.length; i++) {
      const dist = this.districts[i];
      if (
        e.x >= dist.x &&
        e.x <= dist.x + dist.width &&
        e.y >= dist.y &&
        e.y <= dist.y + dist.height
      ) {
        if (!dist.isConquered) {
          dist.remainingEnemies = Math.max(0, dist.remainingEnemies - 1);
          dist.influence = Math.min(100, dist.influence + 20);

          if (dist.influence >= 100 || dist.remainingEnemies <= 0) {
            dist.isConquered = true;
            dist.controlledBy = 'player_syndicate';
            dist.color = '#10b981';
            dist.influence = 100;
            soundManager.playTerritoryConquered();
            this.showToast(`🏆 DISTRICT CONQUERED: ${dist.name.toUpperCase()}!`, '#10b981');

            // Dispatch realistic voice radio narrative for conquered territory
            if (dist.districtKey === 'downtown') {
              voiceNarrator.narrate(MISSION_BRIEFINGS.district_downtown_conquered);
            } else if (dist.districtKey === 'waterfront') {
              voiceNarrator.narrate(MISSION_BRIEFINGS.district_waterfront_conquered);
            } else if (dist.districtKey === 'chinatown') {
              voiceNarrator.narrate(MISSION_BRIEFINGS.district_chinatown_conquered);
            } else if (dist.districtKey === 'industrial') {
              voiceNarrator.narrate(MISSION_BRIEFINGS.district_industrial_conquered);
            }
          } else {
            this.particles.addDamageNumber(`Influence +20% [${dist.influence}%]`, e.x, e.y, true, '#10b981');
          }
        }
        break;
      }
    }
  }

  public addGold(amount: number) {
    this.player.gold += amount;
    this.particles.addDamageNumber(`+${amount} G`, this.player.x, this.player.y, false, '#f59e0b');
  }

  public addXp(amount: number) {
    const p = this.player;
    p.xp += amount;
    this.particles.addDamageNumber(`+${amount} XP`, this.player.x, this.player.y, false, '#38bdf8');

    let needed = getXpRequired(p.level);
    while (p.xp >= needed) {
      p.xp -= needed;
      p.level++;
      p.maxHp += 20;
      p.maxStamina += 5;
      p.baseAttack += 3;
      p.baseDefense += 1;
      p.hp = p.maxHp;
      p.stamina = p.maxStamina;

      this.particles.spawnLevelUp(p.x, p.y);
      this.particles.addDamageNumber('LEVEL UP!', p.x, p.y, true, '#f59e0b');
      soundManager.playLevelUp();

      needed = getXpRequired(p.level);
    }
  }

  public addItemToInventory(item: Item): boolean {
    const p = this.player;
    // If stackable, find existing item
    if (item.stackable) {
      const existing = p.inventory.find(i => i.id === item.id);
      if (existing) {
        existing.quantity += item.quantity || 1;
        return true;
      }
    }
    // Check 20 slot capacity
    if (p.inventory.length >= 20) {
      this.particles.addDamageNumber('Inventory Full!', p.x, p.y, false, '#ef4444');
      return false;
    }
    p.inventory.push({ ...item });
    return true;
  }

  // Update Enemy AI State Machines
  private updateEnemies(dt: number) {
    const p = this.player;
    const allEnemies = this.enemies.concat(this.activeInfiniteEnemies);
    const allColliders = this.world.colliders.concat(
      this.infiniteChunks.flatMap(c => c.colliders)
    );

    for (let i = 0; i < allEnemies.length; i++) {
      const e = allEnemies[i];

      // Respawning
      if (e.isDead) {
        if (!e.isBoss) {
          e.respawnTimer -= dt;
          if (e.respawnTimer <= 0 && Math.hypot(p.x - e.spawnX, p.y - e.spawnY) > 500) {
            e.isDead = false;
            e.hp = e.maxHp;
            e.x = e.spawnX;
            e.y = e.spawnY;
            e.state = 'IDLE';
            e.stateTimer = 1;
          }
        }
        continue;
      }

      // Hurt timer
      if (e.hurtTimer > 0) {
        e.hurtTimer -= dt;
        if (e.hurtTimer <= 0) {
          e.state = 'CHASE';
        }
        continue;
      }

      if (e.attackCooldown > 0) {
        e.attackCooldown -= dt;
      }

      const distToPlayer = Math.hypot(p.x - e.x, p.y - e.y);

      // Boss special AI
      if (e.isBoss) {
        this.updateBossAI(e, dt, distToPlayer);
        continue;
      }

      // Regular Enemy AI
      switch (e.state) {
        case 'IDLE':
          e.stateTimer -= dt;
          if (distToPlayer < 300) {
            e.state = 'CHASE';
          } else if (e.stateTimer <= 0) {
            e.state = 'WANDER';
            e.stateTimer = 2 + Math.random() * 2;
            const wanderAngle = Math.random() * Math.PI * 2;
            const wanderDist = 40 + Math.random() * 60;
            e.wanderTarget = {
              x: e.spawnX + Math.cos(wanderAngle) * wanderDist,
              y: e.spawnY + Math.sin(wanderAngle) * wanderDist,
            };
          }
          break;

        case 'WANDER':
          e.stateTimer -= dt;
          if (distToPlayer < 300) {
            e.state = 'CHASE';
          } else if (e.wanderTarget && e.stateTimer > 0) {
            const wdx = e.wanderTarget.x - e.x;
            const wdy = e.wanderTarget.y - e.y;
            const wDist = Math.hypot(wdx, wdy);
            if (wDist > 5) {
              const res = resolveMovement(
                e.x, e.y,
                (wdx / wDist) * (e.speed * 0.5) * dt,
                (wdy / wDist) * (e.speed * 0.5) * dt,
                e.radius,
                WORLD_WIDTH, WORLD_HEIGHT,
                allColliders
              );
              e.x = res.x;
              e.y = res.y;
            } else {
              e.state = 'IDLE';
              e.stateTimer = 1 + Math.random() * 2;
            }
          } else {
            e.state = 'IDLE';
            e.stateTimer = 1 + Math.random() * 2;
          }
          break;

        case 'CHASE':
          if (distToPlayer > 480) {
            // Player escaped
            e.state = 'WANDER';
            e.stateTimer = 2;
            e.wanderTarget = { x: e.spawnX, y: e.spawnY };
          } else {
            // Cultist magic projectile attack check
            if (e.type === 'cultist' && distToPlayer < 260 && distToPlayer > 80 && e.attackCooldown <= 0) {
              this.cultistCastRangedAttack(e);
              e.attackCooldown = 2.4;
            } else if (e.type !== 'cultist' && !e.isBoss && distToPlayer <= 340 && distToPlayer >= 75 && e.attackCooldown <= 0) {
              // Syndicate Enforcers, Cartel Hitmen, Mobsters and Outlaws fight back with firearms!
              this.enemyFirearmRangedAttack(e);
              e.attackCooldown = 1.4 + Math.random() * 1.1;
            }

            const attackRange = e.radius + 18;
            if (distToPlayer <= attackRange) {
              // In melee attack range
              if (e.attackCooldown <= 0) {
                this.enemyMeleeAttack(e);
                e.attackCooldown = 0.9;
              }
            } else {
              // Chase player with tactical strafing
              const cdx = (p.x - e.x) / distToPlayer;
              const cdy = (p.y - e.y) / distToPlayer;
              // Tactical lateral strafe movement so enemies don't walk in a single predictable line
              const strafeSign = (e.id.charCodeAt(0) % 2 === 0 ? 1 : -1);
              const strafeAmount = Math.sin(Date.now() * 0.003 + (e.id.charCodeAt(0) || 0)) * 0.45;
              const moveX = (cdx + (-cdy * strafeSign * strafeAmount)) * e.speed * dt;
              const moveY = (cdy + (cdx * strafeSign * strafeAmount)) * e.speed * dt;

              const res = resolveMovement(
                e.x, e.y,
                moveX,
                moveY,
                e.radius,
                WORLD_WIDTH, WORLD_HEIGHT,
                allColliders
              );
              e.x = res.x;
              e.y = res.y;
            }
          }
          break;
      }
    }
  }

  // Boss Attack Patterns
  private updateBossAI(boss: Enemy, dt: number, distToPlayer: number) {
    const p = this.player;
    if (boss.bossAttackTimer !== undefined) {
      boss.bossAttackTimer -= dt;
    }

    if (distToPlayer < 500) {
      boss.state = 'CHASE';

      // Move toward player slowly
      if (distToPlayer > 50) {
        const dx = (p.x - boss.x) / distToPlayer;
        const dy = (p.y - boss.y) / distToPlayer;
        const res = resolveMovement(
          boss.x, boss.y,
          dx * boss.speed * dt,
          dy * boss.speed * dt,
          boss.radius,
          WORLD_WIDTH, WORLD_HEIGHT,
          this.world.colliders
        );
        boss.x = res.x;
        boss.y = res.y;
      }

      // Execute boss attacks on timer
      if (boss.bossAttackTimer !== undefined && boss.bossAttackTimer <= 0) {
        boss.bossAttackPattern = ((boss.bossAttackPattern || 0) + 1) % 3;
        boss.bossAttackTimer = 2.2;

        if (boss.bossAttackPattern === 0) {
          // Attack 1: Massive Sword Slash
          if (distToPlayer < 75) {
            this.enemyMeleeAttack(boss);
          }
        } else if (boss.bossAttackPattern === 1) {
          // Attack 2: Fire Projectiles (3 fan projectiles)
          const baseAngle = Math.atan2(p.y - boss.y, p.x - boss.x);
          [-0.25, 0, 0.25].forEach(offset => {
            const angle = baseAngle + offset;
            this.projectiles.push({
              id: `boss_proj_${Math.random()}`,
              x: boss.x,
              y: boss.y,
              vx: Math.cos(angle) * 160,
              vy: Math.sin(angle) * 160,
              radius: 8,
              damage: 20,
              life: 3.5,
              maxLife: 3.5,
              isHostile: true,
              color: '#f97316',
            });
          });
          soundManager.playSwordSwing();
        } else {
          // Attack 3: Ground Burst Danger Zones
          for (let k = 0; k < 3; k++) {
            const targetX = p.x + (Math.random() - 0.5) * 140;
            const targetY = p.y + (Math.random() - 0.5) * 140;
            this.dangerZones.push({
              id: `danger_${Math.random()}`,
              x: targetX,
              y: targetY,
              radius: 40,
              timer: 1.2,
              maxTimer: 1.2,
              exploded: false,
              damage: 25,
            });
          }
        }
      }
    } else {
      boss.state = 'IDLE';
    }
  }

  private cultistCastRangedAttack(cultist: Enemy) {
    const p = this.player;
    const angle = Math.atan2(p.y - cultist.y, p.x - cultist.x);
    this.projectiles.push({
      id: `proj_${Math.random()}`,
      x: cultist.x,
      y: cultist.y,
      vx: Math.cos(angle) * 140,
      vy: Math.sin(angle) * 140,
      radius: 6,
      damage: 16,
      life: 3.0,
      maxLife: 3.0,
      isHostile: true,
      color: '#c084fc',
    });
    soundManager.playSwordSwing();
  }

  private enemyFirearmRangedAttack(e: Enemy) {
    const p = this.player;
    const baseAngle = Math.atan2(p.y - e.y, p.x - e.x);
    // Realistic combat bullet spread
    const angle = baseAngle + (Math.random() - 0.5) * 0.2;
    const bulletSpeed = 330;

    this.projectiles.push({
      id: `enemy_bullet_${Math.random()}`,
      x: e.x + Math.cos(angle) * (e.radius + 8),
      y: e.y + Math.sin(angle) * (e.radius + 8),
      vx: Math.cos(angle) * bulletSpeed,
      vy: Math.sin(angle) * bulletSpeed,
      radius: 4,
      damage: Math.max(5, Math.round(e.attack * 0.75)),
      life: 1.2,
      maxLife: 1.2,
      isHostile: true,
      isPlayerBullet: false,
      color: '#f87171',
    });

    this.particles.spawnMuzzleSparks(e.x, e.y, angle, '#f87171');
    soundManager.playMobGunfire();
  }

  private enemyMeleeAttack(e: Enemy) {
    const p = this.player;
    const totalDefense = p.baseDefense + (p.equipment.armor?.defense || 0);
    const dmg = calculateDamageToPlayer(e.attack, totalDefense);

    p.hp -= dmg;
    this.particles.spawnHit(p.x, p.y, '#ef4444');
    this.particles.addDamageNumber(`-${dmg}`, p.x, p.y, false, '#ef4444');
    soundManager.playPlayerHurt();

    // Lock retaliation target immediately onto this enemy
    p.autoAimTargetId = e.id;
    if (p.autoShoot && p.attackCooldown <= 0) {
      this.executeAttack();
    }

    if (p.hp <= 0) {
      this.handlePlayerDeath();
    }
  }

  private updateProjectiles(dt: number) {
    const p = this.player;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;

      // Check collision with player
      if (proj.isHostile) {
        if (p.invulnerableTimer > 0 || p.isDashing) {
          // Tactical Dash i-frames! Bullet grazed
        } else if (Math.hypot(p.x - proj.x, p.y - proj.y) < proj.radius + 14) {
          const totalDefense = p.baseDefense + (p.equipment.armor?.defense || 0);
          const dmg = calculateDamageToPlayer(proj.damage, totalDefense);
          p.hp -= dmg;
          this.particles.spawnHit(p.x, p.y, proj.color);
          this.particles.addDamageNumber(`-${dmg}`, p.x, p.y, false, '#ef4444');
          soundManager.playPlayerHurt();

          // Retaliation trigger when player is hit by ranged fire
          if (proj.id && p.autoShoot) {
            const allEnemies = this.getAllActiveEnemies();
            const nearestThreat = allEnemies.find(e => Math.hypot(e.x - p.x, e.y - p.y) < 360);
            if (nearestThreat) p.autoAimTargetId = nearestThreat.id;
          }

          if (p.hp <= 0) {
            this.handlePlayerDeath();
          }

          this.projectiles.splice(i, 1);
          continue;
        }
      } else if (proj.isPlayerBullet) {
        // Rocket trail smoke & fire
        if (proj.isRocket) {
          proj.trailTimer = (proj.trailTimer || 0) + dt;
          if (proj.trailTimer > 0.04) {
            proj.trailTimer = 0;
            const bAngle = Math.atan2(proj.vy, proj.vx) + Math.PI;
            this.particles.spawnMuzzleSparks(proj.x, proj.y, bAngle, '#f97316');
          }
        }

        const allEnemies = this.getAllActiveEnemies();
        let bulletDestroyed = false;

        for (let k = 0; k < allEnemies.length; k++) {
          const e = allEnemies[k];
          if (e.isDead) continue;
          if (proj.hitEntityIds && proj.hitEntityIds.includes(e.id)) continue;

          if (Math.hypot(e.x - proj.x, e.y - proj.y) < proj.radius + e.radius) {
            if (!proj.hitEntityIds) proj.hitEntityIds = [];
            proj.hitEntityIds.push(e.id);

            const isCrit = Math.random() < 0.20;
            const netDmg = Math.max(1, Math.round((isCrit ? proj.damage * 1.5 : proj.damage) - e.defense * 0.4));
            e.hp -= netDmg;
            e.hurtTimer = 0.14;
            e.state = 'HURT';

            // Knockback
            const hitAngle = Math.atan2(proj.vy, proj.vx);
            const kb = proj.knockback || 14;
            e.x += Math.cos(hitAngle) * kb;
            e.y += Math.sin(hitAngle) * kb;

            // Enemy tactical combat roll evasion (25% chance when shot)
            if (Math.random() < 0.25 && !e.isBoss) {
              const rollAngle = hitAngle + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2);
              e.x += Math.cos(rollAngle) * 26;
              e.y += Math.sin(rollAngle) * 26;
              this.particles.spawnDashTrail(e.x, e.y, rollAngle);
              soundManager.playMobRoll();
            }

            // Hit effects & hitmarker sound
            p.hitmarkerTimer = 0.12;
            soundManager.playHitMarker();
            this.particles.spawnHit(e.x, e.y, isCrit ? '#fbbf24' : proj.color);
            this.particles.addDamageNumber(`-${netDmg}`, e.x, e.y, isCrit, isCrit ? '#fbbf24' : '#ffffff');

            // Tesla chain lightning effect
            if (proj.isTesla) {
              soundManager.playTeslaShock();
              let chainsLeft = 2;
              for (let c = 0; c < allEnemies.length; c++) {
                if (chainsLeft <= 0) break;
                const arcTarget = allEnemies[c];
                if (arcTarget.isDead || arcTarget.id === e.id) continue;
                const arcDist = Math.hypot(arcTarget.x - e.x, arcTarget.y - e.y);
                if (arcDist < 140) {
                  chainsLeft--;
                  const shockDmg = Math.round(proj.damage * 0.7);
                  arcTarget.hp -= shockDmg;
                  arcTarget.hurtTimer = 0.25;
                  arcTarget.state = 'HURT';
                  this.particles.spawnHit(arcTarget.x, arcTarget.y, '#38bdf8');
                  this.particles.addDamageNumber(`⚡-${shockDmg}`, arcTarget.x, arcTarget.y, true, '#38bdf8');
                  if (arcTarget.hp <= 0) this.handleEnemyDeath(arcTarget);
                }
              }
            }

            // Cryo freeze effect
            if (proj.isCryo) {
              e.hurtTimer = 2.0;
              e.speed = Math.max(10, e.speed * 0.4);
              this.particles.spawnHit(e.x, e.y, '#06b6d4');
              this.particles.addDamageNumber('FREEZE!', e.x, e.y, true, '#06b6d4');
            }

            // Flamethrower burn
            if (proj.isFlamethrower) {
              e.hurtTimer = 0.4;
              this.particles.spawnMuzzleSparks(e.x, e.y, Math.random() * Math.PI * 2, '#f97316');
            }

            // Cluster missile splitting on detonation
            if (proj.isCluster) {
              soundManager.playRocketExplosion();
              for (let cl = 0; cl < 3; cl++) {
                const subAngle = Math.random() * Math.PI * 2;
                this.projectiles.push({
                  id: `cluster_sub_${Math.random()}`,
                  x: proj.x,
                  y: proj.y,
                  vx: Math.cos(subAngle) * 320,
                  vy: Math.sin(subAngle) * 320,
                  radius: 5,
                  damage: 45,
                  life: 0.35,
                  maxLife: 0.35,
                  isHostile: false,
                  isPlayerBullet: true,
                  color: '#f97316',
                  splashRadius: 50,
                  isRocket: true,
                  hitEntityIds: [e.id],
                });
              }
            }

            // Orbital Beacon strike
            if (proj.isOrbital) {
              soundManager.playOrbitalStrike();
              this.particles.spawnBossBurst(proj.x, proj.y, 160);
              this.addScreenShake(20);
            }

            // Rocket explosion / Splash damage
            if (proj.splashRadius && proj.splashRadius > 0) {
              this.particles.spawnExplosion(proj.x, proj.y, proj.splashRadius);
              soundManager.playRocketExplosion();
              this.addScreenShake(14);

              for (let s = 0; s < allEnemies.length; s++) {
                const splashTarget = allEnemies[s];
                if (splashTarget.isDead || splashTarget.id === e.id) continue;
                const splashDist = Math.hypot(splashTarget.x - proj.x, splashTarget.y - proj.y);
                if (splashDist <= proj.splashRadius) {
                  const falloff = 1 - splashDist / proj.splashRadius;
                  const splashDmg = Math.max(1, Math.round(proj.damage * 0.85 * falloff));
                  splashTarget.hp -= splashDmg;
                  splashTarget.hurtTimer = 0.14;
                  splashTarget.state = 'HURT';
                  this.particles.addDamageNumber(`-${splashDmg}`, splashTarget.x, splashTarget.y, false, '#f97316');
                  if (splashTarget.hp <= 0) {
                    this.handleEnemyDeath(splashTarget);
                  }
                }
              }

              bulletDestroyed = true;
              break;
            }

            if (e.hp <= 0) {
              this.handleEnemyDeath(e);
            }

            // Penetration check
            proj.penetration = (proj.penetration || 1) - 1;
            if (proj.penetration <= 0) {
              bulletDestroyed = true;
              break;
            }
          }
        }

        if (bulletDestroyed) {
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      if (proj.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateDangerZones(dt: number) {
    const p = this.player;
    for (let i = this.dangerZones.length - 1; i >= 0; i--) {
      const dz = this.dangerZones[i];
      dz.timer -= dt;

      if (dz.timer <= 0 && !dz.exploded) {
        dz.exploded = true;
        this.particles.spawnBossBurst(dz.x, dz.y, dz.radius);
        soundManager.playBossExplosion();

        // Check if player in radius
        if (Math.hypot(p.x - dz.x, p.y - dz.y) < dz.radius) {
          const totalDefense = p.baseDefense + (p.equipment.armor?.defense || 0);
          const dmg = calculateDamageToPlayer(dz.damage, totalDefense);
          p.hp -= dmg;
          this.particles.spawnHit(p.x, p.y, '#ef4444');
          this.particles.addDamageNumber(`-${dmg}`, p.x, p.y, true, '#ef4444');
          soundManager.playPlayerHurt();

          if (p.hp <= 0) {
            this.handlePlayerDeath();
          }
        }

        this.dangerZones.splice(i, 1);
      }
    }
  }

  private handlePlayerDeath() {
    this.player.hp = 0;
    this.deathGoldLost = Math.floor(this.player.gold * 0.1);
    this.player.gold -= this.deathGoldLost;
    this.mode = 'GAME_OVER';
  }

  public respawnPlayer(location?: RespawnLocation | { x: number; y: number; name: string }) {
    this.player.hp = this.player.maxHp;
    this.player.stamina = this.player.maxStamina;
    this.player.isReloading = false;
    this.player.isDashing = false;
    this.player.shootCooldown = 0;

    // Pick target location or pick random from available RESPAWN_LOCATIONS
    const dest = location || RESPAWN_LOCATIONS[Math.floor(Math.random() * RESPAWN_LOCATIONS.length)];
    this.player.x = dest.x;
    this.player.y = dest.y;
    this.mode = 'PLAYING';
    soundManager.playHeal();
    this.particles.addDamageNumber(`Revived: ${dest.name}`, this.player.x, this.player.y, true, '#38bdf8');
    this.showToast(`Revived at ${dest.name}!`, '#38bdf8');
  }

  // Check Nearest Interactable Object
  public getNearestInteractable(): { text: string; x: number; y: number } | null {
    const p = this.player;

    if (p.mountedVehicle) {
      return { text: '[E/V] Dismount Vehicle', x: p.x, y: p.y };
    }

    let nearestDist = INTERACTION_RANGE;
    let result: { text: string; x: number; y: number } | null = null;

    // 0. Vehicles
    for (const v of this.vehicleMgr.vehicles) {
      const dist = Math.hypot(p.x - v.x, p.y - v.y);
      if (dist < 60 && dist < nearestDist) {
        nearestDist = dist;
        result = { text: `[E/V] Board ${v.name}`, x: v.x, y: v.y };
      }
    }

    // 0b. Resource Nodes
    for (const node of this.factoryMgr.resourceNodes) {
      const dist = Math.hypot(p.x - node.x, p.y - node.y);
      if (dist < 55 && dist < nearestDist && node.amount > 0) {
        nearestDist = dist;
        result = { text: `[E] Mine ${node.type.toUpperCase()} (${node.amount})`, x: node.x, y: node.y };
      }
    }

    // 1. NPCs
    for (const npc of this.npcs) {
      const dist = Math.hypot(p.x - npc.x, p.y - npc.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        result = { text: `[E] Talk to ${npc.name}`, x: npc.x, y: npc.y };
      }
    }

    // 2. Chests
    for (const chest of this.world.chests) {
      if (!chest.opened) {
        const dist = Math.hypot(p.x - chest.x, p.y - chest.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          result = { text: '[E] Open Chest', x: chest.x, y: chest.y };
        }
      }
    }

    // 2b. Infinite Sector Supply Crates
    for (const chunk of this.infiniteChunks) {
      for (const chest of chunk.chests) {
        if (!chest.opened) {
          const dist = Math.hypot(p.x - chest.x, p.y - chest.y);
          if (dist < nearestDist && dist <= INTERACTION_RANGE + 15) {
            nearestDist = dist;
            result = { text: '[E] Open Supply Crate', x: chest.x, y: chest.y };
          }
        }
      }
    }

    // 3. Ancient Inscription
    const ins = this.world.watchtowerInscription;
    const insDist = Math.hypot(p.x - ins.x, p.y - ins.y);
    if (insDist < nearestDist) {
      nearestDist = insDist;
      result = { text: '[E] Read Inscription', x: ins.x, y: ins.y };
    }

    // 4. Inner Keep Gate
    if (!this.isGateUnlocked) {
      const gateDist = Math.hypot(p.x - 580, p.y - 330);
      if (gateDist < nearestDist) {
        result = { text: '[E] Unlock Inner Gate', x: 580, y: 330 };
      }
    }

    return result;
  }

  // Handle [E] key interaction
  public handleInteraction() {
    const p = this.player;

    // 0. Dismount vehicle if mounted
    if (p.mountedVehicle) {
      this.toggleMountVehicle();
      return;
    }

    // 0b. Mount vehicle if nearby
    for (const v of this.vehicleMgr.vehicles) {
      if (Math.hypot(p.x - v.x, p.y - v.y) <= 60) {
        this.toggleMountVehicle();
        return;
      }
    }

    // 0c. Mine Resource Node
    for (const node of this.factoryMgr.resourceNodes) {
      if (node.amount > 0 && Math.hypot(p.x - node.x, p.y - node.y) <= 55) {
        const yieldAmount = Math.min(10, node.amount);
        node.amount -= yieldAmount;
        if (node.type === 'iron' || node.type === 'iron_vein') this.factoryMgr.colony.rawOre += yieldAmount;
        else if (node.type === 'titanium' || node.type === 'titanium_deposit') this.factoryMgr.colony.titanium += yieldAmount;
        else if (node.type === 'plasma' || node.type === 'plasma_crystal') this.factoryMgr.colony.energyCells += yieldAmount;
        else this.factoryMgr.colony.colonyCredits += yieldAmount * 3;

        soundManager.playSawblade();
        this.particles.spawnHit(node.x, node.y, '#eab308');
        this.showToast(`+${yieldAmount} ${node.type.toUpperCase()}`, '#eab308');
        return;
      }
    }

    // 1. Check NPCs
    for (const npc of this.npcs) {
      if (Math.hypot(p.x - npc.x, p.y - npc.y) <= INTERACTION_RANGE) {
        this.interactWithNPC(npc);
        return;
      }
    }

    // 2. Check Core Chests
    for (const chest of this.world.chests) {
      if (!chest.opened && Math.hypot(p.x - chest.x, p.y - chest.y) <= INTERACTION_RANGE) {
        this.openChest(chest);
        return;
      }
    }

    // 2b. Check Infinite Sector Supply Crates
    for (const chunk of this.infiniteChunks) {
      for (const chest of chunk.chests) {
        if (!chest.opened && Math.hypot(p.x - chest.x, p.y - chest.y) <= INTERACTION_RANGE + 15) {
          this.openInfiniteChest(chest);
          return;
        }
      }
    }

    // 3. Check Ancient Inscription at Watchtower
    const ins = this.world.watchtowerInscription;
    if (Math.hypot(p.x - ins.x, p.y - ins.y) <= INTERACTION_RANGE) {
      this.readInscription();
      return;
    }

    // 4. Check Inner Keep Gate
    if (!this.isGateUnlocked && Math.hypot(p.x - 580, p.y - 330) <= INTERACTION_RANGE + 20) {
      this.unlockGate();
      return;
    }
  }

  private openInfiniteChest(chest: Chest) {
    chest.opened = true;
    infiniteWorldManager.recordChestOpened(chest.id);
    soundManager.playChestOpen();

    this.addGold(chest.gold);
    this.particles.spawnBossBurst(chest.x, chest.y, 25);
    this.particles.addDamageNumber(`+${chest.gold} Gold`, chest.x, chest.y, true, '#fbbf24');

    if (chest.itemId && ITEMS[chest.itemId]) {
      const item = { ...ITEMS[chest.itemId] };
      this.addItemToInventory(item);
      this.particles.addDamageNumber(`Found ${item.name}!`, chest.x, chest.y, true, '#38bdf8');
      if (chest.itemId === 'ammo_cache') {
        this.refillAllAmmo();
      }
    }
  }

  private interactWithNPC(npc: NPC) {
    this.activeNPC = npc;
    this.dialogueLineIndex = 0;
    this.mode = 'DIALOGUE';
    soundManager.playClick();
  }

  public advanceDialogue() {
    if (!this.activeNPC) return;

    this.dialogueLineIndex++;
    soundManager.playClick();

    if (this.dialogueLineIndex >= this.activeNPC.dialogueSequence.length) {
      // Finished dialogue
      const npc = this.activeNPC;
      this.activeNPC = null;

      // Check if NPC is Shopkeeper
      if (npc.isShop) {
        this.activeShopNPC = npc;
        this.mode = 'SHOP';
        return;
      }

      // Check if NPC is Innkeeper
      if (npc.isInn) {
        this.handleInnRest();
        this.mode = 'PLAYING';
        return;
      }

      // Check if NPC offers/advances Quests
      if (npc.id === 'elder_rowan') {
        this.handleElderRowanQuests();
      }

      this.mode = 'PLAYING';
    }
  }

  private handleInnRest() {
    if (this.player.gold >= 5) {
      this.player.gold -= 5;
      this.player.hp = this.player.maxHp;
      this.player.stamina = this.player.maxStamina;
      soundManager.playPotion();
      this.particles.addDamageNumber('Rested! Full HP & Stamina', this.player.x, this.player.y, false, '#34d399');
      this.quickSave();
    } else {
      this.particles.addDamageNumber('Need 5 Gold to Rest', this.player.x, this.player.y, false, '#ef4444');
    }
  }

  private handleElderRowanQuests() {
    const q1 = this.quests.find(q => q.id === 'quest_1');
    const q2 = this.quests.find(q => q.id === 'quest_2');
    const q3 = this.quests.find(q => q.id === 'quest_3');
    const q4 = this.quests.find(q => q.id === 'quest_4');
    const q5 = this.quests.find(q => q.id === 'quest_5');

    if (q1 && q1.status === 'NOT_STARTED') {
      q1.status = 'ACTIVE';
      this.particles.addDamageNumber('Quest Started: Trouble in the Forest', this.player.x, this.player.y, true, '#f59e0b');
    } else if (q1 && q1.status === 'ACTIVE' && q1.objectives[0].completed) {
      this.completeQuest(q1);
      if (q2) {
        q2.status = 'ACTIVE';
        this.particles.addDamageNumber('Quest Started: The Abandoned Watchtower', this.player.x, this.player.y, true, '#f59e0b');
      }
    } else if (q2 && q2.status === 'COMPLETED' && q3 && q3.status === 'NOT_STARTED') {
      q3.status = 'ACTIVE';
      this.particles.addDamageNumber('Quest Started: Ashen Fields', this.player.x, this.player.y, true, '#f59e0b');
    } else if (q3 && q3.status === 'ACTIVE' && q3.objectives[0].completed && q3.objectives[1].completed) {
      this.completeQuest(q3);
      if (q4 && q4.status === 'NOT_STARTED') {
        q4.status = 'ACTIVE';
        this.particles.addDamageNumber('Quest Started: The Ashen Key', this.player.x, this.player.y, true, '#f59e0b');
      }
    } else if (q4 && q4.status === 'COMPLETED' && q5 && q5.status === 'NOT_STARTED') {
      q5.status = 'ACTIVE';
      this.particles.addDamageNumber('Final Quest Started: The Ruined Keep', this.player.x, this.player.y, true, '#ef4444');
    }
  }

  private completeQuest(q: Quest) {
    q.status = 'COMPLETED';
    this.addXp(q.rewards.xp);
    if (q.rewards.gold > 0) this.addGold(q.rewards.gold);
    if (q.rewards.itemId && ITEMS[q.rewards.itemId]) {
      this.addItemToInventory({ ...ITEMS[q.rewards.itemId] });
      this.particles.addDamageNumber(`Received ${ITEMS[q.rewards.itemId].name}!`, this.player.x, this.player.y, true, '#fbbf24');
    }
    soundManager.playLevelUp();
    this.particles.addDamageNumber(`Quest Completed: ${q.title}!`, this.player.x, this.player.y, true, '#34d399');
  }

  private openChest(chest: Chest) {
    // Check if guards defeated (for Ashen Key chest)
    if (chest.requiresGuardsDefeated) {
      const nearGuards = this.enemies.filter(
        e => !e.isDead && Math.hypot(e.x - chest.x, e.y - chest.y) < 140
      );
      if (nearGuards.length > 0) {
        this.particles.addDamageNumber('Defeat nearby guards first!', chest.x, chest.y, false, '#ef4444');
        return;
      }
    }

    chest.opened = true;
    soundManager.playChestOpen();

    if (chest.gold > 0) {
      this.addGold(chest.gold);
    }
    if (chest.itemId && ITEMS[chest.itemId]) {
      const item = { ...ITEMS[chest.itemId] };
      this.addItemToInventory(item);
      this.particles.addDamageNumber(`Found ${item.name}!`, chest.x, chest.y, true, '#fbbf24');

      // Check if Ashen Key obtained for Quest 4
      if (chest.itemId === 'ashen_key') {
        const q4 = this.quests.find(q => q.id === 'quest_4');
        if (q4 && q4.status === 'ACTIVE') {
          q4.objectives[0].current = 1;
          q4.objectives[0].completed = true;
          this.completeQuest(q4);
          // Auto unlock Quest 5
          const q5 = this.quests.find(q => q.id === 'quest_5');
          if (q5 && q5.status === 'NOT_STARTED') {
            q5.status = 'ACTIVE';
            this.particles.addDamageNumber('Final Quest: Slay the Ashen Lord!', this.player.x, this.player.y, true, '#ef4444');
          }
        }
      }
    }
  }

  private readInscription() {
    this.watchtowerExamined = true;
    soundManager.playChestOpen();

    // Check Quest 2
    const q2 = this.quests.find(q => q.id === 'quest_2');
    if (q2 && q2.status === 'ACTIVE') {
      q2.objectives[0].current = 1;
      q2.objectives[0].completed = true;
      this.completeQuest(q2);
      // Auto unlock Quest 3
      const q3 = this.quests.find(q => q.id === 'quest_3');
      if (q3 && q3.status === 'NOT_STARTED') {
        q3.status = 'ACTIVE';
        this.particles.addDamageNumber('Next Quest: Ashen Fields', this.player.x, this.player.y, true, '#f59e0b');
      }
    }

    this.activeNPC = {
      id: 'ancient_stone',
      name: 'Ancient Inscription',
      title: 'Runestone',
      x: this.world.watchtowerInscription.x,
      y: this.world.watchtowerInscription.y,
      dialogueSequence: [
        this.world.watchtowerInscription.text,
        'A chill runs down your spine as the dark truth of the keep is revealed.',
      ],
    };
    this.dialogueLineIndex = 0;
    this.mode = 'DIALOGUE';
  }

  private unlockGate() {
    const hasKey = this.player.inventory.some(i => i.id === 'ashen_key');
    if (hasKey) {
      this.isGateUnlocked = true;
      soundManager.playChestOpen();
      this.particles.spawnBossBurst(580, 330, 40);
      this.particles.addDamageNumber('Inner Gate Unlocked!', 580, 330, true, '#34d399');

      // Remove gate collider
      const idx = this.world.colliders.findIndex(c => c.id === 'col_inner_gate');
      if (idx !== -1) {
        this.world.colliders.splice(idx, 1);
      }
    } else {
      this.particles.addDamageNumber('Locked! Requires Ashen Key', 580, 330, false, '#ef4444');
    }
  }

  // Camera interpolation and infinite space tracking
  private updateCamera(screenW: number, screenH: number) {
    const shakeOffsetX = (Math.random() - 0.5) * this.screenShake.intensity * 2;
    const shakeOffsetY = (Math.random() - 0.5) * this.screenShake.intensity * 2;

    const targetCamX = this.player.x - screenW / 2 + shakeOffsetX;
    const targetCamY = this.player.y - screenH / 2 + shakeOffsetY;

    this.camera.x += (targetCamX - this.camera.x) * 0.12;
    this.camera.y += (targetCamY - this.camera.y) * 0.12;
  }

  // Update dynamic region music
  private updateMusicTrack() {
    if (!this.audioUnlocked) return;

    const px = this.player.x;
    const py = this.player.y;
    let nextTrack: 'village' | 'forest' | 'ashen' | 'boss' = 'village';

    const boss = this.enemies.find(e => e.type === 'boss');
    if (boss && !boss.isDead && Math.hypot(px - boss.x, py - boss.y) < 450) {
      nextTrack = 'boss';
    } else {
      const cx = Math.floor(px / 640);
      const cy = Math.floor(py / 640);
      const biome = infiniteWorldManager.getBiome(cx, cy);

      if (biome === 'woodlands') nextTrack = 'forest';
      else if (biome === 'badlands' || biome === 'wasteland_outpost') nextTrack = 'ashen';
      else if (biome === 'catacombs') nextTrack = 'boss';
      else if (biome === 'frost_tundra') nextTrack = 'forest';
      else if (px > 1850) nextTrack = 'forest';
      else if (px < 1050 || (px >= 1050 && px <= 1850 && py < 1150)) nextTrack = 'ashen';
      else nextTrack = 'village';
    }

    if (this.currentRegionTrack !== nextTrack) {
      this.currentRegionTrack = nextTrack;
      soundManager.playMusic(nextTrack);
    }
  }

  // Inventory interactions: Equip & Consume
  public useItem(item: Item) {
    if (item.type === 'CONSUMABLE' && item.restoreHp) {
      if (this.player.hp >= this.player.maxHp) {
        this.particles.addDamageNumber('Already full HP!', this.player.x, this.player.y, false, '#f59e0b');
        return;
      }
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + item.restoreHp);
      soundManager.playPotion();
      this.particles.addDamageNumber(`+${item.restoreHp} HP`, this.player.x, this.player.y, false, '#22c55e');

      item.quantity--;
      if (item.quantity <= 0) {
        const idx = this.player.inventory.indexOf(item);
        if (idx !== -1) this.player.inventory.splice(idx, 1);
      }
    } else if (item.type === 'WEAPON') {
      this.player.equipment.weapon = item;
      soundManager.playSwordSwing();
      this.particles.addDamageNumber(`Equipped ${item.name}!`, this.player.x, this.player.y, false, '#38bdf8');
    } else if (item.type === 'ARMOR') {
      this.player.equipment.armor = item;
      soundManager.playClick();
      this.particles.addDamageNumber(`Equipped ${item.name}!`, this.player.x, this.player.y, false, '#38bdf8');
    }
  }

  // Shop interactions: Buy & Sell
  public buyItem(itemId: string): boolean {
    const itemTemplate = ITEMS[itemId];
    if (!itemTemplate) return false;

    if (this.player.gold < itemTemplate.value) {
      this.particles.addDamageNumber('Not enough gold!', this.player.x, this.player.y, false, '#ef4444');
      return false;
    }

    if (this.addItemToInventory({ ...itemTemplate, quantity: 1 })) {
      this.player.gold -= itemTemplate.value;
      soundManager.playCoin();
      this.particles.addDamageNumber(`Bought ${itemTemplate.name}!`, this.player.x, this.player.y, false, '#fbbf24');
      return true;
    }
    return false;
  }

  public sellItem(item: Item): boolean {
    const sellValue = Math.floor(item.value * 0.5);
    if (sellValue <= 0) return false;

    // Check if equipped
    if (this.player.equipment.weapon?.id === item.id) {
      this.player.equipment.weapon = null;
    }
    if (this.player.equipment.armor?.id === item.id) {
      this.player.equipment.armor = null;
    }

    this.player.gold += sellValue;
    soundManager.playCoin();
    this.particles.addDamageNumber(`+${sellValue} G`, this.player.x, this.player.y, false, '#f59e0b');

    item.quantity--;
    if (item.quantity <= 0) {
      const idx = this.player.inventory.indexOf(item);
      if (idx !== -1) this.player.inventory.splice(idx, 1);
    }
    return true;
  }
}
