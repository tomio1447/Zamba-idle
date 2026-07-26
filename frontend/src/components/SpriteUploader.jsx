import React, { useState, useRef } from 'react';
import { getModernSpriteLoader, VOCATION_SPRITES_MODERN, MONSTER_SPRITES_MODERN } from '../utils/spriteLoader';

export default function SpriteUploader({ onSpritesLoaded }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Carregar de diretório local (public/sprites/)
  async function handleLoadFromPublic() {
    setLoading(true);
    setStatus('Carregando do diretório /sprites/...');
    setProgress(10);

    try {
      const loader = getModernSpriteLoader();
      
      // Carregar catálogo
      setStatus('Carregando catálogo...');
      setProgress(30);
      
      const success = await loader.loadFromDirectory('/sprites/');
      
      if (success) {
        setProgress(100);
        setStatus('✅ Sprites carregados com sucesso!');
        setLoaded(true);
        onSpritesLoaded(true);
      } else {
        setStatus('❌ Erro ao carregar. Verifique se os arquivos estão em /sprites/');
      }
    } catch (error) {
      setStatus(`❌ Erro: ${error.message}`);
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
    setProgress(0);

    try {
      const fileMap = {};
      for (const file of files) {
        fileMap[file.name.toLowerCase()] = file;
      }

      // Verificar arquivos necessários
      const catalogFile = fileMap['catalog-content.json'];
      if (!catalogFile) {
        setStatus('❌ catalog-content.json não encontrado!');
        setLoading(false);
        return;
      }

      setProgress(20);
      setStatus('Carregando catálogo...');

      // Ler catálogo
      const catalogText = await catalogFile.text();
      const catalog = JSON.parse(catalogText);
      
      setProgress(40);
      setStatus(`Catálogo carregado: ${catalog.length} arquivos`);

      // Carregar spritesheets
      const spriteFiles = catalog.filter(entry => 
        entry.type === 'sprite' || entry.name?.includes('sprites-')
      );

      const loader = getModernSpriteLoader();
      loader.catalog = catalog;
      loader.spriteSheets = new Map();

      let loaded = 0;
      for (const entry of spriteFiles) {
        const fileName = entry.file?.toLowerCase() || entry.name?.toLowerCase();
        const file = fileMap[fileName];
        
        if (file) {
          const data = await file.arrayBuffer();
          loader.spriteSheets.set(entry.id || loaded, data);
          loaded++;
          setProgress(40 + (loaded / spriteFiles.length) * 40);
        }
      }

      // Carregar appearances
      const appearancesFile = Object.keys(fileMap).find(name => 
        name.startsWith('appearances-') || name === 'appearances.dat'
      );
      if (appearancesFile) {
        setStatus('Carregando aparências...');
        loader.appearances = await fileMap[appearancesFile].arrayBuffer();
      }

      setProgress(100);
      loader.loaded = true;
      setStatus(`✅ Carregado! ${loaded} spritesheets, ${catalog.length} entradas`);
      setLoaded(true);
      onSpritesLoaded(true);

    } catch (error) {
      setStatus(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sprite-uploader">
      <div className="uploader-header">
        <h3>🎮 Sprites do Tibia 15.25</h3>
        <p>Carregue os arquivos do client moderno (dudantas/tibia-client)</p>
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
              accept=".json,.dat,.lzma,.bmp"
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
