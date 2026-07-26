// Zamba Idle - Modelo de Personagem
// Sistema completo com Instâncias e Boss Fights
import { v4 as uuidv4 } from 'uuid';
import { 
  VOCATIONS, 
  HUNTING_ZONES, 
  MONSTERS, 
  CONFIG, 
  xpForLevel, 
  calculateStats 
} from '../config/gameConfig.js';
import { 
  BOSSES, 
  BOSS_SYSTEM, 
  INSTANCE_SYSTEM, 
  BOSS_REWARDS,
  BOSS_SHOP,
  getBossForZone, 
  calculateBossRewards 
} from '../config/bossConfig.js';
import { getMapGenerator } from '../utils/mapGenerator.js';

import canaryService, { initCanaryService } from '../services/canaryService.js';

// Inicializar Canary ao carregar o módulo
initCanaryService().catch(err => console.error('Erro ao inicializar Canary:', err));

// Armazenamento em memória
const characters = new Map();
const instances = new Map();

export class Character {
  constructor({ name, vocation, accountId }) {
    this.id = uuidv4();
    this.name = name;
    this.vocation = vocation;
    this.accountId = accountId;
    this.level = 1;
    this.experience = 0;
    this.skillPoints = 0;
    this.skills = {
      melee: 10,
      distance: 10,
      magic: 10,
      shielding: 10,
      fishing: 10,
    };
    this.gold = 0;
    this.bossCoins = 0;
    this.stamina = CONFIG.STAMINA_MAX;
    this.lootPouch = [];
    this.lootPouchSlots = CONFIG.LOOT_POUCH_BASE_SLOTS;
    this.currentHunt = null;
    this.huntStartTime = null;
    this.lastActive = Date.now();
    this.isHunting = false;
    this.totalMonstersKilled = 0;
    this.totalXpEarned = 0;
    this.totalGoldEarned = 0;
    this.totalBossKills = 0;
    this.bossCoinsEarned = 0;
    this.deaths = 0;
    this.createdAt = Date.now();
    this.stats = calculateStats(1, vocation);
    
    // Sistema de Instância
    this.currentInstance = null;
    this.instanceProgress = {
      wave: 0,
      monstersKilledInWave: 0,
      totalWaves: 0,
      isBossWave: false,
      bossDefeated: false,
      startTime: null,
    };
    
    // Boss Cooldown
    this.lastBossFight = null;
    this.bossCooldownActive = false;
    
    // Boosts ativos
    this.activeBoosts = {
      xpBoost: null,
      lootBoost: null,
    };
  }

  // ============ SISTEMA DE INSTÂNCIA ============

  // Criar nova instância de caçada
  createInstance(zoneId) {
    const zone = HUNTING_ZONES.find(z => z.id === zoneId);
    if (!zone) throw new Error('Zona de caçada não encontrada');
    if (this.level < zone.minLevel) {
      throw new Error(`Nível mínimo para esta zona é ${zone.minLevel}`);
    }
    if (this.stamina <= 0) throw new Error('Sem stamina. Aguarde regenerar.');

    const instanceId = uuidv4();
    const totalWaves = this.calculateTotalWaves(zone);
    
    // Gerar mapa procedural para a zona
    const mapGenerator = getMapGenerator();
    const map = mapGenerator.generateMap(zoneId, zone);
    
    const instance = {
      id: instanceId,
      zoneId,
      zoneName: zone.name,
      zone,
      map,
      wave: 1,
      totalWaves,
      monstersKilledInWave: 0,
      monstersPerWave: INSTANCE_SYSTEM.MONSTERS_PER_WAVE,
      isBossWave: false,
      bossWaveNumber: BOSS_SYSTEM.WAVES_PER_BOSS,
      currentBoss: null,
      bossDefeated: false,
      bossSpawned: false,
      startTime: Date.now(),
      lastWaveTime: Date.now(),
      monsters: [],
      rewards: {
        xp: 0,
        gold: 0,
        loot: [],
        bossCoins: 0,
      },
      isCompleted: false,
      fled: false,
    };

    // Verificar se a primeira wave é de boss
    if (instance.wave % BOSS_SYSTEM.WAVES_PER_BOSS === 0) {
      instance.isBossWave = true;
      instance.currentBoss = getBossForZone(zoneId, this.level);
    }

    // Gerar monstros para a wave atual
    this.spawnWaveMonsters(instance);

    this.currentInstance = instance;
    this.currentHunt = zoneId;
    this.isHunting = true;
    this.huntStartTime = Date.now();
    this.lastActive = Date.now();

    instances.set(instanceId, instance);
    
    return { success: true, instance: this.getInstanceData(instance) };
  }

