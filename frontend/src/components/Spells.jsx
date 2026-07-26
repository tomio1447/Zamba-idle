import React, { useState, useEffect } from 'react';
import { SPELLS } from '../config/spellsConfig.js';

// Magias importadas do Canary original (spellsConfig.js)

export default function Spells({ character, onCastSpell, isActive }) {
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [cooldowns, setCooldowns] = useState({});
  const [spellHistory, setSpellHistory] = useState([]);

  const spells = SPELLS[character?.vocation] || SPELLS.KNIGHT;
  
  // Filtrar magias disponíveis por nível
  const availableSpells = spells.filter(spell => character?.level >= spell.level);
  const lockedSpells = spells.filter(spell => character?.level < spell.level);

  const handleCastSpell = (spell) => {
    // Verificar cooldown
    if (cooldowns[spell.id] && Date.now() < cooldowns[spell.id]) {
      return;
    }

    // Verificar mana
    if (character.stats.mp < spell.mana) {
      return;
    }

    // Aplicar cooldown
    setCooldowns(prev => ({
      ...prev,
      [spell.id]: Date.now() + 2000
    }));

    // Adicionar ao histórico
    setSpellHistory(prev => [...prev.slice(-10), {
      ...spell,
      timestamp: Date.now()
    }]);

    // Callback
    if (onCastSpell) {
      onCastSpell(spell);
    }

    setSelectedSpell(spell);
  };

  const getSpellTypeColor = (type) => {
    switch (type) {
      case 'heal': return '#4ade80';
      case 'attack': return '#ef4444';
      case 'aoe': return '#f59e0b';
      case 'buff': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const isOnCooldown = (spellId) => {
    return cooldowns[spellId] && Date.now() < cooldowns[spellId];
  };

  const getCooldownRemaining = (spellId) => {
    if (!cooldowns[spellId]) return 0;
    return Math.max(0, Math.ceil((cooldowns[spellId] - Date.now()) / 1000));
  };

  if (!isActive) return null;

  return (
    <div className="spells-panel">
      <div className="spells-header">
        <h3>✨ Spells - {character?.vocation}</h3>
        <span className="mana-display">
          💙 {character?.stats.mp} MP
        </span>
      </div>

      <div className="spells-grid">
        {/* Magias disponíveis */}
        {availableSpells.map(spell => {
          const onCooldown = isOnCooldown(spell.id);
          const cooldownRemaining = getCooldownRemaining(spell.id);
          const canCast = !onCooldown && character?.stats.mp >= spell.mana;

          return (
            <button
              key={spell.id}
              className={`spell-card ${onCooldown ? 'cooldown' : ''} ${!canCast ? 'no-mana' : ''}`}
              onClick={() => canCast && handleCastSpell(spell)}
              disabled={!canCast}
              title={spell.description}
            >
              <div className="spell-icon" style={{ borderColor: getSpellTypeColor(spell.type) }}>
                {spell.icon}
              </div>
              <div className="spell-info">
                <span className="spell-name">{spell.name}</span>
                <span className="spell-cost">{spell.mana} MP</span>
              </div>
              {spell.heal && <span className="spell-effect">+{spell.heal} HP</span>}
              {spell.damage > 0 && <span className="spell-effect">{spell.damage} DMG</span>}
              {spell.type === 'buff' && <span className="spell-effect">BUFF</span>}
              {onCooldown && (
                <span className="spell-cooldown">{cooldownRemaining}s</span>
              )}
            </button>
          );
        })}

        {/* Magias bloqueadas */}
        {lockedSpells.map(spell => (
          <div key={spell.id} className="spell-card locked">
            <div className="spell-icon locked">🔒</div>
            <div className="spell-info">
              <span className="spell-name">{spell.name}</span>
              <span className="spell-level">Lv. {spell.level}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Histórico de magias */}
      {spellHistory.length > 0 && (
        <div className="spell-history">
          <h4>📜 Últimas Magias</h4>
          <div className="history-list">
            {spellHistory.slice(-5).reverse().map((spell, idx) => (
              <span key={idx} className="history-item">
                {spell.icon} {spell.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
