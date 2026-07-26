// Zamba Idle - Tibia Sprite Loader
// Carrega e renderiza sprites do client Tibia 15.25 (.spr + .dat)
// Baseado na especificação OpenTibia: https://otland.net/threads/tibia-dat-and-spr-format.250266/

export class TibiaSpriteLoader {
  constructor() {
    this.sprites = new Map();
    this.spriteData = null;
    this.loaded = false;
  }

  // Carregar arquivos .spr e .dat do client
  async loadFromFiles(sprUrl, datUrl) {
    try {
      const [sprResponse, datResponse] = await Promise.all([
        fetch(sprUrl),
        fetch(datUrl)
      ]);

      const sprBuffer = await sprResponse.arrayBuffer();
      const datBuffer = await datResponse.arrayBuffer();

      this.sprBuffer = sprBuffer;
      this.datBuffer = datBuffer;
      
      // Parse do header do SPR
      this.parseSprHeader();
      
      this.loaded = true;
      console.log('✅ Sprites do Tibia carregados com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao carregar sprites:', error);
      return false;
    }
  }

  // Parse do header do arquivo SPR
  parseSprHeader() {
    const view = new DataView(this.sprBuffer);
    // Header: 4 bytes (signature) + 4 bytes (sprites count)
    this.spriteCount = view.getUint32(4, true);
    console.log(`📦 Total de sprites: ${this.spriteCount}`);
  }

  // Extrair um sprite específico como ImageData
  extractSprite(spriteId) {
    if (!this.loaded || spriteId < 1 || spriteId > this.spriteCount) {
      return null;
    }

    const view = new DataView(this.sprBuffer);
    const headerSize = 6; // 4 bytes signature + 4 bytes count (na verdade é 6+4=10)
    
    // Cada sprite começa em um offset
    // O header tem 6 bytes de signature + 4 bytes de count = 10 bytes
    // Depois, cada sprite tem:
    // - 4 bytes de offset para os dados
    // Os dados do sprite começam com transparent pixel (0,0,0,0) indicando pixels transparentes
    
    const offset = 6 + 4 + (spriteId - 1) * 4;
    const spriteOffset = view.getUint32(offset, true);
    
    if (spriteOffset === 0) return null;

    return this.decodeSprite(spriteOffset);
  }

