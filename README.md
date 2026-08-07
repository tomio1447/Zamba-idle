# Zamba Idle

🎮 **Jogo idle baseado em Tibia usando Canary como engine**

Inspirado no BaiakIdle, o Zamba Idle é um jogo RPG idle onde seu personagem caça monstros, ganha experiência e coleta loot automaticamente - mesmo quando você está offline.

## 🎯 Funcionalidades

### ✅ Sistema de Personagens
- Crie personagens com 4 vocações (Knight, Paladin, Sorcerer, Druid)
- Sistema de level up com XP
- Skills: Melee, Distance, Magic, Shielding
- Stats baseados na vocação

### ✅ Sistema de Instâncias de Caçada
- Cada caçada é uma instância individual
- Sistema de **Waves** - monstros aparecem em ondas
- **Boss Waves** a cada 10 waves
- Diferentes zonas de caçada (6 zonas, de Rookgaard ao Demon Hell)
- Monstros variados por zona

### ✅ Sistema de Boss Fights
- **6 Bosses únicos**: Spider Queen, Bear Spirit, Necromancer Lord, Pharaoh Anubis, Frost Dragon Lord, Demon Overlord
- Bosses aparecem a cada 10 waves
- Loot raro exclusivo de boss
- **Boss Coins** - moeda especial de boss
- **Boss Shop** - loja com itens especiais compráveis com Boss Coins

### ✅ Sistema de Loot
- Loot automático dos monstros
- Itens raros (marcados com ✨)
- Loot Pouch com slots expansíveis
- Venda de loot por Gold

### ✅ Interface Visual
- Canvas de batalha com sprites
- Animações de combate
- Log de combate em tempo real
- Interface responsiva (desktop/mobile)

### ✅ Ranking
- Leaderboard dos melhores jogadores
- Mostra nível, XP total e bosses derrotados

## 🛠️ Tecnologias

### Frontend
- **React 18** - Interface de usuário
- **Vite** - Build tool rápido
- **Canvas API** - Renderização do jogo
- **CSS3** - Estilização com tema escuro inspirado no Tibia

### Backend
- **Node.js** - Servidor da API
- **Express** - Framework web
- **Armazenamento em memória** (MVP) - Futuramente conectado ao Canary

