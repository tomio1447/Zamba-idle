// Zamba Idle - Configuração de Bosses e Instâncias
// Baseado nas mecânicas do BaiakIdle

export const BOSS_SYSTEM = {
  // Waves até o boss aparecer
  WAVES_PER_BOSS: 10,
  // Cooldown de boss por personagem (segundos)
  BOSS_COOLDOWN: 3600,
  // Multiplicador de XP do boss
  BOSS_XP_MULTIPLIER: 5,
  // Multiplicador de loot do boss
  BOSS_LOOT_MULTIPLIER: 3,
};

// Definição de Bosses
export const BOSSES = {
  'spider_queen': {
    id: 'spider_queen',
    name: 'Spider Queen',
    minLevel: 5,
    maxLevel: 15,
    hp: 500,
    xp: 250,
    lootTable: [
      { id: 'gold_coin', name: 'Gold Coin', chance: 0.9, min: 20, max: 80 },
      { id: 'spider_silk', name: 'Spider Silk', chance: 0.3, min: 1, max: 3, rare: true },
      { id: 'cobweb_coin', name: 'Cobweb Coin', chance: 0.05, min: 1, max: 1, rare: true },
    ],
    sprite: 218,
    zones: ['rookgaard', 'forest'],
  },
  'bear_spirit': {
    id: 'bear_spirit',
    name: 'Bear Spirit',
    minLevel: 10,
    maxLevel: 25,
    hp: 1500,
    xp: 800,
    lootTable: [
      { id: 'gold_coin', name: 'Gold Coin', chance: 0.9, min: 50, max: 200 },
      { id: 'bear_paw', name: 'Bear Paw', chance: 0.25, min: 1, max: 2, rare: true },
      { id: 'spirit_claw', name: 'Spirit Claw', chance: 0.05, min: 1, max: 1, rare: true },
    ],
    sprite: 219,
    zones: ['forest', 'swamp'],
  },
  'necromancer_lord': {
    id: 'necromancer_lord',
    name: 'Necromancer Lord',
    minLevel: 20,
    maxLevel: 45,
    hp: 5000,
    xp: 3000,
    lootTable: [
      { id: 'gold_coin', name: 'Gold Coin', chance: 0.9, min: 150, max: 600 },
      { id: 'necro_robe', name: 'Necromancer Robe', chance: 0.2, min: 1, max: 1, rare: true },
      { id: 'death_staff', name: 'Death Staff', chance: 0.05, min: 1, max: 1, rare: true },
      { id: 'soul_stone', name: 'Soul Stone', chance: 0.1, min: 1, max: 3, rare: true },
    ],
    sprite: 220,
    zones: ['swamp', 'desert'],
  },
  'pharaoh_anubis': {
    id: 'pharaoh_anubis',
    name: 'Pharaoh Anubis',
    minLevel: 35,
    maxLevel: 70,
    hp: 15000,
    xp: 10000,
    lootTable: [
      { id: 'gold_coin', name: 'Gold Coin', chance: 0.9, min: 500, max: 2000 },
      { id: 'ankh_of_life', name: 'Ankh of Life', chance: 0.15, min: 1, max: 1, rare: true },
      { id: 'pharaoh_mask', name: 'Pharaoh Mask', chance: 0.05, min: 1, max: 1, rare: true },
      { id: 'mummy_wrap', name: 'Mummy Wrap', chance: 0.2, min: 1, max: 5 },
    ],
    sprite: 221,
    zones: ['desert'],
  },
  'frost_dragon_lord': {
    id: 'frost_dragon_lord',
    name: 'Frost Dragon Lord',
    minLevel: 60,
    maxLevel: 120,
    hp: 50000,
    xp: 35000,
    lootTable: [
      { id: 'gold_coin', name: 'Gold Coin', chance: 0.9, min: 1500, max: 6000 },
      { id: 'dragon_scale', name: 'Dragon Scale', chance: 0.2, min: 1, max: 3, rare: true },
      { id: 'frost_heart', name: 'Frost Heart', chance: 0.05, min: 1, max: 1, rare: true },
      { id: 'ice_crystal', name: 'Ice Crystal', chance: 0.15, min: 1, max: 5, rare: true },
    ],
    sprite: 222,
    zones: ['ice'],
  },
  'demon_overlord': {
    id: 'demon_overlord',
    name: 'Demon Overlord',
    minLevel: 100,
    maxLevel: 999,
    hp: 200000,
    xp: 150000,
    lootTable: [
      { id: 'gold_coin', name: 'Gold Coin', chance: 0.9, min: 5000, max: 20000 },
      { id: 'demon_blood', name: 'Demon Blood', chance: 0.2, min: 1, max: 3, rare: true },
      { id: 'infernal_axe', name: 'Infernal Axe', chance: 0.03, min: 1, max: 1, rare: true },
      { id: 'hellfire_crown', name: 'Hellfire Crown', chance: 0.02, min: 1, max: 1, rare: true },
      { id: 'demon_essence', name: 'Demon Essence', chance: 0.1, min: 1, max: 5, rare: true },
    ],
    sprite: 223,
    zones: ['demona'],
  },
};

