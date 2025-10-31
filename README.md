# Crypto Chart Viewer

Modern dark-themed cryptocurrency search and charting web application with Binance integration.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with custom dark theme
- **Lightweight Charts** - TradingView charting library
- **Framer Motion** - Smooth animations
- **Binance API** - Real-time cryptocurrency data

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- 🔍 Clean search interface for cryptocurrency lookup
- 📊 Interactive candlestick charts with pan/zoom
- 📈 Custom technical indicators
- 🎨 Modern dark theme design
- ⚡ Smooth page transitions
- 📱 Fully responsive
- 🚀 Optimized for Vercel deployment

## Project Structure

```
crypto-chart-viewer/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Search interface (landing page)
│   ├── chart/[symbol]/    # Dynamic chart view
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles & theme
├── components/            # React components
├── lib/                   # Utilities & services
│   └── binance.ts        # Binance API service
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## Environment Variables

No environment variables required - uses public Binance API.

## Deployment

Optimized for Vercel deployment:

```bash
vercel deploy
```

## License

MIT
