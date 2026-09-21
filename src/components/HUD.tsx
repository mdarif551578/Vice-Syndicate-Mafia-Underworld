/**
 * Ashen Road - Floating HUD & In-Game Controls
 */
import React, { useState } from 'react';
import { Player, Quest } from '../types';
import { soundManager } from '../audio/soundManager';
import { infiniteWorldManager } from '../game/infiniteWorld';
import { 
  Volume2, 
  VolumeX, 
  Shield, 
  Swords, 
  Coins, 
  BookOpen, 
  Backpack, 
  Pause, 
  Compass, 
  Smartphone, 
  Radio, 
  Building2, 
  Zap, 
  Car,
  Infinity as InfinityIcon,
  Sparkles,
  MapPin,
  Crosshair,
  Flame,
  Keyboard,
  Heart
} from 'lucide-react';

interface HUDProps {
  player: Player;
  activeQuest: Quest | null;
  dayTime: number;
  showTouchControls: boolean;
  onToggleTouchControls: () => void;
  onOpenInventory: () => void;
  onOpenQuests: () => void;
  onOpenRadialWheel: () => void;
  onOpenColony: () => void;
  onOpenHacking: () => void;
  onMountVehicle: () => void;
  onToggleInfiniteAmmo: () => void;
  onOpenWeaponAdvancement: () => void;
  onToggleAutoAim?: () => void;
  onToggleAutoShoot?: () => void;
  onOpenShortcutsGuide?: () => void;
  onQuickHeal?: () => void;
  onPause: () => void;
  onAttack: () => void;
  onInteract: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  activeQuest,
  dayTime,
  showTouchControls,
  onToggleTouchControls,
  onOpenInventory,
  onOpenQuests,
  onOpenRadialWheel,
  onOpenColony,
  onOpenHacking,
  onMountVehicle,
  onToggleInfiniteAmmo,
  onOpenWeaponAdvancement,
  onToggleAutoAim,
  onToggleAutoShoot,
  onOpenShortcutsGuide,
  onQuickHeal,
  onPause,
  onAttack,
  onInteract,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [showControls, setShowControls] = useState(true);

  const hpRatio = Math.max(0, Math.min(1, player.hp / player.maxHp));
  const staminaRatio = Math.max(0, Math.min(1, player.stamina / player.maxStamina));

  const totalAttack = player.baseAttack + (player.equipment.weapon?.damage || 0);
  const totalDefense = player.baseDefense + (player.equipment.armor?.defense || 0);

  const healingCount = player.inventory
    .filter(i => i.type === 'CONSUMABLE' && (i.restoreHp || 0) > 0)
    .reduce((acc, i) => acc + (i.quantity || 1), 0);

  // Sector and Biome calculations for Infinite World
  const sectorX = Math.floor(player.x / 640);
  const sectorY = Math.floor(player.y / 640);
  const biome = infiniteWorldManager.getBiome(sectorX, sectorY);
  const distFromCore = Math.hypot(sectorX, sectorY);
  const isTitanSector = distFromCore >= 3.5 && (Math.abs(sectorX) % 4 === 2) && (Math.abs(sectorY) % 4 === 2);

  // Time of day label
  const hour = Math.floor((dayTime / 600) * 24);
  const timeStr = `${hour.toString().padStart(2, '0')}:00`;

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const equippedGun = player.unlockedGuns?.[player.selectedGunIndex || 0] || null;
  const vehicle = player.mountedVehicle;
  const isInfAmmo = !!player.isInfiniteAmmo;

  const getSyndicateRank = (lvl: number) => {
    if (lvl >= 12) return 'Syndicate Don';
    if (lvl >= 8) return 'Underboss';
    if (lvl >= 4) return 'Caporegime';
    return 'Enforcer';
  };

  // District determination based on world coordinates
  let currentDistrict = 'Downtown';
  let districtTag = 'Turf War';
  let districtColor = 'text-amber-400';
  let districtBg = 'bg-amber-950/40 border-amber-500/40';
  if (player.x >= 400 && player.y < 400) {
    currentDistrict = 'Waterfront';
    districtTag = 'Smuggling Port';
    districtColor = 'text-sky-400';
    districtBg = 'bg-sky-950/40 border-sky-500/40';
  } else if (player.x < 400 && player.y >= 400) {
    currentDistrict = 'Chinatown';
    districtTag = 'Gambling & Club';
    districtColor = 'text-rose-400';
    districtBg = 'bg-rose-950/40 border-rose-500/40';
  } else if (player.x >= 400 && player.y >= 400) {
    currentDistrict = 'Industrial';
    districtTag = 'Weapons Depot';
    districtColor = 'text-purple-400';
    districtBg = 'bg-purple-950/40 border-purple-500/40';
  }

