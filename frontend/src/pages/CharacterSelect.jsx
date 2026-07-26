import React from 'react';

const VOCATION_ICONS = {
  KNIGHT: '⚔️',
  PALADIN: '🏹',
  SORCERER: '🔥',
  DRUID: '❄️',
  NONE: '👤',
};

export default function CharacterSelect({ characters, loading, onSelect, onCreate, onDelete }) {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando personagens...</p>
      </div>
    );
  }

  return (
    <div className="character-select">
      <div className="page-header">
        <h2>Seus Personagens</h2>
        <button className="btn btn-primary" onClick={onCreate}>
          + Criar Personagem
        </button>
      </div>

      {characters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗡️</div>
          <h3>Nenhum personagem criado</h3>
          <p>Crie seu primeiro personagem e comece sua aventura!</p>
          <button className="btn btn-primary" onClick={onCreate}>
            Criar Personagem
          </button>
        </div>
      ) : (
        <div className="character-grid">
          {characters.map(char => (
            <div key={char.id} className="character-card">
              <div className="character-card-header">
                <span className="vocation-icon">
                  {VOCATION_ICONS[char.vocation] || '👤'}
                </span>
                <button 
                  className="btn-delete"
                  onClick={(e) => { e.stopPropagation(); onDelete(char.id); }}
                  title="Deletar personagem"
                >
                  🗑️
                </button>
              </div>
              
              <div className="character-card-body" onClick={() => onSelect(char)}>
                <h3 className="character-name">{char.name}</h3>
                <p className="character-vocation">{char.vocation}</p>
                
                <div className="character-stats">
                  <div className="stat">
                    <span className="stat-label">Nível</span>
                    <span className="stat-value">{char.level}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">XP Total</span>
                    <span className="stat-value">{char.totalXpEarned.toLocaleString()}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Gold</span>
                    <span className="stat-value gold">{char.gold.toLocaleString()}</span>
                  </div>
                </div>

                <div className="character-status">
                  {char.isHunting ? (
                    <span className="status-badge hunting">🏃 Caçando</span>
                  ) : (
                    <span className="status-badge idle">💤 Parado</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
