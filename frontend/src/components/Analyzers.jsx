import React, { useState, useEffect, useCallback } from 'react';

const TABS = [
  { id: 'overview', name: 'Visão Geral', icon: '📊' },
  { id: 'skills', name: 'Skills', icon: '⚔️' },
  { id: 'loot', name: 'Loot', icon: '🎒' },
  { id: 'monsters', name: 'Monstros', icon: '👾' },
  { id: 'damage', name: 'Dano', icon: '💥' },
  { id: 'log', name: 'Log', icon: '📜' },
];

export default function Analyzers({ character, instance, isActive }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    xpGained: 0,
    goldGained: 0,
    monstersKilled: 0,
    damageDealt: 0,
    damageTaken: 0,
    deaths: 0,
    bossKills: 0,
    bossCoinsEarned: 0,
    sessionStart: Date.now(),
    lootItems: [],
    monsterCounts: {},
    skillGains: { melee: 0, distance: 0, magic: 0, shielding: 0 },
  });
  const [combatLog, setCombatLog] = useState([]);

  // Atualizar stats quando o personagem muda
  useEffect(() => {
    if (character) {
      setStats(prev => ({
        ...prev,
        sessionStart: Date.now(),
      }));
    }
  }, [character?.id]);

  // Registrar evento de combate
  const logEvent = useCallback((type, data) => {
    const event = {
      id: Date.now() + Math.random(),
      type,
      data,
      timestamp: Date.now(),
    };
    
    setCombatLog(prev => [...prev.slice(-100), event]);
    
    // Atualizar stats baseado no tipo
    setStats(prev => {
      const newStats = { ...prev };
      
      switch (type) {
        case 'xp':
          newStats.xpGained += data.amount;
          break;
        case 'gold':
          newStats.goldGained += data.amount;
          break;
        case 'kill':
          newStats.monstersKilled++;
          newStats.xpGained += data.xp || 0;
          newStats.goldGained += data.gold || 0;
          newStats.monsterCounts[data.monsterName] = 
            (newStats.monsterCounts[data.monsterName] || 0) + 1;
          break;
        case 'loot':
          newStats.lootItems.push(data);
          break;
        case 'skill':
          if (newStats.skillGains[data.skillName] !== undefined) {
            newStats.skillGains[data.skillName] += data.amount;
          }
          break;
        case 'damage_dealt':
          newStats.damageDealt += data.amount;
          break;
        case 'damage_taken':
          newStats.damageTaken += data.amount;
          break;
        case 'death':
          newStats.deaths++;
          break;
        case 'boss_kill':
          newStats.bossKills++;
          newStats.bossCoinsEarned += data.bossCoins || 0;
          break;
      }
      
      return newStats;
    });
  }, []);

  // Expor função de log globalmente
  useEffect(() => {
    window.gameAnalyzer = {
      logEvent,
      getStats: () => stats,
    };
    
    return () => {
      delete window.gameAnalyzer;
    };
  }, [logEvent, stats]);

  // Calcular tempo de sessão
  const getSessionTime = () => {
    const seconds = Math.floor((Date.now() - stats.sessionStart) / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calcular XP/hora
  const getXPHour = () => {
    const hours = (Date.now() - stats.sessionStart) / 3600000;
    return hours > 0 ? Math.floor(stats.xpGained / hours) : 0;
  };

  // Calcular Gold/hora
  const getGoldHour = () => {
    const hours = (Date.now() - stats.sessionStart) / 3600000;
    return hours > 0 ? Math.floor(stats.goldGained / hours) : 0;
  };

  // Calcular monstros/hora
  const getMonstersHour = () => {
    const hours = (Date.now() - stats.sessionStart) / 3600000;
    return hours > 0 ? Math.floor(stats.monstersKilled / hours) : 0;
  };

  // Calcular ETA para próximo nível
  const getNextLevelETA = () => {
    const xpPerHour = getXPHour();
    if (xpPerHour <= 0) return null;
    
    const xpToNext = (character?.xpToNextLevel || 0) - (character?.experience || 0);
    const hours = xpToNext / xpPerHour;
    
    if (hours < 0) return null;
    if (hours > 999) return '999h+';
    
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // Agrupar loot
  const getLootSummary = () => {
    const summary = {};
    stats.lootItems.forEach(item => {
      const key = item.id || item.name;
      if (!summary[key]) {
        summary[key] = { ...item, totalQuantity: 0 };
      }
      summary[key].totalQuantity += item.quantity || 1;
    });
    return Object.values(summary).sort((a, b) => b.totalQuantity - a.totalQuantity);
  };

  // Agrupar monstros
  const getMonsterSummary = () => {
    return Object.entries(stats.monsterCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  if (!isActive) return null;

  return (
    <div className="analyzers-panel">
      {/* Abas fixas */}
      <div className="analyzer-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`analyzer-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      <div className="analyzer-content">
        {/* Aba: Visão Geral */}
        {activeTab === 'overview' && (
          <div className="analyzer-overview">
            <div className="stat-cards">
              <div className="stat-card xp">
                <div className="stat-icon">✨</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.xpGained.toLocaleString()}</span>
                  <span className="stat-label">XP Ganho</span>
                </div>
                <div className="stat-rate">{getXPHour().toLocaleString()}/h</div>
              </div>

              <div className="stat-card gold">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.goldGained.toLocaleString()}</span>
                  <span className="stat-label">Gold Ganho</span>
                </div>
                <div className="stat-rate">{getGoldHour().toLocaleString()}/h</div>
              </div>

              <div className="stat-card monsters">
                <div className="stat-icon">💀</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.monstersKilled}</span>
                  <span className="stat-label">Monstros</span>
                </div>
                <div className="stat-rate">{getMonstersHour()}/h</div>
              </div>

              <div className="stat-card time">
                <div className="stat-icon">⏱️</div>
                <div className="stat-info">
                  <span className="stat-value">{getSessionTime()}</span>
                  <span className="stat-label">Tempo</span>
                </div>
              </div>
            </div>

            <div className="analyzer-details">
              <div className="detail-row">
                <span>XP/Hora:</span>
                <span className="detail-value">{getXPHour().toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span>Gold/Hora:</span>
                <span className="detail-value gold">{getGoldHour().toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span>Monstros/Hora:</span>
                <span className="detail-value">{getMonstersHour()}</span>
              </div>
              <div className="detail-row">
                <span>Próximo nível:</span>
                <span className="detail-value">{getNextLevelETA() || 'Calculando...'}</span>
              </div>
              <div className="detail-row">
                <span>Bosses:</span>
                <span className="detail-value boss">{stats.bossKills}</span>
              </div>
              <div className="detail-row">
                <span>Boss Coins:</span>
                <span className="detail-value">{stats.bossCoinsEarned}</span>
              </div>
              <div className="detail-row">
                <span>Mortes:</span>
                <span className="detail-value deaths">{stats.deaths}</span>
              </div>
            </div>
          </div>
        )}

        {/* Aba: Skills */}
        {activeTab === 'skills' && (
          <div className="analyzer-skills">
            <h4>⚔️ Progresso de Skills</h4>
            <div className="skills-grid">
              {Object.entries(character?.skills || {}).map(([skill, value]) => {
                const gain = stats.skillGains[skill] || 0;
                const prevValue = value - gain;
                const gainPercent = prevValue > 0 ? ((gain / prevValue) * 100) : 0;
                
                return (
                  <div key={skill} className="skill-card">
                    <div className="skill-header">
                      <span className="skill-name">
                        {skill === 'melee' && '⚔️'}
                        {skill === 'distance' && '🏹'}
                        {skill === 'magic' && '✨'}
                        {skill === 'shielding' && '🛡️'}
                        {skill === 'fishing' && '🎣'}
                        {' '}{skill.charAt(0).toUpperCase() + skill.slice(1)}
                      </span>
                      <span className="skill-level">{value}</span>
                    </div>
                    <div className="skill-bar-container">
                      <div 
                        className="skill-bar" 
                        style={{ width: `${Math.min(100, (value % 10)} * 100)}` }}
                      ></div>
                    </div>
                    <div className="skill-gain">
                      {gain > 0 && <span className="gain-positive">+{gain} esta sessão</span>}
                      {gainPercent > 0 && (
                        <span className="gain-percent">+{gainPercent.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="skills-summary">
              <h5>📈 Resumo de Skills</h5>
              <div className="summary-row">
                <span>Total de melhorias:</span>
                <span>{Object.values(stats.skillGains).reduce((a, b) => a + b, 0)}</span>
              </div>
              <div className="summary-row">
                <span>Skill com mais ganho:</span>
                <span>
                  {Object.entries(stats.skillGains)
                    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhuma'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Aba: Loot */}
        {activeTab === 'loot' && (
          <div className="analyzer-loot">
            <h4>🎒 Loot Coletado</h4>
            {getLootSummary().length === 0 ? (
              <p className="empty-message">Nenhum loot coletado nesta sessão</p>
            ) : (
              <div className="loot-table">
                <div className="loot-header">
                  <span>Item</span>
                  <span>Qtd</span>
                  <span>Valor</span>
                </div>
                {getLootSummary().map((item, idx) => (
                  <div key={idx} className={`loot-row ${item.rare ? 'rare' : ''}`}>
                    <span className="loot-name">
                      {item.rare && '✨'} {item.name}
                    </span>
                    <span className="loot-qty">{item.totalQuantity}</span>
                    <span className="loot-value">
                      {((item.goldValue || 0) * item.totalQuantity).toLocaleString()}g
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Aba: Monstros */}
        {activeTab === 'monsters' && (
          <div className="analyzer-monsters">
            <h4>👾 Monstros Derrotados</h4>
            {getMonsterSummary().length === 0 ? (
              <p className="empty-message">Nenhum monstro derrotado nesta sessão</p>
            ) : (
              <div className="monster-table">
                <div className="monster-header">
                  <span>Monstro</span>
                  <span>Qtd</span>
                  <span>%</span>
                </div>
                {getMonsterSummary().map((monster, idx) => (
                  <div key={idx} className="monster-row">
                    <span className="monster-name">{monster.name}</span>
                    <span className="monster-count">{monster.count}</span>
                    <span className="monster-percent">
                      {((monster.count / stats.monstersKilled) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Aba: Dano */}
        {activeTab === 'damage' && (
          <div className="analyzer-damage">
            <h4>💥 Estatísticas de Dano</h4>
            <div className="damage-stats">
              <div className="damage-card dealt">
                <span className="damage-icon">⚔️</span>
                <span className="damage-value">{stats.damageDealt.toLocaleString()}</span>
                <span className="damage-label">Dano Causado</span>
              </div>
              <div className="damage-card taken">
                <span className="damage-icon">🩸</span>
                <span className="damage-value">{stats.damageTaken.toLocaleString()}</span>
                <span className="damage-label">Dano Recebido</span>
              </div>
            </div>
            <div className="damage-details">
              <div className="detail-row">
                <span>Média de dano por ataque:</span>
                <span>
                  {stats.monstersKilled > 0 
                    ? Math.floor(stats.damageDealt / stats.monstersKilled) 
                    : 0}
                </span>
              </div>
              <div className="detail-row">
                <span>Ratio Dano/Monstro:</span>
                <span>
                  {stats.monstersKilled > 0 
                    ? (stats.damageDealt / stats.monstersKilled).toFixed(1) 
                    : 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Aba: Log */}
        {activeTab === 'log' && (
          <div className="analyzer-log">
            <h4>📜 Log de Combate</h4>
            <div className="log-container">
              {combatLog.length === 0 ? (
                <p className="empty-message">Nenhum evento registrado</p>
              ) : (
                combatLog.slice(-50).reverse().map(event => (
                  <div key={event.id} className={`log-entry ${event.type}`}>
                    <span className="log-time">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="log-message">
                      {event.type === 'kill' && `💀 ${event.data.monsterName} morto`}
                      {event.type === 'xp' && `✨ +${event.data.amount} XP`}
                      {event.type === 'gold' && `💰 +${event.data.amount} Gold`}
                      {event.type === 'loot' && `🎒 ${event.data.name} x${event.data.quantity}`}
                      {event.type === 'skill' && `📈 ${event.data.skillName} +${event.data.amount}`}
                      {event.type === 'damage_dealt' && `⚔️ ${event.data.amount} dano`}
                      {event.type === 'damage_taken' && `🩸 ${event.data.amount} dano`}
                      {event.type === 'death' && `💀 Você morreu`}
                      {event.type === 'boss_kill' && `👑 Boss ${event.data.bossName} derrotado`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
