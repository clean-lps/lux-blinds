#!/bin/bash
# Setup production database on Neon
# Run this after creating your Neon project

echo "=== LUX Blinds Production Setup ==="
echo ""
echo "1. Create Neon project at https://neon.tech"
echo "2. Copy your connection string"
echo "3. Set these environment variables in Vercel:"
echo ""
echo "   DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/lux"
echo "   BETTER_AUTH_URL=https://your-app.vercel.app"
echo "   APP_ORIGIN=https://your-app.vercel.app"
echo "   BETTER_AUTH_SECRET=$(openssl rand -hex 32)"
echo ""
echo "4. Run in Vercel terminal or locally:"
echo "   npx prisma migrate deploy"
echo "   npx prisma db seed"
echo ""
echo "5. Test login with seed data"
