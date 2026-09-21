import { Vehicle, VehicleType, Player, Enemy, Projectile } from '../types';
import { VEHICLE_BLUEPRINTS, VehicleBlueprint } from './constants';
import { soundManager } from '../audio/soundManager';

export class VehicleManager {
  public vehicles: Vehicle[] = [];

  constructor() {
    this.spawnInitialVehicles();
  }

  public getVehicles(): Vehicle[] {
    return this.vehicles;
  }

  public spawnInitialVehicles() {
    this.vehicles = [
      {
        id: 'veh_sedan_falcone',
        type: 'mafia_sedan',
        name: '1930s Gangster V8 Limo',
        x: 1420,
        y: 1530,
        angle: 0,
        speed: 0,
        maxSpeed: 340,
        hp: 550,
        maxHp: 550,
        armor: 16,
        shield: 0,
        maxShield: 0,
        weaponType: 'tommy_turret',
        weaponCooldown: 0,
        color: '#18181b',
      },
      {
        id: 'veh_muscle_stallion',
        type: 'muscle_car',
        name: 'Stallion 427 V8 Muscle',
        x: 1220,
        y: 1530,
        angle: 0,
        speed: 0,
        maxSpeed: 420,
        hp: 480,
        maxHp: 480,
        armor: 14,
        shield: 0,
        maxShield: 0,
        weaponType: 'ram_bumper',
        weaponCooldown: 0,
        color: '#dc2626',
      },
      {
        id: 'veh_armored_bank',
        type: 'armored_van',
        name: 'Bank Enforcer Armored Truck',
        x: 1320,
        y: 390,
        angle: Math.PI / 2,
        speed: 0,
        maxSpeed: 240,
        hp: 950,
        maxHp: 950,
        armor: 28,
        shield: 100,
        maxShield: 100,
        weaponType: 'tommy_turret',
        weaponCooldown: 0,
        color: '#334155',
      },
      {
        id: 'veh_speedboat_river',
        type: 'river_speedboat',
        name: 'Cigarette Syndicate Speedboat',
        x: 1450,
        y: 1020,
        angle: 0,
        speed: 0,
        maxSpeed: 390,
        hp: 420,
        maxHp: 420,
        armor: 12,
        shield: 0,
        maxShield: 0,
        weaponType: 'dual_blaster',
        weaponCooldown: 0,
        color: '#0284c7',
      },
      {
        id: 'veh_gunboat_port',
        type: 'patrol_gunboat',
        name: 'Armored River Patrol Gunboat',
        x: 380,
        y: 960,
        angle: 0,
        speed: 0,
        maxSpeed: 290,
        hp: 750,
        maxHp: 750,
        armor: 22,
        shield: 150,
        maxShield: 150,
        weaponType: 'boat_cannon',
        weaponCooldown: 0,
        color: '#0f766e',
      },
      {
        id: 'veh_sports_coupe',
        type: 'sports_coupe',
        name: 'Viper GT Syndicate Roadster',
        x: 1680,
        y: 1530,
        angle: 0,
        speed: 0,
        maxSpeed: 450,
        hp: 380,
        maxHp: 380,
        armor: 10,
        shield: 0,
        maxShield: 0,
        weaponType: 'dual_blaster',
        weaponCooldown: 0,
        color: '#f59e0b',
      },
    ];
  }

  public spawnVehicle(type: VehicleType, x: number, y: number): Vehicle {
    const bp = VEHICLE_BLUEPRINTS[type];
    const newVeh: Vehicle = {
      id: `veh_${type}_${Date.now()}`,
      type,
      name: bp?.name || 'Custom Vehicle',
      x,
      y,
      angle: 0,
      speed: 0,
      maxSpeed: bp?.maxSpeed || 280,
      hp: bp?.maxHp || 400,
      maxHp: bp?.maxHp || 400,
      armor: bp?.armor || 12,
      shield: bp?.maxShield || 150,
      maxShield: bp?.maxShield || 150,
      weaponType: bp?.weaponType || 'dual_blaster',
      weaponCooldown: 0,
      color: bp?.color || '#38bdf8',
    };
    this.vehicles.push(newVeh);
    soundManager.playVehicleMount();
    return newVeh;
  }

