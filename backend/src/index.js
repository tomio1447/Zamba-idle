// Zamba Idle - Servidor Backend
// Jogo idle baseado em Tibia usando Canary como engine
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import { initCanaryDB } from './services/canaryDB.js';
import canaryService from './services/canaryService.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar Canary DB
initCanaryDB().catch(err => console.error('Erro na inicialização do Canary DB:', err.message));

// Middleware
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api', apiRoutes);

// Rota de saúde do Canary
app.get('/canary-status', (req, res) => {
  res.json({
    status: 'online',
    canaryDB: canaryService.getCanaryServiceStatus(),
    timestamp: Date.now(),
  });
});

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    game: 'Zamba Idle',
    version: '1.0.0',
    timestamp: Date.now() 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║   🎮 ZAMBA IDLE - Servidor Online             ║
  ║                                               ║
  ║   Jogo idle baseado em Tibia                  ║
  ║   Engine: Canary (OpenTibiaBR)                ║
  ║                                               ║
  ║   API: http://localhost:${PORT}/api            ║
  ║   Health: http://localhost:${PORT}/health      ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
});

export default app;