// Sistema de Instância de Caçada
export const INSTANCE_SYSTEM = {
  // Monstros por wave
  MONSTERS_PER_WAVE: 5,
  // Tempo entre waves (segundos)
  WAVE_INTERVAL: 3,
  // Tempo para boss wave (segundos)
  BOSS_WAVE_TIME: 15,
  // Duração máxima da instância (minutos)
  MAX_INSTANCE_DURATION: 60,
};

// Recompensas especiais de Boss
export const BOSS_REWARDS = {
  // Itens raros que só dropm de boss
  rare_items: {
    'spider_silk': { id: 'spider_silk', name: 'Spider Silk', type: 'material', value: 500, bossOnly: true },
    'cobweb_coin': { id: 'cobweb_coin', name: 'Cobweb Coin', type: 'currency', value: 1000, bossOnly: true },
    'bear_paw': { id: 'bear_paw', name: 'Bear Paw', type: 'material', value: 800, bossOnly: true },
    'spirit_claw': { id: 'spirit_claw', name: 'Spirit Claw', type: 'weapon', value: 2000, bossOnly: true },
    'necro_robe': { id: 'necro_robe', name: 'Necromancer Robe', type: 'armor', value: 3000, bossOnly: true },
    'death_staff': { id: 'death_staff', name: 'Death Staff', type: 'weapon', value: 5000, bossOnly: true },
    'soul_stone': { id: 'soul_stone', name: 'Soul Stone', type: 'material', value: 1500, bossOnly: true },
    'ankh_of_life': { id: 'ankh_of_life', name: 'Ankh of Life', type: 'accessory', value: 8000, bossOnly: true },
    'pharaoh_mask': { id: 'pharaoh_mask', name: 'Pharaoh Mask', type: 'helmet', value: 12000, bossOnly: true },
    'mummy_wrap': { id: 'mummy_wrap', name: 'Mummy Wrap', type: 'material', value: 2000, bossOnly: true },
    'dragon_scale': { id: 'dragon_scale', name: 'Dragon Scale', type: 'material', value: 5000, bossOnly: true },
    'frost_heart': { id: 'frost_heart', name: 'Frost Heart', type: 'accessory', value: 25000, bossOnly: true },
    'ice_crystal': { id: 'ice_crystal', name: 'Ice Crystal', type: 'material', value: 3000, bossOnly: true },
    'demon_blood': { id: 'demon_blood', name: 'Demon Blood', type: 'material', value: 15000, bossOnly: true },
    'infernal_axe': { id: 'infernal_axe', name: 'Infernal Axe', type: 'weapon', value: 50000, bossOnly: true },
    'hellfire_crown': { id: 'hellfire_crown', name: 'Hellfire Crown', type: 'helmet', value: 100000, bossOnly: true },
    'demon_essence': { id: 'demon_essence', name: 'Demon Essence', type: 'material', value: 10000, bossOnly: true },
  },
  // Boss Coins (moeda especial de boss)
  boss_coin: {
    id: 'boss_coin',
    name: 'Boss Coin',
    type: 'special_currency',
    description: 'Moeda obtida ao derrotar bosses. Usada na Boss Shop.',
  },
};

// Boss Shop - Itens que podem ser comprados com Boss Coins
export const BOSS_SHOP = [
  { id: 'loot_slot_1', name: 'Loot Pouch Slot +1', cost: 5, type: 'upgrade', effect: 'loot_slot' },
  { id: 'loot_slot_5', name: 'Loot Pouch Slot +5', cost: 20, type: 'upgrade', effect: 'loot_slot_5' },
  { id: 'stamina_100', name: 'Stamina +100', cost: 3, type: 'upgrade', effect: 'stamina' },
  { id: 'xp_boost_1h', name: 'XP Boost 1h', cost: 10, type: 'boost', effect: 'xp_boost', duration: 3600 },
  { id: 'loot_boost_1h', name: 'Loot Boost 1h', cost: 15, type: 'boost', effect: 'loot_boost', duration: 3600 },
  { id: 'boss_ticket', name: 'Boss Entry Ticket', cost: 25, type: 'item', effect: 'boss_skip_cooldown' },
];

// Função para obter boss disponível para uma zona e nível
export function getBossForZone(zoneId, playerLevel) {
  const availableBosses = Object.values(BOSSES).filter(boss => 
    boss.zones.includes(zoneId) && 
    playerLevel >= boss.minLevel && 
    playerLevel <= boss.maxLevel
  );
  
  if (availableBosses.length === 0) return null;
  return availableBosses[Math.floor(Math.random() * availableBosses.length)];
}

// Função para calcular recompensas de boss
export function calculateBossRewards(boss, playerLevel) {
  const rewards = {
    xp: Math.floor(boss.hp * BOSS_SYSTEM.BOSS_XP_MULTIPLIER * (1 + playerLevel * 0.01)),
    loot: [],
    bossCoins: Math.floor(boss.hp / 1000) + 1,
  };

  boss.lootTable.forEach(item => {
    const chance = item.rare ? item.chance : item.chance * BOSS_SYSTEM.BOSS_LOOT_MULTIPLIER;
    if (Math.random() < chance) {
      const quantity = Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;
      rewards.loot.push({
        id: item.id,
        name: item.name,
        quantity,
        rare: item.rare || false,
      });
    }
  });

  return rewards;
}
