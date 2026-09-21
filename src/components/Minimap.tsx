import React, { useRef, useEffect, useState } from 'react';
import { GameEngine } from '../game/gameEngine';
import { Compass, ZoomIn, ZoomOut, Shield, MapPin, Eye } from 'lucide-react';
import { CityDistrict } from '../types';

interface MinimapProps {
  engine: GameEngine;
}

export const Minimap: React.FC<MinimapProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 0.6x to 1.8x
  const [currentDistrict, setCurrentDistrict] = useState<CityDistrict | null>(null);
  const [conquestRatio, setConquestRatio] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const p = engine.player;
      const size = canvas.width;
      const radius = size / 2;
      const center = radius;

      ctx.clearRect(0, 0, size, size);

      // Save clipping to circular tactical radar
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius - 2, 0, Math.PI * 2);
      ctx.clip();

      // Radar background
      const grad = ctx.createRadialGradient(center, center, 10, center, center, radius);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.7, '#020617');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Radar range scale: pixels in world per pixel on minimap
      const scale = 0.08 * zoomLevel * (isExpanded ? 1.4 : 1.0);

      // Transform world coords to minimap screen coords relative to player
      const toScreenX = (wx: number) => center + (wx - p.x) * scale;
      const toScreenY = (wy: number) => center + (wy - p.y) * scale;

      // 1. Draw City Districts & Territory Conquest Overlays
      const districts = engine.getDistricts ? engine.getDistricts() : [];
      let activeDist: CityDistrict | null = null;

      districts.forEach(dist => {
        const sx = toScreenX(dist.x);
        const sy = toScreenY(dist.y);
        const sw = dist.width * scale;
        const sh = dist.height * scale;

        // Check if player is currently in this district
        if (
          p.x >= dist.x &&
          p.x <= dist.x + dist.width &&
          p.y >= dist.y &&
          p.y <= dist.y + dist.height
        ) {
          activeDist = dist;
        }

        // Fill district territory color with transparency
        ctx.save();
        if (dist.isConquered || dist.controlledBy === 'player_syndicate') {
          // Emerald Green Conquered Falcone Territory
          ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
          ctx.strokeStyle = '#10b981';
        } else if (dist.controlledBy === 'moretti_mob') {
          // Red Hostile Moretti Territory
          ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
          ctx.strokeStyle = '#ef4444';
        } else if (dist.controlledBy === 'bratva_cartel') {
          // Blue Bratva Territory
          ctx.fillStyle = 'rgba(59, 130, 246, 0.18)';
          ctx.strokeStyle = '#3b82f6';
        } else if (dist.controlledBy === 'yakuza_clan') {
          // Purple Yakuza Territory
          ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
          ctx.strokeStyle = '#a855f7';
        } else {
          ctx.fillStyle = 'rgba(100, 116, 139, 0.12)';
          ctx.strokeStyle = '#64748b';
        }

        ctx.lineWidth = 1;
        ctx.fillRect(sx, sy, sw, sh);
        ctx.strokeRect(sx, sy, sw, sh);

        // District label if within radar bounds
        if (sx + sw / 2 > 20 && sx + sw / 2 < size - 20 && sy + sh / 2 > 20 && sy + sh / 2 < size - 20) {
          ctx.font = 'bold 7px monospace';
          ctx.fillStyle = dist.isConquered ? '#34d399' : '#94a3b8';
          ctx.textAlign = 'center';
          ctx.fillText(dist.name.toUpperCase(), sx + sw / 2, sy + sh / 2);
          if (dist.isConquered) {
            ctx.fillStyle = '#10b981';
            ctx.fillText('★ CONQUERED ★', sx + sw / 2, sy + sh / 2 + 8);
          }
        }
        ctx.restore();
      });

      setCurrentDistrict(activeDist);

      // Compute total territory conquest percentage
      if (districts.length > 0) {
        const conqueredCount = districts.filter(d => d.isConquered).length;
        setConquestRatio(Math.round((conqueredCount / districts.length) * 100));
      }

      // 2. Draw Roads / Avenues
      if (engine.world && engine.world.roads) {
        ctx.save();
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
        ctx.lineWidth = Math.max(2, 28 * scale);
        engine.world.roads.forEach(road => {
          ctx.beginPath();
          ctx.moveTo(toScreenX(road.x1), toScreenY(road.y1));
          ctx.lineTo(toScreenX(road.x2), toScreenY(road.y2));
          ctx.stroke();
        });
        ctx.restore();
      }

      // 3. Draw Radar Grid Lines & Range Rings
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      // Rings
      [radius * 0.35, radius * 0.7, radius * 0.95].forEach(r => {
        ctx.beginPath();
        ctx.arc(center, center, r, 0, Math.PI * 2);
        ctx.stroke();
      });
      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(center, 0);
      ctx.lineTo(center, size);
      ctx.moveTo(0, center);
      ctx.lineTo(size, center);
      ctx.stroke();
      ctx.restore();

      // 4. Draw Supply Chests (Gold Diamonds)
      if (engine.infiniteChunks) {
        ctx.fillStyle = '#f59e0b';
        engine.infiniteChunks.forEach(chunk => {
          chunk.chests.forEach(chest => {
            if (!chest.opened) {
              const cx = toScreenX(chest.x);
              const cy = toScreenY(chest.y);
              if (Math.hypot(cx - center, cy - center) < radius) {
                ctx.beginPath();
                ctx.moveTo(cx, cy - 3);
                ctx.lineTo(cx + 3, cy);
                ctx.lineTo(cx, cy + 3);
                ctx.lineTo(cx - 3, cy);
                ctx.closePath();
                ctx.fill();
              }
            }
          });
        });
      }

      // 5. Draw Hostile Enemies & Bosses (Red Dots / Skulls)
      const allEnemies = engine.getAllActiveEnemies ? engine.getAllActiveEnemies() : engine.enemies;
      allEnemies.forEach(e => {
        if (e.isDead || e.hp <= 0) return;
        const ex = toScreenX(e.x);
        const ey = toScreenY(e.y);
        const distToCenter = Math.hypot(ex - center, ey - center);

        if (distToCenter < radius - 4) {
          ctx.save();
          if (e.isBoss || e.type === 'boss' || e.type === 'titan_colossus') {
            // Boss: Pulsing Amber-Red Skull Blip
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 7px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('☠', ex, ey + 2.5);
          } else if (e.troopCommand) {
            // Friendly Falcone Troop: Bright Green Dot
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Hostile Mob: Solid Crimson Dot
            ctx.fillStyle = '#f87171';
            ctx.beginPath();
            ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      // 6. Draw Friendly Falcone Troops & NPCs
      if (engine.npcs) {
        engine.npcs.forEach(npc => {
          const nx = toScreenX(npc.x);
          const ny = toScreenY(npc.y);
          if (Math.hypot(nx - center, ny - center) < radius - 4) {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(nx, ny, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // 7. Draw Vehicles (Amber Diamond)
      if (engine.vehicleMgr) {
        const vehicles = (typeof engine.vehicleMgr.getVehicles === 'function'
          ? engine.vehicleMgr.getVehicles()
          : engine.vehicleMgr.vehicles) || [];
        vehicles.forEach(v => {
          const vx = toScreenX(v.x);
          const vy = toScreenY(v.y);
          if (Math.hypot(vx - center, vy - center) < radius - 4) {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(vx, vy, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // 8. Draw Player Vision Cone & Directional Blip
      ctx.save();
      // Vision cone
      const aimAng = p.aimAngle !== undefined ? p.aimAngle : p.facingAngle;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, 45, aimAng - 0.45, aimAng + 0.45);
      ctx.closePath();
      ctx.fill();

      // Player Arrow
      ctx.translate(center, center);
      ctx.rotate(aimAng);
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(7, 0);
      ctx.lineTo(-5, -4);
      ctx.lineTo(-2, 0);
      ctx.lineTo(-5, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // Restore outer clip

      // Outer Tactical Radar Border Ring
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(center, center, radius - 2, 0, Math.PI * 2);
      ctx.stroke();

      // Cardinal N Marker
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('N', center, 11);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [engine, zoomLevel, isExpanded]);

  const toggleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(0.5, Math.min(2.0, prev + delta)));
  };

  return (
    <div
      id="open-world-radar-minimap"
      className={`relative z-30 transition-all duration-300 pointer-events-auto select-none ${
        isExpanded ? 'w-64' : 'w-44'
      }`}
    >
      <div className="bg-slate-950/90 backdrop-blur-md border border-sky-500/30 rounded-2xl p-2.5 shadow-2xl shadow-sky-950/50">
        {/* Radar Header */}
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-sky-300 font-mono">
              RADAR TACTICAL
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleZoom(-0.2)}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded hover:bg-slate-800 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleZoom(0.2)}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded hover:bg-slate-800 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded hover:bg-slate-800 transition"
              title={isExpanded ? 'Compact View' : 'Expand Radar'}
            >
              <Eye className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Canvas Radar Screen */}
        <div className="flex justify-center relative my-1">
          <canvas
            ref={canvasRef}
            width={isExpanded ? 240 : 156}
            height={isExpanded ? 240 : 156}
            className="rounded-full shadow-inner bg-slate-950 cursor-crosshair"
          />
        </div>

        {/* Territory Status & District Info */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[9px] font-mono">
            <span className="text-slate-400 flex items-center gap-1 truncate">
              <MapPin className="w-2.5 h-2.5 text-sky-400 shrink-0" />
              {currentDistrict ? currentDistrict.name : 'METROPOLIS WILDERNESS'}
            </span>
            <span
              className={`font-bold shrink-0 ${
                currentDistrict?.isConquered
                  ? 'text-emerald-400'
                  : currentDistrict?.controlledBy === 'moretti_mob'
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              {currentDistrict?.isConquered
                ? 'FALCONE'
                : currentDistrict?.controlledBy
                ? currentDistrict.controlledBy.toUpperCase().replace('_', ' ')
                : 'CONTESTED'}
            </span>
          </div>

          {/* Territory Conquest Bar */}
          <div>
            <div className="flex justify-between text-[8px] font-mono text-slate-400 mb-0.5">
              <span className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-emerald-400" />
                CONQUEST
              </span>
              <span className="text-emerald-400 font-bold">{conquestRatio}% SECURED</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${Math.max(5, conquestRatio)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
