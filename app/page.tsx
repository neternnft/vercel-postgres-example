"use client";

import Image from "next/image";
import Head from "next/head";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Game from "./game";
import WalletConnect from "./components/WalletConnect";
import { useAccount } from 'wagmi';

export default function Home() {
  const [showGame, setShowGame] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected } = useAccount();
  const [showNotice, setShowNotice] = useState(false);

  // Handle notice visibility based on wallet connection status
  useEffect(() => {
    try {
      const noticeState = localStorage.getItem('walletNoticeState');
      
      if (!noticeState) {
        // First time visit, show notice
        setShowNotice(true);
        localStorage.setItem('walletNoticeState', JSON.stringify({
          isConnected,
          wasClosed: false
        }));
        return;
      }

      const state = JSON.parse(noticeState);
      
      if (state.isConnected !== isConnected) {
        // Connection status changed, show notice and reset wasClosed
        setShowNotice(true);
        localStorage.setItem('walletNoticeState', JSON.stringify({
          isConnected,
          wasClosed: false
        }));
      } else {
        // Same connection status, maintain previous visibility
        setShowNotice(!state.wasClosed);
      }
    } catch (error) {
      console.error('Error handling notice state:', error);
      localStorage.removeItem('walletNoticeState');
      setShowNotice(true);
    }
  }, [isConnected]);

  const handleCloseNotice = () => {
    setShowNotice(false);
    localStorage.setItem('walletNoticeState', JSON.stringify({
      isConnected,
      wasClosed: true
    }));
  };

  // Handle mobile viewport height
  useEffect(() => {
    const setHeight = () => {
      document.documentElement.style.setProperty(
        '--app-height',
        `${window.innerHeight}px`
      );
    };
    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  // Handle initial loading
  useEffect(() => {
    // Short timeout to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleStartClick = () => {
    setShowGame(true);
  };

  return (
    <>
      <Head>
        <title>Glurbnok</title>
        <meta
          name="description"
          content="A fun and interactive website with links to various resources."
        />
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" 
        />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Glurbnok" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicon-100x100.png" sizes="100x100" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/png" href="/favicon-192x192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preload" href="/GLURB coin.png" as="image" />
      </Head>
      <style jsx global>{`
        :root {
          --app-height: 100vh;
        }
        html,
        body {
          padding: 0;
          margin: 0;
          background: black;
          min-height: 100vh;
          width: 100%;
          height: var(--app-height);
          overflow: hidden;
          position: fixed;
          -webkit-overflow-scrolling: touch;
        }
        
        @supports (-webkit-touch-callout: none) {
          body {
            height: -webkit-fill-available;
          }
        }
        
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
          }
        }

        .gradient-text {
          background: linear-gradient(
            90deg,
            #54CA9B,
            #4a90e2,
            #c471ed,
            #f64f59,
            #54CA9B
          );
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
          -webkit-background-clip: text;
          background-clip: text;
                    color: transparent;          font-weight: 900;          letter-spacing: 0.1em;
        }

        * {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .content-wrapper {
          opacity: 1 !important;
          transform: none !important;
        }

        /* Futuristic background styles */
        .futuristic-bg {
          background: #000000;
          position: relative;
          overflow: hidden;
        }

        .futuristic-bg::before,
        .futuristic-bg::after {
          display: none;
        }

        /* Floating particles */
        .particle {
          display: none;
        }

        .fade-in {
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
        }

        .fade-in.visible {
          opacity: 1;
        }

        @keyframes loadingBar {
          0% {
            width: 0%;
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            width: 100%;
            background-position: 0% 50%;
          }
        }

        .loading-bar {
          height: 8px;
          width: 0%;
          background: linear-gradient(
            90deg,
            #54CA9B,
            #4a90e2,
            #c471ed,
            #f64f59,
            #54CA9B
          );
          background-size: 200% 200%;
          animation: loadingBar 2s ease-out forwards;
          box-shadow: 0 0 15px rgba(84, 202, 155, 0.5);
        }

        @keyframes loadingText {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .loading-text {
          color: #54CA9B;
          animation: loadingText 1.5s ease-in-out infinite;
          font-family: monospace;
          font-size: 2rem;
          font-weight: bold;
          letter-spacing: 0.2em;
          text-shadow: 0 0 15px rgba(84, 202, 155, 0.5);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
      {isLoading ? (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
          <div className="w-[80vw] max-w-[600px] flex flex-col items-center">
            <div className="loading-bar rounded-full w-full"></div>
            <div className="mt-8 loading-text text-base sm:text-xl md:text-2xl">LOADING</div>
          </div>
        </div>
      ) : (
                                 <main           className="fixed inset-0 bg-black flex flex-col justify-between futuristic-bg"          style={{ height: 'var(--app-height)' }}        >          <div className="particle"></div>          <div className="particle"></div>          <div className="particle"></div>          <div className="particle"></div>          <div className="particle"></div>
          {/* Top Bar */}
          <div className="h-[10vh] flex justify-between items-center px-4 sm:px-6 md:px-8 pt-4">
            {/* Logo and Text */}
            <div className="flex items-center space-x-2">
              <Image
                src="/GLURB coin.png"
                alt="Logo"
                width={70}
                height={70}
                className="object-contain w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] md:w-[70px] md:h-[70px]"
                priority
              />
              <h1
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold"
                style={{ color: "#54CA9B" }}
              >
                Glurbnok
              </h1>
            </div>
            
            {/* Wallet Connect and Notice */}
            <div className="flex flex-col relative pt-2">
              <WalletConnect />
              
              {/* Enhanced Wallet Connection Notice */}
              {showNotice && (
                <div className="absolute top-[calc(100%+2.5rem)] right-0 w-[280px] sm:w-[320px] animate-fade-in mt-2 z-10">
                  <div className="relative flex items-start gap-2 bg-[#54CA9B]/10 px-3 py-2 rounded-lg border border-[#54CA9B]/20">
                    {/* Close Button */}
                    <button
                      onClick={handleCloseNotice}
                      className="absolute top-1 right-1 p-1 text-[#54CA9B] hover:text-[#54CA9B]/80 transition-colors"
                      aria-label="Close notice"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    
                    {/* Trophy Icon */}
                    <svg
                      className="w-5 h-5 text-[#54CA9B] mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                    <div>
                      <p className="text-[#54CA9B] text-sm sm:text-base font-medium pr-4">
                        {isConnected ? (
                          "Your scores will be recorded on the leaderboard! 🎮"
                        ) : (
                          <>
                            Connect wallet to:
                            <span className="block text-xs sm:text-sm opacity-90 mt-1">
                              • Compete on the leaderboard
                              <br />
                              • Save your high scores
                              <br />
                              • Earn achievements
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="flex flex-col items-center justify-center gap-8 sm:gap-12 w-full px-4">
              {/* Text */}
              <motion.a
                className="group w-full"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Meme is a game link"
              >
                <h2 className="text-[6vw] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center whitespace-nowrap tracking-wider gradient-text">
                  MEME IS A GAME
                </h2>
              </motion.a>

              {/* Start Button */}
              <div>
                <motion.button
                  style={{ backgroundColor: "#54CA9B" }}
                  className="text-black font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-lg shadow-md transition-colors duration-300 text-base sm:text-lg md:text-xl"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(84, 202, 155, 0.7)",
                      "0 0 0 20px rgba(84, 202, 155, 0)",
                    ],
                    transition: {
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 3,
                    },
                  }}
                  onClick={handleStartClick}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#42A97A")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#54CA9B")
                  }
                >
                  PLAY
                </motion.button>
              </div>
            </div>
          </div>

          {/* Bottom Links */}
          <div className="h-[15vh] py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8">
            <div className="w-full max-w-xs mx-auto flex justify-center items-center gap-6 sm:gap-8">
              {/* X Link */}
              <motion.div
                whileHover={{ scale: 1.1, translateY: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open("https://x.com/glurbnok", "_blank")}
                className="cursor-pointer flex flex-col items-center group"
              >
                <div 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 bg-black border-2 border-[#54CA9B] group-hover:bg-[#54CA9B]"
                >
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#54CA9B] group-hover:text-black transition-colors duration-300" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-[#54CA9B] text-xs sm:text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">X</span>
              </motion.div>

              {/* Arena Link */}
              <motion.div
                whileHover={{ scale: 1.1, translateY: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open("https://arena.social/glurbnok", "_blank")}
                className="cursor-pointer flex flex-col items-center group"
              >
                <div 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 bg-black border-2 border-[#54CA9B] group-hover:bg-[#54CA9B]"
                >
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#54CA9B] group-hover:text-black transition-colors duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                  </svg>
                </div>
                <span className="text-[#54CA9B] text-xs sm:text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">ARENA</span>
              </motion.div>

              {/* Buy Link */}
              <motion.div
                whileHover={{ scale: 1.1, translateY: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open("https://arena.social/community/0x2Eab7E5e4fA9EaEd6065592bFBa27BBeA456e257", "_blank")}
                className="cursor-pointer flex flex-col items-center group"
              >
                <div 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 bg-black border-2 border-[#54CA9B] group-hover:bg-[#54CA9B]"
                >
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#54CA9B] group-hover:text-black transition-colors duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span className="text-[#54CA9B] text-xs sm:text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">BUY</span>
              </motion.div>
            </div>
          </div>
        </main>
      )}
      {showGame && <Game onClose={() => setShowGame(false)} />}
    </>
  );
}