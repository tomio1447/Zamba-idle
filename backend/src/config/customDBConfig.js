// Zamba Idle - Banco de Dados Personalizado
// Esquema próprio para gerenciamento de accounts e personagens

export const CUSTOM_DB_CONFIG = {
  // Configurações de conexão (pode ser o mesmo MySQL do Canary ou um banco separado)
  database: {
    host: process.env.ZAMBA_DB_HOST || process.env.CANARY_DB_HOST || 'localhost',
    port: parseInt(process.env.ZAMBA_DB_PORT || process.env.CANARY_DB_PORT) || 3306,
    user: process.env.ZAMBA_DB_USER || process.env.CANARY_DB_USER || 'zamba',
    password: process.env.ZAMBA_DB_PASSWORD || process.env.CANARY_DB_PASSWORD || 'zamba',
    database: process.env.ZAMBA_DB_NAME || 'zamba_idle',
  },

  // Se deve criar o banco automaticamente se não existir
  createDBIfNotExists: true,

  // Se deve criar as tabelas automaticamente
  createTablesIfNotExists: true,
};

// Esquema das tabelas personalizadas
export const SCHEMA = {
  // Tabela de contas (accounts)
  accounts: `
    CREATE TABLE IF NOT EXISTS zamba_accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      email VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP NULL DEFAULT NULL,
      is_active TINYINT(1) DEFAULT 1,
      INDEX idx_username (username),
      INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // Tabela de personagens vinculada à account
  characters: `
    CREATE TABLE IF NOT EXISTS zamba_characters (
      id VARCHAR(36) PRIMARY KEY,
      account_id INT NOT NULL,
      name VARCHAR(50) NOT NULL,
      vocation ENUM('KNIGHT','PALADIN','SORCERER','DRUID','MONK') DEFAULT 'KNIGHT',
      level INT DEFAULT 1,
      experience BIGINT DEFAULT 0,
      gold INT DEFAULT 0,
      boss_coins INT DEFAULT 0,
      stamina INT DEFAULT 1440,
      stats_hp INT DEFAULT 150,
      stats_mp INT DEFAULT 50,
      skills_melee INT DEFAULT 10,
      skills_distance INT DEFAULT 10,
      skills_magic INT DEFAULT 10,
      skills_shielding INT DEFAULT 10,
      loot_pouch JSON DEFAULT '[]',
      loot_pouch_slots INT DEFAULT 10,
      current_hunt VARCHAR(50) NULL,
      is_hunting TINYINT(1) DEFAULT 0,
      total_monsters_killed INT DEFAULT 0,
      total_xp_earned BIGINT DEFAULT 0,
      total_gold_earned BIGINT DEFAULT 0,
      total_boss_kills INT DEFAULT 0,
      deaths INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES zamba_accounts(id) ON DELETE CASCADE,
      INDEX idx_account (account_id),
      INDEX idx_name (name),
      INDEX idx_level (level)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // Tabela de sessões (opcional)
  sessions: `
    CREATE TABLE IF NOT EXISTS zamba_sessions (
      id VARCHAR(36) PRIMARY KEY,
      account_id INT NOT NULL,
      token VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES zamba_accounts(id) ON DELETE CASCADE,
      INDEX idx_token (token)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,
};

export default CUSTOM_DB_CONFIG;
