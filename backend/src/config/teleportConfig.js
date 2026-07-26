// Zamba Idle - Sistema de Teleporte e Pular Boss

export const TELEPORT_CONFIG = {
    CITY: {
        id: 'city',
        name: 'Cidade',
        icon: '🏰',
        description: 'Retornar à cidade',
        cooldownMs: 5000,
    },
    HUNTS: {
        id: 'hunts',
        name: 'Hunts',
        icon: '🗺️',
        description: 'Ver hunts disponíveis',
        cooldownMs: 2000,
    },
};

export const BOSS_CONFIG = {
    canSkip: true,
    skipCooldownMs: 20000, // 20 segundos entre puladas
    skipPenaltyGold: 0.1, // 10% do gold como penalidade
};

// Estados do teleporte
export const TELEPORT_STATE = {
    IDLE: 'idle',
    TO_CITY: 'to_city',
    TO_HUNT: 'to_hunt',
    ARRIVED: 'arrived',
};

// Sistema de Pular Boss
export class BossSkipSystem {
    constructor() {
        this.lastSkipTime = 0;
        this.skipCount = 0;
    }

    canSkip() {
        const now = Date.now();
        return (now - this.lastSkipTime) >= BOSS_CONFIG.skipCooldownMs;
    }

    getRemainingCooldown() {
        const now = Date.now();
        const remaining = BOSS_CONFIG.skipCooldownMs - (now - this.lastSkipTime);
        return Math.max(0, remaining);
    }

    skip() {
        if (!this.canSkip()) {
            return {
                success: false,
                reason: 'cooldown',
                remainingMs: this.getRemainingCooldown(),
            };
        }

        this.lastSkipTime = Date.now();
        this.skipCount++;

        return {
            success: true,
            skipCount: this.skipCount,
        };
    }

    reset() {
        this.lastSkipTime = 0;
        this.skipCount = 0;
    }
}

// Singleton
let bossSkipSystem = null;

export function getBossSkipSystem() {
    if (!bossSkipSystem) {
        bossSkipSystem = new BossSkipSystem();
    }
    return bossSkipSystem;
}

export default BossSkipSystem;
