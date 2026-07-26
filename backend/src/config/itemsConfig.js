// Zamba Idle - Configuração de Itens e Tiers
// Baseado no BaiakIdle

export const ITEM_TIERS = {
    COMMON: { id: 0, key: 'common', label: 'Common', color: '#cfd2d8', chance: 0.6 },
    UNCOMMON: { id: 1, key: 'uncommon', label: 'Uncommon', color: '#57b85a', chance: 0.25 },
    RARE: { id: 2, key: 'rare', label: 'Rare', color: '#4a90e8', chance: 0.1 },
    EPIC: { id: 3, key: 'epic', label: 'Epic', color: '#a05be0', chance: 0.05 },
};

export const ITEMS_DATABASE = {
    // Gold
    gold_coin: { id: 'gold_coin', name: 'Gold Coin', type: 'currency', value: 1, tier: 0 },
    platinum_coin: { id: 'platinum_coin', name: 'Platinum Coin', type: 'currency', value: 100, tier: 1 },
    crystal_coin: { id: 'crystal_coin', name: 'Crystal Coin', type: 'currency', value: 1000, tier: 2 },
    
    // Food
    meat: { id: 'meat', name: 'Meat', type: 'food', value: 5, tier: 0 },
    fish: { id: 'fish', name: 'Fish', type: 'food', value: 8, tier: 0 },
    salmon: { id: 'salmon', name: 'Salmon', type: 'food', value: 12, tier: 1 },
    
    // Materials
    spider_silk: { id: 'spider_silk', name: 'Spider Silk', type: 'material', value: 500, tier: 2 },
    bear_paw: { id: 'bear_paw', name: 'Bear Paw', type: 'material', value: 800, tier: 2 },
    dragon_scale: { id: 'dragon_scale', name: 'Dragon Scale', type: 'material', value: 5000, tier: 3 },
    demon_blood: { id: 'demon_blood', name: 'Demon Blood', type: 'material', value: 15000, tier: 3 },
    
    // Equipment
    iron_helmet: { id: 'iron_helmet', name: 'Iron Helmet', type: 'helmet', value: 200, tier: 1 },
    steel_sword: { id: 'steel_sword', name: 'Steel Sword', type: 'weapon', value: 500, tier: 2 },
    crystal_ring: { id: 'crystal_ring', name: 'Crystal Ring', type: 'ring', value: 2000, tier: 3 },
    
    // Potions
    health_potion: { id: 'health_potion', name: 'Health Potion', type: 'potion', heal: 100, value: 50, tier: 1 },
    mana_potion: { id: 'mana_potion', name: 'Mana Potion', type: 'potion', mana: 100, value: 50, tier: 1 },
    greater_health_potion: { id: 'greater_health_potion', name: 'Greater Health Potion', type: 'potion', heal: 500, value: 200, tier: 2 },
};

// Configuração de Auto-Sell
export const AUTO_SELL_CONFIG = {
    COOLDOWN_MS: 2 * 60 * 1000, // 2 minutos
    CONFIRM_TIMEOUT_MS: 8000,
    POLL_MS: 700,
};

// Configuração de Waves
export const WAVE_CONFIG = {
    WAVES_PER_BOSS: 10,
    BASE_MONSTERS_PER_WAVE: 5,
    BOSS_MONSTERS_REDUCTION: 0.5, // Metade dos monstros na wave de boss
};

// Configuração de Teleport
export const TELEPORT_LOCATIONS = {
    CITY: { id: 'city', name: 'Cidade', description: 'Retornar à cidade' },
    HUNTS: { id: 'hunts', name: 'Hunts', description: 'Ver hunts disponíveis' },
};

// Função para gerar loot com tier
export function generateLootWithTier(zoneId, monsterLevel) {
    const loot = [];
    
    // Chance base de dropar item
    const dropChance = 0.3 + (monsterLevel * 0.01);
    
    if (Math.random() > dropChance) return loot;
    
    // Determinar tier do item
    const tierRoll = Math.random();
    let tier = 0;
    
    if (tierRoll < ITEM_TIERS.EPIC.chance) {
        tier = 3; // Epic
    } else if (tierRoll < ITEM_TIERS.EPIC.chance + ITEM_TIERS.RARE.chance) {
        tier = 2; // Rare
    } else if (tierRoll < ITEM_TIERS.EPIC.chance + ITEM_TIERS.RARE.chance + ITEM_TIERS.UNCOMMON.chance) {
        tier = 1; // Uncommon
    }
    
    // Filtrar itens por tier
    const tierItems = Object.values(ITEMS_DATABASE).filter(item => item.tier === tier);
    
    if (tierItems.length > 0) {
        const item = tierItems[Math.floor(Math.random() * tierItems.length)];
        const quantity = item.type === 'currency' ? Math.floor(Math.random() * 10) + 1 : 1;
        
        loot.push({
            ...item,
            quantity,
            goldValue: item.value * quantity,
        });
    }
    
    return loot;
}

// Função para calcular valor de venda por tier
export function getSellValue(item) {
    const tierMultiplier = [1, 2, 5, 10]; // Common, Uncommon, Rare, Epic
    return Math.floor(item.value * (tierMultiplier[item.tier] || 1));
}
