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
    this.spriteCache = new Map();
  }

  // Carregar de um diretório base
  async loadFromDirectory(basePath) {
    this.basePath = basePath;
    
    try {
      // 1. Carregar catálogo
      console.log('📖 Carregando catálogo de:', basePath);
      const catalogResponse = await fetch(`${basePath}catalog-content.json`);
      if (!catalogResponse.ok) {
        console.error('Catálogo não encontrado:', catalogResponse.status);
        return false;
      }
      this.catalog = await catalogResponse.json();
      console.log(`✅ Catálogo carregado: ${this.catalog.length} entradas`);

      // 2. Carregar appearances.dat
      await this.loadAppearances();

      // 3. Carregar spritesheets
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
    const possibleFiles = [
      'appearances.dat',
      'appearances-1.dat',
      'appearances-2.dat',
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
    // No client 15.25, os sprites estão em sprites-0.bmp.lzma, sprites-1.bmp.lzma, etc.
    let loaded = 0;
    
    for (let i = 0; i < 20; i++) { // Tentar até 20 spritesheets
      const fileName = `sprites-${i}.bmp.lzma`;
      try {
        const response = await fetch(`${this.basePath}${fileName}`);
        if (response.ok) {
          const data = await response.arrayBuffer();
          this.spriteSheets.set(i, data);
          loaded++;
          console.log(`  ✅ ${fileName} carregado (${data.byteLength} bytes)`);
        } else {
          break; // Não há mais spritesheets
        }
      } catch (e) {
        break;
      }
    }

    if (loaded === 0) {
      console.log('  ⚠️ Nenhum spritesheet encontrado');
    }
  }

  // Carregar arquivos de upload manual
  async loadFromFiles(files) {
    const fileMap = {};
    for (const file of files) {
      fileMap[file.name.toLowerCase()] = file;
    }

    // Carregar catálogo
    const catalogFile = fileMap['catalog-content.json'];
    if (!catalogFile) {
      throw new Error('catalog-content.json não encontrado!');
    }

    const catalogText = await catalogFile.text();
    this.catalog = JSON.parse(catalogText);

    // Carregar spritesheets
    const spriteFiles = this.catalog.filter(entry => 
      entry.type === 'sprite' || entry.name?.includes('sprites-')
    );

    for (const entry of spriteFiles) {
      const fileName = (entry.file || entry.name || '').toLowerCase();
      const file = fileMap[fileName];
      
      if (file) {
        const data = await file.arrayBuffer();
        const index = entry.id || this.getSpriteSheetIndex(entry.file || '');
        this.spriteSheets.set(index, data);
      }
    }

    // Carregar appearances
    const appearancesFile = Object.keys(fileMap).find(name => 
      name.startsWith('appearances-') || name === 'appearances.dat'
    );
    if (appearancesFile) {
      this.appearances = await fileMap[appearancesFile].arrayBuffer();
    }

    this.loaded = true;
    return true;
  }

  // Extrair índice do spritesheet do nome do arquivo
  getSpriteSheetIndex(fileName) {
    const match = fileName.match(/sprites-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // Obter sprite por ID (retorna Promise<HTMLImageElement>)
  async getSpriteImage(spriteId) {
    // Verificar cache
    if (this.spriteCache.has(spriteId)) {
      return this.spriteCache.get(spriteId);
    }

    if (!this.loaded) return null;

    // Calcular qual spritesheet e posição
    // No client 15.25, cada spritesheet tem uma faixa de IDs
    const spritesPerSheet = 10000;
    const sheetIndex = Math.floor(spriteId / spritesPerSheet);
    const localId = spriteId % spritesPerSheet;

    const sheetData = this.spriteSheets.get(sheetIndex);
    if (!sheetData) return null;

    // Tentar extrair sprite
    const image = await this.extractSpriteFromSheet(sheetData, localId, spriteId);
    if (image) {
      this.spriteCache.set(spriteId, image);
    }
    
    return image;
  }

  // Extrair sprite individual da spritesheet
  async extractSpriteFromSheet(sheetData, localId, globalId) {
    try {
      // O formato é LZMA comprimido
      // Para web, precisamos descomprimir
      // Como não temos uma biblioteca LZMA nativa, vamos tentar uma abordagem alternativa
      
      // Tentar criar ImageBitmap diretamente dos dados
      const blob = new Blob([sheetData], { type: 'image/bmp' });
      const url = URL.createObjectURL(blob);
      
      const img = new Image();
      img.src = url;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(reject, 5000); // Timeout
      });

      // Extrair região do sprite
      const spriteSize = 32;
      const spritesPerRow = Math.floor(img.width / spriteSize);
      const row = Math.floor(localId / spritesPerRow);
      const col = localId % spritesPerRow;

      const canvas = document.createElement('canvas');
      canvas.width = spriteSize;
      canvas.height = spriteSize;
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(
        img,
        col * spriteSize, row * spriteSize, spriteSize, spriteSize,
        0, 0, spriteSize, spriteSize
      );

      URL.revokeObjectURL(url);
      
      // Converter para Image
      const resultImg = new Image();
      resultImg.src = canvas.toDataURL();
      await new Promise(resolve => resultImg.onload = resolve);
      
      return resultImg;
    } catch (e) {
      return null;
    }
  }

  // Verificar se está carregado
  isLoaded() {
    return this.loaded;
  }

  // Obter informações do catálogo
  getCatalogInfo() {
    if (!this.catalog) return null;
    
    return {
      totalFiles: this.catalog.length,
      spriteFiles: this.catalog.filter(e => e.type === 'sprite').length,
      sheets: this.spriteSheets.size,
    };
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
  MONK: {
    male: 152, // Monk outfit ID
    female: 152,
    name: 'Monk'
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
