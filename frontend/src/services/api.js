// Zamba Idle - Serviço de API
// Comunicação com o backend

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição');
  }

  return data;
}

export const api = {
  // Personagens
  createCharacter: (data) => request('/characters', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getCharacters: (accountId) => request(`/characters?accountId=${accountId}`),

  getCharacter: (id) => request(`/characters/${id}`),

  deleteCharacter: (id) => request(`/characters/${id}`, {
    method: 'DELETE',
  }),

  // Instância de Caçada
  createInstance: (characterId, zoneId) => request(`/characters/${characterId}/instance/create`, {
    method: 'POST',
    body: JSON.stringify({ zoneId }),
  }),

  attackMonster: (characterId, monsterIndex) => request(`/characters/${characterId}/instance/attack`, {
    method: 'POST',
    body: JSON.stringify({ monsterIndex }),
  }),

  attackBoss: (characterId) => request(`/characters/${characterId}/instance/attack-boss`, {
    method: 'POST',
  }),

  autoAttack: (characterId) => request(`/characters/${characterId}/instance/auto-attack`, {
    method: 'POST',
  }),

  autoMonsterAttack: (characterId) => request(`/characters/${characterId}/instance/auto-monster-attack`, {
    method: 'POST',
  }),

  fleeInstance: (characterId) => request(`/characters/${characterId}/instance/flee`, {
    method: 'POST',
  }),

  getInstance: (characterId) => request(`/characters/${characterId}/instance`),

  // Loot
  sellLoot: (characterId) => request(`/characters/${characterId}/loot/sell`, {
    method: 'POST',
  }),

  // Boss Shop
  getBossShop: () => request('/boss-shop'),

  buyBossShopItem: (characterId, itemId) => request(`/characters/${characterId}/boss-shop/buy`, {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  }),

  // Configurações
  getVocations: () => request('/vocations'),

  getZones: () => request('/zones'),

  getBosses: () => request('/bosses'),

  getConfig: () => request('/config'),

  // Leaderboard
  getLeaderboard: () => request('/leaderboard'),
};
