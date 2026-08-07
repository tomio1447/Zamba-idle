# Engine & Assets Base

Zamba Idle usa como base os seguintes projetos oficiais da comunidade OpenTibia:

## Repositórios Base

| Componente       | Repositório                                      | Uso no Zamba Idle                          |
|------------------|--------------------------------------------------|--------------------------------------------|
| **Servidor**     | https://github.com/opentibiabr/canary           | Lógica de magias, monstros, itens, vocações, balanceamento |
| **Cliente**      | https://github.com/opentibiabr/otclient         | Engine de renderização (OTCv8), suporte a outfits, efeitos, missiles |
| **Assets 15.x/8.60** | https://github.com/Levi999x/15.x-with-8.60   | Sprites, outfits, itens, effects, missiles (downgraded para 8.60 + conteúdo 15.x) |

## Como usar os Assets Reais (Sprites + Outfits)

### Passo 1: Obter os Assets

```bash
# Clone o repositório de assets
git clone --depth 1 https://github.com/Levi999x/15.x-with-8.60.git /tmp/tibia-assets

# Extraia o pacote principal
cd /tmp/tibia-assets
unzip -o Tibia_spr_dat.zip -d extracted/
```

### Passo 2: Copiar para o Frontend

```bash
# No projeto Zamba-idle
mkdir -p frontend/public/assets/tibia-860

# Copie os arquivos principais
cp /tmp/tibia-assets/extracted/Tibia.spr frontend/public/assets/tibia-860/
cp /tmp/tibia-assets/extracted/Tibia.dat frontend/public/assets/tibia-860/
cp /tmp/tibia-assets/*.xml frontend/public/assets/tibia-860/

# Opcional: outfits.xml, items.xml, mounts.xml
```

### Passo 3: Carregar no Jogo

1. Abra o jogo
2. Vá até a tela de caçada
3. Clique no botão **"🎨 Sprites"** no topo do painel de batalha
4. Use a opção **"Carregar de /assets/tibia-860/"** ou faça upload manual dos arquivos

O `SpriteLoader` atual já suporta tanto o formato moderno (catalog-content.json + sprites-*.lzma) quanto o formato clássico OT (.spr + .dat).

## Estrutura Recomendada de Assets

```
frontend/public/assets/tibia-860/
├── Tibia.spr          # Sprites (imagens)
├── Tibia.dat          # Definições de items/outfits/monsters
├── items.xml
├── outfits.xml
├── mounts.xml
└── Tibia.otfi
```

## Integração com OTClient

O OTClient (opentibiabr/otclient) é o cliente oficial recomendado para rodar Canary com esses assets.

Para desenvolvimento completo:

1. Compile OTClient com suporte a `GameSpritesU32`, `GameEnhancedAnimations`, `GameIdleAnimations`
2. Coloque os assets na pasta `data/things/860/` do OTClient
3. Use o mesmo `Tibia.otfi`

## Sprites Importantes (IDs comuns do client 8.60 / 15.x)

- **Outfits**:
  - Knight: 131 (male)
  - Paladin: 129
  - Sorcerer: 130
  - Druid: 136

- **Monstros comuns** (exemplos):
  - Rat: ~282
  - Spider: ~218
  - Bear: ~219
  - Demon: ~35
  - Dragon: ~34

Esses IDs são usados atualmente no `MONSTER_SPRITES_MODERN` e `VOCATION_SPRITES_MODERN`.

## Futuro

- Parser completo de .spr + .dat em JavaScript (para extração de sprites reais no browser)
- Suporte a efeitos (missiles, magic effects)
- Suporte a outfits com addons e direções
- Integração com Canary real via WebSocket (quando disponível)

## Créditos

- OpenTibiaBR (Canary + OTClient)
- Levi999x (downgrade 15.x → 8.60 assets)
- Comunidade OTC / Tibia fans
