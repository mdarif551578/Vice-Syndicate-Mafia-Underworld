import React, { useEffect, useState } from 'react';
import { voiceNarrator, VoiceNarratorState } from '../audio/voiceNarrator';
import { Radio, Volume2, VolumeX, RotateCcw, X, MessageSquareQuote } from 'lucide-react';

export const RadioCommsOverlay: React.FC = () => {
  const [state, setState] = useState<VoiceNarratorState>(voiceNarrator.getState());
  const [minimized, setMinimized] = useState<boolean>(false);

  useEffect(() => {
    return voiceNarrator.subscribe(s => setState(s));
  }, []);

  const briefing = state.currentBriefing;
  if (!briefing) return null;

  return (
    <div
      id="radio-comms-hud-overlay"
      className={`fixed bottom-24 left-6 z-40 max-w-md w-full transition-all duration-300 pointer-events-auto select-none ${
        minimized ? 'opacity-80 translate-y-8' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="bg-slate-950/95 backdrop-blur-md border-2 border-amber-500/40 rounded-2xl p-4 shadow-2xl shadow-amber-950/40 relative overflow-hidden">
        {/* Gritty Radio Static Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40" />

        {/* Header: Radio Station & Controls */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-900/40 relative z-10">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
                <Radio className={`w-4 h-4 ${state.isPlaying ? 'animate-pulse text-amber-300' : ''}`} />
              </div>
              {state.isPlaying && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                <span>COMMS FREQUENCY 104.2 MHZ</span>
                {state.isPlaying ? (
                  <span className="bg-rose-950 text-rose-400 border border-rose-800 text-[8px] px-1.5 py-0.2 rounded font-mono">
                    LIVE DISPATCH
                  </span>
                ) : (
                  <span className="bg-slate-800 text-slate-400 text-[8px] px-1.5 py-0.2 rounded font-mono">
                    STANDBY
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-100 tracking-wide font-mono">
                {briefing.speaker.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => voiceNarrator.replayCurrent()}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition"
              title="Replay Voice Narrative [V]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => voiceNarrator.toggleMute()}
              className={`p-1.5 rounded-lg border transition ${
                state.isMuted
                  ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={state.isMuted ? 'Unmute Voice Narration' : 'Mute Voice'}
            >
              {state.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => voiceNarrator.stop()}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition"
              title="Dismiss Comms"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Audio Visualizer Waves when speaking */}
        {state.isPlaying && (
          <div className="flex items-center gap-1 mb-2 px-1 relative z-10 h-3">
            {[40, 75, 100, 60, 90, 45, 80, 65, 95, 50, 70, 85, 55, 30].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-amber-400/80 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.3 + (i % 4) * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Written Briefing Explanation & Title */}
        <div className="relative z-10">
          <div className="text-[11px] font-bold text-amber-300 font-mono tracking-wider mb-1 flex items-center gap-1.5">
            <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400" />
            {briefing.title}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80">
            {briefing.writtenText}
          </p>
        </div>
      </div>
    </div>
  );
};