  public mountVehicle(player: Player, v: Vehicle): boolean {
    if (player.mountedVehicle) return false;
    player.mountedVehicle = v;
    player.x = v.x;
    player.y = v.y;
    soundManager.playVehicleMount();
    return true;
  }

  public dismountVehicle(player: Player): boolean {
    if (!player.mountedVehicle) return false;
    const v = player.mountedVehicle;
    // Step out beside vehicle
    player.x = v.x + Math.cos(v.angle + Math.PI / 2) * 36;
    player.y = v.y + Math.sin(v.angle + Math.PI / 2) * 36;
    player.mountedVehicle = null;
    soundManager.playClick();
    return true;
  }

  public toggleMountVehicle(player: Player): { success: boolean; msg: string } {
    if (player.mountedVehicle) {
      this.dismountVehicle(player);
      return { success: true, msg: 'Dismounted Vehicle' };
    }

    // Find nearest vehicle within 50px
    let nearest: Vehicle | null = null;
    let minDist = 60;
    for (const v of this.vehicles) {
      const d = Math.hypot(player.x - v.x, player.y - v.y);
      if (d < minDist) {
        minDist = d;
        nearest = v;
      }
    }

    if (nearest) {
      this.mountVehicle(player, nearest);
      return { success: true, msg: `Boarded ${nearest.name}!` };
    }

    return { success: false, msg: 'No vehicle in range (get closer)' };
  }

