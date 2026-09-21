/**
 * Ashen Road - Quest Journal Modal
 */
import React from 'react';
import { Quest } from '../types';
import { BookOpen, CheckCircle2, Circle, X, Award, Coins } from 'lucide-react';

interface QuestModalProps {
  quests: Quest[];
  onClose: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({ quests, onClose }) => {
  return (
    <div id="quest-overlay" className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-6 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-sky-400" />
            <div>
              <h2 className="text-xl font-bold tracking-wide text-amber-400">Syndicate Contracts & Operations</h2>
              <span className="text-xs text-slate-400">Track your underworld operations and territory conquest across Vice Syndicate</span>
            </div>
          </div>
          <button
            id="btn-close-quests"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quest List */}
        <div className="overflow-y-auto pr-1 flex flex-col gap-4">
          {quests.map(quest => {
            const isActive = quest.status === 'ACTIVE';
            const isCompleted = quest.status === 'COMPLETED';
            const isNotStarted = quest.status === 'NOT_STARTED';

            return (
              <div
                key={quest.id}
                className={`border rounded-xl p-4 transition ${
                  isActive
                    ? 'border-amber-500/60 bg-amber-500/5'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/5 opacity-85'
                    : 'border-slate-800 bg-slate-950/40 opacity-50'
                }`}
              >
                {/* Title & Status Badge */}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block mb-0.5">
                      Main Quest
                    </span>
                    <h3 className="font-bold text-base text-slate-100">{quest.title}</h3>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isActive ? '[ACTIVE]' : isCompleted ? '[COMPLETED]' : '[LOCKED]'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {quest.description}
                </p>

                {/* Objectives */}
                <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 mb-3 flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Objectives:
                  </span>
                  {quest.objectives.map((obj, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-200">
                        {obj.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500" />
                        )}
                        <span className={obj.completed ? 'line-through text-slate-400' : ''}>
                          {obj.text}
                        </span>
                      </span>
                      <span className="font-mono text-xs text-amber-300 font-bold">
                        {obj.current} / {obj.required}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rewards */}
                <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800/60 pt-2">
                  <span className="font-medium text-slate-300">Rewards:</span>
                  <span className="flex items-center gap-1 text-sky-400">
                    <Award className="w-3.5 h-3.5" />
                    <strong>{quest.rewards.xp} XP</strong>
                  </span>
                  {quest.rewards.gold > 0 && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Coins className="w-3.5 h-3.5" />
                      <strong>{quest.rewards.gold} Gold</strong>
                    </span>
                  )}
                  {quest.rewards.itemId && (
                    <span className="text-emerald-400">
                      Item: <strong>{quest.rewards.itemId.replace('_', ' ')}</strong>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
