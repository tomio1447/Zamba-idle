// Zamba Idle - Serviço de Accounts e Personagens
// Gerencia criação de contas com conta/senha e personagens vinculados

import mysql from 'mysql2/promise';
import CUSTOM_DB_CONFIG, { SCHEMA } from '../config/customDBConfig.js';
import { v4 as uuidv4 } from 'uuid';

// Hash simples de senha (em produção usar bcrypt/argon2)
function hashPassword(password) {
  // Hash básico para MVP - usar biblioteca real em produção
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password + 'zamba_salt_2026').digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Criar banco personalizado se necessário
async function ensureDB() {
  try {
    const tempPool = mysql.createPool({
      host: CUSTOM_DB_CONFIG.database.host,
      port: CUSTOM_DB_CONFIG.database.port,
      user: CUSTOM_DB_CONFIG.database.user,
      password: CUSTOM_DB_CONFIG.database.password,
      waitForConnections: false,
      connectionLimit: 1,
    });
    
    const conn = await tempPool.getConnection();
    
    // Criar banco se não existir
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${CUSTOM_DB_CONFIG.database.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${CUSTOM_DB_CONFIG.database.database}\``);
    
    // Criar tabelas
    await conn.query(SCHEMA.accounts);
    await conn.query(SCHEMA.characters);
    await conn.query(SCHEMA.sessions);
    
    conn.release();
    await tempPool.end();
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco personalizado:', error.message);
    return false;
  }
}

// Obter conexão com o banco personalizado
async function getDBConnection() {
  const tempPool = mysql.createPool({
    host: CUSTOM_DB_CONFIG.database.host,
    port: CUSTOM_DB_CONFIG.database.port,
    user: CUSTOM_DB_CONFIG.database.user,
    password: CUSTOM_DB_CONFIG.database.password,
    database: CUSTOM_DB_CONFIG.database.database,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });
  return await tempPool.getConnection();
}

// Criar uma nova account com conta e senha
export async function createAccount(username, password, email = null) {
  await ensureDB();
  
  const conn = await getDBConnection();
  
  try {
    // Verificar se o username já existe
    const [existing] = await conn.execute(
      'SELECT id FROM zamba_accounts WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      conn.release();
      throw new Error('Username já existe');
    }
    
    // Inserir account
    const [result] = await conn.execute(
      'INSERT INTO zamba_accounts (username, password_hash, email) VALUES (?, ?, ?)',
      [username, hashPassword(password), email]
    );
    
    conn.release();
    return {
      id: result.insertId,
      username,
      email,
      created: true,
      message: 'Account criada com sucesso',
    };
  } catch (error) {
    conn.release();
    throw error;
  }
}

// Autenticar account (conta + senha)
export async function loginAccount(username, password) {
  await ensureDB();
  
  const conn = await getDBConnection();
  
  try {
    const [rows] = await conn.execute(
      'SELECT id, username, password_hash, is_active FROM zamba_accounts WHERE username = ?',
      [username]
    );
    
    conn.release();
    
    if (rows.length === 0) {
      return { success: false, message: 'Account não encontrada' };
    }
    
    const account = rows[0];
    
    if (!account.is_active) {
      return { success: false, message: 'Account inativa' };
    }
    
    if (!verifyPassword(password, account.password_hash)) {
      return { success: false, message: 'Senha incorreta' };
    }
    
    return {
      success: true,
      account: {
        id: account.id,
        username: account.username,
      },
      message: 'Login realizado com sucesso',
    };
  } catch (error) {
    conn.release();
    throw error;
  }
}

// Criar personagem vinculado à account
export async function createCharacterForAccount(accountId, characterData) {
  await ensureDB();
  
  const conn = await getDBConnection();
  
  try {
    // Verificar se a account existe
    const [accountRows] = await conn.execute(
      'SELECT id FROM zamba_accounts WHERE id = ?',
      [accountId]
    );
    
    if (accountRows.length === 0) {
      conn.release();
      throw new Error('Account não encontrada');
    }
    
    // Gerar ID único para o personagem
    const charId = uuidv4();
    
    // Inserir personagem
    const [result] = await conn.execute(
      `INSERT INTO zamba_characters 
       (id, account_id, name, vocation, level, experience, gold, boss_coins, stamina, 
        stats_hp, stats_mp, skills_melee, skills_distance, skills_magic, skills_shielding)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        charId,
        accountId,
        characterData.name,
        characterData.vocation || 'KNIGHT',
        characterData.level || 1,
        characterData.experience || 0,
        characterData.gold || 0,
        characterData.bossCoins || 0,
        characterData.stamina || 1440,
        characterData.stats?.hp || 150,
        characterData.stats?.mp || 50,
        characterData.skills?.melee || 10,
        characterData.skills?.distance || 10,
        characterData.skills?.magic || 10,
        characterData.skills?.shielding || 10,
      ]
    );
    
    conn.release();
    
    // Buscar o personagem criado
    const [charRows] = await conn.execute(
      'SELECT * FROM zamba_characters WHERE id = ?',
      [charId]
    );
    
    conn.release();
    
    return {
      id: charId,
      account_id: accountId,
      ...charRows[0],
      created: true,
      message: 'Personagem criado com sucesso',
    };
  } catch (error) {
    conn.release();
    throw error;
  }
}

// Listar personagens de uma account
export async function getCharactersByAccount(accountId) {
  await ensureDB();
  
  const conn = await getDBConnection();
  
  try {
    const [rows] = await conn.execute(
      'SELECT * FROM zamba_characters WHERE account_id = ? AND is_active = 1',
      [accountId]
    );
    
    conn.release();
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      vocation: row.vocation,
      level: row.level,
      experience: row.experience,
      gold: row.gold,
      bossCoins: row.boss_coins,
      stamina: row.stamina,
      stats: { hp: row.stats_hp, mp: row.stats_mp },
      skills: {
        melee: row.skills_melee,
        distance: row.skills_distance,
        magic: row.skills_magic,
        shielding: row.skills_shielding,
      },
      lootPouch: row.loot_pouch ? JSON.parse(row.loot_pouch) : [],
      lootPouchSlots: row.loot_pouch_slots,
      currentHunt: row.current_hunt,
      isHunting: !!row.is_hunting,
      totalMonstersKilled: row.total_monsters_killed,
      totalXpEarned: row.total_xp_earned,
      totalGoldEarned: row.total_gold_earned,
      totalBossKills: row.total_boss_kills,
      deaths: row.deaths,
      createdAt: row.created_at,
    }));
  } catch (error) {
    conn.release();
    throw error;
  }
}

// Atualizar personagem
export async function updateCharacter(characterId, updates) {
  await ensureDB();
  
  const conn = await getDBConnection();
  
  try {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = ?`);
      values.push(value);
    }
    
    if (fields.length === 0) {
      conn.release();
      return { updated: false };
    }
    
    values.push(characterId);
    
    await conn.execute(
      `UPDATE zamba_characters SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    conn.release();
    return { updated: true };
  } catch (error) {
    conn.release();
    throw error;
  }
}

// Deletar personagem (soft delete)
export async function deleteCharacter(accountId, characterId) {
  await ensureDB();
  
  const conn = await getDBConnection();
  
  try {
    await conn.execute(
      'UPDATE zamba_characters SET is_active = 0 WHERE id = ? AND account_id = ?',
      [characterId, accountId]
    );
    conn.release();
    return { deleted: true };
  } catch (error) {
    conn.release();
    throw error;
  }
}

export default {
  createAccount,
  loginAccount,
  createCharacterForAccount,
  getCharactersByAccount,
  updateCharacter,
  deleteCharacter,
};
