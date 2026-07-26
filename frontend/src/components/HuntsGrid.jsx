import React, { useState, useMemo } from 'react';

const CATEGORIES = [
    { id: 'all', label: 'Todas' },
    { id: 'beginner', label: 'Iniciante' },
    { id: 'intermediate', label: 'Intermediário' },
    { id: 'advanced', label: 'Avançado' },
];

const CATEGORY_LABELS = {
    'Iniciante': 'beginner',
    'Intermediário': 'intermediate',
    'Avançado': 'advanced',
};

export default function HuntsGrid({ zones, playerLevel, onSelectHunt, currentHunt }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar hunts por categoria e busca
    const filteredZones = useMemo(() => {
        let filtered = zones;

        // Filtrar por categoria
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(zone => {
                const category = CATEGORY_LABELS[zone.category];
                return category === selectedCategory;
            });
        }

        // Filtrar por busca
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(zone => 
                zone.name.toLowerCase().includes(term) ||
                zone.monsters.some(m => m.toLowerCase().includes(term))
            );
        }

        return filtered;
    }, [zones, selectedCategory, searchTerm]);

    const getZoneStatus = (zone) => {
        if (currentHunt === zone.id) return 'active';
        if (playerLevel < zone.minLevel) return 'locked';
        return 'available';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return '✅';
            case 'locked': return '🔒';
            default: return '⚔️';
        }
    };

    return (
        <div className="hunts-grid-panel">
            <div className="hunts-header">
                <h3>🗺️ Hunts Disponíveis</h3>
                <div className="hunts-search">
                    <input
                        type="text"
                        placeholder="Buscar hunt..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Categorias */}
            <div className="hunt-categories">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        className={`hunt-category ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Grid de Hunts */}
            <div className="hunt-grid">
                {filteredZones.map(zone => {
                    const status = getZoneStatus(zone);
                    const isLocked = status === 'locked';
                    const isActive = status === 'active';

                    return (
                        <div
                            key={zone.id}
                            className={`hunt-card ${status}`}
                            onClick={() => !isLocked && onSelectHunt(zone.id)}
                        >
                            <div className="hunt-card-header">
                                <span className="hunt-status-icon">{getStatusIcon(status)}</span>
                                <h4 className="hunt-name">{zone.name}</h4>
                            </div>

                            <div className="hunt-info">
                                <span className="hunt-level">
                                    Nível {zone.minLevel}+
                                </span>
                                <span className="hunt-xp">
                                    {zone.xpGain} XP/s
                                </span>
                            </div>

                            <p className="hunt-description">{zone.description}</p>

                            <div className="hunt-monsters">
                                {zone.monsters.slice(0, 3).map((monster, idx) => (
                                    <span key={idx} className="monster-tag">
                                        {monster}
                                    </span>
                                ))}
                                {zone.monsters.length > 3 && (
                                    <span className="monster-tag more">
                                        +{zone.monsters.length - 3}
                                    </span>
                                )}
                            </div>

                            <div className="hunt-boss">
                                👑 Boss: {zone.boss || 'Nenhum'}
                            </div>

                            <button 
                                className={`btn-hunt-go ${isActive ? 'active' : ''}`}
                                disabled={isLocked}
                            >
                                {isActive ? 'Caçando...' : isLocked ? 'Bloqueado' : 'Caçar'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {filteredZones.length === 0 && (
                <div className="no-hunts">
                    <p>Nenhuma hunt encontrada</p>
                </div>
            )}
        </div>
    );
}
