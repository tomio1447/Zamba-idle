import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getSpriteLoader, MONSTER_SPRITES, VOCATION_SPRITES } from '../utils/spriteLoader';

// Cache de sprites carregados
const spriteCache = new Map();

export default function TibiaGameCanvas({ character, instance, onAttack, onAttackBoss, onFlee }) {
  const canvasRef = useRef(null);
  const [spritesLoaded, setSpritesLoaded] = useState(false);
  const [animations, setAnimations] = useState([]);
  const [combatLog, setCombatLog] = useState([]);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [loadingSprites, setLoadingSprites] = useState(true);

  // Carregar sprites do client Tibia
  useEffect(() => {
    const loader = getSpriteLoader();
    
    // Tentar carregar dos arquivos locais
    loader.loadFromFiles('/sprites/Tibia.spr', '/sprites/Tibia.dat')
      .then(success => {
        if (success) {
          setSpritesLoaded(true);
          setLoadingSprites(false);
        } else {
          // Se não conseguir carregar, usar fallback visual
          setLoadingSprites(false);
        }
      })
      .catch(() => {
        setLoadingSprites(false);
      });
  }, []);

  // Adicionar ao log de combate
  const addCombatLog = useCallback((message, type = 'normal') => {
    setCombatLog(prev => [...prev.slice(-20), { message, type, id: Date.now() + Math.random() }]);
  }, []);

  // Efeito de shake na tela
  const triggerShake = useCallback(() => {
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 200);
  }, []);

  // Desenhar sprite no canvas
  const drawSprite = useCallback((ctx, spriteId, x, y, width = 32, height = 32, centered = true) => {
    const loader = getSpriteLoader();
    
    if (spriteCache.has(spriteId)) {
      const cached = spriteCache.get(spriteId);
      if (cached) {
        const drawX = centered ? x - width / 2 : x;
        const drawY = centered ? y - height / 2 : y;
        ctx.drawImage(cached, drawX, drawY, width, height);
        return true;
      }
    }

    if (spritesLoaded) {
      const image = loader.getSpriteImage(spriteId);
      if (image) {
        spriteCache.set(spriteId, image);
        const drawX = centered ? x - width / 2 : x;
        const drawY = centered ? y - height / 2 : y;
        ctx.drawImage(image, drawX, drawY, width, height);
        return true;
      }
    }
    
    return false;
  }, [spritesLoaded]);

  // Desenhar no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpar canvas com fundo escuro
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, width, height);

    // Desenhar chão estilo Tibia (tiles)
    drawTibiaFloor(ctx, width, height);

    // Desenhar personagem
    if (character) {
      drawCharacter(ctx, 120, height / 2, character);
    }

    // Desenhar monstros
    if (instance && instance.monsters) {
      const aliveMonsters = instance.monsters.filter(m => m.hp > 0);
      
      aliveMonsters.forEach((monster, index) => {
        const isBoss = monster.isBoss;
        const x = 380 + (index % 3) * 140;
        const y = 120 + Math.floor(index / 3) * 160;
        
        if (isBoss) {
          drawBoss(ctx, width / 2 + 150, height / 2, monster);
        } else {
          drawMonster(ctx, x, y, monster);
        }
      });
    }

    // Desenhar UI overlay
    drawUIOverlay(ctx, width, height);

  }, [character, instance, spritesLoaded, drawSprite]);

  // Desenhar chão estilo Tibia
  const drawTibiaFloor = (ctx, width, height) => {
    const tileSize = 32;
    
    for (let x = 0; x < width; x += tileSize) {
      for (let y = 0; y < height; y += tileSize) {
        // Alternar cores para simular tiles
        const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        ctx.fillStyle = isEven ? '#1a1a2e' : '#16162a';
        ctx.fillRect(x, y, tileSize, tileSize);
        
        // Borda sutil dos tiles
        ctx.strokeStyle = '#222240';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }
  };

  // Desenhar personagem
  const drawCharacter = (ctx, x, y, character) => {
    const vocSprite = VOCATION_SPRITES[character.vocation] || VOCATION_SPRITES.NONE;
    const spriteId = vocSprite.male;
    
    // Tentar desenhar sprite real
    const drawn = drawSprite(ctx, spriteId, x, y, 48, 48);
    
    if (!drawn) {
      // Fallback: desenhar representação visual
      // Corpo
      ctx.fillStyle = getVocationColor(character.vocation);
      ctx.beginPath();
      ctx.roundRect(x - 20, y - 20, 40, 40, 4);
      ctx.fill();
      
      // Borda
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Efeito de brilho
      ctx.shadowColor = getVocationColor(character.vocation);
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Nome do personagem
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(character.name, x, y + 35);

    // Nível
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.fillText('Lv.' + character.level, x, y - 30);

    // Barra de HP
    const hpWidth = 50;
    const hpHeight = 6;
    const hpX = x - hpWidth / 2;
    const hpY = y - 25;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(hpX, hpY, hpWidth, hpHeight);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(hpX, hpY, hpWidth, hpHeight);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(hpX, hpY, hpWidth, hpHeight);
  };

  // Desenhar monstro
  const drawMonster = (ctx, x, y, monster) => {
    const spriteId = MONSTER_SPRITES[monster.name] || 282;
    
    const drawn = drawSprite(ctx, spriteId, x, y, 40, 40);
    
    if (!drawn) {
      // Fallback
      ctx.fillStyle = getMonsterColor(monster.name);
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Barra de HP
    const hpPercent = monster.hp / monster.maxHp;
    const hpWidth = 44;
    const hpHeight = 6;
    
    ctx.fillStyle = '#222';
    ctx.fillRect(x - hpWidth / 2, y - 35, hpWidth, hpHeight);
    
    const hpColor = hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444';
    ctx.fillStyle = hpColor;
    ctx.fillRect(x - hpWidth / 2, y - 35, hpWidth * hpPercent, hpHeight);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - hpWidth / 2, y - 35, hpWidth, hpHeight);

    // Nome
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(monster.name, x, y + 30);
  };

  // Desenhar Boss
  const drawBoss = (ctx, x, y, boss) => {
    const spriteId = MONSTER_SPRITES[boss.name] || 35;
    
    // Aura do boss
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 80);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.2)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 80, 0, Math.PI * 2);
    ctx.fill();

    // Desenhar sprite do boss (maior)
    const drawn = drawSprite(ctx, spriteId, x, y, 64, 64);
    
    if (!drawn) {
      // Fallback para boss
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.arc(x, y, 35, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Coroa
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(x - 20, y - 40);
      ctx.lineTo(x - 10, y - 55);
      ctx.lineTo(x, y - 45);
      ctx.lineTo(x + 10, y - 55);
      ctx.lineTo(x + 20, y - 40);
      ctx.closePath();
      ctx.fill();
    }

    // Barra de HP do boss (maior)
    const hpPercent = boss.hp / boss.maxHp;
    const hpWidth = 80;
    const hpHeight = 10;
    
    ctx.fillStyle = '#111';
    ctx.fillRect(x - hpWidth / 2, y - 60, hpWidth, hpHeight);
    
    const hpColor = hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444';
    ctx.fillStyle = hpColor;
    ctx.fillRect(x - hpWidth / 2, y - 60, hpWidth * hpPercent, hpHeight);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - hpWidth / 2, y - 60, hpWidth, hpHeight);

    // Texto HP
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(boss.hp + '/' + boss.maxHp, x, y - 52);

    // Nome do boss
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillText('👑 ' + boss.name, x, y + 50);

    // Texto BOSS
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.fillText('⚠️ BOSS ⚠️', x, y + 65);
  };

  // Desenhar overlay de UI
  const drawUIOverlay = (ctx, width, height) => {
    // Borda decorativa
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, width - 4, height - 4);
  };

  // Handler de ataque
  const handleAttack = async (monsterIndex) => {
    try {
      const result = await onAttack(monsterIndex);
      triggerShake();
      
      if (result.killed) {
        addCombatLog('💀 ' + result.monsterName + ' morreu! +' + (result.rewards?.xp || 0) + ' XP', 'kill');
      } else {
        addCombatLog('⚔️ ' + result.damage + ' dano em ' + result.monsterName, 'damage');
      }

      if (result.waveComplete) {
        addCombatLog('🌊 Wave completa!', 'wave');
      }
    } catch (error) {
      addCombatLog('❌ ' + error.message, 'error');
    }
  };

  // Handler de ataque ao boss
  const handleAttackBoss = async () => {
    try {
      const result = await onAttackBoss();
      triggerShake();
      
      if (result.defeated) {
        addCombatLog('🏆 BOSS DERROTADO! +' + (result.rewards?.xp || 0) + ' XP, +' + (result.rewards?.bossCoins || 0) + ' Boss Coins!', 'boss_kill');
      } else {
        addCombatLog('⚔️ ' + result.damage + ' dano no boss ' + result.bossName, 'damage');
      }
    } catch (error) {
      addCombatLog('❌ ' + error.message, 'error');
    }
  };

  // Handler de fuga
  const handleFlee = async () => {
    if (window.confirm('Tem certeza que deseja fugir? Você perderá metade do loot coletado.')) {
      try {
        await onFlee();
        addCombatLog('🏃 Você fugiu da instância!', 'flee');
      } catch (error) {
        addCombatLog('❌ ' + error.message, 'error');
      }
    }
  };

  const aliveMonsters = instance?.monsters?.filter(m => m.hp > 0) || [];
  const bossMonster = aliveMonsters.find(m => m.isBoss);

  // Funções auxiliares de cor
  function getVocationColor(vocation) {
    const colors = {
      KNIGHT: '#4169E1',
      PALADIN: '#FFD700',
      SORCERER: '#8A2BE2',
      DRUID: '#228B22',
      NONE: '#808080'
    };
    return colors[vocation] || '#808080';
  }

  function getMonsterColor(name) {
    const colors = {
      'Rat': '#8B4513',
      'Spider': '#2d2d2d',
      'Bear': '#8B4513',
      'Demon': '#8B0000',
      'Dragon': '#00CED1',
    };
    return colors[name] || '#666666';
  }

  return (
    <div className={'game-canvas-container ' + (shakeScreen ? 'shake' : '')}>
      {/* Indicador de carregamento de sprites */}
      {loadingSprites && (
        <div className="sprite-loading">
          <div className="spinner"></div>
          <span>Carregando sprites do Tibia...</span>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        width={800} 
        height={400}
        className="game-canvas"
      />
      
      {/* Controles de combate */}
      <div className="combat-controls">
        {instance && !instance.isCompleted && (
          <>
            {bossMonster ? (
              <button className="btn btn-boss-fight" onClick={handleAttackBoss}>
                👑 Atacar Boss
              </button>
            ) : (
              <div className="monster-buttons">
                {aliveMonsters.map((monster, idx) => (
                  <button 
                    key={idx}
                    className="btn btn-attack"
                    onClick={() => handleAttack(instance.monsters.indexOf(monster))}
                  >
                    ⚔️ {monster.name}
                  </button>
                ))}
              </div>
            )}
            <button className="btn btn-flee" onClick={handleFlee}>
              🏃 Fugir
            </button>
          </>
        )}
      </div>

      {/* Log de combate */}
      <div className="combat-log">
        {combatLog.slice(-5).map(log => (
          <div key={log.id} className={'log-entry ' + log.type}>
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}
