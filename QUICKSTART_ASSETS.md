# 🚀 QUICKSTART: Carregando Sprites Reais (Canary + OTClient + 15.x)

## Repositórios base (exatamente o que você pediu)

- **Canary** → https://github.com/opentibiabr/canary
- **OTClient** → https://github.com/opentibiabr/otclient  
- **Sprites/Effects/Missiles/Outfits** → https://github.com/Levi999x/15.x-with-8.60

## Passo a passo rápido (5 minutos)

```bash
# 1. Clone os assets
git clone --depth 1 https://github.com/Levi999x/15.x-with-8.60.git /tmp/15x-assets

# 2. Extraia
cd /tmp/15x-assets
unzip -o Tibia_spr_dat.zip -d extracted/

# 3. Copie para o Zamba Idle
cd /home/user/Zamba-idle
mkdir -p frontend/public/assets/tibia-860
cp /tmp/15x-assets/extracted/Tibia.spr /tmp/15x-assets/extracted/Tibia.dat frontend/public/assets/tibia-860/
cp /tmp/15x-assets/*.xml /tmp/15x-assets/Tibia.otfi frontend/public/assets/tibia-860/ 2>/dev/null || true

# (opcional) copie também para a pasta antiga
cp frontend/public/assets/tibia-860/* frontend/public/sprites/ 2>/dev/null || true
```

## Usar no jogo

1. `cd frontend && npm run dev`
2. Abra http://localhost:5173
3. Crie personagem → entre em uma caçada
4. Clique no botão **🎨 Sprites** (canto superior direito do painel de batalha)
5. Clique **"📁 Carregar de /sprites/"**

Pronto! Os monstros e personagens agora usarão sprites reais do client 15.x/8.60.

## Formatos suportados agora

✅ Tibia.spr + Tibia.dat (clássico OTClient) ← **recomendado**
✅ catalog-content.json + sprites-*.lzma (moderno 15.x)

## O que está funcionando

- Sprites de monstros e vocações carregados dos assets oficiais
- Mapeamento automático dos mesmos IDs usados no OTClient
- Fallback visual bonito quando o sprite não é encontrado

## Próximos passos possíveis

- Carregar efeitos e missiles (já temos mapeamento em spriteLoader.js)
- Renderizar direções de outfits
- Carregar addons
- Integrar com Canary real via protocolo

Tudo isso agora tem a base correta (Canary + OTClient + assets 15.x).
