import React, { useState, useEffect } from 'react';

export default function BossBar({ boss, onSkipBoss, canSkip, cooldownRemaining }) {
    const [showSkipConfirm, setShowSkipConfirm] = useState(false);

    if (!boss || !boss.name) return null;

    const hpPercent = Math.max(0, (boss.hp / boss.maxHp) * 100);
    const hpColor = hpPercent > 50 ? '#4ade80' : hpPercent > 25 ? '#fbbf24' : '#ef4444';

    const formatCooldown = (ms) => {
        const seconds = Math.ceil(ms / 1000);
        return seconds + 's';
    };

    const handleSkipClick = () => {
        if (!canSkip) return;
        setShowSkipConfirm(true);
    };

    const confirmSkip = () => {
        onSkipBoss();
        setShowSkipConfirm(false);
    };

    return (
        <div className="bossbar-frame">
            <div className="bossbar-header">
                <span className="bossbar-icon">👑</span>
                <span className="bossbar-name">{boss.name}</span>
                <span className="bossbar-label">BOSS</span>
            </div>

            <div className="bossbar-container">
                <div 
                    className="bossbar-hp" 
                    style={{ 
                        width: hpPercent + '%',
                        backgroundColor: hpColor 
                    }}
                ></div>
                <span className="bossbar-hp-text">
                    {boss.hp.toLocaleString()} / {boss.maxHp.toLocaleString()}
                </span>
            </div>

            <div className="bossbar-actions">
                <button 
                    className={`btn-skip-boss ${!canSkip ? 'cooldown' : ''}`}
                    onClick={handleSkipClick}
                    disabled={!canSkip}
                    title={canSkip ? 'Pular Boss' : 'Aguardando cooldown: ' + formatCooldown(cooldownRemaining)}
                >
                    {canSkip ? '⏭️ Pular Boss' : '⏳ ' + formatCooldown(cooldownRemaining)}
                </button>
            </div>

            {showSkipConfirm && (
                <div className="modal-overlay" onClick={() => setShowSkipConfirm(false)}>
                    <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
                        <h3>⏭️ Pular Boss</h3>
                        <p>
                            Tem certeza que deseja pular o boss?
                            <br />
                            <small>Você perderá 10% do gold coletado.</small>
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={confirmSkip}>
                                ✅ Confirmar
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowSkipConfirm(false)}>
                                ❌ Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
