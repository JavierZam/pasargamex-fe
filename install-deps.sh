#!/bin/bash

echo "Installing Next.js 14 and dependencies..."

# Core dependencies
npm install next@14 react@18 react-dom@18

# TypeScript
npm install -D typescript @types/node @types/react @types/react-dom

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npm install clsx tailwind-merge

# ESLint
npm install -D eslint eslint-config-next

# PWA Support
npm install next-pwa

echo "Dependencies installation completed!"
echo "You can now run: npm run dev"