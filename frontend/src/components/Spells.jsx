import React, { useState, useEffect } from 'react';

// Magias por vocação
const SPELLS = {
  KNIGHT: [
    { id: 'exura', name: 'Exura', mana: 20, heal: 50, level: 1, type: 'heal', icon: '💚', description: 'Cura básica de 50 HP' },
    { id: 'exori', name: 'Exori', mana: 30, damage: 80, level: 1, type: 'attack', icon: '⚔️', description: 'Golpe físico de 80 dano' },
    { id: 'exori_min', name: 'Exori Min', mana: 80, damage: 200, level: 40, type: 'attack', icon: '🗡️', description: 'Golpe médio de 200 dano' },
    { id: 'exori_gran', name: 'Exori Gran', mana: 60, damage: 150, level: 30, type: 'attack', icon: '💥', description: 'Golpe forte de 150 dano' },
    { id: 'exori_mas', name: 'Exori Mas', mana: 100, damage: 250, level: 50, type: 'aoe', icon: '🌊', description: 'Golpe em área de 250 dano' },
  ],
  PALADIN: [
    { id: 'exura_san', name: 'Exura San', mana: 30, heal: 80, level: 20, type: 'heal', icon: '💚', description: 'Cura sagrada de 80 HP' },
    { id: 'exori_san', name: 'Exori San', mana: 40, damage: 100, level: 1, type: 'attack', icon: '🏹', description: 'Tiro sagrado de 100 dano' },
    { id: 'exori_con', name: 'Exori Con', mana: 60, damage: 160, level: 35, type: 'attack', icon: '🎯', description: 'Tiro concentrado de 160 dano' },
    { id: 'exevo_mas_san', name: 'Exevo Mas San', mana: 80, damage: 200, level: 40, type: 'aoe', icon: '🌧️', description: 'Chuva de flechas de 200 dano' },
  ],
  SORCERER: [
    { id: 'exura_gran', name: 'Exura Gran', mana: 40, heal: 120, level: 40, type: 'heal', icon: '💚', description: 'Cura maior de 120 HP' },
    { id: 'exori_vis', name: 'Exori Vis', mana: 40, damage: 120, level: 1, type: 'attack', icon: '⚡', description: 'Golpe de energia de 120 dano' },
    { id: 'exori_flam', name: 'Exori Flam', mana: 50, damage: 140, level: 25, type: 'attack', icon: '🔥', description: 'Golpe de fogo de 140 dano' },
    { id: 'exori_gran_vis', name: 'Exori Gran Vis', mana: 70, damage: 190, level: 38, type: 'attack', icon: '💫', description: 'Golpe de energia forte de 190 dano' },
    { id: 'exevo_mas_vis', name: 'Exevo Mas Vis', mana: 100, damage: 280, level: 45, type: 'aoe', icon: '💥', description: 'Explosão de energia de 280 dano' },
  ],
  DRUID: [
    { id: 'exura_gran_mas_res', name: 'Exura Gran Mas Res', mana: 50, heal: 150, level: 50, type: 'heal', icon: '💚', description: 'Cura ressurreição de 150 HP' },
    { id: 'exori_tera', name: 'Exori Tera', mana: 40, damage: 110, level: 1, type: 'attack', icon: '🌍', description: 'Golpe de terra de 110 dano' },
    { id: 'exori_frigo', name: 'Exori Frigo', mana: 50, damage: 130, level: 25, type: 'attack', icon: '❄️', description: 'Golpe de gelo de 130 dano' },
    { id: 'exori_gran_tera', name: 'Exori Gran Tera', mana: 70, damage: 180, level: 38, type: 'attack', icon: '🌋', description: 'Golpe de terra forte de 180 dano' },
    { id: 'exevo_mas_tera', name: 'Exevo Mas Tera', mana: 100, damage: 260, level: 45, type: 'aoe', icon: '🌪️', description: 'Terremoto de 260 dano' },
  ],
  MONK: [
    { id: 'healing_circle', name: 'Healing Circle', mana: 35, heal: 100, level: 30, type: 'heal', icon: '💚', description: 'Cura em círculo de 100 HP' },
    { id: 'chi_strike', name: 'Chi Strike', mana: 35, damage: 90, level: 1, type: 'attack', icon: '👊', description: 'Golpe de chi de 90 dano' },
    { id: 'inner_focus', name: 'Inner Focus', mana: 40, damage: 0, level: 20, type: 'buff', icon: '🧘', description: 'Aumenta dano em 20%' },
    { id: 'tiger_slash', name: 'Tiger Slash', mana: 70, damage: 180, level: 35, type: 'attack', icon: '🐯', description: 'Golpe do tigre de 180 dano' },
    { id: 'dragon_fist', name: 'Dragon Fist', mana: 90, damage: 240, level: 50, type: 'attack', icon: '🐉', description: 'Punho do dragão de 240 dano' },
  ],
};

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
