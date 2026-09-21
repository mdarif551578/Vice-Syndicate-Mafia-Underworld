/**
 * Ashen Road - Colony & Factory Building Management System
 * Enables constructing power generators, automated mining drills, defensive turrets,
 * bio-domes, and fabricators for combat vehicles.
 */
import React, { useState } from 'react';
import { GameEngine } from '../game/gameEngine';
import { FactoryBuildingType, VehicleType } from '../types';
import { soundManager } from '../audio/soundManager';
import { 
  Building2, 
  Sun, 
  Pickaxe, 
  ShieldAlert, 
  Zap, 
  Users, 
  Coins, 
  Wrench, 
  Car, 
  X, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface ColonyModalProps {
  engine: GameEngine;
  onClose: () => void;
  onStateUpdate: () => void;
}

export const ColonyModal: React.FC<ColonyModalProps> = ({
  engine,
  onClose,
  onStateUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'build' | 'manage' | 'vehicles'>('build');
  const factoryMgr = engine.factoryMgr;
  const colony = factoryMgr.colony;
  const p = engine.player;

  const handleBuild = (type: FactoryBuildingType) => {
    // Place building near player position
    const offsetX = (Math.random() - 0.5) * 60;
    const offsetY = (Math.random() - 0.5) * 60;
    const res = factoryMgr.buildStructure
      ? factoryMgr.buildStructure(type, p.x + offsetX, p.y + offsetY)
      : { success: factoryMgr.constructBuilding(type, p.x + offsetX, p.y + offsetY), msg: '' };
    
    if (res.success) {
      soundManager.playEquipGun();
      engine.showToast(res.msg || `Deployed ${type.replace('_', ' ').toUpperCase()}`, '#10b981');
      onStateUpdate();
    } else {
      soundManager.playOutOfAmmo();
      engine.showToast(res.msg || 'Insufficient Colony Resources!', '#ef4444');
    }
  };

  const handleUpgrade = (id: string) => {
    const res = factoryMgr.upgradeBuilding(id);
    const success = typeof res === 'boolean' ? res : res?.success;
    if (success) {
      soundManager.playEquipGun();
      if (typeof res === 'object' && res?.msg) {
        engine.showToast(res.msg, '#10b981');
      }
      onStateUpdate();
    } else {
      soundManager.playOutOfAmmo();
      if (typeof res === 'object' && res?.msg) {
        engine.showToast(res.msg, '#ef4444');
      }
    }
  };

  const handleRepair = (id: string) => {
    const res = factoryMgr.repairStructure
      ? factoryMgr.repairStructure(id)
      : { success: factoryMgr.repairBuilding(id), msg: '' };
    const success = typeof res === 'boolean' ? res : res?.success;
    if (success) {
      soundManager.playEquipGun();
      engine.showToast(typeof res === 'object' && res?.msg ? res.msg : 'Structure fully repaired!', '#10b981');
      onStateUpdate();
    } else {
      soundManager.playOutOfAmmo();
      engine.showToast(typeof res === 'object' && res?.msg ? res.msg : 'Need 10 Raw Ore to repair!', '#ef4444');
    }
  };

  const handleBuildVehicle = (type: VehicleType) => {
    const success = engine.vehicleMgr.spawnVehicle(type, p.x + 40, p.y);
    if (success) {
      soundManager.playEquipGun();
      engine.showToast(`Fabricated ${type.replace('_', ' ').toUpperCase()}`, '#38bdf8');
      onStateUpdate();
    } else {
      soundManager.playOutOfAmmo();
    }
  };

  const powerProduced = colony.powerProduction ?? colony.powerProduced ?? 0;
  const powerConsumed = colony.powerConsumption ?? colony.powerConsumed ?? 0;
  const netPower = powerProduced - powerConsumed;

  return (
    <div
      id="colony-management-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{colony.name || 'Syndicate Fronts & Rackets'}</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  District Rackets
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated crime rackets, money laundering fronts, defense turrets, and armored vehicle chop-shops
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Colony Resource & Power Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-slate-950/40 border-b border-slate-800/80 text-xs">
          <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/60 flex items-center gap-2">
            <Zap className={`w-4 h-4 ${netPower >= 0 ? 'text-amber-400' : 'text-rose-400'}`} />
            <div>
              <div className="text-[10px] text-slate-400">Power Grid</div>
              <div className="font-mono font-bold">
                {powerProduced} / {powerConsumed} kW
                <span className={`ml-1 text-[10px] ${netPower >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ({netPower >= 0 ? `+${netPower}` : netPower})
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/60 flex items-center gap-2">
            <Pickaxe className="w-4 h-4 text-orange-400" />
            <div>
              <div className="text-[10px] text-slate-400">Raw Ore</div>
              <div className="font-mono font-bold text-orange-300">{colony.rawOre} Units</div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/60 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-sky-400" />
            <div>
              <div className="text-[10px] text-slate-400">Titanium</div>
              <div className="font-mono font-bold text-sky-300">{colony.titanium} Ingots</div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/60 flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400">Credits / Energy</div>
              <div className="font-mono font-bold text-amber-300">{colony.colonyCredits} ¢ / {colony.energyCells} ⚡</div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/60 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400">Population</div>
              <div className="font-mono font-bold text-emerald-300">{colony.colonists ?? colony.population ?? 6} Settlers</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('build')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'build'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Construct Structures</span>
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'manage'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Colony Assets ({factoryMgr.buildings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'vehicles'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Vehicle Fabrication</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* TAB 1: Construct Structures */}
          {activeTab === 'build' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Solar Generator */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-400" />
                      Solar Array
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">+25 kW</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Harnesses solar radiation to supply clean power to industrial drills and defense turrets.
                  </p>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5 mb-3 bg-slate-900/80 p-2 rounded-lg">
                    <div>Cost: 20 Ore, 5 Titanium, 40 Gold</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBuild('solar_generator')}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-1.5 rounded-lg text-xs transition"
                >
                  Deploy Solar Array
                </button>
              </div>

              {/* Ore Extractor Drill */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <Pickaxe className="w-4 h-4 text-orange-400" />
                      Ore Extractor
                    </span>
                    <span className="text-[11px] font-mono text-orange-400">Mining Drill</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Automatically harvests and refines surrounding raw mineral veins into raw ore.
                  </p>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5 mb-3 bg-slate-900/80 p-2 rounded-lg">
                    <div>Cost: 25 Ore, 10 Titanium, 60 Gold</div>
                    <div className="text-amber-400">Power: -10 kW</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBuild('ore_extractor')}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-1.5 rounded-lg text-xs transition"
                >
                  Deploy Mining Drill
                </button>
              </div>

              {/* Gatling Defense Turret */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      Defense Turret
                    </span>
                    <span className="text-[11px] font-mono text-rose-400">220 Range</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Automated dual-barrel ballistic turret that tracks and suppresses approaching hostile entities.
                  </p>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5 mb-3 bg-slate-900/80 p-2 rounded-lg">
                    <div>Cost: 30 Ore, 15 Titanium, 75 Gold</div>
                    <div className="text-amber-400">Power: -8 kW</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBuild('defense_turret')}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 rounded-lg text-xs transition"
                >
                  Deploy Defense Turret
                </button>
              </div>

              {/* Focused Laser Turret */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-purple-400" />
                      Laser Cannon
                    </span>
                    <span className="text-[11px] font-mono text-purple-400">300 Range</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    High-energy photon emitter that incinerates heavily armored enemies and cyber-titans.
                  </p>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5 mb-3 bg-slate-900/80 p-2 rounded-lg">
                    <div>Cost: 40 Ore, 25 Titanium, 120 Gold</div>
                    <div className="text-amber-400">Power: -18 kW</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBuild('laser_turret')}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-1.5 rounded-lg text-xs transition"
                >
                  Deploy Laser Turret
                </button>
              </div>

              {/* Bio-Dome Habitat */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      Bio-Dome Habitat
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">+5 Colonists</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Pressurized biosphere dome providing oxygen, synthetic food, and housing for frontier colonists.
                  </p>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5 mb-3 bg-slate-900/80 p-2 rounded-lg">
                    <div>Cost: 35 Ore, 20 Titanium, 90 Gold</div>
                    <div className="text-amber-400">Power: -12 kW</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBuild('bio_dome')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded-lg text-xs transition"
                >
                  Deploy Bio-Dome
                </button>
              </div>

              {/* Vehicle Factory Bay */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-sky-400" />
                      Vehicle Bay
                    </span>
                    <span className="text-[11px] font-mono text-sky-400">Assembly Yard</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Industrial drydock for fabricating buggies, tanks, and combat mechs.
                  </p>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5 mb-3 bg-slate-900/80 p-2 rounded-lg">
                    <div>Cost: 50 Ore, 30 Titanium, 150 Gold</div>
                    <div className="text-amber-400">Power: -20 kW</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBuild('vehicle_factory')}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-1.5 rounded-lg text-xs transition"
                >
                  Deploy Vehicle Bay
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Manage Existing Colony Buildings */}
          {activeTab === 'manage' && (
            <div className="space-y-3">
              {factoryMgr.buildings.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No colony structures deployed yet. Build your first Solar Array or Extractor!</p>
                </div>
              ) : (
                factoryMgr.buildings.map(b => (
                  <div
                    key={b.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{b.name}</span>
                        <span className="text-[10px] bg-slate-800 text-sky-400 px-1.5 py-0.5 rounded border border-slate-700">
                          Lv.{b.level}
                        </span>
                        {b.overclockTimer && b.overclockTimer > 0 && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
                            ⚡ OVERCLOCKED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Integrity: <span className="font-mono text-emerald-400">{Math.ceil(b.hp)} / {b.maxHp} HP</span>
                        {b.productionRate && (
                          <span className="ml-3 text-orange-300">Rate: +{b.productionRate}/s</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {b.hp < b.maxHp && (
                        <button
                          onClick={() => handleRepair(b.id)}
                          className="bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 text-xs px-3 py-1.5 rounded-lg border border-emerald-600 transition"
                        >
                          Repair (10 Ore)
                        </button>
                      )}
                      <button
                        onClick={() => handleUpgrade(b.id)}
                        className="bg-sky-800/80 hover:bg-sky-700 text-sky-200 text-xs px-3 py-1.5 rounded-lg border border-sky-600 transition"
                      >
                        Upgrade Lv.{b.level + 1} ({b.level * 25} Ore)
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Vehicle Fabrication */}
          {activeTab === 'vehicles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Scout Buggy */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-sm text-sky-400">Scout Hover-Buggy</span>
                  <p className="text-xs text-slate-400 mt-1 mb-2">
                    High-speed hover vehicle equipped with twin plasma blasters and shield generator.
                  </p>
                  <div className="text-[11px] font-mono text-slate-300 bg-slate-900/80 p-2 rounded-lg mb-3">
                    <div>Speed: 380 | Hull: 250 HP | Shield: 100</div>
                    <div>Cost: 30 Ore, 15 Titanium, 100 Gold</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBuildVehicle('scout_buggy')}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-1.5 rounded-lg text-xs transition"
                >
                  Fabricate Hover-Buggy
                </button>
              </div>

              {/* Siege Tank */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-sm text-orange-400">120mm Heavy Siege Tank</span>
                  <p className="text-xs text-slate-400 mt-1 mb-2">
                    Armored tracked behemoth with an explosive 120mm cannon that tears through enemy hordes.
                  </p>
                  <div className="text-[11px] font-mono text-slate-300 bg-slate-900/80 p-2 rounded-lg mb-3">
                    <div>Speed: 210 | Hull: 600 HP | Shield: 200</div>
                    <div>Cost: 60 Ore, 30 Titanium, 220 Gold</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBuildVehicle('siege_tank')}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-1.5 rounded-lg text-xs transition"
                >
                  Fabricate Siege Tank
                </button>
              </div>

              {/* Mech Walker */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-sm text-purple-400">Titan Combat Mech</span>
                  <p className="text-xs text-slate-400 mt-1 mb-2">
                    Bipedal walker platform with twin rotary vulcan cannons and heavy hydraulic stompers.
                  </p>
                  <div className="text-[11px] font-mono text-slate-300 bg-slate-900/80 p-2 rounded-lg mb-3">
                    <div>Speed: 260 | Hull: 800 HP | Shield: 350</div>
                    <div>Cost: 80 Ore, 45 Titanium, 350 Gold</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBuildVehicle('mech_walker')}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-1.5 rounded-lg text-xs transition"
                >
                  Fabricate Combat Mech
                </button>
              </div>

              {/* Harvester */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-sm text-yellow-400">Heavy Mineral Harvester</span>
                  <p className="text-xs text-slate-400 mt-1 mb-2">
                    Industrial tracked mining rig that rapidly strips resource nodes on contact.
                  </p>
                  <div className="text-[11px] font-mono text-slate-300 bg-slate-900/80 p-2 rounded-lg mb-3">
                    <div>Speed: 230 | Hull: 450 HP | Shield: 150</div>
                    <div>Cost: 40 Ore, 20 Titanium, 120 Gold</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBuildVehicle('harvester')}
                  className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold py-1.5 rounded-lg text-xs transition"
                >
                  Fabricate Harvester
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
