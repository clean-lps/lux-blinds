#!/bin/bash
# Quick deploy script for Vercel
# Run this after pushing to GitHub

set -e

echo "=== LUX Blinds Deploy Helper ==="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

echo ""
echo "=== Step 1: Link project ==="
vercel link

echo ""
echo "=== Step 2: Set environment variables ==="
echo "Please set these in Vercel Dashboard:"
echo "  1. Go to https://vercel.com/dashboard"
echo "  2. Select your project"
echo "  3. Go to Settings > Environment Variables"
echo "  4. Add:"
echo "     - DATABASE_URL = postgresql://..."
echo "     - BETTER_AUTH_URL = https://..."
echo "     - APP_ORIGIN = https://..."
echo "     - BETTER_AUTH_SECRET = $(openssl rand -hex 32)"
echo ""

read -p "Press Enter after setting env vars..."

echo ""
echo "=== Step 3: Deploy ==="
vercel --prod

echo ""
echo "=== Step 4: Post-deploy setup ==="
echo "Run these commands:"
echo "  npx prisma migrate deploy"
echo "  npx prisma db seed"

echo ""
echo "=== Done! ==="
echo "Your app is live at: https://$(vercel ls 2>/dev/null | head -2 | tail -1 | awk '{print $2}')"
