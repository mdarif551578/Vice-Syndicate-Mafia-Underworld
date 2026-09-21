/**
 * Vice Syndicate: Mafia Underworld - Title Screen & Main Menu
 */
import React, { useState } from 'react';
import { Play, HelpCircle, Shield, Volume2, AlertTriangle, Trash2, MapPin, Crosshair, Award, Radio } from 'lucide-react';
import { hasSavedGame, loadGame } from '../game/saveManager';

interface MainMenuProps {
  onNewGame: () => void;
  onContinueGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onContinueGame }) => {
  const [showControls, setShowControls] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const canContinue = hasSavedGame();
  const savedData = canContinue ? loadGame() : null;

  const handleConfirmedReset = () => {
    if (confirmText.trim().toUpperCase() !== 'RESET') return;
    if (window.confirm('CRITICAL CONFIRMATION: Are you 100% sure you want to permanently wipe your Syndicate empire save and start from scratch? This cannot be undone.')) {
      onNewGame();
    }
  };

  return (
    <div id="main-menu-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gradient-to-b from-zinc-950 via-slate-950 to-zinc-950 text-slate-100 select-none">
      {/* City skyline atmosphere & crime grid overlay */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

      <div className="w-full max-w-lg flex flex-col items-center gap-7 relative z-10">
        {/* Syndicate Brand & Title */}
        <div className="text-center flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-amber-600/10 border-2 border-amber-500/50 flex items-center justify-center shadow-2xl shadow-amber-500/20">
              <Crosshair className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
              18+
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-px w-8 bg-amber-500/50" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400">
              Open-World Crime Simulator
            </span>
            <span className="h-px w-8 bg-amber-500/50" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 font-serif drop-shadow-md">
            VICE SYNDICATE
          </h1>
          <h2 className="text-lg md:text-xl font-bold tracking-[0.2em] text-slate-300 uppercase mt-0.5">
            Mafia Underworld
          </h2>

          <p className="text-xs text-slate-400 tracking-wide mt-2 max-w-sm">
            Seize control of Downtown, Chinatown, Waterfront & Industrial territories from rival crime families.
          </p>

          <div className="flex items-center gap-2 mt-2.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Tactical Voice Comms & Dynamic Synthwave Audio</span>
          </div>
        </div>

        {/* Territory Quick Status Cards */}
        <div className="w-full grid grid-cols-4 gap-2 text-center text-[10px]">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex flex-col items-center">
            <span className="text-slate-400 font-bold">Downtown</span>
            <span className="text-amber-400 font-mono font-bold mt-0.5">Turf War</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex flex-col items-center">
            <span className="text-slate-400 font-bold">Waterfront</span>
            <span className="text-sky-400 font-mono font-bold mt-0.5">Smuggling</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex flex-col items-center">
            <span className="text-slate-400 font-bold">Chinatown</span>
            <span className="text-rose-400 font-mono font-bold mt-0.5">Gambling</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex flex-col items-center">
            <span className="text-slate-400 font-bold">Industrial</span>
            <span className="text-purple-400 font-mono font-bold mt-0.5">Weapons</span>
          </div>
        </div>

        {/* Menu Actions */}
        <div className="w-full flex flex-col gap-3">
          <button
            id="btn-menu-resume"
            onClick={onContinueGame}
            className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-4 rounded-xl text-base transition shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transform active:scale-[0.99] border border-amber-300/40"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>RESUME SYNDICATE EMPIRE</span>
            {savedData && (
              <span className="ml-1 text-xs bg-slate-950/25 text-slate-950 px-2.5 py-0.5 rounded font-mono font-black">
                LVL {savedData.player.level} • ${savedData.player.gold}
              </span>
            )}
          </button>

          <button
            id="btn-menu-controls"
            onClick={() => setShowControls(true)}
            className="w-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold py-3.5 rounded-xl text-sm transition border border-slate-700/80 flex items-center justify-center gap-2 shadow"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Syndicate Dossier: Keybindings & Controls [?]</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 text-center flex items-center gap-2">
          <span>Driveable Muscle Cars & Speedboats</span>
          <span>•</span>
          <span>Automatic Cloud/Local Persistence</span>
        </div>
      </div>

      {/* Controls & Deep Danger Zone Modal */}
      {showControls && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-lg font-bold text-amber-400">
                Controls & Shortcuts Guide
              </h3>
              <span className="text-xs text-slate-400">Press ? anytime in-game</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Move Kael</span>
                <kbd className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">W A S D</kbd>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Auto-Shoot Toggle</span>
                <kbd className="bg-slate-800 text-rose-400 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">P</kbd>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Auto-Aim Proximity</span>
                <kbd className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">O / Y</kbd>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Infinite Ammo Toggle</span>
                <kbd className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">U</kbd>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Quick Heal Potion</span>
                <kbd className="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">Q</kbd>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Weapon Evolution</span>
                <kbd className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">K</kbd>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Colony & Factory</span>
                <kbd className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">B</kbd>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Cyber Hacking</span>
                <kbd className="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">H</kbd>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Mount/Exit Vehicle</span>
                <kbd className="bg-slate-800 text-sky-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">V / F</kbd>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Quick Save Progress</span>
                <kbd className="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">F5</kbd>
              </div>
            </div>

            {/* Hidden Deep: Reset Save Danger Zone */}
            <div className="mt-3 border border-rose-900/40 rounded-xl bg-rose-950/20 p-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowDangerZone(!showDangerZone)}
                className="text-left text-xs font-bold text-rose-400 flex items-center justify-between hover:text-rose-300"
              >
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Advanced Danger Zone (Save Reset Protection)</span>
                </span>
                <span className="text-[10px] text-slate-500">{showDangerZone ? 'Hide' : 'Expand'}</span>
              </button>

              {showDangerZone && (
                <div className="flex flex-col gap-2 pt-2 border-t border-rose-900/30 text-xs text-rose-200/90">
                  <p className="text-[11px] leading-relaxed text-rose-300/80">
                    Your game progress auto-saves continuously. To prevent accidental data loss, resetting requires typing <strong>RESET</strong> below.
                  </p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder='Type "RESET" to confirm'
                      value={confirmText}
                      onChange={e => setConfirmText(e.target.value)}
                      className="bg-slate-950 border border-rose-800/60 rounded px-2.5 py-1 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 flex-1"
                    />
                    <button
                      type="button"
                      disabled={confirmText.trim().toUpperCase() !== 'RESET'}
                      onClick={handleConfirmedReset}
                      className="bg-rose-700 hover:bg-rose-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold px-3 py-1 rounded text-xs transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Erase Save</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowControls(false)}
              className="mt-2 w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

