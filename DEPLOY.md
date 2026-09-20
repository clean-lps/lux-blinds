# Deploy LUX Blinds - Demo Online

## Arquitectura de Producción

```
┌─────────────────────────────────────────────────────────┐
│                     VERCEL                               │
├─────────────────────────────────────────────────────────┤
│  lux-blinds.vercel.app          → Portal Cliente        │
│  lux-blinds.vercel.app/admin    → Admin Panel           │
│  lux-blinds.vercel.app/api/*    → Backend API           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  NEON POSTGRESQL                         │
│              (Free tier - 0.5 GB)                        │
└─────────────────────────────────────────────────────────┘
```

## Paso 1: Neon (Base de Datos)

1. Ir a **https://neon.tech** → Sign up con GitHub
2. Crear proyecto:
   - Nombre: `lux-blinds`
   - Region: **US East (Ohio)**
   - PostgreSQL: **16**
3. Copiar la **Connection string**:
   ```
   postgresql://neondb_owner:xxx@ep-xxx.us-east-2.aws.neon.tech/luxblinds?sslmode=require
   ```
4. Guardar en lugar seguro

## Paso 2: GitHub

1. Push del código a un repo en GitHub
2. Asegurar que `worker/backend`, `worker/client`, `worker/admin` están mergeados en `main`

## Paso 3: Vercel (Frontend + API)

1. Ir a **https://vercel.com** → Sign up con GitHub
2. Click **"Add New Project"**
3. Seleccionar el repo `lux-blinds`
4. Configurar:

   **Root Directory:** `.` (raíz del proyecto)

   **Build Command:** `npm run build`

   **Output Directory:** `.next`

5. **Environment Variables** (copiar exactamente):

   ```
   DATABASE_URL = postgresql://neondb_owner:xxx@ep-xxx.us-east-2.aws.neon.tech/luxblinds?sslmode=require
   BETTER_AUTH_URL = https://tu-proyecto.vercel.app
   APP_ORIGIN = https://tu-proyecto.vercel.app
   BETTER_AUTH_SECRET = (generar con: openssl rand -hex 32)
   EMAIL_PROVIDER = mock
   SMS_ENABLED = false
   STORAGE_PROVIDER = local-test
   ```

6. Click **"Deploy"**

## Paso 4: Post-Deploy

1. Ir a **Vercel Dashboard** → tu proyecto → **Terminal**
2. Ejecutar:

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

3. Verificar:
   ```bash
   curl https://tu-proyecto.vercel.app/api/health
   ```

## Paso 5: Probar

1. **Portal Cliente:** https://tu-proyecto.vercel.app
   - Login: `client@luxblinds.demo` / `demo12345678`

2. **Admin Panel:** https://tu-proyecto.vercel.app/admin
   - Login: `admin@luxblinds.demo` / `demo12345678`

## Variables de Entorno Completas

```env
# Database (Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/luxblinds?sslmode=require

# Auth
BETTER_AUTH_URL=https://tu-proyecto.vercel.app
APP_ORIGIN=https://tu-proyecto.vercel.app
BETTER_AUTH_SECRET=tu-secreto-aqui

# Providers (mock para demo)
EMAIL_PROVIDER=mock
SMS_ENABLED=false
SMS_PROVIDER=mock
STORAGE_PROVIDER=local-test
STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
```

## Troubleshooting

**Error: "Can't reach database"**
- Verificar que DATABASE_URL tiene `?sslmode=require`
- Verificar que Neon no está en pausa (free tier se pausa tras 5 min inactividad)

**Error: "Authentication failed"**
- Verificar BETTER_AUTH_SECRET está definido
- Verificar BETTER_AUTH_URL y APP_ORIGIN coinciden con la URL de Vercel

**Migraciones no aplicadas**
- Ejecutar `npx prisma migrate deploy` en Vercel Terminal

**Build falla**
- Verificar que Node.js 24 está seleccionado en Vercel
- Verificar que `prisma generate` está en el build command

## Costes

| Servicio | Plan | Coste |
|----------|------|-------|
| Vercel | Hobby | $0/mes |
| Neon | Free | $0/mes |
| GitHub | Free | $0/mes |
| **Total** | | **$0/mes** |

**Limitaciones Free Tier:**
- Vercel: 100 GB bandwidth/mes
- Neon: 0.5 GB storage, 24/7 compute
- Perfecto para demo/desarrollo
