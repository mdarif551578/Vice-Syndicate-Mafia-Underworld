/**
 * Ashen Road - Pause Menu Modal
 */
import React from 'react';
import { Play, Backpack, BookOpen, Save, LogOut, Keyboard } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onOpenInventory: () => void;
  onOpenQuests: () => void;
  onSaveGame: () => void;
  onQuitToTitle: () => void;
  onOpenShortcuts?: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onOpenInventory,
  onOpenQuests,
  onSaveGame,
  onQuitToTitle,
  onOpenShortcuts,
}) => {
  return (
    <div id="pause-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md pointer-events-auto select-none">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col items-center gap-5">
        <div className="text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500 mb-1">
            Open-World Crime Simulator
          </div>
          <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 font-serif">
            VICE SYNDICATE
          </h2>
          <span className="text-xs text-slate-400 uppercase tracking-widest block mt-0.5">
            Mafia Underworld • Tactical Pause
          </span>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <button
            id="btn-pause-resume"
            onClick={onResume}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition shadow flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Resume Game [ESC]</span>
          </button>

          <button
            id="btn-pause-shortcuts"
            onClick={onOpenShortcuts}
            className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold py-2.5 rounded-xl text-sm transition border border-amber-500/30 flex items-center justify-center gap-2"
          >
            <Keyboard className="w-4 h-4 text-amber-400" />
            <span>Keyboard Shortcuts [?]</span>
          </button>

          <button
            id="btn-pause-inventory"
            onClick={onOpenInventory}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-2.5 rounded-xl text-sm transition border border-slate-700 flex items-center justify-center gap-2"
          >
            <Backpack className="w-4 h-4 text-amber-400" />
            <span>Inventory & Gear [I]</span>
          </button>

          <button
            id="btn-pause-quests"
            onClick={onOpenQuests}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-2.5 rounded-xl text-sm transition border border-slate-700 flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Quest Journal [J]</span>
          </button>

          <button
            id="btn-pause-save"
            onClick={onSaveGame}
            className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold py-2.5 rounded-xl text-sm transition border border-emerald-500/30 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save Game [F5]</span>
          </button>

          <button
            id="btn-pause-quit"
            onClick={onQuitToTitle}
            className="w-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-medium py-2 rounded-xl text-xs transition border border-slate-800 flex items-center justify-center gap-2 mt-2"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Save & Return to Title</span>
          </button>
        </div>
      </div>
    </div>
  );
};
