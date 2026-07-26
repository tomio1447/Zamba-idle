import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function BossShop({ character, onClose, onUpdate }) {
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getBossShop().then(setShopItems).catch(console.error);
  }, []);

  const handleBuy = async (itemId) => {
    try {
      setLoading(true);
      const result = await api.buyBossShopItem(character.id, itemId);
      onUpdate(result.character);
      alert(`✅ Comprou ${result.item.name}!`);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal boss-shop-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👑 Boss Shop</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="boss-coins-balance">
          <span className="coin-icon">👑</span>
          <span className="coin-amount">{character.bossCoins}</span>
          <span className="coin-label">Boss Coins</span>
        </div>

        <div className="shop-items">
          {shopItems.map(item => (
            <div key={item.id} className="shop-item">
              <div className="shop-item-info">
                <h4>{item.name}</h4>
                <span className="shop-item-type">{item.type}</span>
              </div>
              <div className="shop-item-cost">
                <span className="cost-amount">{item.cost}</span>
                <span className="cost-icon">👑</span>
              </div>
              <button 
                className="btn btn-buy"
                onClick={() => handleBuy(item.id)}
                disabled={character.bossCoins < item.cost || loading}
              >
                Comprar
              </button>
            </div>
          ))}
        </div>

        <div className="shop-info">
          <p>💡 Boss Coins são obtidos ao derrotar bosses nas instâncias de caçada.</p>
          <p>👑 Boss aparecem a cada 10 waves!</p>
        </div>
      </div>
    </div>
  );
}
