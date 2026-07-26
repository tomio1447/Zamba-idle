// Zamba Idle - Sistema de Helper (Auto-funcionalidades)
// Como no BaiakIdle: Auto-attack, Auto-loot, Auto-sell, Auto-heal

export class HelperSystem {
  constructor(character, callbacks) {
    this.character = character;
    this.callbacks = callbacks;
    this.enabled = {
      autoAttack: false,
      autoLoot: false,
      autoSell: false,
      autoHeal: false,
      autoFood: false,
      autoSpell: false,
    };
    this.settings = {
      healThreshold: 50, // % de HP para curar
      sellThreshold: 80, // % da loot pouch para vender
      spellCooldown: 2000, // ms entre magias
      attackInterval: 1000, // ms entre ataques
    };
    this.intervals = {};
    this.lastSpellUse = 0;
  }

  // Ativar/desativar funcionalidade
  toggle(feature) {
    this.enabled[feature] = !this.enabled[feature];
    
    if (this.enabled[feature]) {
      this.start(feature);
    } else {
      this.stop(feature);
    }
    
    return this.enabled[feature];
  }

  // Iniciar funcionalidade
  start(feature) {
    this.stop(feature); // Parar se já estiver rodando
    
    switch (feature) {
      case 'autoAttack':
        this.intervals.autoAttack = setInterval(() => {
          this.doAutoAttack();
        }, this.settings.attackInterval);
        break;
        
      case 'autoLoot':
        this.intervals.autoLoot = setInterval(() => {
          this.doAutoLoot();
        }, 5000);
        break;
        
      case 'autoSell':
        this.intervals.autoSell = setInterval(() => {
          this.doAutoSell();
        }, 10000);
        break;
        
      case 'autoHeal':
        this.intervals.autoHeal = setInterval(() => {
          this.doAutoHeal();
        }, 1000);
        break;
        
      case 'autoFood':
        this.intervals.autoFood = setInterval(() => {
          this.doAutoFood();
        }, 30000);
        break;
        
      case 'autoSpell':
        this.intervals.autoSpell = setInterval(() => {
          this.doAutoSpell();
        }, this.settings.spellCooldown);
        break;
    }
  }

  // Parar funcionalidade
  stop(feature) {
    if (this.intervals[feature]) {
      clearInterval(this.intervals[feature]);
      delete this.intervals[feature];
    }
  }

  // Parar tudo
  stopAll() {
    Object.keys(this.intervals).forEach(feature => {
      this.stop(feature);
      this.enabled[feature] = false;
    });
  }

  // Auto-Attack: Ataca automaticamente o monstro mais fraco
  doAutoAttack() {
    if (!this.callbacks.onAttack) return;
    
    const instance = this.character.currentInstance;
    if (!instance || instance.isCompleted) return;
    
    // Encontrar monstro com menor HP
    const aliveMonsters = instance.monsters.filter(m => m.hp > 0);
    if (aliveMonsters.length === 0) return;
    
    // Priorizar boss se existir
    const boss = aliveMonsters.find(m => m.isBoss);
    const target = boss || aliveMonsters.sort((a, b) => a.hp - b.hp)[0];
    const targetIndex = instance.monsters.indexOf(target);
    
    if (target.isBoss && this.callbacks.onAttackBoss) {
      this.callbacks.onAttackBoss();
    } else {
      this.callbacks.onAttack(targetIndex);
    }
  }

  // Auto-Loot: Coleta loot automaticamente
  doAutoLoot() {
    if (!this.callbacks.onCollectLoot) return;
    
    if (this.character.lootPouch.length > 0) {
      this.callbacks.onCollectLoot();
    }
  }

  // Auto-Sell: Vende loot quando a pouch está cheia
  doAutoSell() {
    if (!this.callbacks.onSellLoot) return;
    
    const pouchPercent = (this.character.lootPouch.length / this.character.lootPouchSlots) * 100;
    if (pouchPercent >= this.settings.sellThreshold) {
      this.callbacks.onSellLoot();
    }
  }

  // Auto-Heal: Usa magia de cura quando HP está baixo
  doAutoHeal() {
    if (!this.callbacks.onCastSpell) return;
    
    const hpPercent = (this.character.stats.hp / this.character.stats.hp) * 100;
    if (hpPercent <= this.settings.healThreshold) {
      const healSpell = this.getHealSpell();
      if (healSpell) {
        this.callbacks.onCastSpell(healSpell);
      }
    }
  }

  // Auto-Food: Come comida para recuperar stamina
  doAutoFood() {
    if (!this.callbacks.onEatFood) return;
    
    if (this.character.stamina < this.character.staminaMax * 0.3) {
      this.callbacks.onEatFood();
    }
  }

  // Auto-Spell: Usa magia de ataque automaticamente
  doAutoSpell() {
    if (!this.callbacks.onCastSpell) return;
    
    const now = Date.now();
    if (now - this.lastSpellUse < this.settings.spellCooldown) return;
    
    const instance = this.character.currentInstance;
    if (!instance || instance.isCompleted) return;
    
    const attackSpell = this.getAttackSpell();
    if (attackSpell) {
      this.lastSpellUse = now;
      this.callbacks.onCastSpell(attackSpell);
    }
  }

  // Obter magia de cura baseada na vocação
  getHealSpell() {
    const spells = {
      KNIGHT: { name: 'Exura', mana: 20, heal: 50, level: 1 },
      PALADIN: { name: 'Exura San', mana: 30, heal: 80, level: 20 },
      SORCERER: { name: 'Exura Gran', mana: 40, heal: 120, level: 40 },
      DRUID: { name: 'Exura Gran Mas Res', mana: 50, heal: 150, level: 50 },
      MONK: { name: 'Healing Circle', mana: 35, heal: 100, level: 30 },
    };
    return spells[this.character.vocation] || spells.KNIGHT;
  }

