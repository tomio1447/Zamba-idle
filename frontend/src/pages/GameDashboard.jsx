import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { getHelperSystem } from '../utils/helper.js';
import TibiaGameCanvas from '../components/TibiaGameCanvas';
import BossShop from '../components/BossShop';
import SpriteUploader from '../components/SpriteUploader';
import Analyzers from '../components/Analyzers';
import Helper from '../components/Helper';
import Spells from '../components/Spells';
import HuntsGrid from '../components/HuntsGrid';
import { HUNTS_GRID } from '../config/huntsConfig';
import BossBar from '../components/BossBar';
import Icon, { MaskIcon } from '../components/Icon';

// Ícones SVG do BaiakIdle
const ICONS = {
  helper: '/icons/helper.svg',
  settings: '/icons/settings.svg',
  skills: '/icons/skills.svg',
  itens: '/icons/itens.svg',
  aparencia: '/icons/aparencia.svg',
  leave: '/icons/leave.svg',
  kick: '/icons/kick.svg',
  skull: '/icons/skull.svg',
  vipCrown: '/icons/vip-crown.svg',
  goldcoin: '/icons/icon-goldcoin.png',
  coin: '/icons/coin.gif',
  discord: '/icons/discord.svg',
  logout: '/icons/sair.svg',
  cyclopedia: '/icons/cyclopedia.svg',
  prey: '/icons/prey.svg',
  build: '/icons/build.svg',
  exercise: '/icons/exercise.svg',
  forge: '/icons/forja.svg',
  imbue: '/icons/imbue.svg',
  merchant: '/icons/mercador.svg',
  arena: '/icons/arena.svg',
  shop: '/icons/loja.svg',
  chest: '/icons/armazem.svg',
  market: '/icons/market.svg',
  guild: '/icons/guild.svg',
  vip: '/icons/vip.svg',
  highscore: '/icons/rank.svg',
  daily: '/icons/daily.svg',
};

const VOCATION_ICONS = {
  KNIGHT: '/icons/vocations/knight.svg',
  PALADIN: '/icons/vocations/paladin.svg',
  SORCERER: '/icons/vocations/sorcerer.svg',
  DRUID: '/icons/vocations/druid.svg',
  MONK: '/icons/vocations/monk.svg',
  NONE: '/icons/vocations/none.svg',
};

