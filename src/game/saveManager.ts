/**
 * Ashen Road - Persistent Save/Load Manager via LocalStorage
 */
import { SaveData, Player, Quest, Chest, Gun, ColonyState, FactoryBuilding, Vehicle } from '../types';

const SAVE_KEY = 'ashen_road_saved_game_v1';

export function saveGame(
  player: Player,
  quests: Quest[],
  chests: Chest[],
  world: { watchtowerExamined: boolean; bossDefeated: boolean; dayTime: number },
  extra?: {
    guns?: Gun[];
    selectedGunIndex?: number;
    colony?: ColonyState;
    buildings?: FactoryBuilding[];
    vehicles?: Vehicle[];
  }
): boolean {
  try {
    const questMap: Record<string, any> = {};
    const questProgressMap: Record<string, number[]> = {};
    quests.forEach(q => {
      questMap[q.id] = q.status;
      questProgressMap[q.id] = q.objectives.map(o => o.current);
    });

    const chestMap: Record<string, boolean> = {};
    chests.forEach(c => {
      chestMap[c.id] = c.opened;
    });

    const data: SaveData = {
      version: 1,
      timestamp: Date.now(),
      player: {
        x: Math.round(player.x),
        y: Math.round(player.y),
        level: player.level,
        xp: player.xp,
        gold: player.gold,
        hp: player.hp,
        maxHp: player.maxHp,
        stamina: player.stamina,
        maxStamina: player.maxStamina,
        baseAttack: player.baseAttack,
        baseDefense: player.baseDefense,
        inventory: player.inventory,
        equipment: player.equipment,
        autoAim: player.autoAim,
        autoShoot: player.autoShoot,
        isInfiniteAmmo: player.isInfiniteAmmo,
        unlockedGuns: extra?.guns || player.unlockedGuns,
        selectedGunIndex: extra?.selectedGunIndex ?? player.selectedGunIndex,
      },
      quests: questMap,
      questProgress: questProgressMap,
      chests: chestMap,
      world: {
        watchtowerExamined: world.watchtowerExamined,
        bossDefeated: world.bossDefeated,
        dayTime: world.dayTime,
      },
      colony: extra?.colony,
      buildings: extra?.buildings,
      vehicles: extra?.vehicles,
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Failed to save game:', err);
    return false;
  }
}

export function loadGame(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SaveData;
  } catch (err) {
    console.error('Failed to load game:', err);
    return null;
  }
}

export function hasSavedGame(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch {
    return false;
  }
}

export function deleteSavedGame() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    console.error('Failed to delete save:', err);
  }
}