  // Obter magia de ataque baseada na vocação
  getAttackSpell() {
    const spells = {
      KNIGHT: [
        { name: 'Exori', mana: 30, damage: 80, level: 1 },
        { name: 'Exori Gran', mana: 60, damage: 150, level: 30 },
        { name: 'Exori Mas', mana: 100, damage: 250, level: 50 },
      ],
      PALADIN: [
        { name: 'Exori San', mana: 40, damage: 100, level: 1 },
        { name: 'Exevo Mas San', mana: 80, damage: 200, level: 40 },
      ],
      SORCERER: [
        { name: 'Exori Vis', mana: 40, damage: 120, level: 1 },
        { name: 'Exevo Mas Vis', mana: 100, damage: 280, level: 45 },
      ],
      DRUID: [
        { name: 'Exori Tera', mana: 40, damage: 110, level: 1 },
        { name: 'Exevo Mas Tera', mana: 100, damage: 260, level: 45 },
      ],
      MONK: [
        { name: 'Chi Strike', mana: 35, damage: 90, level: 1 },
        { name: 'Tiger Slash', mana: 70, damage: 180, level: 35 },
      ],
    };
    
    const vocationSpells = spells[this.character.vocation] || spells.KNIGHT;
    // Retornar magia mais forte disponível baseado no nível
    return vocationSpells.filter(s => this.character.level >= s.level).pop() || vocationSpells[0];
  }

  // Obter todas as magias disponíveis para a vocação
  getAllSpells() {
    const allSpells = {
      KNIGHT: [
        { name: 'Exura', mana: 20, heal: 50, level: 1, type: 'heal', description: 'Cura básica' },
        { name: 'Exori', mana: 30, damage: 80, level: 1, type: 'attack', description: 'Golpe físico' },
        { name: 'Exori Gran', mana: 60, damage: 150, level: 30, type: 'attack', description: 'Golpe forte' },
        { name: 'Exori Mas', mana: 100, damage: 250, level: 50, type: 'attack', description: 'Golpe em área' },
        { name: 'Exori Min', mana: 80, damage: 200, level: 40, type: 'attack', description: 'Golpe médio' },
      ],
      PALADIN: [
        { name: 'Exura San', mana: 30, heal: 80, level: 20, type: 'heal', description: 'Cura sagrada' },
        { name: 'Exori San', mana: 40, damage: 100, level: 1, type: 'attack', description: 'Tiro sagrado' },
        { name: 'Exevo Mas San', mana: 80, damage: 200, level: 40, type: 'attack', description: 'Chuva de flechas' },
        { name: 'Exori Con', mana: 60, damage: 160, level: 35, type: 'attack', description: 'Tiro concentrado' },
      ],
      SORCERER: [
        { name: 'Exura Gran', mana: 40, heal: 120, level: 40, type: 'heal', description: 'Cura maior' },
        { name: 'Exori Vis', mana: 40, damage: 120, level: 1, type: 'attack', description: 'Golpe de energia' },
        { name: 'Exevo Mas Vis', mana: 100, damage: 280, level: 45, type: 'attack', description: 'Explosão de energia' },
        { name: 'Exori Gran Vis', mana: 70, damage: 190, level: 38, type: 'attack', description: 'Golpe de energia forte' },
        { name: 'Exori Flam', mana: 50, damage: 140, level: 25, type: 'attack', description: 'Golpe de fogo' },
      ],
      DRUID: [
        { name: 'Exura Gran Mas Res', mana: 50, heal: 150, level: 50, type: 'heal', description: 'Cura ressurreição' },
        { name: 'Exori Tera', mana: 40, damage: 110, level: 1, type: 'attack', description: 'Golpe de terra' },
        { name: 'Exevo Mas Tera', mana: 100, damage: 260, level: 45, type: 'attack', description: 'Terremoto' },
        { name: 'Exori Gran Tera', mana: 70, damage: 180, level: 38, type: 'attack', description: 'Golpe de terra forte' },
        { name: 'Exori Frigo', mana: 50, damage: 130, level: 25, type: 'attack', description: 'Golpe de gelo' },
      ],
      MONK: [
        { name: 'Healing Circle', mana: 35, heal: 100, level: 30, type: 'heal', description: 'Cura em círculo' },
        { name: 'Chi Strike', mana: 35, damage: 90, level: 1, type: 'attack', description: 'Golpe de chi' },
        { name: 'Tiger Slash', mana: 70, damage: 180, level: 35, type: 'attack', description: 'Golpe do tigre' },
        { name: 'Dragon Fist', mana: 90, damage: 240, level: 50, type: 'attack', description: 'Punho do dragão' },
        { name: 'Inner Focus', mana: 40, damage: 0, level: 20, type: 'buff', description: 'Aumenta dano' },
      ],
    };
    
    return allSpells[this.character.vocation] || allSpells.KNIGHT;
  }

  // Atualizar configurações
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Reiniciar intervals se necessário
    Object.keys(this.enabled).forEach(feature => {
      if (this.enabled[feature]) {
        this.start(feature);
      }
    });
  }

  // Obter status
  getStatus() {
    return {
      enabled: { ...this.enabled },
      settings: { ...this.settings },
    };
  }
}

// Singleton
let helperSystem = null;

export function getHelperSystem(character, callbacks) {
  if (!helperSystem || helperSystem.character !== character) {
    helperSystem = new HelperSystem(character, callbacks);
  }
  return helperSystem;
}

export default HelperSystem;
