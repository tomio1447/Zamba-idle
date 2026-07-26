// Zamba Idle - Serviço de Conexão com o Canary (MySQL)
// Integração real com o banco de dados do Canary Server (OpenTibiaBR)

import mysql from 'mysql2/promise';
import CANARY_CONFIG from '../config/canaryConfig.js';

let pool = null;
let isConnected = false;

// Inicializar conexão com o banco do Canary
export async function initCanaryDB() {
  try {
    pool = mysql.createPool({
      host: CANARY_CONFIG.database.host,
      port: CANARY_CONFIG.database.port,
      user: CANARY_CONFIG.database.user,
      password: CANARY_CONFIG.database.password,
      database: CANARY_CONFIG.database.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: CANARY_CONFIG.connectionTimeout,
    });

    // Testar conexão
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    isConnected = true;
    console.log('✅ Canary DB conectado com sucesso:', CANARY_CONFIG.database.database, '@', CANARY_CONFIG.database.host);
    return true;
  } catch (error) {
    console.warn('⚠️ Canary DB não disponível (usando memória):', error.message);
    isConnected = false;
    pool = null;
    return false;
  }
}

// Obter conexão do pool
export async function getConnection() {
  if (!pool || !isConnected) {
    throw new Error('Canary DB não está conectado');
  }
  return await pool.getConnection();
}

// Executar query com tratamento de erro
export async function executeQuery(query, params = []) {
  try {
    if (!pool || !isConnected) {
      throw new Error('Canary DB não conectado');
    }
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('❌ Erro na query Canary:', error.message);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

// Executar query que retorna uma única linha
export async function executeSingle(query, params = []) {
  const rows = await executeQuery(query, params);
  return rows[0] || null;
}

// Verificar se está conectado
export function isCanaryConnected() {
  return isConnected && pool !== null;
}

// Fechar pool
export async function closeCanaryDB() {
  if (pool) {
    await pool.end();
    pool = null;
    isConnected = false;
  }
}

// Funções específicas para integração com o Canary

// Buscar personagem no banco do Canary
export async function getCanaryPlayer(characterId, characterName) {
  if (!isCanaryConnected()) return null;

  try {
    // Buscar por nome na tabela players do Canary
    const query = `
      SELECT 
        p.id, 
        p.name, 
        p.level, 
        p.experience, 
        p.health, 
        p.healthmax, 
        p.mana, 
        p.manamax,
        p.cap, 
        p.lookbody, 
        p.lookfeet, 
        p.lookhead, 
        p.looklegs, 
        p.looktype,
        a.id as account_id,
        a.name as account_name
      FROM ${CANARY_CONFIG.tables.players} p
      LEFT JOIN ${CANARY_CONFIG.tables.accounts} a ON p.account_id = a.id
      WHERE p.name = ?
      LIMIT 1
    `;
    const player = await executeSingle(query, [characterName]);
    return player;
  } catch (error) {
    console.error('Erro ao buscar player no Canary:', error.message);
    return null;
  }
}

// Atualizar dados do personagem no Canary
export async function updateCanaryPlayer(characterData) {
  if (!isCanaryConnected()) return false;

  try {
    const query = `
      UPDATE ${CANARY_CONFIG.tables.players}
      SET 
        level = ?,
        experience = ?,
        health = ?,
        healthmax = ?,
        mana = ?,
        manamax = ?,
        cap = ?,
        lastlogin = ?
      WHERE name = ?
    `;
    await executeQuery(query, [
      characterData.level || 1,
      characterData.experience || 0,
      characterData.stats?.hp || 150,
      characterData.stats?.hp || 150,
      characterData.stats?.mp || 50,
      characterData.stats?.mp || 50,
      characterData.cap || 400,
      Date.now(),
      characterData.name,
    ]);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar player no Canary:', error.message);
    return false;
  }
}

// Inserir personagem no Canary (se não existir)
export async function createCanaryPlayer(accountData, playerData) {
  if (!isCanaryConnected()) return false;

  try {
    // Verificar se o personagem já existe
    const existing = await getCanaryPlayer(null, playerData.name);
    if (existing) {
      return { success: false, message: 'Personagem já existe no Canary', player: existing };
    }

    // Inserir na tabela players
    const insertQuery = `
      INSERT INTO ${CANARY_CONFIG.tables.players} 
      (name, account_id, level, experience, health, healthmax, mana, manamax, cap, lookbody, lookfeet, lookhead, looklegs, looktype, vocation, town_id, posx, posy, posz, conditions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      playerData.name,
      accountData.account_id || 1,
      playerData.level || 1,
      playerData.experience || 0,
      playerData.stats?.hp || 150,
      playerData.stats?.hp || 150,
      playerData.stats?.mp || 50,
      playerData.stats?.mp || 50,
      400,
      128, // lookbody padrão (Citizen)
      128,
      128,
      128,
      128,
      CANARY_CONFIG.vocationMapping[playerData.vocation] || 1,
      1, // town_id (Rookgaard)
      1000,
      1000,
      7,
      1, // conditions (sem condições especiais)
    ];
    const result = await executeQuery(insertQuery, values);
    return { success: true, insertId: result.insertId, message: 'Personagem criado no Canary' };
  } catch (error) {
    console.error('Erro ao criar player no Canary:', error.message);
    return { success: false, message: error.message };
  }
}

export default {
  initCanaryDB,
  getConnection,
  executeQuery,
  executeSingle,
  isCanaryConnected,
  closeCanaryDB,
  getCanaryPlayer,
  updateCanaryPlayer,
  createCanaryPlayer,
};
