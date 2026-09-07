import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';

const PORT = parseInt(env.PORT, 10) || 5000;

async function startServer() {
  try {
    // Verify database connectivity
    await prisma.$connect();
    console.log('Successfully connected to PostgreSQL database (prism_db)');

    const server = app.listen(PORT, () => {
      console.log(`PRISM Backend running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Database disconnected. Server terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
