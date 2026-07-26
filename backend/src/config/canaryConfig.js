// Zamba Idle - Configuração do Canary Server (OpenTibiaBR)
// Integração com o banco de dados MySQL do TFS

export const CANARY_CONFIG = {
  // Configurações de conexão com o banco MySQL do Canary
  database: {
    host: process.env.CANARY_DB_HOST || 'localhost',
    port: parseInt(process.env.CANARY_DB_PORT) || 3306,
    user: process.env.CANARY_DB_USER || 'canary',
    password: process.env.CANARY_DB_PASSWORD || 'canary',
    database: process.env.CANARY_DB_NAME || 'canary',
  },

  // Nome das tabelas do Canary (esquema TFS 1.5+)
  tables: {
    accounts: 'accounts',
    players: 'players',
    player_deaths: 'player_deaths',
    player_items: 'player_items',
    guild_memberships: 'guild_memberships',
    guild_ranks: 'guild_ranks',
    houses: 'houses',
  },

  // Se deve usar o banco real do Canary ou fallback de memória
  useCanaryDB: process.env.CANARY_USE_DB === 'true',

  // Timeout de conexão (ms)
  connectionTimeout: 5000,
};

// Configurações do jogo integradas ao Canary
export const CANARY_GAME_CONFIG = {
  // Mapeamento de vocações do Tibia para o sistema do Canary
  vocationMapping: {
    'KNIGHT': 1,
    'PALADIN': 2,
    'SORCERER': 3,
    'DRUID': 4,
    'MONK': 5,
  },
  // Multiplicadores baseados no Canary original
  xpMultiplier: 1.0,
  lootMultiplier: 1.0,
  // Configurações de stamina (minutos)
  staminaRegenRate: 1,
  staminaMaxMinutes: 1440,
};

export default CANARY_CONFIG;
