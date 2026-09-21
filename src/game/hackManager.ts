import { Player, Enemy, FactoryBuilding } from '../types';
import { soundManager } from '../audio/soundManager';

export class HackManager {
  public executeHack(
    player: Player,
    enemies: Enemy[],
    buildings: FactoryBuilding[],
    onNotify: (msg: string, color: string) => void
  ): boolean {
    const HACK_COST = 25;
    const cyberEnergy = player.cyberEnergy ?? 100;
    if (cyberEnergy < HACK_COST) {
      onNotify('Insufficient Cyber Energy! Need 25⚡', '#ef4444');
      soundManager.playEmptyGun();
      return false;
    }

    // 1. Check for nearby robotic/electronic enemy
    const HACK_RANGE = 200;
    let targetEnemy: Enemy | null = null;
    let minDist = HACK_RANGE;

    for (const e of enemies) {
      if (e.isDead || e.isHacked) continue;
      const isRobotic = [
        'combat_drone',
        'emp_spider',
        'behemoth',
        'mortar_walker',
        'stalker',
      ].includes(e.type);
      if (!isRobotic) continue;

      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d < minDist) {
        minDist = d;
        targetEnemy = e;
      }
    }

    if (targetEnemy) {
      player.cyberEnergy = cyberEnergy - HACK_COST;
      targetEnemy.isHacked = true;
      targetEnemy.hackedTimer = 40; // 40 seconds friendly combat
      targetEnemy.state = 'CHASE';
      soundManager.playHackSuccess();
      onNotify(`ACCESS GRANTED: Hacked ${targetEnemy.name}! They fight for you!`, '#22c55e');
      return true;
    }

    // 2. Check for nearby factory building to Overclock
    let targetBuilding: FactoryBuilding | null = null;
    let minBuildDist = 180;
    for (const b of buildings) {
      const d = Math.hypot(b.x - player.x, b.y - player.y);
      if (d < minBuildDist) {
        minBuildDist = d;
        targetBuilding = b;
      }
    }

    if (targetBuilding) {
      player.cyberEnergy = cyberEnergy - HACK_COST;
      targetBuilding.overclockTimer = 45; // 45 seconds at 2.5x speed
      soundManager.playHackSuccess();
      onNotify(`SYSTEM OVERCLOCKED: ${targetBuilding.name} running at 250% speed!`, '#38bdf8');
      return true;
    }

    // 3. Fallback: Discharge radial EMP shockwave
    player.cyberEnergy = cyberEnergy - HACK_COST;
    let stunnedCount = 0;
    for (const e of enemies) {
      if (e.isDead) continue;
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d < 240) {
        e.state = 'HURT';
        e.hurtTimer = 3.5; // 3.5s EMP stun
        stunnedCount++;
      }
    }

    soundManager.playTeslaShock();
    onNotify(`EMP DISCHARGE: Stunned ${stunnedCount} hostile targets!`, '#a855f7');
    return true;
  }

  public update(dt: number, player: Player, enemies: Enemy[]) {
    // Regenerate player cyber energy
    if (player.cyberEnergy === undefined) player.cyberEnergy = 100;
    if (player.maxCyberEnergy === undefined) player.maxCyberEnergy = 100;

    if (player.cyberEnergy < player.maxCyberEnergy) {
      player.cyberEnergy = Math.min(player.maxCyberEnergy, player.cyberEnergy + dt * 4);
    }

    // Update hacked enemies AI (attack other enemies)
    for (const e of enemies) {
      if (e.isDead || !e.isHacked) continue;

      if (e.hackedTimer !== undefined) {
        e.hackedTimer -= dt;
        if (e.hackedTimer <= 0) {
          e.isHacked = false;
        }
      }

      // Find nearest hostile non-hacked enemy
      let closestHostile: Enemy | null = null;
      let minD = 400;
      for (const other of enemies) {
        if (other.isDead || other.isHacked || other.id === e.id) continue;
        const dist = Math.hypot(other.x - e.x, other.y - e.y);
        if (dist < minD) {
          minD = dist;
          closestHostile = other;
        }
      }

      if (closestHostile) {
        // Move towards target and attack
        const angle = Math.atan2(closestHostile.y - e.y, closestHostile.x - e.x);
        e.x += Math.cos(angle) * e.speed * dt * 0.9;
        e.y += Math.sin(angle) * e.speed * dt * 0.9;

        if (minD < 36 && (e.attackCooldown || 0) <= 0) {
          e.attackCooldown = 0.8;
          closestHostile.hp -= e.attack;
          closestHostile.hurtTimer = 0.15;
          closestHostile.state = 'HURT';
          soundManager.playEnemyHit(false);
        }
      }
    }
  }
}
