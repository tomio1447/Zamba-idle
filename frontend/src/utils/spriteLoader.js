// Zamba Idle - Tibia 15.25 Modern Sprite Loader
// Compatível com o client moderno (dudantas/tibia-client)
// Formato: catalog-content.json + sprites-*.bmp.lzma + appearances-*.dat

export class ModernTibiaSpriteLoader {
  constructor() {
    this.catalog = null;
    this.spriteSheets = new Map();
    this.appearances = null;
    this.loaded = false;
    this.basePath = '';
  }

  // Carregar de um diretório base
  async loadFromDirectory(basePath) {
    this.basePath = basePath;
    
    try {
      // 1. Carregar catálogo
      console.log('📖 Carregando catálogo...');
      const catalogResponse = await fetch(`${basePath}catalog-content.json`);
      if (!catalogResponse.ok) throw new Error('Catálogo não encontrado');
      this.catalog = await catalogResponse.json();
      console.log(`✅ Catálogo carregado: ${this.catalog.length} entradas`);

      // 2. Carregar appearances.dat (definições de outfits, items, effects)
      console.log('👤 Carregando aparências...');
      await this.loadAppearances();

      // 3. Carregar spritesheets principais
      console.log('🎨 Carregando sprites...');
      await this.loadSpriteSheets();

      this.loaded = true;
      console.log('✅ Client Tibia 15.25 carregado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao carregar client:', error);
      return false;
    }
  }

  // Carregar arquivo de aparências
  async loadAppearances() {
    // Tentar diferentes nomes de arquivo
    const possibleFiles = [
      'appearances.dat',
      'appearances-1.dat',
      'appearances-2.dat',
      'appearances.dat.dat'
    ];

    for (const file of possibleFiles) {
      try {
        const response = await fetch(`${this.basePath}${file}`);
        if (response.ok) {
          this.appearances = await response.arrayBuffer();
          console.log(`  ✅ ${file} carregado`);
          return;
        }
      } catch (e) {
        // Tentar próximo
      }
    }
    console.log('  ⚠️ Nenhum arquivo de aparências encontrado');
  }

  // Carregar spritesheets
  async loadSpriteSheets() {
    // O client 15.25 tem sprites divididos em faixas
    // sprites-0.bmp.lzma, sprites-1.bmp.lzma, etc.
    const spriteFiles = this.catalog?.filter(entry => 
      entry.type === 'sprite' || entry.name?.includes('sprites-')
    ) || [];

    if (spriteFiles.length === 0) {
      // Tentar nomes padrão
      for (let i = 0; i < 10; i++) {
        const fileName = `sprites-${i}.bmp.lzma`;
        try {
          const response = await fetch(`${this.basePath}${fileName}`);
          if (response.ok) {
            const data = await response.arrayBuffer();
            this.spriteSheets.set(i, data);
            console.log(`  ✅ ${fileName} carregado`);
          }
        } catch (e) {
          break; // Não há mais spritesheets
        }
      }
    } else {
      // Carregar baseado no catálogo
      for (const entry of spriteFiles) {
        try {
          const response = await fetch(`${this.basePath}${entry.file}`);
          if (response.ok) {
            const data = await response.arrayBuffer();
            const index = entry.id || this.getSpriteSheetIndex(entry.file);
            this.spriteSheets.set(index, data);
            console.log(`  ✅ ${entry.file} carregado`);
          }
        } catch (e) {
          console.log(`  ⚠️ Erro ao carregar ${entry.file}`);
        }
      }
    }
  }

