// Zamba Idle - Serviço de Integração com o Canary
// Substitui/substitui o armazenamento em memória pela conexão real com o Canary

import { 
  Character, 
  getCharacter, 
  getCharactersByAccount, 
  deleteCharacter,
  createCharacter as createMemoryCharacter,
  getAllCharacters,
  getInstance,
} from '../models/Character.js';
import CANARY_CONFIG from '../config/canaryConfig.js';
import canaryDB, { isCanaryConnected } from './canaryDB.js';

// Estado do serviço
let useCanaryDB = false;

// Inicializar serviço do Canary
export async function initCanaryService() {
  const connected = await canaryDB.initCanaryDB();
  useCanaryDB = connected && CANARY_CONFIG.useCanaryDB;
  console.log(`Canary Service: DB=${useCanaryDB ? 'ATIVO' : 'INATIVO (memória)'}`);
  return useCanaryDB;
}

// ============ PERSONAGENS ============

export async function getCharacters(accountId) {
  if (useCanaryDB) {
    // Buscar diretamente no banco do Canary
    return await getCanaryCharacters(accountId);
  }
  // Fallback para memória
  return getCharactersByAccount(accountId).map(c => c.toJSON());
}

export async function getCharacterById(id) {
  if (useCanaryDB) {
    return await getCanaryCharacterById(id);
  }
  const char = getCharacter(id);
  return char ? char.toJSON() : null;
}

export async function createCanaryCharacter(data) {
  // Sempre criar no Canary se estiver disponível
  if (useCanaryDB) {
    const result = await canaryDB.createCanaryPlayer(
      { account_id: data.accountId || 1 },
      data
    );
    if (result.success) {
      // Criar também no modelo local para compatibilidade
      const char = createMemoryCharacter(data);
      // Atualizar no banco do Canary
      await canaryDB.updateCanaryPlayer({ ...data, id: char.id, stats: char.stats });
      return char.toJSON();
    }
    throw new Error(result.message || 'Erro ao criar no Canary');
  }
  
  // Fallback para memória
  const char = createMemoryCharacter(data);
  return char.toJSON();
}

export async function deleteCanaryCharacter(id) {
  if (useCanaryDB) {
    // Marcar como deletado no Canary (não remover do banco real)
    try {
      await canaryDB.executeQuery(
        `UPDATE ${CANARY_CONFIG.tables.players} SET deleted = 1 WHERE id = ?`,
        [id]
      );
      return true;
    } catch (error) {
      console.error('Erro ao deletar no Canary:', error.message);
    }
  }
  return deleteCharacter(id);
}

export async function updateCanaryCharacter(id, updates) {
  const char = getCharacter(id);
  if (!char) return null;

  // Atualizar no modelo local
  Object.assign(char, updates);
  
  // Atualizar no Canary se conectado
  if (useCanaryDB) {
    try {
      await canaryDB.updateCanaryPlayer({ ...char.toJSON(), name: char.name });
    } catch (error) {
      console.error('Erro ao atualizar no Canary:', error.message);
    }
  }
  
  return char.toJSON();
}

// ============ FUNÇÕES AUXILIARES PARA CANARY DB ============

async function getCanaryCharacters(accountId) {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.level,
        p.experience,
        p.cap,
        p.lookbody,
        p.looktype,
        p.vocation,
        a.id as account_id,
        a.name as account_name
      FROM ${CANARY_CONFIG.tables.players} p
      LEFT JOIN ${CANARY_CONFIG.tables.accounts} a ON p.account_id = a.id
      WHERE p.account_id = ? AND (p.deleted IS NULL OR p.deleted = 0)
    `;
    const rows = await canaryDB.executeQuery(query, [accountId]);
    
    // Converter para formato do jogo
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      vocation: getVocationNameFromCanary(row.vocation || 1),
      level: row.level || 1,
      experience: row.experience || 0,
      gold: 0,
      bossCoins: 0,
      stats: { hp: 150, mp: 50 },
      skills: { melee: 10, distance: 10, magic: 10, shielding: 10 },
      stamina: 1440,
      lootPouch: [],
      lootPouchSlots: 10,
      currentHunt: null,
      isHunting: false,
      totalMonstersKilled: 0,
      totalXpEarned: row.experience || 0,
      totalGoldEarned: 0,
      totalBossKills: 0,
      deaths: 0,
      createdAt: Date.now(),
    }));
  } catch (error) {
    console.error('Erro ao buscar personagens no Canary:', error.message);
    return [];
  }
}

async function getCanaryCharacterById(id) {
  try {
    const query = `
      SELECT p.*, a.name as account_name 
      FROM ${CANARY_CONFIG.tables.players} p
      LEFT JOIN ${CANARY_CONFIG.tables.accounts} a ON p.account_id = a.id
      WHERE p.id = ?
    `;
    const row = await canaryDB.executeSingle(query, [id]);
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      vocation: getVocationNameFromCanary(row.vocation || 1),
      level: row.level || 1,
      experience: row.experience || 0,
      gold: 0,
      bossCoins: 0,
      stats: { hp: row.health || 150, mp: row.mana || 50 },
      skills: { melee: 10, distance: 10, magic: 10, shielding: 10 },
      stamina: 1440,
      lootPouch: [],
      lootPouchSlots: 10,
      currentHunt: null,
      isHunting: false,
      totalMonstersKilled: 0,
      totalXpEarned: row.experience || 0,
      totalGoldEarned: 0,
      totalBossKills: 0,
      deaths: 0,
      createdAt: Date.now(),
    };
  } catch (error) {
    console.error('Erro ao buscar personagem no Canary:', error.message);
    return null;
  }
}

function getVocationNameFromCanary(vocationId) {
  const mapping = {
    1: 'KNIGHT',
    2: 'PALADIN',
    3: 'SORCERER',
    4: 'DRUID',
    5: 'MONK',
  };
  return mapping[vocationId] || 'NONE';
}

// Exportar status do serviço
export function getCanaryServiceStatus() {
  return {
    connected: isCanaryConnected(),
    useCanaryDB: useCanaryDB,
    config: CANARY_CONFIG,
  };
}

export default {
  initCanaryService,
  getCharacters,
  getCharacterById,
  createCanaryCharacter,
  deleteCanaryCharacter,
  updateCanaryCharacter,
  getCanaryServiceStatus,
};
