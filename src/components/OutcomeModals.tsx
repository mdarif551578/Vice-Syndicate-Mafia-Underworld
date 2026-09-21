/**
 * Vice Syndicate: Mafia Underworld - Death & Victory Screens with Multi-District Respawn & Auto-Respawn Mechanism
 */
import React, { useState, useEffect } from 'react';
import { Skull, Trophy, RotateCcw, MapPin, Sparkles, Timer } from 'lucide-react';
import { RESPAWN_LOCATIONS } from '../game/constants';
import { RespawnLocation } from '../types';

interface DeathModalProps {
  goldLost: number;
  onRespawn: (location?: RespawnLocation) => void;
}

export const DeathModal: React.FC<DeathModalProps> = ({ goldLost, onRespawn }) => {
  const [selectedLocation, setSelectedLocation] = useState<RespawnLocation>(RESPAWN_LOCATIONS[0]);
  const [countdown, setCountdown] = useState<number>(4);

  // Auto-respawn countdown mechanism
  useEffect(() => {
    if (countdown <= 0) {
      onRespawn(selectedLocation);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(c => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, selectedLocation, onRespawn]);

  const handleManualRespawn = () => {
    onRespawn(selectedLocation);
  };

  const handleRandomRespawn = () => {
    const randomLoc = RESPAWN_LOCATIONS[Math.floor(Math.random() * RESPAWN_LOCATIONS.length)];
    onRespawn(randomLoc);
  };

  return (
    <div
      id="death-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/85 backdrop-blur-md pointer-events-auto select-none"
    >
      <div className="w-full max-w-lg bg-slate-950 border-2 border-red-700/80 rounded-2xl shadow-2xl p-6 text-center text-slate-100 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-full bg-red-900/40 border-2 border-red-500 flex items-center justify-center shadow-lg shadow-red-900/50">
          <Skull className="w-7 h-7 text-red-500 animate-pulse" />
        </div>

        <div>
          <h2 className="text-3xl font-black tracking-widest text-red-500 font-mono">
            CRITICAL WOUNDS
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Underboss down! Syndicate medics are administering emergency resuscitation.
          </p>
        </div>

        {/* Gold Penalty & Auto Respawn Badge */}
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono">
          <span className="text-slate-400">Emergency Med Tribute:</span>
          <span className="text-red-400 font-bold">-{goldLost} Gold (10%)</span>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-lg">
            <Timer className="w-3.5 h-3.5 animate-spin" />
            <span>AUTO-RESPAWN IN {countdown}s</span>
          </div>
        </div>

        {/* Multi-Location Respawn Selector */}
        <div className="w-full text-left space-y-1.5">
          <div className="text-[10px] font-mono text-slate-400 font-bold tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3 text-sky-400" />
            SELECT RESPAWN SAFEHOUSE / EXTRACTION POINT:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {RESPAWN_LOCATIONS.map(loc => {
              const isSelected = selectedLocation.id === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`p-2.5 rounded-xl border text-left transition text-xs font-mono relative ${
                    isSelected
                      ? 'bg-sky-950/60 border-sky-400 text-sky-200 ring-1 ring-sky-400 shadow-md shadow-sky-950'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate text-[11px]">{loc.name}</span>
                    <span
                      className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0"
                      style={{ color: loc.color, backgroundColor: `${loc.color}20` }}
                    >
                      {loc.tag}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{loc.district}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Respawn Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-1">
          <button
            id="btn-respawn-now"
            onClick={handleManualRespawn}
            className="bg-red-600 hover:bg-red-500 text-white font-mono font-bold py-3 px-4 rounded-xl text-xs transition shadow-lg shadow-red-900/40 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Respawn at {selectedLocation.name}</span>
          </button>

          <button
            onClick={handleRandomRespawn}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Random Safehouse Extraction</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  stats: { level: number; gold: number; questsCompleted: number };
  onContinue: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ stats, onContinue }) => {
  return (
    <div
      id="victory-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md pointer-events-auto select-none"
    >
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl p-8 text-center text-slate-100 flex flex-col items-center gap-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-950">
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-widest text-amber-400 font-mono">
            DON MORETTI HAS FALLEN
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-md mx-auto font-sans">
            The rival syndicate lies defeated. The districts of Metropolis fly the Falcone banner, and your criminal syndicate reigns supreme.
          </p>
        </div>

        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs flex justify-around font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Underboss Level</span>
            <span className="text-lg font-bold text-amber-300">{stats.level}</span>
          </div>
          <div className="w-[1px] bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Syndicate Gold</span>
            <span className="text-lg font-bold text-amber-400">${stats.gold}</span>
          </div>
          <div className="w-[1px] bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Districts Conquered</span>
            <span className="text-lg font-bold text-emerald-400">{stats.questsCompleted} / 5</span>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs font-mono transition shadow-lg shadow-amber-950 flex items-center justify-center gap-2"
        >
          <span>Continue Endless Syndicate Expansion</span>
        </button>
      </div>
    </div>
  );
};
