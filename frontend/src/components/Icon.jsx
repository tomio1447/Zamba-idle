import React from 'react';

export default function Icon({ 
    src, 
    name, 
    size = 24, 
    className = '', 
    alt = '',
    fallback = '❓'
}) {
    // Se não tiver src, mostra o fallback
    if (!src) {
        return <span className={`icon-fallback ${className}`} style={{ fontSize: size + 'px' }}>{fallback}</span>;
    }

    return (
        <img
            src={src}
            alt={alt || name}
            className={`game-icon ${className}`}
            style={{
                width: size + 'px',
                height: size + 'px',
                imageRendering: 'pixelated',
                objectFit: 'contain'
            }}
            onError={(e) => {
                // Fallback se a imagem não carregar
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
            }}
        />
    );
}

// Componente para ícones com máscara CSS (estilo BaiakIdle)
export function MaskIcon({ 
    icon, 
    size = 24, 
    color = 'currentColor',
    className = '' 
}) {
    return (
        <span 
            className={`mask-icon ${className}`}
            style={{
                width: size + 'px',
                height: size + 'px',
                backgroundColor: color,
                WebkitMask: `url(${icon}) center / contain no-repeat`,
                mask: `url(${icon}) center / contain no-repeat`,
                display: 'inline-block',
                flexShrink: 0
            }}
        />
    );
}

// Componente para ícones de navegação (tabs)
export function TabIcon({ icon, label, active, onClick, size = 42 }) {
    return (
        <button
            className={`tab ${active ? 'on' : ''}`}
            onClick={onClick}
            title={label}
            style={{ '--icon': `url(${icon})` }}
        >
            <span className="tab-label">{label}</span>
        </button>
    );
}

// Componente para ícones de ação na barra de ações
export function ActionIcon({ icon, cooldown, manaCost, onClick, disabled }) {
    return (
        <button
            className={`act rot ${disabled ? 'locked' : ''}`}
            onClick={onClick}
            disabled={disabled}
            title={manaCost ? `${manaCost} MP` : ''}
            style={{ '--icon': `url(${icon})` }}
        >
            {cooldown > 0 && (
                <span className="cd-arc">{cooldown}s</span>
            )}
        </button>
    );
}

// Componente para ícones de membro na party
export function MemberIcon({ icon, dead, size = 32 }) {
    return (
        <span 
            className={`member-icon ${dead ? 'dead' : ''}`}
            style={{
                width: size + 'px',
                height: size + 'px',
                background: `url(${icon}) center / contain no-repeat`,
                display: 'inline-block',
                imageRendering: 'pixelated',
                opacity: dead ? 0.5 : 1,
                filter: dead ? 'grayscale(0.7)' : 'none'
            }}
        />
    );
}

// Componente para ícones de loot com raridade
export function LootIcon({ icon, tier, size = 32, quantity }) {
    const tierColors = {
        0: '#cfd2d8', // Common
        1: '#57b85a', // Uncommon
        2: '#4a90e8', // Rare
        3: '#a05be0', // Epic
    };

    return (
        <div 
            className="loot-icon"
            style={{
                width: size + 'px',
                height: size + 'px',
                border: `2px solid ${tierColors[tier] || tierColors[0]}`,
                borderRadius: '4px',
                background: '#0c0c10',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}
        >
            <img
                src={icon}
                style={{
                    width: (size - 8) + 'px',
                    height: (size - 8) + 'px',
                    imageRendering: 'pixelated',
                    objectFit: 'contain'
                }}
            />
            {quantity > 1 && (
                <span className="qty">x{quantity}</span>
            )}
        </div>
    );
}

// Componente para ícones de spell
export function SpellIcon({ icon, size = 40, cooldown, manaCost, onClick, disabled }) {
    return (
        <button
            className={`spell-icon ${cooldown > 0 ? 'cooldown' : ''}`}
            onClick={onClick}
            disabled={disabled}
            style={{
                width: size + 'px',
                height: size + 'px',
                background: `url(${icon}) center / contain no-repeat`,
                border: '2px solid var(--edge)',
                borderRadius: '50%',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                imageRendering: 'pixelated',
                position: 'relative'
            }}
        >
            {cooldown > 0 && (
                <span className="cd-arc">{cooldown}s</span>
            )}
        </button>
    );
}

// Componente para ícones de boss
export function BossIcon({ icon, size = 52 }) {
    return (
        <img
            src={icon}
            className="boss-icon"
            style={{
                width: size + 'px',
                height: size + 'px',
                imageRendering: 'pixelated',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 4px rgba(255, 0, 0, 0.5))'
            }}
        />
    );
}

// Componente para ícones de moeda
export function CoinIcon({ type = 'gold', size = 16 }) {
    const coinIcons = {
        gold: '/icons/icon-goldcoin.png',
        platinum: '/icons/icon-platinum.png',
        crystal: '/icons/icon-crystal.png',
    };

    return (
        <img
            src={coinIcons[type]}
            className="coin-icon"
            style={{
                width: size + 'px',
                height: size + 'px',
                imageRendering: 'pixelated',
                verticalAlign: 'middle',
                display: 'inline-block'
            }}
        />
    );
}

// Componente para ícones de status (HP, MP, XP)
export function StatusIcon({ type, size = 12 }) {
    const statusIcons = {
        hp: '/icons/status/hp.png',
        mana: '/icons/status/mana.png',
        xp: '/icons/status/xp.png',
        stamina: '/icons/status/stamina.png',
    };

    return (
        <img
            src={statusIcons[type]}
            className="status-icon"
            style={{
                width: size + 'px',
                height: size + 'px',
                imageRendering: 'pixelated',
                objectFit: 'none'
            }}
        />
    );
}

// Componente para ícones de lean (tipo de hunt)
export function LeanIcon({ type, size = 9 }) {
    const leanIcons = {
        exp: '/icons/leans/exp.png',
        loot: '/icons/leans/loot.png',
        bane: '/icons/leans/bane.png',
        archfoe: '/icons/leans/archfoe.png',
        nemesis: '/icons/leans/nemesis.png',
    };

    return (
        <img
            src={leanIcons[type]}
            className="lean-icon"
            style={{
                width: size + 'px',
                height: size + 'px',
                imageRendering: 'pixelated'
            }}
        />
    );
}

// Componente para ícones de ranking/league
export function LeagueIcon({ league, size = 40 }) {
    const leagueIcons = {
        bronze: '/icons/leagues/bronze.svg',
        silver: '/icons/leagues/silver.svg',
        gold: '/icons/leagues/gold.svg',
        platinum: '/icons/leagues/platinum.svg',
        diamond: '/icons/leagues/diamond.svg',
        legend: '/icons/leagues/legend.svg',
    };

    return (
        <span 
            className={`league-badge league-${league}`}
            style={{
                width: size + 'px',
                height: size + 'px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <img
                src={leagueIcons[league]}
                style={{
                    width: '100%',
                    height: '100%',
                    imageRendering: 'pixelated'
                }}
            />
        </span>
    );
}

// Todos os componentes já foram exportados individualmente acima com 'export function'
