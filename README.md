# PasargameX Frontend

Modern gaming marketplace frontend built with Next.js 14, TypeScript, and Tailwind CSS.

## 🎮 Features

- **Next.js 14** with App Router and Turbopack
- **TypeScript** for type safety
- **Tailwind CSS** with PasargameX brand colors
- **Responsive Design** mobile-first approach
- **PWA Support** for mobile app-like experience
- **Gaming Theme** matching PasargameX logo aesthetic

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
chmod +x install-deps.sh
./install-deps.sh
```

Or manually:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                # App Router pages
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   └── layout/        # Layout components
│   ├── lib/               # Utilities and config
│   │   ├── api.ts         # API client
│   │   └── utils.ts       # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── hooks/             # Custom React hooks
├── public/                # Static assets
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── next.config.js         # Next.js configuration
```

## 🎨 Design System

### Brand Colors
- **Primary Red**: `#DC2626` (brand-red)
- **Primary Blue**: `#1E3A8A` (brand-blue)
- **Gaming Font**: Orbitron

### Components
- Responsive navigation header
- Gaming-themed UI components
- Mobile-first design
- Dark theme optimized

## 📱 Pages

### Current Pages
- **Homepage** (`/`) - Landing page with hero section
- **Navigation** - Header with login/register
- **Footer** - Links and social media

### Planned Pages
- `/browse` - Product listing
- `/login` - User authentication  
- `/register` - User registration
- `/dashboard` - User dashboard
- `/sell` - Product creation
- `/product/[id]` - Product details
- `/messages` - Chat system

## 🔗 API Integration

The frontend connects to the Go backend API:
- Base URL: `http://localhost:8080`
- JWT authentication
- RESTful endpoints
- Real-time WebSocket support

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

## 📱 PWA Features

- App-like experience on mobile
- Offline capability
- Push notifications (planned)
- Fast loading with caching

## 🛠️ Development

### Available Scripts
- `npm run dev` - Development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Code Style
- TypeScript strict mode
- ESLint with Next.js config
- Tailwind CSS for styling
- Component-based architecture

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.