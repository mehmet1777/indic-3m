'use client';

import { useState, useEffect } from 'react';
import { SearchInterface } from './SearchInterface';
import { binanceAPI } from '@/lib/binance';

export const WelcomePage = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [btcPrice, setBtcPrice] = useState(67234.50);
  const [btcChange, setBtcChange] = useState(2.45);
  const [ethPrice, setEthPrice] = useState(2456.30);
  const [ethChange, setEthChange] = useState(1.23);
  const [bnbPrice, setBnbPrice] = useState(543.20);
  const [bnbChange, setBnbChange] = useState(-0.45);
  const [totalVolume, setTotalVolume] = useState(2.4);
  const [marketCap, setMarketCap] = useState(1.2);
  const [btcDominance, setBtcDominance] = useState(48);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Real-time price updates from Binance API
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const prices = await binanceAPI.getTickerPrices(['BTCUSDT', 'ETHUSDT', 'BNBUSDT']);
        
        const btc = prices.get('BTCUSDT');
        if (btc) {
          setBtcPrice(btc.price);
          setBtcChange(btc.change);
        }
        
        const eth = prices.get('ETHUSDT');
        if (eth) {
          setEthPrice(eth.price);
          setEthChange(eth.change);
        }
        
        const bnb = prices.get('BNBUSDT');
        if (bnb) {
          setBnbPrice(bnb.price);
          setBnbChange(bnb.change);
        }
      } catch (error) {
        console.error('Failed to fetch live prices:', error);
      }
    };

    const fetchMarketStats = async () => {
      try {
        const stats = await binanceAPI.getMarketStats();
        console.log('Received market stats:', stats);
        setTotalVolume(stats.totalVolume); // Already in billions
        setMarketCap(stats.totalMarketCap); // Already in trillions
        setBtcDominance(stats.btcDominance);
      } catch (error) {
        console.error('Failed to fetch market stats:', error);
      }
    };

    // Fetch immediately
    fetchPrices();
    fetchMarketStats();

    // Update prices every 10 seconds
    const priceInterval = setInterval(fetchPrices, 10000);
    
    // Update market stats every 30 seconds
    const statsInterval = setInterval(fetchMarketStats, 30000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(statsInterval);
    };
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (showSearch) {
    return <SearchInterface />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f]">

      {/* Animated Grid Background with Parallax */}
      <div 
        className="absolute inset-0 opacity-20 transition-transform duration-300"
        style={{
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
        }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}></div>
      </div>

      {/* Animated Gradient Orbs with Parallax */}
      <div 
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl animate-pulse"
        style={{
          transform: `translate(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      ></div>
      <div 
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/25 rounded-full blur-3xl animate-pulse"
        style={{
          transform: `translate(${-mousePosition.x * 0.6}px, ${-mousePosition.y * 0.6}px)`,
          transition: 'transform 0.3s ease-out',
          animationDelay: '1s'
        }}
      ></div>
      <div 
        className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-3xl animate-pulse"
        style={{
          transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * 0.4}px)`,
          transition: 'transform 0.3s ease-out',
          animationDelay: '2s'
        }}
      ></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle ${10 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>

      {/* Top Navigation with Glassmorphism */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-4 group cursor-pointer">
          {/* 3D Hexagon Logo */}
          <div className="relative w-14 h-14">
            {/* Outer glow */}
            <div className="absolute -inset-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full opacity-50 blur-xl animate-pulse"></div>
            
            {/* Main hexagon container */}
            <div className="relative w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Outer rotating hexagon */}
                <g className="animate-spin" style={{ transformOrigin: '50% 50%', animationDuration: '8s' }}>
                  <polygon 
                    points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" 
                    fill="none" 
                    stroke="url(#hex-gradient-1)" 
                    strokeWidth="2" 
                    opacity="0.6"
                  />
                </g>
                
                {/* Middle rotating hexagon */}
                <g className="animate-spin" style={{ transformOrigin: '50% 50%', animationDuration: '6s', animationDirection: 'reverse' }}>
                  <polygon 
                    points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5" 
                    fill="none" 
                    stroke="url(#hex-gradient-2)" 
                    strokeWidth="2" 
                    opacity="0.7"
                  />
                </g>
                
                {/* Inner pulsing hexagon */}
                <g className="animate-pulse">
                  <polygon 
                    points="50,25 70,37.5 70,62.5 50,75 30,62.5 30,37.5" 
                    fill="url(#hex-gradient-3)" 
                    opacity="0.8"
                  />
                </g>
                
                {/* Center symbol - Abstract I */}
                <g className="animate-pulse" style={{ animationDuration: '2s' }}>
                  <rect x="47" y="35" width="6" height="30" fill="white" rx="1" />
                  <circle cx="50" cy="32" r="3" fill="white" />
                </g>
                
                {/* Gradients */}
                <defs>
                  <linearGradient id="hex-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="hex-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="hex-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#ec4899" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Orbiting particles */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full -translate-x-1/2 shadow-lg shadow-purple-400/50"></div>
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full -translate-x-1/2 shadow-lg shadow-blue-400/50"></div>
            </div>
          </div>
          
          {/* Brand Name */}
          <div className="flex flex-col">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 tracking-tight leading-none group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-blue-300 transition-all">
              IndicPro
            </span>
            <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
              Trading Platform
            </span>
          </div>
          
          {/* Beta Badge */}
          <div className="relative ml-2">
            <div className="absolute inset-0 bg-purple-500/30 blur-sm rounded-full"></div>
            <div className="relative px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/40 rounded-full">
              <span className="text-purple-300 text-xs font-bold tracking-wide">BETA</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-8 pt-12 sm:pt-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full backdrop-blur-sm animate-fadeIn mx-auto lg:mx-0">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-purple-300 text-xs sm:text-sm font-medium">Professional Trading Platform</span>
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="space-y-6 relative">
              {/* Glow effect behind text */}
              <div className="absolute inset-0 blur-3xl opacity-30">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full animate-pulse"></div>
              </div>
              
              <h1 className="relative text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-tight animate-slideUp text-center lg:text-left">
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient">
                  IndicPro
                  {/* Glitch effect overlay */}
                  <span className="absolute top-0 left-0 text-purple-500/20 animate-ping" style={{ animationDuration: '3s' }}>
                    IndicPro
                  </span>
                </span>
              </h1>
              
              {/* Enhanced underline with animation */}
              <div className="relative h-1.5 sm:h-2 w-48 sm:w-64 mx-auto lg:mx-0 overflow-hidden rounded-full bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-blue-900/30">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full animate-shimmer"></div>
              </div>
              
              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-gray-400 font-light tracking-wider uppercase text-center lg:text-left">
                Advanced Crypto Analytics
              </p>
            </div>

            <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={() => setShowSearch(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Trading
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-white/20 blur-xl"></div>
                </div>
              </button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 sm:pt-8">
              <div className="group cursor-pointer">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-1 group-hover:scale-110 transition-transform">
                  500+
                </div>
                <div className="text-xs sm:text-sm text-gray-500 group-hover:text-gray-400 transition-colors">Trading Pairs</div>
                <div className="h-0.5 w-0 bg-purple-500 group-hover:w-full transition-all duration-300"></div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1 group-hover:scale-110 transition-transform">
                  ${totalVolume.toFixed(1)}B
                </div>
                <div className="text-xs sm:text-sm text-gray-500 group-hover:text-gray-400 transition-colors">24h Volume</div>
                <div className="h-0.5 w-0 bg-blue-500 group-hover:w-full transition-all duration-300"></div>
              </div>
              <div className="group cursor-pointer">
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
                  <svg className="w-4 h-4 sm:w-5 lg:w-6 text-green-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 group-hover:scale-110 transition-transform">
                    AI
                  </div>
                </div>
                <div className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">AI-Powered</div>
                <div className="h-0.5 w-0 bg-green-500 group-hover:w-full transition-all duration-300"></div>
              </div>
            </div>

            {/* Live Market Ticker */}
            <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-x-auto">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">LIVE</span>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  <span className="text-yellow-400 font-semibold">BTC</span>
                  <span className="text-white hidden sm:inline">${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="text-white sm:hidden">${(btcPrice / 1000).toFixed(1)}K</span>
                  <span className={btcChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {btcChange >= 0 ? '↗' : '↘'} {Math.abs(btcChange).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  <span className="text-blue-400 font-semibold">ETH</span>
                  <span className="text-white hidden sm:inline">${ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="text-white sm:hidden">${(ethPrice / 1000).toFixed(1)}K</span>
                  <span className={ethChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {ethChange >= 0 ? '↗' : '↘'} {Math.abs(ethChange).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  <span className="text-purple-400 font-semibold">BNB</span>
                  <span className="text-white">${bnbPrice.toFixed(0)}</span>
                  <span className={bnbChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {bnbChange >= 0 ? '↗' : '↘'} {Math.abs(bnbChange).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - 3D Bitcoin Visualization (Hidden on mobile) */}
          <div className="hidden lg:flex relative items-center justify-center lg:justify-end">
            <div className="relative w-[600px] h-[600px]">
              
              {/* Outer Ring with Segments */}
              <div className="absolute inset-0">
                <svg className="w-full h-full animate-spin" style={{ animationDuration: '30s' }}>
                  {/* Segmented outer ring */}
                  {Array.from({ length: 60 }).map((_, i) => {
                    const angle = (i * 6) * Math.PI / 180;
                    const x1 = 300 + 280 * Math.cos(angle);
                    const y1 = 300 + 280 * Math.sin(angle);
                    const x2 = 300 + 290 * Math.cos(angle);
                    const y2 = 300 + 290 * Math.sin(angle);
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={i % 5 === 0 ? '#8b5cf6' : '#6366f1'}
                        strokeWidth={i % 5 === 0 ? '3' : '2'}
                        opacity={i % 5 === 0 ? '0.8' : '0.4'}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Middle Ring */}
              <div className="absolute inset-12">
                <svg className="w-full h-full" style={{ animation: 'spin 20s linear infinite reverse' }}>
                  <circle
                    cx="276"
                    cy="276"
                    r="240"
                    fill="none"
                    stroke="url(#gradient-middle)"
                    strokeWidth="2"
                    strokeDasharray="15 10"
                    opacity="0.6"
                  />
                  <defs>
                    <linearGradient id="gradient-middle" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Inner Ring */}
              <div className="absolute inset-24">
                <svg className="w-full h-full animate-spin" style={{ animationDuration: '15s' }}>
                  <circle
                    cx="252"
                    cy="252"
                    r="200"
                    fill="none"
                    stroke="url(#gradient-inner)"
                    strokeWidth="1.5"
                    strokeDasharray="8 6"
                    opacity="0.5"
                  />
                  <defs>
                    <linearGradient id="gradient-inner" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Center Bitcoin */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                  
                  {/* Bitcoin coin */}
                  <div className="relative w-80 h-80 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-600 flex items-center justify-center shadow-2xl">
                    {/* Inner circle */}
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400"></div>
                    
                    {/* Bitcoin symbol */}
                    <div className="relative z-10 text-white text-9xl font-bold" style={{ fontFamily: 'Arial, sans-serif', textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                      ₿
                    </div>
                    
                    {/* Shine overlay */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 via-transparent to-transparent"></div>
                    
                    {/* Edge highlight */}
                    <div className="absolute inset-0 rounded-full border-4 border-yellow-200/30"></div>
                  </div>
                </div>
              </div>

              {/* Enhanced Floating Info Cards */}
              <div className="absolute top-16 -left-8 bg-gradient-to-br from-[#1a1a2e]/90 to-[#2d1b4e]/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-5 shadow-2xl shadow-purple-500/30 animate-float hover:scale-105 transition-transform cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-purple-400 text-xs font-mono">BTC/USDT</div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-white text-3xl font-bold mb-1">${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className={`text-sm font-medium flex items-center gap-1 ${btcChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d={btcChange >= 0 ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"} clipRule="evenodd" />
                  </svg>
                  {btcChange >= 0 ? '+' : ''}{btcChange.toFixed(2)}%
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              <div className="absolute bottom-24 -right-8 bg-gradient-to-br from-[#1a1a2e]/90 to-[#1b2d4e]/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-5 shadow-2xl shadow-blue-500/30 hover:scale-105 transition-transform cursor-pointer group" style={{ animation: 'float 4s ease-in-out infinite', animationDelay: '2s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <div className="text-blue-400 text-xs font-mono">24H VOLUME</div>
                </div>
                <div className="text-white text-3xl font-bold mb-1">${totalVolume.toFixed(2)}B</div>
                <div className="text-gray-400 text-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  High Liquidity
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              <div className="absolute top-1/2 -right-16 bg-gradient-to-br from-[#1a1a2e]/90 to-[#4e1b2d]/90 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-5 shadow-2xl shadow-pink-500/30 hover:scale-105 transition-transform cursor-pointer group" style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '1s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="text-pink-400 text-xs font-mono">MARKET CAP</div>
                </div>
                <div className="text-white text-3xl font-bold mb-1">${marketCap.toFixed(2)}T</div>
                <div className="text-gray-400 text-sm">BTC Dominance {btcDominance.toFixed(1)}%</div>
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Additional Floating Elements */}
              <div className="absolute top-32 right-12 w-16 h-16 border-2 border-purple-500/30 rounded-lg rotate-45 animate-spin" style={{ animationDuration: '8s' }}></div>
              <div className="absolute bottom-40 left-8 w-12 h-12 border-2 border-blue-500/30 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>

            </div>
          </div>

        </div>
      </div>

      {/* Bottom Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-8 h-1 bg-purple-500 rounded-full"></div>
        <div className="w-8 h-1 bg-white/20 rounded-full"></div>
        <div className="w-8 h-1 bg-white/20 rounded-full"></div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes particle {
          0% {
            transform: translateY(0) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(50px) scale(1);
            opacity: 0;
          }
        }
        
        @keyframes gridMove {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(50px);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};