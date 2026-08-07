#!/bin/bash
# Zamba Idle - Asset Setup Script
# Downloads and prepares assets from the official sources

set -e

echo "🎮 Zamba Idle - Asset Setup"
echo "=========================="

ASSETS_DIR="frontend/public/assets/tibia-860"
mkdir -p "$ASSETS_DIR"

echo ""
echo "1. Cloning asset repository (Levi999x/15.x-with-8.60)..."
if [ ! -d /tmp/tibia-15x-860 ]; then
  git clone --depth 1 https://github.com/Levi999x/15.x-with-8.60.git /tmp/tibia-15x-860
else
  echo "   (already cloned)"
fi

echo ""
echo "2. Extracting sprites..."
cd /tmp/tibia-15x-860

if [ -f Tibia_spr_dat.zip ]; then
  unzip -o Tibia_spr_dat.zip -d extracted/ > /dev/null 2>&1 || true
  
  if [ -f extracted/Tibia.spr ]; then
    cp extracted/Tibia.spr "$OLDPWD/$ASSETS_DIR/"
    echo "   ✅ Tibia.spr copied"
  fi
  
  if [ -f extracted/Tibia.dat ]; then
    cp extracted/Tibia.dat "$OLDPWD/$ASSETS_DIR/"
    echo "   ✅ Tibia.dat copied"
  fi
else
  echo "   ⚠️ Tibia_spr_dat.zip not found in repo"
fi

echo ""
echo "3. Copying XML definitions..."
cp *.xml "$OLDPWD/$ASSETS_DIR/" 2>/dev/null || true
cp Tibia.otfi "$OLDPWD/$ASSETS_DIR/" 2>/dev/null || true

echo ""
echo "4. Copying to sprites folder (legacy compatibility)..."
mkdir -p "$OLDPWD/frontend/public/sprites"
cp "$ASSETS_DIR"/* "$OLDPWD/frontend/public/sprites/" 2>/dev/null || true

echo ""
echo "✅ Assets prepared!"
echo ""
echo "Next steps:"
echo "  1. Start the frontend: cd frontend && npm run dev"
echo "  2. Open the game"
echo "  3. Click '🎨 Sprites' in the battle panel"
echo "  4. Choose 'Carregar de /assets/tibia-860/'"
echo ""
echo "You can also manually download the zip and extract to:"
echo "  $ASSETS_DIR"
