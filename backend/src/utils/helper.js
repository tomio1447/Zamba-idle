// Zamba Idle - Sistema de Helper (Auto-funcionalidades)
// Como no BaiakIdle: Auto-attack, Auto-loot, Auto-sell, Auto-heal

import { SPELLS } from '../config/spellsConfig.js';

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
    const vocationSpells = SPELLS[this.character.vocation] || SPELLS.KNIGHT;
    const available = vocationSpells.filter(s => s.type === 'heal' && this.character.level >= s.level);
    return available.pop() || { name: 'Exura', mana: 20, heal: 50, level: 1 };
  }

  // Obter magia de ataque baseada na vocação
  getAttackSpell() {
    const vocationSpells = SPELLS[this.character.vocation] || SPELLS.KNIGHT;
    const available = vocationSpells.filter(s => (s.type === 'attack' || s.type === 'aoe') && this.character.level >= s.level);
    // Retornar magia mais forte disponível baseado no nível
    return available.pop() || { name: 'Exori', mana: 30, damage: 80, level: 1 };
  }

  // Obter todas as magias disponíveis para a vocação
  getAllSpells() {
    return SPELLS[this.character.vocation] || SPELLS.KNIGHT;
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
