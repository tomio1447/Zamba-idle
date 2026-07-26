#!/bin/bash
# Zamba Idle - Script para iniciar o jogo
# Uso: ./start.sh

echo "🎮 Iniciando Zamba Idle..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se as dependências estão instaladas
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "${GREEN}✓ Dependências instaladas${NC}"
echo ""

# Iniciar backend em background
echo "${BLUE}▶ Iniciando Backend (API)...${NC}"
cd backend && npm run dev &
BACKEND_PID=$!
cd ..

# Aguardar backend iniciar
sleep 2

# Iniciar frontend
echo "${BLUE}▶ Iniciando Frontend (Interface)...${NC}"
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "${GREEN}═══════════════════════════════════════════════${NC}"
echo "${GREEN}  🎮 ZAMBA IDLE - Jogo Iniciado!${NC}"
echo "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo "  📍 Frontend: http://localhost:5173"
echo "  📍 Backend:  http://localhost:3001"
echo "  📍 API:      http://localhost:3001/api"
echo ""
echo "  Pressione Ctrl+C para parar os servidores"
echo "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""

# Aguardar Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo '👋 Servidores parados'; exit 0" INT

# Manter o script rodando
wait
