# Despliegue de producción — LUX Blinds

La aplicación se publica en Vercel y usa Neon para PostgreSQL y el almacenamiento privado. No se incluyen usuarios, pedidos ni contraseñas demo en producción.

## 1. Antes de publicar

1. Rota la contraseña de Neon si alguna vez fue compartida fuera de Neon.
2. Define una contraseña larga y única para el administrador inicial (mínimo 12 caracteres).
3. Verifica localmente:

   ```powershell
   npm test
   npm run typecheck
   npm run build
   ```

## 2. GitHub

```powershell
git status
git add .
git commit -m "Prepare production deployment"
git push origin main
```

No subas `.env`, `.env.local`, `.neon` ni contraseñas.

## 3. Neon

El proyecto Neon debe estar en la rama `production`. Para provisionar el bucket privado declarado en `neon.ts`:

```powershell
npm i -g neon@latest
neon login
neon link --project-id ancient-forest-02019608 --branch production -y
neon deploy
```

Después de `neon deploy`, conserva de forma privada los valores de conexión y, para almacenamiento, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3` y `AWS_REGION`.

## 4. Vercel

1. En Vercel, importa el repositorio de GitHub y deja que detecte Next.js.
2. No sobrescribas el comando de build: `vercel.json` aplica migraciones y crea el administrador inicial únicamente en producción.
3. En **Settings → Environment Variables**, añade estas variables para **Production**:

   ```env
   DATABASE_URL=<cadena pooled de Neon>
   DATABASE_URL_UNPOOLED=<cadena directa de Neon>
   BETTER_AUTH_URL=https://<tu-proyecto>.vercel.app
   APP_ORIGIN=https://<tu-proyecto>.vercel.app
   BETTER_AUTH_SECRET=<secreto aleatorio de 32+ caracteres>

   INITIAL_ADMIN_EMAIL=<correo del administrador>
   INITIAL_ADMIN_PASSWORD=<contraseña única de 12+ caracteres>
   INITIAL_ADMIN_NAME=Administrator

   EMAIL_PROVIDER=resend
   RESEND_API_KEY=<clave de Resend>
   RESEND_EMAIL_FROM=LUX Blinds <no-reply@tu-dominio.com>
   SMS_ENABLED=false
   SMS_PROVIDER=mock

   STORAGE_PROVIDER=neon
   STORAGE_BUCKET=lux-uploads
   AWS_ACCESS_KEY_ID=<valor de Neon>
   AWS_SECRET_ACCESS_KEY=<valor de Neon>
   AWS_ENDPOINT_URL_S3=<valor de Neon>
   AWS_REGION=us-east-2
   ```

   La integración Neon de Vercel puede cargar las cadenas de base de datos. Comprueba que también exista `DATABASE_URL_UNPOOLED`; si no aparece, añádela manualmente. Las cuatro variables `AWS_*` se copian desde `neon deploy`.

4. Pulsa **Deploy**.

El primer build de producción ejecuta, en este orden: `prisma migrate deploy`, `npm run db:seed` y `npm run build`. El seed crea una organización técnica, una cuenta con rol `admin`, su credencial Better Auth y su membresía. No crea usuarios cliente ni pedidos de ejemplo.

## 5. Comprobaciones tras el primer deploy

1. Abre `https://<tu-proyecto>.vercel.app/api/health`. Debe responder:

   ```json
   { "status": "ok", "database": "ready" }
   ```

2. Inicia sesión con `INITIAL_ADMIN_EMAIL` y `INITIAL_ADMIN_PASSWORD`.
3. Debes llegar a `https://<tu-proyecto>.vercel.app/admin-orders`.
4. El panel muestra el estado vacío hasta que entren pedidos reales; ese estado es esperado y no usa fixtures.
5. Cuando el primer deploy haya creado el administrador, elimina **las dos** variables `INITIAL_ADMIN_EMAIL` e `INITIAL_ADMIN_PASSWORD` de Vercel y redeploya. Los siguientes deploys detectarán la cuenta existente y no alterarán su contraseña.

## 6. Dominio propio

Al añadir un dominio, actualiza `BETTER_AUTH_URL` y `APP_ORIGIN` con `https://tu-dominio.com`, y vuelve a desplegar. Vercel gestiona HTTPS; no uses una URL HTTP en producción.

## Diagnóstico

- `503` en `/api/health`: revisa las variables de Neon y la migración; no pruebes login hasta que salud indique `database: ready`.
- Fallo en el primer deploy por bootstrap: faltan `INITIAL_ADMIN_EMAIL` o `INITIAL_ADMIN_PASSWORD`, o la contraseña tiene menos de 12 caracteres.
- `401` al iniciar sesión: confirma el correo y contraseña del administrador inicial; el usuario se identifica con su correo.
- `403` en rutas administrativas: no edites manualmente el rol; la cuenta bootstrap ya se crea con rol `admin` y membresía.