export default function GameDashboard({ character, onUpdate }) {
  const [char, setChar] = useState(character);
  const [zones, setZones] = useState(HUNTS_GRID);
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBossShop, setShowBossShop] = useState(false);
  const [showSpriteUploader, setShowSpriteUploader] = useState(false);
  const [spritesLoaded, setSpritesLoaded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAnalyzers, setShowAnalyzers] = useState(true);
  const [bossSkipCooldown, setBossSkipCooldown] = useState(0);

  // Zonas de caçada carregadas localmente (huntsConfig)
  // Se a API estiver disponível, pode ser sincronizada futuramente.
  /*
  useEffect(() => {
    api.getZones().then(setZones).catch(console.error);
  }, []);
  */

  const [helperSystem, setHelperSystem] = useState(null);

  // Inicializar sistema de Helper
  useEffect(() => {
    if (!char || !char.id) return;
    
    const callbacks = {
      onAttack: (monsterIndex) => handleAttack(monsterIndex || 0),
      onAttackBoss: () => handleAttackBoss(),
      onFlee: () => handleFlee(),
      onSellLoot: () => handleSellLoot(),
      onCastSpell: (spell) => console.log('Auto-cast spell:', spell),
      onCollectLoot: () => console.log('Auto-collect loot'),
      onEatFood: () => console.log('Auto-eat food'),
    };
    
    const helper = getHelperSystem({ ...char, currentInstance: instance }, callbacks);
    setHelperSystem(helper);
    
    return () => {
      if (helper) helper.stopAll();
    };
  }, [char.id]);

  // Timer
  useEffect(() => {
    if (!char.isHunting) return;
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [char.isHunting]);

  // Sistema de Auto-Attack e Auto-Monster-Attack (Canary/BaiakIdle)
  useEffect(() => {
    if (!char.isHunting || !helperSystem) return;

    // Auto-Attack do jogador
    if (helperSystem.enabled.autoAttack) {
      const attackInterval = setInterval(async () => {
        if (helperSystem && helperSystem.enabled.autoAttack && char.isHunting) {
          try {
            const result = await api.autoAttack(char.id);
            if (result) {
              setChar(result.character || char);
              if (result.character?.currentInstance) {
                setInstance(result.character.currentInstance);
              }
              if (onUpdate && result.character) onUpdate(result.character);
            }
          } catch (e) {
            console.error('Auto-attack error:', e.message);
          }
        }
      }, 1000);
      return () => clearInterval(attackInterval);
    }
  }, [char.isHunting, helperSystem?.enabled?.autoAttack, char.id]);

  // Auto-Monster-Attack (monstros atacam jogador automaticamente)
  useEffect(() => {
    if (!char.isHunting || !helperSystem) return;

    // Nota: auto-monster-attack é ativado quando o jogador está caçando
    // e os monstros vivos atacam automaticamente a cada intervalo
    const monsterInterval = setInterval(async () => {
      if (char.isHunting && instance && instance.monsters && instance.monsters.some(m => m.hp > 0)) {
        try {
          const result = await api.autoMonsterAttack(char.id);
          if (result) {
            setChar(result.character || char);
            if (result.character?.currentInstance) {
              setInstance(result.character.currentInstance);
            }
            if (onUpdate && result.character) onUpdate(result.character);
          }
        } catch (e) {
          console.error('Auto-monster-attack error:', e.message);
        }
      }
    }, 2000);
    return () => clearInterval(monsterInterval);
  }, [char.isHunting, instance, char.id]);

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

  const handleSpritesLoaded = (loaded) => {
    setSpritesLoaded(loaded);
    setShowSpriteUploader(false);
  };

  // Pular Boss
  const handleSkipBoss = () => {
    if (bossSkipCooldown > 0) return;
    
    // Aplicar penalidade e voltar para cidade
    handleFlee();
    
    // Iniciar cooldown de 20 segundos
    setBossSkipCooldown(20000);
    const interval = setInterval(() => {
      setBossSkipCooldown(prev => {
        if (prev <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const xpPercentage = (char.experience / char.xpToNextLevel) * 100;
  const currentZone = zones.find(z => z.id === char.currentHunt);

  // Stats adicionais para HUD igual ao BaiakIdle
  const hudStats = {
    stamina: `${char.stamina}/${char.staminaMax}`,
    xpRate: char.isHunting ? Math.round(char.experience / Math.max(elapsedTime, 1)) : 0,
    goldRate: char.isHunting ? Math.round(char.gold / Math.max(elapsedTime, 1)) : 0,
    killRate: char.isHunting ? Math.round(char.totalMonstersKilled / Math.max(elapsedTime, 1)) : 0,
    damageTaken: char.stats.hp < 150 ? 150 - char.stats.hp : 0,
    lootRate: char.lootPouch.length,
  };

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

      {/* Modal do Sprite Uploader */}
      {showSpriteUploader && (
        <div className="modal-overlay" onClick={() => setShowSpriteUploader(false)}>
          <div className="modal sprite-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎮 Carregar Sprites do Tibia</h2>
              <button className="modal-close" onClick={() => setShowSpriteUploader(false)}>✕</button>
            </div>
            <SpriteUploader onSpritesLoaded={handleSpritesLoaded} />
          </div>
        </div>
      )}

      {/* HUD no topo igual ao BaiakIdle */}
      <div className="baiakidle-hud">
        <div className="hud-row hud-top">
          <div className="hud-item hud-stamina">
            <span className="hud-label">STAMINA</span>
            <span className="hud-value">{hudStats.stamina}</span>
          </div>
          <div className="hud-item hud-boosts">
            <span className="hud-label">BOOSTS</span>
            <span className="hud-value">{char.activeBoosts?.xpBoost ? '2x XP' : 'Nenhum'}</span>
          </div>
          <div className="hud-item hud-skills">
            <span className="hud-label">SKILLS</span>
            <span className="hud-value">Melee: {char.skills?.melee || 10}</span>
          </div>
          <div className="hud-item hud-damage">
            <span className="hud-label">DAMAGE</span>
            <span className="hud-value">Session: {hudStats.damageTaken}</span>
          </div>
          <div className="hud-item hud-loot">
            <span className="hud-label">LOOT ANALYZER</span>
            <span className="hud-value">{hudStats.lootRate} itens</span>
          </div>
        </div>
        <div className="hud-row hud-middle">
          <div className="hud-info hud-zone">
            <span>Zone: <strong>{currentZone?.name || 'Cidade'}</strong></span>
            <span>Level: <strong>{char.level}</strong></span>
          </div>
          <div className="hud-timer hud-center">
            <span>Tempo: <strong>{formatTime(elapsedTime)}</strong></span>
          </div>
          <div className="hud-rates hud-right">
            <span>XP/s: <strong className="rate-green">{hudStats.xpRate}</strong></span>
            <span>Gold/s: <strong className="rate-gold">{hudStats.goldRate}</strong></span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Painel do Personagem */}
        <div className="panel character-panel">
          <div className="panel-header">
            <h3>
              <Icon src={VOCATION_ICONS[char.vocation]} size={20} />
              {char.name}
            </h3>
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
              <Icon src="/icons/status/hp.png" size={16} />
              <span className="stat-val">{char.stats.hp}</span>
              <span className="stat-name">HP</span>
            </div>
            <div className="stat-item">
              <Icon src="/icons/status/mana.png" size={16} />
              <span className="stat-val">{char.stats.mp}</span>
              <span className="stat-name">MP</span>
            </div>
            <div className="stat-item">
              <Icon src="/icons/status/stamina.png" size={16} />
              <span className="stat-val">{char.stamina}/{char.staminaMax}</span>
              <span className="stat-name">Stamina</span>
            </div>
            <div className="stat-item">
              <Icon src={ICONS.goldcoin} size={16} />
              <span className="stat-val gold">{char.gold.toLocaleString()}</span>
              <span className="stat-name">Gold</span>
            </div>
          </div>

          <div className="boss-coins-display">
            <Icon src={ICONS.vipCrown} size={20} />
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
            <h3><MaskIcon icon={ICONS.arena} size={18} /> Campo de Batalha</h3>
            <div className="panel-actions">
              {char.isHunting && (
                <span className="hunt-timer">{formatTime(elapsedTime)}</span>
              )}
              <button 
                className="btn-sprite-upload"
                onClick={() => setShowSpriteUploader(true)}
                title="Carregar sprites do Tibia"
              >
                {spritesLoaded ? '✅ Sprites' : '🎨 Sprites'}
              </button>
            </div>
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

              {/* Boss Bar (se for wave de boss) */}
              {instance.isBossWave && instance.currentBoss && (
                <BossBar 
                  boss={instance.monsters.find(m => m.isBoss)}
                  onSkipBoss={handleSkipBoss}
                  canSkip={bossSkipCooldown === 0}
                  cooldownRemaining={bossSkipCooldown}
                />
              )}

              {/* Canvas do Jogo com Sprites do Tibia */}
              <TibiaGameCanvas 
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
              <HuntsGrid 
                zones={zones}
                playerLevel={char.level}
                onSelectHunt={handleCreateInstance}
                currentHunt={char.currentHunt}
              />
            </div>
          )}
        </div>

        {/* Painel de Loot */}
        <div className="panel loot-panel">
          <div className="panel-header">
            <h3><MaskIcon icon={ICONS.chest} size={18} /> Loot Pouch</h3>
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
            <h3><MaskIcon icon={ICONS.cyclopedia} size={18} /> Estatísticas</h3>
            <button 
              className="btn-toggle-analyzers"
              onClick={() => setShowAnalyzers(!showAnalyzers)}
            >
              {showAnalyzers ? '🔽 Analyzers' : '🔼 Analyzers'}
            </button>
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

        {/* Painel de Analyzers */}
        {showAnalyzers && (
          <div className="panel analyzers-panel-container">
            <Analyzers 
              character={char}
              instance={instance}
              isActive={char.isHunting}
            />
          </div>
        )}

        {/* Painel de Helper e Spells */}
        <div className="panel helper-spells-panel">
          <div className="helper-spells-grid">
            <Helper 
              character={char}
              onToggle={(feature, enabled) => {
                if (helperSystem) {
                  helperSystem.toggle(feature);
                  console.log(`Helper ${feature}: ${helperSystem.enabled[feature] ? 'ON' : 'OFF'}`);
                } else {
                  console.log(`Helper ${feature}: ${enabled ? 'ON' : 'OFF'} (sistema não inicializado)`);
                }
              }}
              isActive={true}
            />
            <Spells 
              character={char}
              onCastSpell={(spell) => console.log('Cast spell:', spell)}
              isActive={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
