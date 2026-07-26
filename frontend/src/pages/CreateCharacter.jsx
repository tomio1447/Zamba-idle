import React, { useState } from 'react';
import { api } from '../services/api';

const VOCATIONS = [
  { id: 'KNIGHT', name: 'Knight', icon: '⚔️', desc: 'Mestre do combate corpo a corpo. Alta vida e dano melee.' },
  { id: 'PALADIN', name: 'Paladin', icon: '🏹', desc: 'Atirador divino. Equilibra combate à distância e magia.' },
  { id: 'SORCERER', name: 'Sorcerer', icon: '🔥', desc: 'Mestre das chamas. Alto poder mágico e dano de fogo.' },
  { id: 'DRUID', name: 'Druid', icon: '❄️', desc: 'Mestre do gelo. Suporte e magias de cura e gelo.' },
  { id: 'MONK', name: 'Monk', icon: '🧘', desc: 'Mestre do chi. Combate corpo a corpo com magias de cura.' },
];

export default function CreateCharacter({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [vocation, setVocation] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Digite um nome para o personagem');
      return;
    }

    if (!vocation) {
      setError('Escolha uma vocação');
      return;
    }

    onSubmit({ name: name.trim(), vocation });
  };

  return (
    <div className="create-character">
      <div className="page-header">
        <h2>Criar Personagem</h2>
        <button className="btn btn-secondary" onClick={onCancel}>
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-group">
          <label htmlFor="name">Nome do Personagem</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite o nome..."
            maxLength={20}
            minLength={3}
          />
          <small>Entre 3 e 20 caracteres</small>
        </div>

        <div className="form-group">
          <label>Escolha sua Vocação</label>
          <div className="vocation-grid">
            {VOCATIONS.map(voc => (
              <div
                key={voc.id}
                className={`vocation-card ${vocation === voc.id ? 'selected' : ''}`}
                onClick={() => setVocation(voc.id)}
              >
                <span className="vocation-icon-large">{voc.icon}</span>
                <h4>{voc.name}</h4>
                <p>{voc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn btn-primary btn-large">
          Criar Personagem
        </button>
      </form>
    </div>
  );
}
