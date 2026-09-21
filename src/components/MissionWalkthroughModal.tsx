import React, { useState } from 'react';
import { voiceNarrator } from '../audio/voiceNarrator';
import { MISSION_BRIEFINGS, MISSION_WALKTHROUGH_STEPS } from '../game/missionNarratives';
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  ShieldAlert,
  Crosshair,
  MapPin,
  Car,
  X,
  Radio,
  Sparkles,
} from 'lucide-react';
import { Quest } from '../types';

interface MissionWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
}

export const MissionWalkthroughModal: React.FC<MissionWalkthroughModalProps> = ({
  isOpen,
  onClose,
  quests,
}) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'tactics' | 'territory'>('missions');

  if (!isOpen) return null;

  return (
    <div
      id="mission-walkthrough-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none"
    >
      <div className="bg-slate-950 border-2 border-amber-500/50 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl shadow-amber-950/50 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900/90 border-b border-amber-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wider flex items-center gap-2">
                SYNDICATE OPERATIONS & MISSION INTEL
                <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-mono">
                  VOICE DISPATCH ENABLED
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Tactical Walkthroughs, District Conquest Strategy & Audio Briefings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 px-4">
          <button
            onClick={() => setActiveTab('missions')}
            className={`py-3 px-4 text-xs font-mono font-bold tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === 'missions'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            CAMPAIGN MISSIONS
          </button>
          <button
            onClick={() => setActiveTab('tactics')}
            className={`py-3 px-4 text-xs font-mono font-bold tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === 'tactics'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            TACTICAL SYSTEMS & CONTROLS
          </button>
          <button
            onClick={() => setActiveTab('territory')}
            className={`py-3 px-4 text-xs font-mono font-bold tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === 'territory'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            TERRITORY CONQUEST
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'missions' && (
            <div className="space-y-4">
              {quests.map(q => {
                const briefingKey = `q${q.id.replace('q', '')}`;
                const briefing = MISSION_BRIEFINGS[briefingKey];

                return (
                  <div
                    key={q.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 hover:border-amber-500/40 transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/80 font-bold">
                            OPERATION {q.id.toUpperCase()}
                          </span>
                          {q.isCompleted && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              COMPLETED
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-100 font-mono">{q.title}</h3>
                      </div>

                      {briefing && (
                        <button
                          onClick={() => voiceNarrator.narrate(briefing, true)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-300 hover:bg-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition shrink-0"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          PLAY VOICE BRIEFING
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{q.description}</p>

                    {/* Step Walkthrough */}
                    <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800/80 space-y-1 text-xs">
                      <div className="text-[10px] font-mono text-amber-400 font-bold tracking-wider">
                        TACTICAL WALKTHROUGH:
                      </div>
                      <div className="text-slate-300">
                        • Objective: {q.targetCount ? `Eliminate targets [${q.currentCount}/${q.targetCount}]` : 'Complete syndicate objective'}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        • Reward: +{q.rewardXp} XP, +${q.rewardGold} Gold, Territory Influence Boost
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'tactics' && (
            <div className="space-y-4">
              {MISSION_WALKTHROUGH_STEPS.map(step => (
                <div
                  key={step.stepNumber}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 hover:border-sky-500/40 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-400 text-xs font-mono font-bold flex items-center justify-center">
                        {step.stepNumber}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100 font-mono">{step.title}</h3>
                    </div>

                    <button
                      onClick={() =>
                        voiceNarrator.narrate(
                          {
                            id: `step_${step.stepNumber}`,
                            speaker: 'Tactical Radio Dispatch',
                            role: 'Combat Specialist',
                            title: step.title.toUpperCase(),
                            audioText: step.audioText,
                            writtenText: step.content,
                          },
                          true
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-sky-500/20 border border-sky-400/50 text-sky-300 hover:bg-sky-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      PLAY VOICE GUIDE
                    </button>
                  </div>

                  <div className="whitespace-pre-line text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    {step.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'territory' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  TERRITORY CONQUEST RULES & BENEFITS
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Metropolis is partitioned into 5 key crime sectors. Eliminating hostile enforcers and bosses in each district increases Falcone Family Influence. Upon reaching 100%, the district turns <strong className="text-emerald-400">Emerald Green</strong>, spawning friendly Falcone patrol guards and granting passive tribute gold!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-3 space-y-1">
                  <div className="text-emerald-400 font-bold">1. LITTLE ITALY (HOME BASE)</div>
                  <div className="text-slate-400 text-[11px]">Falcone Manor & Safehouse. Guaranteed friendly sanctuary.</div>
                </div>
                <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-3 space-y-1">
                  <div className="text-rose-400 font-bold">2. DOWNTOWN FINANCIAL</div>
                  <div className="text-slate-400 text-[11px]">Moretti Mob stronghold. High-value bank vaults and armored enforcers.</div>
                </div>
                <div className="bg-slate-900/80 border border-sky-500/30 rounded-xl p-3 space-y-1">
                  <div className="text-sky-400 font-bold">3. WATERFRONT PORT</div>
                  <div className="text-slate-400 text-[11px]">Bratva Cartel shipping yards. Weapon supply drops & container docks.</div>
                </div>
                <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-3 space-y-1">
                  <div className="text-purple-400 font-bold">4. NEON STRIP</div>
                  <div className="text-slate-400 text-[11px]">Yakuza Clan gambling strip. High-tech cybernetics and fast sports cars.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Press [M] anytime in-game to reopen this Syndicate Intelligence Guide
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-mono font-bold text-xs hover:bg-amber-400 transition"
          >
            RETURN TO BATTLE [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
