import React, { useState, useEffect, useRef } from 'react';

const HELPER_FEATURES = [
  { id: 'autoAttack', name: 'Auto-Attack', icon: '⚔️', description: 'Ataca automaticamente' },
  { id: 'autoLoot', name: 'Auto-Loot', icon: '🎒', description: 'Coleta loot automaticamente' },
  { id: 'autoSell', name: 'Auto-Sell', icon: '💰', description: 'Vende quando pouch cheia' },
  { id: 'autoHeal', name: 'Auto-Heal', icon: '💚', description: 'Usa cura quando HP baixo' },
  { id: 'autoFood', name: 'Auto-Food', icon: '🍖', description: 'Come para recuperar stamina' },
  { id: 'autoSpell', name: 'Auto-Spell', icon: '✨', description: 'Usa magia de ataque' },
];

export default function Helper({ character, onToggle, isActive }) {
  const [enabled, setEnabled] = useState({
    autoAttack: false,
    autoLoot: false,
    autoSell: false,
    autoHeal: false,
    autoFood: false,
    autoSpell: false,
  });
  const [settings, setSettings] = useState({
    healThreshold: 50,
    sellThreshold: 80,
    attackSpeed: 1000,
    spellCooldown: 2000,
  });
  const [showSettings, setShowSettings] = useState(false);
  const intervalsRef = useRef({});

  // Limpar intervals quando desmontar
  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, []);

  const toggleFeature = (featureId) => {
    const newState = { ...enabled, [featureId]: !enabled[featureId] };
    setEnabled(newState);
    
    if (onToggle) {
      onToggle(featureId, newState[featureId]);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isActive) return null;

  return (
    <div className="helper-panel">
      <div className="helper-header">
        <h3>🤖 Helper</h3>
        <button 
          className="btn-helper-settings"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️
        </button>
      </div>

      {showSettings && (
        <div className="helper-settings">
          <div className="setting-row">
            <span>HP para curar:</span>
            <input 
              type="range" 
              min="10" 
              max="90" 
              value={settings.healThreshold}
              onChange={(e) => updateSetting('healThreshold', parseInt(e.target.value))}
            />
            <span>{settings.healThreshold}%</span>
          </div>
          <div className="setting-row">
            <span>% para vender:</span>
            <input 
              type="range" 
              min="50" 
              max="100" 
              value={settings.sellThreshold}
              onChange={(e) => updateSetting('sellThreshold', parseInt(e.target.value))}
            />
            <span>{settings.sellThreshold}%</span>
          </div>
          <div className="setting-row">
            <span>Vel. ataque (ms):</span>
            <input 
              type="number" 
              min="500" 
              max="5000" 
              step="100"
              value={settings.attackSpeed}
              onChange={(e) => updateSetting('attackSpeed', parseInt(e.target.value))}
            />
          </div>
          <div className="setting-row">
            <span>Cooldown magia (ms):</span>
            <input 
              type="number" 
              min="1000" 
              max="10000" 
              step="500"
              value={settings.spellCooldown}
              onChange={(e) => updateSetting('spellCooldown', parseInt(e.target.value))}
            />
          </div>
        </div>
      )}

      <div className="helper-features">
        {HELPER_FEATURES.map(feature => (
          <button
            key={feature.id}
            className={`helper-feature ${enabled[feature.id] ? 'active' : ''}`}
            onClick={() => toggleFeature(feature.id)}
            title={feature.description}
          >
            <span className="feature-icon">{feature.icon}</span>
            <span className="feature-name">{feature.name}</span>
            <span className={`feature-status ${enabled[feature.id] ? 'on' : 'off'}`}>
              {enabled[feature.id] ? 'ON' : 'OFF'}
            </span>
          </button>
        ))}
      </div>

      <div className="helper-info">
        <p>💡 Ative o Helper para jogar automaticamente</p>
      </div>
    </div>
  );
}
