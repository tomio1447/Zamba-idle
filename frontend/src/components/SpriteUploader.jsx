import React, { useState, useRef } from 'react';
import { getSpriteLoader } from '../utils/spriteLoader';

export default function SpriteUploader({ onSpritesLoaded }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [loaded, setLoaded] = useState(false);
  const sprInputRef = useRef(null);
  const datInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setStatus('Carregando arquivos...');

    try {
      let sprFile = null;
      let datFile = null;

      // Identificar arquivos
      for (const file of files) {
        const name = file.name.toLowerCase();
        if (name.endsWith('.spr') || name === 'tibia.spr') {
          sprFile = file;
        } else if (name.endsWith('.dat') || name === 'tibia.dat') {
          datFile = file;
        }
      }

      if (!sprFile) {
        setStatus('❌ Arquivo .spr não encontrado! Selecione o arquivo Tibia.spr');
        setLoading(false);
        return;
      }

      setStatus('Processando sprites...');

      // Criar URLs temporárias para os arquivos
      const sprUrl = URL.createObjectURL(sprFile);
      const datUrl = datFile ? URL.createObjectURL(datUrl) : sprUrl;

      const loader = getSpriteLoader();
      const success = await loader.loadFromFiles(sprUrl, datUrl);

      if (success) {
        setStatus('✅ Sprites carregados com sucesso!');
        setLoaded(true);
        onSpritesLoaded(true);
      } else {
        setStatus('❌ Erro ao processar sprites. Verifique se os arquivos são do client 15.25');
      }
    } catch (error) {
      setStatus(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFromPublic = async () => {
    setLoading(true);
    setStatus('Tentando carregar de /sprites/...');

    try {
      const loader = getSpriteLoader();
      const success = await loader.loadFromFiles('/sprites/Tibia.spr', '/sprites/Tibia.dat');

      if (success) {
        setStatus('✅ Sprites carregados de /sprites/!');
        setLoaded(true);
        onSpritesLoaded(true);
      } else {
        setStatus('❌ Arquivos não encontrados em /sprites/. Faça upload manual.');
      }
    } catch (error) {
      setStatus(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sprite-uploader">
      <div className="uploader-header">
        <h3>🎮 Sprites do Tibia 15.25</h3>
        <p>Carregue os arquivos do client para ver os sprites reais</p>
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
          <small>Coloque Tibia.spr e Tibia.dat na pasta public/sprites/</small>
        </div>

        <div className="upload-divider">OU</div>

        {/* Opção 2: Upload manual */}
        <div className="upload-option">
          <label className="btn btn-primary file-upload-label">
            📂 Selecionar Arquivos
            <input
              type="file"
              accept=".spr,.dat"
              multiple
              onChange={handleFileUpload}
              ref={sprInputRef}
              style={{ display: 'none' }}
            />
          </label>
          <small>Selecione Tibia.spr e Tibia.dat do seu client 15.25</small>
        </div>
      </div>

      {loading && (
        <div className="upload-loading">
          <div className="spinner small"></div>
          <span>{status}</span>
        </div>
      )}

      {!loading && status && (
        <div className={`upload-status ${loaded ? 'success' : 'error'}`}>
          {status}
        </div>
      )}

      <div className="upload-help">
        <h4>📋 Como obter os arquivos:</h4>
        <ol>
          <li>Abra a pasta do seu Tibia 15.25</li>
          <li>Localize <code>Tibia.spr</code> e <code>Tibia.dat</code></li>
          <li>Copie para a pasta <code>public/sprites/</code> ou faça upload acima</li>
        </ol>
        <p className="help-note">
          💡 Os arquivos geralmente ficam em: <br/>
          <code>C:\Users\SeuUsuario\AppData\Local\Tibia\packages\Tibia\</code>
        </p>
      </div>
    </div>
  );
}
