// Zamba Idle - Sistema de Mapas Procedurais
// Gera mapas de caçada dinamicamente para cada instância

export class MapGenerator {
  constructor() {
    this.tileSize = 32;
    this.roomWidth = 15;  // tiles
    this.roomHeight = 10; // tiles
  }

  // Gerar mapa para uma zona específica
  generateMap(zoneId, zoneData) {
    const map = {
      id: zoneId,
      name: zoneData.name,
      width: this.roomWidth,
      height: this.roomHeight,
      tiles: [],
      spawnPoints: [],
      decorations: [],
    };

    // Gerar tiles do chão
    for (let y = 0; y < this.roomHeight; y++) {
      map.tiles[y] = [];
      for (let x = 0; x < this.roomWidth; x++) {
        map.tiles[y][x] = this.getTileType(zoneId, x, y);
      }
    }

    // Gerar pontos de spawn para monstros
    map.spawnPoints = this.generateSpawnPoints(zoneData);

    // Gerar decorações
    map.decorations = this.generateDecorations(zoneId);

    return map;
  }

  // Determinar tipo de tile baseado na zona
  getTileType(zoneId, x, y) {
    const tileTypes = {
      'rookgaard': { floor: 'grass', wall: 'stone' },
      'forest': { floor: 'dirt', wall: 'tree' },
      'swamp': { floor: 'swamp', wall: 'dead_tree' },
      'desert': { floor: 'sand', wall: 'cactus' },
      'ice': { floor: 'ice', wall: 'ice_rock' },
      'demona': { floor: 'lava', wall: 'bone' },
    };

    const type = tileTypes[zoneId] || tileTypes['rookgaard'];
    
    // Paredes nas bordas
    if (x === 0 || x === this.roomWidth - 1 || y === 0 || y === this.roomHeight - 1) {
      return { type: 'wall', variant: type.wall };
    }
    
    return { type: 'floor', variant: type.floor };
  }

  // Gerar pontos de spawn para monstros
  generateSpawnPoints(zoneData) {
    const points = [];
    const centerX = Math.floor(this.roomWidth / 2);
    const centerY = Math.floor(this.roomHeight / 2);

    // Spawns no lado direito da sala
    for (let i = 0; i < 5; i++) {
      points.push({
        x: centerX + 2 + (i % 3) * 2,
        y: 2 + Math.floor(i / 3) * 3,
      });
    }

    return points;
  }

  // Gerar decorações baseadas na zona
  generateDecorations(zoneId) {
    const decorations = [];
    const decoTypes = {
      'rookgaard': ['flower', 'mushroom', 'rock'],
      'forest': ['tree', 'bush', 'log'],
      'swamp': ['dead_tree', 'mushroom', 'bog'],
      'desert': ['cactus', 'rock', 'bone'],
      'ice': ['ice_rock', 'snow_pile', 'frozen_tree'],
      'demona': ['bone', 'skull', 'lava_pool'],
    };

    const types = decoTypes[zoneId] || decoTypes['rookgaard'];

    // Adicionar decorações aleatórias
    for (let i = 0; i < 8; i++) {
      decorations.push({
        x: 1 + Math.floor(Math.random() * (this.roomWidth - 2)),
        y: 1 + Math.floor(Math.random() * (this.roomHeight - 2)),
        type: types[Math.floor(Math.random() * types.length)],
      });
    }

    return decorations;
  }

  // Obter cor do tile para renderização
  static getTileColor(variant) {
    const colors = {
      'grass': '#2d5a27',
      'dirt': '#5c4033',
      'sand': '#c2b280',
      'ice': '#b0e0e6',
      'swamp': '#3d4a3d',
      'lava': '#8b0000',
      'stone': '#696969',
      'tree': '#1a3a1a',
      'dead_tree': '#2d2d2d',
      'cactus': '#228b22',
      'ice_rock': '#87ceeb',
      'bone': '#f5f5dc',
      'flower': '#ff69b4',
      'mushroom': '#8b4513',
      'rock': '#808080',
      'bush': '#2e8b57',
      'log': '#8b4513',
      'bog': '#2f4f2f',
      'snow_pile': '#fffafa',
      'frozen_tree': '#e0ffff',
      'skull': '#f5f5f5',
      'lava_pool': '#ff4500',
    };
    return colors[variant] || '#333333';
  }

  // Obter sprite do tile (para uso com sprites do Tibia)
  static getTileSprite(variant) {
    const sprites = {
      'grass': 4526,
      'dirt': 4528,
      'sand': 4529,
      'ice': 4530,
      'swamp': 4532,
      'lava': 4531,
      'stone': 4527,
      'tree': 860,
      'dead_tree': 861,
      'cactus': 862,
      'ice_rock': 863,
      'bone': 864,
    };
    return sprites[variant] || 4526;
  }
}

// Singleton
let mapGenerator = null;

export function getMapGenerator() {
  if (!mapGenerator) {
    mapGenerator = new MapGenerator();
  }
  return mapGenerator;
}

export default MapGenerator;
