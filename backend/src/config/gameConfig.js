// Zamba Idle - Configuração do Jogo
// Baseado nas mecânicas do BaiakIdle e Tibia

export const CONFIG = {
  // Experiência
  XP_PER_SECOND_BASE: 1,
  XP_LEVEL_MULTIPLIER: 1.15,
  
  // Skills
  SKILL_TRIES_PER_SECOND: 1,
  SKILL_MULTIPLIER: 1.0,
  
  // Loot
  LOOT_CHANCE_BASE: 0.3,
  LOOT_POUCH_BASE_SLOTS: 10,
  LOOT_POUCH_MAX_SLOTS: 50,
  
  // Caçada
  STAMINA_MAX: 1440, // 24 horas em minutos
  STAMINA_COST_PER_HOUR: 60,
  
  // Boss
  BOSS_COOLDOWN_SECONDS: 3600,
  BOSS_XP_MULTIPLIER: 5,
  
  // Morte
  DEATH_GOLD_PENALTY_PER_LEVEL: 50,
  DEATH_GOLD_PENALTY_MIN_LEVEL: 50,
  
  // Party
  PARTY_XP_BONUS: 0.05, // 5% por membro
  PARTY_MAX_MEMBERS: 5,
};

// Vocações do Tibia
export const VOCATIONS = {
  NONE: { id: 0, name: 'None', baseHp: 150, baseMp: 50, baseCap: 400 },
  KNIGHT: { id: 1, name: 'Knight', baseHp: 185, baseMp: 35, baseCap: 470, meleeBonus: 1.5 },
  PALADIN: { id: 2, name: 'Paladin', baseHp: 155, baseMp: 90, baseCap: 470, distanceBonus: 1.3 },
  SORCERER: { id: 3, name: 'Sorcerer', baseHp: 120, baseMp: 145, baseCap: 360, magicBonus: 1.5 },
  DRUID: { id: 4, name: 'Druid', baseHp: 120, baseMp: 145, baseCap: 360, magicBonus: 1.3 },
  MONK: { id: 5, name: 'Monk', baseHp: 165, baseMp: 80, baseCap: 430, meleeBonus: 1.2, magicBonus: 0.8 },
};

// Zonas de caçada disponíveis
export const HUNTING_ZONES = [
  {
    id: 'rookgaard',
    name: 'Rookgaard',
    minLevel: 1,
    maxLevel: 8,
    monsters: ['Rat', 'Cave Rat', 'Spider', 'Poison Spider'],
    xpGain: 2,
    description: 'Área inicial para novos aventureiros.',
  },
  {
    id: 'forest',
    name: 'Floresta de Venore',
    minLevel: 8,
    maxLevel: 20,
    monsters: ['Wild Warrior', 'Hunter', 'Deer', 'Bear'],
    xpGain: 5,
    description: 'Uma floresta densa cheia de criaturas.',
  },
  {
    id: 'swamp',
    name: 'Pântano de Drefia',
    minLevel: 20,
    maxLevel: 40,
    monsters: ['Ghoul', 'Necromancer', 'Demon Skeleton', 'Undead Dragon'],
    xpGain: 15,
    description: 'Território sombrio dos mortos-vivos.',
  },
  {
    id: 'desert',
    name: 'Desert of Ankrahmun',
    minLevel: 40,
    maxLevel: 70,
    monsters: ['Scorpion', 'Ankrahmun Pharaoh', 'Sandstone Scorpion', 'Rahemos'],
    xpGain: 35,
    description: 'O escaldante deserto egípcio.',
  },
  {
    id: 'ice',
    name: 'Campos de gelo de Nefra',
    minLevel: 70,
    maxLevel: 120,
    monsters: ['Frost Dragon', 'Ice Golem', 'Crystal Spider', 'Frost Giant'],
    xpGain: 80,
    description: 'Terras congeladas com criaturas poderosas.',
  },
  {
    id: 'demona',
    name: 'Demon Hell',
    minLevel: 120,
    maxLevel: 999,
    monsters: ['Demon', 'Hellfire Destroyer', 'Juggernaut', 'Gaz\'Haragoth'],
    xpGain: 200,
    description: 'O inferno dos demônios. Apenas os mais fortes sobrevivem.',
  },
];

// Monstros com stats
export const MONSTERS = {
  'Rat': { hp: 20, xp: 5, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.8, min: 1, max: 5 }] },
  'Cave Rat': { hp: 30, xp: 10, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.7, min: 1, max: 8 }] },
  'Spider': { hp: 50, xp: 15, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.6, min: 2, max: 10 }] },
  'Poison Spider': { hp: 65, xp: 20, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.5, min: 3, max: 12 }] },
  'Wild Warrior': { hp: 100, xp: 35, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.5, min: 5, max: 20 }] },
  'Hunter': { hp: 150, xp: 50, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.4, min: 8, max: 30 }] },
  'Deer': { hp: 40, xp: 10, loot: [{ id: 'meat', name: 'Meat', chance: 0.6, min: 1, max: 3 }] },
  'Bear': { hp: 200, xp: 60, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.4, min: 10, max: 40 }] },
  'Ghoul': { hp: 500, xp: 150, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.3, min: 20, max: 80 }] },
  'Necromancer': { hp: 1200, xp: 400, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.25, min: 50, max: 200 }] },
  'Demon Skeleton': { hp: 2000, xp: 600, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.2, min: 80, max: 300 }] },
  'Undead Dragon': { hp: 8000, xp: 2000, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.15, min: 200, max: 800 }] },
  'Scorpion': { hp: 1500, xp: 350, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.3, min: 30, max: 120 }] },
  'Ankrahmun Pharaoh': { hp: 5000, xp: 1200, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.2, min: 100, max: 500 }] },
  'Sandstone Scorpion': { hp: 8000, xp: 2500, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.15, min: 200, max: 700 }] },
  'Rahemos': { hp: 15000, xp: 5000, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.1, min: 500, max: 2000 }] },
  'Frost Dragon': { hp: 25000, xp: 8000, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.1, min: 300, max: 1500 }] },
  'Ice Golem': { hp: 18000, xp: 5500, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.15, min: 200, max: 1000 }] },
  'Crystal Spider': { hp: 30000, xp: 10000, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.1, min: 400, max: 2000 }] },
  'Frost Giant': { hp: 12000, xp: 3500, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.2, min: 150, max: 800 }] },
  'Demon': { hp: 80000, xp: 25000, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.08, min: 1000, max: 5000 }] },
  'Hellfire Destroyer': { hp: 60000, xp: 18000, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.1, min: 800, max: 3000 }] },
  'Juggernaut': { hp: 150000, xp: 50000, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.05, min: 2000, max: 10000 }] },
  'Gaz\'Haragoth': { hp: 200000, xp: 75000, loot: [{ id: 'gold_coin', name: 'Gold Coin', chance: 0.05, min: 3000, max: 15000 }] },
};

// Itens do jogo
export const ITEMS = {
  gold_coin: { id: 'gold_coin', name: 'Gold Coin', type: 'currency', value: 1 },
  meat: { id: 'meat', name: 'Meat', type: 'food', value: 5 },
};

// Fórmula de XP para próximo nível
export function xpForLevel(level) {
  return Math.floor(50 * Math.pow(level, 2) + 100 * level);
}

// Calcular stats do personagem baseado no nível e vocação
export function calculateStats(level, vocation) {
  const voc = VOCATIONS[vocation] || VOCATIONS.NONE;
  return {
    hp: voc.baseHp + (level - 1) * 5,
    mp: voc.baseMp + (level - 1) * 3,
    cap: voc.baseCap + (level - 1) * 10,
  };
}
