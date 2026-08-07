# 🎮 Guia Passo-a-Passo: Como Rodar o Zamba Idle

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (versão 18 ou superior) → [nodejs.org](https://nodejs.org)
- **NPM** (vem com o Node.js) ou **Yarn**
- **Git** (opcional, para clonar o repositório)

### Como verificar se já tem instalado:

```bash
node --version    # Deve mostrar v18.x.x ou superior
npm --version     # Deve mostrar 9.x.x ou superior
```

---

## 🚀 Método 1: Clonar do GitHub (Recomendado)

### Passo 1: Abra o terminal

- **Windows**: Pressione `Win + R`, digite `cmd` e pressione Enter
- **Mac**: Abra o Spotlight (`Cmd + Space`), digite `Terminal`
- **Linux**: `Ctrl + Alt + T`

### Passo 2: Clone o repositório

```bash
git clone https://github.com/seu-usuario/Zamba-idle.git
```

### Passo 3: Entre na pasta do projeto

```bash
cd Zamba-idle
```

---

## 📦 Método 2: Baixar como ZIP

### Passo 1: Baixe o ZIP

1. Acesse a página do repositório no GitHub
2. Clique no botão verde **"Code"**
3. Selecione **"Download ZIP"**

### Passo 2: Extraia o arquivo

- **Windows**: Clique direito no arquivo → "Extrair tudo"
- **Mac**: Duplo clique no arquivo .zip
- **Linux**: `unzip Zamba-idle-main.zip`

### Passo 3: Abra o terminal na pasta extraída

```bash
cd Zamba-idle-main
```

---

## 🔧 Instalação das Dependências

O projeto tem duas partes: **backend** e **frontend**. Precisamos instalar as dependências de ambas.

### Passo 1: Instalar dependências do Backend

```bash
cd backend
npm install
```

Você verá algo como:
```
added 71 packages, and audited 72 packages in 3s
```

### Passo 2: Instalar dependências do Frontend

Abra **outro terminal** (ou volte à pasta raiz):

```bash
cd ../frontend
npm install
```

Você verá algo como:
```
added 65 packages, and audited 66 packages in 10s
```

---

## ▶️ Executando o Jogo

Você precisa rodar **dois servidores simultaneamente**: o backend e o frontend.

### Terminal 1 - Backend (API)

```bash
cd backend
npm run dev
```

Você verá esta mensagem:
```
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║   🎮 ZAMBA IDLE - Servidor Online             ║
  ║                                               ║
  ║   Jogo idle baseado em Tibia                  ║
  ║   Engine: Canary (OpenTibiaBR)                ║
  ║                                               ║
  ║   API: http://localhost:3001/api               ║
  ║   Health: http://localhost:3001/health         ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
```

### Terminal 2 - Frontend (Interface)

Abra **outro terminal**:

```bash
cd frontend
npm run dev
```

Você verá algo como:
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🎮 Acessando o Jogo

### Passo 1: Abra o navegador

Acesse: **http://localhost:5173**

### Passo 2: Crie seu personagem

1. Clique em **"+ Criar Personagem"**
2. Escolha um nome (3-20 caracteres)
3. Selecione uma vocação:
   - ⚔️ **Knight** - Mestre do combate corpo a corpo
   - 🏹 **Paladin** - Atirador divino
   - 🔥 **Sorcerer** - Mestre das chamas
   - ❄️ **Druid** - Mestre do gelo
4. Clique em **"Criar Personagem"**

### Passo 3: Comece a jogar

1. Clique no card do seu personagem
2. Selecione uma zona de caçada
3. Seu personagem começa a caçar automaticamente!
4. Volte depois para coletar o loot

---

## 🔄 Parar os Servidores

Para parar qualquer um dos servidores, pressione `Ctrl + C` no terminal correspondente.

---

## ❓ Solução de Problemas Comuns

### Erro: "Port 3001 already in use"

Outro programa está usando a porta 3001. Para mudar a porta:

```bash
PORT=3002 npm run dev
```

Ou no Windows:
```cmd
set PORT=3002 && npm run dev
```

### Erro: "npm command not found"

O Node.js não está instalado. Baixe em: [nodejs.org](https://nodejs.org)

### Erro: "Cannot find module"

As dependências não foram instaladas. Execute:
```bash
cd backend
npm install
cd ../frontend
npm install
```

### A página não carrega

Verifique se ambos os servidores estão rodando:
- Backend: http://localhost:3001/health
- Frontend: http://localhost:5173

---

## 📁 Estrutura de Arquivos

```
Zamba-idle/
├── backend/                  # Servidor da API
│   ├── src/
│   │   ├── config/          # Configurações do jogo
│   │   ├── models/          # Lógica dos personagens
│   │   ├── routes/          # Endpoints da API
│   │   └── index.js         # Entrada do servidor
│   ├── package.json
│   └── package-lock.json
├── frontend/                 # Interface do jogo
│   ├── src/
│   │   ├── pages/           # Telas do jogo
│   │   ├── services/        # Comunicação com API
│   │   ├── styles/          # CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🎯 Próximos Passos

Depois de rodar o MVP, você pode:

1. **Explorar o código** - Entenda como a lógica idle funciona
2. **Adicionar funcionalidades** - Party, Boss, Equipamento
3. **Conectar ao Canary** - Integrar com o servidor TFS real
4. **Customizar** - Mudar sprites, monstros, zonas

---

## 📚 Recursos Adicionais

- **Documentação do Canary**: [docs.opentibiabr.com](https://docs.opentibiabr.com)
- **Repositório do Canary**: [github.com/opentibiabr/canary](https://github.com/opentibiabr/canary)
- **Comunidade OpenTibia**: [otland.net](https://otland.net)

---

**Divirta-se jogando! 🎮⚔️**

---

## 🖼️ Carregando Sprites Reais do Tibia (Canary + OTClient + 15.x Assets)

Agora o Zamba Idle suporta **os assets oficiais** que você indicou:

### Repositórios usados como base:

- **Servidor**: https://github.com/opentibiabr/canary
- **Cliente**: https://github.com/opentibiabr/otclient
- **Sprites / Outfits / Effects / Missiles**: https://github.com/Levi999x/15.x-with-8.60

### Como instalar os sprites rapidamente

**Opção A - Script automático (recomendado):**

```bash
cd Zamba-idle
./scripts/setup-assets.sh
```

**Opção B - Manual:**

```bash
# 1. Baixe os assets
git clone --depth 1 https://github.com/Levi999x/15.x-with-8.60.git /tmp/tibia-15x

# 2. Extraia
cd /tmp/tibia-15x
unzip -o Tibia_spr_dat.zip -d extracted/

# 3. Copie para o projeto
mkdir -p frontend/public/assets/tibia-860
cp extracted/Tibia.spr extracted/Tibia.dat frontend/public/assets/tibia-860/
cp *.xml Tibia.otfi frontend/public/assets/tibia-860/ 2>/dev/null || true

# 4. (opcional) copie também para a pasta antiga
cp frontend/public/assets/tibia-860/* frontend/public/sprites/ 2>/dev/null || true
```

### Como usar dentro do jogo

1. Rode `npm run dev` no frontend
2. Crie um personagem e entre em uma caçada
3. No painel "Campo de Batalha", clique no botão **"🎨 Sprites"**
4. Clique em **"📁 Carregar de /sprites/"**

O sistema tenta primeiro `/assets/tibia-860/` (formato clássico OT) e depois o formato moderno.

### Formatos suportados

- **Recomendado**: `Tibia.spr` + `Tibia.dat` (compatível com OTClient)
- Moderno: `catalog-content.json` + spritesheets .lzma

Depois de carregar os sprites, os monstros e personagens usarão as imagens reais do client!