  // Calcular total de waves baseado no nível
  calculateTotalWaves(zone) {
    const baseWaves = BOSS_SYSTEM.WAVES_PER_BOSS;
    const levelBonus = Math.floor(this.level / 20);
    return baseWaves + levelBonus;
  }

  // Gerar monstros para a wave
  spawnWaveMonsters(instance) {
    const zone = instance.zone;
    instance.monsters = [];
    
    if (instance.isBossWave && instance.currentBoss) {
      // Wave de boss - 1 boss + monstros normais
      instance.monsters.push({
        ...instance.currentBoss,
        isBoss: true,
        currentHp: instance.currentBoss.hp,
        maxHp: instance.currentBoss.hp,
      });
      
      // Adicionar monstros normais na wave de boss (metade)
      const normalMonsters = Math.floor(instance.monstersPerWave / 2);
      for (let i = 0; i < normalMonsters; i++) {
        const monsterName = zone.monsters[Math.floor(Math.random() * zone.monsters.length)];
        const monster = MONSTERS[monsterName];
        if (monster) {
          instance.monsters.push({
            name: monsterName,
            hp: monster.hp,
            currentHp: monster.hp,
            maxHp: monster.hp,
            xp: monster.xp,
            loot: monster.loot,
            isBoss: false,
          });
        }
      }
    } else {
      // Wave normal
      for (let i = 0; i < instance.monstersPerWave; i++) {
        const monsterName = zone.monsters[Math.floor(Math.random() * zone.monsters.length)];
        const monster = MONSTERS[monsterName];
        if (monster) {
          instance.monsters.push({
            name: monsterName,
            hp: monster.hp,
            currentHp: monster.hp,
            maxHp: monster.hp,
            xp: monster.xp,
            loot: monster.loot,
            isBoss: false,
          });
        }
      }
    }
  }

  // Calcular dano recebido dos monstros (quando eles atacam o jogador)
  takeDamageFromMonsters(instance) {
    const aliveMonsters = instance.monsters.filter(m => m.currentHp > 0);
    if (aliveMonsters.length === 0) return { damageTaken: 0, dead: false };

    let totalDamage = 0;
    
    // Cada monstro vivo ataca o jogador
    aliveMonsters.forEach(monster => {
      // Dano base do monstro (baseado no nível do jogador e zona)
      const monsterData = MONSTERS[monster.name] || { damage: 5 };
      let baseDamage = (monsterData.damage || 5) + Math.floor(this.level * 0.5);
      
      // Boss causa mais dano
      if (monster.isBoss) baseDamage *= 2.5;
      
      // Defesa do jogador (baseado na vocação e shielding)
      const defense = this.skills.shielding * 0.1 + (this.stats.hp > 100 ? 5 : 0);
      const damageAfterDefense = Math.max(1, Math.floor(baseDamage - defense));
      
      totalDamage += damageAfterDefense;
    });

    // Aplicar dano ao jogador
    this.stats.hp = Math.max(0, this.stats.hp - totalDamage);
    const result = {
      damageTaken: totalDamage,
      currentHp: this.stats.hp,
      maxHp: this.stats.hp,
      dead: this.stats.hp <= 0,
    };

    if (result.dead) {
      this.deaths++;
      this.stats.hp = this.stats.hp; // Manter para registro
    }

    return result;
  }

