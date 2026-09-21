/**
 * Ashen Road - RPG Dialogue Box
 */
import React from 'react';
import { NPC } from '../types';

interface DialogueBoxProps {
  npc: NPC;
  lineIndex: number;
  onAdvance: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ npc, lineIndex, onAdvance }) => {
  const currentLine = npc.dialogueSequence[lineIndex] || '...';
  const isLastLine = lineIndex >= npc.dialogueSequence.length - 1;

  return (
    <div id="dialogue-overlay" className="fixed inset-0 z-30 flex items-end justify-center p-6 bg-black/25 pointer-events-auto">
      <div className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-md border-2 border-amber-500/60 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-4">
        {/* Speaker Name & Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-amber-400">{npc.name}</span>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {npc.title}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {lineIndex + 1} / {npc.dialogueSequence.length}
          </span>
        </div>

        {/* Dialogue text */}
        <p className="text-base text-slate-200 leading-relaxed min-h-[48px]">
          "{currentLine}"
        </p>

        {/* Action Prompt */}
        <div className="flex justify-end pt-2">
          <button
            id="btn-dialogue-continue"
            onClick={onAdvance}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-sm transition shadow flex items-center gap-2"
          >
            <span>{isLastLine ? 'Close' : 'Continue'}</span>
            <kbd className="bg-amber-600/60 text-slate-950 px-1.5 py-0.5 rounded text-xs font-mono">
              [E]
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