  // Decodificar sprite individual (formato Tibia 15.25)
  decodeSprite(offset) {
    const view = new DataView(this.sprBuffer);
    const buffer = this.sprBuffer;
    
    // Formato Tibia SPR:
    // - 2 bytes: width (sempre 32 para sprites padrão)
    // - 2 bytes: height (sempre 32)
    // - Dados de pixels com RLE (Run-Length Encoding)
    
    const width = view.getUint16(offset, true);
    const height = view.getUint16(offset + 2, true);
    
    if (width === 0 || height === 0) return null;
    if (width > 128 || height > 128) return null; // Proteção

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    let pos = offset + 4;
    let pixelPos = 0;
    const totalPixels = width * height;

    // Decodificar RLE
    while (pixelPos < totalPixels && pos < buffer.byteLength) {
      // Pixels transparentes (skip)
      const transparentPixels = view.getUint16(pos, true);
      pos += 2;
      pixelPos += transparentPixels;

      // Pixels coloridos
      const coloredPixels = view.getUint16(pos, true);
      pos += 2;

      for (let i = 0; i < coloredPixels && pixelPos < totalPixels; i++) {
        // Formato BGRA (Blue, Green, Red, Alpha)
        const b = view.getUint8(pos++);
        const g = view.getUint8(pos++);
        const r = view.getUint8(pos++);
        const a = view.getUint8(pos++);

        const idx = pixelPos * 4;
        pixels[idx] = r;     // R
        pixels[idx + 1] = g; // G
        pixels[idx + 2] = b; // B
        pixels[idx + 3] = a; // A

        pixelPos++;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  // Extrair sprite e converter para URL de dados
  getSpriteUrl(spriteId) {
    const canvas = this.extractSprite(spriteId);
    if (!canvas) return null;
    return canvas.toDataURL();
  }

  // Extrair sprite como Image
  async getSpriteImage(spriteId) {
    const url = this.getSpriteUrl(spriteId);
    if (!url) return null;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
}

// Mapeamento de sprites do Tibia 15.25
// IDs baseados no client 15.25
export const TIBIA_SPRITES = {
  // Terreno e piso
  FLOOR_GRASS: 4526,
  FLOOR_STONE: 4527,
  FLOOR_DIRT: 4528,
  FLOOR_SAND: 4529,
  FLOOR_ICE: 4530,
  FLOOR_LAVA: 4531,
  FLOOR_WATER: 4600,
  
  // Paredes
  WALL_STONE: 4560,
  WALL_BRICK: 4561,
  WALL_WOOD: 4562,
  
  // Monstros (IDs aproximados - variam por client)
  MONSTER_RAT: 282,
  MONSTER_SPIDER: 218,
  MONSTER_BEAR: 219,
  MONSTER_WILD_WARRIOR: 131,
  MONSTER_GHOUL: 320,
  MONSTER_NECROMANCER: 220,
  MONSTER_DEMON: 35,
  MONSTER_DRAGON: 34,
  MONSTER_FROST_DRAGON: 34,
  MONSTER_SCORPION: 324,
  MONSTER_UNDEAD_DRAGON: 34,
  
  // Bosses
  BOSS_SPIDER_QUEEN: 218,
  BOSS_BEAR_SPIRIT: 219,
  BOSS_NECROMANCER_LORD: 220,
  BOSS_PHARAOH: 325,
  BOSS_FROST_DRAGON: 34,
  BOSS_DEMON_OVERLORD: 35,
  
  // Outfits (personagens)
  // Knights
  OUTFIT_KNIGHT_MALE: 131,
  OUTFIT_KNIGHT_BLUE: 131,
  OUTFIT_KNIGHT_RED: 131,
  
  // Paladins
  OUTFIT_PALADIN_MALE: 129,
  
  // Sorcerers
  OUTFIT_SORCERER_MALE: 129,
  OUTFIT_SORCERER_RED: 129,
  
  // Druids
  OUTFIT_DRUID_MALE: 130,
  
  // Outfits femininos
  OUTFIT_KNIGHT_FEMALE: 139,
  OUTFIT_PALADIN_FEMALE: 137,
  OUTFIT_SORCERER_FEMALE: 138,
  OUTFIT_DRUID_FEMALE: 140,
  
  // Efeitos
  EFFECT_HIT_RED: 12,
  EFFECT_HIT_BLUE: 13,
  EFFECT_HIT_GREEN: 14,
  EFFECT_MAGIC_BLUE: 15,
  EFFECT_MAGIC_RED: 16,
  EFFECT_MAGIC_GREEN: 17,
  EFFECT_HEAL: 18,
  EFFECT_POISON: 19,
  
  // Itens
  ITEM_GOLD_COIN: 3031,
  ITEM_PLATINUM_COIN: 3035,
  ITEM_CRYSTAL_COIN: 3043,
  
  // UI
  UI_HEART: 50,
  UI_SHIELD: 51,
  UI_SWORD: 52,
};

// Mapeamento de outfits por vocação
export const VOCATION_SPRITES = {
  KNIGHT: {
    male: 131,
    female: 139,
    name: 'Knight'
  },
  PALADIN: {
    male: 129,
    female: 137,
    name: 'Paladin'
  },
  SORCERER: {
    male: 129,
    female: 138,
    name: 'Sorcerer'
  },
  DRUID: {
    male: 130,
    female: 140,
    name: 'Druid'
  },
  NONE: {
    male: 131,
    female: 139,
    name: 'None'
  }
};

// Mapeamento de monstros para sprites
export const MONSTER_SPRITES = {
  'Rat': 282,
  'Cave Rat': 282,
  'Spider': 218,
  'Poison Spider': 218,
  'Wild Warrior': 131,
  'Hunter': 131,
  'Deer': 221,
  'Bear': 219,
  'Ghoul': 320,
  'Necromancer': 220,
  'Demon Skeleton': 320,
  'Undead Dragon': 34,
  'Scorpion': 324,
  'Ankrahmun Pharaoh': 325,
  'Sandstone Scorpion': 324,
  'Rahemos': 325,
  'Frost Dragon': 34,
  'Ice Golem': 326,
  'Crystal Spider': 218,
  'Frost Giant': 327,
  'Demon': 35,
  'Hellfire Destroyer': 35,
  'Juggernaut': 35,
  'Gaz\'Haragoth': 35,
  
  // Bosses
  'Spider Queen': 218,
  'Bear Spirit': 219,
  'Necromancer Lord': 220,
  'Pharaoh Anubis': 325,
  'Frost Dragon Lord': 34,
  'Demon Overlord': 35,
};

// Singleton
let spriteLoader = null;

export function getSpriteLoader() {
  if (!spriteLoader) {
    spriteLoader = new TibiaSpriteLoader();
  }
  return spriteLoader;
}

export default TibiaSpriteLoader;
