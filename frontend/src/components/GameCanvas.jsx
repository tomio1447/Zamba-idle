import React, { useRef, useEffect, useState, useCallback } from 'react';

// Sprites do Tibia Client 15.25 - Mapeamento de criaturas
// Usando URLs do GitHub para os sprites
const SPRITES = {
  // Monstros normais
  'Rat': { id: 282, color: '#8B4513' },
  'Cave Rat': { id: 282, color: '#654321' },
  'Spider': { id: 218, color: '#2d2d2d' },
  'Poison Spider': { id: 218, color: '#4a0080' },
  'Wild Warrior': { id: 131, color: '#8B0000' },
  'Hunter': { id: 131, color: '#006400' },
  'Deer': { id: 221, color: '#D2691E' },
  'Bear': { id: 219, color: '#8B4513' },
  'Ghoul': { id: 320, color: '#4a4a4a' },
  'Necromancer': { id: 220, color: '#2d004a' },
  'Demon Skeleton': { id: 320, color: '#8B0000' },
  'Undead Dragon': { id: 34, color: '#2d2d2d' },
  'Scorpion': { id: 324, color: '#DAA520' },
  'Ankrahmun Pharaoh': { id: 325, color: '#FFD700' },
  'Sandstone Scorpion': { id: 324, color: '#CD853F' },
  'Rahemos': { id: 325, color: '#8B008B' },
  'Frost Dragon': { id: 34, color: '#00CED1' },
  'Ice Golem': { id: 326, color: '#B0E0E6' },
  'Crystal Spider': { id: 218, color: '#E0FFFF' },
  'Frost Giant': { id: 327, color: '#4682B4' },
  'Demon': { id: 35, color: '#8B0000' },
  'Hellfire Destroyer': { id: 35, color: '#FF4500' },
  'Juggernaut': { id: 35, color: '#4B0082' },
  'Gaz\'Haragoth': { id: 35, color: '#800000' },
  
  // Bosses
  'Spider Queen': { id: 218, color: '#800080', isBoss: true },
  'Bear Spirit': { id: 219, color: '#00FF00', isBoss: true },
  'Necromancer Lord': { id: 220, color: '#4B0082', isBoss: true },
  'Pharaoh Anubis': { id: 325, color: '#FFD700', isBoss: true },
  'Frost Dragon Lord': { id: 34, color: '#00FFFF', isBoss: true },
  'Demon Overlord': { id: 35, color: '#FF0000', isBoss: true },
};

// Outfits do Tibia para o personagem
const OUTFITS = {
  KNIGHT: { id: 131, color: '#4169E1' },
  PALADIN: { id: 131, color: '#FFD700' },
  SORCERER: { id: 129, color: '#8A2BE2' },
  DRUID: { id: 130, color: '#228B22' },
  NONE: { id: 131, color: '#808080' },
};