  // Atacar monstro na instância
  attackMonster(monsterIndex = 0) {
    if (!this.currentInstance || this.currentInstance.isCompleted) {
      throw new Error('Nenhuma instância ativa');
    }

    const instance = this.currentInstance;
    const monster = instance.monsters[monsterIndex];
    
    if (!monster || monster.currentHp <= 0) {
      throw new Error('Monstro já está morto ou não existe');
    }

    // Os monstros atacam o jogador de volta
    const monsterAttackResult = this.takeDamageFromMonsters(instance);

    // Calcular dano baseado na vocação e skills
    const damage = this.calculateDamage(monster);
    monster.currentHp -= damage;

    const result = {
      damage,
      monsterName: monster.name,
      monsterHp: monster.currentHp,
      monsterMaxHp: monster.maxHp,
      killed: false,
      rewards: null,
      waveComplete: false,
      bossSpawned: false,
      damageTaken: monsterAttackResult ? monsterAttackResult.damageTaken : 0,
      currentHp: monsterAttackResult ? monsterAttackResult.currentHp : this.stats.hp,
      dead: monsterAttackResult ? monsterAttackResult.dead : false,
    };

    // Verificar se matou o monstro
    if (monster.currentHp <= 0) {
      result.killed = true;
      instance.monstersKilledInWave++;
      this.totalMonstersKilled++;

      // Coletar recompensas
      const monsterRewards = this.collectMonsterRewards(monster);
      result.rewards = monsterRewards;

      // Verificar se wave está completa
      const aliveMonsters = instance.monsters.filter(m => m.currentHp > 0);
      if (aliveMonsters.length === 0) {
        result.waveComplete = true;
        this.completeWave(instance);
      }
    }

    return result;
  }

  // Calcular dano do personagem
  calculateDamage(monster) {
    const voc = VOCATIONS[this.vocation] || VOCATIONS.NONE;
    let baseDamage = this.level * 2;
    
    // Bonus por vocação
    if (voc.meleeBonus) baseDamage += this.skills.melee * voc.meleeBonus;
    if (voc.distanceBonus) baseDamage += this.skills.distance * voc.distanceBonus;
    if (voc.magicBonus) baseDamage += this.skills.magic * voc.magicBonus;
    
    // Variação aleatória (±20%)
    const variation = 0.8 + Math.random() * 0.4;
    return Math.floor(baseDamage * variation);
  }

  // Coletar recompensas de um monstro
  collectMonsterRewards(monster) {
    const rewards = { xp: 0, gold: 0, loot: [] };
    
    // XP
    let xpGain = monster.xp || 0;
    if (this.activeBoosts.xpBoost) xpGain *= 2;
    rewards.xp = xpGain;
    this.experience += xpGain;
    this.totalXpEarned += xpGain;

    // Loot
    if (monster.loot) {
      const lootMultiplier = this.activeBoosts.lootBoost ? 2 : 1;
      monster.loot.forEach(itemDrop => {
        const chance = itemDrop.chance * lootMultiplier;
        if (Math.random() < chance) {
          const quantity = Math.floor(Math.random() * (itemDrop.max - itemDrop.min + 1)) + itemDrop.min;
          const lootItem = {
            id: itemDrop.id,
            name: itemDrop.name,
            quantity,
            goldValue: itemDrop.id === 'gold_coin' ? quantity : quantity * 5,
            monster: monster.name,
          };
          rewards.loot.push(lootItem);
          this.addLootToPouch(lootItem);
        }
      });
    }

    // Gold do loot
    rewards.gold = rewards.loot.reduce((sum, item) => sum + (item.goldValue || 0), 0);
    this.gold += rewards.gold;
    this.totalGoldEarned += rewards.gold;

    return rewards;
  }

  // Completar wave
  completeWave(instance) {
    // Dar bônus de wave
    const waveBonus = Math.floor(instance.wave * 10);
    this.experience += waveBonus;
    this.totalXpEarned += waveBonus;
    instance.rewards.xp += waveBonus;

    // Avançar para próxima wave
    instance.wave++;
    instance.monstersKilledInWave = 0;
    instance.lastWaveTime = Date.now();

    // Verificar se é wave de boss
    if (instance.wave % BOSS_SYSTEM.WAVES_PER_BOSS === 0) {
      instance.isBossWave = true;
      instance.currentBoss = getBossForZone(instance.zoneId, this.level);
      instance.bossSpawned = false;
    } else {
      instance.isBossWave = false;
      instance.currentBoss = null;
    }

    // Verificar se completou todas as waves
    if (instance.wave > instance.totalWaves) {
      this.completeInstance(instance);
    } else {
      // Gerar monstros para próxima wave
      this.spawnWaveMonsters(instance);
    }
  }

  // Completar instância
  completeInstance(instance) {
    instance.isCompleted = true;
    this.isHunting = false;
    
    // Bônus de conclusão
    const completionBonus = Math.floor(instance.totalWaves * 50);
    this.experience += completionBonus;
    this.totalXpEarned += completionBonus;
    instance.rewards.xp += completionBonus;

    // Verificar level up
    this.checkLevelUp();
    this.stats = calculateStats(this.level, this.vocation);
  }

