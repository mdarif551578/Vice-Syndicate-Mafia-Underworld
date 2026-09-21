/**
 * Ashen Road - Game Canvas Component
 * Manages requestAnimationFrame, ResizeObserver, keyboard inputs, and rendering loop
 */
import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/gameEngine';
import { gameRenderer } from '../game/renderer';

interface GameCanvasProps {
  engine: GameEngine;
  onStateTick: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, onStateTick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const tickCounter = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // ResizeObserver for canvas dimensions
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          canvas.width = Math.floor(width);
          canvas.height = Math.floor(height);
        }
      }
    });
    resizeObserver.observe(container);

    // Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Prevent default scrolling and browser shortcuts on game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Tab', 'F5', 'F9'].includes(e.code)) {
        e.preventDefault();
      }
      engine.onKeyDown(e.code, e);
      onStateTick();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.onKeyUp(e.code);
    };

    // Mouse Listeners for Aiming, Shooting, Tactical Dash, and Weapon Switching
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      engine.onMouseMove(mouseX, mouseY, canvas.width, canvas.height);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // button 0 = Left Click (Shoot), button 2 = Right Click (Tactical Dash)
      engine.onMouseDown(e.button);
      onStateTick();
    };

    const handleMouseUp = (e: MouseEvent) => {
      engine.onMouseUp(e.button);
      onStateTick();
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      engine.onWheel(e.deltaY);
      onStateTick();
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent browser context menu on right-click dash
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('contextmenu', handleContextMenu);

    // Main Game Loop
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const width = canvas.width || 800;
      const height = canvas.height || 600;

      // Update simulation
      engine.update(dt, width, height);

      // Render world
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const nearest = engine.getNearestInteractable();
        const boss = engine.enemies.find(e => e.type === 'boss') || null;

        gameRenderer.render(
          ctx,
          width,
          height,
          engine.player,
          engine.enemies,
          engine.npcs,
          engine.world,
          engine.projectiles,
          engine.dangerZones,
          engine.particles,
          engine.camera,
          engine.dayTime,
          nearest,
          boss,
          engine.infiniteChunks,
          engine.factoryMgr.buildings,
          engine.vehicleMgr.vehicles,
          engine.factoryMgr.resourceNodes
        );
      }

      // Periodically sync React UI state
      tickCounter.current++;
      if (tickCounter.current % 3 === 0) {
        onStateTick();
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [engine, onStateTick]);

  return (
    <div
      ref={containerRef}
      id="game-canvas-container"
      className="relative w-full h-full overflow-hidden bg-slate-950 cursor-crosshair select-none"
    >
      <canvas
        ref={canvasRef}
        id="ashen-road-canvas"
        className="block w-full h-full"
      />
    </div>
  );
};
