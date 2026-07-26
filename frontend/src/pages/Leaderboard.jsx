import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const VOCATION_ICONS = {
  KNIGHT: '⚔️',
  PALADIN: '🏹',
  SORCERER: '🔥',
  DRUID: '❄️',
  NONE: '👤',
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await api.getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando ranking...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="page-header">
        <h2>🏆 Ranking de Jogadores</h2>
        <button className="btn btn-secondary" onClick={loadLeaderboard}>
          🔄 Atualizar
        </button>
      </div>

      {leaderboard.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>Nenhum jogador no ranking</h3>
          <p>Seja o primeiro a conquistar um lugar no pódio!</p>
        </div>
      ) : (
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <span className="col-rank">#</span>
            <span className="col-name">Personagem</span>
            <span className="col-vocation">Vocação</span>
            <span className="col-level">Nível</span>
            <span className="col-xp">XP Total</span>
          </div>
          {leaderboard.map((player, idx) => (
            <div 
              key={idx} 
              className={`leaderboard-row ${idx < 3 ? 'top-' + (idx + 1) : ''}`}
            >
              <span className="col-rank">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
              </span>
              <span className="col-name">{player.name}</span>
              <span className="col-vocation">
                {VOCATION_ICONS[player.vocation]} {player.vocation}
              </span>
              <span className="col-level">{player.level}</span>
              <span className="col-xp">{player.totalXpEarned.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