  // Extrair índice do spritesheet do nome do arquivo
  getSpriteSheetIndex(fileName) {
    const match = fileName.match(/sprites-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // Obter sprite por ID
  getSprite(spriteId) {
    if (!this.loaded) return null;

    // Calcular qual spritesheet e posição
    const spritesPerSheet = 10000; // Aproximado
    const sheetIndex = Math.floor(spriteId / spritesPerSheet);
    const localId = spriteId % spritesPerSheet;

    const sheetData = this.spriteSheets.get(sheetIndex);
    if (!sheetData) return null;

    return this.extractSpriteFromSheet(sheetData, localId);
  }

  // Extrair sprite individual da spritesheet
  extractSpriteFromSheet(sheetData, localId) {
    // O formato LZMA.bmp precisa ser descomprimido
    // Para web, usamos uma abordagem simplificada
    // O sprite é um bitmap 32x32 ou 64x64
    
    try {
      // Decodificar LZMA (simplificado - em produção usar biblioteca lzma)
      const decoded = this.decompressLZMA(sheetData);
      if (!decoded) return null;

      // Extrair sprite na posição localId
      const spriteSize = 32;
      const spritesPerRow = Math.floor(Math.sqrt(decoded.length / 4 / spriteSize));
      const row = Math.floor(localId / spritesPerRow);
      const col = localId % spritesPerRow;

      // Criar canvas para o sprite
      const canvas = document.createElement('canvas');
      canvas.width = spriteSize;
      canvas.height = spriteSize;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.createImageData(spriteSize, spriteSize);

      // Copiar pixels do sprite
      const offset = (row * spritesPerRow * spriteSize * spriteSize + col * spriteSize) * 4;
      for (let i = 0; i < spriteSize * spriteSize * 4; i++) {
        imageData.data[i] = decoded[offset + i] || 0;
      }

      ctx.putImageData(imageData, 0, 0);
      return canvas;
    } catch (e) {
      return null;
    }
  }

  // Descomprimir LZMA (placeholder - usar biblioteca real)
  decompressLZMA(data) {
    // Em produção, usar lzma-js ou similar
    // Por enquanto, retornar dados simulados
    return new Uint8Array(1024 * 1024); // Placeholder
  }

  // Obter outfit por ID
  getOutfit(outfitId) {
    if (!this.appearances) return null;
    // Parse do appearances.dat para encontrar outfit
    // Formato OTC/OTB
    return { id: outfitId, spriteId: this.getOutfitSpriteId(outfitId) };
  }

  // Mapear outfit para sprite
  getOutfitSpriteId(outfitId) {
    // Mapeamento baseado no client 15.25
    const outfitMap = {
      128: 131, // Citizen Male
      129: 129, // Hunter Male
      130: 130, // Mage Male
      131: 131, // Knight Male
      132: 132, // Nobleman Male
      133: 133, // Summoner Male
      134: 134, // Warrior Male
      135: 135, // Barbarian Male
      136: 136, // Druid Male
      137: 137, // Wizard Male
      138: 138, // Oriental Male
      139: 139, // Pirate Male
      140: 140, // Assassin Male
      141: 141, // Beggar Male
      142: 142, // Shaman Male
      143: 143, // Norseman Male
      144: 144, // Nightmare Male
      145: 145, // Jaina Male
      146: 146, // Winter Male
      147: 147, // Buccaneer Male
      148: 148, // Pirate Corsair Male
      149: 149, // Elementalist Male
      150: 150, // Afflicted Male
      151: 151, // Deepling Male
      152: 152, // Insectoid Male
      153: 153, // Crystal Warlord Male
      154: 154, // Soil Male
      155: 155, // Faun Male
      156: 156, // Gorgon Male
      157: 157, // Mezter Male
      158: 158, // Undead Male
      159: 159, // Male 159
      160: 160, // Male 160
      161: 161, // Male 161
      162: 162, // Male 162
      163: 163, // Male 163
      164: 164, // Male 164
      165: 165, // Male 165
      166: 166, // Male 166
      167: 167, // Male 167
      168: 168, // Male 168
      169: 169, // Male 169
      170: 170, // Male 170
      171: 171, // Male 171
      172: 172, // Male 172
      173: 173, // Male 173
      174: 174, // Male 174
      175: 175, // Male 175
      176: 176, // Male 176
      177: 177, // Male 177
      178: 178, // Male 178
      179: 179, // Male 179
      180: 180, // Male 180
      181: 181, // Male 181
      182: 182, // Male 182
      183: 183, // Male 183
      184: 184, // Male 184
      185: 185, // Male 185
      186: 186, // Male 186
      187: 187, // Male 187
      188: 188, // Male 188
      189: 189, // Male 189
      190: 190, // Male 190
      191: 191, // Male 191
      192: 192, // Male 192
      193: 193, // Male 193
      194: 194, // Male 194
      195: 195, // Male 195
      196: 196, // Male 196
      197: 197, // Male 197
      198: 198, // Male 198
      199: 199, // Male 199
      200: 200, // Male 200
      // Femininos
      251: 251, // Citizen Female
      252: 252, // Hunter Female
      253: 253, // Mage Female
      254: 254, // Knight Female
      255: 255, // Nobleman Female
      256: 256, // Summoner Female
      257: 257, // Warrior Female
    };
    return outfitMap[outfitId] || 131;
  }

  // Verificar se está carregado
  isLoaded() {
    return this.loaded;
  }
}

// Mapeamento de sprites para monstros (client 15.25)
export const MONSTER_SPRITES_MODERN = {
  // Monstros básicos
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

// Mapeamento de outfits por vocação (client 15.25)
export const VOCATION_SPRITES_MODERN = {
  KNIGHT: {
    male: 131,
    female: 254,
    name: 'Knight'
  },
  PALADIN: {
    male: 129,
    female: 252,
    name: 'Paladin'
  },
  SORCERER: {
    male: 130,
    female: 253,
    name: 'Sorcerer'
  },
  DRUID: {
    male: 136,
    female: 256,
    name: 'Druid'
  },
  NONE: {
    male: 128,
    female: 251,
    name: 'Citizen'
  }
};

// Singleton
let modernSpriteLoader = null;

export function getModernSpriteLoader() {
  if (!modernSpriteLoader) {
    modernSpriteLoader = new ModernTibiaSpriteLoader();
  }
  return modernSpriteLoader;
}

export default ModernTibiaSpriteLoader;
