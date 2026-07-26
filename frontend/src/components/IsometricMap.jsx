// Zamba Idle - Mapa Isométrico com Sprites
// Baseado no assets.json do Tibia Client 15.25 (Canary)

import React, { useRef, useEffect, useState } from 'react';

const TILE_SIZE = 32;
const MAP_WIDTH = 15;
const MAP_HEIGHT = 10;
const ANGLE = 45; // graus isométricos

// Dados dos tiles (baseado no assets.json)
const ASSETS = {
  tiles: {
    grass: { color: '#2d5a27', sprite: 4526 },
    dirt: { color: '#5c4033', sprite: 4528 },
    sand: { color: '#c2b280', sprite: 4529 },
    ice: { color: '#b0e0e6', sprite: 4530 },
    swamp: { color: '#3d4a3d', sprite: 4532 },
    lava: { color: '#8b0000', sprite: 4531 },
    stone: { color: '#696969', sprite: 4527 },
  },
  decorations: {
    flower: { color: '#ff69b4', sprite: 4527 },
    mushroom: { color: '#8b4513', sprite: 864 },
    rock: { color: '#808080', sprite: 4530 },
    tree: { color: '#1a3a1a', sprite: 860 },
    bush: { color: '#2e8b57', sprite: 4528 },
    dead_tree: { color: '#2d2d2d', sprite: 861 },
    cactus: { color: '#228b22', sprite: 862 },
    bone: { color: '#f5f5dc', sprite: 864 },
  },
  monsters: {
    'Rat': { color: '#8B4513', sprite: 282 },
    'Spider': { color: '#2d2d2d', sprite: 218 },
    'Bear': { color: '#8B4513', sprite: 219 },
    'Demon': { color: '#8B0000', sprite: 35 },
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

// Gerar mapa procedural
function generateMap() {
  const tiles = [];
  const decorations = [];
  const spawnPoints = [];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    tiles[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      // Paredes nas bordas
      if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
        tiles[y][x] = { type: 'wall', variant: 'stone' };
      } else {
        // Chão aleatório
        const variants = ['grass', 'dirt', 'swamp'];
        const variant = variants[Math.floor(Math.random() * variants.length)];
        tiles[y][x] = { type: 'floor', variant };
      }
    }
  }

  // Decorações
  const decoTypes = Object.keys(ASSETS.decorations);
  for (let i = 0; i < 10; i++) {
    decorations.push({
      x: 1 + Math.floor(Math.random() * (MAP_WIDTH - 2)),
      y: 1 + Math.floor(Math.random() * (MAP_HEIGHT - 2)),
      type: decoTypes[Math.floor(Math.random() * decoTypes.length)]
    });
  }

  // Spawn de monstros (apenas alguns para visualização)
  for (let i = 0; i < 3; i++) {
    spawnPoints.push({
      x: 3 + Math.floor(Math.random() * 8),
      y: 3 + Math.floor(Math.random() * 4),
      monster: Object.keys(ASSETS.monsters)[Math.floor(Math.random() * Object.keys(ASSETS.monsters).length)]
    });
  }

  return { tiles, decorations, spawnPoints };
}

// Converter coordenada do mapa para posição isométrica na tela
function isoToScreen(x, y, offsetX = 400, offsetY = 100) {
  const screenX = (x - y) * (TILE_SIZE / 2) + offsetX;
  const screenY = (x + y) * (TILE_SIZE / 4) + offsetY;
  return { x: screenX, y: screenY };
}

// Calcular cor do tile
function getTileColor(variant) {
  const tile = ASSETS.tiles[variant] || ASSETS.tiles.grass;
  return tile ? tile.color : '#2d5a27';
}

export default function IsometricMap({ mapData, characterVocation = 'KNIGHT', showDecorations = true }) {
  const canvasRef = useRef(null);
  const [map, setMap] = useState(generateMap());

  // Redesenhar mapa quando mudar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpar
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, width, height);

    // Desenhar tiles do mapa
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = map.tiles[y][x];
        const pos = isoToScreen(x, y);
        
        // Cor base
        const color = getTileColor(tile.variant || 'grass');
        ctx.fillStyle = color;
        
        // Desenhar tile como losango (isométrico)
        const halfTile = TILE_SIZE / 2;
        const quarterTile = TILE_SIZE / 4;
        
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - quarterTile);
        ctx.lineTo(pos.x + halfTile, pos.y);
        ctx.lineTo(pos.x, pos.y + quarterTile);
        ctx.lineTo(pos.x - halfTile, pos.y);
        ctx.closePath();
        ctx.fill();
        
        // Borda
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Desenhar decorações
    if (showDecorations && map.decorations) {
      map.decorations.forEach(deco => {
        const pos = isoToScreen(deco.x, deco.y);
        const decoData = ASSETS.decorations[deco.type] || ASSETS.decorations.tree;
        
        // Círculo para decoração
        ctx.fillStyle = decoData.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - 8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Desenhar monstros (spawn points)
    if (map.spawnPoints) {
      map.spawnPoints.forEach(spawn => {
        const pos = isoToScreen(spawn.x, spawn.y);
        const monsterData = ASSETS.monsters[spawn.monster] || ASSETS.monsters['Rat'];
        
        // Corpo do monstro
        ctx.fillStyle = monsterData.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - 12, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Borda
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Nome pequeno
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(spawn.monster, pos.x, pos.y + 14);
      });
    }

    // Desenhar personagem no centro (se especificado)
    const centerX = 7;
    const centerY = 5;
    const charPos = isoToScreen(centerX, centerY);
    const voc = ASSETS.vocations[characterVocation] || ASSETS.vocations.NONE;
    
    // Corpo do personagem (maior)
    ctx.fillStyle = voc.color;
    ctx.beginPath();
    ctx.arc(charPos.x, charPos.y - 16, 16, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // Nome
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PLAYER', charPos.x, charPos.y + 20);

    // Legenda do mapa (canto inferior direito)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width - 140, height - 50, 130, 40);
    
    ctx.fillStyle = '#e8c34e';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Isometric Map', width - 130, height - 30);
    ctx.fillText('Canary Engine', width - 130, height - 16);
    ctx.fillText('45° Angle', width - 130, height - 4);

  }, [map, characterVocation, showDecorations]);

  // Atualizar mapa periodicamente (simular movimento)
  useEffect(() => {
    const interval = setInterval(() => {
      setMap(prev => {
        // Pequena variação aleatória nas decorações para simular vida
        const newDecorations = prev.decorations.map(d => ({
          ...d,
          x: d.x + (Math.random() > 0.95 ? (Math.random() > 0.5 ? 1 : -1) : 0),
          y: d.y + (Math.random() > 0.95 ? (Math.random() > 0.5 ? 1 : -1) : 0),
        })).filter(d => d.x >= 1 && d.x < MAP_WIDTH - 2 && d.y >= 1 && d.y < MAP_HEIGHT - 2);
        return { ...prev, decorations: newDecorations };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="isometric-map-container" style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
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
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}
      />
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        background: 'rgba(0,0,0,0.7)', 
        padding: '8px 12px',
        borderRadius: '6px',
        color: '#e8c34e',
        fontSize: '12px',
        fontWeight: 'bold',
        border: '1px solid #4a4a46'
      }}>
        <div>🎮 Isometric Tibia Client 15.25</div>
        <div style={{ color: '#a9a69d', fontSize: '10px', marginTop: '2px' }}>
          Sprites: {Object.keys(ASSETS.tiles).length} tiles | {Object.keys(ASSETS.decorations).length} decos | {Object.keys(ASSETS.monsters).length} monsters
        </div>
      </div>
    </div>
  );
}
