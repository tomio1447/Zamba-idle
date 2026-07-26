import React, { useState } from 'react';

// Cores dos tiers baseadas no BaiakIdle
const TIER_COLORS = {
    0: '#cfd2d8', // Common
    1: '#57b85a', // Uncommon
    2: '#4a90e8', // Rare
    3: '#a05be0', // Epic
};

const TIER_NAMES = {
    0: 'Common',
    1: 'Uncommon',
    2: 'Rare',
    3: 'Epic',
};

export default function Inventory({ character, onSellItem, onSellAll, onMoveItem }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [showConfirmSell, setShowConfirmSell] = useState(false);

    const handleItemClick = (item, index) => {
        setSelectedItem({ ...item, index });
    };

    const handleSellClick = () => {
        if (selectedItem) {
            setShowConfirmSell(true);
        }
    };

    const confirmSell = () => {
        if (selectedItem && onSellItem) {
            onSellItem(selectedItem.index);
        }
        setShowConfirmSell(false);
        setSelectedItem(null);
    };

    const handleSellAll = () => {
        if (onSellAll) {
            onSellAll();
        }
    };

    // Calcular estatísticas do inventário
    const stats = {
        total: character?.lootPouch?.length || 0,
        max: character?.lootPouchSlots || 10,
        common: character?.lootPouch?.filter(i => i.tier === 0).length || 0,
        uncommon: character?.lootPouch?.filter(i => i.tier === 1).length || 0,
        rare: character?.lootPouch?.filter(i => i.tier === 2).length || 0,
        epic: character?.lootPouch?.filter(i => i.tier === 3).length || 0,
        totalValue: character?.lootPouch?.reduce((sum, i) => sum + (i.goldValue || 0), 0) || 0,
    };

    return (
        <div className="inventory-panel">
            <div className="inventory-header">
                <h3>🎒 Inventário</h3>
                <span className="inventory-count">{stats.total}/{stats.max}</span>
            </div>

            {/* Stats de raridade */}
            <div className="tier-stats">
                <div className="tier-stat" style={{ borderColor: TIER_COLORS[0] }}>
                    <span className="tier-dot" style={{ backgroundColor: TIER_COLORS[0] }}></span>
                    <span className="tier-count">{stats.common}</span>
                </div>
                <div className="tier-stat" style={{ borderColor: TIER_COLORS[1] }}>
                    <span className="tier-dot" style={{ backgroundColor: TIER_COLORS[1] }}></span>
                    <span className="tier-count">{stats.uncommon}</span>
                </div>
                <div className="tier-stat" style={{ borderColor: TIER_COLORS[2] }}>
                    <span className="tier-dot" style={{ backgroundColor: TIER_COLORS[2] }}></span>
                    <span className="tier-count">{stats.rare}</span>
                </div>
                <div className="tier-stat" style={{ borderColor: TIER_COLORS[3] }}>
                    <span className="tier-dot" style={{ backgroundColor: TIER_COLORS[3] }}></span>
                    <span className="tier-count">{stats.epic}</span>
                </div>
            </div>

            {/* Grid de itens */}
            <div className="inventory-grid">
                {character?.lootPouch?.map((item, index) => (
                    <div
                        key={index}
                        className={`inventory-cell ${selectedItem?.index === index ? 'selected' : ''}`}
                        style={{ 
                            borderColor: TIER_COLORS[item.tier] || TIER_COLORS[0],
                            boxShadow: selectedItem?.index === index ? `0 0 8px ${TIER_COLORS[item.tier]}` : 'none'
                        }}
                        onClick={() => handleItemClick(item, index)}
                        title={`${item.name} (${TIER_NAMES[item.tier]})\nQuantidade: ${item.quantity}\nValor: ${item.goldValue}g`}
                    >
                        <div className="cell-icon">
                            {item.type === 'currency' && '💰'}
                            {item.type === 'food' && '🍖'}
                            {item.type === 'material' && '🔮'}
                            {item.type === 'weapon' && '⚔️'}
                            {item.type === 'armor' && '🛡️'}
                            {item.type === 'helmet' && '⛑️'}
                            {item.type === 'ring' && '💍'}
                            {item.type === 'potion' && '🧪'}
                        </div>
                        <span className="cell-qty">x{item.quantity}</span>
                        <span className="cell-tier" style={{ color: TIER_COLORS[item.tier] }}>
                            {TIER_NAMES[item.tier]?.[0] || 'C'}
                        </span>
                    </div>
                ))}

                {/* Células vazias */}
                {Array.from({ length: Math.max(0, stats.max - stats.total) }).map((_, index) => (
                    <div key={`empty-${index}`} className="inventory-cell empty"></div>
                ))}
            </div>

            {/* Info do item selecionado */}
            {selectedItem && (
                <div className="item-details" style={{ borderColor: TIER_COLORS[selectedItem.tier] }}>
                    <div className="item-info">
                        <span className="item-name" style={{ color: TIER_COLORS[selectedItem.tier] }}>
                            {selectedItem.name}
                        </span>
                        <span className="item-tier" style={{ color: TIER_COLORS[selectedItem.tier] }}>
                            {TIER_NAMES[selectedItem.tier]}
                        </span>
                        <span className="item-qty">Quantidade: {selectedItem.quantity}</span>
                        <span className="item-value">Valor: {selectedItem.goldValue}g</span>
                    </div>
                    <button className="btn btn-sell-item" onClick={handleSellClick}>
                        💰 Vender
                    </button>
                </div>
            )}

            {/* Botão vender tudo */}
            <div className="inventory-actions">
                <button 
                    className="btn btn-gold btn-sell-all"
                    onClick={handleSellAll}
                    disabled={stats.total === 0}
                >
                    💰 Vender Tudo ({stats.totalValue}g)
                </button>
            </div>

            {/* Modal de confirmação */}
            {showConfirmSell && (
                <div className="modal-overlay" onClick={() => setShowConfirmSell(false)}>
                    <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
                        <h3>Confirmar Venda</h3>
                        <p>
                            Vender <strong style={{ color: TIER_COLORS[selectedItem?.tier] }}>
                                {selectedItem?.name}
                            </strong> por <strong>{selectedItem?.goldValue}g</strong>?
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={confirmSell}>
                                ✅ Confirmar
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowConfirmSell(false)}>
                                ❌ Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