  // Fugir da instância
  fleeInstance() {
    if (!this.currentInstance) {
      throw new Error('Nenhuma instância ativa');
    }

    const instance = this.currentInstance;
    instance.fled = true;
    instance.isCompleted = true;
    this.isHunting = false;
    
    // Penalidade de fuga - perder metade do loot coletado
    const penaltyGold = Math.floor(instance.rewards.gold / 2);
    this.gold = Math.max(0, this.gold - penaltyGold);

    return { 
      success: true, 
      message: 'Você fugiu da instância!',
      penalty: penaltyGold,
    };
  }

  // ============ SISTEMA DE ATAQUE AUTOMÁTICO ============

  // Auto-Attack: Jogador ataca automaticamente (como no Canary/BaiakIdle)
  autoAttack() {
    if (!this.currentInstance || this.currentInstance.isCompleted) {
      throw new Error('Nenhuma instância ativa');
    }

    const instance = this.currentInstance;
    const aliveMonsters = instance.monsters.filter(m => m.currentHp > 0);
    if (aliveMonsters.length === 0) {
      // Se todos mortos, tentar completar a wave automaticamente
      if (!instance.isCompleted) {
        this.completeWave(instance);
      }
      return { success: true, message: 'Wave completa automaticamente', waveComplete: true };
    }

    // Priorizar boss se existir
    const boss = aliveMonsters.find(m => m.isBoss);
    if (boss && instance.isBossWave) {
      return this.attackBoss();
    }

    // Encontrar o monstro com menor HP (como no HelperSystem)
    const target = aliveMonsters.sort((a, b) => a.currentHp - b.currentHp)[0];
    const targetIndex = instance.monsters.indexOf(target);

    return this.attackMonster(targetIndex);
  }

  // Auto-Monster-Attack: Monstros atacam o jogador automaticamente
  // (simula o dano contínuo dos monstros sem que o jogador ataque)
  autoMonsterAttack() {
    if (!this.currentInstance || this.currentInstance.isCompleted) {
      return { damageTaken: 0, dead: false, message: 'Nenhuma instância ativa' };
    }

    const instance = this.currentInstance;
    const result = this.takeDamageFromMonsters(instance);

    return {
      ...result,
      message: 'Monstros atacaram automaticamente',
      instance: this.getInstanceData(instance),
    };
  }

  // ============ SISTEMA DE BOSS ============

  // Atacar o boss
  attackBoss() {
    if (!this.currentInstance || !this.currentInstance.isBossWave) {
      throw new Error('Não há boss para atacar');
    }

    const instance = this.currentInstance;
    const boss = instance.monsters.find(m => m.isBoss && m.currentHp > 0);
    
    if (!boss) {
      throw new Error('Boss já foi derrotado');
    }

    // Calcular dano (boss tem defesa)
    const damage = Math.floor(this.calculateDamage(boss) * 0.7); // 30% redução de dano em boss
    boss.currentHp -= damage;

    const result = {
      damage,
      bossName: boss.name,
      bossHp: boss.currentHp,
      bossMaxHp: boss.maxHp,
      defeated: false,
      rewards: null,
    };

    // Verificar se derrotou o boss
    if (boss.currentHp <= 0) {
      result.defeated = true;
      instance.bossDefeated = true;
      this.totalBossKills++;
      this.lastBossFight = Date.now();

      // Calcular recompensas de boss
      const bossRewards = calculateBossRewards(boss, this.level);
      result.rewards = bossRewards;
      
      // Aplicar recompensas
      this.experience += bossRewards.xp;
      this.totalXpEarned += bossRewards.xp;
      this.bossCoins += bossRewards.bossCoins;
      this.bossCoinsEarned += bossRewards.bossCoins;
      
      // Adicionar loot raro à pouch
      bossRewards.loot.forEach(item => {
        this.addLootToPouch({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          rare: item.rare,
          goldValue: BOSS_REWARDS.rare_items[item.id]?.value || 100,
        });
      });

      instance.rewards.bossCoins = bossRewards.bossCoins;
      instance.rewards.xp += bossRewards.xp;
      instance.rewards.loot.push(...bossRewards.loot);
    }

    return result;
  }

  // ============ SISTEMA DE LOOT ============

  addLootToPouch(item) {
    if (this.lootPouch.length < this.lootPouchSlots) {
      this.lootPouch.push(item);
    }
  }

