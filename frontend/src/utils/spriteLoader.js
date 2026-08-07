// Zamba Idle - Tibia Sprite Loader (8.60 + 15.x)
// Baseado em:
//   - opentibiabr/canary
//   - opentibiabr/otclient
//   - Levi999x/15.x-with-8.60 (downgraded assets)
//
// Suporta:
// - Formato moderno (catalog-content.json + sprites-*.lzma) → 15.x client
// - Formato clássico OT (Tibia.spr + Tibia.dat) → 8.60 + conteúdo 15.x
// - Assets reais do OTClient

export class ModernTibiaSpriteLoader {
  constructor() {
    this.catalog = null;
    this.spriteSheets = new Map();
    this.appearances = null;
    this.loaded = false;
    this.basePath = '';
    this.spriteCache = new Map();
    this.format = 'none'; // 'modern' | 'classic' | 'none'
  }

  // =====================================================
  // CARREGAMENTO PRINCIPAL
  // =====================================================

  async loadFromDirectory(basePath) {
    this.basePath = basePath;
    this.format = 'none';

    // 1. Tentar primeiro o formato clássico (Tibia.spr + Tibia.dat) - mais comum com otclient
    const classicSuccess = await this.tryLoadClassic(basePath);
    if (classicSuccess) {
      this.format = 'classic';
      this.loaded = true;
      console.log('✅ Assets clássicos 8.60 carregados com sucesso!');
      return true;
    }

    // 2. Tentar formato moderno (15.x)
    const modernSuccess = await this.tryLoadModern(basePath);
    if (modernSuccess) {
      this.format = 'modern';
      this.loaded = true;
      console.log('✅ Assets modernos 15.x carregados!');
      return true;
    }

    console.warn('⚠️ Nenhum formato de assets encontrado em', basePath);
    return false;
  }

  async tryLoadClassic(basePath) {
    try {
      // Tenta Tibia.spr + Tibia.dat
      const sprResponse = await fetch(`${basePath}Tibia.spr`);
      const datResponse = await fetch(`${basePath}Tibia.dat`);

      if (sprResponse.ok && datResponse.ok) {
        this.sprData = await sprResponse.arrayBuffer();
        this.datData = await datResponse.arrayBuffer();
        console.log(`✅ Tibia.spr (${this.sprData.byteLength} bytes) + Tibia.dat (${this.datData.byteLength} bytes)`);
        return true;
      }

      // Alternativa: Tibia.spr / Tibia.dat em subpasta
      const spr2 = await fetch(`${basePath}Tibia/Tibia.spr`);
      const dat2 = await fetch(`${basePath}Tibia/Tibia.dat`);
      if (spr2.ok && dat2.ok) {
        this.sprData = await spr2.arrayBuffer();
        this.datData = await dat2.arrayBuffer();
        return true;
      }
    } catch (e) {
      // silent
    }
    return false;
  }

  async tryLoadModern(basePath) {
    try {
      const catalogResponse = await fetch(`${basePath}catalog-content.json`);
      if (!catalogResponse.ok) return false;

      this.catalog = await catalogResponse.json();
      await this.loadAppearances();
      await this.loadSpriteSheets();
      return true;
    } catch (e) {
      return false;
    }
  }

  // =====================================================
  // CARREGAMENTO DE ARQUIVOS CLÁSSICOS
  // =====================================================

  async loadClassicFromFiles(sprFile, datFile) {
    try {
      this.sprData = await sprFile.arrayBuffer();
      this.datData = await datFile.arrayBuffer();
      this.format = 'classic';
      this.loaded = true;
      this.basePath = 'uploaded://';
      console.log('✅ Assets clássicos carregados via upload');
      return true;
    } catch (e) {
      console.error('Erro ao carregar assets clássicos:', e);
      return false;
    }
  }

  // =====================================================
  // CARREGAMENTO MODERNO (mantido)
  // =====================================================

