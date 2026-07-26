import React, { useState, useRef } from 'react';

// Ícones de vocações
const VOCATION_ICONS = {
    KNIGHT: '/icons/vocations/knight.svg',
    PALADIN: '/icons/vocations/paladin.svg',
    SORCERER: '/icons/vocations/sorcerer.svg',
    DRUID: '/icons/vocations/druid.svg',
    MONK: '/icons/vocations/monk.svg',
    NONE: '/icons/vocations/none.svg',
};

const VOCATION_COLORS = {
    KNIGHT: '#e0a06a',
    PALADIN: '#7fd39a',
    SORCERER: '#7fa8e8',
    DRUID: '#77d0c8',
    MONK: '#d8c07a',
    NONE: '#888888',
};

const MAX_PARTY_SIZE = 4;

export default function PartyManager({ 
    characters, 
    party, 
    onPartyChange, 
    onStartHunt,
    onSelectCharacter 
}) {
    const [draggedCharacter, setDraggedCharacter] = useState(null);
    const [dragOverSlot, setDragOverSlot] = useState(null);
    const [selectedChar, setSelectedChar] = useState(null);

    // Inicializar party com slots vazia
    const [partySlots, setPartySlots] = useState(() => {
        const slots = Array(MAX_PARTY_SIZE).fill(null);
        if (party && party.length > 0) {
            party.forEach((char, index) => {
                if (index < MAX_PARTY_SIZE) {
                    slots[index] = char;
                }
            });
        }
        return slots;
    });

    // Personagem líder (primeiro da party)
    const leader = partySlots[0];

    // Personagens disponíveis (não estão na party)
    const availableCharacters = characters.filter(
        char => !partySlots.some(slot => slot && slot.id === char.id)
    );

    const handleDragStart = (character, sourceType, sourceIndex) => {
        setDraggedCharacter({ character, sourceType, sourceIndex });
    };

    const handleDragOver = (e, slotIndex) => {
        e.preventDefault();
        setDragOverSlot(slotIndex);
    };

    const handleDragLeave = () => {
        setDragOverSlot(null);
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        setDragOverSlot(null);

        if (!draggedCharacter) return;

        const { character, sourceType, sourceIndex } = draggedCharacter;

        setPartySlots(prev => {
            const newSlots = [...prev];

            // Se arrastou de um slot para outro
            if (sourceType === 'slot') {
                // Swap personagens
                const temp = newSlots[targetIndex];
                newSlots[targetIndex] = character;
                newSlots[sourceIndex] = temp;
            } 
            // Se arrastou da lista de disponíveis
            else if (sourceType === 'available') {
                // Se o slot está vazio ou queremos substituir
                newSlots[targetIndex] = character;
            }

            // Atualizar party
            const newParty = newSlots.filter(slot => slot !== null);
            if (onPartyChange) {
                onPartyChange(newParty);
            }

            return newSlots;
        });

        setDraggedCharacter(null);
    };

    const handleRemoveFromParty = (slotIndex) => {
        setPartySlots(prev => {
            const newSlots = [...prev];
            newSlots[slotIndex] = null;
            
            const newParty = newSlots.filter(slot => slot !== null);
            if (onPartyChange) {
                onPartyChange(newParty);
            }

            return newSlots;
        });
    };

    const handleSelectCharacter = (character) => {
        setSelectedChar(character);
        if (onSelectCharacter) {
            onSelectCharacter(character);
        }
    };

    const handleStartHunt = () => {
        const activeParty = partySlots.filter(slot => slot !== null);
        if (activeParty.length === 0) {
            alert('Adicione pelo menos um personagem à party!');
            return;
        }
        if (onStartHunt) {
            onStartHunt(activeParty);
        }
    };

    // Calcular bônus da party
    const partyBonus = Math.floor((partySlots.filter(s => s !== null).length - 1) * 5);

    return (
        <div className="party-manager">
            <div className="party-header">
                <h2>🎭 Gerenciar Party</h2>
                <div className="party-bonus">
                    <span className="bonus-label">Bônus Party:</span>
                    <span className="bonus-value">+{partyBonus}% XP</span>
                </div>
            </div>

            {/* Slots da Party */}
            <div className="party-slots-container">
                <h3>Slots da Party (máximo {MAX_PARTY_SIZE})</h3>
                <div className="party-slots">
                    {partySlots.map((character, index) => (
                        <div
                            key={index}
                            className={`party-slot ${character ? 'filled' : 'empty'} ${dragOverSlot === index ? 'drag-over' : ''} ${index === 0 ? 'leader' : ''}`}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                        >
                            {character ? (
                                <div
                                    className="party-member"
                                    draggable
                                    onDragStart={() => handleDragStart(character, 'slot', index)}
                                    onClick={() => handleSelectCharacter(character)}
                                    style={{ borderColor: VOCATION_COLORS[character.vocation] }}
                                >
                                    <div className="member-sprite">
                                        <img 
                                            src={VOCATION_ICONS[character.vocation] || VOCATION_ICONS.NONE}
                                            alt={character.vocation}
                                        />
                                    </div>
                                    <div className="member-info">
                                        <span className="member-name">{character.name}</span>
                                        <span className="member-level">Lv. {character.level}</span>
                                        <span className="member-vocation" style={{ color: VOCATION_COLORS[character.vocation] }}>
                                            {character.vocation}
                                        </span>
                                    </div>
                                    <button 
                                        className="btn-remove-member"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFromParty(index);
                                        }}
                                    >
                                        ✕
                                    </button>
                                    {index === 0 && <span className="leader-badge">👑 Líder</span>}
                                </div>
                            ) : (
                                <div className="slot-empty">
                                    <span className="slot-icon">+</span>
                                    <span className="slot-text">
                                        {index === 0 ? 'Slot Principal' : `Slot ${index + 1}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Lista de Personagens Disponíveis */}
            <div className="available-characters">
                <h3>Personagens Disponíveis</h3>
                <div className="characters-list">
                    {availableCharacters.length === 0 ? (
                        <p className="no-characters">Todos os personagens estão na party</p>
                    ) : (
                        availableCharacters.map(character => (
                            <div
                                key={character.id}
                                className={`character-card ${selectedChar?.id === character.id ? 'selected' : ''}`}
                                draggable
                                onDragStart={() => handleDragStart(character, 'available', null)}
                                onClick={() => handleSelectCharacter(character)}
                                style={{ borderColor: VOCATION_COLORS[character.vocation] }}
                            >
                                <div className="card-sprite">
                                    <img 
                                        src={VOCATION_ICONS[character.vocation] || VOCATION_ICONS.NONE}
                                        alt={character.vocation}
                                    />
                                </div>
                                <div className="card-info">
                                    <span className="card-name">{character.name}</span>
                                    <span className="card-level">Nível {character.level}</span>
                                    <span className="card-vocation" style={{ color: VOCATION_COLORS[character.vocation] }}>
                                        {character.vocation}
                                    </span>
                                </div>
                                <div className="card-stats">
                                    <span className="stat">❤️ {character.stats.hp}</span>
                                    <span className="stat">💙 {character.stats.mp}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Botão Iniciar Caçada */}
            <div className="party-actions">
                <button 
                    className="btn btn-primary btn-start-hunt"
                    onClick={handleStartHunt}
                    disabled={partySlots.filter(s => s !== null).length === 0}
                >
                    ⚔️ Iniciar Caçada em Party
                </button>
            </div>
        </div>
    );
}

// Componente de membro da party (para uso em outros lugares)
export function PartyMember({ character, isLeader, onRemove, compact = false }) {
    return (
        <div className={`member ${isLeader ? 'leader' : ''} ${compact ? 'compact' : ''} ${character?.dead ? 'dead' : ''}`}>
            {character ? (
                <>
                    <div className="m-avatar">
                        <img 
                            src={VOCATION_ICONS[character.vocation] || VOCATION_ICONS.NONE}
                            alt={character.vocation}
                        />
                    </div>
                    <div className="m-info">
                        <span className="m-name">{character.name}</span>
                        <span className="m-lvl">Lv. {character.level}</span>
                    </div>
                    {isLeader && <span className="m-crown">👑</span>}
                    {onRemove && (
                        <button className="m-remove" onClick={() => onRemove(character.id)}>✕</button>
                    )}
                </>
            ) : (
                <div className="m-empty">Vazio</div>
            )}
        </div>
    );
}

export default PartyManager;
