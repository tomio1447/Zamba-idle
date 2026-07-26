import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import GameCanvas from '../components/GameCanvas';
import BossShop from '../components/BossShop';

const VOCATION_ICONS = {
  KNIGHT: '⚔️',
  PALADIN: '🏹',
  SORCERER: '🔥',
  DRUID: '❄️',
  NONE: '👤',
};

export default function GameDashboard({ character, onUpdate }) {
  const [char, setChar] = useState(character);
  const [zones, setZones] = useState([]);
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBossShop, setShowBossShop] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Carregar zonas de caçada
  useEffect(() => {
    api.getZones().then(setZones).catch(console.error);
  }, []);

  // Timer
  useEffect(() => {
    if (!char.isHunting) return;
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [char.isHunting]);

  // Atualizar status da instância
  useEffect(() => {
    if (!char.isHunting || !char.currentInstance) {
      setInstance(null);
      return;
    }
    setInstance(char.currentInstance);
  }, [char]);

  const handleCreateInstance = async (zoneId) => {
    try {
      setLoading(true);
      const result = await api.createInstance(char.id, zoneId);
      setChar(result.character);
      setInstance(result.instance);
      setElapsedTime(0);
      onUpdate(result.character);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAttack = async (monsterIndex) => {
    const result = await api.attackMonster(char.id, monsterIndex);
    setChar(result.character);
    if (result.character.currentInstance) {
      setInstance(result.character.currentInstance);
    }
    onUpdate(result.character);
    return result;
  };

  const handleAttackBoss = async () => {
    const result = await api.attackBoss(char.id);
    setChar(result.character);
    if (result.character.currentInstance) {
      setInstance(result.character.currentInstance);
    }
    onUpdate(result.character);
    return result;
  };

  const handleFlee = async () => {
    const result = await api.fleeInstance(char.id);
    setChar(result.character);
    setInstance(null);
    onUpdate(result.character);
    return result;
  };

  const handleSellLoot = async () => {
    try {
      setLoading(true);
      const result = await api.sellLoot(char.id);
      setChar(result.character);
      onUpdate(result.character);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const xpPercentage = (char.experience / char.xpToNextLevel) * 100;
  const currentZone = zones.find(z => z.id === char.currentHunt);

  return (
    <div className="game-dashboard">
      {/* Modal da Boss Shop */}
      {showBossShop && (
        <BossShop 
          character={char} 
          onClose={() => setShowBossShop(false)}
          onUpdate={(updated) => { setChar(updated); onUpdate(updated); }}
        />
      )}

      <div className="dashboard-grid">
        {/* Painel do Personagem */}
        <div className="panel character-panel">
          <div className="panel-header">
            <h3>{VOCATION_ICONS[char.vocation]} {char.name}</h3>
            <span className="vocation-badge">{char.vocation}</span>
          </div>

          <div className="character-info">
            <div className="level-display">
              <span className="level-number">{char.level}</span>
              <span className="level-label">Nível</span>
            </div>

            <div className="xp-bar-container">
              <div className="xp-bar" style={{ width: `${xpPercentage}%` }}></div>
              <span className="xp-text">
                {char.experience.toLocaleString()} / {char.xpToNextLevel.toLocaleString()} XP
              </span>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">❤️</span>
              <span className="stat-val">{char.stats.hp}</span>
              <span className="stat-name">HP</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💙</span>
              <span className="stat-val">{char.stats.mp}</span>
              <span className="stat-name">MP</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⚡</span>
              <span className="stat-val">{char.stamina}/{char.staminaMax}</span>
              <span className="stat-name">Stamina</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💰</span>
              <span className="stat-val gold">{char.gold.toLocaleString()}</span>
              <span className="stat-name">Gold</span>
            </div>
          </div>

          <div className="boss-coins-display">
            <span className="boss-coin-icon">👑</span>
            <span className="boss-coin-value">{char.bossCoins}</span>
            <button className="btn-boss-shop" onClick={() => setShowBossShop(true)}>
              Boss Shop
            </button>
          </div>

          <div className="skills-section">
            <h4>Skills</h4>
            <div className="skills-list">
              {Object.entries(char.skills).map(([skill, value]) => (
                <div key={skill} className="skill-item">
                  <span className="skill-name">{skill.charAt(0).toUpperCase() + skill.slice(1)}</span>
                  <span className="skill-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Área Principal do Jogo */}
        <div className="panel game-panel">
          <div className="panel-header">
            <h3>⚔️ Campo de Batalha</h3>
            {char.isHunting && (
              <span className="hunt-timer">{formatTime(elapsedTime)}</span>
            )}
          </div>

          {char.isHunting && instance ? (
            <div className="game-area">
              {/* Status da Instância */}
              <div className="instance-status">
                <div className="wave-info">
                  <span className="wave-badge">Wave {instance.wave}/{instance.totalWaves}</span>
                  <span className="zone-name">{instance.zoneName}</span>
                  {instance.isBossWave && (
                    <span className="boss-warning">⚠️ WAVE DE BOSS!</span>
                  )}
                </div>
              </div>

              {/* Canvas do Jogo */}
              <GameCanvas 
                character={char}
                instance={instance}
                onAttack={handleAttack}
                onAttackBoss={handleAttackBoss}
                onFlee={handleFlee}
              />

              {/* Mensagem de instância completa */}
              {instance.isCompleted && (
                <div className="instance-complete">
                  <h3>🏆 Instância Completa!</h3>
                  <div className="rewards-summary">
                    <div className="reward-item">
                      <span>XP Ganho:</span>
                      <span>{instance.rewards?.xp || 0}</span>
                    </div>
                    <div className="reward-item">
                      <span>Boss Coins:</span>
                      <span>{instance.rewards?.bossCoins || 0}</span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setInstance(null)}
                  >
                    Continuar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="zone-selector">
              <p className="hunt-info">Escolha uma zona para iniciar uma instância de caçada:</p>
              <div className="zones-list">
                {zones.map(zone => {
                  const isLocked = char.level < zone.minLevel;
                  return (
                    <div 
                      key={zone.id} 
                      className={`zone-card ${isLocked ? 'locked' : ''}`}
                      onClick={() => !isLocked && handleCreateInstance(zone.id)}
                    >
                      <div className="zone-header">
                        <span className="zone-name">{zone.name}</span>
                        {isLocked && <span className="lock-icon">🔒</span>}
                      </div>
                      <div className="zone-info">
                        <span>Nível {zone.minLevel}+</span>
                        <span>XP: {zone.xpGain}/s</span>
                      </div>
                      <p className="zone-desc">{zone.description}</p>
                      <div className="zone-monsters">
                        👾 {zone.monsters.slice(0, 3).join(', ')}...
                      </div>
                      <div className="zone-boss">
                        👑 Boss disponível a cada 10 waves
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Painel de Loot */}
        <div className="panel loot-panel">
          <div className="panel-header">
            <h3>🎒 Loot Pouch</h3>
            <span className="loot-count">{char.lootPouch.length}/{char.lootPouchSlots}</span>
          </div>

          <div className="loot-actions">
            <button 
              className="btn btn-gold" 
              onClick={handleSellLoot}
              disabled={char.lootPouch.length === 0 || loading}
            >
              💰 Vender Tudo
            </button>
          </div>

          <div className="loot-list">
            {char.lootPouch.length === 0 ? (
              <p className="empty-loot">Nenhum loot coletado</p>
            ) : (
              char.lootPouch.map((item, idx) => (
                <div key={idx} className={`loot-item ${item.rare ? 'rare' : ''}`}>
                  <span className="loot-item-name">
                    {item.rare && '✨'} {item.name}
                  </span>
                  <span className="loot-item-qty">x{item.quantity}</span>
                  <span className="loot-item-value">{item.goldValue}g</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Painel de Estatísticas */}
        <div className="panel stats-panel">
          <div className="panel-header">
            <h3>📊 Estatísticas</h3>
          </div>
          <div className="stats-list">
            <div className="stats-row">
              <span>Total XP Ganho:</span>
              <span>{char.totalXpEarned.toLocaleString()}</span>
            </div>
            <div className="stats-row">
              <span>Total Gold Ganho:</span>
              <span className="gold">{char.totalGoldEarned.toLocaleString()}</span>
            </div>
            <div className="stats-row">
              <span>Monstros Mortos:</span>
              <span>{char.totalMonstersKilled.toLocaleString()}</span>
            </div>
            <div className="stats-row">
              <span>Bosses Derrotados:</span>
              <span className="boss-kills">{char.totalBossKills}</span>
            </div>
            <div className="stats-row">
              <span>Boss Coins:</span>
              <span className="boss-coins">{char.bossCoinsEarned}</span>
            </div>
            <div className="stats-row">
              <span>Mortes:</span>
              <span>{char.deaths}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
