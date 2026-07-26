import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import CharacterSelect from './pages/CharacterSelect';
import GameDashboard from './pages/GameDashboard';
import CreateCharacter from './pages/CreateCharacter';
import Leaderboard from './pages/Leaderboard';

// ID da conta (em produção viria de autenticação)
const ACCOUNT_ID = 'account-001';

export default function App() {
  const [view, setView] = useState('select'); // select, create, game, leaderboard
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const chars = await api.getCharacters(ACCOUNT_ID);
      setCharacters(chars);
    } catch (error) {
      console.error('Erro ao carregar personagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCharacter = (character) => {
    setSelectedCharacter(character);
    setView('game');
  };

  const handleCreateCharacter = async (data) => {
    try {
      await api.createCharacter({ ...data, accountId: ACCOUNT_ID });
      await loadCharacters();
      setView('select');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteCharacter = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este personagem?')) {
      try {
        await api.deleteCharacter(id);
        await loadCharacters();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleCharacterUpdate = (updatedCharacter) => {
    setSelectedCharacter(updatedCharacter);
    setCharacters(chars => 
      chars.map(c => c.id === updatedCharacter.id ? updatedCharacter : c)
    );
  };

  const handleLogout = () => {
    setSelectedCharacter(null);
    setView('select');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="logo" onClick={() => setView('select')}>
            ⚔️ Zamba Idle
          </h1>
          <nav className="nav">
            <button 
              className={`nav-btn ${view === 'select' ? 'active' : ''}`}
              onClick={() => setView('select')}
            >
              Personagens
            </button>
            <button 
              className={`nav-btn ${view === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setView('leaderboard')}
            >
              Ranking
            </button>
            {selectedCharacter && (
              <button className="nav-btn logout" onClick={handleLogout}>
                Sair
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="main">
        {view === 'select' && (
          <CharacterSelect
            characters={characters}
            loading={loading}
            onSelect={handleSelectCharacter}
            onCreate={() => setView('create')}
            onDelete={handleDeleteCharacter}
          />
        )}

        {view === 'create' && (
          <CreateCharacter
            onSubmit={handleCreateCharacter}
            onCancel={() => setView('select')}
          />
        )}

        {view === 'game' && selectedCharacter && (
          <GameDashboard
            character={selectedCharacter}
            onUpdate={handleCharacterUpdate}
          />
        )}

        {view === 'leaderboard' && (
          <Leaderboard />
        )}
      </main>

      <footer className="footer">
        <p>Zamba Idle © 2026 - Jogo idle baseado em Tibia | Engine: Canary (OpenTibiaBR)</p>
      </footer>
    </div>
  );
}
