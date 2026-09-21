/**
 * Vice Syndicate: Mafia Underworld - Keyboard Shortcuts & Keybindings Reference Modal
 */
import React from 'react';
import { 
  Keyboard, 
  X, 
  Crosshair, 
  Flame, 
  Infinity as InfinityIcon, 
  Sparkles, 
  Building2, 
  Zap, 
  Backpack, 
  BookOpen, 
  Save, 
  Volume2, 
  Smartphone, 
  Heart, 
  Car, 
  RotateCw, 
  Shield 
} from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="shortcuts-reference-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto select-none animate-in fade-in"
    >
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>Keyboard Shortcuts & Controls</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Quick Access
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Full keybinding cheat sheet for automated systems, combat, and colony logistics
              </p>
            </div>
          </div>

          <button
            id="btn-close-shortcuts"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Section 1: Combat & Arsenal */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
            <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800/80 pb-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              <span>Combat & Automation</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Auto-Shoot Toggle</span>
              </span>
              <kbd className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                P
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>Auto-Aim Proximity</span>
              </span>
              <kbd className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                O / Y
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300 flex items-center gap-1.5">
                <InfinityIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Infinite Ammo</span>
              </span>
              <kbd className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                U
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                <span>Reload Weapon</span>
              </span>
              <kbd className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                R
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300">Quick Weapon Select</span>
              <kbd className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                1 - 9, 0
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300">Radial Weapon Wheel</span>
              <kbd className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                G
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Tactical Dash / Roll</span>
              </span>
              <kbd className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                SPACE / SHIFT
              </kbd>
            </div>
          </div>

          {/* Section 2: Survival & Systems */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
            <div className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800/80 pb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Survival & Abilities</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Quick Heal (Potion/Herb)</span>
              </span>
              <kbd className="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                Q
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Evolution Foundry</span>
              </span>
              <kbd className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                K
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cyber-Hacking Deck</span>
              </span>
              <kbd className="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                H
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-sky-400" />
                <span>Mount / Exit Vehicle</span>
              </span>
              <kbd className="bg-slate-800 text-sky-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                V / F
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300">Interact (NPC / Chest)</span>
              <kbd className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                E
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-300">Movement</span>
              <kbd className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                W / A / S / D
              </kbd>
            </div>
          </div>

          {/* Section 3: Management & Toggles */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
            <div className="text-sky-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800/80 pb-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Base, UI & System</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Colony & Factory Grid</span>
              </span>
              <kbd className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                B / C
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Backpack className="w-3.5 h-3.5 text-amber-400" />
                <span>Inventory & Bag</span>
              </span>
              <kbd className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                I / TAB
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>Quest Journal</span>
              </span>
              <kbd className="bg-slate-800 text-sky-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                J / L
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quick Save Progress</span>
              </span>
              <kbd className="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                F5 / F9
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mute / Unmute Audio</span>
              </span>
              <kbd className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                M
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-sky-300" />
                <span>Toggle Touchscreen HUD</span>
              </span>
              <kbd className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                T
              </kbd>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-300">Pause / Close Modals</span>
              <kbd className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                ESC
              </kbd>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span>Press <kbd className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono">?</kbd> or <kbd className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono">/</kbd> anytime to open this guide</span>
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
