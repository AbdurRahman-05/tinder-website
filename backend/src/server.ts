import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';

const PORT = parseInt(env.PORT, 10) || 5000;

async function startServer() {
  try {
    const dbTarget = env.DATABASE_URL ? env.DATABASE_URL.replace(/:\/\/.*@/, '://[credentials]@') : 'NOT_SET';
    console.log(`Attempting database connection to: ${dbTarget}`);

    // Verify database connectivity
    await prisma.$connect();
    console.log('Successfully connected to database');

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
