/**
 * Ashen Road - Cyber Hacking Terminal & Protocol Injector
 * Scan, hijack, stun, or overload enemies and colony infrastructure
 */
import React, { useState } from 'react';
import { GameEngine } from '../game/gameEngine';
import { Enemy, FactoryBuilding } from '../types';
import { soundManager } from '../audio/soundManager';
import { Zap, Shield, Cpu, Terminal, Radio, AlertOctagon, X, Sparkles } from 'lucide-react';

interface HackModalProps {
  engine: GameEngine;
  onClose: () => void;
  onStateUpdate: () => void;
}

export const HackModal: React.FC<HackModalProps> = ({
  engine,
  onClose,
  onStateUpdate,
}) => {
  const p = engine.player;
  const hackMgr = engine.hackMgr;
  const cyberEnergy = p.cyberEnergy ?? 100;
  const maxCyberEnergy = p.maxCyberEnergy ?? 100;

  // Find nearby enemies within cyber deck signal range (320 px)
  const nearbyEnemies = engine.enemies
    .concat(engine.activeInfiniteEnemies)
    .filter(e => !e.isDead && Math.hypot(e.x - p.x, e.y - p.y) <= 340);

  // Find nearby buildings
  const nearbyBuildings = engine.factoryMgr.buildings.filter(
    b => Math.hypot(b.x - p.x, b.y - p.y) <= 300
  );

  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(
    nearbyEnemies[0]?.id || null
  );

  const selectedEnemy = nearbyEnemies.find(e => e.id === selectedEnemyId) || null;

  const handleHack = (protocol: 'stun' | 'hijack' | 'overload' | 'siphon') => {
    if (!selectedEnemy) return;

    let cost = 25;
    if (protocol === 'hijack') cost = 45;
    else if (protocol === 'overload') cost = 50;
    else if (protocol === 'siphon') cost = 30;

    if (cyberEnergy < cost) {
      soundManager.playOutOfAmmo();
      engine.showToast('INSUFFICIENT CYBER ENERGY', '#ef4444');
      return;
    }

    const success = hackMgr.hackEnemy(selectedEnemy, protocol, p);
    if (success) {
      p.cyberEnergy = (p.cyberEnergy ?? 100) - cost;
      soundManager.playTeslaShock();
      onStateUpdate();
      onClose();
    }
  };

  const handleOverclockBuilding = (building: FactoryBuilding) => {
    const cost = 35;
    if (cyberEnergy < cost) {
      soundManager.playOutOfAmmo();
      engine.showToast('INSUFFICIENT CYBER ENERGY', '#ef4444');
      return;
    }

    const success = hackMgr.overclockBuilding(building, p);
    if (success) {
      p.cyberEnergy = (p.cyberEnergy ?? 100) - cost;
      soundManager.playTeslaShock();
      onStateUpdate();
      onClose();
    }
  };

  return (
    <div
      id="cyber-hack-terminal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in"
    >
      <div className="bg-slate-950 border border-emerald-500/50 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden text-emerald-300 font-mono">
        {/* Terminal Header */}
        <div className="p-4 bg-emerald-950/30 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <h2 className="text-base font-bold tracking-wider text-emerald-200">
                CYBER DECK PROTOCOL // V3.8
              </h2>
              <p className="text-xs text-emerald-500">
                Neural signal scanner & electronic warfare transceiver
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-900/90 border border-emerald-500/40 px-3 py-1 rounded-lg text-xs flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>
                ENERGY: <strong>{cyberEnergy}</strong> / {maxCyberEnergy}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-700/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Target Scanner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-y-auto flex-1">
          {/* Left Column: Target Entities List */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>Detected Signals ({nearbyEnemies.length})</span>
            </div>

            {nearbyEnemies.length === 0 ? (
              <div className="text-center py-12 text-emerald-600/70 border border-emerald-900/40 rounded-xl bg-slate-900/40 p-4">
                <AlertOctagon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No enemy cyber signatures detected within 340m radius.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {nearbyEnemies.map(e => {
                  const dist = Math.round(Math.hypot(e.x - p.x, e.y - p.y));
                  const isSelected = e.id === selectedEnemyId;

                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEnemyId(e.id)}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-lg'
                          : 'bg-slate-900/60 border-emerald-900/50 text-emerald-300 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs flex items-center gap-2">
                          <span>{e.name}</span>
                          {e.isHacked && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              [HIJACKED ALLY]
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-emerald-500/80 mt-0.5">
                          TYPE: {e.type.toUpperCase()} | HP: {Math.ceil(e.hp)}/{e.maxHp}
                        </div>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-mono">{dist}m</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Nearby Colony Infrastructure */}
            {nearbyBuildings.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Colony Structures ({nearbyBuildings.length})</span>
                </div>
                <div className="space-y-2">
                  {nearbyBuildings.map(b => (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-xl border border-sky-800/60 bg-sky-950/30 flex items-center justify-between text-sky-300"
                    >
                      <div>
                        <div className="font-bold text-xs">{b.name} (Lv.{b.level})</div>
                        <div className="text-[10px] text-sky-400/80">Integrity: {Math.ceil(b.hp)} HP</div>
                      </div>
                      <button
                        onClick={() => handleOverclockBuilding(b)}
                        className="bg-sky-700 hover:bg-sky-600 text-white text-[11px] px-2.5 py-1 rounded-lg border border-sky-400 transition"
                      >
                        ⚡ Overclock (35 EP)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Execution Console */}
          <div className="bg-slate-900/70 border border-emerald-800/60 rounded-xl p-4 flex flex-col justify-between">
            {selectedEnemy ? (
              <div>
                <div className="border-b border-emerald-800/60 pb-3 mb-3">
                  <span className="text-xs text-emerald-500 uppercase">Target Matrix</span>
                  <div className="text-base font-bold text-emerald-200 mt-0.5">
                    {selectedEnemy.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div className="bg-slate-950 p-2 rounded-lg border border-emerald-900/50">
                      Armor Defense: {selectedEnemy.defense}
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-emerald-900/50">
                      Speed: {selectedEnemy.speed}
                    </div>
                  </div>
                </div>

                {/* Cyber Action Protocols */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleHack('stun')}
                    className="w-full bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-500/60 p-2.5 rounded-xl flex items-center justify-between text-left transition"
                  >
                    <div>
                      <div className="font-bold text-xs text-emerald-200">EMP Shock Wave</div>
                      <div className="text-[10px] text-emerald-400/80">Stuns target for 5s & disables weapons</div>
                    </div>
                    <span className="text-xs bg-emerald-950 px-2 py-1 rounded border border-emerald-600">25 EP</span>
                  </button>

                  <button
                    onClick={() => handleHack('hijack')}
                    className="w-full bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-500/60 p-2.5 rounded-xl flex items-center justify-between text-left transition"
                  >
                    <div>
                      <div className="font-bold text-xs text-emerald-200">Remote Neural Hijack</div>
                      <div className="text-[10px] text-emerald-400/80">Re-programs neural core: Fights as ally for 45s</div>
                    </div>
                    <span className="text-xs bg-emerald-950 px-2 py-1 rounded border border-emerald-600">45 EP</span>
                  </button>

                  <button
                    onClick={() => handleHack('siphon')}
                    className="w-full bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-500/60 p-2.5 rounded-xl flex items-center justify-between text-left transition"
                  >
                    <div>
                      <div className="font-bold text-xs text-emerald-200">Shield Siphon Drain</div>
                      <div className="text-[10px] text-emerald-400/80">Drains enemy defense shields & recovers 40 HP</div>
                    </div>
                    <span className="text-xs bg-emerald-950 px-2 py-1 rounded border border-emerald-600">30 EP</span>
                  </button>

                  <button
                    onClick={() => handleHack('overload')}
                    className="w-full bg-rose-950/60 hover:bg-rose-900 border border-rose-500/60 p-2.5 rounded-xl flex items-center justify-between text-left transition text-rose-300"
                  >
                    <div>
                      <div className="font-bold text-xs text-rose-200">System Overload Blast</div>
                      <div className="text-[10px] text-rose-400/80">Triggers capacitor detonation for 220 AOE blast damage</div>
                    </div>
                    <span className="text-xs bg-rose-950 px-2 py-1 rounded border border-rose-600 text-rose-300">50 EP</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-emerald-600/70">
                <Cpu className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>Select a target from the left matrix to initiate protocol</p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-emerald-900/60 text-[10px] text-emerald-600 flex justify-between">
              <span>SECURITY PROTOCOL: BYPASSED</span>
              <span>LATENCY: 4ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
