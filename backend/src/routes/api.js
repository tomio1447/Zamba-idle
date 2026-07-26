// Zamba Idle - Rotas da API
// Sistema completo com Instâncias e Boss Fights
import { Router } from 'express';
import canaryService from '../services/canaryService.js';
import { 
  createCharacter, 
  getCharacter, 
  getCharactersByAccount, 
  deleteCharacter,
  getAllCharacters 
} from '../models/Character.js';
import { VOCATIONS, HUNTING_ZONES, CONFIG } from '../config/gameConfig.js';
import { BOSSES, BOSS_SHOP, BOSS_REWARDS } from '../config/bossConfig.js';

import accountService from '../services/accountService.js';

const router = Router();

// ============ PERSONAGENS ============

router.post('/characters', async (req, res) => {
  try {
    const { name, vocation, accountId } = req.body;

    if (!name || !vocation || !accountId) {
      return res.status(400).json({ error: 'Nome, vocação e accountId são obrigatórios' });
    }

    if (name.length < 3 || name.length > 20) {
      return res.status(400).json({ error: 'Nome deve ter entre 3 e 20 caracteres' });
    }

    if (!VOCATIONS[vocation]) {
      return res.status(400).json({ error: 'Vocação inválida' });
    }

    // Tentar criar no Canary (integração real)
    let character;
    try {
      const result = await canaryService.createCanaryCharacter({ name, vocation, accountId });
      character = result || createCharacter({ name, vocation, accountId });
    } catch (e) {
      console.log('Canary não disponível, usando memória:', e.message);
      character = createCharacter({ name, vocation, accountId });
    }

    res.status(201).json(typeof character === 'object' && character.toJSON ? character.toJSON() : character);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/characters', async (req, res) => {
  const { accountId } = req.query;
  if (!accountId) {
    return res.status(400).json({ error: 'accountId é obrigatório' });
  }
  
  try {
    // Tentar buscar no Canary
    let characters = await canaryService.getCharacters(accountId);
    // Se não tiver no Canary, usar memória
    if (!characters || characters.length === 0) {
      characters = getCharactersByAccount(accountId).map(c => c.toJSON());
    }
    res.json(characters);
  } catch (error) {
    console.error('Erro ao buscar no Canary:', error.message);
    const characters = getCharactersByAccount(accountId);
    res.json(characters.map(c => c.toJSON()));
  }
});

router.get('/characters/:id', async (req, res) => {
  try {
    // Tentar buscar no Canary
    let character = await canaryService.getCharacterById(req.params.id);
    if (!character) {
      character = getCharacter(req.params.id);
      if (!character) {
        return res.status(404).json({ error: 'Personagem não encontrado' });
      }
      character = character.toJSON();
    }
    res.json(character);
  } catch (error) {
    console.error('Erro ao buscar no Canary:', error.message);
    const character = getCharacter(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }
    res.json(character.toJSON());
  }
});

router.delete('/characters/:id', async (req, res) => {
  try {
    await canaryService.deleteCanaryCharacter(req.params.id);
  } catch (e) {
    console.log('Canary delete ignorado:', e.message);
  }
  const deleted = deleteCharacter(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Personagem não encontrado' });
  }
  res.json({ success: true });
});

// ============ SISTEMA DE INSTÂNCIA ============

// Criar nova instância de caçada
router.post('/characters/:id/instance/create', (req, res) => {
  try {
    const character = getCharacter(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }

    const { zoneId } = req.body;
    const result = character.createInstance(zoneId);
    res.json({ ...result, character: character.toJSON() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atacar monstro na instância
router.post('/characters/:id/instance/attack', (req, res) => {
  try {
    const character = getCharacter(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }

    const { monsterIndex } = req.body;
    const result = character.attackMonster(monsterIndex || 0);
    res.json({ ...result, character: character.toJSON() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atacar o boss
router.post('/characters/:id/instance/attack-boss', (req, res) => {
  try {
    const character = getCharacter(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }

    const result = character.attackBoss();
    res.json({ ...result, character: character.toJSON() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Fugir da instância
router.post('/characters/:id/instance/flee', (req, res) => {
  try {
    const character = getCharacter(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }

    const result = character.fleeInstance();
    res.json({ ...result, character: character.toJSON() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Pegar status da instância atual
router.get('/characters/:id/instance', (req, res) => {
  try {
    const character = getCharacter(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }

    if (!character.currentInstance) {
      return res.json({ instance: null, character: character.toJSON() });
    }

    res.json({ 
      instance: character.getInstanceData(character.currentInstance), 
      character: character.toJSON() 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Auto-Attack do jogador (baseado no Canary/BaiakIdle Helper)
router.post('/characters/:id/instance/auto-attack', (req, res) => {
  try {
    const character = getCharacter(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }

    const result = character.autoAttack();
    res.json({ ...result, character: character.toJSON() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Auto-Monster-Attack (monstros atacam o jogador automaticamente)
router.post('/characters/:id/instance/auto-monster-attack', (req, res) => {
  try {
    const character = getCharacter(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }

    const result = character.autoMonsterAttack();
    res.json({ ...result, character: character.toJSON() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ LOOT ============

router.post('/characters/:id/loot/sell', (req, res) => {
  try {
    const character = getCharacter(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }

    const result = character.sellLoot();
    res.json({ ...result, character: character.toJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ BOSS SHOP ============

// Listar itens da Boss Shop
router.get('/boss-shop', (req, res) => {
  res.json(BOSS_SHOP);
});

// Comprar item da Boss Shop
router.post('/characters/:id/boss-shop/buy', (req, res) => {
  try {
    const character = getCharacter(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }

    const { itemId } = req.body;
    const result = character.buyBossShopItem(itemId);
    res.json({ ...result, character: character.toJSON() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ CONFIGURAÇÕES ============

router.get('/vocations', (req, res) => {
  res.json(VOCATIONS);
});

router.get('/zones', (req, res) => {
  res.json(HUNTING_ZONES);
});

router.get('/bosses', (req, res) => {
  res.json(BOSSES);
});

router.get('/boss-shop', (req, res) => {
  res.json(BOSS_SHOP);
});

router.get('/config', (req, res) => {
  res.json(CONFIG);
});

// ============ ACCOUNTS (BANCO PERSONALIZADO) ============

// Registro de account com conta e senha
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username deve ter entre 3 e 30 caracteres' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 4 caracteres' });
    }

    const result = await accountService.createAccount(username, password, email);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login com conta e senha
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }

    const result = await accountService.loginAccount(username, password);
    
    if (!result.success) {
      return res.status(401).json({ error: result.message });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar personagem vinculado a uma account existente (banco personalizado)
router.post('/accounts/:accountId/characters', async (req, res) => {
  try {
    const { name, vocation } = req.body;
    const accountId = parseInt(req.params.accountId);

    if (!name || !vocation || isNaN(accountId)) {
      return res.status(400).json({ error: 'Nome, vocação e accountId são obrigatórios' });
    }

    if (!VOCATIONS[vocation]) {
      return res.status(400).json({ error: 'Vocação inválida' });
    }

    const result = await accountService.createCharacterForAccount(accountId, {
      name,
      vocation,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar personagens de uma account (banco personalizado)
router.get('/accounts/:accountId/characters', async (req, res) => {
  try {
    const accountId = parseInt(req.params.accountId);
    if (isNaN(accountId)) {
      return res.status(400).json({ error: 'accountId inválido' });
    }

    const characters = await accountService.getCharactersByAccount(accountId);
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ LEADERBOARD ============

router.get('/leaderboard', (req, res) => {
  const characters = getAllCharacters();
  const sorted = characters
    .sort((a, b) => b.level - a.level || b.experience - a.experience)
    .slice(0, 50)
    .map(c => ({
      name: c.name,
      level: c.level,
      vocation: c.vocation,
      totalXpEarned: c.totalXpEarned,
      totalBossKills: c.totalBossKills,
    }));
  res.json(sorted);
});

export default router;