  async loadAppearances() {
    const possibleFiles = ['appearances.dat', 'appearances-1.dat', 'appearances-2.dat'];
    for (const file of possibleFiles) {
      try {
        const response = await fetch(`${this.basePath}${file}`);
        if (response.ok) {
          this.appearances = await response.arrayBuffer();
          return;
        }
      } catch (_) {}
    }
  }

  async loadSpriteSheets() {
    let loaded = 0;
    for (let i = 0; i < 30; i++) {
      const fileName = `sprites-${i}.bmp.lzma`;
      try {
        const response = await fetch(`${this.basePath}${fileName}`);
        if (response.ok) {
          const data = await response.arrayBuffer();
          this.spriteSheets.set(i, data);
          loaded++;
        } else {
          break;
        }
      } catch (_) {
        break;
      }
    }
    console.log(`  Carregados ${loaded} spritesheets modernos`);
  }

  async loadFromFiles(files) {
    const fileMap = {};
    for (const file of files) {
      fileMap[file.name.toLowerCase()] = file;
    }

    // Detecta se é upload clássico
    const sprFile = fileMap['tibia.spr'] || Object.values(fileMap).find(f => f.name.toLowerCase().endsWith('.spr'));
    const datFile = fileMap['tibia.dat'] || Object.values(fileMap).find(f => f.name.toLowerCase().endsWith('.dat'));

    if (sprFile && datFile) {
      return this.loadClassicFromFiles(sprFile, datFile);
    }

    // Caso contrário, tenta moderno
    const catalogFile = fileMap['catalog-content.json'];
    if (!catalogFile) {
      throw new Error('Nenhum formato reconhecido (Tibia.spr + .dat ou catalog-content.json)');
    }

    const catalogText = await catalogFile.text();
    this.catalog = JSON.parse(catalogText);

    const spriteFiles = this.catalog.filter(entry =>
      entry.type === 'sprite' || (entry.name && entry.name.includes('sprites-'))
    );

    this.spriteSheets = new Map();
    for (const entry of spriteFiles) {
      const name = (entry.file || entry.name || '').toLowerCase();
      const file = fileMap[name];
      if (file) {
        const data = await file.arrayBuffer();
        const index = entry.id || this.getSpriteSheetIndex(entry.file || '');
        this.spriteSheets.set(index, data);
      }
    }

    const appearancesFile = Object.keys(fileMap).find(name =>
      name.startsWith('appearances-') || name === 'appearances.dat'
    );
    if (appearancesFile) {
      this.appearances = await fileMap[appearancesFile].arrayBuffer();
    }

    this.format = 'modern';
    this.loaded = true;
    return true;
  }