  sellLoot() {
    const totalGold = this.lootPouch.reduce((sum, item) => sum + (item.goldValue || 0), 0);
    this.gold += totalGold;
    this.totalGoldEarned += totalGold;
    
    const soldItems = [...this.lootPouch];
    this.lootPouch = [];
    
    return { success: true, goldEarned: totalGold, itemsSold: soldItems.length };
  }

  // ============ BOSS SHOP ============

  buyBossShopItem(itemId) {
    const item = BOSS_SHOP.find(i => i.id === itemId);
    if (!item) throw new Error('Item não encontrado na Boss Shop');
    
    if (this.bossCoins < item.cost) {
      throw new Error(`Boss Coins insuficientes. Necessário: ${item.cost}`);
    }

    this.bossCoins -= item.cost;

    // Aplicar efeito
    switch (item.effect) {
      case 'loot_slot':
        this.lootPouchSlots += 1;
        break;
      case 'loot_slot_5':
        this.lootPouchSlots += 5;
        break;
      case 'stamina':
        this.stamina = Math.min(CONFIG.STAMINA_MAX, this.stamina + 100);
        break;
      case 'xp_boost':
        this.activeBoosts.xpBoost = Date.now() + item.duration * 1000;
        break;
      case 'loot_boost':
        this.activeBoosts.lootBoost = Date.now() + item.duration * 1000;
        break;
      case 'boss_skip_cooldown':
        this.lastBossFight = null;
        break;
    }

    return { success: true, item, remainingCoins: this.bossCoins };
  }

  // ============ FUNÇÕES AUXILIARES ============

  checkLevelUp() {
    let levelsGained = 0;
    while (this.experience >= xpForLevel(this.level)) {
      this.experience -= xpForLevel(this.level);
      this.level++;
      this.skillPoints += 5;
      levelsGained++;
    }
    return levelsGained;
  }

  getInstanceData(instance) {
    return {
      id: instance.id,
      zoneId: instance.zoneId,
      zoneName: instance.zoneName,
      wave: instance.wave,
      totalWaves: instance.totalWaves,
      monstersKilledInWave: instance.monstersKilledInWave,
      monstersPerWave: instance.monstersPerWave,
      isBossWave: instance.isBossWave,
      bossSpawned: instance.bossSpawned,
      currentBoss: instance.currentBoss ? {
        name: instance.currentBoss.name,
        hp: instance.currentBoss.hp,
        maxHp: instance.currentBoss.hp,
      } : null,
      monsters: instance.monsters.map(m => ({
        name: m.name,
        hp: m.currentHp,
        maxHp: m.maxHp,
        isBoss: m.isBoss,
      })),
      rewards: instance.rewards,
      isCompleted: instance.isCompleted,
      fled: instance.fled,
      startTime: instance.startTime,
    };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      vocation: this.vocation,
      level: this.level,
      experience: this.experience,
      xpToNextLevel: xpForLevel(this.level),
      skillPoints: this.skillPoints,
      skills: this.skills,
      gold: this.gold,
      bossCoins: this.bossCoins,
      stamina: this.stamina,
      staminaMax: CONFIG.STAMINA_MAX,
      lootPouch: this.lootPouch,
      lootPouchSlots: this.lootPouchSlots,
      currentHunt: this.currentHunt,
      isHunting: this.isHunting,
      totalMonstersKilled: this.totalMonstersKilled,
      totalXpEarned: this.totalXpEarned,
      totalGoldEarned: this.totalGoldEarned,
      totalBossKills: this.totalBossKills,
      bossCoinsEarned: this.bossCoinsEarned,
      deaths: this.deaths,
      stats: this.stats,
      currentInstance: this.currentInstance ? this.getInstanceData(this.currentInstance) : null,
      activeBoosts: this.activeBoosts,
      createdAt: this.createdAt,
    };
  }
}

// Funções de gerenciamento
export function createCharacter(data) {
  const character = new Character(data);
  characters.set(character.id, character);
  return character;
}

export function getCharacter(id) {
  return characters.get(id);
}

export function getCharactersByAccount(accountId) {
  return Array.from(characters.values()).filter(c => c.accountId === accountId);
}

export function deleteCharacter(id) {
  return characters.delete(id);
}

export function getAllCharacters() {
  return Array.from(characters.values());
}

export function getInstance(id) {
  return instances.get(id);
}