  return (
    <div id="game-hud" className="pointer-events-none absolute inset-0 select-none p-4 flex flex-col justify-between font-sans">
      {/* TOP ROW: Stats (Left), Sector Radar (Center), & Controls / Quest (Right) */}
      <div className="flex justify-between items-start gap-4">
        {/* Top-Left: Player Stats Bar */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl min-w-[250px] max-w-[340px] text-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black px-2 py-0.5 rounded text-[11px] uppercase tracking-wider shadow">
                LVL {player.level}
              </span>
              <div>
                <span className="font-black text-amber-300 tracking-wide text-sm block">
                  Boss Vince
                </span>
                <span className="text-[10px] text-slate-400 font-medium -mt-0.5 block">
                  {getSyndicateRank(player.level)}
                </span>
              </div>
            </div>

            {/* Current District Badge */}
            <div className={`px-2 py-1 rounded-lg border text-right ${districtBg}`}>
              <div className={`text-[11px] font-black uppercase tracking-wider ${districtColor}`}>
                {currentDistrict}
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                {districtTag}
              </div>
            </div>
          </div>

          {/* HP Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span>HEALTH</span>
              </span>
              <span className="font-mono">{Math.ceil(player.hp)} / {player.maxHp}</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-rose-400 rounded-full transition-all duration-150 shadow-sm"
                style={{ width: `${hpRatio * 100}%` }}
              />
            </div>
          </div>

          {/* Stamina / Adrenaline Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>ADRENALINE</span>
              </span>
              <span className="font-mono">{Math.ceil(player.stamina)} / {player.maxStamina}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-yellow-500 to-emerald-400 rounded-full transition-all duration-100"
                style={{ width: `${staminaRatio * 100}%` }}
              />
            </div>
          </div>

          {/* Mounted Vehicle Status Widget */}
          {vehicle && (
            <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-xs">
              <div className="flex items-center justify-between text-purple-300 font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-purple-400" />
                  <span>{vehicle.name}</span>
                </span>
                <button
                  onClick={onMountVehicle}
                  className="bg-rose-900/80 hover:bg-rose-700 text-rose-200 px-2 py-0.5 rounded text-[10px] border border-rose-500/80 font-bold"
                >
                  Exit Vehicle [V]
                </button>
              </div>
              <div className="flex justify-between text-[11px] text-slate-300 font-mono">
                <span>HULL: {Math.ceil(vehicle.hp)}/{vehicle.maxHp}</span>
                <span className="text-sky-300">SHIELD: {Math.ceil(vehicle.shield)}/{vehicle.maxShield}</span>
              </div>
            </div>
          )}
        </div>

        {/* Top-Center: Infinite World Sector Navigation Radar */}
        <div className="pointer-events-auto hidden md:flex flex-col items-center bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-4 py-2 shadow-xl text-slate-200">
          <div className="flex items-center gap-2 text-xs font-mono">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold text-sky-400">
              SECTOR [{sectorX >= 0 ? `+${sectorX}` : sectorX}, {sectorY >= 0 ? `+${sectorY}` : sectorY}]
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300 capitalize">{biome.replace('_', ' ')}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{Math.round(distFromCore * 100)}m Core Dist</span>
          </div>
          {isTitanSector ? (
            <div className="text-[10px] text-rose-400 font-bold tracking-wider mt-0.5 flex items-center gap-1 animate-pulse">
              <span>⚠️ TITAN WORLD BOSS DETECTED IN THIS SECTOR!</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 mt-0.5">
              Infinite Exploration Active — Endless Coordinates
            </div>
          )}
        </div>

        {/* Top-Right: Controls & Current Quest */}
        <div className="flex flex-col items-end gap-2">
          {/* Audio, Touch Toggle, Infinite Ammo, and Pause Controls */}
          <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap justify-end">
            {/* Quick Heal Potion Button */}
            <button
              id="btn-hud-quick-heal"
              onClick={onQuickHeal}
              className={`p-2 rounded-lg border shadow transition flex items-center gap-1.5 text-xs font-bold ${
                healingCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-600/30'
                  : 'bg-slate-900/80 text-slate-500 border-slate-800'
              }`}
              title="Quick Heal using potion or herb from inventory [Q]"
            >
              <Heart className={`w-4 h-4 ${healingCount > 0 ? 'text-rose-200 fill-rose-300' : 'text-slate-600'}`} />
              <span>HEAL [Q] {healingCount > 0 ? `(${healingCount})` : '(0)'}</span>
            </button>

            {/* Auto-Aim Proximity Toggle */}
            <button
              id="btn-hud-auto-aim"
              onClick={onToggleAutoAim}
              className={`p-2 rounded-lg border shadow transition flex items-center gap-1.5 text-xs font-bold ${
                player.autoAim
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-cyan-500/40 font-extrabold'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-slate-700/80'
              }`}
              title="Toggle Auto-Aim upon enemy proximity [O]"
            >
              <Crosshair className={`w-4 h-4 ${player.autoAim ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{player.autoAim ? 'AIM [O]: ON' : 'AIM [O]: OFF'}</span>
            </button>

            {/* Auto-Shoot Proximity Toggle */}
            <button
              id="btn-hud-auto-shoot"
              onClick={onToggleAutoShoot}
              className={`p-2 rounded-lg border shadow transition flex items-center gap-1.5 text-xs font-bold ${
                player.autoShoot
                  ? 'bg-rose-600 text-white border-rose-400 shadow-rose-600/40 font-extrabold'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-slate-700/80'
              }`}
              title="Toggle Auto-Shoot upon enemy in range [P]"
            >
              <Flame className={`w-4 h-4 ${player.autoShoot ? 'text-amber-300 animate-pulse' : 'text-slate-400'}`} />
              <span>{player.autoShoot ? 'FIRE [P]: ON' : 'FIRE [P]: OFF'}</span>
            </button>

            {/* Infinite Ammo Toggle Button */}
            <button
              id="btn-hud-inf-ammo"
              onClick={onToggleInfiniteAmmo}
              className={`p-2 rounded-lg border shadow transition flex items-center gap-1.5 text-xs font-bold ${
                isInfAmmo
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/50 shadow-md ring-1 ring-amber-300 animate-pulse'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
              }`}
              title="Toggle Infinite Ammo (U)"
            >
              <InfinityIcon className={`w-4 h-4 ${isInfAmmo ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{isInfAmmo ? '∞ AMMO [U]: ON' : '∞ AMMO [U]: OFF'}</span>
            </button>

            {/* Weapon Advancement Foundry Button */}
            <button
              id="btn-hud-weapon-advance"
              onClick={onOpenWeaponAdvancement}
              className="bg-gradient-to-r from-amber-600/90 to-rose-600/90 hover:from-amber-500 hover:to-rose-500 text-white p-2 rounded-lg border border-amber-400/50 shadow transition flex items-center gap-1.5 text-xs font-bold"
              title="Weapon Advancement & Evolution (K)"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Advance [K]</span>
            </button>

            <button
              id="btn-hud-touch-toggle"
              onClick={onToggleTouchControls}
              className={`p-2 rounded-lg border shadow transition flex items-center gap-1.5 text-xs font-medium ${
                showTouchControls 
                  ? 'bg-sky-600 text-white border-sky-400' 
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
              }`}
              title="Toggle Touch Controls Overlay (T)"
            >
              <Smartphone className="w-4 h-4 text-sky-300" />
              <span>{showTouchControls ? 'Touch [T]' : 'Touchpad [T]'}</span>
            </button>

            <button
              id="btn-hud-colony"
              onClick={onOpenColony}
              className="bg-slate-900/80 hover:bg-slate-800 text-amber-300 p-2 rounded-lg border border-amber-500/40 shadow transition flex items-center gap-1 text-xs font-medium"
              title="Colony & Factory Grid [B]"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Colony [B]</span>
            </button>

            <button
              id="btn-hud-hack"
              onClick={onOpenHacking}
              className="bg-slate-900/80 hover:bg-slate-800 text-emerald-300 p-2 rounded-lg border border-emerald-500/40 shadow transition flex items-center gap-1 text-xs font-medium"
              title="Cyber Hack Terminal [H]"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Hack [H]</span>
            </button>

            {/* Keyboard Shortcuts Reference Guide */}
            <button
              id="btn-hud-shortcuts"
              onClick={onOpenShortcutsGuide}
              className="bg-slate-900/80 hover:bg-slate-800 text-amber-300 p-2 rounded-lg border border-amber-500/40 shadow transition flex items-center gap-1 text-xs font-medium"
              title="Open Keyboard Shortcuts Reference Sheet [?]"
            >
              <Keyboard className="w-4 h-4 text-amber-400" />
              <span>Keys [?]</span>
            </button>

            <button
              id="btn-hud-audio"
              onClick={handleToggleMute}
              className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 p-2 rounded-lg border border-slate-700/80 shadow transition flex items-center gap-1.5 text-xs font-medium"
              title="Toggle Music & SFX [M]"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>{isMuted ? 'Muted [M]' : 'Music [M]'}</span>
            </button>

            <button
              id="btn-hud-pause"
              onClick={onPause}
              className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 p-2 rounded-lg border border-slate-700/80 shadow transition"
              title="Pause (ESC)"
            >
              <Pause className="w-4 h-4 text-sky-400" />
            </button>
          </div>

          {/* Active Quest Card */}
          {activeQuest && (
            <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-amber-500/40 rounded-xl p-3 shadow-xl max-w-[280px] text-right text-slate-100">
              <div className="text-[11px] uppercase tracking-wider text-amber-400 font-bold mb-0.5">
                Current Objective
              </div>
              <div className="font-semibold text-sm text-slate-100 mb-1">
                {activeQuest.title}
              </div>
              {activeQuest.objectives.map((obj, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-center justify-end gap-2">
                  <span className={obj.completed ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                    {obj.text}
                  </span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono text-amber-300 border border-slate-700">
                    {obj.current} / {obj.required}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ROW: Quick Weapons (Center-Bottom) & Menus (Left) */}
      <div className="flex justify-between items-end gap-4">
        {/* Bottom-Left: Syndicate Cash, Equipment Stats & Menu Shortcuts */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl text-slate-100 flex flex-col gap-2 min-w-[230px]">
          {/* Syndicate Cash */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-black text-base">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>${player.gold.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold tracking-wider bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
              SYNDICATE CASH
            </span>
          </div>

          {/* Weapon / Armor stats */}
          <div className="flex items-center justify-between text-xs text-slate-300 border-t border-slate-800 pt-1.5 font-mono">
            <span className="flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              <span>FIREPOWER: <strong className="text-white">{totalAttack}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>ARMOR: <strong className="text-white">{totalDefense}</strong></span>
            </span>
          </div>

          {/* Quick HUD Navigation Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              id="btn-hud-inv"
              onClick={onOpenInventory}
              className="flex-1 bg-slate-800/90 hover:bg-slate-750 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Backpack className="w-3.5 h-3.5 text-amber-400" />
              <span>[I] Dossier</span>
            </button>
            <button
              id="btn-hud-quests"
              onClick={onOpenQuests}
              className="flex-1 bg-slate-800/90 hover:bg-slate-750 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>[J] Contracts</span>
            </button>
          </div>
        </div>

        {/* Center: Radial Weapon Selector & Advancement Quick Card */}
        <div className="pointer-events-auto flex items-center gap-3">
          {equippedGun && (
            <div className="flex items-center gap-2.5">
              <button
                id="btn-hud-weapon-wheel"
                onClick={onOpenRadialWheel}
                className="bg-slate-900/90 hover:bg-slate-850 border border-amber-500/40 hover:border-amber-400 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-2xl transition hover:scale-105"
                title="Click to open Radial Weapon Selector (Q / Tab)"
              >
                <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                <div className="text-left">
                  <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1.5">
                    <span>ARSENAL</span>
                    <span className="text-slate-400">[TAB]</span>
                    <span className="text-yellow-300 font-black">
                      {'★'.repeat(equippedGun.tier || 1)}{'☆'.repeat(Math.max(0, 5 - (equippedGun.tier || 1)))}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{equippedGun.name}</span>
                    {isInfAmmo ? (
                      <span className="text-xs font-mono font-black text-amber-400 flex items-center gap-0.5">
                        <InfinityIcon className="w-3.5 h-3.5" /> / ∞
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-amber-300">
                        {equippedGun.currentMag} / {equippedGun.magSize}
                        <span className="text-slate-400 text-[10px] ml-1">
                          ({equippedGun.reserveAmmo})
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Quick Advance Button */}
              <button
                id="btn-hud-quick-advance"
                onClick={onOpenWeaponAdvancement}
                className="bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/50 rounded-2xl px-3.5 py-2.5 text-left text-amber-300 shadow-xl transition hover:scale-105"
                title="Evolve & advance this weapon (K)"
              >
                <div className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  <span>TIER {equippedGun.tier || 1}/5</span>
                </div>
                <div className="text-xs font-black text-slate-100 flex items-center gap-1">
                  <span>Evolve [K]</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Center / Tutorial Hints */}
        {showControls && (
          <div className="pointer-events-auto bg-slate-950/85 border border-amber-500/30 text-slate-300 text-xs px-4 py-2.5 rounded-2xl backdrop-blur-md hidden xl:flex items-center gap-3 shadow-xl">
            <span><kbd className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">WASD</kbd> Move Vince</span>
            <span><kbd className="bg-slate-800 text-rose-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">L-Click</kbd> Fire</span>
            <span><kbd className="bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">O</kbd> Auto-Aim</span>
            <span><kbd className="bg-slate-800 text-rose-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">P</kbd> Auto-Fire</span>
            <span><kbd className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">U</kbd> ∞ Ammo</span>
            <span><kbd className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">K</kbd> Evolve Gun</span>
            <span><kbd className="bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">Space</kbd> Tactical Roll</span>
            <span><kbd className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">TAB</kbd> Wheel</span>
            <span><kbd className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">B</kbd> Fronts</span>
            <span><kbd className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">H</kbd> Hack</span>
            <span><kbd className="bg-slate-800 text-purple-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700">V</kbd> Vehicle</span>
            <button
              onClick={() => setShowControls(false)}
              className="text-slate-500 hover:text-slate-300 ml-1 text-xs"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


