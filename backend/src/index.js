// Zamba Idle - Servidor Backend
// Jogo idle baseado em Tibia usando Canary como engine
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api', apiRoutes);

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
