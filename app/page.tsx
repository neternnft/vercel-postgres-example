"use client";

import Image from "next/image";
import Head from "next/head";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Game from "./game";
import WalletConnect from "./components/WalletConnect";

export default function Home() {
  const [showGame, setShowGame] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" href="/logo.png" as="image" />
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
          overflow-y: auto;
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
          color: transparent;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        * {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .content-wrapper {
          opacity: 1 !important;
          transform: none !important;
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
      `}</style>
      {isLoading ? (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
          <div className="w-[400px] sm:w-[500px] md:w-[600px] flex flex-col items-center">
            <div className="loading-bar rounded-full w-full"></div>
            <div className="mt-8 loading-text">LOADING</div>
          </div>
        </div>
      ) : (
        <main 
          className="bg-black min-h-[var(--app-height)] w-full flex flex-col justify-between"
          style={{ minHeight: 'var(--app-height)' }}
        >
          {/* Top Bar */}
          <div className="h-[80px] flex justify-between items-center px-4 sm:px-6 md:px-8">
            {/* Logo and Text */}
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Logo"
                width={70}
                height={70}
                className="object-contain w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] md:w-[50px] md:h-[50px]"
                priority
              />
              <h1
                className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold"
                style={{ color: "#54CA9B" }}
              >
                Glurbnok
              </h1>
            </div>
            
            {/* Wallet Connect */}
            <div>
              <WalletConnect />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center items-center py-4 sm:py-8">
            <div className="flex flex-col items-center justify-center gap-8 sm:gap-12 w-full px-4">
              {/* Text */}
              <motion.a
                className="group w-full"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Meme is a game link"
              >
                <h2 className="text-[8vw] sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center whitespace-nowrap tracking-wider gradient-text">
                  MEME IS A GAME
                </h2>
              </motion.a>

              {/* Start Button */}
              <div>
                <motion.button
                  style={{ backgroundColor: "#54CA9B" }}
                  className="text-black font-bold py-3 px-8 rounded-lg shadow-md transition-colors duration-300 text-lg sm:text-xl md:text-2xl"
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
          <div className="py-4 sm:py-6 px-4 sm:px-6 md:px-8 mt-auto relative z-10">
            <div className="w-full grid grid-cols-3 gap-3 max-w-3xl mx-auto">
              {/* X Link */}
              <button
                onClick={() => window.open("https://x.com/glurbnok", "_blank")}
                style={{ backgroundColor: "#54CA9B" }}
                className="text-black font-bold py-3 sm:py-2 px-3 rounded-lg shadow-md transition-colors duration-300 text-xs sm:text-sm md:text-base"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#42A97A")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#54CA9B")
                }
              >
                X
              </button>

              {/* Arena Link */}
              <button
                onClick={() =>
                  window.open("https://arena.social/glurbnok", "_blank")
                }
                style={{ backgroundColor: "#54CA9B" }}
                className="text-black font-bold py-3 sm:py-2 px-3 rounded-lg shadow-md transition-colors duration-300 text-xs sm:text-sm md:text-base"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#42A97A")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#54CA9B")
                }
              >
                ARENA
              </button>

              {/* Buy Link */}
              <button
                onClick={() =>
                  window.open(
                    "https://arena.social/glurbnok/status/5aec79f7-ecae-45a8-9978-d3bbb0920b6f",
                    "_blank"
                  )
                }
                style={{ backgroundColor: "#54CA9B" }}
                className="text-black font-bold py-3 sm:py-2 px-3 rounded-lg shadow-md transition-colors duration-300 text-xs sm:text-sm md:text-base"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#42A97A")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#54CA9B")
                }
              >
                BUY
              </button>
            </div>
          </div>
        </main>
      )}
      {showGame && <Game onClose={() => setShowGame(false)} />}
    </>
  );
}