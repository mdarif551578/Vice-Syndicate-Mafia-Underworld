/**
 * Ashen Road - Procedural Particle Engine & Floating Damage Numbers
 */
import { Particle, DamageNumber } from '../types';

export class ParticleSystem {
  public particles: Particle[] = [];
  public damageNumbers: DamageNumber[] = [];
  private nextDamageId = 1;

  public update(dt: number) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating damage numbers
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      dn.y -= 35 * dt; // Float upwards
      dn.life -= dt;
      if (dn.life <= 0) {
        this.damageNumbers.splice(i, 1);
      }
    }
  }

  // Hit effect: 5–8 spark particles
  public spawnHit(x: number, y: number, color = '#f59e0b') {
    const count = 6 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.45,
        size: 2 + Math.random() * 3,
        color,
        shape: 'spark',
      });
    }
  }

  // Enemy death effect: 10 particles
  public spawnDeath(x: number, y: number, color = '#dc2626') {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        size: 3 + Math.random() * 3,
        color,
        shape: 'circle',
      });
    }
  }

  // Level up effect: 20 upward-moving particles
  public spawnLevelUp(x: number, y: number) {
    for (let i = 0; i < 24; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const speed = 80 + Math.random() * 120;
      const colors = ['#38bdf8', '#fbbf24', '#f43f5e', '#a855f7', '#34d399'];
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        size: 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: 'circle',
      });
    }
  }

  // Boss attack burst effect
  public spawnBossBurst(x: number, y: number, radius: number) {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = radius * 1.8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5,
        maxLife: 0.5,
        size: 4 + Math.random() * 3,
        color: '#ef4444',
        shape: 'spark',
      });
    }
  }

  // Tactical Dash trail ghost particles
  public spawnDashTrail(x: number, y: number, angle: number) {
    for (let i = 0; i < 6; i++) {
      const offset = (Math.random() - 0.5) * 16;
      this.particles.push({
        x: x - Math.cos(angle) * (i * 4) + offset,
        y: y - Math.sin(angle) * (i * 4) + offset,
        vx: -Math.cos(angle) * 30 + (Math.random() - 0.5) * 20,
        vy: -Math.sin(angle) * 30 + (Math.random() - 0.5) * 20,
        life: 0.22,
        maxLife: 0.22,
        size: 5 + Math.random() * 4,
        color: '#38bdf8',
        shape: 'circle',
      });
    }
  }

  // Muzzle flash particle sparks and smoke
  public spawnMuzzleSparks(x: number, y: number, aimAngle: number, color = '#fef08a') {
    for (let i = 0; i < 4; i++) {
      const spread = aimAngle + (Math.random() - 0.5) * 0.6;
      const speed = 120 + Math.random() * 150;
      this.particles.push({
        x,
        y,
        vx: Math.cos(spread) * speed,
        vy: Math.sin(spread) * speed,
        life: 0.08 + Math.random() * 0.06,
        maxLife: 0.14,
        size: 2.5 + Math.random() * 2,
        color,
        shape: 'spark',
      });
    }
  }

  // Rocket explosion burst with smoke and fire
  public spawnExplosion(x: number, y: number, radius = 80) {
    // Fiery blast
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const speed = (radius * 1.5) * (0.5 + Math.random() * 0.7);
      const isSmoke = Math.random() < 0.35;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: isSmoke ? 0.65 : 0.4,
        maxLife: isSmoke ? 0.65 : 0.4,
        size: isSmoke ? 6 + Math.random() * 6 : 4 + Math.random() * 4,
        color: isSmoke ? '#78716c' : Math.random() < 0.5 ? '#f97316' : '#ef4444',
        shape: 'circle',
      });
    }
  }

  // Floating damage number
  public addDamageNumber(text: string, x: number, y: number, isCrit = false, color = '#ffffff') {
    this.damageNumbers.push({
      id: `dmg_${this.nextDamageId++}`,
      text,
      x: x + (Math.random() - 0.5) * 16,
      y: y - 10,
      life: 0.8,
      maxLife: 0.8,
      isCrit,
      color: isCrit ? '#f59e0b' : color,
    });
  }

  // Draw all particles and damage numbers onto canvas
  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    // Render particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const sx = p.x - camX;
      const sy = p.y - camY;
      const alpha = Math.max(0, p.life / p.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Render floating damage numbers
    for (let i = 0; i < this.damageNumbers.length; i++) {
      const dn = this.damageNumbers[i];
      const sx = dn.x - camX;
      const sy = dn.y - camY;
      const alpha = Math.max(0, Math.min(1, dn.life / (dn.maxLife * 0.4)));

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = dn.isCrit ? 'bold 16px monospace' : 'bold 13px monospace';
      ctx.textAlign = 'center';
      
      // Text outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(dn.text, sx, sy);

      // Text fill
      ctx.fillStyle = dn.color;
      ctx.fillText(dn.text, sx, sy);
      ctx.restore();
    }
  }
}
