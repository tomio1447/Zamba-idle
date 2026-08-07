import React, { useState, useRef } from 'react';
import { getModernSpriteLoader, VOCATION_SPRITES_MODERN, MONSTER_SPRITES_MODERN } from '../utils/spriteLoader';

export default function SpriteUploader({ onSpritesLoaded }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Carregar de diretório local (public/sprites/ ou /assets/tibia-860/)
  async function handleLoadFromPublic() {
    setLoading(true);
    setStatus('Procurando assets do Tibia...');
    setProgress(10);

    try {
      const loader = getModernSpriteLoader();
      
      // Tenta primeiro o novo caminho recomendado (otclient + 15.x-with-8.60)
      setStatus('Tentando carregar de /assets/tibia-860/...');
      setProgress(20);
      let success = await loader.loadFromDirectory('/assets/tibia-860/');

      if (!success) {
        // Fallback antigo
        setStatus('Tentando /sprites/...');
        setProgress(40);
        success = await loader.loadFromDirectory('/sprites/');
      }

      if (success) {
        setProgress(100);
        const fmt = loader.getFormat ? loader.getFormat() : 'unknown';
        setStatus(`✅ Assets carregados! (${fmt})`);
        setLoaded(true);
        onSpritesLoaded(true);
      } else {
        setStatus('❌ Nenhum asset encontrado. Coloque Tibia.spr + Tibia.dat em /assets/tibia-860/');
      }
    } catch (error) {
      setStatus('❌ Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Carregar arquivos selecionados pelo usuário
  async function handleFileSelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setStatus('Processando arquivos...');
    setProgress(10);

    try {
      const fileMap = {};
      for (const file of files) {
        fileMap[file.name.toLowerCase()] = file;
      }

      const loader = getModernSpriteLoader();

      // Detecta formato clássico OT (Tibia.spr + Tibia.dat) - recomendado com otclient
      const sprFile = fileMap['tibia.spr'];
      const datFile = fileMap['tibia.dat'];

      if (sprFile && datFile) {
        setStatus('Carregando formato clássico (Tibia.spr + Tibia.dat)...');
        setProgress(30);

        const success = await loader.loadClassicFromFiles 
          ? await loader.loadClassicFromFiles(sprFile, datFile)
          : await loader.loadFromFiles(files); // fallback

        if (success) {
          setProgress(100);
          setStatus('✅ Assets clássicos 8.60/15.x carregados com sucesso!');
          setLoaded(true);
          onSpritesLoaded(true);
          return;
        }
      }

      // Formato moderno
      const catalogFile = fileMap['catalog-content.json'];
      if (!catalogFile) {
        setStatus('❌ Selecione Tibia.spr + Tibia.dat (clássico) OU catalog-content.json (moderno)');
        setLoading(false);
        return;
      }

      setProgress(25);
      setStatus('Carregando catálogo moderno...');

      const catalogText = await catalogFile.text();
      const catalog = JSON.parse(catalogText);
      
      setProgress(40);
      setStatus('Catálogo carregado: ' + catalog.length + ' arquivos');

      const spriteFiles = catalog.filter(entry => 
        entry.type === 'sprite' || entry.name?.includes('sprites-')
      );

      loader.catalog = catalog;
      loader.spriteSheets = new Map();

      let loadedCount = 0;
      for (const entry of spriteFiles) {
        const fileName = (entry.file || entry.name || '').toLowerCase();
        const file = fileMap[fileName];
        
        if (file) {
          const data = await file.arrayBuffer();
          loader.spriteSheets.set(entry.id || loadedCount, data);
          loadedCount++;
          setProgress(40 + (loadedCount / spriteFiles.length) * 45);
        }
      }

      const appearancesFile = Object.keys(fileMap).find(name => 
        name.startsWith('appearances-') || name === 'appearances.dat'
      );
      if (appearancesFile) {
        setStatus('Carregando aparências...');
        loader.appearances = await fileMap[appearancesFile].arrayBuffer();
      }

      setProgress(100);
      loader.loaded = true;
      loader.format = 'modern';
      setStatus(`✅ Moderno carregado! ${loadedCount} spritesheets`);
      setLoaded(true);
      onSpritesLoaded(true);

    } catch (error) {
      setStatus('❌ Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sprite-uploader">
      <div className="uploader-header">
        <h3>🎮 Sprites do Tibia (OTClient + Canary)</h3>
        <p>Carregue assets do <strong>opentibiabr/otclient</strong> + <strong>15.x-with-8.60</strong></p>
      </div>

      <div className="uploader-options">
        {/* Opção 1: Carregar de /sprites/ */}
        <div className="upload-option">
          <button 
            className="btn btn-secondary"
            onClick={handleLoadFromPublic}
            disabled={loading}
          >
            📁 Carregar de /sprites/
          </button>
          <small>Coloque os arquivos em: frontend/public/sprites/</small>
        </div>

        <div className="upload-divider">OU</div>

        {/* Opção 2: Upload manual */}
        <div className="upload-option">
          <label className="btn btn-primary file-upload-label">
            📂 Selecionar Arquivos
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".spr,.dat,.json,.lzma,.bmp"
            />
          </label>
          <small>Selecione os arquivos do client (catalog-content.json, sprites-*.bmp.lzma, appearances-*.dat)</small>
        </div>
      </div>

      {/* Barra de progresso */}
      {loading && (
        <div className="upload-loading">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span>{status}</span>
        </div>
      )}

      {!loading && status && (
        <div className={`upload-status ${loaded ? 'success' : 'error'}`}>
          {status}
        </div>
      )}

      <div className="upload-help">
        <h4>📋 Arquivos necessários:</h4>
        <ul>
          <li><code>catalog-content.json</code> - Catálogo de arquivos</li>
          <li><code>sprites-*.bmp.lzma</code> - Sprites comprimidos</li>
          <li><code>appearances-*.dat</code> - Definições de aparências</li>
        </ul>
        
        <h4>📂 Onde encontrar:</h4>
        <p className="help-note">
          No seu client Tibia 15.25:<br/>
          <code>C:\Users\Tomio\Desktop\zamba-idle\idleclient\assets\</code>
        </p>
        
        <h4>🎨 Sprites disponíveis:</h4>
        <div className="sprite-preview-info">
          <div className="preview-item">
            <span className="preview-icon">👤</span>
            <span>Outfits por vocação:</span>
            <span className="preview-value">Knight, Paladin, Sorcerer, Druid</span>
          </div>
          <div className="preview-item">
            <span className="preview-icon">👾</span>
            <span>Monstros:</span>
            <span className="preview-value">Rat, Spider, Bear, Demon, Dragon...</span>
          </div>
          <div className="preview-item">
            <span className="preview-icon">👑</span>
            <span>Bosses:</span>
            <span className="preview-value">6 bosses únicos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
