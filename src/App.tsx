/**
 * Ashen Road - Main Application Component
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GameEngine } from './game/gameEngine';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { RadialWeaponWheel } from './components/RadialWeaponWheel';
import { ColonyModal } from './components/ColonyModal';
import { HackModal } from './components/HackModal';
import { DialogueBox } from './components/DialogueBox';
import { InventoryModal } from './components/InventoryModal';
import { QuestModal } from './components/QuestModal';
import { ShopModal } from './components/ShopModal';
import { PauseMenu } from './components/PauseMenu';
import { MainMenu } from './components/MainMenu';
import { DeathModal, VictoryModal } from './components/OutcomeModals';
import { WeaponAdvancementModal } from './components/WeaponAdvancementModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { MissionWalkthroughModal } from './components/MissionWalkthroughModal';
import { Minimap } from './components/Minimap';
import { RadioCommsOverlay } from './components/RadioCommsOverlay';
import { hasSavedGame } from './game/saveManager';
import { Item, RespawnLocation } from './types';

export default function App() {
  // Single game engine instance
  const engineRef = useRef<GameEngine>(new GameEngine());
  const engine = engineRef.current;

  // Touch controls overlay state - default enabled so touch and mouse users can access immediately
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;
    }
    return true;
  });

  // React state trigger to synchronize UI with game loop
  const [, setTick] = useState(0);
  const triggerRender = useCallback(() => {
    setTick(t => (t + 1) % 10000);
  }, []);

  // Sync engine.isMobileControlsVisible with showTouchControls & handle shortcut toggles
  useEffect(() => {
    engine.isMobileControlsVisible = showTouchControls;
    engine.onMobileControlsChange = (visible: boolean) => {
      setShowTouchControls(visible);
    };
  }, [engine, showTouchControls]);

  // Initial Load: Auto-Resume existing game so user is never reset to the beginning
  useEffect(() => {
    if (hasSavedGame()) {
      engine.continueGame();
    } else {
      engine.newGame();
      engine.quickSave();
    }
    triggerRender();
  }, [engine, triggerRender]);

  // Periodic Auto-Save every 20 seconds while playing
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (engine.mode === 'PLAYING') {
        engine.autoSave();
      }
    }, 20000);
    return () => clearInterval(autoSaveInterval);
  }, [engine]);

  // Menu & Modal Handlers
  const handleToggleAutoAim = () => {
    engine.toggleAutoAim();
    triggerRender();
  };

  const handleToggleAutoShoot = () => {
    engine.toggleAutoShoot();
    triggerRender();
  };

  const handleOpenShortcutsGuide = () => {
    engine.mode = 'SHORTCUTS_GUIDE';
    triggerRender();
  };

  const handleQuickHeal = () => {
    engine.quickHeal();
    triggerRender();
  };

  const handleNewGame = () => {
    engine.newGame();
    triggerRender();
  };

  const handleContinueGame = () => {
    if (engine.continueGame()) {
      triggerRender();
    }
  };

  const handleOpenInventory = () => {
    engine.mode = 'INVENTORY';
    triggerRender();
  };

  const handleOpenQuests = () => {
    engine.mode = 'QUESTS';
    triggerRender();
  };

  const handleOpenRadialWheel = () => {
    engine.mode = 'RADIAL_WEAPONS';
    triggerRender();
  };

  const handleOpenColony = () => {
    engine.mode = 'COLONY';
    triggerRender();
  };

  const handleOpenHacking = () => {
    engine.mode = 'HACKING';
    triggerRender();
  };

  const handleToggleInfiniteAmmo = () => {
    engine.player.isInfiniteAmmo = !engine.player.isInfiniteAmmo;
    engine.showToast(
      engine.player.isInfiniteAmmo ? '∞ INFINITE AMMO: ACTIVATED' : 'INFINITE AMMO: DEACTIVATED',
      engine.player.isInfiniteAmmo ? '#f59e0b' : '#94a3b8'
    );
    triggerRender();
  };

  const handleOpenWeaponAdvancement = () => {
    engine.mode = 'WEAPON_UPGRADE';
    triggerRender();
  };

  const handleMountVehicle = () => {
    engine.toggleMountVehicle();
    triggerRender();
  };

  const handlePause = () => {
    engine.mode = 'PAUSED';
    triggerRender();
  };

  const handleResume = () => {
    engine.mode = 'PLAYING';
    triggerRender();
  };

  const handleSaveGame = () => {
    engine.quickSave();
    triggerRender();
  };

  const handleQuitToTitle = () => {
    engine.mode = 'TITLE';
    triggerRender();
  };

  const handleUseItem = (item: Item) => {
    engine.useItem(item);
    triggerRender();
  };

  const handleBuyItem = (itemId: string) => {
    engine.buyItem(itemId);
    triggerRender();
  };

  const handleSellItem = (item: Item) => {
    engine.sellItem(item);
    triggerRender();
  };

  const handleAdvanceDialogue = () => {
    engine.advanceDialogue();
    triggerRender();
  };

  const handleRespawn = (location?: RespawnLocation) => {
    engine.respawnPlayer(location);
    triggerRender();
  };

  const handleContinueVictory = () => {
    engine.mode = 'PLAYING';
    triggerRender();
  };

  const handleAttack = () => {
    engine.executeAttack();
    triggerRender();
  };

  const handleInteract = () => {
    engine.handleInteraction();
    triggerRender();
  };

  // Find active quest for HUD
  const activeQuest = engine.quests.find(q => q.status === 'ACTIVE') || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 2D Procedural Canvas Game View */}
      <GameCanvas engine={engine} onStateTick={triggerRender} />

      {/* Floating HUD (Active in PLAYING or sub-menus) */}
      {engine.mode !== 'TITLE' && (
        <HUD
          player={engine.player}
          activeQuest={activeQuest}
          dayTime={engine.dayTime}
          showTouchControls={showTouchControls}
          onToggleTouchControls={() => setShowTouchControls(!showTouchControls)}
          onOpenInventory={handleOpenInventory}
          onOpenQuests={handleOpenQuests}
          onOpenRadialWheel={handleOpenRadialWheel}
          onOpenColony={handleOpenColony}
          onOpenHacking={handleOpenHacking}
          onMountVehicle={handleMountVehicle}
          onToggleInfiniteAmmo={handleToggleInfiniteAmmo}
          onOpenWeaponAdvancement={handleOpenWeaponAdvancement}
          onToggleAutoAim={handleToggleAutoAim}
          onToggleAutoShoot={handleToggleAutoShoot}
          onOpenShortcutsGuide={handleOpenShortcutsGuide}
          onQuickHeal={handleQuickHeal}
          onPause={handlePause}
          onAttack={handleAttack}
          onInteract={handleInteract}
        />
      )}

      {/* Corner Minimap with Real-time Territory Conquest Tracking */}
      {engine.mode !== 'TITLE' && <Minimap engine={engine} />}

      {/* Voice Communications & Tactical Radio Narrative Overlay */}
      <RadioCommsOverlay />

      {/* Syndicate Operations Guide & Mission Walkthrough Modal */}
      {engine.mode === 'MISSION_WALKTHROUGH' && (
        <MissionWalkthroughModal
          engine={engine}
          onClose={() => {
            engine.mode = 'PLAYING';
            triggerRender();
          }}
        />
      )}

      {/* Keyboard Shortcuts Reference Guide Cheat Sheet Modal */}
      {engine.mode === 'SHORTCUTS_GUIDE' && (
        <ShortcutsModal
          isOpen={true}
          onClose={() => {
            engine.mode = 'PLAYING';
            triggerRender();
          }}
        />
      )}

      {/* Mobile & Touchscreen Controls Overlay */}
      {showTouchControls && engine.mode === 'PLAYING' && (
        <TouchControls
          engine={engine}
          onOpenRadialWheel={handleOpenRadialWheel}
          onOpenColony={handleOpenColony}
          onOpenHacking={handleOpenHacking}
          onTriggerStateUpdate={triggerRender}
        />
      )}

      {/* Weapon Advancement & Evolution Modal */}
      {engine.mode === 'WEAPON_UPGRADE' && (
        <WeaponAdvancementModal
          engine={engine}
          onClose={() => {
            engine.mode = 'PLAYING';
            triggerRender();
          }}
          onStateUpdate={triggerRender}
        />
      )}

      {/* Radial Weapon Wheel Modal */}
      {engine.mode === 'RADIAL_WEAPONS' && (
        <RadialWeaponWheel
          engine={engine}
          onClose={() => {
            engine.mode = 'PLAYING';
            triggerRender();
          }}
          onSelectGun={idx => {
            engine.selectGun(idx);
            engine.mode = 'PLAYING';
            triggerRender();
          }}
        />
      )}

      {/* Factory & Colony Management Modal */}
      {engine.mode === 'COLONY' && (
        <ColonyModal
          engine={engine}
          onClose={() => {
            engine.mode = 'PLAYING';
            triggerRender();
          }}
          onStateUpdate={triggerRender}
        />
      )}

      {/* Cyber Hacking Terminal Modal */}
      {engine.mode === 'HACKING' && (
        <HackModal
          engine={engine}
          onClose={() => {
            engine.mode = 'PLAYING';
            triggerRender();
          }}
          onStateUpdate={triggerRender}
        />
      )}

      {/* Title / Main Menu */}
      {engine.mode === 'TITLE' && (
        <MainMenu onNewGame={handleNewGame} onContinueGame={handleContinueGame} />
      )}

      {/* NPC Dialogue Box */}
      {engine.mode === 'DIALOGUE' && engine.activeNPC && (
        <DialogueBox
          npc={engine.activeNPC}
          lineIndex={engine.dialogueLineIndex}
          onAdvance={handleAdvanceDialogue}
        />
      )}

      {/* Inventory & Equipment Modal */}
      {engine.mode === 'INVENTORY' && (
        <InventoryModal
          player={engine.player}
          onUseItem={handleUseItem}
          onClose={() => {
            engine.mode = 'PLAYING';
            triggerRender();
          }}
        />
      )}

      {/* Quest Journal Modal */}
      {engine.mode === 'QUESTS' && (
        <QuestModal
          quests={engine.quests}
          onClose={() => {
            engine.mode = 'PLAYING';
            triggerRender();
          }}
        />
      )}

      {/* Shop Modal */}
      {engine.mode === 'SHOP' && engine.activeShopNPC && (
        <ShopModal
          npc={engine.activeShopNPC}
          player={engine.player}
          onBuyItem={handleBuyItem}
          onSellItem={handleSellItem}
          onClose={() => {
            engine.mode = 'PLAYING';
            engine.activeShopNPC = null;
            triggerRender();
          }}
        />
      )}

      {/* Pause Menu */}
      {engine.mode === 'PAUSED' && (
        <PauseMenu
          onResume={handleResume}
          onOpenInventory={handleOpenInventory}
          onOpenQuests={handleOpenQuests}
          onSaveGame={handleSaveGame}
          onQuitToTitle={handleQuitToTitle}
          onOpenShortcuts={handleOpenShortcutsGuide}
        />
      )}

      {/* Game Over / Death Screen */}
      {engine.mode === 'GAME_OVER' && (
        <DeathModal goldLost={engine.deathGoldLost} onRespawn={handleRespawn} />
      )}

      {/* Victory Screen */}
      {engine.mode === 'VICTORY' && (
        <VictoryModal stats={engine.victoryStats} onContinue={handleContinueVictory} />
      )}
    </div>
  );
}

