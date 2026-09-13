# Base compartida verificada

Bootstrap solicitado P-02/P-03 (packet P00): aplicación base, contratos, fixtures, tokens y migración inicial preparados. No módulos funcionales implementados.

Verificado: npm run build, npm run typecheck, npm run test:contracts (6), npm run test:e2e (1 Chromium, página y health sin errores), prisma validate/generate. Migración SQL generada desde schema; NO aplicada: Docker no respondió. Backend debe iniciar PostgreSQL local y ejecutar npm run db:migrate antes de pruebas de persistencia.

Node 24.11.1, npm 11.6.2. Versiones exactas y transitivas: package.json y package-lock.json. Next 16.3.5, React 19.3.0, TypeScript 7.0.2, Prisma 6.19.3, Better Auth 1.7.4, Zod 4.3.6. Auth instalada, aún no integrada. Storage/email/SMS sin proveedores reales.

npm audit: 3 entradas high por una vulnerabilidad transitiva deepmerge-ts <8 en Prisma CLI (GHSA-ggr8-5vv4-36mx). No se aplicó downgrade automático; backend/coordinador debe resolver y verificar compatibilidad antes de lanzamiento. Sin afirmación de auditoría limpia.

Variables: .env.example, copiar a .env local; no publicar secretos. Contratos reales: src/contracts/index.ts. Fixtures: tests/fixtures/*.ts. Decisiones y propiedad: foundation-decisions.md. P01 listo para ejecución; UI lista para presentación con fixtures, integración sujeta a backend. Ningún worker arrancado.

Commit común: resolver git rev-parse foundation-ready. Las tres ramas worker/backend, worker/client y worker/admin se crean exactamente desde ese commit. Guía: START-WORKERS.md. Los originales privados siguen en disco y fuera de Git.
