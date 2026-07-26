// Zamba Idle - Mapa de Rookgaard
// Baseado no assets.json e nas configurações do Canary / Tibia 15.25

import React, { useRef, useEffect, useState } from 'react';

const TILE_SIZE = 32;
const MAP_WIDTH = 15;
const MAP_HEIGHT = 10;

// Configuração específica de Rookgaard (baseada no backend/huntsConfig)
const ROOKGAARD_CONFIG = {
  zone: 'rookgaard',
  name: 'Rookgaard',
  minLevel: 1,
  maxLevel: 8,
  monsters: ['Rat', 'Cave Rat', 'Spider', 'Poison Spider'],
  tiles: ['grass', 'dirt', 'stone'],
  decorations: ['flower', 'mushroom', 'rock', 'bush'],
  boss: 'Spider Queen',
  description: 'Área inicial para novos aventureiros.',
};

// Dados do assets.json
const ASSETS = {
  tiles: {
    grass: { color: '#2d5a27', sprite: 4526 },
    dirt: { color: '#5c4033', sprite: 4528 },
    sand: { color: '#c2b280', sprite: 4529 },
    stone: { color: '#696969', sprite: 4527 },
    swamp: { color: '#3d4a3d', sprite: 4532 },
  },
  decorations: {
    flower: { color: '#ff69b4', sprite: 4527 },
    mushroom: { color: '#8b4513', sprite: 864 },
    rock: { color: '#808080', sprite: 4530 },
    bush: { color: '#2e8b57', sprite: 4528 },
    tree: { color: '#1a3a1a', sprite: 860 },
  },
  monsters: {
    'Rat': { color: '#8B4513', sprite: 282 },
    'Cave Rat': { color: '#654321', sprite: 282 },
    'Spider': { color: '#2d2d2d', sprite: 218 },
    'Poison Spider': { color: '#4a0080', sprite: 218 },
  },
  vocations: {
    KNIGHT: { color: '#4169E1', sprite: 131 },
    PALADIN: { color: '#FFD700', sprite: 129 },
    SORCERER: { color: '#8A2BE2', sprite: 130 },
    DRUID: { color: '#228B22', sprite: 136 },
    MONK: { color: '#4169E1', sprite: 152 },
    NONE: { color: '#808080', sprite: 128 },
  }
};

function generateRookgaardMap() {
  const tiles = [];
  const decorations = [];
  const spawnPoints = [];

  // Gerar tiles específicos para Rookgaard (mais grama, menos pedra)
  for (let y = 0; y < MAP_HEIGHT; y++) {
    tiles[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      // Bordas de pedra
      if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
        tiles[y][x] = { type: 'wall', variant: 'stone' };
      } else if (x % 4 === 0 && y % 3 === 0) {
        // Algumas pedras no interior
        tiles[y][x] = { type: 'floor', variant: 'stone' };
      } else if ((x + y) % 5 === 0) {
        // Algumas áreas de terra
        tiles[y][x] = { type: 'floor', variant: 'dirt' };
      } else {
        // Grama dominante
        tiles[y][x] = { type: 'floor', variant: 'grass' };
      }
    }
  }

  // Decorações de Rookgaard
  const rookgaardDecorations = ['flower', 'mushroom', 'rock', 'bush', 'flower', 'rock'];
  for (let i = 0; i < 12; i++) {
    decorations.push({
      x: 1 + Math.floor(Math.random() * (MAP_WIDTH - 2)),
      y: 1 + Math.floor(Math.random() * (MAP_HEIGHT - 2)),
      type: rookgaardDecorations[Math.floor(Math.random() * rookgaardDecorations.length)]
    });
  }

  // Spawn de monstros de Rookgaard (apenas para visualização)
  for (let i = 0; i < 4; i++) {
    spawnPoints.push({
      x: 2 + Math.floor(Math.random() * 10),
      y: 2 + Math.floor(Math.random() * 6),
      monster: ROOKGAARD_CONFIG.monsters[Math.floor(Math.random() * ROOKGAARD_CONFIG.monsters.length)]
    });
  }

  return { tiles, decorations, spawnPoints };
}

function isoToScreen(x, y, offsetX = 400, offsetY = 120) {
  const screenX = (x - y) * (TILE_SIZE / 2) + offsetX;
  const screenY = (x + y) * (TILE_SIZE / 4) + offsetY;
  return { x: screenX, y: screenY };
}

function getTileColor(variant) {
  const tile = ASSETS.tiles[variant] || ASSETS.tiles.grass;
  return tile ? tile.color : '#2d5a27';
}

export default function RookgaardMap({ characterVocation = 'KNIGHT', showDecorations = true }) {
  const canvasRef = useRef(null);
  const [map, setMap] = useState(generateRookgaardMap());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpar
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, width, height);

    // Desenhar tiles
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = map.tiles[y][x];
        const pos = isoToScreen(x, y);
        const halfTile = TILE_SIZE / 2;
        const quarterTile = TILE_SIZE / 4;

        ctx.fillStyle = getTileColor(tile.variant || 'grass');
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - quarterTile);
        ctx.lineTo(pos.x + halfTile, pos.y);
        ctx.lineTo(pos.x, pos.y + quarterTile);
        ctx.lineTo(pos.x - halfTile, pos.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Decorações
    if (showDecorations && map.decorations) {
      map.decorations.forEach(deco => {
        const pos = isoToScreen(deco.x, deco.y);
        const decoData = ASSETS.decorations[deco.type] || ASSETS.decorations.flower;
        ctx.fillStyle = decoData.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Monstros
    if (map.spawnPoints) {
      map.spawnPoints.forEach(spawn => {
        const pos = isoToScreen(spawn.x, spawn.y);
        const monsterData = ASSETS.monsters[spawn.monster] || ASSETS.monsters['Rat'];
        ctx.fillStyle = monsterData.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - 12, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(spawn.monster, pos.x, pos.y + 14);
      });
    }

    // Personagem no centro
    const centerX = 7;
    const centerY = 5;
    const charPos = isoToScreen(centerX, centerY);
    const voc = ASSETS.vocations[characterVocation] || ASSETS.vocations.NONE;
    ctx.fillStyle = voc.color;
    ctx.beginPath();
    ctx.arc(charPos.x, charPos.y - 16, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PLAYER', charPos.x, charPos.y + 20);

    // Info do mapa (canto inferior direito)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width - 140, height - 55, 130, 45);
    ctx.fillStyle = '#e8c34e';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏰 ROOKGAARD', width - 130, height - 35);
    ctx.fillText('Lv. 1-8 | ' + ROOKGAARD_CONFIG.monsters.join(', '), width - 130, height - 21);
    ctx.fillText('Canary Engine | 45° Angle', width - 130, height - 7);
  }, [map, characterVocation, showDecorations]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMap(prev => {
        const newDecorations = prev.decorations.map(d => ({
          ...d,
          x: d.x + (Math.random() > 0.97 ? (Math.random() > 0.5 ? 1 : -1) : 0),
          y: d.y + (Math.random() > 0.97 ? (Math.random() > 0.5 ? 1 : -1) : 0),
        })).filter(d => d.x >= 1 && d.x < MAP_WIDTH - 2 && d.y >= 1 && d.y < MAP_HEIGHT - 2);
        return { ...prev, decorations: newDecorations };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <canvas 
        ref={canvasRef}
        width={800}
        height={500}
        style={{
          width: '100%',
          height: 'auto',
          background: '#0a0a15',
          borderRadius: '8px',
          border: '2px solid #4a4a46',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          display: 'block',
        }}
      />
    </div>
  );
}
