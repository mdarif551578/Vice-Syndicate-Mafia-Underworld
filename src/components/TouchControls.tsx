/**
 * Ashen Road - Mobile & Touchscreen Virtual Controls Component
 * Provides dual-stick touch controls (Movement + Aim/Fire) and action buttons
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GameEngine } from '../game/gameEngine';
import { 
  Crosshair, 
  Wind, 
  RotateCw, 
  Hand, 
  Radio, 
  Zap, 
  Building2, 
  Car,
  ChevronDown,
  ChevronUp,
  Flame
} from 'lucide-react';

interface TouchControlsProps {
  engine: GameEngine;
  onOpenRadialWheel: () => void;
  onOpenColony: () => void;
  onOpenHacking: () => void;
  onTriggerStateUpdate: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  engine,
  onOpenRadialWheel,
  onOpenColony,
  onOpenHacking,
  onTriggerStateUpdate,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const leftStickRef = useRef<HTMLDivElement>(null);
  const rightStickRef = useRef<HTMLDivElement>(null);

  // Left joystick touch tracking
  const [leftStickPos, setLeftStickPos] = useState({ x: 0, y: 0, active: false });
  const leftTouchId = useRef<number | null>(null);
  const leftCenter = useRef({ x: 0, y: 0 });

  // Right aim joystick touch tracking
  const [rightStickPos, setRightStickPos] = useState({ x: 0, y: 0, active: false });
  const rightTouchId = useRef<number | null>(null);
  const rightCenter = useRef({ x: 0, y: 0 });

  // Handle Left Stick (Movement)
  const handleLeftTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (!touch || !leftStickRef.current) return;
    leftTouchId.current = touch.identifier;

    const rect = leftStickRef.current.getBoundingClientRect();
    leftCenter.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const dx = touch.clientX - leftCenter.current.x;
    const dy = touch.clientY - leftCenter.current.y;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2;
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const normX = clampedDist > 5 ? Math.cos(angle) * (clampedDist / maxRadius) : 0;
    const normY = clampedDist > 5 ? Math.sin(angle) * (clampedDist / maxRadius) : 0;

    setLeftStickPos({ x: normX * 36, y: normY * 36, active: true });
    engine.setTouchMovement(normX, normY, true);
  }, [engine]);

  const handleLeftTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (leftTouchId.current === null || !leftStickRef.current) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === leftTouchId.current) {
        const rect = leftStickRef.current.getBoundingClientRect();
        const maxRadius = rect.width / 2;
        const dx = touch.clientX - leftCenter.current.x;
        const dy = touch.clientY - leftCenter.current.y;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, maxRadius);
        const angle = Math.atan2(dy, dx);
        const normX = clampedDist > 5 ? Math.cos(angle) * (clampedDist / maxRadius) : 0;
        const normY = clampedDist > 5 ? Math.sin(angle) * (clampedDist / maxRadius) : 0;

        setLeftStickPos({ x: normX * 36, y: normY * 36, active: true });
        engine.setTouchMovement(normX, normY, true);
        break;
      }
    }
  }, [engine]);

  const handleLeftTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (leftTouchId.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === leftTouchId.current) {
        leftTouchId.current = null;
        setLeftStickPos({ x: 0, y: 0, active: false });
        engine.setTouchMovement(0, 0, false);
        break;
      }
    }
  }, [engine]);

  // Handle Right Stick (Aim & Fire)
  const handleRightTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (!touch || !rightStickRef.current) return;
    rightTouchId.current = touch.identifier;

    const rect = rightStickRef.current.getBoundingClientRect();
    rightCenter.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const dx = touch.clientX - rightCenter.current.x;
    const dy = touch.clientY - rightCenter.current.y;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2;
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const normX = clampedDist > 5 ? Math.cos(angle) * (clampedDist / maxRadius) : 0;
    const normY = clampedDist > 5 ? Math.sin(angle) * (clampedDist / maxRadius) : 0;

    setRightStickPos({ x: normX * 36, y: normY * 36, active: true });
    engine.setTouchAim(angle, true);
    engine.setTouchShooting(true);
  }, [engine]);

  const handleRightTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (rightTouchId.current === null || !rightStickRef.current) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === rightTouchId.current) {
        const rect = rightStickRef.current.getBoundingClientRect();
        const maxRadius = rect.width / 2;
        const dx = touch.clientX - rightCenter.current.x;
        const dy = touch.clientY - rightCenter.current.y;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, maxRadius);
        const angle = Math.atan2(dy, dx);
        const normX = clampedDist > 5 ? Math.cos(angle) * (clampedDist / maxRadius) : 0;
        const normY = clampedDist > 5 ? Math.sin(angle) * (clampedDist / maxRadius) : 0;

        setRightStickPos({ x: normX * 36, y: normY * 36, active: true });
        engine.setTouchAim(angle, true);
        break;
      }
    }
  }, [engine]);

  const handleRightTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (rightTouchId.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === rightTouchId.current) {
        rightTouchId.current = null;
        setRightStickPos({ x: 0, y: 0, active: false });
        engine.setTouchAim(0, false);
        engine.setTouchShooting(false);
        break;
      }
    }
  }, [engine]);

  // Clean up touches on unmount
  useEffect(() => {
    return () => {
      engine.setTouchMovement(0, 0, false);
      engine.setTouchAim(0, false);
      engine.setTouchShooting(false);
    };
  }, [engine]);

  const p = engine.player;
  const isVehicleMounted = !!p.mountedVehicle;

  return (
    <div id="touch-controls-overlay" className="pointer-events-none absolute inset-0 select-none z-30 flex flex-col justify-end">
      {/* Top Floating Mobile Action Bar (Collapsible) */}
      <div className="absolute top-20 right-4 pointer-events-auto flex flex-col items-end gap-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="bg-slate-900/80 hover:bg-slate-800 text-sky-400 border border-sky-500/30 px-2.5 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg backdrop-blur-md"
        >
          <span>Tactical Bar</span>
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        {!collapsed && (
          <div className="flex flex-col gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 p-2 rounded-2xl shadow-2xl">
            {/* Radial Weapon Wheel */}
            <button
              id="touch-btn-wheel"
              onClick={onOpenRadialWheel}
              className="bg-slate-800 hover:bg-slate-700 active:bg-sky-600 text-slate-100 p-2.5 rounded-xl border border-slate-600 shadow flex items-center gap-2 text-xs font-semibold transition"
              title="Radial Weapon Wheel (Q)"
            >
              <Radio className="w-4 h-4 text-sky-400" />
              <span>Guns Wheel</span>
            </button>

            {/* Cyber Hacking Terminal */}
            <button
              id="touch-btn-hack"
              onClick={onOpenHacking}
              className="bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-100 p-2.5 rounded-xl border border-slate-600 shadow flex items-center gap-2 text-xs font-semibold transition"
              title="Cyber Hack (H)"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Cyber Hack</span>
            </button>

            {/* Factory & Colony Builder */}
            <button
              id="touch-btn-colony"
              onClick={onOpenColony}
              className="bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-slate-100 p-2.5 rounded-xl border border-slate-600 shadow flex items-center gap-2 text-xs font-semibold transition"
              title="Colony Building (B)"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Colony & Build</span>
            </button>

            {/* Auto-Aim Proximity Toggle */}
            <button
              id="touch-btn-autoaim"
              onClick={() => {
                engine.toggleAutoAim();
                onTriggerStateUpdate();
              }}
              className={`p-2.5 rounded-xl border shadow flex items-center gap-2 text-xs font-bold transition ${
                engine.player.autoAim
                  ? 'bg-cyan-600 active:bg-cyan-500 text-white border-cyan-300 shadow-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-600'
              }`}
              title="Toggle Auto-Aim upon enemy proximity"
            >
              <Crosshair className="w-4 h-4 text-cyan-200" />
              <span>{engine.player.autoAim ? 'Auto-Aim ON' : 'Aim OFF'}</span>
            </button>

            {/* Auto-Shoot Proximity Toggle */}
            <button
              id="touch-btn-autoshoot"
              onClick={() => {
                engine.toggleAutoShoot();
                onTriggerStateUpdate();
              }}
              className={`p-2.5 rounded-xl border shadow flex items-center gap-2 text-xs font-bold transition ${
                engine.player.autoShoot
                  ? 'bg-rose-600 active:bg-rose-500 text-white border-rose-300 shadow-rose-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-600'
              }`}
              title="Toggle Auto-Fire upon enemy in range"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>{engine.player.autoShoot ? 'Auto-Fire ON' : 'Fire OFF'}</span>
            </button>

            {/* Vehicle Mount / Exit */}
            <button
              id="touch-btn-vehicle"
              onClick={() => {
                engine.toggleMountVehicle();
                onTriggerStateUpdate();
              }}
              className={`p-2.5 rounded-xl border shadow flex items-center gap-2 text-xs font-semibold transition ${
                isVehicleMounted 
                  ? 'bg-rose-900/80 hover:bg-rose-800 text-rose-200 border-rose-500' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600'
              }`}
              title="Board or Dismount Vehicle (V)"
            >
              <Car className={`w-4 h-4 ${isVehicleMounted ? 'text-rose-400' : 'text-purple-400'}`} />
              <span>{isVehicleMounted ? 'Exit Vehicle' : 'Board Vehicle'}</span>
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS ROW: Dual Joysticks & Action Cluster */}
      <div className="pointer-events-auto w-full p-4 pb-6 flex items-end justify-between">
        {/* Left Side: Virtual Movement Joystick */}
        <div className="flex flex-col items-center gap-2">
          <div
            ref={leftStickRef}
            id="touch-left-joystick"
            onTouchStart={handleLeftTouchStart}
            onTouchMove={handleLeftTouchMove}
            onTouchEnd={handleLeftTouchEnd}
            onTouchCancel={handleLeftTouchEnd}
            className="relative w-32 h-32 rounded-full bg-slate-900/60 border-2 border-sky-500/40 backdrop-blur-md flex items-center justify-center shadow-2xl touch-none"
          >
            {/* Center Thumb Knob */}
            <div
              className="w-14 h-14 rounded-full bg-sky-500/80 border-2 border-white/60 shadow-lg transition-transform pointer-events-none flex items-center justify-center text-white"
              style={{
                transform: `translate(${leftStickPos.x}px, ${leftStickPos.y}px)`,
              }}
            >
              <span className="text-[10px] font-bold tracking-tight">MOVE</span>
            </div>
          </div>
          <span className="text-[10px] text-sky-400/80 font-mono">MOVEMENT STICK</span>
        </div>

        {/* Right Side: Dual Control Cluster (Aim Stick + Action Buttons) */}
        <div className="flex items-end gap-3">
          {/* Action Buttons Column */}
          <div className="flex flex-col gap-2.5 mb-1">
            {/* Quick Interact [E] */}
            <button
              id="touch-btn-interact"
              onClick={() => {
                engine.handleInteraction();
                onTriggerStateUpdate();
              }}
              className="w-13 h-13 rounded-full bg-emerald-700 active:bg-emerald-500 text-white font-bold shadow-xl border-2 border-emerald-400 flex flex-col items-center justify-center transition active:scale-95"
              title="Interact / Loot (E)"
            >
              <Hand className="w-5 h-5 text-white" />
              <span className="text-[9px] font-mono leading-none">LOOT</span>
            </button>

            {/* Tactical Dash */}
            <button
              id="touch-btn-dash"
              onClick={() => {
                engine.executeDash();
                onTriggerStateUpdate();
              }}
              className="w-13 h-13 rounded-full bg-sky-700 active:bg-sky-500 text-white font-bold shadow-xl border-2 border-sky-400 flex flex-col items-center justify-center transition active:scale-95"
              title="Tactical Dash (Space / Right-Click)"
            >
              <Wind className="w-5 h-5 text-white" />
              <span className="text-[9px] font-mono leading-none">DASH</span>
            </button>

            {/* Quick Reload */}
            <button
              id="touch-btn-reload"
              onClick={() => {
                engine.reloadCurrentGun();
                onTriggerStateUpdate();
              }}
              className="w-13 h-13 rounded-full bg-amber-700 active:bg-amber-500 text-white font-bold shadow-xl border-2 border-amber-400 flex flex-col items-center justify-center transition active:scale-95"
              title="Reload Weapon (R)"
            >
              <RotateCw className="w-5 h-5 text-white" />
              <span className="text-[9px] font-mono leading-none">RELOAD</span>
            </button>
          </div>

          {/* Right Side: Aim & Fire Joystick */}
          <div className="flex flex-col items-center gap-2">
            <div
              ref={rightStickRef}
              id="touch-right-joystick"
              onTouchStart={handleRightTouchStart}
              onTouchMove={handleRightTouchMove}
              onTouchEnd={handleRightTouchEnd}
              onTouchCancel={handleRightTouchEnd}
              className="relative w-36 h-36 rounded-full bg-rose-950/60 border-2 border-rose-500/50 backdrop-blur-md flex items-center justify-center shadow-2xl touch-none"
            >
              {/* Center Aim Thumb Knob */}
              <div
                className="w-16 h-16 rounded-full bg-rose-600/90 border-2 border-white/80 shadow-lg transition-transform pointer-events-none flex flex-col items-center justify-center text-white"
                style={{
                  transform: `translate(${rightStickPos.x}px, ${rightStickPos.y}px)`,
                }}
              >
                <Crosshair className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-bold tracking-tight">AIM/FIRE</span>
              </div>
            </div>
            <span className="text-[10px] text-rose-400/80 font-mono">AIM & SHOOT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
