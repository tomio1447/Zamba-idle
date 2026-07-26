// Zamba Idle - Sistema de Hunts Grid
// Grid visual de hunts disponível para o jogador

export const HUNTS_GRID = [
    {
        id: 'rookgaard',
        name: 'Rookgaard',
        minLevel: 1,
        maxLevel: 8,
        monsters: ['Rat', 'Cave Rat', 'Spider', 'Poison Spider'],
        xpGain: 2,
        description: 'Área inicial para novos aventureiros.',
        category: 'Iniciante',
        boss: 'Spider Queen',
    },
    {
        id: 'forest',
        name: 'Floresta de Venore',
        minLevel: 8,
        maxLevel: 20,
        monsters: ['Wild Warrior', 'Hunter', 'Deer', 'Bear'],
        xpGain: 5,
        description: 'Uma floresta densa cheia de criaturas.',
        category: 'Iniciante',
        boss: 'Bear Spirit',
    },
    {
        id: 'swamp',
        name: 'Pântano de Drefia',
        minLevel: 20,
        maxLevel: 40,
        monsters: ['Ghoul', 'Necromancer', 'Demon Skeleton', 'Undead Dragon'],
        xpGain: 15,
        description: 'Território sombrio dos mortos-vivos.',
        category: 'Intermediário',
        boss: 'Necromancer Lord',
    },
    {
        id: 'desert',
        name: 'Desert of Ankrahmun',
        minLevel: 40,
        maxLevel: 70,
        monsters: ['Scorpion', 'Ankrahmun Pharaoh', 'Sandstone Scorpion', 'Rahemos'],
        xpGain: 35,
        description: 'O escaldante deserto egípcio.',
        category: 'Intermediário',
        boss: 'Pharaoh Anubis',
    },
    {
        id: 'ice',
        name: 'Campos de gelo de Nefra',
        minLevel: 70,
        maxLevel: 120,
        monsters: ['Frost Dragon', 'Ice Golem', 'Crystal Spider', 'Frost Giant'],
        xpGain: 80,
        description: 'Terras congeladas com criaturas poderosas.',
        category: 'Avançado',
        boss: 'Frost Dragon Lord',
    },
    {
        id: 'demona',
        name: 'Demon Hell',
        minLevel: 120,
        maxLevel: 999,
        monsters: ['Demon', 'Hellfire Destroyer', 'Juggernaut', "Gaz'Haragoth"],
        xpGain: 200,
        description: 'O inferno dos demônios. Apenas os mais fortes sobrevivem.',
        category: 'Avançado',
        boss: 'Demon Overlord',
    },
];

// Categorias de hunts
export const HUNT_CATEGORIES = [
    { id: 'all', label: 'Todas' },
    { id: 'beginner', label: 'Iniciante' },
    { id: 'intermediate', label: 'Intermediário' },
    { id: 'advanced', label: 'Avançado' },
];

// Sistema de Boss Bar
export const BOSS_SYSTEM = {
    canSkipBoss: true,
    skipBossCooldown: 3600, // 1 hora em segundos
    bossBarUpdateInterval: 100, // ms
};

// Sistema de Party
export const PARTY_SYSTEM = {
    maxMembers: 5,
    xpBonusPerMember: 0.05, // 5% por membro
    reviveTime: 30, // segundos para reviver
};

// Sistema de Auto-Sell com Cooldown
export const AUTO_SELL_CONFIG = {
    cooldownMs: 2 * 60 * 1000, // 2 minutos
    confirmTimeoutMs: 8000,
    pollMs: 700,
};

// Sistema de Teleport
export const TELEPORT_LOCATIONS = {
    CITY: { id: 'city', name: 'Cidade', icon: '🏰' },
    HUNTS: { id: 'hunts', name: 'Hunts', icon: '🗺️' },
};

// Função para obter hunts por categoria
export function getHuntsByCategory(category) {
    if (category === 'all') return HUNTS_GRID;
    
    const categoryMap = {
        'beginner': 'Iniciante',
        'intermediate': 'Intermediário',
        'advanced': 'Avançado',
    };
    
    return HUNTS_GRID.filter(h => h.category === categoryMap[category]);
}

// Função para verificar se o jogador pode caçar
export function canHunt(hunt, playerLevel) {
    return playerLevel >= hunt.minLevel && playerLevel <= hunt.maxLevel;
}

// Função para calcular XP bonus da party
export function calculatePartyXpBonus(baseXp, partySize) {
    const bonus = 1 + ((partySize - 1) * PARTY_SYSTEM.xpBonusPerMember);
    return Math.floor(baseXp * bonus);
}
