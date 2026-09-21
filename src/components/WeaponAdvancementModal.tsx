/**
 * Ashen Road - Weapon Advancement & Evolution Terminal
 * Allows player to evolve weapons from Tier 1 (Standard) up to Tier 5 (Ascended God-Tier)
 * with elemental perks, expanded magazines, rapid-fire rates, and penetration.
 */
import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { GunConfig } from '../types';
import { soundManager } from '../audio/soundManager';
import { 
  X, 
  Zap, 
  ShieldAlert, 
  Flame, 
  Sparkles, 
  Crosshair, 
  ChevronRight, 
  Award,
  CircleDot
} from 'lucide-react';

interface WeaponAdvancementModalProps {
  engine: GameEngine;
  onClose: () => void;
  onStateUpdate: () => void;
}

const TIER_COLORS: Record<number, { text: string; bg: string; border: string; name: string }> = {
  1: { text: 'text-slate-300', bg: 'bg-slate-800', border: 'border-slate-600', name: 'Standard Issue' },
  2: { text: 'text-sky-400', bg: 'bg-sky-950/60', border: 'border-sky-500', name: 'Enhanced Spec-Ops' },
  3: { text: 'text-purple-400', bg: 'bg-purple-950/60', border: 'border-purple-500', name: 'Overclocked Cyber' },
  4: { text: 'text-amber-400', bg: 'bg-amber-950/60', border: 'border-amber-500', name: 'Masterwork Plasma' },
  5: { text: 'text-rose-400', bg: 'bg-rose-950/60', border: 'border-rose-500', name: 'Ascended God-Tier' },
};

export const WeaponAdvancementModal: React.FC<WeaponAdvancementModalProps> = ({
  engine,
  onClose,
  onStateUpdate,
}) => {
  const player = engine.player;
  const equippedGun = engine.getEquippedGun();

  const handleAdvanceWeapon = (gun: GunConfig) => {
    const tier = gun.tier || 1;
    if (tier >= 5) return;

    // Advance weapon via engine
    engine.upgradeGunTier(gun);
    soundManager.playLevelUp();
    onStateUpdate();
  };

  const handleInstantForge = (gun: GunConfig) => {
    const tier = gun.tier || 1;
    if (tier >= 5) return;

    const goldCost = tier * 100;
    if (player.gold < goldCost) {
      engine.showToast(`Requires ${goldCost} Gold to forge advancement!`, '#ef4444');
      soundManager.playOutOfAmmo();
      return;
    }

    player.gold -= goldCost;
    engine.upgradeGunTier(gun);
    soundManager.playLevelUp();
    onStateUpdate();
  };

  return (
    <div
      id="weapon-advancement-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900/95 border border-amber-500/50 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Weapon Advancement & Evolution Foundry</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  TIER 1 - 5
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Evolve weapon tiers through combat kill XP or instant nanite forging.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">Available Gold</div>
              <div className="text-sm font-bold text-amber-400 font-mono">
                {player.gold} G
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weapons List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {player.unlockedGuns.map((gun, idx) => {
            const tier = gun.tier || 1;
            const style = TIER_COLORS[tier] || TIER_COLORS[1];
            const xp = gun.weaponXp || 0;
            const xpNeeded = gun.weaponXpMax || (tier * 100);
            const xpRatio = Math.min(1, xp / xpNeeded);
            const isEquipped = equippedGun?.id === gun.id;
            const kills = gun.kills || 0;
            const forgeCost = tier * 100;
            const canAfford = player.gold >= forgeCost;

            return (
              <div
                key={gun.id}
                className={`p-4 rounded-xl border transition-all ${
                  isEquipped
                    ? 'bg-slate-850 border-sky-500/80 ring-1 ring-sky-500/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: Weapon Name & Info */}
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-base text-slate-100 flex items-center gap-2">
                        {gun.name}
                      </span>
                      {isEquipped && (
                        <span className="bg-sky-500/20 text-sky-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-sky-500/30">
                          EQUIPPED
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${style.bg} ${style.text} ${style.border}`}
                      >
                        TIER {tier} • {style.name}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mb-2">
                      {gun.advancementPerk || gun.description}
                    </div>

                    {/* Stats Pill Row */}
                    <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded text-rose-300 border border-slate-700">
                        DMG: {gun.damage}
                      </span>
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded text-amber-300 border border-slate-700">
                        MAG: {gun.magSize}
                      </span>
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded text-emerald-300 border border-slate-700">
                        RPM: {Math.round(gun.fireRate * 60)}
                      </span>
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded text-sky-300 border border-slate-700">
                        PIERCE: {gun.penetration || 1}
                      </span>
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded text-purple-300 border border-slate-700">
                        KILLS: {kills}
                      </span>
                    </div>
                  </div>

                  {/* Center: XP Progress */}
                  <div className="w-full lg:w-48">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>Advancement XP</span>
                      <span>
                        {xp} / {xpNeeded}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700 p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-200"
                        style={{ width: `${xpRatio * 100}%` }}
                      />
                    </div>
                    {tier < 5 ? (
                      <div className="text-[10px] text-slate-500 mt-1">
                        Next: Tier {tier + 1} (+35% DMG, +Perk)
                      </div>
                    ) : (
                      <div className="text-[10px] text-amber-400 font-bold mt-1">
                        MAX TIER REACHED
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                    <button
                      onClick={() => {
                        engine.selectGun(idx);
                        onStateUpdate();
                      }}
                      disabled={isEquipped}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isEquipped
                          ? 'bg-slate-800/50 text-slate-500 cursor-default'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isEquipped ? 'Active' : 'Equip'}
                    </button>

                    {tier < 5 && (
                      <>
                        {xp >= xpNeeded ? (
                          <button
                            onClick={() => handleAdvanceWeapon(gun)}
                            className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-lg animate-pulse transition flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Evolve Tier {tier + 1}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleInstantForge(gun)}
                            disabled={!canAfford}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                              canAfford
                                ? 'bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border-amber-500/50 shadow'
                                : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                            }`}
                            title={`Instant forge to Tier ${tier + 1} with ${forgeCost} Gold`}
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>Forge ({forgeCost} G)</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-300">
              <Crosshair className="w-3.5 h-3.5 text-sky-400" />
              <span>Earn weapon XP with every enemy kill</span>
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline">
              Advancing boosts Damage (+35%), Mag Size (+30%), and grants Piercing & Fire Rate
            </span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
