import 'dotenv/config';
import http from 'http';
import app from './app';
import { env } from './config/env';
import prisma from './repositories/prisma';

let httpServer: http.Server;

async function shutdown(signal: string) {
  console.log(`\n[${signal}] Encerrando servidor...`);

  httpServer.close(async () => {
    console.log('Conexões HTTP encerradas.');
    await prisma.$disconnect();
    console.log('Conexão com o banco encerrada. Bye!');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Timeout no shutdown — forçando encerramento.');
    process.exit(1);
  }, 10_000);
}

async function main() {
  await prisma.$connect();
  console.log('Banco de dados conectado.');

  httpServer = app.listen(env.PORT, () => {
    console.log(`\nServidor: http://localhost:${env.PORT}`);
    console.log(`Ambiente: ${env.NODE_ENV}`);
    console.log(`Health:   http://localhost:${env.PORT}/health`);
    console.log(`API:      http://localhost:${env.PORT}/api/v1\n`);
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason: unknown) => {
    console.error('[unhandledRejection]', reason);
  });

  process.on('uncaughtException', (err: Error) => {
    console.error('[uncaughtException]', err);
    shutdown('uncaughtException');
  });
}

main().catch(err => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
