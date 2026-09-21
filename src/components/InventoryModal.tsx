/**
 * Ashen Road - Inventory & Equipment Modal
 */
import React, { useState } from 'react';
import { Player, Item } from '../types';
import { Shield, Swords, X, Heart, Sparkles, Package } from 'lucide-react';

interface InventoryModalProps {
  player: Player;
  onUseItem: (item: Item) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ player, onUseItem, onClose }) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(
    player.inventory[0] || null
  );

  const totalAttack = player.baseAttack + (player.equipment.weapon?.damage || 0);
  const totalDefense = player.baseDefense + (player.equipment.armor?.defense || 0);

  // Fill up to 20 grid slots
  const slots = Array.from({ length: 20 }, (_, idx) => player.inventory[idx] || null);

  return (
    <div id="inventory-overlay" className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-wide">Inventory & Equipment</h2>
          </div>
          <button
            id="btn-close-inventory"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT: Equipment & Combat Stats */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
              Equipped Gear
            </h3>

            {/* Weapon slot */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">Weapon Slot</span>
              {player.equipment.weapon ? (
                <div>
                  <div className="font-bold text-sm text-amber-300">
                    {player.equipment.weapon.name}
                  </div>
                  <div className="text-xs text-rose-400 font-mono mt-0.5">
                    +{player.equipment.weapon.damage} Weapon DMG
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic">No weapon equipped</span>
              )}
            </div>

            {/* Armor slot */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">Armor Slot</span>
              {player.equipment.armor ? (
                <div>
                  <div className="font-bold text-sm text-sky-300">
                    {player.equipment.armor.name}
                  </div>
                  <div className="text-xs text-sky-400 font-mono mt-0.5">
                    +{player.equipment.armor.defense} Defense
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic">No armor equipped</span>
              )}
            </div>

            {/* Overall Combat Stats Display (Spec 20) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 mt-auto flex justify-around">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Attack</span>
                <span className="text-xl font-bold text-rose-400 flex items-center justify-center gap-1">
                  <Swords className="w-4 h-4" />
                  {totalAttack}
                </span>
              </div>
              <div className="w-[1px] bg-slate-800" />
              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Defense</span>
                <span className="text-xl font-bold text-sky-400 flex items-center justify-center gap-1">
                  <Shield className="w-4 h-4" />
                  {totalDefense}
                </span>
              </div>
            </div>
          </div>

          {/* MIDDLE & RIGHT: 20 Item Grid & Details */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Backpack ({player.inventory.length} / 20)
              </span>
              <span className="text-xs font-bold text-amber-400">
                {player.gold} Gold
              </span>
            </div>

            {/* 20 Slots Grid */}
            <div className="grid grid-cols-5 gap-2 bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
              {slots.map((item, idx) => {
                const isSelected = selectedItem && item && selectedItem.id === item.id;
                const isEquipped =
                  item &&
                  (player.equipment.weapon?.id === item.id || player.equipment.armor?.id === item.id);

                return (
                  <button
                    key={idx}
                    onClick={() => item && setSelectedItem(item)}
                    className={`h-14 rounded-lg border flex flex-col items-center justify-center relative transition ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/20'
                        : item
                        ? 'border-slate-700 bg-slate-900 hover:border-slate-500'
                        : 'border-slate-800/80 bg-slate-950/40 cursor-default'
                    }`}
                  >
                    {item && (
                      <>
                        <span className="text-base">
                          {item.type === 'WEAPON' ? '⚔️' : item.type === 'ARMOR' ? '🛡️' : item.type === 'CONSUMABLE' ? '🧪' : '🔑'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-200 truncate max-w-[50px]">
                          {item.name.split(' ')[0]}
                        </span>
                        {item.quantity > 1 && (
                          <span className="absolute top-1 right-1 text-[10px] bg-slate-800 text-amber-300 font-mono px-1 rounded">
                            {item.quantity}
                          </span>
                        )}
                        {isEquipped && (
                          <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 shadow" />
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Item Details Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 min-h-[110px] flex flex-col justify-between">
              {selectedItem ? (
                <>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-amber-300 text-sm">{selectedItem.name}</h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                        {selectedItem.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {selectedItem.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 mt-2">
                    <span className="text-xs text-slate-400">
                      Value: <strong className="text-amber-400">{selectedItem.value} G</strong>
                    </span>
                    {selectedItem.type === 'CONSUMABLE' && (
                      <button
                        onClick={() => onUseItem(selectedItem)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-xs transition flex items-center gap-1 shadow"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>Use</span>
                      </button>
                    )}
                    {(selectedItem.type === 'WEAPON' || selectedItem.type === 'ARMOR') && (
                      <button
                        onClick={() => onUseItem(selectedItem)}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1 rounded-lg text-xs transition flex items-center gap-1 shadow"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Equip</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500 italic my-auto text-center">
                  Select an item from your backpack to view details and equip/use.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