  getSpriteSheetIndex(fileName) {
    const match = fileName.match(/sprites-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // =====================================================
  // OBTENÇÃO DE SPRITES
  // =====================================================

  async getSpriteImage(spriteId) {
    if (this.spriteCache.has(spriteId)) {
      return this.spriteCache.get(spriteId);
    }

    if (!this.loaded) return null;

    let image = null;

    if (this.format === 'classic' && this.sprData) {
      image = await this.extractClassicSprite(spriteId);
    } else if (this.format === 'modern') {
      image = await this.getModernSprite(spriteId);
    }

    if (image) {
      this.spriteCache.set(spriteId, image);
    }
    return image;
  }

  // Extrai sprite do formato clássico (stub avançado)
  async extractClassicSprite(spriteId) {
    // NOTA: Parser completo de .spr é complexo.
    // Por enquanto usamos um método visual melhorado + fallback.
    // Em produção real, usaríamos uma lib WASM ou parser JS completo.

    try {
      // Tenta criar uma miniatura representativa baseada no ID
      // (para demonstração visual)
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      // Cor baseada no spriteId (simulação visual)
      const hue = (spriteId * 7) % 360;
      ctx.fillStyle = `hsl(${hue}, 65%, 45%)`;
      ctx.fillRect(0, 0, 32, 32);

      // Borda estilo Tibia
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      ctx.strokeRect(1, 1, 30, 30);

      // Detalhe interno
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(4, 4, 24, 24);

      const img = new Image();
      img.src = canvas.toDataURL('image/png');
      await new Promise(r => { img.onload = r; });

      return img;
    } catch (e) {
      return null;
    }
  }

  async getModernSprite(spriteId) {
    const spritesPerSheet = 10000;
    const sheetIndex = Math.floor(spriteId / spritesPerSheet);
    const localId = spriteId % spritesPerSheet;

    const sheetData = this.spriteSheets.get(sheetIndex);
    if (!sheetData) return null;

    try {
      const blob = new Blob([sheetData], { type: 'image/bmp' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.src = url;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(reject, 4000);
      });

      const spriteSize = 32;
      const spritesPerRow = Math.floor(img.width / spriteSize) || 1;
      const row = Math.floor(localId / spritesPerRow);
      const col = localId % spritesPerRow;

      const canvas = document.createElement('canvas');
      canvas.width = spriteSize;
      canvas.height = spriteSize;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, col * spriteSize, row * spriteSize, spriteSize, spriteSize, 0, 0, spriteSize, spriteSize);

      URL.revokeObjectURL(url);

      const result = new Image();
      result.src = canvas.toDataURL();
      await new Promise(r => { result.onload = r; });
      return result;
    } catch (e) {
      return null;
    }
  }

  // Sincrono simples (para o canvas atual)
  getSprite(spriteId) {
    if (this.spriteCache.has(spriteId)) {
      return this.spriteCache.get(spriteId);
    }
    // Tenta assíncrono em background (não bloqueia)
    this.getSpriteImage(spriteId).then(img => {
      if (img) this.spriteCache.set(spriteId, img);
    });
    return null; // será atualizado no próximo frame
  }

  isLoaded() {
    return this.loaded;
  }

  getFormat() {
    return this.format;
  }

  getCatalogInfo() {
    if (!this.loaded) return null;
    return {
      format: this.format,
      totalFiles: this.catalog ? this.catalog.length : 'N/A (classic)',
      sheets: this.spriteSheets.size || (this.sprData ? 1 : 0),
    };
  }
}

// =====================================================
// SINGLETON + MAPEAMENTOS
// =====================================================

let modernSpriteLoader = null;

export function getModernSpriteLoader() {
  if (!modernSpriteLoader) {
    modernSpriteLoader = new ModernTibiaSpriteLoader();
  }
  return modernSpriteLoader;
}

export default ModernTibiaSpriteLoader;

// =====================================================
// MAPEAMENTOS DE SPRITES (compatíveis com 8.60 + 15.x)
// =====================================================

export const MONSTER_SPRITES_MODERN = {
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

export const VOCATION_SPRITES_MODERN = {
  KNIGHT:   { male: 131, female: 254, name: 'Knight' },
  PALADIN:  { male: 129, female: 252, name: 'Paladin' },
  SORCERER: { male: 130, female: 253, name: 'Sorcerer' },
  DRUID:    { male: 136, female: 256, name: 'Druid' },
  MONK:     { male: 152, female: 152, name: 'Monk' },
  NONE:     { male: 128, female: 251, name: 'Citizen' },
};

// Mapeamento de efeitos / missiles (para futuro uso)
// Baseado em otclient + canary
export const EFFECT_SPRITES = {
  // Exemplo de efeitos
  'blood': 1,
  'fire': 2,
  'energy': 3,
  'poison': 4,
  'holy': 5,
  'death': 6,
  'ice': 7,
  'earth': 8,
};

export const MISSILE_SPRITES = {
  'arrow': 10,
  'bolt': 11,
  'spear': 12,
  'energy': 20,
  'fire': 21,
  'ice': 22,
};