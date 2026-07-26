// Zamba Idle - Rotas da API
// Sistema completo com Instâncias e Boss Fights
import { Router } from 'express';
import { 
  createCharacter, 
  getCharacter, 
  getCharactersByAccount, 
  deleteCharacter,
  getAllCharacters 
} from '../models/Character.js';
import { VOCATIONS, HUNTING_ZONES, CONFIG } from '../config/gameConfig.js';
import { BOSSES, BOSS_SHOP, BOSS_REWARDS } from '../config/bossConfig.js';

const router = Router();

// ============ PERSONAGENS ============

router.post('/characters', (req, res) => {
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

    const character = createCharacter({ name, vocation, accountId });
    res.status(201).json(character.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/characters', (req, res) => {
  const { accountId } = req.query;
  if (!accountId) {
    return res.status(400).json({ error: 'accountId é obrigatório' });
  }
  
  const characters = getCharactersByAccount(accountId);
  res.json(characters.map(c => c.toJSON()));
});

router.get('/characters/:id', (req, res) => {
  const character = getCharacter(req.params.id);
  if (!character) {
    return res.status(404).json({ error: 'Personagem não encontrado' });
  }
  res.json(character.toJSON());
});

router.delete('/characters/:id', (req, res) => {
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