export default function GameCanvas({ character, instance, onAttack, onAttackBoss, onFlee }) {
  const canvasRef = useRef(null);
  const [animations, setAnimations] = useState([]);
  const [combatLog, setCombatLog] = useState([]);
  const [shakeScreen, setShakeScreen] = useState(false);

  // Adicionar ao log de combate
  const addCombatLog = useCallback((message, type = 'normal') => {
    setCombatLog(prev => [...prev.slice(-20), { message, type, id: Date.now() }]);
  }, []);

  // Efeito de shake na tela
  const triggerShake = useCallback(() => {
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 200);
  }, []);

  // Desenhar no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpar canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Desenhar chão (grid)
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Desenhar personagem (centro-esquerda)
    if (character) {
      const outfit = OUTFITS[character.vocation] || OUTFITS.NONE;
      drawCharacter(ctx, 100, height / 2, outfit, character.level);
    }

    // Desenhar monstros
    if (instance && instance.monsters) {
      instance.monsters.forEach((monster, index) => {
        if (monster.hp > 0) {
          const x = 350 + (index % 3) * 120;
          const y = 100 + Math.floor(index / 3) * 150;
          drawMonster(ctx, x, y, monster);
        }
      });
    }

    // Desenhar boss se for wave de boss
    if (instance && instance.isBossWave && instance.currentBoss) {
      const boss = instance.monsters?.find(m => m.isBoss && m.hp > 0);
      if (boss) {
        drawBoss(ctx, width / 2 + 100, height / 2, boss);
      }
    }

  }, [character, instance]);

  // Desenhar personagem
  const drawCharacter = (ctx, x, y, outfit, level) => {
    // Corpo
    ctx.fillStyle = outfit.color;
    ctx.fillRect(x - 16, y - 16, 32, 32);
    
    // Borda
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 16, y - 16, 32, 32);

    // Nível
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Lv.${level}`, x, y - 24);

    // Nome
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.fillText('Você', x, y + 28);

    // Efeito de brilho
    ctx.shadowColor = outfit.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(x - 16, y - 16, 32, 32);
    ctx.shadowBlur = 0;
  };

  // Desenhar monstro
  const drawMonster = (ctx, x, y, monster) => {
    const sprite = SPRITES[monster.name] || { color: '#808080' };
    
    // Corpo do monstro
    ctx.fillStyle = sprite.color;
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
    
    // Borda
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Barra de HP
    const hpPercent = monster.hp / monster.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(x - 25, y - 40, 50, 8);
    ctx.fillStyle = hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444';
    ctx.fillRect(x - 25, y - 40, 50 * hpPercent, 8);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 25, y - 40, 50, 8);

    // Nome
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(monster.name, x, y + 40);
  };

  // Desenhar Boss
  const drawBoss = (ctx, x, y, boss) => {
    const sprite = SPRITES[boss.name] || { color: '#808080', isBoss: true };
    
    // Efeito de aura do boss
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
    gradient.addColorStop(0, sprite.color + '40');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();

    // Corpo do boss (maior)
    ctx.fillStyle = sprite.color;
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Borda dourada
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Coroa do boss
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 45);
    ctx.lineTo(x - 10, y - 60);
    ctx.lineTo(x, y - 50);
    ctx.lineTo(x + 10, y - 60);
    ctx.lineTo(x + 20, y - 45);
    ctx.closePath();
    ctx.fill();

    // Barra de HP do boss (maior)
    const hpPercent = boss.hp / boss.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(x - 50, y - 80, 100, 12);
    ctx.fillStyle = hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444';
    ctx.fillRect(x - 50, y - 80, 100 * hpPercent, 12);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 50, y - 80, 100, 12);

    // Texto HP
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${boss.hp}/${boss.maxHp}`, x, y - 71);

    // Nome do boss
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`👑 ${boss.name}`, x, y + 60);

    // Texto "BOSS"
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('⚠️ BOSS ⚠️', x, y + 75);
  };

  // Handler de ataque
  const handleAttack = async (monsterIndex) => {
    try {
      const result = await onAttack(monsterIndex);
      triggerShake();
      
      if (result.killed) {
        addCombatLog(`💀 ${result.monsterName} morreu! +${result.rewards?.xp || 0} XP`, 'kill');
      } else {
        addCombatLog(`⚔️ ${result.damage} dano em ${result.monsterName}`, 'damage');
      }

      if (result.waveComplete) {
        addCombatLog(`🌊 Wave completa!`, 'wave');
      }
    } catch (error) {
      addCombatLog(`❌ ${error.message}`, 'error');
    }
  };

  // Handler de ataque ao boss
  const handleAttackBoss = async () => {
    try {
      const result = await onAttackBoss();
      triggerShake();
      
      if (result.defeated) {
        addCombatLog(`🏆 BOSS DERROTADO! +${result.rewards?.xp || 0} XP, +${result.rewards?.bossCoins || 0} Boss Coins!`, 'boss_kill');
      } else {
        addCombatLog(`⚔️ ${result.damage} dano no boss ${result.bossName}`, 'damage');
      }
    } catch (error) {
      addCombatLog(`❌ ${error.message}`, 'error');
    }
  };

  // Handler de fuga
  const handleFlee = async () => {
    if (window.confirm('Tem certeza que deseja fugir? Você perderá metade do loot coletado.')) {
      try {
        await onFlee();
        addCombatLog('🏃 Você fugiu da instância!', 'flee');
      } catch (error) {
        addCombatLog(`❌ ${error.message}`, 'error');
      }
    }
  };

  const aliveMonsters = instance?.monsters?.filter(m => m.hp > 0) || [];
  const bossMonster = aliveMonsters.find(m => m.isBoss);

  return (
    <div className={`game-canvas-container ${shakeScreen ? 'shake' : ''}`}>
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
          <div key={log.id} className={`log-entry ${log.type}`}>
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}
