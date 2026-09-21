/**
 * Ashen Road - Procedural 2D Canvas Renderer
 * 100% Code-drawn primitive shapes: circles, rectangles, polygons, arcs
 */
import { Player, Enemy, NPC, Chest, Projectile, DangerZone, FactoryBuilding, Vehicle, ResourceNode, DestructibleProp } from '../types';
import { WorldData } from './worldGen';
import { ParticleSystem } from './particles';
import { WORLD_WIDTH, WORLD_HEIGHT, ATTACK_RANGE, ATTACK_ARC_DEG } from './constants';
import { InfiniteChunk } from './infiniteWorld';

export class GameRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    player: Player,
    enemies: Enemy[],
    npcs: NPC[],
    world: WorldData,
    projectiles: Projectile[],
    dangerZones: DangerZone[],
    particles: ParticleSystem,
    camera: { x: number; y: number },
    dayTime: number,
    nearestInteractable: { text: string; x: number; y: number } | null,
    bossEntity: Enemy | null,
    infiniteChunks?: InfiniteChunk[],
    buildings?: FactoryBuilding[],
    vehicles?: Vehicle[],
    resourceNodes?: ResourceNode[]
  ) {
    ctx.clearRect(0, 0, width, height);

    const camX = camera.x;
    const camY = camera.y;
    const viewL = camX - 100;
    const viewR = camX + width + 100;
    const viewT = camY - 100;
    const viewB = camY + height + 100;

    // 1. Terrain Regions & Background
    ctx.fillStyle = '#272a2b'; // Dark infinite ground bedrock
    ctx.fillRect(0, 0, width, height);

    // Render Procedural Infinite World Sectors
    if (infiniteChunks && infiniteChunks.length > 0) {
      infiniteChunks.forEach(chunk => {
        const reg = chunk.region;
        if (reg.x + reg.w >= viewL && reg.x <= viewR && reg.y + reg.h >= viewT && reg.y <= viewB) {
          const sx = reg.x - camX;
          const sy = reg.y - camY;

          // Biome fill
          ctx.fillStyle = reg.bgCol;
          ctx.fillRect(sx, sy, reg.w, reg.h);

          // Sector Grid line & subtle coordinate label
          ctx.strokeStyle = reg.tintCol;
          ctx.lineWidth = 1;
          ctx.strokeRect(sx, sy, reg.w, reg.h);

          ctx.font = '10px monospace';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.fillText(`SEC [${chunk.cx}, ${chunk.cy}] ${chunk.biome.toUpperCase()}`, sx + 12, sy + 20);
        }
      });
    }

    world.regions.forEach(reg => {
      const sx = reg.x - camX;
      const sy = reg.y - camY;
      // Viewport culling
      if (reg.x + reg.w >= viewL && reg.x <= viewR && reg.y + reg.h >= viewT && reg.y <= viewB) {
        ctx.fillStyle = reg.bgCol;
        ctx.fillRect(sx, sy, reg.w, reg.h);

        // Subtle region boundary border
        ctx.strokeStyle = reg.tintCol;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, reg.w, reg.h);
      }
    });

    // City Asphalt Streets, Sidewalks & River Channel
    this.drawCityStreetsAndRiver(ctx, camX, camY);

    // 2. Ground Decorations (Grass tufts, flowers, pebbles)
    world.grassTufts.forEach(g => {
      if (g.x >= viewL && g.x <= viewR && g.y >= viewT && g.y <= viewB) {
        const sx = g.x - camX;
        const sy = g.y - camY;
        ctx.strokeStyle = g.color;
        ctx.lineWidth = 1.5;
        g.lines.forEach(l => {
          ctx.beginPath();
          ctx.moveTo(sx + l.dx, sy + l.dy);
          ctx.lineTo(
            sx + l.dx + Math.sin(l.angle) * l.len,
            sy + l.dy - Math.cos(l.angle) * l.len
          );
          ctx.stroke();
        });
      }
    });

    // 3. Danger Zones (Boss telegraphs)
    dangerZones.forEach(dz => {
      const sx = dz.x - camX;
      const sy = dz.y - camY;
      const progress = 1 - dz.timer / dz.maxTimer;

      // Outer warning ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(sx, sy, dz.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();

      // Expanding danger fill
      ctx.beginPath();
      ctx.arc(sx, sy, dz.radius * progress, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220, 38, 38, 0.45)';
      ctx.fill();
      ctx.restore();
    });

    // 4. World Objects (Buildings, Ruins, Carts, Fountain, Trees, Inscription)
    // Sort entities & objects by Y for proper 2.5D depth ordering
    const renderQueue: { y: number; draw: () => void }[] = [];

    // Fountain
    renderQueue.push({
      y: world.fountain.y,
      draw: () => this.drawFountain(ctx, world.fountain.x - camX, world.fountain.y - camY, world.fountain.radius),
    });

    // Buildings and structures
    world.objects.forEach(obj => {
      if (obj.x + (obj.w || 40) >= viewL && obj.x <= viewR && obj.y + (obj.h || 40) >= viewT && obj.y <= viewB) {
        const sx = obj.x - camX;
        const sy = obj.y - camY;

        if (obj.type === 'house') {
          renderQueue.push({
            y: obj.y + (obj.h || 60),
            draw: () => this.drawHouse(ctx, sx, sy, obj.w || 80, obj.h || 60, obj.color || '#cbd5e1', obj.roofColor || '#b45309', obj.id),
          });
        } else if (obj.type === 'tree') {
          renderQueue.push({
            y: obj.y + 10,
            draw: () => this.drawTree(ctx, sx, sy, obj.radius || 20, obj.color),
          });
        } else if (obj.type === 'cart') {
          renderQueue.push({
            y: obj.y + (obj.h || 26),
            draw: () => this.drawCart(ctx, sx, sy, obj.w || 40, obj.h || 26),
          });
        } else if (obj.type === 'ruin') {
          renderQueue.push({
            y: obj.y + (obj.h || 30),
            draw: () => this.drawRuin(ctx, sx, sy, obj.w || 40, obj.h || 30, obj.color || '#64748b'),
          });
        } else if (obj.type === 'gate') {
          renderQueue.push({
            y: obj.y + (obj.h || 20),
            draw: () => this.drawGate(ctx, sx, sy, obj.w || 120, obj.h || 20, obj.color || '#b91c1c'),
          });
        } else if (obj.type === 'inscription') {
          renderQueue.push({
            y: obj.y + 10,
            draw: () => this.drawInscriptionStone(ctx, sx, sy),
          });
        }
      }
    });

    // Chests
    world.chests.forEach(c => {
      if (c.x >= viewL && c.x <= viewR && c.y >= viewT && c.y <= viewB) {
        renderQueue.push({
          y: c.y + 12,
          draw: () => this.drawChest(ctx, c.x - camX, c.y - camY, c.opened),
        });
      }
    });

    // NPCs
    npcs.forEach(npc => {
      if (npc.x >= viewL && npc.x <= viewR && npc.y >= viewT && npc.y <= viewB) {
        renderQueue.push({
          y: npc.y + 16,
          draw: () => this.drawNPC(ctx, npc.x - camX, npc.y - camY, npc),
        });
      }
    });

    // Enemies
    enemies.forEach(e => {
      if (!e.isDead && e.x >= viewL && e.x <= viewR && e.y >= viewT && e.y <= viewB) {
        renderQueue.push({
          y: e.y + e.radius,
          draw: () => this.drawEnemy(ctx, e.x - camX, e.y - camY, e, player.autoAimTargetId === e.id),
        });
      }
    });

    // Infinite Chunk Objects, Supply Crates, and Enemies
    if (infiniteChunks && infiniteChunks.length > 0) {
      infiniteChunks.forEach(chunk => {
        chunk.objects.forEach(obj => {
          if (obj.x + (obj.w || 40) >= viewL && obj.x <= viewR && obj.y + (obj.h || 40) >= viewT && obj.y <= viewB) {
            const sx = obj.x - camX;
            const sy = obj.y - camY;
            if (obj.type === 'tree') {
              renderQueue.push({
                y: obj.y + 10,
                draw: () => this.drawTree(ctx, sx, sy, obj.radius || 20, obj.color),
              });
            } else if (obj.type === 'ruin') {
              renderQueue.push({
                y: obj.y + (obj.h || 30),
                draw: () => this.drawRuin(ctx, sx, sy, obj.w || 40, obj.h || 30, obj.color || '#64748b'),
              });
            }
          }
        });

        chunk.chests.forEach(c => {
          if (c.x >= viewL && c.x <= viewR && c.y >= viewT && c.y <= viewB) {
            renderQueue.push({
              y: c.y + 12,
              draw: () => this.drawChest(ctx, c.x - camX, c.y - camY, c.opened),
            });
          }
        });

        chunk.enemies.forEach(e => {
          if (!e.isDead && e.x >= viewL && e.x <= viewR && e.y >= viewT && e.y <= viewB) {
            renderQueue.push({
              y: e.y + e.radius,
              draw: () => this.drawEnemy(ctx, e.x - camX, e.y - camY, e, player.autoAimTargetId === e.id),
            });
          }
        });
      });
    }

    // Resource Nodes
    if (resourceNodes) {
      resourceNodes.forEach(node => {
        if (node.x >= viewL && node.x <= viewR && node.y >= viewT && node.y <= viewB) {
          renderQueue.push({
            y: node.y + 8,
            draw: () => this.drawResourceNode(ctx, node.x - camX, node.y - camY, node),
          });
        }
      });
    }

    // Factory & Defense Buildings
    if (buildings) {
      buildings.forEach(b => {
        if (b.x >= viewL && b.x <= viewR && b.y >= viewT && b.y <= viewB) {
          renderQueue.push({
            y: b.y + 24,
            draw: () => this.drawBuilding(ctx, b.x - camX, b.y - camY, b),
          });
        }
      });
    }

    // Destructible Props (Fire hydrants, fuel barrels, street lamps, shipping crates, parking meters)
    if (world.props) {
      world.props.forEach(prop => {
        if (prop.x + 30 >= viewL && prop.x - 30 <= viewR && prop.y + 30 >= viewT && prop.y - 30 <= viewB) {
          renderQueue.push({
            y: prop.y + prop.radius,
            draw: () => this.drawProp(ctx, prop.x - camX, prop.y - camY, prop),
          });
        }
      });
    }

    // Vehicles
    if (vehicles) {
      vehicles.forEach(v => {
        if (v.x >= viewL && v.x <= viewR && v.y >= viewT && v.y <= viewB) {
          renderQueue.push({
            y: v.y + 18,
            draw: () => this.drawVehicle(ctx, v.x - camX, v.y - camY, v, player),
          });
        }
      });
    }

    // Player (only drawn if not completely enclosed inside vehicle or mounted)
    renderQueue.push({
      y: player.y + 16,
      draw: () => this.drawPlayer(ctx, player.x - camX, player.y - camY, player),
    });

    // Execute sorted rendering queue
    renderQueue.sort((a, b) => a.y - b.y);
    renderQueue.forEach(item => item.draw());

    // 5. Projectiles (Rockets, Lasers, Tracer Bullets)
    projectiles.forEach(p => {
      const sx = p.x - camX;
      const sy = p.y - camY;
      ctx.save();

      if (p.isRocket) {
        // Draw Rocket Body + Tail Flame
        const angle = Math.atan2(p.vy, p.vx);
        ctx.translate(sx, sy);
        ctx.rotate(angle);

        // Rocket body
        ctx.fillStyle = '#475569';
        ctx.fillRect(-10, -3, 16, 6);
        // Nosecone
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(6, -3);
        ctx.lineTo(12, 0);
        ctx.lineTo(6, 3);
        ctx.closePath();
        ctx.fill();
        // Tail fins
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-10, -5, 3, 10);
        // Exhaust flame
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(-10, -2);
        ctx.lineTo(-17, 0);
        ctx.lineTo(-10, 2);
        ctx.fill();
      } else if (p.isLaser) {
        // Laser Energy Beam
        const angle = Math.atan2(p.vy, p.vx);
        ctx.translate(sx, sy);
        ctx.rotate(angle);

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();
      } else {
        // High-velocity bullet tracer
        const angle = Math.atan2(p.vy, p.vx);
        ctx.translate(sx, sy);
        ctx.rotate(angle);

        ctx.strokeStyle = p.color || '#facc15';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = p.color || '#facc15';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(4, 0);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(3, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // 6. Player Sword Swing Arc
    if (player.isAttacking && player.attackAnimTimer > 0) {
      this.drawAttackArc(ctx, player.x - camX, player.y - camY, player.facingAngle, player.attackAnimTimer);
    }

    // 7. Particles and floating damage numbers
    particles.render(ctx, camX, camY);

    // 8. World Interaction Indicator ([E] Prompt)
    if (nearestInteractable) {
      const sx = nearestInteractable.x - camX;
      const sy = nearestInteractable.y - camY - 36;
      this.drawInteractionPrompt(ctx, sx, sy, nearestInteractable.text);
    }

    // 9. Day / Night Lighting Overlay
    this.drawDayNight(ctx, width, height, dayTime, player.x - camX, player.y - camY);

    // 10. Boss Health Bar (HUD top-center if player is near boss or boss is active)
    if (bossEntity && !bossEntity.isDead && (bossEntity.state === 'CHASE' || bossEntity.state === 'ATTACK' || Math.hypot(player.x - bossEntity.x, player.y - bossEntity.y) < 650)) {
      this.drawBossHpBar(ctx, width, bossEntity);
    }

    // 11. Tactical Crosshair & Hitmarker
    this.drawCrosshairAndHitmarker(ctx, width, height, player, camX, camY);

    // 12. Shooter Arsenal HUD (Ammo, Gun Badge, Dash Cooldown, Infinite Compass)
    this.drawShooterHUD(ctx, width, height, player);
  }

  // Draw organized city avenues, sidewalks, river basin, and bridges
  private drawCityStreetsAndRiver(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    ctx.save();

    // 1. Grand River Basin Channel (y: 840 to 1100, x: 0 to 3000)
    const riverY = 840 - camY;
    const riverH = 260;
    const riverGrad = ctx.createLinearGradient(0, riverY, 0, riverY + riverH);
    riverGrad.addColorStop(0, '#0369a1');
    riverGrad.addColorStop(0.5, '#0284c7');
    riverGrad.addColorStop(1, '#075985');
    ctx.fillStyle = riverGrad;
    ctx.fillRect(-camX, riverY, 3000, riverH);

    // Animated water surface ripple waves
    const time = performance.now() * 0.0015;
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.35)';
    ctx.lineWidth = 1.5;
    for (let wy = 860; wy < 1090; wy += 36) {
      ctx.beginPath();
      for (let wx = 0; wx < 3000; wx += 60) {
        const py = wy + Math.sin(time * 2 + wx * 0.03) * 4 - camY;
        if (wx === 0) ctx.moveTo(wx - camX, py);
        else ctx.lineTo(wx - camX, py);
      }
      ctx.stroke();
    }

    // Granite Embankment Quays (North and South banks)
    ctx.fillStyle = '#334155';
    ctx.fillRect(-camX, 836 - camY, 3000, 6);
    ctx.fillRect(-camX, 1098 - camY, 3000, 6);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-camX, 834 - camY, 3000, 2);
    ctx.fillRect(-camX, 1104 - camY, 3000, 2);

    // 2. City Asphalt Avenues (Roadways & Sidewalks)
    const roads = [
      // Broadway Main Avenue (North-South, connects all districts)
      { x: 1440, y: 0, w: 110, h: 2000, isVertical: true },
      // Falcone Boulevard (East-West through Little Italy)
      { x: 0, y: 1480, w: 3000, h: 90, isVertical: false },
      // Financial 5th Avenue (East-West through Downtown)
      { x: 0, y: 350, w: 3000, h: 90, isVertical: false },
      // Waterfront Harbor Avenue (North-South West)
      { x: 740, y: 0, w: 110, h: 2000, isVertical: true },
      // Neon Casino Strip (North-South East)
      { x: 2180, y: 0, w: 110, h: 2000, isVertical: true },
    ];

    roads.forEach(r => {
      const rx = r.x - camX;
      const ry = r.y - camY;

      // Concrete Sidewalks along road borders
      ctx.fillStyle = '#475569';
      if (r.isVertical) {
        ctx.fillRect(rx - 16, ry, 16, r.h);
        ctx.fillRect(rx + r.w, ry, 16, r.h);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(rx - 2, ry, 2, r.h);
        ctx.fillRect(rx + r.w, ry, 2, r.h);
      } else {
        ctx.fillRect(rx, ry - 16, r.w, 16);
        ctx.fillRect(rx, ry + r.h, r.w, 16);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(rx, ry - 2, r.w, 2);
        ctx.fillRect(rx, ry + r.h, r.w, 2);
      }

      // Smooth Dark Asphalt Roadbed
      ctx.fillStyle = '#1e242c';
      ctx.fillRect(rx, ry, r.w, r.h);

      // Double Solid Yellow Centerlines
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      if (r.isVertical) {
        const cx = rx + r.w / 2;
        ctx.beginPath();
        ctx.moveTo(cx - 2, ry); ctx.lineTo(cx - 2, ry + r.h);
        ctx.moveTo(cx + 2, ry); ctx.lineTo(cx + 2, ry + r.h);
        ctx.stroke();

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([14, 14]);
        ctx.beginPath();
        ctx.moveTo(rx + r.w * 0.25, ry); ctx.lineTo(rx + r.w * 0.25, ry + r.h);
        ctx.moveTo(rx + r.w * 0.75, ry); ctx.lineTo(rx + r.w * 0.75, ry + r.h);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        const cy = ry + r.h / 2;
        ctx.beginPath();
        ctx.moveTo(rx, cy - 2); ctx.lineTo(rx + r.w, cy - 2);
        ctx.moveTo(rx, cy + 2); ctx.lineTo(rx + r.w, cy + 2);
        ctx.stroke();

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([14, 14]);
        ctx.beginPath();
        ctx.moveTo(rx, ry + r.h * 0.25); ctx.lineTo(rx + r.w, ry + r.h * 0.25);
        ctx.moveTo(rx, ry + r.h * 0.75); ctx.lineTo(rx + r.w, ry + r.h * 0.75);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 3. Pedestrian Zebra Crossings at Major Intersections
    const intersections = [
      { x: 1440, y: 1480 },
      { x: 1440, y: 350 },
      { x: 740, y: 1480 },
      { x: 740, y: 350 },
      { x: 2180, y: 1480 },
      { x: 2180, y: 350 },
    ];
    intersections.forEach(ix => {
      ctx.fillStyle = '#f8fafc';
      for (let s = 0; s < 100; s += 16) {
        ctx.fillRect(ix.x - camX + s, ix.y - camY - 24, 10, 18);
        ctx.fillRect(ix.x - camX + s, ix.y - camY + 96, 10, 18);
      }
    });

    // 4. Little Italy Central Paved Piazza
    const piazzaX = 1380 - camX;
    const piazzaY = 1420 - camY;
    ctx.fillStyle = '#2d333b';
    ctx.fillRect(piazzaX, piazzaY, 240, 160);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(piazzaX, piazzaY, 240, 160);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    for (let gx = piazzaX; gx <= piazzaX + 240; gx += 20) {
      ctx.beginPath(); ctx.moveTo(gx, piazzaY); ctx.lineTo(gx, piazzaY + 160); ctx.stroke();
    }
    for (let gy = piazzaY; gy <= piazzaY + 160; gy += 20) {
      ctx.beginPath(); ctx.moveTo(piazzaX, gy); ctx.lineTo(piazzaX + 240, gy); ctx.stroke();
    }

    // 5. River Bridges (West, Broadway, East)
    const bridges = [
      { x: 740, y: 830, w: 110, h: 280, name: 'West Commercial Bridge' },
      { x: 1435, y: 830, w: 110, h: 280, name: 'Broadway Suspension Bridge' },
      { x: 2180, y: 830, w: 110, h: 280, name: 'East Neon Bridge' },
    ];
    bridges.forEach(b => {
      const bx = b.x - camX;
      const by = b.y - camY;

      ctx.fillStyle = '#334155';
      ctx.fillRect(bx - 12, by, 12, b.h);
      ctx.fillRect(bx + b.w, by, 12, b.h);

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.strokeRect(bx - 12, by, b.w + 24, b.h);

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      for (let ty = by; ty < by + b.h - 20; ty += 28) {
        ctx.beginPath();
        ctx.moveTo(bx - 12, ty); ctx.lineTo(bx - 2, ty + 28);
        ctx.moveTo(bx - 2, ty); ctx.lineTo(bx - 12, ty + 28);
        ctx.moveTo(bx + b.w, ty); ctx.lineTo(bx + b.w + 10, ty + 28);
        ctx.moveTo(bx + b.w + 10, ty); ctx.lineTo(bx + b.w, ty + 28);
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  // Draw Destructible Props: Fire Hydrants, Explosive Barrels, Streetlamps, Crates, Parking Meters
  private drawProp(ctx: CanvasRenderingContext2D, sx: number, sy: number, prop: DestructibleProp) {
    ctx.save();
    ctx.translate(sx, sy);

    if (prop.type === 'fire_hydrant') {
      ctx.beginPath();
      ctx.ellipse(0, 8, 9, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-6, -8, 12, 16);
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-6, -8, 12, 16);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-9, -4, 3, 5);
      ctx.fillRect(6, -4, 3, 5);

      ctx.beginPath();
      ctx.arc(0, -9, 5, 0, Math.PI, true);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      if (prop.isDestroyed) {
        const time = performance.now() * 0.005;
        ctx.save();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        for (let i = 0; i < 6; i++) {
          const streamH = 25 + Math.sin(time * 3 + i) * 12;
          const spreadX = (i - 2.5) * 4;
          ctx.beginPath();
          ctx.arc(spreadX, -10 - streamH, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    } else if (prop.type === 'explosive_barrel') {
      ctx.beginPath();
      ctx.ellipse(0, 10, 11, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      ctx.fillStyle = prop.isDestroyed ? '#1c1917' : '#b91c1c';
      ctx.fillRect(-10, -12, 20, 24);
      ctx.strokeStyle = prop.isDestroyed ? '#000000' : '#7f1d1d';
      ctx.lineWidth = 2;
      ctx.strokeRect(-10, -12, 20, 24);

      if (!prop.isDestroyed) {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, -2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 7px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('TNT', 0, 8);
      } else {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.beginPath();
        ctx.arc(0, -16, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (prop.type === 'street_lamp') {
      if (!prop.isDestroyed) {
        const lightGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 55);
        lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
        lightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 55, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-3, -28, 6, 32);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.strokeRect(-3, -28, 6, 32);

      ctx.fillStyle = prop.isDestroyed ? '#475569' : '#fef08a';
      ctx.fillRect(-6, -34, 12, 8);
      ctx.strokeStyle = '#0f172a';
      ctx.strokeRect(-6, -34, 12, 8);
    } else if (prop.type === 'shipping_crate') {
      ctx.beginPath();
      ctx.ellipse(0, 10, 11, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();

      ctx.fillStyle = prop.isDestroyed ? '#451a03' : '#78350f';
      ctx.fillRect(-11, -11, 22, 22);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-11, -11, 22, 22);

      if (!prop.isDestroyed) {
        ctx.beginPath();
        ctx.moveTo(-11, -11); ctx.lineTo(11, 11);
        ctx.moveTo(11, -11); ctx.lineTo(-11, 11);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-2, -14, 4, 18);
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(0, -16, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Human Character: Full mafia boss, soldier, hitman, capo, troop, or citizen with suit, fedora, shoes, tie, weapons
  public drawHumanCharacter(
    ctx: CanvasRenderingContext2D,
    entity: any,
    sx: number,
    sy: number,
    isPlayer = false,
    isLockedOn = false
  ) {
    ctx.save();
    ctx.translate(sx, sy);

    const isTroop = !!entity.isTroop;
    const isCivilian = entity.type === 'civilian_pedestrian';
    const isBoss = !!entity.isBoss || entity.type === 'boss';

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, isBoss ? 20 : 14, isBoss ? 20 : 13, isBoss ? 8 : 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();

    // Tactical Dash Afterimage / Blur for player
    if (isPlayer && entity.isDashing) {
      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Flash white when hurt
    if (entity.hurtTimer > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, isBoss ? 24 : 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Determine Facing / Aim Angle
    let angle = 0;
    if (isPlayer) {
      angle = entity.aimAngle !== undefined ? entity.aimAngle : entity.facingAngle || 0;
    } else if (entity.vx !== 0 || entity.vy !== 0) {
      angle = Math.atan2(entity.vy, entity.vx);
    } else if (entity.wanderTarget) {
      angle = Math.atan2(entity.wanderTarget.y - entity.y, entity.wanderTarget.x - entity.x);
    }

    ctx.rotate(angle);

    // Visual configuration presets
    const vis = entity.humanVisual || {};
    const suitColor = vis.suitColor || (isPlayer ? '#18181b' : isBoss ? '#4c1d95' : isTroop ? '#1e293b' : '#334155');
    const shirtColor = vis.shirtColor || '#ffffff';
    const tieColor = vis.tieColor || (isPlayer ? '#dc2626' : isTroop ? '#dc2626' : '#f59e0b');
    const hatType = vis.hatType || (isCivilian ? 'none' : 'fedora');
    const hatColor = vis.hatColor || (isBoss ? '#581c87' : '#18181b');
    const skinTone = vis.skinTone || '#fed7aa';
    const weaponHeld = vis.weaponHeld || (isPlayer ? 'tommy_gun' : 'tommy_gun');

    // Walking Cycle (Legs & Polished Oxford Shoes)
    const isMoving = isPlayer ? (entity.vx !== 0 || entity.vy !== 0) : (entity.state === 'CHASE' || entity.state === 'WANDER');
    const walkPhase = isMoving ? Math.sin(performance.now() * 0.012) * 6 : 0;

    // Left & Right Legs
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5 + walkPhase, 6, 4, 8);
    ctx.fillRect(-5 - walkPhase, -14, 4, 8);

    // Polished Oxford Leather Shoes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(-3 + walkPhase, 14, 3, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(-3 - walkPhase, -14, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tailored Mafia Suit Jacket & Torso
    const scale = isBoss ? 1.3 : 1.0;
    ctx.save();
    ctx.scale(scale, scale);

    ctx.fillStyle = suitColor;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-8, -8, 16, 16);
    ctx.strokeRect(-8, -8, 16, 16);

    // Crisp White Dress Shirt in V-Neck
    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.moveTo(-3, -8);
    ctx.lineTo(3, -8);
    ctx.lineTo(0, -1);
    ctx.closePath();
    ctx.fill();

    // Silk Necktie
    ctx.strokeStyle = tieColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(0, 3);
    ctx.stroke();

    // Friendly Falcone Troop Crimson Armband
    if (isTroop) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-8, 3, 4, 6);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-7, 5, 2, 2);
    }

    // Hands & Equipped Weapon
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(6, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(9, 4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Weapon Models
    if (weaponHeld === 'tommy_gun' || isPlayer) {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(8, -1, 18, 3.5);
      ctx.fillStyle = '#71717a';
      ctx.fillRect(24, -2, 4, 5.5);
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.arc(14, 4, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(4, 1, 6, 4);
    } else if (weaponHeld === 'shotgun') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(5, 1, 6, 4);
      ctx.fillStyle = '#334155';
      ctx.fillRect(11, -2, 14, 5);
    } else if (weaponHeld === 'dual_pistols') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(8, -5, 10, 3);
      ctx.fillRect(8, 3, 10, 3);
    } else if (weaponHeld === 'katana') {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.quadraticCurveTo(20, -4, 30, -10);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(7, -3, 3, 6);
    } else if (weaponHeld === 'sniper') {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(6, -1, 26, 3);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(12, -4, 8, 2.5);
    }

    // Muzzle Flash Effect
    if (entity.muzzleFlashTimer && entity.muzzleFlashTimer > 0) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(28, 0, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Head with Face & Skin Tone
    ctx.beginPath();
    ctx.arc(0, -9, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = skinTone;
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Fedora Hat
    if (hatType === 'fedora') {
      ctx.beginPath();
      ctx.ellipse(0, -10, 11, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = hatColor;
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -10, 6, 0, Math.PI * 2);
      ctx.fillStyle = hatColor;
      ctx.fill();

      ctx.strokeStyle = isPlayer ? '#dc2626' : '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -10, 6, 0, Math.PI * 2);
      ctx.stroke();
    } else if (hatType === 'flatcap') {
      ctx.beginPath();
      ctx.ellipse(0, -11, 8, 6, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#475569';
      ctx.fill();
    } else if (hatType === 'sunglasses') {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(3, -11, 4, 2.5);
      ctx.fillRect(3, -8, 4, 2.5);
    }

    // Glowing Cigar Ember with smoke
    if (vis.hasCigar || isBoss) {
      ctx.fillStyle = '#f97316';
      ctx.fillRect(6, -7, 3, 2);
      ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
      ctx.beginPath();
      ctx.arc(10, -8, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Overhead Tags & Status Bars (Unrotated)
    ctx.rotate(-angle);

    // Auto-Aim Lock-On Reticle
    if (isLockedOn) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, isBoss ? 30 : 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Nameplate & Syndicate Tag for non-players
    if (!isPlayer && !isCivilian) {
      const tag = isBoss
        ? '★ DON MORETTI ★'
        : isTroop
        ? `[FALCONE TROOP] (${entity.troopCommand === 'attack' ? 'Assault' : 'Guarding'})`
        : entity.faction === 'bratva'
        ? '[BRATVA]'
        : entity.faction === 'yakuza'
        ? '[YAKUZA]'
        : '[MORETTI MOB]';

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = isTroop ? '#34d399' : isBoss ? '#f59e0b' : '#f87171';
      ctx.textAlign = 'center';
      ctx.fillText(tag, 0, isBoss ? -34 : -24);

      // Overhead HP Bar
      const hp = entity.hp !== undefined ? entity.hp : 100;
      const maxHp = entity.maxHp || 100;
      const barW = isBoss ? 40 : 24;
      const barH = 3.5;
      const barX = -barW / 2;
      const barY = isBoss ? -28 : -18;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = isTroop ? '#10b981' : isBoss ? '#e11d48' : '#ef4444';
      ctx.fillRect(barX, barY, (hp / maxHp) * barW, barH);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(barX, barY, barW, barH);
    } else if (isCivilian) {
      ctx.font = '8px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('[CIVILIAN]', 0, -18);
    }

    ctx.restore();
  }

  // Draw Player: Rendered as Falcone Syndicate Underboss
  private drawPlayer(ctx: CanvasRenderingContext2D, sx: number, sy: number, p: Player) {
    if (p.mountedVehicle) return;

    const playerConfig = {
      ...p,
      name: 'Player Don',
      humanVisual: {
        suitColor: '#09090b',
        shirtColor: '#ffffff',
        tieColor: '#dc2626',
        hatType: 'fedora',
        hatColor: '#09090b',
        skinTone: '#fed7aa',
        weaponHeld: p.unlockedGuns?.[p.selectedGunIndex]?.id || 'tommy_gun',
        hasCigar: true,
      },
    };

    this.drawHumanCharacter(ctx, playerConfig, sx, sy, true, false);

    // Reloading indicator
    if (p.isReloading) {
      ctx.save();
      const radius = 16;
      ctx.beginPath();
      ctx.arc(sx, sy - 28, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();

      const equippedGun = p.unlockedGuns && p.unlockedGuns[p.selectedGunIndex];
      const reloadTotal = equippedGun?.reloadTime || 1.5;
      const progress = reloadTotal > 0 ? (1 - Math.max(0, p.reloadTimer) / reloadTotal) : 0;
      ctx.beginPath();
      ctx.arc(sx, sy - 28, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('RELOAD', sx, sy - 34);
      ctx.restore();
    }
    return;

    // Legs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-6, 8, 4, 8);
    ctx.fillRect(2, 8, 4, 8);

    // Body / Tactical Vest
    const armorColor = p.equipment.armor?.id === 'iron_armor' ? '#94a3b8' : p.equipment.armor?.id === 'leather_armor' ? '#78350f' : '#334155';
    ctx.fillStyle = armorColor;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.fillRect(-8, -6, 16, 16);
    ctx.strokeRect(-8, -6, 16, 16);

    // Tactical Webbing / Vest straps
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, 3, 16, 3);
    ctx.fillRect(-3, -6, 6, 9);

    // Head
    ctx.beginPath();
    ctx.arc(0, -10, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8'; // Tactical visor / helmet
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Visor glow
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(2, -12, 5, 4);

    // Hands & Equipped Gun
    const equippedGun = p.unlockedGuns && p.unlockedGuns[p.selectedGunIndex];
    if (equippedGun) {
      // Gun Hands
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(6, -2, 3, 0, Math.PI * 2);
      ctx.arc(10, 4, 3, 0, Math.PI * 2);
      ctx.fill();

      // Gun Model
      const gunCol = equippedGun.color || '#94a3b8';

      // Laser Sight for Sniper / Plasma
      if (equippedGun.id === 'sniper' || equippedGun.id === 'plasma') {
        ctx.save();
        ctx.strokeStyle = equippedGun.id === 'sniper' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(28, 2);
        ctx.lineTo(380, 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw custom gun shapes
      if (equippedGun.id === 'rpg') {
        // Heavy Rocket Launcher Tube
        ctx.fillStyle = '#334155';
        ctx.fillRect(4, -3, 30, 8);
        ctx.strokeStyle = '#0f172a';
        ctx.strokeRect(4, -3, 30, 8);
        // Rocket warhead peeking out
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(34, -4);
        ctx.lineTo(42, 1);
        ctx.lineTo(34, 6);
        ctx.fill();
      } else if (equippedGun.id === 'plasma') {
        // Plasma Energy Blaster
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(8, -2, 22, 6);
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(14, -4, 8, 2);
        // Energy coils
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(18, -1, 10, 4);
      } else if (equippedGun.id === 'sniper') {
        // Long Barrel Sniper Rifle with Scope
        ctx.fillStyle = '#18181b';
        ctx.fillRect(6, -1, 32, 4);
        // Scope
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(12, -5, 12, 3);
        // Silencer / Muzzle Brake
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(36, -2, 4, 6);
      } else if (equippedGun.id === 'shotgun') {
        // Double Barrel Shotgun
        ctx.fillStyle = '#78350f'; // Wood stock
        ctx.fillRect(4, 0, 10, 5);
        ctx.fillStyle = '#475569'; // Heavy Steel Barrel
        ctx.fillRect(14, -1, 16, 6);
      } else if (equippedGun.id === 'ak47') {
        // Curved Magazine & Wooden stock
        ctx.fillStyle = '#92400e';
        ctx.fillRect(4, 0, 8, 4);
        ctx.fillStyle = '#18181b';
        ctx.fillRect(12, -1, 18, 4);
        // Banana magazine
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(14, 3);
        ctx.lineTo(16, 9);
        ctx.lineTo(18, 8);
        ctx.lineTo(16, 3);
        ctx.fill();
      } else {
        // Handgun / SMG
        ctx.fillStyle = gunCol;
        ctx.fillRect(8, -1, 14, 5);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(10, 3, 4, 5); // Grip
      }

      // Muzzle Flash
      if (p.muzzleFlashTimer > 0) {
        ctx.save();
        const flashX = equippedGun.id === 'sniper' ? 40 : equippedGun.id === 'rpg' ? 36 : 26;
        ctx.translate(flashX, 1);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(0, -6); ctx.lineTo(12, 0); ctx.lineTo(0, 6);
        ctx.fill();
        ctx.restore();
      }
    } else {
      // Fallback Sword in hand
      const swordDmg = p.equipment.weapon?.damage || 5;
      const swordCol = swordDmg > 15 ? '#e2e8f0' : swordDmg > 8 ? '#cbd5e1' : '#94a3b8';
      ctx.fillStyle = swordCol;
      ctx.fillRect(10, 2, 18, 4);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, 0, 3, 8);
    }

    ctx.restore();

    // Reloading Ring Indicator (above player)
    if (p.isReloading) {
      ctx.save();
      const radius = 16;
      ctx.beginPath();
      ctx.arc(sx, sy - 28, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();

      const reloadTotal = equippedGun?.reloadTime || 1.5;
      const progress = reloadTotal > 0 ? (1 - Math.max(0, p.reloadTimer) / reloadTotal) : 0;
      ctx.beginPath();
      ctx.arc(sx, sy - 28, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('RELOAD', sx, sy - 34);
      ctx.restore();
    }
  }

  // Draw Sword Swing Arc
  private drawAttackArc(ctx: CanvasRenderingContext2D, sx: number, sy: number, facingAngle: number, timer: number) {
    ctx.save();
    ctx.translate(sx, sy);

    const halfArc = (ATTACK_ARC_DEG * Math.PI) / 360;
    const startAngle = facingAngle - halfArc;
    const endAngle = facingAngle + halfArc;

    // Outer slash trail
    ctx.beginPath();
    ctx.arc(0, 0, ATTACK_RANGE, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.8)';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Inner glow
    ctx.beginPath();
    ctx.arc(0, 0, ATTACK_RANGE - 8, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  }

  // Draw Enemies: Rendered as authentic human mafia characters (goons, hitmen, capos, enforcers, and bosses)
  private drawEnemy(ctx: CanvasRenderingContext2D, sx: number, sy: number, e: Enemy, isLockedOn = false) {
    this.drawHumanCharacter(ctx, e, sx, sy, false, isLockedOn);
    return;
  }

  // Legacy fallback for primitive rendering (unused)
  private _unusedLegacyDrawEnemy(ctx: CanvasRenderingContext2D, sx: number, sy: number, e: Enemy, isLockedOn = false) {
    ctx.save();
    ctx.translate(sx, sy);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, e.radius, e.radius * 0.9, e.radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();

    // Flash white when hurt
    if (e.hurtTimer > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (e.type === 'wolf') {
      // Wolf: 4 legs, snout, pointed ears, tail
      const isCorrupted = e.name.includes('Ashen') || e.x < 1100;
      const bodyCol = isCorrupted ? '#334155' : '#78716c';
      const eyeCol = isCorrupted ? '#ef4444' : '#fbbf24';

      // Body
      ctx.fillStyle = bodyCol;
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-12, -7, 24, 14);
      ctx.strokeRect(-12, -7, 24, 14);

      // Head
      ctx.beginPath();
      ctx.arc(10, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pointed ears
      ctx.beginPath();
      ctx.moveTo(8, -8);
      ctx.lineTo(13, -15);
      ctx.lineTo(15, -7);
      ctx.fill();
      ctx.stroke();

      // Glowing Eyes
      ctx.fillStyle = eyeCol;
      ctx.fillRect(12, -3, 3, 3);

      // Snout
      ctx.fillStyle = '#000000';
      ctx.fillRect(17, -1, 3, 3);

      // Tail
      ctx.strokeStyle = bodyCol;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-20, -5);
      ctx.stroke();

    } else if (e.type === 'bandit') {
      // Bandit: humanoid, dark tunic, bandana mask, sword
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-7, -4, 14, 16); // Body
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-7, -4, 14, 16);

      // Mask/Head
      ctx.beginPath();
      ctx.arc(0, -9, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626'; // Red bandana
      ctx.fill();
      ctx.stroke();

      // Bandit sword
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(8, -2, 12, 3);

    } else if (e.type === 'skeleton') {
      // Skeleton: white skull with dark sockets, ribs
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;

      // Skull
      ctx.beginPath();
      ctx.arc(0, -9, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eye sockets
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4, -10, 2.5, 3);
      ctx.fillRect(2, -10, 2.5, 3);

      // Ribs
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -1); ctx.lineTo(0, 12);
      ctx.moveTo(-6, 2); ctx.lineTo(6, 2);
      ctx.moveTo(-5, 6); ctx.lineTo(5, 6);
      ctx.stroke();

      // Rusty blade
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, 0, 14, 3);

    } else if (e.type === 'cultist') {
      // Cultist: dark purple robe, hood, glowing hands
      ctx.fillStyle = '#4c1d95';
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 1.5;

      // Robe triangle
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(12, 14);
      ctx.lineTo(-12, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Hood
      ctx.beginPath();
      ctx.arc(0, -9, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#312e81';
      ctx.fill();
      ctx.stroke();

      // Glowing magical eyes
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(-3, -10, 2, 2);
      ctx.fillRect(2, -10, 2, 2);

    } else if (e.type === 'boss') {
      // Ashen Lord: Large armored figure, crown horns, glowing fiery core, massive dark blade
      // Fiery aura
      ctx.beginPath();
      ctx.arc(0, 0, e.radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fill();

      // Heavy armor body
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.fillRect(-18, -10, 36, 32);
      ctx.strokeRect(-18, -10, 36, 32);

      // Molten core chestplate
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 4, 8, 0, Math.PI * 2);
      ctx.fill();

      // Head / Horned Helm
      ctx.beginPath();
      ctx.arc(0, -18, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.stroke();

      // Horns
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, -24); ctx.lineTo(-18, -34);
      ctx.moveTo(10, -24); ctx.lineTo(18, -34);
      ctx.stroke();

      // Flaming Greatsword
      ctx.fillStyle = '#f97316';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.fillRect(18, -25, 8, 48);
      ctx.strokeRect(18, -25, 8, 48);
    } else if (e.type === 'emp_spider') {
      // EMP Spider: 6 metallic legs, electric blue thorax
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pulsing blue core
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 0, e.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Spider legs
      [-0.8, -0.4, 0, 0.4, 0.8].forEach(ang => {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 10, Math.sin(ang) * 10);
        ctx.lineTo(Math.cos(ang) * 22, Math.sin(ang) * 22);
        ctx.stroke();
      });
    } else if (e.type === 'combat_drone') {
      // Hovering Drone with twin weapon pods
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Blinking red sensor
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(4, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // Rotor pods
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-16, -10, 6, 4);
      ctx.fillRect(10, -10, 6, 4);
      ctx.fillRect(-16, 6, 6, 4);
      ctx.fillRect(10, 6, 6, 4);
    } else if (e.type === 'behemoth') {
      // Armored Cyber-Titan
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.fillRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);
      ctx.strokeRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);

      // Magma vent
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === 'mortar_walker') {
      // Tripod Chassis with Cannon Tube
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // Artillery barrel
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4, -22, 8, 20);
    } else if (e.type === 'stalker') {
      // Cloaked blade assassin
      ctx.fillStyle = 'rgba(71, 85, 105, 0.5)';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Generic / Swarmer / Broodmother
      ctx.fillStyle = e.color || '#e11d48';
      ctx.beginPath();
      ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hacked status visual overlay
    if (e.isHacked) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, e.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#22c55e';
      ctx.textAlign = 'center';
      ctx.fillText('ALLY', 0, -e.radius - 16);
    }

    // Health Bar above enemy
    if (e.hp < e.maxHp) {
      const barW = Math.max(28, e.radius * 2);
      const hpRatio = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-barW / 2, -e.radius - 12, barW, 4);
      ctx.fillStyle = e.isHacked ? '#22c55e' : e.isBoss ? '#ef4444' : '#22c55e';
      ctx.fillRect(-barW / 2, -e.radius - 12, barW * hpRatio, 4);
    }

    // Auto-Aim Proximity Target Reticle
    if (isLockedOn) {
      ctx.save();
      const lockRadius = Math.max(22, e.radius + 10);
      const t = Date.now() * 0.005;
      
      // Outer rotating segmented reticle
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, lockRadius, t, t + Math.PI * 2);
      ctx.stroke();

      // Inner cyan corner brackets
      ctx.setLineDash([]);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      const bLen = 6;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(-lockRadius, -lockRadius + bLen);
      ctx.lineTo(-lockRadius, -lockRadius);
      ctx.lineTo(-lockRadius + bLen, -lockRadius);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(lockRadius - bLen, -lockRadius);
      ctx.lineTo(lockRadius, -lockRadius);
      ctx.lineTo(lockRadius, -lockRadius + bLen);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(-lockRadius, lockRadius - bLen);
      ctx.lineTo(-lockRadius, lockRadius);
      ctx.lineTo(-lockRadius + bLen, lockRadius);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(lockRadius - bLen, lockRadius);
      ctx.lineTo(lockRadius, lockRadius);
      ctx.lineTo(lockRadius, lockRadius - bLen);
      ctx.stroke();

      // "TARGET LOCKED" badge
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText('TARGET LOCKED', 0, -lockRadius - 8);
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw Resource Nodes (Iron, Titanium, Plasma, Salvage)
  private drawResourceNode(ctx: CanvasRenderingContext2D, sx: number, sy: number, node: ResourceNode) {
    ctx.save();
    ctx.translate(sx, sy);

    let baseCol = '#94a3b8';
    let oreCol = '#e2e8f0';
    let icon = 'Fe';

    if (node.type === 'iron' || node.type === 'iron_vein') {
      baseCol = '#78716c';
      oreCol = '#fb923c';
      icon = 'Fe';
    } else if (node.type === 'titanium' || node.type === 'titanium_deposit') {
      baseCol = '#475569';
      oreCol = '#38bdf8';
      icon = 'Ti';
    } else if (node.type === 'plasma' || node.type === 'plasma_crystal') {
      baseCol = '#3b0764';
      oreCol = '#c084fc';
      icon = '⚡';
    } else if (node.type === 'salvage' || node.type === 'salvage_wreck') {
      baseCol = '#451a03';
      oreCol = '#facc15';
      icon = '⚙';
    }

    // Rocky Outcrop Base
    ctx.fillStyle = baseCol;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Crystal / Ore Clusters
    ctx.fillStyle = oreCol;
    [-6, 0, 6].forEach((ox, i) => {
      ctx.beginPath();
      ctx.moveTo(ox, -2);
      ctx.lineTo(ox + 4, -14 - (i % 2) * 4);
      ctx.lineTo(ox + 8, -2);
      ctx.closePath();
      ctx.fill();
    });

    // Resource Node Text
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const amountVal = node.amount ?? node.resourcesRemaining ?? 0;
    ctx.fillText(`${icon} (${amountVal})`, 0, 14);

    ctx.restore();
  }

  // Draw Factory & Defense Buildings
  private drawBuilding(ctx: CanvasRenderingContext2D, sx: number, sy: number, b: FactoryBuilding) {
    ctx.save();
    ctx.translate(sx, sy);

    // Foundation Base
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = b.color || '#38bdf8';
    ctx.lineWidth = 2;
    ctx.fillRect(-22, -22, 44, 44);
    ctx.strokeRect(-22, -22, 44, 44);

    if (b.type === 'command_hub') {
      // Hub Dish & Terminal
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(10, -12);
      ctx.stroke();
    } else if (b.type === 'solar_generator') {
      // Solar photovoltaic grid
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-16, -16, 32, 32);
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1;
      ctx.strokeRect(-16, -16, 32, 32);
      ctx.beginPath();
      ctx.moveTo(-16, 0); ctx.lineTo(16, 0);
      ctx.moveTo(0, -16); ctx.lineTo(0, 16);
      ctx.stroke();
    } else if (b.type === 'ore_extractor') {
      // Drill Piston
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-10, -14, 20, 28);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-8, 14); ctx.lineTo(0, 24); ctx.lineTo(8, 14);
      ctx.fill();
    } else if (b.type === 'defense_turret') {
      // Gatling Swivel Turret
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      // Twin Barrels
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-5, -20, 3, 14);
      ctx.fillRect(2, -20, 3, 14);
    } else if (b.type === 'laser_turret') {
      // Laser Focusing Emitter
      ctx.fillStyle = '#7e22ce';
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(0, -14, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // General structure
      ctx.fillStyle = b.color;
      ctx.fillRect(-12, -12, 24, 24);
    }

    // Overclocked Holographic Aura
    if (b.overclockTimer && b.overclockTimer > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Health & Level Badge
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${b.name} Lv${b.level}`, 0, -26);

    ctx.restore();
  }

  // Draw Vehicles (Hover-Buggy, Siege Tank, Mech, Harvester)
  private drawVehicle(ctx: CanvasRenderingContext2D, sx: number, sy: number, v: Vehicle, player: Player) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(v.angle);

    const isMounted = player.mountedVehicle?.id === v.id;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 16, 26, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    if (v.type === 'mafia_sedan') {
      // 1930s Gangster V8 Limo: Long vintage body, white-wall wheels, chrome grille, tinted windows
      // 4 Wheels
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(-22, -18, 10, 5);
      ctx.fillRect(12, -18, 10, 5);
      ctx.fillRect(-22, 13, 10, 5);
      ctx.fillRect(12, 13, 10, 5);
      // White-wall rims
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-20, -17, 6, 3);
      ctx.fillRect(14, -17, 6, 3);
      ctx.fillRect(-20, 14, 6, 3);
      ctx.fillRect(14, 14, 6, 3);

      // Running boards
      ctx.fillStyle = '#27272a';
      ctx.fillRect(-14, -16, 26, 3);
      ctx.fillRect(-14, 13, 26, 3);

      // Main Vintage Body (Long black lacquer)
      ctx.fillStyle = v.color || '#18181b';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-26, -13, 52, 26, 4);
      ctx.fill();
      ctx.stroke();

      // Curved Fenders
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-26, -14, 14, 28);
      ctx.fillRect(10, -14, 14, 28);

      // Passenger Cabin & Roof
      ctx.fillStyle = '#27272a';
      ctx.fillRect(-18, -10, 30, 20);

      // Tinted Windows
      ctx.fillStyle = '#38bdf8';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(-15, -8, 24, 16);
      ctx.globalAlpha = 1.0;

      // Chrome Front Grille & Headlights
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(25, -6, 3, 12);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(26, -8, 3, 0, Math.PI * 2);
      ctx.arc(26, 8, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (v.type === 'muscle_car') {
      // Stallion 427 V8 Muscle Car: Wide stance, dual racing stripes, blower intake
      // Wide Tires
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-20, -17, 11, 5);
      ctx.fillRect(11, -16, 9, 4);
      ctx.fillRect(-20, 12, 11, 5);
      ctx.fillRect(11, 12, 9, 4);

      // Low-slung Sports Body
      ctx.fillStyle = v.color || '#dc2626';
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-24, -13, 48, 26, 5);
      ctx.fill();
      ctx.stroke();

      // White Racing Stripes down center
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-24, -4, 48, 3);
      ctx.fillRect(-24, 1, 48, 3);

      // Fastback Cabin & Windshield
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-12, -9, 20, 18);
      ctx.fillStyle = 'rgba(125, 211, 252, 0.7)';
      ctx.fillRect(-9, -7, 14, 14);

      // Chrome Engine Blower on Hood
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(12, -4, 7, 8);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(17, -3, 3, 6);
    } else if (v.type === 'armored_van') {
      // Heavy Bank Enforcer Truck: Thick plating, slit windows, roof turret
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-24, -17, 12, 5);
      ctx.fillRect(12, -17, 12, 5);
      ctx.fillRect(-24, 12, 12, 5);
      ctx.fillRect(12, 12, 12, 5);

      // Heavy Box Body
      ctx.fillStyle = v.color || '#334155';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.fillRect(-26, -14, 52, 28);
      ctx.strokeRect(-26, -14, 52, 28);

      // Heavy Steel Bullbar
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(26, -11, 5, 22);

      // Slitted Reinforced Windshield
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(14, -8, 4, 16);

      // Roof Tommy Gun Turret
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.fillRect(4, -2, 12, 4);
    } else if (v.type === 'river_speedboat') {
      // Sleek River Speedboat: Hydrodynamic wedge hull, dual outboards, foam wake
      // Water foam spray wake behind boat
      const time = performance.now() * 0.006;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(-24, -8);
      ctx.lineTo(-38 + Math.sin(time) * 4, -14);
      ctx.lineTo(-38 + Math.cos(time) * 4, 14);
      ctx.lineTo(-24, 8);
      ctx.closePath();
      ctx.fill();

      // Sharp Tapered Point Hull
      ctx.fillStyle = v.color || '#0284c7';
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-24, -12);
      ctx.lineTo(16, -10);
      ctx.lineTo(28, 0); // Bow tip
      ctx.lineTo(16, 10);
      ctx.lineTo(-24, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Teak Wood Trim
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-18, -6, 24, 12);

      // Chrome Windscreen
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(4, 0, 7, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // Twin Outboard Motors
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-28, -8, 6, 5);
      ctx.fillRect(-28, 3, 6, 5);
    } else if (v.type === 'patrol_gunboat') {
      // Armored River Gunboat: Heavy steel hull, mounted 50-cal deck gun, cabin
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.moveTo(-26, -10);
      ctx.lineTo(-44, -16);
      ctx.lineTo(-44, 16);
      ctx.lineTo(-26, 10);
      ctx.closePath();
      ctx.fill();

      // Gunboat Camo Hull
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-26, -13);
      ctx.lineTo(18, -11);
      ctx.lineTo(30, 0);
      ctx.lineTo(18, 11);
      ctx.lineTo(-26, 13);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bridge Cabin
      ctx.fillStyle = '#334155';
      ctx.fillRect(-14, -8, 18, 16);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(1, -6, 3, 12);

      // Bow 50-Cal Turret
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(14, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(14, -2, 14, 4);
    } else if (v.type === 'scout_buggy') {
      // Hover Buggy: sleek chassis, 4 hover thruster pods, twin blasters
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;

      // Main fuselage
      ctx.beginPath();
      ctx.moveTo(-18, -12);
      ctx.lineTo(22, -6);
      ctx.lineTo(24, 0);
      ctx.lineTo(22, 6);
      ctx.lineTo(-18, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Twin energy blasters
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(18, -8, 12, 3);
      ctx.fillRect(18, 5, 12, 3);

      // Cockpit Canopy
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (v.type === 'siege_tank') {
      // 120mm Heavy Siege Tank: dual treads, heavy armor plating, huge cannon barrel
      ctx.fillStyle = '#1e293b';
      // Left and right tracks
      ctx.fillRect(-22, -18, 44, 8);
      ctx.fillRect(-22, 10, 44, 8);

      // Hull
      ctx.fillStyle = '#ea580c';
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 2;
      ctx.fillRect(-16, -11, 32, 22);
      ctx.strokeRect(-16, -11, 32, 22);

      // Cannon Turret & Long 120mm Barrel
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(6, -4, 26, 8);
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (v.type === 'mech_walker') {
      // Titan Combat Mech: Bipedal walking legs, wide shoulders, rotary guns
      ctx.fillStyle = '#581c87';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;

      // Torso
      ctx.fillRect(-14, -14, 28, 28);
      ctx.strokeRect(-14, -14, 28, 28);

      // Arm Cannons
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(8, -16, 16, 6);
      ctx.fillRect(8, 10, 16, 6);

      // Visor
      ctx.fillStyle = '#facc15';
      ctx.fillRect(8, -3, 6, 6);
    } else {
      // Classic Coupe / Harvester
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-18, -14, 36, 28);
      ctx.fillStyle = '#713f12';
      ctx.fillRect(16, -8, 14, 16);
    }

    // Shield Dome Aura
    if (v.shield > 10) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Vehicle Label & Driver state
    ctx.rotate(-v.angle);
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = isMounted ? '#38bdf8' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(isMounted ? `[PILOTING] ${v.name}` : v.name, 0, -24);

    ctx.restore();
  }

  // Draw NPCs: with distinctive robes/outfits and titles
  private drawNPC(ctx: CanvasRenderingContext2D, sx: number, sy: number, npc: NPC) {
    ctx.save();
    ctx.translate(sx, sy);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 14, 12, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    let robeColor = '#0284c7';
    let iconChar = 'E';

    if (npc.iconType === 'elder') {
      robeColor = '#065f46'; // Green elder robe
      iconChar = '✦';
    } else if (npc.iconType === 'blacksmith') {
      robeColor = '#7c2d12'; // Forge brown
      iconChar = '⚒';
    } else if (npc.iconType === 'innkeeper') {
      robeColor = '#0e7490'; // Inn blue
      iconChar = '🛏';
    } else if (npc.iconType === 'merchant') {
      robeColor = '#7e22ce'; // Merchant purple
      iconChar = '⚗';
    }

    // Body / Robe
    ctx.fillStyle = robeColor;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-8, -4, 16, 18);
    ctx.strokeRect(-8, -4, 16, 18);

    // Head
    ctx.beginPath();
    ctx.arc(0, -9, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#fed7aa'; // Skin
    ctx.fill();
    ctx.stroke();

    // Hair / Beard for Elder
    if (npc.iconType === 'elder') {
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(0, -4, 5, 0, Math.PI);
      ctx.fill();
    }

    // Name tag & Quest / Shop indicator above head
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(npc.name, 0, -22);

    // Quest indicator exclamation mark
    if (npc.questToOffer) {
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('!', 0, -34);
    } else if (npc.isShop || npc.isInn) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px monospace';
      ctx.fillText(iconChar, 0, -34);
    }

    ctx.restore();
  }

  // Draw House: body + triangular roof + door + window + shop sign
  private drawHouse(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    w: number,
    h: number,
    wallColor: string,
    roofColor: string,
    houseId: string
  ) {
    ctx.save();

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(sx + 6, sy + 6, w, h);

    // Wall body
    ctx.fillStyle = wallColor;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.fillRect(sx, sy, w, h);
    ctx.strokeRect(sx, sy, w, h);

    // Triangular Roof
    ctx.fillStyle = roofColor;
    ctx.beginPath();
    ctx.moveTo(sx - 8, sy);
    ctx.lineTo(sx + w / 2, sy - 34);
    ctx.lineTo(sx + w + 8, sy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Wooden Door
    const doorW = 16;
    const doorH = 26;
    const doorX = sx + w / 2 - doorW / 2;
    const doorY = sy + h - doorH;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(doorX, doorY, doorW, doorH);
    ctx.strokeStyle = '#451a03';
    ctx.strokeRect(doorX, doorY, doorW, doorH);

    // Door knob
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(doorX + doorW - 4, doorY + doorH / 2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Windows
    const winSize = 14;
    const drawWindow = (wx: number, wy: number) => {
      ctx.fillStyle = '#fef08a'; // Glowing warm light
      ctx.fillRect(wx, wy, winSize, winSize);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(wx, wy, winSize, winSize);
      // Window crossbars
      ctx.beginPath();
      ctx.moveTo(wx + winSize / 2, wy); ctx.lineTo(wx + winSize / 2, wy + winSize);
      ctx.moveTo(wx, wy + winSize / 2); ctx.lineTo(wx + winSize, wy + winSize / 2);
      ctx.stroke();
    };

    if (w >= 70) {
      drawWindow(sx + 10, sy + 14);
      drawWindow(sx + w - winSize - 10, sy + 14);
    }

    // Shop Hanging Sign
    if (houseId === 'blacksmith_forge') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(doorX - 16, doorY - 14, 14, 10);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '8px monospace';
      ctx.fillText('⚒', doorX - 13, doorY - 6);
    } else if (houseId === 'village_inn') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(doorX - 16, doorY - 14, 14, 10);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '8px monospace';
      ctx.fillText('🛏', doorX - 13, doorY - 6);
    } else if (houseId === 'merchant_shop') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(doorX - 16, doorY - 14, 14, 10);
      ctx.fillStyle = '#c084fc';
      ctx.font = '8px monospace';
      ctx.fillText('⚗', doorX - 13, doorY - 6);
    }

    ctx.restore();
  }

  // Draw Tree: Brown trunk + overlapping layered green circles
  private drawTree(ctx: CanvasRenderingContext2D, sx: number, sy: number, radius: number, customColor?: string) {
    ctx.save();

    // Shadow
    ctx.beginPath();
    ctx.ellipse(sx, sy + radius * 0.8, radius * 0.9, radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Trunk
    const trunkW = radius * 0.4;
    const trunkH = radius * 0.9;
    ctx.fillStyle = '#5c3a21';
    ctx.strokeStyle = '#3b2210';
    ctx.lineWidth = 1.5;
    ctx.fillRect(sx - trunkW / 2, sy - trunkH / 4, trunkW, trunkH);
    ctx.strokeRect(sx - trunkW / 2, sy - trunkH / 4, trunkW, trunkH);

    // Foliage (Circles or dead branches in ashen fields)
    if (customColor) {
      // Dead tree (bare branches)
      ctx.strokeStyle = customColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy - trunkH / 2); ctx.lineTo(sx - 16, sy - radius - 10);
      ctx.moveTo(sx, sy - trunkH / 2); ctx.lineTo(sx + 14, sy - radius - 8);
      ctx.moveTo(sx, sy - trunkH); ctx.lineTo(sx, sy - radius - 18);
      ctx.stroke();
    } else {
      // Normal lush foliage (3 overlapping circles)
      ctx.fillStyle = '#15803d'; // Darker base
      ctx.beginPath();
      ctx.arc(sx, sy - radius * 0.7, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e'; // Mid foliage
      ctx.beginPath();
      ctx.arc(sx - radius * 0.35, sy - radius * 0.6, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4ade80'; // Top highlight
      ctx.beginPath();
      ctx.arc(sx + radius * 0.25, sy - radius * 0.9, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Border outline
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy - radius * 0.7, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Central Fountain: Stone basin with animated sparkling water ripples
  private drawFountain(ctx: CanvasRenderingContext2D, sx: number, sy: number, radius: number) {
    ctx.save();

    // Outer stone rim
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Water pool
    ctx.beginPath();
    ctx.arc(sx, sy, radius - 5, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    // Inner water ripple
    const t = Date.now() * 0.003;
    ctx.beginPath();
    ctx.arc(sx, sy, (radius - 10) * (0.6 + 0.3 * Math.sin(t)), 0, Math.PI * 2);
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center stone spout
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#475569';
    ctx.fill();

    ctx.restore();
  }

  // Draw Ruined Cart
  private drawCart(ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number, h: number) {
    ctx.save();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(sx, sy, w, h);
    ctx.strokeStyle = '#451a03';
    ctx.strokeRect(sx, sy, w, h);

    // Wheels
    ctx.fillStyle = '#292524';
    ctx.fillRect(sx + 4, sy - 3, 6, 3);
    ctx.fillRect(sx + w - 10, sy - 3, 6, 3);
    ctx.fillRect(sx + 4, sy + h, 6, 3);
    ctx.fillRect(sx + w - 10, sy + h, 6, 3);
    ctx.restore();
  }

  // Draw Ruined Stone Wall
  private drawRuin(ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number, h: number, color: string) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(sx, sy, w, h);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx, sy, w, h);

    // Brick pattern
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    for (let x = sx; x < sx + w; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, sy);
      ctx.lineTo(x, sy + h);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw Locked Portcullis / Gate
  private drawGate(ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number, h: number, color: string) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(sx, sy, w, h);

    // Iron bars
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    for (let x = sx + 8; x < sx + w; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, sy);
      ctx.lineTo(x, sy + h);
      ctx.stroke();
    }

    // Heavy padlock icon
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(sx + w / 2 - 8, sy + h / 2 - 6, 16, 12);
    ctx.restore();
  }

  // Draw Ancient Inscription Stone
  private drawInscriptionStone(ctx: CanvasRenderingContext2D, sx: number, sy: number) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#475569';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Runes
    ctx.fillStyle = '#7dd3fc';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ᚱ', sx, sy + 3);
    ctx.restore();
  }

  // Draw Chest: closed or opened
  private drawChest(ctx: CanvasRenderingContext2D, sx: number, sy: number, opened: boolean) {
    ctx.save();
    const w = 22;
    const h = 16;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(sx - w / 2 + 2, sy - h / 2 + 2, w, h);

    if (opened) {
      // Opened chest
      ctx.fillStyle = '#92400e';
      ctx.fillRect(sx - w / 2, sy - h / 2 + 4, w, h - 4);
      // Open lid tilted back
      ctx.fillStyle = '#b45309';
      ctx.fillRect(sx - w / 2, sy - h / 2 - 4, w, 6);
      ctx.strokeStyle = '#451a03';
      ctx.strokeRect(sx - w / 2, sy - h / 2 - 4, w, 6);
    } else {
      // Closed chest with gold trim
      ctx.fillStyle = '#b45309';
      ctx.fillRect(sx - w / 2, sy - h / 2, w, h);
      ctx.strokeStyle = '#f59e0b'; // Gold trim
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx - w / 2, sy - h / 2, w, h);

      // Lock
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(sx - 2, sy - 1, 4, 5);
    }
    ctx.restore();
  }

  // World prompt indicator: e.g. "[E] Talk" or "[E] Open"
  private drawInteractionPrompt(ctx: CanvasRenderingContext2D, sx: number, sy: number, text: string) {
    ctx.save();
    ctx.font = 'bold 12px sans-serif';
    const textW = ctx.measureText(text).width;
    const pad = 6;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(sx - textW / 2 - pad, sy - 10, textW + pad * 2, 20);
    ctx.strokeRect(sx - textW / 2 - pad, sy - 10, textW + pad * 2, 20);

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, sx, sy);
    ctx.restore();
  }

  // Day/Night Cycle lighting overlay (10 real-world minutes cycle)
  private drawDayNight(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    dayTime: number,
    playerScreenX: number,
    playerScreenY: number
  ) {
    // 0..600 seconds:
    // 0..180: Day (light)
    // 180..300: Sunset / Evening (warm amber)
    // 300..480: Night (dark blue)
    // 480..600: Dawn / Morning
    let darkness = 0;
    let tint = 'rgba(15, 23, 42, 0)';

    const norm = (dayTime % 600) / 600; // 0..1
    if (norm < 0.3) {
      // Day
      darkness = 0;
    } else if (norm < 0.5) {
      // Evening
      const t = (norm - 0.3) / 0.2;
      darkness = t * 0.45;
      tint = `rgba(180, 83, 9, ${darkness * 0.4})`; // Amber glow
    } else if (norm < 0.8) {
      // Deep night
      darkness = 0.65;
      tint = `rgba(10, 15, 30, ${darkness})`;
    } else {
      // Dawn
      const t = (norm - 0.8) / 0.2;
      darkness = (1 - t) * 0.65;
      tint = `rgba(15, 23, 42, ${darkness})`;
    }

    if (darkness <= 0.05) return;

    ctx.save();
    // Radial light cutout around player
    const radGrad = ctx.createRadialGradient(
      playerScreenX, playerScreenY, 20,
      playerScreenX, playerScreenY, 190
    );
    radGrad.addColorStop(0, 'rgba(0,0,0,0)');
    radGrad.addColorStop(0.7, tint);
    radGrad.addColorStop(1, tint);

    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Boss HP Bar (Top center)
  private drawBossHpBar(ctx: CanvasRenderingContext2D, screenW: number, boss: Enemy) {
    ctx.save();
    const barW = Math.min(420, screenW - 60);
    const barH = 14;
    const sx = screenW / 2 - barW / 2;
    const sy = 35;

    // Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.fillRect(sx, sy, barW, barH);
    ctx.strokeRect(sx, sy, barW, barH);

    // HP Fill
    const ratio = Math.max(0, boss.hp / boss.maxHp);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(sx + 2, sy + 2, (barW - 4) * ratio, barH - 4);

    // Boss Name
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(`${boss.name} - ${boss.hp} / ${boss.maxHp}`, screenW / 2, sy - 8);
    ctx.restore();
  }

  // Tactical Crosshair & Dynamic Hitmarker
  private drawCrosshairAndHitmarker(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    p: Player,
    camX: number,
    camY: number
  ) {
    const pScreenX = p.x - camX;
    const pScreenY = p.y - camY;

    // Position crosshair ahead of player along aim vector
    const aimDist = 130;
    const aimAng = p.aimAngle !== undefined ? p.aimAngle : p.facingAngle;
    const cx = pScreenX + Math.cos(aimAng) * aimDist;
    const cy = pScreenY + Math.sin(aimAng) * aimDist;

    ctx.save();
    ctx.translate(cx, cy);

    const gun = p.unlockedGuns && p.unlockedGuns[p.selectedGunIndex];
    const spreadOffset = gun ? Math.max(6, Math.min(18, gun.spread * 40)) : 8;

    // Subtle center dot
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    // 4 Crosshair ticks
    ctx.strokeStyle = (p.autoAim && p.autoAimTargetId) ? '#38bdf8' : 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.8;
    // Top
    ctx.beginPath(); ctx.moveTo(0, -spreadOffset); ctx.lineTo(0, -spreadOffset - 7); ctx.stroke();
    // Bottom
    ctx.beginPath(); ctx.moveTo(0, spreadOffset); ctx.lineTo(0, spreadOffset + 7); ctx.stroke();
    // Left
    ctx.beginPath(); ctx.moveTo(-spreadOffset, 0); ctx.lineTo(-spreadOffset - 7, 0); ctx.stroke();
    // Right
    ctx.beginPath(); ctx.moveTo(spreadOffset, 0); ctx.lineTo(spreadOffset + 7, 0); ctx.stroke();

    // Auto-Aim Proximity Lock Ring
    if (p.autoAim && p.autoAimTargetId) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, spreadOffset + 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText('AIM LOCK', 0, spreadOffset + 22);
    }

    // Hitmarker ticks (Crimson X on target hit)
    if (p.hitmarkerTimer && p.hitmarkerTimer > 0) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6;
      const hitDist = 9;
      ctx.beginPath();
      ctx.moveTo(-hitDist, -hitDist); ctx.lineTo(-3, -3);
      ctx.moveTo(hitDist, -hitDist); ctx.lineTo(3, -3);
      ctx.moveTo(-hitDist, hitDist); ctx.lineTo(-3, 3);
      ctx.moveTo(hitDist, hitDist); ctx.lineTo(3, 3);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Modern Shooter Arsenal HUD (Ammo, Gun Badge, Weapon Selector, Dash Meter)
  private drawShooterHUD(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    p: Player
  ) {
    const gun = p.unlockedGuns && p.unlockedGuns[p.selectedGunIndex];
    if (!gun) return;

    ctx.save();

    // 1. Bottom-Right Weapon & Ammo Card
    const panelW = 220;
    const panelH = 76;
    const panelX = width - panelW - 20;
    const panelY = height - panelH - 20;

    // Auto-Aim & Auto-Fire Badges above gun panel
    const badgeY = panelY - 18;
    ctx.font = 'bold 9px monospace';
    // Auto-Aim badge
    ctx.fillStyle = p.autoAim ? 'rgba(6, 182, 212, 0.95)' : 'rgba(51, 65, 85, 0.8)';
    ctx.beginPath();
    ctx.roundRect(panelX, badgeY, 82, 15, 4);
    ctx.fill();
    ctx.fillStyle = p.autoAim ? '#0f172a' : '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText(p.autoAim ? 'AIM: ON [O]' : 'AIM: OFF [O]', panelX + 41, badgeY + 11);

    // Auto-Shoot badge
    ctx.fillStyle = p.autoShoot ? 'rgba(239, 68, 68, 0.95)' : 'rgba(51, 65, 85, 0.8)';
    ctx.beginPath();
    ctx.roundRect(panelX + 86, badgeY, 86, 15, 4);
    ctx.fill();
    ctx.fillStyle = p.autoShoot ? '#ffffff' : '#94a3b8';
    ctx.fillText(p.autoShoot ? 'FIRE: ON [P]' : 'FIRE: OFF [P]', panelX + 86 + 43, badgeY + 11);

    // Background Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = gun.color || '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 10);
    ctx.fill();
    ctx.stroke();

    // Weapon Name & Type
    ctx.fillStyle = gun.color || '#38bdf8';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(gun.name.toUpperCase(), panelX + 14, panelY + 22);

    // Ammo Counter (e.g., 30 / 120 or ∞ INF)
    ctx.font = 'bold 24px monospace';
    if (p.isInfiniteAmmo) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('∞ INF', panelX + 14, panelY + 54);
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`/ ∞`, panelX + 78, panelY + 54);
    } else if (p.isReloading) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('RELOADING', panelX + 14, panelY + 54);
    } else {
      ctx.fillStyle = gun.currentMag <= 3 ? '#ef4444' : '#f8fafc';
      ctx.fillText(`${gun.currentMag}`, panelX + 14, panelY + 54);
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`/ ${gun.reserveAmmo}`, panelX + 64, panelY + 54);
    }

    // Dash Cooldown Icon inside panel
    const dashReady = p.dashCooldown <= 0;
    const dashX = panelX + panelW - 42;
    const dashY = panelY + panelH / 2;

    ctx.beginPath();
    ctx.arc(dashX, dashY, 16, 0, Math.PI * 2);
    ctx.fillStyle = dashReady ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)';
    ctx.fill();
    ctx.strokeStyle = dashReady ? '#38bdf8' : '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = dashReady ? '#38bdf8' : '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('DASH', dashX, dashY + 3);

    // 2. Weapon Slot Selector (Bottom Center)
    if (p.unlockedGuns && p.unlockedGuns.length > 0) {
      const slotW = 38;
      const slotH = 26;
      const slotGap = 6;
      const totalW = p.unlockedGuns.length * slotW + (p.unlockedGuns.length - 1) * slotGap;
      const startX = width / 2 - totalW / 2;
      const startY = height - slotH - 16;

      p.unlockedGuns.forEach((g, idx) => {
        const sx = startX + idx * (slotW + slotGap);
        const isSelected = idx === p.selectedGunIndex;

        ctx.fillStyle = isSelected ? 'rgba(30, 58, 138, 0.9)' : 'rgba(15, 23, 42, 0.75)';
        ctx.strokeStyle = isSelected ? '#38bdf8' : '#334155';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(sx, startY, slotW, slotH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${idx + 1}`, sx + slotW / 2, startY + 17);
      });
    }

    // 3. Infinite World Coordinates (Top Left Sub-banner)
    const coordX = Math.round(p.x);
    const coordY = Math.round(p.y);
    const secX = Math.floor(p.x / 600);
    const secY = Math.floor(p.y / 600);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(16, 80, 210, 24);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 80, 210, 24);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText(`WORLD: (${coordX}, ${coordY})  SEC: [${secX}, ${secY}]`, 24, 96);

    ctx.restore();
  }
}

export const gameRenderer = new GameRenderer();
