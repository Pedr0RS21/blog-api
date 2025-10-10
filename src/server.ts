import 'reflect-metadata';
import app from './index.js';
import { AppDataSource } from './data-source.js';
import { ENV } from './config/env.js';
import { seedPrivilegios } from './seeds/role.seed.js';

const PORT = ENV.PORT;

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('[DB] Conexión establecida');

    // Ejecutar seed
    await seedPrivilegios();

    const server = app.listen(PORT, () => {
      console.log(`[API] Ejecutándose en http://localhost:${PORT}`);
      if (ENV.NODE_ENV === 'development') {
        console.log('[ENV] development | synchronize ON (solo dev/test)');
      }
    });

    const shutdown = async (signal: string) => {
      try {
        console.log(`\n[SYS] Señal recibida: ${signal}. Cerrando...`);
        await AppDataSource.destroy();
        console.log('[DB] Conexión cerrada');
        server.close(() => {
          console.log('[API] Servidor detenido');
          process.exit(0);
        });
        setTimeout(() => process.exit(0), 5000).unref();
      } catch (e) {
        console.error('[SYS] Error al cerrar:', e);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('uncaughtException', (err) => {
      console.error('[uncaughtException]', err);
      shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason) => {
      console.error('[unhandledRejection]', reason);
      shutdown('unhandledRejection');
    });
  } catch (err) {
    console.error('[BOOT] Error inicializando la app:', err);
    process.exit(1);
  }
}

bootstrap();