### Engine & Assets (Base Oficial)
- **Canary Server** — [opentibiabr/canary](https://github.com/opentibiabr/canary) (lógica completa: spells, monsters, items, vocations)
- **Cliente** — [opentibiabr/otclient](https://github.com/opentibiabr/otclient) (render engine OTCv8)
- **Sprites / Outfits / Effects / Missiles** — [Levi999x/15.x-with-8.60](https://github.com/Levi999x/15.x-with-8.60) (downgraded 15.x assets compatíveis com 8.60)

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- NPM ou Yarn

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/Zamba-idle.git
cd Zamba-idle
```

2. **Instale as dependências do Backend:**
```bash
cd backend
npm install
```

3. **Instale as dependências do Frontend:**
```bash
cd ../frontend
npm install
```

### Executando

**Opção 1 - Script automático:**
```bash
./start.sh
```

**Opção 2 - Manual (2 terminais):**

Terminal 1 - Backend:
```bash
cd backend && npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend && npm run dev
```

### Acessando
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

## 🎮 Como Jogar

1. **Crie um personagem** - Escolha nome e vocação
2. **Selecione uma zona** - Baseada no seu nível
3. **Entre na instância** - Comece a caçada
4. **Ataque os monstros** - Derrote todos para avançar de wave
5. **Derrote o boss** - A cada 10 waves aparece um boss
6. **Colete o loot** - Venda por gold ou guarde itens raros
7. **Use Boss Coins** - Compre itens na Boss Shop

## 👑 Bosses Disponíveis

| Boss | Nível | Zona | Recompensa |
|------|-------|------|------------|
| Spider Queen | 5-15 | Rookgaard, Forest | Spider Silk, Cobweb Coin |
| Bear Spirit | 10-25 | Forest, Swamp | Bear Paw, Spirit Claw |
| Necromancer Lord | 20-45 | Swamp, Desert | Necro Robe, Death Staff, Soul Stone |
| Pharaoh Anubis | 35-70 | Desert | Ankh of Life, Pharaoh Mask |
| Frost Dragon Lord | 60-120 | Ice | Dragon Scale, Frost Heart |
| Demon Overlord | 100+ | Demona | Demon Blood, Infernal Axe, Hellfire Crown |

## 🏪 Boss Shop

| Item | Custo (Boss Coins) | Efeito |
|------|-------------------|--------|
| Loot Pouch Slot +1 | 5 | +1 slot na loot pouch |
| Loot Pouch Slot +5 | 20 | +5 slots na loot pouch |
| Stamina +100 | 3 | Recupera stamina |
| XP Boost 1h | 10 | Dobra XP por 1 hora |
| Loot Boost 1h | 15 | Dobra loot por 1 hora |
| Boss Entry Ticket | 25 | Pula cooldown de boss |

## 📁 Estrutura do Projeto

```
Zamba-idle/
├── backend/                     # Servidor Node.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── gameConfig.js   # Configurações gerais
│   │   │   └── bossConfig.js   # Config de bosses e instâncias
│   │   ├── models/
│   │   │   └── Character.js    # Modelo de Personagem
│   │   ├── routes/
│   │   │   └── api.js          # Endpoints da API
│   │   └── index.js            # Entrada do servidor
│   └── package.json
├── frontend/                    # Interface React
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameCanvas.jsx  # Canvas do jogo
│   │   │   └── BossShop.jsx    # Loja de bosses
│   │   ├── pages/
│   │   │   ├── CharacterSelect.jsx
│   │   │   ├── CreateCharacter.jsx
│   │   │   ├── GameDashboard.jsx
│   │   │   └── Leaderboard.jsx
│   │   ├── services/
│   │   │   └── api.js          # Comunicação com API
│   │   ├── styles/
│   │   │   └── global.css      # Estilos globais
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
├── start.sh                     # Script para iniciar tudo
├── SETUP_GUIDE.md               # Guia detalhado
└── README.md
```

## 🔮 Futuras Implementações

- [x] **Sprites reais do Tibia** — Suporte a Tibia.spr + Tibia.dat (otclient + 15.x-with-8.60)
- [ ] **Conexão com Canary Server** - Integração real com o servidor TFS
- [ ] **Sistema de Party** - Caçada em grupo com bônus de XP
- [ ] **Sistema de Equipamento** - Armas, armas e acessórios
- [ ] **Magias visuais** - Efeitos e missiles reais usando assets do OTClient
- [ ] **Tasks** - Missões de caçada com recompensas
- [ ] **Market** - Comércio entre jogadores
- [ ] **Imbuements** - Melhorias de equipamento
- [ ] **Addons** - Customização visual
- [ ] **Outfits** - Roupas cosméticas completas (direções + addons)
- [ ] **Autenticação** - Sistema de contas real
- [ ] **Banco de Dados** - Persistência com MySQL/PostgreSQL
- [ ] **Efeitos & Missiles** - Animações reais do client 15.x/8.60

## 📄 Licença

Este projeto é um fã-game não oficial, não afiliado à CipSoft GmbH. Tibia é uma marca registrada da CipSoft GmbH.

## 🙏 Créditos

- **Servidor** — [opentibiabr/canary](https://github.com/opentibiabr/canary)
- **Cliente** — [opentibiabr/otclient](https://github.com/opentibiabr/otclient)
- **Assets (sprites/outfits/effects/missiles)** — [Levi999x/15.x-with-8.60](https://github.com/Levi999x/15.x-with-8.60)
- **Inspiração** — BaiakIdle
- **Comunidade OpenTibia** — Por manter o Tibia vivo

**Base completa do jogo**: Canary + OTClient + Assets 15.x/8.60 (como você pediu)
