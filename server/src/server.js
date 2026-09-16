import dotenv from 'dotenv';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { ensureSeededProducts } from './controllers/product.controller.js';
import { ensureAdminUser } from './services/auth.service.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const conn = await connectDB();
    if (conn) {
      await ensureSeededProducts();
      await ensureAdminUser();
    }

    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🧵 Gurjeet's Handcraft Server Active`);
      console.log(`🧶 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 Port: http://localhost:${PORT}`);
      console.log(`✨ Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
