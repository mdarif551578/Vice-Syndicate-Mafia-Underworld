/**
 * Ashen Road - Radial Weapon Selector Wheel
 * Makes weapon switching intuitive, fast, and accessible for mouse, keyboard, and touch
 */
import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { Gun } from '../types';
import { soundManager } from '../audio/soundManager';
import { X, Zap, Shield, Target, Flame, Snowflake, Disc, Radio } from 'lucide-react';

interface RadialWeaponWheelProps {
  engine: GameEngine;
  onClose: () => void;
  onSelectGun: (index: number) => void;
}

export const RadialWeaponWheel: React.FC<RadialWeaponWheelProps> = ({
  engine,
  onClose,
  onSelectGun,
}) => {
  const p = engine.player;
  const guns: Gun[] = p.unlockedGuns || [];
  const selectedIdx = p.selectedGunIndex || 0;
  const currentGun = guns[selectedIdx];

  const totalGuns = guns.length;
  const radius = 140; // Pixel radius for circle arrangement

  const getWeaponIcon = (gunId: string) => {
    switch (gunId) {
      case 'laser': return <Zap className="w-5 h-5 text-sky-400" />;
      case 'flamethrower': return <Flame className="w-5 h-5 text-orange-400" />;
      case 'cryo': return <Snowflake className="w-5 h-5 text-cyan-400" />;
      case 'tesla': return <Zap className="w-5 h-5 text-yellow-300" />;
      case 'sawblade': return <Disc className="w-5 h-5 text-emerald-400" />;
      case 'orbital': return <Radio className="w-5 h-5 text-purple-400" />;
      default: return <Target className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div
      id="radial-weapon-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-[380px] h-[380px] rounded-full border-2 border-slate-700/80 bg-slate-900/90 shadow-2xl flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Center Weapon Details Card */}
        <div className="w-36 h-36 rounded-full bg-slate-950 border border-sky-500/50 flex flex-col items-center justify-center text-center p-2 shadow-inner z-10">
          <span className="text-[10px] text-sky-400 font-mono uppercase tracking-widest mb-0.5">
            Equipped
          </span>
          <span className="text-xs font-bold text-slate-100 truncate max-w-[120px]">
            {currentGun?.name || 'Unarmed'}
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-400 font-mono">
            <span>{currentGun?.currentMag}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{currentGun?.magSize}</span>
            <span className="text-[9px] text-slate-500">({currentGun?.reserveAmmo})</span>
          </div>
          <span className="text-[9px] text-slate-400 mt-0.5 font-sans">
            DMG: {currentGun?.damage}
          </span>
        </div>

        {/* Close button in top-right */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Radial Weapon Slots */}
        {guns.map((gun, idx) => {
          const angle = (idx / totalGuns) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isSelected = idx === selectedIdx;

          return (
            <button
              key={gun.id}
              id={`radial-slot-${idx}`}
              onClick={() => {
                onSelectGun(idx);
                soundManager.playEquipGun();
                onClose();
              }}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              className={`absolute w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-150 shadow-xl border ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-300 scale-110 ring-4 ring-sky-400/30'
                  : 'bg-slate-800/90 text-slate-300 border-slate-600 hover:bg-slate-700 hover:scale-105'
              }`}
            >
              <div className="mb-0.5">{getWeaponIcon(gun.id)}</div>
              <span className="text-[9px] font-bold truncate max-w-[46px] leading-tight">
                {gun.name.split(' ')[0]}
              </span>
              <span className="text-[8px] font-mono text-slate-400">
                {gun.currentMag}/{gun.magSize}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
