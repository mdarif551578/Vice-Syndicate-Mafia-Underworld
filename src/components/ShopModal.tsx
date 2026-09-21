/**
 * Ashen Road - NPC Shop Modal (Buy & Sell)
 */
import React, { useState } from 'react';
import { NPC, Player, Item } from '../types';
import { ITEMS } from '../game/constants';
import { Coins, X, ShoppingBag, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface ShopModalProps {
  npc: NPC;
  player: Player;
  onBuyItem: (itemId: string) => void;
  onSellItem: (item: Item) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  npc,
  player,
  onBuyItem,
  onSellItem,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY');

  const shopItems = (npc.shopInventory || [])
    .map(id => ITEMS[id])
    .filter(Boolean);

  const sellableItems = player.inventory.filter(i => i.type !== 'QUEST');

  return (
    <div id="shop-overlay" className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold tracking-wide">{npc.name}'s Shop</h2>
              <span className="text-xs text-slate-400">{npc.title}</span>
            </div>
          </div>
          <button
            id="btn-close-shop"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Gold Balance & Tabs */}
        <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Your Gold: {player.gold} G</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('BUY')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'BUY'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Buy</span>
            </button>
            <button
              onClick={() => setActiveTab('SELL')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'SELL'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Sell</span>
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
          {activeTab === 'BUY' ? (
            shopItems.map(item => {
              const canAfford = player.gold >= item.value;
              return (
                <div
                  key={item.id}
                  className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-4 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{item.name}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-amber-400 whitespace-nowrap">
                      {item.value} G
                    </span>
                    <button
                      onClick={() => onBuyItem(item.id)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      Buy [E]
                    </button>
                  </div>
                </div>
              );
            })
          ) : sellableItems.length > 0 ? (
            sellableItems.map(item => {
              const sellValue = Math.floor(item.value * 0.5);
              return (
                <div
                  key={item.id}
                  className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-4 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-xs text-amber-300 font-mono">x{item.quantity}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-emerald-400 whitespace-nowrap">
                      +{sellValue} G
                    </span>
                    <button
                      onClick={() => onSellItem(item)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
                    >
                      Sell [Q]
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-xs text-slate-500 italic">
              No items to sell in your inventory.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
