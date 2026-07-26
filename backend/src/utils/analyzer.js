// Zamba Idle - Sistema de Analyzers
// Analisadores de caçada em tempo real como no BaiakIdle

export class HuntAnalyzer {
  constructor(character) {
    this.character = character;
    this.sessionStart = Date.now();
    this.stats = {
      xpGained: 0,
      goldGained: 0,
      monstersKilled: 0,
      lootItems: [],
      skillGains: {
        melee: 0,
        distance: 0,
        magic: 0,
        shielding: 0,
      },
      damageDealt: 0,
      damageTaken: 0,
      deaths: 0,
      bossKills: 0,
      bossCoinsEarned: 0,
    };
    this.history = [];
    this.lootTable = new Map();
    this.monsterTable = new Map();
  }

  // Registrar XP ganho
  addXP(amount) {
    this.stats.xpGained += amount;
    this.addHistory('xp', amount);
  }

  // Registrar gold ganho
  addGold(amount) {
    this.stats.goldGained += amount;
    this.addHistory('gold', amount);
  }

  // Registrar monstro morto
  addMonsterKill(monsterName, xpGained, goldGained) {
    this.stats.monstersKilled++;
    this.stats.xpGained += xpGained;
    this.stats.goldGained += goldGained;
    
    // Contar monstros
    const count = this.monsterTable.get(monsterName) || 0;
    this.monsterTable.set(monsterName, count + 1);
    
    this.addHistory('kill', { monsterName, xpGained, goldGained });
  }

  // Registrar loot
  addLoot(item) {
    this.stats.lootItems.push(item);
    
    const key = item.id || item.name;
    const existing = this.lootTable.get(key) || { ...item, count: 0 };
    existing.count += item.quantity || 1;
    this.lootTable.set(key, existing);
    
    this.addHistory('loot', item);
  }

  // Registrar skill
  addSkill(skillName, amount) {
    if (this.stats.skillGains[skillName] !== undefined) {
      this.stats.skillGains[skillName] += amount;
    }
    this.addHistory('skill', { skillName, amount });
  }

  // Registrar dano causado
  addDamageDealt(amount) {
    this.stats.damageDealt += amount;
  }

  // Registrar dano recebido
  addDamageTaken(amount) {
    this.stats.damageTaken += amount;
  }

  // Registrar morte
  addDeath() {
    this.stats.deaths++;
    this.addHistory('death', { timestamp: Date.now() });
  }

  // Registrar boss kill
  addBossKill(bossName, bossCoins) {
    this.stats.bossKills++;
    this.stats.bossCoinsEarned += bossCoins;
    this.addHistory('boss_kill', { bossName, bossCoins });
  }

  // Adicionar ao histórico
  addHistory(type, data) {
    this.history.push({
      type,
      data,
      timestamp: Date.now(),
    });
    
    // Manter apenas últimos 1000 eventos
    if (this.history.length > 1000) {
      this.history = this.history.slice(-1000);
    }
  }

  // Calcular tempo de sessão
  getSessionTime() {
    return Date.now() - this.sessionStart;
  }

  // Calcular XP por hora
  getXPHour() {
    const hours = this.getSessionTime() / 3600000;
    return hours > 0 ? Math.floor(this.stats.xpGained / hours) : 0;
  }

  // Calcular Gold por hora
  getGoldHour() {
    const hours = this.getSessionTime() / 3600000;
    return hours > 0 ? Math.floor(this.stats.goldGained / hours) : 0;
  }

  // Calcular monstros por hora
  getMonstersHour() {
    const hours = this.getSessionTime() / 3600000;
    return hours > 0 ? Math.floor(this.stats.monstersKilled / hours) : 0;
  }

  // Calcular próximo nível
  getNextLevelETA() {
    const xpPerHour = this.getXPHour();
    if (xpPerHour <= 0) return null;
    
    const xpToNext = this.character.xpToNextLevel - this.character.experience;
    const hours = xpToNext / xpPerHour;
    
    return {
      hours: Math.floor(hours),
      minutes: Math.floor((hours % 1) * 60),
    };
  }

  // Obter resumo
  getSummary() {
    return {
      ...this.stats,
      sessionTime: this.getSessionTime(),
      xpHour: this.getXPHour(),
      goldHour: this.getGoldHour(),
      monstersHour: this.getMonstersHour(),
      nextLevelETA: this.getNextLevelETA(),
      lootTable: Array.from(this.lootTable.values()),
      monsterTable: Array.from(this.monsterTable.entries()).map(([name, count]) => ({
        name,
        count,
      })),
    };
  }

  // Reset
  reset() {
    this.sessionStart = Date.now();
    this.stats = {
      xpGained: 0,
      goldGained: 0,
      monstersKilled: 0,
      lootItems: [],
      skillGains: { melee: 0, distance: 0, magic: 0, shielding: 0 },
      damageDealt: 0,
      damageTaken: 0,
      deaths: 0,
      bossKills: 0,
      bossCoinsEarned: 0,
    };
    this.history = [];
    this.lootTable.clear();
    this.monsterTable.clear();
  }
}

// Singleton global
let huntAnalyzer = null;

export function getHuntAnalyzer(character) {
  if (!huntAnalyzer || huntAnalyzer.character !== character) {
    huntAnalyzer = new HuntAnalyzer(character);
  }
  return huntAnalyzer;
}

export default HuntAnalyzer;