  public fireVehicleWeapon(v: Vehicle, aimAngle: number, projectiles: Projectile[]) {
    if (v.weaponCooldown > 0) return;

    if (v.weaponType === 'dual_blaster') {
      // Twin rapid energy blasters
      v.weaponCooldown = 0.15;
      [-10, 10].forEach(offsetY => {
        const perpAngle = aimAngle + Math.PI / 2;
        const ox = v.x + Math.cos(aimAngle) * 25 + Math.cos(perpAngle) * offsetY;
        const oy = v.y + Math.sin(aimAngle) * 25 + Math.sin(perpAngle) * offsetY;
        projectiles.push({
          id: `veh_bullet_${Math.random()}`,
          x: ox,
          y: oy,
          vx: Math.cos(aimAngle) * 880,
          vy: Math.sin(aimAngle) * 880,
          radius: 4,
          damage: 32,
          life: 0.7,
          maxLife: 0.7,
          isHostile: false,
          isPlayerBullet: true,
          color: '#38bdf8',
          isLaser: true,
          hitEntityIds: [],
        });
      });
      soundManager.playLaserShot();
    } else if (v.weaponType === 'heavy_cannon') {
      // 120mm concussive explosive cannon
      v.weaponCooldown = 1.1;
      const muzzleX = v.x + Math.cos(aimAngle) * 35;
      const muzzleY = v.y + Math.sin(aimAngle) * 35;
      projectiles.push({
        id: `tank_shell_${Math.random()}`,
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(aimAngle) * 620,
        vy: Math.sin(aimAngle) * 620,
        radius: 8,
        damage: 220,
        life: 1.2,
        maxLife: 1.2,
        isHostile: false,
        isPlayerBullet: true,
        color: '#f97316',
        isRocket: true,
        splashRadius: 90,
        knockback: 60,
        hitEntityIds: [],
      });
      soundManager.playRocketLaunch();
    } else if (v.weaponType === 'twin_vulcan') {
      // Mech rotary cannons
      v.weaponCooldown = 0.08;
      const spread = (Math.random() - 0.5) * 0.12;
      const fireAngle = aimAngle + spread;
      const muzzleX = v.x + Math.cos(aimAngle) * 28;
      const muzzleY = v.y + Math.sin(aimAngle) * 28;
      projectiles.push({
        id: `mech_vulcan_${Math.random()}`,
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(fireAngle) * 850,
        vy: Math.sin(fireAngle) * 850,
        radius: 4,
        damage: 26,
        life: 0.65,
        maxLife: 0.65,
        isHostile: false,
        isPlayerBullet: true,
        color: '#facc15',
        hitEntityIds: [],
      });
      soundManager.playMinigunShot();
    } else if (v.weaponType === 'mining_drill') {
      // Ultrasonic mining drill
      v.weaponCooldown = 0.2;
      const drillX = v.x + Math.cos(aimAngle) * 32;
      const drillY = v.y + Math.sin(aimAngle) * 32;
      projectiles.push({
        id: `drill_pulse_${Math.random()}`,
        x: drillX,
        y: drillY,
        vx: Math.cos(aimAngle) * 350,
        vy: Math.sin(aimAngle) * 350,
        radius: 14,
        damage: 55,
        life: 0.25,
        maxLife: 0.25,
        isHostile: false,
        isPlayerBullet: true,
        color: '#eab308',
        hitEntityIds: [],
      });
      soundManager.playSawblade();
    } else if (v.weaponType === 'tommy_turret') {
      // Rapid .45 Tommy Gun drive-by turret
      v.weaponCooldown = 0.09;
      const spread = (Math.random() - 0.5) * 0.15;
      const fireAngle = aimAngle + spread;
      const muzzleX = v.x + Math.cos(aimAngle) * 30;
      const muzzleY = v.y + Math.sin(aimAngle) * 30;
      projectiles.push({
        id: `tommy_veh_${Math.random()}`,
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(fireAngle) * 920,
        vy: Math.sin(fireAngle) * 920,
        radius: 3.5,
        damage: 34,
        life: 0.7,
        maxLife: 0.7,
        isHostile: false,
        isPlayerBullet: true,
        color: '#fbbf24',
        hitEntityIds: [],
      });
      soundManager.playPistolShot();
    } else if (v.weaponType === 'boat_cannon') {
      // Heavy 75mm naval river cannon
      v.weaponCooldown = 1.0;
      const muzzleX = v.x + Math.cos(aimAngle) * 36;
      const muzzleY = v.y + Math.sin(aimAngle) * 36;
      projectiles.push({
        id: `boat_shell_${Math.random()}`,
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(aimAngle) * 680,
        vy: Math.sin(aimAngle) * 680,
        radius: 7,
        damage: 190,
        life: 1.1,
        maxLife: 1.1,
        isHostile: false,
        isPlayerBullet: true,
        color: '#0284c7',
        isRocket: true,
        splashRadius: 75,
        knockback: 50,
        hitEntityIds: [],
      });
      soundManager.playRocketLaunch();
    } else if (v.weaponType === 'ram_bumper') {
      // Frontal kinetic ram pulse
      v.weaponCooldown = 0.35;
      const ramX = v.x + Math.cos(aimAngle) * 35;
      const ramY = v.y + Math.sin(aimAngle) * 35;
      projectiles.push({
        id: `ram_wave_${Math.random()}`,
        x: ramX,
        y: ramY,
        vx: Math.cos(aimAngle) * 450,
        vy: Math.sin(aimAngle) * 450,
        radius: 20,
        damage: 85,
        life: 0.2,
        maxLife: 0.2,
        isHostile: false,
        isPlayerBullet: true,
        color: '#ef4444',
        knockback: 80,
        hitEntityIds: [],
      });
      soundManager.playSawblade();
    }
  }

  public update(dt: number, player: Player, enemies: Enemy[]) {
    for (const v of this.vehicles) {
      if (v.weaponCooldown > 0) v.weaponCooldown -= dt;

      // Shield regeneration
      if (v.shield < v.maxShield) {
        v.shield = Math.min(v.maxShield, v.shield + dt * 10);
      }

      // If player is driving this vehicle, handle collision ramming against enemies
      if (player.mountedVehicle && player.mountedVehicle.id === v.id) {
        v.x = player.x;
        v.y = player.y;
        v.angle = player.facingAngle;

        // Ramming enemies at high speed
        const currentSpeed = player.speed;
        if (currentSpeed > 150) {
          for (const e of enemies) {
            if (e.isDead) continue;
            const dist = Math.hypot(e.x - v.x, e.y - v.y);
            if (dist < 34 + e.radius) {
              const crushDmg = Math.round((currentSpeed / 10) + v.armor * 2);
              e.hp -= crushDmg;
              e.hurtTimer = 0.2;
              e.state = 'HURT';
              // Knockback enemy away
              const kAngle = Math.atan2(e.y - v.y, e.x - v.x);
              e.x += Math.cos(kAngle) * 30;
              e.y += Math.sin(kAngle) * 30;
              soundManager.playEnemyHit(true);
            }
          }
        }
      }
    }
  }
}
